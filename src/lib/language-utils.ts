/**
 * Language utility functions for level conversion and mapping
 */

// Level conversion between 1-5 scale and CEFR
export const LEVEL_TO_CEFR: Record<number, string> = {
  1: 'A1',
  2: 'A2', 
  3: 'B1',
  4: 'B2',
  5: 'C1'
};

export const CEFR_TO_LEVEL: Record<string, number> = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 5 // Map C2 to level 5 as well
};

/**
 * Convert numeric level (1-5) to CEFR string
 */
export function levelToCEFR(level: number): string {
  return LEVEL_TO_CEFR[level] || 'A1';
}

/**
 * Convert CEFR string to numeric level (1-5)
 */
export function cefrToLevel(cefr: string): number {
  return CEFR_TO_LEVEL[cefr.toUpperCase()] || 1;
}

/**
 * Language code to display name mapping
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  'de': 'Deutsch',
  'en': 'English',
  'fr': 'Français', 
  'es': 'Español',
  'it': 'Italiano',
  'pt': 'Português',
  'nl': 'Nederlands',
  'pl': 'Polski'
};

/**
 * Get display name for language code
 */
export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code;
}

/**
 * Get language code from display name
 */
export function getLanguageCode(name: string): string {
  const entry = Object.entries(LANGUAGE_NAMES).find(([_, displayName]) => 
    displayName.toLowerCase() === name.toLowerCase()
  );
  return entry?.[0] || name.toLowerCase();
}
