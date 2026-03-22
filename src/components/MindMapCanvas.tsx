import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  createContext,
  useMemo,
} from 'react'
import ReactFlow, {
  Node as FlowNode,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { X, Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type TagType = 'important' | 'exam' | 'review' | 'question' | 'done'
type NodeLevel = 'root' | 'mid' | 'leaf'

interface NodeData {
  label: string
  nodeLevel: NodeLevel
  tag?: TagType | null
  note?: string
}

interface MindMapContextValue {
  darkMode: boolean
  onTagChange: (id: string, tag: TagType | null) => void
  onNoteChange: (id: string, note: string) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_CONFIG: Record<TagType, { label: string; color: string }> = {
  important: { label: 'חשוב', color: '#ef4444' },
  exam:      { label: 'מבחן', color: '#8b5cf6' },
  review:    { label: 'חזרה', color: '#f97316' },
  question:  { label: 'שאלה', color: '#3b82f6' },
  done:      { label: 'הושלם', color: '#10b981' },
}

const NODE_STYLES: Record<NodeLevel, { light: React.CSSProperties; dark: React.CSSProperties }> = {
  root: {
    light: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '20px',
      padding: '20px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 8px 32px rgba(102,126,234,0.35)',
      minWidth: 120,
      textAlign: 'center',
    },
    dark: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '20px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 8px 32px rgba(102,126,234,0.55)',
      minWidth: 120,
      textAlign: 'center',
    },
  },
  mid: {
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #667eea',
      borderRadius: '16px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      minWidth: 100,
      textAlign: 'center',
    },
    dark: {
      background: 'rgba(30, 30, 60, 0.92)',
      border: '2px solid rgba(102,126,234,0.6)',
      borderRadius: '16px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#e2e8f0',
      boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
      minWidth: 100,
      textAlign: 'center',
    },
  },
  leaf: {
    light: {
      background: 'rgba(236, 253, 245, 0.95)',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '14px',
      color: '#1f2937',
      boxShadow: '0 2px 8px rgba(16,185,129,0.2)',
      minWidth: 80,
      textAlign: 'center',
    },
    dark: {
      background: 'rgba(15, 40, 30, 0.92)',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '14px',
      color: '#d1fae5',
      boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
      minWidth: 80,
      textAlign: 'center',
    },
  },
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MindMapCtx = createContext<MindMapContextValue>({
  darkMode: false,
  onTagChange: () => {},
  onNoteChange: () => {},
})

// ─── Custom Node Component ────────────────────────────────────────────────────

function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const { darkMode, onTagChange, onNoteChange } = useContext(MindMapCtx)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(data.note ?? '')
  const [isHovered, setIsHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Sync note text when data.note changes externally
  useEffect(() => {
    setNoteText(data.note ?? '')
  }, [data.note])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) return
      setContextMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [contextMenu])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = nodeRef.current!.getBoundingClientRect()
    setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleTagSelect = (tag: TagType | null) => {
    onTagChange(id, tag)
    setContextMenu(null)
  }

  const handleNoteBlur = () => {
    onNoteChange(id, noteText)
  }

  const nodeStyle = NODE_STYLES[data.nodeLevel][darkMode ? 'dark' : 'light']
  const hasNote = !!data.note

  // Panel theming
  const panelBg     = darkMode ? 'rgba(20, 20, 42, 0.97)' : 'rgba(255,255,255,0.97)'
  const panelBorder = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const textPrimary = darkMode ? '#e2e8f0' : '#1a202c'
  const textMuted   = darkMode ? '#94a3b8' : '#6b7280'

  const handleHoverStyle = (el: HTMLElement, enter: boolean) => {
    el.style.background = enter
      ? (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
      : 'transparent'
  }

  return (
    <div
      ref={nodeRef}
      className="relative"
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ width: 8, height: 8, background: '#667eea', border: 'none', opacity: 0.5 }}
      />

      {/* ── Tag pill ── */}
      {data.tag && (
        <div
          style={{ background: TAG_CONFIG[data.tag].color }}
          className="absolute -top-3 -right-1 px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold z-10 pointer-events-none whitespace-nowrap select-none"
        >
          {TAG_CONFIG[data.tag].label}
        </div>
      )}

      {/* ── Node body ── */}
      <div style={nodeStyle}>{data.label}</div>

      {/* ── Note indicator ── */}
      {(hasNote || isHovered) && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setShowNote(v => !v) }}
          className="absolute -bottom-3 -right-1 z-10 leading-none text-base transition-opacity"
          style={{ opacity: hasNote ? 1 : 0.35 }}
          title={hasNote ? 'View / edit note' : 'Add note'}
        >
          {hasNote ? '📝' : '·'}
        </button>
      )}

      {/* ── Note popover ── */}
      {showNote && (
        <div
          className="absolute z-50 left-full ml-3 top-0 w-64"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-xl shadow-2xl p-3 flex flex-col gap-2"
            style={{
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: textMuted }}>הערה</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowNote(false) }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs hover:bg-black/10"
                style={{ color: textMuted }}
              >
                ✕
              </button>
            </div>
            <textarea
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleNoteBlur}
              dir="auto"
              placeholder="הוסף הערה... (תומך Markdown)"
              rows={4}
              className="w-full resize-none rounded-lg p-2 text-sm outline-none"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${panelBorder}`,
                color: textPrimary,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="absolute z-50 rounded-xl shadow-2xl overflow-hidden"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: 160,
            background: panelBg,
            border: `1px solid ${panelBorder}`,
            backdropFilter: 'blur(20px)',
          }}
          onMouseDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation() }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            <div
              className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: textMuted }}
            >
              הגדר תגית
            </div>
            {(Object.keys(TAG_CONFIG) as TagType[]).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className="w-full px-3 py-1.5 flex items-center gap-2.5 text-sm rounded-lg text-left transition-colors"
                style={{ color: textPrimary, background: 'transparent' }}
                onMouseEnter={(e) => handleHoverStyle(e.currentTarget, true)}
                onMouseLeave={(e) => handleHoverStyle(e.currentTarget, false)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block"
                  style={{ background: TAG_CONFIG[tag].color }}
                />
                <span className="flex-1 text-right">{TAG_CONFIG[tag].label}</span>
                {data.tag === tag && (
                  <span className="text-[10px]" style={{ color: textMuted }}>✓</span>
                )}
              </button>
            ))}
            {data.tag && (
              <>
                <div className="my-1 mx-3 border-t" style={{ borderColor: panelBorder }} />
                <button
                  onClick={() => handleTagSelect(null)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg text-right transition-colors"
                  style={{ color: textMuted, background: 'transparent' }}
                  onMouseEnter={(e) => handleHoverStyle(e.currentTarget, true)}
                  onMouseLeave={(e) => handleHoverStyle(e.currentTarget, false)}
                >
                  הסר תגית
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 8, height: 8, background: '#667eea', border: 'none', opacity: 0.5 }}
      />
    </div>
  )
}

// ─── NodeTypes (stable reference — defined outside component) ─────────────────

const nodeTypes: NodeTypes = { mindmap: MindMapNode }

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialNodes: FlowNode<NodeData>[] = [
  {
    id: '1',
    type: 'mindmap',
    data: { label: 'מתמטיקה', nodeLevel: 'root' },
    position: { x: 400, y: 200 },
  },
  {
    id: '2',
    type: 'mindmap',
    data: { label: 'סטטיסטיקה', nodeLevel: 'mid' },
    position: { x: 200, y: 350 },
  },
  {
    id: '3',
    type: 'mindmap',
    data: { label: 'גיאומטריה', nodeLevel: 'mid' },
    position: { x: 400, y: 350 },
  },
  {
    id: '4',
    type: 'mindmap',
    data: { label: 'אלגברה', nodeLevel: 'mid' },
    position: { x: 600, y: 350 },
  },
  {
    id: '5',
    type: 'mindmap',
    data: { label: 'ממוצע', nodeLevel: 'leaf' },
    position: { x: 100, y: 500 },
  },
  {
    id: '6',
    type: 'mindmap',
    data: { label: 'חציון', nodeLevel: 'leaf' },
    position: { x: 250, y: 500 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e2-5', source: '2', target: '5', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e2-6', source: '2', target: '6', style: { stroke: '#10b981', strokeWidth: 2 } },
]

// ─── Main Component ───────────────────────────────────────────────────────────

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode: boolean
}

const MindMapCanvas = ({ onViewChange, darkMode }: MindMapCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  // Track right-click start position for drag-vs-click distinction
  const rightClickStart = useRef<{ x: number; y: number } | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleTagChange = useCallback((nodeId: string, tag: TagType | null) => {
    setNodes(nds =>
      nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, tag } } : n)
    )
  }, [setNodes])

  const handleNoteChange = useCallback((nodeId: string, note: string) => {
    setNodes(nds =>
      nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, note } } : n)
    )
  }, [setNodes])

  const ctxValue = useMemo<MindMapContextValue>(
    () => ({ darkMode, onTagChange: handleTagChange, onNoteChange: handleNoteChange }),
    [darkMode, handleTagChange, handleNoteChange]
  )

  // Suppress browser context menu only when right-click was a drag (> 5px)
  const handlePaneContextMenu = useCallback((e: React.MouseEvent) => {
    if (rightClickStart.current) {
      const dist = Math.hypot(
        e.clientX - rightClickStart.current.x,
        e.clientY - rightClickStart.current.y
      )
      if (dist > 5) e.preventDefault()
      rightClickStart.current = null
    }
  }, [])

  // Theming helpers
  const panelBg     = darkMode ? 'var(--mm-glass-bg)' : 'var(--mm-glass-bg)'
  const panelBorder = darkMode ? 'var(--mm-glass-border)' : 'var(--mm-glass-border)'
  const textPrimary = 'var(--mm-text-primary)'
  const textMuted   = 'var(--mm-text-secondary)'
  const divider     = 'var(--mm-divider)'

  const btnHover = (el: HTMLElement, enter: boolean) => {
    el.style.background = enter
      ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')
      : 'transparent'
  }

  return (
    <MindMapCtx.Provider value={ctxValue}>
      <div className="w-full h-full relative">

        {/* ── Top Bar ── */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div
            className="backdrop-blur-2xl rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-4"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <button
              onClick={() => onViewChange('study')}
              className="p-2 rounded-lg transition-all"
              style={{ color: textPrimary }}
              onMouseEnter={(e) => btnHover(e.currentTarget, true)}
              onMouseLeave={(e) => btnHover(e.currentTarget, false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
              מפת מושגים - מתמטיקה
            </h2>
          </div>
        </div>

        {/* ── Side Panel (open) ── */}
        {isPanelOpen && (
          <div className="absolute left-6 top-24 bottom-6 w-80 z-10 pointer-events-auto">
            <div
              className="h-full backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
              dir="rtl"
            >
              {/* Panel header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${divider}` }}
              >
                <h3 className="text-lg font-bold" style={{ color: textPrimary }}>פאנל עריכה</h3>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: textPrimary }}
                  onMouseEnter={(e) => btnHover(e.currentTarget, true)}
                  onMouseLeave={(e) => btnHover(e.currentTarget, false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-4">
                {/* Add node */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: textMuted }}>הוסף מושג חדש</h4>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2">
                    <Plus size={18} />
                    הוסף נושא
                  </button>
                </div>

                {/* Color palette */}
                <div className="pt-4" style={{ borderTop: `1px solid ${divider}` }}>
                  <h4 className="font-semibold mb-3" style={{ color: textMuted }}>צבעים מומלצים</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b', '#ee5a6f'].map(color => (
                      <button
                        key={color}
                        className="w-full h-10 rounded-lg border-2 border-white shadow-md transition-transform hover:scale-110"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="pt-4" style={{ borderTop: `1px solid ${divider}` }}>
                  <h4 className="font-semibold mb-2" style={{ color: textMuted }}>טיפים</h4>
                  <div className="text-sm space-y-2" style={{ color: textMuted }}>
                    <p>• גרור מושגים כדי לארגן</p>
                    <p>• לחץ ימני על מושג לתגיות</p>
                    <p>• גרור ימני לגלילת הבד</p>
                    <p>• לחץ 📝 להוספת הערה</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Side Panel (closed) ── */}
        {!isPanelOpen && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute left-6 top-24 z-10 p-3 backdrop-blur-xl rounded-xl shadow-xl hover:scale-105 transition-all"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <Plus size={20} style={{ color: textPrimary }} />
          </button>
        )}

        {/* ── React Flow Canvas ── */}
        <div
          className="w-full h-full"
          dir="ltr"
          onMouseDown={(e) => {
            if (e.button === 2) rightClickStart.current = { x: e.clientX, y: e.clientY }
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={[2]}
            style={{
              background: `linear-gradient(135deg, var(--mm-canvas-bg-start) 0%, var(--mm-canvas-bg-end) 100%)`,
            }}
            onPaneContextMenu={handlePaneContextMenu}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            />
            <Controls
              style={{
                background: panelBg,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${panelBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            />
            <MiniMap
              style={{
                background: panelBg,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${panelBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              nodeColor={(node) => {
                const d = node.data as NodeData
                if (d.nodeLevel === 'root') return '#667eea'
                if (d.nodeLevel === 'mid')  return '#a78bfa'
                return '#10b981'
              }}
            />
          </ReactFlow>
        </div>
      </div>
    </MindMapCtx.Provider>
  )
}

export default MindMapCanvas
