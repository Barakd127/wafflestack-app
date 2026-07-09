/**
 * PValueInteractive — bell curve under H0. Draggable test statistic z*.
 * Shade two-tail or one-tail rejection region. Live p-value via Phi(z).
 */
import { useRef, useState, useEffect } from 'react'
import { GC, graphCardStyle, graphTitleStyle, graphSubtitleStyle } from './graphTheme'

const W = 640, H = 320, PAD = 50
const X0 = PAD, X1 = W - PAD, Y0 = PAD, Y1 = H - 80

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
const Phi = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804 * Math.exp(-z * z / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z > 0 ? 1 - p : p
}

export default function PValueInteractive() {
  const [zStat, setZStat] = useState(1.96)
  const [twoTail, setTwoTail] = useState(true)
  const [drag, setDrag] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const xMin = -4, xMax = 4
  const toPx = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0)
  const fromPx = (p: number) => xMin + ((p - X0) / (X1 - X0)) * (xMax - xMin)
  const yAt = (z: number) => Y1 - phi(z) / 0.4 * (Y1 - Y0)

  const path = (() => {
    const pts: string[] = []
    for (let p = X0; p <= X1; p += 2) pts.push(`${p},${yAt(fromPx(p))}`)
    return `M ${pts.join(' L ')}`
  })()

  const shadeFor = (a: number, b: number) => {
    const pts: string[] = [`${toPx(a)},${Y1}`]
    for (let v = a; v <= b; v += (b - a) / 80) pts.push(`${toPx(v)},${yAt(v)}`)
    pts.push(`${toPx(b)},${Y1}`)
    return `M ${pts.join(' L ')} Z`
  }

  const absZ = Math.abs(zStat)
  const pOne = 1 - Phi(absZ)
  const p = twoTail ? 2 * pOne : pOne

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    setZStat(Math.round(Math.max(xMin, Math.min(xMax, fromPx(px))) * 100) / 100)
  }

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('p-formula')
    if (k && el) k.render(`p = ${p.toFixed(4)}, \\quad z^* = ${zStat.toFixed(2)}`, el, { throwOnError: false })
  }, [p, zStat])

  return (
    <div dir="rtl" style={{ ...graphCardStyle }}>
      <h3 style={graphTitleStyle}>מה הסיכוי לקבל תוצאה קיצונית כזו אם השערת האפס נכונה?</h3>
      <p style={graphSubtitleStyle}>העקומה מתארת את התוצאות האפשריות אם השערת האפס (H₀) נכונה. גררו את קו הבדיקה z* ושימו לב לשטח האדום — זהו ערך ה-p, ההסתברות לתוצאה קיצונית כמו שלכם או יותר. הכפתור מחליף בין מבחן דו-זנבי (שני הצדדים) לחד-זנבי (צד אחד).</p>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onPointerMove={onMove} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}
        style={{ touchAction: 'none' }}>
        {twoTail && <path d={shadeFor(xMin, -absZ)} fill="rgba(179,58,58,0.35)" />}
        <path d={shadeFor(absZ, xMax)} fill="rgba(179,58,58,0.35)" />
        <path d={path} stroke={GC.gold} strokeWidth={2.5} fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={GC.axis} />
        <line x1={toPx(zStat)} y1={Y0} x2={toPx(zStat)} y2={Y1} stroke={GC.ink} strokeWidth={2} />
        <rect x={toPx(zStat) - 8} y={Y1 - 12} width={16} height={24} fill={GC.gold}
          onPointerDown={e => { setDrag(true); (e.target as Element).setPointerCapture(e.pointerId) }}
          style={{ cursor: 'ew-resize' }} />
        <text x={toPx(zStat)} y={Y1 + 30} fill={GC.goldText} fontSize={13} textAnchor="middle" fontWeight={700}>z* = {zStat.toFixed(2)}</text>
      </svg>
      <div id="p-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <button onClick={() => setTwoTail(!twoTail)} style={{ background: twoTail ? GC.gold : 'rgba(31,62,108,0.1)', color: GC.ink, border: '1px solid rgba(31,62,108,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: twoTail ? 700 : 400 }}>{twoTail ? 'מבחן דו-זנבי' : 'מבחן חד-זנבי'}</button>
    </div>
  )
}
