#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup, Heiko E-522 "A alle sieben") -- alte Hash-Adressen (/#/zugang)
// führen auf die echten (/zugang/), und KEINE Kampagnenangabe geht verloren.
//
//   node tests/alte-adressen-609.mjs                 (npm run pruefung:alte-adressen, läuft im Bau)
//   ADRESSEN_WURZEL=<anderer Stand> node tests/...   (Gegenprobe ohne Fix)
//
// U1  Die reine Funktion neueAdresse(search, hash) aus src/lib/alte-adressen.ts
//     (mit esbuild gebündelt, wie vite.config.ts sie in index.html einsetzt)
//     wird mit einer Tabelle alter Formen gefahren: die Beispiele aus dem Plan
//     (spoonup claude/609/vorrendern-plan.md, Abschnitt 2), jede Form, die
//     scripts/buchseiten.mjs und scripts/seiten.mjs bis #609 erzeugt haben,
//     jede der sieben Seiten, und die fünf Kampagnenangaben (buch,
//     utm_source, utm_medium, utm_campaign, utm_content) vor dem '#', hinter
//     dem '#' und gemischt. Je Fall: Ziel-Pfad genau, und jede Angabe der
//     alten Adresse steht mit ihrem Wert in der neuen (hinter dem '#' gewinnt,
//     wie bisher in src/lib/kampagne.ts). Nichts kommt dazu.
// U2  Was keine alte Adresse ist, bleibt: kein '#', eine Sprungmarke (#weiter)
//     -- neueAdresse gibt null.
// U4  (#609 Schritt 3, Sprachfassungen mit eigenem Pfad) "?lng=xx" auf einer
//     deutschen Adresse führt auf die Sprachfassung (/?lng=en -> /en/), ohne
//     lng, alle anderen Angaben bleiben. Impressum und Datenschutz (nur
//     deutsch), ein schon gesetzter Sprachpfad, eine unbekannte Sprache und
//     Pfade außerhalb der App bleiben. In U1 verbraucht ein Sprachpfad lng.
// U3  index.html trägt den Platzhalter <!--ALTE-ADRESSEN--> genau einmal, im
//     <head> und VOR dem Plausible-Skript (sonst zählt Plausible die alte
//     Adresse "/"), und plausible.init() ohne hashBasedRouting.
//
// Den Weg im Browser (Umleitung, Merken der Herkunft) fährt
// tests/hydration-609.mjs, Fall "alte-adresse".
//
// Gegenprobe 21.11.2026, node 22.23.4: mit dem Stand origin/main 09c8f32 ROT
// (U1 nicht ladbar, U3 kein Platzhalter, hashBasedRouting), Exit 1; mit dem
// Fix GRUEN. Mutation "Angaben hinter dem # nicht übernehmen": ROT U1 in 8
// Fällen (rolle, utm_* hinter dem #), Exit 1.
// Gegenprobe Schritt 3, 22.11.2026: mit src/lib/alte-adressen.ts, seiten.ts
// und index.html von beee666 (ADRESSEN_WURZEL) ROT, 3 Fälle U1 (lng bleibt,
// kein Sprachpfad) und 5 Fälle U4, Exit 1. Mit Schritt 3 GRUEN.
// Exit 0 grün, 1 rot.
// ===========================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const HIER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WURZEL = process.env.ADRESSEN_WURZEL ? path.resolve(process.env.ADRESSEN_WURZEL) : HIER;
const rot = [];
const zeilen = [];

// --- U1/U2 ---------------------------------------------------------------------
let neueAdresse = null;
try {
  const b = await build({ entryPoints: [path.join(WURZEL, 'src/lib/alte-adressen.ts')], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
  const datei = path.join(fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'adressen609-')), 'f.mjs');
  fs.writeFileSync(datei, b.outputFiles[0].text);
  ({ neueAdresse } = await import(pathToFileURL(datei).href));
  if (typeof neueAdresse !== 'function') throw new Error('neueAdresse ist keine Funktion');
} catch (e) {
  rot.push(`U1 src/lib/alte-adressen.ts nicht ladbar (${String(e.message || e).split('\n')[0]})`);
}

