/**
 * PercentileInteractive — Histogram of 50 dots. Slider for percentile 1-99.
 * Vertical line at that percentile, dots colored below=blue, above=gray.
 * Shows value at percentile + how many dots below.
 */
import { useEffect, useMemo, useState } from 'react'

const W = 640
const H = 320
const PAD_X = 40
const PAD_Y = 30
const AXIS_Y = H - 50

const N = 50

// Generate a reproducible-ish distribution (normal-ish via Box-Muller seeded once)
function generateData(seed: number): number[] {
  // Simple LCG for reproducibility
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  const out: number[] = []
  for (let i = 0; i < N; i++) {
    const u1 = Math.max(1e-9, rand())
    const u2 = rand()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    // Mean 70, SD 12 (test-score-like)
    out.push(70 + 12 * z)
  }
  return out
}

function percentileValue(sorted: number[], p: number): number {
  // Linear interpolation
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export default function PercentileInteractive() {
  const [seed, setSeed] = useState(7)
  const [p, setP] = useState(50)

  const data = useMemo(() => generateData(seed), [seed])
  const sorted = useMemo(() => [...data].sort((a, b) => a - b), [data])
  const xMin = Math.floor(Math.min(...sorted) - 2)
  const xMax = Math.ceil(Math.max(...sorted) + 2)

  const value = percentileValue(sorted, p)
  const belowCount = sorted.filter(v => v < value).length

  const toX = (v: number) => PAD_X + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD_X)

  // Stack dots horizontally in bins (simple dot-histogram)
  const binW = 3 // value units per bin
  const bins = new Map<number, number[]>() // bin → indices
  data.forEach((v, i) => {
    const b = Math.floor((v - xMin) / binW)
    if (!bins.has(b)) bins.set(b, [])
    bins.get(b)!.push(i)
  })

  // Compute dot positions
  const dotR = 6
  const dotGap = 2
  type Pos = { v: number; cx: number; cy: number; below: boolean; idx: number }
  const positions: Pos[] = []
  bins.forEach((idxs, b) => {
    const binCenter = xMin + (b + 0.5) * binW
    const cx = toX(binCenter)
    idxs.forEach((idx, k) => {
      const v = data[idx]
      const cy = AXIS_Y - dotR - k * (dotR * 2 + dotGap)
      positions.push({ v, cx, cy, below: v < value, idx })
    })
  })

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('pct-formula')
    if (k && el) {
      k.render(
        `P_{${p}} = ${value.toFixed(2)}, \\quad \\#\\{x_i < P_{${p}}\\} = ${belowCount}/${N}`,
        el,
        { throwOnError: false },
      )
    }
  }, [p, value, belowCount])

  // X axis ticks
  const tickStep = Math.max(5, Math.round((xMax - xMin) / 8))
  const xTicks: number[] = []
  for (let t = Math.ceil(xMin / tickStep) * tickStep; t <= xMax; t += tickStep) xTicks.push(t)

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>אחוזונים — מיקום בהתפלגות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        50 ערכים מסודרים בהיסטוגרמת נקודות. הזז את האחוזון וצפה היכן הוא חותך — וכמה נקודות נמצאות מתחתיו.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={PAD_X} y1={AXIS_Y} x2={W - PAD_X} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />

        {xTicks.map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={AXIS_Y - 3} x2={toX(t)} y2={AXIS_Y + 3} stroke="rgba(255,255,255,0.4)" />
            <text x={toX(t)} y={AXIS_Y + 16} fill="rgba(255,255,255,0.6)" fontSize={11} textAnchor="middle">{t}</text>
          </g>
        ))}

        {/* Dots */}
        {positions.map(pos => (
          <circle
            key={pos.idx}
            cx={pos.cx}
            cy={pos.cy}
            r={dotR}
            fill={pos.below ? '#60a5fa' : '#94a3b8'}
            stroke="#fff"
            strokeWidth={1}
            opacity={0.95}
          />
        ))}

        {/* Percentile cut line */}
        <line
          x1={toX(value)}
          y1={PAD_Y}
          x2={toX(value)}
          y2={AXIS_Y}
          stroke="#FFD700"
          strokeWidth={2.5}
          strokeDasharray="6 4"
        />
        <text x={toX(value)} y={PAD_Y - 6} fill="#FFD700" fontSize={13} textAnchor="middle" fontWeight={700}>
          P{p} = {value.toFixed(2)}
        </text>
      </svg>

      <div id="pct-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <label style={{ fontSize: 13, minWidth: 100 }}>P = {p}</label>
        <input
          type="range"
          min={1}
          max={99}
          step={1}
          value={p}
          onChange={e => setP(parseInt(e.target.value, 10))}
          style={{ flex: 1 }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          padding: '10px 14px',
          background: 'rgba(96,165,250,0.12)',
          borderRadius: 8,
          fontSize: 13,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span><span style={{ color: '#60a5fa', fontWeight: 700 }}>{belowCount}</span> מתחת ל-P{p}</span>
        <span><span style={{ color: '#94a3b8', fontWeight: 700 }}>{N - belowCount}</span> מעליו</span>
        <span style={{ marginInlineStart: 'auto' }}>ערך באחוזון: <span style={{ color: '#FFD700', fontWeight: 700 }}>{value.toFixed(2)}</span></span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSeed(seed + 1)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          הגרל נתונים חדשים
        </button>
        <button
          onClick={() => setP(25)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          P25 (רבעון תחתון)
        </button>
        <button
          onClick={() => setP(50)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          P50 (חציון)
        </button>
        <button
          onClick={() => setP(75)}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          P75 (רבעון עליון)
        </button>
      </div>
    </div>
  )
}
