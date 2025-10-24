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
    // Map Vite environment variables to legacy process.env format for backward compatibility
    'process.env.API_KEY': 'import.meta.env.VITE_GEMINI_API_KEY',
    'process.env.GEMINI_API_KEY': 'import.meta.env.VITE_GEMINI_API_KEY',
    'process.env.GOOGLE_MAPS_API_KEY': 'import.meta.env.VITE_GOOGLE_MAPS_API_KEY',
  },
});
