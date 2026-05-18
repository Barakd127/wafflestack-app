/**
 * CLTInteractive.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Interactive demo of the Central Limit Theorem (CLT).
 *
 * Pedagogical idea (the punchline of intro stats):
 *   No matter what shape the parent distribution has — uniform, skewed,
 *   bimodal — the distribution of *sample means* tends toward a normal curve
 *   as sample size n grows. Students pick a parent distribution, set n, click
 *   "Sample!" and watch the bottom histogram of sample means fill in. It is
 *   the closest thing to a magic trick in statistics, and seeing it happen
 *   with their own clicks builds far more durable understanding than a
 *   textbook proof.
 *
 * Inputs:
 *   - Buttons: uniform / right-skewed / bimodal parent distribution.
 *   - Slider: sample size n (1 → 50).
 *   - Slider: number of samples to draw per click (10 → 500).
 *   - Buttons: Draw, Reset.
 *
 * Tech: Pure SVG histograms, deterministic samplers based on Math.random().
 *       The two charts share the same x-axis [0,10] for easy visual compare.
 */
import { useMemo, useRef, useState } from 'react'

// ── Layout constants ────────────────────────────────────────────────────────
const W = 640
const H_PARENT = 140
const H_SAMPLE = 180
const PAD_X = 30
const X_MIN = 0
const X_MAX = 10
const BINS = 40

type ParentKind = 'uniform' | 'skewed' | 'bimodal'

// ── Parent distribution samplers ────────────────────────────────────────────
// Each returns a draw in [0,10]. We use inverse-CDF style hacks so the
// implementation is dependency-free.
function sampleParent(kind: ParentKind): number {
  if (kind === 'uniform') {
    return Math.random() * 10
  }
  if (kind === 'skewed') {
    // Squaring a uniform variate skews mass toward 0 (right-skewed tail).
    const u = Math.random()
    return Math.pow(u, 2) * 10
  }
  // bimodal: 50/50 mixture of two narrow uniforms around x≈2 and x≈8.
  if (Math.random() < 0.5) {
    return 2 + (Math.random() - 0.5) * 2
  }
  return 8 + (Math.random() - 0.5) * 2
}

// Theoretical PDF for the overlay (just for the parent chart visualization).
// Returns y-values in arbitrary units (we normalize before drawing).
function parentPdf(x: number, kind: ParentKind): number {
  if (x < X_MIN || x > X_MAX) return 0
  if (kind === 'uniform') return 1
  if (kind === 'skewed') {
    // d/dx of inverse of f^-1(u)=u^2 -> pdf ~ 1/(2*sqrt(x/10)) * (1/10)
    if (x <= 0) return 0
    return 1 / (2 * Math.sqrt(x / 10))
  }
  // bimodal: two unit boxes
  const inA = x > 1 && x < 3 ? 1 : 0
  const inB = x > 7 && x < 9 ? 1 : 0
  return (inA + inB) / 2
}

// ── Histogram helper ────────────────────────────────────────────────────────
function makeHistogram(values: number[]): number[] {
  const counts = new Array(BINS).fill(0)
  const width = (X_MAX - X_MIN) / BINS
  for (const v of values) {
    if (v < X_MIN || v >= X_MAX) continue
    const idx = Math.min(BINS - 1, Math.floor((v - X_MIN) / width))
    counts[idx]++
  }
  return counts
}

function xToPx(x: number, padded = true): number {
  const p = padded ? PAD_X : 0
  const inner = W - (padded ? 2 * PAD_X : 0)
  return p + ((x - X_MIN) / (X_MAX - X_MIN)) * inner
}

