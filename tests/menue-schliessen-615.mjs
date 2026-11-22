#!/usr/bin/env node
// ===========================================================================
// #615 (spoonup) -- das offene Menü lässt sich am Telefon wieder schließen.
//
//   node tests/menue-schliessen-615.mjs                 liest dist/ (nach npm run build)
//   node tests/menue-schliessen-615.mjs --dist <ordner>
//   PLAYWRIGHT_MODUL=<pfad zu playwright> node ...  (Vorgabe wie tests/kontaktformular-483.mjs)
//
// Befund (Gestalter, spoonup claude/609/abnahme-55/befund.md): Das Menü ist
// eine Ebene "fixed inset-0 z-40" im Stapelkontext des Kopfs (sticky z-50).
// Die Umschalt-Schaltfläche hatte keine z-Stufe und lag darunter. Ein Tipp auf
// ihre Stelle traf die Ebene, Escape tat nichts -- das Menü ließ sich nur
// verlassen, nicht schließen. Die Schaltfläche maß 40 x 40.
//
// Gemessen bei 390 x 844 (DPR 2, de-DE) auf jeder Unterseite mit Kopf. Ein
// kleiner Server liefert dist/ aus wie tests/hydration-609.mjs.
//
// M1  Geschlossen: die Schaltfläche (header button[aria-label][aria-expanded]) misst
//     mindestens 44 x 44.
// M2  Nach dem Öffnen: aria-expanded=true, die Schaltfläche liegt OBEN
//     (elementFromPoint in ihrer Mitte trifft sie), misst mindestens 44 x 44,
//     zeigt das X-Symbol (Pfad "M6 18L18 6M6 6l12 12") und der Punkt 354/32
//     liegt auf ihr.
// M3  Tipp auf 354/32 (wie die Nachmessung des Gestalters, probe.cjs):
//     aria-expanded=false, die Menüebene ist weg.
// M4  Wieder öffnen, Escape: aria-expanded=false, die Menüebene ist weg.
//
// Gegenprobe 22.11.2026, node 22, Chromium aus playwright 1.58.2, je voller
// Bau (npm run build): origin/main 1d2792b ohne Fix ROT 5 von 5 (M1 40 x 40,
// M2 verdeckt, M3 und M4 bleibt offen); Fix ohne "relative z-50" ROT 5 von 5
// (M2, M3); mit Fix GRUEN 5 von 5.
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

// --- Server wie tests/hydration-609.mjs ----------------------------------------------------
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' };
const istDatei = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const pfad = decodeURIComponent(u.pathname);
  const ziel = join(DIST, pfad);
  if (!ziel.startsWith(DIST)) { res.writeHead(400); return res.end(); }
  const senden = (datei, status = 200) => { res.writeHead(status, { 'content-type': TYP[extname(datei)] ?? 'application/octet-stream' }); res.end(readFileSync(datei)); };
  if (pfad.endsWith('/') && istDatei(join(ziel, 'index.html'))) return senden(join(ziel, 'index.html'));
  if (istDatei(ziel)) return senden(ziel);
  return senden(join(DIST, '404.html'), 404);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASIS = `http://127.0.0.1:${server.address().port}`;
console.log(`dist: ${DIST}, Server ${BASIS}, playwright ${PW}`);

// Unterseiten mit Kopf. Die Startseite hat keine Umschalt-Schaltfläche (Befund, Abschnitt 3).
const SEITEN = ['/zugang/', '/mitmachen/', '/investieren/', '/kontakt/', '/impressum/'];
const TIPP = { x: 354, y: 32 };
const MIN = 44;
const X_PFAD = 'M6 18L18 6M6 6l12 12';
// Mit aria-label: Die Sprachwahl im Kopf (headlessui) trägt auch aria-expanded, steht vorn und ist unter 768 px verborgen.
const KNOPF = 'header button[aria-label][aria-expanded]';

