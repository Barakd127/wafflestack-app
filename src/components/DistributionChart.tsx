/**
 * DistributionChart — SVG-based interactive statistical distribution visualizer.
 * No external charting library required. Pure SVG + React.
 */

import { useMemo } from 'react'

// ─── Math helpers ─────────────────────────────────────────────────────────────

function normalPDF(x: number, mean: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sigma) ** 2)
}

function gammaLanczos(z: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaLanczos(1 - z))
  z -= 1
  let x = c[0]
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i)
  const t = z + g + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

function tPDF(x: number, df: number): number {
  const num = gammaLanczos((df + 1) / 2)
  const den = Math.sqrt(df * Math.PI) * gammaLanczos(df / 2)
  return (num / den) * Math.pow(1 + (x * x) / df, -(df + 1) / 2)
}

function chiSqPDF(x: number, df: number): number {
  if (x <= 0) return 0
  const k = df / 2
  return (Math.pow(x, k - 1) * Math.exp(-x / 2)) / (Math.pow(2, k) * gammaLanczos(k))
}

// ─── Seeded random (deterministic scatter) ────────────────────────────────────

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 4294967296
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DistributionType =
  | 'normal' | 't' | 'chi-squared' | 'binomial'
  | 'bar-mean' | 'scatter-pos' | 'scatter-neg' | 'scatter-regression'

export interface DistributionParams {
  mean?: number
  sigma?: number
  df?: number
  n?: number
  p?: number
  correlation?: number  // -1 to 1, used by scatter types
}

interface Props {
  distribution: DistributionType
  params: DistributionParams
  width?: number
  height?: number
  color?: string
}

// ─── Bar-Mean Chart ──────────────────────────────────────────────────────────

function BarMeanChart({ params, width, height, color }: { params: DistributionParams; width: number; height: number; color: string }) {
  const PAD = { top: 16, right: 16, bottom: 32, left: 12 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  // Deterministic bar heights
  const barValues = [4, 7, 5, 9, 6, 8, 3, 7, 10, 5]
  const mean = barValues.reduce((a, b) => a + b, 0) / barValues.length
  const maxVal = Math.max(...barValues) * 1.1
  const barW = W / barValues.length
  const meanX = 0 // will draw line at mean y
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Bars */}
        {barValues.map((v, i) => {
          const bh = (v / maxVal) * H
          const isMean = Math.round(v) === Math.round(mean)
          return (
            <rect
              key={i}
              x={i * barW + barW * 0.1}
              y={H - bh}
              width={barW * 0.8}
              height={bh}
              fill={isMean ? color : `${color}55`}
              rx={2}
            />
          )
        })}
        {/* Mean line */}
        <line
          x1={0} y1={H - (mean / maxVal) * H}
          x2={W} y2={H - (mean / maxVal) * H}
          stroke={color} strokeWidth={2} strokeDasharray="5 3"
        />
        <text
          x={W - 4} y={H - (mean / maxVal) * H - 5}
          fill={color} fontSize={10} textAnchor="end"
        >
          mean={mean.toFixed(1)}
        </text>
        {/* Baseline */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      </g>
    </svg>
  )
}

// ─── Scatter Chart ────────────────────────────────────────────────────────────

