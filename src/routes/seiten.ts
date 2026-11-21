// src/routes/seiten.ts — #609 (spoonup): die Seiten der App mit echter Adresse, an EINER Stelle.
//
// Wer liest: src/routes/routen.tsx (Router), src/lib/alte-adressen.ts (Umleitung der alten #/-Adressen),
// scripts/vorrendern.mjs (eine Datei je Seite), scripts/buchseiten.mjs (Bücherleiste in jede Seite),
// scripts/generate-sitemap.mjs (Sitemap) und die Prüfungen unter tests/. Node lädt die Datei direkt
// (Typen abstreifen, ab Node 22.18), deshalb keine Importe und nur Typangaben, die sich abstreifen lassen.
//
// pfad: die maßgebliche Adresse, mit Schrägstrich am Ende — so liegt die Datei in dist/ (dist/zugang/index.html),
//       so steht sie in canonical und Sitemap, und so verlinkt jede Seite sie.
// seo:  Schlüssel unter seo.<seo>.title / .description in public/locales/de/translation.json.

export type Seite = { pfad: string; seo: string };

export const SEITEN: readonly Seite[] = [
  { pfad: '/', seo: 'start' },
  { pfad: '/zugang/', seo: 'zugang' },
  { pfad: '/mitmachen/', seo: 'mitmachen' },
  { pfad: '/investieren/', seo: 'investieren' },
  { pfad: '/impressum/', seo: 'impressum' },
  { pfad: '/datenschutz/', seo: 'datenschutz' },
  { pfad: '/urheberrecht/', seo: 'urheberrecht' },
  { pfad: '/kontakt/', seo: 'kontakt' },
];

/** Die vorgerenderte Sprache. Sprachfassungen (eigene Pfade je Sprache) kommen erst mit Schritt 3 des Plans. */
export const VORGERENDERT_SPRACHE = 'de';
