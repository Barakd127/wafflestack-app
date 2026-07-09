/**
 * HypothesisTestingInteractive — H0 vs H1 visualization. Two bell curves.
 * α-region (Type I), β-region (Type II), and statistical power = 1-β.
 * Slider: effect size δ. Slider: α.
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const phi = (z: number, mu = 0) => Math.exp(-0.5 * (z - mu) ** 2) / Math.sqrt(2 * Math.PI)
const Phi = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804 * Math.exp(-z * z / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}
const invPhi = (a: number) => {
  // crude bisection for inverse CDF — fine for slider use
  let lo = -6, hi = 6
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Phi(m) < a) lo = m; else hi = m }
  return (lo + hi) / 2
}

export default function HypothesisTestingInteractive() {
  const [delta, setDelta] = useState(1.5)
  const [alpha, setAlpha] = useState(0.05)
  const zCrit = invPhi(1 - alpha)
  const power = 1 - Phi(zCrit - delta)
  const beta = 1 - power

  const xMin = -4, xMax = 4 + delta
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const yMax = 0.42
  const toY = (v: number) => Y1 - (v / yMax) * (Y1 - Y0)

  const path = (mu: number) => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) {
      const x = xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
      pts.push(`${p},${toY(phi(x, mu))}`)
    }
    return `M ${pts.join(' L ')}`
  }
  const shade = (mu: number, a: number, b: number) => {
    const pts: string[] = [`${toPx(a)},${Y1}`]
    for (let v = a; v <= b; v += (b - a) / 60) pts.push(`${toPx(v)},${toY(phi(v, mu))}`)
    pts.push(`${toPx(b)},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('hyp-formula')
    if (k && el) k.render(`\\alpha = ${alpha.toFixed(3)}, \\quad \\beta = ${beta.toFixed(3)}, \\quad \\text{Power} = 1-\\beta = ${power.toFixed(3)}`, el, { throwOnError: false })
  }, [alpha, beta, power])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>מהו הסיכוי לטעות בהחלטה שלנו? (מבחן השערות: α, β ועוצמה)</h3>
      <p style={graphSubtitleStyle}>שתי עקומות: H₀ (אין אפקט) מול H₁ (יש אפקט). הזיזו את גודל האפקט δ ואת רמת המובהקות α וראו איך משתנים השטחים: אדום = סיכוי לטעות סוג I (α, לפסול אפקט שאינו קיים), כתום = טעות סוג II (β, לפספס אפקט אמיתי), ירוק = עוצמת המבחן (הסיכוי לזהות אפקט אמיתי).</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={shade(0, zCrit, xMax)} fill="rgba(239,68,68,0.4)" />
        <path d={shade(delta, xMin, zCrit)} fill="rgba(245,158,11,0.4)" />
        <path d={shade(delta, zCrit, xMax)} fill="rgba(16,185,129,0.35)" />
        <path d={path(0)} stroke={GC.blue} strokeWidth={2.5} fill="none" />
        <path d={path(delta)} stroke={GC.gold} strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={toPx(zCrit)} y1={Y0} x2={toPx(zCrit)} y2={Y1} stroke={GC.ink} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={toPx(zCrit)} y={Y0 - 4} fill={GC.ink} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>קריטי</text>
        <text x={toPx(0)} y={Y0 + 14} fill={GC.blue} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>H₀</text>
        <text x={toPx(delta)} y={Y0 + 14} fill={GC.goldText} fontSize={11} textAnchor="middle" fontFamily={GRAPH_FONT}>H₁</text>
      </svg>
      <div id="hyp-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 13 }}>אפקט (δ): {delta.toFixed(2)}<input type="range" min={0.1} max={4} step={0.1} value={delta} onChange={e => setDelta(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
        <label style={{ fontFamily: GRAPH_FONT, fontSize: 13 }}>α: {alpha.toFixed(3)}<input type="range" min={0.001} max={0.2} step={0.005} value={alpha} onChange={e => setAlpha(+e.target.value)} style={{ width: '100%', accentColor: GC.blue }} /></label>
      </div>
    </div>
  )
}
