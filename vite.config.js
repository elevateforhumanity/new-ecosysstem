/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Generates dist/stats.html on build (treemap visualization)
    visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true, template: "treemap" })
  ],
  base: '/',
  server: {
    host: true,
    port: 8012,
    strictPort: false,
    allowedHosts: 'all',
    hmr: {
      clientPort: 8012
    }
  },
  preview: {
    host: true,
    port: 8080,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
