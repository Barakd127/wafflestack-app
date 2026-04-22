import { useState } from 'react'
import { Home, Map, BookOpen, Globe, Bell, Settings, Edit3, ChevronLeft } from 'lucide-react'
import type { LessonTopicId } from './LessonPage'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode?: boolean
  onOpenLesson?: (id: LessonTopicId) => void
}

type InternalView = 'home' | 'learning'

// ── Sidebar colours (from Figma: #3949AB indigo) ─────────────────────────────
const SIDEBAR_BG   = '#3949AB'
const SIDEBAR_ACTIVE = '#1A237E'
const ACCENT       = '#F59E0B'   // golden amber — CTAs + progress bars
const PAGE_BG      = '#EEF0FA'   // soft lavender page background
const CARD_BG      = '#FFFFFF'
const TEXT_HEADING = '#1A237E'
const TEXT_BODY    = '#455A64'
const TEXT_MUTED   = '#90A4AE'

// ── Learning questions pool ───────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    topic: 'ממוצע',
    text:
      'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n' +
      '65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\n' +
      'א. חשב/י את הממוצע של הציונים\n' +
      'ב. מצא/י את החציון\n' +
      'ג. קבע/י מהו השכיח\n' +
      'ד. חשב/י את טווח הציונים',
  },
  {
    id: 2,
    topic: 'ממוצע',
    text:
      'גבהות (בס"מ) של 5 שחקני כדורסל:\n180, 195, 188, 202, 175\n\n' +
      'א. חשב/י את הממוצע\n' +
      'ב. מה ההפרש בין הגובה הגבוה לנמוך ביותר?',
  },
  {
    id: 3,
    topic: 'חציון',
    text:
      'הצג/י את הנתונים הבאים בסדר עולה:\n' +
      '12, 7, 3, 18, 5, 9, 14\n\n' +
      'א. מצא/י את החציון\n' +
      'ב. כמה ערכים גדולים מהחציון?',
  },
  {
    id: 4,
    topic: 'שכיח',
    text:
      'ציוני בוחן של כיתה: 70, 80, 80, 90, 80, 70, 95, 80\n\n' +
      'א. מהו השכיח?\n' +
      'ב. כמה פעמים מופיע השכיח?',
  },
  {
    id: 5,
    topic: 'ממוצע',
    text:
      'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n' +
      '65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\n' +
      'א. חשב/י את הממוצע של הציונים\n' +
      'ב. מצא/י את החציון\n' +
      'ג. קבע/י מהו השכיח\n' +
      'ד. חשב/י את טווח הציונים',
  },
  { id: 6, topic: 'טווח', text: 'נתון מדגם: 4, 8, 15, 16, 23, 42\n\nא. חשב/י את הטווח\nב. מה הממוצע?' },
  { id: 7, topic: 'ממוצע', text: 'ממוצע ציוני 4 תלמידים הוא 80. תלמיד חמישי קיבל 100.\nמהו הממוצע החדש?' },
  { id: 8, topic: 'חציון', text: 'סדרה: 2, 4, 6, 8, 10, 12\nמצא/י חציון לסדרה זו ונמק/י.' },
]

const LEARNING_STAGES = [
  { id: 'mean',   label: 'ממוצע',        status: 'done',    emoji: '✅', sub: 'השלם' },
  { id: 'median', label: 'חציון ושכיח',  status: 'current', emoji: '⭐', sub: 'עכשיו' },
  { id: 'std',    label: 'סטיית תקן',    status: 'locked',  emoji: '🔒', sub: 'בקרוב' },
]

const DOT_STATES: Array<'empty' | 'current' | 'wrong' | 'correct' | 'future'> = [
  'empty', 'empty', 'empty', 'current', 'wrong', 'correct', 'correct', 'future',
]

