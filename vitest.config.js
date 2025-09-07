import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: ["test/**/*.{test,spec}.{js,cjs,mjs,ts,tsx,jsx}"]
  }
});