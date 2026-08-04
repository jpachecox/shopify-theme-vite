import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // utils/ and scripts/ are plain Node code (no DOM) — running them
    // under jsdom works but adds unnecessary setup cost per file.
    environmentMatchGlobs: [
      ['utils/**', 'node'],
      ['scripts/**', 'node'],
    ],
    setupFiles: ['./frontend/test/setup.ts'],
    include: ['frontend/**/*.test.{ts,tsx}', 'utils/**/*.test.ts', 'scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['frontend/**/*.{ts,tsx}', 'utils/**/*.ts', 'scripts/**/*.ts'],
      exclude: [
        'frontend/**/*.test.{ts,tsx}',
        'frontend/test/**',
        'utils/**/*.test.ts',
        'scripts/**/*.test.ts',
      ],
    },
  },
});
