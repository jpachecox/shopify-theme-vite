import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, it, expect } from 'vitest';

describe('Smoke Tests - Project Environment', () => {
  it('should verify essential configuration files exist', () => {
    const root = process.cwd();

    // Validar que existan los archivos clave de configuración
    const requiredFiles = ['package.json', 'vite.config.js'];

    requiredFiles.forEach((file) => {
      const filePath = resolve(root, file);
      expect(existsSync(filePath), `Missing critical file: ${file}`).toBe(true);
    });
  });

  it('should load vite configuration without throwing syntax errors', async () => {
    const viteConfigPath = resolve(process.cwd(), 'vite.config.js');
    expect(existsSync(viteConfigPath)).toBe(true);

    const config = (await import(viteConfigPath)) as { default?: unknown };
    expect(config.default).toBeDefined();
  });
});
