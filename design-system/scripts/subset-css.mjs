#!/usr/bin/env node
/**
 * subset-css.mjs — copy VERBATIM the Tailwind utility rules the bundle actually
 * uses, from the app's authoritative build output (dist/assets/index-*.css).
 *
 * Class list = static scan of every .jsx/.js/.html/.dc.html under bundle/
 * (className="..."/class="..." strings + template-literal class fragments),
 * optionally unioned with a runtime harvest file (_work/runtime-classes.json).
 *
 * Rules are kept if any selector's class token is in the wanted set. @media /
 * @supports wrappers are preserved with only their matching children.
 * Referenced @keyframes are pulled in too. Everything byte-verbatim from dist.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const WORK = join(ROOT, 'design-system', '_work');
const SHA = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const postcss = (await import(pathToFileURL(join(ROOT, 'node_modules', 'postcss', 'lib', 'postcss.mjs')).href)).default;

// ── 1. Harvest wanted class names from bundle markup ─────────────────────────
const wanted = new Set();
const scanFile = (p) => {
  const text = readFileSync(p, 'utf8');
  for (const m of text.matchAll(/class(?:Name)?\s*[=:]\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g)) {
    const v = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ');
    for (const cls of v.split(/\s+/)) if (cls) wanted.add(cls);
  }
};
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx|js|html)$/.test(e) && !/_ds_bundle\.js$/.test(e)) scanFile(p);
  }
};
walk(BUNDLE);
const runtimeFile = join(WORK, 'runtime-classes.json');
if (existsSync(runtimeFile)) for (const c of JSON.parse(readFileSync(runtimeFile, 'utf8'))) wanted.add(c);

// ── 2. Parse dist css, keep matching rules verbatim ──────────────────────────
const distDir = join(ROOT, 'dist', 'assets');
const distCssFile = readdirSync(distDir).find((f) => /^index-.*\.css$/.test(f));
if (!distCssFile) { console.error('dist css not found — run npm run build first'); process.exit(1); }
const distCss = readFileSync(join(distDir, distCssFile), 'utf8');
const root = postcss.parse(distCss);

const classTokens = (selector) =>
  [...selector.matchAll(/\.((?:[\w-]|\\.)+)/g)].map((m) => m[1].replace(/\\(.)/g, '$1'));

const matchedClasses = new Set();
const keptRules = [];          // top-level rule css strings
const keptByAtRule = new Map(); // atrule params -> [rule css]
const animNames = new Set();

const ruleMatches = (rule) => {
  const toks = classTokens(rule.selector);
  const hit = toks.filter((t) => wanted.has(t));
  if (!hit.length) return false;
  hit.forEach((h) => matchedClasses.add(h));
  rule.walkDecls(/^animation/, (d) => {
    for (const w of d.value.split(/[\s,]+/)) if (/^[A-Za-z][\w-]*$/.test(w) && !/^(infinite|linear|ease|alternate|both|forwards|backwards|normal|reverse|running|paused|none)$/.test(w) && !/^[\d.]/.test(w)) animNames.add(w);
  });
  return true;
};

root.each((node) => {
  if (node.type === 'rule' && ruleMatches(node)) keptRules.push(node.toString());
  else if (node.type === 'atrule' && (node.name === 'media' || node.name === 'supports')) {
    const inner = [];
    node.each((child) => { if (child.type === 'rule' && ruleMatches(child)) inner.push(child.toString()); });
    if (inner.length) {
      const key = `@${node.name} ${node.params}`;
      if (!keptByAtRule.has(key)) keptByAtRule.set(key, []);
      keptByAtRule.get(key).push(...inner);
    }
  }
});
// referenced keyframes
root.walkAtRules('keyframes', (kf) => { if (animNames.has(kf.params)) keptRules.push(kf.toString()); });

// ── 3. Emit ──────────────────────────────────────────────────────────────────
let out = `/* [ds-extract] Tailwind utility subset — copied VERBATIM from the app's\n   production build (${distCssFile}) @ ${SHA}. Only classes used by bundle\n   markup are included. Regenerate with subset-css.mjs. */\n`;
out += keptRules.join('\n') + '\n';
for (const [key, rules] of keptByAtRule) out += `${key}{${rules.join('')}}\n`;
writeFileSync(join(BUNDLE, 'tokens', 'tailwind-utilities.css'), out);

// report — unmatched classes that are NOT app-custom (ws-/ls-/arsenal-/stat-/katex/landing)
const custom = /^(ws-|ls-|arsenal-|stat-|katex|landing-|dc-|ds-)/;
const unmatched = [...wanted].filter((c) => !matchedClasses.has(c) && !custom.test(c)).sort();
writeFileSync(join(WORK, 'subset-report.json'), JSON.stringify({
  wanted: wanted.size, matched: matchedClasses.size, rules: keptRules.length,
  mediaBlocks: keptByAtRule.size, unmatched,
}, null, 2));
console.log(`wrote tokens/tailwind-utilities.css — ${matchedClasses.size} classes matched, ${keptRules.length} rules; ${unmatched.length} unmatched non-custom (see _work/subset-report.json)`);
if (unmatched.length) console.log('unmatched:', unmatched.join(' '));
