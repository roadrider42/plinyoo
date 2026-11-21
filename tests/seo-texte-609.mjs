#!/usr/bin/env node
// ===========================================================================
// #609 (spoonup), Titel und Beschreibungen von sechs Unterseiten — der GEBAUTE
// Kopf jeder vorgerenderten Seite trägt den freigegebenen Wortlaut.
//
//   node tests/seo-texte-609.mjs                  liest dist/<seite>/index.html
//   node tests/seo-texte-609.mjs --dist <ordner>  liest einen anderen Bauordner
//
// Quelle des Wortlauts: Redaktion spoonup claude/609/endfassung-sieben-seiten.md,
// Sprecher FREI bedingt (spoonup claude/sprecher-freigaben.md, Einträge
// 21.11.2026 "Titel und Beschreibung /zugang/, /impressum/, /kontakt/",
// "Beschreibungen /mitmachen/, /investieren/, /datenschutz/, /urheberrecht/"
// und die neu gefasste Zeile /mitmachen/, Kopie spoonup claude/609/zeile-mitmachen.txt).
// Die Startseite prüft tests/titel-609.mjs.
//
// Der Wortlaut steht hier ausgeschrieben, nicht aus translation.json gelesen —
// sonst verglich die Prüfung die Quelle mit sich selbst. Gelesen wird dist/,
// nicht translation.json: scripts/vorrendern.mjs setzt seo.<seite>.* in den
// Kopf ein, und nur das Ergebnis sieht ein Suchdienst.
//
// S1  <title>, og:title, twitter:title: je genau einmal, genau der Titel.
// S2  description, og:description, twitter:description: je genau einmal, genau
//     die Beschreibung.
// S3  Kein Platzhalter {{...}} im Kopf.
// Eine fehlende Datei ist rot (ohne Bau kein Kopf).
// Exit 0 grün, 1 rot.
// ===========================================================================

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOLL = {
  '/zugang/': {
    title: 'Zugang | plinyoo',
    description: 'Sag uns kurz, wer du bist und was du lernen oder weitergeben möchtest.',
  },
  '/impressum/': {
    title: 'Impressum | plinyoo',
    description: 'Impressum der Plinyoo UG (haftungsbeschränkt), Theodor-Fliedner-Str. 1d, 34121 Kassel.',
  },
  '/kontakt/': {
    title: 'Kontakt | plinyoo',
    description: 'Beschreibe uns deine Idee oder Herausforderung.',
  },
  '/mitmachen/': {
    title: 'Mitmachen | plinyoo',
    description:
      'Mach bei plinyoo mit: Sag uns, ob du dich bei Frontend, Backend, Mobile, Product oder Learning Design einbringen willst.',
  },
  '/investieren/': {
    title: 'Investieren | plinyoo',
    description: 'plinyoo ist eine Lernplattform für Wissen, Teams und eigene Wege.',
  },
  '/datenschutz/': {
    title: 'Datenschutzerklärung | plinyoo',
    description:
      'Hier steht, welche Daten beim Besuch dieser Website und bei Anfragen über die Formulare entstehen, wozu wir sie nutzen und welche Rechte du hast.',
  },
  '/urheberrecht/': {
    title: 'Urheberrecht & Bildnachweise | plinyoo',
    description:
      'Inhalte dieser Website gehören, sofern nicht anders gekennzeichnet, der Plinyoo UG (haftungsbeschränkt) und sind urheberrechtlich geschützt.',
  },
};

const distArg = process.argv.indexOf('--dist');
const dist = distArg > 0 ? resolve(process.argv[distArg + 1] ?? '') : join(WURZEL, 'dist');

const ent = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (kopf, attr, name) =>
  [...kopf.matchAll(new RegExp(`<meta\\s+${attr}="${name.replace(/[.:]/g, '\\$&')}"\\s+content="([^"]*)"`, 'g'))].map((m) =>
    ent(m[1]),
  );

const rot = [];
for (const [pfad, soll] of Object.entries(SOLL)) {
  const datei = join(dist, pfad, 'index.html');
  if (!existsSync(datei)) {
    rot.push(`${pfad}: ${datei} fehlt -- ohne Bau kein Kopf`);
    continue;
  }
  const kopf = readFileSync(datei, 'utf8').split('</head>')[0];

  const titel = [...kopf.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => ent(m[1]));
  if (titel.length !== 1 || titel[0] !== soll.title) rot.push(`S1 ${pfad} <title>: ${JSON.stringify(titel)}`);
  for (const [attr, name] of [['property', 'og:title'], ['name', 'twitter:title']]) {
    const w = meta(kopf, attr, name);
    if (w.length !== 1 || w[0] !== soll.title) rot.push(`S1 ${pfad} ${name}: ${JSON.stringify(w)}`);
  }
  for (const [attr, name] of [['name', 'description'], ['property', 'og:description'], ['name', 'twitter:description']]) {
    const w = meta(kopf, attr, name);
    if (w.length !== 1 || w[0] !== soll.description) rot.push(`S2 ${pfad} ${name}: ${JSON.stringify(w)}`);
  }
  const platz = kopf.match(/\{\{[^}]*\}\}/g);
  if (platz) rot.push(`S3 ${pfad} Platzhalter stehen geblieben: ${platz.join(', ')}`);
}

if (rot.length) {
  console.log(`ROT (${rot.length}):\n  ${rot.join('\n  ')}`);
  process.exit(1);
}
console.log(`GRUEN S1-S3: ${Object.keys(SOLL).length} Seiten in ${dist} tragen den freigegebenen Titel und die Beschreibung`);
