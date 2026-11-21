import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { setzeKopf } from './scripts/seo-kopf.mjs'

// Für GitHub Project Pages: https://USER.github.io/REPO/
// -> base = '/REPO/'
// Für User/Org Pages (Root-Domain): base = '/'

export default defineConfig(({ command }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
  const isGitHubActionsBuild = command === 'build' && Boolean(process.env.GITHUB_ACTIONS);
  const envBase = process.env.VITE_BASE;
  const base = envBase ?? (isGitHubActionsBuild && repo ? `/${repo}/` : '/');

  return {
    // #609: Titel und Beschreibung kommen aus seo.start.* in public/locales/de/translation.json (scripts/seo-kopf.mjs).
    plugins: [react(), { name: 'seo-kopf', transformIndexHtml: { order: 'pre', handler: (html: string) => setzeKopf(html) } }],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
    },
    server: {
      fs: {
        allow: [path.resolve(__dirname, '..')]
      }
    }
  };
});
