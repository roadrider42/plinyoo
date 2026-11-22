#!/usr/bin/env node
// ===========================================================================
// #609 Schritt 3 (spoonup, Heiko E-528 "jetzt weitere Sprachen", E-535 "a":
// erst übersetzen, dann ausliefern) -- keine Sprachseite zeigt einen deutschen
// Text, für den ihre Sprache einen eigenen haben sollte.
//
//   node tests/keine-deutschen-reste-609.mjs     (npm run pruefung:keine-deutschen-reste,
//                                                 läuft im Bau nach dem Vorrendern)
//   ... --locales <ordner>    andere Sprachdateien (<ordner>/<sprache>/translation.json),
//                             z. B. die Attrappe, in der alle Texte vorhanden sind
//   ... --server <datei>      anderer Vorrenderbau (Vorgabe dist-server/entry-server.mjs)
//
// Fehlt einer Sprache ein Text, setzt i18next den deutschen ein (Rückfall, im
// Browser wie beim Vorrendern). Das darf im Bau existieren; ausgeliefert wird so
// nicht. Gemessen wird, was auf der Seite STEHT, nicht, was in der Datei fehlt:
//
// R1  Jede Sprachfassung (src/routes/seiten.ts, fassungen(), außer de) wird mit
//     demselben Vorrenderbau gerendert wie im Bau, aber jeder deutsche Text ist
//     durch eine Marke ersetzt (U+E000 <schlüssel> U+E001). Jede Marke im HTML
//     ist ein deutscher Text auf der Seite, mit genauem Schlüssel.
// R2  Titel und Beschreibung (seo.<seite>.title / .description) jeder
//     Sprachfassung stehen in ihrer Sprache -- sonst setzt scripts/vorrendern.mjs
//     den deutschen in den Kopf.
//
// Nicht gezählt:
//   - Impressum und Datenschutz: Es gibt sie nur deutsch (nurDeutsch in
//     seiten.ts; Datenschutz Heiko E-540 "C", Hinweis privacy.note). Sie sind
//     keine Sprachfassung, also wird hier nichts von ihnen gerendert.
//   - Die Bücherleiste unter #root (scripts/buchseiten.mjs, lang="de", Heiko
//     E-536 "a": Buchseiten bleiben deutsch). Sie steht außerhalb von #root.
//   - Schlüssel, die kein Text sind (NICHT_TEXT unten: Kennungen, Bildpfade).
//   - Die Lernkarten journey.cards, wenn KARTEN_BLEIBEN_DEUTSCH = true.
//   - Buchtexte (content/buecher) im Faden, wenn FADEN_BUECHER_DEUTSCH = true.
//
// Was R1 nicht sieht:
// R3  Deutscher Text, der fest im Code steht statt in den Sprachdateien: ein
//     Textstück, das in der deutschen Fassung und in der Sprachfassung gleich
//     dasteht, mit Buchstaben, und das nicht in GLEICH_IN_ALLEN steht
//     (Eigennamen, Kontonamen, Wörter, die nicht deutsch sind).
// R4  Was erst nach Bedienung erscheint (die zweite Lernkarte, eine
//     Fehlermeldung im Formular): Das vorgerenderte HTML zeigt nur den
//     Anfangszustand. Deshalb zählt zusätzlich jeder deutsche Text, der der
//     Sprache fehlt, in jedem Bereich (journey, forms, hero …), den eine
//     Sprachseite benutzt. Benutzt = ein Schlüssel des Bereichs steht beim
//     Rendern mit Marken für BEIDE Sprachen auf einer Sprachseite.
//
// Ausgabe: je Sprache die Liste der Schlüssel (mit deutschem Wortlaut und den
// Seiten, auf denen er steht). Exit 0 grün, 1 rot, 2 nicht messbar.
//
// Beide Richtungen, 22.11.2026, node 22.23.4:
//   - Sprachdateien des Zweigs: ROT, en 131 Schlüssel, es/fr/pt/uk/pl je 140.
//   - Attrappe, in der jede Sprache jeden Text hat ("[en] " + deutscher Text):
//     ROT nur R3, 27 Buchtexte im Faden je Sprache (erscheint, sobald
//     hero.faden da ist); mit FADEN_BUECHER_DEUTSCH = true GRUEN.
//   - KARTEN_BLEIBEN_DEUTSCH = true auf den Sprachdateien des Zweigs: en 47
//     statt 131 (die 84 Kartentexte fallen weg).
// ===========================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// --- Heiko E-542 (Lernkarten im Wissensuniversum): EINE Zeile. -----------------------
// A "Karten bleiben deutsch" -> true. B "Karten übersetzen" -> false.
// Offen (22.11.2026): false -- bis zur Antwort zählt jede deutsche Karte als Rest.
const KARTEN_BLEIBEN_DEUTSCH = false;
// --- Faden im Kopf der Startseite (HeroFaden): EINE Zeile. ---------------------------
// Er erscheint in einer Sprache, sobald sie hero.faden hat (Hero.tsx:25), und zeigt Karten aus den Büchern
// (src/components/ui/fadenInhalt.ts aus content/buecher, deutsch, Heiko E-536 "a"). Ohne Entscheidung (22.11.2026):
// false -- jeder deutsche Buchtext im Faden einer Sprachseite zählt als Rest. true = Buchtexte dürfen deutsch sein.
const FADEN_BUECHER_DEUTSCH = false;
// -------------------------------------------------------------------------------------

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, vorgabe) => { const i = process.argv.indexOf(name); return i > 0 ? path.resolve(process.argv[i + 1]) : vorgabe; };
const LOCALES = arg('--locales', path.join(WURZEL, 'public/locales'));
const SERVER = arg('--server', path.join(WURZEL, 'dist-server/entry-server.mjs'));
const nichtMessbar = (warum) => { console.log(`NICHT MESSBAR: ${warum}`); process.exit(2); };

