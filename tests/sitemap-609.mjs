#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup), SEO-Vorschlag 5 (Heiko frei auf E-524) -- die Sitemap sagt
// die Wahrheit über Adresse und Alter jeder Seite. Ohne Browser, ohne Netz.
//
//   node tests/sitemap-609.mjs                     erzeugt die Sitemap mit
//        scripts/generate-sitemap.mjs --dist <tmp> in einen Ordner außerhalb
//        von dist/ (Platzhalterseiten je Buch und Unterseite) und liest sie.
//   node tests/sitemap-609.mjs --lesen dist/sitemap.xml
//        liest eine schon erzeugte Sitemap (so am Ende von npm run build).
//        Fehlt die Datei, ist die Prüfung rot: ohne Bau keine Sitemap.
//
// S1  Die Startseite steht mit Schrägstrich, genau wie die Canonical-Adresse
//     in index.html (<link rel="canonical" href=...>). Eine Adresse ohne
//     Schrägstrich ist für Suchmaschinen eine zweite, die auf die erste zeigt.
// S2  lastmod der Startseite = Tag des letzten Commits auf index.html, src/
//     und public/locales/ (git log -1 --format=%cs).
// S3  lastmod jeder Unterseite (content/seiten/<seite>/<sprache>.json, die
//     Trainer-Seiten) = Tag des letzten Commits auf ihre Sprachdatei.
// S4  lastmod jeder Buchseite = letzter Commit auf Buchdatei und Buchordner,
//     die Übersicht /buch/ = das jüngste davon (so schon vor #609).
// S5  Keine Adresse trägt "heute", wenn ihre Dateien heute keinen Commit
//     haben -- ein lastmod, das jeder Bau auf den Bautag setzt, werten
//     Suchmaschinen als unzuverlässig (Kommentar im Skript, Zeile 15-16).
// S6  (#609 Vorrendern) Die sieben Seiten der App stehen mit eigener Adresse
//     und Schrägstrich darin (/zugang/ ...), lastmod wie die Startseite. Vor
//     dem Vorrendern waren sie alle "/" und standen gar nicht darin.
//     Gegenprobe 21.11.2026 mit --generator <Skript von origin/main 09c8f32>:
//     ROT S6 (sieben Adressen fehlen), Exit 1.
//
// Die erwarteten Tage rechnet diese Datei selbst aus git log aus, nicht aus
// dem Skript. Ein flacher Klon kennt nur den letzten Commit: dann "nicht
// messbar" (Exit 2), nie grün. Im Ablauf mit fetch-depth: 0 auschecken.
//
// Gegenprobe gegen origin/main 1436e52 (Skript vor #609), 21.11.2026,
// node 22.23.4, mit --generator <alte Fassung in scripts/>: ROT S1 (ohne
// Schrägstrich), ROT S2 (Startseite mit Schrägstrich fehlt), ROT S3 und S5
// (sieben Trainer-Seiten mit dem Bautag 2026-11-21, Commits 2026-10-31 und
// 2026-11-11), Exit 1. Mit dem Fix: GRUEN, 19 Adressen, Exit 0.
// --lesen auf eine fehlende Datei: ROT, Exit 1.
// Exit 0 grün, 1 rot, 2 nicht messbar.
// ===========================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.plinyoo.com';
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

const git = (args) => execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
let flach;
try { flach = git(['rev-parse', '--is-shallow-repository']); } catch (e) { nichtMessbar(`kein Git-Repo (${e.message.split('\n')[0]})`); }
if (flach !== 'false') nichtMessbar('flacher Git-Klon, git log kennt nur den letzten Commit. Im Ablauf actions/checkout mit fetch-depth: 0.');
const commitTag = (pfade) => git(['log', '-1', '--format=%cs', '--', ...pfade]);

// Heute, in beiden Lesarten: Ortszeit (git %cs nimmt die Zone des Commits) und UTC (das alte Skript nahm toISOString).
const d = new Date();
const zwei = (n) => String(n).padStart(2, '0');
const HEUTE = new Set([`${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`, d.toISOString().slice(0, 10)]);

// --- Erwartung aus dem Inhalt -------------------------------------------------
const lies = (datei) => JSON.parse(readFileSync(join(WURZEL, datei), 'utf8'));
const buecher = readdirSync(join(WURZEL, 'content/buecher')).filter((f) => f.endsWith('.json'))
  .map((f) => lies(`content/buecher/${f}`)).filter((b) => !b.draft)
  .map((b) => ({ slug: b.slug, tag: commitTag([`content/buecher/${b.slug}.json`, `content/buecher/${b.slug}/`]) }));
