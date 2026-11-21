#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup) -- Fusszeilen von www.plinyoo.com fuehren auf die Trainer-Seite.
// SEO-Vorschlag 4, Heiko frei auf E-523. Wortlaut "Für Trainer" vom Sprecher
// frei (21.11.2026, Bedingung: im gebauten HTML gemessen -- das tut diese Datei).
// Kein Browser, kein Netz. Liest das GEBAUTE HTML, nicht scripts/buchseiten.mjs.
//
//   npm run build                          (ruft diese Pruefung am Ende auf)
//   node tests/fuss-trainer-609.mjs        (dist/ dieses Repos)
//   node tests/fuss-trainer-609.mjs <dist> (anderer Bau, z. B. Gegenprobe)
//
// B  Bücherliste dist/buch/index.html: in <footer> genau ein
//    <a href="/fuer-trainer/">Für Trainer</a>.
// K  Jede Buchseite dist/buch/<slug>/index.html: dasselbe. Null Buchseiten ist rot.
// S  Startseite dist/index.html und dist/404.html: in der Zeile "Alle Bücher"
//    (<nav class="buecher-fuss">, steht im Roh-HTML fuer Roboter ohne JS)
//    genau ein solcher Link.
// Z  Das Ziel ist gebaut: dist/fuer-trainer/index.html mit <html lang="de">.
//    Sonst waere der Link tot.
//
// Alle drei Fusszeilen sind deutsch (lang="de"), darum ueberall der deutsche
// Pfad. Fehlt dist/ oder ein Teil davon, ist das ROT, nicht "nicht messbar":
// ohne den Bau gibt es den Link nicht.
// Exit 0 gruen, 1 rot.
// ===========================================================================

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(process.argv[2] || join(HIER, '..', 'dist'));
const HREF = '/fuer-trainer/';
const TEXT = 'Für Trainer';
const LINK = new RegExp(`<a href="${HREF}">${TEXT}</a>`, 'g');

console.log(`Bau: ${DIST}`);
const ergebnisse = [];
function pruefe(id, bedingungen) {
  const rot = bedingungen.filter(([ok]) => !ok).map(([, was]) => was);
  ergebnisse.push({ id, rot });
  console.log(`${rot.length ? 'ROT  ' : 'GRUEN'} ${id}${rot.length ? ' -- ' + rot.join('; ') : ''}`);
}
const lies = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
// Genau ein Link im Ausschnitt `muster` der Datei; sonst eine Fehlerzeile.
function einLink(datei, muster, was) {
  const html = lies(datei);
  if (html === null) return [false, `${datei} fehlt (nicht gebaut)`];
  const teile = [...html.matchAll(muster)];
  if (teile.length !== 1) return [false, `${datei}: ${was} steht ${teile.length}-mal da, erwartet einmal`];
  const n = (teile[0][0].match(LINK) || []).length;
  return [n === 1, `${datei}: ${was} hat ${n} Link(s) "${TEXT}" -> ${HREF}, erwartet einen`];
}
const FUSS = /<footer>[\s\S]*?<\/footer>/g;
const BUECHER_FUSS = /<nav class="buecher-fuss"[\s\S]*?<\/nav>/g;

pruefe('B Bücherliste', [einLink(join(DIST, 'buch', 'index.html'), FUSS, '<footer>')]);

const buchDir = join(DIST, 'buch');
const slugs = existsSync(buchDir)
  ? readdirSync(buchDir).filter((s) => statSync(join(buchDir, s)).isDirectory() && existsSync(join(buchDir, s, 'index.html')))
  : [];
console.log(`Buchseiten gefunden: ${slugs.length}`);
pruefe('K Buchseiten', [
  [slugs.length > 0, `keine Buchseite unter ${buchDir} (nicht gebaut)`],
  ...slugs.map((s) => einLink(join(buchDir, s, 'index.html'), FUSS, '<footer>')),
]);

pruefe('S Startseite', ['index.html', '404.html'].map((d) => einLink(join(DIST, d), BUECHER_FUSS, 'Zeile "Alle Bücher"')));

const ziel = lies(join(DIST, 'fuer-trainer', 'index.html'));
pruefe('Z Ziel gebaut', [
  [ziel !== null, `${join(DIST, 'fuer-trainer', 'index.html')} fehlt`],
  [ziel === null || /<html lang="de">/.test(ziel), 'Ziel ist nicht die deutsche Seite'],
]);

process.exit(ergebnisse.some((e) => e.rot.length) ? 1 : 0);