// ── Shared Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNav,
  onGoWorld,
}: {
  active: InternalView
  onNav: (v: InternalView) => void
  onGoWorld: () => void
}) {
  const items = [
    { id: 'home'    as InternalView, icon: Home,     label: 'דף הבית'    },
    { id: null,                       icon: Map,      label: 'מפת לימוד', action: 'mindmap' },
    { id: 'learning'as InternalView, icon: BookOpen, label: 'אזור למידה' },
    { id: null,                       icon: Globe,    label: 'העולם שלי', action: 'world' },
  ]

  return (
    <div
      style={{ background: SIDEBAR_BG, width: 220, flexShrink: 0 }}
      className="h-full flex flex-col shadow-2xl"
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-white/15 gap-2">
        <div
          style={{ background: 'linear-gradient(135deg,#22d3ee,#6366f1)', width: 48, height: 48 }}
          className="rounded-xl flex items-center justify-center shadow-lg"
        >
          <span className="text-white font-bold text-lg">W</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
        {items.map((item, i) => {
          const isActive = item.id !== null && item.id === active
          const Icon = item.icon
          return (
            <button
              key={i}
              onClick={() => {
                if (item.action === 'world') { onGoWorld(); return }
                if (item.id !== null) onNav(item.id)
              }}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'right',
                direction: 'rtl',
                transition: 'background 0.15s',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom icons */}
      <div className="border-t border-white/10 p-3 flex gap-2 justify-center">
        <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"><Bell size={18} /></button>
        <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"><Settings size={18} /></button>
      </div>
    </div>
  )
}

// ── Top Bar ────────────────────────────────────────────────────────────────────
function TopBar({ title }: { title: string }) {
  const userName = localStorage.getItem('userName') || 'Bdakar'
  return (
    <div
      style={{ background: CARD_BG, borderBottom: '1px solid #E8EAF6', height: 60 }}
      className="flex items-center justify-between px-8 flex-shrink-0"
      dir="rtl"
    >
      <h1 style={{ color: TEXT_HEADING, fontSize: 20, fontWeight: 700 }}>{title}</h1>
      <div className="flex items-center gap-3" dir="ltr">
        <span style={{ color: TEXT_BODY, fontSize: 13 }}>Hi, {userName}</span>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-all" style={{ color: TEXT_BODY }}><Bell size={18} /></button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-all" style={{ color: TEXT_BODY }}><Settings size={18} /></button>
      </div>
    </div>
  )
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────────
function HomeScreen({ onGoLearning, onGoWorld, onGoMindmap }: {
  onGoLearning: () => void
  onGoWorld: () => void
  onGoMindmap: () => void
}) {
  return (
    <div style={{ background: PAGE_BG }} className="flex-1 overflow-auto p-8" dir="rtl">
      <div className="grid grid-cols-2 gap-5 max-w-4xl mx-auto">

        {/* Card 1 — Course Progress */}
        <div style={{ background: CARD_BG, borderRadius: 20, boxShadow: '0 2px 16px rgba(57,73,171,0.10)' }} className="p-6 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ color: TEXT_HEADING, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>כמעט שם!</div>
              <div style={{ color: TEXT_BODY, fontSize: 13, lineHeight: 1.5 }}>
                נשארו לך רק 2 שאלות בקורס<br/>סטטיסטיקה תיאורית
              </div>
            </div>
          </div>
          {/* Building illustration */}
          <div className="flex items-center justify-center my-4">
            <div style={{ background: 'linear-gradient(135deg,#FFF9C4,#FFE082)', borderRadius: 16, padding: 20, fontSize: 56 }}>
              🏛️
            </div>
          </div>
          <div style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 6 }}>המבנה הבא בעירך</div>
          {/* Progress bar */}
          <div style={{ height: 8, background: '#E8EAF6', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: '78%', height: '100%', background: `linear-gradient(90deg,${ACCENT},#FCD34D)`, borderRadius: 999 }} />
          </div>
          <button
            onClick={onGoLearning}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
            className="hover:brightness-105 transition-all"
          >
            המשך ←
          </button>
        </div>

        {/* Card 2 — AI Tip */}
        <div style={{ background: CARD_BG, borderRadius: 20, boxShadow: '0 2px 16px rgba(57,73,171,0.10)' }} className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_HEADING }}>לוח לבן דיגיטלי</div>
            <span style={{ background: '#FFF3E0', color: ACCENT, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>טיפ</span>
          </div>
          {/* Gradient blob bg */}
          <div style={{ background: 'linear-gradient(135deg,#E8EAF6,#C5CAE9)', borderRadius: 16, padding: 20, flex: 1, marginBottom: 12 }}>
            <div style={{ color: TEXT_HEADING, fontSize: 14, lineHeight: 1.7 }}>
              {`היי, היום אנחנו הולכים לכבוש את 'חציון ושכיח' ולפתוח את מגדל השעון בעיר שלך!`}
            </div>
          </div>
          <button
            onClick={onGoMindmap}
            style={{ background: SIDEBAR_BG, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            className="hover:brightness-110 transition-all"
          >
            🗺 פתח מפת מושגים
          </button>
        </div>

        {/* Card 3 — Learning Path */}
        <div style={{ background: CARD_BG, borderRadius: 20, boxShadow: '0 2px 16px rgba(57,73,171,0.10)' }} className="p-6">
          <div style={{ color: TEXT_HEADING, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>מסלול הלמידה שלך</div>
          <div className="flex justify-around items-start">
            {LEARNING_STAGES.map(stage => (
              <div key={stage.id} className="flex flex-col items-center gap-2 text-center">
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background:
                      stage.status === 'done' ? '#E8F5E9' :
                      stage.status === 'current' ? '#FFF8E1' :
                      '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    border:
                      stage.status === 'done' ? '2px solid #66BB6A' :
                      stage.status === 'current' ? '2px solid #FFC107' :
                      '2px solid #E0E0E0',
                    boxShadow: stage.status === 'current' ? '0 0 0 4px rgba(255,193,7,0.2)' : 'none',
                  }}
                >
                  {stage.emoji}
                </div>
                <div style={{ color: TEXT_HEADING, fontSize: 12, fontWeight: stage.status === 'current' ? 700 : 400, maxWidth: 72 }}>{stage.label}</div>
                <div style={{ color: TEXT_MUTED, fontSize: 11 }}>({stage.sub})</div>
              </div>
            ))}
          </div>
          {/* Connector line */}
          <div style={{ height: 2, background: 'linear-gradient(90deg,#66BB6A,#FFC107,#E0E0E0)', borderRadius: 999, margin: '-52px 28px 0', position: 'relative', zIndex: 0 }} />
        </div>

        {/* Card 4 — My World */}
        <div
          style={{ background: `linear-gradient(135deg,${SIDEBAR_BG},#283593)`, borderRadius: 20, boxShadow: '0 2px 16px rgba(57,73,171,0.20)', cursor: 'pointer' }}
          className="p-6 flex flex-col hover:brightness-110 transition-all"
          onClick={onGoWorld}
        >
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>העולם שלי</div>
          <div style={{ color: '#fff', fontSize: 24, marginBottom: 16 }}>🌆</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, flex: 1 }}>
            גלה/י את העיר שלך — כל נושא שתלמד יפתח בניין חדש!
          </div>
          <button
            onClick={e => { e.stopPropagation(); onGoWorld() }}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16 }}
          >
            כניסה לעולם
          </button>
        </div>
      </div>
    </div>
  )
}

