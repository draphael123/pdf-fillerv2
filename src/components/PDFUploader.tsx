import React, { useCallback, useState } from 'react';

interface PDFUploaderProps {
  onFileUpload: (file: File | null) => void;
  currentFile: File | null;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileUpload, currentFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  if (currentFile) {
    return (
      <div className="border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg p-4 bg-white dark:bg-[#1e1e28]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fef0ed] dark:bg-[#2a1f1d] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c45d3a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] truncate">
                {currentFile.name}
              </p>
              <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b]">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileUpload(null)}
            className="p-2 text-[#6b7280] hover:text-[#c45d3a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-[#c45d3a] bg-[#fef8f6] dark:bg-[#1e1a18]'
          : 'border-[#e5e2dd] dark:border-[#2a2a38] hover:border-[#c4c0b8] dark:hover:border-[#3a3a48]'
      }`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f0eeeb] dark:bg-[#2a2a38] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-sm text-[#1a1a2e] dark:text-[#e8e6e3]">
        Drop PDF here or <span className="text-[#c45d3a] font-medium">browse</span>
      </p>
      <p className="text-xs text-[#9a9590] dark:text-[#5a5a6a] mt-1">
        PDF files only
      </p>
    </div>
  );
};
