/**
 * CombinationsVsPermutationsInteractive — n and r sliders, visualizes
 * arrangements of colored chips. Shows nCr and nPr side-by-side with formulas
 * and explains the order-matters difference visually.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 360
const COLORS = ['#FFD700', '#60a5fa', '#34A853', '#D4A017', '#a855f7', '#FF6B35', '#06b6d4', '#ec4899', '#84cc16', '#94a3b8']

function fact(n: number): number {
  let s = 1
  for (let i = 2; i <= n; i++) s *= i
  return s
}
function nPr(n: number, r: number) { return r > n ? 0 : fact(n) / fact(n - r) }
function nCr(n: number, r: number) { return r > n ? 0 : fact(n) / (fact(r) * fact(n - r)) }

// build first k distinct combinations of size r (lexicographic)
function combos(n: number, r: number, max = 8): number[][] {
  const out: number[][] = []
  const rec = (start: number, cur: number[]) => {
    if (out.length >= max) return
    if (cur.length === r) { out.push(cur.slice()); return }
    for (let i = start; i < n && out.length < max; i++) {
      cur.push(i); rec(i + 1, cur); cur.pop()
    }
  }
  rec(0, [])
  return out
}
// permutations of a combo
function permute(arr: number[], max = 8): number[][] {
  const out: number[][] = []
  const rec = (cur: number[], rest: number[]) => {
    if (out.length >= max) return
    if (rest.length === 0) { out.push(cur.slice()); return }
    for (let i = 0; i < rest.length && out.length < max; i++) {
      const nx = rest.slice(0, i).concat(rest.slice(i + 1))
      cur.push(rest[i]); rec(cur, nx); cur.pop()
    }
  }
  rec([], arr)
  return out
}

export default function CombinationsVsPermutationsInteractive() {
  const [n, setN] = useState(5)
  const [r, setR] = useState(3)
  useEffect(() => { if (r > n) setR(n) }, [n, r])

  const cR = useMemo(() => combos(n, r, 6), [n, r])
  const cPerm = useMemo(() => permute(cR[0] || [], 8), [cR])

  const C = nCr(n, r), P = nPr(n, r)

  useEffect(() => {
    const kk = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const elC = document.getElementById('cnr-formula')
    const elP = document.getElementById('pnr-formula')
    if (kk && elC) kk.render(`\\binom{n}{r} = \\frac{n!}{r!(n-r)!} = \\frac{${n}!}{${r}!\\,${n-r}!} = ${C}`, elC, { throwOnError: false })
    if (kk && elP) kk.render(`{}_nP_r = \\frac{n!}{(n-r)!} = ${P}`, elP, { throwOnError: false })
  }, [n, r, C, P])

  const chip = (idx: number, x: number, y: number) => (
    <g key={`${x}-${y}-${idx}`}>
      <circle cx={x} cy={y} r={11} fill={COLORS[idx % COLORS.length]} stroke="#0B1B3E" strokeWidth={1} />
      <text x={x} y={y + 4} fill="#0B1B3E" fontSize={11} fontWeight={700} textAnchor="middle">{String.fromCharCode(65 + idx)}</text>
    </g>
  )

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>צירופים מול חליפות — Combinations vs Permutations</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>אותם {r} אסימונים — כצירוף (ללא סדר) זה אחד, כחליפות (עם סדר) זה {r}! סדרים.</p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <text x={20} y={30} fill="#FFD700" fontSize={14} fontWeight={700}>nCr — ללא סדר ({Math.min(C, 6)} מתוך {C})</text>
        {cR.map((row, ri) => (
          <g key={`c${ri}`}>
            <rect x={20} y={50 + ri * 30} width={300} height={24} rx={6} fill="rgba(255,215,0,0.08)" stroke="rgba(255,215,0,0.3)" />
            {row.map((v, i) => chip(v, 35 + i * 26, 62 + ri * 30))}
          </g>
        ))}

        <text x={340} y={30} fill="#60a5fa" fontSize={14} fontWeight={700}>nPr — עם סדר ({Math.min(P, 8)} מתוך {P})</text>
        {cPerm.map((row, ri) => (
          <g key={`p${ri}`}>
            <rect x={340} y={50 + ri * 30} width={280} height={24} rx={6} fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.3)" />
            {row.map((v, i) => chip(v, 355 + i * 26, 62 + ri * 30))}
          </g>
        ))}
      </svg>

      <div id="cnr-formula" style={{ textAlign: 'center', margin: '4px 0', minHeight: 24 }} />
      <div id="pnr-formula" style={{ textAlign: 'center', margin: '4px 0', minHeight: 24 }} />

      <Slider label={`n = ${n}`} value={n} min={1} max={10} step={1} onChange={v => setN(Math.round(v))} />
      <Slider label={`r = ${r}`} value={r} min={0} max={n} step={1} onChange={v => setR(Math.round(v))} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-around' }}>
        <span style={{ color: '#FFD700', fontWeight: 700 }}>nCr = {C}</span>
        <span style={{ color: '#60a5fa', fontWeight: 700 }}>nPr = {P}</span>
        <span>יחס = r! = {fact(r)}</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 80 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
