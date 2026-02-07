import { useState } from 'react';
import { ProviderSelector } from './components/ProviderSelector';
import { PDFUploader } from './components/PDFUploader';
import { FieldMapper } from './components/FieldMapper';
import { parseCSVFile } from './utils/csvParser';
import { extractPDFFields, generateFieldMappings, fillPDF, downloadPDF } from './utils/pdfUtils';
import { ProviderData, FieldMapping } from './types';

function App() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle CSV upload
  const handleCSVUpload = async (file: File) => {
    try {
      const data = await parseCSVFile(file);
      setProviders(data.providers);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
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
      const filename = `${selectedProvider.name.replace(/\s+/g, '_')}_${pdfFile.name}`;
      downloadPDF(filledPDF, filename);
    } catch (error) {
      console.error('Error filling PDF:', error);
      alert('Error filling PDF. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = selectedProvider && pdfFile;
  const canFill = canProceed && fieldMappings.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Provider PDF Form Filler
          </h1>
          <p className="text-gray-600">
            Automatically populate PDF forms with provider data from your compliance dashboard
          </p>
        </div>

        {/* CSV Upload (if no providers loaded) */}
        {providers.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Load Provider Data</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleCSVUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">Upload Provider Compliance CSV</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV files only</p>
              </label>
            </div>
          </div>
        )}

        {/* Main Workflow */}
        {providers.length > 0 && (
          <>
            {/* Step 1: Select Provider */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold">Select Provider</h2>
              </div>
              <ProviderSelector
                providers={providers}
                selectedProvider={selectedProvider}
                onSelect={handleProviderSelect}
              />
            </div>

            {/* Step 2: Upload PDF */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-3 ${
                  selectedProvider ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  2
                </div>
                <h2 className="text-xl font-semibold">Upload PDF Form</h2>
              </div>
              <PDFUploader onFileUpload={handlePDFUpload} currentFile={pdfFile} />
            </div>

            {/* Step 3: Review Mappings */}
            {canProceed && fieldMappings.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-3">
                    3
                  </div>
                  <h2 className="text-xl font-semibold">Review Field Mappings</h2>
                </div>
                <FieldMapper
                  mappings={fieldMappings}
                  provider={selectedProvider}
                  onMappingsChange={setCustomMappings}
                />
              </div>
            )}

            {/* Action Button */}
            {canProceed && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={handleFillPDF}
                  disabled={!canFill || isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                    canFill && !isProcessing
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
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
                    </span>
                  ) : (
                    'Fill PDF & Download'
                  )}
                </button>

                {!canFill && canProceed && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    No fillable fields detected in the PDF
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by pdf-lib • Built with React & TypeScript</p>
        </div>
      </div>
    </div>
  );
}

export default App;

