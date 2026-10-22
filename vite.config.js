import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const congApi = Number(process.env.API_PORT || process.env.PORT) || 3001;

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    host: 'localhost',
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: true,
    proxy: {
      '/api': `http://localhost:${congApi}`,
      '/health': `http://localhost:${congApi}`
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
