#!/usr/bin/env node
// ===========================================================================
// #533 (spoonup) -- Kontaktformular: verstaendliche Meldung bei Grenze und
// Ueberlaenge. Ohne Browser, ohne Netz.
//
//   node tests/kontakt-meldung-533.mjs
//   KONTAKT_WURZEL=<anderer Stand> node tests/kontakt-meldung-533.mjs   (Gegenprobe ohne Fix)
//
// L  Hoechstlaengen je Feld: Browser und Randfunktion nehmen DIESELBE Laenge
//    an. Gefahren werden beide, kein Nachbau und kein Lesen von Konstanten:
//    ContactFormSchema (src/domain/dom.contact.zod.ts) per esbuild gebuendelt
//    und mit safeParse gerufen; plinyoo-contact (supabase/functions/
//    plinyoo-contact/index.ts) per esbuild gebuendelt, Netz-Importe durch
//    Rekorder ersetzt, der Handler mit einer Anfrage gerufen. Je Feld wird die
//    groesste angenommene Laenge gesucht (Halbierung bis 100000) und
//    verglichen. Dazu: eine Laenge ueber der Grenze ergibt im Browser den
//    zod-Code too_big -- nur daran haengt "Ein Feld enthaelt zu viel Text".
// W  Wortlaut: die drei Saetze stehen in allen sieben Sprachdateien unter
//    forms.validation.* ZEICHENGLEICH wie freigegeben. Quellen:
//      de  spoonup claude/_startseite-wahr/sprecher-urteil.md @ 2c335cf93, Abschnitt 4
//      es fr pl uk  claude/_startseite-wahr/du-angleichung.md @ 1a196a8ef,
//          FREI in sprecher-urteil-du.md @ 5855dcc64
//      en, pt Satz 2  claude/_kontakt-meldung/uebersetzung.md @ d7465abb9, FREI 303b21335
//      pt Satz 1  sprecher-uebersetzung.md @ 303b21335 (GEAENDERT, "solicitações")
//      en, pt 400  uebersetzung.md Nachtrag @ 4e957f6ff, FREI 02e7112b7
//      error_send_failed (allgemeiner Satz), alle sieben: spoonup
//          claude/_533/fehlersatz-allgemein.md @ 78b8694fc, FREI 70834fc61
// S  Satzwahl (svc.contact.ts, gebuendelt): grenze -> error_rate_limit,
//    zu_lang -> error_too_long, abgelehnt -> error_rejected, jeweils mit
//    Rueckfall en; ein fremder Fehler -> der allgemeine Satz, nie ein Schluessel
//    und nie die Fehlermeldung. too_big -> zu_lang, jeder andere Code nicht.
//    Allgemeiner Satz (Bedingungen des Sprechers 70834fc61):
//    S-R  Rueckfall: sonst und ein fremder Fehler -> forms.validation.
//         error_send_failed; fehlt er der Sprache, der en-Satz.
//    S-W  sendContactForm gegen ein vorgetaeuschtes fetch: 500, Netzfehler,
//         fetch liefert undefined -> der allgemeine Satz; 429, 400 und die
//         eigene Formpruefung (zu lang, falsche Adresse) -> NIE er.
//    S-Sie  kein Satz des Formulars in de traegt die Sie-Form, und der
//         gebuendelte Dienst enthaelt keinen festen Satz mehr.
//
// Der Bedienweg im Browser (alle vier Seiten, en und uk) steht in
// tests/kontaktformular-483.mjs.
//
// Ohne Fix (plinyoo 3e17abb): L rot (der Browser kennt keine Hoechstlaenge),
// W rot (kein Schluessel), S nicht ladbar -> rot.
// Ohne den allgemeinen Satz (plinyoo 607d0c8): W error_send_failed 7x rot,
// S-R rot (Sie-Satz statt en), S-W 500/netz/undefined rot, S-Sie rot.
// Ausgang: 0 gruen, 1 rot, 2 nicht messbar.
// ===========================================================================
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = resolve(process.env.KONTAKT_WURZEL || resolve(HIER, '..'));
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

