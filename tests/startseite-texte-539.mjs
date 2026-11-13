// tests/startseite-texte-539.mjs — spoonup#539 „Startseite sagt, was die App kann“.
// Aufruf: node tests/startseite-texte-539.mjs   (npm run pruefung:startseite-texte; läuft im Bau mit)
//
// Hält fest, dass jeder Schlüssel, den #539 geändert oder neu angelegt hat, in allen sieben Sprachen
// (public/locales/<sprache>/translation.json) als nicht leerer Text steht. Fehlt er in einer Sprache,
// setzt Examples.tsx bzw. i18next still den deutschen Rückfall ein, und die englische Seite zeigt
// eine deutsche Überschrift — genau so stand es vor #539 bei examples.books_title und books_intro.
//
// Dazu zwei Prüfungen, die mehr sagen als „vorhanden“:
//   1. examples.books_title und books_intro sind außerhalb von de nicht der deutsche Wortlaut
//      (eine Kopie des Rückfalls wäre „vorhanden“ und trotzdem falsch).
//   2. faq.items[2].a nennt in es, fr, pl, pt, uk den Bereich „Erstellen“ und nicht „Create“.
//      Gemessen am 13.11.2026 in der App (spoonup origin/main d026a1031): die untere Leiste setzt
//      label 'Erstellen' aus dom.dashboard.types.ts:190,200 ohne Übersetzung ein
//      (ui-UntereLeiste.tsx:339), also in jeder Sprache. Ändert die App das, ändert sich dieser Satz.
//
// Ausgang 1 bei jedem Befund. Ein Schlüssel, der in keiner Sprache steht, ist ebenfalls ein Befund.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPRACHEN = ['de', 'en', 'es', 'fr', 'pl', 'pt', 'uk'];

// Jeder Schlüssel, den #539 angefasst hat (Urteil 2c335cf93, Du-Angleichung 1a196a8ef / 5855dcc64).
const SCHLUESSEL = [
  'outcomes.items[0].kpi',
  'outcomes.items[0].label',
  'howItWorks.steps[0].description',
  'pillars.items[0].desc',
  'pillars.items[3].desc',
  'faq.items[2].a',
  'faq.items[3].a',
  'examples.books_title',
  'examples.books_intro',
  'examples.your-use-case.title',
  'examples.your-use-case.subtitle',
  'examples.your-use-case.desc',
  'examples.your-use-case.button',
  'forms.validation.success_message',
  'forms.success.message',
  'forms.privacy_notice',
  'forms.use_case.title',
  'forms.use_case.subtitle',
  'forms.use_case.message_placeholder',
  'forms.join.title',
  'forms.join.availability_placeholder',
  'forms.join.motivation_label',
  'forms.invest.investment_range_placeholder',
  'forms.access.origin_note',
  'copyright.kontakt.text',
];

function holen(obj, schluessel) {
  let d = obj;
  for (const t of schluessel.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (d === null || typeof d !== 'object' || !(t in d)) return undefined;
    d = d[t];
  }
  return d;
}

const befunde = [];
const daten = {};
for (const l of SPRACHEN) {
  const datei = path.join(WURZEL, 'public/locales', l, 'translation.json');
  daten[l] = JSON.parse(fs.readFileSync(datei, 'utf8'));
}

let geprueft = 0;
for (const s of SCHLUESSEL) {
  for (const l of SPRACHEN) {
    const w = holen(daten[l], s);
    geprueft++;
    if (typeof w !== 'string' || w.trim() === '') {
      befunde.push(`${l}: ${s} fehlt oder ist leer (${JSON.stringify(w)})`);
    }
  }
}

for (const s of ['examples.books_title', 'examples.books_intro']) {
  const de = holen(daten.de, s);
  for (const l of SPRACHEN.filter((x) => x !== 'de')) {
    if (typeof de === 'string' && holen(daten[l], s) === de) {
      befunde.push(`${l}: ${s} ist der deutsche Wortlaut, keine Übersetzung`);
    }
  }
}

for (const l of ['es', 'fr', 'pl', 'pt', 'uk']) {
  const a = holen(daten[l], 'faq.items[2].a');
  if (typeof a !== 'string' || !a.includes('Erstellen') || a.includes('Create')) {
    befunde.push(`${l}: faq.items[2].a nennt nicht den Bereichsnamen der App „Erstellen“ (oder zusätzlich „Create“)`);
  }
}

if (befunde.length) {
  console.error(`pruefung:startseite-texte ROT, ${befunde.length} Befund(e):`);
  for (const b of befunde) console.error('  - ' + b);
  process.exit(1);
}
console.log(`pruefung:startseite-texte grün: ${SCHLUESSEL.length} Schlüssel × ${SPRACHEN.length} Sprachen = ${geprueft} Texte vorhanden.`);
