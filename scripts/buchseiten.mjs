// scripts/buchseiten.mjs
// Zweck: Erzeugt aus content/buecher/<slug>.json je Buch eine eigene statische Seite
//        dist/buch/<slug>/index.html — mit eigenem Titel, eigener Beschreibung und eigenem Vorschaubild.
// Warum nicht in der App: Die Website nutzt einen Hash-Router (/#/seite). Soziale Netze und Suchmaschinen
//        lesen nur index.html; eine Unterseite hinter '#' erschiene mit dem Titel der Startseite.
// Aufbau der Seite: folgt der Vorlage von future-space.plinyoo.com (Hero, Lernkarte zum Ausprobieren, "Für wen",
//        "Was du bekommst", "So fängst du an", Fragen, dunkler Abschluss) — ohne deren Markenfarbe.
// Aufruf: läuft nach "vite build" (siehe package.json). Entwürfe ("draft": true) werden NICHT erzeugt,
//        außer mit BUCHSEITEN_DRAFT=1 (lokal testen). So kann kein Entwurf versehentlich live gehen.

import { readdir, readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'buecher');
const distDir = path.join(root, 'dist');
const SITE = 'https://www.plinyoo.com';
const LOGIN = 'https://app.plinyoo.com/login?redirect=%2Fdashboard';
const INSTA = 'https://www.instagram.com/plinyoo_path/';
const TWITTER = 'https://x.com/plinyoo_path';   // früher twitter.com, leitet auf x.com
// Logos als Inline-SVG (kein Nachladen von Dritten). Instagram nach dem Feather-Icon (MIT), X nach Simple Icons (CC0).
const ICO_INSTA = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>';
const ICO_X = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>';
const mitEntwuerfen = process.env.BUCHSEITEN_DRAFT === '1';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Wie esc, lässt aber die Inline-Auszeichnungen <strong>/<em> durch (für Beitragsabsätze mit Hervorhebungen).
const escInline = (s) =>
  esc(s).replace(/&lt;(\/?(?:strong|em))&gt;/g, '<$1>');

const exists = async (p) => access(p).then(() => true, () => false);

// Die drei Anreden: gleiche Texte wie in public/locales/de/translation.json (roles.*).
// Hier doppelt, weil die statischen Seiten keinen Zugriff auf die App-Texte haben.
const TUEREN = [
  { rolle: 'learner', titel: 'Du willst lernen?', label: 'Lernende:r',
    text: 'Lern, was dich weiterbringt — auf deinem Weg. Jede Karte, die du kannst, wird ein Stern in deinem Wissensuniversum.' },
  { rolle: 'curator', titel: 'Du willst die Welt klüger machen?', label: 'Kurator:in',
    text: 'Dein Wissen verdient ein Publikum. Du schreibst Karten, entwickelst Themen, die du mit Followern teilst, und machst die Welt so zu einem schlaueren und besseren Ort.' },
  { rolle: 'wegbereiter', titel: 'Du führst ein Team?', label: 'Wegbereiter:in',
    text: 'Dein Team wird gut, weil jede:r lernt, was für sie oder ihn wichtig ist. Du machst ein Thema auf und holst Leute per Link dazu. Wir glauben: Wer den eigenen Weg wählt, versteht auch das Pflichtprogramm besser.' },
];

const BEKOMMST = [
  { titel: 'Quellen unter jeder Karte', text: 'Jede Karte nennt ihre Quelle, und jede Frage belegt ihre Antwort mit einem Zitat. Du kannst alles gegenlesen.' },
  { titel: 'Jede Karte wird ein Stern', text: 'Was du kannst, leuchtet in deinem Wissensuniversum. Du siehst nicht, was dir noch fehlt, sondern was schon da ist.' },
  { titel: 'Du gehst deinen Weg', text: 'Karten verweisen aufeinander, nicht auf einen Kursplan. Wohin du abbiegst, entscheidest du.' },
];

const SCHRITTE = [
  { titel: 'Zugang anfragen', text: 'Sag uns kurz, wer du bist und was dich interessiert. Wir melden uns persönlich bei dir.' },
  { titel: 'Wir laden dich ein', text: 'Du bekommst einen Link, legst dein Konto an und startest mit der ersten Karte.' },
  { titel: 'Karte für Karte', text: 'Lies, antworte, sammle Sterne. Weitere Bücher folgen.' },
];

