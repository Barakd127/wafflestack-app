import { useState, useEffect, useRef, useCallback } from 'react'
import { useLearningStore } from '../store/learningStore'
import { initializeUser, getCurrentUser, loginUser, registerUser, logoutUser, listUsers, deleteUser, type User } from '../stores/authStore'
import { loadProgress, recordQuizSession, saveCanvasNotes, type QuizAnswer, type UserProgress } from '../stores/progressStore'
import quizBankData from '../data/quiz-bank.json'
import LessonScreen from './LessonScreen'
import { LESSON_CONTENT } from '../data/lesson-content'
import ArsenalScreen from './ArsenalScreen'
import { useArsenalStore, quickAddArsenal } from '../store/arsenalStore'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode?: boolean
}

type InternalView = 'home' | 'learning' | 'topics' | 'lesson' | 'quiz-intro' | 'arsenal' | 'complete'

// Hebrew labels for each topic (quiz-bank concept field is English)
const HEBREW_LABELS: Record<string, string> = {
  'mean':                 'ממוצע',
  'median':               'חציון',
  'std-dev':              'סטיית תקן',
  'probability':          'הסתברות',
  'regression':           'רגרסיה',
  'correlation':          'קורלציה',
  'binomial':             'בינום',
  'hypothesis-testing':   'מבחן השערות',
  'sampling':             'מדגם',
  'confidence-intervals': 'רווח סמך',
}

