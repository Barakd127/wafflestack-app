/**
 * MeanVsMedianVsMode — histogram with 3 vertical markers (gold mean,
 * silver median, purple mode). Drag bars up/down to reshape distribution.
 * Shows when the 3 measures disagree (skewed distributions).
 */
import { useState, useRef, useEffect } from 'react'

const W = 640, H = 360, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

const BIN_COUNT = 10
const INITIAL_HEIGHTS = [2, 5, 9, 12, 14, 11, 7, 4, 2, 1]

export default function MeanVsMedianVsMode() {
  const [heights, setHeights] = useState<number[]>(INITIAL_HEIGHTS)
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const total = heights.reduce((a, b) => a + b, 0)
  // Treat each bin's center as its data value (0.5, 1.5, …, 9.5)
  const meanX = heights.reduce((s, h, i) => s + h * (i + 0.5), 0) / total
  // Median: cumulative half-total
  const half = total / 2
  let cum = 0
  let medianX = 0
  for (let i = 0; i < BIN_COUNT; i++) {
    if (cum + heights[i] >= half) {
      const frac = (half - cum) / heights[i]
      medianX = i + frac
      break
    }
    cum += heights[i]
  }
  const modeIdx = heights.reduce((mi, h, i) => h > heights[mi] ? i : mi, 0)
  const modeX = modeIdx + 0.5

  const maxH = Math.max(...heights, 1)
  const binW = (X1 - X0) / BIN_COUNT
  const toX = (v: number) => X0 + (v / BIN_COUNT) * (X1 - X0)
  const toY = (v: number) => Y1 - (v / maxH) * (Y1 - Y0)

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const py = ((e.clientY - r.top) / r.height) * H
    const newH = Math.max(0, Math.min(20, Math.round((maxH * (Y1 - py)) / (Y1 - Y0))))
    setHeights(prev => prev.map((h, i) => (i === drag ? newH : h)))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('mmm-formula')
    if (k && el) k.render(`\\bar{x} = ${meanX.toFixed(2)}, \\ \\text{med} = ${medianX.toFixed(2)}, \\ \\text{mode} = ${modeX.toFixed(2)}`, el, { throwOnError: false })
  }, [meanX, medianX, modeX])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>ממוצע מול חציון ושכיח — מתי הם נפרדים</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור עמודות מעלה ומטה. כשההתפלגות סימטרית — שלושת המדדים שווים. כשהיא מוטה — הם מתפצלים.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {heights.map((h, i) => (
          <rect key={i} x={X0 + i * binW + 2} y={toY(h)} width={binW - 4} height={Y1 - toY(h)}
            fill="rgba(96,165,250,0.55)" stroke="#60a5fa" strokeWidth={1.5}
            onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
            style={{ cursor: 'ns-resize' }} />
        ))}
        <line x1={toX(meanX)} y1={Y0 - 8} x2={toX(meanX)} y2={Y1 + 6} stroke="#FFD700" strokeWidth={2.5} />
        <text x={toX(meanX)} y={Y0 - 14} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight={700}>ממוצע</text>
        <line x1={toX(medianX)} y1={Y0 - 8} x2={toX(medianX)} y2={Y1 + 6} stroke="#C0C0C0" strokeWidth={2.5} strokeDasharray="5 3" />
        <text x={toX(medianX)} y={Y0 - 28} fill="#C0C0C0" fontSize={12} textAnchor="middle" fontWeight={700}>חציון</text>
        <line x1={toX(modeX)} y1={Y0 - 8} x2={toX(modeX)} y2={Y1 + 6} stroke="#A855F7" strokeWidth={2.5} strokeDasharray="2 4" />
        <text x={toX(modeX)} y={Y0 - 42} fill="#A855F7" fontSize={12} textAnchor="middle" fontWeight={700}>שכיח</text>
      </svg>
      <div id="mmm-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setHeights(INITIAL_HEIGHTS)} style={{
        background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
      }}>איפוס לסימטריה</button>
    </div>
  )
}
