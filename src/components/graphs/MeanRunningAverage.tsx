/**
 * MeanRunningAverage — Law of Large Numbers preview. Line chart of running
 * sample mean as n grows from 1 to 50. Live convergence toward true μ.
 * Sliders: true μ, true σ. Re-sample button regenerates the sequence.
 */
import { useState, useMemo, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

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
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>האם הממוצע מתייצב ככל שאוספים יותר נתונים? (חוק המספרים הגדולים)</h3>
      <p style={graphSubtitleStyle}>כל נקודה אפורה היא תצפית בודדת, והקו הזהוב הוא הממוצע המצטבר עד לאותו שלב. הזיזו את μ (הממוצע האמיתי) ואת σ (הפיזור), או דגמו מחדש, וראו איך הקו הזהוב מתנודד בהתחלה ואז מתקרב לקו הכחול (μ) ככל ש-n גדל.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={GC.axis} />
        <line x1={X0} y1={toY(mu)} x2={X1} y2={toY(mu)} stroke={GC.blue} strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={X1 - 6} y={toY(mu) - 4} fill={GC.blue} fontSize={12} textAnchor="end" fontFamily={GRAPH_FONT}>μ = {mu}</text>
        {series.samples.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="rgba(31,62,108,0.25)" />
        ))}
        <path d={runningPath} stroke={GC.gold} strokeWidth={2.5} fill="none" />
        {[0, 10, 20, 30, 40, 49].map(i => (
          <text key={i} x={toX(i)} y={Y1 + 18} fill={GC.axisText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>{i + 1}</text>
        ))}
        <text x={X0 - 24} y={Y0 + 8} fill={GC.axisText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT} transform={`rotate(-90 ${X0 - 24} ${Y0 + 8})`}>ערך</text>
      </svg>
      <div id="lln-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ textAlign: 'center', fontSize: 13, color: GC.ink }}>
        אחרי {series.running.length} תצפיות: הממוצע המצטבר = <b style={{ color: GC.goldText }}>{series.running[series.running.length - 1].toFixed(2)}</b> — מרחק מ-μ: {Math.abs(series.running[series.running.length - 1] - mu).toFixed(2)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 12 }}>μ אמיתי: {mu}<input type="range" min={20} max={80} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 12 }}>σ: {sigma}<input type="range" min={2} max={25} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
      </div>
      <button onClick={() => setSeed(s => s + 1)} style={{ background: GC.gold, color: GC.ink, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: GRAPH_FONT, fontSize: 13, fontWeight: 700, marginTop: 8 }}>דגום מחדש</button>
    </div>
  )
}
