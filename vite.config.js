/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: Number(process.env.VITE_DEV_PORT || 8012),
    strictPort: false,
    cors: true,
    hmr: {
      clientPort: Number(process.env.VITE_DEV_PORT || 8012)
    }
  },
  preview: {
    host: true,
    port: 8080,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Performance optimizations
    target: 'es2022',
    minify: 'esbuild', // Faster than terser
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          helmet: ['react-helmet-async']
        },
        // Enable for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'react-helmet-async'
    ],
    force: false
  },
  esbuild: {
    target: 'es2022',
    // Speed up build
    tsconfigRaw: {
      compilerOptions: {
        target: 'es2022',
        useDefineForClassFields: true
      }
    }
  },
  // Cache directory for faster rebuilds
  cacheDir: 'node_modules/.vite'
});
