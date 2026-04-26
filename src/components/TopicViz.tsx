/**
 * TopicViz — unique SVG visualizations per statistics topic.
 * One component per building ID, no external chart libraries.
 * Each viz illustrates the KEY insight of its concept at a glance.
 */
import { useEffect, useRef, useState } from 'react'

interface VizProps { color: string; width?: number; height?: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalPDF(x: number, mu: number, s: number) {
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / s) ** 2)
}

function usePulse(interval = 1800) {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT(p => p + 1), interval)
    return () => clearInterval(id)
  }, [interval])
  return t
}

// ─── 1. Mean — bar chart with animated mean line ──────────────────────────────
export function MeanViz({ color, width = 380, height = 200 }: VizProps) {
  const bars = [5, 8, 3, 10, 6, 7, 4]
  const mean = bars.reduce((a, b) => a + b, 0) / bars.length
  const max = Math.max(...bars)
  const pad = { l: 28, r: 16, t: 16, b: 36 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b
  const bw = W / bars.length
  const t = usePulse(2200)
  const pulse = Math.abs(Math.sin(t * 0.8)) * 0.3

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {/* Y axis */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Bars */}
        {bars.map((v, i) => {
          const bh = (v / max) * H
          return (
            <g key={i}>
              <rect
                x={i * bw + 4} y={H - bh} width={bw - 8} height={bh}
                fill={color} opacity={0.55} rx={3}
              />
              <text x={i * bw + bw / 2} y={H + 16} textAnchor="middle"
                fill="rgba(255,255,255,0.5)" fontSize={10}>{v}</text>
            </g>
          )
        })}
        {/* Mean line */}
        <line
          x1={0} y1={H - (mean / max) * H}
          x2={W} y2={H - (mean / max) * H}
          stroke={color} strokeWidth={2.5} strokeDasharray="6 3"
          opacity={0.85 + pulse}
        />
        <text x={W + 4} y={H - (mean / max) * H + 4}
          fill={color} fontSize={11} fontWeight={700}>μ={mean.toFixed(1)}</text>
        {/* X axis */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <text x={W / 2} y={H + 30} textAnchor="middle"
          fill="rgba(255,255,255,0.35)" fontSize={10}>data points</text>
      </g>
    </svg>
  )
}

// ─── 2. Median — sorted dots, middle highlighted ──────────────────────────────
export function MedianViz({ color, width = 380, height = 200 }: VizProps) {
  const data = [2, 4, 5, 7, 8, 11, 13]
  const medianIdx = Math.floor(data.length / 2)
  const pad = { l: 16, r: 16, t: 40, b: 40 }
  const W = width - pad.l - pad.r
  const spacing = W / (data.length - 1)
  const cy = height / 2
  const t = usePulse(1600)
  const pulse = 0.7 + Math.abs(Math.sin(t)) * 0.3

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},0)`}>
        {/* Connecting line */}
        <line x1={0} y1={cy} x2={W} y2={cy} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        {/* Sort label */}
        <text x={W / 2} y={22} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
          ← מסודר מקטן לגדול →
        </text>
        {data.map((v, i) => {
          const isMedian = i === medianIdx
          const x = i * spacing
          return (
            <g key={i}>
              <circle
                cx={x} cy={cy} r={isMedian ? 22 : 16}
                fill={isMedian ? color : 'rgba(255,255,255,0.08)'}
                stroke={isMedian ? color : 'rgba(255,255,255,0.2)'}
                strokeWidth={isMedian ? 2.5 : 1}
                opacity={isMedian ? pulse : 0.8}
              />
              <text x={x} y={cy + 4.5} textAnchor="middle"
                fill={isMedian ? '#000' : 'rgba(255,255,255,0.75)'}
                fontSize={isMedian ? 13 : 11} fontWeight={isMedian ? 800 : 400}>
                {v}
              </text>
              {isMedian && (
                <text x={x} y={cy + 42} textAnchor="middle"
                  fill={color} fontSize={11} fontWeight={700}>חציון</text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ─── 3. Standard Deviation — bell curve with σ bands ─────────────────────────
export function StdDevViz({ color, width = 380, height = 200 }: VizProps) {
  const pad = { l: 24, r: 16, t: 16, b: 32 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b
  const mu = 0; const sigma = 1
  const xMin = -3.5; const xMax = 3.5
  const N = 120
  const pts = Array.from({ length: N }, (_, i) => {
    const x = xMin + (i / (N - 1)) * (xMax - xMin)
    const y = normalPDF(x, mu, sigma)
    return { x, y }
  })
  const yMax = normalPDF(0, 0, 1) * 1.05
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  const sy = (y: number) => H - (y / yMax) * H

  const makeShade = (lo: number, hi: number) =>
    pts.filter(p => p.x >= lo && p.x <= hi)
      .map((p, i, arr) => (i === 0 ? `M${sx(p.x)},${sy(0)} L${sx(p.x)},${sy(p.y)}` : `L${sx(p.x)},${sy(p.y)}`))
      .join(' ') + ` L${sx(hi)},${sy(0)} Z`

  const curvePath = 'M ' + pts.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ')

  const bands = [
    { lo: -3, hi: 3, opacity: 0.10, label: '99.7%', y: -26 },
    { lo: -2, hi: 2, opacity: 0.18, label: '95%',   y: -16 },
    { lo: -1, hi: 1, opacity: 0.32, label: '68%',   y: -6  },
  ]

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {bands.map(b => (
          <g key={b.label}>
            <path d={makeShade(b.lo, b.hi)} fill={color} opacity={b.opacity} />
            <text x={sx(0)} y={sy(yMax * 0.95) + b.y} textAnchor="middle"
              fill={color} fontSize={9} opacity={0.7}>{b.label}</text>
          </g>
        ))}
        <path d={curvePath} fill="none" stroke={color} strokeWidth={2.5} />
        {[-1, 0, 1, -2, 2].map(v => (
          <g key={v}>
            <line x1={sx(v)} y1={H} x2={sx(v)} y2={H + 4} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
            <text x={sx(v)} y={H + 14} textAnchor="middle"
              fill="rgba(255,255,255,0.45)" fontSize={9}>{v === 0 ? 'μ' : `${v}σ`}</text>
          </g>
        ))}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      </g>
    </svg>
  )
}

// ─── 4. Normal Distribution — classic bell, symmetry illustrated ──────────────
export function NormalViz({ color, width = 380, height = 200 }: VizProps) {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const pad = { l: 16, r: 16, t: 16, b: 50 }
  const W = width - pad.l - pad.r
  const H = height - pad.t - pad.b
  const xMin = mu - 4 * sigma; const xMax = mu + 4 * sigma
  const N = 120
  const pts = Array.from({ length: N }, (_, i) => {
    const x = xMin + (i / (N - 1)) * (xMax - xMin)
    return { x, y: normalPDF(x, mu, sigma) }
  })
  const yMax = normalPDF(mu, mu, sigma) * 1.08
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  const sy = (y: number) => H - (y / yMax) * H
  const fill = pts.map((p, i) => i === 0 ? `M${sx(p.x)},${H}` : `L${sx(p.x)},${sy(p.y)}`).join(' ') + ` L${sx(xMax)},${H} Z`
  const curve = 'M ' + pts.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        <path d={fill} fill={color} opacity={0.15} />
        <path d={curve} fill="none" stroke={color} strokeWidth={2.5} />
        {/* Symmetry axis */}
        <line x1={sx(mu)} y1={0} x2={sx(mu)} y2={H} stroke={color} strokeDasharray="5 3" strokeWidth={1.5} opacity={0.5} />
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <text x={sx(mu)} y={H + 14} textAnchor="middle" fill={color} fontSize={11}>μ={mu.toFixed(1)}</text>
        {/* Sliders */}
        <foreignObject x={0} y={H + 24} width={W} height={26}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, whiteSpace: 'nowrap' }}>μ</span>
            <input type="range" min={-2} max={2} step={0.1} value={mu}
              onChange={e => setMu(+e.target.value)}
              style={{ flex: 1, accentColor: color, height: 3 }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, whiteSpace: 'nowrap' }}>σ</span>
            <input type="range" min={0.3} max={2.5} step={0.1} value={sigma}
              onChange={e => setSigma(+e.target.value)}
              style={{ flex: 1, accentColor: color, height: 3 }} />
          </div>
        </foreignObject>
      </g>
    </svg>
  )
}

// ─── 5. Sampling — population dots → sample ───────────────────────────────────
export function SamplingViz({ color, width = 380, height = 200 }: VizProps) {
  const t = usePulse(1400)
  // deterministic dot positions
  const pop = Array.from({ length: 36 }, (_, i) => ({
    x: 30 + (i % 6) * 22,
    y: 20 + Math.floor(i / 6) * 22,
    sampled: i % 7 === 0 || i === 3 || i === 14 || i === 28 || i === 21,
  }))
  const highlighted = (t % 2 === 0)

  return (
    <svg width={width} height={height}>
      {/* Population box */}
      <rect x={10} y={10} width={160} height={160} rx={8}
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <text x={90} y={185} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
        אוכלוסיה (N=36)
      </text>
      {pop.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={7}
          fill={d.sampled ? color : 'rgba(255,255,255,0.12)'}
          opacity={d.sampled ? (highlighted ? 1 : 0.6) : 0.5}
          stroke={d.sampled ? color : 'none'} strokeWidth={1.5}
        />
      ))}
      {/* Arrow */}
      <line x1={178} y1={90} x2={215} y2={90} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
      <polygon points="215,86 224,90 215,94" fill="rgba(255,255,255,0.4)" />
      {/* Sample box */}
      <rect x={228} y={40} width={130} height={110} rx={8}
        fill={`${color}15`} stroke={color} strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={293} y={165} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>
        מדגם (n=5)
      </text>
      {pop.filter(d => d.sampled).map((d, i) => (
        <circle key={i} cx={248 + (i % 3) * 36} cy={65 + Math.floor(i / 3) * 36} r={12}
          fill={color} opacity={0.75} />
      ))}
      {/* SE formula */}
      <text x={width / 2} y={195} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={10}>
        שגיאת מדגם = σ / √n
      </text>
    </svg>
  )
}

// ─── 6. Regression — scatter + best-fit line ──────────────────────────────────
export function RegressionViz({ color, width = 380, height = 200 }: VizProps) {
  const pad = { l: 28, r: 16, t: 16, b: 28 }
  const W = width - pad.l - pad.r; const H = height - pad.t - pad.b
  // Deterministic points with real linear pattern + noise
  const pts = [
    [1, 2.2], [2, 3.8], [3, 3.5], [4, 5.1], [5, 4.8],
    [6, 6.4], [7, 7.2], [8, 6.8], [9, 8.5], [10, 9.1],
  ]
  const xVals = pts.map(p => p[0]); const yVals = pts.map(p => p[1])
  const xMin = 0.5; const xMax = 10.5; const yMin = 1; const yMax = 10
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  const sy = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H
  // Linear regression
  const n = pts.length
  const sumX = xVals.reduce((a, b) => a + b, 0)
  const sumY = yVals.reduce((a, b) => a + b, 0)
  const sumXY = pts.reduce((a, p) => a + p[0] * p[1], 0)
  const sumX2 = xVals.reduce((a, b) => a + b * b, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const pred = (x: number) => slope * x + intercept

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Residuals */}
        {pts.map(([x, y], i) => (
          <line key={i}
            x1={sx(x)} y1={sy(y)}
            x2={sx(x)} y2={sy(pred(x))}
            stroke="rgba(255,100,100,0.35)" strokeWidth={1} strokeDasharray="3 2"
          />
        ))}
        {/* Regression line */}
        <line
          x1={sx(xMin)} y1={sy(pred(xMin))}
          x2={sx(xMax)} y2={sy(pred(xMax))}
          stroke={color} strokeWidth={2.5}
        />
        {/* Points */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={sx(x)} cy={sy(y)} r={5}
            fill="rgba(255,255,255,0.85)" stroke={color} strokeWidth={1.5} />
        ))}
        <text x={sx(9)} y={sy(pred(9)) - 10} fill={color} fontSize={10} fontWeight={700}>
          y = {slope.toFixed(1)}x + {intercept.toFixed(1)}
        </text>
      </g>
    </svg>
  )
}

// ─── 7. Correlation — 3 mini scatter plots ────────────────────────────────────
export function CorrelationViz({ color, width = 380, height = 200 }: VizProps) {
  const cases: { r: string; pts: [number, number][]; label: string }[] = [
    {
      r: 'r = +0.9', label: 'חיובי', pts: [
        [10, 12], [20, 22], [30, 28], [40, 38], [50, 52],
        [60, 58], [70, 72], [80, 78], [90, 88],
      ],
    },
    {
      r: 'r ≈ 0', label: 'אין קשר', pts: [
        [15, 50], [30, 20], [45, 70], [60, 35], [75, 60],
        [25, 80], [55, 15], [70, 55], [40, 40],
      ],
    },
    {
      r: 'r = −0.9', label: 'שלילי', pts: [
        [10, 88], [20, 78], [30, 68], [40, 55], [50, 48],
        [60, 38], [70, 28], [80, 18], [90, 10],
      ],
    },
  ]
  const bw = width / 3
  const pad = 14

  return (
    <svg width={width} height={height}>
      {cases.map((c, ci) => {
        const ox = ci * bw
        const minX = 10; const maxX = 90; const minY = 10; const maxY = 90
        const sx = (x: number) => pad + ((x - minX) / (maxX - minX)) * (bw - pad * 2)
        const sy = (y: number) => (height - 40) - ((y - minY) / (maxY - minY)) * (height - 60)
        return (
          <g key={ci} transform={`translate(${ox},0)`}>
            <rect x={2} y={4} width={bw - 4} height={height - 44} rx={6}
              fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            {c.pts.map(([x, y], i) => (
              <circle key={i} cx={sx(x)} cy={sy(y)} r={4}
                fill={ci === 1 ? 'rgba(255,255,255,0.5)' : color} opacity={0.75} />
            ))}
            <text x={bw / 2} y={height - 24} textAnchor="middle"
              fill={color} fontSize={11} fontWeight={700}>{c.r}</text>
            <text x={bw / 2} y={height - 10} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize={9}>{c.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── 8. Binomial — PMF bar chart ──────────────────────────────────────────────
export function BinomialViz({ color, width = 380, height = 200 }: VizProps) {
  const [n, setN] = useState(10)
  const [p, setP] = useState(0.5)
  const pad = { l: 28, r: 16, t: 16, b: 50 }
  const W = width - pad.l - pad.r; const H = height - pad.t - pad.b

  function comb(n: number, k: number): number {
    if (k > n) return 0
    let result = 1
    for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1)
    return result
  }
  const probs = Array.from({ length: n + 1 }, (_, k) => ({
    k, prob: comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k),
  }))
  const maxP = Math.max(...probs.map(d => d.prob))
  const bw = W / probs.length
  const sx = (k: number) => k * bw
  const sy = (prob: number) => H - (prob / maxP) * H

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {probs.map(({ k, prob }) => (
          <g key={k}>
            <rect x={sx(k) + 2} y={sy(prob)} width={bw - 4} height={H - sy(prob)}
              fill={color} opacity={0.7} rx={2} />
            {n <= 12 && (
              <text x={sx(k) + bw / 2} y={H + 12} textAnchor="middle"
                fill="rgba(255,255,255,0.4)" fontSize={8}>{k}</text>
            )}
          </g>
        ))}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <foreignObject x={0} y={H + 18} width={W} height={30}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>n={n}</span>
            <input type="range" min={5} max={20} step={1} value={n}
              onChange={e => setN(+e.target.value)} style={{ flex: 1, accentColor: color, height: 3 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>p={p.toFixed(1)}</span>
            <input type="range" min={0.1} max={0.9} step={0.05} value={p}
              onChange={e => setP(+e.target.value)} style={{ flex: 1, accentColor: color, height: 3 }} />
          </div>
        </foreignObject>
      </g>
    </svg>
  )
}

// ─── 9. Hypothesis Testing — bell with critical region ────────────────────────
export function HypothesisViz({ color, width = 380, height = 200 }: VizProps) {
  const [zScore, setZScore] = useState(1.8)
  const alpha = 0.05
  const zCrit = 1.645 // one-tail 5%
  const pad = { l: 16, r: 16, t: 16, b: 50 }
  const W = width - pad.l - pad.r; const H = height - pad.t - pad.b
  const xMin = -3.5; const xMax = 3.5
  const N = 120
  const pts = Array.from({ length: N }, (_, i) => {
    const x = xMin + (i / (N - 1)) * (xMax - xMin)
    return { x, y: normalPDF(x, 0, 1) }
  })
  const yMax = normalPDF(0, 0, 1) * 1.08
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  const sy = (y: number) => H - (y / yMax) * H

  const rejPath = pts.filter(p => p.x >= zCrit)
    .map((p, i) => i === 0 ? `M${sx(p.x)},${sy(0)} L${sx(p.x)},${sy(p.y)}` : `L${sx(p.x)},${sy(p.y)}`)
    .join(' ') + ` L${sx(xMax)},${sy(0)} Z`

  const curvePath = 'M ' + pts.map(p => `${sx(p.x)},${sy(p.y)}`).join(' L ')
  const rejected = zScore >= zCrit

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {/* Bell */}
        <path d={curvePath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
        {/* Critical region (red) */}
        <path d={rejPath} fill="rgba(255,80,80,0.35)" />
        <line x1={sx(zCrit)} y1={0} x2={sx(zCrit)} y2={H}
          stroke="rgba(255,80,80,0.6)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={sx(zCrit) + 4} y={12} fill="rgba(255,80,80,0.9)" fontSize={9}>z={zCrit}</text>
        <text x={sx(3)} y={H - 10} textAnchor="end" fill="rgba(255,80,80,0.8)" fontSize={9}>
          α={alpha}
        </text>
        {/* Z-score marker */}
        <line x1={sx(zScore)} y1={0} x2={sx(zScore)} y2={H}
          stroke={rejected ? '#ff4444' : color} strokeWidth={2.5} />
        <circle cx={sx(zScore)} cy={sy(normalPDF(zScore, 0, 1))} r={5}
          fill={rejected ? '#ff4444' : color} />
        <text x={sx(zScore)} y={-4} textAnchor="middle"
          fill={rejected ? '#ff4444' : color} fontSize={10} fontWeight={700}>
          z={zScore.toFixed(1)}
        </text>
        {/* Status */}
        <text x={W / 2} y={H + 16} textAnchor="middle"
          fill={rejected ? '#ff4444' : 'rgba(255,255,255,0.5)'}
          fontSize={11} fontWeight={rejected ? 700 : 400}>
          {rejected ? '✗ דוחים H₀' : '✓ לא דוחים H₀'}
        </text>
        {/* Axis */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Slider */}
        <foreignObject x={0} y={H + 24} width={W} height={22}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>z = {zScore.toFixed(1)}</span>
            <input type="range" min={-3} max={3.5} step={0.1} value={zScore}
              onChange={e => setZScore(+e.target.value)}
              style={{ flex: 1, accentColor: color, height: 3 }} />
          </div>
        </foreignObject>
      </g>
    </svg>
  )
}

// ─── 10. Confidence Interval — stacked CI brackets ───────────────────────────
export function ConfidenceIntervalViz({ color, width = 380, height = 200 }: VizProps) {
  const trueMean = 50
  const intervals = [
    { center: 48.2, half: 3.1, miss: false },
    { center: 51.5, half: 2.8, miss: false },
    { center: 49.0, half: 3.3, miss: false },
    { center: 53.8, half: 3.0, miss: true  }, // misses true mean
    { center: 50.7, half: 2.9, miss: false },
    { center: 47.5, half: 3.2, miss: false },
    { center: 52.1, half: 2.7, miss: false },
  ]
  const xMin = 42; const xMax = 58
  const W = width - 32; const rowH = (height - 40) / intervals.length
  const sx = (x: number) => 16 + ((x - xMin) / (xMax - xMin)) * W
  const t = usePulse(2000)

  return (
    <svg width={width} height={height}>
      {/* True mean vertical line */}
      <line x1={sx(trueMean)} y1={8} x2={sx(trueMean)} y2={height - 30}
        stroke={color} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.6} />
      <text x={sx(trueMean)} y={6} textAnchor="middle" fill={color} fontSize={9}>μ אמיתי</text>
      {/* CI brackets */}
      {intervals.map((ci, i) => {
        const y = 14 + i * rowH + rowH / 2
        const lo = sx(ci.center - ci.half)
        const hi = sx(ci.center + ci.half)
        const mid = sx(ci.center)
        const clr = ci.miss ? '#ff5555' : 'rgba(255,255,255,0.6)'
        const highlighted = i === (t % intervals.length)
        return (
          <g key={i} opacity={highlighted ? 1 : 0.55}>
            <line x1={lo} y1={y} x2={hi} y2={y} stroke={clr} strokeWidth={highlighted ? 2.5 : 1.5} />
            <line x1={lo} y1={y - 5} x2={lo} y2={y + 5} stroke={clr} strokeWidth={1.5} />
            <line x1={hi} y1={y - 5} x2={hi} y2={y + 5} stroke={clr} strokeWidth={1.5} />
            <circle cx={mid} cy={y} r={3} fill={clr} />
          </g>
        )
      })}
      <text x={width / 2} y={height - 10} textAnchor="middle"
        fill="rgba(255,255,255,0.4)" fontSize={10}>
        6/7 = 86% מהרווחים מכילים את הממוצע האמיתי
      </text>
    </svg>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────
export type TopicId = 'power' | 'housing' | 'traffic' | 'hospital' | 'school'
  | 'bank' | 'market' | 'city-hall' | 'research' | 'news'

export function TopicViz({ id, color, width, height }: { id: string; color: string; width?: number; height?: number }) {
  const props = { color, width, height }
  switch (id as TopicId) {
    case 'power':      return <MeanViz {...props} />
    case 'housing':    return <MedianViz {...props} />
    case 'traffic':    return <StdDevViz {...props} />
    case 'hospital':   return <NormalViz {...props} />
    case 'school':     return <SamplingViz {...props} />
    case 'bank':       return <RegressionViz {...props} />
    case 'market':     return <CorrelationViz {...props} />
    case 'city-hall':  return <BinomialViz {...props} />
    case 'research':   return <HypothesisViz {...props} />
    case 'news':       return <ConfidenceIntervalViz {...props} />
    default:           return <NormalViz {...props} />
  }
}
