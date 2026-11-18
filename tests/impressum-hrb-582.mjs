#!/usr/bin/env node
// ===========================================================================
// #582 (spoonup) -- Impressum nennt den Registereintrag der Plinyoo UG.
// Ohne Browser, ohne Netz.
//
//   node tests/impressum-hrb-582.mjs
//   IMPRESSUM_WURZEL=<anderer Stand> node tests/impressum-hrb-582.mjs   (Gegenprobe ohne Fix)
//   IMPRESSUM_PAKET=<plinyoo> node <kopie>/impressum-hrb-582.mjs        (Kopie ausserhalb des Repos)
//
// Quelle der Angaben: Vault 5-projekte/003-plinyoo/Stammdaten Plinyoo UG.md
// (Plinyoo UG (haftungsbeschränkt), Theodor-Fliedner-Str. 1d, 34121 Kassel,
// Amtsgericht Kassel, HRB 20918). Heiko, E-463 (18.11.2026): die USt-IdNr.
// wird nirgends erwaehnt, auch nicht als Platzhalter.
//
// R  ImpressumPage (src/pages/Impressum/ImpressumPage.tsx) per esbuild
//    gebuendelt und mit renderToStaticMarkup gerendert; gelesen wird der
//    Text der Seite, nicht die Quelldatei:
//    - "HRB 20918" und "Amtsgericht Kassel" stehen da,
//    - Firma "Plinyoo UG (haftungsbeschränkt)" ohne "i. Gr.",
//    - kein "nach Eintragung", kein "USt".
// F  Kein "i. Gr." hinter dem Firmennamen in einer Sprachdatei
//    (public/locales/*/translation.json; Datenschutz und Urheberrecht nennen
//    die Firma dort).
//
// Gefahren am 18.11.2026 (Umsetzer, #582), node 22.23.4, esbuild 0.27.2:
//   fix/impressum-hrb (68a79f6 + diese Datei): GRUEN R, GRUEN F, Exit 0.
//   Gegenprobe origin/main 71a6b41 (ImpressumPage.tsx und die sieben
//   translation.json per git show, cmp-gleich mit 71a6b41), abgelegt unter
//   node_modules/.cache/gegenprobe-582: ROT R (HRB, Firma, "i. Gr.",
//   "nach Eintragung", "USt"), ROT F (de 4x, en/es/fr/pl/pt/uk je 2x), Exit 1.
// Der alte Stand muss INNERHALB dieses Repos liegen: ausserhalb findet esbuild
// fuer die Seite ein fremdes React (zweites React, "Objects are not valid as
// a React child") und die Pruefung meldet nicht messbar.
// Exit 0 gruen, 1 rot, 2 nicht messbar.
// ===========================================================================

import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
// IMPRESSUM_PAKET: Ordner mit package.json und node_modules (Vorgabe: dieses Repo).
const EIGEN = resolve(process.env.IMPRESSUM_PAKET || resolve(HIER, '..'));
const WURZEL = resolve(process.env.IMPRESSUM_WURZEL || EIGEN);
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

let esbuild;
try {
  esbuild = createRequire(join(EIGEN, 'package.json'))('esbuild');
} catch (e) {
  nichtMessbar(`esbuild nicht ladbar (${e.message.split('\n')[0]})`);
}
console.log(`Stand: ${WURZEL}, esbuild ${esbuild.version}`);

const ergebnisse = [];
function pruefe(id, bedingungen) {
  const rot = bedingungen.filter(([ok]) => !ok).map(([, was]) => was);
  ergebnisse.push({ id, rot });
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${id}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
}

// --- R: die gerenderte Seite --------------------------------------------------
const seiteDatei = join(WURZEL, 'src/pages/Impressum/ImpressumPage.tsx');
if (!existsSync(seiteDatei)) nichtMessbar(`${seiteDatei} fehlt`);
const AUSGABE = join(process.env.TMPDIR || tmpdir(), `impressum-hrb-582-${process.pid}`);
mkdirSync(AUSGABE, { recursive: true });
const ziel = join(AUSGABE, 'impressum.mjs');
try {
  await esbuild.build({
    stdin: {
      contents: [
        "import React from 'react';",
        "import { renderToStaticMarkup } from 'react-dom/server';",
        "import { MemoryRouter } from 'react-router-dom';",
        `import Impressum from ${JSON.stringify(seiteDatei)};`,
        'export const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Impressum)));',
      ].join('\n'),
      resolveDir: EIGEN, loader: 'tsx',
    },
    bundle: true, write: true, outfile: ziel, format: 'esm', platform: 'node', logLevel: 'silent',
    jsx: 'automatic', nodePaths: [join(EIGEN, 'node_modules')],
    // react-dom/server ist CommonJS und ruft require('stream'); im ESM-Buendel
    // gibt es kein require, ohne diese Zeile stirbt der Import vor jeder Messung.
    banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
} catch (e) {
  nichtMessbar(`Buendeln fehlgeschlagen (${e.message.split('\n')[0]})`);
}
// Ein Absturz beim Laden ist keine Messung: nicht messbar (2), nicht rot (1).
let html;
try {
  ({ html } = await import(pathToFileURL(ziel).href));
} catch (e) {
  nichtMessbar(`Rendern fehlgeschlagen (${e.message.split('\n')[0]})`);
}
const text = html.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&');
const zeilen = text.split('\n').map((z) => z.trim()).filter(Boolean);
pruefe('R gerenderte Seite', [
  [zeilen.includes('HRB 20918'), 'Zeile "HRB 20918" fehlt'],
  [text.includes('Amtsgericht Kassel'), '"Amtsgericht Kassel" fehlt'],
  [zeilen.includes('Plinyoo UG (haftungsbeschränkt)'), 'Zeile "Plinyoo UG (haftungsbeschränkt)" fehlt'],
  [!/i\.\s?Gr\./.test(text), '"i. Gr." steht noch da'],
  [!/nach Eintragung/.test(text), '"nach Eintragung" steht noch da'],
  [!/USt/.test(text), '"USt" steht noch da'],
]);

// --- F: Firmenname in den Sprachdateien ---------------------------------------
const locales = join(WURZEL, 'public/locales');
const funde = [];
for (const l of readdirSync(locales)) {
  const datei = join(locales, l, 'translation.json');
  if (!existsSync(datei)) continue;
  const n = readFileSync(datei, 'utf8').split('(haftungsbeschränkt) i. Gr.').length - 1;
  if (n) funde.push(`${l}: ${n}x "i. Gr."`);
}
pruefe('F Firmenname in Sprachdateien', funde.map((f) => [false, f]));

process.exit(ergebnisse.some((e) => e.rot.length) ? 1 : 0);
