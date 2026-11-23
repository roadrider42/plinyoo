// Die Sprachen der Startseite und ihre Rückfallsprache — an genau einer Stelle.
// src/lib/i18n.ts konfiguriert i18next damit, src/lib/ladehinweis.ts wählt daraus den
// Ladehinweis (spoonup#548). Ohne Nebenwirkung und ohne Importe, damit eine Prüfung (und
// scripts/generate-sitemap.mjs, scripts/buchseiten.mjs) die Datei laden kann, ohne i18next zu starten.
export const SPRACHEN = ['de', 'en', 'es', 'fr', 'pt', 'uk', 'pl'] as const;
export type Sprache = (typeof SPRACHEN)[number];
export const RUECKFALL_SPRACHE: Sprache = 'de';

// #609 Schritt 3: og:locale je Sprachfassung. Dieselben Werte wie die Trainer-Seiten
// (content/seiten/fuer-trainer/<sprache>.json, "ogLocale"); tests/sprachen-609.mjs hält beide gleich.
export const OG_LOCALE: Record<Sprache, string> = {
  de: 'de_DE', en: 'en_GB', es: 'es_ES', fr: 'fr_FR', pt: 'pt_BR', uk: 'uk_UA', pl: 'pl_PL',
};
