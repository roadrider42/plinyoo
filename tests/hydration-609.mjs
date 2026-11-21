#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup) -- der Browser übernimmt jede vorgerenderte Seite, ohne sie
// zu verwerfen, und alte Adressen kommen mit ihrer Herkunft an.
//
//   node tests/hydration-609.mjs                 liest dist/ (nach npm run build)
//   node tests/hydration-609.mjs --dist <ordner>
//   PLAYWRIGHT_MODUL=<pfad zu playwright> node ...  (Vorgabe wie tests/kontaktformular-483.mjs)
//
// Ein kleiner Server liefert dist/ aus wie GitHub Pages es laut Dokumentation
// tut: <ordner>/ -> <ordner>/index.html (200), <ordner> ohne Schrägstrich ->
// 301 auf <ordner>/ (mit Angaben), sonst die Datei, sonst 404.html mit 404.
// Ob Pages selbst so antwortet, misst diese Prüfung NICHT (siehe
// spoonup claude/609/pages-mess.mjs).
//
// Je Fall ein Chromium (in der Agentenschale nur mit --single-process).
// Plausible und alles außerhalb von 127.0.0.1 wird abgewiesen.
//
// Y0  Die Seite hat nach dem Laden Inhalt in #root, und (wo Y3 gilt) das
//     ausgelieferte HTML hatte schon welchen. Ohne Y0 wäre eine Seite, die
//     gar nicht rendert, in Y1-Y3 grün.
// Y1  Keine Meldung von React zu einer Abweichung beim Übernehmen: keine
//     Konsolenzeile und kein Seitenfehler mit "Hydration", "did not match",
//     "Minified React error #418/#423/#425", "server rendered HTML".
// Y2  #root wird nicht ersetzt: Ein MutationObserver ab Dokumentbeginn zählt
//     entfernte Kinder von #root. Erlaubt: 0. (Verwirft React die Seite,
//     baut es #root neu auf -- dann sind es mehr.)
// Y3  Der Text in #root ist nach dem Übernehmen derselbe wie im ausgelieferten
//     HTML (de-DE; gemessen 2 s nach "load", vor dem ersten Takt des
//     Hero-Fadens, 5 s). /buecher.json wird bis nach der Messung
//     zurückgehalten: Die Bücherliste (Examples.tsx) lädt sie erst nach dem
//     Übernehmen und ändert dann den Text -- gewollt, keine Abweichung.
// Fälle:
//   je Seite        de-DE, alle acht Seiten: Y0-Y3
//   ruhe            "/" mit prefers-reduced-motion: reduce: Y0-Y2
//                   (HeroFaden las die Einstellung schon beim ersten Zeichnen;
//                   danach fällt "Anhalten" gewollt weg, deshalb ohne Y3)
//   neujahr         "/" mit der Uhr des Browsers ein Jahr nach dem Bau: Y1-Y3
//                   (Fußzeile und Impressum lasen das Jahr beim Zeichnen)
//   neujahr-impressum  dasselbe auf /impressum/
//   en-US           "/" mit Browsersprache en-US: Y1, Y2. Danach wechselt die
//                   Seite wie bisher in die erkannte Sprache (Sprachfassungen
//                   mit eigenem Pfad erst mit Schritt 3), Y3 gilt hier nicht.
//   alte-adresse    /?buch=…&utm_source=…&utm_medium=…&utm_campaign=…&utm_content=…#/zugang?rolle=curator
//                   -> landet auf /zugang/ mit allen sechs Angaben, ohne Hash,
//                   und die Seite merkt alle fünf Kampagnenangaben
//                   (sessionStorage plinyoo.kampagne). Dazu Y1, Y2.
//   ohne-strich     /zugang?utm_source=x -> 301 -> /zugang/?utm_source=x (Server
//                   wie oben, keine Aussage über Pages)
//   unbekannt       /gibtsnicht/ -> 404, die Hülle (leerer #root) rendert und
//                   führt auf "/". Ohne Y2: Die Hülle ersetzt ihren Ladehinweis.
//
// Gegenprobe 21.11.2026, node 22.23.4, Chromium aus playwright 1.58.2: je ein
// Bau mit der alten Fassung EINER Stelle -- gemischt() mit Math.random: ROT
// "/", ruhe, neujahr, en-US (Y1 React-Fehler #425, Y2 4 Kinder entfernt);
// HeroFaden mit matchMedia im Anfangswert: ROT ruhe (Y1, Y2); Jahr mit
// new Date(): ROT neujahr und neujahr-impressum (Y1-Y3, "© 2027");
// createRoot statt hydrateRoot: ROT in 14 von 15 Fällen (Y2). Mit allen
// Fixes GRUEN. Bauordner ohne vorgerenderte Seiten: ROT. Ohne dist/: ROT.
// Ohne Playwright: nicht messbar.
// Exit 0 grün, 1 rot, 2 nicht messbar.
// ===========================================================================
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distArg = process.argv.indexOf('--dist');
const DIST = distArg > 0 ? resolve(process.argv[distArg + 1] ?? '') : join(WURZEL, 'dist');
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };
if (!existsSync(join(DIST, 'index.html'))) { console.log(`ROT: ${DIST}/index.html fehlt -- erst npm run build`); process.exit(1); }

