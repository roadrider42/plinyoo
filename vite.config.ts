import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { setzeKopf } from './scripts/seo-kopf.mjs'
import { buildSync } from 'esbuild'

// #609: Die Umleitung der alten #/-Adressen (src/lib/alte-adressen.ts) läuft als Skript im <head>, vor dem ersten
// Zeichnen und vor Plausible. Ein Modul-Skript käme zu spät, deshalb wird die Datei hier gebündelt und eingesetzt.
// Der Platzhalter muss genau einmal dastehen, sonst bricht der Bau ab: eine still fehlende Umleitung verlöre
// jede alte Kampagnenadresse.
const ALTE_ADRESSEN = '<!--ALTE-ADRESSEN-->';
function alteAdressenSkript(): string {
  const b = buildSync({
    entryPoints: [path.resolve(__dirname, 'src/lib/alte-adressen.ts')],
    bundle: true, write: false, format: 'iife', globalName: '__alteAdressen', minify: true, target: 'es2017',
  });
  const code = b.outputFiles[0].text.trim();
  return `<script>${code};(function(){try{var z=__alteAdressen.neueAdresse(location.search,location.hash,location.pathname);if(z)location.replace(z)}catch(e){}})()</script>`;
}
function setzeAlteAdressen(html: string): string {
  const anzahl = html.split(ALTE_ADRESSEN).length - 1;
  if (anzahl !== 1) throw new Error(`index.html: ${ALTE_ADRESSEN} steht ${anzahl}-mal da, erwartet genau einmal (im <head>, vor Plausible)`);
  return html.replace(ALTE_ADRESSEN, alteAdressenSkript());
}

// Für GitHub Project Pages: https://USER.github.io/REPO/
// -> base = '/REPO/'
// Für User/Org Pages (Root-Domain): base = '/'

export default defineConfig(({ command, isSsrBuild }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
  const isGitHubActionsBuild = command === 'build' && Boolean(process.env.GITHUB_ACTIONS);
  const envBase = process.env.VITE_BASE;
  const base = envBase ?? (isGitHubActionsBuild && repo ? `/${repo}/` : '/');

  return {
    // #609: Titel und Beschreibung kommen aus seo.start.* in public/locales/de/translation.json (scripts/seo-kopf.mjs).
    plugins: [react(), { name: 'seo-kopf', transformIndexHtml: { order: 'pre', handler: (html: string) => setzeAlteAdressen(setzeKopf(html)) } }],
    // #609: Jahr des Baus statt Jahr im Browser (Fußzeile, Impressum). Sonst weicht die vorgerenderte Seite nach
    // einem Jahreswechsel vom Browser ab, und React verwirft sie beim Übernehmen. Gelesen über src/lib/baujahr.ts.
    define: { __BAUJAHR__: JSON.stringify(new Date().getFullYear()) },
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      // #609: Der Vorrenderbau (dist-server/, vite build --ssr) braucht public/ nicht, ausgeliefert wird nur dist/.
      copyPublicDir: !isSsrBuild,
    },
    server: {
      fs: {
        allow: [path.resolve(__dirname, '..')]
      }
    }
  };
});
