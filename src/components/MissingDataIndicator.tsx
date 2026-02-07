import React from 'react';
import { ProviderData, FieldMapping } from '../types';

interface MissingDataIndicatorProps {
  provider: ProviderData;
  pdfFields: { name: string; type: string }[];
  fieldMappings: FieldMapping[];
}

export const MissingDataIndicator: React.FC<MissingDataIndicatorProps> = ({
  provider,
  pdfFields,
  fieldMappings,
}) => {
  // Find which PDF fields have mappings with missing provider data
  const analysis = fieldMappings.map(mapping => {
    const providerValue = mapping.providerField ? provider.data[mapping.providerField] : null;
    
    return {
      pdfField: mapping.pdfField,
      providerField: mapping.providerField,
      hasData: !!providerValue,
      confidence: mapping.confidence,
    };
  });

  const fieldsWithData = analysis.filter(a => a.hasData);
  const fieldsMissingData = analysis.filter(a => !a.hasData && a.providerField);
  const unmappedFields = analysis.filter(a => !a.providerField);
  
  const coverage = pdfFields.length > 0 
    ? Math.round((fieldsWithData.length / pdfFields.length) * 100) 
    : 0;

  return (
    <div className="bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg p-4 space-y-4">
      {/* Coverage Summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
          Data Coverage Preview
        </span>
        <span className={`text-sm font-mono ${
          coverage >= 70 ? 'text-[#2d7a5f]' : 
          coverage >= 40 ? 'text-[#c45d3a]' : 
          'text-red-500'
        }`}>
          {coverage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#e5e2dd] dark:bg-[#2a2a38] rounded-full overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-[#2d7a5f] transition-all"
            style={{ width: `${(fieldsWithData.length / Math.max(pdfFields.length, 1)) * 100}%` }}
          />
          <div 
            className="bg-[#c45d3a] transition-all"
            style={{ width: `${(fieldsMissingData.length / Math.max(pdfFields.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#2d7a5f] rounded-full" />
          <span className="text-[#6b7280] dark:text-[#8b8b9b]">
            Will fill ({fieldsWithData.length})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#c45d3a] rounded-full" />
          <span className="text-[#6b7280] dark:text-[#8b8b9b]">
            Missing data ({fieldsMissingData.length})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#e5e2dd] dark:bg-[#2a2a38] rounded-full" />
          <span className="text-[#6b7280] dark:text-[#8b8b9b]">
            No mapping ({unmappedFields.length})
          </span>
        </div>
      </div>

      {/* Missing Data Details */}
      {fieldsMissingData.length > 0 && (
        <div className="pt-2 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
          <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] mb-2">
            Provider is missing data for:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fieldsMissingData.slice(0, 5).map((field, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-[#fff5f5] dark:bg-[#2a1f1f] text-[#c45d3a] rounded"
              >
                {field.providerField}
              </span>
            ))}
            {fieldsMissingData.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-[#6b7280]">
                +{fieldsMissingData.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

