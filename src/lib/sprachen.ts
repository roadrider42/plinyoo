// Die Sprachen der Startseite und ihre Rückfallsprache — an genau einer Stelle.
// src/lib/i18n.ts konfiguriert i18next damit, src/lib/ladehinweis.ts wählt daraus den
// Ladehinweis (spoonup#548). Ohne Nebenwirkung, damit eine Prüfung die Datei laden kann,
// ohne i18next zu starten.
export const SPRACHEN = ['de', 'en', 'es', 'fr', 'pt', 'uk', 'pl'] as const;
export type Sprache = (typeof SPRACHEN)[number];
export const RUECKFALL_SPRACHE: Sprache = 'de';