export default function CLTInteractive() {
  const [parent, setParent] = useState<ParentKind>('skewed')
  const [n, setN] = useState(10)
  const [numSamples, setNumSamples] = useState(100)
  // sampleMeans: collected means from all "Draw!" clicks (resets when parent changes)
  const [sampleMeans, setSampleMeans] = useState<number[]>([])
  // parentDraws: a single pool of draws from the parent — fixed at 2000 so the
  // top chart shows the *true* parent shape, not jittered noise.
  const parentRef = useRef<number[]>([])
  const [parentKey, setParentKey] = useState(0)

  // Re-generate parent pool whenever the user changes distribution.
  useMemo(() => {
    parentRef.current = Array.from({ length: 2000 }, () => sampleParent(parent))
    setParentKey(k => k + 1)
  }, [parent])

  function draw() {
    const newMeans: number[] = []
    for (let s = 0; s < numSamples; s++) {
      let sum = 0
      for (let i = 0; i < n; i++) sum += sampleParent(parent)
      newMeans.push(sum / n)
    }
    setSampleMeans(prev => [...prev, ...newMeans])
  }
  function reset() {
    setSampleMeans([])
  }
  function changeParent(k: ParentKind) {
    setParent(k)
    setSampleMeans([])
  }

  // ── Build histograms ──────────────────────────────────────────────────────
  const parentHist = useMemo(
    () => makeHistogram(parentRef.current),
    [parent, parentKey] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const sampleHist = useMemo(() => makeHistogram(sampleMeans), [sampleMeans])

  const parentMax = Math.max(1, ...parentHist)
  const sampleMax = Math.max(1, ...sampleHist)
  const binWidth = (W - 2 * PAD_X) / BINS

  // Sample mean stats (for display).
  const sampleStats = useMemo(() => {
    if (sampleMeans.length === 0) return { mean: 0, sd: 0 }
    const m = sampleMeans.reduce((s, v) => s + v, 0) / sampleMeans.length
    const variance =
      sampleMeans.reduce((s, v) => s + (v - m) ** 2, 0) /
      Math.max(1, sampleMeans.length - 1)
    return { mean: m, sd: Math.sqrt(variance) }
  }, [sampleMeans])

  // Theoretical normal overlay on sample-means chart — μ_x̄ = μ_parent and
  // σ_x̄ = σ_parent / √n. We approximate μ/σ from parent pool.
  const parentMean = useMemo(() => {
    const pool = parentRef.current
    return pool.reduce((s, v) => s + v, 0) / pool.length
  }, [parent, parentKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const parentSd = useMemo(() => {
    const pool = parentRef.current
    const m = parentMean
    return Math.sqrt(
      pool.reduce((s, v) => s + (v - m) ** 2, 0) / pool.length
    )
  }, [parent, parentKey, parentMean]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build SVG path for the theoretical normal curve scaled to histogram peak.
  function normalCurve(mu: number, sigma: number, totalCount: number): string {
    if (sigma <= 0 || totalCount === 0) return ''
    const points: string[] = []
    const STEP = 64
    // Expected count per bin = totalCount * pdf * binWidthData
    const binWidthData = (X_MAX - X_MIN) / BINS
    let peak = 0
    const ys: number[] = []
    for (let i = 0; i <= STEP; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / STEP
      const z = (x - mu) / sigma
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z)
      const expected = totalCount * pdf * binWidthData
      ys.push(expected)
      if (expected > peak) peak = expected
    }
    for (let i = 0; i <= STEP; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / STEP
      const px = xToPx(x)
      // Scale to sample histogram y-axis
      const py = H_SAMPLE - (ys[i] / sampleMax) * (H_SAMPLE - 20)
      points.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
    }
    return points.join(' ')
  }

  const normalPath =
    sampleMeans.length > 20
      ? normalCurve(parentMean, parentSd / Math.sqrt(n), sampleMeans.length)
      : ''

  return (
    <div
      dir="rtl"
      style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 20,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20 }}>
        משפט הגבול המרכזי — תצפית בזמן אמת
      </h3>
      <p style={{ margin: 0, marginBottom: 12, opacity: 0.7, fontSize: 14 }}>
        בחר התפלגות אב. ככל ש-n גדל, התפלגות ממוצעי המדגם מתקרבת לעקומה נורמלית — לא משנה איך נראית האם.
      </p>

      {/* Parent distribution selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(
          [
            { k: 'uniform', label: 'אחידה' },
            { k: 'skewed', label: 'אסימטרית' },
            { k: 'bimodal', label: 'דו-שיאית' },
          ] as { k: ParentKind; label: string }[]
        ).map(opt => (
          <button
            key={opt.k}
            onClick={() => changeParent(opt.k)}
            style={{
              background: parent === opt.k ? '#1ABC9C' : 'transparent',
              color: '#fff',
              border: '1px solid #1ABC9C',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Parent histogram */}
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
        התפלגות האב (מתוכה דוגמים)
      </div>
      <svg viewBox={`0 0 ${W} ${H_PARENT}`} width="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
        {parentHist.map((c, i) => {
          const h = (c / parentMax) * (H_PARENT - 10)
          return (
            <rect
              key={i}
              x={PAD_X + i * binWidth}
              y={H_PARENT - h}
              width={Math.max(1, binWidth - 1)}
              height={h}
              fill="#4A90D9"
              opacity={0.85}
            />
          )
        })}
        <line
          x1={PAD_X}
          y1={H_PARENT - 0.5}
          x2={W - PAD_X}
          y2={H_PARENT - 0.5}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1}
        />
        {/* PDF overlay just to hint at shape; visual aid only */}
        <path
          d={(() => {
            const STEP = 64
            const pts: string[] = []
            let peak = 0
            const ys: number[] = []
            for (let i = 0; i <= STEP; i++) {
              const x = X_MIN + ((X_MAX - X_MIN) * i) / STEP
              const y = parentPdf(x, parent)
              ys.push(y)
              if (y > peak) peak = y
            }
            for (let i = 0; i <= STEP; i++) {
              const x = X_MIN + ((X_MAX - X_MIN) * i) / STEP
              const px = xToPx(x)
              const py = H_PARENT - (peak > 0 ? (ys[i] / peak) * (H_PARENT - 10) : 0)
              pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`)
            }
            return pts.join(' ')
          })()}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
          fill="none"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Sample-means histogram */}
      <div style={{ fontSize: 13, opacity: 0.75, margin: '10px 0 4px' }}>
        התפלגות ממוצעי המדגם — {sampleMeans.length} ממוצעים, n={n}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H_SAMPLE}`}
        width="100%"
        style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}
      >
        {sampleHist.map((c, i) => {
          const h = (c / sampleMax) * (H_SAMPLE - 20)
          return (
            <rect
              key={i}
              x={PAD_X + i * binWidth}
              y={H_SAMPLE - h}
              width={Math.max(1, binWidth - 1)}
              height={h}
              fill="#D4A017"
              opacity={0.85}
            />
          )
        })}
        {/* Theoretical normal overlay (appears once enough samples drawn) */}
        {normalPath && (
          <path
            d={normalPath}
            stroke="#fff"
            strokeWidth={2}
            fill="none"
            strokeDasharray="6 4"
            opacity={0.85}
          />
        )}
        <line
          x1={PAD_X}
          y1={H_SAMPLE - 0.5}
          x2={W - PAD_X}
          y2={H_SAMPLE - 0.5}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1}
        />
        {/* x-axis ticks */}
        {[0, 2, 4, 6, 8, 10].map(t => (
          <text
            key={t}
            x={xToPx(t)}
            y={H_SAMPLE - 4}
            fill="rgba(255,255,255,0.6)"
            fontSize={11}
            textAnchor="middle"
          >
            {t}
          </text>
        ))}
      </svg>

      {/* Live stats */}
      {sampleMeans.length > 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            opacity: 0.9,
          }}
        >
          <span>
            ממוצע ממוצעי המדגם: <b style={{ color: '#D4A017' }}>{sampleStats.mean.toFixed(3)}</b>
          </span>
          <span>
            סטיית תקן בפועל: <b style={{ color: '#D4A017' }}>{sampleStats.sd.toFixed(3)}</b>
          </span>
          <span>
            תיאוריה σ/√n: <b style={{ color: '#27AE60' }}>{(parentSd / Math.sqrt(n)).toFixed(3)}</b>
          </span>
        </div>
      )}

      {/* Sliders */}
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, opacity: 0.85 }}>
            גודל מדגם n: <b style={{ color: '#1ABC9C' }}>{n}</b>
          </label>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={n}
            onChange={e => setN(parseInt(e.target.value))}
            style={{ width: '100%', direction: 'ltr' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, opacity: 0.85 }}>
            מספר מדגמים בלחיצה: <b style={{ color: '#1ABC9C' }}>{numSamples}</b>
          </label>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={numSamples}
            onChange={e => setNumSamples(parseInt(e.target.value))}
            style={{ width: '100%', direction: 'ltr' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button
          onClick={draw}
          style={{
            background: '#1ABC9C',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          דגום! ({numSamples}×)
        </button>
        <button
          onClick={reset}
          style={{
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          איפוס
        </button>
      </div>
    </div>
  )
}
