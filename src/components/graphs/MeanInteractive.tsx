/**
 * MeanInteractive.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Interactive graph that teaches the concept of the arithmetic mean.
 *
 * Pedagogical idea:
 *   The mean is the "balance point" of the data. Students drag dots on a number
 *   line and watch the mean indicator (a triangular fulcrum) slide in real time.
 *   They feel — physically, through dragging — that the mean is pulled toward
 *   outliers. The live LaTeX formula reinforces the symbolic representation
 *   alongside the visual one (dual-coding theory: see Mayer 2009).
 *
 * Inputs:
 *   - Drag any dot horizontally on the number line.
 *   - Buttons: Add point / Remove last / Reset.
 *
 * Tech:
 *   - Pure SVG, no external chart deps.
 *   - KaTeX rendered via the global window.katex CDN object (matches
 *     LessonScreen.tsx convention).
 *   - Hebrew RTL labels; numbers stay LTR.
 *
 * Self-contained: no props are required. Default export.
 */
import { useEffect, useRef, useState, useMemo } from 'react'

// ── KaTeX inline helper ─────────────────────────────────────────────────────
// Mirrors the helper in LessonScreen.tsx so this component stays self-contained.
declare global {
  interface Window {
    katex?: { renderToString: (latex: string, opts?: object) => string }
  }
}
function KatexInline({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let cancelled = false
    const render = () => {
      if (cancelled) return
      if (window.katex) {
        try {
          node.innerHTML = window.katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
            output: 'html',
          })
        } catch {
          node.textContent = latex
        }
      } else {
        setTimeout(render, 80)
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [latex])
  return <span ref={ref} dir="ltr" />
}

// ── Geometry constants ──────────────────────────────────────────────────────
const W = 640
const H = 240
const PAD_X = 40
const AXIS_Y = 170
const X_MIN = 0
const X_MAX = 20
const DOT_RADIUS = 12

// Map data x → svg x
function xToPx(x: number) {
  return PAD_X + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD_X)
}
function pxToX(px: number) {
  const t = (px - PAD_X) / (W - 2 * PAD_X)
  return Math.max(X_MIN, Math.min(X_MAX, t * (X_MAX - X_MIN)))
}

interface Point {
  id: number
  x: number
}

const INITIAL: Point[] = [
  { id: 1, x: 4 },
  { id: 2, x: 7 },
  { id: 3, x: 9 },
  { id: 4, x: 12 },
  { id: 5, x: 15 },
]

export default function MeanInteractive() {
  const [points, setPoints] = useState<Point[]>(INITIAL)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nextId = useRef(INITIAL.length + 1)

  // Compute the mean reactively. useMemo keeps this cheap even with many drags.
  const mean = useMemo(() => {
    if (points.length === 0) return 0
    return points.reduce((s, p) => s + p.x, 0) / points.length
  }, [points])

  // LaTeX string showing the actual numeric sum so students see the formula
  // reflect their data, not a generic symbolic expression.
  const latex = useMemo(() => {
    if (points.length === 0) return '\\bar{x} = 0'
    const sum = points.map(p => p.x.toFixed(1)).join(' + ')
    return `\\bar{x} = \\frac{${sum}}{${points.length}} = ${mean.toFixed(2)}`
  }, [points, mean])

  // Pointer events: track which dot is being dragged + update its x position.
  // We use pointer events (not mouse) so it works on touch devices too.
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (draggingId === null) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const newX = pxToX(px)
    setPoints(prev => prev.map(p => (p.id === draggingId ? { ...p, x: newX } : p)))
  }
  function onPointerUp() {
    setDraggingId(null)
  }

  function addPoint() {
    if (points.length >= 12) return
    const id = nextId.current++
    setPoints(prev => [...prev, { id, x: 10 + (Math.random() - 0.5) * 4 }])
  }
  function removePoint() {
    setPoints(prev => prev.slice(0, -1))
  }
  function reset() {
    setPoints(INITIAL)
    nextId.current = INITIAL.length + 1
  }

  // Axis tick labels every 2 units.
  const ticks = Array.from({ length: 11 }, (_, i) => i * 2)

  const meanPx = xToPx(mean)

  return (
    <div
      dir="rtl"
      style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 20,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20 }}>
        ממוצע אינטראקטיבי — גרור את הנקודות
      </h3>
      <p style={{ margin: 0, marginBottom: 16, opacity: 0.7, fontSize: 14 }}>
        הממוצע הוא נקודת האיזון של הנתונים. נסה לגרור נקודה רחוק וראה איך הממוצע נמשך אליה.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ touchAction: 'none', userSelect: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Axis line */}
        <line
          x1={PAD_X}
          y1={AXIS_Y}
          x2={W - PAD_X}
          y2={AXIS_Y}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={2}
        />
        {/* Tick marks and labels */}
        {ticks.map(t => (
          <g key={t}>
            <line
              x1={xToPx(t)}
              y1={AXIS_Y - 4}
              x2={xToPx(t)}
              y2={AXIS_Y + 4}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            <text
              x={xToPx(t)}
              y={AXIS_Y + 20}
              fill="rgba(255,255,255,0.6)"
              fontSize={12}
              textAnchor="middle"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Mean indicator: vertical line + triangular fulcrum */}
        <line
          x1={meanPx}
          y1={30}
          x2={meanPx}
          y2={AXIS_Y}
          stroke="#FF6B35"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <polygon
          points={`${meanPx - 10},${AXIS_Y + 30} ${meanPx + 10},${AXIS_Y + 30} ${meanPx},${AXIS_Y + 8}`}
          fill="#FF6B35"
        />
        <text
          x={meanPx}
          y={24}
          fill="#FF6B35"
          fontSize={14}
          fontWeight={700}
          textAnchor="middle"
        >
          x̄ = {mean.toFixed(2)}
        </text>

        {/* Data points — render last so they sit above the mean line */}
        {points.map(p => {
          const cx = xToPx(p.x)
          const isDragging = draggingId === p.id
          return (
            <g key={p.id} style={{ cursor: 'grab' }}>
              {/* Drop shadow / halo when dragging for feedback */}
              {isDragging && (
                <circle cx={cx} cy={AXIS_Y} r={DOT_RADIUS + 6} fill="#4A90D9" opacity={0.3} />
              )}
              <circle
                cx={cx}
                cy={AXIS_Y}
                r={DOT_RADIUS}
                fill="#4A90D9"
                stroke="#fff"
                strokeWidth={2}
                onPointerDown={e => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  setDraggingId(p.id)
                }}
              />
              <text
                x={cx}
                y={AXIS_Y + 4}
                fill="#fff"
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
                pointerEvents="none"
              >
                {p.x.toFixed(1)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Live formula */}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          minHeight: 50,
        }}
      >
        <KatexInline latex={latex} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          onClick={addPoint}
          disabled={points.length >= 12}
          style={btnStyle('#27AE60')}
        >
          הוסף נקודה
        </button>
        <button
          onClick={removePoint}
          disabled={points.length <= 1}
          style={btnStyle('#E74C3C')}
        >
          הסר אחרונה
        </button>
        <button onClick={reset} style={btnStyle('#7B5EA7')}>
          איפוס
        </button>
        <span style={{ alignSelf: 'center', marginInlineStart: 'auto', opacity: 0.7, fontSize: 13 }}>
          n = {points.length}
        </span>
      </div>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }
}
