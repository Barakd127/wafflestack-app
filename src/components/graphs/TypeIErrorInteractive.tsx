/**
 * TypeIErrorInteractive — overlapping H0 vs H1 normal curves. Sliders for
 * effect size δ, significance α, and sample size n. Shades α (red, type-I)
 * and β (blue, type-II) tail regions. Live readout of power = 1 - β.
 */
import { useState, useEffect, useMemo } from 'react'

const W = 640, H = 320, PAD_X = 40, PAD_Y = 30, AXIS_Y = H - 50

function pdf(x: number, mu: number, sigma: number) {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}
function cdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z >= 0 ? 1 - p : p
}
// inverse normal (Beasley-Springer/Moro short version for the upper-tail critical values)
function zCrit(p: number) {
  // returns z such that P(Z > z) = p (one-sided)
  // Use bisection on cdf since we only need ~3 decimals
  let lo = -6, hi = 6
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2
    if (1 - cdf(m) > p) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

export default function TypeIErrorInteractive() {
  const [delta, setDelta] = useState(0.6)
  const [alpha, setAlpha] = useState(0.05)
  const [n, setN] = useState(30)

  const { mu0, mu1, sigma, zc, beta, power } = useMemo(() => {
    const sigma = 1 / Math.sqrt(n)
    const mu0 = 0
    const mu1 = delta
    const zc = zCrit(alpha) * sigma            // critical x value on raw scale
    const beta = cdf((zc - mu1) / sigma)        // P(X < zc | H1)
    const power = 1 - beta
    return { mu0, mu1, sigma, zc, beta, power }
  }, [delta, alpha, n])

  const xMin = -1, xMax = 1 + delta
  const yMax = pdf(0, 0, sigma) * 1.1
  const toX = (v: number) => PAD_X + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD_X)
  const toY = (v: number) => AXIS_Y - (v / yMax) * (AXIS_Y - PAD_Y)

  const N = 240
  const xs = Array.from({ length: N }, (_, i) => xMin + ((xMax - xMin) * i) / (N - 1))
  const buildPath = (mu: number) =>
    xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(pdf(x, mu, sigma)).toFixed(2)}`).join(' ')

  const path0 = buildPath(mu0)
  const path1 = buildPath(mu1)

  // alpha region: x > zc under H0
  const alphaXs = xs.filter(x => x >= zc)
  const alphaPath = alphaXs.length
    ? `M ${toX(zc).toFixed(2)} ${AXIS_Y} ` +
      alphaXs.map(x => `L ${toX(x).toFixed(2)} ${toY(pdf(x, mu0, sigma)).toFixed(2)}`).join(' ') +
      ` L ${toX(xMax).toFixed(2)} ${AXIS_Y} Z`
    : ''
  // beta region: x < zc under H1
  const betaXs = xs.filter(x => x <= zc)
  const betaPath = betaXs.length
    ? `M ${toX(xMin).toFixed(2)} ${AXIS_Y} ` +
      betaXs.map(x => `L ${toX(x).toFixed(2)} ${toY(pdf(x, mu1, sigma)).toFixed(2)}`).join(' ') +
      ` L ${toX(zc).toFixed(2)} ${AXIS_Y} Z`
    : ''

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('t1-formula')
    if (k && el) k.render(`\\alpha = ${alpha.toFixed(3)}, \\quad \\beta = ${beta.toFixed(3)}, \\quad \\text{power} = 1-\\beta = ${power.toFixed(3)}`, el, { throwOnError: false })
  }, [alpha, beta, power])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>שגיאה מסוג I ו-II — α · β · עוצמה</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>אדום = α (Type I), כחול = β (Type II). העלאת n מקטינה את σ → β קטן → עוצמה עולה.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />
        <path d={betaPath} fill="rgba(96,165,250,0.4)" />
        <path d={alphaPath} fill="rgba(239,68,68,0.5)" />
        <path d={path0} stroke="#94a3b8" strokeWidth={2.5} fill="none" />
        <path d={path1} stroke="#FFD700" strokeWidth={2.5} fill="none" />
        <line x1={toX(zc)} y1={PAD_Y} x2={toX(zc)} y2={AXIS_Y} stroke="#ef4444" strokeDasharray="4 3" />
        <text x={toX(zc) + 4} y={PAD_Y + 12} fill="#ef4444" fontSize={11}>critical</text>
        <text x={toX(mu0)} y={PAD_Y - 8} fill="#94a3b8" fontSize={12} textAnchor="middle" fontWeight={700}>H₀</text>
        <text x={toX(mu1)} y={PAD_Y - 8} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight={700}>H₁</text>
      </svg>

      <div id="t1-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <Slider label={`δ (effect) = ${delta.toFixed(2)}`} value={delta} min={0} max={1.5} step={0.05} onChange={setDelta} />
      <Slider label={`α = ${alpha.toFixed(3)}`} value={alpha} min={0.001} max={0.2} step={0.001} onChange={setAlpha} />
      <Slider label={`n = ${n}`} value={n} min={5} max={200} step={1} onChange={v => setN(Math.round(v))} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ color: '#ef4444' }}>α = {alpha.toFixed(3)}</span>
        <span style={{ color: '#60a5fa' }}>β = {beta.toFixed(3)}</span>
        <span style={{ color: '#FFD700', fontWeight: 700 }}>Power = {power.toFixed(3)}</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 160 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
