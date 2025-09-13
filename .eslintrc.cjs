module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["warn"]
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