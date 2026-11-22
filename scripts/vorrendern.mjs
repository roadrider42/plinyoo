// scripts/vorrendern.mjs — #609 (spoonup, Heiko E-521 "B", E-522 "A alle sieben"): jede Seite der App als eigene
// Datei mit Inhalt, eigenem Titel, eigener Beschreibung und eigener Adresse.
//
// Vorher: eine index.html mit leerem #root für alle Seiten. Ein Roboter ohne JavaScript las 13 Wörter, und
// /#/zugang war für jede Suchmaschine dieselbe Adresse wie "/".
//
// Läuft in npm run build nach `vite build`, `vite build --ssr` und `cp dist/index.html dist/404.html` (404.html
// bleibt die Hülle mit leerem #root: unbekannte Pfade rendert der Browser selbst). Für jede Seite aus
// src/routes/seiten.ts und jede Sprache (#609 Schritt 3, fassungen(): /zugang/, /en/zugang/ …; Impressum und
// Datenschutz nur deutsch):
//   - #root bekommt das HTML aus dist-server/entry-server.mjs (renderToString in der Sprache der Fassung),
//   - <html lang>, og:locale, Titel, Beschreibung (auch og:/twitter:) aus seo.<seite>.* der Sprache,
//   - canonical und og:url = eigene Adresse mit Schrägstrich, hreflang je Sprache und x-default (deutsch),
//   - geschrieben nach dist/<pfad>/index.html ("/" überschreibt dist/index.html).
// Fehlt der Sprache ein Text, steht der deutsche da (Rückfall). Das ist im Bau erlaubt; ausgeliefert wird so nicht:
// tests/keine-deutschen-reste-609.mjs macht den Bau rot (Heiko E-535 "a").
// Der Kopf in dist/index.html trägt schon die Texte der Startseite (vite.config.ts, scripts/seo-kopf.mjs). Ersetzt
// wird genau dieser Wortlaut, und jede Ersetzung muss so oft treffen wie erwartet — sonst Abbruch. Ein Kopf, der
// still den Titel der Startseite behält, sähe aus wie ein gewollter.
//
//   node scripts/vorrendern.mjs [--dist <ordner>] [--server <entry-server.mjs>]
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { seoTexte } from './seo-kopf.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, vorgabe) => { const i = process.argv.indexOf(name); return i > 0 ? path.resolve(process.argv[i + 1]) : vorgabe; };
const DIST = arg('--dist', path.join(WURZEL, 'dist'));
const SERVER = arg('--server', path.join(WURZEL, 'dist-server', 'entry-server.mjs'));
const SITE = 'https://www.plinyoo.com';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Ersetzt `alt` durch `neu`, genau `soll`-mal; sonst Abbruch mit Angabe. */
function ersetze(html, alt, neu, soll, was) {
  const ist = html.split(alt).length - 1;
  if (ist !== soll) throw new Error(`${was}: "${alt.slice(0, 80)}" steht ${ist}-mal im Kopf, erwartet ${soll}-mal`);
  return html.split(alt).join(neu);
}

/** Die Texte einer Sprache aus public/locales/<sprache>/translation.json. */
export async function texteVon(sprache) {
  return JSON.parse(await readFile(path.join(WURZEL, 'public/locales', sprache, 'translation.json'), 'utf8'));
}

/**
 * Die hreflang-Verweise einer Seite: je Sprachfassung einer, dazu x-default auf die deutsche. Seiten, die es nur
 * deutsch gibt (nurDeutsch), bekommen keine: Es gibt keine zweite Fassung, auf die sie zeigen könnten.
 */
