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
    setupFiles: ['./frontend/test/setup.ts'],
    include: ['frontend/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['frontend/**/*.{ts,tsx}'],
      exclude: ['frontend/**/*.test.{ts,tsx}', 'frontend/test/**'],
    },
  },
});
