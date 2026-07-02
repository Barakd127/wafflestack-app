/**
 * McNemarInteractive — paired 2×2 table (before/after on the same subjects).
 * Only the discordant cells b and c drive the test. Sliders set b and c;
 * live χ² = (b−c)²/(b+c) with the continuity-corrected variant. Compares to
 * the χ²₁ critical value 3.841 (α=0.05).
 */
import { useState, useEffect, useMemo } from 'react'

export default function McNemarInteractive() {
  const [b, setB] = useState(25)   // before + / after −
  const [c, setC] = useState(10)   // before − / after +
  const a = 40                     // concordant (+,+) — fixed, context only
  const d = 30                     // concordant (−,−) — fixed, context only

  const { chi, chiCorr, reject } = useMemo(() => {
    const denom = b + c
    const chi = denom > 0 ? (b - c) ** 2 / denom : 0
    const chiCorr = denom > 0 ? (Math.abs(b - c) - 1) ** 2 / denom : 0
    return { chi, chiCorr, reject: chi > 3.841 }
  }, [b, c])

  useEffect(() => {
    const kx = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('mcn-formula')
    if (kx && el) kx.render(`\\chi^2 = \\frac{(b-c)^2}{b+c} = \\frac{(${b}-${c})^2}{${b + c}} = ${chi.toFixed(3)}`, el, { throwOnError: false })
  }, [b, c, chi])

  const Cell = ({ v, hi, label }: { v: number; hi?: boolean; label: string }) => (
    <div style={{
      padding: '16px 10px', textAlign: 'center', borderRadius: 10,
      background: hi ? 'rgba(212,160,23,0.20)' : 'rgba(31,62,108,0.06)',
      border: hi ? '2px solid #D4A017' : '1px solid rgba(31,62,108,0.15)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: hi ? '#D4A017' : '#1F3E6C' }}>{v}</div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{label}</div>
    </div>
  )

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>מבחן מקנמר — נתונים מזווגים (2×2)</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>רק התאים הבלתי-מתאימים (b ו-c) — שינו את תשובתם — נכנסים למבחן. התאים המתאימים (a, d) לא משפיעים.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 8, alignItems: 'center', maxWidth: 440, margin: '0 auto 14px' }}>
        <div />
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, opacity: 0.75 }}>אחרי: כן</div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, opacity: 0.75 }}>אחרי: לא</div>

        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75 }}>לפני: כן</div>
        <Cell v={a} label="a — מתאים" />
        <Cell v={b} hi label="b — שינוי" />

        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75 }}>לפני: לא</div>
        <Cell v={c} hi label="c — שינוי" />
        <Cell v={d} label="d — מתאים" />
      </div>

      <div id="mcn-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 26 }} />

      <Slider label={`b (כן→לא) = ${b}`} value={b} min={0} max={60} step={1} onChange={v => setB(Math.round(v))} />
      <Slider label={`c (לא→כן) = ${c}`} value={c} min={0} max={60} step={1} onChange={v => setC(Math.round(v))} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(31,62,108,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
        <span>χ² = <b>{chi.toFixed(3)}</b></span>
        <span style={{ opacity: 0.85 }}>עם תיקון רציפות: {chiCorr.toFixed(3)}</span>
        <span>ערך קריטי (df=1): 3.841</span>
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
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 140 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
