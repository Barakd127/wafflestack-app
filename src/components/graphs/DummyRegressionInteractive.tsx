/**
 * DummyRegressionInteractive — 2-level dummy variable (D) shifts the intercept.
 * Two parallel lines: D=0 (שוכר) and D=1 (בעל דירה), same slope b2, intercepts
 * differ by b1. Slider controls b1; a bracket shows the vertical gap = b1.
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 380, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 60

const b0 = 300 // intercept for D=0 (שוכר)
const b2 = 220 // slope, common to both groups

const xMin = 0, xMax = 20
const yMin = 0, yMax = 6000

const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)

// illustrative scatter around each line (static, deterministic)
const rentersX = [2, 4, 6, 9, 11, 14, 17, 19]
const ownersX = [1, 3, 6, 8, 12, 13, 16, 18]
const jitter = [140, -90, 60, -150, 100, -60, 30, -120]

export default function DummyRegressionInteractive() {
  const [b1, setB1] = useState(400)

  const yAt = (x: number, D: 0 | 1) => b0 + D * b1 + b2 * x

  const rentersPts = rentersX.map((x, i) => ({ x, y: yAt(x, 0) + jitter[i] }))
  const ownersPts = ownersX.map((x, i) => ({ x, y: yAt(x, 1) + jitter[(i + 3) % jitter.length] }))

  const midX = (xMin + xMax) / 2
  const gapY0 = toY(yAt(midX, 0))
  const gapY1 = toY(yAt(midX, 1))

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('dummy-reg-formula')
    if (k && el) k.render(`\\hat{y} = ${b0} + ${b1} \\cdot D + ${b2}x`, el, { throwOnError: false })
  }, [b1])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>משתנה דמי — הזזת החותך</h3>
      <p style={graphSubtitleStyle}>
        חיסכון חודשי מול הכנסה, עם משתנה דמי D (1 = בעל דירה, 0 = שוכר). D מזיז את שני הקווים אנכית באותו גודל — b1 — בלי לשנות את השיפוע, ולכן הקווים תמיד מקבילים.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={GC.axis} />
        <text x={(X0 + X1) / 2} y={Y1 + 36} textAnchor="middle" fontSize={12} fill={GC.ink} opacity={0.7} fontFamily={GRAPH_FONT}>הכנסה חודשית (אלפי ₪)</text>
        <text x={X0 - 34} y={(Y0 + Y1) / 2} textAnchor="middle" fontSize={12} fill={GC.ink} opacity={0.7} fontFamily={GRAPH_FONT} transform={`rotate(-90 ${X0 - 34} ${(Y0 + Y1) / 2})`}>חיסכון חודשי (₪)</text>

        {/* D=0: שוכר */}
        <line x1={toX(xMin)} y1={toY(yAt(xMin, 0))} x2={toX(xMax)} y2={toY(yAt(xMax, 0))} stroke={GC.blue} strokeWidth={2.5} />
        {rentersPts.map((p, i) => <circle key={`r${i}`} cx={toX(p.x)} cy={toY(p.y)} r={4} fill={GC.blue} opacity={0.55} />)}

        {/* D=1: בעל דירה */}
        <line x1={toX(xMin)} y1={toY(yAt(xMin, 1))} x2={toX(xMax)} y2={toY(yAt(xMax, 1))} stroke={GC.gold} strokeWidth={2.5} />
        {ownersPts.map((p, i) => <circle key={`o${i}`} cx={toX(p.x)} cy={toY(p.y)} r={4} fill={GC.gold} opacity={0.55} />)}

        {/* bracket showing the vertical gap = b1 */}
        <line x1={toX(midX)} y1={gapY0} x2={toX(midX)} y2={gapY1} stroke={GC.ink} strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={toX(midX) - 6} y1={gapY0} x2={toX(midX) + 6} y2={gapY0} stroke={GC.ink} strokeWidth={1.5} />
        <line x1={toX(midX) - 6} y1={gapY1} x2={toX(midX) + 6} y2={gapY1} stroke={GC.ink} strokeWidth={1.5} />
        <text x={toX(midX) + 12} y={(gapY0 + gapY1) / 2 + 4} fontSize={13} fontWeight={700} fill={GC.ink} fontFamily={GRAPH_FONT}>b1 = {b1}</text>

        {/* legend */}
        <circle cx={X1 - 14} cy={Y0 + 4} r={5} fill={GC.gold} />
        <text x={X1 - 26} y={Y0 + 8} fontSize={12} fill={GC.ink} textAnchor="end" fontFamily={GRAPH_FONT}>בעל דירה (D=1)</text>
        <circle cx={X1 - 14} cy={Y0 + 24} r={5} fill={GC.blue} />
        <text x={X1 - 26} y={Y0 + 28} fontSize={12} fill={GC.ink} textAnchor="end" fontFamily={GRAPH_FONT}>שוכר (D=0)</text>
      </svg>
      <div id="dummy-reg-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <p style={{ fontFamily: GRAPH_FONT, fontSize: 12, opacity: 0.75, textAlign: 'center', margin: '0 0 8px' }}>
        חותך שוכר (D=0) = {b0} &nbsp;|&nbsp; חותך בעל דירה (D=1) = {b0 + b1}
      </p>
      <label style={{ fontFamily: GRAPH_FONT, fontSize: 13, display: 'block', marginTop: 8 }}>
        b1 (הזזת החותך): {b1}
        <input type="range" min={0} max={800} step={50} value={b1} onChange={e => setB1(Number(e.target.value))} style={{ width: '100%', accentColor: GC.blue }} />
      </label>
    </div>
  )
}
