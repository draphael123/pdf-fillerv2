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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (providers.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1e1e28] rounded-xl border border-[#e5e2dd] dark:border-[#2a2a38] p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0eeeb] dark:bg-[#2a2a38] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#6b7280] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">Loading provider data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e1e28] rounded-xl border border-[#e5e2dd] dark:border-[#2a2a38] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e8f5f0] dark:bg-[#1a2f28] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2d7a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
              {providers.length} providers loaded
            </p>
            {lastUpdated && (
              <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b]">
                Last updated {formatDate(lastUpdated)}
              </p>
            )}
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-1 overflow-hidden">
          {providers.slice(0, 5).map((provider, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs bg-[#f0eeeb] dark:bg-[#2a2a38] text-[#6b7280] dark:text-[#8b8b9b] rounded truncate max-w-[100px]"
            >
              {provider.name.split(',')[0]}
            </span>
          ))}
          {providers.length > 5 && (
            <span className="px-2 py-1 text-xs text-[#6b7280] dark:text-[#8b8b9b]">
              +{providers.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
