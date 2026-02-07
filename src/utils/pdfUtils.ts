import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { FieldMapping, ProviderData, PDFField } from '../types';

/**
 * Extract all form fields from a PDF
 */
export async function extractPDFFields(pdfFile: File): Promise<PDFField[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  
  const fields = form.getFields();
  
  return fields.map(field => ({
    name: field.getName(),
    type: getFieldType(field),
    value: getFieldValue(field)
  }));
}

/**
 * Get the type of a PDF field
 */
function getFieldType(field: ReturnType<ReturnType<typeof PDFDocument.prototype.getForm>['getFields']>[number]): string {
  if (field instanceof PDFTextField) return 'text';
  if (field instanceof PDFCheckBox) return 'checkbox';
  if (field instanceof PDFDropdown) return 'dropdown';
  if (field instanceof PDFRadioGroup) return 'radio';
  return 'unknown';
}

/**
 * Get the current value of a PDF field
 */
function getFieldValue(field: ReturnType<ReturnType<typeof PDFDocument.prototype.getForm>['getFields']>[number]): string | undefined {
  try {
    if (field instanceof PDFTextField) {
      return field.getText() || undefined;
    }
    if (field instanceof PDFCheckBox) {
      return field.isChecked() ? 'checked' : 'unchecked';
    }
    if (field instanceof PDFDropdown) {
      const selected = field.getSelected();
      return selected ? selected[0] : undefined;
    }
  } catch {
    return undefined;
  }
}

/**
 * Calculate similarity between two strings (Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Common keywords match
  const keywords1 = new Set(s1.split(/\s+/));
  const keywords2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);
  
  if (union.size > 0) {
    return intersection.size / union.size;
  }
  
  return 0;
}

/**
 * Common field name mappings
 */
const COMMON_MAPPINGS: Record<string, string[]> = {
  'address': ['street', 'addr', 'mailing', 'physical', 'residence'],
  'phone': ['tel', 'telephone', 'mobile', 'cell', 'contact'],
  'email': ['e-mail', 'mail', 'electronic'],
  'npi': ['npi number', 'national provider', 'provider id'],
  'dea': ['dea number', 'dea license', 'drug enforcement'],
  'license': ['license number', 'state license', 'medical license'],
  'name': ['full name', 'provider name', 'physician'],
  'first': ['first name', 'fname', 'given name'],
  'last': ['last name', 'lname', 'surname', 'family name'],
  'zip': ['postal', 'zipcode', 'zip code'],
  'state': ['st', 'province'],
  'city': ['town', 'municipality'],
};

/**
 * Smart field mapping between PDF fields and provider data
 */
export function generateFieldMappings(
  pdfFields: PDFField[],
  providerData: ProviderData
): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  const providerFields = Object.keys(providerData.data);
  
  for (const pdfField of pdfFields) {
    let bestMatch = '';
    let bestScore = 0;
    
    // Try to find the best matching provider field
    for (const providerField of providerFields) {
      let score = calculateSimilarity(pdfField.name, providerField);
      
      // Boost score for common mappings
      for (const [key, aliases] of Object.entries(COMMON_MAPPINGS)) {
        const pdfLower = pdfField.name.toLowerCase();
        const providerLower = providerField.toLowerCase();
        
        if (aliases.some(alias => pdfLower.includes(alias)) && 
            providerLower.includes(key)) {
          score = Math.max(score, 0.9);
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = providerField;
      }
    }
    
    // Only include mappings with reasonable confidence
    if (bestScore > 0.3) {
      mappings.push({
        pdfField: pdfField.name,
        providerField: bestMatch,
        confidence: bestScore,
        suggestedValue: providerData.data[bestMatch] || ''
      });
    }
  }
  
  return mappings.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Fill PDF with provider data based on mappings
 */
export async function fillPDF(
  pdfFile: File,
  provider: ProviderData,
  customMappings: Record<string, string> = {}
): Promise<Uint8Array> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  
  // Get auto-generated mappings
  const pdfFields = await extractPDFFields(pdfFile);
  const autoMappings = generateFieldMappings(pdfFields, provider);
  
  // Create combined mapping (custom mappings override auto mappings)
  const mappingDict: Record<string, string> = {};
  
  // First add auto mappings
  for (const mapping of autoMappings) {
    mappingDict[mapping.pdfField] = mapping.providerField;
  }
  
  // Override with custom mappings
  Object.assign(mappingDict, customMappings);
  
  // Fill the form
  for (const [pdfFieldName, providerFieldName] of Object.entries(mappingDict)) {
    try {
      const field = form.getField(pdfFieldName);
      const value = provider.data[providerFieldName];
      
      if (!value) continue;
      
      if (field instanceof PDFTextField) {
        field.setText(value);
      } else if (field instanceof PDFCheckBox) {
        if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') {
          field.check();
        } else {
          field.uncheck();
        }
      } else if (field instanceof PDFDropdown) {
        try {
          field.select(value);
        } catch {
          // If value not in options, skip
        }
      }
    } catch {
      console.warn(`Could not fill field ${pdfFieldName}`);
    }
  }
  
  // Flatten the form (make it non-editable)
  // form.flatten();
  
  return await pdfDoc.save();
}

/**
 * Download filled PDF
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

