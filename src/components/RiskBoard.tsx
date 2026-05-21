import { useState, useMemo } from 'react'
import { useLearningStore } from '../store/learningStore'
import { computeTopicRisks, type TopicRisk } from '../utils/riskScore'

// ── SVG Risk Ring ─────────────────────────────────────────────────────────────

function RiskRing({ score }: { score: number }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const color = score >= 60
    ? 'var(--sh-sidebar-active, #254A9F)'
    : score >= 30
      ? 'rgba(212,175,55,0.85)'
      : 'rgba(212,175,55,0.35)'

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(212,175,55,0.20)" strokeWidth={4} />
      <circle
        cx={24} cy={24} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
      />
      <text
        x={24} y={29}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={color}
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {score}
      </text>
    </svg>
  )
}

// ── Single risk row ───────────────────────────────────────────────────────────

function RiskCard({ risk, rank, onSelect }: {
  risk: TopicRisk
  rank: number
  onSelect: (topicId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isHigh = risk.riskScore >= 60

  const lastSeenText = risk.lastSeenDays === null
    ? 'לא נלמד עדיין'
    : risk.lastSeenDays === 0
      ? 'נלמד היום'
      : `נלמד לפני ${risk.lastSeenDays}ד`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${risk.hebrewTitle}, רמת סיכון ${risk.riskScore}. לחץ להתחיל תרגול`}
      onClick={() => onSelect(risk.topicId)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(risk.topicId) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: isHigh
          ? 'linear-gradient(135deg, rgba(51,81,202,0.09), rgba(51,81,202,0.04))'
          : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: '11px 14px',
        border: `1px solid ${isHigh ? 'rgba(51,81,202,0.22)' : 'rgba(212,175,55,0.18)'}`,
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 4px 20px rgba(51,81,202,0.16)'
          : isHigh
            ? '0 2px 12px rgba(51,81,202,0.08)'
            : '0 1px 6px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 0.15s ease, transform 0.12s ease',
        userSelect: 'none',
      }}
    >
      <span style={{ width: 20, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--sh-text-light)', flexShrink: 0 }}>
        #{rank}
      </span>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{risk.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Rubik', 'Assistant', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--sh-text-dark)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {risk.hebrewTitle}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sh-text-light)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>
            משקל:{' '}
            <b style={{ color: risk.examWeightLabel === 'גבוה' ? 'var(--sh-text-med)' : 'var(--sh-text-light)' }}>
              {risk.examWeightLabel}
            </b>
          </span>
          <span>{lastSeenText}</span>
          {risk.dueCount > 0 && (
            <span style={{ color: 'var(--sh-sidebar-active, #254A9F)', fontWeight: 600 }}>
              {risk.dueCount} כרטיסים לחזרה
            </span>
          )}
        </div>
      </div>
      <RiskRing score={risk.riskScore} />
    </div>
  )
}

// ── Exam date picker ──────────────────────────────────────────────────────────

function ExamDateControl({ examDate, setExamDate }: {
  examDate: string | null
  setExamDate: (d: string | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput]     = useState(examDate ?? '')

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={input}
          onChange={e => setInput(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          aria-label="תאריך בחינה"
          style={{
            border: '1.5px solid rgba(212,175,55,0.6)',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 13,
            color: 'var(--sh-text-dark)',
            background: 'var(--sh-answer-bg, rgba(255,255,255,0.75))',
            outline: 'none',
            fontFamily: "'Assistant', sans-serif",
          }}
        />
        <button
          onClick={() => { if (input) setExamDate(input); setEditing(false) }}
          style={{
            background: 'rgba(212,175,55,0.85)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '5px 14px',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: "'Rubik', sans-serif",
          }}
        >
          שמור
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{
            background: 'transparent',
            color: 'var(--sh-text-light)',
            border: 'none',
            borderRadius: 8,
            padding: '5px 8px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ביטול
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => { setInput(examDate ?? ''); setEditing(true) }}
      style={{
        background: 'transparent',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRadius: 8,
        padding: '5px 12px',
        fontSize: 12,
        color: 'rgba(212,175,55,0.85)',
        cursor: 'pointer',
        fontFamily: "'Rubik', sans-serif",
        transition: 'border-color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {examDate ? 'שנה תאריך בחינה' : '+ הגדר תאריך בחינה'}
    </button>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export interface RiskBoardProps {
  onSelectTopic: (topicId: string) => void
}

export function RiskBoard({ onSelectTopic }: RiskBoardProps) {
  const cards      = useLearningStore(s => s.cards)
  const examDate   = useLearningStore(s => s.examDate)
  const setExamDate = useLearningStore(s => s.setExamDate)

  const topFive = useMemo(
    () => computeTopicRisks(cards, examDate).slice(0, 5),
    [cards, examDate],
  )

  const daysToExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null

  const criticalCount = topFive.filter(r => r.riskScore >= 60).length
  const totalDueCards = topFive.reduce((s, r) => s + r.dueCount, 0)
  const neverStudied  = topFive.filter(r => r.lastSeenDays === null).length

  const subtitle = daysToExam !== null
    ? daysToExam === 0
      ? 'הבחינה היום!'
      : `${daysToExam} ימים לבחינה${criticalCount > 0 ? ` — ${criticalCount} נושאים קריטיים` : ''}`
    : totalDueCards > 0
      ? `${totalDueCards} כרטיסים ממתינים לחזרה`
      : neverStudied > 0
        ? `${neverStudied} נושאים טרם נלמדו — כדאי להתחיל!`
        : 'כל הנושאים בסדר — המשך כך!'

  const subtitleUrgent = daysToExam !== null && daysToExam <= 3 || criticalCount > 0

  return (
    <section
      aria-label="לוח סיכונים — נושאים שדורשים תשומת לב"
      dir="rtl"
      style={{
        background: 'var(--sh-glass-card, rgba(255,255,255,0.45))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'var(--sh-card-shadow, 0 8px 32px rgba(31,62,108,0.10))',
        borderRadius: 20,
        padding: '20px 22px 16px',
        border: '1px solid rgba(255,255,255,0.50)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{
            fontFamily: "'Rubik', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--sh-text-dark)',
            lineHeight: 1.3,
          }}>
            🎯 לוח סיכונים
          </div>
          <div style={{
            fontSize: 12,
            marginTop: 3,
            color: subtitleUrgent ? 'var(--sh-sidebar-active, #3351CA)' : 'var(--sh-text-light)',
            fontWeight: subtitleUrgent ? 600 : 400,
          }}>
            {subtitle}
          </div>
        </div>
        <ExamDateControl examDate={examDate} setExamDate={setExamDate} />
      </div>

      {/* Risk card list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {topFive.map((risk, i) => (
          <RiskCard
            key={risk.topicId}
            risk={risk}
            rank={i + 1}
            onSelect={onSelectTopic}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 12,
        fontSize: 10,
        color: 'var(--sh-text-light)',
        textAlign: 'center',
        opacity: 0.7,
      }}>
        הציון מבוסס על SM-2, ימים מאז לימוד, אחוז שגיאות ותאריך בחינה
      </div>
    </section>
  )
}
