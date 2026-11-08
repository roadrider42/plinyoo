#!/usr/bin/env node
// ===========================================================================
// #483 (spoonup) -- Kontaktformulare: ein Fehler endet nie als Erfolg.
//
//   node tests/kontaktformular-483.mjs
//   KONTAKT_BILDER=<ordner> node tests/kontaktformular-483.mjs   (legt je Fall ein Bild bei 390 x 844 ab)
//   PLAYWRIGHT_MODUL=<pfad zu playwright> node ...                (Vorgabe: spoonup neben dem Repo, apps/web/node_modules/playwright)
//
// Gefahren wird die ECHTE Seite: Vite startet diesen Arbeitsbaum, Chromium
// oeffnet die vier Formulare, die useContactForm nutzen (Kontakt, Mitmachen,
// Investieren, Zugang), fuellt sie aus und schickt sie ab. Der Aufruf von
// plinyoo-contact wird abgefangen und mit dem Ausgang beantwortet, den die
// Randfunktion wirklich kennt (supabase/functions/plinyoo-contact/index.ts):
//
//   429  { error: 'GRENZE_ERREICHT', meldung: ... }
//   400  { error: 'Bad Request' }
//   500  { error: 'Failed to save contact' }
//   Netz weg (Anfrage bricht ab)
//   200  { message: 'Form submitted successfully' }   -- Gegenstueck: Erfolg bleibt Erfolg
//
// Je Fehlerausgang muss die Seite genau den festen Satz zeigen (Sprecher
// 41314483), darf die Erfolgsansicht nicht zeigen, zeigt weder die
// Server-`meldung` noch den Servertext, und der Satz steht nach dem Tippen
// ganz im Bild (ohne dass die Pruefung scrollt). Gemessen bei 390 x 844, de-DE.
// Ohne das Einrollen stand der Satz auf /zugang bei y 801..881 -- halb unter
// dem Bildrand.
//
// Vor dem Fix (plinyoo 23de836): alle Fehlerfaelle rot -- die Seite zeigt
// die Erfolgsansicht, weil svc.contact.ts { ok:false } zurueckgibt und
// niemand .ok prueft.
// Ausgang: 0 gruen, 1 rot, 2 nicht messbar.
// ===========================================================================
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = resolve(HIER, '..');
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

// LAEUFER-HAT: playwright samt Chromium -- plinyoo fuehrt es nicht als
// Abhaengigkeit; genommen wird das aus dem spoonup-Ordner daneben. Fehlt es,
// meldet die Pruefung "nicht messbar", nicht rot.
// Neben dem Repo, oder -- in einem Arbeitsbaum, dessen node_modules auf das
// Hauptrepo zeigt -- neben dem Hauptrepo.
const kandidaten = [
  process.env.PLAYWRIGHT_MODUL,
  join(WURZEL, '../SpoonUp/apps/web/node_modules/playwright'),
  existsSync(join(WURZEL, 'node_modules')) ? join(realpathSync(join(WURZEL, 'node_modules')), '../../SpoonUp/apps/web/node_modules/playwright') : null,
].filter(Boolean).map((k) => resolve(k));
const PW = kandidaten.find((k) => existsSync(k)) ?? kandidaten[0];
let chromium;
try {
  ({ chromium } = createRequire(join(WURZEL, 'package.json'))(PW));
} catch (e) {
  nichtMessbar(`playwright nicht ladbar (${PW}): ${e.message.split('\n')[0]}`);
}
let vite;
try {
  vite = await import(createRequire(join(WURZEL, 'package.json')).resolve('vite'));
} catch (e) {
  nichtMessbar(`vite nicht ladbar: ${e.message.split('\n')[0]}`);
}

const BILDER = process.env.KONTAKT_BILDER ? resolve(process.env.KONTAKT_BILDER) : null;
if (BILDER && !existsSync(BILDER)) mkdirSync(BILDER, { recursive: true });

