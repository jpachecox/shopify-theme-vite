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
    // (no DOM needed). Files that render components opt into jsdom
    // individually via a `// @vitest-environment jsdom` docblock comment
    // at the top of the file (see frontend/components/counter.test.tsx).
    // `environmentMatchGlobs` would be the glob-based equivalent, but it
    // was removed entirely in Vitest 4 in favor of `projects` — not worth
    // the extra config structure for what's currently a single DOM test file.
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
