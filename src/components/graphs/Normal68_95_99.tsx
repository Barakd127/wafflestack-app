/**
 * Normal68_95_99 — bell curve with ±1σ (gold, 68%), ±2σ (orange, 95%),
 * ±3σ (red, 99.7%) bands. Labels the canonical 68-95-99.7 rule visually.
 */
import { useState, useEffect } from 'react'

const W = 640, H = 340, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)

export default function Normal68_95_99() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const yAt = (v: number) => Y1 - phi((v - mu) / sigma) / 0.4 * (Y1 - Y0)

  const curvePath = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) {
      const xv = xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
      pts.push(`${p},${yAt(xv)}`)
    }
    return `M ${pts.join(' L ')}`
  })()

  const shadeBand = (kLo: number, kHi: number) => {
    const a = mu + kLo * sigma, b = mu + kHi * sigma
    const pts: string[] = [`${toPx(a)},${Y1}`]
    for (let v = a; v <= b; v += (b - a) / 80) pts.push(`${toPx(v)},${yAt(v)}`)
    pts.push(`${toPx(b)},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('rule-formula')
    if (k && el) k.render(`P(|X - \\mu| \\le \\sigma) \\approx 68\\%, \\ |X - \\mu| \\le 2\\sigma \\approx 95\\%, \\ |X - \\mu| \\le 3\\sigma \\approx 99.7\\%`, el, { throwOnError: false })
  }, [])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>כלל 68-95-99.7</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>בהתפלגות נורמלית: ±1σ מכיל 68% מהאוכלוסיה, ±2σ מכיל 95%, ±3σ מכיל 99.7%.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={shadeBand(-3, 3)} fill="rgba(239,68,68,0.25)" />
        <path d={shadeBand(-2, 2)} fill="rgba(249,115,22,0.30)" />
        <path d={shadeBand(-1, 1)} fill="rgba(255,215,0,0.45)" />
        <path d={curvePath} stroke="#fff" strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {[-3, -2, -1, 0, 1, 2, 3].map(k => (
          <g key={k}>
            <line x1={toPx(mu + k * sigma)} y1={Y1} x2={toPx(mu + k * sigma)} y2={Y1 + 5} stroke="rgba(255,255,255,0.5)" />
            <text x={toPx(mu + k * sigma)} y={Y1 + 20} fill="rgba(255,255,255,0.75)" fontSize={11} textAnchor="middle">{k === 0 ? 'μ' : `${k > 0 ? '+' : ''}${k}σ`}</text>
          </g>
        ))}
        <text x={toPx(mu)} y={Y0 + 16} fill="#FFD700" fontSize={14} textAnchor="middle" fontWeight={700}>68%</text>
        <text x={toPx(mu - 1.5 * sigma)} y={Y0 + 60} fill="#f97316" fontSize={12} textAnchor="middle" fontWeight={700}>95%</text>
        <text x={toPx(mu - 2.5 * sigma)} y={Y0 + 100} fill="#ef4444" fontSize={11} textAnchor="middle" fontWeight={700}>99.7%</text>
      </svg>
      <div id="rule-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 12 }}>μ: {mu}<input type="range" min={-5} max={5} step={0.5} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 12 }}>σ: {sigma.toFixed(1)}<input type="range" min={0.5} max={3} step={0.1} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} /></label>
      </div>
    </div>
  )
}
