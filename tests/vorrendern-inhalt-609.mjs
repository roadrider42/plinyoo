#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup, Heiko E-521 "B", E-522 "A alle sieben") -- jede Seite der App
// liegt gebaut als eigene Datei mit Inhalt, eigenem Kopf und eigener Adresse.
// Ohne Browser, ohne Netz: gelesen wird, was ein Roboter ohne JavaScript liest.
//
//   node tests/vorrendern-inhalt-609.mjs                 liest dist/ (so am Ende von npm run build)
//   node tests/vorrendern-inhalt-609.mjs --dist <ordner>  liest einen anderen Bauordner
//
// Die Seiten und ihre Schlüssel stehen hier AUSGESCHRIEBEN, nicht aus
// src/routes/seiten.ts gelesen -- sonst fiele eine Seite, die dort fehlt,
// zugleich aus Bau und Prüfung.
//
// V1  dist/<pfad>/index.html existiert ("/" = dist/index.html), #root ist
//     nicht leer, und der sichtbare Text in #root hat mindestens MIN Wörter
//     (Startseite 1500, gemessen 2161 in der Probe; jede andere Seite 40,
//     gemessen 64 bis 947).
// V2  <html lang="de"> (vorgerendert wird Deutsch; Sprachfassungen mit
//     eigenem Pfad und hreflang kommen erst mit Schritt 3 des Plans).
// V3  <title>, og:title und twitter:title sind gleich, nicht leer und genau
//     seo.<seite>.title aus public/locales/de/translation.json; description,
//     og:description, twitter:description genau seo.<seite>.description.
//     Jede Seite hat einen Titel und eine Beschreibung, die keine andere hat.
// V4  canonical und og:url = https://www.plinyoo.com<pfad>, mit Schrägstrich.
// V5  Kein noindex, kein Platzhalter {{…}}, kein <!--BUECHER-FUSS--> übrig,
//     und die Bücherleiste (nav.buecher-fuss) steht genau einmal da.
// V6  dist/404.html ist die Hülle: #root leer (unbekannte Pfade rendert der
//     Browser), Kopf der Startseite.
//
// Gegenprobe 21.11.2026, node 22.23.4: gegen einen Bauordner wie vor dem
// Vorrendern (nur index.html und 404.html mit leerem #root) ROT 10 -- V1 "/"
// #root leer, V1 sieben Seiten fehlen, V5 keine Bücherleiste --, Exit 1. Vor
// buchseiten.mjs (Teilbau) ROT V5 in allen acht Seiten. Mit dem Fix GRUEN.
// Fehlender Ordner: ROT.
// Exit 0 grün, 1 rot.
// ===========================================================================
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distArg = process.argv.indexOf('--dist');
const DIST = distArg > 0 ? resolve(process.argv[distArg + 1] ?? '') : join(WURZEL, 'dist');
const SITE = 'https://www.plinyoo.com';

const SEITEN = [
  ['/', 'start', 1500],
  ['/zugang/', 'zugang', 40],
  ['/mitmachen/', 'mitmachen', 40],
  ['/investieren/', 'investieren', 40],
  ['/impressum/', 'impressum', 40],
  ['/datenschutz/', 'datenschutz', 40],
  ['/urheberrecht/', 'urheberrecht', 40],
  ['/kontakt/', 'kontakt', 40],
];
const seo = JSON.parse(readFileSync(join(WURZEL, 'public/locales/de/translation.json'), 'utf8')).seo ?? {};

const ent = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const alle = (html, re) => [...html.matchAll(re)].map((m) => ent(m[1]));
const meta = (kopf, attr, name) => alle(kopf, new RegExp(`<meta\\s+${attr}="${name.replace('.', '\\.')}"\\s+content="([^"]*)"`, 'g'));
// #root bis zum </div> vor dem Ende von body: die Bücherleiste und die Skripte stehen dahinter.
function wurzelInhalt(html) {
  const a = html.indexOf('<div id="root">');
  if (a < 0) return null;
  const nachRoot = html.slice(a + '<div id="root">'.length);
  const ende = ['<nav class="buecher-fuss"', '<!--BUECHER-FUSS-->', '<script type="module"', '</body>']
    .map((m) => nachRoot.indexOf(m)).filter((i) => i >= 0).sort((x, y) => x - y)[0] ?? nachRoot.length;
  return nachRoot.slice(0, ende).replace(/\s*<\/div>\s*$/, '');
}
const woerter = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/gi, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

