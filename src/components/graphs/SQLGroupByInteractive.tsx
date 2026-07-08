/**
 * SQLGroupByInteractive — boxes sorted into bins. Pick an aggregate function
 * (COUNT/AVG/SUM/MAX) and watch each category bin report ONE summary row,
 * drawn as gold bars. A HAVING slider then throws away whole bins.
 * Teaches: GROUP BY collapses rows; WHERE filters boxes, HAVING filters bins.
 */
import { useMemo, useState } from 'react'

const PRODUCTS = [
  { name: 'Laptop', category: 'Tech', price: 1200, stock: 14 },
  { name: 'Headphones', category: 'Tech', price: 150, stock: 80 },
  { name: 'Monitor', category: 'Tech', price: 400, stock: 50 },
  { name: 'Coffee Beans', category: 'Food', price: 18, stock: 200 },
  { name: 'Olive Oil', category: 'Food', price: 25, stock: 120 },
  { name: 'Chocolate', category: 'Food', price: 8, stock: 500 },
  { name: 'Desk Chair', category: 'Furniture', price: 320, stock: 35 },
  { name: 'Bookshelf', category: 'Furniture', price: 180, stock: 22 },
]
type Fn = 'COUNT(*)' | 'AVG(price)' | 'SUM(stock)' | 'MAX(price)'
const FNS: Fn[] = ['COUNT(*)', 'AVG(price)', 'SUM(stock)', 'MAX(price)']
const BAR_COLORS = ['#D4A017', '#7CB7F8', '#67C29E']

export default function SQLGroupByInteractive() {
  const [fn, setFn] = useState<Fn>('COUNT(*)')
  const [having, setHaving] = useState(0)

  const bins = useMemo(() => {
    const map = new Map<string, typeof PRODUCTS>()
    PRODUCTS.forEach(p => map.set(p.category, [...(map.get(p.category) || []), p]))
    return [...map.entries()].map(([cat, ps]) => {
      const value =
        fn === 'COUNT(*)' ? ps.length :
        fn === 'AVG(price)' ? Math.round((ps.reduce((s, p) => s + p.price, 0) / ps.length) * 10) / 10 :
        fn === 'SUM(stock)' ? ps.reduce((s, p) => s + p.stock, 0) :
        Math.max(...ps.map(p => p.price))
      return { cat, count: ps.length, value }
    })
  }, [fn])

  const kept = bins.filter(b => b.value >= having)
  const maxVal = Math.max(...bins.map(b => b.value), 1)
  const maxHaving = Math.ceil(maxVal)

  const W = 560, H = 230, base = 180, bw = 110, gap = 60, x0 = 70

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)', fontFamily: 'Rubik, sans-serif' }}>
      <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>GROUP BY — קופסאות לתאים</h3>
      <p style={{ fontSize: 14, opacity: 0.75, margin: '0 0 12px' }}>8 קופסאות (מוצרים) נכנסות ל-3 תאים (קטגוריות). כל תא מדווח שורת סיכום אחת. הסליידר = HAVING: זורק תאים שלמים.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        {FNS.map(f => (
          <button key={f} onClick={() => { setFn(f); setHaving(0) }} style={{
            padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Consolas, monospace', fontSize: 13, fontWeight: 700,
            background: fn === f ? '#D4A017' : 'rgba(255,255,255,0.08)',
            color: fn === f ? '#1F3E6C' : 'var(--sh-text-dark)',
            border: `1px solid ${fn === f ? '#D4A017' : 'rgba(255,255,255,0.2)'}`,
          }}>{f}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="aggregate bars">
        <line x1={30} y1={base} x2={W - 20} y2={base} stroke="rgba(31,62,108,0.4)" />
        {bins.map((b, i) => {
          const h = Math.max(8, (b.value / maxVal) * 130)
          const x = x0 + i * (bw + gap)
          const dropped = b.value < having
          return (
            <g key={b.cat} opacity={dropped ? 0.25 : 1}>
              <rect x={x} y={base - h} width={bw} height={h} rx={6} fill={BAR_COLORS[i % 3]} />
              <text x={x + bw / 2} y={base - h - 8} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--sh-text-dark)">{b.value}</text>
              <text x={x + bw / 2} y={base + 18} textAnchor="middle" fontSize={14} fill="var(--sh-text-dark)">{b.cat}</text>
              <text x={x + bw / 2} y={base + 34} textAnchor="middle" fontSize={11} fill="var(--sh-text-dark)" opacity={0.6}>{b.count} קופסאות</text>
              {dropped && <text x={x + bw / 2} y={base - h / 2} textAnchor="middle" fontSize={20}>🗑️</text>}
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '6px 0 10px' }}>
        <label htmlFor="sqlgb-having" style={{ fontSize: 14, fontFamily: 'Consolas, monospace' }} dir="ltr">HAVING {fn} &ge; {having}</label>
        <input id="sqlgb-having" type="range" min={0} max={maxHaving} value={Math.min(having, maxHaving)} onChange={e => setHaving(Number(e.target.value))} style={{ width: 'min(240px, 60%)' }} />
        <span style={{ fontSize: 14, color: '#D4A017', fontWeight: 600 }}>{kept.length} מתוך {bins.length} תאים שרדו</span>
      </div>

      <div dir="ltr" style={{ fontFamily: 'Consolas, monospace', fontSize: 13, background: 'rgba(31,62,108,0.9)', color: '#e8ecf1', borderRadius: 10, padding: '8px 12px', overflowX: 'auto' }}>
        SELECT category, {fn} FROM products GROUP BY category{having > 0 ? ` HAVING ${fn} >= ${having}` : ''};
      </div>
    </div>
  )
}
