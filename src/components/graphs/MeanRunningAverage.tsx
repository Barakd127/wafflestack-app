/**
 * MeanRunningAverage — Law of Large Numbers preview. Line chart of running
 * sample mean as n grows from 1 to 50. Live convergence toward true μ.
 * Sliders: true μ, true σ. Re-sample button regenerates the sequence.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const seedrand = (seed: number) => {
  let s = seed
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}
const boxMuller = (rng: () => number) => {
  let u = 0, v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function MeanRunningAverage() {
  const [mu, setMu] = useState(50)
  const [sigma, setSigma] = useState(10)
  const [seed, setSeed] = useState(1)

  const series = useMemo(() => {
    const N = 50
    const rng = seedrand(seed * 13 + 7)
    const samples: number[] = []
    const running: number[] = []
    let sum = 0
    for (let i = 0; i < N; i++) {
      const x = mu + sigma * boxMuller(rng)
      samples.push(x)
      sum += x
      running.push(sum / (i + 1))
    }
    return { samples, running }
  }, [mu, sigma, seed])

  const yMin = mu - 2 * sigma, yMax = mu + 2 * sigma
  const toX = (i: number) => X0 + (i / 49) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)

  const runningPath = `M ${series.running.map((v, i) => `${toX(i)},${toY(v)}`).join(' L ')}`

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('lln-formula')
    if (k && el) k.render(`\\bar{x}_n = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\xrightarrow{n \\to \\infty} \\mu = ${mu}`, el, { throwOnError: false })
  }, [mu])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>חוק המספרים הגדולים — התכנסות הממוצע</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>ככל ש-n גדל, הממוצע המדגמי מתקרב לממוצע האוכלוסיה האמיתי μ.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={toY(mu)} x2={X1} y2={toY(mu)} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={X1 - 6} y={toY(mu) - 4} fill="#60a5fa" fontSize={12} textAnchor="end">μ = {mu}</text>
        {series.samples.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="rgba(255,255,255,0.25)" />
        ))}
        <path d={runningPath} stroke="#FFD700" strokeWidth={2.5} fill="none" />
        {[0, 10, 20, 30, 40, 49].map(i => (
          <text key={i} x={toX(i)} y={Y1 + 18} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{i + 1}</text>
        ))}
        <text x={X0 - 24} y={Y0 + 8} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle" transform={`rotate(-90 ${X0 - 24} ${Y0 + 8})`}>ערך</text>
      </svg>
      <div id="lln-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 12 }}>μ אמיתי: {mu}<input type="range" min={20} max={80} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} /></label>
        <label style={{ fontSize: 12 }}>σ: {sigma}<input type="range" min={2} max={25} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} /></label>
      </div>
      <button onClick={() => setSeed(s => s + 1)} style={{ background: '#FFD700', color: '#0B1B3E', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, marginTop: 8 }}>דגום מחדש</button>
    </div>
  )
}
