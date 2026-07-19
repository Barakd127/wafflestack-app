// Rebuild Bench (פינת השיפוץ) — T1.4 / R10 of the Asset Economy.
// Where a question lands after a second consecutive retrieval failure. Warm
// workshop register: wood + gold, corrective and gentle. NEVER red, never
// infirmary language — a thing here is being RENOVATED, not treated.
//
// Three stages, one screen each, progress dots, resumable within mount:
//   1. דוגמה פתורה  — worked example from the topic's lesson (free scaffolding)
//   2. השלמה        — the failed question WITH its explanation visible
//   3. בנייה מחדש   — the same question clean, no aids. THIS is the genuine
//                      generation event: only stage 3 touches the ledger payout
//                      path. Stages 1–2 pay NOTHING (graph events only).
//
// R13: no projected earnings are ever shown before the act; coin feedback after
// success is a single muted secondary line under the competence copy.

import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useLearningStore } from '../../store/learningStore'
import { LESSON_CONTENT_ALL } from '../../data/lesson-content'
import type { LessonSlide } from '../../data/lesson-content'
import { HEBREW_LABELS } from '../../data/topicLabels'
import { recordRetrievalPass, appendGraphEvent } from '../../lib/ledger/ledger'
import { MathText } from '../../lib/mathRender'
import quizBank from '../../data/quiz-bank.json'

// ── Question lookup (quiz-bank shape mirrors useQuiz.ts QuizBankQuestion) ────

interface BankQuestion {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correct_answer: string
  correctIndex?: number
  explanation: string
}

function findQuestion(topicId: string, questionId: string): BankQuestion | null {
  const topics = quizBank.topics as unknown as Record<string, { questions?: BankQuestion[] }>
  const q = topics[topicId]?.questions?.find(x => x.id === questionId)
  return q ?? null
}

function correctIndexOf(q: BankQuestion): number {
  if (typeof q.correctIndex === 'number') return q.correctIndex
  const idx = q.options.indexOf(q.correct_answer)
  return idx >= 0 ? idx : 0
}

/** XP mirrors the store's QUESTION_BANK range (10–20) by difficulty. */
const XP_BY_DIFFICULTY: Record<BankQuestion['difficulty'], number> = {
  easy: 10,
  medium: 15,
  hard: 20,
}

// ── Worked-example slide selection ───────────────────────────────────────────
// Prefer explicit worked-example slides (titles containing 'דוגמה'); fall back
// to the lesson's first two slides. No lesson at all → null (caller then shows
// the failed question + its explanation as the worked example).

function pickWorkedSlides(topicId: string): { hebrewName: string; slides: LessonSlide[] } | null {
  const lesson = LESSON_CONTENT_ALL.find(t => t.id === topicId)
  if (!lesson || lesson.slides.length === 0) return null
  const examples = lesson.slides.filter(s => s.title.includes('דוגמה'))
  const slides = (examples.length > 0 ? examples : lesson.slides).slice(0, 2)
  return { hebrewName: lesson.hebrewName, slides }
}

// ── KaTeX-safe text rendering ────────────────────────────────────────────────
// Lesson content embeds inline $...$ LaTeX. Repo rule: NEVER show raw $...$ to
// users — MathText (the quiz renderer's pipeline) splits the runs and renders
// real KaTeX notation. Bare LaTeX commands outside $…$ (e.g. a slide written
// as "\bar{x} = 63/7") get wrapped so they render too instead of leaking.

function renderMathSafeText(text: string): ReactNode[] {
  // Wrap un-delimited LaTeX command runs in $…$ so MathText picks them up.
  const withDollars = text.includes('$')
    ? text
    : text.replace(/(\\[a-zA-Z]+(?:\{[^}]*\})*(?:\s*[=<>±+\-·*/^_0-9.,()a-zA-Z{}\\]+)*)/g, (m) => `$${m.trim()}$`)
  return [<MathText key="mt" text={withDollars} />]
}

// ── Bench-seen flag (enables the small 'דלג' link after first full cycle) ────

function benchSeenKey(userId: string): string {
  return `wafflestack-bench-seen-${userId}`
}

