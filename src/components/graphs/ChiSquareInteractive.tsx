/**
 * ChiSquareInteractive — observed vs expected counts. Bar chart with two
 * series. χ² = Σ (O−E)²/E. Sliders for each category's observed value.
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

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
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={{ ...graphTitleStyle, fontSize: 18 }}>כמה רחוקות התוצאות שקיבלנו ממה שציפינו?</h3>
      <p style={{ ...graphSubtitleStyle, fontSize: 13 }}>לכל קטגוריה יש עמודה כחולה (הערך הצפוי E) ועמודה זהובה (מה שנצפה בפועל O). הזיזו את הערכים הנצפים וראו איך χ² גדל ככל שהפער בין נצפה לצפוי גדל — χ² מסכם את כל הפערים למספר אחד.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        {CATS.map((c, i) => {
          const baseX = X0 + i * groupW + 8
          return (
            <g key={c}>
              <rect x={baseX} y={toY(EXPECTED[i])} width={barW} height={Y1 - toY(EXPECTED[i])} fill="rgba(78,113,218,0.6)" stroke={GC.blue} />
              <rect x={baseX + barW + 4} y={toY(observed[i])} width={barW} height={Y1 - toY(observed[i])} fill={GC.goldFill} stroke={GC.gold} />
              <text x={baseX + groupW / 2 - 4} y={Y1 + 18} fill={GC.axisText} fontSize={12} textAnchor="middle">{c}</text>
              <text x={baseX + barW / 2} y={toY(EXPECTED[i]) - 4} fill={GC.blue} fontSize={10} textAnchor="middle">{EXPECTED[i]}</text>
              <text x={baseX + barW + 4 + barW / 2} y={toY(observed[i]) - 4} fill={GC.goldText} fontSize={10} textAnchor="middle">{observed[i]}</text>
            </g>
          )
        })}
      </svg>
      <div id="chi-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ textAlign: 'center', fontSize: 13, color: GC.ink, marginBottom: 6 }}>סך הפער הנוכחי: <b style={{ color: GC.goldText }}>χ² = {chi2.toFixed(2)}</b> — ככל שהמספר גדול יותר, הנתונים רחוקים יותר ממה שציפינו.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
        {CATS.map((c, i) => (
          <label key={c} style={{ fontFamily: GRAPH_FONT, fontSize: 12 }}>O({c}): {observed[i]}
            <input type="range" min={0} max={60} value={observed[i]} onChange={e => setObserved(p => { const cp = [...p]; cp[i] = +e.target.value; return cp })} style={{ width: '100%', accentColor: GC.blue }} />
          </label>
        ))}
      </div>
    </div>
  )
}
