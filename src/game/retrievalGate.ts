/**
 * retrievalGate — R1 kernel: "every payout requires the Retrieval Gate."
 *
 * A topic is only GATED (i.e. considered "known enough to build on") once the
 * player has produced a real retrieval act for it — a quiz session where they
 * answered at least 2 questions correctly. Passing the gate opens a spaced
 * review schedule (+1d, +3d, +7d, then every 7d) so mastery has to be
 * refreshed, not just claimed once.
 *
 * Pure functions only — no store access, no side effects. Callers (e.g.
 * bridgeStore) decide what to do with a GateStatus.
 */
import type { QuizSession } from '../stores/progressStore'
import type { GateStatus } from './bridgeTypes'

const MIN_CORRECT_FOR_RETRIEVAL = 2
const DAY_MS = 24 * 60 * 60 * 1000
// Review offsets from the last retrieval act, in days. After the last fixed
// offset, reviews repeat every 7 days.
const REVIEW_OFFSETS_DAYS = [1, 3, 7]
const REPEAT_INTERVAL_DAYS = 7

function isRetrievalSession(session: QuizSession): boolean {
  return session.correctCount >= MIN_CORRECT_FOR_RETRIEVAL
}

/** Next review due date after `lastRetrievalAt`, walking the spaced schedule. */
function computeNextReviewAt(lastRetrievalAt: string, now: Date): string {
  const lastTime = new Date(lastRetrievalAt).getTime()
  const elapsedDays = (now.getTime() - lastTime) / DAY_MS

  for (const offset of REVIEW_OFFSETS_DAYS) {
    if (elapsedDays < offset) {
      return new Date(lastTime + offset * DAY_MS).toISOString()
    }
  }

  // Past the last fixed offset — repeat every REPEAT_INTERVAL_DAYS from the
  // last fixed offset point.
  const lastFixedOffset = REVIEW_OFFSETS_DAYS[REVIEW_OFFSETS_DAYS.length - 1]
  const daysPastLastFixed = elapsedDays - lastFixedOffset
  const cyclesPassed = Math.floor(daysPastLastFixed / REPEAT_INTERVAL_DAYS)
  const nextOffsetDays = lastFixedOffset + (cyclesPassed + 1) * REPEAT_INTERVAL_DAYS
  return new Date(lastTime + nextOffsetDays * DAY_MS).toISOString()
}

/**
 * Compute the retrieval-gate status for a single topic.
 * `sessions` should be the full quiz-session history (any topic); this
 * function filters to `topicId` internally.
 */
export function getGateStatus(topicId: string, sessions: QuizSession[]): GateStatus {
  const topicSessions = sessions
    .filter(s => s.topic === topicId && isRetrievalSession(s))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (topicSessions.length === 0) {
    return {
      topicId,
      gated: false,
      reason: 'טרם בוצעה שליפה אמיתית (חידון עם 2+ תשובות נכונות) עבור נושא זה',
      overdue: false,
    }
  }

  const lastRetrievalAt = topicSessions[0].timestamp
  const now = new Date()
  const nextReviewAt = computeNextReviewAt(lastRetrievalAt, now)
  const overdue = now.getTime() >= new Date(nextReviewAt).getTime()

  return {
    topicId,
    gated: true,
    reason: overdue
      ? 'השער נפתח בעבר אך חזרה מרווחת מאחרת — נדרשת שליפה נוספת'
      : 'השער פתוח — בוצעה שליפה אמיתית ומועד החזרה הבא עדיין לא הגיע',
    lastRetrievalAt,
    nextReviewAt,
    overdue,
  }
}

/**
 * Gate status for every topic in `topicIds` that is currently gated AND
 * overdue for review, sorted most-overdue first (largest gap between now and
 * nextReviewAt first).
 */
export function getDueTopics(sessions: QuizSession[], topicIds: string[]): GateStatus[] {
  const statuses = topicIds
    .map(topicId => getGateStatus(topicId, sessions))
    .filter(s => s.gated && s.overdue)

  return statuses.sort((a, b) => {
    const aDue = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0
    const bDue = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0
    return aDue - bDue // earliest (most overdue) due date first
  })
}
