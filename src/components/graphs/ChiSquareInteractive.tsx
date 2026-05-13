/**
 * ChiSquareInteractive — observed vs expected counts. Bar chart with two
 * series. χ² = Σ (O−E)²/E. Sliders for each category's observed value.
 */
import { useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

const CATS = ['A', 'B', 'C', 'D']
const EXPECTED = [25, 25, 25, 25]

export default function ChiSquareInteractive() {
  const [observed, setObserved] = useState<number[]>([28, 22, 30, 20])
  const chi2 = observed.reduce((s, o, i) => s + ((o - EXPECTED[i]) ** 2) / EXPECTED[i], 0)
  const df = CATS.length - 1

  const yMax = Math.max(...observed, ...EXPECTED) + 5
  const toY = (v: number) => Y1 - (v / yMax) * (Y1 - Y0)
  const groupW = (X1 - X0) / CATS.length
  const barW = (groupW - 16) / 2

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('chi-formula')
    if (k && el) k.render(`\\chi^2 = \\sum\\frac{(O-E)^2}{E} = ${chi2.toFixed(2)}, \\quad df = ${df}`, el, { throwOnError: false })
  }, [chi2])

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>מבחן χ² (Chi-Square) — נצפה מול צפוי</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>זהב = נצפה (O), כחול = צפוי (E). χ² גדל כשהפער בין O ל-E גדל.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {CATS.map((c, i) => {
          const baseX = X0 + i * groupW + 8
          return (
            <g key={c}>
              <rect x={baseX} y={toY(EXPECTED[i])} width={barW} height={Y1 - toY(EXPECTED[i])} fill="rgba(96,165,250,0.6)" stroke="#60a5fa" />
              <rect x={baseX + barW + 4} y={toY(observed[i])} width={barW} height={Y1 - toY(observed[i])} fill="rgba(255,215,0,0.7)" stroke="#FFD700" />
              <text x={baseX + groupW / 2 - 4} y={Y1 + 18} fill="rgba(255,255,255,0.8)" fontSize={12} textAnchor="middle">{c}</text>
              <text x={baseX + barW / 2} y={toY(EXPECTED[i]) - 4} fill="#60a5fa" fontSize={10} textAnchor="middle">{EXPECTED[i]}</text>
              <text x={baseX + barW + 4 + barW / 2} y={toY(observed[i]) - 4} fill="#FFD700" fontSize={10} textAnchor="middle">{observed[i]}</text>
            </g>
          )
        })}
      </svg>
      <div id="chi-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
        {CATS.map((c, i) => (
          <label key={c} style={{ fontSize: 12 }}>O({c}): {observed[i]}
            <input type="range" min={0} max={60} value={observed[i]} onChange={e => setObserved(p => { const cp = [...p]; cp[i] = +e.target.value; return cp })} style={{ width: '100%' }} />
          </label>
        ))}
      </div>
    </div>
  )
}
