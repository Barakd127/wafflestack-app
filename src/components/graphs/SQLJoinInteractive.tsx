/**
 * SQLJoinInteractive — two clerks compare clipboards. Tabs pick the join
 * type (INNER/LEFT/RIGHT/FULL); a Venn diagram and the live result table
 * update, showing exactly which unmatched rows survive and where the NULLs
 * appear. Teaches: join type = policy for rows with no partner.
 */
import { useState } from 'react'

type JoinType = 'inner' | 'left' | 'right' | 'full'
const CUSTOMERS = [
  { id: 1, customer: 'אבי' },
  { id: 2, customer: 'דנה' },
  { id: 3, customer: 'נועה' },
]
const ORDERS = [
  { id: 2, order: 'Laptop' },
  { id: 2, order: 'Monitor' },
  { id: 4, order: 'Chair' },
]
const META: Record<JoinType, { kw: string; desc: string; keepL: boolean; keepR: boolean }> = {
  inner: { kw: 'INNER JOIN', keepL: false, keepR: false, desc: 'רק שורות עם התאמה בשני הלוחות. לקוחות בלי הזמנות והזמנות יתומות — נעלמים.' },
  left:  { kw: 'LEFT JOIN',  keepL: true,  keepR: false, desc: 'כל הלקוחות נשמרים; מי שלא הזמין מקבל NULL בעמודת ההזמנה.' },
  right: { kw: 'RIGHT JOIN', keepL: false, keepR: true,  desc: 'כל ההזמנות נשמרות; הזמנה 4 בלי לקוח מוכר מקבלת NULL בעמודת הלקוח.' },
  full:  { kw: 'FULL OUTER JOIN', keepL: true, keepR: true, desc: 'הכל משני הלוחות; NULL בכל מקום שאין בן-זוג.' },
}

function MiniTable({ title, cols, rows }: { title: string; cols: string[]; rows: (string | number | null)[][] }) {
  return (
    <div style={{ flex: '1 1 180px', minWidth: 170 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div dir="ltr" style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
          <thead><tr>{cols.map(c => <th key={c} style={{ background: 'rgba(31,62,108,0.85)', color: '#fff', textAlign: 'left', padding: '4px 8px' }}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{r.map((cell, j) => (
                <td key={j} style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,0.12)', fontStyle: cell === null ? 'italic' : 'normal', color: cell === null ? '#D4A017' : 'inherit' }}>
                  {cell === null ? 'NULL' : cell}
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SQLJoinInteractive() {
  const [jt, setJt] = useState<JoinType>('inner')
  const m = META[jt]

  const result: (string | null)[][] = []
  for (const c of CUSTOMERS) {
    const matches = ORDERS.filter(o => o.id === c.id)
    if (matches.length) matches.forEach(o => result.push([c.customer, o.order]))
    else if (m.keepL) result.push([c.customer, null])
  }
  if (m.keepR) ORDERS.filter(o => !CUSTOMERS.some(c => c.id === o.id)).forEach(o => result.push([null, o.order]))

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)', fontFamily: 'Rubik, sans-serif' }}>
      <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>JOIN — שני פקידים משווים לוחות</h3>
      <p style={{ fontSize: 14, opacity: 0.75, margin: '0 0 12px' }}>בחרו סוג חיבור וראו אילו שורות שורדות ואיפה מופיע NULL.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {(Object.keys(META) as JoinType[]).map(t => (
          <button key={t} onClick={() => setJt(t)} style={{
            padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            background: jt === t ? '#D4A017' : 'rgba(255,255,255,0.08)',
            color: jt === t ? '#1F3E6C' : 'var(--sh-text-dark)',
            border: `1px solid ${jt === t ? '#D4A017' : 'rgba(255,255,255,0.2)'}`,
          }}>{META[t].kw.split(' ')[0]}</button>
        ))}
      </div>

      <svg viewBox="0 0 320 130" width="260" height="106" role="img" aria-label="Venn" style={{ display: 'block', margin: '0 auto 8px' }}>
        <circle cx={125} cy={65} r={52} fill="#D4A017" opacity={m.keepL || jt === 'full' ? 0.55 : 0.22} stroke="#1F3E6C" />
        <circle cx={195} cy={65} r={52} fill="#7CB7F8" opacity={m.keepR || jt === 'full' ? 0.55 : 0.22} stroke="#1F3E6C" />
        {/* intersection always included in every join type shown here */}
        <text x={95} y={70} fontSize={12} fill="var(--sh-text-dark)">customers</text>
        <text x={185} y={70} fontSize={12} fill="var(--sh-text-dark)">orders</text>
      </svg>

      <p style={{ fontSize: 14, margin: '0 0 12px' }}>🤝 {m.desc}</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <MiniTable title="customers" cols={['id', 'customer']} rows={CUSTOMERS.map(c => [c.id, c.customer])} />
        <MiniTable title="orders" cols={['id', 'order']} rows={ORDERS.map(o => [o.id, o.order])} />
        <MiniTable title={`תוצאה — ${result.length} שורות`} cols={['customer', 'order']} rows={result} />
      </div>

      <div dir="ltr" style={{ fontFamily: 'Consolas, monospace', fontSize: 13, background: 'rgba(31,62,108,0.9)', color: '#e8ecf1', borderRadius: 10, padding: '8px 12px', overflowX: 'auto' }}>
        SELECT c.customer, o.order FROM customers c {m.kw} orders o ON c.id = o.id;
      </div>
    </div>
  )
}
