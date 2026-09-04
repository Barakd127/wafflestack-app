// LearningInsights — a home-screen card that turns the learner's answer history
// into actionable feedback: overall accuracy, practice volume, and the mistake
// categories worth strengthening ("what to improve / where you're stuck").
// Reads only existing learningStore signal (totalAnswered/totalCorrect +
// errorTagCounts), so it needs no new tracking.
import CardIcon, { cardTitle, cardHead } from './CardIcon'
import { useLearningStore } from '../store/learningStore'

// Hebrew labels + icons for the four mistake categories (mirrors MistakeAutopsy).
const TAG_META: Record<string, { icon: string; labelHe: string; tipHe: string }> = {
  'concept-unclear':   { icon: '❓', labelHe: 'הבנת המושג',     tipHe: 'חזור על התיאוריה לפני התרגול' },
  'confused-terms':    { icon: '🔀', labelHe: 'בלבול בין מושגים', tipHe: 'השווה בין המושגים הדומים במפת המושגים' },
  'calculation-error': { icon: '🔢', labelHe: 'דיוק בחישוב',     tipHe: 'בדוק כל שלב חישוב לאט' },
  'careless':          { icon: '👁', labelHe: 'תשומת לב',        tipHe: 'קרא את השאלה עד הסוף לפני שעונה' },
}

export default function LearningInsights() {
  const totalAnswered = useLearningStore(s => s.totalAnswered)
  const totalCorrect  = useLearningStore(s => s.totalCorrect)
  const sessions      = useLearningStore(s => s.practiceSessionsCompleted)
  const errorTagCounts = useLearningStore(s => s.errorTagCounts)

  // Not enough data yet → gentle empty state instead of misleading 0%.
  if (totalAnswered < 3) {
    return (
      <div className="ws-glass-card" style={card}>
        <div style={title}><CardIcon name="insights" /><div style={cardTitle}>תובנות למידה</div></div>
        <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: 'var(--sh-text-med)', lineHeight: 1.6 }}>
          עוד כמה שאלות ונתחיל לזהות בדיוק מה חזק אצלך ומה כדאי לחזק.
        </div>
      </div>
    )
  }

  const accuracy = Math.round((totalCorrect / totalAnswered) * 100)
  const accColor = accuracy >= 80 ? '#22833F' : accuracy >= 60 ? '#D4AF37' : '#d4694a'
  const accLabel = accuracy >= 80 ? 'שליטה טובה' : accuracy >= 60 ? 'בדרך הנכונה' : 'ממשיכים להתאמן'

  // Top mistake categories to strengthen, most frequent first.
  const topTags = Object.entries(errorTagCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="ws-glass-card" style={card}>
      <div style={title}><CardIcon name="insights" /><div style={cardTitle}>תובנות למידה</div></div>

      {/* Top row: accuracy + volume */}
      <div style={{ display: 'flex', gap: 14, marginBottom: topTags.length ? 18 : 0, flexWrap: 'wrap' }}>
        <div style={statBox}>
          <div style={{ fontSize: 30, fontWeight: 800, color: accColor, lineHeight: 1, fontFamily: "'Rubik', sans-serif" }}>{accuracy}%</div>
          <div style={statCaption}>דיוק · {accLabel}</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--sh-text-dark)', lineHeight: 1, fontFamily: "'Rubik', sans-serif" }}>{totalCorrect}/{totalAnswered}</div>
          <div style={statCaption}>תשובות נכונות</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--sh-text-dark)', lineHeight: 1, fontFamily: "'Rubik', sans-serif" }}>{sessions}</div>
          <div style={statCaption}>תרגולים שהושלמו</div>
        </div>
      </div>

      {/* What to strengthen — driven by the mistake-category counts */}
      {topTags.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--sh-text-dark)', marginBottom: 10 }}>
            מה כדאי לחזק
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topTags.map(([tag, n]) => {
              const meta = TAG_META[tag] ?? { icon: '•', labelHe: tag, tipHe: '' }
              return (
                <div key={tag} style={tagRow}>
                  <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>{meta.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 13.5, color: 'var(--sh-text-dark)' }}>{meta.labelHe}</span>
                    {meta.tipHe && <span style={{ display: 'block', fontFamily: "'Assistant', sans-serif", fontSize: 15, color: 'var(--sh-text-med)', marginTop: 1, lineHeight: 1.4 }}>{meta.tipHe}</span>}
                  </span>
                  <span style={countPill}>{n}×</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const card: React.CSSProperties = { borderRadius: 24, padding: "24px 26px", display: "flex", flexDirection: "column", justifyContent: "center" }
const title: React.CSSProperties = { ...cardHead, marginBottom: 16 }
const statBox: React.CSSProperties = { flex: '1 1 100px', minWidth: 100, background: 'rgba(127,155,217,0.10)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }
const statCaption: React.CSSProperties = { fontFamily: "'Assistant', sans-serif", fontSize: 13, color: 'var(--sh-text-med)', marginTop: 5 }
const tagRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 12, padding: '9px 12px' }
const countPill: React.CSSProperties = { fontFamily: "'Rubik', sans-serif", fontSize: 15, fontWeight: 800, color: '#9A7B1A', background: 'rgba(212,175,55,0.18)', borderRadius: 999, padding: '3px 9px', flexShrink: 0 }
