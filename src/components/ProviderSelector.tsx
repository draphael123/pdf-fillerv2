import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ProviderData } from '../types';

interface ProviderSelectorProps {
  providers: ProviderData[];
  selectedProvider: ProviderData | null;
  onSelect: (provider: ProviderData) => void;
  onQuickView?: (provider: ProviderData) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProvider,
  onSelect,
  onQuickView,
  searchInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  
  // Use external ref if provided, otherwise use internal
  const inputRef = searchInputRef || internalInputRef;

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

  // Focus search input when opened via keyboard shortcut
  useEffect(() => {
    if (searchInputRef?.current && document.activeElement === searchInputRef.current) {
      setIsOpen(true);
    }
  }, [searchInputRef]);

  const handleSelect = (provider: ProviderData) => {
    onSelect(provider);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleQuickView = (e: React.MouseEvent, provider: ProviderData) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(provider);
    }
  };

  const copyToClipboard = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
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
          <div className="flex items-center gap-2">
            <kbd className="text-xs text-[#9a9590] bg-[#f0eeeb] dark:bg-[#2a2a38] px-1.5 py-0.5 rounded">
              /
            </kbd>
            <svg className={`w-4 h-4 text-[#6b7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full px-3 py-2 text-sm bg-[#f0eeeb] dark:bg-[#16161d] border-0 rounded-md text-[#1a1a2e] dark:text-[#e8e6e3] placeholder-[#9a9590] dark:placeholder-[#5a5a6a] focus:outline-none focus:ring-2 focus:ring-[#c45d3a]"
              autoFocus
            />
          </div>

          {/* Results count */}
          <div className="px-4 py-2 text-xs text-[#6b7280] dark:text-[#8b8b9b] border-b border-[#e5e2dd] dark:border-[#2a2a38]">
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-[#f0eeeb] dark:hover:bg-[#2a2a38] transition-colors ${
                    selectedProvider?.name === provider.name ? 'bg-[#f0eeeb] dark:bg-[#2a2a38]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(provider)}
                    className="flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                      {provider.name}
                    </span>
                    {provider.data['NPI #'] && (
                      <span className="block text-xs text-[#6b7280] dark:text-[#8b8b9b] mt-0.5 font-mono">
                        NPI: {provider.data['NPI #']}
                      </span>
                    )}
                  </button>
                  {onQuickView && (
                    <button
                      type="button"
                      onClick={(e) => handleQuickView(e, provider)}
                      className="p-1.5 text-[#6b7280] hover:text-[#c45d3a] hover:bg-[#e5e2dd] dark:hover:bg-[#3a3a48] rounded transition-colors"
                      title="View all data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                </div>
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
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
              {selectedProvider.name}
            </span>
            {onQuickView && (
              <button
                onClick={() => onQuickView(selectedProvider)}
                className="text-xs text-[#c45d3a] hover:underline"
              >
                View all →
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {selectedProvider.data['NPI #'] && (
              <div className="group">
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">NPI</span>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data['NPI #']}</p>
                  <button
                    onClick={(e) => copyToClipboard(e, selectedProvider.data['NPI #']!)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#c45d3a] transition-all"
                    title="Copy"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {selectedProvider.data['Phone Number'] && (
              <div className="group">
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">Phone</span>
                <div className="flex items-center gap-2">
                  <p className="text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data['Phone Number']}</p>
                  <button
                    onClick={(e) => copyToClipboard(e, selectedProvider.data['Phone Number']!)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#c45d3a] transition-all"
                    title="Copy"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {selectedProvider.data.Address && (
              <div className="col-span-2 group">
                <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">Address</span>
                <div className="flex items-center gap-2">
                  <p className="text-[#1a1a2e] dark:text-[#e8e6e3]">{selectedProvider.data.Address}</p>
                  <button
                    onClick={(e) => copyToClipboard(e, selectedProvider.data.Address!)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#c45d3a] transition-all flex-shrink-0"
                    title="Copy"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
