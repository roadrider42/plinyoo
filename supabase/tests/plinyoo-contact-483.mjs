#!/usr/bin/env node
// ===========================================================================
// #483 (spoonup) -- plinyoo-contact: Grenze fuer alle zusammen, Formpruefung,
// keine Datenbank- oder Mailfehler an den Aufrufer. Beide Richtungen.
//
//   node supabase/tests/plinyoo-contact-483.mjs
//   PLINYOO_CONTACT_INDEX=<andere index.ts> node ...      (Gegenprobe ohne Fix)
//   SPOONUP_WURZEL=<spoonup-Ordner> node ...              (Vorgabe: ../SpoonUp)
//   SPOONUP_REF=<zweig> node ...                          (liest spoonup per git show statt aus dem Arbeitsbaum)
//
// Gefahren wird die AUSGELIEFERTE index.ts, kein Nachbau: esbuild buendelt
// sie, ersetzt sind nur die Netz-Importe -- supabase-js (createClient gibt
// einen Rekorder) und resend (Rekorder). Deno.serve faengt den Handler,
// Deno.env ist eine Attrappe. Kein Netz, keine Datenbank.
//
// Heiko, E-357 (08.11.2026): plinyoo-contact bleibt ohne Anmeldung
// erreichbar, zaehlt aber ueber DENSELBEN Zaehler wie contact-fom-email in
// spoonup (kontaktmail_buchen, SQL-Datei 20270303090000 in spoonup).
//
// Faelle:
//   G1  KONTAKTMAIL_GRENZE steht in index.ts und gleicht der in spoonup
//       (supabase/functions/contact-fom-email/index.ts)
//   G2  der Kopf der Funktion nennt die Reihenfolge: erst 20270303 einspielen
//   K1  gueltiges Formular, Zaehler 'erlaubt'  -> 200, genau EINE Buchung mit
//       der Grenze aus G1 und dem Dienstschluessel, VOR Zeile und Mail; eine
//       Zeile, eine Mail
//   K2  Zaehler 'gesamt'                       -> 429 GRENZE_ERREICHT, keine Zeile, keine Mail
//   K3  Buchung scheitert                       -> 500, keine Zeile, keine Mail, kein Datenbanktext
//   K4  Buchung antwortet Unbekanntes           -> 500, keine Zeile, keine Mail
//   K6  Buchung wirft (Netz weg)                -> 500, keine Zeile, keine Mail, kein Fehlertext
//   K5  Folge Grenze+3 gegen einen Zaehler      -> genau Grenze Mails, 3x 429
//   F1  Fall 27 der Diagnose: Name 5000 Zeichen, keine Adresse, formType 'egal'
//                                               -> 400, keine Buchung, keine Zeile, keine Mail
//   F2  gueltig bis auf Nachricht mit 5001 Zeichen -> 400, keine Wirkung
//   F3  gueltig bis auf die Adresse             -> 400, keine Wirkung
//   F4  gueltig bis auf formType                -> 400, keine Wirkung
//   F5  kein JSON                               -> 400, keine Wirkung
//   F6  Nachricht mit genau 5000 Zeichen        -> 200 (die Grenze sperrt keine echte Anfrage)
//   D1  Fall 25 der Diagnose: Zeile scheitert (42P01) -> 500, keine Mail, Antwort
//       ohne Fehlercode und ohne Fehlertext der Datenbank
//   D2  Mail scheitert (Resend-Fehler nennt den Empfaenger) -> 500, Antwort ohne
//       Empfaenger, ohne Fehlertext, ohne Fehlercode
//
// Ohne Fix (plinyoo 876929b, bytegleich mit live): G1, G2, K1-K6, F1-F4, D1, D2 rot.
// Ausgang: 0 gruen, 1 rot, 2 nicht messbar.
// ===========================================================================
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = resolve(HIER, '../..');
const INDEX = resolve(process.env.PLINYOO_CONTACT_INDEX || join(WURZEL, 'supabase/functions/plinyoo-contact/index.ts'));
const SPOONUP = resolve(process.env.SPOONUP_WURZEL || join(WURZEL, '../SpoonUp'));
const SPOONUP_DATEI = 'supabase/functions/contact-fom-email/index.ts';

