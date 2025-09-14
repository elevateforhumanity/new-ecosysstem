import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";Config({

createRoot(document.getElementById("root")).render(<App />);
review: { port: 3000, strictPort: true }





});  preview: { port: 3000, strictPort: true }  server: { port: 5173, strictPort: true },  plugins: [react()],export default defineConfig({});