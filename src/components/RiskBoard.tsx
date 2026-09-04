import { useState, useMemo } from 'react'
import { useLearningStore } from '../store/learningStore'
import { computeTopicRisks, type TopicRisk } from '../utils/riskScore'
import { HEBREW_LABELS } from '../data/topicLabels'
import quizBankData from '../data/quiz-bank.json'

// ── Date helpers (UTC-safe, YYYY-MM-DD) ───────────────────────────────────────

const DAY_MS = 86400000

/** Today as YYYY-MM-DD (local calendar date). */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Parse a YYYY-MM-DD string to a UTC-midnight epoch ms. */
function isoToMs(iso: string): number {
  return new Date(iso + 'T00:00:00Z').getTime()
}

/** Add `days` to a YYYY-MM-DD string, returning YYYY-MM-DD. */
function addDays(iso: string, days: number): string {
  return new Date(isoToMs(iso) + days * DAY_MS).toISOString().slice(0, 10)
}

/** Whole days from `fromIso` (inclusive of partials → ceil ≥ 0). */
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((isoToMs(toIso) - isoToMs(fromIso)) / DAY_MS)
}

/** Hebrew-friendly short date: DD.MM (Western numerals, RTL-safe). */
function formatTargetDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}

// ── Plan-target model ─────────────────────────────────────────────────────────

interface PlanTargetRow {
  topicId: string
  hebrewTitle: string
  /** Effective target date (override if present, else derived). YYYY-MM-DD. */
  targetDate: string
  /** Derived (un-overridden) target — passed to extendPlanTarget as the base. */
  derivedTarget: string
  daysLeft: number
  /** 0..1 fraction of the topic's questions answered. */
  completionFrac: number
  /** 0..1 fraction of the allotted time elapsed. */
  timeFrac: number
  /** completion% rounded for the gauge label. */
  completionPct: number
  pace: 'ahead' | 'behind-slight' | 'behind'
  /** Days behind the expected pace (for the "בפיגור" caption). */
  daysBehind: number
  /** True when the effective target has been clamped to the exam date. */
  cappedAtExam: boolean
}

function answeredFracForTopic(topicId: string, answeredIds: string[]): { frac: number; total: number } {
  const questions: Array<{ id: string | number }> =
    (quizBankData.topics as Record<string, any>)[topicId]?.questions ?? []
  if (questions.length === 0) return { frac: 0, total: 0 }
  const answered = questions.filter(q => answeredIds.includes(`studyhub-q${q.id}`)).length
  return { frac: answered / questions.length, total: questions.length }
}

/**
 * Distribute the plan sequence evenly across today → examDate and return the
 * first 3 topics with their target dates, days-left, and an on-track pace
 * metric. Returns [] unless both a plan and an exam date exist.
 */
function computePlanTargets(
  sequence: { topicId: string }[],
  examDate: string | null,
  planGeneratedAt: number,
  overrides: Record<string, string>,
  answeredIds: string[],
): PlanTargetRow[] {
  if (!examDate || sequence.length === 0) return []

  const today = todayISO()
  const daysToExam = Math.max(1, daysBetween(today, examDate))
  const n = sequence.length
  // Plan start: the day the plan was generated, but never after today (so
  // elapsed time is non-negative even if the user opens the plan days later).
  const genISO = new Date(planGeneratedAt || Date.now()).toISOString().slice(0, 10)
  const planStart = genISO < today ? genISO : today

  return sequence.slice(0, 3).map((step, i) => {
    // Topic i of N gets target = today + round((i+1)/N * daysToExam), clamped
    // to ≤ examDate and to ≥ 1 day from today so the top-3 are spaced and not
    // all stacked on the exam day.
    const rawOffset = Math.round(((i + 1) / n) * daysToExam)
    const offset = Math.min(daysToExam, Math.max(i + 1, rawOffset))
    const derivedTarget = addDays(today, offset)

    const override = overrides[step.topicId]
    let targetDate = override ?? derivedTarget
    let cappedAtExam = false
    if (targetDate > examDate) { targetDate = examDate; cappedAtExam = true }
    if (override && override >= examDate) cappedAtExam = true

    const daysLeft = Math.max(0, daysBetween(today, targetDate))

    // Pace: completion vs. time elapsed within this topic's allotted window.
    const { frac: completionFrac } = answeredFracForTopic(step.topicId, answeredIds)
    const allotted = Math.max(1, daysBetween(planStart, targetDate))
    const elapsed = Math.max(0, daysBetween(planStart, today))
    const timeFrac = Math.min(1, elapsed / allotted)

    let pace: PlanTargetRow['pace']
    if (completionFrac >= timeFrac) pace = 'ahead'
    else if (timeFrac - completionFrac <= 0.15) pace = 'behind-slight'
    else pace = 'behind'

    // How many days "behind" the expected pace (gap × allotted window).
    const daysBehind = Math.max(0, Math.round((timeFrac - completionFrac) * allotted))

    return {
      topicId: step.topicId,
      hebrewTitle: HEBREW_LABELS[step.topicId] ?? step.topicId,
      targetDate,
      derivedTarget,
      daysLeft,
      completionFrac,
      timeFrac,
      completionPct: Math.round(completionFrac * 100),
      pace,
      daysBehind,
      cappedAtExam,
    }
  })
}

// ── Smart pace gauge ───────────────────────────────────────────────────────────

