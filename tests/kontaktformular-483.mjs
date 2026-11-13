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
//   adresse    'a@b' -- gueltig fuer type=email, nicht fuer zod: Satz 400, kein Aufruf
//   undefined  fetch liefert undefined -- ein Fehler, der kein KontaktFehler ist: Satz sonst
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
//
// #533: Die Saetze stehen in du (Sprecher 2c335cf93) und kommen aus den
// Sprachdateien. Dazu:
//   zu_lang       Name mit 201 Zeichen (Grenze 200 wie plinyoo-contact): der
//                 Browser erkennt too_big, zeigt "Ein Feld enthaelt zu viel
//                 Text", ruft die Randfunktion nicht
//   zu_lang_text  /kontakt, Nachricht mit 5001 Zeichen: dasselbe
//   en-*, uk-*    /kontakt in en und uk: 429, 400, zu_lang je im Wortlaut der
//                 Sprache, kein deutscher Satz
//   uk-rueckfall  uk-Datei ohne die drei Saetze: der en-Satz, nie der Schluessel
//   *-500, *-netz der allgemeine Satz (Sprecher 70834fc61) in du, in en und uk
//                 im Wortlaut der Sprache; uk-rueckfall-500: uk ohne ihn -> en
// Vor dem allgemeinen Satz (plinyoo 607d0c8): 500, netz und undefined zeigen
// "versuchen Sie es in ein paar Minuten", en/uk-500 zeigen Deutsch -- rot.
// Vor dem Fix (plinyoo 3e17abb): 429 und 400 zeigen die Sie-Saetze, zu_lang
// ruft die Randfunktion und zeigt den 400-Satz, en/uk zeigen Deutsch -- rot.
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

// Die Saetze, woertlich. 429, 400, zu_lang: du (Sprecher 2c335cf93, #533);
// sonst: der allgemeine Satz, du (Sprecher 70834fc61, #533).
const SATZ = {
  429: 'Gerade kommen sehr viele Anfragen an. Deine Nachricht ist noch nicht bei uns. Bitte versuche es spätestens in einer Stunde noch einmal.',
  400: 'Deine Angaben konnten nicht angenommen werden. Bitte prüfe Name, E-Mail-Adresse und Nachricht, kürze besonders lange Texte und sende das Formular noch einmal.',
  zu_lang: 'Ein Feld enthält zu viel Text. Deine Nachricht ist noch nicht bei uns. Bitte kürze den Text und sende das Formular noch einmal.',
  sonst: 'Das Senden hat nicht geklappt. Bitte versuche es später noch einmal.',
};
// Die Sie-Saetze aus #483 duerfen nirgends mehr erscheinen.
const ALT_SIE = [
  'Gerade kommen sehr viele Anfragen an, Ihre Nachricht ist noch nicht bei uns.',
  'Ihre Angaben konnten nicht angenommen werden.',
  'Das Senden hat nicht geklappt. Bitte versuchen Sie es in ein paar Minuten noch einmal.',
];
// en und uk (Wortlaut wie tests/kontakt-meldung-533.mjs).
const FREMD = {
  en: {
    429: 'We are receiving a lot of requests right now. Your message has not reached us yet. Please try again in an hour at the latest.',
    400: 'Your details could not be accepted. Please check your name, email address and message, shorten particularly long texts and send the form again.',
    zu_lang: 'One field contains too much text. Your message has not reached us yet. Please shorten the text and send the form again.',
    sonst: 'Sending did not work. Please try again later.',
  },
  uk: {
    429: 'Зараз надходить дуже багато запитів. Твоє повідомлення ще не дійшло до нас. Будь ласка, спробуй ще раз щонайпізніше за годину.',
    400: 'Твої дані не вдалося прийняти. Будь ласка, перевір ім’я, адресу електронної пошти та повідомлення, скороти особливо довгі тексти і надішли форму ще раз.',
    zu_lang: 'Одне з полів містить забагато тексту. Твоє повідомлення ще не дійшло до нас. Будь ласка, скороти текст і надішли форму ще раз.',
    sonst: 'Не вдалося надіслати. Будь ласка, спробуй ще раз пізніше.',
  },
};
const SERVER_MELDUNG = 'ATTRAPPE-SERVERMELDUNG bitte nicht anzeigen';

