/**
 * Interactive SVG/React visualizations for each statistics topic.
 * Each visual tells a small Hebrew story (real-world scenario) instead of
 * abstract x1/x2/x3 sliders. Visual style is loosely Kenney-esque flat /
 * isometric — clean white-grey shapes with restrained accent colours, all
 * rendered as inline SVG. No external charting libraries.
 */
import React, { useState, useCallback, useMemo } from 'react'

// ── Shared tokens — Navy + Gold brand palette ─────────────────────────────────
const ACCENT = '#1F3E6C'        // navy (was indigo #6366f1)
const GOLD  = '#D4A017'         // gold accent
const WRAP: React.CSSProperties = {
  background: 'rgba(31,62,108,0.06)',
  border: '1px solid rgba(31,62,108,0.2)',
  borderRadius: 16,
  padding: '16px 20px',
  marginTop: 20,
  fontFamily: "'Assistant', sans-serif",
  direction: 'rtl',
}
const BADGE = (extra?: React.CSSProperties): React.CSSProperties => ({
  display: 'inline-block',
  background: 'rgba(212,160,23,0.12)',
  borderRadius: 8,
  padding: '3px 10px',
  fontSize: 13,
  fontWeight: 600,
  color: '#1F3E6C',
  margin: '0 3px',
  ...extra,
})
const ROW: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }
const LABEL_STYLE: React.CSSProperties = { fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }
const SLIDER = (color = GOLD): React.CSSProperties => ({ width: 110, accentColor: color, marginRight: 6 } as React.CSSProperties)
const CAPTION: React.CSSProperties = { fontSize: 11, color: '#1F3E6C', fontWeight: 600, marginBottom: 4 }
const STORY: React.CSSProperties = { fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.5)', borderRight: `3px solid ${GOLD}`, borderRadius: 8 }

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
function factorial(n: number): number {
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r
}
function boxMuller(): number {
  const u = Math.random() || 1e-10
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function rank(xs: number[]): number[] {
  const idx = xs.map((v, i) => [v, i] as [number, number]).sort((a, b) => a[0] - b[0])
  const r = new Array(xs.length).fill(0)
  idx.forEach(([, i], k) => { r[i] = k + 1 })
  return r
}

// ── 1. Mean — ציוני 6 חברים בכיתה ────────────────────────────────────────────
const FRIENDS = ['דן', 'נועה', 'רון', 'מיה', 'עמית', 'תמר', 'יעל', 'איתי', 'שיר', 'אורי']
const FRIEND_COLOR = '#6366f1'

export function MeanVisual() {
  const [values, setValues] = useState([7, 9, 5, 8, 4, 10])
  const mean = useMemo(() => values.reduce((s, v) => s + v, 0) / values.length, [values])
  const W = 380, H = 130, PAD = 24
  const maxV = Math.max(10, ...values)
  const barW = Math.min(36, (W - PAD * 2) / values.length - 4)
  const spacing = (W - PAD * 2) / values.length
  const scaleH = (H - 36) / maxV

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — ממוצע</div>
      {/* Prominent x̄ display — the answer first, story second. */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12,
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#6b7280',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          ממוצע
        </div>
        <div style={{
          fontFamily: "'Inter', serif",
          fontSize: 36, fontWeight: 700, color: '#1F3E6C',
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          x̄ = {mean.toFixed(2)}
        </div>
      </div>
      {/* Color legend — yellow = below mean, blue = above */}
      <div style={{
        display: 'flex', gap: 14, justifyContent: 'center',
        marginBottom: 10, fontSize: 11, color: '#475569',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(212,160,23,0.85)' }} />
          מתחת לממוצע
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(31,62,108,0.75)' }} />
          מעל לממוצע
        </span>
      </div>
      <div style={STORY}>
        <strong>ציוני המבחן של {values.length} חברים בכיתה.</strong> הזיזו את הסרגלים כדי לשנות את הציון של כל חבר וראו איך הממוצע (הקו הזהוב) מתנדנד.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {values.map((v, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: FRIEND_COLOR, marginBottom: 2, fontWeight: 600 }}>{FRIENDS[i]}: {v}</div>
            <input type="range" min={0} max={10} value={v}
              onChange={e => setValues(prev => prev.map((x, j) => j === i ? +e.target.value : x))}
              style={SLIDER()} />
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={PAD} y1={H - 16} x2={W - PAD} y2={H - 16} stroke="#d1d5db" strokeWidth={1} />
        {values.map((v, i) => {
          const x = PAD + i * spacing + (spacing - barW) / 2
          const bh = v * scaleH
          return (
            <g key={i}>
              <rect x={x} y={H - 16 - bh} width={barW} height={bh}
                fill={v > mean ? 'rgba(31,62,108,0.75)' : 'rgba(212,160,23,0.85)'} rx={3} />
              <text x={x + barW / 2} y={H - 18 - bh} textAnchor="middle" fontSize={11} fill="#374151">{v}</text>
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">{FRIENDS[i]}</text>
            </g>
          )
        })}
        <line x1={PAD} y1={H - 16 - mean * scaleH} x2={W - PAD} y2={H - 16 - mean * scaleH}
          stroke="#D4A017" strokeWidth={2} strokeDasharray="6,3" />
        <text x={W - PAD + 2} y={H - 16 - mean * scaleH + 4} fontSize={10} fill="#D4A017" fontWeight="bold">x̄</text>
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>n = {values.length}</span>
        <span style={BADGE()}>Σ = {values.reduce((s, v) => s + v, 0)}</span>
        <span style={BADGE({ background: 'rgba(212,160,23,0.12)', color: '#1F3E6C' })}>ממוצע = {mean.toFixed(2)}</span>
        <button onClick={() => values.length > 2 && setValues(v => v.slice(0, -1))}
          style={{ marginRight: 8, background: 'rgba(31,62,108,0.08)', border: '1px solid rgba(31,62,108,0.2)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: '#1F3E6C', fontWeight: 600, fontSize: 12 }}>
          − הסר חבר
        </button>
        <button onClick={() => values.length < 10 && setValues(v => [...v, Math.round(mean)])}
          style={{ background: 'rgba(31,62,108,0.08)', border: '1px solid rgba(31,62,108,0.25)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12 }}>
          + הוסף חבר
        </button>
      </div>
    </div>
  )
}

// ── 2. Median — שכר חברי הצוות ───────────────────────────────────────────────
const TEAM = ['רותם', 'גילי', 'איל', 'מיכל', 'יואב', 'נטע', 'אסף', 'עידו', 'הילה']

export function MedianVisual() {
  const [values, setValues] = useState([12, 18, 22, 15, 45, 20])
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values])
  const n = sorted.length
  const isEven = n % 2 === 0
  const m1 = isEven ? n / 2 - 1 : Math.floor(n / 2)
  const m2 = isEven ? n / 2 : Math.floor(n / 2)
  const median = isEven ? (sorted[m1] + sorted[m2]) / 2 : sorted[m1]
  const mean = values.reduce((s, v) => s + v, 0) / n

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — חציון</div>
      <div style={STORY}>
        <strong>שכר חודשי (באלפי ₪) של {n} חברי צוות.</strong> הסדרה ממוינת מהקטן לגדול — החציון הוא העובד שבדיוק באמצע. שימו לב: בעובד הבכיר (45K) מסיט את הממוצע למעלה, אבל לא משפיע על החציון.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, paddingTop: 20, justifyContent: 'center' }}>
        {sorted.map((v, i) => {
          const isMed = i === m1 || i === m2
          const origIdx = values.indexOf(v)
          return (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {isMed && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#1F3E6C', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {isEven ? 'מרכז' : 'חציון'}
              </div>}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: isMed ? '#D4A017' : 'rgba(31,62,108,0.12)',
                border: `2px solid ${isMed ? '#D4A017' : 'rgba(31,62,108,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: isMed ? '#fff' : '#1F3E6C',
              }}>{v}K</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{TEAM[origIdx >= 0 ? origIdx % TEAM.length : i]}</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={BADGE()}>n = {n} {isEven ? '(זוגי)' : '(אי-זוגי)'}</span>
          <span style={BADGE({ background: 'rgba(31,62,108,0.10)', color: '#1F3E6C' })}>חציון = {median}K</span>
          <span style={BADGE({ background: 'rgba(212,160,23,0.15)', color: '#1F3E6C' })}>ממוצע = {mean.toFixed(1)}K</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => values.length > 2 && setValues(v => v.slice(0, -1))}
            style={{ background: 'rgba(31,62,108,0.07)', border: '1px solid rgba(31,62,108,0.2)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: '#1F3E6C', fontWeight: 600, fontSize: 12 }}>− עובד</button>
          <button onClick={() => values.length < 9 && setValues(v => [...v, Math.floor(Math.random() * 35) + 10])}
            style={{ background: 'rgba(31,62,108,0.07)', border: '1px solid rgba(31,62,108,0.2)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12 }}>+ עובד</button>
          <button onClick={() => setValues(v => [...v, 200])}
            style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.35)', borderRadius: 7, padding: '2px 10px', cursor: 'pointer', color: '#1F3E6C', fontWeight: 600, fontSize: 12 }}>+ מנכ״ל</button>
        </div>
      </div>
    </div>
  )
}

// ── 3. Std-Dev — ציוני 1000 תלמידים ──────────────────────────────────────────
export function StdDevVisual() {
  const [mu, setMu] = useState(70)
  const [sigma, setSigma] = useState(10)
  const W = 380, H = 110
  const xMin = 30, xMax = 110, STEPS = 200
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
      <div style={STORY}>
        <strong>פיזור ציוני מבחן בכיתה של 1000 תלמידים.</strong> הציון הממוצע (μ) נמצא בקו האדום, וסטיית התקן (σ) קובעת כמה הפיזור רחב. שני שליש מהתלמידים נופלים ב-±σ סביב הממוצע.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>ציון ממוצע μ: <strong>{mu}</strong> <input type="range" min={50} max={90} value={mu} onChange={e => setMu(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>סטיית תקן σ: <strong>{sigma}</strong> <input type="range" min={3} max={20} value={sigma} onChange={e => setSigma(+e.target.value)} style={SLIDER()} /></label>
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

// ── 4. General Probability Venn — overview ────────────────────────────────────
export function ProbabilityVisual() {
  const [pa, setPa] = useState(0.5)
  const [pb, setPb] = useState(0.4)
  const [pab, setPab] = useState(0.2)
  const setPabSafe = (next: number) => {
    setPab(next)
    if (next > pa) setPa(next)
    if (next > pb) setPb(next)
  }
  const setPaSafe = (next: number) => { setPa(next); if (pab > next) setPab(next) }
  const setPbSafe = (next: number) => { setPb(next); if (pab > next) setPab(next) }
  const inter = Math.min(pab, pa, pb)
  const union = pa + pb - inter
  const cond = pb > 0 ? (inter / pb).toFixed(2) : '—'

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — הסתברות (דיאגרמת ון כללית)</div>
      <div style={STORY}>
        <strong>הסתברות לגשם בשני ימים.</strong> A = "ירד גשם ביום ב'", B = "ירד גשם ביום ג'". שחקו עם השלושה: הסתברות גשם בכל יום, וההסתברות שירד בשני הימים יחד (החיתוך).
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={LABEL_STYLE}>P(גשם ב'): <strong>{pa.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={pa} onChange={e => setPaSafe(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>P(גשם ג'): <strong>{pb.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={pb} onChange={e => setPbSafe(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
        <label style={LABEL_STYLE}>P(שניהם): <strong>{inter.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={pab} onChange={e => setPabSafe(+e.target.value)} style={SLIDER('#10b981')} /></label>
      </div>
      {(() => {
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
            <text x={14} y={16} fontSize={10} fill="#6366f1">Ω (כל הימים)</text>
            <circle cx={cxA} cy={58} r={rA} fill="rgba(99,102,241,0.30)" stroke="#6366f1" strokeWidth={1.5} style={{ transition: 'cx 240ms ease-out, r 200ms ease-out' }} />
            <circle cx={cxB} cy={58} r={rB} fill="rgba(245,158,11,0.30)" stroke="#f59e0b" strokeWidth={1.5} style={{ transition: 'cx 240ms ease-out, r 200ms ease-out' }} />
            <text x={cxA - rA - 6} y={61} fontSize={13} fontWeight="bold" fill="#3730a3" textAnchor="end">גשם ב'</text>
            <text x={cxB + rB + 6} y={61} fontSize={13} fontWeight="bold" fill="#92400e">גשם ג'</text>
            {inter > 0.01 && <text x={150} y={61} fontSize={10} textAnchor="middle" fill="#065f46" fontWeight="bold">{inter.toFixed(2)}</text>}
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

// ── 4a. Venn — Independent events: זריקת שתי קוביות ───────────────────────────
export function VennIndependentVisual() {
  const [pa, setPa] = useState(1 / 6)
  const [pb, setPb] = useState(1 / 6)
  const inter = pa * pb // independence: P(A∩B) = P(A)·P(B)
  const union = pa + pb - inter
  const rA = Math.max(14, 56 * Math.sqrt(pa))
  const rB = Math.max(14, 56 * Math.sqrt(pb))
  const overlapRatio = Math.min(pa, pb) > 0 ? Math.min(1, inter / Math.min(pa, pb)) : 0
  const minD = Math.abs(rA - rB) + 2
  const maxD = rA + rB - 1
  const dist = maxD - (maxD - minD) * overlapRatio
  const cxA = 150 - dist / 2
  const cxB = 150 + dist / 2

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מאורעות בלתי תלויים</div>
      <div style={STORY}>
        <strong>זריקת שתי קוביות הוגנות.</strong> A = "קוביה 1 = 6", B = "קוביה 2 = 6". אין דרך שהאחת תשפיע על השנייה — לכן <em>בלתי תלויים</em>. ההסתברות לשני שישיות יחד היא תמיד P(A)·P(B).
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={LABEL_STYLE}>P(קוביה 1 = 6): <strong>{pa.toFixed(2)}</strong><input type="range" min={0.05} max={0.5} step={0.05} value={pa} onChange={e => setPa(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>P(קוביה 2 = 6): <strong>{pb.toFixed(2)}</strong><input type="range" min={0.05} max={0.5} step={0.05} value={pb} onChange={e => setPb(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
      </div>
      <svg width="100%" viewBox="0 0 300 130">
        <rect x={4} y={4} width={292} height={122} fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth={1} rx={6} />
        <text x={14} y={16} fontSize={10} fill="#6366f1">Ω = 36 צירופי קוביות</text>
        <circle cx={cxA} cy={70} r={rA} fill="rgba(99,102,241,0.30)" stroke="#6366f1" strokeWidth={1.5} />
        <circle cx={cxB} cy={70} r={rB} fill="rgba(245,158,11,0.30)" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={cxA - rA - 4} y={72} fontSize={12} fontWeight="bold" fill="#3730a3" textAnchor="end">A</text>
        <text x={cxB + rB + 4} y={72} fontSize={12} fontWeight="bold" fill="#92400e">B</text>
        {inter > 0.001 && <text x={150} y={72} fontSize={9} textAnchor="middle" fill="#065f46" fontWeight="bold">{inter.toFixed(3)}</text>}
        <text x={150} y={120} textAnchor="middle" fontSize={11} fill="#065f46" fontWeight="bold">
          P(A∩B) = P(A)·P(B) = {pa.toFixed(2)}·{pb.toFixed(2)} = {inter.toFixed(3)}
        </text>
      </svg>
      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>P(A∩B) = {inter.toFixed(3)}</span>
        <span style={BADGE()}>P(A∪B) = {union.toFixed(3)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>P(A|B) = P(A) = {pa.toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── 4b. Venn — Disjoint events: מין הילד ──────────────────────────────────────
export function VennDisjointVisual() {
  const [pa, setPa] = useState(0.51)
  const pb = 1 - pa // mutually exclusive cover
  const W = 300, H = 130
  const total = pa + pb
  const rA = Math.max(20, 50 * Math.sqrt(pa))
  const rB = Math.max(20, 50 * Math.sqrt(pb))
  const cxA = 90, cxB = 210

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מאורעות זרים</div>
      <div style={STORY}>
        <strong>מין הילד שייוולד.</strong> A = "בן", B = "בת". הילד יכול להיות בן או בת — אבל לא שניהם בו-זמנית. החיתוך ריק: P(A∩B) = 0. כל הסתברות נופלת באחד משני המעגלים, אף פעם לא בשניהם.
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={LABEL_STYLE}>P(בן): <strong>{pa.toFixed(2)}</strong><input type="range" min={0.1} max={0.9} step={0.01} value={pa} onChange={e => setPa(+e.target.value)} style={SLIDER()} /></label>
        <span style={{ fontSize: 13, color: '#6b7280' }}>P(בת) = 1 − P(בן) = <strong>{pb.toFixed(2)}</strong></span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <rect x={4} y={4} width={W - 8} height={H - 8} fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth={1} rx={6} />
        <text x={14} y={16} fontSize={10} fill="#6366f1">Ω = כל הילדים</text>
        <circle cx={cxA} cy={70} r={rA} fill="rgba(99,102,241,0.35)" stroke="#6366f1" strokeWidth={1.5} />
        <circle cx={cxB} cy={70} r={rB} fill="rgba(236,72,153,0.35)" stroke="#ec4899" strokeWidth={1.5} />
        <text x={cxA} y={74} fontSize={14} fontWeight="bold" fill="#3730a3" textAnchor="middle">בן</text>
        <text x={cxB} y={74} fontSize={14} fontWeight="bold" fill="#9d174d" textAnchor="middle">בת</text>
        <text x={150} y={120} textAnchor="middle" fontSize={11} fill="#b91c1c" fontWeight="bold">A ∩ B = ∅ &nbsp; ⇒ &nbsp; P(A∩B) = 0</text>
      </svg>
      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>P(A∩B) = 0</span>
        <span style={BADGE()}>P(A∪B) = P(A)+P(B) = {total.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>P(A|B) = 0</span>
      </div>
    </div>
  )
}

// ── 4c. Venn — One inside the other (full conditional dependence) ─────────────
export function VennDependentVisual() {
  const [pTicket, setPTicket] = useState(0.4) // P(B) — bought ticket
  const [pWinGivenTicket, setPWinGivenTicket] = useState(0.25)
  const pWin = pTicket * pWinGivenTicket // P(A) — wins (always within "bought ticket")
  const W = 300, H = 130
  const rB = Math.max(20, 56 * Math.sqrt(pTicket))
  const rA = Math.max(8, 56 * Math.sqrt(pWin))
  // A ⊂ B → A is centered inside B
  const cxB = 150
  const cxA = 150
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — תלות מלאה (מאורע מוכל)</div>
      <div style={STORY}>
        <strong>זכייה בהגרלה.</strong> B = "קניתי כרטיס", A = "זכיתי בהגרלה". אי אפשר לזכות בלי לקנות — לכן A מוכל לחלוטין ב-B (A ⊂ B). זה תלות מלאה: P(A|B) הוא הסתברות הזכייה לכרטיס, ו-P(B|A) = 1.
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={LABEL_STYLE}>P(קנייה): <strong>{pTicket.toFixed(2)}</strong><input type="range" min={0.1} max={0.9} step={0.05} value={pTicket} onChange={e => setPTicket(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
        <label style={LABEL_STYLE}>P(זכייה|קנייה): <strong>{pWinGivenTicket.toFixed(2)}</strong><input type="range" min={0.05} max={0.9} step={0.05} value={pWinGivenTicket} onChange={e => setPWinGivenTicket(+e.target.value)} style={SLIDER()} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <rect x={4} y={4} width={W - 8} height={H - 8} fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.25)" strokeWidth={1} rx={6} />
        <text x={14} y={16} fontSize={10} fill="#6366f1">Ω = כל האנשים</text>
        <circle cx={cxB} cy={70} r={rB} fill="rgba(245,158,11,0.30)" stroke="#f59e0b" strokeWidth={1.5} />
        <circle cx={cxA} cy={70} r={rA} fill="rgba(99,102,241,0.55)" stroke="#3730a3" strokeWidth={1.5} />
        <text x={cxB} y={70 - rB + 14} fontSize={11} fontWeight="bold" fill="#92400e" textAnchor="middle">B = קניית כרטיס</text>
        <text x={cxA} y={74} fontSize={10} fontWeight="bold" fill="#fff" textAnchor="middle">A=זוכים</text>
        <text x={150} y={120} textAnchor="middle" fontSize={11} fill="#3730a3" fontWeight="bold">A ⊂ B &nbsp; ⇒ &nbsp; P(A∩B) = P(A) = {pWin.toFixed(3)}</text>
      </svg>
      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={BADGE()}>P(A) = {pWin.toFixed(3)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.12)', color: '#92400e' })}>P(B) = {pTicket.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>P(A|B) = {pWinGivenTicket.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>P(B|A) = 1</span>
      </div>
    </div>
  )
}

// ── 5. Binomial — שאלות אמריקאי ──────────────────────────────────────────────
export function BinomialVisual() {
  const [n, setN] = useState(10)
  const [p, setP] = useState(0.25)
  const probs = useMemo(() => Array.from({ length: n + 1 }, (_, k) => binomCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)), [n, p])
  const maxP = Math.max(...probs)
  const mean = n * p, variance = n * p * (1 - p)
  const W = 380, H = 110
  const barW = Math.min(28, (W - 40) / (n + 1) - 2)
  const spacing = (W - 40) / (n + 1)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — התפלגות בינומית B(n,p)</div>
      <div style={STORY}>
        <strong>מבחן אמריקאי עם {n} שאלות.</strong> כל שאלה עם 4 תשובות, אז ניחוש אקראי נותן p={p.toFixed(2)} סיכוי לתשובה נכונה. הגרף מראה את ההסתברות לקבל בדיוק k תשובות נכונות. הקו האדום הוא התוצאה הצפויה.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>מספר שאלות n: <strong>{n}</strong><input type="range" min={1} max={20} value={n} onChange={e => setN(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>סיכוי לנחש p: <strong>{p.toFixed(2)}</strong><input type="range" min={0.05} max={0.95} step={0.05} value={p} onChange={e => setP(+e.target.value)} style={SLIDER()} /></label>
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
        <span style={BADGE()}>תשובות נכונות צפויות = np = {mean.toFixed(1)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>V(X) = {variance.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>σ = {Math.sqrt(variance).toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── 6. Correlation — שעות לימוד מול ציון ─────────────────────────────────────
const STUDY_PTS: [number, number][] = [[1, 55], [2, 62], [3, 65], [4, 72], [5, 78], [6, 80], [7, 88], [8, 92]]

export function CorrelationVisual() {
  const [pts, setPts] = useState<[number, number][]>(STUDY_PTS)
  const r = useMemo(() => pearsonR(pts.map(p => p[0]), pts.map(p => p[1])), [pts])
  const W = 240, H = 200, PAD = 30
  const xMin = 0, xMax = 10, yMin = 40, yMax = 100
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
    if (dx < 0 || dx > xMax || dy < yMin || dy > yMax) return
    setPts(prev => [...prev, [+dx.toFixed(1), +dy.toFixed(0)]])
  }

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מתאם פירסון</div>
      <div style={STORY}>
        <strong>שעות לימוד שבועיות מול ציון במבחן.</strong> כל נקודה היא תלמיד. לחצו על הגרף כדי להוסיף תלמידים ולהסתכל איך ערך r משתנה — קרוב ל-1 אם יש קשר חיובי חזק, קרוב ל-0 אם אין קשר.
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg width={W} height={H} style={{ cursor: 'crosshair', flexShrink: 0, background: 'rgba(255,255,255,0.4)', borderRadius: 8 }} onClick={handleClick}>
          {[2, 4, 6, 8].map(v => {
            const [gx] = toS(v, yMin); const [, gy] = toS(0, 50 + v * 5)
            return <g key={v}><line x1={gx} y1={PAD - 10} x2={gx} y2={H - PAD} stroke="#e5e7eb" strokeWidth={0.5} /><line x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#e5e7eb" strokeWidth={0.5} /></g>
          })}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          {pts.length >= 2 && <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={rCol} strokeWidth={2} opacity={0.8} />}
          {pts.map(([px, py], i) => { const [sx, sy] = toS(px, py); return <circle key={i} cx={sx} cy={sy} r={5} fill="rgba(99,102,241,0.8)" stroke="#fff" strokeWidth={1.5} /> })}
          <text x={W - PAD} y={H - PAD + 14} fontSize={9} textAnchor="end" fill="#6b7280">שעות לימוד</text>
          <text x={PAD - 4} y={PAD - 2} fontSize={9} fill="#6b7280" textAnchor="end">ציון</text>
        </svg>
        <div style={{ minWidth: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: rCol, lineHeight: 1 }}>{r.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: rCol, fontWeight: 600 }}>{Math.abs(r) > 0.7 ? 'קשר חזק' : Math.abs(r) > 0.3 ? 'קשר בינוני' : 'קשר חלש'}</div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8, textAlign: 'right' }}>r² = {(r * r).toFixed(3)}<br />n = {pts.length}</div>
          <button onClick={() => setPts(STUDY_PTS)} style={{ marginTop: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>אפס</button>
        </div>
      </div>
    </div>
  )
}

// ── 7. Regression — נבא ציון לפי שעות לימוד ──────────────────────────────────
const REG_DATA: [number, number][] = [[1, 5.5], [2, 6.2], [3, 6.5], [4, 7.2], [5, 7.8], [6, 8.0], [7, 8.8], [8, 9.2]]

export function RegressionVisual() {
  const xs = REG_DATA.map(p => p[0]); const ys = REG_DATA.map(p => p[1])
  const n = REG_DATA.length
  const mx = xs.reduce((s, x) => s + x, 0) / n; const my = ys.reduce((s, y) => s + y, 0) / n
  const sx2 = xs.reduce((s, x) => s + (x - mx) ** 2, 0) / n; const sy2 = ys.reduce((s, y) => s + (y - my) ** 2, 0) / n
  const r = pearsonR(xs, ys)
  const bOLS = r * Math.sqrt(sy2 / sx2); const aOLS = my - bOLS * mx
  const [slope, setSlope] = useState(0.4)
  const [intercept, setIntercept] = useState(5.0)
  const ssUser = REG_DATA.reduce((s, [x, y]) => s + (y - (intercept + slope * x)) ** 2, 0)
  const ssOLS = REG_DATA.reduce((s, [x, y]) => s + (y - (aOLS + bOLS * x)) ** 2, 0)
  const W = 240, H = 180, PAD = 28
  const toS = (x: number, y: number): [number, number] => [
    PAD + (x - 0) / 10 * (W - PAD * 2),
    H - PAD - (y - 4) / 6 * (H - PAD * 2),
  ]
  const [l1x, l1y] = toS(0, intercept); const [l2x, l2y] = toS(10, intercept + slope * 10)
  const [o1x, o1y] = toS(0, aOLS); const [o2x, o2y] = toS(10, aOLS + bOLS * 10)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — רגרסיה ליניארית</div>
      <div style={STORY}>
        <strong>נבא ציון מבחן לפי שעות לימוד.</strong> הזיזו את שיפוע (b) וחיתוך (a) של הקו הסגול עד שהוא יעבור הכי קרוב לכל הנקודות. הקו הירוק הוא הפתרון האופטימלי (OLS) — סכום הריבועים הקטן ביותר.
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg width={W} height={H} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.4)', borderRadius: 8 }}>
          {[2, 4, 6, 8].map(v => { const [gx] = toS(v, 0); const [, gy] = toS(0, 5 + v * 0.5); return <g key={v}><line x1={gx} y1={PAD - 10} x2={gx} y2={H - PAD} stroke="#e5e7eb" strokeWidth={0.5} /><line x1={PAD} y1={gy} x2={W - PAD} y2={gy} stroke="#e5e7eb" strokeWidth={0.5} /></g> })}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={o1x} y1={o1y} x2={o2x} y2={o2y} stroke="#10b981" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
          <text x={o2x} y={o2y - 4} fontSize={8} fill="#10b981">OLS</text>
          <line x1={l1x} y1={l1y} x2={l2x} y2={l2y} stroke="#6366f1" strokeWidth={2} />
          {REG_DATA.map(([x, y], i) => {
            const [px, py] = toS(x, y); const [, ry] = toS(x, intercept + slope * x)
            return <g key={i}><line x1={px} y1={py} x2={px} y2={ry} stroke="#ef4444" strokeWidth={1} opacity={0.5} /><circle cx={px} cy={py} r={4} fill="rgba(99,102,241,0.8)" stroke="#fff" strokeWidth={1} /></g>
          })}
          <text x={W - PAD} y={H - PAD + 14} fontSize={9} textAnchor="end" fill="#6b7280">שעות לימוד</text>
          <text x={PAD - 4} y={PAD - 2} fontSize={9} fill="#6b7280" textAnchor="end">ציון</text>
        </svg>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 12, marginBottom: 8, textAlign: 'right' }}>
            <div style={{ marginBottom: 6 }}>שיפוע b: <strong>{slope.toFixed(2)}</strong><input type="range" min={0} max={1} step={0.05} value={slope} onChange={e => setSlope(+e.target.value)} style={{ width: '100%', accentColor: ACCENT }} /></div>
            <div>חיתוך a: <strong>{intercept.toFixed(2)}</strong><input type="range" min={3} max={8} step={0.1} value={intercept} onChange={e => setIntercept(+e.target.value)} style={{ width: '100%', accentColor: ACCENT }} /></div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.8, textAlign: 'right' }}>
            ציון̂ = {intercept.toFixed(2)} + {slope.toFixed(2)}·שעות<br />
            SS שלך: <span style={{ color: ssUser > ssOLS * 1.05 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{ssUser.toFixed(2)}</span><br />
            SS מינימלי: <span style={{ color: '#10b981', fontWeight: 700 }}>{ssOLS.toFixed(2)}</span>
          </div>
          <button onClick={() => { setSlope(+bOLS.toFixed(2)); setIntercept(+aOLS.toFixed(2)) }} style={{ marginTop: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', color: '#065f46', fontSize: 11, fontWeight: 600 }}>הצג OLS</button>
        </div>
      </div>
    </div>
  )
}

// ── 8. Normal / Z — גובה תלמידי כיתה י' ──────────────────────────────────────
export function NormalDistVisual() {
  const [z, setZ] = useState(1.0)
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
  // Translate Z to height (μ=170 cm, σ=8 cm)
  const heightCm = 170 + z * 8

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — ציון תקן Z</div>
      <div style={STORY}>
        <strong>גובה תלמידי כיתה י' (μ = 170 ס"מ, σ = 8 ס"מ).</strong> ציון Z אומר כמה סטיות תקן רחוקים מהממוצע. למשל Z={z.toFixed(2)} → גובה של כ-{heightCm.toFixed(0)} ס"מ. הגרף מציג את אחוז התלמידים בקצוות.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>Z = <strong>{z.toFixed(2)}</strong> (גובה ≈ {heightCm.toFixed(0)} ס"מ)<input type="range" min={-3} max={3} step={0.05} value={z} onChange={e => setZ(+e.target.value)} style={{ width: 130, accentColor: ACCENT, marginRight: 6 }} /></label>
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
        <span style={BADGE({ background: 'rgba(99,102,241,0.15)', color: '#3730a3' })}>שטח (זנב) = {(pct * 100).toFixed(2)}%</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>אחוזון = {(normalCDF(z) * 100).toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── 9. Sampling — שליפת מדגם מאוכלוסייה ──────────────────────────────────────
export function SamplingVisual() {
  const [n, setN] = useState(30)
  const [means, setMeans] = useState<number[]>([])
  const [lastMean, setLastMean] = useState<number | null>(null)
  const POP_MU = 75, POP_SD = 12
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
      <div style={STORY}>
        <strong>הציונים בכיתה גדולה: μ = 75, σ = 12.</strong> שלפו מדגם של n תלמידים וחשבו את הממוצע שלהם. ככל ש-n גדל, הממוצעים מתקבצים יותר סביב 75 — זה כוח החוק החלש של המספרים הגדולים.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>גודל מדגם n: <strong>{n}</strong><input type="range" min={2} max={100} value={n} onChange={e => { setN(+e.target.value); setMeans([]); setLastMean(null) }} style={SLIDER()} /></label>
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
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE()}>SE = σ/√n = {se.toFixed(2)}</span>
        {lastMean !== null && <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>x̄ = {lastMean.toFixed(2)}</span>}
        {means.length > 1 && <span style={{ fontSize: 11, color: '#9ca3af' }}> | {means.length} מדגמים</span>}
      </div>
    </div>
  )
}

// ── 10. Confidence Intervals ─────────────────────────────────────────────────
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
      <div style={STORY}>
        <strong>{count} סקרים נפרדים שמנסים לאמוד את הציון הממוצע בכיתה.</strong> כל פס הוא רווח סמך מסקר אחד. הקווים הכחולים "תפסו" את הממוצע האמיתי, האדומים פספסו. ככל שהביטחון גבוה יותר, הרווחים רחבים יותר.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <label style={LABEL_STYLE}>ביטחון: <strong>{conf}%</strong><input type="range" min={80} max={99} step={1} value={conf} onChange={e => setConf(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>מספר סקרים: <strong>{count}</strong><input type="range" min={5} max={40} step={5} value={count} onChange={e => setCount(+e.target.value)} style={{ width: 80, accentColor: ACCENT, marginRight: 6 }} /></label>
        <button onClick={generate} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>צור סקרים</button>
      </div>
      {intervals.length > 0 && (
        <>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: 220, display: 'block' }}>
            <line x1={muX} y1={0} x2={muX} y2={H} stroke="#10b981" strokeWidth={1.5} />
            {intervals.map((ci, i) => {
              const y = 10 + i * (BAR_H + GAP)
              const x1 = toX(ci.lo), x2 = toX(ci.hi)
              return <rect key={i} x={x1} y={y} width={x2 - x1} height={BAR_H} fill={ci.hit ? 'rgba(99,102,241,0.6)' : 'rgba(239,68,68,0.6)'} rx={2} />
            })}
            <text x={muX} y={H - 4} textAnchor="middle" fontSize={9} fill="#10b981" fontWeight={700}>μ אמיתי</text>
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

// ── 11. Intro — מה זה סטטיסטיקה ───────────────────────────────────────────────
export function IntroVisual() {
  const [stage, setStage] = useState(0) // 0=raw, 1=sorted, 2=histogram
  const RAW = useMemo(() => [3, 8, 5, 7, 2, 9, 5, 6, 4, 7, 5, 8, 6, 3, 7, 5, 6, 4, 8, 5], [])
  const sorted = useMemo(() => [...RAW].sort((a, b) => a - b), [RAW])
  const W = 360, H = 130
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מסע סטטיסטי</div>
      <div style={STORY}>
        <strong>20 תוצאות מבחן.</strong> בהתחלה זה רק ערימת מספרים. לחצו "מיין" ואז "ארגן" כדי לראות איך סטטיסטיקה מארגנת כאוס לסיפור — ההיסטוגרמה חושפת את הצורה.
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['🎲 גולמי', '↕ ממוין', '📊 היסטוגרמה'].map((label, i) => (
          <button key={i} onClick={() => setStage(i)}
            style={{
              background: stage === i ? ACCENT : 'rgba(99,102,241,0.1)', color: stage === i ? '#fff' : ACCENT,
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 10px',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>{label}</button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {stage < 2 ? (
          (stage === 0 ? RAW : sorted).map((v, i) => {
            const cols = 10, x = 20 + (i % cols) * 32, y = 20 + Math.floor(i / cols) * 36
            return <g key={i}>
              <rect x={x} y={y} width={28} height={28} fill="rgba(99,102,241,0.18)" stroke={ACCENT} rx={6} />
              <text x={x + 14} y={y + 19} textAnchor="middle" fontSize={13} fontWeight={700} fill="#3730a3">{v}</text>
            </g>
          })
        ) : (() => {
          const counts: Record<number, number> = {}
          RAW.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
          const keys = Object.keys(counts).map(Number).sort((a, b) => a - b)
          const maxC = Math.max(...Object.values(counts))
          const barW = (W - 60) / keys.length - 6
          return keys.map((k, i) => {
            const x = 30 + i * ((W - 60) / keys.length)
            const bh = (counts[k] / maxC) * (H - 30)
            return <g key={k}>
              <rect x={x} y={H - 18 - bh} width={barW} height={bh} fill={ACCENT} rx={3} />
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#374151">{k}</text>
              <text x={x + barW / 2} y={H - 22 - bh} textAnchor="middle" fontSize={9} fill="#6b7280">{counts[k]}</text>
            </g>
          })
        })()}
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE()}>n = {RAW.length}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>ממוצע = {(RAW.reduce((s, v) => s + v, 0) / RAW.length).toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── 12. Variable Types — סיווג משתנים ────────────────────────────────────────
const VAR_EXAMPLES = [
  { name: 'גובה (ס"מ)', type: 'רציף', cat: 'q' },
  { name: 'מספר ילדים', type: 'בדיד', cat: 'q' },
  { name: 'דרגה צבאית', type: 'סדיר', cat: 'c' },
  { name: 'צבע עיניים', type: 'נומינלי', cat: 'c' },
  { name: 'משקל (ק"ג)', type: 'רציף', cat: 'q' },
  { name: 'מין', type: 'נומינלי', cat: 'c' },
  { name: 'ציון 0-100', type: 'רציף', cat: 'q' },
  { name: 'תואר אקדמי', type: 'סדיר', cat: 'c' },
]

export function VariableTypesVisual() {
  const [selected, setSelected] = useState<string>('רציף')
  const TYPES = ['רציף', 'בדיד', 'סדיר', 'נומינלי']
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — סוגי משתנים</div>
      <div style={STORY}>
        <strong>סטטיסטיקה מתחילה בסיווג.</strong> כל משתנה הוא או כמותי (מספר אמיתי) או איכותי (קטגוריה). לחצו על כל סוג כדי לראות דוגמאות מהחיים.
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setSelected(t)}
            style={{
              background: selected === t ? ACCENT : 'rgba(99,102,241,0.1)',
              color: selected === t ? '#fff' : ACCENT,
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '5px 12px',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
        {VAR_EXAMPLES.map(v => {
          const isMatch = v.type === selected
          return (
            <div key={v.name} style={{
              padding: '10px 12px', borderRadius: 10,
              background: isMatch ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.5)',
              border: `1.5px solid ${isMatch ? ACCENT : 'rgba(99,102,241,0.15)'}`,
              opacity: isMatch ? 1 : 0.55, transition: 'all 0.2s',
            }}>
              <div style={{ fontWeight: 700, color: '#3730a3', fontSize: 13 }}>{v.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{v.cat === 'q' ? 'כמותי' : 'איכותי'} / {v.type}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 13. Data Presentation — היסטוגרמה / טבלה ─────────────────────────────────
export function DataPresentationVisual() {
  const [view, setView] = useState<'hist' | 'table'>('hist')
  const data = useMemo(() => [3, 5, 4, 7, 8, 5, 6, 4, 5, 7, 6, 8, 5, 4, 6, 7, 5, 6, 4, 7], [])
  const counts: Record<number, number> = {}
  data.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
  const keys = Object.keys(counts).map(Number).sort((a, b) => a - b)
  const W = 360, H = 130
  const maxC = Math.max(...Object.values(counts))

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — הצגת נתונים</div>
      <div style={STORY}>
        <strong>20 ציוני מבחן (1-10).</strong> אותם נתונים נראים אחרת בכל ייצוג: היסטוגרמה מבליטה את הצורה, טבלת שכיחויות מבליטה את המספרים המדויקים.
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['hist', '📊 היסטוגרמה'], ['table', '🔢 טבלת שכיחויות']].map(([k, label]) => (
          <button key={k} onClick={() => setView(k as 'hist' | 'table')}
            style={{
              background: view === k ? ACCENT : 'rgba(99,102,241,0.1)', color: view === k ? '#fff' : ACCENT,
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 10px',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>{label}</button>
        ))}
      </div>
      {view === 'hist' ? (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {keys.map((k, i) => {
            const barW = (W - 60) / keys.length - 6
            const x = 30 + i * ((W - 60) / keys.length)
            const bh = (counts[k] / maxC) * (H - 30)
            return <g key={k}>
              <rect x={x} y={H - 18 - bh} width={barW} height={bh} fill="rgba(99,102,241,0.7)" rx={3} />
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#374151">{k}</text>
              <text x={x + barW / 2} y={H - 22 - bh} textAnchor="middle" fontSize={9} fill="#6b7280">{counts[k]}</text>
            </g>
          })}
        </svg>
      ) : (
        <table style={{ width: '100%', fontSize: 13, textAlign: 'center', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.15)' }}>
              <th style={{ padding: '6px 8px', border: '1px solid rgba(99,102,241,0.2)' }}>ציון x</th>
              <th style={{ padding: '6px 8px', border: '1px solid rgba(99,102,241,0.2)' }}>שכיחות f</th>
              <th style={{ padding: '6px 8px', border: '1px solid rgba(99,102,241,0.2)' }}>שכיחות יחסית</th>
              <th style={{ padding: '6px 8px', border: '1px solid rgba(99,102,241,0.2)' }}>מצטברת</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cum = 0
              return keys.map(k => {
                cum += counts[k]
                return <tr key={k}>
                  <td style={{ padding: '4px 8px', border: '1px solid rgba(99,102,241,0.15)', fontWeight: 600 }}>{k}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid rgba(99,102,241,0.15)' }}>{counts[k]}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid rgba(99,102,241,0.15)' }}>{(counts[k] / data.length).toFixed(2)}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid rgba(99,102,241,0.15)' }}>{cum}</td>
                </tr>
              })
            })()}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── 14. Distribution Shapes — סימטרי / נטוי ───────────────────────────────────
export function DistributionShapesVisual() {
  const [shape, setShape] = useState<'sym' | 'left' | 'right'>('sym')
  // Taller chart + extra top room so marker chips sit above bars without
  // overlapping each other. CHIP_TOP reserves a strip for the chips.
  const W = 360, H = 180, CHIP_TOP = 38
  const data = useMemo(() => {
    const xs = Array.from({ length: 21 }, (_, i) => i)
    const f = (x: number): number => {
      if (shape === 'sym') return Math.exp(-((x - 10) ** 2) / 18)
      if (shape === 'left') return Math.exp(-((x - 14) ** 2) / 18)
      return Math.exp(-((x - 6) ** 2) / 18)
    }
    return xs.map(x => [x, f(x)] as [number, number])
  }, [shape])
  const maxV = Math.max(...data.map(d => d[1]))
  const total = data.reduce((s, [, v]) => s + v, 0)
  const mean = data.reduce((s, [x, v]) => s + x * v, 0) / total
  const cumNeeded = total / 2
  let cum = 0, median = 0
  for (const [x, v] of data) { cum += v; if (cum >= cumNeeded) { median = x; break } }
  const mode = data.reduce((best, [x, v]) => v > best[1] ? [x, v] : best, [0, -Infinity])[0]

  const toX = (x: number) => 20 + (x / 20) * (W - 40)

  // Stagger chip rows so the three labels never collide even when their
  // x-positions coincide (symmetric distribution).
  const chips = [
    { name: 'שכיח', val: mode, color: '#10b981', bg: '#d1fae5', dash: undefined as string | undefined, row: 0 },
    { name: 'חציון', val: median, color: '#b45309', bg: '#fef3c7', dash: '3,3', row: 1 },
    { name: 'ממוצע', val: +mean.toFixed(1), color: '#b91c1c', bg: '#fee2e2', dash: undefined, row: 2 },
  ]

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — צורות התפלגות</div>
      <div style={STORY}>
        <strong>סדר הופעת ממוצע / חציון / שכיח חושף את הא-סימטריה.</strong> בהתפלגות סימטרית כולם חופפים. בנטויה ימינה: שכיח &lt; חציון &lt; ממוצע. בנטויה שמאלה: ממוצע &lt; חציון &lt; שכיח.
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {[['sym', '⚖ סימטרי'], ['right', '↗ נטוי ימינה'], ['left', '↖ נטוי שמאלה']].map(([k, label]) => (
          <button key={k} onClick={() => setShape(k as 'sym' | 'left' | 'right')}
            style={{
              background: shape === k ? ACCENT : 'rgba(99,102,241,0.1)', color: shape === k ? '#fff' : ACCENT,
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 10px',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>{label}</button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Bars */}
        {data.map(([x, v], i) => {
          const barW = (W - 40) / 21 - 2
          const bx = toX(x) - barW / 2
          const bh = (v / maxV) * (H - CHIP_TOP - 18)
          return <rect key={i} x={bx} y={H - 18 - bh} width={barW} height={bh} fill="rgba(99,102,241,0.55)" rx={2} />
        })}
        <line x1={20} y1={H - 18} x2={W - 20} y2={H - 18} stroke="#9ca3af" strokeWidth={1} />
        {/* Vertical markers — extend from chip strip down to baseline */}
        {chips.map((c, i) => (
          <line key={`l${i}`}
            x1={toX(c.val)} y1={CHIP_TOP - 2}
            x2={toX(c.val)} y2={H - 18}
            stroke={c.color} strokeWidth={2}
            strokeDasharray={c.dash} />
        ))}
        {/* Chips — staggered rows so they never overlap each other */}
        {chips.map((c, i) => {
          const cx = toX(c.val)
          const chipW = 64, chipH = 16
          const cyTop = 4 + c.row * (chipH + 2)
          // Clamp chip horizontally so it stays inside the SVG even at edges.
          const clampedX = Math.max(20 + chipW / 2, Math.min(W - 20 - chipW / 2, cx))
          return (
            <g key={`c${i}`}>
              <rect x={clampedX - chipW / 2} y={cyTop} width={chipW} height={chipH}
                fill={c.bg} stroke={c.color} strokeWidth={1} rx={4} />
              <text x={clampedX} y={cyTop + 11.5} fontSize={10} textAnchor="middle"
                fill={c.color} fontWeight={700}>{c.name} = {c.val}</text>
              {/* Tiny stem connecting the chip to its line, only when chip is offset */}
              {Math.abs(clampedX - cx) > 0.5 && (
                <line x1={clampedX} y1={cyTop + chipH} x2={cx} y2={CHIP_TOP - 2}
                  stroke={c.color} strokeWidth={1} opacity={0.5} />
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>שכיח = {mode}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.12)', color: '#b45309' })}>חציון = {median}</span>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>ממוצע = {mean.toFixed(1)}</span>
      </div>
    </div>
  )
}

// ── 15. Weighted Combined — שתי כיתות ────────────────────────────────────────
export function WeightedCombinedVisual() {
  const [n1, setN1] = useState(30)
  const [n2, setN2] = useState(50)
  const [m1, setM1] = useState(80)
  const [m2, setM2] = useState(70)
  const combined = (n1 * m1 + n2 * m2) / (n1 + n2)
  const naive = (m1 + m2) / 2
  const W = 360, H = 110
  const maxN = Math.max(n1, n2, 1)
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — ממוצע משוקלל</div>
      <div style={STORY}>
        <strong>שתי כיתות, גדלים שונים, ציונים שונים.</strong> הממוצע המשולב הוא ממוצע משוקלל — לא פשוט (m1+m2)/2! הכיתה הגדולה "מושכת" יותר.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>כיתה א' n: <strong>{n1}</strong><input type="range" min={5} max={100} value={n1} onChange={e => setN1(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>ציון ממוצע א': <strong>{m1}</strong><input type="range" min={50} max={100} value={m1} onChange={e => setM1(+e.target.value)} style={SLIDER()} /></label>
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>כיתה ב' n: <strong>{n2}</strong><input type="range" min={5} max={100} value={n2} onChange={e => setN2(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
        <label style={LABEL_STYLE}>ציון ממוצע ב': <strong>{m2}</strong><input type="range" min={50} max={100} value={m2} onChange={e => setM2(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <rect x={20} y={30} width={(n1 / maxN) * 140} height={28} fill="rgba(99,102,241,0.6)" rx={4} />
        <text x={20 + (n1 / maxN) * 140 + 6} y={48} fontSize={12} fill="#3730a3" fontWeight={700}>א': {n1} תלמידים, {m1}</text>
        <rect x={20} y={66} width={(n2 / maxN) * 140} height={28} fill="rgba(245,158,11,0.6)" rx={4} />
        <text x={20 + (n2 / maxN) * 140 + 6} y={84} fontSize={12} fill="#92400e" fontWeight={700}>ב': {n2} תלמידים, {m2}</text>
      </svg>
      <div style={{ marginTop: 6 }}>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>משוקלל = {combined.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>(נאיבי) {naive.toFixed(1)} ✗</span>
      </div>
    </div>
  )
}

// ── 16. Observation Changes — outlier vs mean/median ─────────────────────────
export function ObservationChangesVisual() {
  const BASE = useMemo(() => [4, 5, 6, 6, 7, 7, 8, 9], [])
  const [outlier, setOutlier] = useState(50)
  const [includeOutlier, setIncludeOutlier] = useState(false)
  const data = includeOutlier ? [...BASE, outlier] : BASE
  const sortedD = [...data].sort((a, b) => a - b)
  const n = sortedD.length
  const mean = data.reduce((s, v) => s + v, 0) / n
  const median = n % 2 === 0 ? (sortedD[n / 2 - 1] + sortedD[n / 2]) / 2 : sortedD[Math.floor(n / 2)]
  const W = 360, H = 100
  const xMax = Math.max(50, ...data)
  const toX = (v: number) => 20 + (v / xMax) * (W - 40)
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — השפעת תצפית חריגה</div>
      <div style={STORY}>
        <strong>8 שכר חודשי תקני + 1 מנכ"ל.</strong> הפעילו את התצפית החריגה ושימו לב: הממוצע "קופץ" משמעותית, אבל החציון בקושי זז. זו הסיבה שחציון עדיף בנתונים אסימטריים.
      </div>
      <div style={ROW}>
        <label style={{ ...LABEL_STYLE, gap: 6 }}><input type="checkbox" checked={includeOutlier} onChange={e => setIncludeOutlier(e.target.checked)} />הוסף תצפית חריגה</label>
        <label style={LABEL_STYLE}>ערך החריגה: <strong>{outlier}</strong><input type="range" min={20} max={200} value={outlier} onChange={e => setOutlier(+e.target.value)} style={SLIDER('#f59e0b')} disabled={!includeOutlier} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={20} y1={H - 18} x2={W - 20} y2={H - 18} stroke="#d1d5db" strokeWidth={1} />
        {data.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={H - 36} r={6}
            fill={v === outlier && includeOutlier ? '#f59e0b' : 'rgba(99,102,241,0.7)'} stroke="#fff" strokeWidth={1.5} />
        ))}
        <line x1={toX(mean)} y1={4} x2={toX(mean)} y2={H - 18} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,2" />
        <text x={toX(mean)} y={12} fontSize={9} textAnchor="middle" fill="#b91c1c">ממוצע</text>
        <line x1={toX(median)} y1={H - 50} x2={toX(median)} y2={H - 18} stroke="#10b981" strokeWidth={2} />
        <text x={toX(median)} y={H - 54} fontSize={9} textAnchor="middle" fill="#065f46">חציון</text>
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>ממוצע = {mean.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>חציון = {median}</span>
      </div>
    </div>
  )
}

// ── 17. Linear Transformations — y = bx + a ──────────────────────────────────
export function LinearTransformationsVisual() {
  const ORIG = useMemo(() => [4, 5, 6, 7, 8, 6, 5, 7], [])
  const [b, setB] = useState(1.0)
  const [a, setA] = useState(0)
  const transformed = ORIG.map(x => b * x + a)
  const meanO = ORIG.reduce((s, v) => s + v, 0) / ORIG.length
  const meanT = transformed.reduce((s, v) => s + v, 0) / transformed.length
  const sdO = Math.sqrt(ORIG.reduce((s, v) => s + (v - meanO) ** 2, 0) / ORIG.length)
  const sdT = Math.sqrt(transformed.reduce((s, v) => s + (v - meanT) ** 2, 0) / transformed.length)
  const W = 360, H = 110
  const all = [...ORIG, ...transformed]
  const xMin = Math.min(0, ...all), xMax = Math.max(20, ...all)
  const toX = (v: number) => 20 + (v - xMin) / (xMax - xMin) * (W - 40)
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — טרנספורמציה ליניארית</div>
      <div style={STORY}>
        <strong>המרת ציוני 0-10 לציוני 0-100.</strong> משתמשים ב-y = b·x + a. ראו: b מותח את הסטיית תקן, a מזיז את הממוצע, אבל צורת ההתפלגות נשמרת.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>מקדם b: <strong>{b.toFixed(2)}</strong><input type="range" min={0.5} max={10} step={0.5} value={b} onChange={e => setB(+e.target.value)} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>קבוע a: <strong>{a}</strong><input type="range" min={-10} max={20} step={1} value={a} onChange={e => setA(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={20} y1={50} x2={W - 20} y2={50} stroke="#d1d5db" strokeWidth={1} />
        <text x={20} y={20} fontSize={10} fill="#3730a3" fontWeight={700}>מקור</text>
        {ORIG.map((v, i) => <circle key={`o${i}`} cx={toX(v)} cy={32} r={5} fill="rgba(99,102,241,0.7)" stroke="#fff" />)}
        <line x1={20} y1={H - 8} x2={W - 20} y2={H - 8} stroke="#d1d5db" strokeWidth={1} />
        <text x={20} y={H - 38} fontSize={10} fill="#92400e" fontWeight={700}>אחרי טרנספורמציה</text>
        {transformed.map((v, i) => <circle key={`t${i}`} cx={toX(v)} cy={H - 22} r={5} fill="rgba(245,158,11,0.7)" stroke="#fff" />)}
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE()}>ȳ = b·x̄ + a = {b.toFixed(2)}·{meanO.toFixed(2)} + {a} = {meanT.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.1)', color: '#92400e' })}>σy = |b|·σx = {sdT.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>(σx = {sdO.toFixed(2)})</div>
    </div>
  )
}

// ── 18. Percentiles — מיקום על העקומה ────────────────────────────────────────
export function PercentilesVisual() {
  const [val, setVal] = useState(70)
  const MU = 70, SD = 10
  const z = (val - MU) / SD
  const pct = normalCDF(z) * 100
  const W = 360, H = 120, STEPS = 200
  const xMin = MU - 4 * SD, xMax = MU + 4 * SD
  const pts: [number, number][] = []
  let maxY = 0
  for (let i = 0; i <= STEPS; i++) {
    const x = xMin + (i / STEPS) * (xMax - xMin)
    const y = normalPDF(x, MU, SD)
    if (y > maxY) maxY = y
    pts.push([x, y])
  }
  const toS = (x: number, y: number): [number, number] => [
    20 + (x - xMin) / (xMax - xMin) * (W - 40),
    H - 18 - (y / maxY) * (H - 28),
  ]
  const path = pts.map(([x, y], i) => { const [sx, sy] = toS(x, y); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')
  const sub = pts.filter(([x]) => x <= val)
  const [, by] = toS(0, 0)
  const shadeArea = sub.length > 1
    ? `M${toS(sub[0][0], 0)[0]},${by} ${sub.map(([x, y]) => { const [sx, sy] = toS(x, y); return `L${sx.toFixed(1)},${sy.toFixed(1)}` }).join(' ')} L${toS(sub[sub.length - 1][0], 0)[0]},${by} Z`
    : ''
  const [vx] = toS(val, 0)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — אחוזונים</div>
      <div style={STORY}>
        <strong>פסיכומטרי: ממוצע 70, סטיית תקן 10.</strong> הזיזו את הציון ותראו באיזה אחוזון הוא נמצא — כלומר איזה אחוז מהנבחנים השיגו פחות ממנו.
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>הציון שלי: <strong>{val}</strong><input type="range" min={MU - 3 * SD} max={MU + 3 * SD} value={val} onChange={e => setVal(+e.target.value)} style={SLIDER()} /></label>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {shadeArea && <path d={shadeArea} fill="rgba(99,102,241,0.45)" />}
        <path d={path} fill="none" stroke="#3730a3" strokeWidth={2} />
        <line x1={20} y1={H - 18} x2={W - 20} y2={H - 18} stroke="#9ca3af" strokeWidth={1} />
        <line x1={vx} y1={6} x2={vx} y2={H - 18} stroke="#ef4444" strokeWidth={2} />
        {[40, 50, 60, 70, 80, 90, 100].map(v => { const [sx] = toS(v, 0); return <text key={v} x={sx} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">{v}</text> })}
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE()}>ציון Z = {z.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(99,102,241,0.15)', color: '#3730a3' })}>אחוזון {pct.toFixed(0)}</span>
        <span style={{ fontSize: 11, color: '#6b7280', marginRight: 6 }}>{(100 - pct).toFixed(0)}% השיגו יותר ממך</span>
      </div>
    </div>
  )
}

// ── 19. Combinatorics — תמורות וצירופים ──────────────────────────────────────
// Code-point split so emojis stay intact (.split('') breaks surrogate pairs
// and would render only half the fruit).
const FRUIT_POOL = Array.from('🍎🍌🍇🍊🥝🍓🍑🍒🥭🍍')

export function CombinatoricsVisual() {
  const [n, setN] = useState(5)
  const [k, setK] = useState(3)
  const [mode, setMode] = useState<'P' | 'C'>('P')
  const result = mode === 'P' ? factorial(n) / factorial(n - k) : binomCoeff(n, k)
  const pool = FRUIT_POOL.slice(0, n)
  const picked = pool.slice(0, k)
  const fruitWord = k === 1 ? 'פרי אחד' : `${k} פירות`
  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — תמורות וצירופים</div>
      <div style={STORY}>
        <strong>בחירת {fruitWord} מתוך {n} זמינים.</strong> בתמורות הסדר חשוב (תפוח-בננה ≠ בננה-תפוח). בצירופים הסדר לא חשוב — לוקחים את אותו "סל".
      </div>
      <div style={ROW}>
        <label style={LABEL_STYLE}>כמה זמינים n: <strong>{n}</strong><input type="range" min={2} max={10} value={n} onChange={e => { const nv = +e.target.value; setN(nv); if (k > nv) setK(nv) }} style={SLIDER()} /></label>
        <label style={LABEL_STYLE}>בוחרים k: <strong>{k}</strong><input type="range" min={1} max={n} value={k} onChange={e => setK(+e.target.value)} style={SLIDER('#f59e0b')} /></label>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <button onClick={() => setMode('P')} style={{
          background: mode === 'P' ? ACCENT : 'rgba(99,102,241,0.1)', color: mode === 'P' ? '#fff' : ACCENT,
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>תמורה P(n,k) — הסדר חשוב</button>
        <button onClick={() => setMode('C')} style={{
          background: mode === 'C' ? ACCENT : 'rgba(99,102,241,0.1)', color: mode === 'C' ? '#fff' : ACCENT,
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>צירוף C(n,k) — הסדר לא משנה</button>
      </div>
      {/* Pool — all n fruits available */}
      <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, textAlign: 'right' }}>📦 הפירות הזמינים (n = {n}):</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {pool.map((f, i) => (
            <div key={i} style={{
              fontSize: 28, lineHeight: 1, padding: '4px 6px',
              background: i < k ? 'rgba(245,158,11,0.18)' : 'rgba(99,102,241,0.06)',
              border: `2px solid ${i < k ? '#f59e0b' : 'rgba(99,102,241,0.18)'}`,
              borderRadius: 10, opacity: i < k ? 1 : 0.55, transition: 'all 0.18s',
            }}>{f}</div>
          ))}
        </div>
      </div>
      {/* Picked — k highlighted */}
      <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px dashed rgba(245,158,11,0.45)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#92400e', marginBottom: 6, textAlign: 'right' }}>🛒 הסל שלך (k = {k}):</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', minHeight: 36 }}>
          {picked.map((f, i) => (
            <div key={i} style={{ fontSize: 28, lineHeight: 1, padding: '4px 6px' }}>{f}</div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '14px 8px', background: 'rgba(99,102,241,0.12)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>מספר אפשרויות:</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT }}>{result.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
          {mode === 'P'
            ? `n!/(n-k)! = ${n}!/${n - k}! = ${result}`
            : `n!/(k!·(n-k)!) = ${n}!/(${k}!·${n - k}!) = ${result}`}
        </div>
      </div>
    </div>
  )
}

// ── 20. Discrete RV — חישוב E(X) ─────────────────────────────────────────────
export function DiscreteRVVisual() {
  const [probs, setProbs] = useState([0.1, 0.2, 0.3, 0.25, 0.15])
  const VALUES = [1, 2, 3, 4, 5]
  const total = probs.reduce((s, p) => s + p, 0)
  const norm = probs.map(p => p / total)
  const ex = VALUES.reduce((s, x, i) => s + x * norm[i], 0)
  const ex2 = VALUES.reduce((s, x, i) => s + x * x * norm[i], 0)
  const variance = ex2 - ex * ex
  const W = 360, H = 130, PAD = 20
  const barW = (W - PAD * 2) / VALUES.length - 8
  const maxP = Math.max(...norm)

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — תוחלת של משתנה מקרי בדיד</div>
      <div style={STORY}>
        <strong>הגרלה: זוכים בסכום של 1-5 ש"ח.</strong> כל סכום עם הסתברות אחרת. התוחלת E(X) היא הזכייה הממוצעת לטווח ארוך — שווה לסכום השקול של כל הזכיות לפי ההסתברות.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' }}>
        {VALUES.map((v, i) => (
          <div key={v} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>{v}₪: {(norm[i] * 100).toFixed(0)}%</div>
            <input type="range" min={0.05} max={0.6} step={0.05} value={probs[i]}
              onChange={e => setProbs(prev => prev.map((p, j) => j === i ? +e.target.value : p))}
              style={SLIDER()} />
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={PAD} y1={H - 22} x2={W - PAD} y2={H - 22} stroke="#d1d5db" strokeWidth={1} />
        {VALUES.map((v, i) => {
          const x = PAD + i * ((W - PAD * 2) / VALUES.length) + 4
          const bh = (norm[i] / maxP) * (H - 36)
          return <g key={v}>
            <rect x={x} y={H - 22 - bh} width={barW} height={bh} fill="rgba(99,102,241,0.7)" rx={3} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="#374151">{v}</text>
            <text x={x + barW / 2} y={H - 24 - bh} textAnchor="middle" fontSize={10} fill="#6b7280">{(norm[i] * 100).toFixed(0)}%</text>
          </g>
        })}
        {(() => {
          const exX = PAD + ((ex - 1) / 4) * (W - PAD * 2 - barW) + barW / 2 + 4
          return <g>
            <line x1={exX} y1={14} x2={exX} y2={H - 22} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,3" />
            <text x={exX} y={11} textAnchor="middle" fontSize={9} fill="#b91c1c" fontWeight="bold">E(X)</text>
          </g>
        })()}
      </svg>
      <div style={{ marginTop: 4 }}>
        <span style={BADGE({ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' })}>E(X) = {ex.toFixed(2)} ₪</span>
        <span style={BADGE()}>V(X) = {variance.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>σ = {Math.sqrt(variance).toFixed(2)}</span>
      </div>
    </div>
  )
}

// ── 21. Spearman rank correlation ────────────────────────────────────────────
const SPEAR_PTS: [number, number][] = [[10, 5], [25, 8], [40, 15], [55, 22], [70, 30], [85, 50], [100, 200]]

export function SpearmanVisual() {
  const xs = SPEAR_PTS.map(p => p[0])
  const ys = SPEAR_PTS.map(p => p[1])
  const rxs = rank(xs)
  const rys = rank(ys)
  const r = pearsonR(xs, ys)
  const rs = pearsonR(rxs, rys)
  const W = 240, H = 170, PAD = 26

  const plot = (xData: number[], yData: number[], label: string) => {
    const xMin = Math.min(...xData), xMax = Math.max(...xData)
    const yMin = Math.min(...yData), yMax = Math.max(...yData)
    const toS = (x: number, y: number): [number, number] => [
      PAD + (x - xMin) / (xMax - xMin || 1) * (W - PAD * 2),
      H - PAD - (y - yMin) / (yMax - yMin || 1) * (H - PAD * 2),
    ]
    return (
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#3730a3', textAlign: 'center', marginBottom: 4 }}>{label}</div>
        <svg width={W} height={H} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 8 }}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          <line x1={PAD} y1={PAD - 6} x2={PAD} y2={H - PAD} stroke="#9ca3af" strokeWidth={1} />
          {xData.map((x, i) => { const [sx, sy] = toS(x, yData[i]); return <circle key={i} cx={sx} cy={sy} r={5} fill="rgba(99,102,241,0.8)" stroke="#fff" strokeWidth={1.5} /> })}
        </svg>
      </div>
    )
  }

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מתאם ספירמן (דירוג)</div>
      <div style={STORY}>
        <strong>קשר לא ליניארי בין שני משתנים.</strong> פירסון (r) רואה רק קשר ליניארי. ספירמן (rs) עובד על דירוגים — לכן תופס גם קשר מונוטוני (תמיד עולה) שאינו בקו ישר.
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {plot(xs, ys, 'נתונים גולמיים')}
        {plot(rxs, rys, 'דירוגים')}
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={BADGE()}>פירסון r = {r.toFixed(3)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.1)', color: '#065f46' })}>ספירמן rs = {rs.toFixed(3)}</span>
      </div>
    </div>
  )
}

// ── 22. Cramér's V — טבלת מצרף ───────────────────────────────────────────────
export function CramerVisual() {
  // Smoking × Disease toy table
  const [a11, setA11] = useState(40) // smoke + sick
  const [a12, setA12] = useState(10) // smoke + healthy
  const [a21, setA21] = useState(15) // non-smoke + sick
  const [a22, setA22] = useState(35) // non-smoke + healthy
  const cells = [[a11, a12], [a21, a22]]
  const N = a11 + a12 + a21 + a22 || 1
  const rowSums = [a11 + a12, a21 + a22]
  const colSums = [a11 + a21, a12 + a22]
  let chi2 = 0
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const exp = (rowSums[i] * colSums[j]) / N
    if (exp > 0) chi2 += (cells[i][j] - exp) ** 2 / exp
  }
  const V = Math.sqrt(chi2 / (N * Math.min(1, 1))) // for 2x2: V = √(χ²/N)
  const setters = [[setA11, setA12], [setA21, setA22]]
  const labels = [['מעשנים+חולים', 'מעשנים+בריאים'], ['לא מעשנים+חולים', 'לא מעשנים+בריאים']]

  return (
    <div style={WRAP}>
      <div style={CAPTION}>🎯 ויזואליזציה — מקדם קרמר V</div>
      <div style={STORY}>
        <strong>מחקר עישון מול מחלה.</strong> טבלת 2×2 בודקת אם יש קשר בין שני משתנים קטגוריאליים. V = 0 — אין קשר. V = 1 — קשר מושלם.
      </div>
      <table style={{ width: '100%', fontSize: 13, textAlign: 'center', borderCollapse: 'collapse', marginBottom: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(99,102,241,0.15)' }}>
            <th style={{ padding: 6 }}></th>
            <th style={{ padding: 6, border: '1px solid rgba(99,102,241,0.2)' }}>חולים</th>
            <th style={{ padding: 6, border: '1px solid rgba(99,102,241,0.2)' }}>בריאים</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: 6, fontWeight: 700, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>{i === 0 ? 'מעשנים' : 'לא מעשנים'}</td>
              {row.map((v, j) => (
                <td key={j} style={{ padding: 4, border: '1px solid rgba(99,102,241,0.15)' }}>
                  <input type="number" min={0} max={200} value={v}
                    onChange={e => setters[i][j](Math.max(0, +e.target.value))}
                    style={{ width: 50, fontSize: 13, textAlign: 'center', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 4px' }} />
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{labels[i][j]}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <span style={BADGE()}>N = {N}</span>
        <span style={BADGE({ background: 'rgba(245,158,11,0.12)', color: '#92400e' })}>χ² = {chi2.toFixed(2)}</span>
        <span style={BADGE({ background: 'rgba(16,185,129,0.12)', color: '#065f46' })}>V = {V.toFixed(3)}</span>
        <span style={{ fontSize: 11, color: '#6b7280', marginRight: 6 }}>
          {V < 0.1 ? '(קשר זניח)' : V < 0.3 ? '(קשר חלש)' : V < 0.5 ? '(קשר בינוני)' : '(קשר חזק)'}
        </span>
      </div>
    </div>
  )
}

// ── Topic → visual map ────────────────────────────────────────────────────────
export const TOPIC_VISUALS: Record<string, React.FC> = {
  // existing topics
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
  // new venn-variant slide ids
  'venn-independent': VennIndependentVisual,
  'venn-disjoint': VennDisjointVisual,
  'venn-dependent': VennDependentVisual,
  // newly covered topics
  'intro': IntroVisual,
  'variable-types': VariableTypesVisual,
  'data-presentation': DataPresentationVisual,
  'distribution-shapes': DistributionShapesVisual,
  'weighted-combined': WeightedCombinedVisual,
  'observation-changes': ObservationChangesVisual,
  'linear-transformations': LinearTransformationsVisual,
  'percentiles': PercentilesVisual,
  'combinatorics': CombinatoricsVisual,
  'discrete-rv': DiscreteRVVisual,
  'pearson': CorrelationVisual, // pearson r — same visual
  'spearman': SpearmanVisual,
  'cramer': CramerVisual,
}
