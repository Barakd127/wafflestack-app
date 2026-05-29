import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const TASK_BOARD_PATH = "C:\\Users\\BARAK\\My Agents system\\Barak's Vault\\TASK-BOARD.md"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // NOTE: a 'force-full-reload' plugin was tried (full reload on every file
    // change) but it caused a RELOAD LOOP — a background process writing files
    // every ~2s made the page reload endlessly, so the hero never stabilized
    // and looked like it was spinning. Reverted 2026-05-29. HMR is normal now;
    // HeroScene self-heals on its own hot-update via import.meta.hot (#90).
    {
      name: 'task-board-api',
      configureServer(server) {
        // GET /api/taskboard — read TASK-BOARD.md
        server.middlewares.use('/api/taskboard', (req, res, next) => {
          if (req.method === 'GET') {
            try {
              const content = fs.readFileSync(TASK_BOARD_PATH, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ content }))
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(e) }))
            }
          } else if (req.method === 'POST') {
            // POST /api/taskboard — append task to Backlog
            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const { task, agent, priority } = JSON.parse(body)
                const content = fs.readFileSync(TASK_BOARD_PATH, 'utf-8')
                const taskLine = `\n- [ ] ${task} #${agent} #${priority}`
                const updated = content.replace('## Backlog', `## Backlog\n${taskLine}`)
                fs.writeFileSync(TASK_BOARD_PATH, updated, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true, task: taskLine }))
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: String(e) }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
  // Vercel hosts at the domain root; GitHub Pages used /wafflestack-app/ so
  // we keep that path active for the legacy deploy via env var override.
  base: process.env.VITE_BASE_PATH ?? '/',
  // Excalidraw 0.18 reads `process.env.IS_PREACT` at module init. Without
  // this define, the lazy chunk crashes with "process is not defined" the
  // moment the user opens the drawing screen — which is why "לוח הציור"
  // appeared blank/never opened.
  define: {
    'process.env.IS_PREACT': JSON.stringify('false'),
  },
  server: {
    port: 3000,
    open: true,
    // Force every dev response to be uncacheable. The Claude Code desktop
    // preview (and other embedded webviews) cache aggressively, so edits
    // didn't show without a manual hard refresh. no-store kills that — the
    // preview always pulls fresh assets. Per user 2026-05-27.
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  }
})
