import pluginJs from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    ignores: ['assets/', 'node_modules/', 'dist/', '.vite/', 'coverage/'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': tsPlugin,
      prettier: pluginPrettier,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...pluginPrettier.configs.recommended.rules,

      // Alphabetical import order — same convention as previous project.
      // Doesn't cover Sass @use/@forward: no equivalent rule exists in the
      // stylelint ecosystem, and @use order can be semantically meaningful in
      // Sass (!default resolution, emission order of side-effect CSS within
      // the same @layer) — blindly alphabetizing there can silently break
      // things. Reviewed manually in PR instead.
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'error',

      // React-specific rules
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-vars': 'warn',
      'react/jsx-no-target-blank': 'off',

      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript-specific rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // The base rule is disabled in favor of the TypeScript-aware one above —
      // running both double-reports the exact same unused variable, once per
      // rule, since ESLint's core rule can't see through TS-only constructs
      // (type-only imports, etc.) the way the TS-specific rule does.
      'no-unused-vars': 'off',

      // General JavaScript/TypeScript best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'prefer-const': 'error',

      // Formatting (indentation, quotes, semicolons, trailing commas, line
      // endings) is owned entirely by Prettier via 'prettier/prettier'
      // below and .prettierrc — deliberately NOT duplicated here as core
      // ESLint stylistic rules. Having both active lets the two disagree
      // on the "correct" fix for the same line and fight each other on
      // `--fix`; eslint-plugin-prettier's recommended config already
      // disables the conflicting core rules for exactly this reason.
      'prettier/prettier': 'error',
    },
  },
];
