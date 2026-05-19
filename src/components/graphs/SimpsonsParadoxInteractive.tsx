/**
 * SimpsonsParadoxInteractive — Scatter colored by 2 hidden subgroups.
 * Toggle "show subgroups" — points re-color, per-group regression lines appear
 * with OPPOSITE slope than the overall line. Demonstrates Simpson's paradox.
 */
import { useEffect, useMemo, useState } from 'react'

const W = 640
const H = 380
const PAD = 50
const X0 = PAD
const X1 = W - PAD
const Y0 = 40
const Y1 = H - 60

type P = { x: number; y: number; group: 0 | 1 }

// Design points so that:
//  - Overall regression has POSITIVE slope
//  - Each subgroup has NEGATIVE slope
// Trick: group 0 sits in (low-x, mid-y), group 1 sits in (high-x, higher-y),
// but within each group, y decreases as x increases.
const DATA: P[] = [
  // Group 0 — low x, moderate y, negative trend
  { x: 1.0, y: 6.5, group: 0 },
  { x: 1.5, y: 6.0, group: 0 },
  { x: 2.0, y: 5.5, group: 0 },
  { x: 2.5, y: 5.0, group: 0 },
  { x: 3.0, y: 4.5, group: 0 },
  { x: 3.5, y: 4.2, group: 0 },
  { x: 4.0, y: 3.8, group: 0 },
  { x: 4.5, y: 3.4, group: 0 },
  { x: 5.0, y: 3.0, group: 0 },
  { x: 5.5, y: 2.7, group: 0 },
  // Group 1 — high x, higher y, negative trend
  { x: 6.5, y: 10.5, group: 1 },
  { x: 7.0, y: 10.0, group: 1 },
  { x: 7.5, y: 9.5, group: 1 },
  { x: 8.0, y: 9.0, group: 1 },
  { x: 8.5, y: 8.7, group: 1 },
  { x: 9.0, y: 8.3, group: 1 },
  { x: 9.5, y: 7.9, group: 1 },
  { x: 10.0, y: 7.5, group: 1 },
  { x: 10.5, y: 7.1, group: 1 },
  { x: 11.0, y: 6.8, group: 1 },
]

function regress(pts: P[]) {
  const n = pts.length
  if (n < 2) return { slope: 0, intercept: 0 }
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  if (sxx === 0) return { slope: 0, intercept: my }
  const slope = sxy / sxx
  const intercept = my - slope * mx
  return { slope, intercept }
}