const rot = [];
const zeilen = [];
const titel = new Map();
const beschr = new Map();
if (!existsSync(DIST)) rot.push(`${DIST} fehlt -- ohne Bau keine Seiten`);
for (const [pfad, schluessel, min] of rot.length ? [] : SEITEN) {
  const datei = join(DIST, ...pfad.split('/').filter(Boolean), 'index.html');
  if (!existsSync(datei)) { rot.push(`V1 ${pfad}: ${datei} fehlt`); continue; }
  const html = readFileSync(datei, 'utf8');
  const kopf = html.split('</head>')[0];
  const inhalt = wurzelInhalt(html);
  const n = inhalt ? woerter(inhalt) : 0;
  if (!inhalt) rot.push(`V1 ${pfad}: #root leer`);
  else if (n < min) rot.push(`V1 ${pfad}: ${n} Wörter in #root, erwartet mindestens ${min}`);

  const lang = html.match(/<html\s+lang="([^"]*)"/)?.[1];
  if (lang !== 'de') rot.push(`V2 ${pfad}: <html lang="${lang}">, erwartet "de"`);

  const soll = seo[schluessel];
  if (!soll?.title || !soll?.description) rot.push(`V3 ${pfad}: seo.${schluessel}.title/description fehlt in public/locales/de/translation.json`);
  const t = [...alle(kopf, /<title>([^<]*)<\/title>/g), ...meta(kopf, 'property', 'og:title'), ...meta(kopf, 'name', 'twitter:title')];
  if (t.length !== 3 || new Set(t).size !== 1 || !t[0].trim()) rot.push(`V3 ${pfad}: Titel ${JSON.stringify(t)}`);
  else if (soll?.title && t[0] !== soll.title) rot.push(`V3 ${pfad}: Titel "${t[0]}", erwartet seo.${schluessel}.title "${soll.title}"`);
  const d = [...meta(kopf, 'name', 'description'), ...meta(kopf, 'property', 'og:description'), ...meta(kopf, 'name', 'twitter:description')];
  if (d.length !== 3 || new Set(d).size !== 1 || !d[0].trim()) rot.push(`V3 ${pfad}: Beschreibung ${JSON.stringify(d)}`);
  else if (soll?.description && d[0] !== soll.description) rot.push(`V3 ${pfad}: Beschreibung "${d[0]}", erwartet seo.${schluessel}.description`);
  if (t[0]) { if (titel.has(t[0])) rot.push(`V3 ${pfad}: Titel "${t[0]}" hat auch ${titel.get(t[0])}`); titel.set(t[0], pfad); }
  if (d[0]) { if (beschr.has(d[0])) rot.push(`V3 ${pfad}: Beschreibung hat auch ${beschr.get(d[0])}`); beschr.set(d[0], pfad); }

  const canon = alle(kopf, /<link rel="canonical" href="([^"]*)"/g);
  const ogUrl = meta(kopf, 'property', 'og:url');
  if (canon.length !== 1 || canon[0] !== `${SITE}${pfad}`) rot.push(`V4 ${pfad}: canonical ${JSON.stringify(canon)}, erwartet "${SITE}${pfad}"`);
  if (ogUrl.length !== 1 || ogUrl[0] !== `${SITE}${pfad}`) rot.push(`V4 ${pfad}: og:url ${JSON.stringify(ogUrl)}, erwartet "${SITE}${pfad}"`);

  if (/<meta\s+name="robots"\s+content="[^"]*noindex/.test(kopf)) rot.push(`V5 ${pfad}: noindex`);
  const platz = html.match(/\{\{[^}]*\}\}/g);
  if (platz) rot.push(`V5 ${pfad}: Platzhalter ${platz.slice(0, 3).join(', ')}`);
  if (html.includes('<!--BUECHER-FUSS-->')) rot.push(`V5 ${pfad}: <!--BUECHER-FUSS--> nicht ersetzt`);
  const leisten = html.split('<nav class="buecher-fuss"').length - 1;
  if (leisten !== 1) rot.push(`V5 ${pfad}: Bücherleiste ${leisten}-mal, erwartet einmal`);
  zeilen.push(`${pfad}: ${n} Wörter, "${t[0] ?? ''}"`);
}
if (existsSync(DIST)) {
  const datei = join(DIST, '404.html');
  if (!existsSync(datei)) rot.push('V6 dist/404.html fehlt');
  else {
    const html = readFileSync(datei, 'utf8');
    if (!html.includes('<div id="root"></div>')) rot.push('V6 dist/404.html: #root ist nicht leer -- 404.html muss die Hülle bleiben (cp vor dem Vorrendern)');
    const t = alle(html.split('</head>')[0], /<title>([^<]*)<\/title>/g);
    if (t[0] !== seo.start?.title) rot.push(`V6 dist/404.html: Titel ${JSON.stringify(t)}, erwartet den der Startseite`);
  }
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(zeilen.join('\n'));
console.log(`GRUEN V1-V6: ${SEITEN.length} Seiten vorgerendert in ${DIST}, je eigener Titel, eigene Beschreibung, eigene Adresse; 404.html ist die Hülle`);
