#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup), SEO-Vorschlag 1 (Heiko frei auf E-520, Wortlaut Sprecher
// FREI, spoonup claude/sprecher-freigaben.md, Eintrag 21.11.2026 "Titel
// Startseite") -- der gebaute Kopf der Startseite trägt den neuen Titel.
//
//   node tests/titel-609.mjs                  liest dist/index.html und dist/404.html
//   node tests/titel-609.mjs --dist <ordner>  liest einen anderen Bauordner
//
// Gelesen wird der GEBAUTE Kopf, nicht index.html: dort stehen nur die
// Platzhalter {{seo.start.*}}, eingesetzt von vite.config.ts aus
// public/locales/de/translation.json (scripts/seo-kopf.mjs). Ohne Bau keine
// Datei, also rot.
//
// T1  <title>, og:title und twitter:title sind genau der freigegebene Wortlaut.
//     Er steht hier ausgeschrieben, nicht aus translation.json gelesen --
//     sonst verglich die Prüfung die Quelle mit sich selbst.
// T2  description beginnt mit "Dein Lernpfad ist einzigartig." -- der Satz
//     "plinyoo - intelligente persönliche digitale Lernplattformen." ist weg.
// T3  Kein Platzhalter {{...}} steht mehr im Kopf.
// Beides für index.html und 404.html (Kopie, cp im Bau); eine fehlende
// 404.html ist nur dann kein Befund, wenn --dist ohne Bauschritt cp gelesen wird.
//
// Gegenprobe 21.11.2026, node 22.23.4, vite build in einen Ordner außerhalb
// von dist/: mit index.html von origin/main 1436e52 ROT T1 (3x
// "plinyoo | Intelligente ..." bzw. "plinyoo") und T2, Exit 1; mit dem Fix
// GRUEN, Exit 0. Fehlender Ordner: ROT, Exit 1.
// Exit 0 grün, 1 rot.
// ===========================================================================

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TITEL = 'plinyoo: Lernplattform für Wissen, Teams und eigene Wege';
const BESCHREIBUNG_ANFANG = 'Dein Lernpfad ist einzigartig.';

const distArg = process.argv.indexOf('--dist');
const dist = distArg > 0 ? resolve(process.argv[distArg + 1] ?? '') : join(WURZEL, 'dist');

const ent = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (html, attr, name) => {
  const tags = [...html.matchAll(new RegExp(`<meta\\s+${attr}="${name.replace('.', '\\.')}"\\s+content="([^"]*)"`, 'g'))];
  return tags.map((m) => ent(m[1]));
};

const rot = [];
const dateien = ['index.html', '404.html'].filter((f) => f === 'index.html' || distArg < 0 || existsSync(join(dist, f)));
for (const f of dateien) {
  const datei = join(dist, f);
  if (!existsSync(datei)) { rot.push(`${datei} fehlt -- ohne Bau kein Kopf`); continue; }
  const html = readFileSync(datei, 'utf8');
  const kopf = html.split('</head>')[0];

  const titel = [...kopf.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => ent(m[1]));
  if (titel.length !== 1 || titel[0] !== TITEL) rot.push(`T1 ${f} <title>: ${JSON.stringify(titel)}`);
  for (const [attr, name] of [['property', 'og:title'], ['name', 'twitter:title']]) {
    const w = meta(kopf, attr, name);
    if (w.length !== 1 || w[0] !== TITEL) rot.push(`T1 ${f} ${name}: ${JSON.stringify(w)}`);
  }
  const desc = meta(kopf, 'name', 'description');
  if (desc.length !== 1 || !desc[0].startsWith(BESCHREIBUNG_ANFANG)) rot.push(`T2 ${f} description: ${JSON.stringify(desc)}`);
  if (/intelligente persönliche digitale/.test(desc.join(''))) rot.push(`T2 ${f} description trägt noch den gestrichenen Satz`);
  const platz = kopf.match(/\{\{[^}]*\}\}/g);
  if (platz) rot.push(`T3 ${f} Platzhalter stehen geblieben: ${platz.join(', ')}`);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(`GRUEN T1-T3: ${dateien.join(', ')} in ${dist} tragen "${TITEL}" in title, og:title, twitter:title; description beginnt mit "${BESCHREIBUNG_ANFANG}"`);