export default function SimpsonsParadoxInteractive() {
  const [showGroups, setShowGroups] = useState(false)

  const overall = useMemo(() => regress(DATA), [])
  const g0 = useMemo(() => regress(DATA.filter(p => p.group === 0)), [])
  const g1 = useMemo(() => regress(DATA.filter(p => p.group === 1)), [])

  const xMin = 0, xMax = 12, yMin = 0, yMax = 12
  const toX = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0)

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('sim-formula')
    if (k && el) {
      const lines = showGroups
        ? `\\text{overall: } y = ${overall.slope.toFixed(2)}x + ${overall.intercept.toFixed(2)} \\quad\\\\ \\text{group 1: } y = ${g0.slope.toFixed(2)}x + ${g0.intercept.toFixed(2)} \\quad\\\\ \\text{group 2: } y = ${g1.slope.toFixed(2)}x + ${g1.intercept.toFixed(2)}`
        : `\\hat{y} = ${overall.slope.toFixed(2)}x + ${overall.intercept.toFixed(2)}`
      k.render(lines, el, { throwOnError: false })
    }
  }, [showGroups, overall, g0, g1])

  const xTicks = [0, 2, 4, 6, 8, 10, 12]
  const yTicks = [0, 2, 4, 6, 8, 10, 12]

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>פרדוקס סימפסון — קורלציה מוסתרת</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        בסקירה הכוללת — הקשר חיובי (ככל ש-x גדל, y גדל). אך בתוך כל תת-קבוצה — הקשר הפוך! הסר את ההסתרה כדי לחשוף את האמת.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {/* Axes */}
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {xTicks.map(t => (
          <g key={`x${t}`}>
            <line x1={toX(t)} y1={Y1 - 3} x2={toX(t)} y2={Y1 + 3} stroke="rgba(255,255,255,0.4)" />
            <text x={toX(t)} y={Y1 + 16} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
          </g>
        ))}
        {yTicks.map(t => (
          <g key={`y${t}`}>
            <line x1={X0 - 3} y1={toY(t)} x2={X0 + 3} y2={toY(t)} stroke="rgba(255,255,255,0.4)" />
            <text x={X0 - 8} y={toY(t) + 4} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="end">{t}</text>
          </g>
        ))}

        {/* Overall regression line — visible always */}
        <line
          x1={toX(xMin)} y1={toY(overall.intercept + overall.slope * xMin)}
          x2={toX(xMax)} y2={toY(overall.intercept + overall.slope * xMax)}
          stroke="#FFD700"
          strokeWidth={2.5}
          opacity={showGroups ? 0.4 : 1}
          strokeDasharray={showGroups ? '6 4' : 'none'}
        />

        {/* Per-group lines when toggled */}
        {showGroups && (
          <>
            <line
              x1={toX(0.5)} y1={toY(g0.intercept + g0.slope * 0.5)}
              x2={toX(5.8)} y2={toY(g0.intercept + g0.slope * 5.8)}
              stroke="#60a5fa" strokeWidth={2.5}
            />
            <line
              x1={toX(6.2)} y1={toY(g1.intercept + g1.slope * 6.2)}
              x2={toX(11.5)} y2={toY(g1.intercept + g1.slope * 11.5)}
              stroke="#f59e0b" strokeWidth={2.5}
            />
          </>
        )}

        {/* Points */}
        {DATA.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.x)} cy={toY(p.y)} r={7}
            fill={showGroups ? (p.group === 0 ? '#60a5fa' : '#f59e0b') : '#94a3b8'}
            stroke="#fff"
            strokeWidth={1.2}
          />
        ))}

        {/* Slope direction badges */}
        <text x={X1 - 8} y={Y0 + 14} fill="#FFD700" fontSize={12} textAnchor="end" fontWeight={700}>
          שיפוע כולל: {overall.slope.toFixed(2)} {overall.slope > 0 ? '↗' : '↘'}
        </text>
        {showGroups && (
          <>
            <text x={X1 - 8} y={Y0 + 32} fill="#60a5fa" fontSize={12} textAnchor="end" fontWeight={700}>
              קבוצה 1: {g0.slope.toFixed(2)} {g0.slope > 0 ? '↗' : '↘'}
            </text>
            <text x={X1 - 8} y={Y0 + 50} fill="#f59e0b" fontSize={12} textAnchor="end" fontWeight={700}>
              קבוצה 2: {g1.slope.toFixed(2)} {g1.slope > 0 ? '↗' : '↘'}
            </text>
          </>
        )}
      </svg>

      <div id="sim-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowGroups(!showGroups)}
          style={{
            background: showGroups ? '#FFD700' : 'rgba(255,255,255,0.1)',
            color: showGroups ? '#0B1B3E' : '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: showGroups ? 700 : 400,
          }}
        >
          {showGroups ? 'הסתר תת-קבוצות' : 'חשוף תת-קבוצות'}
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: showGroups ? 'rgba(245,158,11,0.15)' : 'rgba(96,165,250,0.12)',
          border: '1px solid ' + (showGroups ? '#f59e0b' : 'rgba(96,165,250,0.4)'),
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        {showGroups
          ? '⚠ בכל תת-קבוצה הקשר שלילי — אך כשהקבוצות מאוחדות, הקשר נראה חיובי. זהו פרדוקס סימפסון: משתנה מתערב (lurking variable) הופך את כיוון הקשר.'
          : '👁 הנתונים נראים כקשר חיובי ברור. אך משהו חבוי כאן — לחץ "חשוף תת-קבוצות" כדי לגלות.'}
      </div>
    </div>
  )
}
