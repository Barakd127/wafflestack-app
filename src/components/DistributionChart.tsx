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
  | 'bar-mean' | 'bar-median'
  | 'scatter-pos' | 'scatter-neg' | 'scatter-regression'
  | 'sampling' | 'confidence-interval'

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


// ─── Bar-Median Chart ─────────────────────────────────────────────────────────

function BarMedianChart({ params, width, height, color }: { params: DistributionParams; width: number; height: number; color: string }) {
  const PAD = { top: 24, right: 16, bottom: 36, left: 12 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  // Sorted dataset — 10 values, median = avg of index 4 and 5 = (8+9)/2 = 8.5
  const barValues = [3, 5, 6, 7, 8, 9, 10, 12, 14, 16]
  const n = barValues.length
  const medianIdx1 = Math.floor((n - 1) / 2)   // index 4
  const medianIdx2 = Math.ceil((n - 1) / 2)    // index 5
  const median = (barValues[medianIdx1] + barValues[medianIdx2]) / 2
  const maxVal = Math.max(...barValues) * 1.12
  const barW = W / n
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Bars */}
        {barValues.map((v, i) => {
          const bh = (v / maxVal) * H
          const isMedian = i === medianIdx1 || i === medianIdx2
          return (
            <rect
              key={i}
              x={i * barW + barW * 0.1}
              y={H - bh}
              width={barW * 0.8}
              height={bh}
              fill={isMedian ? color : `${color}44`}
              rx={2}
            />
          )
        })}
        {/* Bracket over median bars */}
        {(() => {
          const x1 = medianIdx1 * barW + barW * 0.1
          const x2 = medianIdx2 * barW + barW * 0.9
          const bracketY = -10
          return (
            <>
              <line x1={x1} y1={bracketY + 6} x2={x1} y2={bracketY} stroke={color} strokeWidth={1.5} />
              <line x1={x1} y1={bracketY} x2={x2} y2={bracketY} stroke={color} strokeWidth={1.5} />
              <line x1={x2} y1={bracketY} x2={x2} y2={bracketY + 6} stroke={color} strokeWidth={1.5} />
              <text x={(x1 + x2) / 2} y={bracketY - 4} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">
                חציון={median}
              </text>
            </>
          )
        })()}
        {/* Sorted label */}
        <text x={W / 2} y={H + 28} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9}>
          ← מסודר לפי ערך
        </text>
        {/* Baseline */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      </g>
    </svg>
  )
}

// ─── Sampling Chart ───────────────────────────────────────────────────────────

function SamplingChart({ params, width, height, color }: { params: DistributionParams; width: number; height: number; color: string }) {
  const PAD = { top: 12, right: 12, bottom: 36, left: 12 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const TOTAL = 60
  // Sample fraction: sigma param (0.1–3) mapped to fraction 0.10–0.55
  const sigma = Math.max(0.1, Math.min(3, params.sigma ?? 1))
  const sampleFrac = 0.10 + (sigma / 3) * 0.45
  const sampleN = Math.round(TOTAL * sampleFrac)
  const rand = seededRand(99)
  // Generate dot positions scattered in a wide ellipse
  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const r = rand()
    const angle = rand() * Math.PI * 2
    const rx = W * 0.44 * Math.sqrt(r)
    const ry = H * 0.38 * Math.sqrt(r)
    return {
      x: W / 2 + rx * Math.cos(angle),
      y: H * 0.45 + ry * Math.sin(angle),
      inSample: i < sampleN,
    }
  })
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Population ellipse outline */}
        <ellipse cx={W / 2} cy={H * 0.45} rx={W * 0.47} ry={H * 0.42}
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="6 4" />
        {/* Dots */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.inSample ? 4 : 3}
            fill={d.inSample ? color : 'rgba(255,255,255,0.18)'}
            stroke={d.inSample ? color : 'none'} strokeWidth={1}
            fillOpacity={d.inSample ? 0.9 : 1}
          />
        ))}
        {/* Labels */}
        <text x={W / 2} y={H + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
          אוכלוסייה N={TOTAL}
        </text>
        <text x={W / 2} y={H + 26} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">
          מדגם n={sampleN} ({Math.round(sampleFrac * 100)}%)
        </text>
      </g>
    </svg>
  )
}

// ─── Confidence Interval Chart ────────────────────────────────────────────────

function ConfidenceIntervalChart({ params, width, height, color }: { params: DistributionParams; width: number; height: number; color: string }) {
  const PAD = { top: 16, right: 16, bottom: 48, left: 40 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const mu = params.mean ?? 0
  const sig = Math.max(params.sigma ?? 1, 0.1)
  const Z = 1.96  // 95% CI
  const ciLow = mu - Z * sig
  const ciHigh = mu + Z * sig
  const xMin = mu - 4 * sig
  const xMax = mu + 4 * sig
  const N = 200
  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  // Build curve path
  const pts: [number, number][] = []
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin)
    pts.push([x, normalPDF(x, mu, sig)])
  }
  const yMax = Math.max(...pts.map(p => p[1])) * 1.1
  const toSvgY = (y: number) => H - (y / yMax) * H
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(' ')
  // Shaded CI region
  const ciPts = pts.filter(([x]) => x >= ciLow && x <= ciHigh)
  const shadedD = ciPts.length > 1
    ? `M${toSvgX(ciLow).toFixed(1)},${H} ` +
      ciPts.map(([x, y]) => `L${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(' ') +
      ` L${toSvgX(ciHigh).toFixed(1)},${H} Z`
    : ''
  // CI bracket below x-axis
  const bY = H + 14
  const lX = toSvgX(ciLow)
  const rX = toSvgX(ciHigh)
  const mX = toSvgX(mu)
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Shaded CI */}
        {shadedD && <path d={shadedD} fill={color} fillOpacity={0.25} />}
        {/* Curve */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {/* Mean line */}
        <line x1={mX} y1={0} x2={mX} y2={H} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
        {/* Baseline */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {/* CI bracket */}
        <line x1={lX} y1={bY} x2={rX} y2={bY} stroke={color} strokeWidth={2} />
        <line x1={lX} y1={bY - 5} x2={lX} y2={bY + 5} stroke={color} strokeWidth={2} />
        <line x1={rX} y1={bY - 5} x2={rX} y2={bY + 5} stroke={color} strokeWidth={2} />
        {/* CI label */}
        <text x={mX} y={bY + 18} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">
          רווח סמך 95%
        </text>
        <text x={lX} y={bY + 30} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
          {ciLow.toFixed(2)}
        </text>
        <text x={rX} y={bY + 30} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
          {ciHigh.toFixed(2)}
        </text>
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
  if (distribution === 'bar-median') {
    return <BarMedianChart params={params} width={width} height={height} color={color} />
  }
  if (distribution === 'sampling') {
    return <SamplingChart params={params} width={width} height={height} color={color} />
  }
  if (distribution === 'confidence-interval') {
    return <ConfidenceIntervalChart params={params} width={width} height={height} color={color} />
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
