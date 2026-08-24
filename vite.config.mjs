import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  },
  // PWA-related assets
  publicDir: '../public',
  // Optional: customize base path if deploying to GitHub Pages
  base: '/web-yahtzee/'
});
