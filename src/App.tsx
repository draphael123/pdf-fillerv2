import { useState, useEffect } from 'react';
import { DataManager } from './components/DataManager';
import { ProviderSelector } from './components/ProviderSelector';
import { PDFUploader } from './components/PDFUploader';
import { FieldMapper } from './components/FieldMapper';
import { parseCSVFile } from './utils/csvParser';
import { loadProviderData, saveProviderDataWithTimestamp, clearProviderData } from './utils/storage';
import { extractPDFFields, generateFieldMappings, fillPDF, downloadPDF } from './utils/pdfUtils';
import { ProviderData, FieldMapping } from './types';

function App() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load provider data from localStorage on mount
  useEffect(() => {
    const stored = loadProviderData();
    if (stored) {
      setProviders(stored.providers);
      if ((stored as { lastUpdated?: string }).lastUpdated) {
        setLastUpdated((stored as { lastUpdated?: string }).lastUpdated!);
      }
    }
  }, []);

  // Handle CSV upload
  const handleCSVUpload = async (file: File) => {
    try {
      const data = await parseCSVFile(file);
      setProviders(data.providers);
      saveProviderDataWithTimestamp(data.providers, data.allFields);
      setLastUpdated(new Date().toISOString());
      // Reset selections when new data is loaded
      setSelectedProvider(null);
      setPdfFile(null);
      setFieldMappings([]);
      setCustomMappings({});
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  };

  // Handle clear data
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all provider data? This cannot be undone.')) {
      clearProviderData();
      setProviders([]);
      setLastUpdated(null);
      setSelectedProvider(null);
      setPdfFile(null);
      setFieldMappings([]);
      setCustomMappings({});
    }
  };

  // Handle PDF upload and field extraction
  const handlePDFUpload = async (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setFieldMappings([]);
      setCustomMappings({});
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const fields = await extractPDFFields(file);
      
      if (selectedProvider) {
        const mappings = generateFieldMappings(fields, selectedProvider);
        setFieldMappings(mappings);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file. Please ensure it has fillable form fields.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle provider selection
  const handleProviderSelect = async (provider: ProviderData) => {
    setSelectedProvider(provider);
    
    // If PDF is already uploaded, regenerate mappings
    if (pdfFile) {
      setIsProcessing(true);
      try {
        const fields = await extractPDFFields(pdfFile);
        const mappings = generateFieldMappings(fields, provider);
        setFieldMappings(mappings);
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
  };

  const canProceed = selectedProvider && pdfFile;
  const canFill = canProceed && fieldMappings.length > 0;
  const hasData = providers.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Provider Form Filler
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill any PDF form with provider data from your Compliance Dashboard. 
            Upload your data once, then fill unlimited forms.
          </p>
        </div>

        {/* Data Manager - Always visible as the source */}
        <DataManager
          providers={providers}
          lastUpdated={lastUpdated}
          onUploadCSV={handleCSVUpload}
          onClearData={handleClearData}
        />

        {/* Form Filling Section - Only visible when data is loaded */}
        {hasData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Fill a Form</h2>
                <p className="text-sm text-gray-500">Select a provider and upload a PDF to fill</p>
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
                  <span className="font-medium text-gray-700">Select Provider</span>
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
                      selectedProvider ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                      2
                    </span>
                    <span className="font-medium text-gray-700">Upload PDF Form</span>
                  </div>
                  {pdfFile && (
                    <button
                      onClick={handleNewForm}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Fill Another Form
                    </button>
                  )}
                </div>
                <PDFUploader onFileUpload={handlePDFUpload} currentFile={pdfFile} />
              </div>
            </div>

            {/* Field Mappings */}
            {canProceed && fieldMappings.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center mb-4">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-sm font-bold mr-2">
                    3
                  </span>
                  <span className="font-medium text-gray-700">Review Field Mappings</span>
                </div>
                <FieldMapper
                  mappings={fieldMappings}
                  provider={selectedProvider}
                  onMappingsChange={setCustomMappings}
                />
              </div>
            )}

            {/* No fields warning */}
            {canProceed && fieldMappings.length === 0 && !isProcessing && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-amber-800">No Fillable Fields Detected</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      This PDF doesn't appear to have fillable form fields. Please use Adobe Acrobat or a similar tool to add form fields to your PDF first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {canProceed && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <button
                  onClick={handleFillPDF}
                  disabled={!canFill || isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all flex items-center justify-center ${
                    canFill && !isProcessing
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
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

        {/* Instructions when no data */}
        {!hasData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Upload Your Data</h4>
                <p className="text-sm text-gray-500">
                  Upload your Provider Compliance Dashboard CSV file. This becomes your source data.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Select & Upload</h4>
                <p className="text-sm text-gray-500">
                  Choose a provider and upload any PDF form you need to fill.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Review & Download</h4>
                <p className="text-sm text-gray-500">
                  Review the auto-mapped fields, adjust if needed, then download your filled PDF.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Provider data is stored locally in your browser for privacy.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
