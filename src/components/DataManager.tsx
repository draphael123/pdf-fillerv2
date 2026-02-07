import React from 'react';
import { ProviderData } from '../types';

interface DataManagerProps {
  providers: ProviderData[];
  lastUpdated: string | null;
}

export const DataManager: React.FC<DataManagerProps> = ({
  providers,
  lastUpdated,
}) => {
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

  if (providers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg mr-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Provider Compliance Data</h2>
            <p className="text-sm text-gray-500">Loading provider data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {providers.length} Providers Loaded
          </span>
        </div>
      </div>

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
      </div>
    </div>
  );
};
