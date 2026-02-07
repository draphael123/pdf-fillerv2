import React, { useMemo } from 'react';
import { ProviderData } from '../types';

// US State abbreviations
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface StateFilterProps {
  providers: ProviderData[];
  selectedState: string | null;
  onStateChange: (state: string | null) => void;
}

export const StateFilter: React.FC<StateFilterProps> = ({
  providers,
  selectedState,
  onStateChange,
}) => {
  // Calculate which states have licensed providers
  const stateStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    providers.forEach(provider => {
      US_STATES.forEach(state => {
        // Check if provider has any license for this state
        const hasLicense = Object.keys(provider.data).some(key => {
          const isStateKey = key === state || key.startsWith(state + ' ');
          return isStateKey && provider.data[key];
        });
        
        if (hasLicense) {
          stats[state] = (stats[state] || 0) + 1;
        }
      });
    });
    
    return stats;
  }, [providers]);

  const activeStates = Object.keys(stateStats).sort();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
          Filter by State License
        </label>
        {selectedState && (
          <button
            onClick={() => onStateChange(null)}
            className="text-xs text-[#c45d3a] hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {activeStates.map(state => (
          <button
            key={state}
            onClick={() => onStateChange(selectedState === state ? null : state)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedState === state
                ? 'bg-[#c45d3a] text-white'
                : 'bg-[#f0eeeb] dark:bg-[#16161d] text-[#1a1a2e] dark:text-[#e8e6e3] hover:bg-[#e5e2dd] dark:hover:bg-[#2a2a38]'
            }`}
            title={`${stateStats[state]} provider${stateStats[state] > 1 ? 's' : ''}`}
          >
            {state}
            <span className={`ml-1 ${selectedState === state ? 'text-white/70' : 'text-[#9a9590]'}`}>
              {stateStats[state]}
            </span>
          </button>
        ))}
      </div>
      
      {activeStates.length === 0 && (
        <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b] italic">
          No state license data available
        </p>
      )}
    </div>
  );
};

// Helper function to filter providers by state
export const filterProvidersByState = (
  providers: ProviderData[],
  state: string | null
): ProviderData[] => {
  if (!state) return providers;
  
  return providers.filter(provider => {
    return Object.keys(provider.data).some(key => {
      const isStateKey = key === state || key.startsWith(state + ' ');
      return isStateKey && provider.data[key];
    });
  });
};

