/**
 * SamplingInteractive — population (200 dots), random sample of n via button.
 * Highlights sampled dots, shows sample mean vs population mean.
 */
import { useState, useMemo, useEffect } from 'react'

const W = 640, H = 320, PAD = 30

const seedrand = (seed: number) => {
  let s = seed
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

export default function SamplingInteractive() {
  const [n, setN] = useState(20)
  const [seed, setSeed] = useState(1)

  const pop = useMemo(() => {
    const r = seedrand(42)
    const arr: { x: number; y: number; value: number }[] = []
    for (let i = 0; i < 200; i++) arr.push({ x: r() * (W - 2 * PAD) + PAD, y: r() * (H - 80) + PAD, value: r() * 100 })
    return arr
  }, [])
  const popMean = pop.reduce((a, b) => a + b.value, 0) / pop.length

  const sampleIdx = useMemo(() => {
    const r = seedrand(seed * 7 + 3)
    const idx = new Set<number>()
    while (idx.size < n) idx.add(Math.floor(r() * 200))
    return idx
  }, [n, seed])

  const sampleMean = useMemo(() => {
    let sum = 0
    for (const i of sampleIdx) sum += pop[i].value
    return sum / sampleIdx.size
  }, [sampleIdx, pop])

  useEffect(() => {
    const k = (window as { katex?: { render: (s: string, el: HTMLElement, o?: object) => void } }).katex
    const el = document.getElementById('samp-formula')
    if (k && el) k.render(`\\mu_{\\text{אוכל}} = ${popMean.toFixed(2)}, \\quad \\bar{x}_{\\text{מדגם}} = ${sampleMean.toFixed(2)}, \\quad |\\bar{x} - \\mu| = ${Math.abs(sampleMean - popMean).toFixed(2)}`, el, { throwOnError: false })
  }, [popMean, sampleMean])

  return (
    <div dir="rtl" style={{ background: 'rgba(31,62,108,0.92)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, marginBottom: 4 }}>מדגם (Sampling) — אוכלוסיה ומדגם אקראי</h3>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>200 נקודות באוכלוסיה. גרור n + לחץ "דגום מחדש" כדי לראות איך הממוצע במדגם מתקרב לממוצע האוכלוסיה כש-n גדל.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {pop.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={sampleIdx.has(i) ? 6 : 3}
            fill={sampleIdx.has(i) ? '#FFD700' : 'rgba(96,165,250,0.4)'}
            stroke={sampleIdx.has(i) ? '#fff' : 'none'} strokeWidth={1.5} />
        ))}
      </svg>
      <div id="samp-formula" style={{ textAlign: 'center', margin: '8px 0', minHeight: 28 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <label style={{ flex: 1, fontSize: 13 }}>n: {n}<input type="range" min={5} max={150} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} /></label>
        <button onClick={() => setSeed(s => s + 1)} style={{ background: '#FFD700', color: '#0B1B3E', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>דגום מחדש</button>
      </div>
    </div>
  )
}
