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

// ── Cluster definitions ────────────────────────────────────────────────────────
interface ClusterDef {
  id: string
  label: string          // Hebrew cluster title
  color: string          // cluster tint
  x: number              // cluster center
  y: number
  rx: number             // blob half-width
  ry: number             // blob half-height
}

const CLUSTERS: ClusterDef[] = [
  {
    id:    'center',
    label: 'מדדי מרכז',
    color: '#FFD700',
    x:  170, y: 190,
    rx: 120, ry: 140,
  },
  {
    id:    'spread',
    label: 'מדדי פיזור',
    color: '#FF6B6B',
    x:  370, y: 160,
    rx: 130, ry: 130,
  },
  {
    id:    'inference',
    label: 'הסקה סטטיסטית',
    color: '#C3A6FF',
    x:  520, y: 360,
    rx: 160, ry: 130,
  },
]

interface NodeDef {
  id: string
  label: string
  x: number
  y: number
  cluster: string
}

const NODES: NodeDef[] = [
  // cluster: center
  { id: 'ממוצע',           label: 'ממוצע',           x: 120, y: 150, cluster: 'center' },
  { id: 'חציון',           label: 'חציון',           x: 210, y: 120, cluster: 'center' },
  { id: 'שכיח',            label: 'שכיח',            x: 175, y: 270, cluster: 'center' },
  // cluster: spread
  { id: 'טווח',            label: 'טווח',            x: 310, y: 135, cluster: 'spread' },
  { id: 'סטיית תקן',       label: 'סטיית תקן',       x: 420, y: 110, cluster: 'spread' },
  { id: 'התפלגות נורמלית', label: 'התפלגות נורמלית', x: 390, y: 230, cluster: 'spread' },
  // cluster: inference
  { id: 'מדגם',            label: 'מדגם',            x: 410, y: 360, cluster: 'inference' },
  { id: 'קורלציה',         label: 'קורלציה',         x: 510, y: 290, cluster: 'inference' },
  { id: 'רגרסיה',          label: 'רגרסיה',          x: 620, y: 360, cluster: 'inference' },
  { id: 'מבחן השערות',     label: 'מבחן השערות',     x: 545, y: 440, cluster: 'inference' },
]

interface EdgeDef {
  from: string
  to: string
  label?: string
  bidirectional?: boolean
  crossCluster?: boolean   // edges between clusters get a different style
}

