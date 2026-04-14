/**
 * DistributionChart — SVG-based interactive statistical distribution visualizer.
 * No external charting library required. Pure SVG + React.
 */

import { useMemo } from 'react'

// ─── Math helpers ─────────────────────────────────────────────────────────────

/** Normal (Gaussian) PDF */
function normalPDF(x: number, mean: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sigma) ** 2)
}

/** Approximate gamma function via Lanczos (for t / chi-sq / F) */
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

/** Student-t PDF */
function tPDF(x: number, df: number): number {
  const num = gammaLanczos((df + 1) / 2)
  const den = Math.sqrt(df * Math.PI) * gammaLanczos(df / 2)
  return (num / den) * Math.pow(1 + (x * x) / df, -(df + 1) / 2)
}

/** Chi-squared PDF */
function chiSqPDF(x: number, df: number): number {
  if (x <= 0) return 0
  const k = df / 2
  return (Math.pow(x, k - 1) * Math.exp(-x / 2)) / (Math.pow(2, k) * gammaLanczos(k))
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DistributionType = 'normal' | 't' | 'chi-squared' | 'binomial'

export interface DistributionParams {
  mean?: number     // normal
  sigma?: number    // normal
  df?: number       // t / chi-squared
  n?: number        // binomial
  p?: number        // binomial
}

interface Props {
  distribution: DistributionType
  params: DistributionParams
  width?: number
  height?: number
  color?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DistributionChart({
  distribution,
  params,
  width = 460,
  height = 200,
  color = '#4ECDC4',
}: Props) {
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const N_POINTS = 200

  const { pathD, xMin, xMax, yMax, shadedD, mean, sigma } = useMemo(() => {
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
      // fallback: normal
      xMin = mu - 4 * sig; xMax = mu + 4 * sig
      getFn = (x) => normalPDF(x, mu, sig)
    }

    // Sample points
    const points: [number, number][] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const x = xMin + (i / N_POINTS) * (xMax - xMin)
      points.push([x, getFn(x)])
    }
    const yMax = Math.max(...points.map(p => p[1])) * 1.1

    const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * W
    const toSvgY = (y: number) => H - (y / yMax) * H

    // Main curve path
    const pathD = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`)
      .join(' ')

    // Shaded area under 1σ for normal, first 50% for others
    let shade1, shade2
    if (distribution === 'normal') {
      shade1 = mu - sig; shade2 = mu + sig
    } else if (distribution === 't') {
      shade1 = -1; shade2 = 1
    } else {
      shade1 = xMin; shade2 = (xMin + xMax) / 2
    }

    const shadePoints = points.filter(([x]) => x >= shade1 && x <= shade2)
    const shadedD = shadePoints.length > 1
      ? `M${toSvgX(shade1).toFixed(1)},${H} ` +
        shadePoints.map(([x, y]) => `L${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`).join(' ') +
        ` L${toSvgX(shade2).toFixed(1)},${H} Z`
      : ''

    return { pathD, xMin, xMax, yMax, shadedD, mean: mu, sigma: sig }
  }, [distribution, params, W, H])

  // X-axis labels
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
    <svg
      width={width}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = H - f * H
          return (
            <line
              key={f}
              x1={0} y1={y} x2={W} y2={y}
              stroke="rgba(255,255,255,0.07)" strokeWidth={1}
            />
          )
        })}

        {/* Shaded area */}
        {shadedD && (
          <path d={shadedD} fill={color} fillOpacity={0.2} />
        )}

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Mean line for normal */}
        {distribution === 'normal' && (
          <>
            <line
              x1={((mean - xMin) / (xMax - xMin)) * W}
              y1={0}
              x2={((mean - xMin) / (xMax - xMin)) * W}
              y2={H}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.7}
            />
            <text
              x={((mean - xMin) / (xMax - xMin)) * W + 4}
              y={12}
              fill={color}
              fontSize={10}
              opacity={0.8}
            >
              μ={mean.toFixed(1)}
            </text>
          </>
        )}

        {/* Baseline */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

        {/* X-axis labels */}
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y={H + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
            {label}
          </text>
        ))}
      </g>
    </svg>
  )
}
