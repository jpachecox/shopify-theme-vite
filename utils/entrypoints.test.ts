import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import type { EntrypointName } from './entrypoints.ts';
import {
  AUTO_GENERATED_MARKER,
  cleanupOrphanedEntrypoints,
  generateEntrypointsFromSources,
  getEntrypointBaseName,
} from './entrypoints.ts';

type TemporaryPaths = {
  root: string;
  stylesDirectory: string;
  entrypointsDirectory: string;
};

const withTemporaryDirectories = (callback: (paths: TemporaryPaths) => void): void => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shopify-entrypoints-'));
  const stylesDirectory = path.join(root, 'styles', 'component');
  const entrypointsDirectory = path.join(root, 'entrypoints');

  fs.mkdirSync(stylesDirectory, { recursive: true });
  fs.mkdirSync(entrypointsDirectory);

  try {
    callback({ root, stylesDirectory, entrypointsDirectory });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

await test('preserves valid lowercase kebab-case entrypoint names', () => {
  assert.equal(getEntrypointBaseName('component', 'button-group'), 'component-button-group');
  assert.equal(
    getEntrypointBaseName('component', 'component-button-group'),
    'component-button-group'
  );
  assert.equal(getEntrypointBaseName('section', 'rich-text'), 'section-rich-text');
});

await test('rejects digits, underscores, uppercase characters, and symbols in partial names', () => {
  assert.throws(() => getEntrypointBaseName('component', 'button-group-2'), /invalid partial name/);
  assert.throws(
    () => getEntrypointBaseName('component', 'button_group'),
    /invalid partial name "_button_group\.scss"/
  );
  assert.throws(
    () => getEntrypointBaseName('component', 'Button-group'),
    /invalid partial name "_Button-group\.scss"/
  );
  assert.throws(() => getEntrypointBaseName('component', 'button.group'), /invalid partial name/);
});

await test('generates an entrypoint from a valid partial and preserves its source name', () => {
  withTemporaryDirectories(({ stylesDirectory, entrypointsDirectory }) => {
    fs.writeFileSync(
      path.join(stylesDirectory, '_button-group.scss'),
      '.button-group { display: flex; }'
    );

    const generatedFiles = generateEntrypointsFromSources(
      [{ dir: stylesDirectory, importBase: 'component' }],
      entrypointsDirectory,
      'frontend/styles'
    );
    const entrypoint = path.join(entrypointsDirectory, 'component-button-group.scss');

    assert.deepEqual(generatedFiles, new Set(['component-button-group.scss']));
    assert.match(
      fs.readFileSync(entrypoint, 'utf-8'),
      /@use '\.\.\/styles\/component\/button-group';/
    );
  });
});

await test('rejects an entrypoint collision and never overwrites a manual file', () => {
  withTemporaryDirectories(({ stylesDirectory, entrypointsDirectory }) => {
    fs.writeFileSync(path.join(stylesDirectory, '_card.scss'), '.card { display: block; }');
    fs.writeFileSync(
      path.join(stylesDirectory, '_component-card.scss'),
      '.card { display: grid; }'
    );

    assert.throws(
      () =>
        generateEntrypointsFromSources(
          [{ dir: stylesDirectory, importBase: 'component' }],
          entrypointsDirectory,
          'frontend/styles'
        ),
      /name collision/
    );

    fs.rmSync(path.join(stylesDirectory, '_component-card.scss'));
    const manualEntrypoint = path.join(entrypointsDirectory, 'component-card.scss');
    fs.writeFileSync(manualEntrypoint, '@use "manual";');

    assert.throws(
      () =>
        generateEntrypointsFromSources(
          [{ dir: stylesDirectory, importBase: 'component' }],
          entrypointsDirectory,
          'frontend/styles'
        ),
      /refusing to overwrite manual entrypoint/
    );
    assert.equal(fs.readFileSync(manualEntrypoint, 'utf-8'), '@use "manual";');
  });
});

await test('removes orphaned generated entrypoints while preserving manual files', () => {
  withTemporaryDirectories(({ entrypointsDirectory }) => {
    const orphanedEntrypoint = path.join(entrypointsDirectory, 'component-orphan.scss');
    const manualEntrypoint = path.join(entrypointsDirectory, 'base.scss');

    fs.writeFileSync(
      orphanedEntrypoint,
      `${AUTO_GENERATED_MARKER}\n@use '../styles/component/orphan';\n`
    );
    fs.writeFileSync(manualEntrypoint, '@use "../styles/settings";');

    cleanupOrphanedEntrypoints(entrypointsDirectory, new Set());

    assert.equal(fs.existsSync(orphanedEntrypoint), false);
    assert.equal(fs.existsSync(manualEntrypoint), true);
  });
});

await test('keeps generated entrypoints when the branded output feeds cleanup', () => {
  withTemporaryDirectories(({ stylesDirectory, entrypointsDirectory }) => {
    fs.writeFileSync(path.join(stylesDirectory, '_button.scss'), '.button { color: red; }');

    const generatedFiles: Set<EntrypointName> = generateEntrypointsFromSources(
      [{ dir: stylesDirectory, importBase: 'component' }],
      entrypointsDirectory,
      'frontend/styles'
    );
    fs.writeFileSync(
      path.join(entrypointsDirectory, 'component-orphan.scss'),
      `${AUTO_GENERATED_MARKER}\n@use '../styles/component/orphan';\n`
    );

    cleanupOrphanedEntrypoints(entrypointsDirectory, generatedFiles);

    assert.equal(fs.existsSync(path.join(entrypointsDirectory, 'component-button.scss')), true);
    assert.equal(fs.existsSync(path.join(entrypointsDirectory, 'component-orphan.scss')), false);
  });
});

/**
 * Compile-time contract of the {@link EntrypointName} brand: never executed
 * (Node 24 type-stripping erases it), but `yarn check:types` fails the build
 * if any of the `@ts-expect-error` expectations stop holding.
 */
export const entrypointNameTypeContract = (): void => {
  const generated = generateEntrypointsFromSources([], '/unused', 'unused');
  cleanupOrphanedEntrypoints('/unused', generated);

  const first = generated.values().next().value;
  if (first !== undefined) {
    const asString: string = first;
    void asString;
  }

  // @ts-expect-error a plain string is not a branded entrypoint name
  const unguarded: EntrypointName = 'component-card.scss';
  void unguarded;
};
