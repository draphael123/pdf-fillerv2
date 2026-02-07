import { useState, useEffect } from 'react';
import { DataManager } from './components/DataManager';
import { ProviderSelector } from './components/ProviderSelector';
import { PDFUploader } from './components/PDFUploader';
import { FieldMapper } from './components/FieldMapper';
import { DarkModeToggle } from './components/DarkModeToggle';
import { HowToUse } from './components/HowToUse';
import { Benefits } from './components/Benefits';
import { XFAGuidance } from './components/XFAGuidance';
import { parseCSVFile } from './utils/csvParser';
import { loadProviderData, saveProviderDataWithTimestamp } from './utils/storage';
import { analyzePDF, generateFieldMappings, fillPDF, downloadPDF } from './utils/pdfUtils';
import { ProviderData, FieldMapping } from './types';

function App() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isXFAForm, setIsXFAForm] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Handle dark mode toggle
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load provider data from localStorage on mount, or auto-load default CSV
  useEffect(() => {
    const loadData = async () => {
      const stored = loadProviderData();
      if (stored && stored.providers.length > 0) {
        setProviders(stored.providers);
        if ((stored as { lastUpdated?: string }).lastUpdated) {
          setLastUpdated((stored as { lastUpdated?: string }).lastUpdated!);
        }
      } else {
        // Auto-load the bundled Provider Compliance Dashboard CSV
        try {
          const response = await fetch('/provider-data.csv');
          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], 'provider-data.csv', { type: 'text/csv' });
            const data = await parseCSVFile(file);
            if (data.providers.length > 0) {
              setProviders(data.providers);
              saveProviderDataWithTimestamp(data.providers, data.allFields);
              setLastUpdated(new Date().toISOString());
            }
          }
        } catch (error) {
          console.log('No bundled provider data found, waiting for upload');
        }
      }
    };
    loadData();
  }, []);

  // Handle PDF upload and field extraction
  const handlePDFUpload = async (file: File | null) => {
    // Reset states
    setIsXFAForm(false);
    setPdfError(null);
    
    if (!file) {
      setPdfFile(null);
      setFieldMappings([]);
      setCustomMappings({});
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const result = await analyzePDF(file);
      
      // Check for XFA forms
      if (result.isXFA && !result.hasAcroFields) {
        setIsXFAForm(true);
        setFieldMappings([]);
        setIsProcessing(false);
        return;
      }
      
      // Check for no fields
      if (result.fields.length === 0) {
        setPdfError(result.errorMessage || 'NO_FIELDS_DETECTED');
        setFieldMappings([]);
        setIsProcessing(false);
        return;
      }
      
      console.log(`Extracted ${result.fields.length} fields from PDF`);
      
      if (selectedProvider) {
        const mappings = generateFieldMappings(result.fields, selectedProvider);
        setFieldMappings(mappings);
      } else if (result.fields.length > 0) {
        // Store fields even without provider selected
        setFieldMappings(result.fields.map(f => ({
          pdfField: f.name,
          providerField: '',
          confidence: 0,
          suggestedValue: ''
        })));
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPdfError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle provider selection
  const handleProviderSelect = async (provider: ProviderData) => {
    setSelectedProvider(provider);
    
    // If PDF is already uploaded and has fields, regenerate mappings
    if (pdfFile && !isXFAForm && fieldMappings.length > 0) {
      setIsProcessing(true);
      try {
        const result = await analyzePDF(pdfFile);
        if (result.fields.length > 0) {
          const mappings = generateFieldMappings(result.fields, provider);
          setFieldMappings(mappings);
        }
      } catch (error) {
        console.error('Error generating mappings:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Fill and download PDF
  const handleFillPDF = async () => {
    if (!pdfFile || !selectedProvider) return;

    setIsProcessing(true);

    try {
      const filledPDF = await fillPDF(pdfFile, selectedProvider, customMappings);
      const filename = `${selectedProvider.name.replace(/[^a-zA-Z0-9]/g, '_')}_${pdfFile.name}`;
      downloadPDF(filledPDF, filename);
    } catch (error) {
      console.error('Error filling PDF:', error);
      alert('Error filling PDF. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form for new PDF
  const handleNewForm = () => {
    setPdfFile(null);
    setFieldMappings([]);
    setCustomMappings({});
    setIsXFAForm(false);
    setPdfError(null);
  };

  const canProceed = selectedProvider && pdfFile && !isXFAForm;
  const canFill = canProceed && fieldMappings.length > 0;
  const hasData = providers.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative text-center mb-8">
          {/* Dark Mode Toggle - Top Right */}
          <div className="absolute right-0 top-0">
            <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
          </div>

          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Provider Form Filler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fill any PDF form with provider data from your Compliance Dashboard. 
            Upload your data once, then fill unlimited forms.
          </p>
        </div>

        {/* How to Use Section */}
        <HowToUse />

        {/* Benefits Section */}
        <Benefits />

        {/* Data Manager - Always visible as the source */}
        <DataManager
          providers={providers}
          lastUpdated={lastUpdated}
        />

        {/* Form Filling Section - Only visible when data is loaded */}
        {hasData && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fill a Form</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select a provider and upload a PDF to fill</p>
              </div>
            </div>

            {/* Two-column layout for selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-sm font-bold mr-2">
                    1
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Select Provider</span>
                </div>
                <ProviderSelector
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelect={handleProviderSelect}
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold mr-2 ${
                      selectedProvider ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      2
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Upload PDF Form</span>
                  </div>
                  {pdfFile && (
                    <button
                      onClick={handleNewForm}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Fill Another Form
                    </button>
                  )}
                </div>
                <PDFUploader onFileUpload={handlePDFUpload} currentFile={pdfFile} />
              </div>
            </div>

            {/* XFA Form Detected - Show detailed guidance */}
            {isXFAForm && pdfFile && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                <XFAGuidance 
                  filename={pdfFile.name} 
                  onDismiss={handleNewForm}
                />
              </div>
            )}

            {/* Field Mappings */}
            {canProceed && fieldMappings.length > 0 && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                <div className="flex items-center mb-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-sm font-bold mr-2">
                    3
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Review Field Mappings</span>
                </div>
                <FieldMapper
                  mappings={fieldMappings}
                  provider={selectedProvider}
                  onMappingsChange={setCustomMappings}
                />
              </div>
            )}

            {/* No fields warning (non-XFA) */}
            {canProceed && fieldMappings.length === 0 && !isProcessing && !isXFAForm && pdfError && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-amber-800 dark:text-amber-400">No Fillable Fields Detected</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                        This PDF doesn't have standard fillable form fields that we can detect. This commonly happens with:
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-500 mt-2 list-disc list-inside space-y-1">
                        <li><strong>Flattened PDFs</strong> - Forms that were filled and saved as non-editable</li>
                        <li><strong>Scanned documents</strong> - Image-based PDFs without actual form fields</li>
                        <li><strong>Static PDFs</strong> - Documents created without interactive form fields</li>
                      </ul>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-2">
                        <strong>Solution:</strong> Open this PDF in Adobe Acrobat Pro, go to Tools → "Prepare Form" to detect/create fields, then save and re-upload.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {canProceed && !isXFAForm && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                <button
                  onClick={handleFillPDF}
                  disabled={!canFill || isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all flex items-center justify-center ${
                    canFill && !isProcessing
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Fill PDF & Download
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Provider data is stored locally in your browser for privacy.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
