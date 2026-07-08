/**
 * SQLQueryBuilderInteractive — build a SELECT query from dropdowns (WHERE
 * column/operator/value + ORDER BY) and watch the clerk filter a live
 * products table. Teaches: a query is a request slip, not a program — you
 * describe WHAT you want and the result set updates declaratively.
 */
import { useMemo, useState } from 'react'

type Product = { name: string; category: string; price: number; stock: number }
const PRODUCTS: Product[] = [
  { name: 'Laptop',       category: 'Tech',      price: 1200, stock: 14 },
  { name: 'Headphones',   category: 'Tech',      price: 150,  stock: 80 },
  { name: 'Coffee Beans', category: 'Food',      price: 18,   stock: 200 },
  { name: 'Olive Oil',    category: 'Food',      price: 25,   stock: 120 },
  { name: 'Desk Chair',   category: 'Furniture', price: 320,  stock: 35 },
  { name: 'Bookshelf',    category: 'Furniture', price: 180,  stock: 22 },
  { name: 'Monitor',      category: 'Tech',      price: 400,  stock: 50 },
  { name: 'Chocolate',    category: 'Food',      price: 8,    stock: 500 },
]
const VALUE_CHOICES: Record<string, (string | number)[]> = {
  price: [10, 50, 100, 200, 500],
  stock: [20, 50, 100, 200],
  category: ['Tech', 'Food', 'Furniture'],
}

const selStyle: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(31,62,108,0.25)',
  background: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Consolas, monospace',
}

export default function SQLQueryBuilderInteractive() {
  const [col, setCol] = useState<'price' | 'stock' | 'category'>('price')
  const [op, setOp] = useState<'>' | '<' | '='>('>')
  const [val, setVal] = useState<string>('100')
  const [sort, setSort] = useState<'price' | 'stock' | 'name'>('price')

  const effOp = col === 'category' ? '=' : op
  const rows = useMemo(() => {
    const v: string | number = col === 'category' ? val : Number(val)
    const filtered = PRODUCTS.filter(r => {
      const cell = r[col]
      return effOp === '>' ? cell > v : effOp === '<' ? cell < v : cell === v
    })
    return [...filtered].sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0))
  }, [col, effOp, val, sort])

  const sqlValue = col === 'category' ? `'${val}'` : val
  const sql = `SELECT * FROM products WHERE ${col} ${effOp} ${sqlValue} ORDER BY ${sort};`

  const pickCol = (c: 'price' | 'stock' | 'category') => {
    setCol(c)
    setVal(String(VALUE_CHOICES[c][0]))
  }

  return (
    <div dir="rtl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, margin: '24px auto', maxWidth: 700, color: 'var(--sh-text-dark)', fontFamily: 'Rubik, sans-serif' }}>
      <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>בונה השאילתות — פתק בקשה חי</h3>
      <p style={{ fontSize: 14, opacity: 0.75, margin: '0 0 12px' }}>שנו את התנאי בתפריטים — הטבלה מסתננת מיד, בדיוק כמו שפקיד המחסן היה מבצע את הפתק.</p>

      {/* the query row is LTR — SQL reads left-to-right */}
      <div dir="ltr" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10, fontFamily: 'Consolas, monospace', fontSize: 14 }}>
        <span>SELECT * FROM products WHERE</span>
        <select aria-label="column" style={selStyle} value={col} onChange={e => pickCol(e.target.value as 'price' | 'stock' | 'category')}>
          <option>price</option><option>stock</option><option>category</option>
        </select>
        <select aria-label="operator" style={selStyle} value={effOp} disabled={col === 'category'} onChange={e => setOp(e.target.value as '>' | '<' | '=')}>
          <option>&gt;</option><option>&lt;</option><option>=</option>
        </select>
        <select aria-label="value" style={selStyle} value={val} onChange={e => setVal(e.target.value)}>
          {VALUE_CHOICES[col].map(v => <option key={String(v)}>{String(v)}</option>)}
        </select>
        <span>ORDER BY</span>
        <select aria-label="sort" style={selStyle} value={sort} onChange={e => setSort(e.target.value as 'price' | 'stock' | 'name')}>
          <option>price</option><option>stock</option><option>name</option>
        </select>
      </div>

      <div dir="ltr" style={{ fontFamily: 'Consolas, monospace', fontSize: 13, background: 'rgba(31,62,108,0.9)', color: '#e8ecf1', borderRadius: 10, padding: '8px 12px', marginBottom: 12, overflowX: 'auto' }}>{sql}</div>

      <div dir="ltr" style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>{['name', 'category', 'price', 'stock'].map(h => (
              <th key={h} style={{ background: 'rgba(31,62,108,0.85)', color: '#fff', textAlign: 'left', padding: '6px 10px' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.name}>
                <td style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>{r.name}</td>
                <td style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>{r.category}</td>
                <td style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>{r.price}</td>
                <td style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>{r.stock}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center', opacity: 0.6 }}>(0 rows)</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 14, color: '#D4A017', fontWeight: 600, marginTop: 8 }}>
        הפקיד החזיר {rows.length} מתוך {PRODUCTS.length} קופסאות
      </div>
    </div>
  )
}
