/**
 * ConditionalProbTreeInteractive — two-level probability tree A/¬A → B/¬B.
 * Sliders for P(A), P(B|A), P(B|¬A). Computes joint table, P(B), and the
 * Bayesian inverse P(A|B). Visualizes the tree with proportional branch widths.
 */
import { useState, useEffect, useMemo } from 'react'

const W = 640, H = 340

export default function ConditionalProbTreeInteractive() {
  const [pA, setPA]   = useState(0.4)     // P(A)
  const [pBA, setPBA] = useState(0.7)     // P(B|A)
  const [pBN, setPBN] = useState(0.2)     // P(B|¬A)

  const { pAB, pANB, pNAB, pNANB, pB, pAgB } = useMemo(() => {
    const pAB   = pA * pBA
    const pANB  = pA * (1 - pBA)
    const pNAB  = (1 - pA) * pBN
    const pNANB = (1 - pA) * (1 - pBN)
    const pB    = pAB + pNAB
    const pAgB  = pB > 0 ? pAB / pB : 0
    return { pAB, pANB, pNAB, pNANB, pB, pAgB }
  }, [pA, pBA, pBN])

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('cond-formula')
    if (k && el) {
      k.render(
        `P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{${pAB.toFixed(3)}}{${pB.toFixed(3)}} = ${pAgB.toFixed(3)}`,
        el, { throwOnError: false },
      )
    }
  }, [pAB, pB, pAgB])

  // tree layout
  const ROOT = { x: 70, y: 170 }
  const L1A  = { x: 260, y: 80 }
  const L1NA = { x: 260, y: 260 }
  const L2 = (parent: { x: number, y: number }, dy: number) => ({ x: 470, y: parent.y + dy })
  const lab = (x: number, y: number, t: string, c: string, size = 11) =>
    <text x={x} y={y} fill={c} fontSize={size} fontWeight={600}>{t}</text>

  const widthA = Math.max(1.5, pA * 8)
  const widthNA = Math.max(1.5, (1 - pA) * 8)
  const wBA = Math.max(1.2, pBA * 6)
  const wNBA = Math.max(1.2, (1 - pBA) * 6)
  const wBN = Math.max(1.2, pBN * 6)
  const wNBN = Math.max(1.2, (1 - pBN) * 6)

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>הסתברות מותנית — עץ A → B</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        רוחב הענפים פרופורציוני להסתברות. שלוש המחוונים שולטים בכל ההסתברויות המותנות.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1={ROOT.x} y1={ROOT.y} x2={L1A.x} y2={L1A.y} stroke="#FFD700" strokeWidth={widthA} opacity={0.6} />
        <line x1={ROOT.x} y1={ROOT.y} x2={L1NA.x} y2={L1NA.y} stroke="#60a5fa" strokeWidth={widthNA} opacity={0.6} />

        <line x1={L1A.x + 30} y1={L1A.y} x2={L2(L1A, -40).x} y2={L2(L1A, -40).y} stroke="#FFD700" strokeWidth={wBA} opacity={0.6} />
        <line x1={L1A.x + 30} y1={L1A.y} x2={L2(L1A, 40).x} y2={L2(L1A, 40).y} stroke="rgba(255,215,0,0.4)" strokeWidth={wNBA} opacity={0.6} />

        <line x1={L1NA.x + 30} y1={L1NA.y} x2={L2(L1NA, -40).x} y2={L2(L1NA, -40).y} stroke="#60a5fa" strokeWidth={wBN} opacity={0.6} />
        <line x1={L1NA.x + 30} y1={L1NA.y} x2={L2(L1NA, 40).x} y2={L2(L1NA, 40).y} stroke="rgba(96,165,250,0.4)" strokeWidth={wNBN} opacity={0.6} />

        <circle cx={ROOT.x} cy={ROOT.y} r={6} fill="#fff" />
        {lab(ROOT.x - 22, ROOT.y + 4, '·', '#fff')}

        <rect x={L1A.x} y={L1A.y - 16} width={60} height={32} rx={6} fill="rgba(255,215,0,0.18)" stroke="#FFD700" />
        {lab(L1A.x + 4, L1A.y - 2, `A: ${pA.toFixed(2)}`, '#FFD700')}
        {lab(L1A.x + 4, L1A.y + 12, `P(B|A)=${pBA.toFixed(2)}`, 'rgba(255,255,255,0.7)', 9)}

        <rect x={L1NA.x} y={L1NA.y - 16} width={60} height={32} rx={6} fill="rgba(96,165,250,0.18)" stroke="#60a5fa" />
        {lab(L1NA.x + 4, L1NA.y - 2, `¬A: ${(1 - pA).toFixed(2)}`, '#60a5fa')}
        {lab(L1NA.x + 4, L1NA.y + 12, `P(B|¬A)=${pBN.toFixed(2)}`, 'rgba(255,255,255,0.7)', 9)}

        {lab(L2(L1A, -40).x, L2(L1A, -40).y, `A∩B: ${pAB.toFixed(3)}`, '#FFD700')}
        {lab(L2(L1A, 40).x, L2(L1A, 40).y, `A∩¬B: ${pANB.toFixed(3)}`, 'rgba(255,255,255,0.5)')}
        {lab(L2(L1NA, -40).x, L2(L1NA, -40).y, `¬A∩B: ${pNAB.toFixed(3)}`, '#60a5fa')}
        {lab(L2(L1NA, 40).x, L2(L1NA, 40).y, `¬A∩¬B: ${pNANB.toFixed(3)}`, 'rgba(255,255,255,0.5)')}
      </svg>

      <div id="cond-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <SliderRow label={`P(A) = ${pA.toFixed(2)}`} value={pA} onChange={setPA} />
      <SliderRow label={`P(B|A) = ${pBA.toFixed(2)}`} value={pBA} onChange={setPBA} />
      <SliderRow label={`P(B|¬A) = ${pBN.toFixed(2)}`} value={pBN} onChange={setPBN} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
        <span>P(B) = <b>{pB.toFixed(3)}</b></span>
        <span>P(A∩B) = <b>{pAB.toFixed(3)}</b></span>
        <span style={{ color: '#FFD700' }}>P(A|B) = <b>{pAgB.toFixed(3)}</b></span>
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 160 }}>{label}</label>
      <input type="range" min={0.01} max={0.99} step={0.01} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
