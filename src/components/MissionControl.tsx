import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Task {
  done: boolean
  text: string
  agent: string
  priority: string
}

interface Board {
  backlog: Task[]
  inProgress: Task[]
  done: Task[]
  blocked: Task[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const VISION = {
  headline: 'Help every social-sciences student understand statistics — by building a city.',
  subline: 'WaffleStack turns dry stat concepts into a living 3D city. B.A students manage buildings that break when they answer wrong and grow when they get it right.',
}

const PRODUCTS = [
  {
    id: 'city',
    icon: '🏙️',
    name: 'WaffleStack City',
    status: 'live-local',
    statusLabel: 'Running locally',
    desc: '3D city with 10 buildings, each = a stats concept. Kenney suburban assets. Click a building to start a quiz challenge.',
    link: null,
    color: '#4ECDC4',
  },
  {
    id: 'web',
    icon: '🌐',
    name: 'GitHub Pages Deploy',
    status: 'deploying',
    statusLabel: 'Deploying now…',
    desc: 'Vite + React app auto-deployed on every push to master via GitHub Actions.',
    link: 'https://barakd127.github.io/wafflestack-app/',
    color: '#FFD700',
  },
  {
    id: 'landing',
    icon: '📄',
    name: 'Landing Page',
    status: 'local',
    statusLabel: 'Local only',
    desc: 'Dark marketing page with 4-module showcase, Figma-accurate mockup, waitlist form (needs Loops.so ID).',
    link: null,
    color: '#AA96DA',
  },
  {
    id: 'quiz',
    icon: '📊',
    name: 'Quiz Bank',
    status: 'planned',
    statusLabel: 'Planned',
    desc: '50 questions across 10 stats topics, tailored for Israeli B.A social-sciences curriculum.',
    link: null,
    color: '#F38181',
  },
]

const AGENTS = [
  {
    id: 'researcher',
    icon: '🔬',
    name: 'Researcher',
    model: 'Sonnet',
    trigger: '#researcher',
    desc: 'Web research, academic papers, competitor analysis, wiki building.',
    color: '#95E1D3',
    active: true,
  },
  {
    id: 'developer',
    icon: '💻',
    name: 'Developer',
    model: 'Sonnet',
    trigger: '#developer',
    desc: 'Code, scripts, integrations, patches. Handles Azure GPT-5.3 orchestrator.',
    color: '#4ECDC4',
    active: true,
  },
  {
    id: 'analyst',
    icon: '📈',
    name: 'Analyst',
    model: 'Sonnet',
    trigger: '#analyst',
    desc: 'Data analysis, PRDs, acceptance criteria, user stories.',
    color: '#FFD700',
    active: true,
  },
  {
    id: 'writer',
    icon: '✍️',
    name: 'Writer',
    model: 'Haiku',
    trigger: '#writer',
    desc: 'Copy, lesson content, Hebrew UI text, onboarding flows.',
    color: '#FCBAD3',
    active: true,
  },
  {
    id: 'monitor',
    icon: '👁️',
    name: 'Monitor',
    model: 'Haiku',
    trigger: '#monitor',
    desc: 'Health checks, status reports, error detection.',
    color: '#F38181',
    active: true,
  },
  {
    id: 'proactive-dev',
    icon: '⚡',
    name: 'Proactive Developer',
    model: 'Sonnet',
    trigger: 'auto',
    desc: 'Runs every 30min. Scans codebase for TODO/FIXME, auto-suggests fixes.',
    color: '#C3A6FF',
    active: false,
    note: 'Needs manual setup on second laptop',
  },
  {
    id: 'daily-briefer',
    icon: '☀️',
    name: 'Daily Briefer',
    model: 'Haiku',
    trigger: 'auto 8am',
    desc: 'Every morning: summarises overnight agent activity + surfaces top 3 priorities.',
    color: '#FFB347',
    active: false,
    note: 'Needs manual setup on second laptop',
  },
  {
    id: 'scout',
    icon: '🗺️',
    name: 'Scout',
    model: 'Haiku',
    trigger: 'auto 2×/day',
    desc: 'Searches for EdTech news, stats education research, competitor updates. Saves to AI/Raw/scout/.',
    color: '#A8E6CF',
    active: false,
    note: 'Needs manual setup on second laptop',
  },
  {
    id: 'wiki-gardener',
    icon: '🌱',
    name: 'Wiki Gardener',
    model: 'Sonnet',
    trigger: 'auto nightly',
    desc: 'Processes AI/Raw/ → synthesises into AI/Wiki/ knowledge base.',
    color: '#7ec850',
    active: false,
    note: 'Needs manual setup on second laptop',
  },
]

const AGENT_IDS = ['researcher', 'developer', 'analyst', 'writer', 'monitor']
const PRIORITIES = ['quick', 'normal', 'urgent']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseBoard(md: string): Board {
  const sections: Record<string, Task[]> = { backlog: [], inProgress: [], done: [], blocked: [] }
  let current = ''
  for (const line of md.split('\n')) {
    if (line.startsWith('## Backlog')) current = 'backlog'
    else if (line.startsWith('## In Progress')) current = 'inProgress'
    else if (line.startsWith('## Done')) current = 'done'
    else if (line.startsWith('## Blocked')) current = 'blocked'
    else if (current && line.match(/^- \[[ x]\]/)) {
      const done = line.startsWith('- [x]')
      const text = line.replace(/^- \[[ x]\] /, '').trim()
      const agentMatch = text.match(/#(researcher|developer|analyst|writer|monitor)/)
      const priorityMatch = text.match(/#(quick|normal|urgent)/)
      sections[current].push({
        done,
        text: text.replace(/#\w+/g, '').trim(),
        agent: agentMatch?.[1] ?? '',
        priority: priorityMatch?.[1] ?? '',
      })
    }
  }
  return sections as Board
}

function statusColor(s: string) {
  if (s === 'live-local') return '#4ECDC4'
  if (s === 'deploying') return '#FFD700'
  if (s === 'local') return '#AA96DA'
  return '#666'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function VisionBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a3e 0%, #0d2137 50%, #1a1a3e 100%)',
      border: '1px solid rgba(78,205,196,0.3)',
      borderRadius: 16, padding: '28px 36px', marginBottom: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(78,205,196,0.15) 0%, transparent 70%)',
      }} />
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#4ECDC4', marginBottom: 10, fontWeight: 600 }}>
        MISSION
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.4, maxWidth: 700 }}>
        {VISION.headline}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 10, maxWidth: 600, lineHeight: 1.6 }}>
        {VISION.subline}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
        {['B.A Social Sciences 🎓', 'Israel 🇮🇱', 'Web First 🌐', 'Stats Made Tangible 📊'].map(tag => (
          <span key={tag} style={{
            background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.3)',
            borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#4ECDC4',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

function ProductCard({ p }: { p: typeof PRODUCTS[0] }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${p.color}33`,
      borderRadius: 12, padding: '18px 20px', flex: '1 1 200px', minWidth: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>{p.icon}</span>
        <div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: statusColor(p.status), fontWeight: 600, marginTop: 2 }}>
            ● {p.statusLabel}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{p.desc}</div>
      {p.link && (
        <a href={p.link} target="_blank" rel="noreferrer" style={{
          display: 'inline-block', marginTop: 12, fontSize: 12, color: p.color,
          textDecoration: 'none', border: `1px solid ${p.color}44`,
          borderRadius: 6, padding: '4px 10px',
        }}>Open →</a>
      )}
    </div>
  )
}

function AgentCard({ a }: { a: typeof AGENTS[0] }) {
  return (
    <div style={{
      background: a.active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${a.color}${a.active ? '44' : '22'}`,
      borderRadius: 10, padding: '14px 16px',
      opacity: a.active ? 1 : 0.65,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>{a.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{a.model} · {a.trigger}</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
          background: a.active ? '#4ECDC422' : '#66666622',
          color: a.active ? '#4ECDC4' : '#888',
          letterSpacing: 1,
        }}>
          {a.active ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.5 }}>
        {a.desc}
      </div>
      {a.note && (
        <div style={{ fontSize: 11, color: '#FFB347', marginTop: 6 }}>⚠️ {a.note}</div>
      )}
    </div>
  )
}

function TaskItem({ task, section }: { task: Task, section: string }) {
  const colors: Record<string, string> = {
    backlog: '#888', inProgress: '#FFD700', done: '#4ECDC4', blocked: '#F38181'
  }
  const agentColors: Record<string, string> = {
    researcher: '#95E1D3', developer: '#4ECDC4', analyst: '#FFD700',
    writer: '#FCBAD3', monitor: '#F38181'
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px',
      borderLeft: `3px solid ${colors[section]}`,
      opacity: task.done ? 0.5 : 1,
    }}>
      <div style={{ fontSize: 13, color: task.done ? '#888' : '#ddd', lineHeight: 1.4 }}>
        {task.done ? '✓ ' : ''}{task.text}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {task.agent && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 8,
            background: `${agentColors[task.agent] ?? '#888'}22`,
            color: agentColors[task.agent] ?? '#888', fontWeight: 600,
          }}>#{task.agent}</span>
        )}
        {task.priority && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 8,
            background: 'rgba(255,255,255,0.07)', color: '#aaa',
          }}>#{task.priority}</span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MissionControl({ onViewChange }: { onViewChange: (v: string) => void }) {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState('')
  const [agent, setAgent] = useState('developer')
  const [priority, setPriority] = useState('normal')
  const [dispatched, setDispatched] = useState<string | null>(null)
  const [tab, setTab] = useState<'products' | 'agents' | 'taskboard'>('products')

  const loadBoard = useCallback(async () => {
    try {
      const r = await fetch('/api/taskboard')
      if (r.ok) {
        const { content } = await r.json()
        setBoard(parseBoard(content))
      }
    } catch { /* dev only */ }
    setLoading(false)
  }, [])

  useEffect(() => { loadBoard() }, [loadBoard])

  const dispatch = async () => {
    if (!mission.trim()) return
    try {
      const r = await fetch('/api/taskboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: mission, agent, priority }),
      })
      if (r.ok) {
        setDispatched(mission)
        setMission('')
        setTimeout(() => { setDispatched(null); loadBoard() }, 3000)
      }
    } catch {
      setDispatched('⚠️ API only available in dev mode (npm run dev)')
      setTimeout(() => setDispatched(null), 4000)
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', overflowY: 'auto',
      background: 'linear-gradient(180deg, #0a0a14 0%, #0d1220 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff', padding: '24px 28px', boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#4ECDC4', fontWeight: 600 }}>WAFFLESTACK</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Mission Control</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onViewChange('wafflecity')} style={{
            background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)',
            borderRadius: 8, padding: '8px 16px', color: '#4ECDC4', cursor: 'pointer', fontSize: 13,
          }}>🏙️ Open City</button>
          <button onClick={() => onViewChange('townscaper')} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '8px 16px', color: '#aaa', cursor: 'pointer', fontSize: 13,
          }}>🏘️ Townscaper</button>
        </div>
      </div>

      {/* Vision */}
      <VisionBanner />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['products', 'agents', 'taskboard'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.04)',
            border: tab === t ? '1px solid rgba(78,205,196,0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '8px 20px', color: tab === t ? '#4ECDC4' : '#888',
            cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400,
            textTransform: 'capitalize',
          }}>
            {t === 'products' ? '📦 Products' : t === 'agents' ? '🤖 Agents' : '📋 Task Board'}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {PRODUCTS.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {/* Agents Tab */}
      {tab === 'agents' && (
        <div>
          <div style={{ fontSize: 12, color: '#4ECDC4', marginBottom: 12, letterSpacing: 1 }}>
            ORCHESTRATED AGENTS · reads TASK-BOARD.md every 10 min
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {AGENTS.map(a => <AgentCard key={a.id} a={a} />)}
          </div>
          <div style={{
            marginTop: 20, padding: '14px 18px', background: 'rgba(255,179,71,0.08)',
            border: '1px solid rgba(255,179,71,0.25)', borderRadius: 10, fontSize: 13, color: '#FFB347',
          }}>
            <strong>To activate the 4 proactive agents:</strong> Open Claude Code directly on your second laptop and paste:<br />
            <code style={{ display: 'block', marginTop: 8, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6, fontSize: 12, color: '#fff' }}>
              Read 00-System/SETUP-PROACTIVE-AGENTS.md and create the 4 scheduled tasks as specified
            </code>
          </div>
        </div>
      )}

      {/* Task Board Tab */}
      {tab === 'taskboard' && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

          {/* Dispatch Form */}
          <div style={{
            flex: '0 0 300px', background: 'rgba(78,205,196,0.06)',
            border: '1px solid rgba(78,205,196,0.2)', borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4ECDC4', marginBottom: 16 }}>
              🚀 Dispatch Mission
            </div>
            <textarea
              value={mission}
              onChange={e => setMission(e.target.value)}
              placeholder="Describe the mission..."
              rows={4}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                color: '#fff', padding: 10, fontSize: 13, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <select value={agent} onChange={e => setAgent(e.target.value)} style={{
                flex: 1, background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', borderRadius: 6, padding: '6px 8px', fontSize: 12,
              }}>
                {AGENT_IDS.map(a => <option key={a} value={a}>#{a}</option>)}
              </select>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{
                flex: 1, background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', borderRadius: 6, padding: '6px 8px', fontSize: 12,
              }}>
                {PRIORITIES.map(p => <option key={p} value={p}>#{p}</option>)}
              </select>
            </div>
            <button onClick={dispatch} style={{
              marginTop: 12, width: '100%', padding: '10px',
              background: '#4ECDC4', border: 'none', borderRadius: 8,
              color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              Deploy to Backlog →
            </button>
            {dispatched && (
              <div style={{
                marginTop: 10, padding: '8px 12px', background: '#4ECDC422',
                border: '1px solid #4ECDC444', borderRadius: 6,
                fontSize: 12, color: '#4ECDC4',
              }}>
                ✓ Mission dispatched: "{dispatched}"
              </div>
            )}
          </div>

          {/* Board columns */}
          {loading ? (
            <div style={{ color: '#888', padding: 20 }}>Loading task board…</div>
          ) : board ? (
            <div style={{ flex: 1, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {([
                ['backlog', '📥 Backlog', board.backlog],
                ['inProgress', '⚡ In Progress', board.inProgress],
                ['blocked', '🔒 Blocked', board.blocked],
              ] as const).map(([key, label, tasks]) => (
                <div key={key} style={{ flex: '1 1 200px', minWidth: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10, letterSpacing: 1 }}>
                    {label} ({tasks.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tasks.length === 0
                      ? <div style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>Empty</div>
                      : tasks.map((t, i) => <TaskItem key={i} task={t} section={key} />)
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#888', padding: 20 }}>
              Task board available in dev mode only (npm run dev)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
