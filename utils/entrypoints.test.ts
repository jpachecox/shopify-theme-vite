import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { expect, it } from 'vitest';

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

it('preserves valid lowercase kebab-case entrypoint names', () => {
  expect(getEntrypointBaseName('component', 'button-group')).toBe('component-button-group');
  expect(getEntrypointBaseName('component', 'component-button-group')).toBe(
    'component-button-group'
  );
  expect(getEntrypointBaseName('section', 'rich-text')).toBe('section-rich-text');
});

it('rejects digits, underscores, uppercase characters, and symbols in partial names', () => {
  expect(() => getEntrypointBaseName('component', 'button-group-2')).toThrow(
    /invalid partial name/
  );
  expect(() => getEntrypointBaseName('component', 'button_group')).toThrow(
    /invalid partial name "_button_group\.scss"/
  );
  expect(() => getEntrypointBaseName('component', 'Button-group')).toThrow(
    /invalid partial name "_Button-group\.scss"/
  );
  expect(() => getEntrypointBaseName('component', 'button.group')).toThrow(/invalid partial name/);
});

it('generates an entrypoint from a valid partial and preserves its source name', () => {
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

    expect(generatedFiles).toEqual(new Set(['component-button-group.scss']));
    expect(fs.readFileSync(entrypoint, 'utf-8')).toMatch(
      /@use '\.\.\/styles\/component\/button-group';/
    );
  });
});

it('rejects an entrypoint collision and never overwrites a manual file', () => {
  withTemporaryDirectories(({ stylesDirectory, entrypointsDirectory }) => {
    fs.writeFileSync(path.join(stylesDirectory, '_card.scss'), '.card { display: block; }');
    fs.writeFileSync(
      path.join(stylesDirectory, '_component-card.scss'),
      '.card { display: grid; }'
    );

    expect(() =>
      generateEntrypointsFromSources(
        [{ dir: stylesDirectory, importBase: 'component' }],
        entrypointsDirectory,
        'frontend/styles'
      )
    ).toThrow(/name collision/);

    fs.rmSync(path.join(stylesDirectory, '_component-card.scss'));
    const manualEntrypoint = path.join(entrypointsDirectory, 'component-card.scss');
    fs.writeFileSync(manualEntrypoint, '@use "manual";');

    expect(() =>
      generateEntrypointsFromSources(
        [{ dir: stylesDirectory, importBase: 'component' }],
        entrypointsDirectory,
        'frontend/styles'
      )
    ).toThrow(/refusing to overwrite manual entrypoint/);
    expect(fs.readFileSync(manualEntrypoint, 'utf-8')).toBe('@use "manual";');
  });
});

it('removes orphaned generated entrypoints while preserving manual files', () => {
  withTemporaryDirectories(({ entrypointsDirectory }) => {
    const orphanedEntrypoint = path.join(entrypointsDirectory, 'component-orphan.scss');
    const manualEntrypoint = path.join(entrypointsDirectory, 'base.scss');

    fs.writeFileSync(
      orphanedEntrypoint,
      `${AUTO_GENERATED_MARKER}\n@use '../styles/component/orphan';\n`
    );
    fs.writeFileSync(manualEntrypoint, '@use "../styles/settings";');

    cleanupOrphanedEntrypoints(entrypointsDirectory, new Set());

    expect(fs.existsSync(orphanedEntrypoint)).toBe(false);
    expect(fs.existsSync(manualEntrypoint)).toBe(true);
  });
});

it('keeps generated entrypoints when the branded output feeds cleanup', () => {
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

    expect(fs.existsSync(path.join(entrypointsDirectory, 'component-button.scss'))).toBe(true);
    expect(fs.existsSync(path.join(entrypointsDirectory, 'component-orphan.scss'))).toBe(false);
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