function ScatterChart({ params, width, height, color, showLine }: {
  params: DistributionParams; width: number; height: number; color: string; showLine?: boolean
}) {
  const PAD = { top: 16, right: 16, bottom: 32, left: 32 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const r = params.correlation ?? 0.8
  const N = 22
  const rand = seededRand(42)
  // Generate correlated (x, y) pairs in [0,1]
  const points = Array.from({ length: N }, () => {
    const x = rand()
    const noise = rand() * 0.3
    const y = r >= 0
      ? x * Math.abs(r) + noise * (1 - Math.abs(r)) * 2
      : (1 - x) * Math.abs(r) + noise * (1 - Math.abs(r)) * 2
    return { x, y: Math.max(0, Math.min(1, y)) }
  })
  // Regression line endpoints
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const xMean = xs.reduce((a, b) => a + b, 0) / N
  const yMean = ys.reduce((a, b) => a + b, 0) / N
  const slope = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) /
                xs.reduce((s, x) => s + (x - xMean) ** 2, 0)
  const intercept = yMean - slope * xMean
  const toX = (v: number) => v * W
  const toY = (v: number) => H - v * H
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={f * H} x2={W} y2={f * H} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        {/* Regression line */}
        {showLine && (
          <line
            x1={toX(0)} y1={toY(intercept)}
            x2={toX(1)} y2={toY(intercept + slope)}
            stroke={color} strokeWidth={2} opacity={0.9}
          />
        )}
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={3.5} fill={color} fillOpacity={0.7} />
        ))}
        {/* Axes */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* Labels */}
        <text x={W / 2} y={H + 20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>x</text>
        <text x={-16} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9} transform={`rotate(-90, -16, ${H / 2})`}>y</text>
        {/* Correlation label */}
        <text x={W - 2} y={14} textAnchor="end" fill={color} fontSize={10}>r={r.toFixed(1)}</text>
      </g>
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DistributionChart({
  distribution,
  params,
  width = 460,
  height = 200,
  color = '#4ECDC4',
}: Props) {
  // Delegate to specialized chart types
  if (distribution === 'bar-mean') {
    return <BarMeanChart params={params} width={width} height={height} color={color} />
  }
  if (distribution === 'scatter-pos') {
    return <ScatterChart params={{ ...params, correlation: params.correlation ?? 0.82 }} width={width} height={height} color={color} />
  }
  if (distribution === 'scatter-neg') {
    return <ScatterChart params={{ ...params, correlation: -(params.correlation ?? 0.78) }} width={width} height={height} color={color} />
  }
  if (distribution === 'scatter-regression') {
    return <ScatterChart params={{ ...params, correlation: params.correlation ?? 0.8 }} width={width} height={height} color={color} showLine />
  }

  // ─── Curve-based charts ────────────────────────────────────────────────────
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const N_POINTS = 200

  const { pathD, xMin, xMax, shadedD, mean } = useMemo(() => {
    const mu = params.mean ?? 0
    const sig = Math.max(params.sigma ?? 1, 0.1)
    const df = Math.max(params.df ?? 3, 1)

    let xMin: number, xMax: number
    let getFn: (x: number) => number

    if (distribution === 'normal') {
      xMin = mu - 4 * sig; xMax = mu + 4 * sig
      getFn = (x) => normalPDF(x, mu, sig)
    } else if (distribution === 't') {
      xMin = -5; xMax = 5
      getFn = (x) => tPDF(x, df)
    } else if (distribution === 'chi-squared') {
      xMin = 0; xMax = Math.max(df * 3, 10)
      getFn = (x) => chiSqPDF(x, df)
    } else {
      xMin = mu - 4 * sig; xMax = mu + 4 * sig
      getFn = (x) => normalPDF(x, mu, sig)
    }

    const points: [number, number][] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const x = xMin + (i / N_POINTS) * (xMax - xMin)
      points.push([x, getFn(x)])
    }
    const yMax = Math.max(...points.map(p => p[1])) * 1.1

    const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * W
    const toSvgY = (y: number) => H - (y / yMax) * H

    const pathD = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
      .join(' ')

    // Shaded region
    let shade1: number, shade2: number
    if (distribution === 'normal') {
      shade1 = mu - sig; shade2 = mu + sig
    } else if (distribution === 't') {
      // Shade critical tails (α=0.05 two-tailed, roughly ±1.96)
      shade1 = -5; shade2 = -1.96
    } else {
      shade1 = xMin; shade2 = (xMin + xMax) / 2
    }

    const shadePoints = points.filter(([x]) => x >= shade1 && x <= shade2)
    let shadedD = shadePoints.length > 1
      ? `M${toSvgX(shade1).toFixed(1)},${H} ` +
        shadePoints.map(([x, y]) => `L${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(' ') +
        ` L${toSvgX(shade2).toFixed(1)},${H} Z`
      : ''

    // For t: also shade right tail
    if (distribution === 't') {
      const rightPoints = points.filter(([x]) => x >= 1.96)
      if (rightPoints.length > 1) {
        shadedD += ` M${toSvgX(1.96).toFixed(1)},${H} ` +
          rightPoints.map(([x, y]) => `L${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(' ') +
          ` L${toSvgX(xMax).toFixed(1)},${H} Z`
      }
    }

    return { pathD, xMin, xMax, yMax, shadedD, mean: mu, sigma: sig }
  }, [distribution, params, W, H])

  const xLabels = useMemo(() => {
    const labels = []
    const steps = 5
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const svgX = (i / steps) * W
      labels.push({ x: svgX, label: x.toFixed(1) })
    }
    return labels
  }, [xMin, xMax, W])

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={0} y1={H - f * H} x2={W} y2={H - f * H} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        {shadedD && <path d={shadedD} fill={color} fillOpacity={0.2} />}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {distribution === 'normal' && (
          <>
            <line
              x1={((mean - xMin) / (xMax - xMin)) * W} y1={0}
              x2={((mean - xMin) / (xMax - xMin)) * W} y2={H}
              stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
            />
            <text x={((mean - xMin) / (xMax - xMin)) * W + 4} y={12} fill={color} fontSize={10} opacity={0.8}>
              μ={(mean ?? 0).toFixed(1)}
            </text>
          </>
        )}
        {distribution === 't' && (
          <>
            <text x={W / 2} y={14} textAnchor="middle" fill={color} fontSize={10} opacity={0.8}>
              critical regions (α=0.05)
            </text>
          </>
        )}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y={H + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>{label}</text>
        ))}
      </g>
    </svg>
  )
}
