import type { RunningStats, PushkaTarget } from '../../utils/pushkaEngine'
import { BUST_CI_WIDTH } from '../../utils/pushkaEngine'

interface Props {
  stats: RunningStats
  target: PushkaTarget
  bust: boolean
}

function StatCell({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-2 flex-1"
      style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
    >
      <span className="text-xs mb-0.5" style={{ color: '#8a8f99', fontFamily: 'Assistant, sans-serif' }}>{label}</span>
      <span className="text-xl font-bold" style={{ color: color || '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
        {value}
      </span>
      {sub && <span className="text-xs mt-0.5" style={{ color: '#8a8f99' }}>{sub}</span>}
    </div>
  )
}

export default function StatsHud({ stats, target, bust }: Props) {
  if (stats.n === 0) {
    return (
      <div
        dir="rtl"
        className="flex gap-2 w-full"
      >
        {['ממוצע', 'n', 'רווח סמך'].map(label => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl px-3 py-2 flex-1"
            style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
          >
            <span className="text-xs" style={{ color: '#8a8f99', fontFamily: 'Assistant, sans-serif' }}>{label}</span>
            <span className="text-xl font-bold" style={{ color: '#2a2e36', fontFamily: 'Heebo, sans-serif' }}>—</span>
          </div>
        ))}
      </div>
    )
  }

  const inRange = stats.mean >= target.lowBound && stats.mean <= target.highBound
  const meanColor = bust ? '#ef4444' : inRange ? '#10b981' : '#f59e0b'
  const ciDanger = stats.ciWidth > BUST_CI_WIDTH * 0.75

  return (
    <div dir="rtl" className="flex gap-2 w-full">
      <StatCell
        label="ממוצע"
        value={stats.n >= 2 ? stats.mean.toFixed(1) : stats.mean.toFixed(0)}
        sub={inRange ? '✓ בטווח' : '✗ מחוץ לטווח'}
        color={meanColor}
      />
      <StatCell
        label="n שבבים"
        value={String(stats.n)}
      />
      <StatCell
        label="רווח סמך 95%"
        value={stats.n >= 2 ? `${stats.ciLow95.toFixed(1)}–${stats.ciHigh95.toFixed(1)}` : '—'}
        sub={ciDanger ? '⚠ רחב!' : stats.ciWidth > 0 ? `±${(stats.ciWidth / 2).toFixed(1)}` : undefined}
        color={ciDanger ? '#ef4444' : '#8a8f99'}
      />
    </div>
  )
}
