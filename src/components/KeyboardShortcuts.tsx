import React, { useEffect } from 'react';

interface Shortcut {
  key: string;
  description: string;
  action: string;
}

const shortcuts: Shortcut[] = [
  { key: '/', description: 'Focus provider search', action: 'search' },
  { key: 'f', description: 'Fill PDF', action: 'fill' },
  { key: 'b', description: 'Batch fill', action: 'batch' },
  { key: 'd', description: 'Toggle dark mode', action: 'darkmode' },
  { key: '?', description: 'Show shortcuts', action: 'help' },
  { key: 'Esc', description: 'Close modal', action: 'close' },
];

export const useKeyboardShortcuts = (
  onAction: (action: string) => void,
  disabled?: boolean
) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Require Ctrl/Cmd for most shortcuts to avoid conflicts
      const isMod = e.ctrlKey || e.metaKey;

      if (e.key === '/' && !isMod) {
        e.preventDefault();
        onAction('search');
      } else if (e.key === 'f' && isMod) {
        e.preventDefault();
        onAction('fill');
      } else if (e.key === 'b' && isMod) {
        e.preventDefault();
        onAction('batch');
      } else if (e.key === 'd' && isMod) {
        e.preventDefault();
        onAction('darkmode');
      } else if (e.key === '?' && !isMod) {
        e.preventDefault();
        onAction('help');
      } else if (e.key === 'Escape') {
        onAction('close');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAction, disabled]);
};

interface KeyboardHelpModalProps {
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/60 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e28] rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-[#e8e6e3]">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#6b7280] hover:text-[#1a1a2e] dark:hover:text-[#e8e6e3]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.action} className="flex items-center justify-between">
                <span className="text-sm text-[#1a1a2e] dark:text-[#e8e6e3]">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-[#f0eeeb] dark:bg-[#16161d] text-[#1a1a2e] dark:text-[#e8e6e3] rounded border border-[#e5e2dd] dark:border-[#2a2a38]">
                  {shortcut.key === '/' || shortcut.key === '?' || shortcut.key === 'Esc' 
                    ? shortcut.key 
                    : `Ctrl+${shortcut.key.toUpperCase()}`}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#f0eeeb] dark:bg-[#16161d] border-t border-[#e5e2dd] dark:border-[#2a2a38]">
          <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-[#1e1e28] rounded border border-[#e5e2dd] dark:border-[#2a2a38]">?</kbd> anytime to see this menu
          </p>
        </div>
      </div>
    </div>
  );
};

// Small indicator showing keyboard shortcut hint
export const ShortcutHint: React.FC<{ keys: string; className?: string }> = ({ keys, className }) => (
  <kbd className={`ml-2 px-1.5 py-0.5 text-xs font-mono bg-[#f0eeeb] dark:bg-[#16161d] text-[#9a9590] rounded border border-[#e5e2dd] dark:border-[#2a2a38] ${className || ''}`}>
    {keys}
  </kbd>
);