// Schlüssel, deren Wert kein Text ist, den ein Mensch liest: Kennungen und Adressen von Bildern/Seiten.
const NICHT_TEXT = /\.(id|src|href|moreHref|slug)$/;
const ERLAUBT = (schluessel) => KARTEN_BLEIBEN_DEUTSCH && schluessel.startsWith('journey.cards.');
// R3: Textstücke, die in jeder Sprache gleich dastehen und kein deutscher Text sind. Gemessen 22.11.2026 auf allen
// 36 Sprachseiten; jede Zeile mit Fundstelle. Wer hier etwas einträgt, schreibt dazu, warum es nicht deutsch ist.
const GLEICH_IN_ALLEN = new Set([
  'plinyoo', 'plinyoo.', // Wortmarke (Kopf, Footer)
  'Instagram: @plinyoo_path', 'X (Twitter): @plinyoo_path', // Kontonamen, src/components/ui/SocialLinks.tsx
  'Instagram @plinyoo_path', 'X (Twitter) @plinyoo_path', // dieselben, Kontaktseite
  'Login', // src/components/ui/Hero.tsx:42, englisch, fest in allen Sprachen. Randbefund: nicht übersetzt
  'Notifications (F8)', // Vorgabe von @radix-ui/react-toast (aria-label), englisch. Randbefund: nicht übersetzt
]);

if (!fs.existsSync(SERVER)) nichtMessbar(`${path.relative(WURZEL, SERVER)} fehlt -- erst vite build --ssr (npm run build).`);
const { rendern, fassungen, SPRACHEN, RUECKFALL_SPRACHE } = await import(pathToFileURL(SERVER).href);
const lies = (sprache) => JSON.parse(fs.readFileSync(path.join(LOCALES, sprache, 'translation.json'), 'utf8'));

