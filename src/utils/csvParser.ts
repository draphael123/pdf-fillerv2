import { ParsedProviderData, ProviderData } from '../types';

/**
 * Properly parse CSV handling quoted fields with newlines, commas, etc.
 */
function parseCSVContent(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of row
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      if (char === '\r') i++; // Skip \n in \r\n
    } else if (char === '\r' && !inQuotes) {
      // End of row (just \r)
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  // Don't forget the last cell and row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Parses the Provider Compliance Dashboard CSV format
 * where providers are columns and attributes are rows
 */
export function parseProviderCSV(csvText: string): ParsedProviderData {
  const rows = parseCSVContent(csvText);
  
  if (rows.length === 0) {
    return { providers: [], allFields: [] };
  }

  // Find the header row (first row with "Column 1" or similar)
  // and the data start row (where we have "NOTES", "Address", etc.)
  let headerRowIndex = 0;
  let dataStartIndex = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const firstCol = rows[i][0]?.toLowerCase().trim();
    if (firstCol === 'column 1' || firstCol === '') {
      headerRowIndex = i;
    }
    if (firstCol === 'notes' || firstCol === 'address' || firstCol === 'phone number') {
      dataStartIndex = i;
      break;
    }
  }

  // If we didn't find a data start, look for the first row with actual field names
  if (dataStartIndex === 0) {
    for (let i = 1; i < rows.length; i++) {
      const firstCol = rows[i][0]?.trim();
      if (firstCol && firstCol.length > 0 && !firstCol.toLowerCase().includes('column')) {
        dataStartIndex = i;
        break;
      }
    }
  }

  // Extract provider names from the header row
  const headerRow = rows[headerRowIndex];
  const providerNames: string[] = [];
  const termIndex = headerRow.findIndex(cell => cell.includes('TERM>'));
  const maxCol = termIndex > 0 ? termIndex : headerRow.length;
  
  for (let colIndex = 1; colIndex < maxCol; colIndex++) {
    let name = headerRow[colIndex];
    if (name) {
      // Clean up the name - remove newlines and extra spaces
      name = name.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip if it looks like a termed provider or empty
      if (name && !name.toLowerCase().includes('term') && !name.includes('TERM>')) {
        providerNames.push(name);
      }
    }
  }

  // Parse data rows
  const providers: ProviderData[] = [];
  const allFields = new Set<string>();

  for (let colIndex = 0; colIndex < providerNames.length; colIndex++) {
    const providerData: Record<string, string> = {};
    
    for (let rowIndex = dataStartIndex; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      let fieldName = row[0]?.trim();
      const fieldValue = row[colIndex + 1]?.trim();
      
      // Skip empty field names or rows
      if (!fieldName || fieldName === '') continue;
      
      // Clean up field name
      fieldName = fieldName.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (fieldName && fieldValue) {
        // Clean up field value
        const cleanValue = fieldValue.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
        providerData[fieldName] = cleanValue;
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

  console.log(`Parsed ${providers.length} providers with ${allFields.size} unique fields`);

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
