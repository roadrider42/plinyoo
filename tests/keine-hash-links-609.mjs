#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup) -- kein eigener Link zeigt noch auf eine Hash-Adresse (/#/…),
// und jeder Link auf eine Seite der App trägt den Schrägstrich am Ende.
//
//   node tests/keine-hash-links-609.mjs          Quellen UND dist/ (so am Ende von npm run build)
//   node tests/keine-hash-links-609.mjs --quellen  nur die Quellen, ohne Bau
//   LINKS_WURZEL=<anderer Stand> node tests/...   Gegenprobe ohne Fix
//
// H1  In den Quellen (src/**/*.ts(x), scripts/*.mjs, index.html) steht keine
//     Zeichenkette, die "#/" enthält -- also kein Link, kein Ziel, keine
//     zusammengesetzte Adresse. Kommentare dürfen über "#/" sprechen; gesucht
//     wird nur in Zeichenketten ('…', "…", `…`). Ausgenommen ist die
//     Umleitungsregel selbst (src/lib/alte-adressen.ts), denn sie muss "#/"
//     erkennen.
// H2  In jeder gebauten Seite (dist/**/*.html) zeigt kein href auf "#/".
//     Das eingesetzte Umleitungsskript im <head> ist kein href und zählt nicht.
// H3  Kein Link auf eine Seite der App ohne Schrägstrich am Ende: in den
//     Quellen to="/zugang", to={`/zugang?…`}, href="/zugang"; in dist/
//     href="/zugang" oder href="/zugang?…". Maßgeblich ist /zugang/ (canonical,
//     Sitemap); ohne Schrägstrich antwortet GitHub Pages mit einer Weiterleitung,
//     und Plausible zählt zwei Seiten.
//
// Gegenprobe 21.11.2026, node 22.23.4, --quellen: mit dem Stand origin/main
// 09c8f32 ROT 30 -- H1 6x (scripts/buchseiten.mjs, scripts/seiten.mjs) und
// H3 24x (Footer, Header, Hero, CTA, Roles, Formularseiten ...), Exit 1.
// Mit dem Fix GRUEN.
// Exit 0 grün, 1 rot.
// ===========================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WURZEL = process.env.LINKS_WURZEL ? path.resolve(process.env.LINKS_WURZEL) : HIER;
const NUR_QUELLEN = process.argv.includes('--quellen');
const AUSNAHME = new Set(['src/lib/alte-adressen.ts']);
const SEITEN = ['zugang', 'mitmachen', 'investieren', 'impressum', 'datenschutz', 'urheberrecht', 'kontakt'];
const rot = [];

function dateien(dir, endung) {
  const aus = [];
  if (!fs.existsSync(dir)) return aus;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) aus.push(...dateien(p, endung));
    else if (endung.test(e.name)) aus.push(p);
  }
  return aus;
}
const zeile = (text, i) => text.slice(0, i).split('\n').length;

// Zeichenketten eines Quelltexts, ohne Kommentare. Einfacher Leser: genügt für diese Dateien,
// weil ein Kommentar nie mitten in einer Zeichenkette beginnt und umgekehrt.
function zeichenketten(text) {
  const aus = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') { i = text.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && text[i + 1] === '*') { i = text.indexOf('*/', i + 2); if (i < 0) break; i += 2; continue; }
    if (c === '<' && text.startsWith('<!--', i)) { i = text.indexOf('-->', i); if (i < 0) break; i += 3; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < text.length && text[j] !== c) { if (text[j] === '\\') j++; if (c !== '`' && text[j] === '\n') break; j++; }
      aus.push({ wert: text.slice(i + 1, j), bei: i });
      i = j + 1;
      continue;
    }
    i++;
  }
  return aus;
}

// --- H1, H3 in den Quellen ----------------------------------------------------------
const quellen = [
  ...dateien(path.join(WURZEL, 'src'), /\.(ts|tsx)$/),
  ...dateien(path.join(WURZEL, 'scripts'), /\.mjs$/),
  path.join(WURZEL, 'index.html'),
];
const OHNE_STRICH_QUELLE = new RegExp(`(?:\\bto|href)=\\{?["'\`]/(${SEITEN.join('|')})(?=["'\`?#])`, 'g');
for (const datei of quellen) {
  const rel = path.relative(WURZEL, datei);
  const text = fs.readFileSync(datei, 'utf8');
  if (!AUSNAHME.has(rel)) {
    for (const z of zeichenketten(text)) if (z.wert.includes('#/')) rot.push(`H1 ${rel}:${zeile(text, z.bei)} Zeichenkette mit "#/": ${JSON.stringify(z.wert.slice(0, 90))}`);
  }
  for (const m of text.matchAll(OHNE_STRICH_QUELLE)) rot.push(`H3 ${rel}:${zeile(text, m.index)} ${m[0]}… ohne Schrägstrich am Ende`);
}

// --- H2, H3 in dist/ -------------------------------------------------------------------
let seiten = 0;
if (!NUR_QUELLEN) {
  const dist = path.join(WURZEL, 'dist');
  const html = dateien(dist, /\.html$/);
  if (!html.length) rot.push('H2 dist/ hat keine .html -- ohne Bau keine Prüfung (oder --quellen)');
  const OHNE_STRICH_DIST = new RegExp(`href="/(${SEITEN.join('|')})(?=["?#])`, 'g');
  for (const datei of html) {
    seiten++;
    const rel = path.relative(WURZEL, datei);
    const text = fs.readFileSync(datei, 'utf8');
    for (const m of text.matchAll(/href="([^"]*#\/[^"]*)"/g)) rot.push(`H2 ${rel}:${zeile(text, m.index)} href="${m[1]}"`);
    for (const m of text.matchAll(OHNE_STRICH_DIST)) rot.push(`H3 ${rel}:${zeile(text, m.index)} ${m[0]}… ohne Schrägstrich am Ende`);
  }
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.slice(0, 60).join('\n  ')}${rot.length > 60 ? `\n  … und ${rot.length - 60} weitere` : ''}`);
  process.exit(1);
}
console.log(`GRUEN H1-H3: ${quellen.length} Quelldateien${NUR_QUELLEN ? '' : ` und ${seiten} gebaute Seiten`} ohne Link auf "#/", jeder Link auf eine Seite der App mit Schrägstrich`);