let esbuild;
try {
  esbuild = createRequire(join(resolve(HIER, '..'), 'package.json'))('esbuild');
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

const AUSGABE = join(process.env.TMPDIR || tmpdir(), `kontakt-meldung-533-${process.pid}`);
mkdirSync(AUSGABE, { recursive: true });
const atAlias = { name: 'at-alias', setup(b) {
  b.onResolve({ filter: /^@\// }, async (a) => b.resolve('./' + a.path.slice(2), { resolveDir: join(WURZEL, 'src'), kind: a.kind }));
} };
async function buendeln(eintrag, name, plugins = []) {
  const ziel = join(AUSGABE, `${name}.mjs`);
  await esbuild.build({
    entryPoints: [eintrag], bundle: true, write: true, outfile: ziel, format: 'esm', platform: 'node', logLevel: 'silent',
    nodePaths: [join(resolve(HIER, '..'), 'node_modules')],
    define: { 'import.meta.env.VITE_SUPABASE_URL': '"http://attrappe"', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '"attrappe"' },
    plugins: [atAlias, ...plugins],
  });
  return import(pathToFileURL(ziel).href);
}

// --- Die Randfunktion, wie in supabase/tests/plinyoo-contact-483.mjs ---------
let handler = null;
globalThis.Deno = {
  env: { get: (k) => ({ SUPABASE_URL: 'http://attrappe', SUPABASE_SERVICE_ROLE_KEY: 'x', RESEND_API_KEY: 'x', CONTACT_RECEIVER_EMAIL: 'postfach@example.org' })[k] },
  serve: (h) => { handler = h; },
};
globalThis.__kontakt533 = {
  createClient: () => ({ rpc: async () => ({ data: 'erlaubt', error: null }), from: () => ({ insert: async () => ({ data: null, error: null }) }) }),
  Resend: class { get emails() { return { send: async () => ({ data: { id: 'm' }, error: null }) }; } },
};
const netzImporte = { name: 'netz-importe', setup(b) {
  b.onResolve({ filter: /^https:\/\/esm\.sh\/@supabase\/supabase-js@/ }, () => ({ path: 'supa', namespace: 'attrappe' }));
  b.onResolve({ filter: /^https:\/\/esm\.sh\/resend@/ }, () => ({ path: 'resend', namespace: 'attrappe' }));
  b.onResolve({ filter: /^(https?:|npm:|jsr:)/ }, (a) => ({ errors: [{ text: `${a.path}: unbekannter Netz-Import` }] }));
  b.onLoad({ filter: /.*/, namespace: 'attrappe' }, (a) => ({
    loader: 'js',
    contents: a.path === 'supa'
      ? 'export function createClient(...a) { return globalThis.__kontakt533.createClient(...a); }'
      : 'export const Resend = globalThis.__kontakt533.Resend;',
  }));
} };

let schema;
try {
  ({ ContactFormSchema: schema } = await buendeln(join(WURZEL, 'src/domain/dom.contact.zod.ts'), 'schema'));
  await buendeln(join(WURZEL, 'supabase/functions/plinyoo-contact/index.ts'), 'randfunktion', [netzImporte]);
} catch (e) {
  nichtMessbar(`Schema oder Randfunktion nicht ladbar: ${e.message.split('\n')[0]}`);
}
if (typeof handler !== 'function') nichtMessbar('index.ts registriert keinen Handler ueber Deno.serve');

const still = { log: console.log, error: console.error, warn: console.warn };
async function serverNimmt(form) {
  console.error = () => {}; console.warn = () => {};
  try {
    const r = await handler(new Request('http://attrappe/functions/v1/plinyoo-contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }));
    return r.status === 200;
  } finally { console.error = still.error; console.warn = still.warn; }
}
const browserNimmt = (form) => schema.safeParse(form).success;

// --- L: Hoechstlaengen -----------------------------------------------------
const GUELTIG = { name: 'Wer', email: 'wer@example.org', formType: 'contact', message: 'Hallo' };
const wert = (feld, n) => (feld === 'email' ? 'a'.repeat(Math.max(1, n - '@example.org'.length)) + '@example.org' : 'a'.repeat(n));
const mitFeld = (feld, n) => ({ ...GUELTIG, [feld]: wert(feld, n) });
async function groessteLaenge(nimmt, feld) {
  let unten = feld === 'email' ? '@example.org'.length + 1 : 1;
  let oben = 100000;
  if (!(await nimmt(mitFeld(feld, unten)))) return 0;
  if (await nimmt(mitFeld(feld, oben))) return Infinity;
  while (oben - unten > 1) {
    const mitte = Math.floor((unten + oben) / 2);
    if (await nimmt(mitFeld(feld, mitte))) unten = mitte; else oben = mitte;
  }
  return unten;
}
const FELDER = Object.keys(schema.shape ?? {}).filter((f) => f !== 'formType');
pruefe('L0 Felder: Schema kennt name, email, message, role, availability, linkedin, github, investment_range', [
  [['name', 'email', 'message', 'role', 'availability', 'linkedin', 'github', 'investment_range'].every((f) => FELDER.includes(f)), `Felder im Schema: ${FELDER.join(', ')}`],
]);
for (const feld of FELDER) {
  const server = await groessteLaenge(serverNimmt, feld);
  const browser = await groessteLaenge(async (f) => browserNimmt(f), feld);
  const b = [
    [Number.isFinite(server), `Randfunktion nimmt ${feld} mit 100000 Zeichen an`],
    [browser === server, `Browser nimmt ${feld} bis ${browser} Zeichen, Randfunktion bis ${server}`],
  ];
  if (Number.isFinite(browser)) {
    const zuLang = schema.safeParse(mitFeld(feld, browser + 1));
    b.push([!zuLang.success && zuLang.error.issues.some((i) => i.code === 'too_big'), `${feld} mit ${browser + 1} Zeichen ergibt im Browser kein too_big`]);
  }
  pruefe(`L ${feld}: Browser ${browser}, Randfunktion ${server}`, b);
}

// --- W: Wortlaut -------------------------------------------------------------
const SOLL = {
  error_rate_limit: {
    de: 'Gerade kommen sehr viele Anfragen an. Deine Nachricht ist noch nicht bei uns. Bitte versuche es spätestens in einer Stunde noch einmal.',
    en: 'We are receiving a lot of requests right now. Your message has not reached us yet. Please try again in an hour at the latest.',
    es: 'Ahora mismo estamos recibiendo muchas solicitudes. Tu mensaje todavía no ha llegado a nosotros. Por favor, inténtalo de nuevo en una hora como máximo.',
    fr: 'Nous recevons actuellement un très grand nombre de demandes. Ton message ne nous est pas encore parvenu. Réessaie dans une heure au plus tard.',
    pl: 'Obecnie otrzymujemy bardzo dużo zapytań. Twoja wiadomość nie dotarła jeszcze do nas. Spróbuj ponownie najpóźniej za godzinę.',
    pt: 'Neste momento estamos recebendo muitas solicitações. Sua mensagem ainda não chegou até nós. Por favor, tente novamente em até uma hora.',
    uk: 'Зараз надходить дуже багато запитів. Твоє повідомлення ще не дійшло до нас. Будь ласка, спробуй ще раз щонайпізніше за годину.',
  },
  error_too_long: {
    de: 'Ein Feld enthält zu viel Text. Deine Nachricht ist noch nicht bei uns. Bitte kürze den Text und sende das Formular noch einmal.',
    en: 'One field contains too much text. Your message has not reached us yet. Please shorten the text and send the form again.',
    es: 'Un campo contiene demasiado texto. Tu mensaje todavía no ha llegado a nosotros. Por favor, acorta el texto y envía el formulario de nuevo.',
    fr: 'Un champ contient trop de texte. Ton message ne nous est pas encore parvenu. Raccourcis le texte et envoie à nouveau le formulaire.',
    pl: 'Jedno z pól zawiera zbyt dużo tekstu. Twoja wiadomość nie dotarła jeszcze do nas. Skróć tekst i wyślij formularz ponownie.',
    pt: 'Um campo contém texto demais. Sua mensagem ainda não chegou até nós. Por favor, encurte o texto e envie o formulário novamente.',
    uk: 'Одне з полів містить забагато тексту. Твоє повідомлення ще не дійшло до нас. Будь ласка, скороти текст і надішли форму ще раз.',
  },
  error_rejected: {
    de: 'Deine Angaben konnten nicht angenommen werden. Bitte prüfe Name, E-Mail-Adresse und Nachricht, kürze besonders lange Texte und sende das Formular noch einmal.',
    en: 'Your details could not be accepted. Please check your name, email address and message, shorten particularly long texts and send the form again.',
    es: 'Tus datos no se han podido aceptar. Por favor, revisa el nombre, el correo electrónico y el mensaje, acorta los textos especialmente largos y envía el formulario de nuevo.',
    fr: 'Tes informations n’ont pas pu être acceptées. Vérifie le nom, l’adresse e-mail et le message, raccourcis les textes particulièrement longs et envoie à nouveau le formulaire.',
    pl: 'Twoich danych nie udało się przyjąć. Sprawdź imię, adres e-mail i wiadomość, skróć szczególnie długie teksty i wyślij formularz ponownie.',
    pt: 'Seus dados não puderam ser aceitos. Por favor, verifique o nome, o e-mail e a mensagem, encurte textos especialmente longos e envie o formulário novamente.',
    uk: 'Твої дані не вдалося прийняти. Будь ласка, перевір ім’я, адресу електронної пошти та повідомлення, скороти особливо довгі тексти і надішли форму ще раз.',
  },
  error_send_failed: {
    de: 'Das Senden hat nicht geklappt. Bitte versuche es später noch einmal.',
    en: 'Sending did not work. Please try again later.',
    es: 'No se ha podido enviar. Por favor, inténtalo de nuevo más tarde.',
    fr: 'L’envoi n’a pas fonctionné. Réessaie plus tard.',
    pl: 'Wysłanie nie powiodło się. Spróbuj ponownie później.',
    pt: 'Não foi possível enviar. Por favor, tente novamente mais tarde.',
    uk: 'Не вдалося надіслати. Будь ласка, спробуй ще раз пізніше.',
  },
};
const SPRACHEN = ['de', 'en', 'es', 'fr', 'pl', 'pt', 'uk'];
const sprachdatei = {};
for (const l of SPRACHEN) {
  const p = join(WURZEL, 'public/locales', l, 'translation.json');
  sprachdatei[l] = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}
for (const [schluessel, je] of Object.entries(SOLL)) {
  for (const l of SPRACHEN) {
    const ist = sprachdatei[l]?.forms?.validation?.[schluessel];
    pruefe(`W ${l} forms.validation.${schluessel}`, [[ist === je[l], `steht dort: ${JSON.stringify(ist)?.slice(0, 80)}`]]);
  }
}

// --- S: Satzwahl -------------------------------------------------------------
let svc = null;
try {
  svc = await buendeln(join(WURZEL, 'src/services/svc.contact.ts'), 'svc');
} catch (e) {
  pruefe('S0 svc.contact.ts laesst sich laden', [[false, e.message.split('\n')[0]]]);
}
if (svc) {
  const { KontaktFehler, kontaktFehlerSatz, istZuLang } = svc;
  // t wie i18next: Schluessel in der aktuellen Sprache, sonst in den Rueckfall-
  // sprachen der Optionen. Die "aktuelle Sprache" ist hier eine, der alle
  // Saetze fehlen -- so ist der Rueckfall sichtbar.
  const rufe = [];
  const t = (k, o) => {
    rufe.push({ k, o });
    const pfad = k.split('.');
    for (const l of ['xx', ...(o?.fallbackLng ?? [])]) {
      let w = l === 'xx' ? undefined : sprachdatei[l];
      for (const s of pfad) w = w?.[s];
      if (typeof w === 'string') return w;
    }
    return k;
  };
  const fall = (art) => { rufe.length = 0; return kontaktFehlerSatz(new KontaktFehler(art), t); };
  for (const [art, schluessel] of [['grenze', 'error_rate_limit'], ['zu_lang', 'error_too_long'], ['abgelehnt', 'error_rejected']]) {
    const satz = typeof kontaktFehlerSatz === 'function' && typeof KontaktFehler === 'function' ? fall(art) : null;
    pruefe(`S ${art} -> forms.validation.${schluessel}, Rueckfall en`, [
      [satz === SOLL[schluessel].en, `Satz: ${JSON.stringify(satz)?.slice(0, 80)}`],
      [rufe.length === 1 && rufe[0].k === `forms.validation.${schluessel}`, `gefragt: ${rufe.map((r) => r.k).join(', ') || 'nichts'}`],
    ]);
  }
  rufe.length = 0;
  const fremd = typeof kontaktFehlerSatz === 'function' ? kontaktFehlerSatz(new TypeError('Cannot read properties of undefined'), t) : null;
  pruefe('S fremder Fehler -> allgemeiner Satz, keine Fehlermeldung, kein Schluessel', [
    [typeof fremd === 'string' && fremd.length > 20, `Satz: ${JSON.stringify(fremd)}`],
    [!String(fremd).includes('Cannot read') && !String(fremd).startsWith('forms.'), `Satz: ${JSON.stringify(fremd)}`],
  ]);
  // S-R: Bedingung 3, Rueckfall en. Die "aktuelle Sprache" xx hat keinen Satz.
  const ALLGEMEIN = SOLL.error_send_failed;
  const sonstSatz = typeof kontaktFehlerSatz === 'function' && typeof KontaktFehler === 'function' ? fall('sonst') : null;
  pruefe('S-R sonst -> forms.validation.error_send_failed, Rueckfall en', [
    [sonstSatz === ALLGEMEIN.en, `Satz: ${JSON.stringify(sonstSatz)}`],
    [rufe.length === 1 && rufe[0].k === 'forms.validation.error_send_failed' && (rufe[0].o?.fallbackLng ?? [])[0] === 'en', `gefragt: ${rufe.map((r) => r.k + ' ' + JSON.stringify(r.o)).join(', ') || 'nichts'}`],
  ]);
  pruefe('S-R fremder Fehler -> en-Satz, wenn der Sprache der Satz fehlt', [
    [fremd === ALLGEMEIN.en, `Satz: ${JSON.stringify(fremd)}`],
  ]);
  // In der Sprache selbst vorhanden -> ihr Satz, nicht en (uk als Beispiel).
  const tUk = (k, o) => { let w = sprachdatei.uk; for (const x of k.split('.')) w = w?.[x]; return typeof w === 'string' ? w : t(k, o); };
  const ukSatz = typeof kontaktFehlerSatz === 'function' && typeof KontaktFehler === 'function' ? kontaktFehlerSatz(new KontaktFehler('sonst'), tUk) : null;
  pruefe('S-R sonst in uk -> uk-Satz', [[ukSatz === ALLGEMEIN.uk, `Satz: ${JSON.stringify(ukSatz)}`]]);

  // S-W: Bedingung 2 -- welcher Ausgang fuehrt auf den allgemeinen Satz?
  // sendContactForm wird gerufen, fetch vorgetaeuscht; der Satz entsteht mit
  // dem de-Uebersetzer, wie auf der Seite.
  const tDe = (k, o) => { let w = sprachdatei.de; for (const x of k.split('.')) w = w?.[x]; return typeof w === 'string' ? w : t(k, o); };
  const GUT = { name: 'Wer', email: 'wer@example.org', formType: 'contact', message: 'Hallo' };
  const echtesFetch = globalThis.fetch;
  async function satzBei(antwort, form = GUT) {
    let aufrufe = 0;
    globalThis.fetch = async () => {
      aufrufe += 1;
      if (antwort === 'abbruch') throw new TypeError('Failed to fetch');
      if (antwort === 'undefined') return undefined;
      return new Response(JSON.stringify({ error: 'x' }), { status: antwort, headers: { 'content-type': 'application/json' } });
    };
    console.error = () => {};
    try {
      await svc.sendContactForm(form);
      return { satz: 'KEIN FEHLER', aufrufe };
    } catch (e) {
      return { satz: kontaktFehlerSatz(e, tDe), aufrufe };
    } finally {
      globalThis.fetch = echtesFetch; console.error = still.error;
    }
  }
  if (typeof svc.sendContactForm === 'function') {
    for (const [wie, antwort] of [['500', 500], ['502', 502], ['503', 503], ['Netzfehler', 'abbruch'], ['fetch liefert undefined', 'undefined']]) {
      const { satz } = await satzBei(antwort);
      pruefe(`S-W ${wie} -> allgemeiner Satz`, [[satz === ALLGEMEIN.de, `Satz: ${JSON.stringify(satz)}`]]);
    }
    for (const [wie, antwort, form, soll, sollAufrufe] of [
      ['429', 429, GUT, SOLL.error_rate_limit.de, 1],
      ['400', 400, GUT, SOLL.error_rejected.de, 1],
      ['zu lang (eigene Pruefung)', 200, { ...GUT, name: 'a'.repeat(201) }, SOLL.error_too_long.de, 0],
      ['falsche Adresse (eigene Pruefung)', 200, { ...GUT, email: 'a@b' }, SOLL.error_rejected.de, 0],
    ]) {
      const { satz, aufrufe } = await satzBei(antwort, form);
      pruefe(`S-W ${wie} -> nie der allgemeine Satz`, [
        [satz !== ALLGEMEIN.de, 'zeigt den allgemeinen Satz'],
        [satz === soll, `Satz: ${JSON.stringify(satz)}`],
        [aufrufe === sollAufrufe, `${aufrufe} Aufruf(e), erwartet ${sollAufrufe}`],
      ]);
    }
    const ok = await satzBei(200);
    pruefe('S-W 200 -> kein Fehler', [[ok.satz === 'KEIN FEHLER', `Satz: ${JSON.stringify(ok.satz)}`]]);
  } else {
    pruefe('S-W sendContactForm laesst sich rufen', [[false, 'keine Funktion sendContactForm']]);
  }

  // S-Sie: die Sie-Form verschwindet aus dem Formular.
  const SIE = /\b(Sie|Ihre?[nmrs]?)\b/;
  const deSaetze = Object.keys(SOLL).map((k) => [k, sprachdatei.de?.forms?.validation?.[k]]);
  const gebuendelt = readFileSync(join(AUSGABE, 'svc.mjs'), 'utf8');
  pruefe('S-Sie kein Formularsatz in de in Sie-Form, kein fester Satz im Dienst', [
    ...deSaetze.map(([k, w]) => [typeof w === 'string' && !SIE.test(w), `${k}: ${JSON.stringify(w)?.slice(0, 80)}`]),
    [!gebuendelt.includes('Das Senden hat nicht geklappt') && !gebuendelt.includes('versuchen Sie'), 'svc.contact.ts traegt einen festen Satz'],
  ]);
  // Auch en fehlt (noch nicht geladen): i18next gibt den Schluessel zurueck.
  const nichtsGeladen = typeof kontaktFehlerSatz === 'function' && typeof KontaktFehler === 'function'
    ? kontaktFehlerSatz(new KontaktFehler('grenze'), (k) => k) : 'nicht ladbar';
  pruefe('S kein Satz geladen -> nichts, nie der Schluessel', [
    [nichtsGeladen === null, `Satz: ${JSON.stringify(nichtsGeladen)}`],
  ]);
  pruefe('S too_big -> zu_lang, andere Codes nicht', [
    [typeof istZuLang === 'function' && istZuLang([{ code: 'invalid_format' }, { code: 'too_big' }]) === true, 'too_big nicht erkannt'],
    [typeof istZuLang === 'function' && istZuLang([{ code: 'invalid_format' }, { code: 'too_small' }, { code: 'invalid_value' }]) === false, 'anderer Code gilt als zu lang'],
  ]);
}

const rot = ergebnisse.filter((e) => e.rot.length);
console.log(`\n${ergebnisse.length - rot.length} GRUEN, ${rot.length} ROT${rot.length ? ': ' + rot.map((e) => e.id).join(', ') : ''}`);
process.exit(rot.length ? 1 : 0);
