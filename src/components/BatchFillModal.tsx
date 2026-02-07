import React, { useState } from 'react';
import JSZip from 'jszip';
import { ProviderData } from '../types';
import { fillPDF } from '../utils/pdfUtils';

interface BatchFillModalProps {
  providers: ProviderData[];
  pdfFile: File;
  onClose: () => void;
}

export const BatchFillModal: React.FC<BatchFillModalProps> = ({
  providers,
  pdfFile,
  onClose,
}) => {
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProvider = (name: string) => {
    const newSet = new Set(selectedProviders);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedProviders(newSet);
  };

  const selectAll = () => {
    setSelectedProviders(new Set(filteredProviders.map(p => p.name)));
  };

  const selectNone = () => {
    setSelectedProviders(new Set());
  };

  const handleBatchFill = async () => {
    if (selectedProviders.size === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedProviders.size });

    const zip = new JSZip();
    const selectedList = providers.filter(p => selectedProviders.has(p.name));

    for (let i = 0; i < selectedList.length; i++) {
      const provider = selectedList[i];
      setProgress({ current: i + 1, total: selectedList.length });

      try {
        const result = await fillPDF(pdfFile, provider, {});
        const filename = `${provider.name.replace(/[^a-zA-Z0-9]/g, '_')}_${pdfFile.name}`;
        zip.file(filename, result.pdfBytes);
      } catch (error) {
        console.error(`Error filling PDF for ${provider.name}:`, error);
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_${pdfFile.name.replace('.pdf', '')}_${selectedProviders.size}_providers.zip`;
    link.click();
    URL.revokeObjectURL(url);

    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/60 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e28] rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-[#e8e6e3]">
                Batch Fill
              </h2>
              <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                Fill "{pdfFile.name}" for multiple providers
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6b7280] hover:text-[#1a1a2e] dark:hover:text-[#e8e6e3]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Select All */}
        <div className="px-6 py-3 border-b border-[#e5e2dd] dark:border-[#2a2a38] space-y-3">
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#f0eeeb] dark:bg-[#16161d] border-0 rounded-md text-[#1a1a2e] dark:text-[#e8e6e3] placeholder-[#9a9590] focus:outline-none focus:ring-2 focus:ring-[#c45d3a]"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
              {selectedProviders.size} of {providers.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[#c45d3a] hover:underline"
              >
                Select all
              </button>
              <span className="text-[#e5e2dd] dark:text-[#2a2a38]">|</span>
              <button
                onClick={selectNone}
                className="text-xs text-[#c45d3a] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Provider List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {filteredProviders.map((provider) => (
              <label
                key={provider.name}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedProviders.has(provider.name)
                    ? 'bg-[#e8f5f0] dark:bg-[#1a2f28]'
                    : 'hover:bg-[#f0eeeb] dark:hover:bg-[#16161d]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProviders.has(provider.name)}
                  onChange={() => toggleProvider(provider.name)}
                  className="rounded border-[#e5e2dd] dark:border-[#2a2a38] text-[#c45d3a] focus:ring-[#c45d3a]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] truncate">
                    {provider.name}
                  </p>
                  {provider.data['NPI #'] && (
                    <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b]">
                      NPI: {provider.data['NPI #']}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
          {isProcessing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280] dark:text-[#8b8b9b]">
                  Processing {progress.current} of {progress.total}...
                </span>
                <span className="text-[#1a1a2e] dark:text-[#e8e6e3]">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#e5e2dd] dark:bg-[#2a2a38] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c45d3a] transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleBatchFill}
              disabled={selectedProviders.size === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedProviders.size > 0
                  ? 'bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] hover:bg-[#2d2d44] dark:hover:bg-[#d8d6d3]'
                  : 'bg-[#e5e2dd] dark:bg-[#2a2a38] text-[#9a9590] cursor-not-allowed'
              }`}
            >
              Fill {selectedProviders.size} PDFs & Download ZIP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

