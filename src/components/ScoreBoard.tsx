import React from 'react'

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
}

export default function ScoreBoard({ mastered, xp, onClose }: Props) {
  const masteredCount = mastered.size
  const total = BUILDINGS_META.length

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
    </div>
  )
}
