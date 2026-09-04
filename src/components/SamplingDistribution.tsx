/**
 * SamplingDistribution.tsx — interactive Rice-University-style sampling
 * distribution simulator, rebuilt in Hebrew with WaffleStack styling.
 *
 * Three stacked panels (top → bottom):
 *  1. Population — a 33-bin histogram. Paint with the mouse, or pick a
 *     preset (normal / uniform / skewed / bimodal). This is the source
 *     distribution every sample is drawn from.
 *  2. Last sample — the N values drawn most recently, shown as stacked
 *     dots on the same x-axis as the population.
 *  3. Sampling distribution — accumulating histogram of a chosen statistic
 *     (mean / median / σ) over every sample ever drawn.
 *
 * Buttons "1 / 5 / 1000 / 10000" run that many independent samples and
 * append their statistics to the sampling distribution. The "Animate"
 * button draws a single sample one-dot-at-a-time so first-time learners
 * can see the mechanics.
 *
 * Pedagogy: this is the canonical visual proof of the Central Limit
 * Theorem — even a wild parent distribution produces a near-Normal
 * sampling distribution once n gets large enough, centered on the true μ
 * with SE = σ/√n.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ── Theme tokens ──────────────────────────────────────────────────────────────
// WaffleStack palette: deep blue (brand), gold (brand accent), mint-teal
// (auxiliary). No orange/emerald — those clashed with the app chrome per
// user feedback 2026-05-24.
const C_POP = '#1F3E6C'           // population panel — deep brand blue
const C_POP_SOFT = '#7CB7F8'      // softer blue for fills
const C_SAMPLE = '#F2AF13'        // sample panel — brand gold
const C_SAMPLE_DEEP = '#9C7A1A'   // darker gold for text on light bg
const C_DIST = '#14B8A6'          // sampling dist — mint-teal
const C_DIST_DEEP = '#0F766E'     // darker mint for text on light bg
const C_TEXT_DARK = '#0B1B3E'
const C_TEXT_MED = '#4A5568'
const C_TEXT_LIGHT = '#94A3B8'
const C_BG_GLASS = 'rgba(255,255,255,0.78)'
const C_BORDER = 'rgba(127,155,217,0.30)'
const C_SHADOW = '0 6px 22px rgba(31,62,108,0.10)'

// ── Math helpers ──────────────────────────────────────────────────────────────
/** Bins span 0..32 (33 buckets). Values x are integers in [0, 32]. */
const N_BINS = 33
const X_MIN = 0
const X_MAX = 32
type Bins = number[] // length N_BINS, each entry = bin density (any positive scale)

function normalize(b: Bins): Bins {
  const s = b.reduce((a, c) => a + c, 0)
  return s > 0 ? b.map(v => v / s) : b.map(() => 1 / N_BINS)
}

/** Population stats from the bins (density-weighted). */
function popStats(b: Bins): { mu: number; sigma: number } {
  const norm = normalize(b)
  let mu = 0
  for (let i = 0; i < N_BINS; i++) mu += i * norm[i]
  let v = 0
  for (let i = 0; i < N_BINS; i++) v += (i - mu) ** 2 * norm[i]
  return { mu, sigma: Math.sqrt(v) }
}

/** Sample N values from the binned distribution via inverse-CDF lookup. */
function sample(b: Bins, n: number): number[] {
  const norm = normalize(b)
  const cdf: number[] = new Array(N_BINS)
  let acc = 0
  for (let i = 0; i < N_BINS; i++) { acc += norm[i]; cdf[i] = acc }
  const out = new Array(n)
  for (let i = 0; i < n; i++) {
    const u = Math.random()
    let lo = 0, hi = N_BINS - 1
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m }
    out[i] = lo
  }
  return out
}

function mean(xs: number[]): number { return xs.reduce((s, x) => s + x, 0) / xs.length }
function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
function stddev(xs: number[]): number {
  const m = mean(xs)
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length)
}