const flach = (o, vor = '', aus = new Map()) => {
  if (typeof o === 'string') aus.set(vor, o);
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) flach(v, vor ? `${vor}.${k}` : k, aus);
  return aus;
};
// Jeder Text wird zur Marke mit seinem Schlüssel; Struktur, Zahlen und Wahrheitswerte bleiben.
const markiert = (o, vor = '') => {
  if (typeof o === 'string') return `${vor}`;
  if (Array.isArray(o)) return o.map((v, i) => markiert(v, `${vor}.${i}`));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, markiert(v, vor ? `${vor}.${k}` : k)]));
  return o;
};

const de = lies(RUECKFALL_SPRACHE);
const deFlach = flach(de);
const deMarkiert = markiert(de);
const MARKE = /([^]+)/g;
// Alle Texte der Bücher (content/buecher/*.json), damit R3 einen Buchtext als solchen benennt.
const BUCHTEXTE = [];
for (const f of fs.readdirSync(path.join(WURZEL, 'content/buecher')).filter((x) => x.endsWith('.json'))) {
  BUCHTEXTE.push(...flach(JSON.parse(fs.readFileSync(path.join(WURZEL, 'content/buecher', f), 'utf8'))).values());
}
// Dazu die Folien des Fadens selbst: Ein Teil der Fragen und Antworten steht nur dort (z. B. fadenInhalt.ts:49-50).
const fadenQuelle = fs.readFileSync(path.join(WURZEL, 'src/components/ui/fadenInhalt.ts'), 'utf8');
for (const [, s] of fadenQuelle.matchAll(/'((?:[^'\\\n]|\\.)+)'/g)) BUCHTEXTE.push(s.replace(/\\'/g, "'"));

// Textstücke eines HTML (zwischen Tags, dazu alt/title/aria-label/placeholder), ohne Skripte und Stile.
const stuecke = (html) => {
  const ohne = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ');
  const aus = new Set();
  for (const [, t] of ohne.matchAll(/>([^<]+)</g)) { const s = t.replace(/\s+/g, ' ').trim(); if (s) aus.add(s); }
  for (const [, t] of ohne.matchAll(/\s(?:alt|title|aria-label|placeholder)="([^"]+)"/g)) aus.add(t.trim());
  return aus;
};
const entities = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

const alle = fassungen(SPRACHEN);
const deHtml = new Map();
for (const f of alle.filter((x) => x.sprache === RUECKFALL_SPRACHE)) deHtml.set(f.seite.pfad, await rendern(f.pfad, f.sprache, de, de));

