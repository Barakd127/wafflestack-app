/**
 * LinearTransformationInteractive — original histogram + transformed Y=aX+b.
 * Sliders for a (scale) and b (shift). Live readout of how μ → aμ+b and
 * σ → |a|σ. Negative a flips the distribution.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 360
const PAD = 30
const HALF_H = (H - 80) / 2

// Original fixed dataset (normal-ish around μ=10, σ=2)
const DATA: number[] = (() => {
  const a: number[] = []
  let s = 7
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = 0; i < 60; i++) {
    // Box-Muller-ish: average 4 uniforms for approximate normal
    let u = 0; for (let j = 0; j < 4; j++) u += rnd()
    a.push(10 + ((u / 4) - 0.5) * 8)
  }
  return a
})()

function stats(xs: number[]) {
  const mu = xs.reduce((a, b) => a + b, 0) / xs.length
  const v = xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length
  return { mu, sd: Math.sqrt(v) }
}
function histogram(xs: number[], min: number, max: number, bins = 20) {
  const h = new Array(bins).fill(0)
  for (const x of xs) {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(((x - min) / (max - min)) * bins)))
    h[idx]++
  }
  return h
}

export default function LinearTransformationInteractive() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)

  const transformed = useMemo(() => DATA.map(x => a * x + b), [a, b])
  const sOrig = stats(DATA)
  const sNew  = stats(transformed)

  // Common x-range that covers both
  const xMin = Math.min(0, sOrig.mu - 4 * sOrig.sd, sNew.mu - 4 * sNew.sd)
  const xMax = Math.max(20, sOrig.mu + 4 * sOrig.sd, sNew.mu + 4 * sNew.sd)
  const bins = 20
  const hOrig = histogram(DATA, xMin, xMax, bins)
  const hNew  = histogram(transformed, xMin, xMax, bins)
  const maxC = Math.max(1, ...hOrig, ...hNew)

  const barW = (W - 2 * PAD) / bins
  const toX = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD)
  const baseTop = 30 + HALF_H
  const baseBot = 30 + 2 * HALF_H + 20

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('lin-formula')
    if (k && el) k.render(
      `Y = ${a.toFixed(2)} X + ${b.toFixed(2)}, \\quad \\mu_Y = ${a.toFixed(2)}\\mu_X + ${b.toFixed(2)} = ${sNew.mu.toFixed(2)}, \\quad \\sigma_Y = |${a.toFixed(2)}|\\sigma_X = ${sNew.sd.toFixed(2)}`,
      el, { throwOnError: false },
    )
  }, [a, b, sNew.mu, sNew.sd])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>טרנספורמציה ליניארית — Y = aX + b</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>שינוי קנה־מידה a ←→ מעבר b. צורת ההתפלגות נשמרת — רק מיקום ופיזור משתנים.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <text x={PAD} y={20} fill="#60a5fa" fontSize={12} fontWeight={700}>X (original)  μ={sOrig.mu.toFixed(2)}  σ={sOrig.sd.toFixed(2)}</text>
        <line x1={PAD} y1={baseTop} x2={W - PAD} y2={baseTop} stroke="rgba(255,255,255,0.4)" />
        {hOrig.map((c, i) => {
          const h = (HALF_H * c) / maxC
          return <rect key={i} x={PAD + i * barW + 1} y={baseTop - h} width={barW - 2} height={h} fill="#60a5fa" opacity={0.7} />
        })}
        <line x1={toX(sOrig.mu)} y1={30} x2={toX(sOrig.mu)} y2={baseTop} stroke="#60a5fa" strokeDasharray="3 3" />

        <text x={PAD} y={baseTop + 20} fill="#FFD700" fontSize={12} fontWeight={700}>Y = aX + b   μ={sNew.mu.toFixed(2)}  σ={sNew.sd.toFixed(2)}</text>
        <line x1={PAD} y1={baseBot} x2={W - PAD} y2={baseBot} stroke="rgba(255,255,255,0.4)" />
        {hNew.map((c, i) => {
          const h = (HALF_H * c) / maxC
          return <rect key={i} x={PAD + i * barW + 1} y={baseBot - h} width={barW - 2} height={h} fill="#FFD700" opacity={0.7} />
        })}
        <line x1={toX(sNew.mu)} y1={baseTop + 30} x2={toX(sNew.mu)} y2={baseBot} stroke="#FFD700" strokeDasharray="3 3" />

        {[0, 5, 10, 15, 20, 25, 30].filter(t => t >= xMin && t <= xMax).map(t => (
          <text key={t} x={toX(t)} y={H - 8} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
        ))}
      </svg>

      <div id="lin-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <Slider label={`a = ${a.toFixed(2)}`} value={a} min={-3} max={3} step={0.05} onChange={setA} />
      <Slider label={`b = ${b.toFixed(2)}`} value={b} min={-15} max={15} step={0.5} onChange={setB} />
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 100 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
