// PersonalPlanWizard — 3-step intake modal that generates a personalized
// study plan and saves it to the learning store.
//
// Visual style mirrors CourseGate (gold + navy gradients, glass cards).
// Hebrew RTL throughout. See: Vault/Hybrid/specs/personal-plan-spec.md §4.

import { useState, useEffect } from 'react'
import { useLearningStore } from '../store/learningStore'
import {
  DEFAULT_INTAKE,
  type IntakeAnswers,
  type Goal,
  type MotivationProfile,
} from '../data/personalPlanTypes'
import { generatePlan } from '../lib/generatePlan'
import { HEBREW_LABELS } from '../data/topicLabels'

// Hebrew labels for the 13 active Stat-A topic ids (subset of HEBREW_LABELS).
const TOPIC_OPTIONS: { id: string; label: string }[] = [
  { id: 'mean', label: 'ממוצע' },
  { id: 'median', label: 'חציון' },
  { id: 'std-dev', label: 'שונות וסטיית תקן' },
  { id: 'percentiles', label: 'אחוזונים' },
  { id: 'distribution-shapes', label: 'צורות התפלגות' },
  { id: 'probability', label: 'הסתברות' },
  { id: 'binomial', label: 'התפלגות בינומית' },
  { id: 'sampling', label: 'דגימה' },
  { id: 'hypothesis-testing', label: 'התפלגות נורמלית / מבחני השערות' },
  { id: 'confidence-intervals', label: 'רווחי סמך' },
  { id: 'correlation', label: 'מתאם' },
  { id: 'regression', label: 'רגרסיה ליניארית' },
  { id: 'combinatorics', label: 'קומבינטוריקה' },
]

const GOAL_OPTIONS: { id: Goal; label: string; sub: string; emoji: string }[] = [
  { id: 'final-exam-soon', label: 'מבחן בקרוב', sub: 'פחות מ-3 שבועות', emoji: '🚨' },
  { id: 'final-exam-month', label: 'מבחן בעוד חודש', sub: '3-6 שבועות', emoji: '📅' },
  { id: 'mid-semester', label: 'באמצע הסמסטר', sub: 'לומד תוך כדי', emoji: '📚' },
  { id: 'review-only', label: 'סקירה כללית', sub: 'חזרה / לפני שיעור', emoji: '🔁' },
  { id: 'curious', label: 'סקרנות', sub: 'לא לומד פורמלית', emoji: '🌟' },
]

// Multi-select: what helps the user learn. Stored as learningHelpers (ids).
const HELP_OPTIONS: { id: string; label: string; sub: string; emoji: string }[] = [
  { id: 'theory',     label: 'תיאוריה קודם',      sub: 'לקרוא ואז לתרגל',          emoji: '📖' },
  { id: 'practice',   label: 'תרגול קודם',        sub: 'לקפוץ ישר לשאלות',         emoji: '✍️' },
  { id: 'visual',     label: 'ויזואלי',           sub: 'מפות חשיבה ודיאגרמות',     emoji: '🗺️' },
  { id: 'examples',   label: 'דוגמאות',           sub: 'מהחיים האמיתיים',          emoji: '💡' },
  { id: 'video',      label: 'סרטונים',           sub: 'הסברים מצולמים',           emoji: '🎥' },
  { id: 'summaries',  label: 'סיכומים קצרים',      sub: 'נקודות מפתח',              emoji: '📝' },
  { id: 'repetition', label: 'חזרה ושינון',       sub: 'לחזור שוב ושוב',           emoji: '🔁' },
  { id: 'color',      label: 'צבעים והדגשות',      sub: 'להבליט ויזואלית',          emoji: '🎨' },
  { id: 'steps',      label: 'צעד-אחר-צעד',        sub: 'פירוק לחלקים קטנים',       emoji: '🧩' },
  { id: 'tutor',      label: 'הסבר אישי',          sub: 'לשאול שאלות תוך כדי',       emoji: '🧑‍🏫' },
]

const MOTIVATION_OPTIONS: { id: MotivationProfile; label: string; emoji: string }[] = [
  { id: 'streak', label: 'רצף ימים', emoji: '🔥' },
  { id: 'mastery', label: 'לסיים נושאים ב-100%', emoji: '🏆' },
  { id: 'understanding', label: 'להבין באמת', emoji: '💡' },
  { id: 'structured', label: 'תכנית מסודרת', emoji: '🗂️' },
]