function loadBenchSeen(userId: string): string[] {
  try {
    const raw = localStorage.getItem(benchSeenKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function markBenchSeen(userId: string, topicId: string): void {
  try {
    const seen = loadBenchSeen(userId)
    if (!seen.includes(topicId)) {
      localStorage.setItem(benchSeenKey(userId), JSON.stringify([...seen, topicId]))
    }
  } catch {
    /* quota — skip link simply stays hidden next time */
  }
}

// ── Small utils ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Component ────────────────────────────────────────────────────────────────

type Stage = 1 | 2 | 3

const STAGE_NAMES: Record<Stage, string> = {
  1: 'דוגמה פתורה',
  2: 'השלמה',
  3: 'בנייה מחדש',
}

export function RebuildBench({
  userId,
  topicId,
  questionId,
  onClose,
}: {
  userId: string
  topicId: string
  questionId: string
  onClose: () => void
}) {
  const cards = useLearningStore(s => s.cards)
  const recordSM2Answer = useLearningStore(s => s.recordSM2Answer)

  const question = useMemo(() => findQuestion(topicId, questionId), [topicId, questionId])
  const worked = useMemo(() => pickWorkedSlides(topicId), [topicId])
  const skipEnabled = useMemo(() => loadBenchSeen(userId).includes(topicId), [userId, topicId])

  const [stage, setStage] = useState<Stage>(1)
  // Bumping `attempt` reshuffles stage-3 options after a gentle forced retry.
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [stage2Solved, setStage2Solved] = useState(false)
  // Stage 3, R10: a wrong pick REVEALS the correct answer + forces a re-attempt.
  const [revealCorrect, setRevealCorrect] = useState(false)
  const [finished, setFinished] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)

  const correctIdx = question ? correctIndexOf(question) : 0

  // Stable shuffled option order per (stage, attempt) so re-renders don't churn.
  const optionOrder = useMemo(() => {
    if (!question) return []
    return shuffle(question.options.map((_, i) => i))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, stage, attempt])

  // ── Stage transitions ──────────────────────────────────────────────────────

  const logStagePassed = (passedStage: Stage) => {
    // Struggle scaffolding is private by design (R10) — never public feed data.
    appendGraphEvent(userId, {
      type: 'scaffold-step-completed',
      visibility: 'private-struggle',
      payload: { topicId, questionId, stage: passedStage, stageName: STAGE_NAMES[passedStage] },
    })
  }

  const advanceTo = (next: Stage) => {
    setStage(next)
    setPicked(null)
    setRevealCorrect(false)
  }

  const passStage1 = () => {
    logStagePassed(1)
    advanceTo(2)
  }

  const passStage2 = () => {
    logStagePassed(2)
    advanceTo(3)
  }

  // Skip = jump ahead WITHOUT logging a scaffold pass (nothing was practiced).
  const skipStage = () => advanceTo(stage === 1 ? 2 : 3)

  const finishBench = () => {
    if (finished) return // single genuine generation event — never double-pay
    logStagePassed(3)
    // Read the SM-2 interval BEFORE recordSM2Answer mutates the card — R7 pays
    // on the scheduled interval AT TIME OF PASS.
    const intervalAtPass = cards[questionId]?.interval || 1
    const { coins } = recordRetrievalPass(userId, {
      topicId,
      questionId,
      retentionIntervalDays: intervalAtPass,
      firstTry: false, // it reached the bench — by definition not a first try
      isNewCard: false,
    })
    const xp = question ? XP_BY_DIFFICULTY[question.difficulty] ?? 10 : 10
    recordSM2Answer(questionId, 4, xp)
    markBenchSeen(userId, topicId) // full cycle done → 'דלג' unlocks next time
    setCoinsEarned(coins)
    setFinished(true)
  }

  const pickStage2 = (idx: number) => {
    setPicked(idx)
    if (idx === correctIdx) setStage2Solved(true)
    // Wrong pick: no penalty, no ledger write — gentle retry until correct.
  }

  const pickStage3 = (idx: number) => {
    if (revealCorrect || finished) return
    setPicked(idx)
    if (idx === correctIdx) {
      finishBench()
    } else {
      // R10: show the correct answer, then a forced (reshuffled) re-attempt.
      setRevealCorrect(true)
    }
  }

  const retryStage3 = () => {
    setAttempt(a => a + 1)
    setPicked(null)
    setRevealCorrect(false)
  }

  // ── Styles (warm workshop: wood wash + gold accents, never red) ───────────

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    // Viewport-fixed full-screen overlay → physical inset covers all edges.
    inset: 0,
    zIndex: 1000,
    // Warm workshop-wood wash (rgba, not hex — the bench's one overlay wash,
    // mirroring the Observatory's approved night-sky pattern).
    background: 'linear-gradient(180deg, rgba(44,31,17,0.97), rgba(59,42,23,0.97))',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    flexShrink: 0,
  }

  const titleWrapStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2 }

  const titleStyle: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: 0,
  }

  const subtitleStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  }

  const closeBtnStyle: CSSProperties = {
    minWidth: 44,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    cursor: 'pointer',
  }

  const dotsRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '4px 16px 12px',
    flexShrink: 0,
  }

  const dotStyle = (dotStage: Stage): CSSProperties => {
    const done = finished || stage > dotStage
    const current = !finished && stage === dotStage
    return {
      width: current ? 14 : 10,
      height: current ? 14 : 10,
      borderRadius: '50%',
      background: done || current ? 'var(--sh-gold)' : 'rgba(255,255,255,0.18)',
      border: '1px solid rgba(255,255,255,0.25)',
      transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease',
    }
  }

  const dotLabelStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginInlineStart: 8,
  }

  const bodyStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
    marginBlockEnd: 12,
    color: 'rgba(255,255,255,0.9)',
  }

  const slideTitleStyle: CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: '0 0 8px',
  }

  const slideTextStyle: CSSProperties = {
    fontSize: 15,
    lineHeight: 1.7,
    margin: 0,
  }

  const formulaBlockStyle: CSSProperties = {
    display: 'block',
    marginBlockStart: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    fontSize: 15,
    color: 'var(--sh-gold)',
    textAlign: 'center',
    overflowX: 'auto',
  }

  const questionTextStyle: CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.7,
    margin: 0,
  }

  const explanationStyle: CSSProperties = {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.75)',
    borderInlineStart: '3px solid var(--sh-gold)',
    paddingInlineStart: 10,
    margin: 0,
  }

  // MC options: 2×2 grid per repo convention.
  const optionsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    width: '100%',
    maxWidth: 560,
    marginBlockEnd: 12,
  }

  const optionStyle = (idx: number): CSSProperties => {
    const isPicked = picked === idx
    const isCorrectPick = isPicked && idx === correctIdx
    const showAsCorrect = revealCorrect && idx === correctIdx
    return {
      minHeight: 44,
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.06)',
      border:
        isCorrectPick || showAsCorrect
          ? '1px solid var(--sh-gold)'
          : '1px solid rgba(255,255,255,0.12)',
      boxShadow: isCorrectPick || showAsCorrect ? '0 0 0 1px var(--sh-gold)' : 'none',
      // Gentle (R10): a wrong pick only dims — never red, never a penalty tone.
      opacity: isPicked && idx !== correctIdx ? 0.55 : 1,
      borderRadius: 10,
      color: 'rgba(255,255,255,0.9)',
      fontSize: 15,
      lineHeight: 1.5,
      textAlign: 'start',
      cursor: revealCorrect || finished ? 'default' : 'pointer',
    }
  }

  const gentleNoteStyle: CSSProperties = {
    fontSize: 14,
    color: 'var(--sh-gold)',
    textAlign: 'center',
    margin: '0 0 12px',
  }

  const primaryBtnStyle = (enabled: boolean): CSSProperties => ({
    minHeight: 44,
    padding: '10px 28px',
    background: 'var(--sh-gold)',
    border: 'none',
    borderRadius: 12,
    // Warm dark ink on gold (rgba, not hex) — readable in both themes.
    color: 'rgba(26,18,6,0.92)',
    fontSize: 15,
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.45,
  })

  const skipLinkStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    minHeight: 44,
    padding: '10px 12px',
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'underline',
    cursor: 'pointer',
  }

  const actionsRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 560,
  }

  const finishedWrapStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  }

  const finishedCopyStyle: CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: 0,
    textAlign: 'center',
  }

  const coinNoteStyle: CSSProperties = {
    // R13: coin feedback stays SECONDARY to the competence copy above it.
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  }

  const topicName = HEBREW_LABELS[topicId] ?? topicId

  // ── Missing question guard (should not happen; graceful anyway) ────────────
  if (!question) {
    return (
      <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="פינת השיפוץ">
        <div style={headerStyle}>
          <div style={titleWrapStyle}>
            <h2 style={titleStyle}>פינת השיפוץ</h2>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="סגירת פינת השיפוץ">
            ✕
          </button>
        </div>
        <div style={finishedWrapStyle}>
          <p style={{ ...slideTextStyle, color: 'rgba(255,255,255,0.85)' }}>
            השאלה לא נמצאה — נחזור אליה בסבב הבא.
          </p>
          <button type="button" style={primaryBtnStyle(true)} onClick={onClose}>
            חזרה ללמידה
          </button>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="פינת השיפוץ">
      {/* Gentle glow on the completion mark; stilled under reduced motion. */}
      <style>{`
        @keyframes bench-glow {
          0%, 100% { text-shadow: 0 0 6px var(--sh-gold); }
          50% { text-shadow: 0 0 18px var(--sh-gold); }
        }
        .bench-done-mark { animation: bench-glow 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bench-done-mark { animation: none; }
        }
      `}</style>

      <div style={headerStyle}>
        <div style={titleWrapStyle}>
          <h2 style={titleStyle}>פינת השיפוץ</h2>
          <span style={subtitleStyle}>{topicName}</span>
        </div>
        <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="סגירת פינת השיפוץ">
          ✕
        </button>
      </div>

      {!finished && (
        <div style={dotsRowStyle} aria-label={`שלב ${stage} מתוך 3: ${STAGE_NAMES[stage]}`}>
          {([1, 2, 3] as Stage[]).map(s => (
            <span key={s} style={dotStyle(s)} aria-hidden="true" />
          ))}
          <span style={dotLabelStyle}>{STAGE_NAMES[stage]}</span>
        </div>
      )}

      {finished ? (
        <div style={finishedWrapStyle}>
          <span className="bench-done-mark" style={{ fontSize: 44, color: 'var(--sh-gold)' }} aria-hidden="true">
            🔨
          </span>
          <p style={finishedCopyStyle}>שופץ. חזק מתמיד.</p>
          {coinsEarned > 0 && <p style={coinNoteStyle}>+{coinsEarned} מטבעות על הבנייה מחדש</p>}
          <button type="button" style={primaryBtnStyle(true)} onClick={onClose}>
            חזרה ללמידה
          </button>
        </div>
      ) : (
        <div style={bodyStyle}>
          {/* ── Stage 1: worked example ─────────────────────────────────── */}
          {stage === 1 && (
            <>
              {worked ? (
                worked.slides.map((slide, i) => (
                  <div key={i} style={cardStyle}>
                    <h3 style={slideTitleStyle}>{slide.title}</h3>
                    <div style={slideTextStyle}>{renderMathSafeText(slide.content)}</div>
                    {slide.formula && (
                      // Best-effort formula display — $ stripped, LTR code block.
                      // TODO(integrator): swap for the KatexFormula pipeline.
                      <code dir="ltr" style={formulaBlockStyle}>
                        {slide.formula.replace(/\$/g, '')}
                      </code>
                    )}
                  </div>
                ))
              ) : (
                // No lesson for this topic → the failed question WITH its
                // explanation serves as the worked example.
                <div style={cardStyle}>
                  <h3 style={slideTitleStyle}>ככה פותרים את זה</h3>
                  <div style={{ ...questionTextStyle, marginBlockEnd: 10 }}>
                    {renderMathSafeText(question.question)}
                  </div>
                  <div style={explanationStyle}>{renderMathSafeText(question.explanation)}</div>
                </div>
              )}
              <div style={actionsRowStyle}>
                <button type="button" style={primaryBtnStyle(true)} onClick={passStage1}>
                  הבנתי, ממשיכים
                </button>
                {skipEnabled && (
                  <button type="button" style={skipLinkStyle} onClick={skipStage}>
                    דלג
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Stage 2: the question with its explanation visible ──────── */}
          {stage === 2 && (
            <>
              <div style={cardStyle}>
                <div style={{ ...questionTextStyle, marginBlockEnd: 10 }}>
                  {renderMathSafeText(question.question)}
                </div>
                <div style={explanationStyle}>{renderMathSafeText(question.explanation)}</div>
              </div>
              <div style={optionsGridStyle}>
                {optionOrder.map(idx => (
                  <button
                    key={idx}
                    type="button"
                    style={optionStyle(idx)}
                    onClick={() => pickStage2(idx)}
                  >
                    {renderMathSafeText(question.options[idx])}
                  </button>
                ))}
              </div>
              {picked !== null && picked !== correctIdx && (
                <p style={gentleNoteStyle}>עוד לא — קראו שוב את ההסבר ונסו שוב, בלי לחץ.</p>
              )}
              {stage2Solved && <p style={gentleNoteStyle}>יפה, זה הכיוון.</p>}
              <div style={actionsRowStyle}>
                {/* Locked until solved: aria-disabled + inert onClick (repo rule). */}
                <button
                  type="button"
                  aria-disabled={!stage2Solved}
                  style={primaryBtnStyle(stage2Solved)}
                  onClick={stage2Solved ? passStage2 : undefined}
                >
                  לשלב הבנייה
                </button>
                {skipEnabled && (
                  <button type="button" style={skipLinkStyle} onClick={skipStage}>
                    דלג
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Stage 3: clean rebuild — no aids ─────────────────────────── */}
          {stage === 3 && (
            <>
              <div style={cardStyle}>
                <div style={questionTextStyle}>{renderMathSafeText(question.question)}</div>
              </div>
              <div style={optionsGridStyle}>
                {optionOrder.map(idx => (
                  <button
                    key={idx}
                    type="button"
                    aria-disabled={revealCorrect}
                    style={optionStyle(idx)}
                    onClick={revealCorrect ? undefined : () => pickStage3(idx)}
                  >
                    {renderMathSafeText(question.options[idx])}
                  </button>
                ))}
              </div>
              {revealCorrect && (
                <>
                  <p style={gentleNoteStyle}>
                    כמעט. התשובה הנכונה מסומנת בזהב — רגע להסתכל, ובונים שוב.
                  </p>
                  <div style={actionsRowStyle}>
                    <button type="button" style={primaryBtnStyle(true)} onClick={retryStage3}>
                      בונים שוב
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default RebuildBench
