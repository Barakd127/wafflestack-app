/**
 * ZScoreInteractive — bell curve with draggable x-point. Shows z = (x-μ)/σ
 * and percentile (left-tail area via Simpson's rule). μ + σ sliders.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

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

  const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const fromPx = (p: number) => xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
  const yScale = (px: number) => {
    const xv = fromPx(px)
    const z = (xv - mu) / sigma
    return Y1 - phi(z) / 0.4 * (Y1 - Y0)
  }

  const path = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) pts.push(`${p},${yScale(p)}`)
    return `M ${pts.join(' L ')}`
  })()

  const shadePath = (() => {
    const pts: string[] = [`${X0},${Y1}`]
    for (let p = X0; p <= toPx(x); p += 2) pts.push(`${p},${yScale(p)}`)
    pts.push(`${toPx(x)},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  })()

  const z = (x - mu) / sigma
  const pct = Phi(z) * 100

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    setX(Math.round(Math.max(xMin, Math.min(xMax, fromPx(px))) * 10) / 10)
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('zscore-formula')
    if (k && el) k.render(`z = \\frac{x - \\mu}{\\sigma} = \\frac{${x.toFixed(1)} - ${mu}}{${sigma}} = ${z.toFixed(2)}`, el, { throwOnError: false })
  }, [x, mu, sigma, z])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>ציון z (Z-Score) — גרור נקודה על הציר</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>הציון שלך עומד מעל {pct.toFixed(1)}% מהאוכלוסיה</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}
        style={{ touchAction: 'none' }}>
        <path d={shadePath} fill="rgba(255,215,0,0.3)" />
        <path d={path} stroke="#FFD700" strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={toPx(mu)} y1={Y0} x2={toPx(mu)} y2={Y1} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={toPx(mu)} y={Y0 - 6} fill="#60a5fa" fontSize={12} textAnchor="middle">μ = {mu}</text>
        <circle cx={toPx(x)} cy={yScale(toPx(x))} r={10} fill="#fff" stroke="#FFD700" strokeWidth={3}
          onPointerDown={e => { setDrag(true); (e.target as Element).setPointerCapture(e.pointerId) }}
          style={{ cursor: 'grab' }} />
        <text x={toPx(x)} y={Y1 + 22} fill="#FFD700" fontSize={13} textAnchor="middle" fontWeight={700}>x = {x.toFixed(1)}</text>
      </svg>
      <div id="zscore-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>μ (ממוצע): {mu}
          <input type="range" min={0} max={100} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ fontSize: 13 }}>σ (סטיית תקן): {sigma}
          <input type="range" min={1} max={30} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
    </div>
  )
}
