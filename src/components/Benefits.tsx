import React from 'react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      title: 'Save Hours Every Week',
      description: 'Stop manually typing the same provider information into dozens of forms. Fill any PDF in seconds, not minutes.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
    },
    {
      title: 'Eliminate Errors',
      description: 'No more typos in NPI numbers, addresses, or license information. Data flows directly from your compliance dashboard.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Smart Field Detection',
      description: 'Our intelligent mapping automatically matches PDF form fields to provider data—even when field names don\'t match exactly.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'amber',
    },
    {
      title: '100% Private & Secure',
      description: 'All data stays in your browser. Nothing is uploaded to external servers. Your provider information never leaves your device.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Works with Any PDF Form',
      description: 'Insurance credentialing, state licenses, DEA applications, hospital privileges—if it has form fields, we can fill it.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'rose',
    },
    {
      title: 'Fill Multiple Forms Fast',
      description: 'Credentialing for a new provider? Fill all required forms one after another without re-entering any information.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'cyan',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        icon: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
      },
      rose: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        icon: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
      },
      cyan: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        icon: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
      },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg mr-3">
          <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Why Use Provider Form Filler?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Streamline your credentialing workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => {
          const colors = getColorClasses(benefit.color);
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-transform hover:scale-[1.02]`}
            >
              <div className={`${colors.icon} mb-3`}>
                {benefit.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">90%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Time Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Data Typos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">∞</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Forms Fillable</div>
          </div>
        </div>
      </div>
    </div>
  );
};

