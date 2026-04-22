import { useState } from 'react'
import { Home, Map, BookOpen, Globe, Bell, Settings, Edit3, ChevronLeft } from 'lucide-react'
import type { LessonTopicId } from './LessonPage'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode?: boolean
  onOpenLesson?: (id: LessonTopicId) => void
}

type InternalView = 'home' | 'learning'

// ── Design tokens (exact Figma values) ───────────────────────────────────────
const SIDEBAR_BG     = '#3949AB'   // indigo sidebar
const SIDEBAR_ACTIVE = '#1A237E'   // darker active state
const ACCENT         = '#F59E0B'   // golden amber CTA
const PAGE_BG        = '#EEF0FA'   // soft lavender background
const CARD_BG        = '#FFFFFF'
const TEXT_HEADING   = '#1A237E'
const TEXT_BODY      = '#455A64'
const TEXT_MUTED     = '#90A4AE'

// ── Learning questions pool ───────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1, topic: 'ממוצע',
    text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע של הציונים\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את טווח הציונים',
  },
  { id: 2, topic: 'ממוצע', text: 'גבהות (בס"מ) של 5 שחקני כדורסל:\n180, 195, 188, 202, 175\n\nא. חשב/י את הממוצע\nב. מה ההפרש בין הגובה הגבוה לנמוך ביותר?' },
  { id: 3, topic: 'חציון', text: 'הצג/י את הנתונים הבאים בסדר עולה:\n12, 7, 3, 18, 5, 9, 14\n\nא. מצא/י את החציון\nב. כמה ערכים גדולים מהחציון?' },
  { id: 4, topic: 'שכיח', text: 'ציוני בוחן של כיתה: 70, 80, 80, 90, 80, 70, 95, 80\n\nא. מהו השכיח?\nב. כמה פעמים מופיע השכיח?' },
  { id: 5, topic: 'ממוצע', text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע של הציונים\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את טווח הציונים' },
  { id: 6, topic: 'טווח', text: 'נתון מדגם: 4, 8, 15, 16, 23, 42\n\nא. חשב/י את הטווח\nב. מה הממוצע?' },
  { id: 7, topic: 'ממוצע', text: 'ממוצע ציוני 4 תלמידים הוא 80. תלמיד חמישי קיבל 100.\nמהו הממוצע החדש?' },
  { id: 8, topic: 'חציון', text: 'סדרה: 2, 4, 6, 8, 10, 12\nמצא/י חציון לסדרה זו ונמק/י.' },
]

const LEARNING_STAGES = [
  { id: 'mean',   label: 'ממוצע',       status: 'done',    sub: 'הושלם' },
  { id: 'median', label: 'חציון ושכיח', status: 'current', sub: 'עכשיו' },
  { id: 'std',    label: 'סטיית תקן',   status: 'locked',  sub: 'בקרוב' },
]

const DOT_STATES: Array<'empty' | 'current' | 'wrong' | 'correct' | 'future'> = [
  'empty', 'empty', 'empty', 'current', 'wrong', 'correct', 'correct', 'future',
]

// ── Diamond/gem SVG logo (matching Figma) ─────────────────────────────────────
function GemLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="url(#gemGrad)" />
      {/* Diamond shape */}
      <polygon points="24,8 36,20 24,40 12,20" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
      <polygon points="24,8 36,20 24,22 12,20" fill="rgba(255,255,255,0.25)" />
      <line x1="12" y1="20" x2="36" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <line x1="24" y1="8" x2="24" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <defs>
        <linearGradient id="gemGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Activity line chart (SVG, matching Figma) ──────────────────────────────────
