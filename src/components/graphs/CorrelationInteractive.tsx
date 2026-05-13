/**
 * CorrelationInteractive — 12 draggable scatter points. Pearson r computed
 * live. OLS regression line drawn. Points colored by their quadrant
 * relative to (mean_x, mean_y). r → ±1 as user shapes the cloud.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 380, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 60

type P = { x: number; y: number }

const initial: P[] = [
  { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4.5 },
  { x: 5, y: 6 }, { x: 6, y: 5.5 }, { x: 7, y: 7 }, { x: 8, y: 7.5 },
  { x: 9, y: 8 }, { x: 10, y: 8.5 }, { x: 11, y: 9 }, { x: 12, y: 10 },
]

export default function CorrelationInteractive() {
  const [pts, setPts] = useState<P[]>(initial)
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const xMin = 0, xMax = 14, yMin = 0, yMax = 12
  const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)
  const fromX = (p: number) => xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
  const fromY = (p: number) => yMin + ((Y1 - p) / (Y1 - Y0)) * (yMax - yMin)

  // Stats
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  const syy = pts.reduce((s, p) => s + (p.y - my) ** 2, 0)
  const r = sxy / Math.sqrt(sxx * syy)
  const slope = sxy / sxx
  const intercept = my - slope * mx

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const rb = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rb.left) / rb.width) * W
    const py = ((e.clientY - rb.top) / rb.height) * H
    setPts(prev => prev.map((p, i) => i === drag
      ? { x: Math.max(xMin, Math.min(xMax, Math.round(fromX(px) * 10) / 10)),
          y: Math.max(yMin, Math.min(yMax, Math.round(fromY(py) * 10) / 10)) }
      : p))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('corr-formula')
    if (k && el) k.render(`r = ${r.toFixed(3)}, \\quad \\hat{y} = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`, el, { throwOnError: false })
  }, [r, slope, intercept])

  const lineX1 = xMin, lineX2 = xMax
  const lineY1 = slope * lineX1 + intercept, lineY2 = slope * lineX2 + intercept

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>קורלציה (Correlation) — מקדם Pearson</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור נקודות. r מתעדכן בזמן אמת. צבע כל נקודה לפי הרבע שלה ביחס לממוצעים.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={toX(mx)} y1={Y0} x2={toX(mx)} y2={Y1} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
        <line x1={X0} y1={toY(my)} x2={X1} y2={toY(my)} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
        <line x1={toX(lineX1)} y1={toY(lineY1)} x2={toX(lineX2)} y2={toY(lineY2)} stroke="#FFD700" strokeWidth={2.5} />
        {pts.map((p, i) => {
          const dx = p.x - mx, dy = p.y - my
          const color = dx * dy >= 0 ? '#10b981' : '#ef4444'
          return (
            <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={9} fill={color} stroke="#fff" strokeWidth={1.5}
              onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
              style={{ cursor: 'grab' }} />
          )
        })}
        <text x={X1 - 6} y={Y0 + 12} fill="rgba(255,255,255,0.5)" fontSize={11} textAnchor="end">r = {r.toFixed(3)}</text>
      </svg>
      <div id="corr-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setPts(initial)} style={{
        background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
      }}>איפוס</button>
    </div>
  )
}
