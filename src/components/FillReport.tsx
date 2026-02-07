import React from 'react';

export interface FillReportData {
  filename: string;
  providerName: string;
  filledFields: { fieldName: string; value: string }[];
  skippedFields: { fieldName: string; reason: string }[];
  totalFields: number;
  timestamp: Date;
}

interface FillReportProps {
  report: FillReportData;
  onClose: () => void;
  onFillAnother: () => void;
}

export const FillReport: React.FC<FillReportProps> = ({ report, onClose, onFillAnother }) => {
  const fillPercentage = Math.round((report.filledFields.length / report.totalFields) * 100);

  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/60 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e28] rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f5f0] dark:bg-[#1a2f28] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2d7a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-[#e8e6e3]">
                  PDF filled
                </h2>
                <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                  Download started automatically
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6b7280] hover:text-[#1a1a2e] dark:hover:text-[#e8e6e3] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-[#f0eeeb] dark:bg-[#16161d] border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-[#6b7280] dark:text-[#8b8b9b]">Provider: </span>
              <span className="font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">{report.providerName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#2d7a5f] font-medium">{report.filledFields.length} filled</span>
              <span className="text-[#6b7280] dark:text-[#8b8b9b]">{report.skippedFields.length} skipped</span>
              <span className="text-[#6b7280] dark:text-[#8b8b9b]">{fillPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filled Fields */}
          {report.filledFields.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2d7a5f]"></span>
                Filled fields
              </h3>
              <div className="space-y-1">
                {report.filledFields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-[#f0eeeb] dark:bg-[#16161d] rounded text-sm"
                  >
                    <span className="font-mono text-xs text-[#6b7280] dark:text-[#8b8b9b] truncate max-w-[200px]">
                      {field.fieldName}
                    </span>
                    <span className="text-[#1a1a2e] dark:text-[#e8e6e3] truncate max-w-[200px]">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped Fields */}
          {report.skippedFields.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9a9590]"></span>
                Skipped fields
              </h3>
              <div className="space-y-1">
                {report.skippedFields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-[#faf9f7] dark:bg-[#1a1a24] rounded text-sm"
                  >
                    <span className="font-mono text-xs text-[#9a9590] dark:text-[#5a5a6a] truncate max-w-[200px]">
                      {field.fieldName}
                    </span>
                    <span className="text-xs text-[#9a9590] dark:text-[#5a5a6a] truncate max-w-[200px]">
                      {field.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#e5e2dd] dark:border-[#2a2a38] flex gap-3">
          <button
            onClick={onFillAnother}
            className="flex-1 py-3 px-4 bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] rounded-lg font-medium hover:bg-[#2d2d44] dark:hover:bg-[#d8d6d3] transition-colors"
          >
            Fill another form
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-[#e5e2dd] dark:border-[#2a2a38] text-[#6b7280] dark:text-[#8b8b9b] rounded-lg font-medium hover:border-[#c4c0b8] dark:hover:border-[#3a3a48] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
