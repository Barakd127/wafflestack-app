/**
 * ConfidenceIntervalInteractive — sample mean ± z·σ/√n. Sliders: n, σ, confidence.
 * Animated multiple-CI demo: shows 100 random CIs around true μ, highlights
 * those that miss μ (should match (1-α)·100 ≈ confidence%).
 */
import { useRef, useState, useEffect, useMemo } from 'react'

const W = 640, H = 360, PAD = 50
const X0 = PAD, X1 = W - PAD
const ROWS = 25
const ROW_H = 10

const Z_LOOKUP: Record<number, number> = { 80: 1.282, 90: 1.645, 95: 1.96, 99: 2.576 }

const randn = () => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function ConfidenceIntervalInteractive() {
  const [n, setN] = useState(30)
  const [sigma, setSigma] = useState(15)
  const [conf, setConf] = useState(95)
  const [seed, setSeed] = useState(0)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const trueMu = 100

  const z = Z_LOOKUP[conf]
  const se = sigma / Math.sqrt(n)
  const halfWidth = z * se

  const samples = useMemo(() => {
    const arr: { mean: number; lo: number; hi: number; covers: boolean }[] = []
    // Use seed to vary RNG sequence (re-roll on button click)
    const rng = () => randn() + seed * 0.0001
    for (let i = 0; i < ROWS; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) sum += trueMu + sigma * rng()
      const mean = sum / n
      const lo = mean - halfWidth, hi = mean + halfWidth
      arr.push({ mean, lo, hi, covers: lo <= trueMu && trueMu <= hi })
    }
    return arr
  }, [n, sigma, halfWidth, seed])

  const xMin = trueMu - 4 * sigma / Math.sqrt(n) * 3
  const xMax = trueMu + 4 * sigma / Math.sqrt(n) * 3
  const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const covered = samples.filter(s => s.covers).length

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('ci-formula')
    if (k && el) k.render(`\\bar{x} \\pm z_{${conf}\\%} \\cdot \\frac{\\sigma}{\\sqrt{n}} = \\bar{x} \\pm ${halfWidth.toFixed(2)}`, el, { throwOnError: false })
  }, [conf, halfWidth])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>רווח סמך (Confidence Interval)</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>{ROWS} מדגמים שונים, μ אמיתי = 100. רווחים מכסים את μ: {covered}/{ROWS} ({((covered / ROWS) * 100).toFixed(0)}%)</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ touchAction: 'none' }}>
        <line x1={toX(trueMu)} y1={PAD - 10} x2={toX(trueMu)} y2={H - PAD} stroke="#FFD700" strokeWidth={2} strokeDasharray="6 4" />
        <text x={toX(trueMu)} y={PAD - 14} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight={700}>μ = 100</text>
        {samples.map((s, i) => (
          <g key={i}>
            <line x1={toX(s.lo)} y1={PAD + i * ROW_H + 6} x2={toX(s.hi)} y2={PAD + i * ROW_H + 6} stroke={s.covers ? '#10b981' : '#ef4444'} strokeWidth={2.5} />
            <circle cx={toX(s.mean)} cy={PAD + i * ROW_H + 6} r={3} fill="#fff" />
          </g>
        ))}
      </svg>
      <div id="ci-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 12 }}>n: {n}<input type="range" min={5} max={200} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 12 }}>σ: {sigma}<input type="range" min={5} max={40} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 12 }}>סמך %: {conf}
          <select value={conf} onChange={e => setConf(+e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: 4 }}>
            <option value={80}>80%</option><option value={90}>90%</option><option value={95}>95%</option><option value={99}>99%</option>
          </select>
        </label>
      </div>
      <button onClick={() => setSeed(s => s + 1)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, marginTop: 8 }}>דגום מחדש</button>
    </div>
  )
}
