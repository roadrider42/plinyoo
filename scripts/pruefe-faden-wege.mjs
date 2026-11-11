// scripts/pruefe-faden-wege.mjs — #513: Jede Karte im Telefon der Startseite (HeroFaden) zeigt mindestens zwei Wege,
// und jeder Weg ist einer, den es in den Buchdaten gibt.
// Aufruf: node scripts/pruefe-faden-wege.mjs   (Node >= 22.6: lädt fadenInhalt.ts ohne Übersetzer)
// Je Karte des Fadens, gegen content/buecher/<slug>.json:
//   1. Der Kartentitel steht in kartenvoll[].titel (sonst ist die Karte keine Karte des Buchs).
//   2. ↑ Weiterlesen: Titel einer Karte desselben Buchs mit einer Kante zur Karte, und genau die nach der Regel in fadenInhalt.ts.
//   3. → Abstecher: nächste Karte des Fadens in einem anderen Buch = eine Brücke (bruecken[].von enthält die eine Karte, ziel ist
//      das Buch oder der Slug der anderen; in einer der beiden Richtungen); im selben Buch = eine Kante.
//   4. Mindestens zwei Wege, die beiden verschieden.
// Ausgang 1 bei jedem Befund, nie stilles Bestehen: Wird keine Karte gefunden, ist das ein Befund.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { FADEN_BUECHER, FADEN_FOLIEN, wegeDerFolie } = await import(path.join(WURZEL, 'src/components/ui/fadenInhalt.ts'));

const daten = {};
const buch = (kurz) => {
  const slug = FADEN_BUECHER[kurz]?.coverSlug;
  if (!slug) throw new Error(`Buch ${kurz}: kein coverSlug, keine Buchdaten`);
  daten[slug] ??= JSON.parse(fs.readFileSync(path.join(WURZEL, 'content/buecher', `${slug}.json`), 'utf8'));
  return daten[slug];
};
const index = (d, titel) => d.kartenvoll.findIndex((k) => k.titel === titel);
const nachbarn = (d, i) =>
  d.kanten.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : [])).sort((x, y) => x - y);

const befunde = [];
let karten = 0;
FADEN_FOLIEN.forEach((f, i) => {
  if (f.art !== 'karte') return;
  karten++;
  const d = buch(f.buch);
  const ich = index(d, f.titel);
  const name = `Folie ${i} (${d.slug})`;
  if (ich < 0) return befunde.push(`${name}: Titel „${f.titel}“ fehlt in kartenvoll`);
  const wege = wegeDerFolie(FADEN_FOLIEN, i);
  if (wege.length < 2) befunde.push(`${name}: ${wege.length} Weg(e), verlangt sind mindestens 2`);
  if (new Set(wege.map((w) => w.titel)).size !== wege.length) befunde.push(`${name}: zwei Wege mit demselben Titel`);

  const n = nachbarn(d, ich);
  const soll = n.find((j) => j > ich) ?? n[n.length - 1];
  for (const w of wege) {
    const zd = buch(w.buch);
    const z = index(zd, w.titel);
    if (z < 0) { befunde.push(`${name}: Weg „${w.titel}“ fehlt in ${zd.slug}`); continue; }
    if (w.pfeil === 'weiterlesen') {
      if (w.buch !== f.buch) befunde.push(`${name}: ↑ führt aus dem Buch`);
      if (z !== soll) befunde.push(`${name}: ↑ ist Karte ${z}, nach der Regel wäre es ${soll} („${d.kartenvoll[soll]?.titel}“)`);
    } else if (w.buch === f.buch) {
      if (!n.includes(z)) befunde.push(`${name}: → „${w.titel}“ hat keine Kante zur Karte`);
    } else {
      // Eine Brücke verbindet zwei Karten; in den Buchdaten steht sie bei einer der beiden. Beide Richtungen zählen
      // (Dalrymple 1600 → Zitelmann „Zwei Denkweisen“ steht nur bei Zitelmann, Karte 8 → dalrymple-anarchie).
      const hin = new Set([zd.slug, ...zd.kartenvoll.map((k) => k.slug)]);
      const her = new Set([d.slug, ...d.kartenvoll.map((k) => k.slug)]);
      const bruecke =
        (d.bruecken || []).some((b) => b.von.includes(ich) && hin.has(b.ziel)) ||
        (zd.bruecken || []).some((b) => b.von.includes(z) && her.has(b.ziel));
      if (!bruecke) befunde.push(`${name}: → nach ${zd.slug} ist keine Brücke in den Buchdaten, in keiner Richtung`);
    }
  }
  console.log(`${name}: ${wege.map((w) => `${w.pfeil === 'weiterlesen' ? '↑' : '→'} ${w.titel}`).join(' | ')}`);
});

if (karten === 0) befunde.push('keine Karte im Faden gefunden');
if (befunde.length) {
  console.error(`ROT: ${befunde.length} Befund(e)\n  ${befunde.join('\n  ')}`);
  process.exit(1);
}
console.log(`GRUEN: ${karten} Karten, jede mit mindestens zwei Wegen aus den Buchdaten`);
