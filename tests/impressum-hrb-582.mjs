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
//    - je eine Zeile "Registergericht: Amtsgericht Kassel" und
//      "Handelsregisternummer: HRB 20918", kein "Amtsgericht:" (Urteil
//      Sprecher, 18.11.2026; gegen 5e2c0bb rot, ausprobiert),
//    - Firma "Plinyoo UG (haftungsbeschränkt)" ohne Gruendungszusatz
//      (FIRMENZUSATZ: abgekuerzt mit/ohne Leerzeichen, "G." statt "Gr.",
//      ausgeschrieben "in Gründung"),
//    - kein "nach Eintragung", keine Umsatzsteuer in keiner Schreibweise
//      (UMSATZSTEUER).
// F  Dieselben Muster je Sprachdatei (public/locales/*/translation.json;
//    Datenschutz und Urheberrecht nennen die Firma dort), nicht nur hinter
//    "(haftungsbeschränkt)".
//
// B1/B2 der Abnahme (reviewerzwei, 18.11.2026): R kannte nur "USt", F nur
// eine Schreibweise an einer Stelle. Jedes Muster ist mit eigener Verstellung
// rot gefahren (spoonup claude/_582k/plinyoo-verstellungen.cjs).
//
// Gefahren am 18.11.2026 (Umsetzer, #582), node 22.23.4, esbuild 0.27.2:
//   fix/impressum-hrb (68a79f6 + diese Datei): GRUEN R, GRUEN F, Exit 0.
//   Gegenprobe origin/main 71a6b41 (ImpressumPage.tsx und die sieben
//   translation.json per git show, cmp-gleich mit 71a6b41), abgelegt unter
//   node_modules/.cache/gegenprobe-582: ROT R (HRB, Firma, Gruendungszusatz,
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

// Gleiche Muster wie spoonup impressum-registereintrag-582.test.tsx.
const FIRMENZUSATZ = [/\bi\.\s?Gr?\./i, /\bin\s+Gründung\b/i];
const EINTRAGUNG = /nach\s+Eintragung/i;
// Nicht /ust/i: das faende "Zustimmung". "USt" nur als eigenes Wort, die
// Kennung mit und ohne Bindestrich, das ausgeschriebene Wort, "VAT" und die
// Nummer selbst (DE + 9 Ziffern).
const UMSATZSTEUER = [/\bust\b/i, /\bust\.?\s?-?\s?id/i, /umsatzsteuer/i, /\bvat\b/i, /\bDE\s?\d{9}\b/];
const verbotene = (s) => [
  ...FIRMENZUSATZ.filter((m) => m.test(s)).map((m) => `Gruendungszusatz ${m}`),
  ...(EINTRAGUNG.test(s) ? [`${EINTRAGUNG}`] : []),
  ...UMSATZSTEUER.filter((m) => m.test(s)).map((m) => `Umsatzsteuer ${m}`),
];

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
// Text je <p>, innere Auszeichnung (<span>) entfernt: so liest man die Zeile.
const absaetze = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
  .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim());
pruefe('R gerenderte Seite', [
  [text.includes('HRB 20918'), '"HRB 20918" fehlt'],
  [text.includes('Amtsgericht Kassel'), '"Amtsgericht Kassel" fehlt'],
  // Wortlaut nach Urteil des Sprechers (spoonup claude/_582red/sprecher-urteil.md,
  // Zeile 5, FREI): je <p> Beschriftung und Wert, "Amtsgericht:" entfaellt.
  [absaetze.includes('Registergericht: Amtsgericht Kassel'), 'Zeile "Registergericht: Amtsgericht Kassel" fehlt'],
  [absaetze.includes('Handelsregisternummer: HRB 20918'), 'Zeile "Handelsregisternummer: HRB 20918" fehlt'],
  [!/Amtsgericht:/.test(text), '"Amtsgericht:" steht noch da (Wort doppelt)'],
  [zeilen.includes('Plinyoo UG (haftungsbeschränkt)'), 'Zeile "Plinyoo UG (haftungsbeschränkt)" fehlt'],
  ...verbotene(text).map((v) => [false, `steht noch da: ${v}`]),
]);

// --- F: Firmenname in den Sprachdateien ---------------------------------------
const locales = join(WURZEL, 'public/locales');
const funde = [];
for (const l of readdirSync(locales)) {
  const datei = join(locales, l, 'translation.json');
  if (!existsSync(datei)) continue;
  // Je Wert, nicht ueber die rohe Datei: so stoert kein JSON-Schluessel, und
  // jeder Fund nennt die Stelle.
  const werte = [];
  const sammle = (o, pfad) => {
    if (typeof o === 'string') werte.push([pfad, o]);
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) sammle(v, pfad ? `${pfad}.${k}` : k);
  };
  try {
    sammle(JSON.parse(readFileSync(datei, 'utf8')), '');
  } catch (e) {
    nichtMessbar(`${datei} nicht lesbar (${e.message.split('\n')[0]})`);
  }
  for (const [pfad, wert] of werte) for (const v of verbotene(wert)) funde.push(`${l} ${pfad}: ${v}`);
}
pruefe('F Firmenname in Sprachdateien', funde.map((f) => [false, f]));

process.exit(ergebnisse.some((e) => e.rot.length) ? 1 : 0);
