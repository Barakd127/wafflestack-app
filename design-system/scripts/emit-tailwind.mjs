#!/usr/bin/env node
/**
 * emit-tailwind.mjs — generate bundle/tokens/preflight.css using the app's OWN
 * Tailwind version + config (only `@tailwind base` — the reset layer).
 */
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const WORK = join(ROOT, 'design-system', '_work');
const SHA = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();

mkdirSync(WORK, { recursive: true });
mkdirSync(join(BUNDLE, 'tokens'), { recursive: true });

const tmpIn = join(WORK, 'preflight-input.css');
writeFileSync(tmpIn, '@tailwind base;\n');
const tmpOut = join(WORK, 'preflight-raw.css');
execSync(`npx tailwindcss -c tailwind.config.js -i "${tmpIn}" -o "${tmpOut}"`, {
  cwd: ROOT,
  stdio: 'inherit',
});
const css = readFileSync(tmpOut, 'utf8');
writeFileSync(
  join(BUNDLE, 'tokens', 'preflight.css'),
  `/* [ds-extract] Tailwind base (preflight) emitted by the app's own tailwindcss\n   + tailwind.config.js @ ${SHA}. Regenerate with emit-tailwind.mjs. */\n` + css
);
rmSync(tmpIn); rmSync(tmpOut);
console.log('wrote tokens/preflight.css');
