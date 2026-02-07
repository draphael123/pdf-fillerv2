import React, { useState } from 'react';

export const HowToUse: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Provider Data is Pre-loaded',
      description: 'The app comes with your Provider Compliance Dashboard already loaded. You\'ll see all 25 providers ready to use.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'Select a Provider',
      description: 'Use the dropdown to search and select the provider whose information you want to use. Their details will be displayed for verification.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'Upload a PDF Form',
      description: 'Drag and drop or click to upload any PDF form with fillable fields. The app will automatically detect all form fields.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      number: 4,
      title: 'Review Field Mappings',
      description: 'The app automatically matches PDF fields to provider data. Review the mappings and confidence scores. Adjust any incorrect matches using the dropdowns.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      number: 5,
      title: 'Download Filled PDF',
      description: 'Click "Fill PDF & Download" to generate your completed form. The file will be named with the provider\'s name for easy organization.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  const troubleshooting = [
    {
      problem: 'No fillable fields detected',
      solution: 'The PDF may use XFA forms (common in government docs) or be a scanned image. Open in Adobe Acrobat → Tools → Prepare Form to convert it.',
    },
    {
      problem: 'Wrong field mappings',
      solution: 'Use the dropdown menus to manually select the correct provider field for each PDF field. Low confidence scores indicate mappings that need review.',
    },
    {
      problem: 'Data not showing correctly',
      solution: 'Check that the provider has data for that field. Some providers may not have all fields filled in the compliance dashboard.',
    },
  ];

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-center justify-between hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How to Use</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click to {isOpen ? 'hide' : 'view'} instructions</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-8">
          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h3>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      <span className="text-indigo-600 dark:text-indigo-400">Step {step.number}:</span> {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Data Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Available Provider Data</h3>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {['Address', 'Phone Number', 'Email', 'NPI Number', 'DEA License', 'State Licenses (40+ states)', 'Emergency Contact', 'Contract Start Date'].map((field) => (
                  <div key={field} className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {field}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Troubleshooting</h3>
            <div className="space-y-3">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="font-medium text-amber-800 dark:text-amber-400 text-sm">{item.problem}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-400 text-sm">Pro Tip</p>
                <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                  After filling a form, click "Fill Another Form" to quickly fill more forms for the same or different providers without starting over.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

