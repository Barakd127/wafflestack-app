/**
 * BinomialInteractive — discrete probability bars. Sliders n + p. Shows
 * the binomial distribution and converges visually toward normal as n grows.
 */
import { useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const logFact = (n: number): number => {
  let s = 0
  for (let i = 2; i <= n; i++) s += Math.log(i)
  return s
}
const binomial = (n: number, k: number, p: number) => {
  const logC = logFact(n) - logFact(k) - logFact(n - k)
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p))
}

export default function BinomialInteractive() {
  const [n, setN] = useState(20)
  const [p, setP] = useState(0.5)

  const probs: number[] = []
  for (let k = 0; k <= n; k++) probs.push(binomial(n, k, p))
  const maxP = Math.max(...probs)
  const barW = (X1 - X0) / (n + 1)
  const mean = n * p
  const std = Math.sqrt(n * p * (1 - p))

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('bin-formula')
    if (k && el) k.render(`X \\sim B(${n}, ${p.toFixed(2)}), \\quad \\mu = np = ${mean.toFixed(1)}, \\quad \\sigma = \\sqrt{np(1-p)} = ${std.toFixed(2)}`, el, { throwOnError: false })
  }, [n, p, mean, std])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>התפלגות בינומית — B(n, p)</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>n ניסויים בלתי תלויים, הסתברות הצלחה p. ככל ש-n גדל, הצורה מתקרבת לנורמלית.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {probs.map((pr, k) => {
          const h = (pr / maxP) * (Y1 - Y0)
          return <rect key={k} x={X0 + k * barW + 2} y={Y1 - h} width={barW - 4} height={h} fill="rgba(255,215,0,0.7)" stroke="#FFD700" strokeWidth={1} />
        })}
        <line x1={X0 + mean * barW + barW / 2} y1={Y0} x2={X0 + mean * barW + barW / 2} y2={Y1} stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 4" />
        <text x={X0 + mean * barW + barW / 2} y={Y0 - 4} fill="#60a5fa" fontSize={12} textAnchor="middle">μ = {mean.toFixed(1)}</text>
      </svg>
      <div id="bin-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <label style={{ fontSize: 13 }}>n: {n}<input type="range" min={1} max={50} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 13 }}>p: {p.toFixed(2)}<input type="range" min={0.05} max={0.95} step={0.01} value={p} onChange={e => setP(+e.target.value)} style={{ width: '100%' }} /></label>
      </div>
    </div>
  )
}
