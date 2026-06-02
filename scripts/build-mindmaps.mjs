// scripts/build-mindmaps.mjs
// Build-step that generates one ready-map JSON per course topic, derived from
// src/data/lesson-content.ts (the lesson slides) + src/data/formula-library.ts
// (the shared formula library). The mindmap.html iframe fetches
// `mindmaps/<topicId>.json` at runtime and auto-loads the matching topic's tree
// (Phase 2 of the XMind-parity ready-map work; Phase 1 shipped the single
// hand-authored descriptive-stats.json in PR #122).
//
// Schema emitted (matches mmImportTopicMap in public/mindmap.html):
//   { id, title, version, root: { text, color?, note?, formula?, children?[] } }
// where each node is { text, note?, formula?, color?, children?[] }.
//
// Output is committed to BOTH:
//   • public/mindmaps/<topicId>.json   (what the iframe fetches at runtime)
//   • src/data/mindmaps/<topicId>.json (source-controlled twin, like the
//                                       hand-authored descriptive-stats.json)
//
// Run order:
//   npm run prebuild → node scripts/emit-formula-library.mjs && node scripts/build-mindmaps.mjs
// (also safe to run manually: `node scripts/build-mindmaps.mjs`)

import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const LESSON_SRC = resolve(ROOT, 'src/data/lesson-content.ts')
const FORMULA_SRC = resolve(ROOT, 'src/data/formula-library.ts')
const LABELS_SRC = resolve(ROOT, 'src/data/topicLabels.ts')
const PUBLIC_OUT = resolve(ROOT, 'public/mindmaps')
const SRC_OUT = resolve(ROOT, 'src/data/mindmaps')

// Per-branch palette — same indigo/blue family as descriptive-stats.json so the
// per-topic maps feel like siblings of the Phase-1 overview map.
const ROOT_COLOR = '#312e81'        // deep indigo
const SLIDE_COLORS = [
  '#1d4ed8', '#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4',
  '#14b8a6', '#6366f1', '#8b5cf6', '#0891b2', '#0d9488',
]
const FORMULA_BRANCH_COLOR = '#b45309' // amber — visually distinct "נוסחאות" branch
const EQUATION_NODE_COLOR = '#f59e0b'

// Bundle a .ts module in-process and dynamic-import it via a data: URL.
async function loadModule(srcPath) {
  const result = await build({
    entryPoints: [srcPath],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
    target: 'es2020',
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].text
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
  return import(dataUrl)
}

// Trim a slide body to a readable note. Lesson content is already concise
// (1–3 sentences) so we pass it through verbatim; this hook is here in case we
// ever want to cap length.
function noteOf(content) {
  return (content || '').trim()
}

// Build the per-topic tree. root = topic hebrewName; one child branch per slide
// (text = slide.title, note = slide.content); slides carrying a formula get a
// nested equation node; a final "נוסחאות" branch lists every formula whose
// `topics` array includes this topic id.
function buildTopicMap(topic, label, formulasForTopic) {
  const slideBranches = topic.slides.map((slide, i) => {
    const branch = {
      text: slide.title,
      note: noteOf(slide.content),
      color: SLIDE_COLORS[i % SLIDE_COLORS.length],
    }
    if (slide.formula && slide.formula.trim()) {
      branch.children = [
        {
          text: 'נוסחה',
          formula: slide.formula.trim(),
          color: EQUATION_NODE_COLOR,
        },
      ]
    }
    return branch
  })

  const children = [...slideBranches]

  if (formulasForTopic.length) {
    children.push({
      text: 'נוסחאות',
      color: FORMULA_BRANCH_COLOR,
      note: 'אוסף הנוסחאות המרכזיות של הנושא (מתוך ספריית הנוסחאות של WaffleStack).',
      children: formulasForTopic.map(f => ({
        text: f.label,
        formula: f.latex,
        note: f.desc || undefined,
        color: EQUATION_NODE_COLOR,
      })),
    })
  }

  return {
    id: topic.id,
    title: label || topic.hebrewName,
    version: 1,
    root: {
      text: label || topic.hebrewName,
      color: ROOT_COLOR,
      children,
    },
  }
}

async function main() {
  const [lessonMod, formulaMod, labelsMod] = await Promise.all([
    loadModule(LESSON_SRC),
    loadModule(FORMULA_SRC),
    loadModule(LABELS_SRC),
  ])

  const LESSON_CONTENT = lessonMod.LESSON_CONTENT
  const FORMULA_LIBRARY = formulaMod.FORMULA_LIBRARY
  const HEBREW_LABELS = labelsMod.HEBREW_LABELS

  if (!Array.isArray(LESSON_CONTENT)) throw new Error('LESSON_CONTENT missing or not an array')
  if (!Array.isArray(FORMULA_LIBRARY)) throw new Error('FORMULA_LIBRARY missing or not an array')
  if (!HEBREW_LABELS || typeof HEBREW_LABELS !== 'object') throw new Error('HEBREW_LABELS missing')

  // Flatten all formulas with their topic membership.
  const allFormulas = []
  for (const cat of FORMULA_LIBRARY) {
    for (const f of cat.formulas) {
      allFormulas.push({ id: f.id, label: f.label, latex: f.latex, desc: f.desc, topics: f.topics || [] })
    }
  }

  mkdirSync(PUBLIC_OUT, { recursive: true })
  mkdirSync(SRC_OUT, { recursive: true })

  const byId = new Map(LESSON_CONTENT.map(t => [t.id, t]))
  const labelIds = Object.keys(HEBREW_LABELS)

  let written = 0
  const missingLesson = []
  for (const topicId of labelIds) {
    const topic = byId.get(topicId)
    if (!topic) {
      // A label id with no lesson content — skip (and report) rather than emit
      // an empty map. (All 23 current ids DO have lesson content.)
      missingLesson.push(topicId)
      continue
    }
    const formulasForTopic = allFormulas.filter(f => f.topics.includes(topicId))
    const map = buildTopicMap(topic, HEBREW_LABELS[topicId], formulasForTopic)
    const json = JSON.stringify(map, null, 2) + '\n'
    writeFileSync(resolve(PUBLIC_OUT, topicId + '.json'), json, 'utf8')
    writeFileSync(resolve(SRC_OUT, topicId + '.json'), json, 'utf8')
    written++
  }

  // eslint-disable-next-line no-console
  console.log(`[build-mindmaps] wrote ${written} per-topic maps → ${PUBLIC_OUT} (+ src twin)`)
  if (missingLesson.length) {
    // eslint-disable-next-line no-console
    console.warn(`[build-mindmaps] WARNING: no lesson content for: ${missingLesson.join(', ')}`)
  }
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('[build-mindmaps] FAILED:', err)
  process.exit(1)
})
