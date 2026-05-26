// scripts/emit-formula-library.mjs
// Build-step that compiles src/data/formula-library.ts in-process via esbuild
// and writes a JSON twin to public/formula-library.json. The mindmap.html
// iframe fetches that JSON at runtime so its ∑ formula library modal can
// never drift from the React app keyboard.
//
// We drop the `eval` JS functions on the way out (JSON has no functions and
// mindmap.html doesn't need numeric evaluation today — only display).
//
// Run order:
//   npm run prebuild → npm run build
// (also safe to run manually: `node scripts/emit-formula-library.mjs`)

import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC = resolve(ROOT, 'src/data/formula-library.ts')
const OUT = resolve(ROOT, 'public/formula-library.json')

async function main() {
  // Bundle the .ts into a single ESM string we can dynamic-import via data: URL.
  const result = await build({
    entryPoints: [SRC],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
    target: 'es2020',
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].text
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
  const mod = await import(dataUrl)
  const lib = mod.FORMULA_LIBRARY
  if (!Array.isArray(lib)) throw new Error('FORMULA_LIBRARY missing or not an array')

  // Strip non-serializable `eval` functions. Replace with `hasEval: true` so
  // consumers can tell which formulas have a numeric evaluator without trying
  // to call it.
  const stripped = lib.map(cat => ({
    id: cat.id,
    label: cat.label,
    formulas: cat.formulas.map(f => ({
      id: f.id,
      label: f.label,
      latex: f.latex,
      desc: f.desc,
      slots: f.slots,
      hasEval: typeof f.eval === 'function',
      topics: f.topics,
      courseId: f.courseId,
    })),
  }))

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(stripped, null, 2) + '\n', 'utf8')
  const count = stripped.reduce((n, c) => n + c.formulas.length, 0)
  // eslint-disable-next-line no-console
  console.log(`[emit-formula-library] wrote ${count} formulas across ${stripped.length} categories → ${OUT}`)
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('[emit-formula-library] FAILED:', err)
  process.exit(1)
})