const PACE_COLOR: Record<PlanTargetRow['pace'], string> = {
  'ahead':          '#3FA85F', // green
  'behind-slight':  'var(--sh-gold, #D4A017)', // amber
  'behind':         '#D1495B', // red
}

function PaceGauge({ pct, pace }: { pct: number; pace: PlanTargetRow['pace'] }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const filled = (pct / 100) * circumference
  const color = PACE_COLOR[pace]

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(31,62,108,0.12)" strokeWidth={4} />
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
        {pct}%
      </text>
    </svg>
  )
}

function paceCaption(row: PlanTargetRow): string {
  if (row.pace === 'ahead') return 'בקצב'
  if (row.pace === 'behind-slight') return 'מעט מאחור'
  return row.daysBehind > 0 ? `בפיגור — ${row.daysBehind} ימים` : 'בפיגור'
}

// ── Plan-target row (top-3 dated topics) ───────────────────────────────────────

function PlanTargetCard({ row, onSelect, onExtend }: {
  row: PlanTargetRow
  onSelect: (topicId: string) => void
  onExtend: (topicId: string, derivedTarget: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const paceColor = PACE_COLOR[row.pace]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: '11px 14px',
        border: `1px solid ${row.pace === 'behind' ? 'rgba(209,73,91,0.30)' : 'rgba(242,175,19,0.22)'}`,
        boxShadow: hovered ? '0 4px 18px rgba(31,62,108,0.12)' : '0 1px 6px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease',
        userSelect: 'none',
      }}
    >
      <PaceGauge pct={row.completionPct} pace={row.pace} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`${row.hebrewTitle}, יעד ${formatTargetDate(row.targetDate)}, נשארו ${row.daysLeft} ימים. לחץ לתרגול`}
          onClick={() => onSelect(row.topicId)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(row.topicId) }}
          style={{
            fontFamily: "'Rubik', 'Assistant', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--sh-text-dark)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          {row.hebrewTitle}
        </div>

        <div style={{ fontSize: 11, color: 'var(--sh-text-light)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span>יעד: <b style={{ color: 'var(--sh-text-med)' }}>{formatTargetDate(row.targetDate)}</b></span>
          <span>נשארו {row.daysLeft} ימים</span>
          <span style={{ color: paceColor, fontWeight: 600 }}>{paceCaption(row)}</span>
        </div>

        {row.cappedAtExam && (
          <div style={{ fontSize: 10, color: 'var(--sh-text-light)', marginTop: 2, opacity: 0.85 }}>
            התאריך מוגבל למועד הבחינה
          </div>
        )}
      </div>

      <button
        onClick={() => onExtend(row.topicId, row.derivedTarget)}
        aria-label={`בקש הארכה לנושא ${row.hebrewTitle}`}
        style={{
          flexShrink: 0,
          background: 'transparent',
          border: '1px solid rgba(242,175,19,0.40)',
          borderRadius: 8,
          padding: '5px 10px',
          fontSize: 11,
          color: 'var(--sh-gold, #D4A017)',
          cursor: 'pointer',
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 600,
          whiteSpace: 'nowrap',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        בקש הארכה
      </button>
    </div>
  )
}

// ── SVG Risk Ring ─────────────────────────────────────────────────────────────

function RiskRing({ score }: { score: number }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const color = score >= 60
    ? 'var(--sh-sidebar-active, #254A9F)'
    : score >= 30
      ? 'rgba(242,175,19,0.85)'
      : 'rgba(242,175,19,0.35)'

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(242,175,19,0.20)" strokeWidth={4} />
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
        border: `1px solid ${isHigh ? 'rgba(51,81,202,0.22)' : 'rgba(242,175,19,0.18)'}`,
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
            border: '1.5px solid rgba(242,175,19,0.6)',
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
            background: 'rgba(242,175,19,0.85)',
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
        border: '1px solid rgba(242,175,19,0.35)',
        borderRadius: 8,
        padding: '5px 12px',
        fontSize: 12,
        color: 'rgba(242,175,19,0.85)',
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
  const cards        = useLearningStore(s => s.cards)
  const examDate     = useLearningStore(s => s.examDate)
  const setExamDate  = useLearningStore(s => s.setExamDate)
  const personalPlan = useLearningStore(s => s.personalPlan)
  const planTargets  = useLearningStore(s => s.planTargets)
  const answeredIds  = useLearningStore(s => s.answeredIds)
  const extendPlanTarget = useLearningStore(s => s.extendPlanTarget)

  const topFive = useMemo(
    () => computeTopicRisks(cards, examDate).slice(0, 5),
    [cards, examDate],
  )

  // First 3 plan topics get dated targets + a smart pace gauge (only when both
  // a personal plan and an exam date exist).
  const planTargetRows = useMemo(
    () => computePlanTargets(
      personalPlan?.sequence ?? [],
      examDate,
      personalPlan?.generatedAt ?? 0,
      planTargets,
      answeredIds,
    ),
    [personalPlan, examDate, planTargets, answeredIds],
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

      {/* Plan target section — first 3 plan topics with dated pace gauges */}
      {planTargetRows.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Rubik', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--sh-text-med)',
            marginBottom: 7,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>🗓️ יעדי התוכנית הקרובים</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {planTargetRows.map(row => (
              <PlanTargetCard
                key={row.topicId}
                row={row}
                onSelect={onSelectTopic}
                onExtend={(topicId, derivedTarget) => extendPlanTarget(topicId, 3, derivedTarget)}
              />
            ))}
          </div>
        </div>
      )}

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
