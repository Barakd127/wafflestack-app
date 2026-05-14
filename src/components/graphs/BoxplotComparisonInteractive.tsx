/**
 * BoxplotComparisonInteractive — Three box plots side-by-side (groups A/B/C).
 * Drag handles on each Q1/Q3/median. Compare medians visually. Range + IQR per group.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640
const H = 360
const PAD_X = 50
const PAD_Y = 30
const AXIS_X = PAD_X
const Y_TOP = PAD_Y
const Y_BOT = H - 50

const yMin = 0
const yMax = 100

type Box = {
  name: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  color: string
}

const INITIAL: Box[] = [
  { name: 'A', min: 30, q1: 45, median: 55, q3: 65, max: 80, color: '#60a5fa' },
  { name: 'B', min: 20, q1: 35, median: 50, q3: 70, max: 88, color: '#FFD700' },
  { name: 'C', min: 40, q1: 55, median: 70, q3: 80, max: 92, color: '#f59e0b' },
]

type Handle = { groupIdx: number; field: 'q1' | 'median' | 'q3' | 'min' | 'max' }

export default function BoxplotComparisonInteractive() {
  const [boxes, setBoxes] = useState<Box[]>(INITIAL)
  const [drag, setDrag] = useState<Handle | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const toY = (v: number) => Y_BOT - ((v - yMin) / (yMax - yMin)) * (Y_BOT - Y_TOP)
  const pyToVal = (py: number) => Math.max(yMin, Math.min(yMax, yMin + ((Y_BOT - py) / (Y_BOT - Y_TOP)) * (yMax - yMin)))

  // X position for each group's box center
  const groupCenterX = (i: number) => AXIS_X + 60 + i * ((W - AXIS_X - 80) / 3) + ((W - AXIS_X - 80) / 6)
  const BOX_HALF_W = 40

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const rb = svgRef.current.getBoundingClientRect()
    const py = ((e.clientY - rb.top) / rb.height) * H
    const v = pyToVal(py)
    setBoxes(prev => prev.map((b, i) => {
      if (i !== drag.groupIdx) return b
      const nb = { ...b }
      // Maintain ordering: min <= q1 <= median <= q3 <= max
      if (drag.field === 'min') nb.min = Math.min(v, b.q1)
      if (drag.field === 'q1') nb.q1 = Math.max(b.min, Math.min(v, b.median))
      if (drag.field === 'median') nb.median = Math.max(b.q1, Math.min(v, b.q3))
      if (drag.field === 'q3') nb.q3 = Math.max(b.median, Math.min(v, b.max))
      if (drag.field === 'max') nb.max = Math.max(b.q3, v)
      return nb
    }))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('box-formula')
    if (k && el) {
      k.render(`\\text{IQR} = Q_3 - Q_1, \\quad \\text{Range} = \\max - \\min`, el, { throwOnError: false })
    }
  }, [])

  // Y axis ticks every 20
  const yTicks = [0, 20, 40, 60, 80, 100]

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>השוואת Boxplots — בין קבוצות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        גרור את הידיות הצהובות (Q₁, חציון, Q₃) ואת הקצוות (min, max) של כל קבוצה. השוו חציונים, IQR וטווחים.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* Y axis */}
        <line x1={AXIS_X} y1={Y_TOP} x2={AXIS_X} y2={Y_BOT} stroke="rgba(255,255,255,0.4)" />
        {yTicks.map(t => (
          <g key={t}>
            <line x1={AXIS_X - 4} y1={toY(t)} x2={AXIS_X} y2={toY(t)} stroke="rgba(255,255,255,0.4)" />
            <line x1={AXIS_X} y1={toY(t)} x2={W - PAD_X / 2} y2={toY(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={AXIS_X - 8} y={toY(t) + 4} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="end">{t}</text>
          </g>
        ))}

        {boxes.map((b, gi) => {
          const cx = groupCenterX(gi)
          const yMin_ = toY(b.min)
          const yQ1 = toY(b.q1)
          const yMed = toY(b.median)
          const yQ3 = toY(b.q3)
          const yMax_ = toY(b.max)

          return (
            <g key={gi}>
              {/* Whisker line top */}
              <line x1={cx} y1={yMax_} x2={cx} y2={yQ3} stroke="#fff" strokeWidth={1.5} />
              {/* Whisker top cap */}
              <line x1={cx - 20} y1={yMax_} x2={cx + 20} y2={yMax_} stroke="#fff" strokeWidth={1.5} />
              {/* Whisker line bottom */}
              <line x1={cx} y1={yQ1} x2={cx} y2={yMin_} stroke="#fff" strokeWidth={1.5} />
              {/* Whisker bottom cap */}
              <line x1={cx - 20} y1={yMin_} x2={cx + 20} y2={yMin_} stroke="#fff" strokeWidth={1.5} />

              {/* Box */}
              <rect
                x={cx - BOX_HALF_W}
                y={yQ3}
                width={BOX_HALF_W * 2}
                height={yQ1 - yQ3}
                fill={b.color}
                fillOpacity={0.35}
                stroke={b.color}
                strokeWidth={2}
              />
              {/* Median line */}
              <line x1={cx - BOX_HALF_W} y1={yMed} x2={cx + BOX_HALF_W} y2={yMed} stroke="#FFD700" strokeWidth={3} />

              {/* Drag handles */}
              {(['min', 'q1', 'median', 'q3', 'max'] as const).map(field => {
                const y = field === 'min' ? yMin_ : field === 'q1' ? yQ1 : field === 'median' ? yMed : field === 'q3' ? yQ3 : yMax_
                const fill = field === 'median' ? '#FFD700' : '#fff'
                return (
                  <circle
                    key={field}
                    cx={cx + BOX_HALF_W + 12}
                    cy={y}
                    r={6}
                    fill={fill}
                    stroke="#0B1B3E"
                    strokeWidth={1.5}
                    onPointerDown={e => { setDrag({ groupIdx: gi, field }); (e.target as Element).setPointerCapture(e.pointerId) }}
                    style={{ cursor: 'ns-resize' }}
                  />
                )
              })}

              {/* Group label */}
              <text x={cx} y={Y_BOT + 20} fill="#fff" fontSize={14} fontWeight={700} textAnchor="middle">{b.name}</text>
            </g>
          )
        })}
      </svg>

      <div id="box-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {boxes.map((b, i) => {
          const iqr = b.q3 - b.q1
          const range = b.max - b.min
          return (
            <div
              key={i}
              style={{
                padding: 10,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 8,
                borderInlineStart: `3px solid ${b.color}`,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>קבוצה {b.name}</div>
              <div>חציון: <span style={{ color: '#FFD700', fontWeight: 700 }}>{b.median.toFixed(1)}</span></div>
              <div>IQR: {iqr.toFixed(1)}</div>
              <div>טווח: {range.toFixed(1)}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button
          onClick={() => setBoxes(INITIAL)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          איפוס
        </button>
      </div>
    </div>
  )
}
