// Library (בית הספרים) — T1.1 + T1.2 of the Asset Economy.
// The shelves ARE the SM-2 due queue: one shelf per unlocked topic, a due-count
// badge, and a fog mark for weathered districts. A session is up to 8 questions
// — due cards first (interleaved round-robin across topics by default; tapping
// a shelf scopes the session to that topic — agency over WHERE, system picks
// the order WITHIN).
//
// Design rules enforced here:
//   R7  — payout math lives in the ledger; we only pass retentionIntervalDays
//         (the SM-2 interval AT TIME OF PASS, 0 for new) BEFORE recordSM2Answer.
//   R10 — wrong answer: corrective, gentle, NO red. Show the correct answer +
//         explanation, force a re-attempt of the SAME question. A second
//         CONSECUTIVE fail on the same question routes to the Rebuild Bench.
//   R13 — competence feedback FIRST (<300ms gold flash); the coin tick is a
//         small secondary fade ~600ms later. Never a projected-earnings promise.
//   R14 — sabbath is DERIVED (due queue empty + no new questions): a golden
//         calm panel with NO call-to-action.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLearningStore } from '../../store/learningStore'
import {
  recordRetrievalPass,
  recordRetrievalFail,
  completeWeeklyRitual,
} from '../../lib/ledger/ledger'
import { dueInfo, weathering, isSabbath } from '../../lib/ledger/projections'
import { TOPICS, questionTopicMap } from '../../lib/ledger/topicMeta'
import type { QuizBankQuestion } from '../../hooks/useQuiz'
import quizBank from '../../data/quiz-bank.json'

// ── Quiz-bank access ──────────────────────────────────────────────────────────

const BANK_TOPICS = quizBank.topics as unknown as Record<
  string,
  { questions?: QuizBankQuestion[] }
>

function questionsForTopic(topicId: string): QuizBankQuestion[] {
  return BANK_TOPICS[topicId]?.questions ?? []
}

const QUESTION_BY_ID: Record<string, QuizBankQuestion> = (() => {
  const map: Record<string, QuizBankQuestion> = {}
  for (const data of Object.values(BANK_TOPICS)) {
    for (const q of data.questions ?? []) map[q.id] = q
  }
  return map
})()

/** New MC schema (correctIndex) wins; legacy entries fall back to string match. */
function correctIndexOf(q: QuizBankQuestion): number {
  if (typeof q.correctIndex === 'number') return q.correctIndex
  const idx = q.options.indexOf(q.correct_answer)
  return idx >= 0 ? idx : 0
}

// ── Session building ──────────────────────────────────────────────────────────

const MAX_SESSION = 8
const RITUAL_MIN_ANSWERS = 5
const XP_PER_PASS = 10

interface SessionItem {
  qid: string
  topicId: string
}

interface CardSnapshot {
  interval: number
  nextReview: number
}

/**
 * Up to 8 questions. Due cards first, then new questions. Interleaved mode
 * (topicFilter=null) round-robins across the given topics; a topic-scoped
 * session takes only that shelf. Order WITHIN a topic is system-picked:
 * most-overdue first for due cards, bank order for new ones.
 */
function buildSession(
  topicFilter: string | null,
  cards: Record<string, CardSnapshot | undefined>,
  eligibleTopicIds: string[]
): SessionItem[] {
  const now = Date.now()
  const topicsInPlay = topicFilter ? [topicFilter] : eligibleTopicIds
  const dueByTopic = new Map<string, SessionItem[]>()
  const newByTopic = new Map<string, SessionItem[]>()

  for (const topicId of topicsInPlay) {
    const due: { qid: string; overdueMs: number }[] = []
    const fresh: SessionItem[] = []
    for (const q of questionsForTopic(topicId)) {
      const card = cards[q.id]
      if (!card || card.nextReview === 0) {
        fresh.push({ qid: q.id, topicId })
        continue
      }
      if (card.nextReview <= now) due.push({ qid: q.id, overdueMs: now - card.nextReview })
    }
    due.sort((a, b) => b.overdueMs - a.overdueMs)
    dueByTopic.set(topicId, due.map(d => ({ qid: d.qid, topicId })))
    newByTopic.set(topicId, fresh)
  }

  const session: SessionItem[] = []
  // Two passes: drain due queues first (round-robin), then new questions.
  for (const source of [dueByTopic, newByTopic]) {
    let took = true
    while (took && session.length < MAX_SESSION) {
      took = false
      for (const topicId of topicsInPlay) {
        if (session.length >= MAX_SESSION) break
        const next = source.get(topicId)?.shift()
        if (next) {
          session.push(next)
          took = true
        }
      }
    }
  }
  return session
}

