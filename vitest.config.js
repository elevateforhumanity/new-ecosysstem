import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 70, branches: 60, functions: 65, statements: 70 }
    }
  },
  css: {
    postcss: false // Disable PostCSS for tests
  }
});