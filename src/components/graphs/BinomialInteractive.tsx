/**
 * BinomialInteractive — discrete probability bars. Sliders n + p. Shows
 * the binomial distribution and converges visually toward normal as n grows.
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

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
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>מתוך n ניסיונות, כמה הצלחות סביר שנקבל?</h3>
      <p style={graphSubtitleStyle}>כל עמודה היא ההסתברות לקבל בדיוק מספר מסוים של הצלחות ב-n ניסיונות עצמאיים (למשל n הטלות מטבע). הזיזו את n ואת p (סיכוי ההצלחה בכל ניסיון) וראו איך צורת ההתפלגות זזה ומתקרבת לפעמון.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        {probs.map((pr, k) => {
          const h = (pr / maxP) * (Y1 - Y0)
          return <rect key={k} x={X0 + k * barW + 2} y={Y1 - h} width={barW - 4} height={h} fill={GC.blue} stroke={GC.ink} strokeWidth={1} />
        })}
        <line x1={X0 + mean * barW + barW / 2} y1={Y0} x2={X0 + mean * barW + barW / 2} y2={Y1} stroke={GC.gold} strokeWidth={2} strokeDasharray="4 4" />
        <text x={X0 + mean * barW + barW / 2} y={Y0 - 4} fill={GC.gold} fontSize={12} textAnchor="middle">μ = {mean.toFixed(1)}</text>
      </svg>
      <div id="bin-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ textAlign: 'center', fontSize: 13, color: GC.ink, marginBottom: 6 }}>בממוצע נצפה בערך <b style={{ color: GC.goldText }}>{mean.toFixed(1)}</b> הצלחות מתוך {n} (בפיזור טיפוסי של ±{std.toFixed(1)}).</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 13 }}>n: {n}<input type="range" min={1} max={50} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 13 }}>p: {p.toFixed(2)}<input type="range" min={0.05} max={0.95} step={0.01} value={p} onChange={e => setP(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
      </div>
    </div>
  )
}
