/**
 * IQRInteractive — boxplot with draggable dots. Live IQR = Q3 − Q1. Outliers
 * (beyond 1.5·IQR) auto-highlight red. User reshapes dataset to see IQR.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 280, PAD = 40
const X0 = PAD, X1 = W - PAD
const Y_BOX = 130, BOX_H = 60

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
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>טווח רבעוני (IQR) — Boxplot</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור נקודות. נקודות מחוץ ל-1.5·IQR מסומנות באדום (חריגות).</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <line x1={toX(sorted[0])} y1={Y_BOX + BOX_H / 2} x2={toX(Q1)} y2={Y_BOX + BOX_H / 2} stroke="#FFD700" strokeWidth={2} />
        <line x1={toX(Q3)} y1={Y_BOX + BOX_H / 2} x2={toX(sorted[sorted.length - 1])} y2={Y_BOX + BOX_H / 2} stroke="#FFD700" strokeWidth={2} />
        <rect x={toX(Q1)} y={Y_BOX} width={toX(Q3) - toX(Q1)} height={BOX_H} fill="rgba(255,215,0,0.2)" stroke="#FFD700" strokeWidth={2} />
        <line x1={toX(Q2)} y1={Y_BOX} x2={toX(Q2)} y2={Y_BOX + BOX_H} stroke="#FFD700" strokeWidth={3} />
        {values.map((v, i) => {
          const outlier = v < fenceLo || v > fenceHi
          return (
            <circle key={i} cx={toX(v)} cy={Y_BOX + BOX_H + 30} r={9}
              fill={outlier ? '#ef4444' : '#60a5fa'} stroke="#fff" strokeWidth={1.5}
              onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
              style={{ cursor: 'grab' }} />
          )
        })}
        <text x={toX(Q1)} y={Y_BOX - 6} fill="#FFD700" fontSize={11} textAnchor="middle">Q₁</text>
        <text x={toX(Q2)} y={Y_BOX - 6} fill="#FFD700" fontSize={11} textAnchor="middle">חציון</text>
        <text x={toX(Q3)} y={Y_BOX - 6} fill="#FFD700" fontSize={11} textAnchor="middle">Q₃</text>
      </svg>
      <div id="iqr-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setValues([2, 4, 5, 6, 7, 8, 9, 10, 11, 13])} style={{
        background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
      }}>איפוס</button>
    </div>
  )
}
