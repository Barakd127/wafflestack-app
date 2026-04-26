#!/usr/bin/env node
/**
 * scripts/tripo/generate.mjs
 *
 * Generates 3D building models via Tripo AI's text-to-model API and saves
 * them to public/models/tripo/raw/{id}.glb.
 *
 * Usage:
 *   1. Put your API key in .env.local as TRIPO_API_KEY=...
 *   2. npm run tripo:generate           # generate all buildings
 *   3. npm run tripo:generate -- power  # regenerate just one building
 *
 * The script:
 *   - Reads prompts.json
 *   - Skips any building whose GLB already exists (unless --force)
 *   - POSTs the text-to-model task, polls status every 4s, downloads result
 *   - Limits concurrency to 2 parallel generations (Tripo throttles otherwise)
 *
 * If the API endpoint or auth scheme changes, adjust TRIPO_API_BASE and the
 * `taskBody` / `Authorization` header accordingly. As of writing, the Tripo
 * v2 OpenAPI base is `https://api.tripo3d.ai/v2/openapi` with Bearer auth.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT  = resolve(__dirname, '..', '..')
const PROMPTS    = resolve(__dirname, 'prompts.json')
const OUT_DIR    = resolve(REPO_ROOT, 'public', 'models', 'tripo', 'raw')

const TRIPO_API_BASE = process.env.TRIPO_API_BASE || 'https://api.tripo3d.ai/v2/openapi'
const TRIPO_API_KEY  = process.env.TRIPO_API_KEY
const POLL_INTERVAL  = 4000  // ms
const POLL_TIMEOUT   = 8 * 60 * 1000  // 8 min per task
const CONCURRENCY    = 2

// ─── Tiny .env.local loader ──────────────────────────────────────────────────
async function loadEnvLocal() {
  try {
    const raw = await readFile(resolve(REPO_ROOT, '.env.local'), 'utf8')
    raw.split('\n').forEach(line => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  } catch { /* no .env.local — fine */ }
}

// ─── Tripo API calls ─────────────────────────────────────────────────────────
async function createTask(prompt, styleSuffix) {
  const fullPrompt = `${prompt}. ${styleSuffix}`
  const body = {
    type: 'text_to_model',
    prompt: fullPrompt,
    model_version: 'v2.5-20250123',  // bump if a newer model is available
  }
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TRIPO_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`createTask failed ${res.status}: ${txt}`)
  }
  const json = await res.json()
  // Tripo wraps in { code, data: { task_id } } — be lenient
  return json?.data?.task_id ?? json?.task_id ?? json?.id
}

async function pollTask(taskId) {
  const start = Date.now()
  while (Date.now() - start < POLL_TIMEOUT) {
    const res = await fetch(`${TRIPO_API_BASE}/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.TRIPO_API_KEY}` },
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`pollTask failed ${res.status}: ${txt}`)
    }
    const json = await res.json()
    const data = json?.data ?? json
    const status = data?.status
    const progress = data?.progress ?? 0

    if (status === 'success' || status === 'completed') {
      // Tripo uses output.model or output.pbr_model for the GLB URL
      const url = data?.output?.pbr_model ?? data?.output?.model ?? data?.output?.url
      if (!url) throw new Error('Task succeeded but no model URL in response')
      return url
    }
    if (status === 'failed' || status === 'cancelled') {
      throw new Error(`Task ${status}: ${JSON.stringify(data?.error ?? data)}`)
    }

    process.stdout.write(`  [${taskId}] ${status} ${progress}%\r`)
    await new Promise(r => setTimeout(r, POLL_INTERVAL))
  }
  throw new Error(`Task ${taskId} timed out after ${POLL_TIMEOUT / 1000}s`)
}

async function downloadGLB(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(outPath, buf)
  return buf.length
}

// ─── Per-building flow ───────────────────────────────────────────────────────
async function generateBuilding(building, styleSuffix, force = false) {
  const outFile = resolve(OUT_DIR, `${building.id}.glb`)

  if (!force) {
    try { await access(outFile); console.log(`  ✓ ${building.id} — exists, skipping`); return }
    catch { /* not present — generate */ }
  }

  console.log(`  ▸ ${building.id} (${building.concept}) — submitting…`)
  const taskId = await createTask(building.prompt, styleSuffix)
  console.log(`    task=${taskId}`)
  const modelUrl = await pollTask(taskId)
  console.log(`\n    success — downloading…`)
  const bytes = await downloadGLB(modelUrl, outFile)
  console.log(`    saved ${(bytes / 1024 / 1024).toFixed(2)} MB → ${outFile}`)
}

// ─── Concurrency limiter (simple) ────────────────────────────────────────────
async function runWithConcurrency(items, concurrency, worker) {
  const queue = [...items]
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift()
      try { await worker(item) }
      catch (e) { console.error(`  ✗ ${item.id} failed:`, e.message) }
    }
  })
  await Promise.all(runners)
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  await loadEnvLocal()
  if (!process.env.TRIPO_API_KEY) {
    console.error('✗ TRIPO_API_KEY not set. Add it to .env.local or your shell env.')
    process.exit(1)
  }

  await mkdir(OUT_DIR, { recursive: true })
  const config = JSON.parse(await readFile(PROMPTS, 'utf8'))
  const styleSuffix = config._styleSuffix
  let buildings = config.buildings

  // CLI arg: regenerate only specific IDs (and force)
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const ids   = args.filter(a => !a.startsWith('--'))
  if (ids.length) buildings = buildings.filter(b => ids.includes(b.id))

  console.log(`Tripo: generating ${buildings.length} model(s) (concurrency=${CONCURRENCY})`)
  await runWithConcurrency(buildings, CONCURRENCY, b => generateBuilding(b, styleSuffix, force))
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
