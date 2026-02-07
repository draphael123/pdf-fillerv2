import React, { useState } from 'react';

export const HowToUse: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg hover:border-[#c4c0b8] dark:hover:border-[#3a3a48] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📋</span>
          <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
            How it works
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-[#6b7280] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 p-6 bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-sm font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-1">Select provider</h3>
              <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                Choose from 25 providers in the Compliance Dashboard. Their NPI, licenses, contact info are ready.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-sm font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-1">Upload PDF form</h3>
              <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                Drop any fillable PDF. We detect form fields automatically and match them to provider data.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-sm font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-1">Download filled PDF</h3>
              <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                Review mappings, adjust if needed, then download. We show exactly what was filled vs skipped.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e5e2dd] dark:border-[#2a2a38]">
            <h4 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3">Available data fields</h4>
            <div className="flex flex-wrap gap-2">
              {['NPI', 'DEA', 'Address', 'Phone', 'Email', '40+ State Licenses', 'Emergency Contact'].map((field) => (
                <span
                  key={field}
                  className="px-2 py-1 text-xs bg-[#f0eeeb] dark:bg-[#2a2a38] text-[#6b7280] dark:text-[#8b8b9b] rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#fef8e7] dark:bg-[#2a2518] border border-[#e5d9a8] dark:border-[#4a4028] rounded-lg">
            <p className="text-sm text-[#7a5a0a] dark:text-[#d4b24a]">
              <strong>Note:</strong> Organization/clinic fields are skipped automatically since they're not in the provider dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
