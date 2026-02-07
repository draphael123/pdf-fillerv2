import { ProviderData, ParsedProviderData } from '../types';

const STORAGE_KEY = 'provider_compliance_data';

/**
 * Save provider data to localStorage
 */
export function saveProviderData(data: ParsedProviderData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving provider data:', error);
  }
}

/**
 * Load provider data from localStorage
 */
export function loadProviderData(): ParsedProviderData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading provider data:', error);
  }
  return null;
}

/**
 * Clear provider data from localStorage
 */
export function clearProviderData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if provider data exists in localStorage
 */
export function hasProviderData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get the last update time of provider data
 */
export function getProviderDataTimestamp(): string | null {
  const data = loadProviderData();
  if (data && (data as ParsedProviderData & { lastUpdated?: string }).lastUpdated) {
    return (data as ParsedProviderData & { lastUpdated?: string }).lastUpdated!;
  }
  return null;
}

/**
 * Save provider data with timestamp
 */
export function saveProviderDataWithTimestamp(providers: ProviderData[], allFields: string[]): void {
  const dataWithTimestamp = {
    providers,
    allFields,
    lastUpdated: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error('Error saving provider data:', error);
  }
}

