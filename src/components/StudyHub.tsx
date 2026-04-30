import { useState, useEffect, useRef, useCallback } from 'react'
import type { LessonTopicId } from './LessonPage'
import { useLearningStore } from '../store/learningStore'
import { initializeUser, getCurrentUser, loginUser, registerUser, logoutUser, listUsers, deleteUser, type User } from '../stores/authStore'
import { loadProgress, recordQuizSession, saveCanvasNotes, type QuizAnswer, type UserProgress } from '../stores/progressStore'
import quizBankData from '../data/quiz-bank.json'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode?: boolean
  onOpenLesson?: (id: LessonTopicId) => void
}

type InternalView = 'home' | 'learning' | 'topics' | 'complete'

// Extract topics from quiz-bank data
const QUIZ_TOPICS = Object.entries(quizBankData.topics || {}).map(([key, data]: [string, any]) => ({
  id: key,
  label: data.concept || key,
  building: data.building || '',
  concept: data.concept || key,
  questionCount: (data.questions || []).length,
}))

// ── Design tokens — driven by CSS custom properties for dark/light mode ────────
const PAGE_BG       = 'var(--sh-page-bg)'
const SIDEBAR_BG    = 'var(--sh-sidebar-bg)'
const SIDEBAR_ACTIVE = 'var(--sh-sidebar-active)'
const GLASS_CARD    = 'var(--sh-glass-card)'
const GLASS_CARD_SM = 'var(--sh-glass-card-sm)'
const CARD_SHADOW   = 'var(--sh-card-shadow)'
const CARD_RADIUS   = 24
const BUTTON_COLOR  = 'var(--sh-btn-color)'
const TEXT_DARK     = 'var(--sh-text-dark)'
const TEXT_MED      = 'var(--sh-text-med)'
const TEXT_LIGHT    = 'var(--sh-text-light)'
const TEXT_TIP      = 'var(--sh-text-tip)'