type Stat = 'mean' | 'median' | 'sd'
const STAT_LABEL: Record<Stat, string> = { mean: 'ממוצע x̄', median: 'חציון', sd: 'סטיית תקן s' }
function computeStat(xs: number[], stat: Stat): number {
  if (stat === 'mean') return mean(xs)
  if (stat === 'median') return median(xs)
  return stddev(xs)
}

// ── Presets ───────────────────────────────────────────────────────────────────
function presetBins(kind: 'normal' | 'uniform' | 'skew-right' | 'skew-left' | 'bimodal'): Bins {
  const out = new Array(N_BINS).fill(0) as Bins
  for (let i = 0; i < N_BINS; i++) {
    if (kind === 'normal') {
      const z = (i - 16) / 5
      out[i] = Math.exp(-0.5 * z * z)
    } else if (kind === 'uniform') {
      out[i] = i >= 4 && i <= 28 ? 1 : 0
    } else if (kind === 'skew-right') {
      // long right tail
      const x = (i - 4) / 6
      out[i] = x > 0 ? x * Math.exp(-x) : 0
    } else if (kind === 'skew-left') {
      const x = (28 - i) / 6
      out[i] = x > 0 ? x * Math.exp(-x) : 0
    } else {
      const z1 = (i - 9) / 3, z2 = (i - 23) / 3
      out[i] = Math.exp(-0.5 * z1 * z1) + 0.85 * Math.exp(-0.5 * z2 * z2)
    }
  }
  return out
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SamplingDistribution() {
  const [pop, setPop] = useState<Bins>(() => presetBins('normal'))
  const [n, setN] = useState(16)
  const [stat, setStat] = useState<Stat>('mean')
  const [lastSample, setLastSample] = useState<number[]>([])
  const [dist, setDist] = useState<number[]>([])
  const [animating, setAnimating] = useState(false)
  const [paintMode, setPaintMode] = useState(false)
  const paintingRef = useRef(false)

  const { mu, sigma } = useMemo(() => popStats(pop), [pop])

  const runK = useCallback((k: number) => {
    const fresh: number[] = []
    let lastDraw: number[] = []
    for (let i = 0; i < k; i++) {
      const draw = sample(pop, n)
      lastDraw = draw
      fresh.push(computeStat(draw, stat))
    }
    setDist(prev => [...prev, ...fresh])
    setLastSample(lastDraw)
  }, [pop, n, stat])

  const animateOne = useCallback(() => {
    setAnimating(true)
    const draw = sample(pop, n)
    const partial: number[] = []
    let i = 0
    const tick = () => {
      partial.push(draw[i])
      setLastSample([...partial])
      i++
      if (i < draw.length) setTimeout(tick, Math.max(20, 400 / draw.length))
      else {
        setDist(prev => [...prev, computeStat(draw, stat)])
        setAnimating(false)
      }
    }
    tick()
  }, [pop, n, stat])

  const reset = () => { setDist([]); setLastSample([]) }
  const clearAll = () => { setDist([]); setLastSample([]); setPop(presetBins('normal')) }

  // Recompute when population OR n changes — invalidate the dist because
  // statistics are no longer comparable.
  useEffect(() => { setDist([]); setLastSample([]) }, [pop, n, stat])

  // ── Painting ────────────────────────────────────────────────────────────────
  const paintAt = (clientX: number, clientY: number, target: SVGSVGElement) => {
    const r = target.getBoundingClientRect()
    const fx = (clientX - r.left) / r.width
    const fy = 1 - (clientY - r.top) / r.height
    const bin = Math.max(0, Math.min(N_BINS - 1, Math.floor(fx * N_BINS)))
    const height = Math.max(0, Math.min(1, fy))
    setPop(prev => {
      const nx = [...prev]
      nx[bin] = Math.max(0.001, height * 100)
      return nx
    })
  }
  const onPaintDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!paintMode) return
    paintingRef.current = true
    paintAt(e.clientX, e.clientY, e.currentTarget)
  }
  const onPaintMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!paintMode || !paintingRef.current) return
    paintAt(e.clientX, e.clientY, e.currentTarget)
  }
  const onPaintUp = () => { paintingRef.current = false }

  // ── Render ──────────────────────────────────────────────────────────────────
  const sampleStat = lastSample.length ? computeStat(lastSample, stat) : null
  const theorySE = sigma / Math.sqrt(n)

  return (
    <div dir="rtl" style={{
      fontFamily: "'Rubik', 'Assistant', sans-serif",
      color: C_TEXT_DARK,
      padding: '20px 24px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      {/* Header + pedagogy */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
          🎯 התפלגות הדגימה — דמיית CLT
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: C_TEXT_MED, lineHeight: 1.7 }}>
          הסימולציה מציגה את עקרון <strong>משפט הגבול המרכזי</strong>: ללא קשר לצורת
          ההתפלגות באוכלוסייה, התפלגות ממוצעי המדגם מתקרבת לנורמלית ככל ש-n גדל,
          סביב הממוצע האמיתי <strong>μ</strong> עם שגיאת תקן <strong>SE = σ/√n</strong>.
        </p>
        <div style={{
          marginTop: 10, fontSize: 13, color: C_TEXT_MED,
          background: 'rgba(242,175,19,0.10)', borderRight: `3px solid ${C_SAMPLE}`,
          padding: '8px 12px', borderRadius: 8, lineHeight: 1.6,
        }}>
          💡 <strong>טיפ:</strong> צבעו אוכלוסייה משונה (לחצו "צבע אוכלוסייה" וגררו במשטח העליון),
          ואז דגמו 10,000 מדגמים. שימו לב איך התפלגות הדגימה נשארת פעמון, גם
          כשהאוכלוסייה רחוקה מנורמלית.
        </div>
      </div>

      {/* Controls strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
        background: C_BG_GLASS, border: `1px solid ${C_BORDER}`,
        borderRadius: 14, padding: '12px 16px', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: C_TEXT_MED }}>אוכלוסייה:</span>
          {([
            ['normal', '🔔 נורמלית'],
            ['uniform', '▭ אחידה'],
            ['skew-right', '↗ נטויה'],
            ['skew-left', '↖ נטויה הפוך'],
            ['bimodal', '🐫 דו-שיא'],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPop(presetBins(k))} style={presetBtn}>{l}</button>
          ))}
          <button
            onClick={() => setPaintMode(v => !v)}
            style={{ ...presetBtn, background: paintMode ? C_POP : 'rgba(31,62,108,0.10)', color: paintMode ? '#fff' : C_POP }}
          >🖌 {paintMode ? 'יציאה מציור' : 'צבע אוכלוסייה'}</button>
        </div>
        <div style={{ flex: 1 }} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
          n = <strong>{n}</strong>
          <input type="range" min={2} max={100} value={n} onChange={e => setN(+e.target.value)}
            style={{ width: 130, accentColor: C_POP }} />
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
          סטטיסטי:
          <select value={stat} onChange={e => setStat(e.target.value as Stat)}
            style={{
              padding: '4px 8px', borderRadius: 8, border: `1px solid ${C_BORDER}`,
              background: '#fff', fontFamily: 'inherit', fontSize: 13,
            }}>
            <option value="mean">ממוצע x̄</option>
            <option value="median">חציון</option>
            <option value="sd">סטיית תקן s</option>
          </select>
        </label>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center',
      }}>
        <button onClick={animateOne} disabled={animating}
          style={{ ...primaryBtn, background: `linear-gradient(135deg,#F5C842,${C_SAMPLE})`, color: '#0B1B3E', boxShadow: '0 4px 12px rgba(242,175,19,0.40)' }}>
          ▶ הנפש מדגם
        </button>
        {[1, 5, 1000, 10000].map(k => (
          <button key={k} onClick={() => runK(k)} disabled={animating}
            style={{ ...primaryBtn, background: `linear-gradient(135deg,#3b6db8,${C_POP})` }}>
            + {k.toLocaleString('he-IL')} מדגמים
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={reset} style={ghostBtn}>♻ אפס דגימות</button>
        <button onClick={clearAll} style={ghostBtn}>🗑 אפס הכל</button>
      </div>

      {/* Three panels */}
      <Panel
        title="אוכלוסיית מקור"
        sub={`μ = ${mu.toFixed(2)}  ·  σ = ${sigma.toFixed(2)}`}
        accent={C_POP}
      >
        <PopulationHist
          bins={pop}
          highlight={lastSample}
          paintMode={paintMode}
          onDown={onPaintDown}
          onMove={onPaintMove}
          onUp={onPaintUp}
        />
      </Panel>

      <Panel
        title={`המדגם האחרון (n = ${n})`}
        sub={
          sampleStat !== null
            // Sample mean + sample standard deviation alongside, per user
            // 2026-05-24 — single line so the eye reads spread next to centre.
            ? (() => {
              const sampleSD = stddev(lastSample)
              if (stat === 'mean') return `x̄ = ${sampleStat.toFixed(2)} · s = ${sampleSD.toFixed(2)}`
              if (stat === 'median') return `med = ${sampleStat.toFixed(2)} · s = ${sampleSD.toFixed(2)}`
              return `s = ${sampleStat.toFixed(2)} · x̄ = ${mean(lastSample).toFixed(2)}`
            })()
            : 'טרם נדגם — לחצו על "הנפש מדגם" או "+1 מדגמים"'
        }
        accent={C_SAMPLE_DEEP}
      >
        <SampleStrip values={lastSample} statValue={sampleStat} />
      </Panel>

      <Panel
        title={`התפלגות הדגימה של ${STAT_LABEL[stat]}`}
        // Single canonical SE formula — replaces the old four-stat clutter
        // (count + emp-mean + emp-SE + theory-SE). Mean of sampling dist is
        // visualised on the chart itself; SE_x̄ = σ/√n is the headline.
        sub={
          dist.length
            ? `σ_x̄ = σ/√n = ${theorySE.toFixed(2)}  ·  ${dist.length.toLocaleString('he-IL')} מדגמים`
            : 'התפלגות הדגימה ריקה — דגמו כדי לראות את עקומת CLT מתפתחת'
        }
        accent={C_DIST_DEEP}
      >
        <SamplingDistHist values={dist} mu={mu} stat={stat} theorySE={theorySE} />
      </Panel>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Panel({ title, sub, accent, children }: {
  title: string; sub: string; accent: string; children: React.ReactNode
}) {
  return (
    <div style={{
      background: C_BG_GLASS, border: `1px solid ${C_BORDER}`,
      borderRadius: 14, padding: '12px 14px', marginBottom: 12,
      boxShadow: C_SHADOW,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 8, gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ fontWeight: 700, color: accent, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: C_TEXT_MED, direction: 'ltr', textAlign: 'left' }}>{sub}</div>
      </div>
      {children}
    </div>
  )
}

/** Population histogram — bins as bars, paintable when paintMode on. */
function PopulationHist({ bins, highlight, paintMode, onDown, onMove, onUp }: {
  bins: Bins
  highlight: number[]
  paintMode: boolean
  onDown: (e: React.MouseEvent<SVGSVGElement>) => void
  onMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onUp: () => void
}) {
  const W = 720, H = 160
  const maxV = Math.max(...bins, 0.0001)
  const barW = (W - 40) / N_BINS - 2
  // Highlighted bins (from last sample) get a darker tone overlay.
  const highlightSet = new Set(highlight)
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{
        background: 'linear-gradient(180deg, rgba(124,183,248,0.10), rgba(124,183,248,0.03))',
        borderRadius: 8,
        cursor: paintMode ? 'crosshair' : 'default',
        userSelect: 'none',
      }}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
    >
      <line x1={20} y1={H - 22} x2={W - 20} y2={H - 22} stroke="#cbd5e1" strokeWidth={1} />
      {bins.map((v, i) => {
        const x = 20 + i * ((W - 40) / N_BINS) + 1
        const h = (v / maxV) * (H - 38)
        const isHi = highlightSet.has(i)
        return (
          <g key={i}>
            <rect
              x={x} y={H - 22 - h} width={barW} height={h}
              fill={isHi ? C_POP : C_POP_SOFT} opacity={isHi ? 1 : 0.85}
              rx={2}
            />
            {(i % 4 === 0) && (
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={9} fill={C_TEXT_LIGHT}>
                {X_MIN + i}
              </text>
            )}
          </g>
        )
      })}
      {paintMode && (
        <text x={W / 2} y={16} textAnchor="middle" fontSize={11} fill={C_POP} fontWeight={700}>
          🖌 גרור עם העכבר כדי לעצב את ההתפלגות
        </text>
      )}
    </svg>
  )
}

