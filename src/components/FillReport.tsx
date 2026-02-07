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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">PDF Filled Successfully!</h2>
                <p className="text-emerald-100 text-sm">Your download should start automatically</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {report.filledFields.length}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-500">Fields Filled</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {report.skippedFields.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">Fields Skipped</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {fillPercentage}%
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-500">Coverage</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span><strong>Provider:</strong> {report.providerName}</span>
              <span className="text-xs">{report.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="mt-1">
              <strong>File:</strong> {report.filename}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filled Fields */}
          {report.filledFields.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Filled Fields ({report.filledFields.length})
              </h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-100 dark:bg-emerald-900/30 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-emerald-800 dark:text-emerald-400 font-medium">Field Name</th>
                        <th className="text-left px-3 py-2 text-emerald-800 dark:text-emerald-400 font-medium">Value Filled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-200 dark:divide-emerald-800">
                      {report.filledFields.map((field, index) => (
                        <tr key={index} className="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20">
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs">
                            {field.fieldName}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Skipped Fields */}
          {report.skippedFields.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Skipped Fields ({report.skippedFields.length})
              </h3>
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Field Name</th>
                        <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {report.skippedFields.map((field, index) => (
                        <tr key={index} className="hover:bg-gray-100/50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs">
                            {field.fieldName}
                          </td>
                          <td className="px-3 py-2 text-gray-500 dark:text-gray-500 text-xs">
                            {field.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                💡 Skipped fields had no matching data in the Provider Compliance Dashboard
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex gap-3">
          <button
            onClick={onFillAnother}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Fill Another Form
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

