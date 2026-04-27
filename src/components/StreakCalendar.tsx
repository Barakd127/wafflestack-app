import { useMemo } from 'react'

interface Props {
  onClose: () => void
}

const XP_HISTORY_KEY = 'wafflestack-xp-history'
const DAYS = 30

interface DayCell {
  key: string
  date: Date
  delta: number
  isToday: boolean
  isFuture: boolean
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function loadXpHistory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(XP_HISTORY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function buildCells(history: Record<string, number>): DayCell[] {
  const today = new Date()
  const todayKey = dateKey(today)

  const windowStart = new Date(today)
  windowStart.setDate(windowStart.getDate() - (DAYS - 1))
  const windowStartKey = dateKey(windowStart)

  const earlierKeys = Object.keys(history).filter(k => k < windowStartKey).sort()
  let prevXp = earlierKeys.length > 0 ? history[earlierKeys[earlierKeys.length - 1]] : 0

  const cells: DayCell[] = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = dateKey(d)
    const recorded = history[key]
    const xpEnd = recorded !== undefined ? recorded : prevXp
    const delta = Math.max(0, xpEnd - prevXp)
    cells.push({ key, date: new Date(d), delta, isToday: key === todayKey, isFuture: false })
    prevXp = xpEnd
  }
  return cells
}

function intensityColor(delta: number, max: number): string {
  if (delta === 0) return 'rgba(255,255,255,0.06)'
  const ratio = max > 0 ? delta / max : 0
  if (ratio >= 0.75) return '#4ECDC4'
  if (ratio >= 0.5) return 'rgba(78,205,196,0.75)'
  if (ratio >= 0.25) return 'rgba(78,205,196,0.5)'
  return 'rgba(78,205,196,0.3)'
}

function computeCurrentStreak(cells: DayCell[]): number {
  let streak = 0
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].delta > 0) streak++
    else if (cells[i].isToday) continue
    else break
  }
  return streak
}

export default function StreakCalendar({ onClose }: Props) {
  const history = useMemo(() => loadXpHistory(), [])
  const cells = useMemo(() => buildCells(history), [history])
  const maxDelta = cells.reduce((m, c) => Math.max(m, c.delta), 0)
  const activeDays = cells.filter(c => c.delta > 0).length
  const totalXp = cells.reduce((sum, c) => sum + c.delta, 0)
  const currentStreak = computeCurrentStreak(cells)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
          border: '1px solid rgba(78,205,196,0.3)',
          borderRadius: 20, padding: '24px 26px 22px',
          minWidth: 320, maxWidth: 460, width: '92%',
          fontFamily: "'Heebo', system-ui, sans-serif",
          boxShadow: '0 0 60px rgba(78,205,196,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: '#4ECDC4', fontSize: 18, fontWeight: 700, margin: 0 }}>
            📅 30 ימים אחרונים
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
            aria-label="סגור"
          >✕</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{
            flex: 1, padding: '10px 12px',
            background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: 10, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: currentStreak > 0 ? '#FF6B35' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
              🔥 {currentStreak}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginTop: 4 }}>
              רצף נוכחי
            </div>
          </div>
          <div style={{
            flex: 1, padding: '10px 12px',
            background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.25)',
            borderRadius: 10, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4ECDC4', lineHeight: 1 }}>
              {activeDays}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/30</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginTop: 4 }}>
              ימים פעילים
            </div>
          </div>
          <div style={{
            flex: 1, padding: '10px 12px',
            background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: 10, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: totalXp > 0 ? '#FFD700' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
              +{totalXp}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginTop: 4 }}>
              XP בחודש
            </div>
          </div>
        </div>

        {/* Calendar grid — 5 rows × 6 cols, oldest top-left → newest bottom-right */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6,
          marginBottom: 14,
        }}>
          {cells.map(cell => {
            const monthDay = `${cell.date.getMonth() + 1}/${cell.date.getDate()}`
            const fill = intensityColor(cell.delta, maxDelta)
            const border = cell.isToday ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.08)'
            return (
              <div
                key={cell.key}
                title={`${cell.key} · ${cell.delta > 0 ? `+${cell.delta} XP` : 'אין פעילות'}`}
                style={{
                  aspectRatio: '1',
                  background: fill,
                  border,
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'transform 0.15s',
                  cursor: 'default',
                }}
              >
                <span style={{
                  fontSize: 10, color: cell.delta > 0 ? '#000' : 'rgba(255,255,255,0.35)',
                  fontWeight: cell.isToday ? 800 : 600, fontVariantNumeric: 'tabular-nums',
                }}>
                  {monthDay}
                </span>
                {cell.delta > 0 && (
                  <span style={{
                    fontSize: 9, color: 'rgba(0,0,0,0.7)', fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', marginTop: 1,
                  }}>
                    +{cell.delta}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
        }}>
          <span>פחות</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: 3,
                background: r === 0 ? 'rgba(255,255,255,0.06)' : intensityColor(maxDelta * r, maxDelta),
                border: '1px solid rgba(255,255,255,0.08)',
              }} />
            ))}
          </div>
          <span>יותר</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          המסגרת הזהובה = היום
        </p>
      </div>
    </div>
  )
}
