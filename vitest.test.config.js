import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.migration_temp_*/**"
    ],
    include: [
      "test/**/*.test.js",
      "src/**/*.test.ts"
    ]
  }
});