// ── Component ────────────────────────────────────────────────────────────────

type View = 'shelves' | 'session' | 'summary'
type Phase = 'answering' | 'correct' | 'wrong'

export function Library({
  userId,
  onOpenBench,
  onClose,
}: {
  userId: string
  onOpenBench: (topicId: string, questionId: string) => void
  onClose: () => void
}) {
  const cards = useLearningStore(s => s.cards)
  const buildingProgress = useLearningStore(s => s.buildingProgress)

  // ── Shelf universe: the 10 core topics whose building is unlocked ──────────
  const shelfTopics = useMemo(
    () => TOPICS.filter(t => (buildingProgress[t.buildingId]?.level ?? 0) >= 1),
    [buildingProgress]
  )

  // Question→topic map scoped to the unlocked shelves, so due counts, sabbath
  // and fog all describe THIS library — not locked topics or other courses.
  const scopedMap = useMemo(() => {
    const ids = new Set(shelfTopics.map(t => t.topicId))
    const map: Record<string, string> = {}
    for (const [qid, topicId] of Object.entries(questionTopicMap)) {
      if (ids.has(topicId)) map[qid] = topicId
    }
    return map
  }, [shelfTopics])

  const due = useMemo(() => dueInfo(cards, scopedMap), [cards, scopedMap])
  const weather = useMemo(() => weathering(cards, scopedMap), [cards, scopedMap])

  // Per-shelf count of never-seen questions (for the "new questions" badge).
  const newCountByTopic = useMemo(() => {
    const map: Record<string, number> = {}
    for (const [qid, topicId] of Object.entries(scopedMap)) {
      const card = cards[qid]
      if (!card || card.nextReview === 0) map[topicId] = (map[topicId] ?? 0) + 1
    }
    return map
  }, [cards, scopedMap])

  const sabbath = shelfTopics.length > 0 && isSabbath(due.totalDue) && !due.newAvailable

  // ── Session state (all consecutive-fail tracking lives HERE, not in stores) ─
  const [view, setView] = useState<View>('shelves')
  const [session, setSession] = useState<SessionItem[]>([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<number | null>(null)
  const [attemptFailed, setAttemptFailed] = useState(false) // wrong at least once on current q
  const [failCount, setFailCount] = useState(0) // CONSECUTIVE fails on current q
  const [passedCount, setPassedCount] = useState(0)
  const [fogBurn, setFogBurn] = useState(false)
  const [coinTick, setCoinTick] = useState<{ coins: number; spark: boolean } | null>(null)
  const [showCoinTick, setShowCoinTick] = useState(false)
  const [ritualEarned, setRitualEarned] = useState(0)

  // Secondary-feedback timer (R13): competence flash first, coins ~600ms later.
  const coinTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (coinTimer.current !== null) window.clearTimeout(coinTimer.current)
    },
    []
  )

  // Escape closes the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const current: SessionItem | undefined = session[index]
  const currentQuestion: QuizBankQuestion | undefined = current
    ? QUESTION_BY_ID[current.qid]
    : undefined

  const startSession = (topicFilter: string | null) => {
    const freshCards = useLearningStore.getState().cards
    const items = buildSession(
      topicFilter,
      freshCards,
      shelfTopics.map(t => t.topicId)
    )
    if (items.length === 0) return
    setSession(items)
    setIndex(0)
    setPassedCount(0)
    setRitualEarned(0)
    setPhase('answering')
    setSelected(null)
    setAttemptFailed(false)
    setFailCount(0)
    setFogBurn(false)
    setCoinTick(null)
    setShowCoinTick(false)
    setView('session')
  }

  const advance = (passed: boolean) => {
    if (coinTimer.current !== null) {
      window.clearTimeout(coinTimer.current)
      coinTimer.current = null
    }
    setShowCoinTick(false)
    setCoinTick(null)
    setFogBurn(false)
    setSelected(null)
    setAttemptFailed(false)
    setFailCount(0)
    setPhase('answering')

    const nextPassed = passed ? passedCount + 1 : passedCount
    setPassedCount(nextPassed)
    const nextIndex = index + 1
    if (nextIndex >= session.length) {
      // Weekly ritual: fires only on a session of ≥5 answers; the ledger holds
      // its own once-per-ISO-week guard, so 0 means "already done this week".
      if (nextPassed >= RITUAL_MIN_ANSWERS) setRitualEarned(completeWeeklyRitual(userId))
      setView('summary')
    } else {
      setIndex(nextIndex)
    }
  }

  const handleOption = (optionIdx: number) => {
    if (phase !== 'answering' || !current || !currentQuestion) return
    setSelected(optionIdx)

    if (optionIdx === correctIndexOf(currentQuestion)) {
      const store = useLearningStore.getState()
      const card = store.cards[current.qid]
      const isNewCard = !card || card.nextReview === 0
      const firstTry = !attemptFailed
      // Fog status BEFORE this pass mutates the card (the burn line celebrates
      // clearing weather that existed when the question was asked).
      const wasWeathered = weather.worstTopics.includes(current.topicId)

      // Ledger FIRST — R7 needs the SM-2 interval AT TIME OF PASS (0 for new).
      let coins = 0
      let spark = false
      try {
        const res = recordRetrievalPass(userId, {
          topicId: current.topicId,
          questionId: current.qid,
          retentionIntervalDays: card ? card.interval : 0,
          firstTry,
          isNewCard,
        })
        coins = res.coins
        spark = res.spark
      } catch {
        // A ledger guard must never eat the learning act — competence feedback
        // and the SM-2 update still happen; only the coin tick is skipped.
      }
      store.recordSM2Answer(current.qid, firstTry ? 5 : 4, XP_PER_PASS)

      // Competence feedback is synchronous (<300ms). Coins fade in later.
      setFogBurn(wasWeathered)
      setPhase('correct')
      if (coins > 0) {
        setCoinTick({ coins, spark })
        coinTimer.current = window.setTimeout(() => setShowCoinTick(true), 600)
      }
    } else {
      recordRetrievalFail(userId, current.topicId, current.qid)
      const fails = failCount + 1
      if (fails >= 2) {
        // R10: second consecutive fail on the SAME question → Rebuild Bench.
        // The hub swaps overlays; advancing keeps our state sane if a host
        // chooses to keep the Library mounted underneath.
        onOpenBench(current.topicId, current.qid)
        advance(false)
      } else {
        setFailCount(fails)
        setAttemptFailed(true)
        setPhase('wrong')
      }
    }
  }

  const retrySameQuestion = () => {
    // R10 forced re-attempt: same question, options live again, no penalty UI.
    setSelected(null)
    setPhase('answering')
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0, // viewport-fixed full-screen overlay — fills every edge
    zIndex: 1000,
    // Warm library wash: candle-lit near-black via rgba only (no hex, no solid
    // white — surfaces below use the standard rgba(255,255,255,…) recipe).
    background: 'linear-gradient(180deg, rgba(40,30,14,0.97), rgba(22,17,9,0.98))',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    flexShrink: 0,
  }

  const titleBlockStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2 }

  const titleStyle: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--sh-gold)',
    margin: 0,
  }

  const subtitleStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
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
    flexShrink: 0,
  }

  const bodyStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 560,
    width: '100%',
    marginInline: 'auto',
  }

  const surfaceStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
  }

  const startBtnStyle: CSSProperties = {
    ...surfaceStyle,
    minHeight: 44,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid var(--sh-gold)',
    color: 'var(--sh-gold)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  }

  const shelfBtnStyle: CSSProperties = {
    ...surfaceStyle,
    minHeight: 44,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    cursor: 'pointer',
    textAlign: 'start',
    width: '100%',
  }

  const badgeStyle: CSSProperties = {
    minHeight: 24,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid var(--sh-gold)',
    color: 'var(--sh-gold)',
    fontSize: 14,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }

  const softBadgeStyle: CSSProperties = {
    ...badgeStyle,
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.6)',
  }

  const sabbathStyle: CSSProperties = {
    ...surfaceStyle,
    border: '1px solid var(--sh-gold)',
    padding: '28px 20px',
    textAlign: 'center',
    color: 'var(--sh-cream)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }

  const questionCardStyle: CSSProperties = {
    ...surfaceStyle,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: '38vh',
    overflowY: 'auto',
  }

  const optionsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // MC convention: 2×2 grid
    gap: 8,
  }

  const optionBtnStyle = (i: number): CSSProperties => {
    const base: CSSProperties = {
      minHeight: 44,
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      color: 'rgba(255,255,255,0.9)',
      fontSize: 14,
      lineHeight: 1.35,
      cursor: phase === 'answering' ? 'pointer' : 'default',
      textAlign: 'center',
    }
    if (currentQuestion) {
      const correctIdx = correctIndexOf(currentQuestion)
      if (phase === 'correct' && i === correctIdx) {
        base.border = '2px solid var(--sh-gold)'
        base.color = 'var(--sh-gold)'
        base.fontWeight = 700
      }
      if (phase === 'wrong') {
        // Gentle navy correction — reveal the right answer, dim the miss. No red.
        if (i === correctIdx) {
          base.border = '2px solid var(--sh-gold)'
          base.color = 'var(--sh-gold)'
          base.fontWeight = 700
        } else if (i === selected) {
          base.opacity = 0.55
        }
      }
    }
    return base
  }

  const feedbackPanelStyle: CSSProperties = {
    ...surfaceStyle,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    color: 'var(--sh-cream)',
    fontSize: 14,
  }

  const continueBtnStyle: CSSProperties = {
    minHeight: 44,
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid var(--sh-gold)',
    borderRadius: 10,
    color: 'var(--sh-gold)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'center',
    minWidth: 140,
  }

  const progressStyle: CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderShelves = () => {
    if (shelfTopics.length === 0) {
      return (
        <div style={{ ...surfaceStyle, padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
          עוד אין מדפים בספרייה — פותחים נושא ראשון בעיר, והמדף שלו יופיע כאן.
        </div>
      )
    }

    if (sabbath) {
      // R14: golden calm, derived purely from the empty queue. NO call-to-action.
      return (
        <div style={sabbathStyle} role="status">
          <span aria-hidden="true" style={{ fontSize: 28 }}>🌇</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--sh-gold)' }}>
            העיר שקטה. הכל זכור. נתראה מחר.
          </span>
        </div>
      )
    }

    return (
      <>
        <button type="button" style={startBtnStyle} onClick={() => startSession(null)}>
          <span aria-hidden="true">📖</span>
          {due.totalDue > 0 ? `התחלת חזרה משולבת · ${due.totalDue} ממתינות` : 'התחלת תרגול — שאלות חדשות'}
        </button>

        {shelfTopics.map(topic => {
          const dueCount = due.dueByTopic[topic.topicId] ?? 0
          const newCount = newCountByTopic[topic.topicId] ?? 0
          const foggy = weather.worstTopics.includes(topic.topicId)
          const empty = dueCount === 0 && newCount === 0
          return (
            <button
              key={topic.topicId}
              type="button"
              style={{ ...shelfBtnStyle, ...(empty ? { opacity: 0.6, cursor: 'default' } : null) }}
              aria-disabled={empty}
              onClick={() => {
                // Locked-empty shelf stays clickable-but-inert (no HTML disabled).
                if (empty) return
                startSession(topic.topicId)
              }}
              aria-label={
                foggy
                  ? `${topic.hebrewName} — נושא מעורפל שמחכה לחזרה`
                  : `${topic.hebrewName} — פתיחת מדף החזרות`
              }
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span aria-hidden="true">📚</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {topic.hebrewName}
                </span>
                {foggy && (
                  <span aria-hidden="true" title="נושא מעורפל" style={{ flexShrink: 0 }}>🌫️</span>
                )}
              </span>
              {dueCount > 0 ? (
                <span style={badgeStyle}>{dueCount} לחזרה</span>
              ) : newCount > 0 ? (
                <span style={softBadgeStyle}>שאלות חדשות</span>
              ) : (
                <span style={softBadgeStyle}>הכל זכור</span>
              )}
            </button>
          )
        })}
      </>
    )
  }

  const renderSession = () => {
    if (!current || !currentQuestion) return null
    const topicName = TOPICS.find(t => t.topicId === current.topicId)?.hebrewName ?? current.topicId
    const isLast = index + 1 >= session.length

    return (
      <>
        <div style={progressStyle}>
          <span>שאלה {index + 1} מתוך {session.length}</span>
          <span>{topicName}</span>
        </div>

        <div
          style={questionCardStyle}
          className={phase === 'correct' ? 'lib-card-correct' : undefined}
        >
          <div style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--sh-cream)' }}>
            {currentQuestion.question}
          </div>
          <div style={optionsGridStyle}>
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                style={optionBtnStyle(i)}
                aria-disabled={phase !== 'answering'}
                onClick={() => handleOption(i)} // inert unless phase==='answering'
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {phase === 'correct' && (
          <div style={feedbackPanelStyle} role="status">
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--sh-gold)' }}>✓ נכון</span>
            {fogBurn && (
              <span className="lib-fade-in" style={{ color: 'var(--sh-cream)' }}>
                הערפל מתפזר
              </span>
            )}
            {showCoinTick && coinTick && (
              // R13: the coin tick is small, late, and secondary by design.
              <span className="lib-fade-in" style={{ fontSize: 14, color: 'var(--sh-gold)', opacity: 0.85 }}>
                <span dir="ltr">+{coinTick.coins}</span> מטבעות{coinTick.spark ? ' ✨' : ''}
              </span>
            )}
            <button type="button" style={continueBtnStyle} onClick={() => advance(true)}>
              {isLast ? 'סיום' : 'ממשיכים'}
            </button>
          </div>
        )}

        {phase === 'wrong' && (
          <div style={feedbackPanelStyle} role="status">
            <span style={{ fontWeight: 700 }}>
              התשובה הנכונה: {currentQuestion.options[correctIndexOf(currentQuestion)]}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              {currentQuestion.explanation}
            </span>
            <button type="button" style={continueBtnStyle} onClick={retrySameQuestion}>
              מנסים שוב
            </button>
          </div>
        )}
      </>
    )
  }

  const renderSummary = () => (
    <div style={{ ...surfaceStyle, padding: '24px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--sh-gold)' }}>המדף סודר מחדש</span>
      <span style={{ fontSize: 15, color: 'var(--sh-cream)' }}>
        {passedCount} שאלות הושלמו בחזרה הזאת
      </span>
      {ritualEarned > 0 && (
        <span className="lib-fade-in" style={{ fontSize: 14, color: 'var(--sh-gold)' }}>
          <span dir="ltr">+{ritualEarned}</span> · הטקס השבועי הושלם
        </span>
      )}
      <button type="button" style={continueBtnStyle} onClick={() => setView('shelves')}>
        חזרה למדפים
      </button>
    </div>
  )

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="בית הספרים">
      {/* Competence flash + secondary fades. Calmed under reduced motion. */}
      <style>{`
        @keyframes lib-gold-flash {
          0% { box-shadow: 0 0 0 3px var(--sh-gold); }
          100% { box-shadow: 0 0 0 3px transparent; }
        }
        .lib-card-correct { animation: lib-gold-flash 700ms ease-out forwards; }
        @keyframes lib-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
        .lib-fade-in { animation: lib-fade-in 400ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .lib-card-correct { animation: none; box-shadow: 0 0 0 2px var(--sh-gold); }
          .lib-fade-in { animation: none; }
        }
      `}</style>

      <div style={headerStyle}>
        <div style={titleBlockStyle}>
          <h2 style={titleStyle}>בית הספרים</h2>
          <p style={subtitleStyle}>המדפים הם תור החזרות שלך</p>
        </div>
        <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="סגירת בית הספרים">
          ✕
        </button>
      </div>

      <div style={bodyStyle}>
        {view === 'shelves' && renderShelves()}
        {view === 'session' && renderSession()}
        {view === 'summary' && renderSummary()}
      </div>
    </div>
  )
}

export default Library
