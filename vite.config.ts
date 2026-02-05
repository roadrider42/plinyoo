import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Für GitHub Project Pages: https://USER.github.io/REPO/
// -> base = '/REPO/'
// Für User/Org Pages (Root-Domain): base = '/'

export default defineConfig(({ command }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
  const isGitHubActionsBuild = command === 'build' && Boolean(process.env.GITHUB_ACTIONS);
  const base = isGitHubActionsBuild && repo ? `/${repo}/` : '/';

  return {
    plugins: [react()],
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
