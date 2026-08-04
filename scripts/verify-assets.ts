#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = 'assets';
const MANIFEST_PATH = path.join(ASSETS_DIR, '.vite', 'manifest.json');

type ManifestEntry = {
  file: string;
  css?: string[];
  assets?: string[];
};

let failed = false;

const fail = (msg: string): void => {
  console.error(`❌ ${msg}`);
  failed = true;
};

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ ${MANIFEST_PATH} not found. Run: "yarn build" first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Record<
  string,
  ManifestEntry
>;

console.error('Verifying naming convention in assets/ (against manifest.json)...');

for (const [source, entry] of Object.entries(manifest)) {
  const expectedBase = path.basename(source, path.extname(source));

  // Entrypoints: JS/CSS emitted directly from an entrypoint.
  const entryFiles: string[] = [];
  if (entry.file) entryFiles.push(entry.file);
  if (Array.isArray(entry.css)) entryFiles.push(...entry.css);

  for (const file of entryFiles) {
    const actualBase = path.basename(file, path.extname(file));
    if (actualBase !== expectedBase) {
      fail(
        `"${source}" generated "${file}" — expected basename "${expectedBase}" (possible name collision or unexpected hash)`
      );
    }
    if (file.includes('.min.')) {
      fail(`"${file}" contains .min suffix (not allowed)`);
    }
  }

  // Referenced assets (images, fonts, SVGs imported from .scss/.jsx).
  if (Array.isArray(entry.assets)) {
    for (const assetFile of entry.assets) {
      if (assetFile.includes('.min.')) {
        fail(`Asset "${assetFile}" contains .min suffix (not allowed)`);
      }
      // Content hash detection: Rollup emits an 8-char hex suffix like
      // -a1b2c3d4 before the extension ONLY when the [name][extname]
      // pattern can't be honored (e.g. real name collisions).
      if (/-[0-9a-f]{8}\.\w+$/i.test(assetFile)) {
        fail(`Asset "${assetFile}" has hash in filename — check for a real source name collision`);
      }
    }
  }
}

for (const entry of fs.readdirSync(ASSETS_DIR, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== '.vite') {
    fail(`Subfolder not allowed inside assets/: ${entry.name}`);
  }
}

if (!failed) {
  console.error(
    '✅ assets/ conforms to the convention: no hash, no .min, no subfolders, names 1:1 with source.'
  );
  process.exit(0);
}
process.exit(1);
