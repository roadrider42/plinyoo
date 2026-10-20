// scripts/generate-sitemap.mjs
// Generiert sitemap.xml für plinyoo.com
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'buecher');
const distDir = path.join(root, 'dist');
const SITE = 'https://www.plinyoo.com';

async function generateSitemap() {
  const urls = [
    { loc: SITE, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE}/#/zugang`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE}/#/mitmachen`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE}/#/investieren`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE}/#/impressum`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/#/datenschutz`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/#/urheberrecht`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/#/kontakt`, changefreq: 'monthly', priority: '0.5' },
  ];

  // Buchseiten aus content/buecher/ lesen
  try {
    const files = await readdir(contentDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const content = await readFile(path.join(contentDir, file), 'utf-8');
      const buch = JSON.parse(content);
      if (!buch.draft) {
        urls.push({
          loc: `${SITE}/buch/${buch.slug}/`,
          changefreq: 'weekly',
          priority: '0.9',
          lastmod: new Date().toISOString().split('T')[0],
        });
      }
    }
  } catch (e) {
    console.warn('Buchseiten konnten nicht gelesen werden:', e.message);
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
  console.log('✓ sitemap.xml erzeugt');
}

generateSitemap().catch(console.error);