const K5 = 'buch=lissabon-1941&utm_source=linkedin&utm_medium=post&utm_campaign=herbst%202026&utm_content=bild-2';
// [name, search, hash, Ziel-Pfad, erwartete Angaben (null = aus den beiden Teilen errechnet)]
const FAELLE = [
  ['Plan: /#/zugang', '', '#/zugang', '/zugang/'],
  ['Plan: Angaben vor und hinter #', '?buch=x&utm_source=a', '#/zugang?rolle=curator', '/zugang/'],
  ['Plan: ?lng=en#/impressum (lng bleibt bis Schritt 3)', '?lng=en', '#/impressum', '/impressum/'],
  ['Plan: ?lng=en#/zugang (Schritt 3: Sprachpfad)', '?lng=en', '#/zugang', '/en/zugang/'],
  ['Plan: /#/unbekannt', '', '#/unbekannt', '/'],
  ['/#/ allein', '', '#/', '/'],
  ['Schrägstrich hinter dem #', '', '#/zugang/', '/zugang/'],
  ['fünf Angaben vor #', `?${K5}`, '#/zugang?rolle=curator', '/zugang/'],
  ['fünf Angaben hinter #', '', `#/zugang?${K5}`, '/zugang/'],
  ['gemischt, doppelter Name: hinter # gewinnt', '?buch=a&utm_source=vorn&utm_medium=m', '#/zugang?utm_source=hinten&utm_campaign=c&utm_content=x', '/zugang/'],
  ['unbekannte Seite mit Angaben', `?${K5}`, '#/gibtsnicht?rolle=x', '/'],
  // Formen, die scripts/buchseiten.mjs bis #609 schrieb
  ['buchseiten: Kopf und Abschluss', '', '#/zugang', '/zugang/'],
  ['buchseiten: zugang je Buch', '?buch=lissabon-1941', '#/zugang', '/zugang/'],
  ['buchseiten: Rolle je Tür', '?buch=lissabon-1941', '#/zugang?rolle=lernende', '/zugang/'],
  ['buchseiten: Skript mit utm', '?buch=lissabon-1941&utm_source=s&utm_medium=m&utm_campaign=c', '#/zugang?rolle=team', '/zugang/'],
  ['buchseiten: Fußzeile', '', '#/datenschutz', '/datenschutz/'],
  // Formen, die scripts/seiten.mjs (Trainer-Seiten) bis #609 schrieb
  ['seiten: zugangHref', '?lng=en&utm_source=website&utm_medium=seite&utm_campaign=trainer&utm_content=abschluss', '#/zugang?rolle=curator', '/en/zugang/'],
  ['seiten: Fußzeile', '?lng=uk', '#/urheberrecht', '/uk/urheberrecht/'],
  ['seiten: Fußzeile Datenschutz (nur deutsch, lng bleibt)', '?lng=uk', '#/datenschutz', '/datenschutz/'],
  // jede der sieben Seiten
  ...['zugang', 'mitmachen', 'investieren', 'impressum', 'datenschutz', 'urheberrecht', 'kontakt'].map((s) => [`Seite ${s}`, '', `#/${s}`, `/${s}/`]),
];
const KEIN_UMLEITEN = [
  ['kein #', '', ''],
  ['Sprungmarke', '?buch=x', '#weiter'],
  ['# allein', '', '#'],
];
// U4 (#609 Schritt 3): "?lng=" auf einer deutschen Adresse. [name, search, hash, pathname, erwartet (null = bleibt)]
const SPRACHANGABE = [
  ['/?lng=en', '?lng=en', '', '/', '/en/'],
  ['/zugang/?lng=fr mit utm', '?lng=fr&utm_source=x', '', '/zugang/', '/fr/zugang/?utm_source=x'],
  ['/zugang ohne Schrägstrich', '?lng=pl', '', '/zugang', '/pl/zugang/'],
  ['/?lng=de fällt weg', '?lng=de', '', '/', '/'],
  ['Sprungmarke bleibt', '?lng=en', '#weiter', '/', '/en/#weiter'],
  ['Impressum nur deutsch', '?lng=en', '', '/impressum/', null],
  ['Datenschutz nur deutsch', '?lng=uk', '', '/datenschutz/', null],
  ['schon Sprachpfad', '?lng=fr', '', '/en/zugang/', null],
  ['unbekannte Sprache', '?lng=xx', '', '/', null],
  ['keine Seite der App', '?lng=en', '', '/buch/lissabon-1941/', null],
  ['ohne lng', '?utm_source=x', '', '/zugang/', null],
];