/** Strip of stacked dots showing the most recent sample. */
function SampleStrip({ values, statValue }: { values: number[]; statValue: number | null }) {
  const W = 720, H = 120
  // Count duplicates per bin so we can stack them vertically.
  const counts: Record<number, number> = {}
  const placed: { x: number; n: number }[] = []
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1
    placed.push({ x: v, n: counts[v] })
  }
  const maxStack = Math.max(1, ...Object.values(counts))
  const binW = (W - 40) / N_BINS
  const r = Math.max(3, Math.min(7, binW / 2 - 1))
  const yForN = (k: number) => H - 22 - k * (r * 2 + 1)
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{
      background: 'linear-gradient(180deg, rgba(242,175,19,0.07), rgba(242,175,19,0.02))',
      borderRadius: 8,
    }}>
      <line x1={20} y1={H - 22} x2={W - 20} y2={H - 22} stroke="#cbd5e1" strokeWidth={1} />
      {[0, 8, 16, 24, 32].map(t => {
        const x = 20 + (t / N_BINS) * (W - 40) + binW / 2
        return <text key={t} x={x} y={H - 8} textAnchor="middle" fontSize={9} fill={C_TEXT_LIGHT}>{t}</text>
      })}
      {placed.map((p, i) => {
        const cx = 20 + p.x * binW + binW / 2
        return <circle key={i} cx={cx} cy={yForN(p.n)} r={r}
          fill={C_SAMPLE} stroke="#fff" strokeWidth={1.2} />
      })}
      {statValue !== null && (
        <>
          <line
            x1={20 + statValue * binW + binW / 2} y1={4}
            x2={20 + statValue * binW + binW / 2} y2={H - 22}
            stroke={C_SAMPLE_DEEP} strokeWidth={2} strokeDasharray="4,3"
          />
          <text x={20 + statValue * binW + binW / 2 - 6} y={16}
            textAnchor="end" direction="ltr" fontSize={11} fill={C_SAMPLE_DEEP} fontWeight={700}
            style={{ fontFamily: "'Inter','Rubik',sans-serif" }}>
            x̄ = {statValue.toFixed(2)}
          </text>
        </>
      )}
      {!values.length && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill={C_TEXT_LIGHT}>
          טרם נדגם
        </text>
      )}
      {maxStack > (H - 30) / (r * 2 + 1) && (
        <text x={W - 24} y={16} textAnchor="end" fontSize={10} fill={C_TEXT_LIGHT}>
          (חלק מהנקודות חופפות)
        </text>
      )}
    </svg>
  )
}