interface PersonalPlanWizardProps {
  open: boolean
  onClose: () => void
  // Navigate to a topic's learning screen. Wired by HomeScreen; when present,
  // the success-step rows + main CTA become clickable links into each topic.
  onSelectTopic?: (topicId: string) => void
}

export default function PersonalPlanWizard({ open, onClose, onSelectTopic }: PersonalPlanWizardProps) {
  const existing = useLearningStore(s => s.intakeAnswers)
  const setPersonalPlan = useLearningStore(s => s.setPersonalPlan)
  const setExamDate = useLearningStore(s => s.setExamDate)

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [answers, setAnswers] = useState<IntakeAnswers>(existing ?? DEFAULT_INTAKE)

  // Reset to pre-filled state every time the modal opens. Depend on `open`
  // ONLY — NOT `existing`. finish() calls setPersonalPlan(), which updates the
  // store's intakeAnswers (= `existing`); if `existing` were a dep, that update
  // would re-fire this effect mid-flow and snap the wizard back to step 1
  // instead of showing the success step (step 4). Per user 2026-05-31.
  useEffect(() => {
    if (open) {
      setAnswers(existing ?? DEFAULT_INTAKE)
      setStep(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const update = <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) =>
    setAnswers(prev => ({ ...prev, [key]: value }))

  const toggleHelper = (id: string) => {
    setAnswers(prev => {
      const has = prev.learningHelpers.includes(id)
      const learningHelpers = has
        ? prev.learningHelpers.filter(h => h !== id)
        : [...prev.learningHelpers, id]
      // Keep the legacy single `style` roughly in sync for anything that reads it.
      const t = learningHelpers.includes('theory')
      const p = learningHelpers.includes('practice')
      const style = t && !p ? 'theory-first' : p && !t ? 'practice-first' : 'mixed'
      return { ...prev, learningHelpers, style }
    })
  }

  const toggleInList = (key: 'knownTopics' | 'weakTopics', topicId: string) => {
    setAnswers(prev => {
      const list = prev[key]
      const has = list.includes(topicId)
      const next = has ? list.filter(t => t !== topicId) : [...list, topicId]
      // If toggling into one bucket, remove from the opposite.
      const otherKey = key === 'knownTopics' ? 'weakTopics' : 'knownTopics'
      const other = prev[otherKey].filter(t => t !== topicId)
      return { ...prev, [key]: next, [otherKey]: other }
    })
  }

  const canAdvance = (): boolean => {
    if (step === 1) {
      if (!answers.goal) return false
      if ((answers.goal === 'final-exam-soon' || answers.goal === 'final-exam-month') && !answers.examDate) {
        return false
      }
      return true
    }
    if (step === 2) return answers.dailyMinutes >= 5 && answers.learningHelpers.length > 0
    return true
  }

  const finish = () => {
    const finalAnswers: IntakeAnswers = { ...answers, answeredAt: Date.now() }
    const plan = generatePlan(finalAnswers)
    setPersonalPlan(plan, finalAnswers)
    if (finalAnswers.examDate) setExamDate(finalAnswers.examDate)
    setStep(4)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 220,
        background: 'rgba(11,27,62,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        dir="rtl"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22,
          padding: '32px 36px 28px',
          width: '100%', maxWidth: 560, maxHeight: '92vh', overflow: 'auto',
          boxShadow: '0 24px 70px rgba(0,0,0,0.32)',
          fontFamily: "'Rubik', sans-serif", color: '#0B1B3E',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
            color: '#0B1B3E', borderRadius: 999,
            padding: '4px 14px', fontSize: 12, fontWeight: 700,
            marginBottom: 10, letterSpacing: 0.3,
          }}>
            תכנית אישית
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {step === 4 ? '🎉 התכנית שלך מוכנה!' : 'בוא נתאים תכנית בדיוק בשבילך'}
          </h2>
          {step !== 4 && (
            <div style={{ fontSize: 13, color: '#5b6f93', marginTop: 6 }}>
              שלב {step} מתוך 3 · לוקח פחות מדקה
            </div>
          )}
        </div>

        {/* Progress dots */}
        {step !== 4 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 28 : 8, height: 8, borderRadius: 8,
                background: s <= step ? 'linear-gradient(135deg,#F5C842,#D4AF37)' : 'rgba(31,62,108,0.18)',
                transition: 'width 0.2s',
              }} />
            ))}
          </div>
        )}

        {/* STEP 1 — Goal */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>מה המטרה שלך?</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {GOAL_OPTIONS.map(g => (
                <OptionCard
                  key={g.id}
                  selected={answers.goal === g.id}
                  onClick={() => update('goal', g.id)}
                  emoji={g.emoji}
                  label={g.label}
                  sub={g.sub}
                />
              ))}
            </div>
            {(answers.goal === 'final-exam-soon' || answers.goal === 'final-exam-month') && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: '#5b6f93', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  תאריך מבחן
                </label>
                <input
                  type="date"
                  value={answers.examDate ?? ''}
                  onChange={e => update('examDate', e.target.value || null)}
                  style={{
                    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                    border: '1.5px solid #C4DCFF', borderRadius: 10,
                    fontFamily: 'inherit', fontSize: 14, color: '#0B1B3E',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Time + style */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
              כמה דקות ביום? <span style={{ color: '#D4AF37', fontWeight: 800 }}>{answers.dailyMinutes}</span> דק׳
            </div>
            <input
              type="range" min={5} max={120} step={5}
              value={answers.dailyMinutes}
              onChange={e => update('dailyMinutes', Number(e.target.value))}
              style={{ width: '100%', marginBottom: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7F9BD9', marginBottom: 20 }}>
              <span>5 דק׳</span><span>60 דק׳</span><span>120 דק׳</span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>מה עוזר לך ללמוד?</div>
            <div style={{ fontSize: 12.5, color: '#5b6f93', marginBottom: 10 }}>אפשר לבחור כמה שרוצים — נתאים את החוויה אליך.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {HELP_OPTIONS.map(s => (
                <OptionCard
                  key={s.id}
                  selected={answers.learningHelpers.includes(s.id)}
                  onClick={() => toggleHelper(s.id)}
                  emoji={s.emoji}
                  label={s.label}
                  sub={s.sub}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Topic confidence */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 14, color: '#5b6f93', marginBottom: 14, lineHeight: 1.5 }}>
              סמן את הנושאים שאתה מרגיש <b style={{ color: '#22833F' }}>חזק</b> בהם, ואת אלה שאתה <b style={{ color: '#d32f2f' }}>חלש</b> בהם.
              דלג על נושאים שאתה לא מכיר.
            </div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 18 }}>
              {TOPIC_OPTIONS.map(t => {
                const isStrong = answers.knownTopics.includes(t.id)
                const isWeak = answers.weakTopics.includes(t.id)
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(31,62,108,0.04)',
                    border: '1px solid rgba(31,62,108,0.08)',
                    borderRadius: 10, padding: '8px 12px',
                  }}>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                    <button
                      type="button"
                      onClick={() => toggleInList('knownTopics', t.id)}
                      style={{
                        border: `1px solid ${isStrong ? '#22833F' : 'rgba(34,131,63,0.3)'}`,
                        background: isStrong ? '#22833F' : 'transparent',
                        color: isStrong ? '#fff' : '#22833F',
                        borderRadius: 14, padding: '4px 10px', fontSize: 11,
                        fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
                      }}
                    >חזק</button>
                    <button
                      type="button"
                      onClick={() => toggleInList('weakTopics', t.id)}
                      style={{
                        border: `1px solid ${isWeak ? '#d32f2f' : 'rgba(211,47,47,0.3)'}`,
                        background: isWeak ? '#d32f2f' : 'transparent',
                        color: isWeak ? '#fff' : '#d32f2f',
                        borderRadius: 14, padding: '4px 10px', fontSize: 11,
                        fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
                      }}
                    >חלש</button>
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>מה הכי דוחף אותך? <span style={{ color: '#7F9BD9', fontWeight: 400, fontSize: 12 }}>(אופציונלי)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {MOTIVATION_OPTIONS.map(m => (
                <button
                  key={m.id} type="button"
                  onClick={() => update('motivationProfile', answers.motivationProfile === m.id ? null : m.id)}
                  style={{
                    background: answers.motivationProfile === m.id ? 'linear-gradient(135deg,#F5C842,#D4AF37)' : 'rgba(31,62,108,0.05)',
                    color: answers.motivationProfile === m.id ? '#0B1B3E' : '#1F3E6C',
                    border: `1px solid ${answers.motivationProfile === m.id ? '#D4AF37' : 'rgba(31,62,108,0.12)'}`,
                    borderRadius: 12, padding: '10px 12px',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'right',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && (
          <SuccessPanel onClose={onClose} onSelectTopic={onSelectTopic} />
        )}

        {/* Nav footer */}
        {step !== 4 && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 26 }}>
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep((step - 1) as 1 | 2 | 3))}
              style={{
                background: 'transparent', border: '1px solid rgba(31,62,108,0.2)',
                borderRadius: 12, padding: '10px 18px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, color: '#1F3E6C', fontWeight: 600,
              }}
            >
              {step === 1 ? 'ביטול' : '→ חזרה'}
            </button>
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={() => {
                if (step === 3) finish()
                else setStep((step + 1) as 1 | 2 | 3)
              }}
              style={{
                background: canAdvance() ? 'linear-gradient(135deg,#1F3E6C,#254A9F)' : 'rgba(31,62,108,0.3)',
                color: '#fff', border: 0, borderRadius: 12,
                padding: '10px 24px', cursor: canAdvance() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                boxShadow: canAdvance() ? '0 4px 14px rgba(31,62,108,0.3)' : 'none',
              }}
            >
              {step === 3 ? 'צור תכנית ←' : 'הבא ←'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OptionCard({ selected, onClick, emoji, label, sub }: {
  selected: boolean
  onClick: () => void
  emoji: string
  label: string
  sub: string
}) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        background: selected ? 'linear-gradient(135deg, rgba(245,200,66,0.18), rgba(212,175,55,0.10))' : '#fff',
        border: `1.5px solid ${selected ? '#D4AF37' : 'rgba(31,62,108,0.12)'}`,
        borderRadius: 14, padding: '12px 16px',
        fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 4px 12px rgba(212,175,55,0.18)' : 'none',
      }}
    >
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0B1B3E' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#5b6f93', marginTop: 2 }}>{sub}</div>
      </div>
      {selected && <div style={{ fontSize: 18, color: '#D4AF37' }}>✓</div>}
    </button>
  )
}

function SuccessPanel({ onClose, onSelectTopic }: {
  onClose: () => void
  onSelectTopic?: (topicId: string) => void
}) {
  const plan = useLearningStore(s => s.personalPlan)
  if (!plan) return null
  const first = plan.sequence.slice(0, 3)
  // Navigate into a topic's learning screen, then close the wizard.
  const go = (topicId: string) => {
    onSelectTopic?.(topicId)
    onClose()
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 76, height: 76, borderRadius: 20,
        background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
        margin: '4px auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, boxShadow: '0 10px 26px rgba(212,175,55,0.45)',
      }}>🎯</div>
      <div style={{ fontSize: 15, color: '#5b6f93', marginBottom: 18, lineHeight: 1.5 }}>
        בנינו עבורך מסלול של <b style={{ color: '#0B1B3E' }}>{plan.sequence.length}</b> נושאים,
        <br />עם יעד של <b style={{ color: '#0B1B3E' }}>{plan.dailyTargetMin} דקות ביום</b>.
      </div>
      <div style={{
        background: 'rgba(31,62,108,0.05)', borderRadius: 14, padding: '14px 18px',
        textAlign: 'right', marginBottom: 22,
      }}>
        <div style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 700, marginBottom: 8 }}>שלושת הצעדים הראשונים:</div>
        {first.map((s, i) => {
          const label = HEBREW_LABELS[s.topicId] || s.topicId
          const clickable = !!onSelectTopic
          return (
            <button
              key={s.topicId}
              type="button"
              dir="rtl"
              disabled={!clickable}
              onClick={() => go(s.topicId)}
              onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(31,62,108,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              style={{
                width: '100%', background: 'transparent', border: 0,
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px',
                borderRadius: 8, textAlign: 'right',
                fontFamily: 'inherit', cursor: clickable ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
                color: '#0B1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: clickable ? '#1F3E6C' : '#0B1B3E',
                textDecoration: clickable ? 'underline' : 'none',
                textUnderlineOffset: 3,
              }}>{label}</div>
              {s.hint && <div style={{ fontSize: 11, color: '#5b6f93' }}>{s.hint}</div>}
              {clickable && <div style={{ fontSize: 13, color: '#7F9BD9', flexShrink: 0 }}>←</div>}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => (first[0] && onSelectTopic ? go(first[0].topicId) : onClose())}
        style={{
          background: 'linear-gradient(135deg,#1F3E6C,#254A9F)', color: '#fff',
          border: 0, borderRadius: 12, padding: '12px 32px',
          fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(31,62,108,0.3)',
        }}
      >
        קדימה ללמוד ←
      </button>
    </div>
  )
}
