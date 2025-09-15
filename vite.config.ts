import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

createRoot(document.getElementById("root")).render(<App />);

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 3000, strictPort: true }
});