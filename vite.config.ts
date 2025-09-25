/**
 * Security configuration for Vite and deployment
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateCSPHeader, SECURITY_HEADERS } from './src/lib/security';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': generateCSPHeader(),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          convex: ['convex/react'],
          clerk: ['@clerk/clerk-react'],
          ui: ['@radix-ui/react-select', '@radix-ui/react-slot'],
        },
      },
    },
  },
  define: {
    // Remove console logs in production
    ...(process.env.NODE_ENV === 'production' && {
      'console.log': '(() => {})',
      'console.warn': '(() => {})',
      'console.error': '(() => {})',
    }),
  },
});