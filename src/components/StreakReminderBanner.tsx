import { useState, useEffect } from 'react'

interface Props {
  // Pass the parent's `xp` here. Each mastery bumps xp, which re-triggers the effect
  // so the banner can hide as soon as the user studies today.
  xp: number
}

const SESSION_DISMISS_KEY = 'wafflestack-streak-banner-dismissed'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
function yesterdayISO(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10)
}

export default function StreakReminderBanner({ xp }: Props) {
  const [dismissed, setDismissed] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'
  )
  const [streak, setStreak] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const lastStudy = localStorage.getItem('wafflestack-last-study') || ''
    const currentStreak = parseInt(localStorage.getItem('wafflestack-streak') || '0')
    const today = todayISO()
    const yesterday = yesterdayISO()
    setStreak(currentStreak)
    setVisible(currentStreak >= 1 && lastStudy === yesterday)
  }, [xp])

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || !visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 49,
        background:
          'linear-gradient(135deg, rgba(255,107,107,0.20) 0%, rgba(255,165,0,0.20) 100%)',
        border: '1px solid rgba(255,165,0,0.45)',
        borderRadius: 24,
        padding: '8px 14px 8px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: "'Heebo', system-ui, sans-serif",
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(255,107,107,0.25)',
        direction: 'rtl',
        maxWidth: 'calc(100vw - 320px)',
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
      <span>
        שרשרת של{' '}
        <strong style={{ color: '#FFD700', fontVariantNumeric: 'tabular-nums' }}>
          {streak}
        </strong>{' '}
        ימים — סיימו בניין אחד היום כדי לשמור עליה
      </span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss streak reminder"
        title="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.7)',
          width: 22,
          height: 22,
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
