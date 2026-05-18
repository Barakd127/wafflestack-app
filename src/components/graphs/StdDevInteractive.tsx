/**
 * StdDevInteractive.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Interactive graph teaching standard deviation (σ) as a measure of spread.
 *
 * Pedagogical idea:
 *   Students see the same dataset overlaid with shaded bands at ±kσ from the
 *   mean. A slider lets them vary k (the multiplier). They observe:
 *     1. σ is a "ruler" centered on the mean.
 *     2. The proportion of points captured grows as k grows.
 *     3. Spreading the data (drag a point outward) makes σ larger — bands widen.
 *   This makes σ tangible, not just a formula.
 *
 * Inputs:
 *   - Drag data points horizontally to reshape the dataset.
 *   - Slider for k (the σ multiplier, 0.5 → 3.0).
 *
 * Tech: Pure SVG, KaTeX via CDN, RTL Hebrew labels.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

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

// ── Geometry ────────────────────────────────────────────────────────────────
const W = 640
const H = 260
const PAD_X = 40
const AXIS_Y = 180
const X_MIN = 0
const X_MAX = 20
const DOT_RADIUS = 11

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
  { id: 1, x: 5 },
  { id: 2, x: 7 },
  { id: 3, x: 8 },
  { id: 4, x: 9 },
  { id: 5, x: 10 },
  { id: 6, x: 11 },
  { id: 7, x: 12 },
  { id: 8, x: 13 },
  { id: 9, x: 15 },
]

export default function StdDevInteractive() {
  const [points, setPoints] = useState<Point[]>(INITIAL)
  const [k, setK] = useState(1) // σ multiplier
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // ── Stats: mean, sample variance (n−1 denominator), σ ─────────────────────
  const { mean, sigma } = useMemo(() => {
    if (points.length === 0) return { mean: 0, sigma: 0 }
    const m = points.reduce((s, p) => s + p.x, 0) / points.length
    if (points.length < 2) return { mean: m, sigma: 0 }
    const variance =
      points.reduce((s, p) => s + (p.x - m) ** 2, 0) / (points.length - 1)
    return { mean: m, sigma: Math.sqrt(variance) }
  }, [points])

  // Count of points within ±kσ — the "empirical rule" intuition (68/95/99.7).
  const withinBand = useMemo(() => {
    return points.filter(p => Math.abs(p.x - mean) <= k * sigma).length
  }, [points, mean, sigma, k])

  const latex = `\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n-1}} = ${sigma.toFixed(2)}`

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
  function reset() {
    setPoints(INITIAL)
    setK(1)
  }

  const ticks = Array.from({ length: 11 }, (_, i) => i * 2)

  // Band coordinates clipped to chart bounds so wide bands don't bleed.
  const bandLeft = Math.max(PAD_X, xToPx(mean - k * sigma))
  const bandRight = Math.min(W - PAD_X, xToPx(mean + k * sigma))
  const meanPx = xToPx(mean)

  // Pre-compute band colors for k=1,2,3 — for legend strip
  const BANDS = [
    { k: 1, color: '#27AE60', label: '~68%' },
    { k: 2, color: '#F39C12', label: '~95%' },
    { k: 3, color: '#E74C3C', label: '~99.7%' },
  ]

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
        סטיית תקן אינטראקטיבית — גרור נקודות ושנה k
      </h3>
      <p style={{ margin: 0, marginBottom: 16, opacity: 0.7, fontSize: 14 }}>
        סטיית התקן (σ) מודדת כמה הנתונים מפוזרים סביב הממוצע. הזז את k וראה כמה נקודות נכנסות לטווח ±kσ.
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
        {/* Spread band (±kσ) — drawn first so points overlay it */}
        {sigma > 0 && (
          <rect
            x={bandLeft}
            y={50}
            width={Math.max(0, bandRight - bandLeft)}
            height={AXIS_Y - 50}
            fill="#7B5EA7"
            opacity={0.25}
          />
        )}

        {/* Band edges */}
        {sigma > 0 && (
          <>
            <line
              x1={bandLeft}
              y1={50}
              x2={bandLeft}
              y2={AXIS_Y}
              stroke="#7B5EA7"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            <line
              x1={bandRight}
              y1={50}
              x2={bandRight}
              y2={AXIS_Y}
              stroke="#7B5EA7"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
          </>
        )}

        {/* Axis */}
        <line
          x1={PAD_X}
          y1={AXIS_Y}
          x2={W - PAD_X}
          y2={AXIS_Y}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={2}
        />
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

        {/* Mean indicator */}
        <line
          x1={meanPx}
          y1={30}
          x2={meanPx}
          y2={AXIS_Y}
          stroke="#D4A017"
          strokeWidth={2}
        />
        <text
          x={meanPx}
          y={24}
          fill="#D4A017"
          fontSize={13}
          fontWeight={700}
          textAnchor="middle"
        >
          x̄ = {mean.toFixed(2)}
        </text>

        {/* σ ruler bar under the axis — shows one σ length */}
        {sigma > 0 && (
          <g>
            <line
              x1={meanPx}
              y1={AXIS_Y + 38}
              x2={xToPx(mean + sigma)}
              y2={AXIS_Y + 38}
              stroke="#27AE60"
              strokeWidth={3}
            />
            <text
              x={(meanPx + xToPx(mean + sigma)) / 2}
              y={AXIS_Y + 54}
              fill="#27AE60"
              fontSize={12}
              fontWeight={600}
              textAnchor="middle"
            >
              1σ = {sigma.toFixed(2)}
            </text>
          </g>
        )}

        {/* Points */}
        {points.map(p => {
          const cx = xToPx(p.x)
          const inside = Math.abs(p.x - mean) <= k * sigma
          const isDragging = draggingId === p.id
          return (
            <g key={p.id} style={{ cursor: 'grab' }}>
              {isDragging && (
                <circle cx={cx} cy={AXIS_Y} r={DOT_RADIUS + 6} fill="#4A90D9" opacity={0.3} />
              )}
              <circle
                cx={cx}
                cy={AXIS_Y}
                r={DOT_RADIUS}
                fill={inside ? '#4A90D9' : '#E74C3C'}
                stroke="#fff"
                strokeWidth={2}
                onPointerDown={e => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  setDraggingId(p.id)
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Formula */}
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

      {/* k slider */}
      <div style={{ marginTop: 16 }}>
        <label
          htmlFor="k-slider"
          style={{ display: 'block', marginBottom: 6, fontSize: 14, opacity: 0.85 }}
        >
          מקדם k:{' '}
          <span style={{ color: '#7B5EA7', fontWeight: 700 }}>{k.toFixed(1)}σ</span>
          {' — '}
          <span style={{ color: '#27AE60' }}>
            {withinBand}/{points.length} נקודות בטווח
          </span>
        </label>
        <input
          id="k-slider"
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={k}
          onChange={e => setK(parseFloat(e.target.value))}
          style={{ width: '100%', direction: 'ltr' }}
        />
      </div>

      {/* Empirical-rule legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 13 }}>
        {BANDS.map(b => (
          <button
            key={b.k}
            onClick={() => setK(b.k)}
            style={{
              background: 'transparent',
              border: `1px solid ${b.color}`,
              color: b.color,
              borderRadius: 8,
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            ±{b.k}σ ≈ {b.label}
          </button>
        ))}
        <button
          onClick={reset}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: 8,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            marginInlineStart: 'auto',
          }}
        >
          איפוס
        </button>
      </div>
    </div>
  )
}
