/**
 * SkewnessKurtosisInteractive — single density curve morphed by two sliders:
 * skew (-1..1) deforms via a skew-normal-like transformation; kurtosis (-1..1)
 * blends between a wide platykurtic curve and a peaked leptokurtic one. Live
 * numeric readouts for sample skewness and excess kurtosis.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 320, PAD_X = 30, PAD_Y = 30, AXIS_Y = H - 50

// Skew-normal-ish pdf using the Azzalini form:  2 φ(x) Φ(α x)
function phi(x: number) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI) }
function Phi(x: number) {
  // simple cdf approx
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp(-x * x / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x >= 0 ? 1 - p : p
}
// blend-curve: normal vs heavy-tailed (Cauchy-ish) vs uniform-ish
function blend(x: number, k: number) {
  // k in [-1, 1]; -1 platykurtic (uniform-like), 0 normal, +1 leptokurtic (laplace)
  const normalPdf = phi(x)
  const laplacePdf = 0.5 * Math.exp(-Math.abs(x))     // peaked, fat tails
  const uniformPdf = Math.abs(x) < Math.sqrt(3) ? 1 / (2 * Math.sqrt(3)) : 0  // flat
  if (k >= 0) return (1 - k) * normalPdf + k * laplacePdf
  return (1 - (-k)) * normalPdf + (-k) * uniformPdf
}
function skewKurtPdf(x: number, alpha: number, k: number) {
  return 2 * blend(x, k) * Phi(alpha * x)
}

export default function SkewnessKurtosisInteractive() {
  const [skew, setSkew] = useState(0)   // -1..1 -> alpha range
  const [kurt, setKurt] = useState(0)   // -1..1

  const alpha = skew * 6   // map slider to Azzalini's alpha (~ -6..6)

  const { skewness, excessKurt } = useMemo(() => {
    // Numerical moments
    const xs: number[] = []
    const N = 400, xMin = -5, xMax = 5
    let totalW = 0
    for (let i = 0; i < N; i++) {
      const x = xMin + ((xMax - xMin) * i) / (N - 1)
      const w = skewKurtPdf(x, alpha, kurt)
      xs.push(x * w)
      totalW += w
    }
    if (totalW === 0) return { skewness: 0, excessKurt: 0 }
    const dx = (xMax - xMin) / (N - 1)
    // recompute properly
    let m1 = 0, m2 = 0, m3 = 0, m4 = 0, Z = 0
    for (let i = 0; i < N; i++) {
      const x = xMin + ((xMax - xMin) * i) / (N - 1)
      const w = skewKurtPdf(x, alpha, kurt) * dx
      Z += w; m1 += x * w
    }
    const mu = m1 / Z
    for (let i = 0; i < N; i++) {
      const x = xMin + ((xMax - xMin) * i) / (N - 1)
      const w = skewKurtPdf(x, alpha, kurt) * dx
      const d = x - mu
      m2 += d * d * w; m3 += d * d * d * w; m4 += d * d * d * d * w
    }
    m2 /= Z; m3 /= Z; m4 /= Z
    const sigma = Math.sqrt(m2)
    const skewness = sigma > 0 ? m3 / (sigma ** 3) : 0
    const excessKurt = sigma > 0 ? m4 / (sigma ** 4) - 3 : 0
    return { skewness, excessKurt }
  }, [alpha, kurt])

  const xMin = -5, xMax = 5
  const toX = (v: number) => PAD_X + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD_X)
  const N = 240
  const xs = Array.from({ length: N }, (_, i) => xMin + ((xMax - xMin) * i) / (N - 1))
  const ys = xs.map(x => skewKurtPdf(x, alpha, kurt))
  const yMax = Math.max(...ys) * 1.15
  const toY = (v: number) => AXIS_Y - (v / yMax) * (AXIS_Y - PAD_Y)
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(ys[i]).toFixed(2)}`).join(' ')
  const closed = `${path} L ${toX(xMax).toFixed(2)} ${AXIS_Y} L ${toX(xMin).toFixed(2)} ${AXIS_Y} Z`

  useEffect(() => {
    const kk = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('sk-formula')
    if (kk && el) kk.render(
      `\\text{Skewness} = ${skewness.toFixed(3)}, \\quad \\text{Excess Kurtosis} = ${excessKurt.toFixed(3)}`,
      el, { throwOnError: false },
    )
  }, [skewness, excessKurt])

  const skewLabel = skewness < -0.5 ? 'אסימטרי שמאלי' : skewness > 0.5 ? 'אסימטרי ימני' : 'סימטרי'
  const kurtLabel = excessKurt < -0.3 ? 'Platykurtic (שטוח)' : excessKurt > 0.3 ? 'Leptokurtic (חד)' : 'Mesokurtic (נורמלי)'

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>צורת התפלגות — Skewness & Kurtosis</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>מחוון אחד שולט באסימטריה (זנב שמאל/ימין). השני שולט בחדות הפסגה.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />
        <path d={closed} fill="rgba(255,215,0,0.18)" />
        <path d={path} stroke="#FFD700" strokeWidth={2.5} fill="none" />
        {[-4, -2, 0, 2, 4].map(t => (
          <text key={t} x={toX(t)} y={AXIS_Y + 14} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
        ))}
      </svg>

      <div id="sk-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <Slider label={`Skew = ${skew.toFixed(2)}`} value={skew} min={-1} max={1} step={0.05} onChange={setSkew} />
      <Slider label={`Kurtosis = ${kurt.toFixed(2)}`} value={kurt} min={-1} max={1} step={0.05} onChange={setKurt} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ color: '#FFD700' }}>{skewLabel}</span>
        <span style={{ color: '#60a5fa' }}>{kurtLabel}</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 130 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
