/**
 * mindmapWriter — write nodes into the mindmap's localStorage tree from
 * anywhere in the React app, without needing the iframe to be open.
 *
 * The mindmap iframe stores its tree at `mm-data-${userId}`. When the
 * iframe is later opened, it reads the same key and our newly added
 * nodes appear. Since the notebook view reads the same data, content
 * pushed here also shows up in the notebook automatically.
 *
 * If the mindmap iframe IS already open (split mode / mindmap view),
 * prefer postMessage so the canvas re-renders immediately. Callers can
 * pass a contentWindow for that path.
 */

const NODE_COLORS = [
  '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa',
  '#22d3ee', '#fb923c', '#10b981', '#e879f9', '#facc15',
]

interface MMNode {
  id: string
  type: string
  text: string
  x: number
  y: number
  color: string
  parentId: string | null
  childIds: string[]
  collapsed: boolean
  W: number
  H: number
  body?: string
  latex?: string
}

interface MMData {
  nodes: Record<string, MMNode>
  root: string
  sel: string | null
  multiSel: string[]
  zoom: number
  panX: number
  panY: number
  searchMatches: string[]
  searchIdx: number
}

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
}

function loadMM(userId: string): MMData {
  const key = 'mm-data-' + userId
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as MMData
      if (parsed && parsed.nodes && parsed.root) return parsed
    }
  } catch { /* fall through */ }
  // Fresh tree
  const rootId = 'root'
  const fresh: MMData = {
    nodes: {
      [rootId]: {
        id: rootId, type: 'root', text: 'Untitled',
        x: 100, y: 100, color: '#60a5fa',
        parentId: null, childIds: [], collapsed: false, W: 140, H: 40,
      },
    },
    root: rootId,
    sel: null, multiSel: [], zoom: 1, panX: 0, panY: 0,
    searchMatches: [], searchIdx: 0,
  }
  return fresh
}

function saveMM(userId: string, data: MMData): void {
  try { localStorage.setItem('mm-data-' + userId, JSON.stringify(data)) } catch { /* quota */ }
}

function pickColor(parent: MMNode | undefined, data: MMData): string {
  const used = new Set((parent?.childIds || []).map(id => data.nodes[id]?.color).filter(Boolean))
  for (const c of NODE_COLORS) if (c !== parent?.color && !used.has(c)) return c
  return NODE_COLORS[(parent?.childIds.length ?? 0) % NODE_COLORS.length]
}

function nextChildY(parent: MMNode, data: MMData): number {
  if (!parent.childIds.length) return parent.y
  let bottom = -Infinity
  for (const id of parent.childIds) {
    const c = data.nodes[id]
    if (c) bottom = Math.max(bottom, c.y + (c.H || 40))
  }
  return bottom + 32
}

export interface QuickAddOptions {
  text: string
  body?: string
  /** When provided, prefer postMessage to this iframe (instant canvas update). */
  iframeWindow?: Window | null
  /** User id used in the mm-data-${userId} key. Defaults to 'default'. */
  userId?: string
  /** Latex string — when present, the node is created as an equation node. */
  latex?: string
}

/**
 * Add a new node under root in the mindmap. If `iframeWindow` is supplied
 * AND its document is reachable, posts a `ws-add-node` message so the
 * canvas updates live. Otherwise writes straight to localStorage so the
 * mindmap shows the node next time it opens.
 */
export function quickAddToMindmap(opts: QuickAddOptions): boolean {
  const userId = opts.userId || 'default'
  // Live path: iframe is open → postMessage (matches existing 'ws-add-node' protocol)
  if (opts.iframeWindow) {
    try {
      const payload = opts.latex
        ? { type: 'ws-add-node', kind: 'equation', latex: opts.latex, text: opts.text, connectMode: 'connected' }
        : { type: 'ws-add-node', kind: 'text', text: opts.text, connectMode: 'connected' }
      opts.iframeWindow.postMessage(payload, '*')
      // Note: postMessage doesn't carry `body`, so for now body-only writes
      // still go through the localStorage path even if iframe is open.
      if (!opts.body) return true
    } catch { /* fall through to direct write */ }
  }

  const data = loadMM(userId)
  const root = data.nodes[data.root]
  if (!root) return false
  const baseY = nextChildY(root, data)
  const newId = uid()
  const node: MMNode = {
    id: newId,
    type: opts.latex ? 'equation' : 'branch',
    text: opts.text,
    x: root.x + 230,
    y: baseY,
    color: pickColor(root, data),
    parentId: data.root,
    childIds: [],
    collapsed: false,
    W: 140,
    H: 40,
    body: opts.body || '',
  }
  if (opts.latex) node.latex = opts.latex
  data.nodes[newId] = node
  root.childIds.push(newId)
  saveMM(userId, data)
  return true
}
