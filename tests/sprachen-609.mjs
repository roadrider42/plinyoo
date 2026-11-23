#!/usr/bin/env node
// ===========================================================================
// #609 Schritt 3 (spoonup, Heiko E-528 "jetzt weitere Sprachen") -- jede
// Sprache hat ihre eigene vorgerenderte Adresse, und jede Seite sagt
// Suchmaschinen, welche Fassungen es gibt. Ohne Browser, liest dist/.
//
//   node tests/sprachen-609.mjs                  (npm run pruefung:sprachen, im Bau)
//   node tests/sprachen-609.mjs --dist <ordner>
//
// Erwartet ist ausgeschrieben, nicht aus src/routes/seiten.ts gelesen: 6 Seiten
// in 7 Sprachen (42) plus Impressum und Datenschutz nur deutsch (Heiko E-540
// "C"; Impressum ohne Übersetzung) = 44 Dateien.
//
// L1  Jede der 44 Dateien liegt in dist/, mit Inhalt in #root, und
//     <html lang> ist ihre Sprache. /en/impressum/ und /en/datenschutz/ gibt
//     es nicht.
// L2  canonical und og:url = die eigene Adresse; og:locale = die der Sprache,
//     gleich wie auf den Trainer-Seiten (content/seiten/fuer-trainer/*.json).
// L3  hreflang: Jede Fassung einer Seite nennt genau die sieben Fassungen und
//     x-default (= deutsch), jede davon liegt in dist/ (gegenseitig).
//     Impressum und Datenschutz nennen keine.
// L4  Interne Links in #root einer Sprachseite führen in ihre Sprache
//     (/en/zugang/ statt /zugang/); Impressum und Datenschutz bleiben
//     /impressum/, /datenschutz/. Kein Link auf eine Fassung, die es nicht gibt.
// L5  Die Grundsprache der Pfade (seiten.ts, GRUNDSPRACHE) ist die
//     Rückfallsprache (sprachen.ts, RUECKFALL_SPRACHE).
// Gegenprobe 22.11.2026, node 22.23.4: gegen einen älteren Bau ohne
// Sprachfassungen (--dist) ROT, 45 Befunde (Seiten fehlen, kein hreflang),
// Exit 1. Mit Schritt 3 GRUEN.
// Exit 0 grün, 1 rot.
// ===========================================================================
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const i = process.argv.indexOf('--dist');
const DIST = i > 0 ? resolve(process.argv[i + 1]) : join(WURZEL, 'dist');
const SITE = 'https://www.plinyoo.com';

const SPRACHEN = ['de', 'en', 'es', 'fr', 'pt', 'uk', 'pl'];
const MIT_FASSUNGEN = ['/', '/zugang/', '/mitmachen/', '/investieren/', '/urheberrecht/', '/kontakt/'];
const NUR_DEUTSCH = ['/impressum/', '/datenschutz/'];
const pfadIn = (s, p) => (s === 'de' ? p : `/${s}${p}`);
const SEITEN = [
  ...SPRACHEN.flatMap((s) => MIT_FASSUNGEN.map((p) => ({ pfad: pfadIn(s, p), sprache: s, de: p }))),
  ...NUR_DEUTSCH.map((p) => ({ pfad: p, sprache: 'de', de: p, nurDeutsch: true })),
];
const datei = (p) => join(DIST, ...p.split('/').filter(Boolean), 'index.html');
const rot = [];

// L5
const seitenTs = readFileSync(join(WURZEL, 'src/routes/seiten.ts'), 'utf8');
const sprachenTs = readFileSync(join(WURZEL, 'src/lib/sprachen.ts'), 'utf8');
const grund = seitenTs.match(/export const GRUNDSPRACHE = '([a-z]+)'/)?.[1];
const rueck = sprachenTs.match(/export const RUECKFALL_SPRACHE: Sprache = '([a-z]+)'/)?.[1];
if (!grund || grund !== rueck) rot.push(`L5 GRUNDSPRACHE "${grund}" (seiten.ts) ist nicht RUECKFALL_SPRACHE "${rueck}" (sprachen.ts)`);

// og:locale der Trainer-Seiten
const ogTrainer = {};
for (const f of readdirSync(join(WURZEL, 'content/seiten/fuer-trainer')).filter((x) => /^[a-z]{2}\.json$/.test(x))) {
  const t = JSON.parse(readFileSync(join(WURZEL, 'content/seiten/fuer-trainer', f), 'utf8'));
  ogTrainer[t.lang] = t.ogLocale;
}

