import { ParsedProviderData, ProviderData } from '../types';

/**
 * Parses the Provider Compliance Dashboard CSV format
 * where providers are columns and attributes are rows
 */
export function parseProviderCSV(csvText: string): ParsedProviderData {
  const lines = csvText.split('\n').map(line => {
    // Parse CSV line while handling quoted values with newlines
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values;
  });

  // Find the first data row (where we have "NOTES" or other actual field names)
  let dataStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const firstCol = lines[i][0]?.toLowerCase();
    if (firstCol === 'notes' || firstCol === 'address' || firstCol === 'phone number') {
      dataStartIndex = i;
      break;
    }
  }

  // Extract provider names from the header rows (before dataStartIndex)
  const providerNames: string[] = [];
  const maxProviders = Math.max(...lines.slice(0, dataStartIndex).map(row => row.length));
  
  for (let colIndex = 1; colIndex < maxProviders; colIndex++) {
    let providerName = '';
    
    // Combine multi-line provider names from header rows
    for (let rowIndex = 0; rowIndex < dataStartIndex; rowIndex++) {
      const value = lines[rowIndex][colIndex];
      if (value && value.trim() && !value.includes('TERM>')) {
        providerName += (providerName ? ' ' : '') + value.trim();
      }
    }
    
    // Clean up provider name
    providerName = providerName
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
    
    // Only add if we have a valid name and it's not in the "TERM>" section
    if (providerName && !providerName.toLowerCase().includes('term')) {
      providerNames.push(providerName);
    }
  }

  // Parse data rows
  const providers: ProviderData[] = [];
  const allFields = new Set<string>();

  for (let colIndex = 0; colIndex < providerNames.length; colIndex++) {
    const providerData: Record<string, string> = {};
    
    for (let rowIndex = dataStartIndex; rowIndex < lines.length; rowIndex++) {
      const row = lines[rowIndex];
      const fieldName = row[0]?.trim();
      const fieldValue = row[colIndex + 1]?.trim();
      
      if (fieldName && fieldValue) {
        // Store the field
        providerData[fieldName] = fieldValue;
        allFields.add(fieldName);
      }
    }
    
    // Only add provider if they have data
    if (Object.keys(providerData).length > 0) {
      providers.push({
        name: providerNames[colIndex],
        data: providerData
      });
    }
  }

  return {
    providers,
    allFields: Array.from(allFields).sort()
  };
}

/**
 * Alternative: Parse from uploaded CSV file
 */
export async function parseCSVFile(file: File): Promise<ParsedProviderData> {
  const text = await file.text();
  return parseProviderCSV(text);
}

/**
 * Generate sample JSON for a specific provider
 */
export function generateProviderJSON(provider: ProviderData): string {
  return JSON.stringify(provider, null, 2);
}

