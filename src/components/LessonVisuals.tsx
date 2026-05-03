/**
 * Interactive SVG/React visualizations for each statistics topic.
 * One component per topic — no external charting libraries needed.
 */
import React, { useState, useCallback, useMemo } from 'react'

// ── Shared tokens ─────────────────────────────────────────────────────────────
const ACCENT = '#6366f1'
const WRAP: React.CSSProperties = {
  background: 'rgba(99,102,241,0.06)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 16,
  padding: '16px 20px',
  marginTop: 20,
  fontFamily: "'Assistant', sans-serif",
  direction: 'rtl',
}
const BADGE = (extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'inline-block',
  background: 'rgba(99,102,241,0.12)',
  borderRadius: 8,
  padding: '3px 10px',
  fontSize: 13,
  fontWeight: 600,
  color: '#4338ca',
  margin: '0 3px',
  ...extra,
})
const ROW: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }
const LABEL_STYLE: React.CSSProperties = { fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }
const SLIDER = (color = ACCENT): React.CSSProperties => ({ width: 110, accentColor: color, marginRight: 6 } as React.CSSProperties)
const CAPTION: React.CSSProperties = { fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 8 }

// ── Math helpers ──────────────────────────────────────────────────────────────
function normalPDF(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const p = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const cdf = 1 - Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) * p
  return z >= 0 ? cdf : 1 - cdf
}

function pearsonR(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 2) return 0
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  const cov = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / n
  const sx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) / n)
  const sy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0) / n)
  return sx * sy === 0 ? 0 : cov / (sx * sy)
}

function binomCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let r = 1
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1)
  return r
}

