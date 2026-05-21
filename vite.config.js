import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site under /<repo>/, so assets need to be prefixed
// with that path. Override at build time via BASE_PATH env if the repo moves.
const base = process.env.BASE_PATH || '/saucein/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173, open: false },
});
