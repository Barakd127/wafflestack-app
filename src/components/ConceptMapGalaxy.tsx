import { useState } from 'react'

const FONT = "'Heebo', 'Arial', sans-serif"

const NODES = [
  { id: 'ממוצע',           label: 'ממוצע',           color: '#FFD700', x: 350, y: 170 },
  { id: 'חציון',           label: 'חציון',           color: '#4ECDC4', x: 175, y: 255 },
  { id: 'שכיח',            label: 'שכיח',            color: '#AA96DA', x: 525, y: 255 },
  { id: 'טווח',            label: 'טווח',            color: '#FF6B6B', x: 115, y: 385 },
  { id: 'סטיית תקן',       label: 'סטיית תקן',       color: '#FF6B6B', x: 350, y: 325 },
  { id: 'התפלגות נורמלית', label: 'התפלגות נורמלית', color: '#95E1D3', x: 350, y: 445 },
  { id: 'מדגם',            label: 'מדגם',            color: '#AA96DA', x: 565, y: 385 },
  { id: 'קורלציה',         label: 'קורלציה',         color: '#A8E6CF', x: 125, y: 470 },
  { id: 'רגרסיה',          label: 'רגרסיה',          color: '#FCBAD3', x: 265, y: 490 },
  { id: 'מבחן השערות',     label: 'מבחן השערות',     color: '#C3A6FF', x: 495, y: 470 },
]

const EDGES = [
  { from: 'ממוצע',           to: 'סטיית תקן',       bidir: false },
  { from: 'סטיית תקן',       to: 'התפלגות נורמלית', bidir: false },
  { from: 'ממוצע',           to: 'חציון',           bidir: true  },
  { from: 'ממוצע',           to: 'שכיח',            bidir: true  },
  { from: 'חציון',           to: 'שכיח',            bidir: true  },
  { from: 'טווח',            to: 'סטיית תקן',       bidir: false },
  { from: 'מדגם',            to: 'מבחן השערות',     bidir: false },
  { from: 'התפלגות נורמלית', to: 'מבחן השערות',     bidir: false },
  { from: 'קורלציה',         to: 'רגרסיה',          bidir: false },
]

function getNeighbors(id: string) {
  const s = new Set<string>()
  EDGES.forEach(e => {
    if (e.from === id) s.add(e.to)
    if (e.to === id)   s.add(e.from)
  })
  return s
}
function nodeById(id: string) { return NODES.find(n => n.id === id)! }
function arrowPts(f: typeof NODES[0], t: typeof NODES[0], r = 28) {
  const dx = t.x - f.x, dy = t.y - f.y
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  return { x1: f.x + dx/len*r, y1: f.y + dy/len*r, x2: t.x - dx/len*(r+7), y2: t.y - dy/len*(r+7) }
}

export default function ConceptMapGalaxy() {
  const [hovered, setHovered] = useState<string | null>(null)
  const nb = hovered ? getNeighbors(hovered) : new Set<string>()
  const nodeOp = (id: string) => !hovered ? 1 : (id === hovered || nb.has(id) ? 1 : 0.15)
  const edgeOp = (f: string, t: string) => !hovered ? 0.48 : (f === hovered || t === hovered ? 1 : 0.05)
  const edgeStroke = (f: string, t: string) => {
    if (!hovered) return '#7788aa'
    if (f === hovered) return nodeById(f).color
    if (t === hovered) return nodeById(t).color
    return '#7788aa'
  }

  return (
    <svg width={700} height={520} style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <marker id="arr-g" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#8899cc" />
        </marker>
        {NODES.map(n => (
          <radialGradient key={n.id} id={`gal-halo-${n.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={n.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={n.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Star field */}
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={i} cx={(i * 137.5) % 700} cy={(i * 97.3) % 520}
          r={i % 5 === 0 ? 1.4 : 0.7} fill="white" opacity={0.07 + (i % 7) * 0.03} />
      ))}

      {/* Halos */}
      {NODES.map(n => (
        <circle key={`h-${n.id}`} cx={n.x} cy={n.y} r={hovered === n.id ? 56 : 40}
          fill={`url(#gal-halo-${n.id})`} opacity={nodeOp(n.id)}
          style={{ transition: 'r 0.25s, opacity 0.2s' }} />
      ))}

      {/* Edges */}
      {EDGES.map((e, i) => {
        const f = nodeById(e.from), t = nodeById(e.to)
        const op = edgeOp(e.from, e.to)
        const stroke = edgeStroke(e.from, e.to)
        if (e.bidir) {
          const p1 = arrowPts(f, t), p2 = arrowPts(t, f)
          return <g key={i} opacity={op} style={{ transition: 'opacity 0.2s' }}>
            <line {...p1} stroke={stroke} strokeWidth="1.5" markerEnd="url(#arr-g)" />
            <line {...p2} stroke={stroke} strokeWidth="1.5" markerEnd="url(#arr-g)" />
          </g>
        }
        const p = arrowPts(f, t)
        return <line key={i} {...p} stroke={stroke} strokeWidth="1.5"
          markerEnd="url(#arr-g)" opacity={op} style={{ transition: 'opacity 0.2s' }} />
      })}

      {/* Nodes */}
      {NODES.map(n => (
        <g key={n.id} style={{ cursor: 'pointer' }} opacity={nodeOp(n.id)}
          onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}>
          <circle cx={n.x} cy={n.y} r={hovered === n.id ? 31 : 26}
            fill={n.color} fillOpacity={hovered === n.id ? 0.32 : 0.17}
            stroke={n.color} strokeWidth={hovered === n.id ? 2.5 : 1.5}
            style={{ transition: 'r 0.2s' }} />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
            fill={hovered === n.id ? '#fff' : n.color}
            fontSize={n.label.length > 7 ? 9 : 11} fontWeight="700" direction="rtl"
            style={{ pointerEvents: 'none' }}>
            {n.label}
          </text>
        </g>
      ))}

      {/* Legend */}
      <text x={350} y={15} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.35)"
        fontWeight="700" fontFamily={FONT}>גלקסיה — מפת מושגים בסטטיסטיקה</text>
    </svg>
  )
}
