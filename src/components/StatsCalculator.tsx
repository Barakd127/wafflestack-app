import { useMemo, useState } from 'react'

interface Props {
  onClose: () => void
}

interface Stats {
  count: number
  sum: number
  mean: number
  median: number
  stddev: number
  min: number
  max: number
  range: number
}

function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => Number(s))
    .filter(n => Number.isFinite(n))
}

function computeStats(nums: number[]): Stats | null {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const count = nums.length
  const sum = nums.reduce((a, b) => a + b, 0)
  const mean = sum / count
  const median =
    count % 2 === 1
      ? sorted[(count - 1) / 2]
      : (sorted[count / 2 - 1] + sorted[count / 2]) / 2
  const variance = nums.reduce((acc, x) => acc + (x - mean) ** 2, 0) / count
  const stddev = Math.sqrt(variance)
  const min = sorted[0]
  const max = sorted[count - 1]
  const range = max - min
  return { count, sum, mean, median, stddev, min, max, range }
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (Number.isInteger(n)) return n.toString()
  return n.toFixed(2).replace(/\.?0+$/, '')
}

const SAMPLE_DATA = '60, 70, 80, 90, 100'

interface StatRow {
  label: string
  labelHe: string
  value: string
  formula: string
  color: string
}

export default function StatsCalculator({ onClose }: Props) {
  const [input, setInput] = useState('')

  const nums = useMemo(() => parseNumbers(input), [input])
  const stats = useMemo(() => computeStats(nums), [nums])

  const rows: StatRow[] = stats
    ? [
        { label: 'Count', labelHe: 'מספר ערכים', value: fmt(stats.count), formula: 'n', color: '#AA96DA' },
        { label: 'Sum', labelHe: 'סכום', value: fmt(stats.sum), formula: 'Σxᵢ', color: '#FFB347' },
        { label: 'Mean', labelHe: 'ממוצע', value: fmt(stats.mean), formula: 'μ = Σxᵢ / n', color: '#FFD700' },
        { label: 'Median', labelHe: 'חציון', value: fmt(stats.median), formula: 'middle of sorted data', color: '#4ECDC4' },
        { label: 'Std Dev', labelHe: 'סטיית תקן', value: fmt(stats.stddev), formula: 'σ = √[Σ(xᵢ-μ)²/n]', color: '#FF6B6B' },
        { label: 'Min', labelHe: 'מינימום', value: fmt(stats.min), formula: 'smallest value', color: '#95E1D3' },
        { label: 'Max', labelHe: 'מקסימום', value: fmt(stats.max), formula: 'largest value', color: '#F38181' },
        { label: 'Range', labelHe: 'טווח', value: fmt(stats.range), formula: 'max - min', color: '#C3A6FF' },
      ]
    : []

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 460, backdropFilter: 'blur(8px)', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
          border: '1px solid rgba(78,205,196,0.25)',
          borderRadius: 20, padding: '22px 24px',
          maxWidth: 560, width: '100%',
          fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
          boxShadow: '0 0 60px rgba(78,205,196,0.12)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>🧮 Stats Calculator</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              הזן מספרים — נחשב הכל באופן אוטומטי
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, width: 36, height: 36,
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Close"
          >✕</button>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="3, 7, 2, 9, 4"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '10px 12px',
            color: 'white', fontSize: 15, fontFamily: 'monospace',
            resize: 'vertical', outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(78,205,196,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 14 }}>
          <button
            onClick={() => setInput(SAMPLE_DATA)}
            style={{
              background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)',
              borderRadius: 8, padding: '5px 12px',
              color: '#4ECDC4', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >
            Try sample data
          </button>
          <button
            onClick={() => setInput('')}
            disabled={input.length === 0}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '5px 12px',
              color: 'rgba(255,255,255,0.6)', cursor: input.length === 0 ? 'default' : 'pointer',
              fontSize: 12, fontWeight: 600,
              opacity: input.length === 0 ? 0.4 : 1,
            }}
          >
            Clear
          </button>
        </div>

        {stats === null ? (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            color: 'rgba(255,255,255,0.4)', fontSize: 13,
            border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12,
          }}>
            Enter numbers separated by spaces, commas, or new lines
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {rows.map(r => (
              <div
                key={r.label}
                style={{
                  background: `${r.color}10`, border: `1px solid ${r.color}33`,
                  borderRadius: 10, padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 11, color: r.color, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{r.labelHe}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2, lineHeight: 1.1 }}>
                  {r.value}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'monospace' }}>
                  {r.formula}
                </div>
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div style={{
            marginTop: 14, padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
          }}>
            Parsed {stats.count} value{stats.count === 1 ? '' : 's'} · Std Dev is population (÷n)
          </div>
        )}
      </div>
    </div>
  )
}
