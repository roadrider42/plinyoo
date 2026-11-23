#!/usr/bin/env node
// ===========================================================================
// #609 V2 (spoonup, Gestalter 22.11.2026; Nachtrag B1 aus der Abnahme des
// Reviewers) -- der Satz "Wir melden uns persönlich bei dir." (cta.hinweis,
// Bedingung des Sprechers für "Ich will dabei sein", #503) steht auf jeder
// Sprachseite an den zwei Stellen, die V2 festlegt:
//
//   node tests/zugang-hinweis-609.mjs                  liest dist/
//   node tests/zugang-hinweis-609.mjs --dist <ordner>  liest einen anderen Bauordner
//
// Gelesen wird das VORGERENDERTE HTML (scripts/vorrendern.mjs), nicht
// Roles.tsx -- gemessen wird, was ausgeliefert wird. Sprachseiten: dist/index.html
// (de) und dist/<sprache>/index.html für jeden Ordner unter public/locales außer de.
// Ohne Bau keine Datei, also rot.
//
// Z1  Unter 768 px je Rollenkarte: Für jede der drei Rollen (learner, curator,
//     wegbereiter) steht genau ein Link auf /zugang/?rolle=<rolle>, und
//     DIREKT nach seinem </a> folgt <p data-ziel="zugang-hinweis"> mit der
//     Klasse md:hidden (und ohne md:block) und mit Text.
// Z2  Ab 768 px einmal unter dem Raster: genau ein <p data-ziel="zugang-hinweis">
//     mit den Klassen hidden und md:block, und er steht hinter der letzten
//     Rollenkarte (nach dem letzten Link /zugang/?rolle=…), mit Text.
//
// Andere Hinweise auf der Seite (ohne md:hidden / md:block, z. B. im Kopf der
// Seite) zählen nicht -- sie gehören nicht zu den Rollenkarten.
//
// Beide Richtungen, 22.11.2026, node 22.23.4, je voller Bau (npm run build):
//   - Roles.tsx Z. 49 ohne md:hidden: ROT Z1, 7 Sprachen x 3 Rollen.
//   - Roles.tsx Z. 64 ohne hidden md:block: ROT Z2, 7 Sprachen.
//   - mit V2 (89facf9): GRUEN.
//   Ausgabe im Ergebnis der Aufgabe (#609, B1).
// Exit 0 grün, 1 rot.
// ===========================================================================

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROLLEN = ['learner', 'curator', 'wegbereiter'];

const distArg = process.argv.indexOf('--dist');
const dist = distArg > 0 ? resolve(process.argv[distArg + 1] ?? '') : join(WURZEL, 'dist');

const sprachen = readdirSync(join(WURZEL, 'public', 'locales'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();
if (!sprachen.includes('de')) sprachen.unshift('de');

const HINWEIS = /<p data-ziel="zugang-hinweis" class="([^"]*)">([^<]*)<\/p>/g;
const klassen = (s) => s.split(/\s+/).filter(Boolean);

const rot = [];
const gruen = [];
for (const sprache of sprachen) {
  const rel = sprache === 'de' ? 'index.html' : join(sprache, 'index.html');
  const datei = join(dist, rel);
  if (!existsSync(datei)) { rot.push(`${rel} fehlt -- ohne Bau keine Sprachseite`); continue; }
  const html = readFileSync(datei, 'utf8');

  // Z1
  let letzterLink = -1;
  for (const rolle of ROLLEN) {
    const links = [...html.matchAll(new RegExp(`<a [^>]*href="[^"]*/zugang/\\?rolle=${rolle}"[^>]*>.*?</a>`, 'g'))];
    if (links.length !== 1) { rot.push(`Z1 ${rel} ${rolle}: ${links.length} Links auf /zugang/?rolle=${rolle}, erwartet 1`); continue; }
    const ende = links[0].index + links[0][0].length;
    letzterLink = Math.max(letzterLink, ende);
    const m = new RegExp(HINWEIS.source, 'y');
    m.lastIndex = ende;
    const h = m.exec(html);
    if (!h) { rot.push(`Z1 ${rel} ${rolle}: nach dem Link steht kein Hinweis, sondern ${JSON.stringify(html.slice(ende, ende + 80))}`); continue; }
    const k = klassen(h[1]);
    if (!k.includes('md:hidden') || k.includes('md:block')) rot.push(`Z1 ${rel} ${rolle}: Hinweis nach dem Link hat Klassen "${h[1]}", erwartet md:hidden ohne md:block`);
    else if (!h[2].trim()) rot.push(`Z1 ${rel} ${rolle}: Hinweis nach dem Link ist leer`);
  }

  // Z2
  const unterRaster = [...html.matchAll(HINWEIS)].filter((h) => {
    const k = klassen(h[1]);
    return k.includes('hidden') && k.includes('md:block');
  });
  if (unterRaster.length !== 1) rot.push(`Z2 ${rel}: ${unterRaster.length} Hinweise mit "hidden md:block", erwartet 1`);
  else if (letzterLink >= 0 && unterRaster[0].index < letzterLink) rot.push(`Z2 ${rel}: Hinweis "hidden md:block" steht vor der letzten Rollenkarte`);
  else if (!unterRaster[0][2].trim()) rot.push(`Z2 ${rel}: Hinweis "hidden md:block" ist leer`);

  if (!rot.some((r) => r.includes(` ${rel}`))) gruen.push(sprache);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log(`GRUEN Z1-Z2: ${gruen.join(', ')} -- je Rollenkarte ein Hinweis md:hidden direkt nach dem Link, einmal hidden md:block unter dem Raster (${dist})`);
}
