import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL: Ensures assets load correctly in Electron
  define: {
    // This polyfills process.env so 'process.env.API_KEY' works in the browser/renderer
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});