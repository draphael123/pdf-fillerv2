export interface ProviderData {
  name: string;
  data: Record<string, string>;
}

export interface ParsedProviderData {
  providers: ProviderData[];
  allFields: string[];
}

export interface PDFField {
  name: string;
  type: string;
  value?: string;
}

export interface FieldMapping {
  pdfField: string;
  providerField: string;
  confidence: number;
  suggestedValue: string;
}

export interface MappingStrategy {
  autoMap: boolean;
  customMappings: Record<string, string>;
}

