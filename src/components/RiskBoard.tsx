import { useState, useMemo } from 'react'
import { useLearningStore } from '../store/learningStore'
import { isFeatureEnabled } from '../utils/featureFlags'
import { computeTopicRisks, type TopicRisk } from '../utils/riskScore'

const FLAG = 'ws_triage_mode_v1'

// ── Color tokens (all from VISION palette — no new hex values) ────────────────
const GOLD        = '#D4AF37'
const GOLD_DIM    = 'rgba(212,175,55,0.30)'
const BLUE_MED    = '#254A9F'
const BLUE_URGENT = '#3351CA'
const TEXT_DARK   = '#1F3E6C'
const TEXT_LIGHT  = 'rgba(31,62,108,0.50)'
const GLASS_CARD  = 'rgba(255,255,255,0.45)'

// ── Risk ring ─────────────────────────────────────────────────────────────────

function riskStroke(score: number): string {
  if (score >= 60) return BLUE_URGENT
  if (score >= 30) return GOLD
  return GOLD_DIM
}

function RiskRing({ score }: { score: number }) {
  const r = 21
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  return (
    <svg width={50} height={50} viewBox="0 0 50 50" aria-hidden="true" style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle cx={25} cy={25} r={r} fill="none" stroke={GOLD_DIM} strokeWidth={4} />
      {/* Progress */}
      <circle
        cx={25} cy={25} r={r}
        fill="none"
        stroke={riskStroke(score)}
        strokeWidth={4}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
      />
      {/* Score label */}
      <text
        x={25} y={30}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={riskStroke(score)}
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {score}
      </text>
    </svg>
  )
}

// ── Single risk card row ───────────────────────────────────────────────────────

