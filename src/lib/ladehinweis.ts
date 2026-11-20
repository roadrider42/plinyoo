// Ladehinweis der Startseite in der Sprache des Besuchers (spoonup#548).
//
// Er steht im Suspense-Rückfall von src/main.tsx, also genau dann, wenn die Übersetzung
// (/locales/<sprache>/translation.json) noch nicht da ist. Deshalb liegen die Sätze hier im
// Code und nicht in translation.json.
//
// Wortlaut: spoonup claude/_ladehinweis-sprachen/sprecher-urteil.md @ b921d27a3 (Sprecher).
// Nicht ändern ohne neues Urteil. Prüfung: tests/ladehinweis-sprachen-548.mjs.
import { RUECKFALL_SPRACHE, SPRACHEN, type Sprache } from './sprachen';

export const LADEHINWEISE: Record<Sprache, string> = {
  de: 'Einen Moment...',
  en: 'Loading content...',
  es: 'Cargando contenido...',
  fr: 'Chargement en cours...',
  pl: 'Wczytywanie zawartości...',
  pt: 'Carregando conteúdo...',
  uk: 'Завантаження вмісту...',
};

const istSprache = (s: string): s is Sprache => (SPRACHEN as readonly string[]).includes(s);

/**
 * Reine Funktion: Sprachkennung (z. B. "pt-BR", "uk", "it") -> Ladehinweis.
 * Unbekannte oder fehlende Sprache -> Rückfallsprache der Startseite (fallbackLng in i18n.ts).
 */
export function ladehinweisFuer(sprache: string | null | undefined): string {
  const basis = (sprache ?? '').toLowerCase().split(/[-_]/)[0];
  return LADEHINWEISE[istSprache(basis) ? basis : RUECKFALL_SPRACHE];
}
