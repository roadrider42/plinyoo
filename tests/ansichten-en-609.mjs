#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup, Sprecher-Urteile 22.11.2026 claude/sprecher-freigaben.md:11411
// en, :11412 es/fr/pt/pl/uk) -- die Ansichten (views.items) stehen auf jeder
// Sprachseite in ihrer Sprache, es fehlt keine Folie, und die Journey-Texte
// sind da.
//
// Der Name "ansichten-en" stammt aus dem en-Pilot (dd53485). Seit dem Einbau
// es/fr/pt/pl/uk prüft die Datei jede Sprache aus SPRACHEN außer de.
//
//   node tests/ansichten-en-609.mjs                    (npm run pruefung:ansichten-en, im Bau)
//   node tests/ansichten-en-609.mjs --locales <ordner> --server <entry-server.mjs>
//
// Views.tsx baut die Folien aus views.items der Sprache: je Bild eine Folie,
// je eingebetteter Seite (src) eine. Fehlt views.items, setzt i18next die
// deutsche Liste ein (deutsche Reste). Hat die Sprache views.items, aber ohne
// src oder Bildpfade, fehlen Folien still -- die Seite sieht vollständig aus.
//
// A1  <s> views.items hat dieselben Einträge wie de: gleiche Zahl, gleiche id,
//     gleiches src, gleiche Bildpfade in gleicher Reihenfolge; jedes Textfeld
//     (tag, title, text, frameTitle, alt) ist gefüllt und nicht der deutsche
//     Wortlaut.
// A2  "/<s>/" vorgerendert: erste Folie mit Marke, Titel und Text aus <s>,
//     Bild mit Pfad aus de und Beschreibung (alt) aus <s>; kein deutscher
//     Wortlaut aus views.items; gleich viele Folienpunkte wie "/" de.
// A3  <s> journey hat die acht Schlüssel topics, topicEic, topicBorders,
//     topicLisbon, source, retrieved, toSource, bookNote; keiner gleich de,
//     außer topicEic (Eigenname "East India Company", wie die Kartentitel);
//     bookNote trägt {{titel}} und {{autor}}. Ohne J8 ownTranslation und
//     J10 bookLink (warten auf den Gestalter).
//
// Gegenprobe 22.11.2026, node 22.23.4: Sprachdateien Stand dd53485 (nur en)
// ROT für es/fr/pt/pl/uk in A1, A2 und A3; mit den Texten GRUEN. Siehe
// Commit-Nachricht für die Zahlen.
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
const JOURNEY = ['topics', 'topicEic', 'topicBorders', 'topicLisbon', 'source', 'retrieved', 'toSource', 'bookNote'];
const EIGENNAME = new Set(['topicEic']);
const rot = [];

if (!existsSync(SERVER)) { console.log(`ROT: ${SERVER} fehlt -- erst vite build --ssr`); process.exit(1); }
const { rendern, SPRACHEN } = await import(pathToFileURL(SERVER).href);
const de = lies('de');
const deItems = de.views?.items ?? [];
const punkte = (h) => (h.match(PUNKT) ?? []).length;
const deHtml = await rendern('/', 'de', de, de);
if (!deItems.length) rot.push('A1 de views.items fehlt -- nichts zu prüfen');
if (!punkte(deHtml)) rot.push('A2 "/" de: keine Folienpunkte -- Views.tsx:138 geändert? Prüfung sieht nichts');
const sprachen = [...SPRACHEN].filter((s) => s !== 'de');
if (sprachen.length < 6) rot.push(`SPRACHEN aus entry-server: ${sprachen.join(',')} -- erwartet mindestens en, es, fr, pt, pl, uk`);

