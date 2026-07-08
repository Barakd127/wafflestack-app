// RTL hard-criteria audit — run with `npm run qa:rtl`.
// Static half of the RTL QA gate (the live half is DOM probes on each route:
// .katex/pre/code must compute direction:ltr, Hebrew blocks rtl, no raw $/\texttt
// in body text, no horizontal overflow at 1920/768).
//
// Exits 1 on any violation so it can gate CI later.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SRC = join(ROOT, 'src')

const files = []
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(name)) files.push(p)
  }
})(SRC)

const RULES = [
  {
    id: 'plural-concat',
    desc: "Hebrew plural built by concatenation (+ 'ים'/'ות') — hard-code labelPlural instead",
    re: /\+\s*['"](?:ים|ות)['"]/g,
  },
  {
    id: 'rtl-on-math',
    desc: 'dir="rtl" on the same line as a KaTeX/MathLive/code render — math must be LTR-isolated',
    re: /dir="rtl"[^\n]*(?:katex|ML__|math-field|<pre|<code)|(?:katex|ML__|math-field)[^\n]*dir="rtl"/g,
  },
  {
    id: 'text-align-right-css',
    desc: "CSS 'text-align: right' — use 'start' so LTR islands stay correct",
    re: /text-align:\s*right\s*[;!]/g,
    ext: /\.css$/,
  },
  {
    id: 'hebrew-placeholder',
    desc: 'Hebrew placeholder text — notebook uses caret-only empty state (no placeholder copy)',
    re: /(?:data-placeholder|placeholder)=[^\n]*[֐-׿]/g,
    ext: /[\\/]notebook[\\/][^\\/]+\.tsx?$/,
  },
]

// mindmap.html — physical text-align in CSS/cssText (start|center|end are fine)
const MINDMAP = join(ROOT, 'public', 'mindmap.html')
const MINDMAP_RULE = {
  id: 'text-align-physical-mindmap',
  desc: "physical 'text-align:right|left' in mindmap.html — use start/end (center ok)",
  re: /text-align\s*:\s*(?:right|left)\b/g,
}

let violations = 0
{
  const text = readFileSync(MINDMAP, 'utf8')
  text.split('\n').forEach((line, i) => {
    if (line.includes('direction:ltr')) return // LTR-isolated math/code — physical left is intentional
    MINDMAP_RULE.re.lastIndex = 0
    if (MINDMAP_RULE.re.test(line)) {
      violations++
      console.error(`public/mindmap.html:${i + 1} [${MINDMAP_RULE.id}] ${MINDMAP_RULE.desc}`)
      console.error(`  ${line.trim().slice(0, 120)}`)
    }
  })
}
for (const f of files) {
  const text = readFileSync(f, 'utf8')
  const lines = text.split('\n')
  for (const rule of RULES) {
    if (rule.ext && !rule.ext.test(f)) continue
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return
      rule.re.lastIndex = 0
      if (rule.re.test(line)) {
        violations++
        console.error(`${f.replace(ROOT, '')}:${i + 1} [${rule.id}] ${rule.desc}`)
        console.error(`  ${line.trim().slice(0, 120)}`)
      }
    })
  }
}

if (violations) {
  console.error(`\nRTL audit FAILED — ${violations} violation(s).`)
  process.exit(1)
}
console.log(`RTL audit passed — ${files.length} files scanned, 0 violations.`)
