#!/usr/bin/env node
// ===========================================================================
// #658 (spoonup) -- /fuer-trainer/ nennt die Grenze 40 beim Beitritt ueber Code.
// Stelle: faq.items[1].a. Wortlaut vom Sprecher (spoonup 3474e9288 de,
// 795b46055 uebrige): hier festgehalten, damit er nur mit Freigabe wandert.
// Kein Browser, kein Netz.
//
//   npm run build                              (ruft I und D am Ende auf)
//   node tests/grenze-40-658.mjs               (Inhalt und dist/)
//   node tests/grenze-40-658.mjs --alt <ref> --wortlaut <datei> [...]
//                                              (einmaliger Beleg: A und W dazu)
//
// I  Inhalt: je Sprache endet die Antwort mit " " + Satz, der Satz steht
//    genau einmal in der Datei.
// D  Bau: die gebaute Seite traegt die ganze Antwort genau einmal als <p>.
//    Fehlende Seite ist rot.
// A  Byte-Vergleich mit <ref>: die Datei ist die alte Datei, in der die alte
//    Antwort um " " + Satz verlaengert ist, und sonst nichts.
// W  Die ganze Antwort steht als Zeile "> ..." in einer der Wortlaut-Dateien.
// Exit 0 gruen, 1 rot.
// ===========================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAETZE = {
  de: 'Über einen Code entstehen höchstens 40 neue Konten in 24 Stunden, alle weiteren sollen es später noch einmal versuchen.',
  en: 'Through one code, at most 40 new accounts are created in 24 hours; all others should try again later.',
  es: 'Con un código se crean como máximo 40 cuentas nuevas en 24 horas; todas las demás personas deben volver a intentarlo más tarde.',
  fr: 'Avec un code, 40 nouveaux comptes au maximum sont créés en 24 heures ; toutes les autres personnes doivent réessayer plus tard.',
  pl: 'Przez jeden kod powstaje co najwyżej 40 nowych kont w ciągu 24 godzin; pozostałe osoby mają spróbować ponownie później.',
  pt: 'Por um código são criadas no máximo 40 contas novas em 24 horas; as demais pessoas devem tentar de novo mais tarde.',
  uk: 'Через один код створюється щонайбільше 40 нових облікових записів за 24 години; решта людей мають спробувати пізніше ще раз.',
};

const args = process.argv.slice(2);
let altRef = null;
const wortlautDateien = [];
for (let i = 0; i < args.length; i += 2) {
  if (!args[i + 1]) throw new Error(`Wert fehlt nach ${args[i]}`);
  if (args[i] === '--alt') altRef = args[i + 1];
  else if (args[i] === '--wortlaut') wortlautDateien.push(args[i + 1]);
  else throw new Error(`Unbekannt: ${args[i]}`);
}
const wortlautZeilen = wortlautDateien.flatMap((d) => readFileSync(d, 'utf8').split('\n'));

const mal = (heu, nadel) => heu.split(nadel).length - 1;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let rot = 0;
function pruefe(id, ok, was) {
  if (!ok) rot += 1;
  console.log(`${ok ? 'GRUEN' : 'ROT  '} ${id}${ok ? '' : ' -- ' + was}`);
}

for (const [lang, satz] of Object.entries(SAETZE)) {
  const pfad = `content/seiten/fuer-trainer/${lang}.json`;
  const roh = readFileSync(join(REPO, pfad), 'utf8');
  const t = JSON.parse(roh);
  const antwort = t.faq.items[1].a;
  pruefe(`I ${lang}`, antwort.endsWith(' ' + satz) && mal(roh, satz) === 1, `Satz fehlt am Ende von faq.items[1].a oder steht ${mal(roh, satz)}-mal in ${pfad}`);

  const seite = join(REPO, 'dist', t.pfad, 'index.html');
  const n = existsSync(seite) ? mal(readFileSync(seite, 'utf8'), `<p>${esc(antwort)}</p>`) : -1;
  pruefe(`D ${lang}`, n === 1 && antwort.includes(satz), n < 0 ? `${seite} fehlt` : `ganze Antwort mit Satz ${antwort.includes(satz) ? n : 0}-mal in ${seite}`);

  if (altRef) {
    const alt = execFileSync('git', ['-C', REPO, 'show', `${altRef}:${pfad}`]);
    const altAntwort = JSON.stringify(JSON.parse(alt.toString('utf8')).faq.items[1].a);
    const einmal = mal(alt.toString('utf8'), altAntwort) === 1;
    const soll = Buffer.from(alt.toString('utf8').split(altAntwort).join(altAntwort.slice(0, -1) + ' ' + satz + '"'));
    pruefe(`A ${lang}`, einmal && soll.equals(readFileSync(join(REPO, pfad))), `nicht byte-gleich mit ${altRef} plus Satz`);
  }
  if (wortlautDateien.length) {
    pruefe(`W ${lang}`, wortlautZeilen.includes('> ' + antwort), 'Antwort steht nicht wortgleich in den Wortlaut-Dateien');
  }
}
process.exit(rot ? 1 : 0);