for (const s of ['en', 'es', 'fr', 'pt', 'uk', 'pl']) for (const p of NUR_DEUTSCH) {
  if (existsSync(datei(`/${s}${p}`))) rot.push(`L1 /${s}${p} liegt in dist/, die Seite gibt es nur deutsch`);
}

let links = 0;
for (const seite of SEITEN) {
  const { pfad, sprache } = seite;
  if (!existsSync(datei(pfad))) { rot.push(`L1 ${pfad}: ${datei(pfad)} fehlt`); continue; }
  const html = readFileSync(datei(pfad), 'utf8');
  const kopf = html.split('</head>')[0];
  const root = html.match(/<div id="root">([\s\S]*)<\/div>\s*(?:<nav class="buecher-fuss"|<script|<\/body>)/)?.[1] ?? '';
  // L1
  if (!html.includes('<div id="root">') || html.includes('<div id="root"></div>')) rot.push(`L1 ${pfad}: #root leer`);
  const lang = html.match(/<html lang="([^"]+)"/)?.[1];
  if (lang !== sprache) rot.push(`L1 ${pfad}: <html lang="${lang}">, erwartet "${sprache}"`);
  // L2
  const canon = [...kopf.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  if (canon.length !== 1 || canon[0] !== `${SITE}${pfad}`) rot.push(`L2 ${pfad}: canonical ${JSON.stringify(canon)}, erwartet ${SITE}${pfad}`);
  const ogUrl = kopf.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (ogUrl !== `${SITE}${pfad}`) rot.push(`L2 ${pfad}: og:url ${ogUrl}`);
  const ogLoc = [...kopf.matchAll(/<meta property="og:locale" content="([^"]+)"/g)].map((m) => m[1]);
  if (ogLoc.length !== 1 || ogLoc[0] !== ogTrainer[sprache]) rot.push(`L2 ${pfad}: og:locale ${JSON.stringify(ogLoc)}, erwartet ${ogTrainer[sprache]} (wie Trainer-Seite ${sprache})`);
  // L3
  const hl = [...kopf.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(([, h, href]) => `${h} ${href}`).sort();
  const soll = seite.nurDeutsch ? [] : [...SPRACHEN.map((s) => `${s} ${SITE}${pfadIn(s, seite.de)}`), `x-default ${SITE}${seite.de}`].sort();
  if (hl.join(' | ') !== soll.join(' | ')) rot.push(`L3 ${pfad}: hreflang [${hl.join(', ')}], erwartet [${soll.join(', ')}]`);
  for (const h of hl) { const href = h.split(' ')[1]; if (!existsSync(datei(href.slice(SITE.length)))) rot.push(`L3 ${pfad}: hreflang zeigt auf ${href}, das es in dist/ nicht gibt`); }
  // L4
  for (const [, href] of root.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
    if (href.startsWith('/buch/') || href.startsWith('/fuer-trainer') || /^\/[a-z]{2}\/(for-|para-|pour-|dla-|dlia-)/.test(href)) continue; // Buchseiten (deutsch) und Trainer-Seiten (eigene Pfade)
    links++;
    const m = href.match(/^\/([a-z]{2})(\/.*)$/);
    const linkSprache = m && SPRACHEN.includes(m[1]) ? m[1] : 'de';
    const rest = linkSprache === 'de' ? href : m[2];
    if (NUR_DEUTSCH.includes(rest)) { if (linkSprache !== 'de') rot.push(`L4 ${pfad}: Link ${href}, die Seite gibt es nur unter ${rest}`); continue; }
    if (!MIT_FASSUNGEN.includes(rest)) { rot.push(`L4 ${pfad}: Link ${href} auf keine Seite der App`); continue; }
    if (!seite.nurDeutsch && linkSprache !== sprache) rot.push(`L4 ${pfad}: Link ${href} führt nach "${linkSprache}", die Seite ist "${sprache}"`);
  }
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.slice(0, 60).join('\n  ')}${rot.length > 60 ? `\n  … ${rot.length - 60} weitere` : ''}`);
  process.exit(1);
}
console.log(`GRUEN L1-L5: ${SEITEN.length} Seiten in ${DIST} (${MIT_FASSUNGEN.length} × ${SPRACHEN.length} Sprachen + ${NUR_DEUTSCH.length} nur deutsch), lang, canonical, og:locale, hreflang gegenseitig, ${links} interne Links in der Sprache der Seite`);
