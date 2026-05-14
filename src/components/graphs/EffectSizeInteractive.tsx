/**
 * EffectSizeInteractive — Two overlapping bell curves (control vs treatment).
 * Cohen's d slider 0.0-2.0. Visual overlap shrinks as d grows.
 * Shows standard interpretation table (small=0.2, medium=0.5, large=0.8).
 */
import { useRef, useEffect, useState, useMemo } from 'react'

const W = 640
const H = 320
const PAD_X = 40
const PAD_Y = 30
const AXIS_Y = H - 50

// Standard normal pdf
function pdf(x: number, mu: number, sigma: number) {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}

// Cohen's overlap formula: U3 = Φ(d), overlap percentage ~ 2Φ(-d/2)
// We compute overlap numerically by integrating min(f1, f2).
function approxNormalCdf(z: number) {
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z >= 0 ? 1 - p : p
}

function interpret(d: number) {
  const ad = Math.abs(d)
  if (ad < 0.2) return { label: 'זניח', color: '#94a3b8' }
  if (ad < 0.5) return { label: 'קטן (Small)', color: '#60a5fa' }
  if (ad < 0.8) return { label: 'בינוני (Medium)', color: '#FFD700' }
  if (ad < 1.2) return { label: 'גדול (Large)', color: '#f59e0b' }
  return { label: 'גדול מאוד (Very Large)', color: '#ef4444' }
}

export default function EffectSizeInteractive() {
  const [d, setD] = useState(0.5)

  const { mu1, mu2, sigma, overlap } = useMemo(() => {
    const sigma = 1
    const mu1 = 0
    const mu2 = d * sigma
    // Overlap ≈ 2·Φ(-|d|/2)
    const overlap = 2 * approxNormalCdf(-Math.abs(d) / 2)
    return { mu1, mu2, sigma, overlap }
  }, [d])

  const xMin = -4
  const xMax = 4 + Math.max(0, d)
  const yMax = 0.45
  const toX = (v: number) => PAD_X + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD_X)
  const toY = (v: number) => AXIS_Y - (v / yMax) * (AXIS_Y - PAD_Y)

  // Build path strings
  const N = 200
  const xs = Array.from({ length: N }, (_, i) => xMin + ((xMax - xMin) * i) / (N - 1))
  const path1 = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(pdf(x, mu1, sigma)).toFixed(2)}`).join(' ')
  const path2 = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(pdf(x, mu2, sigma)).toFixed(2)}`).join(' ')

  // Overlap area path (min of both densities), closed to baseline
  const overlapPath = (() => {
    const top = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(Math.min(pdf(x, mu1, sigma), pdf(x, mu2, sigma))).toFixed(2)}`).join(' ')
    return `${top} L ${toX(xMax).toFixed(2)} ${AXIS_Y} L ${toX(xMin).toFixed(2)} ${AXIS_Y} Z`
  })()

  const sliderRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('eff-formula')
    if (k && el) {
      k.render(
        `d = \\frac{\\mu_2 - \\mu_1}{\\sigma} = ${d.toFixed(2)}, \\quad \\text{overlap} = ${(overlap * 100).toFixed(1)}\\%`,
        el,
        { throwOnError: false },
      )
    }
  }, [d, overlap])

  const info = interpret(d)

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>גודל אפקט — Cohen's d</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        הזז את d וצפה כיצד שתי ההתפלגויות מתרחקות. ככל ש-d גדול יותר — חפיפה קטנה יותר ↔ אפקט חזק יותר.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ touchAction: 'none' }}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />
        {/* Tick labels */}
        {[-3, -2, -1, 0, 1, 2, 3, 4].map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={AXIS_Y - 3} x2={toX(t)} y2={AXIS_Y + 3} stroke="rgba(255,255,255,0.4)" />
            <text x={toX(t)} y={AXIS_Y + 16} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
          </g>
        ))}

        {/* Overlap area */}
        <path d={overlapPath} fill="rgba(245,158,11,0.35)" stroke="none" />

        {/* Control curve */}
        <path d={path1} stroke="#60a5fa" strokeWidth={2.5} fill="none" />
        {/* Treatment curve */}
        <path d={path2} stroke="#FFD700" strokeWidth={2.5} fill="none" />

        {/* Mean lines */}
        <line x1={toX(mu1)} y1={toY(pdf(mu1, mu1, sigma))} x2={toX(mu1)} y2={AXIS_Y} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={toX(mu2)} y1={toY(pdf(mu2, mu2, sigma))} x2={toX(mu2)} y2={AXIS_Y} stroke="#FFD700" strokeWidth={1.5} strokeDasharray="3 3" />

        <text x={toX(mu1)} y={PAD_Y - 8} fill="#60a5fa" fontSize={12} textAnchor="middle" fontWeight={700}>ביקורת</text>
        <text x={toX(mu2)} y={PAD_Y - 8} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight={700}>טיפול</text>
      </svg>

      <div id="eff-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <label htmlFor="d-slider" style={{ fontSize: 13, opacity: 0.85, minWidth: 80 }}>d = {d.toFixed(2)}</label>
        <input
          ref={sliderRef}
          id="d-slider"
          type="range"
          min={0}
          max={2}
          step={0.05}
          value={d}
          onChange={e => setD(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
        <span style={{ fontWeight: 700 }}>פירוש: {info.label}</span>
        <span style={{ opacity: 0.65, marginInlineStart: 'auto' }}>חפיפה: {(overlap * 100).toFixed(1)}%</span>
      </div>

      <table style={{ width: '100%', marginTop: 12, fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
            <th style={{ textAlign: 'start', padding: '6px 10px', fontWeight: 600 }}>d</th>
            <th style={{ textAlign: 'start', padding: '6px 10px', fontWeight: 600 }}>פירוש (Cohen, 1988)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: '4px 10px' }}>0.2</td><td style={{ padding: '4px 10px' }}>אפקט קטן (Small)</td></tr>
          <tr><td style={{ padding: '4px 10px' }}>0.5</td><td style={{ padding: '4px 10px' }}>אפקט בינוני (Medium)</td></tr>
          <tr><td style={{ padding: '4px 10px' }}>0.8</td><td style={{ padding: '4px 10px' }}>אפקט גדול (Large)</td></tr>
          <tr><td style={{ padding: '4px 10px' }}>1.2+</td><td style={{ padding: '4px 10px' }}>אפקט גדול מאוד</td></tr>
        </tbody>
      </table>
    </div>
  )
}
