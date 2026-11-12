// scripts/pruefe-ohne-entwurf.mjs — #515 (BUG-0322): Was ein Besucher in den Ansichten der Startseite liest, trägt keinen
// Entwurfs- oder Beispieldatenhinweis mehr. Läuft im Bau nach `vite build` und liest den gebauten Ordner, nicht public/.
// Aufruf: node scripts/pruefe-ohne-entwurf.mjs [dist]   (ohne Angabe: dist/ neben package.json)
// Durchsucht:
//   1. dist/ansichten/*.html — der Text, den die Seite zeigt oder per Skript setzt. Kommentare (HTML, CSS, JS) zählen
//      nicht: die Datei erklärt dort ihre erfundenen Daten für Entwickler, kein Besucher sieht das.
//   2. dist/locales/<sprache>/*.json — jeder Textwert in jeder Sprache (Schlüssel nicht).
// Gesucht wird deutsch und englisch: Entwurf, Beispieldaten, erfundener Bestand, draft, sample data, mock/mockup,
// dazu Verweise auf die Vorlage (Spezifikation, spec), Platzhalterkarten (Beispielkarte, sample card) und Musternummern
// („Karte 001"). Eine Musternummer, die ein Skript erst zur Laufzeit bildet ('Karte ' + n.padStart(3,'0')), sieht diese
// Prüfung nur am Wort davor.
// Ausgang 1 bei jedem Fund und wenn keine Datei gefunden wird (nie stilles Bestehen).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(WURZEL, 'dist'));

const MUSTER = [
  /entwurf/i,
  /beispieldaten/i,
  /erfundene[nrs]?\s+bestand/i,
  /\bdrafts?\b/i,
  /\bsample[\s-]+data\b/i,
  /\bmock(?:-?ups?|s|ed)?\b/i,
  // #515 Folie 5: Verweise auf die Vorlage und Platzhalter statt Inhalt.
  /spezifikation/i,
  /\bspec(?:s|ification)?\b/i,
  /beispiel(?:karte|eintrag|titel|thema|schlagwort)/i,
  /\b(?:sample|example|placeholder|dummy)\s+(?:card|item|entry|title)/i,
  // Musternummer: ein Wort und eine Zahl mit führender Null („Karte 001", „Item 007").
  /\b\p{L}+[\s_-]+0\d{2,}\b/iu,
];

const funde = [];
const melde = (datei, zeile, text) => {
  for (const m of MUSTER) {
    const t = text.match(m);
    if (t) funde.push(`${path.relative(DIST, datei)}:${zeile}: „${t[0]}" in ${JSON.stringify(text.trim().slice(0, 120))}`);
  }
};

// Kommentare durch Leerzeichen ersetzen, Zeilenumbrüche behalten (damit die Zeilennummern stimmen).
const leeren = (s) => s.replace(/[^\n]/g, ' ');
function ohneKommentare(html) {
  let s = html.replace(/<!--[\s\S]*?-->/g, leeren);
  s = s.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, (_, auf, _n, inhalt, zu) => {
    let i = inhalt.replace(/\/\*[\s\S]*?\*\//g, leeren);
    // Zeilenkommentar nur am Zeilenanfang oder nach Leerraum/Satzzeichen, damit „https://" in Zeichenketten bleibt.
    i = i.replace(/(^|[\s;{}(),])\/\/[^\n]*/gm, (m, vor) => vor + leeren(m.slice(vor.length)));
    return auf + i + zu;
  });
  return s;
}

const ansichten = path.join(DIST, 'ansichten');
const htmlDateien = fs.existsSync(ansichten) ? fs.readdirSync(ansichten).filter((d) => d.endsWith('.html')).map((d) => path.join(ansichten, d)) : [];
for (const datei of htmlDateien) {
  ohneKommentare(fs.readFileSync(datei, 'utf8')).split('\n').forEach((z, i) => melde(datei, i + 1, z));
}

const locales = path.join(DIST, 'locales');
const jsonDateien = fs.existsSync(locales)
  ? fs.readdirSync(locales).flatMap((sp) => {
      const ord = path.join(locales, sp);
      return fs.statSync(ord).isDirectory() ? fs.readdirSync(ord).filter((d) => d.endsWith('.json')).map((d) => path.join(ord, d)) : [];
    })
  : [];
for (const datei of jsonDateien) {
  const roh = fs.readFileSync(datei, 'utf8');
  const daten = JSON.parse(roh);
  const zeilen = roh.split('\n');
  const gehe = (wert, pfad) => {
    if (typeof wert === 'string') {
      if (MUSTER.some((m) => m.test(wert))) {
        const nr = zeilen.findIndex((z) => z.includes(JSON.stringify(wert).slice(1, -1))) + 1;
        melde(datei, nr || pfad, wert);
      }
    } else if (wert && typeof wert === 'object') for (const [k, v] of Object.entries(wert)) gehe(v, `${pfad}.${k}`);
  };
  gehe(daten, '');
}

if (htmlDateien.length === 0 || jsonDateien.length === 0) {
  console.error(`pruefe-ohne-entwurf: nichts zu prüfen in ${DIST} (Ansichten: ${htmlDateien.length}, Sprachdateien: ${jsonDateien.length}). Lief der Bau?`);
  process.exit(1);
}
if (funde.length) {
  console.error(`pruefe-ohne-entwurf: ${funde.length} Entwurfs- oder Beispieldatenhinweis(e) in dem, was Besucher lesen:`);
  for (const f of funde) console.error('  ' + f);
  process.exit(1);
}
console.log(`✓ pruefe-ohne-entwurf: ${htmlDateien.length} Ansichten, ${jsonDateien.length} Sprachdateien ohne Entwurfs- oder Beispieldatenhinweis`);
