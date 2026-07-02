/**
 * WilcoxonInteractive — Wilcoxon signed-rank test intuition. A fixed set of
 * paired differences; the slider shifts them (the effect). Differences are
 * ranked by |d| (zeros dropped, ties averaged), signed, and summed into
 * W⁺ / W⁻. Shows the normal-approximation z so students see how a rank-based
 * (non-parametric) test reaches a decision without assuming normality.
 */
import { useState, useEffect, useMemo } from 'react'

const BASE = [4, -2, 6, 1, -3, 5, -1, 7, 2, -4]
const W = 600, ROW_H = 22, PAD_TOP = 12

export default function WilcoxonInteractive() {
  const [shift, setShift] = useState(2)

  const { rows, wPlus, wMinus, z, nEff } = useMemo(() => {
    const diffs = BASE.map(v => v + shift).filter(v => v !== 0)
    const items = diffs.map(v => ({ v, abs: Math.abs(v), rank: 0 }))
    items.sort((p, q) => p.abs - q.abs)
    // average-rank for ties on |d|
    let i = 0
    while (i < items.length) {
      let j = i
      while (j < items.length && items[j].abs === items[i].abs) j++
      const avg = (i + 1 + j) / 2   // mean of ranks (i+1 .. j)
      for (let k = i; k < j; k++) items[k].rank = avg
      i = j
    }
    const wPlus = items.filter(x => x.v > 0).reduce((s, x) => s + x.rank, 0)
    const wMinus = items.filter(x => x.v < 0).reduce((s, x) => s + x.rank, 0)
    const nEff = items.length
    const muW = nEff * (nEff + 1) / 4
    const sigW = Math.sqrt(nEff * (nEff + 1) * (2 * nEff + 1) / 24)
    const z = sigW > 0 ? (wPlus - muW) / sigW : 0
    return { rows: items, wPlus, wMinus, z, nEff }
  }, [shift])

  const maxRank = Math.max(1, ...rows.map(r => r.rank))
  const svgH = PAD_TOP * 2 + rows.length * ROW_H

  useEffect(() => {
    const kx = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('wil-formula')
    if (kx && el) kx.render(`W^+ = ${wPlus.toFixed(1)}, \\quad W^- = ${wMinus.toFixed(1)}, \\quad z \\approx ${z.toFixed(2)}`, el, { throwOnError: false })
  }, [wPlus, wMinus, z])

  const reject = Math.abs(z) > 1.96

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>מבחן וילקוקסון — דירוג ההפרשים</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>מדרגים לפי הערך המוחלט של ההפרש (אפסים יורדים), מחזירים את הסימן, ומסכמים ל-W⁺ ו-W⁻. מבחן א-פרמטרי — אין הנחת נורמליות.</p>

      <svg viewBox={`0 0 ${W} ${svgH}`} width="100%" height={Math.min(svgH, 320)}>
        <line x1={W / 2} y1={PAD_TOP} x2={W / 2} y2={svgH - PAD_TOP} stroke="rgba(31,62,108,0.3)" />
        {rows.map((r, i) => {
          const y = PAD_TOP + i * ROW_H + ROW_H / 2
          const len = (r.rank / maxRank) * (W / 2 - 60)
          const pos = r.v > 0
          const x1 = W / 2
          const x2 = pos ? W / 2 + len : W / 2 - len
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={pos ? '#16a34a' : '#ef4444'} strokeWidth={5} strokeLinecap="round" />
              <text x={pos ? x2 + 6 : x2 - 6} y={y + 4} fill={pos ? '#16a34a' : '#ef4444'} fontSize={11} textAnchor={pos ? 'start' : 'end'}>
                d={r.v} · דירוג {r.rank}
              </text>
            </g>
          )
        })}
      </svg>

      <div id="wil-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 26 }} />

      <Slider label={`הזזת ההפרשים = ${shift}`} value={shift} min={-6} max={8} step={1} onChange={v => setShift(Math.round(v))} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(31,62,108,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ color: '#16a34a', fontWeight: 700 }}>W⁺ = {wPlus.toFixed(1)}</span>
        <span style={{ color: '#ef4444', fontWeight: 700 }}>W⁻ = {wMinus.toFixed(1)}</span>
        <span>n = {nEff}</span>
        <span>z ≈ {z.toFixed(2)}</span>
        <span style={{ color: reject ? '#16a34a' : '#ef4444', fontWeight: 700 }}>{reject ? 'דוחים H₀' : 'לא דוחים H₀'}</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 150 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
