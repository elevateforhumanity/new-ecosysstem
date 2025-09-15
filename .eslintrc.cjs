module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  // Ignore built output and static assets (including HLS segments under public/)
  ignorePatterns: ['dist/**', 'node_modules/**', 'public/**'],
}