// Die drei Saetze, woertlich (Sprecher 41314483).
const SATZ = {
  429: 'Gerade kommen sehr viele Anfragen an, Ihre Nachricht ist noch nicht bei uns. Bitte versuchen Sie es spätestens in einer Stunde noch einmal.',
  400: 'Ihre Angaben konnten nicht angenommen werden. Bitte prüfen Sie Name, E-Mail-Adresse und Nachricht, kürzen Sie besonders lange Texte und senden Sie das Formular noch einmal.',
  sonst: 'Das Senden hat nicht geklappt. Bitte versuchen Sie es in ein paar Minuten noch einmal.',
};
const SERVER_MELDUNG = 'ATTRAPPE-SERVERMELDUNG bitte nicht anzeigen';

const AUSGAENGE = [
  { id: '429', antwort: { status: 429, body: { error: 'GRENZE_ERREICHT', meldung: SERVER_MELDUNG } }, satz: SATZ[429], servertext: ['GRENZE_ERREICHT', SERVER_MELDUNG] },
  { id: '400', antwort: { status: 400, body: { error: 'Bad Request' } }, satz: SATZ[400], servertext: ['Bad Request'] },
  { id: '500', antwort: { status: 500, body: { error: 'Failed to save contact' } }, satz: SATZ.sonst, servertext: ['Failed to save contact'] },
  { id: 'netz', antwort: 'abbruch', satz: SATZ.sonst, servertext: [] },
  { id: '200', antwort: { status: 200, body: { message: 'Form submitted successfully' } }, satz: null, servertext: [] },
];

// Erfolgsansicht = forms.success.title (de); Formular = die Absendeschaltflaeche.
const ERFOLG_UEBERSCHRIFT = 'Vielen Dank!';
const SEITEN = [
  { id: 'kontakt', pfad: '/#/kontakt', fuellen: async (p) => { await p.fill('input[name=name]', 'Wer'); await p.fill('input[name=email]', 'wer@example.org'); await p.fill('textarea[name=message]', 'Hallo'); } },
  { id: 'mitmachen', pfad: '/#/mitmachen', fuellen: async (p) => { await p.fill('input[name=name]', 'Wer'); await p.fill('input[name=email]', 'wer@example.org'); } },
  { id: 'investieren', pfad: '/#/investieren', fuellen: async (p) => { await p.fill('input[name=name]', 'Wer'); await p.fill('input[name=email]', 'wer@example.org'); } },
  { id: 'zugang', pfad: '/#/zugang', fuellen: async (p) => { await p.fill('input[name=name]', 'Wer'); await p.fill('input[name=email]', 'wer@example.org'); } },
];

const server = await vite.createServer({ root: WURZEL, logLevel: 'silent', server: { port: 0, host: '127.0.0.1', strictPort: false } });
try {
  await server.listen();
} catch (e) {
  nichtMessbar(`vite startet nicht: ${e.message.split('\n')[0]}`);
}
const adresse = server.httpServer.address();
const BASIS = `http://127.0.0.1:${adresse.port}`;
console.log(`Seite: ${BASIS}, playwright: ${PW}`);

const ergebnisse = [];
function pruefe(id, bedingungen) {
  const rot = bedingungen.filter(([ok]) => !ok).map(([, was]) => was);
  ergebnisse.push({ id, rot });
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${id}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
}

