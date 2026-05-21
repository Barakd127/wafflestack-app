import type { CardData } from '../store/learningStore'
import { QUESTION_BANK, TOPICS } from '../store/learningStore'

// Relative exam weight per topic (1–3). Higher = more likely to appear on exam.
const TOPIC_WEIGHT: Record<string, number> = {
  normal: 3, hypothesis: 3, regression: 3, ci: 3,
  correlation: 2, mean: 2, median: 2, stddev: 2, sampling: 2, binomial: 2,
}

export interface TopicRisk {
  topicId: string
  hebrewTitle: string
  icon: string
  /** 0–100 composite risk score */
  riskScore: number
  examWeightLabel: 'גבוה' | 'בינוני'
  /** Days since any card in this topic was last seen; null = never studied */
  lastSeenDays: number | null
  /** How many cards in topic are due for review right now */
  dueCount: number
  /** 0–1: fraction of seen cards with low quality ratings */
  errorRate: number
}

/**
 * Compute a per-topic risk score from SM-2 card state + exam proximity.
 * Returns topics sorted by descending risk.
 *
 * Formula (clamped 0–100):
 *   avgOverdueFrac×30  +  avgEasePenalty×25  +  errorRate×25  +  examPressure×weight×(20/3)
 *
 * Unseen cards default to overdueFrac=1.0 / easePenalty=0.8, making
 * never-opened topics appear moderately at-risk rather than safe.
 */
export function computeTopicRisks(
  cards: Record<string, CardData>,
  examDateStr: string | null,
): TopicRisk[] {
  const now = Date.now()
  const examMs = examDateStr ? new Date(examDateStr).getTime() : null
  const daysToExam = examMs ? Math.max(0, (examMs - now) / 86400000) : 14

  // examPressure: 0 when >14d away, ramps sharply inside 7d, max at 3d
  const examPressure = daysToExam <= 3 ? 1.0 : daysToExam <= 7 ? 0.6 : daysToExam <= 14 ? 0.2 : 0

  return TOPICS.map(topic => {
    const questions = QUESTION_BANK.filter(q => q.topic === topic.id)

    let totalOverdueFrac  = 0
    let totalEasePenalty  = 0
    let errorCount        = 0
    let seenCount         = 0
    let dueCount          = 0
    let latestLastSeen: number | null = null  // most recent study timestamp

    for (const q of questions) {
      const card = cards[q.id]

      if (!card || card.nextReview === 0) {
        // Never studied — treat as fully overdue with weak ease
        totalOverdueFrac  += 1.0
        totalEasePenalty  += 0.8
        continue
      }

      seenCount++

      // Overdue fraction: how late is this card relative to its interval?
      // Cap at 2× the interval so one very-old card doesn't dominate.
      const intervalMs    = Math.max(1, card.interval) * 86400000
      const overdueMs     = Math.max(0, now - card.nextReview)
      totalOverdueFrac   += Math.min(1.0, overdueMs / intervalMs)

      // Ease penalty: 0 at easeFactor=2.5 (strong), 1 at easeFactor=1.3 (min)
      const easePenalty   = Math.max(0, (2.5 - card.easeFactor) / (2.5 - 1.3))
      totalEasePenalty   += Math.min(1.0, easePenalty)

      // Quality < 3 = incorrect/very hard response in SM-2
      if (card.difficulty < 3) errorCount++

      if (card.nextReview <= now) dueCount++

      // Track most recently studied card (max lastSeen = latest study date)
      if (card.lastSeen !== null) {
        if (latestLastSeen === null || card.lastSeen > latestLastSeen) {
          latestLastSeen = card.lastSeen
        }
      }
    }

    const n              = questions.length || 1
    const avgOverdueFrac  = totalOverdueFrac  / n
    const avgEasePenalty  = totalEasePenalty  / n
    const errorRate       = seenCount > 0 ? errorCount / seenCount : 0
    const weight          = TOPIC_WEIGHT[topic.id] ?? 2

    const raw = (
      avgOverdueFrac  * 30 +
      avgEasePenalty  * 25 +
      errorRate       * 25 +
      examPressure * weight * (20 / 3)
    )
    const riskScore = Math.min(100, Math.max(0, Math.round(raw)))

    const lastSeenDays = latestLastSeen !== null
      ? Math.floor((now - latestLastSeen) / 86400000)
      : null

    return {
      topicId:         topic.id,
      hebrewTitle:     topic.hebrewTitle,
      icon:            topic.icon,
      riskScore,
      examWeightLabel: (weight >= 3 ? 'גבוה' : 'בינוני') as 'גבוה' | 'בינוני',
      lastSeenDays,
      dueCount,
      errorRate,
    }
  }).sort((a, b) => b.riskScore - a.riskScore)
}
