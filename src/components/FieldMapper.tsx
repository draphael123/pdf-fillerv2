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
  const [showAllFields, setShowAllFields] = useState(false);

  useEffect(() => {
    // Initialize custom mappings with auto-detected mappings
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

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const displayedMappings = showAllFields
    ? mappings
    : mappings.filter(m => m.confidence >= 0.5);

  const providerFieldOptions = Object.keys(provider.data).sort();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Field Mappings ({displayedMappings.length})
        </h3>
        <label className="flex items-center text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showAllFields}
            onChange={(e) => setShowAllFields(e.target.checked)}
            className="mr-2 rounded"
          />
          Show all fields
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Review the auto-detected field mappings below. High-confidence mappings are more likely to be correct.
      </p>

      {displayedMappings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          No field mappings detected. The PDF may not have fillable form fields.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {displayedMappings.map((mapping, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {mapping.pdfField}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">PDF Field Name</div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getConfidenceColor(
                    mapping.confidence
                  )}`}
                >
                  {getConfidenceLabel(mapping.confidence)} ({Math.round(mapping.confidence * 100)}%)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Provider Field Selector */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Maps to Provider Field:
                  </label>
                  <select
                    value={customMappings[mapping.pdfField] || mapping.providerField}
                    onChange={(e) => handleMappingChange(mapping.pdfField, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Field --</option>
                    {providerFieldOptions.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value Preview */}
                {customMappings[mapping.pdfField] && (
                  <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Value to be filled:</div>
                    <div className="text-sm text-gray-900 font-mono">
                      {provider.data[customMappings[mapping.pdfField]] || '(empty)'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> You can customize any mapping by selecting a different provider field
            from the dropdown. The confidence score helps identify which mappings might need review.
          </div>
        </div>
      </div>
    </div>
  );
};

