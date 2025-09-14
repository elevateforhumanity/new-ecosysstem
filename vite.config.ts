import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Do not import "@/..." in vite.config.* (Node can't resolve Vite aliases here)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});