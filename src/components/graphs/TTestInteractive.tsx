/**
 * TTestInteractive — t-distribution with df slider. Compare t-curve vs normal.
 * As df → ∞, t → N(0,1). Slider 1-50 shows convergence visually.
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

// Log-gamma via Lanczos approximation
const logGamma = (z: number): number => {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
  z -= 1
  let x = c[0]
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i)
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

const tPdf = (t: number, df: number) => {
  const num = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI)
  return Math.exp(num - ((df + 1) / 2) * Math.log(1 + (t * t) / df))
}

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)

export default function TTestInteractive() {
  const [df, setDf] = useState(5)
  const xMin = -5, xMax = 5
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const yMax = 0.42
  const toY = (v: number) => Y1 - (v / yMax) * (Y1 - Y0)

  const pathT = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) {
      const x = xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
      pts.push(`${p},${toY(tPdf(x, df))}`)
    }
    return `M ${pts.join(' L ')}`
  })()
  const pathN = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) {
      const x = xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
      pts.push(`${p},${toY(phi(x))}`)
    }
    return `M ${pts.join(' L ')}`
  })()

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('t-formula')
    if (k && el) k.render(`t \\sim t_{(${df})}, \\quad t \\to N(0,1) \\text{ as } df \\to \\infty`, el, { throwOnError: false })
  }, [df])

  return (
    <div dir="rtl" style={graphCardStyle}>
      <h3 style={graphTitleStyle}>מתי התפלגות t הופכת כמעט לזהה לעקומה הנורמלית?</h3>
      <p style={graphSubtitleStyle}>הקו הזהב הוא התפלגות t והקו הכחול המקווקו הוא ההתפלגות הנורמלית. גררו את df (דרגות חופש — גדל עם גודל המדגם) וראו איך ככל ש-df גדל שתי העקומות כמעט מתלכדות.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={pathN} stroke={GC.blue} strokeWidth={2} fill="none" strokeDasharray="6 4" />
        <path d={pathT} stroke={GC.gold} strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        {[-4, -2, 0, 2, 4].map(t => (
          <g key={t}><line x1={toPx(t)} y1={Y1} x2={toPx(t)} y2={Y1 + 4} stroke={GC.axis} />
            <text x={toPx(t)} y={Y1 + 18} fill={GC.axisText} fontSize={11} fontFamily={GRAPH_FONT} textAnchor="middle">{t}</text></g>
        ))}
        <text x={X1 - 6} y={Y0 + 14} fill={GC.gold} fontSize={12} fontFamily={GRAPH_FONT} textAnchor="end">t (df={df})</text>
        <text x={X1 - 6} y={Y0 + 30} fill={GC.blue} fontSize={12} fontFamily={GRAPH_FONT} textAnchor="end">N(0,1)</text>
      </svg>
      <div id="t-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <label style={{ fontSize: 13, fontFamily: GRAPH_FONT }}>df (דרגות חופש): {df}
        <input type="range" min={1} max={50} value={df} onChange={e => setDf(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} />
      </label>
    </div>
  )
}
