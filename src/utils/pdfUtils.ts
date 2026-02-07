import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { FieldMapping, ProviderData, PDFField } from '../types';

export interface PDFAnalysisResult {
  fields: PDFField[];
  isXFA: boolean;
  hasAcroFields: boolean;
  xfaType?: 'dynamic' | 'static' | 'hybrid';
  errorMessage?: string;
}

/**
 * Comprehensive XFA detection
 */
async function analyzeForXFA(arrayBuffer: ArrayBuffer): Promise<{
  isXFA: boolean;
  xfaType?: 'dynamic' | 'static' | 'hybrid';
  details: string[];
}> {
  const bytes = new Uint8Array(arrayBuffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  const details: string[] = [];
  let isXFA = false;
  let xfaType: 'dynamic' | 'static' | 'hybrid' | undefined;
  
  // Check for various XFA indicators
  if (text.includes('/XFA')) {
    isXFA = true;
    details.push('Contains /XFA dictionary reference');
  }
  
  if (text.includes('<xfa:data') || text.includes('xmlns:xfa')) {
    isXFA = true;
    details.push('Contains XFA XML namespace declarations');
  }
  
  if (text.includes('<template xmlns')) {
    isXFA = true;
    details.push('Contains XFA template definition');
  }
  
  if (text.includes('XFA Foreground')) {
    isXFA = true;
    details.push('Contains XFA foreground layer');
  }
  
  // Determine XFA type
  if (isXFA) {
    if (text.includes('<dynamicRender>') || text.includes('subform')) {
      xfaType = 'dynamic';
      details.push('Detected as Dynamic XFA form');
    } else if (text.includes('<acroForm>') && text.includes('/XFA')) {
      xfaType = 'hybrid';
      details.push('Detected as Hybrid XFA/AcroForm');
    } else {
      xfaType = 'static';
      details.push('Detected as Static XFA form');
    }
  }
  
  // Check for flattened forms
  if (text.includes('/Flatten') || (text.includes('/Fields') && text.includes('[]'))) {
    details.push('Form may be flattened (fields converted to static content)');
  }
  
  return { isXFA, xfaType, details };
}

/**
 * Extract all form fields from a PDF with detailed analysis
 */
export async function extractPDFFields(pdfFile: File): Promise<PDFField[]> {
  const result = await analyzePDF(pdfFile);
  
  if (result.errorMessage) {
    throw new Error(result.errorMessage);
  }
  
  return result.fields;
}

/**
 * Full PDF analysis including XFA detection
 */
export async function analyzePDF(pdfFile: File): Promise<PDFAnalysisResult> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  
  // Analyze for XFA forms
  const xfaAnalysis = await analyzeForXFA(arrayBuffer);
  
  if (xfaAnalysis.details.length > 0) {
    console.log('XFA Analysis:', xfaAnalysis.details);
  }
  
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} AcroForm fields in PDF`);
    
    const pdfFields = fields.map(field => ({
      name: field.getName(),
      type: getFieldType(field),
      value: getFieldValue(field)
    }));
    
    // If XFA is detected but we found AcroForm fields, it's likely a hybrid
    if (xfaAnalysis.isXFA && fields.length > 0) {
      console.log('Hybrid XFA/AcroForm detected - using AcroForm fields');
      return {
        fields: pdfFields,
        isXFA: true,
        hasAcroFields: true,
        xfaType: 'hybrid',
      };
    }
    
    // Pure XFA with no AcroForm fields
    if (xfaAnalysis.isXFA && fields.length === 0) {
      return {
        fields: [],
        isXFA: true,
        hasAcroFields: false,
        xfaType: xfaAnalysis.xfaType,
        errorMessage: 'XFA_FORM_DETECTED',
      };
    }
    
    // No fields found and not XFA
    if (fields.length === 0) {
      return {
        fields: [],
        isXFA: false,
        hasAcroFields: false,
        errorMessage: 'NO_FIELDS_DETECTED',
      };
    }
    
    return {
      fields: pdfFields,
      isXFA: false,
      hasAcroFields: true,
    };
    
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    
    if (xfaAnalysis.isXFA) {
      return {
        fields: [],
        isXFA: true,
        hasAcroFields: false,
        xfaType: xfaAnalysis.xfaType,
        errorMessage: 'XFA_FORM_DETECTED',
      };
    }
    
    return {
      fields: [],
      isXFA: false,
      hasAcroFields: false,
      errorMessage: 'PDF_LOAD_ERROR',
    };
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