function boxMuller(): number {
  const u = Math.random() || 1e-10
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// ── 1. Mean ───────────────────────────────────────────────────────────────────
export function MeanVisual() {
  const [values, setValues] = useState([3, 5, 7, 8, 2, 6])
  const mean = useMemo(() => values.reduce((s, v) => s + v, 0) / values.length, [values])
  const W = 380, H = 110, PAD = 24
  const maxV = Math.max(...values, 1)
  const barW = Math.min(36, (W - PAD * 2) / values.length - 4)
  const spacing = (W - PAD * 2) / values.length
  const scaleH = (H - 22) / maxV

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — ממוצע (גרור את המחוונים)</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {values.map((v, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6366f1', marginBottom: 2 }}>x{i + 1}={v}</div>
            <input type="range" min={1} max={15} value={v}
              onChange={e => setValues(prev => prev.map((x, j) => j === i ? +e.target.value : x))}
              style={SLIDER()} />
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={PAD} y1={H - 8} x2={W - PAD} y2={H - 8} stroke="#d1d5db" strokeWidth={1} />
        {values.map((v, i) => {
          const x = PAD + i * spacing + (spacing - barW) / 2
          const bh = v * scaleH
          return (
            <g key={i}>
              <rect x={x} y={H - 8 - bh} width={barW} height={bh}
                fill={v > mean ? 'rgba(99,102,241,0.75)' : 'rgba(245,158,11,0.75)'} rx={3} />
              <text x={x + barW / 2} y={H - 10 - bh} textAnchor="middle" fontSize={11} fill="#374151">{v}</text>
            </g>
          )
        })}
        <line x1={PAD} y1={H - 8 - mean * scaleH} x2={W - PAD} y2={H - 8 - mean * scaleH}
          stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
        <text x={W - PAD + 2} y={H - 8 - mean * scaleH + 4} fontSize={10} fill="#ef4444" fontWeight="bold">x̄</text>
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>n = {values.length}</span>
        <span style={BADGE()}>Σ = {values.reduce((s, v) => s + v, 0)}</span>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>x̄ = {mean.toFixed(2)}</span>
        <button onClick={() => values.length > 2 && setValues(v => v.slice(0, -1))}
          style={{ marginRight: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: 12 }}>
          − הסר
        </button>
        <button onClick={() => values.length < 10 && setValues(v => [...v, Math.round(mean)])}
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12 }}>
          + הוסף
        </button>
      </div>
    </div>
  )
}

// ── 2. Median ─────────────────────────────────────────────────────────────────
export function MedianVisual() {
  const [values, setValues] = useState([3, 1, 7, 5, 9, 2])
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values])
  const n = sorted.length
  const isEven = n % 2 === 0
  const m1 = isEven ? n / 2 - 1 : Math.floor(n / 2)
  const m2 = isEven ? n / 2 : Math.floor(n / 2)
  const median = isEven ? (sorted[m1] + sorted[m2]) / 2 : sorted[m1]

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — חציון</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, paddingTop: 20 }}>
        {sorted.map((v, i) => {
          const isMed = i === m1 || i === m2
          return (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {isMed && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#b45309', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {isEven ? 'מרכז' : 'חציון'}
              </div>}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isMed ? '#f59e0b' : 'rgba(99,102,241,0.15)',
                border: `2px solid ${isMed ? '#f59e0b' : 'rgba(99,102,241,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: isMed ? '#fff' : '#4338ca',
              }}>{v}</div>
              <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>#{i + 1}</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={BADGE()}>n = {n} {isEven ? '(זוגי)' : '(אי-זוגי)'}</span>
          <span style={BADGE({ background: 'rgba(245,158,11,0.12)', color: '#b45309' })}>חציון = {median}</span>
          {isEven && <span style={{ fontSize: 11, color: '#9ca3af' }}> = ({sorted[m1]}+{sorted[m2]})/2</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => values.length > 2 && setValues(v => v.slice(0, -1))}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: 12 }}>−</button>
          <button onClick={() => values.length < 11 && setValues(v => [...v, Math.floor(Math.random() * 10) + 1])}
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12 }}>+</button>
        </div>
      </div>
    </div>
  )
}

// ── 3. Std-Dev ────────────────────────────────────────────────────────────────
export function StdDevVisual() {
  const [mu, setMu] = useState(50)
  const [sigma, setSigma] = useState(10)
  const W = 380, H = 110
  const xMin = 0, xMax = 100, STEPS = 200
  const pts: [number, number][] = []
  let maxY = 0
  for (let i = 0; i <= STEPS; i++) {
    const x = xMin + (i / STEPS) * (xMax - xMin)
    const y = normalPDF(x, mu, sigma)
    if (y > maxY) maxY = y
    pts.push([x, y])
  }
  const toSVG = (x: number, y: number): [number, number] => [
    20 + ((x - xMin) / (xMax - xMin)) * (W - 40),
    H - 12 - (y / maxY) * (H - 22),
  ]
  const pathD = pts.map(([x, y], i) => { const [sx, sy] = toSVG(x, y); return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')
  const shadeZone = (from: number, to: number, fill: string) => {
    const sub = pts.filter(([x]) => x >= from && x <= to)
    if (!sub.length) return null
    const [fx] = toSVG(sub[0][0], 0); const [lx] = toSVG(sub[sub.length - 1][0], 0)
    const [, by] = toSVG(0, 0)
    const area = sub.map(([x, y]) => { const [sx, sy] = toSVG(x, y); return `${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')
    return <polygon key={`${from}-${to}`} points={`${fx},${by} ${area} ${lx},${by}`} fill={fill} opacity={0.4} />
  }
  const [mx] = toSVG(mu, 0)
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — סטיית תקן (כלל 68-95-99.7)</div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>ממוצע μ: <strong>{mu}</strong> <input type="range" min={20} max={80} value={mu} onChange={e => setMu(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>סטיית תקן σ: <strong>{sigma}</strong> <input type="range" min={3} max={22} value={sigma} onChange={e => setSigma(+e.target.value)} style={SLIDER()} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {shadeZone(mu - 3 * sigma, mu + 3 * sigma, '#c7d2fe')}
        {shadeZone(mu - 2 * sigma, mu + 2 * sigma, '#818cf8')}
        {shadeZone(mu - sigma, mu + sigma, '#6366f1')}
        <line x1={20} y1={H - 12} x2={W - 20} y2={H - 12} stroke="#d1d5db" strokeWidth={1} />
        <path d={pathD} fill="none" stroke="#3730a3" strokeWidth={2} />
        <line x1={mx} y1={8} x2={mx} y2={H - 12} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />
        <text x={mx} y={6} textAnchor="middle" fontSize={9} fill="#ef4444">μ</text>
      </svg>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
        {[['±1σ ≈ 68%', 'rgba(99,102,241,0.7)'], ['±2σ ≈ 95%', 'rgba(99,102,241,0.45)'], ['±3σ ≈ 99.7%', 'rgba(99,102,241,0.25)']].map(([label, bg]) => (
          <span key={label} style={{ padding: '2px 8px', background: bg as string, color: label.startsWith('±3') ? '#4338ca' : '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

// ── 4. Probability ────────────────────────────────────────────────────────────
export function ProbabilityVisual() {
  const [pa, setPa] = useState(0.5)
  const [pb, setPb] = useState(0.4)
  const [pab, setPab] = useState(0.2)
  const inter = Math.min(pab, pa, pb)
  const union = pa + pb - inter
  const cond = pb > 0 ? (inter / pb).toFixed(2) : '—'

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — הסתברות (דיאגרמת ון)</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={LABEL_STYLE}>P(A): <strong>{pa.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={pa} onChange={e => setPa(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>P(B): <strong>{pb.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={pb} onChange={e => setPb(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
        <label style={LABEL_STYLE}>P(A∩B): <strong>{inter.toFixed(2)}</strong><input type="range" min={0} max={Math.min(pa, pb)} step={0.05} value={pab} onChange={e => setPab(+e.target.value)} style={SLIDER('#10b981')} /></label>
      </div>
      {(() => {
        // Dynamic circle positions: dist between centers shrinks as pab grows.
        // pab = 0           → dist = rA+rB (no overlap)
        // pab = min(pa,pb)  → dist = |rA-rB| (one contained in the other)
        const rA = Math.max(10, 46 * Math.sqrt(pa))
        const rB = Math.max(10, 46 * Math.sqrt(pb))
        const overlapRatio = Math.min(pa, pb) > 0 ? Math.min(1, pab / Math.min(pa, pb)) : 0
        const minD = Math.abs(rA - rB) + 2
        const maxD = rA + rB - 1
        const dist = maxD - (maxD - minD) * overlapRatio
        const cxA = 150 - dist / 2
        const cxB = 150 + dist / 2
        return (
          <svg width="100%" viewBox="0 0 300 110">
            <rect x={4} y={4} width={292} height={102} fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth={1} rx={6} />
            <text x={14} y={16} fontSize={10} fill="#6366f1">Ω</text>
            <circle cx={cxA} cy={56} r={rA} fill="rgba(99,102,241,0.30)" stroke="#6366f1" strokeWidth={1.5} style={{ transition: 'cx 240ms ease-out, r 200ms ease-out' }} />
            <circle cx={cxB} cy={56} r={rB} fill="rgba(245,158,11,0.30)" stroke="#f59e0b" strokeWidth={1.5} style={{ transition: 'cx 240ms ease-out, r 200ms ease-out' }} />
            <text x={cxA - rA - 6} y={59} fontSize={14} fontWeight="bold" fill="#3730a3" textAnchor="end">A</text>
            <text x={cxB + rB + 6} y={59} fontSize={14} fontWeight="bold" fill="#92400e">B</text>
            {inter > 0.01 && <text x={150} y={59} fontSize={10} textAnchor="middle" fill="#065f46" fontWeight="bold">{inter.toFixed(2)}</text>}
          </svg>
        )
      })()}
      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={BADGE()}>P(A∪B) = {union.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>P(A∩B) = {inter.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>P(A|B) = {cond}</span>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>P(Aᶜ) = {(1 - pa).toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── 5. Binomial ───────────────────────────────────────────────────────────────
export function BinomialVisual() {
  const [n, setN] = useState(10)
  const [p, setP] = useState(0.4)
  const probs = useMemo(() => Array.from({ length: n + 1 }, (_, k) => binomCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)), [n, p])
  const maxP = Math.max(...probs)
  const mean = n * p, variance = n * p * (1 - p)
  const W = 380, H = 110
  const barW = Math.min(28, (W - 40) / (n + 1) - 2)
  const spacing = (W - 40) / (n + 1)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — התפלגות בינומית B(n,p)</div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>n: <strong>{n}</strong><input type="range" min={1} max={20} value={n} onChange={e => setN(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>p: <strong>{p.toFixed(2)}</strong><input type="range" min={0.05} max={0.95} step={0.05} value={p} onChange={e => setP(+e.target.value)} style={SLIDER()} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={20} y1={H - 14} x2={W - 20} y2={H - 14} stroke="#d1d5db" strokeWidth={1} />
        {probs.map((prob, k) => {
          const x = 20 + k * spacing + (spacing - barW) / 2
          const bh = (prob / maxP) * (H - 24)
          const isMean = k === Math.round(mean)
          return (
            <g key={k}>
              <rect x={x} y={H - 14 - bh} width={barW} height={bh} fill={isMean ? '#ef4444' : 'rgba(99,102,241,0.7)'} rx={2} />
              {n <= 14 && <text x={x + barW / 2} y={H - 3} textAnchor="middle" fontSize={8} fill="#6b7280">{k}</text>}
            </g>
          )
        })}
        {(() => { const mx = 20 + mean * spacing + spacing / 2; return <line x1={mx} y1={4} x2={mx} y2={H - 14} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" /> })()}
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>E(X) = np = {mean.toFixed(1)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>V(X) = {variance.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>σ = {Math.sqrt(variance).toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── 6. Correlation ────────────────────────────────────────────────────────────
const INIT_PTS: [number, number][] = [[1, 1.8], [2, 3.2], [3, 2.8], [4, 4.5], [5, 5.1], [6, 5.8], [7, 6.9], [8, 8.0]]

export function CorrelationVisual() {
  const [pts, setPts] = useState<[number, number][]>(INIT_PTS)
  const r = useMemo(() => pearsonR(pts.map(p => p[0]), pts.map(p => p[1])), [pts])
  const W = 240, H = 180, PAD = 28
  const xMin = 0, xMax = 10, yMin = 0, yMax = 10
  const toS = (x: number, y: number): [number, number] => [
    PAD + (x - xMin) / (xMax - xMin) * (W - PAD * 2),
    H - PAD - (y - yMin) / (yMax - yMin) * (H - PAD * 2),
  ]
  const xs = pts.map(p => p[0]); const ys = pts.map(p => p[1])
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length
  const my = ys.reduce((s, y) => s + y, 0) / ys.length
  const sx2 = xs.reduce((s, x) => s + (x - mx) ** 2, 0) / xs.length
  const sy2 = ys.reduce((s, y) => s + (y - my) ** 2, 0) / ys.length
  const b = sx2 > 0 ? r * Math.sqrt(sy2 / sx2) : 0
  const a = my - b * mx
  const [lx1, ly1] = toS(xMin, a + b * xMin); const [lx2, ly2] = toS(xMax, a + b * xMax)
  const rCol = Math.abs(r) > 0.7 ? '#6366f1' : Math.abs(r) > 0.3 ? '#f59e0b' : '#9ca3af'

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = (e.clientX - rect.left) / rect.width * W
    const svgY = (e.clientY - rect.top) / rect.height * H
    const dx = (svgX - PAD) / (W - PAD * 2) * (xMax - xMin) + xMin
    const dy = (H - PAD - svgY) / (H - PAD * 2) * (yMax - yMin) + yMin
    if (dx < 0 || dx > xMax || dy < 0 || dy > yMax) return
    setPts(prev => [...prev, [+dx.toFixed(1), +dy.toFixed(1)]])
  }

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מתאם (לחץ בגרף להוספת נקודות)</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ cursor: 'crosshair', flexShrink: 0, background: 'rgba(255,255,255,0.4)', borderRadius: 8 }} onClick={handleClick}>
          {[2, 4, 6, 8].map(v => {
            const [gx] = toS(v, 0); const [, gy] = toS(0, v)
            return <g key={v}><line x1={gx} y1={PAD - 10} x2={gx} y2={H - PAD} stroke="#e5e7eb" strokeWidth={0.5} /><line x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#e5e7eb" strokeWidth={0.5} /></g>
          })}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          {pts.length >= 2 && <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={rCol} strokeWidth={2} opacity={0.8} />}
          {pts.map(([px, py], i) => { const [sx, sy] = toS(px, py); return <circle key={i} cx={sx} cy={sy} r={5} fill="rgba(99,102,241,0.8)" stroke="#fff" strokeWidth={1.5} /> })}
          <text x={W - PAD} y={H - PAD + 12} fontSize={9} textAnchor="end" fill="#9ca3af">X</text>
          <text x={PAD - 4} y={PAD - 2} fontSize={9} fill="#9ca3af">Y</text>
        </svg>
        <div style={{ minWidth: 90 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: rCol, lineHeight: 1 }}>{r.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: rCol, fontWeight: 600 }}>{Math.abs(r) > 0.7 ? 'קשר חזק' : Math.abs(r) > 0.3 ? 'קשר בינוני' : 'קשר חלש'}</div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8, textAlign: 'right' }}>r² = {(r * r).toFixed(3)}<br />n = {pts.length}</div>
          <button onClick={() => setPts(INIT_PTS)} style={{ marginTop: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>אפס</button>
        </div>
      </div>
    </div>
  )
}

// ── 7. Regression ─────────────────────────────────────────────────────────────
const REG_DATA: [number, number][] = [[1, 2.1], [2, 3.7], [3, 3.2], [4, 5.1], [5, 5.0], [6, 6.4], [7, 6.9], [8, 8.2]]

export function RegressionVisual() {
  const xs = REG_DATA.map(p => p[0]); const ys = REG_DATA.map(p => p[1])
  const n = REG_DATA.length
  const mx = xs.reduce((s, x) => s + x, 0) / n; const my = ys.reduce((s, y) => s + y, 0) / n
  const sx2 = xs.reduce((s, x) => s + (x - mx) ** 2, 0) / n; const sy2 = ys.reduce((s, y) => s + (y - my) ** 2, 0) / n
  const r = pearsonR(xs, ys)
  const bOLS = r * Math.sqrt(sy2 / sx2); const aOLS = my - bOLS * mx
  const [slope, setSlope] = useState(+bOLS.toFixed(2))
  const [intercept, setIntercept] = useState(+aOLS.toFixed(2))
  const ssUser = REG_DATA.reduce((s, [x, y]) => s + (y - (intercept + slope * x)) ** 2, 0)
  const ssOLS = REG_DATA.reduce((s, [x, y]) => s + (y - (aOLS + bOLS * x)) ** 2, 0)
  const W = 240, H = 180, PAD = 28
  const toS = (x: number, y: number): [number, number] => [
    PAD + (x - 0) / 10 * (W - PAD * 2),
    H - PAD - (y - 0) / 10 * (H - PAD * 2),
  ]
  const [l1x, l1y] = toS(0, intercept); const [l2x, l2y] = toS(10, intercept + slope * 10)
  const [o1x, o1y] = toS(0, aOLS); const [o2x, o2y] = toS(10, aOLS + bOLS * 10)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — רגרסיה (נסה למצוא את קו OLS)</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.4)', borderRadius: 8 }}>
          {[2, 4, 6, 8].map(v => { const [gx] = toS(v, 0); const [, gy] = toS(0, v); return <g key={v}><line x1={gx} y1={PAD - 10} x2={gx} y2={H - PAD} stroke="#e5e7eb" strokeWidth={0.5} /><line x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#e5e7eb" strokeWidth={0.5} /></g> })}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={o1x} y1={o1y} x2={o2x} y2={o2y} stroke="#10b981" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
          <text x={o2x} y={o2y - 4} fontSize={8} fill="#10b981">OLS</text>
          <line x1={l1x} y1={l1y} x2={l2x} y2={l2y} stroke="#6366f1" strokeWidth={2} />
          {REG_DATA.map(([x, y], i) => {
            const [px, py] = toS(x, y); const [, ry] = toS(x, intercept + slope * x)
            return <g key={i}><line x1={px} y1={py} x2={px} y2={ry} stroke="#ef4444" strokeWidth={1} opacity={0.5} /><circle cx={px} cy={py} r={4} fill="rgba(99,102,241,0.8)" stroke="#fff" strokeWidth={1} /></g>
          })}
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, marginBottom: 8, textAlign: 'right' }}>
            <div style={{ marginBottom: 6 }}>שיפוע b: <strong>{slope.toFixed(2)}</strong><input type="range" min={0} max={3} step={0.05} value={slope} onChange={e => setSlope(+e.target.value)} style={{ width: '100%', accentColor: ACCENT }} /></div>
            <div>חיתוך a: <strong>{intercept.toFixed(2)}</strong><input type="range" min={-2} max={4} step={0.1} value={intercept} onChange={e => setIntercept(+e.target.value)} style={{ width: '100%', accentColor: ACCENT }} /></div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8, textAlign: 'right' }}>
            Ŷ = {intercept.toFixed(2)} + {slope.toFixed(2)}X<br />
            SS שלך: <span style={{ color: ssUser > ssOLS * 1.05 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{ssUser.toFixed(1)}</span><br />
            SS מינימלי: <span style={{ color: '#10b981', fontWeight: 700 }}>{ssOLS.toFixed(1)}</span>
          </div>
          <button onClick={() => { setSlope(+bOLS.toFixed(2)); setIntercept(+aOLS.toFixed(2)) }} style={{ marginTop: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', color: '#065f46', fontSize: 11, fontWeight: 600 }}>הצג OLS</button>
        </div>
      </div>
    </div>
  )
}

// ── 8. Normal Distribution / Z-score ─────────────────────────────────────────
export function NormalDistVisual() {
  const [z, setZ] = useState(1.5)
  const [twoTail, setTwoTail] = useState(false)
  const W = 360, H = 110, STEPS = 300
  const xMin = -4, xMax = 4
  const pts: [number, number][] = []
  let maxY = 0
  for (let i = 0; i <= STEPS; i++) {
    const x = xMin + (i / STEPS) * (xMax - xMin)
    const y = normalPDF(x, 0, 1)
    if (y > maxY) maxY = y
    pts.push([x, y])
  }
  const toS = (x: number, y: number): [number, number] => [
    20 + ((x - xMin) / (xMax - xMin)) * (W - 40),
    H - 10 - (y / maxY) * (H - 20),
  ]
  const pathD = pts.map(([x, y], i) => { const [sx, sy] = toS(x, y); return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')
  const shade = (from: number, to: number) => {
    const sub = pts.filter(([x]) => x >= from && x <= to)
    if (!sub.length) return null
    const [fx] = toS(sub[0][0], 0); const [lx] = toS(sub[sub.length - 1][0], 0); const [, by] = toS(0, 0)
    return <polygon points={`${fx},${by} ${sub.map(([x, y]) => { const [sx, sy] = toS(x, y); return `${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')} ${lx},${by}`} fill="rgba(99,102,241,0.5)" />
  }
  const pct = twoTail ? 2 * (1 - normalCDF(Math.abs(z))) : z >= 0 ? 1 - normalCDF(z) : normalCDF(z)
  const [zx] = toS(z, 0); const [nzx] = toS(-Math.abs(z), 0)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — ציון תקן Z</div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>Z = <strong>{z.toFixed(2)}</strong><input type="range" min={-3.5} max={3.5} step={0.05} value={z} onChange={e => setZ(+e.target.value)} style={{ width: 130, accentColor: ACCENT, marginRight: 6 }} /></label>
        <label style={{ ...LABEL_STYLE, gap: 4 }}><input type="checkbox" checked={twoTail} onChange={e => setTwoTail(e.target.checked)} />דו-צדדי</label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {twoTail ? <>{shade(xMin, -Math.abs(z))}{shade(Math.abs(z), xMax)}</> : (z >= 0 ? shade(z, xMax) : shade(xMin, z))}
        <line x1={20} y1={H - 10} x2={W - 20} y2={H - 10} stroke="#d1d5db" strokeWidth={1} />
        <path d={pathD} fill="none" stroke="#3730a3" strokeWidth={2} />
        <line x1={zx} y1={4} x2={zx} y2={H - 10} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />
        {twoTail && <line x1={nzx} y1={4} x2={nzx} y2={H - 10} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4,3" />}
        {[-3, -2, -1, 0, 1, 2, 3].map(v => { const [sx] = toS(v, 0); return <text key={v} x={sx} y={H - 1} textAnchor="middle" fontSize={8} fill="#9ca3af">{v}</text> })}
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>Z = {z.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(99,102,241,0.15)', color: '#3730a3' })}>שטח = {(pct * 100).toFixed(2)}%</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>אחוזון = {(normalCDF(z) * 100).toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── 9. Sampling ───────────────────────────────────────────────────────────────
export function SamplingVisual() {
  const [n, setN] = useState(30)
  const [means, setMeans] = useState<number[]>([])
  const [lastMean, setLastMean] = useState<number | null>(null)
  const POP_MU = 50, POP_SD = 10
  const se = POP_SD / Math.sqrt(n)

  const drawSample = useCallback(() => {
    const vals = Array.from({ length: n }, () => POP_MU + POP_SD * boxMuller())
    const m = vals.reduce((s, v) => s + v, 0) / n
    setLastMean(m)
    setMeans(prev => [...prev.slice(-29), +m.toFixed(2)])
  }, [n])

  const W = 340, H = 70, xMin = POP_MU - 3.5 * POP_SD, xMax = POP_MU + 3.5 * POP_SD
  const toX = (v: number) => 20 + ((v - xMin) / (xMax - xMin)) * (W - 40)
  const seL = toX(POP_MU - se), seR = toX(POP_MU + se), muX = toX(POP_MU)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — דגימה ושגיאת תקן</div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>n: <strong>{n}</strong><input type="range" min={2} max={100} value={n} onChange={e => { setN(+e.target.value); setMeans([]); setLastMean(null) }} style={SLIDER()} /></label>
        <button onClick={drawSample} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>שלוף מדגם</button>
        {means.length > 0 && <button onClick={() => { setMeans([]); setLastMean(null) }} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}>נקה</button>}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={20} y1={H - 8} x2={W - 20} y2={H - 8} stroke="#d1d5db" strokeWidth={1} />
        <rect x={seL} y={20} width={seR - seL} height={H - 30} fill="rgba(99,102,241,0.12)" rx={2} />
        <line x1={muX} y1={4} x2={muX} y2={H - 8} stroke="#10b981" strokeWidth={2} />
        <text x={muX} y={H + 2} textAnchor="middle" fontSize={8} fill="#10b981">μ={POP_MU}</text>
        {means.map((m, i) => {
          const age = means.length - 1 - i
          const row = i % 5
          return <circle key={i} cx={toX(m)} cy={12 + row * 9} r={3.5} fill="#6366f1" opacity={Math.max(0.15, 1 - age * 0.06)} />
        })}
        {lastMean !== null && <line x1={toX(lastMean)} y1={4} x2={toX(lastMean)} y2={H - 8} stroke="#ef4444" strokeWidth={2} />}
        {[POP_MU - 2 * POP_SD, POP_MU - POP_SD, POP_MU, POP_MU + POP_SD, POP_MU + 2 * POP_SD].map(v => (
          <text key={v} x={toX(v)} y={H - 1} textAnchor="middle" fontSize={7} fill="#d1d5db">{v}</text>
        ))}
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>SE = σ/√n = {se.toFixed(2)}</span>
        {lastMean !== null && <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>x̄ = {lastMean.toFixed(2)}</span>}
        {means.length > 1 && <span style={{ fontSize: 11, color: '#9ca3af' }}> | {means.length} מדגמים</span>}
      </div>
    </div>
  )
}

// ── 10. Confidence Intervals ──────────────────────────────────────────────────
function zStar(conf: number): number {
  const target = (1 + conf / 100) / 2
  let lo = 0, hi = 4
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; normalCDF(mid) < target ? (lo = mid) : (hi = mid) }
  return (lo + hi) / 2
}

export function ConfidenceIntervalVisual() {
  const [conf, setConf] = useState(95)
  const [count, setCount] = useState(20)
  const [intervals, setIntervals] = useState<{ lo: number; hi: number; hit: boolean }[]>([])
  const POP_MU = 0, n = 30, POP_SD = 1

  const generate = useCallback(() => {
    const z = zStar(conf)
    const se = POP_SD / Math.sqrt(n)
    setIntervals(Array.from({ length: count }, () => {
      const xBar = POP_MU + (POP_SD / Math.sqrt(n)) * boxMuller()
      const lo = xBar - z * se, hi = xBar + z * se
      return { lo, hi, hit: lo <= POP_MU && hi >= POP_MU }
    }))
  }, [conf, count])

  const hits = intervals.filter(i => i.hit).length
  const W = 280, BAR_H = 8, GAP = 2, H = count * (BAR_H + GAP) + 20
  const xMin = -0.8, xMax = 0.8
  const toX = (v: number) => 20 + ((v - xMin) / (xMax - xMin)) * (W - 40)
  const muX = toX(POP_MU)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — רווחי סמך</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <label style={LABEL_STYLE}>ביטחון: <strong>{conf}%</strong><input type="range" min={80} max={99} step={1} value={conf} onChange={e => setConf(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>מספר: <strong>{count}</strong><input type="range" min={5} max={40} step={5} value={count} onChange={e => setCount(+e.target.value)} style={{ width: 80, accentColor: ACCENT, marginRight: 6 }} /></label>
        <button onClick={generate} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>צור רווחים</button>
      </div>
      {intervals.length > 0 && (
        <>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: 220, display: 'block' }}>
            <line x1={muX} y1={0} x2={muX} y2={H} stroke="#10b981" strokeWidth={1.5} />
            {intervals.map((ci, i) => {
              const y = 10 + i * (BAR_H + GAP)
              const x1 = toX(ci.lo), x2 = toX(ci.hi)
              return (
                <g key={i}>
                  <rect x={x1} y={y} width={x2 - x1} height={BAR_H} fill={ci.hit ? 'rgba(99,102,241,0.6)' : 'rgba(239,68,68,0.6)'} rx={2} />
                </g>
              )
            })}
            <text x={muX} y={H + 1} textAnchor="middle" fontSize={8} fill="#10b981">μ</text>
          </svg>
          <div style={{ marginTop: 8 }}>
            <span style={BADGE()}>{hits}/{count} מכילים את μ</span>
            <span style={BADGE({ background: 'rgba(99,102,241,0.15)', color: '#3730a3' })}>{(hits / count * 100).toFixed(0)}% (צפוי: {conf}%)</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 6 }}>z* = {zStar(conf).toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Topic → visual map ────────────────────────────────────────────────────────
export const TOPIC_VISUALS: Record<string, React.FC> = {
  'mean': MeanVisual,
  'median': MedianVisual,
  'std-dev': StdDevVisual,
  'probability': ProbabilityVisual,
  'binomial': BinomialVisual,
  'correlation': CorrelationVisual,
  'regression': RegressionVisual,
  'hypothesis-testing': NormalDistVisual,
  'sampling': SamplingVisual,
  'confidence-intervals': ConfidenceIntervalVisual,
}
