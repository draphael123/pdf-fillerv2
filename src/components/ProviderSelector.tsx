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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Provider
      </label>
      
      {/* Selected Provider Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between"
      >
        <span className={selectedProvider ? 'text-gray-900' : 'text-gray-500'}>
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
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedProvider?.name === provider.name ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  {provider.data.Address && (
                    <div className="text-sm text-gray-500 mt-1">
                      {provider.data.Address}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No providers found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Provider Details */}
      {selectedProvider && !isOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Provider Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {selectedProvider.data.Address && (
              <div>
                <span className="text-gray-500">Address:</span>
                <div className="text-gray-900 mt-1">{selectedProvider.data.Address}</div>
              </div>
            )}
            {selectedProvider.data['Phone Number'] && (
              <div>
                <span className="text-gray-500">Phone:</span>
                <div className="text-gray-900 mt-1">{selectedProvider.data['Phone Number']}</div>
              </div>
            )}
            {selectedProvider.data.Email && (
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="text-gray-900 mt-1">{selectedProvider.data.Email}</div>
              </div>
            )}
            {selectedProvider.data['NPI Number'] && (
              <div>
                <span className="text-gray-500">NPI:</span>
                <div className="text-gray-900 mt-1">{selectedProvider.data['NPI Number']}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

