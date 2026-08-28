#!/usr/bin/env node
// Build a self-contained single-file version of the coffee game
// (public/coffee-game/) for publishing as a claude.ai Artifact:
// JS bundled (three.js included), CSS inlined, Kenney GLBs and
// colormaps embedded as base64 (scene.js reads window.__ASSETS).
//
// Usage: node tools/build-artifact.mjs <esbuild-bin> <out.html>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const game = path.join(root, 'public', 'coffee-game');
const esbuild = process.argv[2];
const out = process.argv[3];
if (!esbuild || !out) {
  console.error('usage: node tools/build-artifact.mjs <esbuild-bin> <out.html>');
  process.exit(1);
}

// 1. bundle game.js + three into one IIFE
const bundle = execFileSync(esbuild, [
  path.join(game, 'js', 'game.js'),
  '--bundle', '--format=iife', '--minify', '--target=es2020',
  '--charset=utf8',
  `--alias:three=${path.join(game, 'vendor', 'three.module.min.js')}`,
], { maxBuffer: 64 * 1024 * 1024 }).toString();

// 2. embed models + textures
const b64 = (p) => readFileSync(path.join(root, 'public', p)).toString('base64');
const MODELS = {
  'cup-coffee': 'models/food/cup-coffee.glb',
  'cup-tea': 'models/food/cup-tea.glb',
  'frappe': 'models/food/frappe.glb',
  'croissant': 'models/food/croissant.glb',
  'donut-sprinkles': 'models/food/donut-sprinkles.glb',
  'cupcake': 'models/food/cupcake.glb',
  'cake': 'models/food/cake.glb',
  'waffle': 'models/food/waffle.glb',
  'cookie': 'models/food/cookie-chocolate.glb',
  'mug': 'models/food/mug.glb',
  'planter': 'models/kenney-suburban/planter.glb',
  'parasol': 'kenney/commercial/detail-parasol-a.glb',
};
const assets = {
  models: Object.fromEntries(Object.entries(MODELS).map(([k, p]) => [k, b64(p)])),
  textures: {
    'models/food/Textures/colormap.png': `data:image/png;base64,${b64('models/food/Textures/colormap.png')}`,
    'models/kenney-suburban/Textures/colormap.png': `data:image/png;base64,${b64('models/kenney-suburban/Textures/colormap.png')}`,
    'kenney/commercial/Textures/colormap.png': `data:image/png;base64,${b64('kenney/commercial/Textures/colormap.png')}`,
  },
};

// 3. page shell: title + fonts + inline CSS + game body + scripts
// (the Artifact publisher supplies doctype/head/body, so emit a fragment)
const html = readFileSync(path.join(game, 'index.html'), 'utf8');
const css = readFileSync(path.join(game, 'style.css'), 'utf8');
const fontLinks = [...html.matchAll(/<link[^>]+(?:fonts\.googleapis|fonts\.gstatic)[^>]*>/g)]
  .map((m) => m[0]).join('\n');
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .trim();

const page = `<title>תפוס את הפול!</title>
<script>document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'he');</script>
${fontLinks}
<style>
${css}
</style>
${body}
<script>window.__ASSETS = ${JSON.stringify(assets)};</script>
<script>
${bundle}
</script>
`;
writeFileSync(out, page);
console.log(`wrote ${out} (${(page.length / 1024 / 1024).toFixed(2)} MB)`);
