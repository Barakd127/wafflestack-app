/**
 * ResidualPlotInteractive — Same 10 draggable points as RegressionInteractive
 * but shows a RESIDUAL PLOT below (residual = y - ŷ vs x). Highlights
 * heteroscedasticity when fan-shape appears.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640
const H_TOP = 240
const H_BOT = 200
const H = H_TOP + H_BOT + 40
const PAD = 50
const X0 = PAD
const X1 = W - PAD
const Y0_TOP = 30
const Y1_TOP = H_TOP - 30
const Y0_BOT = H_TOP + 40
const Y1_BOT = H - 30

type P = { x: number; y: number }

const base: P[] = [
  { x: 1, y: 2.2 }, { x: 2, y: 2.9 }, { x: 3, y: 4 }, { x: 4, y: 4.6 }, { x: 5, y: 6 },
  { x: 6, y: 6.4 }, { x: 7, y: 7.5 }, { x: 8, y: 8.1 }, { x: 9, y: 9 }, { x: 10, y: 9.7 },
]

// Heteroscedastic preset — residual variance grows with x (fan shape)
const fanShape: P[] = [
  { x: 1, y: 2 }, { x: 2, y: 3.2 }, { x: 3, y: 3.8 }, { x: 4, y: 5.2 }, { x: 5, y: 5.5 },
  { x: 6, y: 7.5 }, { x: 7, y: 5.8 }, { x: 8, y: 9.5 }, { x: 9, y: 6.2 }, { x: 10, y: 11.5 },
]

export default function ResidualPlotInteractive() {
  const [pts, setPts] = useState<P[]>(base)
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const n = pts.length
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const yhat = (x: number) => slope * x + intercept
  const residuals = pts.map(p => p.y - yhat(p.x))

  // Detect heteroscedasticity: compare residual variance of left half vs right half.
  const sorted = [...pts].map((p, i) => ({ p, r: residuals[i] })).sort((a, b) => a.p.x - b.p.x)
  const mid = Math.floor(sorted.length / 2)
  const varLeft = sorted.slice(0, mid).reduce((s, q) => s + q.r * q.r, 0) / mid
  const varRight = sorted.slice(mid).reduce((s, q) => s + q.r * q.r, 0) / (sorted.length - mid)
  const ratio = varRight / Math.max(varLeft, 1e-6)
  const hetero = ratio > 3 || ratio < 1 / 3

  const xMin = 0, xMax = 14, yMin = -2, yMax = 12
  const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const toYTop = (v: number) => Y1_TOP - ((v - yMin) / (yMax - yMin)) * (Y1_TOP - Y0_TOP)
  // residual axis: ±5
  const rMin = -5, rMax = 5
  const toYBot = (v: number) => Y1_BOT - ((v - rMin) / (rMax - rMin)) * (Y1_BOT - Y0_BOT)

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const rb = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rb.left) / rb.width) * W
    const py = ((e.clientY - rb.top) / rb.height) * H
    if (py > Y1_TOP + 5) return
    setPts(prev => prev.map((p, i) => i === drag
      ? {
          x: Math.max(xMin, Math.min(xMax - 2, Math.round((xMin + ((px - X0) / (X1 - X0)) * (xMax - xMin)) * 10) / 10)),
          y: Math.max(yMin, Math.min(yMax, Math.round((yMin + ((Y1_TOP - py) / (Y1_TOP - Y0_TOP)) * (yMax - yMin)) * 10) / 10)),
        }
      : p))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('res-formula')
    if (k && el) {
      k.render(
        `e_i = y_i - \\hat{y}_i, \\quad \\hat{y} = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
        el,
        { throwOnError: false },
      )
    }
  }, [slope, intercept])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>תרשים שאריות — בדיקת התאמת המודל</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        גרור נקודות. שאריות צריכות להתפזר אקראית סביב 0. צורת מניפה ↦ heteroscedasticity.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}
      >
        {/* Top: scatter + regression */}
        <text x={W / 2} y={20} fill="rgba(255,255,255,0.7)" fontSize={12} textAnchor="middle">תרשים פיזור + קו רגרסיה</text>
        <line x1={X0} y1={Y1_TOP} x2={X1} y2={Y1_TOP} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={Y0_TOP} x2={X0} y2={Y1_TOP} stroke="rgba(255,255,255,0.4)" />
        <line
          x1={toX(xMin)} y1={toYTop(yhat(xMin))}
          x2={toX(xMax)} y2={toYTop(yhat(xMax))}
          stroke="#FFD700" strokeWidth={2.5}
        />
        {pts.map((p, i) => (
          <line
            key={`r${i}`}
            x1={toX(p.x)} y1={toYTop(p.y)}
            x2={toX(p.x)} y2={toYTop(yhat(p.x))}
            stroke="#ef4444" strokeWidth={1.2} strokeDasharray="3 3"
          />
        ))}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.x)} cy={toYTop(p.y)} r={9}
            fill="#60a5fa" stroke="#fff" strokeWidth={1.5}
            onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
            style={{ cursor: 'grab' }}
          />
        ))}

        {/* Bottom: residual plot */}
        <text x={W / 2} y={H_TOP + 30} fill="rgba(255,255,255,0.7)" fontSize={12} textAnchor="middle">תרשים שאריות (e = y - ŷ)</text>
        <line x1={X0} y1={Y1_BOT} x2={X1} y2={Y1_BOT} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={Y0_BOT} x2={X0} y2={Y1_BOT} stroke="rgba(255,255,255,0.4)" />
        {/* Zero reference line */}
        <line
          x1={X0} y1={toYBot(0)} x2={X1} y2={toYBot(0)}
          stroke="#FFD700" strokeWidth={1.5} strokeDasharray="5 4"
        />
        <text x={X1 - 10} y={toYBot(0) - 4} fill="#FFD700" fontSize={11} textAnchor="end">e = 0</text>
        {pts.map((p, i) => {
          const r = residuals[i]
          return (
            <g key={`rp${i}`}>
              <line
                x1={toX(p.x)} y1={toYBot(0)}
                x2={toX(p.x)} y2={toYBot(r)}
                stroke="rgba(239,68,68,0.5)" strokeWidth={1}
              />
              <circle
                cx={toX(p.x)} cy={toYBot(r)} r={6}
                fill={Math.abs(r) > 2 ? '#f59e0b' : '#60a5fa'}
                stroke="#fff" strokeWidth={1}
              />
            </g>
          )
        })}
        {/* Y axis ticks for residual */}
        {[-4, -2, 0, 2, 4].map(t => (
          <text key={t} x={X0 - 6} y={toYBot(t) + 4} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="end">{t}</text>
        ))}
      </svg>

      <div id="res-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div
        style={{
          padding: 10,
          background: hetero ? 'rgba(245,158,11,0.18)' : 'rgba(96,165,250,0.12)',
          border: '1px solid ' + (hetero ? '#f59e0b' : 'rgba(96,165,250,0.4)'),
          borderRadius: 8,
          fontSize: 13,
          marginTop: 8,
        }}
      >
        {hetero
          ? `⚠ זוהתה אי-הומוגניות שונות (heteroscedasticity). יחס שונויות = ${ratio.toFixed(2)}.`
          : `✓ השאריות נראות הומוגניות. יחס שונויות = ${ratio.toFixed(2)}.`}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setPts(base)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          איפוס
        </button>
        <button
          onClick={() => setPts(fanShape)}
          style={{ background: '#f59e0b', color: '#0B1B3E', border: 0, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
        >
          טעינת מניפה (heteroscedastic)
        </button>
      </div>
    </div>
  )
}
