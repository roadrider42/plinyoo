// src/lib/alte-adressen.ts — #609 (spoonup): alte Hash-Adressen (/#/zugang) auf echte Adressen (/zugang/) umleiten.
//
// Bis #609 lief die Website mit einem Hash-Router. Links darauf stehen in Kampagnen, Mails, Buchseiten von gestern
// und in spoonup. Der Teil nach '#' kommt bei keinem Server an, und GitHub Pages wertet weder _redirects noch
// .htaccess aus. Deshalb leitet ein Skript im <head> von index.html um, VOR dem Zählskript von Plausible, damit der
// Aufruf schon unter dem neuen Pfad gezählt wird. vite.config.ts bündelt diese Datei und setzt sie dort ein
// (Platzhalter <!--ALTE-ADRESSEN-->); tests/alte-adressen-609.mjs ruft die Funktion direkt.
//
// Regel:
//   - Nur ein Hash, der mit "#/" beginnt, wird umgeleitet. Sprungmarken (#abschnitt) bleiben, wie sie sind.
//   - Bekannte Seite -> ihre Adresse mit Schrägstrich, alles andere -> "/".
//   - KEINE Angabe geht verloren: Angaben vor dem '#' und hinter dem '#' werden zusammengelegt, in dieser
//     Reihenfolge; steht derselbe Name an beiden Stellen, gilt der hinter dem '#' (wie bisher in kampagne.ts).
//   - #609 Schritt 3: Die Sprachfassungen haben eigene Pfade (/en/zugang/). "?lng=en" auf einer deutschen Adresse
//     einer Seite mit Sprachfassungen führt deshalb auf die Fassung (/zugang/?lng=en -> /en/zugang/), ohne "lng";
//     "lng=de" fällt weg. So schrieben die Trainer-Seiten und die alten Kampagnen die Sprache. Impressum und
//     Datenschutz gibt es nur deutsch: dort bleibt "lng" stehen, und i18next wählt damit die Sprache des Hinweises.
import { SEITEN, sprachPfad, zerlege } from '../routes/seiten';
import { SPRACHEN } from './sprachen';

/**
 * Neue Adresse (Pfad + Angaben) für eine alte Adresse, oder null, wenn nichts umzuleiten ist.
 * Alt ist eine #/-Adresse (der Pfad davor zählt nicht: die alten Adressen lagen alle auf "/") oder, seit
 * Schritt 3, ein "?lng=" auf einer deutschen Adresse.
 */
export function neueAdresse(search: string, hash: string, pathname = '/'): string | null {
  let ziel: string;
  const angaben = new URLSearchParams(search);
  let bleibtHash = '';
  if (hash.startsWith('#/')) {
    const rest = hash.slice(1); // "/zugang?rolle=curator"
    const frage = rest.indexOf('?');
    const hashPfad = (frage < 0 ? rest : rest.slice(0, frage)).replace(/\/+$/, '') + '/';
    const hashAngaben = frage < 0 ? '' : rest.slice(frage + 1);
    ziel = SEITEN.some((s) => s.pfad === hashPfad) ? hashPfad : '/';
    new URLSearchParams(hashAngaben).forEach((wert, name) => angaben.set(name, wert));
  } else {
    if (!angaben.has('lng')) return null;
    ziel = pathname;
    bleibtHash = hash;
  }

  const lng = angaben.get('lng');
  const { sprache: schonSprache, rest } = zerlege(ziel, SPRACHEN);
  const seite = SEITEN.find((s) => s.pfad === (rest.endsWith('/') ? rest : `${rest}/`));
  if (lng !== null && !schonSprache && seite && !seite.nurDeutsch && (SPRACHEN as readonly string[]).includes(lng)) {
    angaben.delete('lng');
    ziel = sprachPfad(lng, seite.pfad);
  } else if (!hash.startsWith('#/')) {
    return null; // kein #/ und kein lng, das einen Pfad bestimmt: nichts umzuleiten
  }
  const q = angaben.toString();
  return ziel + (q ? `?${q}` : '') + bleibtHash;
}
