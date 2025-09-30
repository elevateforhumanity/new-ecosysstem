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
    // Optimizations for faster builds
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: false
  },
  esbuild: {
    target: 'es2022'
  }
});