const reste = new Map(); // sprache -> Map(schlüssel -> Set(pfad))
const fest = new Map(); // sprache -> Map(text -> Set(pfad))
const merke = (karte, sprache, k, pfad) => {
  if (!karte.has(sprache)) karte.set(sprache, new Map());
  const m = karte.get(sprache);
  if (!m.has(k)) m.set(k, new Set());
  m.get(k).add(pfad);
};
let gerendert = 0;
const bereiche = new Set();
for (const f of alle.filter((x) => x.sprache !== RUECKFALL_SPRACHE)) {
  const texte = lies(f.sprache);
  // R1
  const html = await rendern(f.pfad, f.sprache, texte, deMarkiert);
  gerendert++;
  const hier = new Set();
  for (const [, k] of html.matchAll(MARKE)) {
    hier.add(k);
    if (!NICHT_TEXT.test(k) && !ERLAUBT(k)) merke(reste, f.sprache, k, f.pfad);
  }
  // R2
  for (const feld of ['title', 'description']) {
    const k = `seo.${f.seite.seo}.${feld}`;
    const w = texte.seo?.[f.seite.seo]?.[feld];
    if (typeof w !== 'string' || !w.trim()) merke(reste, f.sprache, k, f.pfad);
  }
  // R3: gleich mit der deutschen Fassung, aber keiner der Texte aus den Sprachdateien (die zählt R1)
  const echt = await rendern(f.pfad, f.sprache, texte, de);
  const eigene = new Set([...flach(texte).values()].map((s) => s.trim()));
  const deStuecke = stuecke(deHtml.get(f.seite.pfad));
  for (const roh of stuecke(echt)) {
    const s = entities(roh);
    if (!/\p{L}{2}/u.test(s) || GLEICH_IN_ALLEN.has(s) || !deStuecke.has(roh)) continue;
    if (eigene.has(s)) continue; // die Sprache hat genau diesen Text selbst (z. B. "Instagram"), kein Rückfall
    if ([...hier].some((k) => (deFlach.get(k) ?? '').includes(s))) continue; // Rückfall auf dieser Seite: R1 zählt ihn
    const ausBuch = BUCHTEXTE.some((w) => w.includes(s));
    if (ausBuch && FADEN_BUECHER_DEUTSCH) continue;
    merke(fest, f.sprache, ausBuch ? `(Buchtext) ${s}` : s, f.pfad);
  }
  // R4, Teil 1: welche Bereiche benutzt diese Seite? Marken für beide Sprachen, dann gilt jeder Schlüssel als gesehen.
  const beide = await rendern(f.pfad, f.sprache, markiert(texte), deMarkiert);
  for (const [, k] of beide.matchAll(MARKE)) bereiche.add(k.split('.')[0]);
}
// R4, Teil 2: in jedem benutzten Bereich jeder deutsche Text, der der Sprache fehlt (nicht schon von R1 gefunden)
// R4-Funde stehen nicht im vorgerenderten HTML: Sie erscheinen erst nach Bedienung, oder die Seite lässt die Stelle
// in dieser Sprache leer (z. B. cta.hinweis über getResource ohne Rückfall).
const NIRGENDS = '(nicht vorgerendert)';
for (const sprache of SPRACHEN.filter((s) => s !== RUECKFALL_SPRACHE)) {
  const eigen = flach(lies(sprache));
  for (const [k] of deFlach) {
    if (!bereiche.has(k.split('.')[0]) || eigen.has(k) || NICHT_TEXT.test(k) || ERLAUBT(k)) continue;
    if (reste.get(sprache)?.has(k)) continue;
    merke(reste, sprache, k, NIRGENDS);
  }
}

const zeilen = [];
let summe = 0;
for (const sprache of SPRACHEN.filter((s) => s !== RUECKFALL_SPRACHE)) {
  const r = reste.get(sprache) ?? new Map();
  const x = fest.get(sprache) ?? new Map();
  if (!r.size && !x.size) { zeilen.push(`${sprache}: grün`); continue; }
  summe += r.size + x.size;
  zeilen.push(`${sprache}: ${r.size} deutsche Texte aus den Sprachdateien${x.size ? `, ${x.size} fest im Code` : ''}`);
  for (const [k, pfade] of [...r].sort(([a], [b]) => a.localeCompare(b))) {
    const w = (deFlach.get(k) ?? '').replace(/\s+/g, ' ');
    zeilen.push(`  ${k}  „${w.length > 70 ? `${w.slice(0, 67)}…` : w}“  [${[...pfade].join(' ')}]`);
  }
  for (const [s, pfade] of x) zeilen.push(`  (fest im Code)  „${s.slice(0, 70)}“  [${[...pfade].join(' ')}]`);
}

const karten = (KARTEN_BLEIBEN_DEUTSCH ? 'journey.cards erlaubt (E-542 A)' : 'journey.cards zählen mit (E-542 offen oder B)')
  + (FADEN_BUECHER_DEUTSCH ? ', Buchtexte im Faden erlaubt' : ', Buchtexte im Faden zählen mit');
if (summe) {
  console.log(`ROT: deutsche Texte auf den Sprachseiten (${gerendert} Seiten gerendert, ${karten}; Heiko E-535 "a": erst übersetzen, dann ausliefern)\n${zeilen.join('\n')}`);
  // exitCode statt process.exit(1): exit kappt eine lange Ausgabe in eine Pipe (gemessen: die Liste für pl fehlte).
  process.exitCode = 1;
} else {
  console.log(`GRUEN R1-R4: ${gerendert} Sprachseiten ohne deutschen Text (${karten}).\n${zeilen.join('\n')}`);
}
