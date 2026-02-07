import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    const term = searchTerm.toLowerCase();
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(term)
    );
  }, [providers, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (provider: ProviderData) => {
    onSelect(provider);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left bg-white dark:bg-[#1e1e28] border rounded-lg transition-colors ${
          isOpen 
            ? 'border-[#1a1a2e] dark:border-[#e8e6e3]' 
            : 'border-[#e5e2dd] dark:border-[#2a2a38] hover:border-[#c4c0b8] dark:hover:border-[#3a3a48]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedProvider ? 'text-[#1a1a2e] dark:text-[#e8e6e3]' : 'text-[#9a9590] dark:text-[#5a5a6a]'}>
            {selectedProvider ? selectedProvider.name : 'Choose a provider...'}
          </span>
          <svg className={`w-4 h-4 text-[#6b7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#f0eeeb] dark:bg-[#16161d] border-0 rounded-md text-[#1a1a2e] dark:text-[#e8e6e3] placeholder-[#9a9590] dark:placeholder-[#5a5a6a] focus:outline-none focus:ring-2 focus:ring-[#c45d3a]"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(provider)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#f0eeeb] dark:hover:bg-[#2a2a38] transition-colors ${
                    selectedProvider?.name === provider.name ? 'bg-[#f0eeeb] dark:bg-[#2a2a38]' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                    {provider.name}
                  </span>
                  {provider.data.Address && (
                    <span className="block text-xs text-[#6b7280] dark:text-[#8b8b9b] mt-0.5 truncate">
                      {provider.data.Address}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                No providers found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected provider details */}
      {selectedProvider && !isOpen && (
        <div className="mt-4 p-4 bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {selectedProvider.data['NPI #'] && (
              <div>
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">NPI</span>
                <p className="font-mono text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data['NPI #']}</p>
              </div>
            )}
            {selectedProvider.data['Phone Number'] && (
              <div>
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">Phone</span>
                <p className="text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data['Phone Number']}</p>
              </div>
            )}
            {selectedProvider.data.Address && (
              <div className="col-span-2">
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">Address</span>
                <p className="text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data.Address}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
