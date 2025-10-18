// Flat config (ESLint 9)
import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: { react, hooks },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['class'] }],
      'react/jsx-max-props-per-line': ['warn', { maximum: 3 }],
      'react/jsx-no-useless-fragment': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' },
      ],
      'react/jsx-newline': ['warn', { prevent: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-boolean-value': ['warn', 'never'],
    },
    settings: { react: { version: 'detect' } },
  },
];