// Sternenfeld: Jede Karte ist ein Stern, die Linien sind die Verweise zwischen den Karten (aus den Karten selbst),
// dahinter eine Wolke weiteren Wissens. Der Besucher zeichnet seinen eigenen Weg von Stern zu Stern.
// Anordnung: Federmodell (Fruchterman-Reingold), deterministisch aus dem Slug, damit jeder Bau dasselbe Bild ergibt.
function seedRnd(slug) {
  let seed = [...slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function anordnung(slug, n, kanten, W, H) {
  const rnd = seedRnd(slug);
  const pos = Array.from({ length: n }, (_, i) => {
    const w = (i / n) * Math.PI * 2;
    const r = 90 + rnd() * 90;
    return { x: W / 2 + Math.cos(w) * r, y: H / 2 + Math.sin(w) * r * 0.7 };
  });
  const k = Math.sqrt((W * H) / n) * 0.62;
  for (let it = 0; it < 500; it++) {
    const t = 70 * (1 - it / 500) + 0.5;
    const f = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const rep = (k * k) / d;
      dx /= d; dy /= d;
      f[i].x += dx * rep; f[i].y += dy * rep; f[j].x -= dx * rep; f[j].y -= dy * rep;
    }
    for (const [a, b] of kanten) {
      let dx = pos[a].x - pos[b].x, dy = pos[a].y - pos[b].y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const att = (d * d) / k;
      dx /= d; dy /= d;
      f[a].x -= dx * att; f[a].y -= dy * att; f[b].x += dx * att; f[b].y += dy * att;
    }
    for (let i = 0; i < n; i++) {
      f[i].x += (W / 2 - pos[i].x) * 0.35; f[i].y += (H / 2 - pos[i].y) * 0.5; // sanfte Schwerkraft zur Mitte
      const m = Math.max(Math.hypot(f[i].x, f[i].y), 1);
      pos[i].x += (f[i].x / m) * Math.min(m, t);
      pos[i].y += (f[i].y / m) * Math.min(m, t);
    }
  }
  // auf die Fläche einpassen
  const xs = pos.map((p) => p.x), ys = pos.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const mx = 70, my = 60;
  return pos.map((p) => ({
    x: Math.round(mx + ((p.x - x0) / Math.max(x1 - x0, 1)) * (W - 2 * mx)),
    y: Math.round(my + ((p.y - y0) / Math.max(y1 - y0, 1)) * (H - 2 * my)),
  }));
}

function universum(b) {
  const knoten = b.knoten ?? [];
  const kanten = (b.kanten ?? []).map(([x, y, t]) => [x, y, t]);
  const W = 800, H = 420;
  const pos = anordnung(b.slug, knoten.length, kanten, W, H);
  const rnd = seedRnd(b.slug + '-wolke');
  // Wolke weiteren Wissens: schwache Punkte ohne Verbindung, nicht auf den Karten-Sternen
  const wolke = [];
  while (wolke.length < 110) {
    const x = Math.round(rnd() * W), y = Math.round(rnd() * H);
    if (pos.some((p) => Math.hypot(p.x - x, p.y - y) < 34)) continue;
    wolke.push(`<circle cx="${x}" cy="${y}" r="${(0.9 + rnd() * 1.5).toFixed(1)}" opacity="${(0.25 + rnd() * 0.45).toFixed(2)}"/>`);
  }
  const kantenSvg = kanten.map(([x, y, t], i) =>
    `<line class="e ${t}" data-a="${x}" data-b="${y}" x1="${pos[x].x}" y1="${pos[x].y}" x2="${pos[y].x}" y2="${pos[y].y}"/>`).join('');
  const sterne = knoten.map((k, i) =>
    `<g class="n" data-i="${i}" tabindex="0" role="button" aria-label="Karte: ${esc(k.titel)}" transform="translate(${pos[i].x} ${pos[i].y})"><circle class="hit" r="24"/><circle class="k" r="8"/><text y="26" x="${pos[i].x > W - 190 ? 14 : pos[i].x < 190 ? -14 : 0}" text-anchor="${pos[i].x > W - 190 ? 'end' : pos[i].x < 190 ? 'start' : 'middle'}">${esc(k.titel)}</text></g>`).join('');
  const daten = JSON.stringify({ titel: knoten.map((k) => k.titel), kanten: kanten.map(([x, y]) => [x, y]) });
  return `<div class="uni" id="uni">
  <div class="uniscroll"><svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Sternenfeld: ${knoten.length} Karten und ihre Verweise. Mit Tab und Eingabetaste lässt sich ein Weg von Karte zu Karte bilden.">
    <g class="wolke">${wolke.join('')}</g>
    <g class="kanten">${kantenSvg}</g>
    <g class="sterne">${sterne}</g>
  </svg></div>
  <p class="weg" id="weg" aria-live="polite">Tippe einen Stern an, um deinen Weg zu beginnen.</p>
  <p class="wegtools"><button type="button" class="teilen" id="wegreset" hidden>Neu beginnen</button></p>
  <script type="application/json" id="uni-daten">${daten.replace(/</g, '\\u003c')}</script>
</div>`;
}

// Vorschaubild je Buch (1200×630 für og:image): Sternbild des Buchs als Hintergrund, Wortmarke, Titel, Autor, rechts das Cover.
function zeilen(text, max) {
  const out = [];
  for (const wort of String(text).split(/\s+/)) {
    const z = out.length ? out[out.length - 1] : null;
    if (z !== null && (z + ' ' + wort).length <= max) out[out.length - 1] = z + ' ' + wort;
    else out.push(wort);
  }
  return out;
}

async function vorschaubild(b, coverQuelle, ziel) {
  const W = 1200, H = 630, CH = 530, CW = Math.round(CH * (b.coverBreite || 691) / (b.coverHoehe || 1063)), CX = W - CW - 70, CY = (H - CH) / 2;
  const knoten = b.knoten ?? [];
  const kanten = b.kanten ?? [];
  const pos = knoten.length ? anordnung(b.slug, knoten.length, kanten, CX - 40, H) : [];
  const linien = kanten.map(([x, y]) => `<line x1="${pos[x].x}" y1="${pos[x].y}" x2="${pos[y].x}" y2="${pos[y].y}"/>`).join('');
  const punkte = pos.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${i % 4 === 0 ? 6 : 4.5}" fill="${i % 4 === 0 ? '#E3A72F' : '#6FB3B8'}"/>`).join('');
  const titel = zeilen(b.titel, 16).slice(0, 3);
  const tGroesse = titel.length > 2 ? 60 : 76;
  const font = `font-family="Helvetica Neue, Helvetica, Arial, Liberation Sans, DejaVu Sans, sans-serif"`;
  let y = 200;
  const titelSvg = titel.map((z) => { const t = `<text x="80" y="${y}" font-size="${tGroesse}" font-weight="700" fill="#F4F5F7">${esc(z)}</text>`; y += tGroesse * 1.1; return t; }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#0F1419"/>
  <g opacity="0.25"><g stroke="#6FB3B8" stroke-width="1" opacity="0.6">${linien}</g>${punkte}</g>
  <g ${font}>${titelSvg}
  <text x="80" y="${y + 14}" font-size="34" fill="#BDE3E6">${esc(b.autor)}</text>
  <text x="80" y="${H - 70}" font-size="24" font-weight="600" fill="#E3A72F">Buchvorstellung mit Lernkarten <tspan fill="#FFFFFF">· made by plinyoo</tspan></text></g>
  <rect x="${CX + 6}" y="${CY + 10}" width="${CW}" height="${CH}" rx="6" fill="#000" opacity="0.5"/>
</svg>`;
  const cover = await sharp(coverQuelle).resize(CW, CH, { fit: 'cover' }).toBuffer();
  await sharp(Buffer.from(svg)).composite([{ input: cover, left: CX, top: CY }]).png().toFile(ziel);
}

// Karten zum Durchspielen — Konzept von future-space.plinyoo.com (echte Karte, Frage, Rückmeldung, Beleg, Quelle),
// auf alle Karten des Buchs ausgedehnt: Jede Karte ist aufklappbar, jede Frage einzeln beantwortbar (mit "Nochmal versuchen").
// Sind alle Fragen einer Karte richtig, leuchtet ihr Stern im Sternenfeld. Der Weg im Sternenfeld bestimmt die Reihenfolge:
// Die Karten der angetippten Sterne stehen zuerst. Ohne JavaScript stehen Antworten und Belege gleich da.
function frageBlock(f, i, j, gesamt) {
  const richtig = f.optionen.find((o) => o.ok);
  const id = `f-${i}-${j}`;
  return `<div class="frage" data-f="${j}">
    <p class="fl">Frage ${j + 1} von ${gesamt}</p>
    <p class="ft" id="${id}">${esc(f.frage)}</p>
    <div class="opts" role="group" aria-labelledby="${id}">
      ${f.optionen.map((o) => `<button type="button" class="opt" data-ok="${o.ok ? 1 : 0}" data-fb="${esc(o.fb)}">${esc(o.text)}</button>`).join('\n      ')}
    </div>
    <p class="rueck" aria-live="polite"></p>
    <div class="nachher">
      <p><strong>Richtig:</strong> ${esc(richtig.text)}</p>
      <p class="beleg"><span class="bl">Beleg aus der Quelle:</span> „${esc(f.beleg)}“<br><span class="de">(eigene Übersetzung: „${esc(f.belegDe)}“)</span></p>
    </div>
    <button type="button" class="nochmal" hidden>Nochmal versuchen</button>
  </div>`;
}

function kartenBlock(k, i) {
  const q = k.quelle;
  return `<details class="kartek" data-i="${i}" data-slug="${esc(k.slug)}"${i === 0 ? ' open' : ''}>
  <summary><span class="ks" aria-hidden="true">✦</span><span class="kt">${esc(k.kurz)}</span><span class="kstatus">${k.fragen.length} Fragen</span></summary>
  <article class="karte">
    <p class="kl">Lernkarte</p>
    <h3>${esc(k.titel)}</h3>
    <p>${esc(k.karte)}</p>
  </article>
  ${k.fragen.map((f, j) => frageBlock(f, i, j, k.fragen.length)).join('\n  ')}
  <p class="quelle">Quelle: ${esc(q.titel)} — ${esc(q.herausgeber)}, abgerufen ${esc(q.abgerufen)}. <a href="${esc(q.url)}" rel="noopener">Zur Quelle</a></p>
</details>`;
}

function kartenSektion(b) {
  const karten = b.kartenvoll ?? [];
  if (karten.length === 0) return '';
  return `<section class="sek alt" id="probe" aria-labelledby="probe-h"><div class="wrap">
  <h2 id="probe-h">${esc(b.probeTitel || 'Gehe deinen eigenen Weg durch die Karten')}</h2>
  <p class="lead">Öffne eine Karte hier oder tippe oben einen Stern an: Die Karten deines Weges stehen zuerst. Jede Karte hat zwei bis drei Fragen. Wer alle richtig beantwortet, lässt den Stern leuchten.</p>
  <p class="stand" id="stand" aria-live="polite">Du kannst 0 von ${karten.length} Karten.</p>
  <div id="kartenliste" data-gesamt="${karten.length}">
  ${karten.map((k, i) => kartenBlock(k, i)).join('\n  ')}
  </div>
</div></section>`;
}

// Der Beitrag zum Buch als Anreißer unter den Hero-Knöpfen: eingeklappt, öffnet sich an Ort und Stelle (kein Sprung über die Seite),
// klar als Meinungsbeitrag gekennzeichnet. Er beruht auf dem Buch; die Lernkarten stützen sich bewusst auf andere Quellen.
function beitragFalte(bt, buchTitel, buchAutor) {
  if (!bt || !bt.absaetze || bt.absaetze.length === 0) return '';
  return `<details class="beitrag-fold">
    <summary><span class="bk">${esc(bt.etikett || 'Dazu ein Beitrag')}</span><span class="bt">${esc(bt.titel)}</span>${bt.anreisser ? `<span class="anreisser">${esc(bt.anreisser)}</span>` : ''}<span class="mehr"><span class="auf">Weiterlesen ▾</span><span class="zu">Einklappen ▴</span></span></summary>
    <div class="lesetext">
      ${bt.absaetze.map((a) => `<p>${escInline(a)}</p>`).join('\n      ')}
      <p class="status">Meinungsbeitrag von ${esc(bt.autor)} auf Grundlage von ${esc(buchAutor)}s Buch „${esc(buchTitel)}“. Die Lernkarten auf dieser Seite stützen sich dagegen auf andere Quellen.</p>
    </div>
  </details>`;
}

function seite(b, mitCover) {
  const url = `${SITE}/buch/${b.slug}/`;
  const titelVoll = `${b.titel} — ${b.autor}`;
  const ogBild = mitCover ? `${url}og.png` : `${SITE}/og/buchseite.png`;
  const titel = `${b.autor}: ${b.titel} — Buchvorstellung | plinyoo`;
  const desc = b.leitfrage;
  const karten = b.karten ?? [];
  const slugQ = encodeURIComponent(b.slug);
  const zugang = `/?buch=${slugQ}#/zugang`;

  const faq = [
    ['Stammen die Karten aus dem Buch?', `Nein. Die Karten stützen sich auf andere Quellen, jede Karte nennt ihre. Das Buch ist der Anlass, nicht die Vorlage.`],
    ['Muss ich etwas installieren?', 'Nein. plinyoo läuft im Browser, auch auf dem Telefon.'],
    ['Was ist plinyoo?', 'Stell dir vor, alles, was ein Mensch weiß, wäre für jeden anderen begehbar: nicht als Kurs mit festem Gang, sondern als Landschaft, durch die man seinen eigenen Weg wählt. Das ist unser Ziel: Wissen von Kopf zu Kopf zu bringen, ohne dass der Weg dorthin länger, teurer oder dünner wird. plinyoo ist der erste Schritt. <a href="/">Mehr auf der Startseite</a>.'],
  ];

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${b.draft ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:site_name" content="plinyoo">
<meta property="og:type" content="article">
<meta property="og:locale" content="de_DE">
<meta property="og:title" content="${esc(titelVoll)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogBild}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://plausible.io 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://plausible.io; base-uri 'self'; form-action 'self'">
<style>
:root{--bg:#F4F5F7;--ink:#141A1F;--muted:#5B6672;--line:#D7DEE6;--teal:#6FB3B8;--teal-d:#3E8A90;--mist:#E6F0EF;--amber:#E3A72F;--graphite:#1C2A33;--surface2:#F8FAFC}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:17px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--graphite)}
.wrap{max-width:900px;margin:0 auto;padding:0 20px}
.entwurf{background:var(--amber);color:#1C2A33;text-align:center;padding:8px 12px;font-weight:600;font-size:14px}
header.top{border-bottom:1px solid var(--line);background:#fff}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;padding-bottom:12px}
header.top .logo{font-weight:700;font-size:20px;text-decoration:none;color:var(--graphite)}
header.top nav{display:flex;align-items:center;gap:10px}
.login{font-size:15px;color:var(--muted);text-decoration:none;padding:8px 6px}
.btn{display:inline-block;padding:12px 18px;border-radius:10px;border:2px solid var(--graphite);color:var(--graphite);font-weight:600;text-decoration:none;background:#fff;margin:0 10px 10px 0;line-height:1.3}
.btn:hover{background:var(--mist)}
.btn.haupt{background:var(--graphite);color:#fff}
.btn.haupt:hover{background:#12202a}
header.top .btn{margin:0;padding:8px 14px;font-size:15px}
.hero{padding:44px 0 36px}
.eyebrow{display:inline-block;margin:0 0 14px;padding:4px 12px;border-radius:999px;background:var(--mist);font-size:13px;font-weight:600;color:var(--teal-d)}
.hero h1{margin:0 0 14px;font-size:clamp(28px,5.2vw,42px);line-height:1.15;color:var(--graphite)}
.hero .grid{display:grid;grid-template-columns:1fr;gap:22px}
@media(min-width:660px){.hero .grid.mit-cover{grid-template-columns:1fr 160px;align-items:start}}
.meta{color:var(--muted);font-size:15px;margin:0 0 12px}
.hero .lead{font-size:18px;color:var(--muted);margin:0 0 20px}
figure.cover{margin:0}
figure.cover img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:4px;background:#fff}
figure.cover figcaption{font-size:12px;color:var(--muted);margin-top:6px}
.sek{padding:48px 0}
.sek.alt{background:var(--surface2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sek h2{margin:0 0 8px;font-size:clamp(22px,4vw,28px);color:var(--graphite)}
.sek .lead{color:var(--muted);margin:0 0 18px}
.karten3{display:grid;grid-template-columns:1fr;gap:14px;margin-top:18px}
@media(min-width:720px){.karten3{grid-template-columns:repeat(3,1fr)}}
.k3{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px;display:flex;flex-direction:column}
.k3 .rl{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--teal-d);margin:0 0 6px}
.k3 h3{margin:0 0 8px;font-size:18px;color:var(--graphite)}
.k3 p{margin:0 0 10px;font-size:15px;color:var(--muted)}
.k3 .weiter{margin-top:auto;font-weight:600;font-size:15px}
.schritt{counter-increment:s}
.schritt h3::before{content:counter(s);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-right:10px;border-radius:50%;background:var(--graphite);color:#fff;font-size:14px}
.schritte{counter-reset:s}
.uni{background:var(--graphite);border-radius:14px;padding:10px 10px 4px}
.uniscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.uni svg{display:block;width:100%;height:auto}
@media(max-width:719px){.uni svg{min-width:620px}.uni .n .hit{transform:scale(1.35);transform-box:fill-box;transform-origin:center}}
.uni .wolke circle{fill:#9FB6C2}
.uni .e{stroke:#4C7A82;stroke-width:1.3;opacity:.75}
.uni .e.voraussetzung{stroke-width:1.8}
.uni .e.weg{stroke:var(--amber);stroke-width:3.2;opacity:1}
.uni .n{cursor:pointer;outline:none}
.uni .n .hit{fill:transparent}
.uni .n .k{fill:#BDE3E6;transition:fill .2s,r .2s;filter:drop-shadow(0 0 5px rgba(160,215,220,.55))}
.uni .n:hover .k,.uni .n:focus-visible .k{fill:#fff;r:10}
.uni .n:focus-visible .hit{stroke:#fff;stroke-width:1.5}
.uni .n.besucht .k{fill:var(--amber);filter:drop-shadow(0 0 7px rgba(227,167,47,.8))}
.uni .n.nachbar .k{stroke:var(--amber);stroke-width:2.5;animation:puls 1.6s ease-in-out infinite}
.uni .n text{display:none;fill:#E6F0EF;font-size:13px;pointer-events:none}
.uni .weg{margin:8px 6px 4px;color:#E6F0EF;font-size:16px;min-height:3.2em}
.uni .wegtools{margin:0 6px 8px}
.uni .teilen{color:#BDE3E6}
@keyframes puls{50%{stroke-opacity:.25}}
@media(prefers-reduced-motion:reduce){.uni .n.nachbar .k{animation:none}}
@media(min-width:720px){.uni .n.besucht text,.uni .n:hover text,.uni .n:focus-visible text{display:block}}
details.liste{margin-top:14px;border:0;padding:0}
details.liste summary{font-weight:500;font-size:15px;color:var(--muted)}
ol.karten{margin:14px 0 0;padding-left:22px}
ol.karten li{margin:4px 0}
.status{font-size:13px;color:var(--muted);margin-top:8px}
.karte{background:#fff;border:1px solid var(--line);border-left:4px solid var(--teal);border-radius:10px;padding:14px 18px;margin:14px 0}
.karte h3{margin:2px 0 8px;font-size:18px;color:var(--graphite)}
.karte p{margin:6px 0}
.kl,.fl{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--teal-d);margin:0}
.ft{font-weight:700;margin:6px 0 10px}
.opts{display:grid;gap:8px}
.opt{display:block;width:100%;text-align:left;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:#fff;font:inherit;color:var(--ink);cursor:pointer}
.opt:hover:not(:disabled){background:var(--mist)}
.opt:disabled{cursor:default}
.opt.richtig{border-color:#2F7D4F;background:#E8F4EC}
.opt.falsch{border-color:#B3402F;background:#FBEAE7}
.rueck{margin:12px 0 0;font-size:15px}
.nachher{margin-top:12px}
.js .nachher{display:none}
.js .nachher.offen{display:block}
.nachher .beleg{font-size:14px;color:var(--muted);border-left:2px solid var(--teal);padding-left:12px}
.nachher .bl{font-weight:600;color:var(--ink)}
.nachher .de{font-size:13px}
.ohnejs{font-size:13px;color:var(--muted)}
.quelle{font-size:13px;color:var(--muted);margin-top:14px}
.stand{font-weight:600;color:var(--graphite);margin:0 0 14px}
#kartenliste{display:grid;gap:10px}
details.kartek,details.kartek:first-of-type{background:#fff;border:1px solid var(--line);border-radius:12px;padding:0 18px}
details.kartek[open]{padding-bottom:10px}
details.kartek.gewaehlt{border-left:4px solid var(--amber)}
details.kartek.gekonnt{border-color:#2F7D4F}
.kartek summary{display:flex;align-items:center;gap:10px;padding:14px 0;cursor:pointer;font-weight:600;color:var(--graphite);list-style:none}
.kartek summary::-webkit-details-marker{display:none}
.kartek .ks{color:var(--teal);font-size:18px}
.kartek.gekonnt .ks{color:var(--amber)}
.kartek .kt{flex:1}
.kartek .kstatus{font-weight:400;font-size:14px;color:var(--muted);white-space:nowrap}
.kartek.gekonnt .kstatus{color:#2F7D4F;font-weight:600}
.kartek .karte{margin-top:0}
.kartek .frage{margin:14px 0 4px}
.nochmal{margin-top:10px;background:none;border:0;padding:0;font:inherit;font-size:15px;color:var(--graphite);text-decoration:underline;cursor:pointer}
.uni .n.gekonnt .k{fill:#fff;stroke:var(--amber);stroke-width:3;filter:drop-shadow(0 0 8px rgba(255,255,255,.85))}
.uni .n.gekonnt.besucht .k{fill:var(--amber)}
.abschluss .rollen a{color:#fff}
.abschluss .rollen{font-size:15px}
.kauf{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 20px 12px}
.kauf .meta{margin-bottom:12px}
.anzeige{display:inline-block;margin-left:8px;padding:1px 6px;border:1px solid var(--muted);border-radius:4px;font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;vertical-align:middle}
.hinweis{font-size:13px;color:var(--muted);margin:4px 0 0}
details.faq{border-bottom:1px solid var(--line);padding:14px 0}
details.faq:first-of-type{border-top:1px solid var(--line)}
summary{cursor:pointer;font-weight:600;color:var(--graphite)}
details.faq p{margin:10px 0 0;color:var(--muted)}
.abschluss{background:var(--graphite);color:#fff;padding:52px 0}
.abschluss h2{margin:0 0 10px;font-size:clamp(22px,4vw,28px);color:#fff}
.abschluss p{margin:0 0 18px;color:#D3DEE6}
.abschluss .btn{border-color:#fff;color:#fff;background:transparent}
.abschluss .btn:hover{background:rgba(255,255,255,.12)}
.abschluss .btn.haupt{background:#fff;color:var(--graphite)}
.abschluss .btn.haupt:hover{background:#E6F0EF}
.teilen-zeile{margin:22px 0 0;font-size:15px}
.teilen-zeile a{color:#fff}
.ico{width:1.1em;height:1.1em;vertical-align:-.2em;margin-right:.3em}
a.sozial{white-space:nowrap}
.teilen{background:none;border:0;padding:0;font:inherit;color:#fff;text-decoration:underline;cursor:pointer}
.lesetext{max-width:65ch}
.lesetext p{margin:0 0 24px;line-height:1.7}
.beitrag-fold{margin:18px 0 0;max-width:68ch;border-left:3px solid var(--line);padding:2px 0 2px 14px;border-bottom:0;font-size:17px}
@media(min-width:768px){.beitrag-fold{font-size:18px}}
.beitrag-fold:first-of-type{border-top:0}
.beitrag-fold summary{display:block;cursor:pointer;list-style:none;font-weight:400;color:var(--ink);font-size:1em;line-height:1.5}
.beitrag-fold summary::-webkit-details-marker{display:none}
.beitrag-fold .bk{display:block;font-size:1em;font-weight:600;color:var(--teal-d);margin-bottom:2px}
.beitrag-fold .bt{display:block;font-size:1em;color:var(--graphite);font-weight:700;margin-bottom:4px}
.beitrag-fold .anreisser{display:block;font-size:1em;color:var(--ink)}
.beitrag-fold[open] .anreisser{display:none}
.beitrag-fold .mehr{display:inline-block;margin-top:6px;font-size:1em;font-weight:600;color:var(--graphite);text-decoration:underline;text-underline-offset:3px}
.beitrag-fold .zu{display:none}
.beitrag-fold[open] .auf{display:none}
.beitrag-fold[open] .zu{display:inline}
.beitrag-fold[open] summary{margin-bottom:14px}
.beitrag-fold .lesetext{max-width:none}
.beitrag-fold .lesetext p{font-size:1em;color:var(--ink);line-height:1.65}
.beitrag-fold .lesetext p.status{font-size:.8em;color:var(--muted);margin-top:6px}
footer{padding:22px 0 30px;font-size:14px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:6px 14px}
footer a{color:var(--muted)}
@media(min-width:768px){
body{font-size:18px}
.meta{font-size:16px}
.k3 p,.rueck{font-size:16.5px}
.nachher .beleg{font-size:15.5px}
.nachher .de,.ohnejs,.quelle,.status,.hinweis{font-size:14.5px}
.kl,.fl,.k3 .rl{font-size:13px}
.login{font-size:16px}
footer{font-size:15px}
summary{font-size:18px}
}
</style>
<script>document.documentElement.className+=' js';try{if('scrollRestoration' in history){history.scrollRestoration='manual'}}catch(e){}</script>
<script async src="https://plausible.io/js/pa--uQFBayBpH0z77zfdWY78.js"></script>
<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
</head>
<body>
${b.draft ? '<div class="entwurf">ENTWURF — nicht veröffentlicht, Kartentitel sind Arbeitstitel</div>' : ''}
<header class="top"><div class="wrap">
  <a class="logo" href="/" aria-label="plinyoo, zur Startseite">plinyoo</a>
  <nav aria-label="Hauptnavigation">
    <a class="login" href="${LOGIN}">Anmelden</a>
    <a class="btn haupt" data-zugang href="${zugang}">Zugang anfragen</a>
  </nav>
</div></header>

<main>
<section class="hero"><div class="wrap">
  <p class="eyebrow">Buchvorstellung</p>
  <div class="grid${mitCover ? ' mit-cover' : ''}">
    <div>
      <h1>${esc(b.leitfrage)}</h1>
      <p class="meta"><strong>${esc(b.autor)}: ${esc(b.titel)}</strong> — ${esc(b.untertitel)}<br>
      ${b.uebersetzer ? `Aus dem Englischen von ${esc(b.uebersetzer)} · ` : ''}${esc(b.verlag)} · ${esc(b.erschienen)}${b.beitrag ? '' : ''}</p>
      <p class="lead">${esc(b.einordnung)}</p>
      ${beitragFalte(b.beitrag, b.titel, b.autor)}
    </div>
    ${mitCover ? `<figure class="cover"><img src="cover.jpg" width="${b.coverBreite || 691}" height="${b.coverHoehe || 1063}" alt="Buchcover: ${esc(b.titel)} von ${esc(b.autor)}"><figcaption>${esc(b.coverCredit || '')}</figcaption></figure>` : ''}
  </div>
</div></section>

<section class="sek" aria-labelledby="karten-h"><div class="wrap">
  <h2 id="karten-h">${esc(b.graphTitel || 'Der Wissensgraph zum Buch')}</h2>
  <p class="lead">Jeder Stern ist eine Karte, jede Linie ein Verweis. Such dir einen Stern und geh von dort, wohin es dich zieht: So erschließt du dir deinen eigenen Teil des Wissensuniversums.</p>
  ${universum(b)}
  ${b.kartenStatus ? `<p class="status">${esc(b.kartenStatus)}</p>` : ''}
  <p class="status">${esc(b.kartenIntro)}</p>
</div></section>

${kartenSektion(b)}

<section class="sek" aria-labelledby="start-h"><div class="wrap">
  <h2 id="start-h">So fängst du an</h2>
  <div class="karten3 schritte">
    ${SCHRITTE.map((t) => `<div class="k3 schritt"><h3>${esc(t.titel)}</h3><p>${esc(t.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="sek alt" id="fuerwen" aria-labelledby="fuerwen-h"><div class="wrap">
  <h2 id="fuerwen-h">Drei Rollen - Fragen?</h2>
  <div class="karten3">
    ${TUEREN.map((t) => `<div class="k3"><p class="rl">${esc(t.label)}</p><h3>${esc(t.titel)}</h3><p>${esc(t.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="sek" aria-labelledby="bekommst-h"><div class="wrap">
  <h2 id="bekommst-h">Was du bekommst</h2>
  <div class="karten3">
    ${BEKOMMST.map((t) => `<div class="k3"><h3>${esc(t.titel)}</h3><p>${esc(t.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="sek alt" aria-labelledby="buch-h"><div class="wrap">
  <h2 id="buch-h">Das Buch</h2>
  <div class="kauf" aria-label="Bezugsquellen">
    <p class="meta">${esc(b.verlag)} · ISBN ${esc(b.isbn)}</p>
    <p>
      <a class="btn" data-kauf="verlag" href="${esc(b.verlagUrl)}" rel="noopener">Beim Verlag ansehen</a>
      <a class="btn" data-kauf="amazon" href="${esc(b.amazonUrl)}" rel="sponsored noopener" target="_blank">Bei Amazon bestellen<span class="anzeige">Anzeige</span></a>
    </p>
    ${b.leseprobeUrl ? `<p><a data-kauf="leseprobe" href="${esc(b.leseprobeUrl)}" rel="noopener">Leseprobe beim Verlag (PDF)</a></p>` : ''}
    <p class="hinweis">Der Amazon-Link ist ein Partnerlink (Werbung). Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.</p>
  </div>
  ${b.naechsteWoche ? `<h2 style="margin-top:32px">Nächste Woche</h2><p>${esc(b.naechsteWoche)}</p>` : ''}
</div></section>

<section class="sek" aria-labelledby="faq-h"><div class="wrap">
  <h2 id="faq-h">Häufige Fragen</h2>
  ${faq.map(([f, a]) => `<details class="faq"><summary>${esc(f)}</summary><p>${a}</p></details>`).join('\n  ')}
</div></section>

<section class="abschluss" aria-labelledby="abschluss-h"><div class="wrap">
  <h2 id="abschluss-h">Hat dich das neugierig gemacht?</h2>
  <p>Das hier ist ein erster Schritt. Wir sammeln gerade Rückmeldungen: Was hat dir gefallen, was hat gefehlt, was würdest du dir für dich oder dein Team wünschen? Wer Interesse hat, meldet sich hier. Wir antworten persönlich.</p>
  <p><a class="btn haupt" data-zugang href="${zugang}">Zugang anfragen</a><a class="btn" id="wasist" href="/">Was ist plinyoo?</a></p>
  <p class="rollen">Ich komme als
    ${TUEREN.map((t) => `<a data-rolle="${t.rolle}" href="${zugang}?rolle=${t.rolle}">${esc(t.label)}</a>`).join(' · ')}</p>
  <p class="teilen-zeile">Folge uns auf <a class="sozial" data-sozial="instagram" href="${INSTA}" rel="noopener me" target="_blank" aria-label="Instagram: @plinyoo_path">${ICO_INSTA}Instagram</a> und <a class="sozial" data-sozial="twitter" href="${TWITTER}" rel="noopener me" target="_blank" aria-label="X (Twitter): @plinyoo_path">${ICO_X}X (Twitter)</a>: @plinyoo_path. Oder schick die Seite an jemanden, der sie brauchen kann: <button class="teilen" id="teilen" type="button">Seite weitergeben</button></p>
</div></section>
</main>

<footer><div class="wrap">
  <a href="/">plinyoo.com</a><a href="/#/impressum">Impressum</a><a href="/#/datenschutz">Datenschutz</a><a href="/#/urheberrecht">Urheberrecht</a><a class="sozial" href="${INSTA}" rel="noopener me" target="_blank" aria-label="Instagram: @plinyoo_path">${ICO_INSTA}Instagram</a><a class="sozial" href="${TWITTER}" rel="noopener me" target="_blank" aria-label="X (Twitter): @plinyoo_path">${ICO_X}X (Twitter)</a>
</div></footer>

<script>
// Landingpage: ohne Sprungmarke immer oben beginnen. Der Browser würde sonst nach Zurück-Taste oder Tab-Wiederherstellung
// an der alten Stelle landen (gemessen: Pixel 3141 auf dem Handy = Abschnitt "13 Karten, viele Wege"), obwohl der Besucher oben beginnen soll.
if(!location.hash){window.scrollTo({top:0,left:0,behavior:'instant'})}
// Herkunft (utm_*) von dieser Seite an das Formular weiterreichen; die Startseite liest sie vor dem '#'.
(function(){
  var q=new URLSearchParams(location.search), keep=new URLSearchParams();
  keep.set('buch',${JSON.stringify(b.slug)});
  ['utm_source','utm_medium','utm_campaign'].forEach(function(k){var v=q.get(k);if(v)keep.set(k,v)});
  document.querySelectorAll('[data-zugang],[data-rolle]').forEach(function(a){
    var r=a.getAttribute('data-rolle');
    a.href='/?'+keep.toString()+'#/zugang'+(r?'?rolle='+r:'');
  });
  // Karten zum Durchspielen: Fragen beantworten, "Nochmal versuchen", Stern leuchtet bei einer gekonnten Karte
  var liste=document.getElementById('kartenliste');
  var karten=liste?[].slice.call(liste.querySelectorAll('.kartek')):[];
  var gesamt=karten.length, gekonnt={};
  var sterneEls=document.querySelectorAll('#uni .n');
  function sternZu(i){return [].filter.call(sterneEls,function(g){return +g.getAttribute('data-i')===i})[0]}
  function ereignis(name,props){if(window.plausible)window.plausible(name,{props:props})}
  function stand(){
    var n=Object.keys(gekonnt).length, el=document.getElementById('stand');
    if(el)el.textContent=(n===gesamt&&gesamt>0)?'Du kannst alle '+gesamt+' Karten. Dein Wissensuniversum leuchtet.':'Du kannst '+n+' von '+gesamt+' Karten.';
  }
  function pruefeKarte(k){
    var bl=k.querySelectorAll('.frage'), i=+k.getAttribute('data-i'), richtig=0, beantwortet=0;
    [].forEach.call(bl,function(b){var st=b.getAttribute('data-status'); if(st)beantwortet++; if(st==='richtig')richtig++;});
    var ok=richtig===bl.length;
    k.classList.toggle('gekonnt',ok);
    var st=sternZu(i); if(st)st.classList.toggle('gekonnt',ok);
    k.querySelector('.kstatus').textContent=ok?'gekonnt ✓':(beantwortet?richtig+' von '+bl.length+' richtig':bl.length+' Fragen');
    if(ok&&!gekonnt[i]){gekonnt[i]=true;ereignis('Karte gekonnt',{karte:k.getAttribute('data-slug')});}
    if(!ok&&gekonnt[i]){delete gekonnt[i];}
    stand();
  }
  // Weitere Messpunkte (ohne Personenbezug): Beitrag geöffnet, Kauf-Link geklickt
  var bf=document.querySelector('.beitrag-fold'), bfGemeldet=false;
  if(bf)bf.addEventListener('toggle',function(){if(bf.open&&!bfGemeldet){bfGemeldet=true;ereignis('Beitrag geöffnet',{});}});
  document.querySelectorAll('[data-kauf]').forEach(function(a){
    a.addEventListener('click',function(){ereignis('Kauf-Link geklickt',{ziel:a.getAttribute('data-kauf')});});
  });
  document.querySelectorAll('.frage').forEach(function(block){
    var k=block.closest('.kartek');
    var opts=block.querySelectorAll('.opt');
    var rueck=block.querySelector('.rueck'), nachher=block.querySelector('.nachher'), nochmal=block.querySelector('.nochmal');
    opts.forEach(function(o){
      o.addEventListener('click',function(){
        var ok=o.getAttribute('data-ok')==='1';
        opts.forEach(function(x){x.disabled=true; if(x.getAttribute('data-ok')==='1')x.classList.add('richtig');});
        if(!ok)o.classList.add('falsch');
        rueck.textContent=(ok?'':'Nicht ganz. ')+o.getAttribute('data-fb');
        nachher.classList.add('offen');
        block.setAttribute('data-status',ok?'richtig':'falsch');
        nochmal.hidden=ok;
        pruefeKarte(k);
        ereignis('Frage beantwortet',{karte:k.getAttribute('data-slug'),frage:String(+block.getAttribute('data-f')+1),richtig:ok?'ja':'nein'});
      });
    });
    nochmal.addEventListener('click',function(){
      opts.forEach(function(x){x.disabled=false;x.classList.remove('richtig','falsch');});
      rueck.textContent='';nachher.classList.remove('offen');nochmal.hidden=true;block.removeAttribute('data-status');
      pruefeKarte(k);
    });
  });
  // Sternenfeld: Weg von Stern zu Stern entlang der Verweise
  (function(){
    var uni=document.getElementById('uni'); if(!uni)return;
    var D=JSON.parse(document.getElementById('uni-daten').textContent);
    var sterne=uni.querySelectorAll('.n'), linien=uni.querySelectorAll('.e');
    var status=document.getElementById('weg'), reset=document.getElementById('wegreset');
    var nb=D.titel.map(function(){return []});
    D.kanten.forEach(function(k){nb[k[0]].push(k[1]);nb[k[1]].push(k[0]);});
    var scroller=uni.querySelector('.uniscroll');
    if(scroller)scroller.scrollLeft=(scroller.scrollWidth-scroller.clientWidth)/2;
    function ordneKarten(){
      if(!liste)return;
      var gew=weg.map(function(i){return karten.filter(function(b){return +b.getAttribute('data-i')===i})[0]}).filter(Boolean);
      var rest=karten.filter(function(b){return weg.indexOf(+b.getAttribute('data-i'))<0});
      karten.forEach(function(b){b.classList.toggle('gewaehlt',weg.indexOf(+b.getAttribute('data-i'))>-1)});
      gew.concat(rest).forEach(function(b){liste.appendChild(b)});
      var letzte=gew[gew.length-1]; if(letzte)letzte.open=true;
    }
    var weg=[], gemeldet=false;
    function titel(i){return D.titel[i];}
    function zeichne(){
      var cur=weg.length?weg[weg.length-1]:-1;
      sterne.forEach(function(g){
        var i=+g.getAttribute('data-i');
        g.classList.toggle('besucht',weg.indexOf(i)>-1);
        g.classList.toggle('nachbar',cur>-1&&nb[cur].indexOf(i)>-1&&weg.indexOf(i)<0);
      });
      linien.forEach(function(l){
        var a=+l.getAttribute('data-a'),b=+l.getAttribute('data-b'),ia=weg.indexOf(a),ib=weg.indexOf(b);
        l.classList.toggle('weg',ia>-1&&ib>-1&&Math.abs(ia-ib)===1);
      });
      reset.hidden=weg.length===0;
      ordneKarten();
      if(cur<0){status.textContent='Tippe einen Stern an, um deinen Weg zu beginnen.';return;}
      var weiter=nb[cur].filter(function(i){return weg.indexOf(i)<0}).map(titel);
      function satz(t){return /[.?!]$/.test(t)?t+' ':t+'. ';}   // kein "?." wenn ein Kartenname selbst mit Fragezeichen endet
      status.textContent=satz('Dein Weg: '+weg.map(titel).join(' → '))+
        (weiter.length?satz('Von hier führt es weiter zu: '+weiter.join(', '))+'Tippe einen leuchtenden Stern an.':'Hier endet dieser Weg. Geh zurück zu einem früheren Stern oder beginne neu.');
    }
    function waehle(i){
      var cur=weg.length?weg[weg.length-1]:-1;
      var pos=weg.indexOf(i);
      if(cur<0){weg=[i];}
      else if(pos>-1){weg=weg.slice(0,pos+1);}
      else if(nb[cur].indexOf(i)>-1){weg.push(i);}
      else{status.textContent='Von „'+titel(cur)+'" gibt es keinen direkten Verweis zu „'+titel(i)+'". Tippe einen leuchtenden Stern an.';return;}
      zeichne();
      if(!gemeldet&&window.plausible){gemeldet=true;window.plausible('Wissensuniversum erkundet');}
    }
    sterne.forEach(function(g){
      var i=+g.getAttribute('data-i');
      g.addEventListener('click',function(){waehle(i)});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();waehle(i)}});
    });
    reset.addEventListener('click',function(){weg=[];zeichne();});
  })();
  var w=document.getElementById('wasist');
  if(w)w.addEventListener('click',function(){if(window.plausible)window.plausible('Was ist plinyoo geklickt')});
  var t=document.getElementById('teilen');
  t.addEventListener('click',function(){
    ereignis('Seite weitergegeben',{});
    var u=location.origin+location.pathname;
    if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){t.textContent='Link kopiert'})}
  });
})();
</script>
</body>
</html>
`;
}

async function main() {
  if (!(await exists(contentDir))) return;
  const dateien = (await readdir(contentDir)).filter((f) => f.endsWith('.json'));
  let erzeugt = 0, uebersprungen = 0;
  for (const f of dateien) {
    const b = JSON.parse(await readFile(path.join(contentDir, f), 'utf8'));
    for (const pflicht of ['slug', 'titel', 'autor', 'leitfrage', 'verlagUrl', 'amazonUrl']) {
      if (!b[pflicht]) throw new Error(`${f}: Feld "${pflicht}" fehlt`);
    }
    if (!/^[a-z0-9-]+$/.test(b.slug)) throw new Error(`${f}: Slug nur a-z, 0-9, Bindestrich`);
    if (b.draft && !mitEntwuerfen) { uebersprungen++; continue; }
    const out = path.join(distDir, 'buch', b.slug);
    await mkdir(out, { recursive: true });
    const coverQuelle = path.join(contentDir, b.slug, b.cover || 'cover.jpg');
    const mitCover = await exists(coverQuelle);
    if (mitCover) {
      await copyFile(coverQuelle, path.join(out, 'cover.jpg'));
      await vorschaubild(b, coverQuelle, path.join(out, 'og.png'));
    }
    await writeFile(path.join(out, 'index.html'), seite(b, mitCover), 'utf8');
    erzeugt++;
    console.log(`Buchseite: /buch/${b.slug}/${mitCover ? ' (mit Cover)' : ' (ohne Cover)'}${b.draft ? ' [ENTWURF]' : ''}`);
  }
  console.log(`Buchseiten: ${erzeugt} erzeugt, ${uebersprungen} Entwürfe übersprungen`);
}

main().catch((e) => { console.error(e); process.exit(1); });