const AUSGAENGE = [
  { id: '429', antwort: { status: 429, body: { error: 'GRENZE_ERREICHT', meldung: SERVER_MELDUNG } }, satz: SATZ[429], servertext: ['GRENZE_ERREICHT', SERVER_MELDUNG] },
  { id: '400', antwort: { status: 400, body: { error: 'Bad Request' } }, satz: SATZ[400], servertext: ['Bad Request'] },
  { id: '500', antwort: { status: 500, body: { error: 'Failed to save contact' } }, satz: SATZ.sonst, servertext: ['Failed to save contact'] },
  { id: 'netz', antwort: 'abbruch', satz: SATZ.sonst, servertext: [] },
  { id: '200', antwort: { status: 200, body: { message: 'Form submitted successfully' } }, satz: null, servertext: [] },
  // Review #483r, Verstellung A: eine Adresse, die der Browser annimmt
  // (type=email), zod aber nicht. Die eigene Formpruefung muss den Satz 400
  // zeigen und darf die Randfunktion nie rufen. Kaeme der Aufruf doch durch,
  // antwortet die Attrappe mit 200 -- dann stuende "Vielen Dank" da.
  // Abgeschickt wird mit Enter im Adressfeld: Auf /kontakt sperrt die Seite die
  // Schaltflaeche, sobald das Feld mit einer falschen Adresse verlassen wird --
  // offen ist der Weg also nur ohne Verlassen des Feldes (Review #483r).
  { id: 'adresse', email: 'a@b', absenden: 'enter', antwort: { status: 200, body: { message: 'Form submitted successfully' } }, aufrufe: 0, satz: SATZ[400], servertext: ['Invalid email address', 'Validation'] },
  // Review #483r, Verstellung B: fetch liefert undefined. response.ok wirft
  // dann einen TypeError, der kein KontaktFehler ist -- der Zweig "unerwarteter
  // Fehler" in kontaktFehlerSatz. Er muss den allgemeinen Satz zeigen, weder
  // einen leeren Hinweis noch den englischen Systemtext.
  { id: 'undefined', antwort: 'undefined', satz: SATZ.sonst, servertext: ['Cannot read', 'undefined', 'TypeError'] },
  // #533: zu lang -- erkannt im Browser, kein Aufruf. Kaeme er doch durch,
  // antwortet die Attrappe wie die Randfunktion mit 400 ohne Grund.
  { id: 'zu_lang', name: 'a'.repeat(201), antwort: { status: 400, body: { error: 'Bad Request' } }, aufrufe: 0, satz: SATZ.zu_lang, servertext: ['Bad Request', 'too_big', 'Too big'] },
];
const KONTAKT_400 = { status: 400, body: { error: 'Bad Request' } };
// Nur /kontakt: Nachricht zu lang, und die Sprachen.
const NUR_KONTAKT = [
  { id: 'zu_lang_text', nachricht: 'a'.repeat(5001), antwort: KONTAKT_400, aufrufe: 0, satz: SATZ.zu_lang, servertext: ['Bad Request', 'too_big'] },
  ...['en', 'uk'].flatMap((l) => [
    { id: `${l}-429`, sprache: l, antwort: { status: 429, body: { error: 'GRENZE_ERREICHT', meldung: SERVER_MELDUNG } }, satz: FREMD[l][429], servertext: ['GRENZE_ERREICHT', SERVER_MELDUNG] },
    { id: `${l}-400`, sprache: l, antwort: KONTAKT_400, satz: FREMD[l][400], servertext: ['Bad Request'] },
    { id: `${l}-zu_lang`, sprache: l, name: 'a'.repeat(201), antwort: KONTAKT_400, aufrufe: 0, satz: FREMD[l].zu_lang, servertext: ['Bad Request', 'too_big'] },
    { id: `${l}-500`, sprache: l, antwort: { status: 500, body: { error: 'Failed to save contact' } }, satz: FREMD[l].sonst, servertext: ['Failed to save contact'] },
    { id: `${l}-netz`, sprache: l, antwort: 'abbruch', satz: FREMD[l].sonst, servertext: [] },
  ]),
  { id: 'uk-rueckfall', sprache: 'uk', ohneSaetze: true, antwort: { status: 429, body: { error: 'GRENZE_ERREICHT', meldung: SERVER_MELDUNG } }, satz: FREMD.en[429], servertext: ['GRENZE_ERREICHT', SERVER_MELDUNG, 'forms.validation'] },
  { id: 'uk-rueckfall-500', sprache: 'uk', ohneSaetze: true, antwort: { status: 500, body: { error: 'Failed to save contact' } }, satz: FREMD.en.sonst, servertext: ['Failed to save contact', 'forms.validation'] },
];

