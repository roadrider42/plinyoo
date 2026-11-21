// scripts/seo-kopf.mjs — #609 (spoonup), SEO-Vorschlag 1: Titel und Beschreibung im Kopf einer Seite.
//
// Die Texte stehen genau einmal, als Schlüssel seo.<seite>.title und seo.<seite>.description in
// public/locales/<sprache>/translation.json (so sieht es der Plan zum Vorrendern vor, Abschnitt
// "Titel und Beschreibung je Seite"). index.html trägt nur Platzhalter {{seo.<seite>.<feld>}}.
// vite.config.ts setzt sie beim Bau und im Entwicklungslauf ein; das Vorrender-Skript nimmt
// später dieselbe Funktion je Seite und Sprache.
//
// Kein Rückfall: Fehlt ein Schlüssel oder bleibt ein Platzhalter stehen, bricht der Bau ab.
// Ein leerer oder deutscher Ersatztitel sähe aus wie ein gewollter.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLATZHALTER = /\{\{seo\.([a-z0-9-]+)\.([a-z]+)\}\}/g;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function seoTexte(sprache = 'de') {
  const datei = path.join(WURZEL, 'public/locales', sprache, 'translation.json');
  const seo = JSON.parse(fs.readFileSync(datei, 'utf8')).seo;
  if (!seo || typeof seo !== 'object') throw new Error(`${datei}: Schlüssel "seo" fehlt`);
  return seo;
}

export function setzeKopf(html, sprache = 'de') {
  const seo = seoTexte(sprache);
  const aus = html.replace(PLATZHALTER, (ganz, seite, feld) => {
    const wert = seo[seite]?.[feld];
    if (typeof wert !== 'string' || !wert.trim()) {
      throw new Error(`${ganz}: seo.${seite}.${feld} fehlt oder ist leer in public/locales/${sprache}/translation.json`);
    }
    return esc(wert);
  });
  const rest = aus.match(/\{\{seo\.[^}]*\}\}/);
  if (rest) throw new Error(`Platzhalter ${rest[0]} hat keine gültige Form (erwartet {{seo.<seite>.<feld>}})`);
  return aus;
}
