/**
 * VarianceInteractive — drag dots on a number line, see squared deviations
 * from the mean rendered as squares (literal geometric variance). The total
 * area of all squares = sum of squared deviations. Variance = mean area.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 40
const X0 = PAD, X1 = W - PAD
const AXIS_Y = 230

export default function VarianceInteractive() {
  const [values, setValues] = useState<number[]>([3, 5, 6, 7, 9])
  const [drag, setDrag] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const min = 0, max = 14
  const toX = (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0)
  const fromX = (px: number) => Math.max(min, Math.min(max, min + ((px - X0) / (X1 - X0)) * (max - min)))

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sqDev = values.map(v => (v - mean) ** 2)
  const variance = sqDev.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(variance)

  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    setValues(prev => prev.map((v, i) => (i === drag ? Math.round(fromX(x) * 10) / 10 : v)))
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('var-formula')
    if (k && el) k.render(`\\sigma^2 = \\frac{1}{n}\\sum(x_i-\\bar{x})^2 = ${variance.toFixed(2)}, \\quad \\sigma = ${std.toFixed(2)}`, el, { throwOnError: false })
  }, [variance, std])

  // Pixel scale: 1 unit in data = pxPerUnit pixels
  const pxPerUnit = (X1 - X0) / (max - min)

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>שונות (Variance) — ריבועי הסטיות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>כל ריבוע מציג את (xᵢ − מ̄)². השונות = שטח ממוצע של הריבועים.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        {values.map((v, i) => {
          const side = Math.abs(v - mean) * pxPerUnit * 0.6
          const cx = toX(v)
          const cy = AXIS_Y - side / 2 - 18
          return (
            <rect key={`s${i}`} x={cx - side / 2} y={cy - side / 2} width={side} height={side}
              fill="rgba(255,99,99,0.2)" stroke="#ff6363" strokeWidth={1.5} />
          )
        })}
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        <line x1={toX(mean)} y1={AXIS_Y - 100} x2={toX(mean)} y2={AXIS_Y + 40} stroke="#FFD700" strokeWidth={2} strokeDasharray="6 4" />
        <text x={toX(mean)} y={AXIS_Y + 60} fill="#FFD700" fontSize={13} textAnchor="middle" fontWeight={700}>מ̄ = {mean.toFixed(2)}</text>
        {values.map((v, i) => (
          <circle key={`d${i}`} cx={toX(v)} cy={AXIS_Y} r={10} fill="#60a5fa" stroke="#fff" strokeWidth={2}
            onPointerDown={e => { setDrag(i); (e.target as Element).setPointerCapture(e.pointerId) }}
            style={{ cursor: 'grab' }} />
        ))}
        {[0, 2, 4, 6, 8, 10, 12, 14].map(t => (
          <text key={t} x={toX(t)} y={AXIS_Y + 22} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
        ))}
      </svg>
      <div id="var-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setValues([3, 5, 6, 7, 9])} style={{
        background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13,
      }}>איפוס</button>
    </div>
  )
}