const EDGES: EdgeDef[] = [
  // intra-cluster: center
  { from: 'ממוצע', to: 'חציון',            bidirectional: true },
  { from: 'חציון', to: 'שכיח',             bidirectional: true },
  // intra-cluster: spread
  { from: 'טווח',  to: 'סטיית תקן',        label: 'פיזור' },
  { from: 'סטיית תקן', to: 'התפלגות נורמלית', label: 'מעצב' },
  // intra-cluster: inference
  { from: 'קורלציה', to: 'רגרסיה',         label: 'מניע' },
  { from: 'מדגם',    to: 'מבחן השערות',    label: 'מאפשר' },
  // cross-cluster edges
  { from: 'ממוצע',           to: 'סטיית תקן',       label: 'מחשבים',  crossCluster: true },
  { from: 'התפלגות נורמלית', to: 'מבחן השערות',     label: 'בסיס',    crossCluster: true },
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

// card dimensions
const CW = 90
const CH = 34

// ── Blob polygon helper (soft rounded hexagon) ────────────────────────────────
function blobPath(cx: number, cy: number, rx: number, ry: number): string {
  // 8-sided approximate ellipse
  const pts: [number, number][] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const jitter = 0.92 + 0.08 * Math.sin(i * 2.5)
    pts.push([cx + Math.cos(angle) * rx * jitter, cy + Math.sin(angle) * ry * jitter])
  }
  // catmull-rom spline approximation via cubic bezier
  const d = pts.map((p, i) => {
    const prev = pts[(i - 1 + pts.length) % pts.length]
    const next = pts[(i + 1) % pts.length]
    const cp1x = p[0] + (next[0] - prev[0]) * 0.16
    const cp1y = p[1] + (next[1] - prev[1]) * 0.16
    const next2 = pts[(i + 2) % pts.length]
    const cp2x = next[0] - (next2[0] - p[0]) * 0.16
    const cp2y = next[1] - (next2[1] - p[1]) * 0.16
    return (i === 0 ? `M ${p[0]} ${p[1]}` : '') + ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next[0]} ${next[1]}`
  }).join(' ')
  return d + ' Z'
}

// ── Component ──────────────────────────────────────────────────────────────────
const ConceptMapCluster: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null)

  const activeCluster = hovered ? NODES.find(n => n.id === hovered)?.cluster ?? null : hoveredCluster
  const activeNeighbors = hovered ? neighbors(hovered) : new Set<string>()

  const nodeOpacity = (n: NodeDef) => {
    if (!hovered && !hoveredCluster) return 1
    if (hoveredCluster && !hovered) {
      return n.cluster === hoveredCluster ? 1 : 0.18
    }
    if (hovered) {
      if (n.id === hovered) return 1
      if (activeNeighbors.has(n.id)) return 0.85
      return 0.15
    }
    return 1
  }

  const edgeOpacity = (e: EdgeDef) => {
    if (!hovered && !hoveredCluster) return 0.55
    if (hoveredCluster && !hovered) {
      // show edges within cluster
      const fn = nodeById(e.from)
      const tn = nodeById(e.to)
      if (fn.cluster === hoveredCluster || tn.cluster === hoveredCluster) return 0.7
      return 0.06
    }
    if (hovered) {
      if (e.from === hovered || e.to === hovered) return 1
      return 0.05
    }
    return 0.55
  }

  const edgeColor = (e: EdgeDef) => {
    if (hovered && (e.from === hovered || e.to === hovered)) {
      return e.from === hovered ? ACCENT[e.from] : ACCENT[e.to]
    }
    if (e.crossCluster) return 'rgba(255,255,255,0.4)'
    return 'rgba(255,255,255,0.22)'
  }

  const clusterOpacity = (c: ClusterDef) => {
    if (!hovered && !hoveredCluster) return 1
    if (hoveredCluster === c.id) return 1
    if (hovered && NODES.find(n => n.id === hovered)?.cluster === c.id) return 1
    return 0.3
  }

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
          <marker id="cl-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.4)" />
          </marker>
          <marker id="cl-arrow-bright" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.9)" />
          </marker>
          <filter id="card-glow" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="cluster-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Cluster blobs ── */}
        {CLUSTERS.map(c => {
          const op = clusterOpacity(c)
          return (
            <g key={c.id} style={{ opacity: op, transition: 'opacity 0.22s', cursor: 'pointer' }}
              onMouseEnter={() => !hovered && setHoveredCluster(c.id)}
              onMouseLeave={() => setHoveredCluster(null)}
            >
              {/* glow behind blob */}
              <path
                d={blobPath(c.x, c.y, c.rx + 20, c.ry + 20)}
                fill={c.color}
                opacity={0.04}
                filter="url(#cluster-glow)"
              />
              {/* blob fill */}
              <path
                d={blobPath(c.x, c.y, c.rx, c.ry)}
                fill={c.color}
                opacity={activeCluster === c.id ? 0.11 : 0.055}
                style={{ transition: 'opacity 0.2s' }}
              />
              {/* blob stroke */}
              <path
                d={blobPath(c.x, c.y, c.rx, c.ry)}
                fill="none"
                stroke={c.color}
                strokeWidth={activeCluster === c.id ? 1.8 : 1}
                opacity={activeCluster === c.id ? 0.55 : 0.2}
                strokeDasharray="6 4"
                style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
              />
              {/* cluster label — positioned near top of blob */}
              <text
                x={c.x}
                y={c.y - c.ry + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={c.color}
                opacity={activeCluster === c.id ? 0.85 : 0.35}
                fontFamily="'Heebo', 'Arial', sans-serif"
                style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
              >
                {c.label}
              </text>
            </g>
          )
        })}

        {/* ── Edges ── */}
        {EDGES.map((e, i) => {
          const from = nodeById(e.from)
          const to = nodeById(e.to)
          const op = edgeOpacity(e)
          const col = edgeColor(e)
          const isActive = !!hovered && (e.from === hovered || e.to === hovered)
          // slight s-curve for cross-cluster edges
          const bend = e.crossCluster ? 40 : (e.bidirectional ? (i % 2 === 0 ? -15 : 15) : 0)
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2 + bend
          const path = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
          // label midpoint on bezier
          const lx = 0.25 * from.x + 0.5 * mx + 0.25 * to.x
          const ly = 0.25 * from.y + 0.5 * my + 0.25 * to.y - 8

          return (
            <g key={i} style={{ opacity: op, transition: 'opacity 0.2s' }}>
              <path
                d={path}
                fill="none"
                stroke={col}
                strokeWidth={isActive ? 2.2 : e.crossCluster ? 1.8 : 1.2}
                strokeDasharray={e.crossCluster ? '7 4' : undefined}
                markerEnd={!e.bidirectional ? `url(#${isActive ? 'cl-arrow-bright' : 'cl-arrow'})` : undefined}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              {e.bidirectional && (
                <path
                  d={`M ${to.x} ${to.y} Q ${mx} ${my - bend * 2} ${from.x} ${from.y}`}
                  fill="none"
                  stroke={col}
                  strokeWidth={1.2}
                  markerEnd={`url(#${isActive ? 'cl-arrow-bright' : 'cl-arrow'})`}
                  style={{ opacity: 0.6 }}
                />
              )}
              {e.label && op > 0.1 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)'}
                  fontFamily="'Heebo', 'Arial', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {/* ── Nodes — cards ── */}
        {NODES.map(n => {
          const accent = ACCENT[n.id]
          const op = nodeOpacity(n)
          const isHov = hovered === n.id
          const isNeighbor = activeNeighbors.has(n.id)

          return (
            <g
              key={n.id}
              style={{ opacity: op, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={() => { setHovered(n.id); setHoveredCluster(null) }}
              onMouseLeave={() => setHovered(null)}
            >
              {/* glow halo */}
              {(isHov || isNeighbor) && (
                <rect
                  x={n.x - CW / 2 - 5}
                  y={n.y - CH / 2 - 5}
                  width={CW + 10}
                  height={CH + 10}
                  rx={9}
                  fill={accent}
                  opacity={0.15}
                  filter="url(#card-glow)"
                />
              )}
              {/* card body */}
              <rect
                x={n.x - CW / 2}
                y={n.y - CH / 2}
                width={CW}
                height={CH}
                rx={7}
                fill="rgba(255,255,255,0.07)"
                stroke={accent}
                strokeWidth={isHov ? 2.5 : 1.4}
                style={{ transition: 'stroke-width 0.15s' }}
              />
              {/* top accent bar */}
              <rect
                x={n.x - CW / 2}
                y={n.y - CH / 2}
                width={CW}
                height={3}
                rx={7}
                fill={accent}
                opacity={isHov ? 0.9 : 0.55}
                style={{ transition: 'opacity 0.15s' }}
              />
              {/* colored dot */}
              <circle
                cx={n.x - CW / 2 + 10}
                cy={n.y}
                r={3.5}
                fill={accent}
                opacity={0.85}
              />
              {/* label */}
              <text
                x={n.x + 4}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={n.label.length > 7 ? '10' : '12'}
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

        {/* Cluster legend at bottom */}
        {CLUSTERS.map((c, i) => (
          <g key={c.id}
            style={{ cursor: 'pointer', opacity: hoveredCluster === c.id || (!hoveredCluster && !hovered) ? 0.8 : 0.3, transition: 'opacity 0.2s' }}
            onMouseEnter={() => !hovered && setHoveredCluster(c.id)}
            onMouseLeave={() => setHoveredCluster(null)}
          >
            <rect x={20 + i * 220} y={492} width={12} height={12} rx={3} fill={c.color} opacity={0.7} />
            <text x={38 + i * 220} y={502} fontSize="10" fill={c.color} fontFamily="'Heebo', 'Arial', sans-serif" fontWeight="600">
              {c.label}
            </text>
          </g>
        ))}
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
        אשכולות — מפת מושגים בסטטיסטיקה
      </div>

      {/* Active label */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)',
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

export default ConceptMapCluster