const lage = (tipp) => {
  const b = document.querySelector('header button[aria-label][aria-expanded]');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const mitte = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {
    exp: b.getAttribute('aria-expanded'),
    w: r.width, h: r.height,
    oben: !!mitte && (mitte === b || b.contains(mitte)),
    deckt: mitte && !(mitte === b || b.contains(mitte)) ? `${mitte.tagName}.${String(mitte.className).split(' ').slice(0, 4).join('.')}` : null,
    tippAufKnopf: tipp.x >= r.left && tipp.x <= r.right && tipp.y >= r.top && tipp.y <= r.bottom,
    pfade: [...b.querySelectorAll('path')].map((p) => p.getAttribute('d')),
    ebene: document.querySelectorAll('header .fixed.inset-0').length,
  };
};

async function fall(pfad) {
  const browser = await chromium.launch({ args: ['--single-process'] });
  const rot = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'de-DE' });
    await ctx.route(/^(?!http:\/\/127\.0\.0\.1:)/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(BASIS + pfad, { waitUntil: 'load' });
    await page.waitForSelector(KNOPF, { timeout: 8000 });
    await page.waitForTimeout(800);
    const jetzt = () => page.evaluate(lage, TIPP);

    // M1
    let z = await jetzt();
    if (z.w < MIN || z.h < MIN) rot.push(`M1 geschlossen ${Math.round(z.w)} x ${Math.round(z.h)}, erwartet mind. ${MIN} x ${MIN}`);

    // M2
    await page.locator(KNOPF).first().click();
    await page.waitForTimeout(300);
    z = await jetzt();
    if (z.exp !== 'true') rot.push(`M2 nach dem Öffnen aria-expanded=${z.exp}`);
    if (!z.oben) rot.push(`M2 Schaltfläche verdeckt von ${z.deckt}`);
    if (z.w < MIN || z.h < MIN) rot.push(`M2 offen ${Math.round(z.w)} x ${Math.round(z.h)}, erwartet mind. ${MIN} x ${MIN}`);
    if (!z.pfade.includes(X_PFAD)) rot.push(`M2 kein X-Symbol (Pfade ${JSON.stringify(z.pfade)})`);
    if (!z.tippAufKnopf) rot.push(`M2 ${TIPP.x}/${TIPP.y} liegt nicht auf der Schaltfläche`);

    // M3
    await page.mouse.click(TIPP.x, TIPP.y);
    await page.waitForTimeout(300);
    z = await jetzt();
    if (z.exp !== 'false') rot.push(`M3 nach Tipp auf ${TIPP.x}/${TIPP.y} aria-expanded=${z.exp}`);
    if (z.ebene) rot.push(`M3 Menüebene nach dem Tipp noch da`);

    // M4
    if (z.exp !== 'true') { await page.locator(KNOPF).first().click(); await page.waitForTimeout(300); }
    z = await jetzt();
    if (z.exp !== 'true') rot.push(`M4 Menü lässt sich nicht wieder öffnen`);
    else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      z = await jetzt();
      if (z.exp !== 'false') rot.push(`M4 nach Escape aria-expanded=${z.exp}`);
      if (z.ebene) rot.push(`M4 Menüebene nach Escape noch da`);
    }
  } catch (e) {
    rot.push(`Abbruch: ${e.message.split('\n')[0]}`);
  } finally {
    await browser.close();
  }
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${pfad}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
  return rot.length === 0;
}

const ergebnisse = [];
for (const s of SEITEN) ergebnisse.push(await fall(s));
server.close();
const rotZahl = ergebnisse.filter((x) => !x).length;
if (rotZahl) { console.log(`ROT: ${rotZahl} von ${ergebnisse.length} Seiten`); process.exitCode = 1; }
else console.log(`GRUEN M1-M4: ${ergebnisse.length} Seiten, Schaltfläche oben, 44 x 44, X im offenen Menü, Tipp und Escape schließen`);
