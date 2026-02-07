import React, { useRef } from 'react';
import { ProviderData } from '../types';

interface DataManagerProps {
  providers: ProviderData[];
  lastUpdated: string | null;
  onUploadCSV: (file: File) => void;
  onClearData: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({
  providers,
  lastUpdated,
  onUploadCSV,
  onClearData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCSV(file);
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-100 rounded-lg mr-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Provider Compliance Data</h2>
            <p className="text-sm text-gray-500">Your source data for filling forms</p>
          </div>
        </div>
        
        {providers.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {providers.length} Providers Loaded
            </span>
          </div>
        )}
      </div>

      {providers.length > 0 ? (
        <div className="space-y-4">
          {/* Data Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Total Providers</span>
                <span className="text-xl font-semibold text-gray-900">{providers.length}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Data Fields</span>
                <span className="text-xl font-semibold text-gray-900">
                  {providers[0] ? Object.keys(providers[0].data).length : 0}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {lastUpdated ? formatDate(lastUpdated) : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Status</span>
                <span className="text-sm font-medium text-emerald-600">Ready to use</span>
              </div>
            </div>
          </div>

          {/* Provider List Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Provider Names</span>
            </div>
            <div className="max-h-32 overflow-y-auto p-2">
              <div className="flex flex-wrap gap-2">
                {providers.slice(0, 20).map((provider, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {provider.name}
                  </span>
                ))}
                {providers.length > 20 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                    +{providers.length - 20} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="update-csv"
            />
            <label
              htmlFor="update-csv"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Update Data
            </label>
            <button
              onClick={onClearData}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Data
            </button>
          </div>
        </div>
      ) : (
        /* Upload Prompt */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              Upload Provider Compliance Dashboard
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Upload your CSV file to get started. This data will be saved for future sessions.
            </p>
            <span className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Select CSV File
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

