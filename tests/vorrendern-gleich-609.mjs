#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup) -- das Vorrendern ist bestimmt: dieselbe Seite ergibt jedes
// Mal dasselbe HTML, und dist/ enthält genau dieses HTML.
//
//   node tests/vorrendern-gleich-609.mjs                     dist-server/entry-server.mjs und dist/
//   node tests/vorrendern-gleich-609.mjs --server <datei> --dist <ordner>
//
// Warum: Rendert der Server zweimal Verschiedenes, rendert auch der Browser
// beim Übernehmen etwas anderes als das ausgelieferte HTML. React verwirft
// dann die vorgerenderte Seite (Hydration-Fehler), der Besucher sieht sie
// neu aufgebaut. Gemessen vor dem Fix (Probe spoonup claude/609/
// vorrender-probe.mjs): Die Startseite wich ab Zeichen 51529 ab, in den
// Antworten des Wissensuniversums (Math.random beim Mischen).
//
// G1  rendern(pfad) zweimal je Seite -> bytegleich.
// G2  Zwischen den Läufen wird Math.random ersetzt (anderer Startwert), damit
//     ein Zufall nicht zufällig zweimal gleich ausfällt.
// G3  Der Inhalt von #root in dist/<pfad>/index.html ist genau dieses HTML.
//
// Gegenprobe 21.11.2026, node 22.23.4: mit gemischt() von origin/main
// (Math.random) in src/components/ui/Wissensuniversum.tsx ROT G1 für "/"
// (Abweichung ab Zeichen 51296, Antworten der Stadthitze), Exit 1. Mit dem
// Fix GRUEN.
// Exit 0 grün, 1 rot, 2 nicht messbar.
// ===========================================================================
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, v) => { const i = process.argv.indexOf(n); return i > 0 ? resolve(process.argv[i + 1]) : v; };
const SERVER = arg('--server', join(WURZEL, 'dist-server/entry-server.mjs'));
const DIST = arg('--dist', join(WURZEL, 'dist'));
if (!existsSync(SERVER)) { console.log(`ROT: ${SERVER} fehlt -- erst vite build --ssr src/entry-server.tsx --outDir dist-server`); process.exit(1); }

let mod;
try { mod = await import(pathToFileURL(SERVER).href); } catch (e) { console.log(`NICHT MESSBAR: ${SERVER} nicht ladbar (${e.message.split('\n')[0]})`); process.exit(2); }
const { rendern, SEITEN, VORGERENDERT_SPRACHE } = mod;
const texte = JSON.parse(readFileSync(join(WURZEL, 'public/locales', VORGERENDERT_SPRACHE, 'translation.json'), 'utf8'));

const echt = Math.random;
const zufall = (start) => { let s = start; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const rot = [];
for (const { pfad } of SEITEN) {
  Math.random = zufall(1);
  const a = await rendern(pfad, VORGERENDERT_SPRACHE, texte);
  Math.random = zufall(987654);
  const b = await rendern(pfad, VORGERENDERT_SPRACHE, texte);
  Math.random = echt;
  if (a !== b) {
    let i = 0; while (a[i] === b[i]) i++;
    rot.push(`G1 ${pfad}: zwei Läufe weichen ab Zeichen ${i} ab: …${a.slice(Math.max(0, i - 120), i + 60)}…`);
    continue;
  }
  const datei = join(DIST, ...pfad.split('/').filter(Boolean), 'index.html');
  if (!existsSync(datei)) { rot.push(`G3 ${pfad}: ${datei} fehlt`); continue; }
  if (!readFileSync(datei, 'utf8').includes(`<div id="root">${a}</div>`)) rot.push(`G3 ${pfad}: #root in ${datei} ist nicht das HTML aus rendern()`);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(`GRUEN G1-G3: ${SEITEN.length} Seiten zweimal gerendert, bytegleich, und genau so in dist/`);
