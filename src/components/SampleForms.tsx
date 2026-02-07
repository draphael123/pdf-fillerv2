import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface SampleForm {
  id: string;
  name: string;
  description: string;
  fields: string[];
}

const SAMPLE_FORMS: SampleForm[] = [
  {
    id: 'provider-enrollment',
    name: 'Provider Enrollment Form',
    description: 'Basic enrollment with name, NPI, address, contact info',
    fields: ['Provider Name', 'NPI Number', 'Address', 'City', 'State', 'ZIP', 'Phone', 'Email', 'DEA Number'],
  },
  {
    id: 'credentialing-app',
    name: 'Credentialing Application',
    description: 'Detailed application with licenses and emergency contact',
    fields: ['Full Name', 'NPI', 'DEA License', 'Address', 'Phone Number', 'Email Address', 'Emergency Contact Name', 'Emergency Contact Phone', 'TX License', 'FL License', 'CA License'],
  },
  {
    id: 'insurance-roster',
    name: 'Insurance Roster Update',
    description: 'Quick roster form with essential identifiers',
    fields: ['Provider Name', 'NPI #', 'Phone Number', 'Fountain Email Address', 'Address'],
  },
];

export const SampleForms: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const generateSamplePDF = async (form: SampleForm) => {
    setGenerating(form.id);
    
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { height } = page.getSize();
      
      // Header
      page.drawText(form.name.toUpperCase(), {
        x: 50,
        y: height - 50,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      page.drawText('Sample Form for Testing - Fountain Health', {
        x: 50,
        y: height - 70,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Draw line
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: 562, y: height - 85 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Create form
      const pdfForm = pdfDoc.getForm();
      
      let yPosition = height - 120;
      const fieldHeight = 20;
      const spacing = 50;
      
      form.fields.forEach((fieldName, index) => {
        // Field label
        page.drawText(fieldName + ':', {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        // Create text field
        const textField = pdfForm.createTextField(fieldName);
        textField.addToPage(page, {
          x: 50,
          y: yPosition - fieldHeight - 5,
          width: 250,
          height: fieldHeight,
          borderWidth: 1,
          borderColor: rgb(0.8, 0.8, 0.8),
        });
        
        yPosition -= spacing;
        
        // Start new column after 8 fields
        if (index === 7) {
          yPosition = height - 120;
        }
        
        // Adjust x position for second column
        if (index >= 8) {
          page.drawText(fieldName + ':', {
            x: 320,
            y: height - 120 - ((index - 8) * spacing),
            size: 10,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
      });
      
      // Footer
      page.drawText('This is a sample form generated for testing the Provider Form Filler tool.', {
        x: 50,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      page.drawText('Fields in this form will auto-match with provider data from the Compliance Dashboard.', {
        x: 50,
        y: 38,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.id}-sample.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating sample form');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1e1e28] border border-[#e5e2dd] dark:border-[#2a2a38] rounded-lg hover:border-[#c4c0b8] dark:hover:border-[#3a3a48] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📄</span>
          <span className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
            Sample forms to test
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
          <p className="text-sm text-[#6b7280] dark:text-[#8b8b9b] mb-4">
            Download these sample fillable PDFs to test the form filler. Each form has fields that match provider data.
          </p>
          
          <div className="space-y-3">
            {SAMPLE_FORMS.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-4 bg-[#f0eeeb] dark:bg-[#16161d] rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
                    {form.name}
                  </h4>
                  <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] mt-0.5">
                    {form.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.fields.slice(0, 5).map((field) => (
                      <span
                        key={field}
                        className="px-1.5 py-0.5 text-xs bg-white dark:bg-[#2a2a38] text-[#6b7280] dark:text-[#8b8b9b] rounded"
                      >
                        {field}
                      </span>
                    ))}
                    {form.fields.length > 5 && (
                      <span className="px-1.5 py-0.5 text-xs text-[#6b7280] dark:text-[#8b8b9b]">
                        +{form.fields.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => generateSamplePDF(form)}
                  disabled={generating === form.id}
                  className="px-4 py-2 bg-[#1a1a2e] dark:bg-[#e8e6e3] text-white dark:text-[#1a1a2e] text-sm font-medium rounded-lg hover:bg-[#2d2d44] dark:hover:bg-[#d8d6d3] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {generating === form.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#e8f5f0] dark:bg-[#1a2f28] border border-[#c8e5d8] dark:border-[#2a4038] rounded-lg">
            <p className="text-xs text-[#2d7a5f] dark:text-[#6dba9f]">
              <strong>Tip:</strong> After downloading, upload the form above and select a provider. The fields will auto-match with their data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