function ActivityChart() {
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
  // Approximate data from Figma screenshot
  const values = [200, 340, 260, 200, 220, 370, 200]
  const W = 260, H = 100, pad = { t: 8, b: 28, l: 32, r: 8 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const maxV = 400, minV = 0

  const toX = (i: number) => pad.l + (i / (days.length - 1)) * innerW
  const toY = (v: number) => pad.t + innerH - ((v - minV) / (maxV - minV)) * innerH

  // Build SVG path
  const pts = values.map((v, i) => [toX(i), toY(v)] as [number, number])
  const linePath = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const areaPath = linePath + ` L${pts[pts.length-1][0]},${pad.t + innerH} L${pts[0][0]},${pad.t + innerH} Z`

  const yTicks = [0, 100, 200, 300, 400]

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.l} y1={toY(v)} x2={pad.l + innerW} y2={toY(v)}
            stroke="#E8EAF6" strokeWidth="1" />
          <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end"
            fontSize={8} fill={TEXT_MUTED}>{v}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={ACCENT} />
      ))}

      {/* X-axis day labels */}
      {days.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle"
          fontSize={7.5} fill={TEXT_MUTED}>{d}</text>
      ))}
    </svg>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onGoWorld }: {
  active: InternalView
  onNav: (v: InternalView) => void
  onGoWorld: () => void
}) {
  const items: Array<{ id: InternalView | null; icon: React.ElementType; label: string; action?: string }> = [
    { id: 'home',     icon: Home,     label: 'דף הבית' },
    { id: null,       icon: Map,      label: 'מפת לימוד', action: 'mindmap' },
    { id: 'learning', icon: BookOpen, label: 'אזור למידה' },
    { id: null,       icon: Globe,    label: 'העולם שלי', action: 'world' },
  ]

  return (
    <div style={{ background: SIDEBAR_BG, width: 220, flexShrink: 0 }}
      className="h-full flex flex-col shadow-2xl">

      {/* Logo */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-white/15">
        <GemLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
        {items.map((item, i) => {
          const isActive = item.id !== null && item.id === active
          const Icon = item.icon
          return (
            <button key={i}
              onClick={() => {
                if (item.action === 'world') { onGoWorld(); return }
                if (item.id !== null) onNav(item.id)
              }}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.72)',
                borderRadius: 12, padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                textAlign: 'right', direction: 'rtl',
                transition: 'background 0.15s',
                border: 'none', cursor: 'pointer', width: '100%',
                fontFamily: 'inherit', fontSize: 14,
                fontWeight: isActive ? 700 : 400,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
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

// ── Top bar ────────────────────────────────────────────────────────────────────
function TopBar({ title }: { title: string }) {
  const userName = localStorage.getItem('userName') || 'Bdakar'
  return (
    <div style={{ background: CARD_BG, borderBottom: '1px solid #E8EAF6', height: 60, flexShrink: 0 }}
      className="flex items-center justify-between px-8" dir="rtl">
      <h1 style={{ color: TEXT_HEADING, fontSize: 20, fontWeight: 700 }}>{title}</h1>
      <div className="flex items-center gap-3" dir="ltr">
        <span style={{ color: TEXT_BODY, fontSize: 13 }}>Hi, {userName}</span>
        <button style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: TEXT_BODY }}><Bell size={18} /></button>
        <button style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: TEXT_BODY }}><Settings size={18} /></button>
      </div>
    </div>
  )
}

// ── Home screen (matches Figma layout exactly) ────────────────────────────────
function HomeScreen({ onGoLearning, onGoWorld, onGoMindmap }: {
  onGoLearning: () => void
  onGoWorld: () => void
  onGoMindmap: () => void
}) {
  const cardShadow = '0 2px 16px rgba(57,73,171,0.09)'
  const cardRadius = 20

  return (
    <div style={{ background: PAGE_BG, flex: 1, overflow: 'auto', padding: '28px 32px' }} dir="rtl">
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── ROW 1: two cards side by side ─────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Card 1 — כמעט שם! */}
          <div style={{ background: CARD_BG, borderRadius: cardRadius, boxShadow: cardShadow, padding: 24, display: 'flex', flexDirection: 'column' }}>
            {/* Header text */}
            <div style={{ color: TEXT_HEADING, fontSize: 17, fontWeight: 700, marginBottom: 4 }}>כמעט שם!</div>
            <div style={{ color: TEXT_BODY, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
              נשארו לך רק 2 שאלות בקורס<br />סטטיסטיקה תיאורית
            </div>

            {/* Building illustration */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg,#FFF8E1,#FFE082,#FFD54F)',
                borderRadius: 16, padding: '16px 24px', fontSize: 64, lineHeight: 1,
                boxShadow: '0 4px 20px rgba(255,193,7,0.25)',
              }}>
                🏛️
              </div>
            </div>

            <div style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: 6 }}>המבנה הבא בעירך</div>

            {/* Progress bar */}
            <div style={{ height: 7, background: '#E8EAF6', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: '78%', height: '100%', background: `linear-gradient(90deg,${ACCENT},#FCD34D)`, borderRadius: 999 }} />
            </div>

            {/* CTA */}
            <button onClick={onGoLearning}
              style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              המשך ←
            </button>
          </div>

          {/* Card 2 — לוח לבן דיגיטלי */}
          <div style={{ background: CARD_BG, borderRadius: cardRadius, boxShadow: cardShadow, padding: 24, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Title + badge */}
            <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
              <span style={{ color: TEXT_HEADING, fontSize: 16, fontWeight: 700 }}>לוח לבן דיגיטלי</span>
              <span style={{ background: '#FFF3E0', color: ACCENT, fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>טיפ</span>
            </div>

            {/* Gradient blob area */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg,#EEF0FA 0%,#C5CAE9 50%,#E8EAF6 100%)',
              borderRadius: 16,
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 0,
            }}>
              {/* Decorative blobs */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(253,230,138,0.7),transparent 70%)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: 10, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.25),transparent 70%)' }} />
              <div style={{ color: TEXT_HEADING, fontSize: 14, lineHeight: 1.8, position: 'relative', zIndex: 1, textAlign: 'right' }}>
                היי, היום אנחנו הולכים לכבוש את<br />
                {'\''}חציון ושכיח{'\''}  ולפתוח את מגדל השעון<br />
                בעיר שלך!
              </div>
            </div>

            {/* Arrow button on right edge */}
            <button onClick={onGoMindmap}
              style={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', background: '#E8EAF6', border: '1px solid #C5CAE9', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT_HEADING }}>
              ›
            </button>
          </div>
        </div>

        {/* ── LEARNING PATH STRIP (full width) ─────────────────── */}
        <div style={{ background: CARD_BG, borderRadius: cardRadius, boxShadow: cardShadow, padding: '20px 32px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {/* Connector line behind nodes */}
            <div style={{
              position: 'absolute', left: '12%', right: '12%', top: '30%',
              height: 2,
              background: 'linear-gradient(90deg,#66BB6A 0%,#66BB6A 33%,#FFC107 33%,#FFC107 66%,#E0E0E0 66%,#E0E0E0 100%)',
              zIndex: 0,
            }} />

            {LEARNING_STAGES.map(stage => (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, textAlign: 'center' }}>
                {/* Node circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background:
                    stage.status === 'done' ? '#E8F5E9' :
                    stage.status === 'current' ? 'linear-gradient(135deg,#FFF8E1,#FFE082)' :
                    '#F5F5F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  border:
                    stage.status === 'done' ? '2.5px solid #66BB6A' :
                    stage.status === 'current' ? '2.5px solid #FFC107' :
                    '2.5px solid #E0E0E0',
                  boxShadow: stage.status === 'current' ? '0 0 0 5px rgba(255,193,7,0.18)' : 'none',
                }}>
                  {stage.status === 'done' ? '✅' : stage.status === 'current' ? '⭐' : '🔒'}
                </div>
                <div style={{ color: TEXT_HEADING, fontSize: 13, fontWeight: stage.status === 'current' ? 700 : 500, maxWidth: 90 }}>{stage.label}</div>
                <div style={{ color: TEXT_MUTED, fontSize: 11 }}>({stage.sub})</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 2: chart + my world ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Card 3 — Activity chart */}
          <div style={{ background: CARD_BG, borderRadius: cardRadius, boxShadow: cardShadow, padding: 24 }}>
            <div style={{ color: TEXT_HEADING, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>פעילות שבועית</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActivityChart />
            </div>
          </div>

          {/* Card 4 — העולם שלי */}
          <div style={{ background: CARD_BG, borderRadius: cardRadius, boxShadow: cardShadow, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: TEXT_HEADING, fontSize: 16, fontWeight: 700, marginBottom: 8, textAlign: 'right' }}>העולם שלי</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 48 }}>🌆</div>
            </div>
            <button onClick={onGoWorld}
              style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 25, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'center' }}>
              כניסה לעולם
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Learning area screen ───────────────────────────────────────────────────────
function LearningScreen({ onBack: _onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(4)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [dotStates, setDotStates] = useState<Array<'empty' | 'current' | 'wrong' | 'correct' | 'future'>>([...DOT_STATES])

  const q = QUESTIONS[currentQ] || QUESTIONS[0]
  const total = QUESTIONS.length

  const handleCheck = () => {
    if (!answer.trim()) return
    setChecked(true)
    const next = [...dotStates]; next[currentQ] = 'correct'; setDotStates(next)
  }

  const handleSkip = () => {
    const next = [...dotStates]; next[currentQ] = 'future'; setDotStates(next)
    goNext()
  }

  const goNext = () => {
    const nextIdx = Math.min(currentQ + 1, total - 1)
    setCurrentQ(nextIdx); setAnswer(''); setChecked(false)
    const next = [...dotStates]
    if (next[nextIdx] === 'future' || next[nextIdx] === 'empty') next[nextIdx] = 'current'
    setDotStates(next)
  }

  return (
    <div style={{ background: PAGE_BG, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }} dir="rtl">

      {/* Breadcrumb bar */}
      <div style={{ background: CARD_BG, borderBottom: '1px solid #E8EAF6', padding: '10px 32px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#E8EAF6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            🐱
          </div>
          <div>
            <div style={{ color: TEXT_MUTED, fontSize: 11 }}>סטטיסטיקה תיאורית | {q.topic}</div>
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 32px' }}>
        <div style={{ background: CARD_BG, borderRadius: 20, boxShadow: '0 2px 20px rgba(57,73,171,0.10)', width: '100%', maxWidth: 680, position: 'relative' }}>

          {/* Question text */}
          <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ color: TEXT_HEADING, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>שאלה {currentQ + 1}</div>
            <div style={{ color: TEXT_BODY, fontSize: 14, lineHeight: 2, whiteSpace: 'pre-line', paddingBottom: 20, direction: 'rtl', textAlign: 'right' }}>
              {q.text}
            </div>
          </div>

          {/* Next arrow button (right edge, matches Figma >) */}
          <button onClick={goNext}
            style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', background: SIDEBAR_BG, color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontSize: 18 }}>
            <ChevronLeft size={18} />
          </button>

          {/* Textarea */}
          <div style={{ padding: '20px 28px' }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="הכנס את תשובתך כאן..."
              dir="rtl"
              style={{
                width: '100%', minHeight: 100,
                border: `1px solid ${checked ? '#81C784' : '#E0E0E0'}`,
                borderRadius: 12, padding: '12px 16px',
                fontSize: 14, color: TEXT_BODY,
                background: checked ? '#F1F8E9' : '#FAFAFA',
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                direction: 'rtl', textAlign: 'right', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
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
          <div style={{ padding: '0 28px 20px', borderTop: '1px solid #F5F5F5', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Check + skip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={handleCheck}
                style={{ background: SIDEBAR_BG, color: '#fff', border: 'none', borderRadius: 25, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: answer.trim() ? 1 : 0.55 }}>
                בדיקת תשובה
              </button>
              <button onClick={handleSkip}
                style={{ background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                דלג
              </button>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {dotStates.map((state, i) => {
                const bg =
                  state === 'correct' ? '#66BB6A' :
                  state === 'wrong'   ? '#EF5350' :
                  state === 'current' ? SIDEBAR_BG :
                  state === 'empty'   ? '#E0E0E0' : '#F5F5F5'
                const inner = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : ''
                return (
                  <div key={i} onClick={() => setCurrentQ(i)}
                    style={{ width: state === 'current' ? 12 : 10, height: state === 'current' ? 12 : 10, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700, transition: 'all 0.2s', cursor: 'pointer' }}>
                    {inner}
                  </div>
                )
              })}
            </div>

            {/* Counter + edit icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: TEXT_MUTED, fontSize: 12 }}>
              <span>שאלה {currentQ + 1} מתוך {total}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, padding: 0 }}>
                <Edit3 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const [internalView, setInternalView] = useState<InternalView>('home')
  const title = internalView === 'home' ? 'דף הבית' : 'אזור למידה'

  return (
    <div className="w-full h-full flex overflow-hidden" dir="rtl"
      style={{ fontFamily: "'Heebo', 'Inter', sans-serif" }}>

      {/* Sidebar on the right (RTL) */}
      <Sidebar
        active={internalView}
        onNav={setInternalView}
        onGoWorld={() => onViewChange('3d')}
      />

      {/* Main content */}
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
          <LearningScreen onBack={() => setInternalView('home')} />
        )}
      </div>
    </div>
  )
}

export default StudyHub
