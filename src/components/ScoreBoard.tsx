import React, { useState, useEffect } from 'react'
import ShareCard from './ShareCard'
import DailyGoal from './DailyGoal'

const BUILDINGS_META = [
  { id: 'power',     label: '⚡ תחנת כוח',   concept: 'ממוצע',              color: '#FFD700' },
  { id: 'housing',   label: '🏠 מנהל דיור',  concept: 'חציון',              color: '#4ECDC4' },
  { id: 'traffic',   label: '🚦 בקרת תנועה', concept: 'סטיית תקן',          color: '#FF6B6B' },
  { id: 'hospital',  label: '🏥 בית חולים',  concept: 'התפלגות נורמלית',    color: '#95E1D3' },
  { id: 'school',    label: '🏫 בית ספר',    concept: 'מדגם',               color: '#AA96DA' },
  { id: 'bank',      label: '🏦 בנק',        concept: 'רגרסיה',             color: '#FCBAD3' },
  { id: 'market',    label: '🏪 שוק',        concept: 'קורלציה',            color: '#A8E6CF' },
  { id: 'city-hall', label: '🏛️ עיריה',      concept: 'בינום',              color: '#F38181' },
  { id: 'research',  label: '🔬 מכון מחקר',  concept: 'מבחן השערות',        color: '#C3A6FF' },
  { id: 'news',      label: '📰 תחנת חדשות', concept: 'רווח סמך',           color: '#FFB347' },
]

interface Props {
  mastered: Set<string>
  xp: number
  sessionStart: number
  onClose: () => void
  onReset: () => void
  onPracticeWeakSpots?: () => void
}

interface BuildingScore {
  id: string
  label: string
  concept: string
  color: string
  score: number
  total: number
  percentage: number
}

function loadWeakSpots(): BuildingScore[] {
  return BUILDINGS_META.map(b => {
    const scoreRaw = localStorage.getItem(`wafflestack-score-${b.id}`)
    const totalRaw = localStorage.getItem(`wafflestack-total-${b.id}`)
    if (!scoreRaw || !totalRaw) return null
    const score = parseInt(scoreRaw)
    const total = parseInt(totalRaw)
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    return { ...b, score, total, percentage }
  }).filter((x): x is BuildingScore => x !== null && x.percentage < 70)
}

function loadAccuracy(buildingId: string): { score: number; total: number; percentage: number } | null {
  const scoreRaw = localStorage.getItem(`wafflestack-score-${buildingId}`)
  const totalRaw = localStorage.getItem(`wafflestack-total-${buildingId}`)
  if (!scoreRaw || !totalRaw) return null
  const score = parseInt(scoreRaw)
  const total = parseInt(totalRaw)
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return null
  return { score, total, percentage: Math.round((score / total) * 100) }
}

// XP history: cumulative total snapshot per day. Daily delta = today - yesterday.
const XP_HISTORY_KEY = 'wafflestack-xp-history'

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

function saveTodayXp(xp: number): Record<string, number> {
  const history = loadXpHistory()
  const today = dateKey(new Date())
  // Keep highest seen value per day so resets/reload don't clobber today's earned total
  if ((history[today] ?? 0) < xp) {
    history[today] = xp
    try {
      localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(history))
    } catch { /* quota exceeded - ignore */ }
  } else if (history[today] === undefined) {
    history[today] = xp
    try {
      localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(history))
    } catch { /* ignore */ }
  }
  return history
}

interface DayBar {
  key: string
  label: string
  delta: number
  isToday: boolean
}

function buildWeeklyBars(history: Record<string, number>): DayBar[] {
  const today = new Date()
  const todayKey = dateKey(today)

  // Find the latest known XP snapshot from before the 7-day window for the baseline.
  const windowStart = new Date(today); windowStart.setDate(windowStart.getDate() - 6)
  const windowStartKey = dateKey(windowStart)
  const earlierKeys = Object.keys(history).filter(k => k < windowStartKey).sort()
  let prevXp = earlierKeys.length > 0 ? history[earlierKeys[earlierKeys.length - 1]] : 0

  const bars: DayBar[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = dateKey(d)
    const recorded = history[key]
    const xpEnd = recorded !== undefined ? recorded : prevXp
    const delta = Math.max(0, xpEnd - prevXp)
    bars.push({ key, label: dayNames[d.getDay()], delta, isToday: key === todayKey })
    prevXp = xpEnd
  }
  return bars
}

function accuracyTone(percentage: number): { color: string; bg: string; border: string } {
  if (percentage >= 80) return { color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)', border: 'rgba(78,205,196,0.35)' }
  if (percentage >= 50) return { color: '#FFC700', bg: 'rgba(255,199,0,0.12)', border: 'rgba(255,199,0,0.35)' }
  return { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.35)' }
}

