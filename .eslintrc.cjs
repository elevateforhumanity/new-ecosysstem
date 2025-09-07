module.exports = {
  env: { browser: true, node: true, es2023: true },
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ]
  },
  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    ".vercel/",
    ".next/",
    "node_modules/",
    ".migration_temp_*/"
  ]
};