#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = 'assets';
const MANIFEST_PATH = path.join(ASSETS_DIR, '.vite', 'manifest.json');

let failed = false;
/**
 * @param {string} msg
 */
const fail = (msg) => {
  console.error(`❌ ${msg}`);
  failed = true;
};

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ ${MANIFEST_PATH} not found. Run: "yarn build" first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

console.log('Verifying naming convention in assets/ (against manifest.json)...');

for (const [source, entry] of Object.entries(manifest)) {
  const expectedBase = path.basename(source, path.extname(source));

  // Entrypoints: JS/CSS generados directamente por un entrypoint
  const entryFiles = [];
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

  // Assets referenciados (imágenes, fuentes, SVG importados desde .scss/.jsx)
  if (Array.isArray(entry.assets)) {
    for (const assetFile of entry.assets) {
      if (assetFile.includes('.min.')) {
        fail(`Asset "${assetFile}" contains .min suffix (not allowed)`);
      }
      // Detecta hash de contenido: Rollup usa 8 chars hex tipo -a1b2c3d4
      // antes de la extensión SOLO cuando no se pudo respetar el
      // patrón [name][extname] (ej. colisión real de nombres).
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
  console.log(
    '✅ assets/ conforms to the convention: no hash, no .min, no subfolders, names 1:1 with source.'
  );
  process.exit(0);
}
process.exit(1);
