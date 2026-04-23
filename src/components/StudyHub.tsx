import { useState } from 'react'
import type { LessonTopicId } from './LessonPage'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode?: boolean
  onOpenLesson?: (id: LessonTopicId) => void
}

type InternalView = 'home' | 'learning'

// ── Exact Figma design tokens ──────────────────────────────────────────────────
const PAGE_BG       = 'linear-gradient(35.22deg, #FFFFFF -9.85%, #D8E7FA 49.05%, #3351CA 136%)'
const SIDEBAR_BG    = 'linear-gradient(265.4deg, #83B2F8 -108.21%, #3351CA 169.33%)'
const SIDEBAR_ACTIVE = '#254A9F'
const GLASS_CARD    = 'linear-gradient(180deg, rgba(255,255,255,0.45) 54.33%, rgba(255,255,255,0.15) 100%)'
const GLASS_CARD_SM = 'linear-gradient(180deg, rgba(255,255,255,0.30) 54.33%, rgba(255,255,255,0.10) 100%)'
const CARD_SHADOW   = '0px 15px 30px rgba(31,41,55,0.25)'
const CARD_RADIUS   = 24
const BUTTON_COLOR  = '#122460'
const TEXT_DARK     = '#1F3E6C'
const TEXT_MED      = '#254A9F'
const TEXT_LIGHT    = '#7F9BD9'
const TEXT_TIP      = '#465CA5'

// ── Questions ──────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, topic: 'ממוצע', text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע של הציונים\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את טווח הציונים' },
  { id: 2, topic: 'ממוצע', text: 'גבהות (בס"מ) של 5 שחקני כדורסל:\n180, 195, 188, 202, 175\n\nא. חשב/י את הממוצע\nב. מה ההפרש בין הגובה הגבוה לנמוך ביותר?' },
  { id: 3, topic: 'חציון', text: 'הצג/י את הנתונים הבאים בסדר עולה:\n12, 7, 3, 18, 5, 9, 14\n\nא. מצא/י את החציון\nב. כמה ערכים גדולים מהחציון?' },
  { id: 4, topic: 'שכיח', text: 'ציוני בוחן של כיתה: 70, 80, 80, 90, 80, 70, 95, 80\n\nא. מהו השכיח?\nב. כמה פעמים מופיע השכיח?' },
  { id: 5, topic: 'ממוצע', text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע של הציונים\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את טווח הציונים' },
  { id: 6, topic: 'טווח', text: 'נתון מדגם: 4, 8, 15, 16, 23, 42\n\nא. חשב/י את הטווח\nב. מה הממוצע?' },
  { id: 7, topic: 'ממוצע', text: 'ממוצע ציוני 4 תלמידים הוא 80. תלמיד חמישי קיבל 100.\nמהו הממוצע החדש?' },
  { id: 8, topic: 'חציון', text: 'סדרה: 2, 4, 6, 8, 10, 12\nמצא/י חציון לסדרה זו ונמק/י.' },
]

const DOT_STATES: Array<'empty' | 'current' | 'wrong' | 'correct' | 'future'> = [
  'empty', 'empty', 'empty', 'current', 'wrong', 'correct', 'correct', 'future',
]

