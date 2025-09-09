import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Suppress unused var warnings (prototype & placeholder heavy codebase). Re-enable selectively later.
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow CommonJS require in JS backend scripts
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // Soften strict typing while refactoring massive any usage incrementally
      '@typescript-eslint/no-explicit-any': 'off',
      // Unescaped entities rule too noisy for current HTML-in-JSX content
      'react/no-unescaped-entities': 'off',
      // Allow undefined globals in legacy code
      'no-undef': 'off',
      'no-unused-vars': 'off'
    },
    settings: { 
      react: { version: 'detect' } 
    }
  },
  {
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      '.vercel/',
      '.next/',
      'node_modules/'
    ]
  }
];