async function fall(seite, ausgang) {
  // Ein Browser je Fall: in der Agentenschale laeuft Chromium nur mit
  // --single-process, und dann traegt ein Prozess verlaesslich nur eine Seite.
  const browser = await chromium.launch({ args: ['--single-process'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'de'); } catch { /* egal */ } });
    let aufrufe = 0;
    await page.route('**/functions/v1/plinyoo-contact', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: 'ok' });
      aufrufe++;
      if (ausgang.antwort === 'abbruch') return route.abort('internetdisconnected');
      return route.fulfill({ status: ausgang.antwort.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(ausgang.antwort.body) });
    });
    await page.goto(BASIS + seite.pfad, { waitUntil: 'networkidle' });
    const absenden = page.locator('form button[type=submit]');
    await absenden.waitFor({ timeout: 15000 });
    await seite.fuellen(page);
    await absenden.click();
    // Warten, bis die Seite reagiert hat: Erfolgsansicht ODER irgendein Satz.
    const erwartet = ausgang.satz ?? ERFOLG_UEBERSCHRIFT;
    await page.getByText(erwartet, { exact: false }).first().waitFor({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
    const text = await page.locator('body').innerText();
    const erfolg = await page.getByRole('heading', { name: ERFOLG_UEBERSCHRIFT }).count();
    const formular = await page.locator('form button[type=submit]').count();
    // Wo steht der Satz nach dem Tippen, ohne dass die Pruefung scrollt?
    const hinweis = page.getByRole('alert');
    const box = ausgang.satz && (await hinweis.count()) ? await hinweis.first().boundingBox() : null;
    const imBild = box ? box.y >= -1 && box.y + box.height <= 845 : null; // 1 px fuer Bruchteile
    if (BILDER) {
      // Bild: Satz bzw. Erfolgsansicht mittig, damit er ganz zu sehen ist.
      const ziel = ausgang.satz ? hinweis.first() : page.getByRole('heading', { name: ERFOLG_UEBERSCHRIFT });
      if (await ziel.count()) await ziel.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await page.screenshot({ path: join(BILDER, `${seite.id}-${ausgang.id}.png`), fullPage: false });
    }
    if (ausgang.satz) console.log(`      ${seite.id} ${ausgang.id}: Satz nach dem Tippen ${imBild ? 'im Bild' : 'NICHT ganz im Bild'} (y ${box ? Math.round(box.y) : '-'}..${box ? Math.round(box.y + box.height) : '-'} von 844)`);
    const b = [[aufrufe === 1, `${aufrufe} Aufruf(e) der Randfunktion`]];
    if (ausgang.satz) {
      b.push([text.includes(ausgang.satz), `fester Satz fehlt (sichtbar: ${text.replace(/\s+/g, ' ').slice(-240)})`]);
      b.push([erfolg === 0, 'zeigt die Erfolgsansicht']);
      b.push([formular === 1, 'Formular ist weg']);
      b.push([imBild === true, `Satz nach dem Tippen nicht ganz im Bild (y ${box ? Math.round(box.y) : '-'}..${box ? Math.round(box.y + box.height) : '-'} von 844)`]);
      for (const s of Object.values(SATZ)) if (s !== ausgang.satz) b.push([!text.includes(s), `zeigt einen fremden Satz: ${s.slice(0, 40)}`]);
      for (const s of ausgang.servertext) b.push([!text.includes(s), `zeigt Servertext: ${s}`]);
    } else {
      b.push([erfolg === 1, 'Erfolgsansicht fehlt']);
      for (const s of Object.values(SATZ)) b.push([!text.includes(s), `zeigt bei Erfolg einen Fehlersatz: ${s.slice(0, 40)}`]);
    }
    pruefe(`${seite.id} ${ausgang.id}`, b);
  } catch (e) {
    pruefe(`${seite.id} ${ausgang.id}`, [[false, `Lauf abgebrochen: ${e.message.split('\n')[0]}`]]);
  } finally {
    await browser.close();
  }
}

try {
  for (const seite of SEITEN) for (const ausgang of AUSGAENGE) await fall(seite, ausgang);
} finally {
  await server.close();
}
const rot = ergebnisse.filter((e) => e.rot.length);
console.log(`\n${ergebnisse.length - rot.length} GRUEN, ${rot.length} ROT${rot.length ? ': ' + rot.map((e) => e.id).join(', ') : ''}`);
process.exit(rot.length ? 1 : 0);
