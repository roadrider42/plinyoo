// scripts/seiten.mjs
// Zweck: Erzeugt statische Unterseiten (zuerst: "Für Trainer") je Sprache aus content/seiten/<seite>/<sprache>.json.
// Warum statisch: wie bei den Buchseiten (scripts/buchseiten.mjs) — die Website nutzt einen Hash-Router, Suchmaschinen und
//        Link-Vorschauen sehen nur echte Adressen. Jede Sprache bekommt eine eigene Adresse mit hreflang-Verweisen.
// Entwurf: Steht in content/seiten/<seite>/seite.json "draft": true, wird nichts erzeugt — außer mit SEITEN_DRAFT=1 (lokal testen).
// Aufruf: läuft nach "vite build" (siehe package.json).

import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seitenDir = path.join(root, 'content', 'seiten');
const distDir = path.join(root, 'dist');
const SITE = 'https://www.plinyoo.com';
const LOGIN = 'https://app.plinyoo.com/login?redirect=%2Fdashboard';
const SPRACHEN = ['de', 'en', 'es', 'fr', 'pt', 'pl', 'uk'];
const mitEntwuerfen = process.env.SEITEN_DRAFT === '1';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
// Wie esc, lässt aber <strong>/<em> durch.
const escInline = (s) => esc(s).replace(/&lt;(\/?(?:strong|em))&gt;/g, '<$1>');
const fuelle = (s, werte) => String(s).replace(/\{(\w+)\}/g, (_, k) => werte[k] ?? '');
const exists = async (p) => access(p).then(() => true, () => false);

// Zugang anfragen: Sprache (lng, von der App erkannt), Rolle und Herkunft mitgeben. Das Skript unten ersetzt die utm-Werte,
// wenn der Besucher selbst mit utm-Angaben (z. B. aus LinkedIn) auf die Seite kam.
function zugangHref(lang, kampagne, inhalt) {
  const q = new URLSearchParams({ lng: lang, utm_source: 'website', utm_medium: 'seite', utm_campaign: kampagne });
  if (inhalt) q.set('utm_content', inhalt);
  return `/?${q.toString()}#/zugang?rolle=curator`;
}

