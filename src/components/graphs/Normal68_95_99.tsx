/**
 * Normal68_95_99 — the empirical rule, taught interactively.
 *
 * Redesign 2026-07-08 (Barak): the old version had μ/σ sliders that changed
 * NOTHING meaningful (the 68-95-99.7 rule is scale-invariant, so moving σ just
 * rescaled a static-looking bell). Replaced with the control that actually
 * carries the lesson: a single "how many standard deviations from the mean?"
 * slider (k). Dragging it shades ±kσ and shows, live, what fraction of the data
 * that captures — so the student SEES 1σ→68%, 2σ→95%, 3σ→99.7% emerge.
 *
 * A concrete exam-scores context (μ=70, σ=10) gives σ a real meaning: the band
 * edges update to actual score ranges ("בין 60 ל-80"), connecting the abstract
 * σ to numbers a beginner recognises.
 */
import { useState } from 'react'
import { GRAPH_FONT, GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle, GraphSlider } from './graphTheme'

const W = 640, H = 300, PAD = 46
const X0 = PAD, X1 = W - PAD, YB = H - 60, YT = 24
const KMAX = 4 // domain shown = ±4σ

// standard normal pdf + cdf (Abramowitz–Stegun)
const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
const Phi = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804 * Math.exp(-z * z / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}

// exam-scores context so σ means something concrete
const MU = 70, SIGMA = 10

export default function Normal68_95_99() {
  const [k, setK] = useState(1) // how many σ from the mean

  const toPx = (z: number) => X0 + ((z + KMAX) / (2 * KMAX)) * (X1 - X0)
  const toPy = (d: number) => YB - (d / phi(0)) * (YB - YT)

  const curve = (() => {
    const pts: string[] = []
    for (let px = X0; px <= X1; px += 2) {
      const z = ((px - X0) / (X1 - X0)) * (2 * KMAX) - KMAX
      pts.push(`${px},${toPy(phi(z))}`)
    }
    return `M ${pts.join(' L ')}`
  })()

  const band = (() => {
    const a = toPx(-k), b = toPx(k)
    const pts: string[] = [`${a},${YB}`]
    for (let px = a; px <= b; px += 2) {
      const z = ((px - X0) / (X1 - X0)) * (2 * KMAX) - KMAX
      pts.push(`${px},${toPy(phi(z))}`)
    }
    pts.push(`${b},${YB}`)
    return `M ${pts.join(' L ')} Z`
  })()

  const inside = (Phi(k) - Phi(-k)) * 100
  const outside = 100 - inside
  const lo = MU - k * SIGMA
  const hi = MU + k * SIGMA

  // snap chips for the three canonical values
  const snaps = [
    { k: 1, label: '68%' },
    { k: 2, label: '95%' },
    { k: 3, label: '99.7%' },
  ]

  return (
    <div dir="rtl" style={graphCardStyle}>
      <h3 style={graphTitleStyle}>כמה מהתלמידים נמצאים קרוב לממוצע?</h3>
      <p style={graphSubtitleStyle}>
        בהתפלגות פעמון רוב התצפיות מצטופפות סביב הממוצע. גררו את הסרגל וראו כמה אחוזים
        מהתלמידים נמצאים בתוך מרחק של סטיית תקן אחת, שתיים או שלוש מהממוצע.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ fontFamily: GRAPH_FONT }}>
        {/* shaded ±kσ band */}
        <path d={band} fill={GC.goldFill} />
        {/* curve */}
        <path d={curve} stroke={GC.ink} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        {/* baseline */}
        <line x1={X0} y1={YB} x2={X1} y2={YB} stroke={GC.axis} />
        {/* mean line */}
        <line x1={toPx(0)} y1={YT} x2={toPx(0)} y2={YB} stroke={GC.blue} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={toPx(0)} y={YT - 6} fill={GC.blue} fontSize={13} fontWeight={700} textAnchor="middle">ממוצע = {MU}</text>
        {/* band edges */}
        {[-k, k].map((s, i) => (
          <g key={i}>
            <line x1={toPx(s)} y1={YT + 10} x2={toPx(s)} y2={YB} stroke={GC.gold} strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={toPx(s)} y={YB + 18} fill={GC.goldText} fontSize={12} fontWeight={700} textAnchor="middle">
              {i === 0 ? lo.toFixed(0) : hi.toFixed(0)}
            </text>
          </g>
        ))}
        {/* σ ticks */}
        {[-3, -2, -1, 1, 2, 3].map(s => (
          <text key={s} x={toPx(s)} y={YB + 34} fill={GC.axisText} fontSize={10} textAnchor="middle">
            {s > 0 ? `+${s}σ` : `${s}σ`}
          </text>
        ))}
        {/* live % label inside the band */}
        <text x={toPx(0)} y={toPy(phi(0)) + 30} fill={GC.goldText} fontSize={22} fontWeight={800} textAnchor="middle">
          {inside.toFixed(1)}%
        </text>
      </svg>

      {/* plain-language readout */}
      <div style={{
        textAlign: 'center', fontFamily: GRAPH_FONT, fontSize: 15, color: GC.ink,
        background: 'rgba(78,113,218,0.08)', borderRadius: 12, padding: '10px 14px', margin: '4px 0 14px',
      }}>
        בתוך <b>±{k.toFixed(1)}</b> סטיות תקן מהממוצע נמצאים <b style={{ color: GC.goldText }}>{inside.toFixed(1)}%</b> מהתלמידים
        {' '}— כלומר ציונים בין <b>{lo.toFixed(0)}</b> ל-<b>{hi.toFixed(0)}</b>.
        {' '}רק <b style={{ color: GC.warn }}>{outside.toFixed(1)}%</b> נמצאים רחוק יותר.
      </div>

      {/* snap chips to the canonical rule */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        {snaps.map(s => (
          <button key={s.k} onClick={() => setK(s.k)} style={{
            fontFamily: GRAPH_FONT, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 14px', borderRadius: 999,
            background: Math.abs(k - s.k) < 0.05 ? GC.gold : 'transparent',
            color: Math.abs(k - s.k) < 0.05 ? '#3a2c05' : GC.ink,
            border: `1px solid ${GC.gold}`,
          }}>±{s.k}σ = {s.label}</button>
        ))}
      </div>

      <GraphSlider label="כמה סטיות תקן מהממוצע?" value={Number(k.toFixed(1))} min={0} max={3.5} step={0.1} onChange={setK} suffix="σ" />
    </div>
  )
}
