import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { FieldMapping, ProviderData, PDFField } from '../types';

/**
 * Check if PDF contains XFA forms (not supported by pdf-lib)
 */
async function checkForXFA(arrayBuffer: ArrayBuffer): Promise<boolean> {
  const bytes = new Uint8Array(arrayBuffer);
  const text = new TextDecoder('latin1').decode(bytes);
  return text.includes('/XFA') || text.includes('<xfa:') || text.includes('xmlns:xfa');
}

/**
 * Extract all form fields from a PDF
 */
export async function extractPDFFields(pdfFile: File): Promise<PDFField[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  
  // Check for XFA forms first
  const hasXFA = await checkForXFA(arrayBuffer);
  if (hasXFA) {
    console.warn('PDF contains XFA forms which are not fully supported. Attempting to extract AcroForm fields...');
  }
  
  try {
    // Try loading with different options
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields in PDF`);
    
    // Log field names for debugging
    if (fields.length > 0) {
      console.log('Field names:', fields.map(f => f.getName()));
    }
    
    return fields.map(field => ({
      name: field.getName(),
      type: getFieldType(field),
      value: getFieldValue(field)
    }));
  } catch (error) {
    console.error('Error extracting PDF fields:', error);
    
    // If it's an XFA form, provide specific message
    if (hasXFA) {
      throw new Error('This PDF uses XFA forms (common in government documents) which require Adobe Acrobat. Please open this PDF in Adobe Acrobat and re-save it as a standard PDF with AcroForm fields.');
    }
    
    throw error;
  }
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
 * Common field name mappings for provider data
 */
const COMMON_MAPPINGS: Record<string, string[]> = {
  'address': ['street', 'addr', 'mailing', 'physical', 'residence', 'location'],
  'phone': ['tel', 'telephone', 'mobile', 'cell', 'contact', 'fax'],
  'email': ['e-mail', 'mail', 'electronic'],
  'npi': ['npi number', 'national provider', 'provider id', 'npi #', 'npi#'],
  'dea': ['dea number', 'dea license', 'drug enforcement', 'dea #', 'dea#'],
  'license': ['license number', 'state license', 'medical license', 'lic', 'license #'],
  'name': ['full name', 'provider name', 'physician', 'aprn', 'nurse'],
  'first': ['first name', 'fname', 'given name', 'first'],
  'last': ['last name', 'lname', 'surname', 'family name', 'last'],
  'zip': ['postal', 'zipcode', 'zip code', 'zip'],
  'state': ['st', 'province'],
  'city': ['town', 'municipality'],
  'ssn': ['social security', 'ss#', 'ssn', 'social'],
  'dob': ['date of birth', 'birth date', 'birthday', 'dob'],
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
        
        if ((aliases.some(alias => pdfLower.includes(alias)) || pdfLower.includes(key)) && 
            (providerLower.includes(key) || aliases.some(alias => providerLower.includes(alias)))) {
          score = Math.max(score, 0.85);
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = providerField;
      }
    }
    
    // Include all fields, even with low confidence, so user can manually map
    mappings.push({
      pdfField: pdfField.name,
      providerField: bestMatch,
      confidence: bestScore,
      suggestedValue: bestMatch ? (providerData.data[bestMatch] || '') : ''
    });
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
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });
  const form = pdfDoc.getForm();
  
  // Get auto-generated mappings
  const pdfFields = await extractPDFFields(pdfFile);
  const autoMappings = generateFieldMappings(pdfFields, provider);
  
  // Create combined mapping (custom mappings override auto mappings)
  const mappingDict: Record<string, string> = {};
  
  // First add auto mappings
  for (const mapping of autoMappings) {
    if (mapping.providerField) {
      mappingDict[mapping.pdfField] = mapping.providerField;
    }
  }
  
  // Override with custom mappings
  Object.assign(mappingDict, customMappings);
  
  // Fill the form
  let filledCount = 0;
  for (const [pdfFieldName, providerFieldName] of Object.entries(mappingDict)) {
    try {
      const field = form.getField(pdfFieldName);
      const value = provider.data[providerFieldName];
      
      if (!value) continue;
      
      if (field instanceof PDFTextField) {
        field.setText(value);
        filledCount++;
      } else if (field instanceof PDFCheckBox) {
        if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1') {
          field.check();
        } else {
          field.uncheck();
        }
        filledCount++;
      } else if (field instanceof PDFDropdown) {
        try {
          field.select(value);
          filledCount++;
        } catch {
          // If value not in options, skip
        }
      }
    } catch (e) {
      console.warn(`Could not fill field ${pdfFieldName}:`, e);
    }
  }
  
  console.log(`Filled ${filledCount} fields in PDF`);
  
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