const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

let esbuild;
try {
  esbuild = createRequire(join(WURZEL, 'package.json'))('esbuild');
} catch (e) {
  nichtMessbar(`esbuild nicht ladbar (${e.message})`);
}
if (!existsSync(INDEX)) nichtMessbar(`${INDEX} fehlt`);
const quelle = readFileSync(INDEX, 'utf8');
console.log(`Funktion: ${INDEX}, esbuild ${esbuild.version}`);

// --- spoonup-Grenze lesen ---------------------------------------------------
// LAEUFER-HAT: git -- nur fuer SPOONUP_REF; ohne den Schalter wird nur gelesen
let spoonupQuelle;
try {
  spoonupQuelle = process.env.SPOONUP_REF
    ? execFileSync('git', ['-C', SPOONUP, 'show', `${process.env.SPOONUP_REF}:${SPOONUP_DATEI}`], { encoding: 'utf8' })
    : readFileSync(join(SPOONUP, SPOONUP_DATEI), 'utf8');
} catch (e) {
  nichtMessbar(`spoonup nicht lesbar (${SPOONUP}, ${process.env.SPOONUP_REF || 'Arbeitsbaum'}): ${e.message.split('\n')[0]}`);
}
const GRENZE_MUSTER = /const\s+KONTAKTMAIL_GRENZE\s*=\s*\{\s*anzahl:\s*(\d+)\s*,\s*fenster_minuten:\s*(\d+)\s*\}/g;
const lesenGrenze = (text) => [...text.matchAll(GRENZE_MUSTER)].map((m) => ({ anzahl: Number(m[1]), fenster_minuten: Number(m[2]) }));
const spoonupGrenzen = lesenGrenze(spoonupQuelle);
if (spoonupGrenzen.length !== 1) {
  nichtMessbar(`spoonup ${SPOONUP_DATEI} (${process.env.SPOONUP_REF || 'Arbeitsbaum'}) traegt ${spoonupGrenzen.length}x KONTAKTMAIL_GRENZE, erwartet 1 -- anderen Stand mit SPOONUP_REF waehlen`);
}
const SOLL = spoonupGrenzen[0];
console.log(`spoonup-Grenze: ${SOLL.anzahl} je ${SOLL.fenster_minuten} min (${process.env.SPOONUP_REF || 'Arbeitsbaum'})`);

// --- Rekorder ---------------------------------------------------------------
let spur = [];
let lage = {};
const rec = (art, was) => spur.push({ art, was });
const umgebung = {
  SUPABASE_URL: 'http://attrappe', SUPABASE_SERVICE_ROLE_KEY: 'attrappe-dienst',
  RESEND_API_KEY: 'attrappe-resend', CONTACT_RECEIVER_EMAIL: 'postfach-heiko@example.org',
};
let handler = null;
globalThis.Deno = { env: { get: (k) => umgebung[k] }, serve: (h) => { handler = h; } };
globalThis.fetch = async (url) => { rec('NETZ', String(url)); throw new Error('attrappe: kein Netz'); };

globalThis.__plinyoo483 = {
  createClient(url, key) {
    rec('createClient', key);
    return {
      rpc: async (name, args) => {
        rec('RPC', { name, args, key });
        return lage.rpc(name, args);
      },
      from: (tabelle) => ({
        insert: async (zeile) => {
          rec('ZEILE', { tabelle, zeile });
          return lage.zeile ? lage.zeile() : { data: null, error: null };
        },
      }),
    };
  },
  Resend: class {
    constructor(k) { rec('Resend', k); }
    get emails() {
      return { send: async (m) => { rec('MAIL', m); return lage.mail ? lage.mail() : { data: { id: 'mail-1' }, error: null }; } };
    }
  },
};
const attrappen = {
  supa: 'export function createClient(...a) { return globalThis.__plinyoo483.createClient(...a); }',
  resend: 'export const Resend = globalThis.__plinyoo483.Resend;',
};
const netzImporte = { name: 'netz-importe', setup(b) {
  b.onResolve({ filter: /^https:\/\/esm\.sh\/@supabase\/supabase-js@/ }, () => ({ path: 'supa', namespace: 'attrappe' }));
  b.onResolve({ filter: /^https:\/\/esm\.sh\/resend@/ }, () => ({ path: 'resend', namespace: 'attrappe' }));
  b.onResolve({ filter: /^(https?:|npm:|jsr:)/ }, (a) => ({ errors: [{ text: `${a.path}: unbekannter Netz-Import -- hier eintragen` }] }));
  b.onLoad({ filter: /.*/, namespace: 'attrappe' }, (a) => ({ contents: attrappen[a.path], loader: 'js' }));
} };

