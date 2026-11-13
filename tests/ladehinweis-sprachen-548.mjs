#!/usr/bin/env node
// tests/ladehinweis-sprachen-548.mjs — spoonup#548 „Startseite plinyoo: Ladehinweis in der Sprache
// des Besuchers“.
// Aufruf: node tests/ladehinweis-sprachen-548.mjs   (npm run pruefung:ladehinweis-sprachen; läuft im Bau mit)
//         LADE_WURZEL=<anderer Stand> node tests/ladehinweis-sprachen-548.mjs   (Gegenprobe ohne Fix)
//
// Der Befund: src/main.tsx zeigte im Suspense-Rückfall fest „Lade Inhalte...“ — jedem Besucher,
// gleich welche Sprache sein Browser spricht.
//
// Wortlaut: spoonup claude/_ladehinweis-sprachen/sprecher-urteil.md @ b921d27a3 (Sprecher).
// Er steht unten ein zweites Mal, mit Absicht: Die Prüfung hält die Datei gegen das Urteil, nicht
// gegen sich selbst. Rückfall: die Rückfallsprache der Startseite (fallbackLng 'de' in
// src/lib/i18n.ts), keine eigene.
//
// Was die Prüfung tut:
//   F  Die reine Funktion ladehinweisFuer (src/lib/ladehinweis.ts, mit esbuild gebündelt) wird für
//      jede der sieben Sprachen, für Regionalformen (pt-BR, uk-UA, en-GB) und für unbekannte
//      Sprachen (it, leer) gerufen.
//   A  Angezeigt: das ECHTE src/main.tsx wird gebündelt (CSS leer, ./routes/AppRoutes durch eine
//      Route ersetzt, die wie die Startseite useTranslation() ruft; i18n.ts echt) und in der
//      ECHTEN index.html in jsdom gestartet — je Fall ein frisches Fenster mit gesetzter
//      Browsersprache (navigator.languages). fetch hält jede translation.json zurück; in der
//      Wartezeit muss im #root genau der Satz der Sprache stehen. Danach Freigabe, und die Seite
//      muss erscheinen.
//      Dazu Fälle, in denen die gewünschte Sprache NICHT vorn in navigator.languages steht
//      (Review #548 B1): zweite Vorliebe ['it-IT','it','uk'] -> uk, Cookie i18next=fr bei Browser
//      de -> fr, localStorage es bei Browser de -> es. Ohne sie bliebe die Prüfung grün, wenn der
//      Hinweis nur die erste Vorliebe nimmt, sie roh übernimmt statt über getBestMatchFromCodes,
//      oder navigator.language statt der Erkennung von i18next fragt.
//
// Gegenprobe: mit dem Stand von origin/main (367545c) ist die Prüfung rot — F nicht ladbar,
// A in allen Fällen „Lade Inhalte...“. Ausgang 0 grün, 1 rot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

const HIER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WURZEL = process.env.LADE_WURZEL ? path.resolve(process.env.LADE_WURZEL) : HIER;
const SEITENTEXT = 'STARTSEITE-GELADEN';

// Urteil des Sprechers, zeichengleich.
const URTEIL = {
  de: 'Einen Moment...',
  en: 'Loading content...',
  es: 'Cargando contenido...',
  fr: 'Chargement en cours...',
  pl: 'Wczytywanie zawartości...',
  pt: 'Carregando conteúdo...',
  uk: 'Завантаження вмісту...',
};
const RUECKFALL = 'de';

// Fall: Browsersprachen -> erwarteter Satz
const FAELLE = [
  { name: 'de', sprachen: ['de-DE', 'de'], soll: URTEIL.de },
  { name: 'en', sprachen: ['en-US', 'en'], soll: URTEIL.en },
  { name: 'es', sprachen: ['es-ES', 'es'], soll: URTEIL.es },
  { name: 'fr', sprachen: ['fr-FR', 'fr'], soll: URTEIL.fr },
  { name: 'pl', sprachen: ['pl-PL', 'pl'], soll: URTEIL.pl },
  { name: 'pt', sprachen: ['pt-BR', 'pt'], soll: URTEIL.pt },
  { name: 'uk', sprachen: ['uk-UA', 'uk'], soll: URTEIL.uk },
  { name: 'Rückfall (it)', sprachen: ['it-IT', 'it'], soll: URTEIL[RUECKFALL] },
  // Gewünschte Sprache nicht vorn (Review #548 B1, Vorlage probe-548 P03, P04, P05).
  { name: 'it, it, uk', sprachen: ['it-IT', 'it', 'uk'], soll: URTEIL.uk },
  { name: 'Cookie fr', sprachen: ['de-DE', 'de'], cookie: 'i18next=fr', soll: URTEIL.fr },
  { name: 'Speicher es', sprachen: ['de-DE'], speicher: 'es', soll: URTEIL.es },
];

const befunde = [];
const zeilen = [];
const befund = (s) => befunde.push(s);

