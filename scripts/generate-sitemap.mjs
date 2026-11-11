// scripts/generate-sitemap.mjs
// Generiert sitemap.xml für plinyoo.com
// Läuft nach scripts/buchseiten.mjs (siehe package.json) und gleicht die Sitemap mit dem ab, was dort gebaut wurde.
// Jeder Fehler beendet den Bau mit Ausgang 1: Eine Sitemap ohne Buchseiten darf nicht still ausgeliefert werden.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'buecher');
const distDir = path.join(root, 'dist');
const SITE = 'https://www.plinyoo.com';

// lastmod einer Buchseite = Tag des letzten Commits, der ihre Buchdatei oder ihren Ordner (Cover) geändert hat.
// Nicht das Baudatum: ein lastmod, das bei jedem Bau "heute" ist, werten Suchmaschinen als unzuverlässig.
// Ein flacher Klon (actions/checkout ohne fetch-depth: 0) kennt nur den letzten Commit — jedes Buch bekäme dessen Tag.
function gitAus(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
if (gitAus(['rev-parse', '--is-shallow-repository']) !== 'false') {
  throw new Error('Flacher Git-Klon: lastmod der Buchseiten wäre falsch. Im Workflow actions/checkout mit fetch-depth: 0 auschecken.');
}
function letzteAenderung(slug) {
  const tag = gitAus(['log', '-1', '--format=%cs', '--', `content/buecher/${slug}.json`, `content/buecher/${slug}/`]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tag)) throw new Error(`lastmod: Buch "${slug}" hat keinen Commit (git log: "${tag}"). Erst committen, dann bauen.`);
  return tag;
}

async function generateSitemap() {
  // Nur echte Adressen. Die App-Seiten hinter "#/" (Zugang, Impressum …) sind für Suchmaschinen alle dieselbe Adresse "/".
  const urls = [
    { loc: SITE, changefreq: 'weekly', priority: '1.0' },
  ];

  // Buchseiten aus content/buecher/ — dieselbe Entwurfsregel wie buchseiten.mjs (draft: true wird nicht veröffentlicht).
  const buecher = [];
  for (const file of (await readdir(contentDir)).filter((f) => f.endsWith('.json'))) {
    const buch = JSON.parse(await readFile(path.join(contentDir, file), 'utf-8'));
    if (!buch.draft) buecher.push({ slug: buch.slug, lastmod: letzteAenderung(buch.slug) });
  }
  buecher.sort((a, b) => a.slug.localeCompare(b.slug));

  // Übersicht aller Bücher (erzeugt scripts/buchseiten.mjs): zuletzt geändert, wenn das jüngste Buch geändert wurde.
  if (buecher.length) {
    urls.push({ loc: `${SITE}/buch/`, changefreq: 'weekly', priority: '0.8', lastmod: buecher.map((b) => b.lastmod).sort().at(-1) });
  }
  for (const b of buecher) {
    urls.push({ loc: `${SITE}/buch/${b.slug}/`, changefreq: 'weekly', priority: '0.9', lastmod: b.lastmod });
  }

  // Abgleich mit dem Bau: jede indexierbare Buchseite in dist/buch/ steht in der Sitemap, und jede Buch-URL der
  // Sitemap hat ihre Seite in dist/buch/. Seiten mit noindex (Entwurfsbau) gehören nicht hinein.
  const gebaut = [];
  if (buecher.length) {
    for (const e of await readdir(path.join(distDir, 'buch'), { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const html = await readFile(path.join(distDir, 'buch', e.name, 'index.html'), 'utf-8').catch(() => null);
      if (html === null) continue;
      if (!/<meta name="robots" content="noindex/.test(html)) gebaut.push(e.name);
    }
  }
  const inSitemap = buecher.map((b) => b.slug);
  const fehltImBau = inSitemap.filter((s) => !gebaut.includes(s));
  const fehltInSitemap = gebaut.filter((s) => !inSitemap.includes(s));
  if (fehltImBau.length || fehltInSitemap.length) {
    throw new Error(`Sitemap und Buchseiten passen nicht zusammen. Ohne Seite in dist/buch/: [${fehltImBau.join(', ')}]. Gebaut, aber nicht in der Sitemap: [${fehltInSitemap.join(', ')}].`);
  }

  // Statische Unterseiten (content/seiten/<seite>/), je Sprache eine Adresse; Entwürfe nicht.
  // Dieselbe Regel wie scripts/seiten.mjs: kein Ordner content/seiten → keine Unterseiten; ein Eintrag ohne seite.json
  // (etwa .DS_Store) wird übersprungen. Jeder Lesefehler darüber hinaus bricht den Bau ab — eine Unterseite, die still
  // aus der Sitemap fällt, ist ein Fehler, kein Ergebnis.
  const seitenDir = path.join(root, 'content', 'seiten');
  async function lesen(datei) {
    try {
      return JSON.parse(await readFile(datei, 'utf-8'));
    } catch (e) {
      throw new Error(`Sitemap: Unterseite nicht lesbar: ${path.relative(root, datei)} (${e.code ?? e.message}). Bau abgebrochen, damit die Seite nicht still aus der Sitemap fällt.`);
    }
  }
  const seitenDa = await readdir(seitenDir).then(() => true, (e) => {
    if (e.code === 'ENOENT') return false;
    throw new Error(`Sitemap: Ordner content/seiten nicht lesbar (${e.code ?? e.message}). Bau abgebrochen.`);
  });
  const unterseiten = [];
  if (seitenDa) {
    for (const name of await readdir(seitenDir)) {
      const dir = path.join(seitenDir, name);
      const metaDatei = path.join(dir, 'seite.json');
      const metaDa = await readFile(metaDatei).then(() => true, (e) => {
        if (e.code === 'ENOENT' || e.code === 'ENOTDIR') return false;
        throw new Error(`Sitemap: Unterseite nicht lesbar: ${path.relative(root, metaDatei)} (${e.code ?? e.message}). Bau abgebrochen.`);
      });
      if (!metaDa) continue;
      const meta = await lesen(metaDatei);
      if (meta.draft) continue;
      for (const file of (await readdir(dir)).filter((f) => /^[a-z]{2}\.json$/.test(f))) {
        const t = await lesen(path.join(dir, file));
        if (typeof t.pfad !== 'string' || !/^\/([a-z]{2}\/)?[a-z0-9-]+\/$/.test(t.pfad)) {
          throw new Error(`Sitemap: content/seiten/${name}/${file}: Pfad "${t.pfad}" ungültig. Bau abgebrochen.`);
        }
        unterseiten.push(t.pfad);
        urls.push({ loc: `${SITE}${t.pfad}`, changefreq: 'monthly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] });
      }
    }
  }
  // Abgleich mit dem Bau (scripts/seiten.mjs): jede Unterseite der Sitemap hat ihre Seite in dist/.
  const ohneSeite = [];
  for (const pfad of unterseiten) {
    const da = await readFile(path.join(distDir, ...pfad.split('/').filter(Boolean), 'index.html')).then(() => true, () => false);
    if (!da) ohneSeite.push(pfad);
  }
  if (ohneSeite.length) {
    throw new Error(`Sitemap: Unterseiten ohne Seite in dist/: [${ohneSeite.join(', ')}]. Bau abgebrochen.`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  await writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf-8');
  console.log(`✓ sitemap.xml erzeugt (${buecher.length} Buchseiten, abgeglichen mit dist/buch/; ${unterseiten.length} Unterseiten, abgeglichen mit dist/)`);
}

generateSitemap().catch((e) => { console.error(e); process.exit(1); });