// ── Login / Register Screen ────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const existingUsers = listUsers()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (mode === 'login') {
        const result = loginUser(username, password)
        if (result) {
          onLogin(result)
        } else {
          setError('שם משתמש או סיסמה שגויים')
        }
      } else {
        const result = registerUser(username, password, displayName)
        if (typeof result === 'string') {
          setError(result)
        } else {
          onLogin(result)
        }
      }
      setLoading(false)
    }, 200)
  }

  const handleQuickLogin = (userId: string) => {
    const user = listUsers().find(u => u.userId === userId)
    if (!user) return
    // Quick-switch by building a session directly
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    localStorage.setItem('wafflestack-session', JSON.stringify({ userId, expiresAt }))
    onLogin(user as User)
  }

  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #EBF1FF 0%, #D6E4FF 40%, #C4DCFF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Rubik', 'Assistant', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 900, padding: 24, display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Auth card */}
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
          borderRadius: 24, padding: '36px 40px',
          boxShadow: '0 8px 40px rgba(31,62,108,0.18)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 42, marginBottom: 6 }}>🏙️</div>
            <div style={{ fontWeight: 800, fontSize: 26, color: '#1F3E6C' }}>WaffleStack</div>
            <div style={{ fontSize: 13, color: '#7F9BD9', marginTop: 4 }}>פלטפורמת למידה לסטטיסטיקה</div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', borderRadius: 12, background: 'rgba(31,62,108,0.07)', padding: 4, marginBottom: 24, gap: 4 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 9, cursor: 'pointer',
                background: mode === m ? '#1F3E6C' : 'transparent',
                color: mode === m ? '#fff' : '#1F3E6C',
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                fontFamily: "'Rubik', sans-serif",
              }}>
                {m === 'login' ? '🔑 כניסה' : '✨ הרשמה'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>שם מלא</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #C4DCFF', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C' }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>שם משתמש</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="username"
                autoComplete="username"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #C4DCFF', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C', direction: 'ltr' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>סיסמה</label>
              <input value={password} onChange={e => setPassword(e.target.value)} required
                type="password" placeholder="••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #C4DCFF', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C', direction: 'ltr' }} />
            </div>
            {error && <div style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.3)', borderRadius: 8, padding: '8px 12px', color: '#d32f2f', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px 0', background: 'linear-gradient(135deg,#1F3E6C,#254A9F)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: "'Rubik', sans-serif", boxShadow: '0 4px 16px rgba(31,62,108,0.3)',
            }}>
              {loading ? '...' : mode === 'login' ? 'כניסה →' : 'צור חשבון →'}
            </button>
          </form>
        </div>

        {/* Student quick-login panel (shown if students exist) */}
        {existingUsers.length > 0 && (
          <div style={{
            width: 240, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(14px)',
            borderRadius: 20, padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(31,62,108,0.12)',
            border: '1px solid rgba(255,255,255,0.6)',
            flexShrink: 0,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1F3E6C', marginBottom: 14, textAlign: 'right' }}>
              👥 כניסה מהירה
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {existingUsers.map(u => (
                <button key={u.userId} onClick={() => handleQuickLogin(u.userId)}
                  style={{
                    padding: '10px 14px', background: 'rgba(31,62,108,0.06)',
                    border: '1px solid rgba(31,62,108,0.12)', borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', textAlign: 'right', width: '100%',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(31,62,108,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(31,62,108,0.06)' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#254A9F,#7F9BD9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {(u.displayName || u.username).slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1F3E6C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.username}</div>
                    <div style={{ fontSize: 10, color: '#7F9BD9' }}>{u.role === 'teacher' ? '👩‍🏫 מורה' : '🎓 תלמיד'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toolbar buttons (restored from 3D city HUD) ────────────────────────────────
interface ToolbarButton {
  id: string
  label: string
  icon: string
  description: string
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { id: 'flash', label: 'Flash', icon: '⚡', description: 'Flashcard drill mode' },
  { id: 'calc', label: 'Calc', icon: '🧮', description: 'Calculator tool' },
  { id: 'topics', label: 'Topics', icon: '📚', description: 'Topic browser' },
  { id: 'scores', label: 'Scores', icon: '📊', description: 'Performance dashboard' },
  { id: 'streaks', label: '30Days', icon: '🔥', description: '30-day challenge' },
]

// ── Topic Selector Component ───────────────────────────────────────────────────
interface TopicSelectorProps {
  userProgress: UserProgress
  onSelectTopic: (topicId: string) => void
  onBack: () => void
}

function TopicSelector({ userProgress, onSelectTopic, onBack }: TopicSelectorProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }} dir="rtl">
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: TEXT_DARK,
          fontFamily: "'Rubik', sans-serif",
          fontSize: 16,
          marginBottom: 24,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ← חזור לדף הבית
      </button>

      <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 28, textAlign: 'right' }}>
        בחר/י נושא ללימוד 📚
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 1200 }}>
        {QUIZ_TOPICS.map(topic => {
          const progress = userProgress.topics[topic.id]
          const isMastered = progress?.mastered
          const bestScore = progress?.bestScore || 0
          const sessionsAttempted = progress?.sessionsAttempted || 0

          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              style={{
                background: GLASS_CARD,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${isMastered ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: CARD_RADIUS,
                padding: 24,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                textAlign: 'right',
                transition: 'all 0.3s',
                boxShadow: CARD_SHADOW,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px rgba(51,81,202,0.25)`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ fontSize: 32 }}>{isMastered ? '⭐' : '📖'}</div>
                <div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>
                    {topic.label}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginTop: 4 }}>
                    {topic.building}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT_MED }}>
                    {sessionsAttempted}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>סשנים</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: bestScore > 85 ? '#34A853' : TEXT_MED }}>
                    {bestScore}%
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>ציון הטוב</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: '#D4AF37' }}>
                    {topic.questionCount}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>שאלות</div>
                </div>
              </div>

              {isMastered && (
                <div style={{
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontFamily: "'Rubik', sans-serif",
                  fontSize: 12,
                  color: '#D4AF37',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  ✅ הושגת שליטה!
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Questions with model answers ──────────────────────────────────────────────
// Fallback for initial questions (will be overridden by quiz-bank data)
const QUESTIONS = [
  {
    id: 1, topic: 'ממוצע',
    text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את הטווח',
    answer: 'א. ממוצע = (65+70+70+75+80+85+85+90+95+100) ÷ 10 = 815 ÷ 10 = 81.5\nב. חציון = ממוצע הערך ה-5 וה-6 = (80+85) ÷ 2 = 82.5\nג. שכיח: 70 ו-85 מופיעים כל אחד פעמיים (רב-שכיחי)\nד. טווח = 100 − 65 = 35',
    xp: 15,
  },
  {
    id: 2, topic: 'ממוצע',
    text: 'גבהות (בס"מ) של 5 שחקני כדורסל:\n180, 195, 188, 202, 175\n\nא. חשב/י את הממוצע\nב. מה ההפרש בין הגובה הגבוה לנמוך ביותר?',
    answer: 'א. ממוצע = (180+195+188+202+175) ÷ 5 = 940 ÷ 5 = 188 ס"מ\nב. גבוה ביותר: 202, נמוך ביותר: 175 → הפרש = 202 − 175 = 27 ס"מ',
    xp: 10,
  },
  {
    id: 3, topic: 'חציון',
    text: 'הצג/י את הנתונים הבאים בסדר עולה:\n12, 7, 3, 18, 5, 9, 14\n\nא. מצא/י את החציון\nב. כמה ערכים גדולים מהחציון?',
    answer: 'סדר עולה: 3, 5, 7, 9, 12, 14, 18  (7 ערכים)\nא. חציון = ערך האמצעי = הערך ה-4 = 9\nב. ערכים גדולים מ-9: 12, 14, 18 → 3 ערכים',
    xp: 10,
  },
  {
    id: 4, topic: 'שכיח',
    text: 'ציוני בוחן של כיתה: 70, 80, 80, 90, 80, 70, 95, 80\n\nא. מהו השכיח?\nב. כמה פעמים מופיע השכיח?',
    answer: 'ספירה: 70→2, 80→4, 90→1, 95→1\nא. שכיח = 80 (מופיע הכי הרבה)\nב. השכיח מופיע 4 פעמים',
    xp: 8,
  },
  {
    id: 5, topic: 'טווח',
    text: 'נתון מדגם: 4, 8, 15, 16, 23, 42\n\nא. חשב/י את הטווח\nב. מה הממוצע?',
    answer: 'א. טווח = 42 − 4 = 38\nב. ממוצע = (4+8+15+16+23+42) ÷ 6 = 108 ÷ 6 = 18',
    xp: 10,
  },
  {
    id: 6, topic: 'ממוצע',
    text: 'ממוצע ציוני 4 תלמידים הוא 80. תלמיד חמישי קיבל 100.\nמהו הממוצע החדש?',
    answer: 'סכום 4 תלמידים = 4 × 80 = 320\nסכום חדש = 320 + 100 = 420\nממוצע חדש = 420 ÷ 5 = 84',
    xp: 12,
  },
  {
    id: 7, topic: 'חציון',
    text: 'סדרה: 2, 4, 6, 8, 10, 12\nמצא/י חציון לסדרה זו ונמק/י.',
    answer: 'הסדרה כבר מסודרת בסדר עולה. 6 ערכים זוגי.\nחציון = ממוצע הערך ה-3 וה-4 = (6+8) ÷ 2 = 7\nהחציון הוא 7 (אינו אחד מהערכים בסדרה)',
    xp: 10,
  },
  {
    id: 8, topic: 'שכיח',
    text: 'נתוני מכירות שבועיות: 5, 8, 5, 12, 8, 5, 9, 5\n\nא. מהו השכיח?\nב. האם הממוצע גדול מהשכיח?',
    answer: 'ספירה: 5→4, 8→2, 12→1, 9→1\nא. שכיח = 5\nב. ממוצע = (5+8+5+12+8+5+9+5) ÷ 8 = 57 ÷ 8 = 7.125\n   כן, הממוצע (7.125) גדול מהשכיח (5)',
    xp: 12,
  },
]

// ── Activity chart SVG — driven by real XP history (wafflestack-xp-history) ───
const HE_DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const XP_HISTORY_KEY = 'wafflestack-xp-history'

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface ActivityDay {
  key: string
  dayHe: string
  value: number
  isToday: boolean
}

// Mirrors ScoreBoard.buildWeeklyBars: cumulative XP snapshot per day → daily delta.
function loadActivityWeek(): ActivityDay[] {
  let history: Record<string, number> = {}
  try {
    const raw = localStorage.getItem(XP_HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') history = parsed
    }
  } catch { /* ignore corrupt history */ }

  const today = new Date()
  const todayKey = dateKey(today)
  const windowStart = new Date(today); windowStart.setDate(windowStart.getDate() - 6)
  const windowStartKey = dateKey(windowStart)
  const earlierKeys = Object.keys(history).filter(k => k < windowStartKey).sort()
  let prevXp = earlierKeys.length > 0 ? history[earlierKeys[earlierKeys.length - 1]] : 0

  const days: ActivityDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = dateKey(d)
    const recorded = history[key]
    const xpEnd = recorded !== undefined ? recorded : prevXp
    const delta = Math.max(0, xpEnd - prevXp)
    days.push({ key, dayHe: HE_DAY_NAMES[d.getDay()], value: delta, isToday: key === todayKey })
    prevXp = xpEnd
  }
  return days
}

function ActivityChart() {
  const week = loadActivityWeek()
  const values = week.map(w => w.value)
  const total = values.reduce((s, v) => s + v, 0)
  const dataMax = values.reduce((m, v) => Math.max(m, v), 0)
  // Floor at 100 so an empty week still draws sensible gridlines.
  const niceMax = dataMax === 0
    ? 100
    : Math.max(100, Math.ceil((dataMax * 1.15) / 50) * 50)
  const tickStep = niceMax / 4

  const W = 460, H = 200, padL = 36, padB = 28, padT = 10, padR = 10
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const toX = (i: number) => padL + (i / (week.length - 1)) * innerW
  const toY = (v: number) => padT + innerH - (v / niceMax) * innerH

  const pts = values.map((v, i) => [toX(i), toY(v)] as [number, number])
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = line + ` L${pts[pts.length-1][0]},${padT+innerH} L${pts[0][0]},${padT+innerH} Z`
  const ticks = [0, tickStep, tickStep * 2, tickStep * 3, niceMax]

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px 10px', direction: 'rtl' as const,
      }}>
        <span style={{
          fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 700, color: TEXT_DARK,
        }}>
          📈 פעילות השבוע
        </span>
        <span style={{
          fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
          color: total > 0 ? '#D4AF37' : TEXT_LIGHT, fontVariantNumeric: 'tabular-nums',
        }}>
          {total > 0 ? `+${total.toLocaleString()} XP` : 'אין פעילות עדיין'}
        </span>
      </div>
      <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.45)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.03)" />
          </linearGradient>
        </defs>
        {ticks.map(v => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={padL+innerW} y2={toY(v)} stroke="#DBDEE4" strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL-5} y={toY(v)+4} textAnchor="end" fontSize={10} fill="#54555A" fontFamily="Inter">{Math.round(v)}</text>
          </g>
        ))}
        <path d={area} fill="url(#chartArea)" />
        <path d={line} fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => {
          const day = week[i]
          return (
            <g key={i}>
              <circle
                cx={x} cy={y}
                r={day.isToday ? 5 : 3.5}
                fill={day.isToday ? '#FFC700' : '#D4AF37'}
                stroke={day.isToday ? '#fff' : 'none'}
                strokeWidth={day.isToday ? 1.5 : 0}
              >
                <title>{`${day.key}: +${day.value} XP`}</title>
              </circle>
            </g>
          )
        })}
        {week.map((day, i) => (
          <text
            key={i}
            x={toX(i)} y={H-4}
            textAnchor="middle"
            fontSize={9}
            fill={day.isToday ? '#D4AF37' : '#54555A'}
            fontWeight={day.isToday ? 700 : 400}
            fontFamily="Rubik"
          >
            {day.dayHe}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onGoWorld, onGoMindmap, width = 247 }: {
  active: InternalView
  onNav: (v: InternalView) => void
  onGoWorld: () => void
  onGoMindmap: () => void
  width?: number
}) {
  const items: Array<{ id: InternalView | null; label: string; icon: string; action?: string }> = [
    { id: 'home',     label: 'דף הבית',      icon: '⌂' },
    { id: 'topics',   label: 'אזור למידה',   icon: '📖' },
    { id: null,       label: 'מפת לימוד',    icon: '◫', action: 'mindmap' },
    { id: null,       label: 'העולם שלי',    icon: '🌐', action: 'world' },
  ]

  const collapsed = width < 80
  return (
    <div style={{
      background: SIDEBAR_BG,
      width: '100%',
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(51,81,202,0.25)',
      overflow: 'hidden',
    }}>
      {/* Logo / avatar area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(31,41,55,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {/* Diamond icon matching Figma */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polygon points="18,4 30,14 18,32 6,14" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
            <polygon points="18,4 30,14 18,17 6,14" fill="rgba(255,255,255,0.3)" />
            <line x1="6" y1="14" x2="30" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => {
          const isActive = item.id !== null && item.id === active
          return (
            <button key={i}
              onClick={() => {
                if (item.action === 'world') { onGoWorld(); return }
                if (item.action === 'mindmap') { onGoMindmap(); return }
                if (item.id !== null) onNav(item.id)
              }}
              title={collapsed ? item.label : undefined}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                borderRadius: 32,
                padding: collapsed ? '12px 0' : '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-end',
                gap: 12,
                direction: 'rtl',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 17,
                fontWeight: isActive ? 600 : 400,
                color: '#FFFFFF',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              <span style={{ fontSize: 20, opacity: 0.85, width: 26, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── Top bar ────────────────────────────────────────────────────────────────────
function TopBar({ title, onLogout }: { title: string; onLogout?: () => void }) {
  const userName = localStorage.getItem('userName') || 'Student'
  const xp = useLearningStore(state => state.xp)
  return (
    <div style={{
      background: 'var(--sh-topbar-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--sh-topbar-border)',
      height: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
    }} dir="rtl">
      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 32, color: TEXT_LIGHT, margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} dir="ltr">
        {/* XP pill */}
        <span style={{
          background: 'rgba(212,175,55,0.15)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: 999,
          padding: '3px 10px',
          color: '#D4AF37',
          fontSize: 13,
          fontFamily: "'Rubik', sans-serif",
        }}>
          ⭐ {xp} XP
        </span>
        <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK }}>Hi, {userName}</span>
        {/* Logout button */}
        {onLogout && (
          <button onClick={onLogout} title="התנתק" style={{
            background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.2)',
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
            color: '#d32f2f', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
          }}>
            ↩ יציאה
          </button>
        )}
      </div>
    </div>
  )
}

// ── Home screen ────────────────────────────────────────────────────────────────
function HomeScreen({ onGoLearning, onGoWorld, onGoMindmap }: {
  onGoLearning: () => void
  onGoWorld: () => void
  onGoMindmap: () => void
}) {
  const xp = useLearningStore(s => s.xp)
  const totalCorrect = useLearningStore(s => s.totalCorrect)
  const currentStreak = useLearningStore(s => s.currentStreak)
  const XP_PER_LEVEL = 100
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }} dir="rtl">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── ROW 1 ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* Card: כמעט שם! */}
          <div style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 22px',
            display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 6 }}>כמעט שם!</div>
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_TIP, lineHeight: 1.6, marginBottom: 16 }}>
              נשארו לך רק 2 שאלות בקורס<br />סטטיסטיקה תיאורית
            </div>
            {/* Building photo */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16, minHeight: 120 }}>
              <img
                src={`${import.meta.env.BASE_URL}building-figma.png`}
                alt="building"
                style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', borderRadius: 12, filter: 'drop-shadow(0 4px 12px rgba(31,41,55,0.2))' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginBottom: 8, textAlign: 'right' }}>המבנה הבא בעירך</div>
            {/* Progress bar */}
            <div style={{ height: 7, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: '63%', height: '100%', background: 'rgba(212,175,55,0.7)', borderRadius: 10 }} />
            </div>
            <button onClick={onGoLearning}
              style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px #8DA7FF' }}>
              המשך ←
            </button>
          </div>

          {/* Card: לוח לבן דיגיטלי */}
          <div style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 24px',
            display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.5)',
            position: 'relative',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_MED, marginBottom: 16, textAlign: 'right' }}>לוח לבן דיגיטלי</div>
            {/* Whiteboard area with glassmorphism */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.51) 54.33%, rgba(255,255,255,0.17) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: CARD_SHADOW,
              borderRadius: CARD_RADIUS,
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 160,
            }}>
              {/* "טיפ" label */}
              <div style={{ position: 'absolute', top: 16, left: 20, fontFamily: "'Rubik', sans-serif", fontSize: 18, color: TEXT_TIP }}>טיפ</div>
              {/* Floating 3D cube (CSS) */}
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, opacity: 0.7, transform: 'rotate(22deg)' }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="40,5 75,22 75,58 40,75 5,58 5,22" fill="rgba(131,178,248,0.35)" stroke="rgba(131,178,248,0.6)" strokeWidth="1.5" />
                  <polygon points="40,5 75,22 40,39 5,22" fill="rgba(131,178,248,0.5)" stroke="rgba(131,178,248,0.7)" strokeWidth="1" />
                  <polygon points="40,39 75,22 75,58 40,75" fill="rgba(51,81,202,0.25)" />
                </svg>
              </div>
              <div style={{ position: 'absolute', bottom: -15, left: -15, width: 70, height: 70, opacity: 0.5, transform: 'rotate(-89deg)' }}>
                <svg viewBox="0 0 70 70" fill="none">
                  <ellipse cx="35" cy="35" rx="30" ry="28" fill="rgba(51,81,202,0.2)" stroke="rgba(131,178,248,0.4)" strokeWidth="1" />
                  <ellipse cx="35" cy="35" rx="18" ry="16" fill="rgba(51,81,202,0.3)" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 18, color: TEXT_DARK, lineHeight: 1.9, textAlign: 'right', marginTop: 40 }}>
                היי, היום אנחנו הולכים לכבוש את<br />
                {'\''}חציון ושכיח{'\''}  ולפתוח את מגדל השעון<br />
                בעיר שלך!
              </div>
            </div>
            {/* CTA button */}
            <button onClick={onGoMindmap} style={{ marginTop: 12, background: 'linear-gradient(90deg,#254A9F,#3351CA)', color:'#fff', border:'none', borderRadius:24, padding:'10px 0', fontWeight:600, fontSize:15, cursor:'pointer', fontFamily:"'Rubik',sans-serif", width:'100%', boxShadow:'0px 2px 6px rgba(51,81,202,0.4)' }}>
              🗺 פתח מפת מושגים
            </button>
          </div>
        </div>

        {/* ── LEARNING PATH STRIP ─────────────────────── */}
        <div style={{
          background: GLASS_CARD_SM,
          backdropFilter: 'blur(20px)',
          boxShadow: CARD_SHADOW,
          borderRadius: CARD_RADIUS,
          padding: '22px 40px',
          border: '1px solid rgba(255,255,255,0.4)',
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', left: '10%', right: '10%', top: 28, height: 1, border: '1px solid #F4C52E', zIndex: 0 }} />

            {/* Stage: ממוצע (הושלם) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{
                width: 35, height: 35,
                background: 'rgba(22,41,70,0.4)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                transform: 'matrix(1,0,0,-1,0,0)',
                boxShadow: '0px 3px 5.8px rgba(31,41,55,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l4 4 8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: TEXT_DARK, textAlign: 'center' }}>ממוצע</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>(הושלם)</div>
            </div>

            {/* Stage: חציון ושכיח (עכשיו) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{
                width: 35, height: 35,
                background: 'linear-gradient(115.34deg, rgba(255,194,0,0.35) -8.31%, rgba(154,106,4,0.5) 168.93%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                boxShadow: '0px 3px 5.8px rgba(142,122,59,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Gold gem */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <polygon points="9,2 15,7 9,16 3,7" fill="rgba(212,175,55,0.8)" stroke="rgba(212,175,55,1)" strokeWidth="1" />
                  <polygon points="9,2 15,7 9,10 3,7" fill="rgba(255,220,80,0.5)" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 600, color: TEXT_DARK, textAlign: 'center' }}>חציון ושכיח</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>(עכשיו)</div>
            </div>

            {/* Stage: סטיית תקן (בקרוב) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{
                width: 27, height: 27,
                background: 'linear-gradient(34.36deg, #E6C55D -10.48%, #806E34 267.01%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                boxShadow: '0px 3px 5.8px rgba(142,122,59,0.5)',
                transform: 'matrix(1,0,0,-1,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="2" width="6" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
                  <path d="M5 5.5h4M5 7.5h3" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
                  <circle cx="7" cy="11" r="1.5" fill="rgba(255,255,255,0.5)" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: TEXT_DARK, textAlign: 'center' }}>סטיית תקן</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>(בקרוב)</div>
            </div>
          </div>
        </div>

        {/* ── ROW 2 ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Card: Activity chart */}
          <div style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: '24px 20px 16px',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <ActivityChart />
          </div>

          {/* Card: העולם שלי */}
          <div style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: 28,
            display: 'flex', flexDirection: 'column', gap: 12,
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, textAlign: 'right' }}>העולם שלי</div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'center', background: 'rgba(212,175,55,0.12)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: '#D4AF37' }}>⭐ {xp}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>XP סה"כ</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(52,168,83,0.10)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(52,168,83,0.25)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: '#34A853' }}>✓ {totalCorrect}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>תשובות נכונות</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(51,81,202,0.10)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(51,81,202,0.22)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_MED }}>🔥 {currentStreak}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>ימים ברצף</div>
              </div>
            </div>

            {/* XP level bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>Level {level}</span>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>{xpInLevel}/{XP_PER_LEVEL} XP</span>
              </div>
              <div style={{ height: 7, background: 'rgba(212,175,55,0.15)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%`, height: '100%', background: 'rgba(212,175,55,0.75)', borderRadius: 10, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{ flex: 1 }} />
            <button onClick={onGoWorld}
              style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px #8DA7FF' }}>
              כניסה לעולם 🌆
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── XP Burst animation ─────────────────────────────────────────────────────────
function XpBurst({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, pointerEvents: 'none',
      animation: 'xpBurst 1.4s ease-out forwards',
    }}>
      <style>{`
        @keyframes xpBurst {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(0px); }
          20%  { opacity: 1; transform: translateX(-50%) scale(1.3) translateY(-10px); }
          70%  { opacity: 1; transform: translateX(-50%) scale(1.1) translateY(-30px); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(-60px); }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg,#D4AF37,#F5CC50)',
        borderRadius: 99, padding: '10px 22px',
        boxShadow: '0 4px 24px rgba(212,175,55,0.5)',
        fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22,
        color: '#fff', whiteSpace: 'nowrap',
      }}>
        +{amount} XP ⭐
      </div>
    </div>
  )
}

// ── Learning area screen ───────────────────────────────────────────────────────
interface LearningScreenProps {
  onBack: () => void
  selectedTopic?: string
  userProgress: UserProgress
  onProgressUpdate: (progress: UserProgress) => void
}

function LearningScreen({ onBack, selectedTopic, userProgress, onProgressUpdate }: LearningScreenProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<'write' | 'review' | 'done'>('write')
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  const [showCanvas, setShowCanvas] = useState(true)
  const [canvasPct, setCanvasPct] = useState(42)
  const canvasDragging = useRef(false)
  const contentRowRef = useRef<HTMLDivElement>(null)
  const recordAnswer = useLearningStore(s => s.recordAnswer)

  const onCanvasDragStart = useCallback((e: React.MouseEvent) => {
    canvasDragging.current = true
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      if (!canvasDragging.current || !contentRowRef.current) return
      const rect = contentRowRef.current.getBoundingClientRect()
      const fromLeft = ev.clientX - rect.left
      const pct = Math.min(65, Math.max(25, ((rect.width - fromLeft) / rect.width) * 100))
      setCanvasPct(pct)
    }
    const onUp = () => {
      canvasDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // Load questions from selected topic or fallback to hardcoded
  const questions = selectedTopic && (quizBankData.topics as Record<string, any>)[selectedTopic]
    ? (quizBankData.topics as Record<string, any>)[selectedTopic].questions.map((q: any) => ({
        id: q.id,
        topic: selectedTopic,
        text: q.question,
        answer: q.explanation,
        xp: 15,
      }))
    : QUESTIONS

  const [dotStates, setDotStates] = useState<Array<'empty' | 'current' | 'correct' | 'wrong' | 'future'>>(
    questions.map((_: any, i: number) => i === 0 ? 'current' : 'empty')
  )

  const q = questions[currentQ]
  const total = questions.length
  const answeredCount = dotStates.filter(s => s === 'correct' || s === 'wrong').length
  const correctCount = dotStates.filter(s => s === 'correct').length

  const handleReveal = () => {
    if (!answer.trim()) return
    setPhase('review')
  }

  const handleSelfAssess = (correct: boolean) => {
    const xpReward = correct ? q.xp : 0
    recordAnswer(`studyhub-q${q.id}`, correct, xpReward)

    const next = [...dotStates]
    next[currentQ] = correct ? 'correct' : 'wrong'
    setDotStates(next)

    if (correct && xpReward > 0) {
      setXpBurst(xpReward)
    }

    // auto advance after a moment
    setTimeout(() => goNext(next), correct ? 900 : 600)
  }

  const handleQuizComplete = () => {
    if (!selectedTopic) return

    // Record quiz session in progress store
    const topicData = (quizBankData.topics as Record<string, any>)[selectedTopic]
    if (!topicData) return

    const answers: QuizAnswer[] = questions.map((q: any, i: number) => ({
      questionId: q.id || `q${i}`,
      answered: dotStates[i] !== 'empty',
      correct: dotStates[i] === 'correct',
      userAnswer: answer,
    }))

    const duration = 0 // Could track actual time if needed
    const updatedProgress = recordQuizSession(
      userProgress,
      selectedTopic,
      topicData.concept || selectedTopic,
      topicData.building || '',
      answers,
      duration
    )

    onProgressUpdate(updatedProgress)
  }

  const handleSkip = () => {
    const next = [...dotStates]
    next[currentQ] = 'wrong'
    setDotStates(next)
    goNext(next)
  }

  const goNext = (currentDots?: typeof dotStates) => {
    const dots = currentDots ?? dotStates
    const ni = currentQ + 1
    if (ni >= total) {
      setPhase('done')
      return
    }
    const next = [...dots]
    if (next[ni] === 'empty') next[ni] = 'current'
    setDotStates(next)
    setCurrentQ(ni)
    setAnswer('')
    setPhase('write')
  }

  const handleReset = () => {
    setCurrentQ(0)
    setAnswer('')
    setPhase('write')
    setDotStates(QUESTIONS.map((_, i) => i === 0 ? 'current' : 'empty'))
  }

  const isDone = phase === 'done'

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} dir="rtl">
      {xpBurst !== null && <XpBurst amount={xpBurst} onDone={() => setXpBurst(null)} />}

      {/* Top bar */}
      <div style={{ background: '#FFFFFF', boxShadow: '2px 2px 6px rgba(0,0,0,0.18)', height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, gap: 12 }}>
        <img src={`${import.meta.env.BASE_URL}building-figma.png`} alt="" style={{ width: 34, height: 26, objectFit: 'cover', borderRadius: 5 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${isDone ? 100 : ((currentQ)/total)*100}%`, height: '100%', background: 'rgba(212,175,55,0.75)', borderRadius: 10, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 11, color: TEXT_LIGHT, marginTop: 2 }}>
            {answeredCount} / {total} · {correctCount} ✓
          </div>
        </div>
        <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 14, color: TEXT_DARK }}>
          <span style={{ fontWeight: 700 }}>סטטיסטיקה</span>{!isDone && ` | ${q.topic}`}
        </div>
        {/* Canvas toggle */}
        <button
          onClick={() => setShowCanvas(v => !v)}
          title={showCanvas ? 'הסתר לוח ציור' : 'הצג לוח ציור'}
          style={{
            background: showCanvas ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${showCanvas ? 'rgba(99,102,241,0.5)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
            color: showCanvas ? '#6366f1' : '#64748b', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          }}
        >
          ✏️ {showCanvas ? 'הסתר לוח' : 'לוח ציור'}
        </button>
      </div>

      {/* Content row: question panel + optional canvas */}
      <div ref={contentRowRef} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Question panel */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 24px' }}>
        <div style={{
          background: 'var(--sh-q-card-bg)',
          borderRadius: 20, width: '100%', maxWidth: showCanvas ? 'none' : 900,
          padding: '24px 28px 22px', position: 'relative',
          boxShadow: '0 8px 32px rgba(51,81,202,0.12)',
        }}>

          {isDone ? (
            /* ── Completion panel ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 18 }}>
              <div style={{ fontSize: 60 }}>🏆</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 28, color: TEXT_DARK, textAlign: 'center' }}>
                סיימת את הסשן!
              </div>
              <div style={{ display: 'flex', gap: 24, margin: '4px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#34A853' }}>{correctCount}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>נכון</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#EA4335' }}>{total - correctCount}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>לשיפור</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#D4AF37' }}>
                    {questions.filter((_: any, i: number) => dotStates[i] === 'correct').reduce((s: number, q: any) => s + q.xp, 0)}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>XP הרווחת</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <button onClick={() => {
                  handleQuizComplete()
                  onBack()
                }}
                  style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0px 2px 6px rgba(18,36,96,0.3)' }}>
                  חזור לדף הבית
                </button>
                <button onClick={handleReset}
                  style={{ background: '#fff', color: BUTTON_COLOR, border: `2px solid ${BUTTON_COLOR}`, borderRadius: 24, padding: '12px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                  סשן נוסף
                </button>
              </div>
            </div>

          ) : phase === 'write' ? (
            /* ── Write your answer ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>
                  +{q.xp} XP ⭐
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>
                  שאלה {currentQ + 1} / {total}
                </div>
              </div>

              <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 19, color: 'var(--sh-q-text-color)', lineHeight: 2.1, whiteSpace: 'pre-line', textAlign: 'right', marginBottom: 22 }}>
                {q.text}
              </div>

              <div style={{ border: `2px solid ${answer.trim() ? '#3351CA' : '#C8D0E0'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 18, transition: 'border-color 0.2s' }}>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="כתוב/י את פתרונך כאן..."
                  dir="rtl"
                  style={{
                    width: '100%', minHeight: 110,
                    border: 'none', outline: 'none',
                    padding: '14px 18px',
                    fontSize: 18, color: TEXT_DARK,
                    background: 'transparent',
                    fontFamily: "'Assistant', sans-serif",
                    resize: 'vertical', direction: 'rtl',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_LIGHT, cursor: 'pointer', textDecoration: 'underline' }} onClick={handleSkip}>דלג</span>

                {/* Dots */}
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {dotStates.map((state, i) => {
                    const bg = state === 'correct' ? '#34A853' : state === 'wrong' ? '#EA4335' : state === 'current' ? BUTTON_COLOR : '#D8E0F0'
                    return (
                      <div key={i} style={{ width: state === 'current' ? 14 : 10, height: state === 'current' ? 14 : 10, borderRadius: '50%', background: bg, transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#fff', fontWeight: 700 }}>
                        {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : ''}
                      </div>
                    )
                  })}
                </div>

                <button onClick={handleReveal} disabled={!answer.trim()}
                  style={{ background: answer.trim() ? BUTTON_COLOR : '#C8D0E0', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 28px', fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 700, cursor: answer.trim() ? 'pointer' : 'not-allowed', boxShadow: answer.trim() ? '0px 2px 6px #8DA7FF' : 'none', transition: 'all 0.2s' }}>
                  בדוק תשובה ←
                </button>
              </div>
            </>

          ) : (
            /* ── Review: show model answer ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>+{q.xp} XP ⭐ אם נכון</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>שאלה {currentQ + 1} / {total}</div>
              </div>

              {/* User's answer */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT, marginBottom: 6, textAlign: 'right' }}>התשובה שלך:</div>
                <div style={{ background: 'var(--sh-answer-bg)', borderRadius: 10, padding: '12px 16px', border: '1.5px solid var(--sh-answer-border)', fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_DARK, lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                  {answer}
                </div>
              </div>

              {/* Model answer */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: '#34A853', marginBottom: 6, textAlign: 'right', fontWeight: 600 }}>✅ פתרון מלא:</div>
                <div style={{ background: 'linear-gradient(135deg, rgba(52,168,83,0.08), rgba(52,168,83,0.04))', borderRadius: 10, padding: '14px 18px', border: '1.5px solid rgba(52,168,83,0.3)', fontFamily: "'Assistant', sans-serif", fontSize: 17, color: TEXT_DARK, lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                  {q.answer}
                </div>
              </div>

              {/* Self-assessment */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_MED, marginBottom: 14 }}>
                  כמה הצלחת?
                </div>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                  <button onClick={() => handleSelfAssess(false)}
                    style={{ background: 'rgba(234,67,53,0.1)', color: '#EA4335', border: '2px solid rgba(234,67,53,0.35)', borderRadius: 24, padding: '10px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                    😅 לא ממש
                  </button>
                  <button onClick={() => handleSelfAssess(true)}
                    style={{ background: 'rgba(52,168,83,0.1)', color: '#34A853', border: '2px solid rgba(52,168,83,0.35)', borderRadius: 24, padding: '10px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                    ✅ הצלחתי!
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
        </div>{/* end question panel */}

        {/* Drag handle between quiz and canvas */}
        {showCanvas && !isDone && (
          <div
            onMouseDown={onCanvasDragStart}
            title="גרור כדי לשנות גודל"
            style={{
              width: 8, flexShrink: 0, cursor: 'col-resize',
              background: 'linear-gradient(180deg,rgba(31,62,108,0.0),rgba(37,74,159,0.35),rgba(31,62,108,0.0))',
              borderLeft: '1px solid rgba(127,155,217,0.25)',
              borderRight: '1px solid rgba(127,155,217,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              position: 'relative',
            }}
          >
            {/* Grip dots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, pointerEvents: 'none' }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(127,155,217,0.6)' }} />
              ))}
            </div>
          </div>
        )}

        {/* Canvas panel — standalone whiteboard iframe */}
        {showCanvas && !isDone && (
          <div style={{
            width: `${canvasPct}%`, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            background: '#0d1628',
          }}>
            <div style={{
              height: 32, background: 'linear-gradient(135deg,#1F3E6C,#1a3260)',
              borderBottom: '1px solid rgba(127,155,217,0.2)',
              display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(31,62,108,0.2)',
            }}>
              <span style={{ fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>✏️ לוח ציור</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginRight: 'auto' }}>רשום את פתרונך</span>
              <span style={{ fontSize: 9, color: 'rgba(127,155,217,0.6)' }}>⟵ גרור כדי לשנות גודל</span>
            </div>
            <iframe
              src={`${import.meta.env.BASE_URL}mindmap.html?mode=wb`}
              title="Study Whiteboard"
              style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        )}

      </div>{/* end content row */}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser())
  const [internalView, setInternalView] = useState<InternalView>('home')
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const user = getCurrentUser() || initializeUser()
    return loadProgress(user.userId)
  })
  const [sidebarWidth, setSidebarWidth] = useState(247)
  const sidebarDragging = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const onSidebarDragStart = useCallback((e: React.MouseEvent) => {
    sidebarDragging.current = true
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      if (!sidebarDragging.current || !rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const fromRight = rect.right - ev.clientX
      setSidebarWidth(Math.min(360, Math.max(60, fromRight)))
    }
    const onUp = () => {
      sidebarDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const title = internalView === 'home' ? 'דף הבית' : internalView === 'topics' ? 'אזור למידה' : 'אזור למידה'

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId)
    setInternalView('learning')
  }

  const handleProgressUpdate = (updated: UserProgress) => {
    setUserProgress(updated)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setUserProgress(loadProgress(user.userId))
    localStorage.setItem('userName', user.displayName || user.username)
  }

  const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
  }

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', direction: 'rtl', background: PAGE_BG, fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
      {/* Sidebar — right side (RTL) */}
      <div style={{ width: sidebarWidth, flexShrink: 0, position: 'relative', display: 'flex' }}>
        <Sidebar
          active={internalView}
          onNav={(view) => {
            if (view === 'topics') {
              setInternalView('topics')
            } else {
              setInternalView(view)
            }
          }}
          onGoWorld={() => onViewChange('3d')}
          onGoMindmap={() => onViewChange('mindmap')}
          width={sidebarWidth}
        />
        {/* Sidebar resize handle — on the left edge (RTL: left is outer edge) */}
        <div
          onMouseDown={onSidebarDragStart}
          title="גרור לשינוי רוחב הסרגל"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
            cursor: 'col-resize', zIndex: 10,
            background: 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(127,155,217,0.35)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title={title} onLogout={handleLogout} />
        {internalView === 'home' && (
          <HomeScreen
            onGoLearning={() => setInternalView('topics')}
            onGoWorld={() => onViewChange('3d')}
            onGoMindmap={() => onViewChange('mindmap')}
          />
        )}
        {internalView === 'topics' && (
          <TopicSelector
            userProgress={userProgress}
            onSelectTopic={handleSelectTopic}
            onBack={() => setInternalView('home')}
          />
        )}
        {internalView === 'learning' && (
          <LearningScreen
            onBack={() => setInternalView('topics')}
            selectedTopic={selectedTopic}
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default StudyHub