// Extract topics from quiz-bank data
const QUIZ_TOPICS = Object.entries(quizBankData.topics || {}).map(([key, data]: [string, any]) => ({
  id: key,
  label: HEBREW_LABELS[key] || data.concept || key,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await loginUser(username, password)
        if (result) {
          onLogin(result)
        } else {
          setError('שם משתמש או סיסמה שגויים')
        }
      } else {
        const result = await registerUser(username, password, displayName)
        if (typeof result === 'string') {
          setError(result)
        } else {
          onLogin(result)
        }
      }
    } finally {
      setLoading(false)
    }
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

// ── Quiz Intro Card ─────────────────────────────────────────────────────────────
// Centred preview screen shown before launching the actual quiz. Replaces the
// previous "instant pop-up" behaviour where pressing 📝 תרגול jumped straight
// into the question carousel.
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

function QuizIntroCard({ topicId, onStart, onBack, onReadLesson }: {
  topicId: string
  onStart: (difficulty: DifficultyFilter) => void
  onBack: () => void
  onReadLesson: () => void
}) {
  const topicData = (quizBankData.topics as Record<string, { concept?: string; questions?: Array<{ difficulty: string }> }>)[topicId]
  const questions = topicData?.questions || []
  const counts: Record<DifficultyFilter, number> = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  }
  const hebrewName = HEBREW_LABELS[topicId] || topicData?.concept || topicId
  const hasLesson = LESSON_CONTENT.some(t => t.id === topicId)
  const [selected, setSelected] = useState<DifficultyFilter>('all')

  return (
    <div dir="rtl" style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: "'Rubik', 'Assistant', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 540,
        background: GLASS_CARD,
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: CARD_SHADOW,
        border: '1px solid rgba(255,255,255,0.5)',
        padding: 36,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📝</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px' }}>
          תרגול: {hebrewName}
        </h2>
        <div style={{ fontSize: 14, color: TEXT_LIGHT, marginBottom: 22 }}>
          בחר/י רמת קושי. מקל למאתגר.
        </div>

        {/* Difficulty selector — clickable cards, one of which is selected */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          <DifficultySelectorCard
            label="הכל" count={counts.all} icon="🎯"
            color="#6366f1" bg="rgba(99,102,241,0.12)"
            selected={selected === 'all'} onClick={() => setSelected('all')} />
          <DifficultySelectorCard
            label="קל" count={counts.easy} icon="🌱"
            color="#10b981" bg="rgba(16,185,129,0.12)"
            selected={selected === 'easy'} onClick={() => setSelected('easy')}
            disabled={counts.easy === 0} />
          <DifficultySelectorCard
            label="בינוני" count={counts.medium} icon="⚡"
            color="#f59e0b" bg="rgba(245,158,11,0.12)"
            selected={selected === 'medium'} onClick={() => setSelected('medium')}
            disabled={counts.medium === 0} />
          <DifficultySelectorCard
            label="מאתגר" count={counts.hard} icon="🔥"
            color="#ef4444" bg="rgba(239,68,68,0.12)"
            selected={selected === 'hard'} onClick={() => setSelected('hard')}
            disabled={counts.hard === 0} />
        </div>

        {/* Pep-talk paragraph */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: 14,
          padding: '14px 18px',
          fontSize: 14,
          color: TEXT_MED,
          lineHeight: 1.7,
          marginBottom: 28,
          textAlign: 'right',
        }}>
          🎯 התשובה תיבדק אוטומטית. תקבל פידבק מיידי, הסבר על כל שאלה, ו-XP על כל תשובה נכונה.
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onStart(selected)} disabled={counts[selected] === 0} style={{
            background: BUTTON_COLOR, color: '#fff', border: 'none',
            borderRadius: 24, padding: '12px 28px',
            fontWeight: 700, fontSize: 16,
            cursor: counts[selected] === 0 ? 'not-allowed' : 'pointer',
            opacity: counts[selected] === 0 ? 0.4 : 1,
            fontFamily: "'Rubik', sans-serif",
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            התחל תרגול ({counts[selected]} שאלות) ←
          </button>
          {hasLesson && (
            <button onClick={onReadLesson} style={{
              background: 'rgba(255,255,255,0.6)', color: TEXT_DARK,
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 24, padding: '12px 22px',
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
            }}>
              📚 קרא תיאוריה
            </button>
          )}
          <button onClick={onBack} style={{
            background: 'transparent', color: TEXT_LIGHT,
            border: 'none', cursor: 'pointer',
            fontSize: 14, padding: '12px 16px', fontFamily: "'Rubik', sans-serif",
          }}>
            → חזרה
          </button>
        </div>
      </div>
    </div>
  )
}

// Small "save to arsenal" chip rendered next to the quiz model-answer header.
// One click saves the explanation as a `gotcha` and shows a brief success state.
function ArsenalQuizCaptureChip({ explanation, topicId }: { explanation: string; topicId?: string }) {
  const [saved, setSaved] = useState(false)
  const handle = () => {
    if (saved || !explanation) return
    quickAddArsenal({ kind: 'gotcha', text: explanation, topicId, source: 'quiz' })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  return (
    <button
      onClick={handle}
      title="שמור את ההסבר כטעות נפוצה בארסנל"
      style={{
        background: saved ? '#10b981' : 'rgba(99,102,241,0.12)',
        color: saved ? '#fff' : '#4338ca',
        border: `1px solid ${saved ? '#10b981' : 'rgba(99,102,241,0.35)'}`,
        borderRadius: 12, padding: '4px 10px',
        cursor: saved ? 'default' : 'pointer',
        fontFamily: "'Rubik', sans-serif",
        fontSize: 11, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        transition: 'all 0.2s ease',
      }}
    >
      {saved ? '✓ נשמר לארסנל' : '🎯 שמור כטעות נפוצה'}
    </button>
  )
}

// Small inline badge shown next to "שאלה X / Y" in the active quiz card —
// communicates the current question's difficulty level and XP reward at a glance.
function QuizDifficultyBadge({ level, xp }: { level: 'easy' | 'medium' | 'hard'; xp: number }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    easy:   { label: 'קל',     bg: 'rgba(16,185,129,0.22)', color: '#a7f3d0' },
    medium: { label: 'בינוני', bg: 'rgba(245,158,11,0.22)', color: '#fde68a' },
    hard:   { label: 'מאתגר',  bg: 'rgba(239,68,68,0.22)',  color: '#fecaca' },
  }
  const c = cfg[level] ?? cfg.medium
  return (
    <span style={{
      marginInlineStart: 8,
      background: c.bg,
      color: c.color,
      borderRadius: 10,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span>{c.label}</span>
      <span style={{ opacity: 0.7, fontSize: 10 }}>+{xp} XP</span>
    </span>
  )
}

function DifficultySelectorCard({ label, count, icon, color, bg, selected, onClick, disabled }: {
  label: string
  count: number
  icon: string
  color: string
  bg: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: selected ? color : bg,
        border: `2px solid ${selected ? color : color + '40'}`,
        color: selected ? '#fff' : color,
        borderRadius: 14,
        padding: '10px 6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        fontFamily: "'Rubik', sans-serif",
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 6px 18px ${color}60` : 'none',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{count}</div>
    </button>
  )
}

// ── Topic Selector Component ───────────────────────────────────────────────────
interface TopicSelectorProps {
  userProgress: UserProgress
  onSelectTopic: (topicId: string, mode: 'lesson' | 'quiz') => void
  onBack: () => void
}

function TopicSelector({ userProgress, onSelectTopic, onBack }: TopicSelectorProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
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
        → חזרה לדף הבית
      </button>

      <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 28, textAlign: 'right' }}>
        בחר נושא ללמוד 📚
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 1200 }}>
        {QUIZ_TOPICS.map(topic => {
          const progress = userProgress.topics[topic.id]
          const isMastered = progress?.mastered
          const bestScore = progress?.bestScore || 0
          const sessionsAttempted = progress?.sessionsAttempted || 0

          return (
            <div
              key={topic.id}
              style={{
                background: GLASS_CARD,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${isMastered ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: CARD_RADIUS,
                padding: 24,
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

              {/* Lesson / Quiz action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => onSelectTopic(topic.id, 'lesson')}
                  style={{
                    flex: 1,
                    background: BUTTON_COLOR,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: "'Rubik', sans-serif",
                    boxShadow: '0px 2px 6px rgba(51,81,202,0.35)',
                  }}
                >
                  📚 תיאוריה
                </button>
                <button
                  onClick={() => onSelectTopic(topic.id, 'quiz')}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.7)',
                    color: TEXT_DARK,
                    border: '1px solid rgba(127,155,217,0.4)',
                    borderRadius: 14,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: "'Rubik', sans-serif",
                  }}
                >
                  📝 תרגול
                </button>
              </div>
            </div>
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
    { id: 'arsenal',  label: 'הארסנל שלי',   icon: '🎯' },
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
                justifyContent: collapsed ? 'center' : 'flex-start',
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
              <span style={{ fontSize: 20, opacity: 0.85, width: 26, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
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
      <h1 style={{
        fontFamily: "'Rubik', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: TEXT_DARK,
        margin: 0,
        letterSpacing: '-0.5px',
        textShadow: '0 1px 4px rgba(255,255,255,0.8)',
      }}>{title}</h1>
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
        <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK }}>שלום, {userName}</span>
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
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>רמה {level}</span>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>{xpInLevel}/{XP_PER_LEVEL} נק׳</span>
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
  difficultyFilter?: DifficultyFilter
  userProgress: UserProgress
  onProgressUpdate: (progress: UserProgress) => void
  userId?: string
}

function LearningScreen({ onBack, selectedTopic, difficultyFilter = 'all', userProgress, onProgressUpdate, userId }: LearningScreenProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<'write' | 'review' | 'done'>('write')
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  // Store each question's typed answer so users can navigate back and re-read
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  // Two-mode layout:
  //   tab === 'none'  → calm centered card, tabs row is the LAUNCHER.
  //   tab !== 'none'  → companion tool fills the screen; question becomes a
  //                     floating chip docked top-right (RTL primary corner).
  //                     chipExpanded toggles between a tiny pill and a full
  //                     compact card with answer field + dots.
  const [tab, setTab] = useState<'none' | 'mindmap' | 'arsenal' | 'canvas'>('none')
  const [chipExpanded, setChipExpanded] = useState<boolean>(true)
  const contentRowRef = useRef<HTMLDivElement>(null)
  const recordAnswer = useLearningStore(s => s.recordAnswer)

  // (Old draggable-card code removed — quiz card is now centered + fixed,
  //  matching LessonScreen's theory layout. See `tab` state above.)

  // Load questions from selected topic, sorted progressively easy → medium → hard.
  // XP scales with difficulty so harder questions feel more rewarding.
  const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
  const DIFFICULTY_XP: Record<string, number> = { easy: 10, medium: 15, hard: 25 }
  const questions = selectedTopic && (quizBankData.topics as Record<string, any>)[selectedTopic]
    ? [...(quizBankData.topics as Record<string, any>)[selectedTopic].questions]
        .filter((q: any) => difficultyFilter === 'all' || q.difficulty === difficultyFilter)
        .sort((a: any, b: any) => (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1))
        .map((q: any) => ({
          id: q.id,
          topic: selectedTopic,
          text: q.question,
          answer: q.explanation,
          xp: DIFFICULTY_XP[q.difficulty] ?? 15,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard' | undefined,
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
    setUserAnswers(prev => ({ ...prev, [currentQ]: answer }))
    setPhase('review')
  }

  // Navigate to any question by clicking its dot
  const navigateToQuestion = (index: number) => {
    if (index === currentQ) return
    const state = dotStates[index]
    // Can only jump to answered or current questions (not future unvisited ones)
    if (state === 'empty') return
    // Save current in-progress answer before leaving
    if (answer.trim()) setUserAnswers(prev => ({ ...prev, [currentQ]: answer }))
    setCurrentQ(index)
    setAnswer(userAnswers[index] || '')
    if (state === 'correct' || state === 'wrong') {
      setPhase('review')
    } else {
      setPhase('write')
    }
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
      <div style={{ background: '#FFFFFF', boxShadow: '2px 2px 6px rgba(0,0,0,0.18)', height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, gap: 12, zIndex: 10 }}>
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
      </div>

      {/* Two-mode layout — calm focus when tab='none', tool-fullscreen with
          docked chip when a companion tool is active. */}
      <div ref={contentRowRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: 'var(--sh-page-bg)', position: 'relative' }}>

        {/* ── Companion tool (renders FIRST so the chip sits on top of it) ── */}
        {!isDone && tab !== 'none' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0d1628', zIndex: 1 }}>
            {tab === 'mindmap' && (
              <iframe
                key="quiz-mm"
                src={`${import.meta.env.BASE_URL}mindmap.html?userId=${userId || 'default'}`}
                title="מפת חשיבה — תוך כדי תרגול"
                style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
                allow="clipboard-read; clipboard-write"
              />
            )}
            {tab === 'canvas' && (
              <iframe
                key="quiz-wb"
                src={`${import.meta.env.BASE_URL}mindmap.html?mode=wb&userId=${userId || 'default'}`}
                title="קנבס — תוך כדי תרגול"
                style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
                allow="clipboard-read; clipboard-write"
              />
            )}
            {tab === 'arsenal' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} dir="rtl">
                <ArsenalScreen />
              </div>
            )}
          </div>
        )}

        {/* ── Floating mini-pill (only when chip is collapsed in tool mode) ── */}
        {!isDone && tab !== 'none' && !chipExpanded && (
          <button
            onClick={() => setChipExpanded(true)}
            title="הצג שאלה"
            style={{
              position: 'absolute', top: 14, insetInlineEnd: 14, zIndex: 50,
              background: 'linear-gradient(135deg,#1F3E6C,#2c4f8a)',
              border: '1px solid rgba(127,155,217,0.5)',
              borderRadius: 22, padding: '8px 16px',
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            📝 שאלה {currentQ + 1} / {total}
            {(q as any)?.difficulty && <QuizDifficultyBadge level={(q as any).difficulty} xp={q.xp} />}
          </button>
        )}

        {/* ── Question card — calm-centered when tab='none', floating chip when tool active ── */}
        {(tab === 'none' || chipExpanded || isDone) && (
        <div style={
          tab === 'none' || isDone
            ? { flexShrink: 0, padding: '18px 24px 12px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }
            : { position: 'absolute', top: 14, insetInlineEnd: 14, zIndex: 60, width: 'min(420px, calc(100vw - 28px))', maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }
        }>
          <div style={
            tab === 'none' || isDone
              ? {
                  width: 'min(720px, 100%)',
                  background: 'var(--sh-q-card-bg, #ffffff)',
                  borderRadius: 18,
                  boxShadow: 'var(--sh-card-shadow)',
                  border: '1px solid rgba(127,155,217,0.3)',
                  overflow: 'hidden',
                }
              : {
                  width: '100%',
                  background: 'var(--sh-q-card-bg, #ffffff)',
                  borderRadius: 14,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(127,155,217,0.45)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  maxHeight: 'inherit',
                }
          }>
            {/* Card header strip — same gradient as LessonScreen, with collapse btn in chip mode */}
            <div style={{
              background: 'linear-gradient(135deg,#1F3E6C,#2c4f8a)',
              color: '#fff', padding: '10px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600,
              flexShrink: 0,
            }}>
              <span>{isDone ? '🏆 סיום' : `שאלה ${currentQ + 1} / ${total}`}</span>
              {!isDone && (q as any).difficulty && <QuizDifficultyBadge level={(q as any).difficulty} xp={q.xp} />}
              {!isDone && tab !== 'none' && (
                <button
                  onClick={() => setChipExpanded(false)}
                  title="כווץ"
                  aria-label="כווץ שאלה"
                  style={{ marginInlineStart: 'auto', background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 6, width: 26, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ▴
                </button>
              )}
            </div>

            {/* Card body — height/scroll scales with mode */}
            <div style={{
              padding: '20px 22px 18px',
              maxHeight: tab !== 'none' && !isDone ? 'calc(100vh - 280px)' : 'min(60vh, 520px)',
              overflowY: 'auto',
              flex: tab !== 'none' && !isDone ? 1 : 'unset',
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

                {/* Dots — clickable navigation */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {dotStates.map((state, i) => {
                    const bg = state === 'correct' ? '#34A853' : state === 'wrong' ? '#EA4335' : state === 'current' ? BUTTON_COLOR : '#D8E0F0'
                    const isClickable = state === 'correct' || state === 'wrong' || state === 'current'
                    const size = state === 'current' ? 16 : isClickable ? 12 : 9
                    return (
                      <div
                        key={i}
                        title={isClickable ? `Question ${i + 1}${state === 'correct' ? ' ✓' : state === 'wrong' ? ' ✗' : ''}` : ''}
                        onClick={() => navigateToQuestion(i)}
                        style={{
                          width: size, height: size,
                          borderRadius: '50%',
                          background: bg,
                          transition: 'all 0.25s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 7, color: '#fff', fontWeight: 700,
                          cursor: isClickable ? 'pointer' : 'default',
                          opacity: isClickable ? 1 : 0.45,
                          boxShadow: state === 'current' ? `0 0 0 2px rgba(51,81,202,0.3)` : 'none',
                          transform: isClickable && i !== currentQ ? 'scale(1)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (isClickable && i !== currentQ) (e.currentTarget as HTMLElement).style.transform = 'scale(1.35)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                      >
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
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: '#34A853', textAlign: 'right', fontWeight: 600 }}>✅ פתרון מלא:</div>
                  <ArsenalQuizCaptureChip explanation={q.answer} topicId={selectedTopic} />
                </div>
                <div
                  data-arsenal-source="quiz"
                  data-arsenal-topic={selectedTopic || ''}
                  style={{ background: 'linear-gradient(135deg, rgba(52,168,83,0.08), rgba(52,168,83,0.04))', borderRadius: 10, padding: '14px 18px', border: '1.5px solid rgba(52,168,83,0.3)', fontFamily: "'Assistant', sans-serif", fontSize: 17, color: TEXT_DARK, lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'right' }}
                >
                  {q.answer}
                </div>
              </div>

              {/* Self-assessment or already-reviewed navigation */}
              {dotStates[currentQ] === 'correct' || dotStates[currentQ] === 'wrong' ? (
                /* Navigated back to an already-assessed question — show result + nav */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 20px', borderRadius: 99,
                    background: dotStates[currentQ] === 'correct' ? 'rgba(52,168,83,0.12)' : 'rgba(234,67,53,0.10)',
                    border: `1.5px solid ${dotStates[currentQ] === 'correct' ? 'rgba(52,168,83,0.4)' : 'rgba(234,67,53,0.35)'}`,
                    fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 15,
                    color: dotStates[currentQ] === 'correct' ? '#34A853' : '#EA4335',
                  }}>
                    {dotStates[currentQ] === 'correct' ? '✅ Marked correct' : '❌ Marked incorrect'}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {currentQ > 0 && (
                      <button onClick={() => navigateToQuestion(currentQ - 1)}
                        style={{ background: 'rgba(51,81,202,0.08)', color: BUTTON_COLOR, border: `1.5px solid rgba(51,81,202,0.25)`, borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        ← Previous
                      </button>
                    )}
                    {currentQ < total - 1 ? (
                      <button onClick={() => navigateToQuestion(currentQ + 1)}
                        style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(51,81,202,0.3)' }}>
                        Next →
                      </button>
                    ) : (
                      <button onClick={() => setPhase('done')}
                        style={{ background: '#D4AF37', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        Finish 🏆
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Fresh review — self-assessment */
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
              )}
            </>
          )}

            </div>
          </div>
        </div>
        )}

        {/* ── Spacer (only in calm mode) so the tab row sits at the bottom ── */}
        {tab === 'none' && !isDone && <div style={{ flex: 1, minHeight: 0 }} />}

        {/* ── Tab row: tool launcher / switcher (always visible, sticky bottom) ── */}
        {!isDone && (
          <div style={{
            flexShrink: 0, padding: '12px 24px 16px',
            display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
            position: tab !== 'none' ? 'absolute' : 'relative',
            bottom: tab !== 'none' ? 0 : undefined,
            left: tab !== 'none' ? 0 : undefined,
            right: tab !== 'none' ? 0 : undefined,
            zIndex: 40,
            background: tab !== 'none' ? 'linear-gradient(180deg, rgba(13,22,40,0) 0%, rgba(13,22,40,0.82) 60%, rgba(13,22,40,0.95) 100%)' : 'transparent',
          }}>
            {([
              ['none',    '🚫 ללא',         'התמקדו רק בשאלה'],
              ['mindmap', '🧠 מפת חשיבה',   'הוסיפו תובנות למפה תוך כדי'],
              ['arsenal', '🎯 הארסנל שלי',   'תפסו רגעי אהה וטריקים'],
              ['canvas',  '✏️ קנבס',         'ציירו, רשמו, פתרו ויזואלית'],
            ] as const).map(([key, label, hint]) => {
              const active = tab === key
              const onTool = tab !== 'none'
              return (
                <button
                  key={key}
                  onClick={() => setTab(key as typeof tab)}
                  title={hint}
                  style={{
                    background: active ? BUTTON_COLOR : (onTool ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)'),
                    color: active ? '#fff' : TEXT_DARK,
                    border: `1.5px solid ${active ? BUTTON_COLOR : (onTool ? 'rgba(127,155,217,0.55)' : 'rgba(127,155,217,0.35)')}`,
                    borderRadius: 22, padding: '8px 18px',
                    fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    boxShadow: active ? '0 4px 14px rgba(51,81,202,0.30)' : (onTool ? '0 2px 8px rgba(0,0,0,0.25)' : 'none'),
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

      </div>{/* end content wrap */}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser())
  const [internalView, setInternalView] = useState<InternalView>('home')
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  const [quizDifficulty, setQuizDifficulty] = useState<DifficultyFilter>('all')
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

  const title = internalView === 'home' ? 'דף הבית' : internalView === 'topics' ? 'Study Zone' : 'Study Zone'

  const handleSelectTopic = (topicId: string, mode: 'lesson' | 'quiz' = 'lesson') => {
    setSelectedTopic(topicId)
    setInternalView(mode === 'lesson' ? 'lesson' : 'quiz-intro')
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

  // Hydrate the per-user arsenal whenever the active user changes.
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.userId || currentUser.username || 'default'
      useArsenalStore.getState().hydrate(userId)
    }
  }, [currentUser])

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', direction: 'rtl', background: PAGE_BG, fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>WaffleStack — דף הבית</h1>
      {/* Sidebar — right side (RTL) */}
      <nav aria-label="ניווט ראשי" style={{ width: sidebarWidth, flexShrink: 0, position: 'relative', display: 'flex' }}>
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
      </nav>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header><TopBar title={title} onLogout={handleLogout} /></header>
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
        {internalView === 'lesson' && selectedTopic && (
          <LessonScreen
            topicId={selectedTopic}
            onStartQuiz={() => setInternalView('quiz-intro')}
            onBack={() => setInternalView('topics')}
            onComplete={(id) => useLearningStore.getState().completeLesson(id)}
          />
        )}
        {internalView === 'arsenal' && <ArsenalScreen />}
        {internalView === 'quiz-intro' && selectedTopic && (
          <QuizIntroCard
            topicId={selectedTopic}
            onStart={(d) => { setQuizDifficulty(d); setInternalView('learning') }}
            onBack={() => setInternalView('topics')}
            onReadLesson={() => setInternalView('lesson')}
          />
        )}
        {internalView === 'learning' && (
          <LearningScreen
            onBack={() => setInternalView('topics')}
            selectedTopic={selectedTopic}
            difficultyFilter={quizDifficulty}
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
            userId={currentUser?.userId}
          />
        )}
      </main>
    </div>
  )
}

export default StudyHub
