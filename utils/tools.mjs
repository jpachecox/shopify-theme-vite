import fs from 'node:fs';
import path from 'node:path';
import { generateEntrypointsFromSources, cleanupOrphanedEntrypoints } from './entrypoints.mjs';

const DEFAULT_SOURCES = ['component', 'section', 'snippet'];

/**
 * Vite plugin: auto-generates an .scss entrypoint for each `_name.scss` partial
 * found in `stylesRoot/{components,sections,snippets}/`, and removes orphaned
 * entrypoints whose source partial no longer exists.
 *
 * @param {object} [options]
 * @param {string} [options.root] - project root directory (typically __dirname from vite.config.js)
 * @param {string} [options.entrypointsDir] - relative to root
 * @param {string} [options.stylesRoot] - relative to root
 * @param {string[]} [options.sources] - subdirectory names to scan within stylesRoot
 */
export const autoEntrypointsFromStyles = ({
  root,
  entrypointsDir = 'frontend/entrypoints',
  stylesRoot = 'frontend/styles',
  sources = DEFAULT_SOURCES,
} = {}) => {
  if (!root) {
    throw new Error('[auto-entrypoints] missing "root" option (project root directory).');
  }

  const resolvedEntrypointsDir = path.resolve(root, entrypointsDir);
  const resolvedStylesRoot = path.resolve(root, stylesRoot);

  const autoSources = sources.map((name) => ({
    dir: path.join(resolvedStylesRoot, name),
    importBase: name,
  }));

  return {
    name: 'auto-entrypoints-from-styles-scss',
    config: () => {
      if (!fs.existsSync(resolvedEntrypointsDir)) {
        fs.mkdirSync(resolvedEntrypointsDir, { recursive: true });
      }

      const expectedFiles = generateEntrypointsFromSources(
        autoSources,
        resolvedEntrypointsDir,
        stylesRoot
      );
      cleanupOrphanedEntrypoints(resolvedEntrypointsDir, expectedFiles);
    },
  };
};
