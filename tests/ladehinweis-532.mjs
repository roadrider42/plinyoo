// tests/ladehinweis-532.mjs — spoonup#532 „Startseite plinyoo: kein leerer Bildschirm beim Laden“.
// Aufruf: node tests/ladehinweis-532.mjs   (npm run pruefung:ladehinweis; läuft im Bau mit)
//
// Der Befund: main.tsx setzte beim Start html.loading, index.html und src/index.css machten den
// body darunter unsichtbar (opacity: 0), und erst AppWithLoading nahm die Klasse wieder weg. Die
// Startseite braucht aber ihre Übersetzung (i18next mit useSuspense, /locales/<sprache>/translation.json)
// — solange die nicht da ist, rendert React den Suspense-Rückfall „Lade Inhalte...“, und genau den
// sah niemand: Er stand im DOM, der body darüber hatte Deckkraft 0. Bei langsamer Leitung blieb
// die Seite weiß, bis die Datei ankam.
//
// Was die Prüfung tut, und warum so:
//   - Sie baut das ECHTE src/main.tsx mit esbuild. Nur zwei Dinge werden ersetzt: CSS-Importe (der
//     Stil kommt unten echt dazu) und ./routes/AppRoutes — statt aller Seiten eine einzige Route,
//     die wie die Startseite useTranslation() ruft. Die i18n-Einrichtung (src/lib/i18n.ts) ist echt.
//   - Sie lädt die ECHTE index.html in jsdom (ohne ihre Skripte) und hängt das ECHTE src/index.css
//     an, übersetzt mit dem Tailwind/PostCSS des Projekts — beide Stellen trugen die Regel.
//   - fetch hält jede translation.json zurück, bis die Prüfung sie freigibt. Gemessen wird in der
//     Wartezeit: Der Ladehinweis muss im DOM stehen UND der body sichtbar sein (berechnete opacity,
//     visibility, display). Danach Freigabe, und die Seite selbst muss erscheinen — sonst wäre auch
//     ein Fix grün, der den Hinweis für immer stehen lässt.
//
// Gegenprobe: Mit main.tsx, index.html und src/index.css von origin/main (ced64de) ist die Prüfung
// rot (body opacity 0 während des Ladens), mit dem Fix grün. Ausgang 1 bei jedem Befund.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Seit spoonup#548 spricht der Ladehinweis die Browsersprache; jsdom meldet en-US. Die Sprachen
// selbst prüft tests/ladehinweis-sprachen-548.mjs.
const HINWEIS = 'Loading content...';
const SEITENTEXT = 'STARTSEITE-GELADEN';

const befunde = [];
const befund = (s) => befunde.push(s);

// 1. src/main.tsx bündeln, mit den zwei Ersetzungen.
const ersatz = {
  name: 'ersatz-532',
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
        const Start = () => { const { t } = useTranslation(); return <h1>{t('probe532')}</h1>; };
        export const router = createMemoryRouter([{ path: '/', element: <Start /> }]);
      `,
    }));
  },
};
const buendel = await build({
  entryPoints: [path.join(WURZEL, 'src/main.tsx')],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [ersatz],
  logLevel: 'silent',
});
const code = buendel.outputFiles[0].text;

// 2. src/index.css so übersetzen, wie Vite es tut (Tailwind + Autoprefixer aus postcss.config.js).
const cssQuelle = fs.readFileSync(path.join(WURZEL, 'src/index.css'), 'utf8');
const css = (await postcss([tailwindcss({ config: path.join(WURZEL, 'tailwind.config.js') })])
  .process(cssQuelle, { from: path.join(WURZEL, 'src/index.css') })).css;

// 3. Echte index.html ohne ihre Skripte, dazu das übersetzte CSS.
const html = fs.readFileSync(path.join(WURZEL, 'index.html'), 'utf8')
  .replace(/<script\b[\s\S]*?<\/script>/g, '')
  .replace(/<meta http-equiv="Content-Security-Policy"[\s\S]*?>/, '');
const cssFehler = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => cssFehler.push(String(e.message || e)));
vc.on('error', (e) => cssFehler.push(String(e)));
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://www.plinyoo.com/', virtualConsole: vc });
const { window } = dom;
const { document } = window;
const stil = document.createElement('style');
stil.textContent = css;
document.head.appendChild(stil);
if (document.styleSheets.length < 2 || [...document.styleSheets].some((s) => s.cssRules.length === 0)) {
  console.error('nicht messbar: ein Stylesheet wurde nicht gelesen', cssFehler.slice(0, 3));
  process.exit(1);
}

// 4. fetch hält die Übersetzungen zurück.
const offen = [];
let freigegeben = false;
window.fetch = (url) => new Promise((resolve) => {
  const antworten = () => resolve({
    ok: true, status: 200, statusText: 'OK',
    text: async () => JSON.stringify({ probe532: SEITENTEXT }),
    json: async () => ({ probe532: SEITENTEXT }),
  });
  if (freigegeben) antworten(); else offen.push({ url: String(url), antworten });
});

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const sichtbar = () => {
  const s = window.getComputedStyle(document.body);
  return { opacity: s.opacity, visibility: s.visibility, display: s.display,
    ok: s.opacity !== '0' && s.visibility !== 'hidden' && s.display !== 'none' };
};

window.eval(code);
await warte(300);

// Während des Ladens
const textLaden = document.getElementById('root').textContent;
const stLaden = sichtbar();
if (offen.length === 0) befund('nicht messbar: es wurde keine translation.json angefragt');
if (!textLaden.includes(HINWEIS)) befund(`während des Ladens steht kein Ladehinweis im #root (Text: "${textLaden.slice(0, 80)}")`);
if (!stLaden.ok) befund(`während des Ladens ist der body unsichtbar (opacity ${stLaden.opacity}, visibility ${stLaden.visibility}, display ${stLaden.display}) — der Besucher sieht eine leere Seite`);

// Nach der Freigabe
freigegeben = true;
offen.splice(0).forEach((o) => o.antworten());
await warte(300);
const textFertig = document.getElementById('root').textContent;
const stFertig = sichtbar();
if (!textFertig.includes(SEITENTEXT)) befund(`nach dem Laden erscheint die Seite nicht (Text: "${textFertig.slice(0, 80)}")`);
if (textFertig.includes(HINWEIS)) befund('nach dem Laden steht der Ladehinweis noch da');
if (!stFertig.ok) befund(`nach dem Laden ist der body unsichtbar (opacity ${stFertig.opacity})`);

if (befunde.length) {
  console.error(`ladehinweis-532: ${befunde.length} Befund(e)`);
  for (const b of befunde) console.error('  - ' + b);
  process.exit(1);
}
console.log(`ladehinweis-532: grün — während des Ladens "${HINWEIS}" sichtbar (opacity ${stLaden.opacity}), danach die Seite`);
process.exit(0);