// ── LEARNING AREA SCREEN ───────────────────────────────────────────────────────
function LearningScreen({ onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(4) // 0-based, show Q5 as in Figma
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [dotStates, setDotStates] = useState<Array<'empty' | 'current' | 'wrong' | 'correct' | 'future'>>([...DOT_STATES])

  const q = QUESTIONS[currentQ] || QUESTIONS[0]
  const total = QUESTIONS.length

  const handleCheck = () => {
    if (!answer.trim()) return
    setChecked(true)
    // Mark current dot as correct (simplified feedback)
    const next = [...dotStates]
    next[currentQ] = 'correct'
    setDotStates(next)
  }

  const handleSkip = () => {
    const next = [...dotStates]
    next[currentQ] = 'future'
    setDotStates(next)
    goNext()
  }

  const goNext = () => {
    const nextIdx = Math.min(currentQ + 1, total - 1)
    setCurrentQ(nextIdx)
    setAnswer('')
    setChecked(false)
    const next = [...dotStates]
    if (next[nextIdx] === 'future' || next[nextIdx] === 'empty') next[nextIdx] = 'current'
    setDotStates(next)
  }

  return (
    <div style={{ background: PAGE_BG }} className="flex-1 overflow-auto flex flex-col" dir="rtl">
      {/* Breadcrumb + progress */}
      <div style={{ background: CARD_BG, borderBottom: '1px solid #E8EAF6', padding: '12px 32px' }} className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, background: '#E8EAF6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
          <div>
            <div style={{ color: TEXT_MUTED, fontSize: 11 }}>סטטיסטיקה תיאורית</div>
            <div style={{ color: TEXT_HEADING, fontSize: 13, fontWeight: 600 }}>{q.topic}</div>
          </div>
          {/* Progress bar */}
          <div style={{ flex: 1, marginRight: 16 }}>
            <div style={{ height: 6, background: '#E8EAF6', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${((currentQ + 1) / total) * 100}%`, height: '100%', background: `linear-gradient(90deg,${ACCENT},#FCD34D)`, borderRadius: 999, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex items-start justify-center p-8">
        <div style={{ background: CARD_BG, borderRadius: 20, boxShadow: '0 2px 20px rgba(57,73,171,0.10)', width: '100%', maxWidth: 680 }}>
          {/* Question header */}
          <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ color: TEXT_HEADING, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>שאלה {currentQ + 1}</div>
            <div
              style={{ color: TEXT_BODY, fontSize: 14, lineHeight: 2, whiteSpace: 'pre-line', paddingBottom: 20, direction: 'rtl', textAlign: 'right' }}
            >
              {q.text}
            </div>
          </div>

          {/* Navigation arrow */}
          <button
            onClick={goNext}
            style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', background: SIDEBAR_BG, color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Answer textarea */}
          <div style={{ padding: '20px 28px' }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="הכנס את תשובתך כאן..."
              dir="rtl"
              style={{
                width: '100%',
                minHeight: 100,
                border: `1px solid ${checked ? '#81C784' : '#E0E0E0'}`,
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 14,
                color: TEXT_BODY,
                background: checked ? '#F1F8E9' : '#fff',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                direction: 'rtl',
                textAlign: 'right',
              }}
              onFocus={e => { if (!checked) e.target.style.borderColor = SIDEBAR_BG }}
              onBlur={e => { if (!checked) e.target.style.borderColor = '#E0E0E0' }}
            />
            {checked && (
              <div style={{ color: '#388E3C', fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                ✅ תשובה נשמרה! לחץ/י על הבא להמשיך.
              </div>
            )}
          </div>

          {/* Action bar */}
          <div style={{ padding: '0 28px 24px', borderTop: '1px solid #F5F5F5', paddingTop: 16 }} className="flex items-center justify-between">
            {/* Left: check + skip */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCheck}
                style={{
                  background: SIDEBAR_BG,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 25,
                  padding: '10px 22px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: answer.trim() ? 1 : 0.5,
                }}
              >
                בדיקת תשובה
              </button>
              <button
                onClick={handleSkip}
                style={{ background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                דלג
              </button>
            </div>

            {/* Center: progress dots */}
            <div className="flex items-center gap-1.5">
              {dotStates.map((state, i) => {
                const bg =
                  state === 'correct' ? '#66BB6A' :
                  state === 'wrong'   ? '#EF5350' :
                  state === 'current' ? SIDEBAR_BG :
                  state === 'empty'   ? '#E0E0E0' :
                  '#F5F5F5'
                const inner =
                  state === 'correct' ? '✓' :
                  state === 'wrong'   ? '✗' : ''
                return (
                  <div
                    key={i}
                    style={{ width: state === 'current' ? 12 : 10, height: state === 'current' ? 12 : 10, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700, transition: 'all 0.2s', cursor: 'pointer' }}
                    onClick={() => setCurrentQ(i)}
                  >
                    {inner}
                  </div>
                )
              })}
            </div>

            {/* Right: question count + edit */}
            <div className="flex items-center gap-2" style={{ color: TEXT_MUTED, fontSize: 12 }}>
              <span>שאלה {currentQ + 1} מתוך {total}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED }}>
                <Edit3 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ROOT COMPONENT ─────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const [internalView, setInternalView] = useState<InternalView>('home')

  const title = internalView === 'home' ? 'דף הבית' : 'אזור למידה'

  return (
    <div className="w-full h-full flex overflow-hidden" dir="rtl" style={{ fontFamily: "'Inter', 'Heebo', sans-serif" }}>
      {/* Sidebar — right side in RTL */}
      <Sidebar
        active={internalView}
        onNav={setInternalView}
        onGoWorld={() => onViewChange('3d')}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: PAGE_BG }}>
        <TopBar title={title} />

        {internalView === 'home' && (
          <HomeScreen
            onGoLearning={() => setInternalView('learning')}
            onGoWorld={() => onViewChange('3d')}
            onGoMindmap={() => onViewChange('mindmap')}
          />
        )}

        {internalView === 'learning' && (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <LearningScreen onBack={() => setInternalView('home')} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyHub
