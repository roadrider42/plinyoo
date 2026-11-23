#!/usr/bin/env node
// ===========================================================================
// BUG-0354 (spoonup #654) -- Impressum, Datenschutz und Urheberrecht zeigen das
// Datum ihrer letzten Textänderung. Ohne Browser, ohne Netz; braucht git.
//
//   node tests/rechtstexte-stand-654.mjs            echte Dateien, danach die Proben
//   node tests/rechtstexte-stand-654.mjs --summen   Prüfsummen des jetzigen Texts ausgeben
//   STAND_BASIS=<commit> node tests/...             andere Vergleichsbasis
//
// Gerendert wird die deutsche Seite aus den echten Dateien. Verglichen wird ihr
// Text OHNE die Zeile „Stand: …“, ohne den Rückweg zur Startseite und ohne
// Leerraum: Klassen, Gliederung und Linkziele zählen nicht, jedes Wort zählt.
//
//  S  Die Zeile „Stand: 18. November 2026“ steht genau einmal da und nennt das
//     Datum aus rechtstexte-stand-654.json.
//  P  Die Prüfsumme des Texts ist die aus rechtstexte-stand-654.json.
//  B  Gegen die Basis: Ist der Text dort anders, ist das Datum hier nicht früher.
//     Dasselbe Datum ist erlaubt (zwei Änderungen am selben Tag). Ein vergessenes
//     Datum hält deshalb `--summen` auf: Ist der Text anders als die gespeicherte
//     Prüfsumme und das Datum weder vorgerückt noch der heutige Tag (Berlin),
//     gibt es keine Prüfsummen und Exit 1. Wer die Prüfsumme selbst berechnet und
//     rechtstexte-stand-654.json von Hand ändert, umgeht das und bleibt grün.
//
// Basis: gemeinsamer Vorfahr mit origin/main; ist HEAD selbst origin/main (Bau
// nach dem Merge), der erste Elternteil. Keine Basis, keine Datei oder kein
// Eintrag ist ROT, nie übersprungen.
//
// Wer einen Rechtstext ändert: Datum in der Seite (Impressum) oder in
// public/locales/de/translation.json setzen, dann `--summen` und beides in
// rechtstexte-stand-654.json eintragen. Reihenfolge: erst das Datum, dann
// `--summen`, zuletzt die JSON.
//
// NICHT gemessen: die übrigen Sprachen; ob das Datum der Tag der Änderung ist
// (nur: nicht früher als vorher, nicht in der Zukunft).
// Exit 0 grün, 1 rot, 2 nicht messbar (esbuild fehlt, Seite rendert nicht).
// ===========================================================================

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASISDATEI = 'tests/rechtstexte-stand-654.json';
const TEXTE = 'public/locales/de/translation.json';
const SEITEN = {
  impressum: 'src/pages/Impressum/ImpressumPage.tsx',
  datenschutz: 'src/pages/Datenschutz/DatenschutzPage.tsx',
  urheberrecht: 'src/pages/Urheberrecht/UrheberrechtPage.tsx',
};
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };
let esbuild;
try {
  esbuild = createRequire(join(WURZEL, 'package.json'))('esbuild');
} catch (e) {
  nichtMessbar(`esbuild nicht ladbar (${e.message.split('\n')[0]})`);
}
const git = (...args) => execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });

const AUSGABE = join(process.env.TMPDIR || tmpdir(), `rechtstexte-stand-654-${process.pid}`);
mkdirSync(AUSGABE, { recursive: true });
let lauf = 0;

/** Rendert die drei Seiten; `lies(pfad)` liefert den Inhalt einer Datei des Repos oder null. */
async function rendern(lies) {
  const ziel = join(AUSGABE, `seiten-${lauf++}.mjs`);
  await esbuild.build({
    stdin: {
      contents: [
        "import React from 'react';",
        "import { renderToStaticMarkup } from 'react-dom/server';",
        "import { MemoryRouter } from 'react-router-dom';",
        "import { createInstance } from 'i18next';",
        "import { I18nextProvider, initReactI18next } from 'react-i18next';",
        ...Object.entries(SEITEN).map(([s, p]) => `import ${s} from ${JSON.stringify(join(WURZEL, p))};`),
        `const seiten = { ${Object.keys(SEITEN).join(', ')} };`,
        'export async function html(texte) {',
        '  const i18n = createInstance();',
        "  await i18n.use(initReactI18next).init({ lng: 'de', fallbackLng: 'de', resources: { de: { translation: texte } }, initAsync: false, react: { useSuspense: false }, showSupportNotice: false });",
        '  const h = React.createElement;',
        '  return Object.fromEntries(Object.entries(seiten).map(([s, S]) => [s, renderToStaticMarkup(h(I18nextProvider, { i18n }, h(MemoryRouter, null, h(S))))]));',
        '}',
      ].join('\n'),
      resolveDir: WURZEL, loader: 'tsx',
    },
    bundle: true, outfile: ziel, format: 'esm', platform: 'node', logLevel: 'silent', jsx: 'automatic',
    banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{
      name: 'stand',
      setup(b) {
        b.onLoad({ filter: /\.tsx?$/ }, ({ path }) => {
          const p = relative(WURZEL, path);
          if (!p.startsWith('src/')) return undefined;
          const inhalt = lies(p);
          // Alias auf eine Datei, die es an diesem Stand nicht gibt: Fehler, kein leerer Text.
          return inhalt === null ? { errors: [{ text: `${p} fehlt an diesem Stand` }] } : { contents: inhalt, loader: path.endsWith('x') ? 'tsx' : 'ts' };
        });
      },
    }],
  });
  const texte = lies(TEXTE);
  if (texte === null) throw new Error(`${TEXTE} fehlt`);
  return (await import(pathToFileURL(ziel).href)).html(JSON.parse(texte));
}

const ohneTags = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
/** Text ohne Standzeile, und alle Standzeilen. */
function lesen(html) {
  const staende = [];
  const rest = html
    .replace(/<p[^>]*>((?:(?!<\/p>)[\s\S])*)<\/p>/g, (alles, innen) => {
      const m = /^\s*Stand:\s*(.*?)\s*$/.exec(ohneTags(innen));
      if (!m) return alles;
      staende.push(m[1]);
      return '';
    })
    .replace(/<a(?=[^>]* href="\/")[^>]*>[\s\S]*?<\/a>/g, '');
  const text = ohneTags(rest).replace(/\s+/g, '');
  return { staende, text, summe: createHash('sha256').update(text).digest('hex') };
}
/** „18. November 2026“ -> „2026-11-18“, sonst null. */
function tag(s) {
  const m = /^(\d{1,2})\. (\p{L}+) (\d{4})$/u.exec(s ?? '');
  const monat = m ? MONATE.indexOf(m[2]) + 1 : 0;
  if (!monat) return null;
  const iso = `${m[3]}-${String(monat).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : iso;
}

function basisCommit() {
  if (process.env.STAND_BASIS) return git('rev-parse', '--verify', `${process.env.STAND_BASIS}^{commit}`).trim();
  const kopf = git('rev-parse', 'HEAD').trim();
  const main = git('rev-parse', '--verify', 'origin/main^{commit}').trim();
  return kopf === main ? git('rev-parse', '--verify', 'HEAD^1').trim() : git('merge-base', 'HEAD', main).trim();
}
/** @returns {{seiten: object, grund?: undefined} | {grund: string}} */
async function basisLaden(commit) {
  try {
    const c = commit ?? basisCommit();
    const dateien = new Set(git('ls-tree', '-r', '--name-only', c, '--', 'src', TEXTE).split('\n'));
    const html = await rendern((p) => (dateien.has(p) ? git('show', `${c}:${p}`) : null));
    return { commit: c, seiten: Object.fromEntries(Object.entries(html).map(([s, h]) => [s, lesen(h)])) };
  } catch (e) {
    return { grund: String(e.stderr || e.message).trim().split('\n')[0] };
  }
}

/** Alle Befunde zu einem Stand; leer heißt grün. */
async function pruefen(lies, basis) {
  const funde = [];
  let soll = {};
  const roh = lies(BASISDATEI);
  if (roh === null) funde.push(`${BASISDATEI} fehlt`);
  else try { soll = JSON.parse(roh); } catch { funde.push(`${BASISDATEI} nicht lesbar`); }
  if (basis.grund) funde.push(`Vergleichsbasis fehlt: ${basis.grund}`);
  const html = await rendern(lies);
  const heute = new Date(Date.now() + 14 * 3600e3).toISOString().slice(0, 10); // weitester Kalendertag der Erde
  for (const s of Object.keys(SEITEN)) {
    const { staende, text, summe } = lesen(html[s]);
    const da = tag(staende[0]);
    if (text.length < 200) funde.push(`${s}: nur ${text.length} Zeichen Text gerendert`);
    if (staende.length !== 1 || !da) funde.push(`${s} S: Standzeile „${staende.join('“, „')}“, verlangt genau eine der Form „18. November 2026“`);
    else if (da > heute) funde.push(`${s} S: ${da} liegt in der Zukunft`);
    const e = soll[s];
    if (!e?.stand || !e?.pruefsumme) funde.push(`${s}: kein Eintrag mit stand und pruefsumme in ${BASISDATEI}`);
    else {
      if (da && e.stand !== da) funde.push(`${s} S: Seite zeigt ${da}, ${BASISDATEI} nennt ${e.stand}`);
      if (e.pruefsumme !== summe) funde.push(`${s} P: Text geändert; erst das Datum setzen, dann die Prüfsumme aus --summen eintragen`);
    }
    const vorher = basis.seiten?.[s];
    if (!vorher || vorher.summe === summe) continue;
    const alt = tag(vorher.staende[0]);
    if (!alt) funde.push(`${s} B: Text geändert, die Basis nennt kein lesbares Datum („${vorher.staende[0] ?? ''}“)`);
    else if (!da || da < alt) funde.push(`${s} B: Text geändert, Datum ${da ?? 'fehlt'} ist früher als ${alt} (Basis ${basis.commit.slice(0, 7)})`);
  }
  return { funde, html };
}

const berlin = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
/** Die Ausgabe von --summen. Eine verweigerte Seite hält alle Prüfsummen zurück. */
async function summen(lies, heute) {
  let soll;
  try { soll = JSON.parse(lies(BASISDATEI)); } catch { soll = null; }
  if (!soll) return { code: 1, zeilen: [`VERWEIGERT ${BASISDATEI} fehlt oder ist nicht lesbar`] };
  const zeilen = [];
  const verweigert = [];
  for (const [s, h] of Object.entries(await rendern(lies))) {
    const { staende, summe } = lesen(h);
    const da = tag(staende[0]);
    const e = soll[s];
    if (staende.length !== 1 || !da) verweigert.push(`VERWEIGERT ${s}: kein eindeutiges Datum auf der Seite`);
    else if (!e?.stand || !e?.pruefsumme) verweigert.push(`VERWEIGERT ${s}: kein Eintrag mit stand und pruefsumme in ${BASISDATEI}`);
    else if (e.pruefsumme !== summe && !(da > e.stand) && da !== heute) verweigert.push(`VERWEIGERT ${s}: Text geändert, aber das Datum ${da} ist weder vorgerückt (gespeichert ${e.stand}) noch der heutige Tag (${heute}). Erst das Datum setzen.`);
    zeilen.push(`${s} ${da} ${summe}`);
  }
  return verweigert.length ? { code: 1, zeilen: verweigert } : { code: 0, zeilen };
}

const arbeitsbaum = (p) => (existsSync(join(WURZEL, p)) ? readFileSync(join(WURZEL, p), 'utf8') : null);
if (process.argv.includes('--summen')) {
  const { code, zeilen } = await summen(arbeitsbaum, berlin());
  for (const z of zeilen) console.log(z);
  process.exit(code);
}

let rot = 0;
const basis = await basisLaden();
let jetzt;
try {
  jetzt = await pruefen(arbeitsbaum, basis);
} catch (e) {
  nichtMessbar(`Seiten rendern nicht (${e.message.split('\n')[0]})`);
}
console.log(`Basis: ${basis.commit ?? `FEHLT (${basis.grund})`}`);
for (const f of jetzt.funde) { rot++; console.log(`ROT   ${f}`); }
if (!jetzt.funde.length) console.log('GRUEN echte Dateien');

// --- Proben: dieselbe Prüfung gegen die echten Dateien, je mit einer Verstellung ---
// Ihre Basis ist der Arbeitsbaum selbst, damit sie allein an der Verstellung hängen.
if (!rot) {
  const heil = { commit: 'arbeitsbaum', seiten: Object.fromEntries(Object.entries(jetzt.html).map(([s, h]) => [s, lesen(h)])) };
  const ersetzt = (pfad, ...paare) => (p) => {
    let t = arbeitsbaum(p);
    if (p !== pfad) return t;
    for (const [alt, neu] of paare) {
      if (!t.includes(alt)) throw new Error(`Probe trifft nichts: „${alt}“ in ${pfad}`);
      t = t.replace(alt, () => neu);
    }
    return t;
  };
  const anders = (lies, aendern) => (p) => { if (p !== BASISDATEI) return lies(p); const o = JSON.parse(arbeitsbaum(BASISDATEI)); return aendern(o) ?? JSON.stringify(o); };
  const summeVon = async (lies, s) => lesen((await rendern(lies))[s]).summe;
  const WORT = { impressum: [SEITEN.impressum, 'mit größter Sorgfalt'], datenschutz: [TEXTE, 'Beim Aufruf der Seite wird'], urheberrecht: [TEXTE, 'Eigene Fotos und Grafiken'] };
  const standVon = { impressum: () => heil.seiten.impressum.staende[0], datenschutz: () => heil.seiten.datenschutz.staende[0], urheberrecht: () => heil.seiten.urheberrecht.staende[0] };
  const schluessel = { datenschutz: 'privacy', urheberrecht: 'copyright' };
  /** Setzt das gezeigte Datum einer Seite. */
  const mitDatum = (s, lies, iso) => {
    const [j, m, d] = iso.split('-').map(Number);
    const lang = `Stand: ${d}. ${MONATE[m - 1]} ${j}`;
    return (p) => {
      const t = lies(p);
      if (s === 'impressum') return p === SEITEN.impressum ? t.replace(`Stand: ${standVon[s]()}`, lang) : t;
      if (p !== TEXTE) return t;
      const o = JSON.parse(t);
      o[schluessel[s]].stand = lang;
      return JSON.stringify(o);
    };
  };
  const proben = [];
  const summenProben = []; // [Name, Stand, heutiger Tag, erwartete Zeile]
  for (const s of Object.keys(SEITEN)) {
    const [pfad, wort] = WORT[s];
    const text = ersetzt(pfad, [wort, `${wort} PROBE`]);
    const summe = await summeVon(text, s);
    const alt = tag(standVon[s]());
    const frueher = new Date(Date.parse(alt) - 864e5).toISOString().slice(0, 10);
    const spaeter = new Date(Date.parse(alt) + 864e5).toISOString().slice(0, 10);
    const summeNach = (stand) => (o) => { o[s].pruefsumme = summe; o[s].stand = stand; };
    proben.push(
      [`${s}: Text geändert, sonst nichts`, text, / P: /],
      [`${s}: Text und Prüfsumme, Datum gleich`, anders(text, summeNach(alt)), null],
      [`${s}: Text und Prüfsumme, Datum früher`, anders(mitDatum(s, text, frueher), summeNach(frueher)), / B: /],
      [`${s}: Text, Prüfsumme und späteres Datum`, anders(mitDatum(s, text, spaeter), summeNach(spaeter)), null],
      [`${s}: Datum ohne Eintrag geändert`, mitDatum(s, arbeitsbaum, spaeter), / S: /],
      [`${s}: Eintrag fehlt`, anders(arbeitsbaum, (o) => { delete o[s]; }), /kein Eintrag/],
    );
    const spaeter2 = new Date(Date.parse(alt) + 2 * 864e5).toISOString().slice(0, 10);
    const weigert = new RegExp(`^VERWEIGERT ${s}: Text geändert`);
    summenProben.push(
      [`${s}: Datum vergessen`, text, spaeter, weigert],
      [`${s}: Datum zurückgesetzt`, mitDatum(s, text, frueher), spaeter, weigert],
      [`${s}: zweite Änderung am selben Tag`, text, alt, `${s} ${alt} ${summe}`],
      [`${s}: Datum vorgerückt`, mitDatum(s, text, spaeter), spaeter2, `${s} ${spaeter} ${summe}`],
      [`${s}: Text unverändert`, arbeitsbaum, spaeter, `${s} ${alt} ${heil.seiten[s].summe}`],
      [`${s}: Eintrag fehlt`, anders(text, (o) => { delete o[s]; }), spaeter, new RegExp(`^VERWEIGERT ${s}: kein Eintrag`)],
    );
  }
  summenProben.push(['Basisdatei fehlt', (p) => (p === BASISDATEI ? null : arbeitsbaum(p)), berlin(), /^VERWEIGERT .*json fehlt/]);
  for (const [name, lies, heute, erwartet] of summenProben) {
    const { code, zeilen } = await summen(lies, heute);
    const ok = typeof erwartet === 'string'
      ? code === 0 && zeilen.length === Object.keys(SEITEN).length && zeilen.includes(erwartet)
      : code !== 0 && zeilen.length === 1 && erwartet.test(zeilen[0]);
    if (!ok) rot++;
    console.log(`${ok ? 'GRUEN' : 'ROT  '} Probe --summen ${name}: ${typeof erwartet === 'string' ? 'muss erlaubt sein' : 'muss verweigert werden'}, Exit ${code}`);
  }
  proben.push(
    ['Gestaltung Impressum (Klassen, Gliederung, Linkziel)', ersetzt(SEITEN.impressum, ['text-4xl', 'text-5xl'], ['<p>34121 Kassel</p>', '<p><strong>34121</strong> <em>Kassel</em></p>'], ['to="/datenschutz/"', 'to="/datenschutz"']), null],
    ['Gestaltung Datenschutz', ersetzt(SEITEN.datenschutz, ['text-2xl font-semibold mb-4', 'text-xl']), null],
    ['Gestaltung Urheberrecht', ersetzt(SEITEN.urheberrecht, ['max-w-4xl', 'max-w-2xl']), null],
    ['Text einer anderen Seite in derselben Datei', ersetzt(TEXTE, ['Alle Rechte vorbehalten.', 'Alle Rechte vorbehalten!']), null],
    ['Baujahr statt Datum', ersetzt(SEITEN.impressum, [`Stand: ${standVon.impressum()}`, 'Stand: {new Date().getFullYear()}']), /impressum S: /],
    ['Standzeile entfernt', (p) => { const t = arbeitsbaum(p); if (p !== TEXTE) return t; const o = JSON.parse(t); o.copyright.stand = ''; return JSON.stringify(o); }, /^urheberrecht S: /],
    ['Basisdatei fehlt', (p) => (p === BASISDATEI ? null : arbeitsbaum(p)), /json fehlt/],
    ['Basisdatei nicht lesbar', anders(arbeitsbaum, () => '{'), /nicht lesbar/],
  );
  for (const [name, lies, erwartet, b = heil] of [...proben, ['git-Basis fehlt', arbeitsbaum, /Vergleichsbasis fehlt/, await basisLaden('0000000000000000000000000000000000000000')]]) {
    const { funde } = await pruefen(lies, b);
    const ok = erwartet ? funde.some((f) => erwartet.test(f)) : !funde.length;
    if (!ok) rot++;
    console.log(`${ok ? 'GRUEN' : 'ROT  '} Probe ${name}: ${erwartet ? 'muss rot sein' : 'muss grün sein'}, ${funde.length ? funde.join(' | ') : 'ohne Befund'}`);
  }
}
console.log(rot ? `ROT (${rot})` : 'GRUEN');
process.exit(rot ? 1 : 0);