const unterseiten = [];
const seitenDir = join(WURZEL, 'content/seiten');
if (existsSync(seitenDir)) {
  for (const name of readdirSync(seitenDir)) {
    if (!existsSync(join(seitenDir, name, 'seite.json')) || lies(`content/seiten/${name}/seite.json`).draft) continue;
    for (const f of readdirSync(join(seitenDir, name)).filter((x) => /^[a-z]{2}\.json$/.test(x))) {
      const datei = `content/seiten/${name}/${f}`;
      unterseiten.push({ datei, pfad: lies(datei).pfad, tag: commitTag([datei]) });
    }
  }
}
const canonical = readFileSync(join(WURZEL, 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) nichtMessbar('index.html ohne <link rel="canonical">.');

const erwartet = new Map(); // loc -> { tag, woher }
erwartet.set(`${SITE}/`, { tag: commitTag(['index.html', 'src/', 'public/locales/']), woher: 'index.html, src/, public/locales/' });
// S6 (#609 Vorrendern): die übrigen Seiten der App, je mit eigener Adresse und Schrägstrich, lastmod wie die
// Startseite (ihr Inhalt liegt an denselben Stellen). Ausgeschrieben, nicht aus src/routes/seiten.ts gelesen.
const APP_SEITEN = ['/zugang/', '/mitmachen/', '/investieren/', '/impressum/', '/datenschutz/', '/urheberrecht/', '/kontakt/'];
for (const p of APP_SEITEN) erwartet.set(`${SITE}${p}`, { tag: erwartet.get(`${SITE}/`).tag, woher: 'index.html, src/, public/locales/ (Seite der App)' });
if (buecher.length) erwartet.set(`${SITE}/buch/`, { tag: buecher.map((b) => b.tag).sort().at(-1), woher: 'jüngstes Buch' });
for (const b of buecher) erwartet.set(`${SITE}/buch/${b.slug}/`, { tag: b.tag, woher: `content/buecher/${b.slug}` });
for (const u of unterseiten) erwartet.set(`${SITE}${u.pfad}`, { tag: u.tag, woher: u.datei });
for (const [loc, e] of erwartet) if (!/^\d{4}-\d{2}-\d{2}$/.test(e.tag)) nichtMessbar(`${loc}: kein Commit auf ${e.woher}.`);

// --- Sitemap holen ----------------------------------------------------------------
let xml;
const lesenArg = process.argv.indexOf('--lesen');
if (lesenArg > 0) {
  const datei = resolve(process.argv[lesenArg + 1] ?? '');
  if (!existsSync(datei)) { console.log(`ROT: ${datei} fehlt -- ohne Bau keine Sitemap.`); process.exit(1); }
  xml = readFileSync(datei, 'utf8');
} else {
  // Platzhalterseiten, gegen die das Skript abgleicht; nichts davon landet in dist/.
  const tmp = mkdtempSync(join(tmpdir(), 'sitemap-609-'));
  const seite = (teile) => { mkdirSync(join(tmp, ...teile), { recursive: true }); writeFileSync(join(tmp, ...teile, 'index.html'), '<!doctype html><title>Platzhalter</title>'); };
  for (const b of buecher) seite(['buch', b.slug]);
  for (const u of unterseiten) seite(u.pfad.split('/').filter(Boolean));
  // Seiten der App: das Skript verlangt vorgerenderten Inhalt in #root (#609).
  const appSeite = (teile) => { mkdirSync(join(tmp, ...teile), { recursive: true }); writeFileSync(join(tmp, ...teile, 'index.html'), '<!doctype html><title>Platzhalter</title><div id="root"><main>Platzhalter</main></div>'); };
  for (const p of ['/', ...APP_SEITEN]) appSeite(p.split('/').filter(Boolean));
  try {
    // --generator <datei>: anderer Stand des Skripts für die Gegenprobe; er muss in scripts/ liegen (es rechnet von dort die Wurzel).
    const genArg = process.argv.indexOf('--generator');
    const generator = genArg > 0 ? resolve(process.argv[genArg + 1]) : join(WURZEL, 'scripts/generate-sitemap.mjs');
    execFileSync(process.execPath, [generator, '--dist', tmp], { cwd: WURZEL, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.log(`ROT: scripts/generate-sitemap.mjs bricht ab:\n${String(e.stderr || e.message).trim()}`);
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
  }
  const datei = join(tmp, 'sitemap.xml');
  if (!existsSync(datei)) { console.log('ROT: scripts/generate-sitemap.mjs --dist schreibt keine sitemap.xml in den Ordner.'); process.exit(1); }
  xml = readFileSync(datei, 'utf8');
  rmSync(tmp, { recursive: true, force: true });
}

// --- Prüfen -------------------------------------------------------------------------
const eintraege = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, inhalt]) => ({
  loc: inhalt.match(/<loc>([^<]*)<\/loc>/)?.[1],
  lastmod: inhalt.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1],
}));
const rot = [];
const start = eintraege[0];
if (start?.loc !== `${SITE}/`) rot.push(`S1 Startseite steht als "${start?.loc}", erwartet "${SITE}/"`);
if (canonical !== `${SITE}/`) rot.push(`S1 Canonical in index.html ist "${canonical}", erwartet "${SITE}/"`);
if (eintraege.some((x) => x.loc === SITE)) rot.push(`S1 "${SITE}" ohne Schrägstrich steht in der Sitemap`);

for (const [loc, e] of erwartet) {
  const x = eintraege.find((y) => y.loc === loc);
  const kennung = loc === `${SITE}/` ? 'S2' : APP_SEITEN.some((p) => `${SITE}${p}` === loc) ? 'S6' : unterseiten.some((u) => `${SITE}${u.pfad}` === loc) ? 'S3' : 'S4';
  if (!x) { rot.push(`${kennung} ${loc} fehlt`); continue; }
  if (x.lastmod !== e.tag) rot.push(`${kennung} ${loc}: lastmod "${x.lastmod ?? '(keins)'}", letzter Commit auf ${e.woher} ist ${e.tag}`);
  if (HEUTE.has(x.lastmod) && !HEUTE.has(e.tag)) rot.push(`S5 ${loc}: lastmod ist heute (${x.lastmod}), ${e.woher} hat heute keinen Commit`);
}
const fremd = eintraege.filter((x) => !erwartet.has(x.loc)).map((x) => x.loc);
if (fremd.length) rot.push(`Adressen ohne Erwartung (Prüfung nachziehen): ${fremd.join(', ')}`);

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(`GRUEN S1-S6: ${eintraege.length} Adressen, Startseite ${SITE}/ (${erwartet.get(`${SITE}/`).tag}), ${APP_SEITEN.length} Seiten der App, ${unterseiten.length} Unterseiten, ${buecher.length} Bücher; jedes lastmod = letzter Commit.`);