const angabenAus = (s) => [...new URLSearchParams(s)];
if (neueAdresse) {
  for (const [name, search, hash, zielPfad] of FAELLE) {
    const aus = neueAdresse(search, hash);
    if (typeof aus !== 'string') { rot.push(`U1 ${name}: neueAdresse(${JSON.stringify(search)}, ${JSON.stringify(hash)}) = ${JSON.stringify(aus)}`); continue; }
    const u = new URL(aus, 'https://www.plinyoo.com');
    const fehler = [];
    if (u.origin !== 'https://www.plinyoo.com' || !aus.startsWith('/')) fehler.push(`keine Adresse auf derselben Seite: ${aus}`);
    if (u.pathname !== zielPfad) fehler.push(`Pfad ${u.pathname}, erwartet ${zielPfad}`);
    if (u.hash) fehler.push(`Hash bleibt stehen: ${u.hash}`);
    // erwartet: vorn, dann hinten; hinten gewinnt
    const hashQ = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
    const soll = new Map(angabenAus(search));
    for (const [k, v] of angabenAus(hashQ)) soll.set(k, v);
    // Schritt 3: führt lng auf einen Sprachpfad, ist es dort verbraucht
    if (/^\/[a-z]{2}\//.test(zielPfad)) soll.delete('lng');
    const ist = new Map(angabenAus(u.search));
    for (const [k, v] of soll) if (ist.get(k) !== v) fehler.push(`Angabe ${k}=${JSON.stringify(v)} ${ist.has(k) ? `steht als ${JSON.stringify(ist.get(k))}` : 'fehlt'}`);
    for (const k of ist.keys()) if (!soll.has(k)) fehler.push(`Angabe ${k} kommt dazu`);
    if (fehler.length) rot.push(`U1 ${name}: ${search}${hash} -> ${aus}: ${fehler.join('; ')}`);
    zeilen.push(`${fehler.length ? 'ROT  ' : 'grün '} ${search}${hash || ''} -> ${aus}`);
  }
  for (const [name, search, hash] of KEIN_UMLEITEN) {
    const aus = neueAdresse(search, hash);
    if (aus !== null) rot.push(`U2 ${name}: neueAdresse(${JSON.stringify(search)}, ${JSON.stringify(hash)}) = ${JSON.stringify(aus)}, erwartet null`);
  }
  for (const [name, search, hash, pathname, soll] of SPRACHANGABE) {
    const aus = neueAdresse(search, hash, pathname);
    if (aus !== soll) rot.push(`U4 ${name}: neueAdresse(${JSON.stringify(search)}, ${JSON.stringify(hash)}, ${JSON.stringify(pathname)}) = ${JSON.stringify(aus)}, erwartet ${JSON.stringify(soll)}`);
    else zeilen.push(`grün  ${pathname}${search}${hash} -> ${aus ?? '(bleibt)'}`);
  }
}

// --- U3 ---------------------------------------------------------------------------
const index = fs.readFileSync(path.join(WURZEL, 'index.html'), 'utf8');
const kopf = index.split('</head>')[0];
const platz = index.split('<!--ALTE-ADRESSEN-->').length - 1;
if (platz !== 1) rot.push(`U3 index.html: <!--ALTE-ADRESSEN--> steht ${platz}-mal da, erwartet einmal`);
else if (!kopf.includes('<!--ALTE-ADRESSEN-->')) rot.push('U3 <!--ALTE-ADRESSEN--> steht nicht im <head>');
const plausible = kopf.indexOf('plausible.io/js/');
if (plausible < 0) rot.push('U3 kein Plausible-Skript im <head> -- Prüfung nachziehen');
else if (platz === 1 && kopf.indexOf('<!--ALTE-ADRESSEN-->') > plausible) rot.push('U3 die Umleitung steht NACH dem Plausible-Skript: der Aufruf zählte unter der alten Adresse "/"');
if (/hashBasedRouting/.test(index.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/.*$/gm, ''))) rot.push('U3 Plausible zählt noch nach Hash (hashBasedRouting)');

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(zeilen.join('\n'));
console.log(`GRUEN U1-U4: ${FAELLE.length} alte Adressen ohne Verlust umgeleitet, ${KEIN_UMLEITEN.length} bleiben, ${SPRACHANGABE.length} Sprachangaben, Umleitung vor Plausible`);
