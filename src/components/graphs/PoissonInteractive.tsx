/**
 * PoissonInteractive — Lambda slider 0.5-15. Bar chart of P(X=k) for k=0..30.
 * Shows mean=λ, variance=λ. Toggle "overlay normal approx" once λ≥10.
 */
import { useEffect, useState, useMemo } from 'react'

const W = 640
const H = 320
const PAD_X = 40
const PAD_Y = 30
const AXIS_Y = H - 50

const KMAX = 30

// log-factorial via lgamma trick (Stirling for k>20, exact below)
function logFact(k: number): number {
  if (k < 2) return 0
  let s = 0
  for (let i = 2; i <= k; i++) s += Math.log(i)
  return s
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  return Math.exp(-lambda + k * Math.log(lambda) - logFact(k))
}

function normalPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}

export default function PoissonInteractive() {
  const [lambda, setLambda] = useState(4)
  const [showNormal, setShowNormal] = useState(false)

  const probs = useMemo(() => {
    return Array.from({ length: KMAX + 1 }, (_, k) => poissonPmf(k, lambda))
  }, [lambda])

  const yMax = Math.max(...probs) * 1.15

  const toX = (k: number) => PAD_X + (k / KMAX) * (W - 2 * PAD_X)
  const toY = (p: number) => AXIS_Y - (p / yMax) * (AXIS_Y - PAD_Y)
  const barW = ((W - 2 * PAD_X) / (KMAX + 1)) * 0.85

  // Normal overlay path (mu=lambda, sigma=sqrt(lambda))
  const sigma = Math.sqrt(lambda)
  const normalAvailable = lambda >= 10
  const normPath = useMemo(() => {
    if (!showNormal || !normalAvailable) return ''
    const xs = Array.from({ length: 200 }, (_, i) => (i / 199) * KMAX)
    return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(normalPdf(x, lambda, sigma)).toFixed(2)}`).join(' ')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNormal, normalAvailable, lambda, sigma, yMax])

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('poi-formula')
    if (k && el) {
      k.render(
        `P(X = k) = \\frac{\\lambda^{k} e^{-\\lambda}}{k!}, \\quad \\lambda = ${lambda.toFixed(2)}`,
        el,
        { throwOnError: false },
      )
    }
  }, [lambda])

  // Tick labels every 5
  const xTicks = [0, 5, 10, 15, 20, 25, 30]

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>התפלגות פואסון — קירוב לבינומית</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        פואסון מתארת מספר אירועים נדירים בפרק זמן קבוע. הזז את λ — ככל שהוא גדל, ההתפלגות מתקרבת לנורמלית עם μ = σ² = λ.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />
        <line x1={PAD_X} y1={PAD_Y} x2={PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />

        {/* X ticks */}
        {xTicks.map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={AXIS_Y - 3} x2={toX(t)} y2={AXIS_Y + 3} stroke="rgba(255,255,255,0.4)" />
            <text x={toX(t)} y={AXIS_Y + 16} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
          </g>
        ))}

        {/* Y ticks */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <text key={f} x={PAD_X - 6} y={toY(yMax * f) + 4} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="end">
            {(yMax * f).toFixed(2)}
          </text>
        ))}

        {/* Bars */}
        {probs.map((p, k) => (
          <rect
            key={k}
            x={toX(k) - barW / 2}
            y={toY(p)}
            width={barW}
            height={AXIS_Y - toY(p)}
            fill={k === Math.round(lambda) ? '#FFD700' : '#60a5fa'}
            opacity={0.85}
          />
        ))}

        {/* Mean line */}
        <line x1={toX(lambda)} y1={PAD_Y} x2={toX(lambda)} y2={AXIS_Y} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={toX(lambda)} y={PAD_Y - 4} fill="#f59e0b" fontSize={12} textAnchor="middle" fontWeight={700}>
          μ = λ
        </text>

        {/* Normal overlay */}
        {showNormal && normalAvailable && (
          <path d={normPath} stroke="#FFD700" strokeWidth={2.5} fill="none" opacity={0.85} />
        )}
      </svg>

      <div id="poi-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 13, minWidth: 100 }}>λ = {lambda.toFixed(2)}</label>
        <input
          type="range"
          min={0.5}
          max={15}
          step={0.1}
          value={lambda}
          onChange={e => setLambda(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setShowNormal(!showNormal)}
          disabled={!normalAvailable}
          style={{
            background: showNormal && normalAvailable ? '#FFD700' : 'rgba(255,255,255,0.1)',
            color: showNormal && normalAvailable ? '#0B1B3E' : '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: normalAvailable ? 'pointer' : 'not-allowed',
            opacity: normalAvailable ? 1 : 0.5,
            fontSize: 13,
            fontWeight: showNormal && normalAvailable ? 700 : 400,
          }}
        >
          {showNormal ? 'הסר קירוב נורמלי' : 'הצג קירוב נורמלי'}
        </button>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          {normalAvailable ? '✓ λ ≥ 10 — קירוב טוב' : `דרוש λ ≥ 10 (נוכחי: ${lambda.toFixed(1)})`}
        </span>
        <span style={{ marginInlineStart: 'auto', fontSize: 13, opacity: 0.8 }}>
          μ = λ = {lambda.toFixed(2)} &nbsp;·&nbsp; σ² = λ = {lambda.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
