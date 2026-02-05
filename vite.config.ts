import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Für GitHub Project Pages: https://USER.github.io/REPO/
// -> base = '/REPO/'
// Für User/Org Pages (Root-Domain): base = '/'

export default defineConfig({
  plugins: [react()],
  base: '', // Relative Pfade für GitHub Pages erzwingen
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
})
