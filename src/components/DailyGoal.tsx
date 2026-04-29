import { useEffect, useState } from 'react'

const GOAL_KEY = 'wafflestack-daily-goal'
const DEFAULT_GOAL = 100
const PRESETS = [50, 100, 150, 200]

interface Props {
  todayXp: number
}

function loadGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY)
  const n = raw ? parseInt(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_GOAL
}

export default function DailyGoal({ todayXp }: Props) {
  const [goal, setGoal] = useState<number>(() => loadGoal())
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(GOAL_KEY, String(goal)) } catch { /* quota */ }
  }, [goal])

  const safeToday = Math.max(0, todayXp)
  const pct = Math.min(100, Math.max(0, (safeToday / goal) * 100))
  const hit = safeToday >= goal

  const size = 56
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct / 100)

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg
              width={size}
              height={size}
              style={{ transform: 'rotate(-90deg)', display: 'block' }}
            >
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={hit ? '#4ECDC4' : '#FFC700'}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s',
                  filter: hit ? 'drop-shadow(0 0 6px rgba(78,205,196,0.5))' : 'none',
                }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800,
              color: hit ? '#4ECDC4' : '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {Math.round(pct)}%
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: hit ? '#4ECDC4' : '#fff', lineHeight: 1.15,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {safeToday}<span style={{ color: 'rgba(255,255,255,0.35)' }}> / {goal}</span>
            </div>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginTop: 2, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              🎯 Daily Goal
              {hit && (
                <span style={{
                  color: '#4ECDC4', fontWeight: 700, letterSpacing: 0,
                  textTransform: 'none',
                }}>
                  · 🎉 hit!
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditing(e => !e)}
          style={{
            background: editing ? 'rgba(255,199,0,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${editing ? 'rgba(255,199,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, padding: '5px 10px',
            color: editing ? '#FFC700' : 'rgba(255,255,255,0.5)',
            fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            flexShrink: 0,
          }}
          title="Change daily goal"
          aria-label="Change daily goal"
        >
          {editing ? '✕' : '✎'}
        </button>
      </div>

      {editing && (
        <div style={{
          marginTop: 12,
          display: 'flex', gap: 6, flexWrap: 'wrap',
        }}>
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { setGoal(p); setEditing(false) }}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                background: goal === p ? 'rgba(255,199,0,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${goal === p ? 'rgba(255,199,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, padding: '7px 6px',
                color: goal === p ? '#FFC700' : 'rgba(255,255,255,0.85)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {p} XP
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
