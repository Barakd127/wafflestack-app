/**
 * NormalDistributionInteractive — bell curve with μ and σ sliders.
 * Two draggable vertical lines z1, z2; shade area between, compute
 * P(z1 ≤ Z ≤ z2) via Simpson's rule over 200 samples.
 */
import { useRef, useState, useEffect } from 'react'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
// Simpson's 1/3 rule integration from a to b with N (even) intervals
const simpson = (a: number, b: number, N = 200) => {
  const h = (b - a) / N
  let s = phi(a) + phi(b)
  for (let i = 1; i < N; i++) s += phi(a + i * h) * (i % 2 === 0 ? 2 : 4)
  return (h / 3) * s
}

export default function NormalDistributionInteractive() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [z1, setZ1] = useState(-1)
  const [z2, setZ2] = useState(1)
  const [drag, setDrag] = useState<1 | 2 | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const fromPx = (p: number) => xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
  const yAt = (v: number) => Y1 - phi((v - mu) / sigma) / 0.4 * (Y1 - Y0)

  const path = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) pts.push(`${p},${yAt(fromPx(p))}`)
    return `M ${pts.join(' L ')}`
  })()
  const shade = (() => {
    const pts: string[] = [`${toPx(z1)},${Y1}`]
    for (let v = z1; v <= z2; v += (z2 - z1) / 100) pts.push(`${toPx(v)},${yAt(v)}`)
    pts.push(`${toPx(z2)},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  })()

  // Probability via standardized integration
  const lo = (z1 - mu) / sigma, hi = (z2 - mu) / sigma
  const prob = simpson(lo, hi)

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const v = Math.max(xMin, Math.min(xMax, fromPx(px)))
    if (drag === 1) setZ1(Math.round(v * 10) / 10)
    else setZ2(Math.round(v * 10) / 10)
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('normal-formula')
    if (k && el) k.render(`P(${z1.toFixed(1)} \\le X \\le ${z2.toFixed(1)}) = ${prob.toFixed(4)}`, el, { throwOnError: false })
  }, [prob, z1, z2])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>התפלגות נורמלית — גרור גבולות</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>גרור את הקווים הצהובים לצדדים וצפה בהסתברות {`P(z₁ ≤ X ≤ z₂)`} מתעדכנת בזמן אמת.</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        style={{ touchAction: 'none' }}>
        <path d={shade} fill="rgba(255,215,0,0.3)" />
        <path d={path} stroke="#FFD700" strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.4)" />
        {[z1, z2].map((zv, i) => (
          <g key={i}>
            <line x1={toPx(zv)} y1={Y0} x2={toPx(zv)} y2={Y1} stroke="#fff" strokeWidth={2} />
            <rect x={toPx(zv) - 8} y={Y1 - 12} width={16} height={24} fill="#FFD700"
              onPointerDown={e => { setDrag((i + 1) as 1 | 2); (e.target as Element).setPointerCapture(e.pointerId) }}
              style={{ cursor: 'ew-resize' }} />
            <text x={toPx(zv)} y={Y1 + 30} fill="#FFD700" fontSize={12} textAnchor="middle" fontWeight={700}>{zv.toFixed(1)}</text>
          </g>
        ))}
      </svg>
      <div id="normal-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>μ: {mu}
          <input type="range" min={-5} max={5} step={0.1} value={mu} onChange={e => setMu(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ fontSize: 13 }}>σ: {sigma}
          <input type="range" min={0.5} max={3} step={0.1} value={sigma} onChange={e => setSigma(+e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
    </div>
  )
}
