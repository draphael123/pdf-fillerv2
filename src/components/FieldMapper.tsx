import React, { useState, useEffect } from 'react';
import { FieldMapping, ProviderData } from '../types';

interface FieldMapperProps {
  mappings: FieldMapping[];
  provider: ProviderData;
  onMappingsChange: (customMappings: Record<string, string>) => void;
}

export const FieldMapper: React.FC<FieldMapperProps> = ({
  mappings,
  provider,
  onMappingsChange,
}) => {
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [showLowConfidence, setShowLowConfidence] = useState(false);

  useEffect(() => {
    const initial: Record<string, string> = {};
    mappings.forEach(mapping => {
      initial[mapping.pdfField] = mapping.providerField;
    });
    setCustomMappings(initial);
  }, [mappings]);

  const handleMappingChange = (pdfField: string, providerField: string) => {
    const updated = { ...customMappings, [pdfField]: providerField };
    setCustomMappings(updated);
    onMappingsChange(updated);
  };

  const highConfidence = mappings.filter(m => m.confidence >= 0.5);
  const lowConfidence = mappings.filter(m => m.confidence < 0.5);
  
  const displayedMappings = showLowConfidence ? mappings : highConfidence;
  const providerFieldOptions = Object.keys(provider.data).filter(k => provider.data[k]).sort();

  if (displayedMappings.length === 0) {
    return (
      <div className="text-center py-8 text-[#6b7280] dark:text-[#8b8b9b]">
        No field mappings detected
      </div>
    );
  }

  return (
    <div>
      {/* Toggle for low confidence fields */}
      {lowConfidence.length > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <span className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
            {highConfidence.length} matched · {lowConfidence.length} unmatched
          </span>
          <label className="flex items-center gap-2 text-sm text-[#6b7280] dark:text-[#8b8b9b] cursor-pointer">
            <input
              type="checkbox"
              checked={showLowConfidence}
              onChange={(e) => setShowLowConfidence(e.target.checked)}
              className="rounded border-[#e5e2dd] dark:border-[#2a2a38]"
            />
            Show unmatched
          </label>
        </div>
      )}

      {/* Mappings list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {displayedMappings.map((mapping, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              mapping.confidence >= 0.5 
                ? 'bg-[#f0eeeb] dark:bg-[#1a1a24]' 
                : 'bg-[#fef8f6] dark:bg-[#1e1a18]'
            }`}
          >
            {/* PDF Field */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-[#1a1a2e] dark:text-[#e8e6e3] truncate">
                {mapping.pdfField}
              </p>
            </div>

            {/* Arrow */}
            <svg className="w-4 h-4 text-[#9a9590] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* Provider Field Dropdown */}
            <div className="flex-1">
              <select
                value={customMappings[mapping.pdfField] || ''}
                onChange={(e) => handleMappingChange(mapping.pdfField, e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-md text-[#1a1a2e] dark:text-[#e8e6e3] focus:outline-none focus:ring-1 focus:ring-[#c45d3a]"
              >
                <option value="">Skip this field</option>
                {providerFieldOptions.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            {/* Confidence indicator */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              mapping.confidence >= 0.8 ? 'bg-[#2d7a5f]' :
              mapping.confidence >= 0.5 ? 'bg-[#b8860b]' :
              'bg-[#9a9590]'
            }`} title={`${Math.round(mapping.confidence * 100)}% confidence`} />
          </div>
        ))}
      </div>

      {/* Preview of selected value */}
      {Object.values(customMappings).some(v => v) && (
        <div className="mt-4 p-3 bg-[#e8f5f0] dark:bg-[#1a2f28] border border-[#c8e5d8] dark:border-[#2a4038] rounded-lg">
          <p className="text-xs text-[#2d7a5f] dark:text-[#6dba9f]">
            ✓ {Object.values(customMappings).filter(v => v).length} fields will be filled
          </p>
        </div>
      )}
    </div>
  );
};
