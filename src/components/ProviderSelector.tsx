import React, { useState, useMemo } from 'react';
import { ProviderData } from '../types';

interface ProviderSelectorProps {
  providers: ProviderData[];
  selectedProvider: ProviderData | null;
  onSelect: (provider: ProviderData) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProvider,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    
    const term = searchTerm.toLowerCase();
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(term)
    );
  }, [providers, searchTerm]);

  const handleSelect = (provider: ProviderData) => {
    onSelect(provider);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Provider
      </label>
      
      {/* Selected Provider Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-between"
      >
        <span className={selectedProvider ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedProvider ? selectedProvider.name : 'Choose a provider...'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Provider List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(provider)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${
                    selectedProvider?.name === provider.name ? 'bg-blue-100 dark:bg-slate-600' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{provider.name}</div>
                  {provider.data.Address && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {provider.data.Address}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                No providers found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Provider Details */}
      {selectedProvider && !isOpen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provider Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {selectedProvider.data.Address && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                <div className="text-gray-900 dark:text-white mt-1">{selectedProvider.data.Address}</div>
              </div>
            )}
            {selectedProvider.data['Phone Number'] && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <div className="text-gray-900 dark:text-white mt-1">{selectedProvider.data['Phone Number']}</div>
              </div>
            )}
            {(selectedProvider.data['Fountain Email Address'] || selectedProvider.data.Email) && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <div className="text-gray-900 dark:text-white mt-1">{selectedProvider.data['Fountain Email Address'] || selectedProvider.data.Email}</div>
              </div>
            )}
            {selectedProvider.data['NPI #'] && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">NPI:</span>
                <div className="text-gray-900 dark:text-white mt-1">{selectedProvider.data['NPI #']}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
