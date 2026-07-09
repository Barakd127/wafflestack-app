/**
 * InteractionSlopeInteractive — dummy×x interaction changes the SLOPE.
 * Exam score (y) vs weekly study hours (x), split by "קורס הכנה" (D=1) vs
 * "ללא קורס" (D=0). Slider controls b3 (the interaction coefficient):
 * D=0: y = b0 + b1*x
 * D=1: y = (b0+b2) + (b1+b3)*x
 * When b3=0 the two lines are parallel (no interaction); otherwise the
 * slopes differ (interaction present).
 */
import { useState, useEffect } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 340, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 70

const xMin = 0, xMax = 8
const yMin = 0, yMax = 110

const b0 = 50, b1 = 3, b2 = 5

const toX = (x: number) => X0 + ((x - xMin) / (xMax - xMin)) * (X1 - X0)
const toY = (y: number) => Y1 - ((y - yMin) / (yMax - yMin)) * (Y1 - Y0)

export default function InteractionSlopeInteractive() {
  const [b3, setB3] = useState(1.5)

  const slope0 = b1
  const slope1 = b1 + b3
  const intercept0 = b0
  const intercept1 = b0 + b2

  const y0Start = intercept0 + slope0 * xMin
  const y0End = intercept0 + slope0 * xMax
  const y1Start = intercept1 + slope1 * xMin
  const y1End = intercept1 + slope1 * xMax

  const hasInteraction = Math.abs(b3) > 0.001

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('interaction-formula')
    if (k && el) {
      k.render(
        `\\hat{y} = ${b0} + ${b1}x + ${b2}D + ${b3.toFixed(1)}\\,(x \\cdot D)`,
        el,
        { throwOnError: false }
      )
    }
  }, [b3])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>אינטראקציה — משתנה בדמה משנה את השיפוע</h3>
      <p style={graphSubtitleStyle}>
        ציון במבחן לפי שעות לימוד שבועיות, בשתי קבוצות: מי שעשה קורס הכנה (D=1) ומי שלא (D=0).
        גרור את b3 — מקדם האינטראקציה — ותצפה איך השיפוע של קבוצת הקורס משתנה.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="interaction slope chart">
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={GC.axis} />
        <text x={(X0 + X1) / 2} y={Y1 + 34} textAnchor="middle" fontSize={12} fill={GC.ink} opacity={0.7} fontFamily={GRAPH_FONT}>שעות לימוד שבועיות (x)</text>
        <text x={X0 - 8} y={Y0 - 10} textAnchor="start" fontSize={12} fill={GC.ink} opacity={0.7} fontFamily={GRAPH_FONT}>ציון (y)</text>

        <line x1={toX(xMin)} y1={toY(y0Start)} x2={toX(xMax)} y2={toY(y0End)} stroke={GC.blue} strokeWidth={3} />
        <line x1={toX(xMin)} y1={toY(y1Start)} x2={toX(xMax)} y2={toY(y1End)} stroke={GC.gold} strokeWidth={3} />

        <circle cx={toX(xMax)} cy={toY(y0End)} r={4} fill={GC.blue} />
        <circle cx={toX(xMax)} cy={toY(y1End)} r={4} fill={GC.gold} />

        <text x={toX(xMax) - 6} y={toY(y0End) - 8} textAnchor="end" fontSize={12} fill={GC.blue} fontWeight={700} fontFamily={GRAPH_FONT}>ללא קורס (D=0)</text>
        <text x={toX(xMax) - 6} y={toY(y1End) - 8} textAnchor="end" fontSize={12} fill={GC.goldText} fontWeight={700} fontFamily={GRAPH_FONT}>קורס הכנה (D=1)</text>
      </svg>

      <div id="interaction-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div dir="ltr" style={{ fontFamily: 'Consolas, monospace', fontSize: 13, background: 'rgba(31,62,108,0.9)', color: '#e8ecf1', borderRadius: 10, padding: '8px 12px', overflowX: 'auto', marginBottom: 12 }}>
        D=0: ŷ = {intercept0} + {slope0}x &nbsp;|&nbsp; D=1: ŷ = {intercept1} + {slope1.toFixed(1)}x
      </div>

      <label style={{ fontFamily: GRAPH_FONT, fontSize: 13, display: 'block', marginBottom: 6 }}>
        b3 (מקדם האינטראקציה): {b3.toFixed(1)}
        <input
          type="range"
          min={-3}
          max={3}
          step={0.5}
          value={b3}
          onChange={e => setB3(Number(e.target.value))}
          style={{ width: '100%', accentColor: GC.blue }}
        />
      </label>

      <p style={{ fontFamily: GRAPH_FONT, textAlign: 'center', fontSize: 15, fontWeight: 700, margin: '10px 0 0', color: hasInteraction ? GC.goldText : GC.blue }}>
        {hasInteraction ? 'יש אינטראקציה — השיפועים שונים' : 'אין אינטראקציה (שיפועים שווים)'}
      </p>
    </div>
  )
}