// ── Activity chart SVG (exact Figma data points) ──────────────────────────────
function ActivityChart() {
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
  const values = [200, 340, 260, 200, 220, 370, 190]
  const W = 460, H = 200, padL = 36, padB = 28, padT = 10, padR = 10
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const maxV = 400

  const toX = (i: number) => padL + (i / (days.length - 1)) * innerW
  const toY = (v: number) => padT + innerH - (v / maxV) * innerH

  const pts = values.map((v, i) => [toX(i), toY(v)] as [number, number])
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = line + ` L${pts[pts.length-1][0]},${padT+innerH} L${pts[0][0]},${padT+innerH} Z`
  const ticks = [0, 100, 200, 300, 400]

  return (
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
          <text x={padL-5} y={toY(v)+4} textAnchor="end" fontSize={10} fill="#54555A" fontFamily="Inter">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#chartArea)" />
      <path d={line} fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#D4AF37" />
      ))}
      {days.map((d, i) => (
        <text key={i} x={toX(i)} y={H-4} textAnchor="middle" fontSize={9} fill="#54555A" fontFamily="Rubik">{d}</text>
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
  const items: Array<{ id: InternalView | null; label: string; icon: string; action?: string }> = [
    { id: 'home',     label: 'דף הבית',    icon: '⌂' },
    { id: null,       label: 'מפת לימוד',  icon: '◫', action: 'mindmap' },
    { id: 'learning', label: 'אזור למידה', icon: '📖' },
    { id: null,       label: 'העולם שלי',  icon: '🌐', action: 'world' },
  ]

  return (
    <div style={{
      background: SIDEBAR_BG,
      width: 247,
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(51,81,202,0.25)',
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
                if (item.id !== null) onNav(item.id)
              }}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                borderRadius: 32,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
                direction: 'rtl',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 20,
                fontWeight: isActive ? 600 : 400,
                color: '#FFFFFF',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── Top bar ────────────────────────────────────────────────────────────────────
function TopBar({ title }: { title: string }) {
  const userName = localStorage.getItem('userName') || 'Bdakar'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.4)',
      height: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
    }} dir="rtl">
      <h1 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 32, color: TEXT_LIGHT, margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} dir="ltr">
        <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK }}>Hi, {userName}</span>
        {/* Profile icon */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DARK, display: 'flex', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke={TEXT_DARK} strokeWidth="1.8" />
            <circle cx="16" cy="12" r="4.5" stroke={TEXT_DARK} strokeWidth="1.8" />
            <path d="M7 26c0-5 4-8 9-8s9 3 9 8" stroke={TEXT_DARK} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {/* Bell icon */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DARK, display: 'flex', alignItems: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4C10 4 7 7.5 7 11v6l-2 3h18l-2-3v-6c0-3.5-3-7-7-7z" stroke={TEXT_DARK} strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M11.5 23.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5" stroke={TEXT_DARK} strokeWidth="1.7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Home screen ────────────────────────────────────────────────────────────────
function HomeScreen({ onGoLearning, onGoWorld }: {
  onGoLearning: () => void
  onGoWorld: () => void
}) {
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
                src="/building-figma.png"
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
            display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, textAlign: 'right', marginBottom: 12 }}>העולם שלי</div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onGoWorld}
                style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px #8DA7FF' }}>
                כניסה לעולם
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Learning area screen ───────────────────────────────────────────────────────
function LearningScreen() {
  const [currentQ, setCurrentQ] = useState(4)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [dotStates, setDotStates] = useState([...DOT_STATES])

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
    const ni = Math.min(currentQ + 1, total - 1)
    setCurrentQ(ni); setAnswer(''); setChecked(false)
    const next = [...dotStates]
    if (next[ni] === 'future' || next[ni] === 'empty') next[ni] = 'current'
    setDotStates(next)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }} dir="rtl">
      {/* Top bar (white, from Figma) */}
      <div style={{ background: '#FFFFFF', boxShadow: '2px 2px 6px rgba(0,0,0,0.25)', height: 74, display: 'flex', alignItems: 'center', padding: '0 32px', flexShrink: 0 }}>
        {/* Breadcrumb with building thumb + progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
          <img src="/building-figma.png" alt="" style={{ width: 43, height: 31, objectFit: 'cover', borderRadius: 6 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 7, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${((currentQ+1)/total)*100}%`, height: '100%', background: 'rgba(212,175,55,0.7)', borderRadius: 10, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: '#1F3E6C' }}>
            <span style={{ fontWeight: 700 }}>סטטיסטיקה תיאורית</span> | {q.topic}
          </div>
        </div>
      </div>

      {/* Question area — glassmorphism whiteboard */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 40px' }}>
        <div style={{
          background: 'linear-gradient(178.82deg, rgba(255,255,255,0.77) 17.91%, rgba(192,216,255,0.77) 199.73%)',
          borderRadius: 20,
          width: '100%', maxWidth: 1000,
          padding: '32px 40px 28px',
          position: 'relative',
        }}>
          {/* Question number */}
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 24, color: TEXT_DARK, marginBottom: 16, textAlign: 'right' }}>שאלה {currentQ + 1}</div>

          {/* Question text */}
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 20, color: '#000', lineHeight: 2, whiteSpace: 'pre-line', textAlign: 'right', marginBottom: 24 }}>
            {q.text}
          </div>

          {/* Textarea */}
          <div style={{ border: '2px solid #B4B4B4', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="הכנס את תשובתך כאן..."
              dir="rtl"
              style={{
                width: '100%', minHeight: 120,
                border: 'none', outline: 'none',
                padding: '16px 20px',
                fontSize: 20, color: '#B0B0B0',
                background: 'transparent',
                fontFamily: "'Inter', sans-serif",
                resize: 'vertical',
                direction: 'rtl', textAlign: 'center',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.color = TEXT_DARK }}
              onBlur={e => { if (!e.target.value) e.target.style.color = '#B0B0B0' }}
            />
          </div>

          {/* Next arrow button (right edge) */}
          <button onClick={goNext}
            style={{ position: 'absolute', left: -20, top: '40%', background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(18,36,96,0.3)', fontSize: 20 }}>
            ›
          </button>

          {/* Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: check + skip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={handleCheck}
                style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '10px 28px', fontFamily: "'Assistant', sans-serif", fontSize: 18, fontWeight: 700, cursor: 'pointer', opacity: answer.trim() ? 1 : 0.5, boxShadow: '0px 2px 6px #8DA7FF' }}>
                בדיקת תשובה
              </button>
              <span style={{ fontFamily: "'Assistant', sans-serif", fontSize: 18, color: BUTTON_COLOR, cursor: 'pointer' }} onClick={handleSkip}>דלג</span>
            </div>

            {/* Center: progress dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {dotStates.map((state, i) => {
                const bg = state === 'correct' ? '#34A853' : state === 'wrong' ? '#EA4335' : state === 'current' ? BUTTON_COLOR : state === 'empty' ? '#E0E0E0' : '#F5F5F5'
                const inner = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : ''
                return (
                  <div key={i} onClick={() => setCurrentQ(i)}
                    style={{ width: state === 'current' ? 14 : 11, height: state === 'current' ? 14 : 11, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {inner}
                  </div>
                )
              })}
            </div>

            {/* Right: counter */}
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 18, color: '#000' }}>
              שאלה {currentQ + 1} מתוך {total}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const [internalView, setInternalView] = useState<InternalView>('home')
  const title = internalView === 'home' ? 'דף הבית' : 'אזור למידה'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', direction: 'rtl', background: PAGE_BG, fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
      {/* Sidebar — right side (RTL) */}
      <Sidebar active={internalView} onNav={setInternalView} onGoWorld={() => onViewChange('3d')} />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title={title} />
        {internalView === 'home' && (
          <HomeScreen onGoLearning={() => setInternalView('learning')} onGoWorld={() => onViewChange('3d')} />
        )}
        {internalView === 'learning' && <LearningScreen />}
      </div>
    </div>
  )
}

export default StudyHub
