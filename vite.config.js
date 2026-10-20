import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.API_PORT) || 3001;

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    host: 'localhost',
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: true,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
      '/health': `http://localhost:${apiPort}`
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
