import path from 'node:path';
import { fileURLToPath } from 'node:url';

import shopifyClean from '@driver-digital/vite-plugin-shopify-clean';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import shopify from 'vite-plugin-shopify';

import { autoEntrypointsFromStyles } from './utils/tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    autoEntrypointsFromStyles({ root: __dirname }),
    shopifyClean(),
    shopify({
      themeRoot: './',
      sourceCodeDir: 'frontend',
      entrypointsDir: 'frontend/entrypoints',
      versionNumbers: true,
    }),
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { quality: 80 },
      gif: {
        effort: 10,
      },
      svg: {
        // SVGO v4 dropped the `active` flag: a plugin is disabled by simply
        // not listing it. removeViewBox is omitted on purpose so responsive
        // SVGs keep their viewBox.
        plugins: [{ name: 'removeDimensions' }],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'frontend/styles')],
      },
    },
  },

  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: '[name][extname]',
      },
    },
    emptyOutDir: false,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'oxc',
  },
});
