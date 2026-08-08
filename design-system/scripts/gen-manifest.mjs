#!/usr/bin/env node
/**
 * gen-manifest.mjs — single writer of bundle/_ds_manifest.json and
 * bundle/_adherence.oxlintrc.json, derived ONLY from the real bundle files:
 *   cards[]      ← first-line <!-- @dsCard ... --> comments of every preview html
 *   templates[]  ← <!-- @template ... --> in templates/X/X.dc.html
 *   components[] ← the @ds-bundle header of _ds_bundle.js
 *   tokens[]     ← parsed from tokens/app.css + tokens/landing.css (real vars only)
 *   prop rules   ← parsed from each component's .d.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const NS = 'WaffleStackDesignSystem_a43b54';

// ── cards ────────────────────────────────────────────────────────────────────
const cards = [];
const cardRe = /^<!--\s*@dsCard\s+([^>]*?)-->/;
const attr = (s, k) => s.match(new RegExp(`${k}="([^"]*)"`))?.[1];
const walkCards = (dir) => {
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== 'templates') walkCards(p); continue; }
    if (!/\.html$/.test(e) || /\.dc\.html$/.test(e)) continue;
    const first = readFileSync(p, 'utf8').split('\n', 1)[0];
    const m = first.match(cardRe);
    if (!m) continue;
    const a = m[1];
    cards.push({
      path: relative(BUNDLE, p).replace(/\\/g, '/'),
      group: attr(a, 'group') ?? 'Components',
      viewport: attr(a, 'viewport') ?? '700x300',
      subtitle: attr(a, 'subtitle') ?? '',
      name: attr(a, 'name') ?? e.replace(/\.html$/, ''),
    });
  }
};
walkCards(BUNDLE);

// ── templates ────────────────────────────────────────────────────────────────
const templates = [];
const tplRoot = join(BUNDLE, 'templates');
if (existsSync(tplRoot)) {
  for (const folder of readdirSync(tplRoot).sort()) {
    const dir = join(tplRoot, folder);
    if (!statSync(dir).isDirectory()) continue;
    const entry = readdirSync(dir).find((f) => /\.dc\.html$/.test(f));
    if (!entry) continue;
    const text = readFileSync(join(dir, entry), 'utf8');
    const tm = text.match(/<!--\s*@template\s+name="([^"]*)"\s+description="([^"]*)"\s*-->/);
    const t = {
      name: tm?.[1] ?? folder,
      description: tm?.[2] ?? '',
      folder: `templates/${folder}`,
      entryPath: `templates/${folder}/${entry}`,
    };
    if (existsSync(join(dir, '.thumbnail'))) t.thumbnail = { path: `templates/${folder}/.thumbnail`, kind: 'captured' };
    templates.push(t);
  }
}

// ── components (from the freshly built _ds_bundle.js header) ─────────────────
const bundleJs = readFileSync(join(BUNDLE, '_ds_bundle.js'), 'utf8');
const headerJson = JSON.parse(bundleJs.match(/@ds-bundle:\s*(\{.*?\})\s*\*\//s)[1]);
const components = headerJson.components.filter((c) => !c.sourcePath.startsWith('ui_kits/'));

// ── tokens ───────────────────────────────────────────────────────────────────
const inferKind = (name, value) => {
  const v = value.trim();
  if (/gradient\(/.test(v)) return { kind: 'color', annotation: 'color' };
  if (/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(v)) return { kind: 'color' };
  if (/shadow|^inset\b/.test(name) || /(^|,)\s*(inset\s)?-?[\d.]+px\s+-?[\d.]+px/.test(v)) return { kind: 'shadow' };
  if (/font|hand/.test(name) && /['"]|sans-serif|serif|monospace|cursive/.test(v)) return { kind: 'font' };
  if (/^-?[\d.]+(px|em|rem|%|vw|vh)$/.test(v)) return { kind: 'spacing' };
  if (/blur\(|cubic-bezier|^[\d.]+s$/.test(v)) return { kind: 'other', annotation: 'other' };
  return { kind: 'other', annotation: 'other' };
};
const parseTokens = (file, definedIn) => {
  const css = readFileSync(join(BUNDLE, file), 'utf8');
  const out = [];
  // top-level blocks: selector { ... } — we only need selector + declarations
  const blockRe = /([^{}\/]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!/^(:root|html\.dark|\.landing-root)$/.test(sel)) continue;
    const scope = sel === ':root' ? undefined : sel === 'html.dark' ? 'html.dark' : '.landing-root';
    for (const dm of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      const [, name, valueRaw] = dm;
      const value = valueRaw.replace(/\/\*[^]*?\*\//g, '').trim();
      const t = { name, value, ...inferKind(name, value), definedIn: file };
      if (scope) t.scope = scope;
      // key order parity with the original manifest: name,value,kind,definedIn,scope?,annotation?
      const ordered = { name: t.name, value: t.value, kind: t.kind, definedIn: t.definedIn };
      if (t.scope) ordered.scope = t.scope;
      if (t.annotation) ordered.annotation = t.annotation;
      out.push(ordered);
    }
  }
  return out;
};
const tokens = [...parseTokens('tokens/app.css', 'tokens/app.css'), ...parseTokens('tokens/landing.css', 'tokens/landing.css')];

// ── brand fonts ──────────────────────────────────────────────────────────────
const brandFonts = ['Heebo', 'Rubik', 'Assistant', 'Inter', 'Playpen Sans Hebrew'].map((family) => ({
  family,
  status: 'ok',
  tokens: family === 'Assistant' ? ['--ws-hand'] : [],
  path: 'tokens/fonts.css',
}));

// ── manifest ─────────────────────────────────────────────────────────────────
const manifest = {
  namespace: NS,
  components,
  startingPoints: [],
  cards,
  templates,
  hasThumbnailHtml: false,
  globalCssPaths: [
    'tokens/fonts.css',
    'tokens/preflight.css',
    'tokens/tailwind-utilities.css',
    'tokens/app.css',
    'app-classes.css',
    'tokens/landing.css',
    'styles.css',
  ],
  tokens,
  themes: [{ selector: 'html.dark', label: 'Dark' }],
  fonts: [],
  brandFonts,
  source: 'spa',
};
writeFileSync(join(BUNDLE, '_ds_manifest.json'), JSON.stringify(manifest));

// ── adherence config ─────────────────────────────────────────────────────────
const propRules = [];
const compEntries = {};
for (const c of components) {
  compEntries[c.name] = { replaces: [] };
  const dts = join(BUNDLE, dirname(c.sourcePath), `${c.name}.d.ts`);
  if (!existsSync(dts)) continue;
  const text = readFileSync(dts, 'utf8');
  const props = [...text.matchAll(/^\s{2,}(\w+)\??\s*:/gm)].map((m) => m[1]);
  if (!props.length) continue;
  const allowed = [...new Set([...props, 'style', 'key', 'ref', 'className', 'children'])];
  propRules.push({
    selector: `JSXOpeningElement[name.name='${c.name}'] > JSXAttribute > JSXIdentifier[name!=/^(?:${allowed.join('|')})$/]`,
    message: `<${c.name}> doesn't accept that prop. Declared props: ${props.join(', ')}.`,
  });
}
const adherence = {
  plugins: ['react', 'import'],
  rules: {
    'react/forbid-elements': ['warn', { forbid: [] }],
    'no-restricted-imports': ['warn', {
      patterns: [{
        group: ['components/graphs/**', 'components/app/**', 'components/studyhub/**', 'ui_kits/wafflestack/**'],
        message: "Import design-system components from 'index.js', not component internals.",
      }],
    }],
    'no-restricted-syntax': ['warn',
      { selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]', message: 'Raw hex color — use a real app token via var() (see tokens/app.css / tokens/landing.css).' },
      { selector: "Literal[value=/font-family\\s*:\\s*(?!['\\\"]?(?:Heebo|Rubik|Assistant|Inter|Playpen Sans Hebrew))/i]", message: 'Font not provided by the design system. Available: Heebo, Rubik, Assistant, Inter, Playpen Sans Hebrew.' },
      ...propRules,
    ],
  },
  overrides: [{ files: ['**/index.js'], rules: { 'no-restricted-imports': 'off' } }],
  'x-omelette': {
    components: compEntries,
    tokens: tokens.filter((t) => !t.scope || t.scope === '.landing-root').map((t) => t.name).filter((v, i, a) => a.indexOf(v) === i).sort(),
    tokenKinds: Object.fromEntries(tokens.map((t) => [t.name, t.kind])),
    fontFamilies: ['Assistant', 'Heebo', 'Inter', 'Playpen Sans Hebrew', 'Rubik'],
  },
};
writeFileSync(join(BUNDLE, '_adherence.oxlintrc.json'), JSON.stringify(adherence, null, 2));

console.log(`manifest: ${components.length} components, ${cards.length} cards, ${templates.length} templates, ${tokens.length} tokens`);
