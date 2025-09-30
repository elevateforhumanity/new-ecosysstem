import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: './index.html',
      external: (id) => {
        // Exclude problematic HTML files from being processed
        if (id.endsWith('.html') && !id.endsWith('/index.html') && !id.includes('src/')) {
          return true;
        }
        return false;
      }
    }
  },
  optimizeDeps: {
    exclude: ['*.html']
  },
  plugins: [react()],
  server: { 
    host: true, 
    port: Number(process.env.VITE_DEV_PORT || 8012), 
    strictPort: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    proxy: {
      '/api': { 
        target: 'http://127.0.0.1:4400', 
        changeOrigin: true, 
        secure: false, 
        ws: true 
      },
      '/health': { 
        target: 'http://127.0.0.1:4400', 
        changeOrigin: true, 
        secure: false 
      }
    }
  },
  preview: { host: true, port: 3000, strictPort: true }
});