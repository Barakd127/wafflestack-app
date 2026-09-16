#!/usr/bin/env node
/**
 * build-ds-bundle.mjs — regenerate bundle/_ds_bundle.js in the exact "format 4"
 * layout the existing project uses:
 *   header comment `@ds-bundle: {...}` → outer IIFE → __ds_ns/__ds_scope/__errors
 *   → per-component `try { (() => { <compiled JS> ; __ds_ns.X = X })() } catch`.
 * JSX is compiled to React.createElement via the app's own esbuild. React comes
 * from the page's UMD global; all `import` lines are stripped (components are
 * self-contained by contract; ./_shared.js consts are hoisted to outer scope).
 *
 * Usage: node build-ds-bundle.mjs [--include-legacy]   (legacy = old 9 invented
 * components fetched to _work/legacy-components/, for the S3 union upload step)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const WORK = join(ROOT, 'design-system', '_work');
const NS = 'WaffleStackDesignSystem_a43b54';
const esbuild = (await import(pathToFileURL(join(ROOT, 'node_modules', 'esbuild', 'lib', 'main.js')).href));

const includeLegacy = process.argv.includes('--include-legacy');

// ── Collect component modules ────────────────────────────────────────────────
/** files: [{bundlePath, absPath, shared}] in deterministic order: shared first, then groups */
const files = [];
const compRoot = join(BUNDLE, 'components');
const walk = (dir) => {
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx|js)$/.test(e) && !/\.card\./.test(e)) {
      files.push({ bundlePath: relative(BUNDLE, p).replace(/\\/g, '/'), absPath: p, shared: /^_/.test(e) });
    }
  }
};
if (existsSync(compRoot)) walk(compRoot);
for (const kit of ['screens-app.jsx', 'screens-intro.jsx']) {
  const p = join(BUNDLE, 'ui_kits', 'wafflestack', kit);
  if (existsSync(p)) files.push({ bundlePath: `ui_kits/wafflestack/${kit}`, absPath: p, shared: false });
}
if (includeLegacy) {
  const legacyDir = join(WORK, 'legacy-components');
  if (existsSync(legacyDir)) {
    const lwalk = (dir, rel) => {
      for (const e of readdirSync(dir).sort()) {
        const p = join(dir, e);
        if (statSync(p).isDirectory()) lwalk(p, `${rel}${e}/`);
        else if (/\.jsx$/.test(e)) files.push({ bundlePath: `${rel}${e}`, absPath: p, shared: false, legacy: true });
      }
    };
    lwalk(legacyDir, 'components/');
  }
}
files.sort((a, b) => (b.shared - a.shared)); // stable: shared first

// ── Transform each module ────────────────────────────────────────────────────
const componentsMeta = [];
const sourceHashes = {};
const unexposed = [];
const sections = [];

for (const f of files) {
  const src = readFileSync(f.absPath, 'utf8');
  sourceHashes[f.bundlePath] = createHash('sha256').update(src).digest('hex').slice(0, 12);

  // strip imports (React UMD global + shared consts hoisted to outer scope).
  // Semicolon-optional and multi-line tolerant; character classes match \n.
  // Imports of sibling COMPONENT files become `const {X} = __ds_ns;` at the top
  // of this section (the sibling ran earlier — alphabetical walk order), since
  // inner IIFEs can't see each other's scope. `./_shared.js` names need nothing:
  // shared files are hoisted into the outer IIFE scope.
  const nsBridges = [];
  let code = src.replace(/^import[^'"]*['"]([^'"]*)['"];?[ \t]*$/gm, (full, spec) => {
    if (/^\.\/(?!_shared)/.test(spec)) {
      const names = full.match(/\{([^}]*)\}/)?.[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean) ?? [];
      for (const n of names) nsBridges.push(n);
    }
    return '';
  });
  if (nsBridges.length) code = `const { ${[...new Set(nsBridges)].join(', ')} } = window.${NS};\n` + code;
  // record exported names, then strip `export ` keywords
  const names = [];
  for (const m of code.matchAll(/^export\s+(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) names.push(m[1]);
  code = code.replace(/^export\s+default\s+/gm, '').replace(/^export\s+/gm, '');

  let { code: js } = esbuild.transformSync(code, { loader: 'jsx', jsx: 'transform', format: 'esm', target: 'es2020' });
  // belt-and-braces: no import statement may survive into the browser IIFE
  js = js.replace(/^import[^'"]*['"][^'"]*['"];?[ \t]*$/gm, '');
  if (/^import\s/m.test(js)) { console.error(`unstripped import in ${f.bundlePath}`); process.exit(1); }

  const exposed = names.filter((n) => /^[A-Z]/.test(n) || /^[A-Z_]+$/.test(n) || ['COURSES', 'GC', 'GRAPH_FONT', 'graphCardStyle'].includes(n));
  names.filter((n) => !exposed.includes(n)).forEach((n) => unexposed.push(`${f.bundlePath}:${n}`));

  for (const n of exposed.filter((n) => /^[A-Z][a-z]/.test(n))) {
    componentsMeta.push({ name: n, sourcePath: f.bundlePath });
  }

  const assigns = exposed.map((n) => `__ds_ns.${n} = ${n};`).join('\n');
  if (f.shared) {
    // shared consts: hoist into OUTER scope so later component IIFEs see them
    sections.push(`// ${f.bundlePath} (shared scope)\n${js}\n${assigns}`);
  } else {
    sections.push(
      `// ${f.bundlePath}\ntry { (() => {\n${js}\n${assigns}\n})(); } catch (e) { __ds_ns.__errors.push({ path: "${f.bundlePath}", error: String((e && e.message) || e) }); }`
    );
  }
}

const headerMeta = {
  format: 4,
  namespace: NS,
  components: componentsMeta,
  sourceHashes,
  inlinedExternals: [],
  unexposedExports: unexposed,
};

const out = `/* @ds-bundle: ${JSON.stringify(headerMeta)} */

(() => {

const __ds_ns = (window.${NS} = window.${NS} || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

${sections.join('\n\n')}

})();
`;
writeFileSync(join(BUNDLE, '_ds_bundle.js'), out);
console.log(`wrote _ds_bundle.js — ${componentsMeta.length} components${includeLegacy ? ' (incl. legacy union)' : ''}: ${componentsMeta.map((c) => c.name).join(', ')}`);
