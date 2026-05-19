/**
 * ANOVAInteractive — 3 groups of dots. Within-group variance vs between-group.
 * F = MSB/MSW. Drag group means via slider. Visualize partition of variance.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 340, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const groupColors = ['#60a5fa', '#10b981', '#f59e0b']

const randn = (seed: number) => {
  let s = seed
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  return () => {
    let u = 0, v = 0
    while (u === 0) u = r()
    while (v === 0) v = r()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

export default function ANOVAInteractive() {
  const [means, setMeans] = useState<[number, number, number]>([4, 5, 6])
  const [spread, setSpread] = useState(1)

  const groups = useMemo(() => {
    const out: number[][] = [[], [], []]
    for (let g = 0; g < 3; g++) {
      const rn = randn(g * 1009 + 17)
      for (let i = 0; i < 12; i++) out[g].push(means[g] + spread * rn())
    }
    return out
  }, [means, spread])

  const grandMean = groups.flat().reduce((a, b) => a + b, 0) / 36
  const groupMeans = groups.map(g => g.reduce((a, b) => a + b, 0) / g.length)
  const ssB = groupMeans.reduce((s, m) => s + 12 * (m - grandMean) ** 2, 0)
  const ssW = groups.reduce((s, g, gi) => s + g.reduce((ss, v) => ss + (v - groupMeans[gi]) ** 2, 0), 0)
  const msB = ssB / 2, msW = ssW / 33
  const F = msB / msW

  const yMin = 0, yMax = 12
  const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('anova-formula')
    if (k && el) k.render(`F = \\frac{MS_B}{MS_W} = \\frac{${msB.toFixed(2)}}{${msW.toFixed(2)}} = ${F.toFixed(2)}`, el, { throwOnError: false })
  }, [F, msB, msW])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>ANOVA — שונות בין קבוצות מול בתוך קבוצות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור את הממוצעים של 3 הקבוצות. F גדל כשההפרשים בין הקבוצות גדולים יחסית לפיזור בתוך כל קבוצה.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={toY(grandMean)} x2={X1} y2={toY(grandMean)} stroke="#fff" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={X1 - 6} y={toY(grandMean) - 4} fill="#fff" fontSize={11} textAnchor="end">ממוצע כללי = {grandMean.toFixed(2)}</text>
        {groups.map((g, gi) => {
          const cx = X0 + (gi + 0.5) * (X1 - X0) / 3
          return (
            <g key={gi}>
              {g.map((v, i) => <circle key={i} cx={cx + ((i % 4) - 1.5) * 14} cy={toY(v)} r={5} fill={groupColors[gi]} stroke="#fff" strokeWidth={1} />)}
              <line x1={cx - 50} y1={toY(groupMeans[gi])} x2={cx + 50} y2={toY(groupMeans[gi])} stroke={groupColors[gi]} strokeWidth={3} />
              <text x={cx} y={Y1 + 22} fill={groupColors[gi]} fontSize={12} textAnchor="middle" fontWeight={700}>קבוצה {gi + 1}: {groupMeans[gi].toFixed(2)}</text>
            </g>
          )
        })}
      </svg>
      <div id="anova-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
        {means.map((m, i) => (
          <label key={i} style={{ fontSize: 12 }}>μ{i + 1}: {m.toFixed(1)}
            <input type="range" min={1} max={11} step={0.1} value={m} onChange={e => setMeans(p => { const c = [...p] as [number, number, number]; c[i] = +e.target.value; return c })} style={{ width: '100%' }} />
          </label>
        ))}
        <label style={{ fontSize: 12 }}>פיזור: {spread.toFixed(1)}<input type="range" min={0.2} max={3} step={0.1} value={spread} onChange={e => setSpread(+e.target.value)} style={{ width: '100%' }} /></label>
      </div>
    </div>
  )
}
