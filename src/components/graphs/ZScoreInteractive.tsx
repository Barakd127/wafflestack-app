/**
 * ZScoreInteractive — normal curve with a draggable x-point. Shows z = (x-μ)/σ
 * and percentile (left-tail area). μ + σ sliders.
 *
 * FIXED x-axis (Barak 2026-06-27): the axis used to auto-scale to μ±4σ, which
 * pinned the curve to the centre and made it the same width regardless of the
 * sliders — so changing μ or σ did nothing visible. The axis is now a FIXED
 * domain, so moving μ slides the whole bell left/right and changing σ visibly
 * narrows (less variance) or widens (more variance) it.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 340, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 92
// Fixed data domain — independent of μ/σ so the curve actually moves + reshapes.
const DMIN = -20, DMAX = 160

const HAND = "'Playpen Sans Hebrew', 'Assistant', sans-serif"
const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
// Cumulative N(0,1) via Abramowitz & Stegun rational approximation
const Phi = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804 * Math.exp(-z * z / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}

export default function ZScoreInteractive() {
  const [mu, setMu] = useState(70)
  const [sigma, setSigma] = useState(10)
  const [x, setX] = useState(82)
  const [drag, setDrag] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const toPx = (v: number) => X0 + ((v - DMIN) / (DMAX - DMIN)) * (X1 - X0)
  const fromPx = (p: number) => DMIN + ((p - X0) / (X1 - X0)) * (DMAX - DMIN)
  // Peak normalised to a constant display height, so the curve's WIDTH carries
  // the variance: small σ → tall narrow spike, large σ → wide shallow hill.
  const yScale = (px: number) => {
    const z = (fromPx(px) - mu) / sigma
    return Y1 - phi(z) / 0.4 * (Y1 - Y0)
  }

  const path = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) pts.push(`${p},${yScale(p)}`)
    return `M ${pts.join(' L ')}`
  })()

  const shadePath = (() => {
    const end = Math.max(X0, Math.min(X1, toPx(x)))
    const pts: string[] = [`${X0},${Y1}`]
    for (let p = X0; p <= end; p += 2) pts.push(`${p},${yScale(p)}`)
    pts.push(`${end},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  })()

  const z = (x - mu) / sigma
  const pct = Phi(z) * 100
  const ticks = [0, 20, 40, 60, 80, 100, 120, 140]

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    setX(Math.round(Math.max(DMIN, Math.min(DMAX, fromPx(px))) * 10) / 10)
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('zscore-formula')
    if (k && el) k.render(`z = \\frac{x - \\mu}{\\sigma} = \\frac{${x.toFixed(1)} - ${mu}}{${sigma}} = ${z.toFixed(2)}`, el, { throwOnError: false })
  }, [x, mu, sigma, z])

  return (
    <div dir="rtl" style={{ background: 'var(--sh-q-card-bg, #FCFDFF)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)', border: '1px solid rgba(127,155,217,0.22)', boxShadow: '0 6px 24px rgba(31,62,108,0.08)' }}>
      <h3 style={{ fontFamily: HAND, fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#1F3E6C' }}>ציון z (Z-Score) — גרור נקודה על הציר</h3>
      <p style={{ fontFamily: HAND, fontSize: 14, opacity: 0.8, marginBottom: 12 }}>הציון שלך עומד מעל {pct.toFixed(1)}% מהאוכלוסיה</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}
        style={{ touchAction: 'none' }}>
        <path d={shadePath} fill="rgba(242,175,19,0.28)" />
        <path d={path} stroke="#F2AF13" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(31,62,108,0.45)" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={toPx(t)} y1={Y1} x2={toPx(t)} y2={Y1 + 5} stroke="rgba(31,62,108,0.4)" />
            <text x={toPx(t)} y={Y1 + 18} fill="rgba(31,62,108,0.6)" fontSize={11} fontFamily={HAND} textAnchor="middle">{t}</text>
          </g>
        ))}
        <line x1={toPx(mu)} y1={Y0} x2={toPx(mu)} y2={Y1} stroke="#4E71DA" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={toPx(mu)} y={Y0 - 8} fill="#4E71DA" fontSize={13} fontFamily={HAND} fontWeight={700} textAnchor="middle">μ = {mu}</text>
        <circle cx={toPx(x)} cy={yScale(toPx(x))} r={10} fill="#1F3E6C" stroke="#F2AF13" strokeWidth={3}
          onPointerDown={e => { setDrag(true); (e.target as Element).setPointerCapture(e.pointerId) }}
          style={{ cursor: 'grab' }} />
        <text x={toPx(x)} y={Y1 + 38} fill="#9A7B1F" fontSize={14} fontFamily={HAND} textAnchor="middle" fontWeight={700}>x = {x.toFixed(1)}</text>
      </svg>
      <div id="zscore-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <p style={{ fontFamily: HAND, fontSize: 13, textAlign: 'center', color: '#4E71DA', margin: '0 0 10px' }}>
        הזיזו את μ — כל העקומה זזה ימינה/שמאלה · שנו את σ — העקומה מתרחבת (שונות גדולה) או מצטמצמת (שונות קטנה)
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4, fontFamily: HAND }}>
        <label style={{ fontSize: 14, fontWeight: 600 }}>μ (תוחלת / ממוצע): {mu}
          <input type="range" min={0} max={100} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ fontSize: 14, fontWeight: 600 }}>σ (סטיית תקן): {sigma}
          <input type="range" min={3} max={30} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
    </div>
  )
}