// --- F: reine Funktion -------------------------------------------------------------------------
const FUNKTION = [
  ...Object.entries(URTEIL).map(([s, t]) => [s, t]),
  ['pt-BR', URTEIL.pt], ['uk-UA', URTEIL.uk], ['en-GB', URTEIL.en], ['PL', URTEIL.pl],
  ['it', URTEIL[RUECKFALL]], ['', URTEIL[RUECKFALL]], [undefined, URTEIL[RUECKFALL]],
];
let ladehinweisFuer = null;
try {
  const b = await build({
    entryPoints: [path.join(WURZEL, 'src/lib/ladehinweis.ts')],
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
  });
  const datei = path.join(fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'lade548-')), 'f.mjs');
  fs.writeFileSync(datei, b.outputFiles[0].text);
  ({ ladehinweisFuer } = await import(datei));
} catch (e) {
  befund(`F: src/lib/ladehinweis.ts nicht ladbar (${String(e.message || e).split('\n')[0]})`);
}
if (ladehinweisFuer) {
  for (const [ein, soll] of FUNKTION) {
    const ist = ladehinweisFuer(ein);
    const ok = ist === soll;
    zeilen.push(`F ${ok ? 'grün' : 'ROT '} ladehinweisFuer(${JSON.stringify(ein)}) = ${JSON.stringify(ist)}`);
    if (!ok) befund(`F: ladehinweisFuer(${JSON.stringify(ein)}) = ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`);
  }
}

// --- A: angezeigter Text im echten main.tsx ---------------------------------------------------
const ersatz = {
  name: 'ersatz-548',
  setup(b) {
    b.onResolve({ filter: /\.css$/ }, (a) => ({ path: a.path, namespace: 'leer' }));
    b.onLoad({ filter: /.*/, namespace: 'leer' }, () => ({ contents: '', loader: 'js' }));
    b.onResolve({ filter: /^\.\/routes\/AppRoutes$/ }, () => ({ path: 'AppRoutes', namespace: 'route' }));
    b.onLoad({ filter: /.*/, namespace: 'route' }, () => ({
      resolveDir: path.join(WURZEL, 'src'),
      loader: 'tsx',
      contents: `
        import React from 'react';
        import { createMemoryRouter } from 'react-router-dom';
        import { useTranslation } from 'react-i18next';
        const Start = () => { const { t } = useTranslation(); return <h1>{t('probe548')}</h1>; };
        export const router = createMemoryRouter([{ path: '/', element: <Start /> }]);
      `,
    }));
  },
};
const code = (await build({
  entryPoints: [path.join(WURZEL, 'src/main.tsx')],
  bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [ersatz], logLevel: 'silent',
})).outputFiles[0].text;

const html = fs.readFileSync(path.join(WURZEL, 'index.html'), 'utf8')
  .replace(/<script\b[\s\S]*?<\/script>/g, '')
  .replace(/<meta http-equiv="Content-Security-Policy"[\s\S]*?>/, '');
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

for (const fall of FAELLE) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'https://www.plinyoo.com/', virtualConsole: new VirtualConsole() });
  const { window } = dom;
  Object.defineProperty(window.navigator, 'languages', { get: () => fall.sprachen });
  Object.defineProperty(window.navigator, 'language', { get: () => fall.sprachen[0] });
  if (fall.cookie) window.document.cookie = fall.cookie;
  if (fall.speicher) window.localStorage.setItem('i18nextLng', fall.speicher);
  const offen = [];
  let frei = false;
  window.fetch = (url) => new Promise((resolve) => {
    const antworten = () => resolve({ ok: true, status: 200, statusText: 'OK',
      text: async () => JSON.stringify({ probe548: SEITENTEXT }),
      json: async () => ({ probe548: SEITENTEXT }) });
    if (frei) antworten(); else offen.push({ url: String(url), antworten });
  });
  window.eval(code);
  await warte(300);
  const root = window.document.getElementById('root');
  const laden = root.textContent.trim();
  const angefragt = offen.map((o) => o.url).join(', ');
  frei = true;
  offen.splice(0).forEach((o) => o.antworten());
  await warte(300);
  const fertig = root.textContent.trim();
  const ok = laden === fall.soll && fertig.includes(SEITENTEXT) && !fertig.includes(fall.soll);
  const extra = (fall.cookie ? ` cookie=${fall.cookie}` : '') + (fall.speicher ? ` localStorage=${fall.speicher}` : '');
  zeilen.push(`A ${ok ? 'grün' : 'ROT '} ${fall.name.padEnd(13)} navigator.languages=${JSON.stringify(fall.sprachen)}${extra} -> beim Laden ${JSON.stringify(laden)} (angefragt: ${angefragt || '—'})`);
  if (!angefragt) befund(`A ${fall.name}: nicht messbar, keine translation.json angefragt`);
  // Dieselbe Erkennung: i18next lädt als erstes die Sprache, deren Satz angezeigt wird.
  const ersteSprache = (angefragt.match(/\/locales\/([a-z]+)\//) || [])[1];
  if (ersteSprache && URTEIL[ersteSprache] !== fall.soll) befund(`A ${fall.name}: i18next lädt zuerst "${ersteSprache}", der Hinweis spricht eine andere Sprache`);
  if (laden !== fall.soll) befund(`A ${fall.name}: beim Laden steht ${JSON.stringify(laden)}, soll ${JSON.stringify(fall.soll)}`);
  if (!fertig.includes(SEITENTEXT)) befund(`A ${fall.name}: nach dem Laden erscheint die Seite nicht (${JSON.stringify(fertig.slice(0, 60))})`);
  if (fertig.includes(fall.soll)) befund(`A ${fall.name}: nach dem Laden steht der Ladehinweis noch da`);
  window.close();
}

console.log(`ladehinweis-sprachen-548 (Stand: ${WURZEL})`);
for (const z of zeilen) console.log('  ' + z);
if (befunde.length) {
  console.error(`ladehinweis-sprachen-548: ROT, ${befunde.length} Befund(e)`);
  for (const b of befunde) console.error('  - ' + b);
  process.exit(1);
}
console.log(`ladehinweis-sprachen-548: grün — ${FAELLE.length} Fälle angezeigt, ${FUNKTION.length} Funktionsaufrufe`);
process.exit(0);