// LAEUFER-HAT: playwright samt Chromium -- wie tests/kontaktformular-483.mjs aus dem spoonup-Ordner daneben,
// in pruefungen.yml über PLAYWRIGHT_MODUL. Fehlt es, "nicht messbar", nicht rot.
const kandidaten = [
  process.env.PLAYWRIGHT_MODUL,
  join(WURZEL, '../SpoonUp/apps/web/node_modules/playwright'),
  existsSync(join(WURZEL, 'node_modules')) ? join(realpathSync(join(WURZEL, 'node_modules')), '../../SpoonUp/apps/web/node_modules/playwright') : null,
].filter(Boolean).map((k) => resolve(k));
const PW = kandidaten.find((k) => existsSync(k)) ?? kandidaten[0];
let chromium;
try { ({ chromium } = createRequire(join(WURZEL, 'package.json'))(PW)); } catch (e) { nichtMessbar(`playwright nicht ladbar (${PW}): ${e.message.split('\n')[0]}`); }

// --- Server wie GitHub Pages ------------------------------------------------------------
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' };
const istDatei = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const istOrdner = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const pfad = decodeURIComponent(u.pathname);
  const ziel = join(DIST, pfad);
  if (!ziel.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  const senden = (datei, status = 200) => { res.writeHead(status, { 'content-type': TYP[extname(datei)] ?? 'application/octet-stream' }); res.end(readFileSync(datei)); };
  if (pfad.endsWith('/') && istDatei(join(ziel, 'index.html'))) return senden(join(ziel, 'index.html'));
  if (!pfad.endsWith('/') && istOrdner(ziel) && istDatei(join(ziel, 'index.html'))) { res.writeHead(301, { location: `${pfad}/${u.search}` }); return res.end(); }
  if (istDatei(ziel)) return senden(ziel);
  return senden(join(DIST, '404.html'), 404);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASIS = `http://127.0.0.1:${server.address().port}`;
console.log(`dist: ${DIST}, Server ${BASIS}, playwright ${PW}`);

const ABWEICHUNG = /hydrat|did not match|server rendered HTML|Minified React error #(418|423|425)|error #418|error #423|error #425/i;
const SEITEN = ['/', '/zugang/', '/mitmachen/', '/investieren/', '/impressum/', '/datenschutz/', '/urheberrecht/', '/kontakt/'];
const textAusHtml = async (page, pfad) => {
  const html = readFileSync(join(DIST, ...pfad.split('/').filter(Boolean), 'index.html'), 'utf8');
  return page.evaluate((h) => new DOMParser().parseFromString(h, 'text/html').getElementById('root')?.textContent ?? null, html);
};

async function fall(name, { pfad, locale = 'de-DE', reducedMotion = 'no-preference', jahrPlus = 0, text = true, huelle = false, nachher }) {
  const browser = await chromium.launch({ args: ['--single-process'] });
  const rot = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale, reducedMotion });
    await ctx.route(/^(?!http:\/\/127\.0\.0\.1:)/, (r) => r.abort());
    // Die Bücherliste (Examples.tsx) lädt /buecher.json erst NACH dem Übernehmen und ändert dann den Text.
    // Das ist gewollt und keine Abweichung; die Datei wird bis nach der Messung zurückgehalten.
    const gehalten = [];
    await ctx.route('**/buecher.json', (r) => { gehalten.push(r); });
    const page = await ctx.newPage();
    const meldungen = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) meldungen.push(m.text()); });
    page.on('pageerror', (e) => meldungen.push(`pageerror: ${e.message}`));
    await page.addInitScript((plus) => {
      if (plus) {
        const Echt = Date; const versatz = plus * 365.25 * 24 * 3600 * 1000;
        // eslint-disable-next-line no-global-assign
        Date = class extends Echt { constructor(...a) { super(...(a.length ? a : [Echt.now() + versatz])); } static now() { return Echt.now() + versatz; } };
      }
      window.__rootEntfernt = 0;
      new MutationObserver((ms) => { for (const m of ms) if (m.target.id === 'root' && m.removedNodes.length) window.__rootEntfernt += m.removedNodes.length; })
        .observe(document, { childList: true, subtree: true });
    }, jahrPlus);
    const antwort = await page.goto(BASIS + pfad, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const abw = meldungen.filter((m) => ABWEICHUNG.test(m));
    if (abw.length) rot.push(`Y1 ${abw.length} Meldung(en): ${abw[0].slice(0, 200)}`);
    const entfernt = await page.evaluate(() => window.__rootEntfernt);
    // 404.html ist die leere Hülle: dort ersetzt die Seite den Ladehinweis, das ist gewollt.
    if (entfernt && !huelle) rot.push(`Y2 #root ersetzt (${entfernt} Kinder entfernt)`);
    const jetzt = await page.evaluate(() => document.getElementById('root')?.textContent ?? '');
    if (jetzt.trim().length < 20) rot.push(`Y0 #root ist nach dem Laden leer (${JSON.stringify(jetzt.slice(0, 40))}) -- die Seite rendert nicht`);
    if (text) {
      const vorher = await textAusHtml(page, new URL(page.url()).pathname);
      if (!vorher?.trim()) rot.push('Y0 das ausgelieferte HTML hat einen leeren #root -- nicht vorgerendert');
      if (vorher !== jetzt) {
        let i = 0; while (vorher?.[i] === jetzt?.[i]) i++;
        rot.push(`Y3 Text weicht ab Zeichen ${i} ab: HTML …${vorher?.slice(Math.max(0, i - 50), i + 40)}… / Browser …${jetzt?.slice(Math.max(0, i - 50), i + 40)}…`);
      }
    }
    for (const r of gehalten.splice(0)) await r.continue().catch(() => {});
    if (nachher) rot.push(...(await nachher(page, antwort)));
  } catch (e) {
    rot.push(`Abbruch: ${e.message.split('\n')[0]}`);
  } finally {
    await browser.close();
  }
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${name}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
  return rot.length === 0;
}

