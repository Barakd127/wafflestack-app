/**
 * IQRInteractive — boxplot with draggable dots. Live IQR = Q3 − Q1. Outliers
 * (beyond 1.5·IQR) auto-highlight red. User reshapes dataset to see IQR.
 */
import { useRef, useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 280, PAD = 40
const X0 = PAD, X1 = W - PAD
const Y_BOX = 130, BOX_H = 60

// Themed navy stroke used in the boxplot SVG (SVG attrs can't resolve CSS vars).
const NAVY = GC.ink

const quantile = (sorted: number[], q: number) => {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos), hi = Math.ceil(pos)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export default function IQRInteractive() {
  const [values, setValues] = useState<number[]>([2, 4, 5, 6, 7, 8, 9, 10, 11, 13])
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const min = 0, max = 20
  const toX = (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0)
  const fromX = (px: number) => Math.max(min, Math.min(max, min + ((px - X0) / (X1 - X0)) * (max - min)))

  const sorted = [...values].sort((a, b) => a - b)
  const Q1 = quantile(sorted, 0.25), Q2 = quantile(sorted, 0.5), Q3 = quantile(sorted, 0.75)
  const iqr = Q3 - Q1
  const fenceLo = Q1 - 1.5 * iqr, fenceHi = Q3 + 1.5 * iqr

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    setValues(prev => prev.map((v, i) => (i === drag ? Math.round(fromX(x) * 10) / 10 : v)))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('iqr-formula')
    if (k && el) k.render(`Q_1=${Q1.toFixed(1)}, \\ Q_2=${Q2.toFixed(1)}, \\ Q_3=${Q3.toFixed(1)}, \\ \\text{IQR}=${iqr.toFixed(2)}`, el, { throwOnError: false })
  }, [Q1, Q2, Q3, iqr])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>כמה מפוזר האמצע של הנתונים? (טווח בין-רבעוני, IQR)</h3>
      <p style={{ ...graphSubtitleStyle, lineHeight: 1.5 }}>כל נקודה היא ערך בקבוצת נתונים, והקופסה מציגה את ה-50% האמצעיים. גררו נקודה וראו איך ה-IQR (רוחב הקופסה, Q₃ פחות Q₁) משתנה. נקודה רחוקה מדי — מעבר ל-1.5 פעמים ה-IQR — נצבעת באדום כ"חריגה".</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <line x1={toX(sorted[0])} y1={Y_BOX + BOX_H / 2} x2={toX(Q1)} y2={Y_BOX + BOX_H / 2} stroke={GC.gold} strokeWidth={2} />
        <line x1={toX(Q3)} y1={Y_BOX + BOX_H / 2} x2={toX(sorted[sorted.length - 1])} y2={Y_BOX + BOX_H / 2} stroke={GC.gold} strokeWidth={2} />
        <rect x={toX(Q1)} y={Y_BOX} width={toX(Q3) - toX(Q1)} height={BOX_H} fill={GC.goldFill} stroke={GC.gold} strokeWidth={2} />
        <line x1={toX(Q2)} y1={Y_BOX} x2={toX(Q2)} y2={Y_BOX + BOX_H} stroke={GC.gold} strokeWidth={3} />
        {values.map((v, i) => {
          const outlier = v < fenceLo || v > fenceHi
          return (
            <circle key={i} cx={toX(v)} cy={Y_BOX + BOX_H + 30} r={9}
              fill={outlier ? GC.warn : GC.blue} stroke={NAVY} strokeWidth={1.5}
              onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
              style={{ cursor: 'grab' }} />
          )
        })}
        <text x={toX(Q1)} y={Y_BOX - 6} fill={GC.goldText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>Q₁</text>
        <text x={toX(Q2)} y={Y_BOX - 6} fill={GC.goldText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>חציון</text>
        <text x={toX(Q3)} y={Y_BOX - 6} fill={GC.goldText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>Q₃</text>
      </svg>
      <div id="iqr-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setValues([2, 4, 5, 6, 7, 8, 9, 10, 11, 13])} style={{
        background: 'rgba(31,62,108,0.10)', color: GC.ink, border: '1px solid rgba(31,62,108,0.20)',
        borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontFamily: GRAPH_FONT, fontSize: 14, fontWeight: 600, minHeight: 44,
      }}>איפוס</button>
    </div>
  )
}
