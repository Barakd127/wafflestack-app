/**
 * MedianInteractive — drag 7 dots on a number line; gold dot = median,
 * silver dot = mean. Demonstrates that median resists outliers while mean
 * does not (drag any dot far away → mean jumps, median stays).
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 280, PAD = 40
const X0 = PAD, X1 = W - PAD
const AXIS_Y = H - 90
const DOT_R = 12

export default function MedianInteractive() {
  const [values, setValues] = useState<number[]>([2, 3.5, 5, 6, 7.2, 8.5, 10])
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const min = 0, max = 20
  const toX = (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0)
  const fromX = (px: number) => Math.max(min, Math.min(max, min + ((px - X0) / (X1 - X0)) * (max - min)))

  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  const onPointerDown = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault()
    setDrag(i)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    setValues(prev => prev.map((v, i) => (i === drag ? Math.round(fromX(x) * 10) / 10 : v)))
  }
  const onPointerUp = () => setDrag(null)

  const reset = () => setValues([2, 3.5, 5, 6, 7.2, 8.5, 10])

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('median-formula')
    if (k && el) k.render(`\\text{median} = ${median.toFixed(2)} \\quad \\bar{x} = ${mean.toFixed(2)}`, el, { throwOnError: false })
  }, [median, mean])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>חציון מול ממוצע — גרור נקודה והשווה</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור נקודה אחת לקצה הציר וצפה כיצד הממוצע "נמשך" אחריה בעוד החציון נשאר יציב.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        style={{ touchAction: 'none' }}>
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        {[0, 5, 10, 15, 20].map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={AXIS_Y - 4} x2={toX(t)} y2={AXIS_Y + 4} stroke="rgba(255,255,255,0.4)" />
            <text x={toX(t)} y={AXIS_Y + 22} fill="rgba(255,255,255,0.6)" fontSize={12} textAnchor="middle">{t}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const isMed = sorted.indexOf(v) === Math.floor(sorted.length / 2) && i === values.findIndex(x => x === v)
          return (
            <circle key={i} cx={toX(v)} cy={AXIS_Y} r={DOT_R}
              fill={isMed ? '#FFD700' : '#60a5fa'}
              stroke="#fff" strokeWidth={2}
              onPointerDown={onPointerDown(i)}
              style={{ cursor: 'grab' }} />
          )
        })}
        <line x1={toX(mean)} y1={AXIS_Y - 60} x2={toX(mean)} y2={AXIS_Y + 30} stroke="#C0C0C0" strokeWidth={2} strokeDasharray="6 4" />
        <text x={toX(mean)} y={AXIS_Y - 70} fill="#C0C0C0" fontSize={13} textAnchor="middle" fontWeight={700}>ממוצע</text>
        <line x1={toX(median)} y1={AXIS_Y - 90} x2={toX(median)} y2={AXIS_Y + 30} stroke="#FFD700" strokeWidth={2} strokeDasharray="6 4" />
        <text x={toX(median)} y={AXIS_Y - 100} fill="#FFD700" fontSize={13} textAnchor="middle" fontWeight={700}>חציון</text>
      </svg>
      <div id="median-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={reset} style={{
        background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
      }}>איפוס</button>
    </div>
  )
}
