import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const TASK_BOARD_PATH = "C:\\Users\\BARAK\\My Agents system\\Barak's Vault\\TASK-BOARD.md"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
  base: '/wafflestack-app/',
  server: {
    port: 3000,
    open: true
  }
})
