import React, { useState } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG = 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)'

const ACCENT: Record<string, string> = {
  'ממוצע':            '#FFD700',
  'חציון':            '#4ECDC4',
  'שכיח':             '#AA96DA',
  'טווח':             '#FF6B6B',
  'סטיית תקן':        '#FF6B6B',
  'התפלגות נורמלית':  '#95E1D3',
  'מדגם':             '#AA96DA',
  'קורלציה':          '#A8E6CF',
  'רגרסיה':           '#FCBAD3',
  'מבחן השערות':      '#C3A6FF',
}

// ── Flow layout: 4 columns (stages), left → right = learning progression ───────
// Column 0 (x≈70):  foundations — ממוצע, חציון, שכיח, טווח
// Column 1 (x≈240): spread — סטיית תקן
// Column 2 (x≈420): distribution/correlation — התפלגות נורמלית, קורלציה, מדגם
// Column 3 (x≈600): inference — רגרסיה, מבחן השערות

interface NodeDef {
  id: string
  label: string
  x: number
  y: number
  stage: number   // 0-3 for column color hint
}

const NODES: NodeDef[] = [
  // stage 0 — foundations
  { id: 'ממוצע',           label: 'ממוצע',           x: 70,  y: 110, stage: 0 },
  { id: 'חציון',           label: 'חציון',           x: 70,  y: 210, stage: 0 },
  { id: 'שכיח',            label: 'שכיח',            x: 70,  y: 310, stage: 0 },
  { id: 'טווח',            label: 'טווח',            x: 70,  y: 410, stage: 0 },
  // stage 1 — spread
  { id: 'סטיית תקן',       label: 'סטיית תקן',       x: 250, y: 155, stage: 1 },
  // stage 2 — distribution + sample
  { id: 'התפלגות נורמלית', label: 'התפלגות נורמלית', x: 430, y: 100, stage: 2 },
  { id: 'קורלציה',         label: 'קורלציה',         x: 430, y: 300, stage: 2 },
  { id: 'מדגם',            label: 'מדגם',            x: 430, y: 420, stage: 2 },
  // stage 3 — inference
  { id: 'מבחן השערות',     label: 'מבחן השערות',     x: 620, y: 230, stage: 3 },
  { id: 'רגרסיה',          label: 'רגרסיה',          x: 620, y: 380, stage: 3 },
]

const STAGE_LABELS = ['יסודות', 'פיזור', 'התפלגות', 'הסקה סטטיסטית']
const STAGE_X = [70, 250, 430, 620]
const STAGE_COLOR = ['rgba(255,215,0,0.07)', 'rgba(255,107,107,0.07)', 'rgba(149,225,211,0.07)', 'rgba(195,166,255,0.07)']

interface EdgeDef {
  from: string
  to: string
  label?: string
  bidirectional?: boolean
}

const EDGES: EdgeDef[] = [
  { from: 'ממוצע',           to: 'סטיית תקן',       label: 'מחשבים' },
  { from: 'טווח',            to: 'סטיית תקן',        label: 'פיזור' },
  { from: 'ממוצע',           to: 'חציון',            bidirectional: true },
  { from: 'חציון',           to: 'שכיח',             bidirectional: true },
  { from: 'סטיית תקן',       to: 'התפלגות נורמלית', label: 'מעצב' },
  { from: 'קורלציה',         to: 'רגרסיה',           label: 'מניע' },
  { from: 'מדגם',            to: 'מבחן השערות',      label: 'מאפשר' },
  { from: 'התפלגות נורמלית', to: 'מבחן השערות',      label: 'בסיס' },
]

function nodeById(id: string) { return NODES.find(n => n.id === id)! }

function neighbors(nodeId: string): Set<string> {
  const set = new Set<string>()
  EDGES.forEach(e => {
    if (e.from === nodeId) set.add(e.to)
    if (e.to === nodeId) set.add(e.from)
  })
  return set
}

// Straight line between pills, with slight bend offset for parallel edges
function edgePath(from: NodeDef, to: NodeDef, bendFactor = 0): string {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 + bendFactor
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}

