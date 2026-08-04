import pluginJs from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// plugin-prettier ships legacy-union types for its flat config; the runtime
// value is a plain rules object, so cast it for the spread below.
const prettierRecommendedRules =
  /** @type {Record<string, Record<string, unknown>> | undefined} */ (pluginPrettier.configs)
    ?.recommended?.rules ?? {};

// Same defensive access for the type-checked config: legacy configs are
// keyed by kebab-case names and the index access is optional at runtime.
const typeCheckedRules =
  /** @type {{ rules: Record<string, unknown> } | undefined} */ (
    tsPlugin.configs['recommended-type-checked']
  )?.rules ?? {};

// Rules shared by the JS and TS scopes. Each scope below spreads its own
// parser-specific recommended sets (pluginJs for JS, @typescript-eslint
// recommended + recommendedTypeChecked for TS) and then this object.
const sharedRules = {
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

  // General JavaScript/TypeScript best practices
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': 'error',
  'prefer-const': 'error',

  // Formatting (indentation, quotes, semicolons, trailing commas, line
  // endings) is owned entirely by Prettier via 'prettier/prettier'
  // below and .prettierrc — deliberately NOT duplicated here as core
  // ESLint stylistic rules. Having both active lets the two disagree
  // on the "correct" fix for the same line and fight each other on
  // `--fix`; eslint-plugin-prettier's recommended config already
  // disables the conflicting core rules for exactly this reason.
  'prettier/prettier': 'error',
};

export default [
  {
    ignores: ['assets/', 'node_modules/', 'dist/', '.vite/', 'coverage/'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
  },
  {
    // Plain JavaScript (configs, Vite plugins, node scripts): espree parser,
    // core recommended rules only. No TS parser — TS-specific rules don't
    // apply here and JS files are excluded from the projectService lookup.
    files: ['**/*.{js,jsx,mjs}'],
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...prettierRecommendedRules,
      ...sharedRules,
    },
  },
  {
    // TypeScript (frontend components, utils, scripts): TS parser with the
    // two explicit projects (frontend tsconfig.json, node tsconfig.node.json)
    // so type-aware rules run on real types instead of surface syntax.
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
    },
    rules: {
      ...typeCheckedRules,
      ...prettierRecommendedRules,
      ...sharedRules,

      // TypeScript-specific rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
