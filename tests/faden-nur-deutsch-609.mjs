#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup, Entscheidung Max 22.11.2026) -- der Faden im Kopf der
// Startseite steht nur auf der deutschen Seite. Seine Karten sind Buchtexte
// aus content/buecher und damit deutsch (Heiko E-536 "a"); auf einer
// Sprachseite wären sie deutsche Reste (Heiko E-535 "a"). Er bleibt dort aus,
// AUCH WENN hero.faden in der Sprache übersetzt ist.
//
//   node tests/faden-nur-deutsch-609.mjs               (npm run pruefung:faden-nur-deutsch, im Bau)
//   node tests/faden-nur-deutsch-609.mjs --dist <ordner> --server <entry-server.mjs>
//
// F1  Vorrendern (dist-server/entry-server.mjs, rendern()): "/" deutsch hat
//     den Faden (data-ziel="hero-faden") und die Gegenbild-Zeile
//     (hero.faden.contrastFrom). "/" in en, es, fr, pt, uk, pl hat keins von
//     beidem -- gerendert mit den Texten der Sprache PLUS einem übersetzten
//     hero.faden (die deutschen Texte mit vorangestelltem "[xx] "). Ohne
//     diesen Zusatz wäre F1 heute grün, weil keine Sprache hero.faden hat.
// F2  Bauordner: dist/index.html hat den Faden, dist/<sprache>/index.html
//     nicht.
// Im Browser hält tests/hydration-609.mjs (Fall "faden /en/") dasselbe fest.
//
// Gegenprobe 22.11.2026, node 22.23.4: mit Hero.tsx von 3366aa9 (Faden, sobald
// die Sprache hero.faden hat) ROT F1 in allen sechs Sprachen, Exit 1. Mit dem
// Fix GRUEN. Ohne dist-server/: ROT.
// Exit 0 grün, 1 rot.
// ===========================================================================
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, v) => { const i = process.argv.indexOf(n); return i > 0 ? path.resolve(process.argv[i + 1] ?? '') : v; };
const DIST = arg('--dist', path.join(WURZEL, 'dist'));
const SERVER = arg('--server', path.join(WURZEL, 'dist-server/entry-server.mjs'));
const ANDERE = ['en', 'es', 'fr', 'pt', 'uk', 'pl'];
const FADEN = 'data-ziel="hero-faden"';
const lies = (s) => JSON.parse(readFileSync(path.join(WURZEL, 'public/locales', s, 'translation.json'), 'utf8'));
const rot = [];

if (!existsSync(SERVER)) { console.log(`ROT: ${SERVER} fehlt -- erst vite build --ssr`); process.exit(1); }
const { rendern } = await import(pathToFileURL(SERVER).href);
const de = lies('de');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const gegenbild = (html, s) => html.includes(esc(s));

// F1
if (!de.hero?.faden?.contrastFrom) rot.push('F1 hero.faden fehlt in public/locales/de/translation.json -- nichts zu prüfen');
else {
  const deHtml = await rendern('/', 'de', de, de);
  if (!deHtml.includes(FADEN)) rot.push('F1 "/" de: kein Faden im vorgerenderten HTML');
  if (!gegenbild(deHtml, de.hero.faden.contrastFrom)) rot.push('F1 "/" de: keine Gegenbild-Zeile');
  for (const s of ANDERE) {
    const texte = lies(s);
    const uebersetzt = Object.fromEntries(Object.entries(de.hero.faden).map(([k, v]) => [k, typeof v === 'string' ? `[${s}] ${v}` : v]));
    const mit = { ...texte, hero: { ...texte.hero, faden: uebersetzt } };
    const html = await rendern(`/${s}/`, s, mit, de);
    if (html.includes(FADEN)) rot.push(`F1 /${s}/ mit übersetztem hero.faden: Faden im vorgerenderten HTML`);
    if (gegenbild(html, uebersetzt.contrastFrom)) rot.push(`F1 /${s}/ mit übersetztem hero.faden: Gegenbild-Zeile im vorgerenderten HTML`);
  }
}

// F2
const datei = (s) => path.join(DIST, ...(s === 'de' ? [] : [s]), 'index.html');
for (const s of ['de', ...ANDERE]) {
  if (!existsSync(datei(s))) { rot.push(`F2 ${datei(s)} fehlt`); continue; }
  const hat = readFileSync(datei(s), 'utf8').includes(FADEN);
  if (s === 'de' && !hat) rot.push('F2 dist/index.html: kein Faden');
  if (s !== 'de' && hat) rot.push(`F2 dist/${s}/index.html: Faden`);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log(`GRUEN F1-F2: Faden und Gegenbild-Zeile nur auf "/" (de); in ${ANDERE.join(', ')} nicht, auch mit übersetztem hero.faden`);
}