for (const s of sprachen) {
  const t = lies(s);
  const items = Array.isArray(t.views?.items) ? t.views.items : null;

  // A1
  if (!items) rot.push(`A1 ${s} views.items fehlt (auf /${s}/ steht die deutsche Liste)`);
  else {
    if (items.length !== deItems.length) rot.push(`A1 ${s} views.items: ${items.length} Einträge, de ${deItems.length}`);
    deItems.forEach((d, i) => {
      const e = items[i] ?? {};
      if (e.id !== d.id) rot.push(`A1 ${s} views.items.${i}.id: „${e.id}“, de „${d.id}“`);
      if ((e.src ?? null) !== (d.src ?? null)) rot.push(`A1 ${s} views.items.${i}.src: „${e.src}“, de „${d.src}“`);
      const bild = (x) => (x.images ?? []).map((b) => b.src).join(' ');
      if (bild(e) !== bild(d)) rot.push(`A1 ${s} views.items.${i}.images: „${bild(e)}“, de „${bild(d)}“`);
      for (const f of ['tag', 'title', 'text', 'frameTitle']) {
        if (d[f] === undefined) continue;
        if (!e[f]) rot.push(`A1 ${s} views.items.${i}.${f} leer`);
        else if (e[f] === d[f]) rot.push(`A1 ${s} views.items.${i}.${f} ist der deutsche Wortlaut`);
      }
      (d.images ?? []).forEach((b, j) => {
        const a = e.images?.[j]?.alt;
        if (!a) rot.push(`A1 ${s} views.items.${i}.images.${j}.alt leer`);
        else if (a === b.alt) rot.push(`A1 ${s} views.items.${i}.images.${j}.alt ist der deutsche Wortlaut`);
      });
    });
  }

  // A2
  const html = await rendern(`/${s}/`, s, t, de);
  const erste = items?.[0];
  if (erste) {
    for (const f of ['tag', 'title', 'text']) if (erste[f] && !html.includes(esc(erste[f]))) rot.push(`A2 /${s}/: views.items.0.${f} „${erste[f]}“ steht nicht im HTML`);
    const b = erste.images?.[0];
    if (b && !html.includes(`src="${b.src}"`)) rot.push(`A2 /${s}/: Bild ${b.src} fehlt`);
    if (b?.alt && !html.includes(`alt="${esc(b.alt)}"`)) rot.push(`A2 /${s}/: Bildbeschreibung „${b.alt}“ fehlt`);
  }
  for (const [i, d] of deItems.entries()) {
    for (const f of ['title', 'text']) if (d[f] && html.includes(esc(d[f]))) rot.push(`A2 /${s}/: deutscher Wortlaut views.items.${i}.${f} „${d[f].slice(0, 50)}“`);
    for (const [j, b] of (d.images ?? []).entries()) if (html.includes(`alt="${esc(b.alt)}"`)) rot.push(`A2 /${s}/: deutsche Bildbeschreibung views.items.${i}.images.${j}.alt`);
  }
  if (punkte(html) !== punkte(deHtml)) rot.push(`A2 /${s}/: ${punkte(html)} Folienpunkte, "/" de ${punkte(deHtml)}`);

  // A3
  for (const k of JOURNEY) {
    const w = t.journey?.[k];
    if (!w) rot.push(`A3 ${s} journey.${k} fehlt`);
    else if (!EIGENNAME.has(k) && w === de.journey?.[k]) rot.push(`A3 ${s} journey.${k} ist der deutsche Wortlaut „${w}“`);
    else if (EIGENNAME.has(k) && w !== de.journey?.[k]) rot.push(`A3 ${s} journey.${k} „${w}“, Eigenname de „${de.journey?.[k]}“`);
  }
  const bn = t.journey?.bookNote ?? '';
  if (bn && !(bn.includes('{{titel}}') && bn.includes('{{autor}}'))) rot.push(`A3 ${s} journey.bookNote ohne {{titel}} oder {{autor}}`);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exitCode = 1;
} else {
  console.log(`GRUEN A1-A3: ${sprachen.join(', ')} zeigen die Ansichten in ihrer Sprache, je ${punkte(deHtml)} Folien wie "/" de; Journey-Texte vollständig`);
}
