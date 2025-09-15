module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist/**', 'node_modules/**'],
}
