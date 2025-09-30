import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { 
    host: '0.0.0.0', 
    port: Number(process.env.VITE_DEV_PORT || 8012), 
    strictPort: true,
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
  preview: { host: '0.0.0.0', port: 4173, strictPort: true }
});