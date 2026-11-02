// scripts/seiten-dev.mjs
// Zweck: Lokale Vorschau der statischen Unterseiten mit Live-Neuladen. Bei jedem Speichern in content/seiten/ oder
//        scripts/seiten.mjs werden die Seiten (mit Entwürfen) neu erzeugt und der Browser lädt von selbst neu.
//        Unten links blendet die Vorschau das Vorschaubild (og.png) und den og:title ein — nur hier, nie im Build.
// Aufruf: npm run seiten:dev  (vorher einmal npm run build, damit dist/ die App enthält). Port: PORT, Standard 8765.

import http from 'node:http';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const PORT = Number(process.env.PORT) || 8765;
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };

const zuhoerer = new Set();

const ZUSATZ = `<script>
(function(){
  new EventSource('/__neu').onmessage=function(){location.reload()};
  var t=document.querySelector('meta[property="og:title"]'), b=document.querySelector('meta[property="og:image"]');
  if(!b)return;
  var d=document.createElement('div');
  d.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;width:300px;background:#fff;border:1px solid #D7DEE6;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);font:12px/1.4 -apple-system,sans-serif;color:#141A1F';
  d.innerHTML='<div style="display:flex;justify-content:space-between;padding:6px 10px;font-weight:600;cursor:pointer" id="ogk">Link-Vorschau (nur lokal)<span id="ogz">–</span></div><div id="ogi" style="padding:0 10px 10px"><img src="'+location.pathname+'og.png?'+Date.now()+'" style="width:100%;border-radius:6px;display:block"><p style="margin:6px 0 0"><b>og:title:</b> '+(t?t.content:'')+'</p><p style="margin:2px 0 0;color:#5B6672"><b>Tab:</b> '+document.title+'</p></div>';
  document.body.appendChild(d);
  var offen=sessionStorage.getItem('ogzu')!=='1', i=d.querySelector('#ogi'), z=d.querySelector('#ogz');
  function zeige(){i.style.display=offen?'block':'none';z.textContent=offen?'–':'+'}
  zeige();
  d.querySelector('#ogk').onclick=function(){offen=!offen;sessionStorage.setItem('ogzu',offen?'0':'1');zeige()};
})();
</script>`;

let laeuft = false, nochmal = false;
function erzeuge() {
  if (laeuft) { nochmal = true; return; }
  laeuft = true;
  const p = spawn(process.execPath, [path.join(root, 'scripts', 'seiten.mjs')], { env: { ...process.env, SEITEN_DRAFT: '1' }, stdio: ['ignore', 'ignore', 'pipe'] });
  let fehler = '';
  p.stderr.on('data', (d) => { fehler += d; });
  p.on('close', (code) => {
    laeuft = false;
    if (code === 0) {
      console.log(`${new Date().toLocaleTimeString()} neu erzeugt — Browser lädt neu`);
      for (const res of zuhoerer) res.write('data: neu\n\n');
    } else {
      console.error(`${new Date().toLocaleTimeString()} Fehler beim Erzeugen (z. B. Komma in der JSON vergessen?):\n${fehler.trim()}`);
    }
    if (nochmal) { nochmal = false; erzeuge(); }
  });
}

let timer;
const beobachte = (ziel) => watch(ziel, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(erzeuge, 150); });
beobachte(path.join(root, 'content', 'seiten'));
beobachte(path.join(root, 'scripts', 'seiten.mjs'));

http.createServer(async (req, res) => {
  const pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pfad === '/__neu') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': verbunden\n\n');
    zuhoerer.add(res);
    req.on('close', () => zuhoerer.delete(res));
    return;
  }
  let datei = path.join(distDir, pfad);
  if (!datei.startsWith(distDir)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(datei)).isDirectory()) datei = path.join(datei, 'index.html');
    let inhalt = await readFile(datei);
    const typ = TYPEN[path.extname(datei)] || 'application/octet-stream';
    if (typ.startsWith('text/html')) inhalt = inhalt.toString().replace('</body>', `${ZUSATZ}</body>`);
    res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'no-store' });
    res.end(inhalt);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nicht gefunden');
  }
}).listen(PORT, () => {
  console.log(`Vorschau mit Live-Neuladen: http://localhost:${PORT}/fuer-trainer/`);
  erzeuge();
});
