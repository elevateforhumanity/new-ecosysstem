module.exports = {
  env: { browser: true, node: true, es2023: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  settings: { react: { version: "detect" } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
  ],
  // Allow CommonJS require in JS backend scripts
  "@typescript-eslint/no-var-requires": "off",
  // Soften strict typing while refactoring massive any usage incrementally
  "@typescript-eslint/no-explicit-any": "off",
  // Unescaped entities rule too noisy for current HTML-in-JSX content
  "react/no-unescaped-entities": "off"
  },
  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    ".vercel/",
    ".next/",
    "node_modules/"
  ]
};