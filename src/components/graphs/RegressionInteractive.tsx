/**
 * RegressionInteractive — 10 draggable scatter points. OLS line. Live β₀, β₁, R².
 * Residuals as vertical red segments. Toggle "add outlier" to see leverage.
 */
import { useRef, useState, useEffect } from 'react'
import { GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 380, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 60
type P = { x: number; y: number }

const base: P[] = [
  { x: 1, y: 2.2 }, { x: 2, y: 2.9 }, { x: 3, y: 4 }, { x: 4, y: 4.6 }, { x: 5, y: 6 },
  { x: 6, y: 6.4 }, { x: 7, y: 7.5 }, { x: 8, y: 8.1 }, { x: 9, y: 9 }, { x: 10, y: 9.7 },
]

export default function RegressionInteractive() {
  const [pts, setPts] = useState<P[]>(base)
  const [outlier, setOutlier] = useState(false)
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const all = outlier ? [...pts, { x: 12, y: 1 }] : pts
  const n = all.length
  const mx = all.reduce((s, p) => s + p.x, 0) / n
  const my = all.reduce((s, p) => s + p.y, 0) / n
  const sxy = all.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const sxx = all.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const yhat = (x: number) => slope * x + intercept
  const ssRes = all.reduce((s, p) => s + (p.y - yhat(p.x)) ** 2, 0)
  const ssTot = all.reduce((s, p) => s + (p.y - my) ** 2, 0)
  const r2 = 1 - ssRes / ssTot

  const xMin = 0, xMax = 14, yMin = -2, yMax = 12
  const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const rb = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rb.left) / rb.width) * W
    const py = ((e.clientY - rb.top) / rb.height) * H
    setPts(prev => prev.map((p, i) => i === drag
      ? { x: Math.max(xMin, Math.min(xMax - 2, Math.round((xMin + ((px - X0) / (X1 - X0)) * (xMax - xMin)) * 10) / 10)),
          y: Math.max(yMin, Math.min(yMax, Math.round((yMin + ((Y1 - py) / (Y1 - Y0)) * (yMax - yMin)) * 10) / 10)) }
      : p))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('reg-formula')
    if (k && el) k.render(`\\hat{y} = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}, \\quad R^2 = ${r2.toFixed(3)}`, el, { throwOnError: false })
  }, [slope, intercept, r2])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>איזה קו ישר מתאר הכי טוב את הקשר בין הנקודות?</h3>
      <p style={graphSubtitleStyle}>גררו נקודות ושימו לב איך הקו (המותאם בשיטת הריבועים הפחותים, OLS) והערכים β₀ (חיתוך), β₁ (שיפוע) ו-R² מתעדכנים מתחת לגרף. הקווים האדומים הם השאריות — המרחק בין כל נקודה לקו. הכפתור מוסיף תצפית חריגה כדי לראות כמה היא מושכת את הקו.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={GC.axis} />
        <line x1={toX(xMin)} y1={toY(yhat(xMin))} x2={toX(xMax)} y2={toY(yhat(xMax))} stroke={GC.gold} strokeWidth={2.5} />
        {all.map((p, i) => (
          <line key={`r${i}`} x1={toX(p.x)} y1={toY(p.y)} x2={toX(p.x)} y2={toY(yhat(p.x))} stroke={GC.warn} strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={9} fill={GC.blue} stroke={GC.ink} strokeWidth={1.5}
            onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
            style={{ cursor: 'grab' }} />
        ))}
        {outlier && <circle cx={toX(12)} cy={toY(1)} r={10} fill={GC.gold} stroke={GC.ink} strokeWidth={2} />}
      </svg>
      <div id="reg-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={() => setPts(base)} style={{ background: 'rgba(31,62,108,0.1)', color: GC.ink, border: '1px solid rgba(31,62,108,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>איפוס</button>
        <button onClick={() => setOutlier(!outlier)} style={{ background: outlier ? GC.gold : 'rgba(31,62,108,0.1)', color: GC.ink, border: '1px solid rgba(31,62,108,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: outlier ? 700 : 400 }}>{outlier ? 'הסר חריגה' : 'הוסף חריגה'}</button>
      </div>
    </div>
  )
}
