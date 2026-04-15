import React, { useState } from 'react'

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
  onClose: () => void
  onReset: () => void
}

export default function ScoreBoard({ mastered, xp, onClose, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [copied, setCopied] = useState(false)
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

      {/* Share Row */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <button
          onClick={() => {
            const text = `I mastered ${masteredCount}/${total} statistics concepts on WaffleStack! 🏙️\nTotal XP: ${xp.toLocaleString()} ⭐\nhttps://barakd127.github.io/wafflestack-app/`
            navigator.clipboard.writeText(text).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            })
          }}
          style={{
            width: '100%', padding: '9px',
            background: copied ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${copied ? 'rgba(78,205,196,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, color: copied ? '#4ECDC4' : 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied to clipboard!' : '📤 Share Progress'}
        </button>
      </div>

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

              {/* Right: status */}
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isMastered ? '#4ECDC4' : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMastered ? '✓ Mastered' : '○ Not yet'}
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
