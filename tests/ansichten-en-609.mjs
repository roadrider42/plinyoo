#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup, Sprecher-Urteil 22.11.2026 claude/sprecher-freigaben.md:11411)
// -- die Ansichten ("A look inside", views.items) stehen auf /en/ englisch, und
// es fehlt keine Folie.
//
//   node tests/ansichten-en-609.mjs                    (npm run pruefung:ansichten-en, im Bau)
//   node tests/ansichten-en-609.mjs --locales <ordner> --server <entry-server.mjs>
//
// Views.tsx baut die Folien aus views.items der Sprache: je Bild eine Folie,
// je eingebetteter Seite (src) eine. Fehlt views.items, setzt i18next die
// deutsche Liste ein (deutsche Reste). Hat die Sprache views.items, aber ohne
// src oder Bildpfade, fehlen Folien still -- die Seite sieht vollständig aus.
//
// A1  en views.items hat dieselben Einträge wie de: gleiche Zahl, gleiche id,
//     gleiches src, gleiche Bildpfade in gleicher Reihenfolge.
// A2  "/en/" vorgerendert: erste Folie mit Marke, Titel und Text aus en, Bild
//     mit Pfad aus de und Beschreibung (alt) aus en; kein deutscher Wortlaut
//     aus views.items; gleich viele Folienpunkte wie "/" de.
//
// Gegenprobe 22.11.2026, node 22.23.4: Sprachdateien ohne en views.items
// (Stand 571c2ac) ROT A1 und A2; en views.items ohne src ROT A1 und A2
// (3 statt 5 Folien). Mit den Texten GRUEN.
// Exit 0 grün, 1 rot.
// ===========================================================================
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, v) => { const i = process.argv.indexOf(n); return i > 0 ? path.resolve(process.argv[i + 1] ?? '') : v; };
const LOCALES = arg('--locales', path.join(WURZEL, 'public/locales'));
const SERVER = arg('--server', path.join(WURZEL, 'dist-server/entry-server.mjs'));
const lies = (s) => JSON.parse(readFileSync(path.join(LOCALES, s, 'translation.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PUNKT = /rounded-full transition-all/g; // Folienpunkte, Views.tsx:138
const rot = [];

if (!existsSync(SERVER)) { console.log(`ROT: ${SERVER} fehlt -- erst vite build --ssr`); process.exit(1); }
const { rendern } = await import(pathToFileURL(SERVER).href);
const de = lies('de');
const en = lies('en');
const deItems = de.views?.items ?? [];
const enItems = Array.isArray(en.views?.items) ? en.views.items : null;

// A1
if (!deItems.length) rot.push('A1 de views.items fehlt -- nichts zu prüfen');
else if (!enItems) rot.push('A1 en views.items fehlt (auf /en/ steht die deutsche Liste)');
else {
  if (enItems.length !== deItems.length) rot.push(`A1 en views.items: ${enItems.length} Einträge, de ${deItems.length}`);
  deItems.forEach((d, i) => {
    const e = enItems[i] ?? {};
    if (e.id !== d.id) rot.push(`A1 views.items.${i}.id: en „${e.id}“, de „${d.id}“`);
    if ((e.src ?? null) !== (d.src ?? null)) rot.push(`A1 views.items.${i}.src: en „${e.src}“, de „${d.src}“`);
    const bild = (x) => (x.images ?? []).map((b) => b.src).join(' ');
    if (bild(e) !== bild(d)) rot.push(`A1 views.items.${i}.images: en „${bild(e)}“, de „${bild(d)}“`);
  });
}

// A2
const deHtml = await rendern('/', 'de', de, de);
const html = await rendern('/en/', 'en', en, de);
const erste = enItems?.[0];
if (erste) {
  for (const feld of ['tag', 'title', 'text']) if (!html.includes(esc(erste[feld]))) rot.push(`A2 /en/: views.items.0.${feld} „${erste[feld]}“ steht nicht im HTML`);
  const b = erste.images?.[0];
  if (b && !html.includes(`src="${b.src}"`)) rot.push(`A2 /en/: Bild ${b.src} fehlt`);
  if (b && !html.includes(`alt="${esc(b.alt)}"`)) rot.push(`A2 /en/: Bildbeschreibung „${b.alt}“ fehlt`);
}
for (const [i, d] of deItems.entries()) {
  for (const feld of ['title', 'text']) if (d[feld] && html.includes(esc(d[feld]))) rot.push(`A2 /en/: deutscher Wortlaut views.items.${i}.${feld} „${d[feld].slice(0, 50)}“`);
  for (const [j, b] of (d.images ?? []).entries()) if (html.includes(`alt="${esc(b.alt)}"`)) rot.push(`A2 /en/: deutsche Bildbeschreibung views.items.${i}.images.${j}.alt`);
}
const punkte = (h) => (h.match(PUNKT) ?? []).length;
if (punkte(html) !== punkte(deHtml)) rot.push(`A2 /en/: ${punkte(html)} Folienpunkte, "/" de ${punkte(deHtml)}`);
if (!punkte(deHtml)) rot.push('A2 "/" de: keine Folienpunkte -- Views.tsx:138 geändert? Prüfung sieht nichts');

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log(`GRUEN A1-A2: /en/ zeigt die Ansichten englisch, ${punkte(html)} Folien wie auf "/" de`);
}
