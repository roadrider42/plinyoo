// src/routes/seiten.ts — #609 (spoonup): die Seiten der App mit echter Adresse, an EINER Stelle.
//
// Wer liest: src/routes/routen.tsx (Router), src/lib/alte-adressen.ts (Umleitung der alten #/-Adressen),
// src/components/SprachLink.tsx (Links in der Sprache der Seite), scripts/vorrendern.mjs (eine Datei je Seite und
// Sprache), scripts/buchseiten.mjs (Bücherleiste in jede Seite), scripts/generate-sitemap.mjs (Sitemap) und die
// Prüfungen unter tests/. Node lädt die Datei direkt (Typen abstreifen, ab Node 22.18), deshalb keine Importe und
// nur Typangaben, die sich abstreifen lassen. Die Sprachen kommen deshalb als Angabe herein (src/lib/sprachen.ts).
//
// pfad: die maßgebliche Adresse der deutschen Fassung, mit Schrägstrich am Ende — so liegt die Datei in dist/
//       (dist/zugang/index.html), so steht sie in canonical und Sitemap, und so verlinkt jede Seite sie.
// seo:  Schlüssel unter seo.<seo>.title / .description in public/locales/<sprache>/translation.json.
// nurDeutsch: Die Seite gibt es nur einmal, deutsch, unter `pfad` — jede Sprache verlinkt dorthin.
//       Impressum: benutzt keine Übersetzung. Datenschutz: Heiko E-540 "C", wird nicht übersetzt; privacy.note sagt
//       das in jeder Sprache.
//
// #609 Schritt 3 (Heiko E-528 "jetzt weitere Sprachen"): Jede andere Seite gibt es in jeder Sprache, de ohne
// Vorsilbe (/zugang/), die anderen mit (/en/zugang/). Die Wortteile bleiben deutsch.

export type Seite = { pfad: string; seo: string; nurDeutsch?: boolean };

export const SEITEN: readonly Seite[] = [
  { pfad: '/', seo: 'start' },
  { pfad: '/zugang/', seo: 'zugang' },
  { pfad: '/mitmachen/', seo: 'mitmachen' },
  { pfad: '/investieren/', seo: 'investieren' },
  { pfad: '/impressum/', seo: 'impressum', nurDeutsch: true },
  { pfad: '/datenschutz/', seo: 'datenschutz', nurDeutsch: true },
  { pfad: '/urheberrecht/', seo: 'urheberrecht' },
  { pfad: '/kontakt/', seo: 'kontakt' },
];

/** Die Sprache ohne Vorsilbe. Muss RUECKFALL_SPRACHE aus src/lib/sprachen.ts sein (tests/sprachen-609.mjs). */
export const GRUNDSPRACHE = 'de';

/** Eine vorgerenderte Seite: eine Seite in einer Sprache. */
export type Fassung = { pfad: string; sprache: string; seite: Seite };

/** Zerlegt einen Pfad in Sprachvorsilbe und Rest: "/en/zugang/" -> { sprache: "en", rest: "/zugang/" }. */
export function zerlege(pathname: string, sprachen: readonly string[]): { sprache: string | null; rest: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (m && m[1] !== GRUNDSPRACHE && sprachen.includes(m[1])) return { sprache: m[1], rest: m[2] || '/' };
  return { sprache: null, rest: pathname };
}

const mitSchraegstrich = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/** Die Seite zu einem Pfad (mit oder ohne Schrägstrich), oder null. */
export function seiteZu(rest: string): Seite | null {
  return SEITEN.find((s) => s.pfad === mitSchraegstrich(rest)) ?? null;
}

/**
 * Die Sprache, die ein Pfad festlegt, oder null, wenn er keine festlegt (Impressum, Datenschutz, unbekannte Pfade):
 * dort gilt die Sprache des Besuchers. "/en/zugang/" -> "en", "/zugang/" -> "de", "/datenschutz/" -> null.
 */
export function spracheDesPfads(pathname: string, sprachen: readonly string[]): string | null {
  const { sprache, rest } = zerlege(pathname, sprachen);
  const seite = seiteZu(rest);
  if (!seite || seite.nurDeutsch) return null;
  return sprache ?? GRUNDSPRACHE;
}

/**
 * Adresse eines Ziels in einer Sprache. `ziel` ist die deutsche Form mit Angaben ("/zugang/?rolle=x").
 * Seiten mit nurDeutsch und unbekannte Ziele bleiben, wie sie sind.
 */
export function sprachPfad(sprache: string, ziel: string): string {
  const i = ziel.search(/[?#]/);
  const pfad = i < 0 ? ziel : ziel.slice(0, i);
  const angaben = i < 0 ? '' : ziel.slice(i);
  const seite = seiteZu(pfad);
  if (sprache === GRUNDSPRACHE || !seite || seite.nurDeutsch) return ziel;
  return `/${sprache}${seite.pfad}${angaben}`;
}

/** Alle vorgerenderten Seiten: jede Seite in jeder Sprache, nurDeutsch nur in der Grundsprache. de zuerst. */
export function fassungen(sprachen: readonly string[]): Fassung[] {
  const reihe = [GRUNDSPRACHE, ...sprachen.filter((s) => s !== GRUNDSPRACHE)];
  const aus: Fassung[] = [];
  for (const sprache of reihe) {
    for (const seite of SEITEN) {
      if (seite.nurDeutsch && sprache !== GRUNDSPRACHE) continue;
      aus.push({ pfad: sprachPfad(sprache, seite.pfad), sprache, seite });
    }
  }
  return aus;
}