// ── Component ──────────────────────────────────────────────────────────────────
const ConceptMapFlow: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null)

  const activeNeighbors = hovered ? neighbors(hovered) : new Set<string>()

  const nodeOpacity = (id: string) => {
    if (!hovered) return 1
    if (id === hovered) return 1
    if (activeNeighbors.has(id)) return 0.85
    return 0.15
  }

  const edgeOpacity = (e: EdgeDef) => {
    if (!hovered) return 0.5
    if (e.from === hovered || e.to === hovered) return 1
    return 0.05
  }

  const edgeColor = (e: EdgeDef) => {
    if (!hovered) return 'rgba(255,255,255,0.25)'
    if (e.from === hovered) return ACCENT[e.from]
    if (e.to === hovered) return ACCENT[e.to]
    return 'rgba(255,255,255,0.07)'
  }

  // Pill dimensions
  const PW = 96
  const PH = 36

  return (
    <div
      style={{
        width: 700,
        height: 520,
        background: BG,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Heebo', 'Arial', sans-serif",
        direction: 'rtl',
        boxShadow: '0 0 80px rgba(95,75,255,0.18)',
      }}
    >
      <svg width="700" height="520" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.55)" />
          </marker>
          <marker id="flow-arrow-accent" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="white" />
          </marker>
          <filter id="pill-glow" x="-25%" y="-50%" width="150%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Gradient dividers between stages */}
          <linearGradient id="div-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        {/* Stage background bands */}
        {STAGE_X.map((sx, i) => (
          <rect
            key={i}
            x={sx - 70}
            y={60}
            width={140}
            height={420}
            rx={14}
            fill={STAGE_COLOR[i]}
          />
        ))}

        {/* Stage dividers (vertical lines between columns) */}
        {[160, 340, 520].map((lx, i) => (
          <line
            key={i}
            x1={lx} y1={70} x2={lx} y2={490}
            stroke="url(#div-grad)"
            strokeWidth={1}
          />
        ))}

        {/* Stage labels at top */}
        {STAGE_LABELS.map((lbl, i) => (
          <text
            key={i}
            x={STAGE_X[i]}
            y={50}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(255,255,255,0.3)"
            fontWeight="600"
            fontFamily="'Heebo', 'Arial', sans-serif"
          >
            {lbl}
          </text>
        ))}

        {/* Edges */}
        {EDGES.map((e, i) => {
          const from = nodeById(e.from)
          const to = nodeById(e.to)
          const op = edgeOpacity(e)
          const col = edgeColor(e)
          const isActive = hovered && (e.from === hovered || e.to === hovered)
          const bend = e.bidirectional ? (i % 2 === 0 ? -20 : 20) : 0
          const path = edgePath(from, to, bend)
          // label midpoint
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2 + bend - 8

          return (
            <g key={i} style={{ opacity: op, transition: 'opacity 0.2s' }}>
              <path
                d={path}
                fill="none"
                stroke={col}
                strokeWidth={isActive ? 2.2 : 1.3}
                markerEnd={!e.bidirectional ? `url(#${isActive ? 'flow-arrow-accent' : 'flow-arrow'})` : undefined}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              {e.bidirectional && (
                <path
                  d={edgePath(to, from, -bend)}
                  fill="none"
                  stroke={col}
                  strokeWidth={isActive ? 2.2 : 1.3}
                  markerEnd={`url(#${isActive ? 'flow-arrow-accent' : 'flow-arrow'})`}
                  style={{ opacity: 0.65, transition: 'stroke 0.2s' }}
                />
              )}
              {e.label && op > 0.1 && (
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'}
                  fontFamily="'Heebo', 'Arial', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes — pills */}
        {NODES.map(n => {
          const accent = ACCENT[n.id]
          const op = nodeOpacity(n.id)
          const isHov = hovered === n.id
          const isNeighbor = activeNeighbors.has(n.id)

          return (
            <g
              key={n.id}
              style={{ opacity: op, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* pill shadow/glow */}
              {(isHov || isNeighbor) && (
                <rect
                  x={n.x - PW / 2 - 4}
                  y={n.y - PH / 2 - 4}
                  width={PW + 8}
                  height={PH + 8}
                  rx={24}
                  fill={accent}
                  opacity={0.12}
                  filter="url(#pill-glow)"
                />
              )}
              {/* pill body */}
              <rect
                x={n.x - PW / 2}
                y={n.y - PH / 2}
                width={PW}
                height={PH}
                rx={PH / 2}
                fill="rgba(255,255,255,0.07)"
                stroke={accent}
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.15s' }}
              />
              {/* colored left accent bar */}
              <rect
                x={n.x - PW / 2}
                y={n.y - PH / 2 + 4}
                width={4}
                height={PH - 8}
                rx={2}
                fill={accent}
                opacity={0.8}
              />
              {/* label */}
              <text
                x={n.x + 4}
                y={n.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={n.label.length > 6 ? '11' : '13'}
                fontWeight="700"
                fill="white"
                fontFamily="'Heebo', 'Arial', sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {n.label}
              </text>
            </g>
          )
        })}

        {/* Progress arrow legend at bottom */}
        <g style={{ opacity: 0.35 }}>
          <line x1="50" y1="498" x2="650" y2="498" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <polygon points="650,494 658,498 650,502" fill="rgba(255,255,255,0.25)" />
          <text x="354" y="511" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="'Heebo', 'Arial', sans-serif">
            מסלול למידה →
          </text>
        </g>
      </svg>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 18,
          fontSize: 13,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: 1,
          direction: 'rtl',
        }}
      >
        זרימה — מפת מושגים בסטטיסטיקה
      </div>

      {/* Hovered tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            background: `rgba(0,0,0,0.6)`,
            border: `1px solid ${ACCENT[hovered]}`,
            borderRadius: 8,
            padding: '4px 14px',
            fontSize: 13,
            fontWeight: 700,
            color: ACCENT[hovered],
            direction: 'rtl',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(6px)',
          }}
        >
          {hovered}
        </div>
      )}
    </div>
  )
}

export default ConceptMapFlow
