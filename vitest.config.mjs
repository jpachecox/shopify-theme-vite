import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend', import.meta.url)),
    },
  },
  test: {
    // Default environment is plain Node — correct for utils/ and scripts/
    // (no DOM needed). Tests that need a DOM can install jsdom and opt a
    // file into it with a `// @vitest-environment jsdom` docblock at the
    // top. `environmentMatchGlobs` was removed in Vitest 4 in favor of
    // `projects`, so a single file-level docblock keeps the config
    // framework-agnostic.
    include: ['frontend/**/*.test.{ts,tsx}', 'utils/**/*.test.ts', 'scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['frontend/**/*.{ts,tsx}', 'utils/**/*.ts', 'scripts/**/*.ts'],
      exclude: ['frontend/**/*.test.{ts,tsx}', 'utils/**/*.test.ts', 'scripts/**/*.test.ts'],
      thresholds: {
        statements: 44,
        branches: 39,
        functions: 70,
        lines: 46,
      },
    },
  },
});
