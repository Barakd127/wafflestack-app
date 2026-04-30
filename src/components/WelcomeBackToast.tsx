import { useEffect, useState } from 'react'

const SESSION_SHOWN_KEY = 'wafflestack-welcome-toast-shown'
const LAST_SEEN_KEY = 'wafflestack-last-seen-ms'

function hebrewGreetingFor(hour: number): { emoji: string; text: string } {
  if (hour >= 5 && hour < 12) return { emoji: '☀️', text: 'בוקר טוב' }
  if (hour >= 12 && hour < 17) return { emoji: '🌤️', text: 'צהריים טובים' }
  if (hour >= 17 && hour < 21) return { emoji: '🌇', text: 'ערב טוב' }
  return { emoji: '🌙', text: 'לילה טוב' }
}

export default function WelcomeBackToast() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [name, setName] = useState<string>('')
  const [hoursAway, setHoursAway] = useState<number>(0)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_SHOWN_KEY) === '1') return

    const storedName = (localStorage.getItem('userName') || '').trim()
    const lastSeenStr = localStorage.getItem(LAST_SEEN_KEY)
    const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0
    const nowMs = Date.now()
    const awayMs = lastSeen > 0 ? nowMs - lastSeen : 0
    const awayHours = Math.floor(awayMs / 3_600_000)

    localStorage.setItem(LAST_SEEN_KEY, String(nowMs))
    sessionStorage.setItem(SESSION_SHOWN_KEY, '1')

    if (!storedName && awayHours < 1) return

    setName(storedName)
    setHoursAway(awayHours)

    const showId = window.setTimeout(() => setVisible(true), 600)
    const fadeId = window.setTimeout(() => setFading(true), 5200)
    const hideId = window.setTimeout(() => setVisible(false), 5800)
    return () => {
      window.clearTimeout(showId)
      window.clearTimeout(fadeId)
      window.clearTimeout(hideId)
    }
  }, [])

  if (!visible) return null

  const { emoji, text } = hebrewGreetingFor(new Date().getHours())
  const sub = (() => {
    if (hoursAway >= 24) {
      const days = Math.floor(hoursAway / 24)
      return days === 1 ? 'ברוך/ה שובך אחרי יום' : `ברוך/ה שובך אחרי ${days} ימים`
    }
    if (hoursAway >= 1) return 'ברוך/ה שובך'
    return 'בהצלחה בלמידה'
  })()

  const handleDismiss = () => {
    setFading(true)
    window.setTimeout(() => setVisible(false), 240)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={handleDismiss}
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 49,
        background:
          'linear-gradient(135deg, rgba(78,205,196,0.18) 0%, rgba(102,126,234,0.18) 100%)',
        border: '1px solid rgba(78,205,196,0.45)',
        borderRadius: 20,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: "'Heebo', system-ui, sans-serif",
        color: '#fff',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 6px 24px rgba(78,205,196,0.20)',
        direction: 'rtl',
        cursor: 'pointer',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        maxWidth: 360,
      }}
      title="לחץ/י לסגירה"
    >
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
          {text}{name ? <>, <span style={{ color: '#4ECDC4' }}>{name}</span></> : ''}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
          {sub}
        </span>
      </div>
    </div>
  )
}
