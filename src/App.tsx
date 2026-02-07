import { useState, useEffect } from 'react';
import { DataManager } from './components/DataManager';
import { ProviderSelector } from './components/ProviderSelector';
import { PDFUploader } from './components/PDFUploader';
import { FieldMapper } from './components/FieldMapper';
import { DarkModeToggle } from './components/DarkModeToggle';
import { HowToUse } from './components/HowToUse';
import { XFAGuidance } from './components/XFAGuidance';
import { FillReport, FillReportData } from './components/FillReport';
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
  const [fillReport, setFillReport] = useState<FillReportData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadData = async () => {
      const stored = loadProviderData();
      if (stored && stored.providers.length > 0) {
        setProviders(stored.providers);
        if ((stored as { lastUpdated?: string }).lastUpdated) {
          setLastUpdated((stored as { lastUpdated?: string }).lastUpdated!);
        }
      } else {
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
          console.log('No bundled provider data found');
        }
      }
    };
    loadData();
  }, []);

  const handlePDFUpload = async (file: File | null) => {
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
      
      if (result.isXFA && !result.hasAcroFields) {
        setIsXFAForm(true);
        setFieldMappings([]);
        setIsProcessing(false);
        return;
      }
      
      if (result.fields.length === 0) {
        setPdfError(result.errorMessage || 'NO_FIELDS_DETECTED');
        setFieldMappings([]);
        setIsProcessing(false);
        return;
      }
      
      if (selectedProvider) {
        const mappings = generateFieldMappings(result.fields, selectedProvider);
        setFieldMappings(mappings);
      } else if (result.fields.length > 0) {
        setFieldMappings(result.fields.map(f => ({
          pdfField: f.name,
          providerField: '',
          confidence: 0,
          suggestedValue: ''
        })));
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProviderSelect = async (provider: ProviderData) => {
    setSelectedProvider(provider);
    
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

  const handleFillPDF = async () => {
    if (!pdfFile || !selectedProvider) return;

    setIsProcessing(true);

    try {
      const result = await fillPDF(pdfFile, selectedProvider, customMappings);
      const filename = `${selectedProvider.name.replace(/[^a-zA-Z0-9]/g, '_')}_${pdfFile.name}`;
      downloadPDF(result.pdfBytes, filename);
      
      setFillReport({
        filename,
        providerName: selectedProvider.name,
        filledFields: result.filledFields.map(f => ({ fieldName: f.fieldName, value: f.value })),
        skippedFields: result.skippedFields,
        totalFields: result.totalFields,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error filling PDF:', error);
      alert('Error filling PDF. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewForm = () => {
    setPdfFile(null);
    setFieldMappings([]);
    setCustomMappings({});
    setIsXFAForm(false);
    setPdfError(null);
    setFillReport(null);
  };

  const handleCloseFillReport = () => {
    setFillReport(null);
  };

  const handleFillAnotherFromReport = () => {
    setFillReport(null);
    handleNewForm();
  };

  const canProceed = selectedProvider && pdfFile && !isXFAForm;
  const canFill = canProceed && fieldMappings.length > 0;
  const hasData = providers.length > 0;

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#16161d] transition-colors">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/fountain-logo.svg" 
                  alt="Fountain" 
                  className="w-10 h-10 dark:brightness-0 dark:invert"
                />
                <span className="text-xs font-medium tracking-widest uppercase text-[#6b7280] dark:text-[#8b8b9b]">
                  Fountain Health
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a2e] dark:text-[#e8e6e3] tracking-tight">
                Provider Form Filler
              </h1>
              <p className="mt-2 text-[#6b7280] dark:text-[#8b8b9b] max-w-md">
                Auto-fill PDF forms with provider data from the Compliance Dashboard. 
                Select a provider, upload a form, download.
              </p>
            </div>
            <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
          </div>
        </header>

        {/* Main content */}
        <main className="space-y-8">
          {/* How to Use - Collapsible */}
          <HowToUse />

          {/* Provider Data Status */}
          <DataManager providers={providers} lastUpdated={lastUpdated} />

          {/* Form Filling */}
          {hasData && (
            <section className="bg-white dark:bg-[#1e1e28] rounded-xl border border-[#e5e2dd] dark:border-[#2a2a38] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-[#1a1a2e] dark:text-[#e8e6e3]">
                    Fill a Form
                  </h2>
                  <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b] mt-1">
                    Two steps: pick provider, upload PDF
                  </p>
                </div>
                {pdfFile && (
                  <button
                    onClick={handleNewForm}
                    className="text-sm text-[#c45d3a] hover:text-[#a84d2f] font-medium"
                  >
                    Start over
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Step 1: Provider */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                      Select provider
                    </span>
                  </div>
                  <ProviderSelector
                    providers={providers}
                    selectedProvider={selectedProvider}
                    onSelect={handleProviderSelect}
                  />
                </div>

                {/* Step 2: PDF */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      selectedProvider 
                        ? 'bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e]' 
                        : 'bg-[#e5e2dd] dark:bg-[#2a2a38] text-[#6b7280]'
                    }`}>
                      2
                    </span>
                    <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                      Upload PDF form
                    </span>
                  </div>
                  <PDFUploader onFileUpload={handlePDFUpload} currentFile={pdfFile} />
                </div>
              </div>

              {/* XFA Warning */}
              {isXFAForm && pdfFile && (
                <div className="mt-8 pt-8 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
                  <XFAGuidance filename={pdfFile.name} onDismiss={handleNewForm} />
                </div>
              )}

              {/* Field Mappings */}
              {canProceed && fieldMappings.length > 0 && (
                <div className="mt-8 pt-8 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-6 h-6 rounded-full bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                      Review mappings
                    </span>
                    <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] ml-2">
                      {fieldMappings.filter(m => m.confidence >= 0.5).length} auto-matched
                    </span>
                  </div>
                  <FieldMapper
                    mappings={fieldMappings}
                    provider={selectedProvider}
                    onMappingsChange={setCustomMappings}
                  />
                </div>
              )}

              {/* No fields warning */}
              {canProceed && fieldMappings.length === 0 && !isProcessing && !isXFAForm && pdfError && (
                <div className="mt-8 pt-8 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
                  <div className="bg-[#fef8e7] dark:bg-[#2a2518] border border-[#e5d9a8] dark:border-[#4a4028] rounded-lg p-5">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#b8860b] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#7a5a0a] dark:text-[#d4b24a]">No fillable fields found</p>
                        <p className="text-sm text-[#8a6a1a] dark:text-[#b4924a] mt-1">
                          This PDF may be flattened, scanned, or use a format we can't read. 
                          Try opening it in Adobe Acrobat and using "Prepare Form" to add fields.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fill Button */}
              {canProceed && !isXFAForm && (
                <div className="mt-8 pt-8 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
                  <button
                    onClick={handleFillPDF}
                    disabled={!canFill || isProcessing}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                      canFill && !isProcessing
                        ? 'bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] hover:bg-[#2d2d44] dark:hover:bg-[#d8d6d3]'
                        : 'bg-[#e5e2dd] dark:bg-[#2a2a38] text-[#9a9590] dark:text-[#5a5a6a] cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Fill & Download PDF
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
          <p className="text-sm text-[#9a9590] dark:text-[#5a5a6a] text-center">
            All data stays in your browser. Nothing is sent to any server.
          </p>
        </footer>
      </div>

      {/* Fill Report Modal */}
      {fillReport && (
        <FillReport
          report={fillReport}
          onClose={handleCloseFillReport}
          onFillAnother={handleFillAnotherFromReport}
        />
      )}
    </div>
  );
}

export default App;