const KAMPAGNE = { buch: 'lissabon-1941', utm_source: 'linkedin', utm_medium: 'post', utm_campaign: 'herbst', utm_content: 'bild-2' };
const ergebnisse = [];
for (const s of SEITEN) ergebnisse.push(await fall(`seite ${s}`, { pfad: s }));
// ruhe: Nach dem Übernehmen fällt "Anhalten" weg (bei reduzierter Bewegung gibt es nichts anzuhalten) -- gewollt,
// deshalb hier ohne Y3. Gemessen wird, dass die ERSTE Zeichnung dem HTML entspricht (Y1, Y2).
ergebnisse.push(await fall('ruhe /', { pfad: '/', reducedMotion: 'reduce', text: false }));
ergebnisse.push(await fall('neujahr /', { pfad: '/', jahrPlus: 1 }));
ergebnisse.push(await fall('neujahr /impressum/', { pfad: '/impressum/', jahrPlus: 1 }));
ergebnisse.push(await fall('en-US /', { pfad: '/', locale: 'en-US', text: false }));
ergebnisse.push(await fall('alte-adresse', {
  pfad: `/?${new URLSearchParams(KAMPAGNE)}#/zugang?rolle=curator`,
  nachher: async (page) => {
    const r = [];
    const u = new URL(page.url());
    if (u.pathname !== '/zugang/') r.push(`Pfad ${u.pathname}, erwartet /zugang/`);
    if (u.hash) r.push(`Hash bleibt: ${u.hash}`);
    for (const [k, v] of Object.entries({ ...KAMPAGNE, rolle: 'curator' })) if (u.searchParams.get(k) !== v) r.push(`Angabe ${k}=${u.searchParams.get(k)}, erwartet ${v}`);
    const gemerkt = await page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('plinyoo.kampagne') || '{}'); } catch { return {}; } });
    for (const [k, v] of Object.entries(KAMPAGNE)) if (gemerkt[k] !== v) r.push(`gemerkt ${k}=${gemerkt[k]}, erwartet ${v}`);
    return r;
  },
}));
ergebnisse.push(await fall('ohne-strich', {
  pfad: '/zugang?utm_source=x',
  nachher: async (page) => { const u = new URL(page.url()); return u.pathname === '/zugang/' && u.searchParams.get('utm_source') === 'x' ? [] : [`landet auf ${u.pathname}${u.search}`]; },
}));
ergebnisse.push(await fall('unbekannt', {
  pfad: '/gibtsnicht/', text: false, huelle: true,
  nachher: async (page, antwort) => {
    const r = [];
    if (antwort?.status() !== 404) r.push(`Status ${antwort?.status()}, erwartet 404`);
    await page.waitForFunction(() => location.pathname === '/' && document.getElementById('root')?.textContent.length > 100, null, { timeout: 8000 }).catch(() => r.push(`landet auf ${new URL(page.url()).pathname} ohne Inhalt`));
    return r;
  },
}));

server.close();
const rotZahl = ergebnisse.filter((x) => !x).length;
if (rotZahl) { console.log(`ROT: ${rotZahl} von ${ergebnisse.length} Fällen`); process.exit(1); }
console.log(`GRUEN Y1-Y3: ${ergebnisse.length} Fälle, keine Abweichung beim Übernehmen, #root nie ersetzt, alte Adresse mit Herkunft`);
