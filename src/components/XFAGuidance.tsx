import React, { useState } from 'react';

interface XFAGuidanceProps {
  filename: string;
  onDismiss: () => void;
}

export const XFAGuidance: React.FC<XFAGuidanceProps> = ({ filename, onDismiss }) => {
  const [activeTab, setActiveTab] = useState<'acrobat' | 'print' | 'other'>('acrobat');

  return (
    <div className="bg-[#fef8e7] dark:bg-[#2a2518] border border-[#e5d9a8] dark:border-[#4a4028] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#b8860b] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#7a5a0a] dark:text-[#d4b24a]">
              XFA form detected
            </h3>
            <p className="text-sm text-[#8a6a1a] dark:text-[#b4924a] mt-1">
              <strong>{filename}</strong> uses Adobe's XFA format. It needs to be converted before we can fill it.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-[#8a6a1a] dark:text-[#b4924a] hover:text-[#7a5a0a] dark:hover:text-[#d4b24a]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'acrobat', label: 'Acrobat Pro' },
          { id: 'print', label: 'Print to PDF' },
          { id: 'other', label: 'Other options' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#7a5a0a] text-white'
                : 'bg-white/50 dark:bg-[#3a3018] text-[#7a5a0a] dark:text-[#b4924a] hover:bg-white/70 dark:hover:bg-[#4a4028]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-[#1e1e28] rounded-lg p-4 text-sm">
        {activeTab === 'acrobat' && (
          <div className="space-y-3">
            <p className="text-[#2d7a5f] dark:text-[#6dba9f] font-medium">✓ Best method — preserves all fields</p>
            <ol className="space-y-2 text-[#1a1a2e] dark:text-[#e8e6e3]">
              <li className="flex gap-2">
                <span className="text-[#6b7280]">1.</span>
                Open the PDF in Adobe Acrobat Pro
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">2.</span>
                Go to Tools → Prepare Form
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">3.</span>
                Click "Start" to detect fields
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">4.</span>
                Save as a new PDF
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">5.</span>
                Upload the new file here
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="space-y-3">
            <p className="text-[#b8860b] dark:text-[#d4b24a] font-medium">Free workaround — may lose some fields</p>
            <ol className="space-y-2 text-[#1a1a2e] dark:text-[#e8e6e3]">
              <li className="flex gap-2">
                <span className="text-[#6b7280]">1.</span>
                Open PDF in any viewer (Chrome, Adobe Reader)
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">2.</span>
                Press Ctrl+P (or Cmd+P on Mac)
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">3.</span>
                Select "Save as PDF" or "Microsoft Print to PDF"
              </li>
              <li className="flex gap-2">
                <span className="text-[#6b7280]">4.</span>
                Save and upload the new file
              </li>
            </ol>
            <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] mt-2">
              Note: This creates a flat PDF. You may need Acrobat Pro to re-add form fields.
            </p>
          </div>
        )}

        {activeTab === 'other' && (
          <div className="space-y-3 text-[#1a1a2e] dark:text-[#e8e6e3]">
            <div>
              <p className="font-medium">Request a different version</p>
              <p className="text-[#6b7280] dark:text-[#8b8b9b] text-xs mt-1">
                Contact the form provider and ask for a non-XFA version. Many organizations now provide standard fillable PDFs.
              </p>
            </div>
            <div>
              <p className="font-medium">Adobe online tools</p>
              <p className="text-[#6b7280] dark:text-[#8b8b9b] text-xs mt-1">
                Visit{' '}
                <a
                  href="https://www.adobe.com/acrobat/online/pdf-editor.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c45d3a] hover:underline"
                >
                  acrobat.adobe.com
                </a>
                {' '}for free conversion tools.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onDismiss}
          className="px-4 py-2 bg-[#7a5a0a] text-white rounded-lg text-sm font-medium hover:bg-[#6a4a0a] transition-colors"
        >
          Try different PDF
        </button>
        <a
          href="https://www.adobe.com/acrobat/free-trial-download.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-[#c4b078] dark:border-[#5a5028] text-[#7a5a0a] dark:text-[#b4924a] rounded-lg text-sm font-medium hover:bg-white/50 dark:hover:bg-[#3a3018] transition-colors"
        >
          Get Acrobat Pro trial
        </a>
      </div>
    </div>
  );
};