// Erfolgsansicht = forms.success.title (de); Formular = die Absendeschaltflaeche.
const ERFOLG_UEBERSCHRIFT = 'Vielen Dank!';
const SEITEN = [
  { id: 'kontakt', pfad: '/#/kontakt', fuellen: async (p, email, a) => { await p.fill('input[name=name]', a.name ?? 'Wer'); await p.fill('textarea[name=message]', a.nachricht ?? 'Hallo'); await p.fill('input[name=email]', email); } },
  { id: 'mitmachen', pfad: '/#/mitmachen', fuellen: async (p, email, a) => { await p.fill('input[name=name]', a.name ?? 'Wer'); await p.fill('input[name=email]', email); } },
  { id: 'investieren', pfad: '/#/investieren', fuellen: async (p, email, a) => { await p.fill('input[name=name]', a.name ?? 'Wer'); await p.fill('input[name=email]', email); } },
  { id: 'zugang', pfad: '/#/zugang', fuellen: async (p, email, a) => { await p.fill('input[name=name]', a.name ?? 'Wer'); await p.fill('input[name=email]', email); } },
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
    const sprache = ausgang.sprache ?? 'de';
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: sprache, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.addInitScript((l) => { try { localStorage.setItem('i18nextLng', l); } catch { /* egal */ } }, sprache);
    if (ausgang.ohneSaetze) {
      // Die Sprachdatei, wie sie aussaehe, wenn ihr die drei Saetze fehlten.
      await page.route(`**/locales/${sprache}/translation.json`, async (route) => {
        const r = await route.fetch();
        const j = await r.json();
        for (const k of ['error_rate_limit', 'error_too_long', 'error_rejected', 'error_send_failed']) delete j.forms?.validation?.[k];
        await route.fulfill({ response: r, body: JSON.stringify(j), contentType: 'application/json' });
      });
    }
    let aufrufe = 0;
    if (ausgang.antwort === 'undefined') {
      // Kein Netzweg kann "undefined" liefern; deshalb wird fetch selbst
      // ersetzt, nur fuer plinyoo-contact. Gezaehlt wird im Fenster.
      await page.addInitScript(() => {
        const echt = window.fetch.bind(window);
        window.__kontaktAufrufe = 0;
        window.fetch = (eingabe, init) => {
          const url = typeof eingabe === 'string' ? eingabe : eingabe?.url ?? String(eingabe);
          if (url.includes('/functions/v1/plinyoo-contact')) { window.__kontaktAufrufe++; return Promise.resolve(undefined); }
          return echt(eingabe, init);
        };
      });
    }
    await page.route('**/functions/v1/plinyoo-contact', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: 'ok' });
      aufrufe++;
      if (ausgang.antwort === 'abbruch') return route.abort('internetdisconnected');
      return route.fulfill({ status: ausgang.antwort.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(ausgang.antwort.body) });
    });
    await page.goto(BASIS + seite.pfad, { waitUntil: 'networkidle' });
    const absenden = page.locator('form button[type=submit]');
    await absenden.waitFor({ timeout: 15000 });
    await seite.fuellen(page, ausgang.email ?? 'wer@example.org', ausgang);
    if (ausgang.absenden === 'enter') await page.press('input[name=email]', 'Enter');
    else await absenden.click();
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
    if (ausgang.antwort === 'undefined') aufrufe = await page.evaluate(() => window.__kontaktAufrufe ?? 0);
    const sollAufrufe = ausgang.aufrufe ?? 1;
    const b = [[aufrufe === sollAufrufe, `${aufrufe} Aufruf(e) der Randfunktion, erwartet ${sollAufrufe}`]];
    if (ausgang.satz) {
      b.push([text.includes(ausgang.satz), `fester Satz fehlt (sichtbar: ${text.replace(/\s+/g, ' ').slice(-240)})`]);
      b.push([erfolg === 0, 'zeigt die Erfolgsansicht']);
      b.push([formular === 1, 'Formular ist weg']);
      b.push([imBild === true, `Satz nach dem Tippen nicht ganz im Bild (y ${box ? Math.round(box.y) : '-'}..${box ? Math.round(box.y + box.height) : '-'} von 844)`]);
      for (const s of [...Object.values(SATZ), ...ALT_SIE]) if (s !== ausgang.satz) b.push([!text.includes(s), `zeigt einen fremden Satz: ${s.slice(0, 40)}`]);
      for (const s of ausgang.servertext) b.push([!text.includes(s), `zeigt Servertext: ${s}`]);
    } else {
      b.push([erfolg === 1, 'Erfolgsansicht fehlt']);
      for (const s of [...Object.values(SATZ), ...ALT_SIE]) b.push([!text.includes(s), `zeigt bei Erfolg einen Fehlersatz: ${s.slice(0, 40)}`]);
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
  for (const ausgang of NUR_KONTAKT) await fall(SEITEN[0], ausgang);
} finally {
  await server.close();
}
const rot = ergebnisse.filter((e) => e.rot.length);
console.log(`\n${ergebnisse.length - rot.length} GRUEN, ${rot.length} ROT${rot.length ? ': ' + rot.map((e) => e.id).join(', ') : ''}`);
process.exit(rot.length ? 1 : 0);
