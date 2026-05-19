/**
 * RSquaredDecompositionInteractive — scatter + draggable regression line.
 * Three vertical bars: SST = SSE + SSR. Visualizes the variance decomposition
 * and R² = 1 - SSE/SST. Sliders for slope and intercept.
 */
import { useState, useEffect, useMemo } from 'react'

const W = 640, H = 360
const SCAT_X0 = 30, SCAT_Y0 = 30, SCAT_X1 = 380, SCAT_Y1 = 280
const BAR_X = 420, BAR_Y0 = 30, BAR_Y1 = 280
const PT_COUNT = 20

// Fixed seeded points (deterministic across renders)
const PTS: { x: number, y: number }[] = (() => {
  const a: { x: number, y: number }[] = []
  let s = 42
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = 0; i < PT_COUNT; i++) {
    const x = i / (PT_COUNT - 1) * 10
    const y = 2 + 1.2 * x + (rnd() - 0.5) * 4
    a.push({ x, y })
  }
  return a
})()

export default function RSquaredDecompositionInteractive() {
  const [slope, setSlope] = useState(1.2)
  const [intercept, setIntercept] = useState(2)

  const { sst, sse, ssr, r2, yMean } = useMemo(() => {
    const yMean = PTS.reduce((a, b) => a + b.y, 0) / PTS.length
    let sst = 0, sse = 0, ssr = 0
    for (const p of PTS) {
      const yhat = intercept + slope * p.x
      sst += (p.y - yMean) ** 2
      sse += (p.y - yhat) ** 2
      ssr += (yhat - yMean) ** 2
    }
    const r2 = sst > 0 ? 1 - sse / sst : 0
    return { sst, sse, ssr, r2, yMean }
  }, [slope, intercept])

  const xMin = 0, xMax = 10, yMin = 0, yMax = 16
  const toX = (v: number) => SCAT_X0 + ((v - xMin) / (xMax - xMin)) * (SCAT_X1 - SCAT_X0)
  const toY = (v: number) => SCAT_Y1 - ((v - yMin) / (yMax - yMin)) * (SCAT_Y1 - SCAT_Y0)

  const lineY0 = intercept
  const lineY1 = intercept + slope * xMax

  // bars
  const totalRef = Math.max(sst, sse + ssr, 1)
  const barH = (v: number) => ((BAR_Y1 - BAR_Y0) * v) / totalRef

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('rsq-formula')
    if (k && el) k.render(
      `R^2 = 1 - \\frac{SSE}{SST} = 1 - \\frac{${sse.toFixed(2)}}{${sst.toFixed(2)}} = ${r2.toFixed(3)}`,
      el, { throwOnError: false },
    )
  }, [sse, sst, r2])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>פירוק R² — SST = SSE + SSR</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>הזז שיפוע וחיתוך — שמ הסכימים מתחלפים. SST קבוע. R² גדל ככל ש-SSE קטן.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {/* scatter axes */}
        <line x1={SCAT_X0} y1={SCAT_Y1} x2={SCAT_X1} y2={SCAT_Y1} stroke="rgba(255,255,255,0.4)" />
        <line x1={SCAT_X0} y1={SCAT_Y0} x2={SCAT_X0} y2={SCAT_Y1} stroke="rgba(255,255,255,0.4)" />

        {/* y-mean line */}
        <line x1={SCAT_X0} y1={toY(yMean)} x2={SCAT_X1} y2={toY(yMean)} stroke="#94a3b8" strokeDasharray="3 3" />
        <text x={SCAT_X1 + 4} y={toY(yMean) + 4} fill="#94a3b8" fontSize={11}>ȳ</text>

        {/* regression line */}
        <line x1={toX(0)} y1={toY(lineY0)} x2={toX(xMax)} y2={toY(lineY1)} stroke="#FFD700" strokeWidth={2.5} />

        {/* residuals (vertical) */}
        {PTS.map((p, i) => {
          const yhat = intercept + slope * p.x
          return <line key={`r${i}`} x1={toX(p.x)} y1={toY(p.y)} x2={toX(p.x)} y2={toY(yhat)} stroke="#ef4444" strokeWidth={1} opacity={0.6} />
        })}

        {/* points */}
        {PTS.map((p, i) => <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={4} fill="#60a5fa" />)}

        {/* bars */}
        <text x={BAR_X + 60} y={BAR_Y0 - 8} fill="rgba(255,255,255,0.8)" fontSize={12} textAnchor="middle">Variance Decomposition</text>
        <Bar x={BAR_X}      yBase={BAR_Y1} h={barH(sst)} color="#94a3b8" label="SST" value={sst} />
        <Bar x={BAR_X + 65} yBase={BAR_Y1} h={barH(ssr)} color="#FFD700" label="SSR" value={ssr} />
        <Bar x={BAR_X + 130} yBase={BAR_Y1} h={barH(sse)} color="#ef4444" label="SSE" value={sse} />
        <Bar x={BAR_X + 195} yBase={BAR_Y1} h={barH(sse + ssr)} color="#60a5fa" label="SSE+SSR" value={sse + ssr} />
      </svg>

      <div id="rsq-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <Slider label={`slope = ${slope.toFixed(2)}`} value={slope} min={-2} max={4} step={0.05} onChange={setSlope} />
      <Slider label={`intercept = ${intercept.toFixed(2)}`} value={intercept} min={-5} max={10} step={0.1} onChange={setIntercept} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ color: '#FFD700' }}>R² = <b>{r2.toFixed(3)}</b></span>
        <span>SST = {sst.toFixed(2)}</span>
        <span style={{ color: '#ef4444' }}>SSE = {sse.toFixed(2)}</span>
      </div>
    </div>
  )
}

function Bar({ x, yBase, h, color, label, value }: { x: number; yBase: number; h: number; color: string; label: string; value: number }) {
  return (
    <g>
      <rect x={x} y={yBase - h} width={50} height={h} fill={color} opacity={0.7} />
      <text x={x + 25} y={yBase + 14} fill="#fff" fontSize={11} textAnchor="middle">{label}</text>
      <text x={x + 25} y={yBase - h - 4} fill={color} fontSize={11} textAnchor="middle" fontWeight={700}>{value.toFixed(1)}</text>
    </g>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 140 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
