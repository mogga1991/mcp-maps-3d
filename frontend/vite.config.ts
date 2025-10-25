import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  define: {
    // Map environment variables to process.env for backward compatibility
    // These are injected by Vercel at build time
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY),
  },
});
