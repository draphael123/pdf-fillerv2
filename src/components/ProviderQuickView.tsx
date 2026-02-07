import React, { useState } from 'react';
import { ProviderData } from '../types';
import { jsPDF } from 'jspdf';

interface ProviderQuickViewProps {
  provider: ProviderData;
  onClose: () => void;
}

export const ProviderQuickView: React.FC<ProviderQuickViewProps> = ({
  provider,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'licenses'>('info');

  const copyToClipboard = async (value: string, fieldName: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Categorize fields
  const contactFields = ['Address', 'Phone Number', 'Fountain Email Address', 'Personal Email Address'];
  const emergencyFields = ['Emergency Contact Name', 'Emergency Contact Number'];
  const identifierFields = ['NPI #', 'DEA License Number(s)', 'Contract Start Date'];
  
  const stateKeys = Object.keys(provider.data).filter(key => 
    key.length === 2 || 
    key.includes('License') || 
    key.includes('CSR') || 
    key.includes('RX') ||
    key.includes('Furnishing')
  ).filter(key => !identifierFields.includes(key));

  const getFieldValue = (key: string) => provider.data[key] || '';

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(18);
    doc.text(provider.name, 20, y);
    y += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Provider Data Export - Fountain Health', 20, y);
    y += 15;
    
    doc.setTextColor(0);
    doc.setFontSize(12);
    
    // Contact Info
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Information', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    contactFields.forEach(field => {
      const value = getFieldValue(field);
      if (value) {
        doc.text(`${field}: ${value}`, 25, y);
        y += 6;
      }
    });
    
    y += 5;
    
    // Identifiers
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Identifiers', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    identifierFields.forEach(field => {
      const value = getFieldValue(field);
      if (value) {
        doc.text(`${field}: ${value}`, 25, y);
        y += 6;
      }
    });
    
    y += 5;
    
    // State Licenses
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('State Licenses', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    stateKeys.forEach(key => {
      const value = getFieldValue(key);
      if (value && y < 270) {
        doc.text(`${key}: ${value}`, 25, y);
        y += 5;
      }
    });
    
    doc.save(`${provider.name.replace(/[^a-zA-Z0-9]/g, '_')}_data.pdf`);
  };

  const exportToCSV = () => {
    const rows = [['Field', 'Value']];
    Object.entries(provider.data).forEach(([key, value]) => {
      if (value) {
        rows.push([key, value.replace(/,/g, ';')]);
      }
    });
    
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${provider.name.replace(/[^a-zA-Z0-9]/g, '_')}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const CopyButton: React.FC<{ value: string; fieldName: string }> = ({ value, fieldName }) => (
    <button
      onClick={() => copyToClipboard(value, fieldName)}
      className="p-1 text-[#6b7280] hover:text-[#c45d3a] transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <svg className="w-4 h-4 text-[#2d7a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex items-start justify-between py-2 border-b border-[#e5e2dd] dark:border-[#2a2a38] last:border-0">
        <div className="flex-1 min-w-0 mr-2">
          <span className="text-xs text-[#6b7280] dark:text-[#8b8b9b] uppercase tracking-wide">{label}</span>
          <p className="text-sm text-[#1a1a2e] dark:text-[#e8e6e3] break-words">{value}</p>
        </div>
        <CopyButton value={value} fieldName={label} />
      </div>
    );
  };

  const activeLicenses = stateKeys.filter(k => getFieldValue(k));

  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/60 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e28] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1a1a2e] dark:text-[#e8e6e3]">
                {provider.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                {getFieldValue('NPI #') && (
                  <span className="text-sm text-[#6b7280] dark:text-[#8b8b9b]">
                    NPI: <span className="font-mono">{getFieldValue('NPI #')}</span>
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 bg-[#e8f5f0] dark:bg-[#1a2f28] text-[#2d7a5f] rounded">
                  {activeLicenses.length} state licenses
                </span>
              </div>
            </div>
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

        {/* Tabs */}
        <div className="flex border-b border-[#e5e2dd] dark:border-[#2a2a38]">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-[#c45d3a] border-b-2 border-[#c45d3a]'
                : 'text-[#6b7280] hover:text-[#1a1a2e] dark:hover:text-[#e8e6e3]'
            }`}
          >
            Contact & IDs
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'licenses'
                ? 'text-[#c45d3a] border-b-2 border-[#c45d3a]'
                : 'text-[#6b7280] hover:text-[#1a1a2e] dark:hover:text-[#e8e6e3]'
            }`}
          >
            State Licenses ({activeLicenses.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Contact */}
              <div>
                <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3">Contact</h3>
                <div className="bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg p-4">
                  {contactFields.map(field => (
                    <FieldRow key={field} label={field} value={getFieldValue(field)} />
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3">Emergency Contact</h3>
                <div className="bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg p-4">
                  {emergencyFields.map(field => (
                    <FieldRow key={field} label={field} value={getFieldValue(field)} />
                  ))}
                </div>
              </div>

              {/* Identifiers */}
              <div>
                <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3] mb-3">Professional IDs</h3>
                <div className="bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg p-4">
                  {identifierFields.map(field => (
                    <FieldRow key={field} label={field} value={getFieldValue(field)} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeLicenses.map(key => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-xs font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">{key}</span>
                    <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] font-mono truncate">
                      {getFieldValue(key)}
                    </p>
                  </div>
                  <CopyButton value={getFieldValue(key)} fieldName={key} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e2dd] dark:border-[#2a2a38] flex gap-3">
          <button
            onClick={exportToPDF}
            className="flex-1 py-2 px-4 border border-[#e5e2dd] dark:border-[#2a2a38] text-[#1a1a2e] dark:text-[#e8e6e3] rounded-lg text-sm font-medium hover:bg-[#f0eeeb] dark:hover:bg-[#16161d] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={exportToCSV}
            className="flex-1 py-2 px-4 border border-[#e5e2dd] dark:border-[#2a2a38] text-[#1a1a2e] dark:text-[#e8e6e3] rounded-lg text-sm font-medium hover:bg-[#f0eeeb] dark:hover:bg-[#16161d] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

