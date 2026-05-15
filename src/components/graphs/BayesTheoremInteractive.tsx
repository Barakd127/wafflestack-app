/**
 * BayesTheoremInteractive — sliders for prior P(H), likelihood P(E|H), and
 * P(E|¬H). Computes posterior P(H|E) via Bayes. Renders a 2-level probability
 * tree and a comparison bar for prior vs posterior.
 */
import { useState, useEffect, useMemo } from 'react'

const W = 640, H = 360, PAD = 24

export default function BayesTheoremInteractive() {
  const [prior, setPrior] = useState(0.1)            // P(H)
  const [likely, setLikely] = useState(0.9)          // P(E|H)
  const [fp, setFp] = useState(0.1)                  // P(E|¬H)

  const { pE, post, pHE, pNHE } = useMemo(() => {
    const pHE  = prior * likely
    const pNHE = (1 - prior) * fp
    const pE   = pHE + pNHE
    const post = pE > 0 ? pHE / pE : 0
    return { pE, post, pHE, pNHE }
  }, [prior, likely, fp])

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('bayes-formula')
    if (k && el) {
      k.render(
        `P(H|E) = \\frac{P(E|H)\\,P(H)}{P(E)} = \\frac{${likely.toFixed(2)} \\cdot ${prior.toFixed(2)}}{${pE.toFixed(3)}} = ${post.toFixed(3)}`,
        el, { throwOnError: false },
      )
    }
  }, [prior, likely, fp, pE, post])

  // Tree geometry
  const rootX = 90, rootY = 60
  const lvl1X = 280
  const lvl2X = 480
  const yH = 30, yNH = 200
  const yEH = yH - 30, yNEH = yH + 60
  const yENH = yNH - 30, yNENH = yNH + 60

  const branch = (x1: number, y1: number, x2: number, y2: number, color: string) =>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} />

  return (
    <div dir="rtl" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>משפט בייס — Bayes' Theorem</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
        הזז את ההסתברות הקודמת P(H), את הסבירות P(E|H), ואת התראת השווא P(E|¬H). הפוסטריור P(H|E) מחושב חי.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {/* Tree */}
        {branch(rootX, rootY + 80, lvl1X, yH + 30, '#FFD700')}
        {branch(rootX, rootY + 80, lvl1X, yNH + 30, '#60a5fa')}
        {branch(lvl1X + 40, yH + 30, lvl2X, yEH + 12, '#FFD700')}
        {branch(lvl1X + 40, yH + 30, lvl2X, yNEH + 12, '#FFD700')}
        {branch(lvl1X + 40, yNH + 30, lvl2X, yENH + 12, '#60a5fa')}
        {branch(lvl1X + 40, yNH + 30, lvl2X, yNENH + 12, '#60a5fa')}

        {/* Root */}
        <text x={rootX} y={rootY + 78} fill="#fff" fontSize={13} fontWeight={700} textAnchor="end">התחלה</text>

        {/* Level 1 */}
        <rect x={lvl1X} y={yH} width={80} height={36} rx={6} fill="rgba(255,215,0,0.18)" stroke="#FFD700" />
        <text x={lvl1X + 40} y={yH + 16} fill="#FFD700" fontSize={12} textAnchor="middle">H</text>
        <text x={lvl1X + 40} y={yH + 30} fill="#fff" fontSize={11} textAnchor="middle">{prior.toFixed(2)}</text>

        <rect x={lvl1X} y={yNH} width={80} height={36} rx={6} fill="rgba(96,165,250,0.18)" stroke="#60a5fa" />
        <text x={lvl1X + 40} y={yNH + 16} fill="#60a5fa" fontSize={12} textAnchor="middle">¬H</text>
        <text x={lvl1X + 40} y={yNH + 30} fill="#fff" fontSize={11} textAnchor="middle">{(1 - prior).toFixed(2)}</text>

        {/* Level 2 */}
        <text x={lvl2X} y={yEH + 12} fill="#FFD700" fontSize={11}>E · {pHE.toFixed(3)}</text>
        <text x={lvl2X} y={yNEH + 12} fill="rgba(255,255,255,0.6)" fontSize={11}>¬E · {(prior * (1 - likely)).toFixed(3)}</text>
        <text x={lvl2X} y={yENH + 12} fill="#60a5fa" fontSize={11}>E · {pNHE.toFixed(3)}</text>
        <text x={lvl2X} y={yNENH + 12} fill="rgba(255,255,255,0.6)" fontSize={11}>¬E · {((1 - prior) * (1 - fp)).toFixed(3)}</text>

        {/* Posterior bar */}
        <text x={PAD} y={H - 60} fill="rgba(255,255,255,0.8)" fontSize={12}>Prior P(H)</text>
        <rect x={PAD + 90} y={H - 72} width={400 * prior} height={16} fill="#94a3b8" />
        <rect x={PAD + 90} y={H - 72} width={400} height={16} fill="none" stroke="rgba(255,255,255,0.3)" />
        <text x={PAD + 90 + 405} y={H - 60} fill="#fff" fontSize={12}>{prior.toFixed(3)}</text>

        <text x={PAD} y={H - 30} fill="#FFD700" fontSize={12} fontWeight={700}>Posterior P(H|E)</text>
        <rect x={PAD + 90} y={H - 42} width={400 * post} height={16} fill="#FFD700" />
        <rect x={PAD + 90} y={H - 42} width={400} height={16} fill="none" stroke="rgba(255,255,255,0.3)" />
        <text x={PAD + 90 + 405} y={H - 30} fill="#FFD700" fontSize={12} fontWeight={700}>{post.toFixed(3)}</text>
      </svg>

      <div id="bayes-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />

      <SliderRow label={`P(H) prior = ${prior.toFixed(2)}`} value={prior} min={0.01} max={0.99} step={0.01} onChange={setPrior} />
      <SliderRow label={`P(E|H) likelihood = ${likely.toFixed(2)}`} value={likely} min={0.01} max={0.99} step={0.01} onChange={setLikely} />
      <SliderRow label={`P(E|¬H) false-alarm = ${fp.toFixed(2)}`} value={fp} min={0.01} max={0.99} step={0.01} onChange={setFp} />

      <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13 }}>
        P(E) = P(E|H)·P(H) + P(E|¬H)·P(¬H) = <b>{pE.toFixed(3)}</b>
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <label style={{ fontSize: 13, opacity: 0.85, minWidth: 200 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  )
}
