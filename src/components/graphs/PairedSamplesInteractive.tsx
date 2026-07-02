/**
 * PairedSamplesInteractive — before/after on the SAME subjects. Each subject
 * is a line linking its two measurements; the paired test works on the
 * differences dᵢ. Slider shifts the "after" measurements (the treatment
 * effect); live mean difference d̄, s_d and paired t = d̄ / (s_d/√n), df=n−1.
 */
import { useState, useEffect, useMemo } from 'react'

const BEFORE = [62, 70, 55, 80, 68, 74, 59, 66]
// deterministic per-subject variation of the effect (keeps spread fixed, no RNG)
const NOISE = [3, -2, 5, 1, -4, 2, -1, 4]
const n = BEFORE.length
const CRIT_T = 2.365   // t(0.025, df=7)

const W = 560, H = 300, PAD = 40
const COL_B = 170, COL_A = W - 170

export default function PairedSamplesInteractive() {
  const [shift, setShift] = useState(6)

  const { after, diffs, dbar, sd, t, reject } = useMemo(() => {
    const after = BEFORE.map((v, i) => v + shift + NOISE[i])
    const diffs = after.map((v, i) => v - BEFORE[i])
    const dbar = diffs.reduce((s, x) => s + x, 0) / n
    const variance = diffs.reduce((s, x) => s + (x - dbar) ** 2, 0) / (n - 1)
    const sd = Math.sqrt(variance)
    const t = sd > 0 ? dbar / (sd / Math.sqrt(n)) : 0
    return { after, diffs, dbar, sd, t, reject: Math.abs(t) > CRIT_T }
  }, [shift])

  const all = [...BEFORE, ...after]
  const yMin = Math.min(...all) - 6, yMax = Math.max(...all) + 6
  const toY = (v: number) => PAD + (1 - (v - yMin) / (yMax - yMin)) * (H - 2 * PAD)

  useEffect(() => {
    const kx = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('paired-formula')
    if (kx && el) kx.render(`t = \\frac{\\bar{d}}{s_d/\\sqrt{n}} = \\frac{${dbar.toFixed(2)}}{${sd.toFixed(2)}/\\sqrt{${n}}} = ${t.toFixed(2)}`, el, { throwOnError: false })
  }, [dbar, sd, t])

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>דגימות מזווגות — לפני מול אחרי</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>כל קו הוא אותו נבדק. המבחן עובד על ההפרשים dᵢ, לא על הערכים עצמם — כך מנטרלים את השונות בין הנבדקים.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <text x={COL_B} y={PAD - 14} fill="#64748B" fontSize={13} textAnchor="middle" fontWeight={700}>לפני</text>
        <text x={COL_A} y={PAD - 14} fill="#64748B" fontSize={13} textAnchor="middle" fontWeight={700}>אחרי</text>
        {BEFORE.map((v, i) => {
          const up = diffs[i] >= 0
          return (
            <g key={i}>
              <line x1={COL_B} y1={toY(v)} x2={COL_A} y2={toY(after[i])} stroke={up ? '#16a34a' : '#ef4444'} strokeWidth={1.6} opacity={0.75} />
              <circle cx={COL_B} cy={toY(v)} r={4.5} fill="#1F3E6C" />
              <circle cx={COL_A} cy={toY(after[i])} r={4.5} fill="#D4A017" />
            </g>
          )
        })}
      </svg>

      <div id="paired-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 26 }} />

      <Slider label={`הזזת "אחרי" = ${shift}`} value={shift} min={-4} max={20} step={1} onChange={v => setShift(Math.round(v))} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(31,62,108,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
        <span>d̄ = <b>{dbar.toFixed(2)}</b></span>
        <span>s_d = {sd.toFixed(2)}</span>
        <span>t = <b>{t.toFixed(2)}</b></span>
        <span style={{ opacity: 0.85 }}>קריטי t(7) = ±{CRIT_T}</span>
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
