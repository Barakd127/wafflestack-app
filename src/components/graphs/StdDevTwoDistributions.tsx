/**
 * StdDevTwoDistributions — two overlapping bell curves with same μ but
 * different σ. Slider for σ₂. Shows "same centre, different spread" visually.
 */
import { useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)

export default function StdDevTwoDistributions() {
  const [sigma1, setSigma1] = useState(1)
  const [sigma2, setSigma2] = useState(2.5)
  const mu = 0
  const xMin = -8, xMax = 8

  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const yMax = 0.42 / Math.min(sigma1, sigma2)
  const toY = (v: number) => Y1 - (v / yMax) * (Y1 - Y0)

  const curve = (sigma: number) => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) {
      const x = xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
      const y = phi((x - mu) / sigma) / sigma
      pts.push(`${p},${toY(y)}`)
    }
    return `M ${pts.join(' L ')}`
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('two-dist-formula')
    if (k && el) k.render(`\\sigma_1 = ${sigma1.toFixed(1)}, \\ \\sigma_2 = ${sigma2.toFixed(1)}, \\ \\text{same } \\mu = 0`, el, { throwOnError: false })
  }, [sigma1, sigma2])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>שתי התפלגויות — אותו מרכז, פיזור שונה</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור את הסטיות. ככל ש-σ גדלה, העקומה רחבה ושטוחה יותר. אותו μ — אך פיזור שונה לחלוטין.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={curve(sigma1)} stroke="#60a5fa" strokeWidth={2.5} fill="rgba(96,165,250,0.18)" />
        <path d={curve(sigma2)} stroke="#FFD700" strokeWidth={2.5} fill="rgba(255,215,0,0.14)" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={toPx(mu)} y1={Y0 - 6} x2={toPx(mu)} y2={Y1} stroke="rgba(255,255,255,0.4)" strokeDasharray="4 4" />
        <text x={toPx(mu)} y={Y0 - 10} fill="rgba(255,255,255,0.7)" fontSize={12} textAnchor="middle">μ = 0</text>
        {[-6, -4, -2, 0, 2, 4, 6].map(t => (
          <text key={t} x={toPx(t)} y={Y1 + 18} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
        ))}
        <text x={X1 - 6} y={Y0 + 14} fill="#60a5fa" fontSize={12} textAnchor="end">σ₁ = {sigma1.toFixed(1)}</text>
        <text x={X1 - 6} y={Y0 + 30} fill="#FFD700" fontSize={12} textAnchor="end">σ₂ = {sigma2.toFixed(1)}</text>
      </svg>
      <div id="two-dist-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 12 }}>σ₁: {sigma1.toFixed(1)}<input type="range" min={0.3} max={4} step={0.1} value={sigma1} onChange={e => setSigma1(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 12 }}>σ₂: {sigma2.toFixed(1)}<input type="range" min={0.3} max={4} step={0.1} value={sigma2} onChange={e => setSigma2(+e.target.value)} style={{ width: '100%' }} /></label>
      </div>
    </div>
  )
}
