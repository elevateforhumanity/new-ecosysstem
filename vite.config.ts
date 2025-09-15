import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

createRoot(document.getElementById("root")).render(<App />);

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, watch: { usePolling: false, ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"] } },
  preview: { port: 3000, strictPort: true }
});