export function hreflangVerweise(seite, alle) {
  if (seite.nurDeutsch) return '';
  const fassungen = alle.filter((f) => f.seite.pfad === seite.pfad);
  const de = fassungen.find((f) => f.seite.pfad === f.pfad);
  return [...fassungen.map((f) => `<link rel="alternate" hreflang="${f.sprache}" href="${SITE}${f.pfad}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}${de.pfad}" />`].join('\n    ');
}

export async function vorrendern({ dist = DIST, server = SERVER } = {}) {
  const { rendern, fassungen, SPRACHEN, RUECKFALL_SPRACHE, OG_LOCALE } = await import(pathToFileURL(server).href);
  const rueckfall = await texteVon(RUECKFALL_SPRACHE);
  const seoDe = seoTexte(RUECKFALL_SPRACHE);
  const vorlage = await readFile(path.join(dist, 'index.html'), 'utf8');
  if (!vorlage.includes('<div id="root"></div>')) throw new Error(`${path.join(dist, 'index.html')}: kein leeres <div id="root"></div> — schon vorgerendert? Erst vite build.`);

  // Der Kopf in dist/index.html trägt die deutschen Texte der Startseite. Jede Fassung ersetzt sie durch ihre.
  const start = seoDe.start;
  const alle = fassungen(SPRACHEN);
  const geschrieben = [];
  for (const { pfad, sprache, seite } of alle) {
    const texte = sprache === RUECKFALL_SPRACHE ? rueckfall : await texteVon(sprache);
    // Titel und Beschreibung der Sprache; fehlt einer, der deutsche (Rückfall wie im Inhalt). Das ist im Bau
    // erlaubt und macht tests/keine-deutschen-reste-609.mjs rot (Heiko E-535 "a": erst übersetzen, dann ausliefern).
    const eigen = {};
    for (const feld of ['title', 'description']) {
      const wert = texte.seo?.[seite.seo]?.[feld] ?? seoDe[seite.seo]?.[feld];
      if (typeof wert !== 'string' || !wert.trim()) throw new Error(`seo.${seite.seo}.${feld} fehlt oder ist leer in public/locales/${RUECKFALL_SPRACHE}/translation.json`);
      eigen[feld] = wert;
    }
    let html = vorlage;
    html = ersetze(html, '<html lang="de">', `<html lang="${sprache}">`, 1, `${pfad} html lang`);
    html = ersetze(html, `<title>${esc(start.title)}</title>`, `<title>${esc(eigen.title)}</title>`, 1, `${pfad} title`);
    html = ersetze(html, `content="${esc(start.title)}"`, `content="${esc(eigen.title)}"`, 2, `${pfad} og:title/twitter:title`);
    html = ersetze(html, `content="${esc(start.description)}"`, `content="${esc(eigen.description)}"`, 3, `${pfad} description/og:/twitter:`);
    html = ersetze(html, '<meta property="og:locale" content="de_DE" />', `<meta property="og:locale" content="${OG_LOCALE[sprache]}" />`, 1, `${pfad} og:locale`);
    const verweise = hreflangVerweise(seite, alle);
    html = ersetze(html, `<link rel="canonical" href="${SITE}/" />`, `<link rel="canonical" href="${SITE}${pfad}" />${verweise ? `\n    ${verweise}` : ''}`, 1, `${pfad} canonical`);
    html = ersetze(html, `<meta property="og:url" content="${SITE}/" />`, `<meta property="og:url" content="${SITE}${pfad}" />`, 1, `${pfad} og:url`);

    const inhalt = await rendern(pfad, sprache, texte, rueckfall);
    if (!inhalt.trim()) throw new Error(`${pfad}: leeres HTML aus rendern()`);
    html = ersetze(html, '<div id="root"></div>', `<div id="root">${inhalt}</div>`, 1, `${pfad} #root`);

    const ziel = path.join(dist, ...pfad.split('/').filter(Boolean), 'index.html');
    await mkdir(path.dirname(ziel), { recursive: true });
    await writeFile(ziel, html, 'utf8');
    geschrieben.push(`${pfad} (${inhalt.length} Zeichen)`);
  }
  return geschrieben;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  vorrendern().then((liste) => {
    console.log(`✓ vorgerendert: ${liste.length} Seiten — ${liste.join(', ')}`);
  }, (e) => { console.error(`vorrendern: ${e.message}`); process.exit(1); });
}