const ziel = join(mkdtempSync(join(tmpdir(), 'plinyoo-contact-483-')), 'index.mjs');
try {
  await esbuild.build({ entryPoints: [INDEX], bundle: true, write: true, outfile: ziel, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [netzImporte] });
  await import(pathToFileURL(ziel).href);
} catch (e) {
  nichtMessbar(`index.ts laesst sich nicht buendeln oder laden: ${e.message.split('\n')[0]}`);
}
if (typeof handler !== 'function') nichtMessbar('index.ts registriert keinen Handler ueber Deno.serve');

// --- Helfer -----------------------------------------------------------------
const gueltig = { name: 'Wer auch immer', email: 'wer@example.org', formType: 'contact', message: 'Hallo' };
const erlaubt = () => ({ data: 'erlaubt', error: null });
const stilleKonsole = { error: console.error, warn: console.warn, log: console.log };

async function rufe(body, l) {
  spur = [];
  lage = { rpc: erlaubt, ...l };
  const roh = typeof body === 'string' ? body : JSON.stringify(body);
  const req = new Request('http://attrappe/functions/v1/plinyoo-contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: roh });
  // Die Funktion protokolliert Fehler -- hier nur gesammelt, nicht gezeigt.
  const protokoll = [];
  console.error = (...a) => protokoll.push(a.map(String).join(' '));
  console.warn = console.error;
  let antwort;
  try {
    antwort = await handler(req);
  } finally {
    console.error = stilleKonsole.error;
    console.warn = stilleKonsole.warn;
  }
  const text = await antwort.text();
  const zahl = (art) => spur.filter((s) => s.art === art).length;
  return { status: antwort.status, text, spur: [...spur], rpc: zahl('RPC'), zeilen: zahl('ZEILE'), mails: zahl('MAIL'), netz: zahl('NETZ'), protokoll };
}

const ergebnisse = [];
function pruefe(id, bedingungen) {
  const rot = bedingungen.filter(([ok]) => !ok).map(([, was]) => was);
  ergebnisse.push({ id, rot });
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${id}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
}
const keineWirkung = (r) => [
  [r.rpc === 0, `bucht ${r.rpc}x`],
  [r.zeilen === 0, `schreibt ${r.zeilen} Zeile(n)`],
  [r.mails === 0, `schickt ${r.mails} Mail(s)`],
  [r.netz === 0, `${r.netz} Netzaufruf(e)`],
];

// --- G1 / G2 ----------------------------------------------------------------
const eigene = lesenGrenze(quelle);
pruefe('G1 KONTAKTMAIL_GRENZE gleicht spoonup', [
  [eigene.length === 1, `index.ts traegt ${eigene.length}x KONTAKTMAIL_GRENZE, erwartet genau 1`],
  [eigene.length !== 1 || (eigene[0].anzahl === SOLL.anzahl && eigene[0].fenster_minuten === SOLL.fenster_minuten),
    `plinyoo ${JSON.stringify(eigene[0])} gegen spoonup ${JSON.stringify(SOLL)}`],
]);
// Kopf = alles vor der ersten Zeile, die kein Kommentar und nicht leer ist.
const kopf = [];
for (const z of quelle.split('\n')) { if (z.trim() && !z.trim().startsWith('//')) break; kopf.push(z); }
const kopfText = kopf.join('\n');
pruefe('G2 Kopf nennt: erst 20270303 einspielen, dann ausrollen', [
  [/20270303/.test(kopfText), 'Kopfkommentar nennt 20270303 nicht'],
  [/einspielen[\s\S]*ausrollen/i.test(kopfText), 'Kopfkommentar nennt nicht "einspielen ... ausrollen" in dieser Reihenfolge'],
]);

// --- K: Grenze --------------------------------------------------------------
{
  const r = await rufe(gueltig, {});
  const rpc = r.spur.find((s) => s.art === 'RPC');
  const iRpc = r.spur.findIndex((s) => s.art === 'RPC');
  const iZeile = r.spur.findIndex((s) => s.art === 'ZEILE');
  const iMail = r.spur.findIndex((s) => s.art === 'MAIL');
  pruefe('K1 gueltig, erlaubt -> 200, eine Buchung vor Zeile und Mail', [
    [r.status === 200, `Status ${r.status}`],
    [r.rpc === 1, `${r.rpc} Buchung(en), erwartet 1`],
    [!rpc || rpc.was.name === 'kontaktmail_buchen', `RPC ${rpc?.was.name}`],
    [!rpc || (rpc.was.args?.p_grenze === SOLL.anzahl && rpc.was.args?.p_fenster_minuten === SOLL.fenster_minuten),
      `Argumente ${JSON.stringify(rpc?.was.args)} statt p_grenze ${SOLL.anzahl}, p_fenster_minuten ${SOLL.fenster_minuten}`],
    [!rpc || rpc.was.key === 'attrappe-dienst', `Schluessel ${rpc?.was.key}`],
    [iRpc >= 0 && iRpc < iZeile && iRpc < iMail, `Reihenfolge Buchung ${iRpc}, Zeile ${iZeile}, Mail ${iMail}`],
    [r.zeilen === 1, `${r.zeilen} Zeile(n)`],
    [r.mails === 1, `${r.mails} Mail(s)`],
  ]);
}
{
  const r = await rufe(gueltig, { rpc: () => ({ data: 'gesamt', error: null }) });
  let body = {};
  try { body = JSON.parse(r.text); } catch { /* bleibt leer */ }
  pruefe('K2 gesamt -> 429, keine Zeile, keine Mail', [
    [r.status === 429, `Status ${r.status}`],
    [body.error === 'GRENZE_ERREICHT', `error ${JSON.stringify(body.error)}`],
    [r.zeilen === 0, `${r.zeilen} Zeile(n)`],
    [r.mails === 0, `${r.mails} Mail(s)`],
  ]);
}
{
  const r = await rufe(gueltig, { rpc: () => ({ data: null, error: { code: '42883', message: 'ATTRAPPE: function kontaktmail_buchen does not exist' } }) });
  pruefe('K3 Buchung scheitert -> 500, keine Wirkung, kein Datenbanktext', [
    [r.status === 500, `Status ${r.status}`],
    [r.zeilen === 0, `${r.zeilen} Zeile(n)`],
    [r.mails === 0, `${r.mails} Mail(s)`],
    [!/42883|ATTRAPPE|kontaktmail_buchen/.test(r.text), `Antwort nennt den Datenbankfehler: ${r.text}`],
  ]);
}
{
  const r = await rufe(gueltig, { rpc: () => ({ data: 'vielleicht', error: null }) });
  pruefe('K4 Buchung antwortet Unbekanntes -> 500, keine Wirkung', [
    [r.status === 500, `Status ${r.status}`],
    [r.zeilen === 0, `${r.zeilen} Zeile(n)`],
    [r.mails === 0, `${r.mails} Mail(s)`],
  ]);
}
{
  const r = await rufe(gueltig, { rpc: () => { throw new Error('ATTRAPPE: fetch failed'); } });
  pruefe('K6 Buchung wirft -> 500, keine Wirkung, kein Fehlertext', [
    [r.status === 500, `Status ${r.status}`],
    [r.zeilen === 0, `${r.zeilen} Zeile(n)`],
    [r.mails === 0, `${r.mails} Mail(s)`],
    [!/ATTRAPPE|fetch failed/.test(r.text), `Antwort nennt den Fehler: ${r.text}`],
  ]);
}
{
  // Zaehler-Attrappe: haelt sich an die Grenze, die die Funktion SELBST mitschickt.
  let belegt = 0;
  const zaehler = (_n, a) => (belegt >= a.p_grenze ? { data: 'gesamt', error: null } : (belegt++, { data: 'erlaubt', error: null }));
  let mails = 0; let zeilen = 0; let zuViel = 0; let andere = 0;
  for (let i = 0; i < SOLL.anzahl + 3; i++) {
    const r = await rufe(gueltig, { rpc: zaehler });
    mails += r.mails; zeilen += r.zeilen;
    if (r.status === 429) zuViel++; else if (r.status !== 200) andere++;
  }
  pruefe(`K5 ${SOLL.anzahl + 3} Aufrufe -> ${SOLL.anzahl} Mails, 3x 429`, [
    [mails === SOLL.anzahl, `${mails} Mails`],
    [zeilen === SOLL.anzahl, `${zeilen} Zeilen`],
    [zuViel === 3, `${zuViel}x 429`],
    [andere === 0, `${andere} andere Antworten`],
  ]);
}

// --- F: Form und Laenge ------------------------------------------------------
{
  const r = await rufe({ name: 'x'.repeat(5000), email: 'kein-mail', formType: 'egal' }, {});
  pruefe('F1 Fall 27: 5000 Zeichen, keine Adresse -> 400, keine Wirkung', [[r.status === 400, `Status ${r.status}`], ...keineWirkung(r)]);
}
{
  const r = await rufe({ ...gueltig, message: 'y'.repeat(5001) }, {});
  pruefe('F2 Nachricht 5001 Zeichen -> 400, keine Wirkung', [[r.status === 400, `Status ${r.status}`], ...keineWirkung(r)]);
}
{
  const r = await rufe({ ...gueltig, email: 'wer@' }, {});
  pruefe('F3 Adresse ungueltig -> 400, keine Wirkung', [[r.status === 400, `Status ${r.status}`], ...keineWirkung(r)]);
}
{
  const r = await rufe({ ...gueltig, formType: 'egal' }, {});
  pruefe('F4 formType unbekannt -> 400, keine Wirkung', [[r.status === 400, `Status ${r.status}`], ...keineWirkung(r)]);
}
{
  const r = await rufe('kein json', {});
  pruefe('F5 kein JSON -> 400, keine Wirkung', [[r.status === 400, `Status ${r.status}`], ...keineWirkung(r)]);
}
{
  const r = await rufe({ ...gueltig, formType: 'join', message: 'z'.repeat(5000), role: 'Entwicklung', linkedin: 'https://linkedin.com/in/x' }, {});
  pruefe('F6 Nachricht 5000 Zeichen -> 200', [[r.status === 200, `Status ${r.status}`], [r.mails === 1, `${r.mails} Mail(s)`]]);
}

// --- D: keine Fehlertexte an den Aufrufer -------------------------------------
{
  const r = await rufe(gueltig, { zeile: () => ({ data: null, error: { code: '42P01', message: 'ATTRAPPE: relation does not exist', details: 'ATTRAPPE-details', hint: 'ATTRAPPE-hint' } }) });
  pruefe('D1 Fall 25: Zeile scheitert -> 500, keine Mail, kein Datenbanktext', [
    [r.status === 500, `Status ${r.status}`],
    [r.mails === 0, `${r.mails} Mail(s)`],
    [!/42P01|ATTRAPPE|relation|dbError/.test(r.text), `Antwort nennt den Datenbankfehler: ${r.text}`],
  ]);
}
{
  const r = await rufe(gueltig, { mail: () => ({ data: null, error: { name: 'validation_error', statusCode: 422, message: 'ATTRAPPE: postfach-heiko@example.org is not allowed' } }) });
  pruefe('D2 Mail scheitert -> 500, kein Empfaenger, kein Fehlertext', [
    [r.status === 500, `Status ${r.status}`],
    [!/postfach-heiko|ATTRAPPE|validation_error|422|emailError/.test(r.text), `Antwort nennt den Mailfehler: ${r.text}`],
    [!r.protokoll.some((z) => z.includes('postfach-heiko')), 'Protokoll nennt den Empfaenger'],
  ]);
}

const rot = ergebnisse.filter((e) => e.rot.length);
console.log(`\n${ergebnisse.length - rot.length} GRUEN, ${rot.length} ROT${rot.length ? ': ' + rot.map((e) => e.id.split(' ')[0]).join(', ') : ''}`);
process.exit(rot.length ? 1 : 0);
