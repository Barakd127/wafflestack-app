#!/usr/bin/env node
/**
 * extract-master.mjs — verbatim extraction of WaffleStack design tokens & classes.
 *
 * Splits src/index.css into:
 *   bundle/tokens/app.css   — :root + html.dark var blocks, body bg pair, :focus-visible
 *   bundle/app-classes.css  — every other rule (ws-* classes, keyframes, KaTeX RTL, mobile @media)
 * Copies src/landing/landing.css → bundle/tokens/landing.css wholesale.
 * Writes bundle/tokens/fonts.css from the exact Google Fonts URL in index.html.
 *
 * VERBATIM GUARANTEE: after splitting, the script re-merges all extracted blocks
 * in original order and asserts byte-equality with the source file minus the
 * three `@tailwind` directive lines. Any drift = hard failure.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const SHA = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();

const header = (src) =>
  `/* [ds-extract] VERBATIM from ${src} @ ${SHA} (master). Do not edit by hand —\n   regenerate with design-system/scripts/extract-master.mjs. */\n`;

// ── Parse src/index.css into top-level chunks ────────────────────────────────
const srcCss = readFileSync(join(ROOT, 'src', 'index.css'), 'utf8');
const lines = srcCss.split('\n');

/** Chunks: consecutive line groups. A chunk = leading comments/blank lines + one
 *  top-level statement (block or directive). Chunks preserve exact text. */
const chunks = [];
{
  let i = 0;
  let pending = []; // comment/blank lines waiting to attach to next statement
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('/*')) {
      // swallow full comment (possibly multi-line) or blank line into pending
      if (trimmed.startsWith('/*') && !/\*\/\s*$/.test(trimmed)) {
        const start = i;
        while (i < lines.length && !/\*\//.test(lines[i])) i++;
        pending.push(...lines.slice(start, i + 1));
        i++;
      } else {
        pending.push(line);
        i++;
      }
      continue;
    }
    if (trimmed.startsWith('@tailwind')) {
      chunks.push({ kind: 'tailwind', sel: trimmed, text: [...pending, line], start: i });
      pending = [];
      i++;
      continue;
    }
    // statement with a block — find matching close brace at depth 0
    const start = i;
    let depth = 0, sawOpen = false;
    while (i < lines.length) {
      for (const ch of lines[i]) {
        if (ch === '{') { depth++; sawOpen = true; }
        else if (ch === '}') depth--;
      }
      i++;
      if (sawOpen && depth === 0) break;
    }
    const stmtLines = lines.slice(start, i);
    const sel = stmtLines.join(' ').split('{')[0].trim().replace(/\s+/g, ' ');
    chunks.push({ kind: 'block', sel, text: [...pending, ...stmtLines], start });
    pending = [];
  }
  if (pending.length) chunks.push({ kind: 'tail', sel: '', text: pending, start: lines.length });
}

// ── Classify chunks ──────────────────────────────────────────────────────────
const TOKEN_SELECTORS = new Set([
  ':root',
  'html.dark',
  'body',
  'html.dark body',
  ':focus-visible',
  'html.dark :focus-visible',
]);
const appCss = [];      // tokens/app.css
const classesCss = [];  // app-classes.css
let dropped = 0;
for (const c of chunks) {
  if (c.kind === 'tailwind') { dropped++; continue; } // replaced by preflight.css + tailwind-utilities.css
  (TOKEN_SELECTORS.has(c.sel) ? appCss : classesCss).push(c);
}

// ── Verbatim verification: merge back in original order, diff vs source ──────
const merged = [...appCss, ...classesCss]
  .sort((a, b) => a.start - b.start)
  .flatMap((c) => c.text)
  .join('\n');
const expected = (() => {
  // source minus the @tailwind statement lines (keep their attached comments? none exist)
  const drop = new Set(chunks.filter((c) => c.kind === 'tailwind').flatMap((c) => c.text));
  return lines.filter((l) => !(drop.has(l) && l.trim().startsWith('@tailwind'))).join('\n');
})();
if (merged !== expected) {
  // find first divergence for the error message
  const a = merged.split('\n'), b = expected.split('\n');
  let k = 0;
  while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
  console.error(`VERBATIM CHECK FAILED at merged line ${k + 1}:\n  got:      ${JSON.stringify(a[k])}\n  expected: ${JSON.stringify(b[k])}`);
  process.exit(1);
}
console.log(`verbatim check OK — ${chunks.length} chunks (${dropped} @tailwind dropped), ` +
  `${appCss.length} token chunks, ${classesCss.length} class chunks`);

// ── Emit files ───────────────────────────────────────────────────────────────
mkdirSync(join(BUNDLE, 'tokens'), { recursive: true });

writeFileSync(join(BUNDLE, 'tokens', 'app.css'),
  header('src/index.css (token + base blocks)') + '\n' + appCss.flatMap((c) => c.text).join('\n') + '\n');

writeFileSync(join(BUNDLE, 'app-classes.css'),
  header('src/index.css (class components, keyframes, media rules)') + '\n' + classesCss.flatMap((c) => c.text).join('\n') + '\n');

// landing.css — whole file, byte-identical after the provenance header
const landing = readFileSync(join(ROOT, 'src', 'landing', 'landing.css'), 'utf8');
writeFileSync(join(BUNDLE, 'tokens', 'landing.css'), header('src/landing/landing.css (whole file)') + '\n' + landing);

// fonts.css — exact URL from index.html
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
const fontUrl = indexHtml.match(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/)?.[1];
if (!fontUrl) { console.error('font URL not found in index.html'); process.exit(1); }
writeFileSync(join(BUNDLE, 'tokens', 'fonts.css'),
  header('index.html <link> (exact five-family URL)') + `@import url('${fontUrl.replace(/&amp;/g, '&')}');\n`);

console.log('wrote tokens/app.css, app-classes.css, tokens/landing.css, tokens/fonts.css');