/** Sampling distribution histogram — 0.5-wide bins from 0..32. */
function SamplingDistHist({ values, mu, stat, theorySE }: {
  values: number[]; mu: number; stat: Stat; theorySE: number
}) {
  const W = 720, H = 200
  const BINW = 0.5
  const N = Math.ceil((X_MAX - X_MIN) / BINW) // = 64
  const counts = new Array(N).fill(0)
  for (const v of values) {
    const b = Math.max(0, Math.min(N - 1, Math.floor((v - X_MIN) / BINW)))
    counts[b]++
  }
  const maxC = Math.max(1, ...counts)
  const barW = (W - 40) / N - 0.5
  const empMean = values.length ? mean(values) : null
  const xToPx = (x: number) => 20 + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 40)
  // Overlay theoretical CLT curve for the mean stat
  let curvePath = ''
  if (stat === 'mean' && values.length > 10 && theorySE > 0) {
    const pts: string[] = []
    for (let i = 0; i <= 200; i++) {
      const x = X_MIN + (i / 200) * (X_MAX - X_MIN)
      const z = (x - mu) / theorySE
      const y = Math.exp(-0.5 * z * z)
      // scale curve to max bar height
      const cx = xToPx(x)
      const cy = H - 22 - y * (H - 36)
      pts.push(`${i === 0 ? 'M' : 'L'}${cx.toFixed(1)},${cy.toFixed(1)}`)
    }
    curvePath = pts.join(' ')
  }
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{
      background: 'linear-gradient(180deg, rgba(20,184,166,0.05), rgba(20,184,166,0.02))',
      borderRadius: 8,
    }}>
      <line x1={20} y1={H - 22} x2={W - 20} y2={H - 22} stroke="#cbd5e1" strokeWidth={1} />
      {counts.map((c, i) => {
        if (c === 0) return null
        const x = 20 + i * ((W - 40) / N) + 0.25
        const h = (c / maxC) * (H - 36)
        return <rect key={i} x={x} y={H - 22 - h} width={barW} height={h} fill={C_DIST} opacity={0.78} rx={1.2} />
      })}
      {curvePath && (
        <path d={curvePath} fill="none" stroke={C_DIST_DEEP} strokeWidth={2}
          strokeDasharray="3,3" opacity={0.9} />
      )}
      {/* μ marker — label sits to the LEFT of the vertical line, LTR formula */}
      <line x1={xToPx(mu)} y1={4} x2={xToPx(mu)} y2={H - 22}
        stroke={C_POP} strokeWidth={2} />
      <text x={xToPx(mu) - 6} y={16} textAnchor="end" direction="ltr"
        fontSize={11} fill={C_POP} fontWeight={700}
        style={{ fontFamily: "'Inter','Rubik',sans-serif" }}>
        μ = {mu.toFixed(2)}
      </text>
      {/* empirical mean marker — same convention: label LEFT of line, LTR */}
      {empMean !== null && Math.abs(empMean - mu) > 0.05 && (
        <>
          <line x1={xToPx(empMean)} y1={4} x2={xToPx(empMean)} y2={H - 22}
            stroke="#b91c1c" strokeWidth={2} strokeDasharray="4,3" />
          <text x={xToPx(empMean) - 6} y={32} textAnchor="end" direction="ltr"
            fontSize={11} fill="#b91c1c" fontWeight={700}
            style={{ fontFamily: "'Inter','Rubik',sans-serif" }}>
            x̄ = {empMean.toFixed(2)}
          </text>
        </>
      )}
      {[0, 8, 16, 24, 32].map(t => (
        <text key={t} x={xToPx(t)} y={H - 8} textAnchor="middle" fontSize={9} fill={C_TEXT_LIGHT}>{t}</text>
      ))}
      {!values.length && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill={C_TEXT_LIGHT}>
          התחילו לדגום כדי לבנות את ההתפלגות
        </text>
      )}
    </svg>
  )
}

// ── Button styles ─────────────────────────────────────────────────────────────
const presetBtn: React.CSSProperties = {
  background: 'rgba(31,62,108,0.08)', color: C_POP,
  border: `1px solid rgba(31,62,108,0.30)`,
  borderRadius: 8, padding: '4px 10px',
  fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12,
  cursor: 'pointer',
}
const primaryBtn: React.CSSProperties = {
  background: C_POP, color: '#fff', border: 0,
  borderRadius: 10, padding: '8px 16px', fontFamily: "'Rubik', sans-serif",
  fontWeight: 700, fontSize: 13, cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(31,62,108,0.20)',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: C_TEXT_MED,
  border: `1px solid ${C_BORDER}`, borderRadius: 10,
  padding: '6px 12px', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
}