function seedRnd(text) {
  let seed = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function zeilen(text, max) {
  const out = [];
  for (const wort of String(text).split(/\s+/)) {
    const z = out.length ? out[out.length - 1] : null;
    if (z !== null && (z + ' ' + wort).length <= max) out[out.length - 1] = z + ' ' + wort;
    else out.push(wort);
  }
  return out;
}

// Vorschaubild 1200×630: dunkler Grund, Sternbild, Überschrift, Unterzeile, "made by plinyoo" — passend zu den Buchseiten.
async function vorschaubild(t, ziel) {
  const W = 1200, H = 630;
  const rnd = seedRnd(t.lang + t.pfad);
  const sterne = [];
  while (sterne.length < 14) {
    const p = { x: Math.round(740 + rnd() * 400), y: Math.round(70 + rnd() * 490) };
    if (sterne.every((s) => Math.hypot(s.x - p.x, s.y - p.y) > 70)) sterne.push(p);
  }
  // jeder Stern hängt am nächstgelegenen früheren Stern: ein ruhiges, baumartiges Sternbild ohne lange Kreuzungen
  const linien = sterne.slice(1).map((p, i) => {
    const q = sterne.slice(0, i + 1).reduce((m, s) => (Math.hypot(s.x - p.x, s.y - p.y) < Math.hypot(m.x - p.x, m.y - p.y) ? s : m));
    return `<line x1="${q.x}" y1="${q.y}" x2="${p.x}" y2="${p.y}"/>`;
  }).join('');
  const punkte = sterne.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${i % 4 === 0 ? 7 : 5}" fill="${i % 4 === 0 ? '#E3A72F' : '#6FB3B8'}"/>`).join('');
  const font = 'font-family="Helvetica Neue, Helvetica, Arial, Liberation Sans, DejaVu Sans, sans-serif"';
  const titel = zeilen(t.og.titel, 22).slice(0, 4);
  let y = 210;
  const titelSvg = titel.map((z) => { const s = `<text x="80" y="${y}" font-size="64" font-weight="700" fill="#F4F5F7">${esc(z)}</text>`; y += 72; return s; }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#0F1419"/>
  <g opacity="0.45"><g stroke="#6FB3B8" stroke-width="1.2" opacity="0.7">${linien}</g>${punkte}</g>
  <g ${font}>
  <text x="80" y="130" font-size="28" font-weight="600" fill="#BDE3E6">${esc(t.og.zeile)}</text>
  ${titelSvg}
  <text x="80" y="${H - 70}" font-size="24" font-weight="600" fill="#FFFFFF">made by plinyoo</text></g>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(ziel);
}

const CSS = `
:root{--bg:#F4F5F7;--ink:#141A1F;--muted:#5B6672;--line:#D7DEE6;--teal:#6FB3B8;--teal-d:#3E8A90;--mist:#E6F0EF;--amber:#E3A72F;--graphite:#1C2A33;--surface2:#F8FAFC}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:17px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--graphite)}
.wrap{max-width:900px;margin:0 auto;padding:0 20px}
.entwurf{background:var(--amber);color:#1C2A33;text-align:center;padding:8px 12px;font-weight:600;font-size:14px}
.sprachen{background:var(--surface2);border-bottom:1px solid var(--line);font-size:13px}
.sprachen .wrap{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px 12px;padding-top:6px;padding-bottom:6px}
.sprachen a{color:var(--muted);text-decoration:none;padding:4px 2px}
.sprachen a[aria-current]{color:var(--graphite);font-weight:700}
header.top{border-bottom:1px solid var(--line);background:#fff}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;padding-bottom:12px}
header.top .logo{font-weight:700;font-size:20px;text-decoration:none;color:var(--graphite)}
header.top nav{display:flex;align-items:center;gap:10px}
.login{font-size:15px;color:var(--muted);text-decoration:none;padding:8px 6px}
.btn{display:inline-block;min-height:44px;padding:12px 18px;border-radius:10px;border:2px solid var(--graphite);color:var(--graphite);font-weight:600;text-decoration:none;background:#fff;margin:0 10px 10px 0;line-height:1.3}
.btn:hover{background:var(--mist)}
.btn.haupt{background:var(--graphite);color:#fff}
.btn.haupt:hover{background:#12202a}
header.top .btn{margin:0;padding:8px 14px;font-size:15px;min-height:0}
.hero{padding:48px 0 40px}
.eyebrow{display:inline-block;margin:0 0 14px;padding:4px 12px;border-radius:999px;background:var(--mist);font-size:13px;font-weight:600;color:var(--teal-d)}
.hero h1{margin:0 0 16px;font-size:clamp(30px,5.6vw,46px);line-height:1.12;color:var(--graphite)}
.hero .lead{font-size:19px;color:var(--muted);margin:0 0 24px;max-width:62ch}
.hinweis{font-size:14px;color:var(--muted);margin:0 0 6px}
.sprung{font-weight:600}
.sek{padding:48px 0}
.sek.alt{background:var(--surface2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sek h2{margin:0 0 12px;font-size:clamp(22px,4vw,28px);color:var(--graphite)}
.sek p{max-width:68ch}
.sek .lead{color:var(--muted)}
ul.punkte{margin:12px 0 16px;padding-left:22px;max-width:68ch}
ul.punkte li{margin:6px 0}
.karten3{display:grid;grid-template-columns:1fr;gap:14px;margin-top:18px}
@media(min-width:720px){.karten3{grid-template-columns:repeat(3,1fr)}}
.k3{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px}
.k3 h3{margin:0 0 8px;font-size:18px;color:var(--graphite)}
.k3 p{margin:0;font-size:15.5px;color:var(--muted)}
.schritte{counter-reset:s}
.schritt{counter-increment:s}
.schritt h3::before{content:counter(s);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-right:10px;border-radius:50%;background:var(--graphite);color:#fff;font-size:14px}
.betont{font-weight:600;color:var(--graphite)}
.faq h3{margin:26px 0 6px;font-size:18px;color:var(--graphite)}
.faq p{margin:0;color:var(--ink)}
.abschluss{background:var(--graphite);color:#fff;padding:52px 0}
.abschluss h2{margin:0 0 12px;font-size:clamp(22px,4vw,28px);color:#fff}
.abschluss p{margin:0 0 18px;color:#D3DEE6;max-width:68ch}
.abschluss .btn.haupt{background:#fff;color:var(--graphite);border-color:#fff}
.abschluss .btn.haupt:hover{background:#E6F0EF}
.abschluss .klein{font-size:15px}
footer{padding:22px 0 30px;font-size:14px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:6px 14px}
footer a{color:var(--muted)}
@media(min-width:768px){
body{font-size:18px}
.k3 p{font-size:16.5px}
.login{font-size:16px}
footer{font-size:15px}
.hinweis{font-size:15px}
}
`;

function seite(t, alle, entwurf, beispielWerte) {
  const url = `${SITE}${t.pfad}`;
  const zugang = zugangHref(t.lang, t.kampagne);
  const zugangVertrauen = zugangHref(t.lang, t.kampagne, 'vertrauen');
  const alternates = alle.map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.pfad}">`).join('\n');
  const xDefault = alle.find((a) => a.lang === 'de') ?? alle[0];
  const sprachLinks = alle.map((a) => `<a href="${a.pfad}" hreflang="${a.lang}" lang="${a.lang}"${a.lang === t.lang ? ' aria-current="page"' : ''}>${esc(a.sprachname)}</a>`).join('');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.meta.title,
    description: t.meta.description,
    url,
    inLanguage: t.lang,
    publisher: { '@type': 'Organization', name: 'plinyoo', url: SITE },
  };
  const h = t.hero, p = t.problem, s = t.schritte, w = t.weg, f = t.fuerwen, e = t.experte, v = t.vertrauen, b = t.beispiel, q = t.faq, a = t.abschluss;

  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<link rel="canonical" href="${url}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${SITE}${xDefault.pfad}">
${entwurf ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:site_name" content="plinyoo">
<meta property="og:type" content="website">
<meta property="og:locale" content="${esc(t.ogLocale)}">
<meta property="og:title" content="${esc(t.og.titel)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.og.titel)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://plausible.io 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://plausible.io; base-uri 'self'; form-action 'self'">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>${CSS}</style>
<script async src="https://plausible.io/js/pa--uQFBayBpH0z77zfdWY78.js"></script>
<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
</head>
<body>
${entwurf ? `<div class="entwurf">${esc(t.entwurfHinweis)}</div>` : ''}
<nav class="sprachen" aria-label="${esc(t.nav.sprache)}"><div class="wrap">${sprachLinks}</div></nav>
<header class="top"><div class="wrap">
  <a class="logo" href="/?lng=${t.lang}" aria-label="${esc(t.nav.startseite)}">plinyoo</a>
  <nav aria-label="${esc(t.nav.haupt)}">
    <a class="login" href="${LOGIN}">${esc(t.nav.login)}</a>
    <a class="btn haupt" data-zugang href="${zugang}">${esc(t.nav.zugang)}</a>
  </nav>
</div></header>

<main>
<section class="hero"><div class="wrap">
  <p class="eyebrow">${esc(h.eyebrow)}</p>
  <h1>${esc(h.h1)}</h1>
  <p class="lead">${escInline(h.lead)}</p>
  <p><a class="btn haupt" data-zugang href="${zugang}">${esc(h.cta)}</a></p>
  <p class="hinweis">${esc(h.hinweis)}</p>
  <p><a class="sprung" href="#so">${esc(h.sprung)}</a></p>
</div></section>

<section class="sek alt" aria-labelledby="problem-h"><div class="wrap">
  <h2 id="problem-h">${esc(p.h2)}</h2>
  <p class="lead">${esc(p.intro)}</p>
  <ul class="punkte">${p.punkte.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <p>${escInline(p.schluss)}</p>
</div></section>

<section class="sek" id="so" aria-labelledby="so-h"><div class="wrap">
  <h2 id="so-h">${esc(s.h2)}</h2>
  <div class="karten3 schritte">
    ${s.items.map((x) => `<div class="k3 schritt"><h3>${esc(x.titel)}</h3><p>${escInline(x.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="sek alt" aria-labelledby="weg-h"><div class="wrap">
  <h2 id="weg-h">${esc(w.h2)}</h2>
  <p class="lead">${esc(w.lead)}</p>
  ${w.absaetze.map((x) => `<p>${escInline(x)}</p>`).join('\n  ')}
  <p class="betont">${esc(w.schluss)}</p>
</div></section>

<section class="sek" aria-labelledby="fuerwen-h"><div class="wrap">
  <h2 id="fuerwen-h">${esc(f.h2)}</h2>
  <p>${escInline(f.intro)}</p>
  <div class="karten3">
    ${f.items.map((x) => `<div class="k3"><h3>${esc(x.titel)}</h3><p>${escInline(x.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>

<section class="sek alt" aria-labelledby="experte-h"><div class="wrap">
  <h2 id="experte-h">${esc(e.h2)}</h2>
  ${e.absaetze.map((x) => `<p>${escInline(x)}</p>`).join('\n  ')}
</div></section>

<section class="sek" aria-labelledby="vertrauen-h"><div class="wrap">
  <h2 id="vertrauen-h">${esc(v.h2)}</h2>
  ${v.absaetze.map((x) => `<p>${escInline(x)}</p>`).join('\n  ')}
  <p><a class="btn" data-zugang data-inhalt="vertrauen" href="${zugangVertrauen}">${esc(v.cta)}</a></p>
</div></section>

<section class="sek alt" aria-labelledby="beispiel-h"><div class="wrap">
  <h2 id="beispiel-h">${esc(b.h2)}</h2>
  <p>${esc(fuelle(b.text, beispielWerte))}</p>
  <p><a class="btn" data-beispiel href="${esc(b.href)}">${esc(b.link)}</a></p>
</div></section>

<section class="sek faq" aria-labelledby="faq-h"><div class="wrap">
  <h2 id="faq-h">${esc(q.h2)}</h2>
  ${q.items.map((x) => `<h3>${esc(x.f)}</h3>\n  <p>${escInline(x.a)}</p>`).join('\n  ')}
</div></section>

<section class="abschluss" aria-labelledby="abschluss-h"><div class="wrap">
  <h2 id="abschluss-h">${esc(a.h2)}</h2>
  ${a.absaetze.map((x) => `<p>${escInline(x)}</p>`).join('\n  ')}
  <p><a class="btn haupt" data-zugang href="${zugang}">${esc(a.cta)}</a></p>
  <p class="klein">${esc(a.pilot)}</p>
</div></section>
</main>

<footer><div class="wrap">
  <a href="/?lng=${t.lang}">plinyoo.com</a><a href="/?lng=${t.lang}#/impressum">${esc(t.footer.impressum)}</a><a href="/?lng=${t.lang}#/datenschutz">${esc(t.footer.datenschutz)}</a><a href="/?lng=${t.lang}#/urheberrecht">${esc(t.footer.urheberrecht)}</a>
</div></footer>

<script>
// Herkunft weiterreichen: Kam der Besucher mit utm-Angaben (z. B. aus LinkedIn), gelten diese statt "website".
(function(){
  var q=new URLSearchParams(location.search);
  document.querySelectorAll('[data-zugang]').forEach(function(a){
    var u=new URL(a.href,location.origin), p=u.searchParams;
    ['utm_source','utm_medium','utm_campaign'].forEach(function(k){var v=q.get(k);if(v)p.set(k,v)});
    a.href=u.pathname+'?'+p.toString()+u.hash;
    a.addEventListener('click',function(){if(window.plausible)window.plausible('Zugang geklickt',{props:{seite:${JSON.stringify(t.kampagne)},sprache:${JSON.stringify(t.lang)},stelle:a.getAttribute('data-inhalt')||'standard'}})});
  });
  var b=document.querySelector('[data-beispiel]');
  if(b)b.addEventListener('click',function(){if(window.plausible)window.plausible('Beispielthema geklickt',{props:{seite:${JSON.stringify(t.kampagne)}}})});
})();
</script>
</body>
</html>
`;
}

// Zahlen für "Ein Thema zum Ansehen" aus der Buchseite lesen, damit sie nie veralten.
async function beispielZahlen(slug) {
  const datei = path.join(root, 'content', 'buecher', `${slug}.json`);
  if (!(await exists(datei))) return {};
  const buch = JSON.parse(await readFile(datei, 'utf8'));
  const karten = buch.kartenvoll ?? [];
  return { karten: karten.length, fragen: karten.reduce((n, k) => n + (k.fragen?.length ?? 0), 0) };
}

async function main() {
  if (!(await exists(seitenDir))) return;
  for (const name of await readdir(seitenDir)) {
    const dir = path.join(seitenDir, name);
    const metaDatei = path.join(dir, 'seite.json');
    if (!(await exists(metaDatei))) continue;
    const meta = JSON.parse(await readFile(metaDatei, 'utf8'));
    if (meta.draft && !mitEntwuerfen) { console.log(`Seite ${name}: Entwurf, übersprungen`); continue; }
    const alle = [];
    for (const lang of SPRACHEN) {
      const datei = path.join(dir, `${lang}.json`);
      if (!(await exists(datei))) continue;
      const t = JSON.parse(await readFile(datei, 'utf8'));
      if (t.lang !== lang) throw new Error(`${name}/${lang}.json: Feld "lang" passt nicht`);
      if (!/^\/([a-z]{2}\/)?[a-z0-9-]+\/$/.test(t.pfad)) throw new Error(`${name}/${lang}.json: Pfad "${t.pfad}" ungültig`);
      alle.push({ ...t, kampagne: meta.kampagne });
    }
    const werte = await beispielZahlen(meta.beispielBuch);
    for (const t of alle) {
      const out = path.join(distDir, ...t.pfad.split('/').filter(Boolean));
      await mkdir(out, { recursive: true });
      await writeFile(path.join(out, 'index.html'), seite(t, alle, !!meta.draft, werte), 'utf8');
      await vorschaubild(t, path.join(out, 'og.png'));
      console.log(`Seite: ${t.pfad}${meta.draft ? ' [ENTWURF]' : ''}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