const XP_MILESTONES = [250, 500, 750, 1000]

export default function ScoreBoard({ mastered, xp, sessionStart, onClose, onReset, onPracticeWeakSpots }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - sessionStart) / 60000))
  const [xpHistory, setXpHistory] = useState<Record<string, number>>(() => loadXpHistory())
  const weakSpots = loadWeakSpots()

  // Snapshot today's XP whenever it changes so the weekly chart stays current.
  useEffect(() => {
    const updated = saveTodayXp(xp)
    setXpHistory(updated)
  }, [xp])

  const weeklyBars = buildWeeklyBars(xpHistory)
  const weeklyTotal = weeklyBars.reduce((sum, b) => sum + b.delta, 0)
  const weeklyMax = weeklyBars.reduce((m, b) => Math.max(m, b.delta), 0)

  const nextMilestone = XP_MILESTONES.find(m => xp < m) ?? null
  const prevMilestone = nextMilestone
    ? (XP_MILESTONES[XP_MILESTONES.indexOf(nextMilestone) - 1] ?? 0)
    : null
  const milestoneProgress = nextMilestone !== null && prevMilestone !== null
    ? Math.min(100, Math.max(0, ((xp - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
    : 100
  const xpToGo = nextMilestone ? nextMilestone - xp : 0

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 60000))
    }, 10000)
    return () => clearInterval(timer)
  }, [sessionStart])
  const masteredCount = mastered.size
  const total = BUILDINGS_META.length

  // Streak calculation
  const todayStr = new Date().toISOString().slice(0, 10) // "2026-04-14"
  const lastStudy = localStorage.getItem('wafflestack-last-study') || ''
  const streak = (() => {
    const stored = parseInt(localStorage.getItem('wafflestack-streak') || '0')
    return stored
  })()
  const isStudiedToday = lastStudy === todayStr

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: '340px',
        background: 'linear-gradient(180deg, #0a0a18 0%, #0f1525 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          📊 Score Board
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          ✕
        </button>
      </div>

      {/* XP + Progress Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        {/* XP Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#FFD700',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {xp.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(255,215,0,0.6)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            ⭐ Total XP
          </span>
        </div>

        {/* Progress Ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `3px solid ${masteredCount === total ? '#4ECDC4' : 'rgba(255,255,255,0.12)'}`,
              background:
                masteredCount === total
                  ? 'radial-gradient(circle, rgba(78,205,196,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                masteredCount === total
                  ? '0 0 20px rgba(78,205,196,0.3)'
                  : '0 0 12px rgba(0,0,0,0.4)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: masteredCount === total ? '#4ECDC4' : '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {masteredCount}/{total}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Mastered
          </span>
        </div>
      </div>

      {/* Next Milestone Row */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            🎯 Next Milestone
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: nextMilestone ? '#FFD700' : '#4ECDC4',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {nextMilestone ? `${nextMilestone.toLocaleString()} XP` : '🏆 All reached!'}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{
            height: '100%',
            width: `${milestoneProgress}%`,
            background: nextMilestone
              ? 'linear-gradient(90deg, #4ECDC4 0%, #FFD700 100%)'
              : 'linear-gradient(90deg, #4ECDC4 0%, #4ECDC4 100%)',
            transition: 'width 0.5s ease',
            boxShadow: nextMilestone ? '0 0 10px rgba(255,215,0,0.35)' : '0 0 10px rgba(78,205,196,0.4)',
          }} />
        </div>
        {nextMilestone && (
          <div style={{
            marginTop: 6,
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {xpToGo.toLocaleString()} XP to go
          </div>
        )}
      </div>

      {/* Share Row */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <button
          onClick={() => setShowShareCard(true)}
          style={{
            width: '100%', padding: '9px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          📤 Share Progress
        </button>
      </div>
      {showShareCard && (
        <ShareCard
          xp={xp}
          masteredCount={masteredCount}
          total={total}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Streak Row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: streak > 0 ? '#FF6B35' : 'rgba(255,255,255,0.2)', lineHeight: 1 }}>
              {streak} day{streak !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Study Streak
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 20,
          background: isStudiedToday ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isStudiedToday ? 'rgba(78,205,196,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: isStudiedToday ? '#4ECDC4' : 'rgba(255,255,255,0.3)',
          fontWeight: 600,
        }}>
          {isStudiedToday ? '✓ Studied today' : 'Not yet today'}
        </div>
      </div>

      {/* Daily XP Goal Row */}
      <DailyGoal todayXp={weeklyBars[weeklyBars.length - 1]?.delta ?? 0} />

      {/* Session Timer Row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⏱️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>
              {elapsed} min
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              This Session
            </div>
          </div>
        </div>
      </div>

      {/* Weekly XP Sparkline */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            📈 Past 7 Days
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: weeklyTotal > 0 ? '#FFD700' : 'rgba(255,255,255,0.3)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            +{weeklyTotal.toLocaleString()} XP
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 4, height: 52, padding: '0 2px',
        }}>
          {weeklyBars.map(bar => {
            const heightPct = weeklyMax > 0 ? Math.max(6, (bar.delta / weeklyMax) * 100) : 6
            const hasXp = bar.delta > 0
            const fillColor = bar.isToday
              ? (hasXp ? '#FFD700' : 'rgba(255,215,0,0.25)')
              : (hasXp ? '#4ECDC4' : 'rgba(255,255,255,0.08)')
            const glow = bar.isToday && hasXp ? '0 0 8px rgba(255,215,0,0.4)' : 'none'
            return (
              <div
                key={bar.key}
                title={`${bar.key}: +${bar.delta} XP`}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4, minWidth: 0,
                }}
              >
                <div style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: fillColor,
                  borderRadius: '4px 4px 2px 2px',
                  boxShadow: glow,
                  transition: 'height 0.4s ease, background 0.2s',
                }} />
                <span style={{
                  fontSize: 9, color: bar.isToday ? '#FFD700' : 'rgba(255,255,255,0.35)',
                  fontWeight: bar.isToday ? 700 : 500, letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {bar.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Needs Review Section */}
      {weakSpots.length > 0 && (
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 11, color: '#FF6B6B', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10,
          }}>
            📝 Needs Review ({weakSpots.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {weakSpots.map(b => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', borderRadius: 8,
                background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.22)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', direction: 'rtl' as const }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: b.color }}>{b.concept}</span>
                </div>
                <span style={{
                  fontSize: 11, color: '#FF6B6B', fontWeight: 700,
                  background: 'rgba(255,107,107,0.12)', padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' as const,
                }}>
                  {b.percentage}% · retry
                </span>
              </div>
            ))}
          </div>
          {onPracticeWeakSpots && (
            <button
              onClick={onPracticeWeakSpots}
              style={{
                marginTop: 10, width: '100%', padding: '9px 14px',
                background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)',
                borderRadius: 10, color: '#4ECDC4', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.1)' }}
            >
              🎯 Practice Weak Spots
            </button>
          )}
        </div>
      )}

      {/* Building List */}
      <div
        style={{
          flex: 1,
          padding: '12px 12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {BUILDINGS_META.map(building => {
          const isMastered = mastered.has(building.id)
          const accuracy = loadAccuracy(building.id)
          const tone = accuracy ? accuracyTone(accuracy.percentage) : null
          return (
            <div
              key={building.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                background: isMastered
                  ? `linear-gradient(90deg, ${building.color}18 0%, transparent 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: isMastered
                  ? `1px solid ${building.color}40`
                  : '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s',
              }}
            >
              {/* Left: label + concept */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isMastered ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    direction: 'rtl',
                  }}
                >
                  {building.label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: isMastered ? building.color : 'rgba(255,255,255,0.3)',
                    direction: 'rtl',
                  }}
                >
                  {building.concept}
                </span>
              </div>

              {/* Right: accuracy badge + status */}
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {accuracy && tone && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: tone.color,
                      background: tone.bg,
                      border: `1px solid ${tone.border}`,
                      padding: '2px 7px',
                      borderRadius: 999,
                      lineHeight: 1.2,
                    }}
                    title={`Quiz score: ${accuracy.score} / ${accuracy.total}`}
                  >
                    {accuracy.percentage}% · {accuracy.score}/{accuracy.total}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isMastered ? '#4ECDC4' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {isMastered ? '✓ Mastered' : '○ Not yet'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset section */}
      <div style={{
        padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              width: '100%', padding: '10px', background: 'rgba(255,80,80,0.08)',
              border: '1px solid rgba(255,80,80,0.2)', borderRadius: 10,
              color: 'rgba(255,120,120,0.7)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.15)'; e.currentTarget.style.color = 'rgba(255,120,120,1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; e.currentTarget.style.color = 'rgba(255,120,120,0.7)' }}
          >
            🗑️ Reset Progress
          </button>
        ) : (
          <div style={{
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 10, padding: '14px',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,200,200,0.9)', marginBottom: 12, textAlign: 'center', lineHeight: 1.5 }}>
              Reset all progress?<br />
              <span style={{ fontSize: 11, color: 'rgba(255,150,150,0.6)' }}>This will clear your XP and mastered buildings.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onReset(); setConfirmReset(false) }}
                style={{
                  flex: 1, padding: '8px', background: 'rgba(255,60,60,0.3)',
                  border: '1px solid rgba(255,80,80,0.4)', borderRadius: 8,
                  color: '#ff8888', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