function RiskCard({
  risk,
  rank,
  onSelect,
}: {
  risk: TopicRisk
  rank: number
  onSelect?: (topicId: string) => void
}) {
  const isHigh = risk.riskScore >= 60
  const handleInteract = () => onSelect?.(risk.topicId)
  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`נושא ${risk.hebrewTitle}, רמת סיכון ${risk.riskScore}`}
      onClick={handleInteract}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleInteract() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: isHigh
          ? 'linear-gradient(135deg, rgba(51,81,202,0.09), rgba(51,81,202,0.04))'
          : 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: '11px 14px',
        border: `1px solid ${isHigh ? 'rgba(51,81,202,0.22)' : 'rgba(212,175,55,0.20)'}`,
        cursor: onSelect ? 'pointer' : 'default',
        boxShadow: isHigh
          ? '0 2px 12px rgba(51,81,202,0.10)'
          : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.15s ease, transform 0.12s ease',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        if (!onSelect) return
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 4px 20px rgba(51,81,202,0.18)'
        el.style.transform  = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = isHigh
          ? '0 2px 12px rgba(51,81,202,0.10)'
          : '0 2px 8px rgba(0,0,0,0.05)'
        el.style.transform = ''
      }}
    >
      {/* Rank */}
      <span style={{ width: 20, textAlign: 'center', fontSize: 12, fontWeight: 700, color: TEXT_LIGHT, flexShrink: 0 }}>
        #{rank}
      </span>
      {/* Icon */}
      <span style={{ fontSize: 20, flexShrink: 0 }}>{risk.icon}</span>
      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: 14, color: TEXT_DARK,
          fontFamily: "'Rubik', 'Assistant', sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {risk.hebrewTitle}
        </div>
        <div style={{ fontSize: 11, color: TEXT_LIGHT, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>
            משקל:{' '}
            <b style={{ color: risk.examWeightLabel === 'גבוה' ? BLUE_MED : TEXT_LIGHT }}>
              {risk.examWeightLabel}
            </b>
          </span>
          <span>
            {risk.lastSeenDays !== null
              ? `נלמד לפני ${risk.lastSeenDays}ד`
              : 'לא נלמד עדיין'}
          </span>
        </div>
      </div>
      {/* Risk ring */}
      <RiskRing score={risk.riskScore} />
    </div>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────────

export interface RiskBoardProps {
  onSelectTopic?: (topicId: string) => void
}

export function RiskBoard({ onSelectTopic }: RiskBoardProps) {
  // All hooks must run before any conditional return
  const enabled    = isFeatureEnabled(FLAG)
  const cards      = useLearningStore(s => s.cards)
  const examDate   = useLearningStore(s => s.examDate)
  const setExamDate = useLearningStore(s => s.setExamDate)

  const [editingDate, setEditingDate] = useState(false)
  const [dateInput,   setDateInput]   = useState(examDate ?? '')

  const topFive = useMemo(
    () => computeTopicRisks(cards, examDate).slice(0, 5),
    [cards, examDate],
  )

  if (!enabled) return null

  const daysToExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null

  const criticalCount = topFive.filter(r => r.riskScore >= 60).length

  const handleSaveDate = () => {
    if (dateInput) setExamDate(dateInput)
    setEditingDate(false)
  }

  return (
    <section
      aria-label="לוח סיכונים לבחינה"
      dir="rtl"
      style={{
        background: GLASS_CARD,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(31,62,108,0.10)',
        borderRadius: 24,
        padding: '22px 24px 18px',
        border: '1px solid rgba(255,255,255,0.55)',
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: TEXT_DARK, fontFamily: "'Rubik', sans-serif", lineHeight: 1.3 }}>
            🎯 לוח סיכונים
          </div>
          {daysToExam !== null ? (
            <div style={{ fontSize: 12, color: criticalCount > 0 ? BLUE_URGENT : TEXT_LIGHT, marginTop: 3 }}>
              {daysToExam === 0 ? 'הבחינה היום!' : `${daysToExam} ימים לבחינה`}
              {criticalCount > 0 && ` — ${criticalCount} נושאים קריטיים`}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: TEXT_LIGHT, marginTop: 3 }}>
              הגדר תאריך בחינה לחיזוי מדויק
            </div>
          )}
        </div>
        {/* Exam date control */}
        {editingDate ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              aria-label="תאריך בחינה"
              style={{
                border: `1.5px solid ${GOLD}`, borderRadius: 8,
                padding: '4px 8px', fontSize: 13, color: TEXT_DARK,
                background: 'rgba(255,255,255,0.75)', outline: 'none',
                fontFamily: "'Assistant', sans-serif",
              }}
            />
            <button
              onClick={handleSaveDate}
              style={{
                background: GOLD, color: '#fff', border: 'none',
                borderRadius: 8, padding: '5px 14px',
                fontSize: 13, cursor: 'pointer', fontWeight: 600,
                fontFamily: "'Rubik', sans-serif",
              }}
            >
              שמור
            </button>
            <button
              onClick={() => setEditingDate(false)}
              style={{
                background: 'transparent', color: TEXT_LIGHT, border: 'none',
                borderRadius: 8, padding: '5px 8px', fontSize: 13, cursor: 'pointer',
              }}
            >
              ביטול
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setDateInput(examDate ?? ''); setEditingDate(true) }}
            style={{
              background: 'transparent',
              border: `1px solid ${GOLD_DIM}`,
              borderRadius: 8, padding: '5px 12px',
              fontSize: 12, color: GOLD, cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
              transition: 'border-color 0.15s',
            }}
          >
            {examDate ? 'שנה תאריך' : '+ הגדר תאריך בחינה'}
          </button>
        )}
      </div>

      {/* ── Risk cards ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {topFive.map((risk, i) => (
          <RiskCard
            key={risk.topicId}
            risk={risk}
            rank={i + 1}
            onSelect={onSelectTopic}
          />
        ))}
      </div>

      {/* ── Footer note ────────────────────────────────── */}
      <div style={{ marginTop: 12, fontSize: 11, color: TEXT_LIGHT, textAlign: 'center' }}>
        הציון מבוסס על SM-2, ימים מאז לימוד אחרון, ואחוז שגיאות
      </div>
    </section>
  )
}
