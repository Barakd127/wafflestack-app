/**
 * ChebyshevInteractive — Chebyshev's inequality vs reality. A normal curve
 * (as one example population) with mean 0, σ=1. Slider k shades the band
 * within k·σ of the mean and contrasts the DISTRIBUTION-FREE Chebyshev
 * guarantee (at least 1 − 1/k²) against the actual normal coverage.
 * Teaches: Chebyshev holds for ANY distribution, so its bound is loose.
 */
import { useState, useEffect, useMemo } from 'react'

const W = 640, H = 320, PAD_X = 40, PAD_Y = 26, AXIS_Y = H - 46

function pdf(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}
function cdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z >= 0 ? 1 - p : p
}

export default function ChebyshevInteractive() {
  const [k, setK] = useState(2)

  const { bound, actual } = useMemo(() => {
    const bound = Math.max(0, 1 - 1 / (k * k))   // Chebyshev: at least this fraction within k·σ
    const actual = 2 * cdf(k) - 1                 // actual coverage under a normal
    return { bound, actual }
  }, [k])

  const xMin = -4, xMax = 4
  const yMax = pdf(0) * 1.12
  const toX = (v: number) => PAD_X + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD_X)
  const toY = (v: number) => AXIS_Y - (v / yMax) * (AXIS_Y - PAD_Y)

  const N = 240
  const xs = Array.from({ length: N }, (_, i) => xMin + ((xMax - xMin) * i) / (N - 1))
  const curve = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(pdf(x)).toFixed(2)}`).join(' ')

  // shaded band within [-k, k]
  const bandXs = xs.filter(x => x >= -k && x <= k)
  const band = bandXs.length
    ? `M ${toX(-k).toFixed(2)} ${AXIS_Y} ` +
      bandXs.map(x => `L ${toX(x).toFixed(2)} ${toY(pdf(x)).toFixed(2)}`).join(' ') +
      ` L ${toX(k).toFixed(2)} ${AXIS_Y} Z`
    : ''

  useEffect(() => {
    const kx = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('cheb-formula')
    if (kx && el) kx.render(`P(|X-\\mu| \\ge k\\sigma) \\le \\frac{1}{k^2} \\;\\Rightarrow\\; P(|X-\\mu| < k\\sigma) \\ge 1-\\frac{1}{k^2}`, el, { throwOnError: false })
  }, [])

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>אי-שוויון צ׳בישב — חסם לכל התפלגות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>הרצועה מסמנת ±k·σ סביב התוחלת. צ׳בישב מבטיח לפחות 1 − 1/k² בתוכה עבור כל התפלגות; בנורמלי הכיסוי בפועל גבוה בהרבה.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(31,62,108,0.4)" />
        <path d={band} fill="rgba(212,160,23,0.32)" />
        <path d={curve} stroke="#1F3E6C" strokeWidth={2.5} fill="none" />
        <line x1={toX(-k)} y1={PAD_Y} x2={toX(-k)} y2={AXIS_Y} stroke="#D4A017" strokeDasharray="4 3" />
        <line x1={toX(k)} y1={PAD_Y} x2={toX(k)} y2={AXIS_Y} stroke="#D4A017" strokeDasharray="4 3" />
        <text x={toX(-k)} y={AXIS_Y + 16} fill="#D4A017" fontSize={11} textAnchor="middle">-k·σ</text>
        <text x={toX(k)} y={AXIS_Y + 16} fill="#D4A017" fontSize={11} textAnchor="middle">+k·σ</text>
        <text x={toX(0)} y={AXIS_Y + 16} fill="#64748B" fontSize={11} textAnchor="middle">μ</text>
      </svg>

      <div id="cheb-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 26 }} />

      <Slider label={`k = ${k.toFixed(2)}`} value={k} min={1} max={3.5} step={0.05} onChange={setK} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(31,62,108,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ color: '#D4A017', fontWeight: 700 }}>צ׳בישב מבטיח ≥ {(bound * 100).toFixed(1)}%</span>
        <span style={{ color: '#1F3E6C', fontWeight: 700 }}>בנורמלי בפועל {(actual * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 120 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
