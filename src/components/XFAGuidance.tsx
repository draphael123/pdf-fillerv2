import React, { useState } from 'react';

interface XFAGuidanceProps {
  filename: string;
  onDismiss: () => void;
}

export const XFAGuidance: React.FC<XFAGuidanceProps> = ({ filename, onDismiss }) => {
  const [activeTab, setActiveTab] = useState<'acrobat' | 'acrobat-reader' | 'online'>('acrobat');

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg mr-3 flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
              XFA Form Detected
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              <strong>"{filename}"</strong> uses Adobe's XFA format, which requires conversion before we can fill it.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* What is XFA */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What is XFA?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          XFA (XML Forms Architecture) is a proprietary Adobe format often used in government forms, insurance documents, and official applications. 
          It stores form data differently than standard PDF forms (AcroForms), making it incompatible with most PDF tools.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
            🏛️ Government Forms
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
            🏥 Healthcare Applications
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
            📋 Insurance Claims
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
            💼 License Applications
          </span>
        </div>
      </div>

      {/* Conversion Tabs */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">How to Convert (Choose Your Tool)</h4>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('acrobat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'acrobat'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Adobe Acrobat Pro
          </button>
          <button
            onClick={() => setActiveTab('acrobat-reader')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'acrobat-reader'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Free: Print to PDF
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'online'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Alternative Methods
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          {activeTab === 'acrobat' && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400 rounded text-xs font-medium mr-2">
                  ✓ Best Method
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Preserves all form fields</span>
              </div>
              
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Open the PDF in Adobe Acrobat Pro</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">File → Open → Select your PDF</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Go to Tools → Prepare Form</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This opens the form editing mode</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Click "Start" when prompted</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acrobat will auto-detect and recreate form fields</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Save As a new PDF</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">File → Save As → Choose a new filename</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Upload the new PDF here!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The converted file will now have standard fillable fields</p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'acrobat-reader' && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400 rounded text-xs font-medium mr-2">
                  💰 Free
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Creates a fillable copy (manual field creation may be needed)</span>
              </div>
              
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Open the PDF in any PDF reader</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adobe Reader, Chrome, Edge, or Preview (Mac)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Print the document</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Press Ctrl+P (Windows) or Cmd+P (Mac)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Select "Microsoft Print to PDF" or "Save as PDF"</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This is in the printer dropdown menu</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Save the new PDF</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This creates a "flattened" version without XFA</p>
                  </div>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <strong>Note:</strong> This method removes the form fields. You'll need to use Adobe Acrobat Pro's "Prepare Form" feature to recreate them, 
                  or manually fill the PDF using annotation tools.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'online' && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-400 rounded text-xs font-medium mr-2">
                  🌐 Online Tools
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Third-party conversion services</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">Adobe Acrobat Online (Free Trial)</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Adobe offers free online tools at acrobat.adobe.com that can convert and prepare forms.
                  </p>
                  <a
                    href="https://www.adobe.com/acrobat/online/pdf-editor.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                  >
                    Visit Adobe Acrobat Online
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">Request AcroForm Version</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Contact the form provider (insurance company, government agency, etc.) and request a non-XFA version of the form. 
                    Many organizations now provide AcroForm alternatives.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">LibreOffice Draw (Free)</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    LibreOffice can open some XFA PDFs and export them as standard PDFs. Results may vary depending on the form complexity.
                  </p>
                  <a
                    href="https://www.libreoffice.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                  >
                    Download LibreOffice (Free)
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">
                  <strong>⚠️ Privacy Warning:</strong> Be cautious when uploading sensitive provider data to third-party online tools. 
                  Adobe's official tools are generally safe, but always review privacy policies.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onDismiss}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
        >
          Try a Different PDF
        </button>
        <a
          href="https://www.adobe.com/acrobat/free-trial-download.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          Get Adobe Acrobat Pro (Free Trial)
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

