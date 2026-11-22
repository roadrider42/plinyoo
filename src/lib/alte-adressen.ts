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
//   - "lng" bleibt eine Angabe (?lng=en), bis die Sprachfassungen eigene Pfade haben (Schritt 3 des Plans).
import { SEITEN } from '../routes/seiten';

/** Neue Adresse (Pfad + Angaben) für eine alte #/-Adresse, oder null, wenn nichts umzuleiten ist. */
// Der Pfad vor dem '#' zählt nicht: Die alten Adressen lagen alle auf "/".
export function neueAdresse(search: string, hash: string): string | null {
  if (!hash.startsWith('#/')) return null;
  const rest = hash.slice(1); // "/zugang?rolle=curator"
  const frage = rest.indexOf('?');
  const hashPfad = (frage < 0 ? rest : rest.slice(0, frage)).replace(/\/+$/, '') + '/';
  const hashAngaben = frage < 0 ? '' : rest.slice(frage + 1);

  const ziel = SEITEN.some((s) => s.pfad === hashPfad) ? hashPfad : '/';
  const angaben = new URLSearchParams(search);
  new URLSearchParams(hashAngaben).forEach((wert, name) => angaben.set(name, wert));
  const q = angaben.toString();
  return ziel + (q ? `?${q}` : '');
}
