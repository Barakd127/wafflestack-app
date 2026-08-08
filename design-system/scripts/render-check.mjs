#!/usr/bin/env node
/**
 * render-check.mjs — open every bundle card + template headless and verify it
 * actually renders: no blank pages, no thin (near-empty) renders, no
 * __ds_ns.__errors, no console errors. Emits bundle/.render-check.json with the
 * summary counts {total,bad,thin,variantsIdentical,iterations} and a detailed
 * per-file report in _work/render-check-detail.json.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = join(ROOT, 'design-system', 'bundle');
const WORK = join(ROOT, 'design-system', '_work');
const { chromium } = await import(pathToFileURL(join(ROOT, 'node_modules', 'playwright', 'index.mjs')).href);

const iterations = Number(process.env.RENDER_CHECK_ITERATION ?? 1);

// ── static server for the bundle dir ─────────────────────────────────────────
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jsx': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/markdown' };
const server = createServer((req, res) => {
  const path = join(BUNDLE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!path.startsWith(BUNDLE) || !existsSync(path) || statSync(path).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path).pipe(res);
});
await new Promise((r) => server.listen(4173, r));

// ── collect pages ────────────────────────────────────────────────────────────
const pages = [];
const walk = (dir) => {
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.html$/.test(e) && !/\.dc\.html$/.test(e)) {
      const first = readFileSync(p, 'utf8').split('\n', 1)[0];
      if (/@dsCard/.test(first) || /ui_kits/.test(p)) pages.push(relative(BUNDLE, p).replace(/\\/g, '/'));
    }
  }
};
walk(BUNDLE);
// templates: render their standalone src if present, else the .dc.html is skipped
// (dc format needs the Design Canvas runtime; standalone srcs are checked instead)
const tplRoot = join(BUNDLE, 'templates');
if (existsSync(tplRoot)) {
  for (const folder of readdirSync(tplRoot)) {
    const dir = join(tplRoot, folder);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) if (/standalone.*\.html$/i.test(f)) pages.push(`templates/${folder}/${f}`);
  }
}

// ── render each ──────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const detail = [];
let bad = 0, thin = 0, variantsIdentical = 0;
for (const rel of pages) {
  const page = await browser.newPage({ viewport: { width: 1180, height: 760 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  let status = 'ok', notes = [];
  try {
    await page.goto(`http://localhost:4173/${rel}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(600); // let babel-standalone hydrate
    const info = await page.evaluate(() => {
      const ns = Object.keys(window).find((k) => k.startsWith('WaffleStackDesignSystem'));
      const errors = ns ? (window[ns].__errors ?? []) : [];
      const body = document.body;
      return {
        text: (body.innerText || '').trim().length,
        elements: body.querySelectorAll('*').length,
        nsErrors: errors,
        variantNodes: [...body.querySelectorAll('[data-variant]')].map((n) => n.outerHTML),
      };
    });
    if (info.nsErrors.length) { status = 'bad'; notes.push(`bundle errors: ${JSON.stringify(info.nsErrors)}`); }
    else if (consoleErrors.length) { status = 'bad'; notes.push(`console: ${consoleErrors.slice(0, 3).join(' | ')}`); }
    else if (info.elements < 5 || info.text === 0) {
      // image-only cards are allowed to have no text if they have imgs/svgs
      const media = await page.evaluate(() => document.querySelectorAll('img,svg,canvas').length);
      if (info.elements < 5 && media === 0) { status = 'bad'; notes.push(`near-empty: ${info.elements} elements`); }
      else if (info.text < 3 && media === 0) { status = 'thin'; notes.push('no text, no media'); }
    } else if (info.text < 10 && info.elements < 15) { status = 'thin'; notes.push(`thin: ${info.text} chars / ${info.elements} elements`); }
    const uniq = new Set(info.variantNodes);
    if (info.variantNodes.length > 1 && uniq.size === 1) { variantsIdentical++; notes.push('variants render identically'); }
  } catch (e) {
    status = 'bad'; notes.push(String(e.message ?? e).slice(0, 200));
  }
  if (status === 'bad') bad++; else if (status === 'thin') thin++;
  detail.push({ path: rel, status, notes });
  await page.close();
}
await browser.close();
server.close();

const summary = { total: pages.length, bad, thin, variantsIdentical, iterations };
writeFileSync(join(BUNDLE, '.render-check.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(WORK, 'render-check-detail.json'), JSON.stringify(detail, null, 2));
console.log(JSON.stringify(summary));
for (const d of detail.filter((d) => d.status !== 'ok')) console.log(`  ${d.status.toUpperCase()} ${d.path} — ${d.notes.join('; ')}`);
