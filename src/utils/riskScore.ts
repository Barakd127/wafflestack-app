import type { CardData } from '../store/learningStore'
import { QUESTION_BANK, TOPICS } from '../store/learningStore'

// Maps topic id → 3D city building id (from BUILDING_UNLOCK_CHAIN)
const TOPIC_BUILDING: Record<string, string> = {
  normal:     'hospital',
  hypothesis: 'research',
  correlation:'market',
  mean:       'power',
  median:     'housing',
  stddev:     'traffic',
  sampling:   'school',
  regression: 'bank',
  ci:         'news',
  binomial:   'city-hall',
}

// Relative weight of each topic on a typical psych-stats exam (1–3)
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
  /** Days since the earliest card in this topic was last seen; null = never studied */
  lastSeenDays: number | null
  buildingId: string
}

/**
 * Compute a per-topic risk score derived from SM-2 card state and exam
 * proximity.  Returns topics sorted by descending risk.
 *
 * Formula (pre-clamp to 0–100):
 *   avgOverdueDays×15  +  avgEasePenalty×20  +  errorRate×30  +  examPressure×weight
 *
 * Unseen cards get a default overdue=1.5d / easePenalty=0.8 so they read as
 * moderately at-risk rather than safe.  This prevents the paradox where
 * never-opened topics appear low-risk on a student's first week.
 */
export function computeTopicRisks(
  cards: Record<string, CardData>,
  examDateStr: string | null,
): TopicRisk[] {
  const now = Date.now()
  const examMs = examDateStr ? new Date(examDateStr).getTime() : null
  const daysToExam = examMs ? Math.max(0, (examMs - now) / 86400000) : 7

  return TOPICS.map(topic => {
    const questions = QUESTION_BANK.filter(q => q.topic === topic.id)

    let totalOverdueDays = 0
    let totalEasePenalty = 0
    let errorCount      = 0
    let seenCount       = 0
    let earliestLastSeen: number | null = null

    for (const q of questions) {
      const card = cards[q.id]
      if (!card || card.nextReview === 0) {
        // Never studied: treat as moderately overdue and weak
        totalOverdueDays += 1.5
        totalEasePenalty += 0.8
        continue
      }
      seenCount++
      const daysOverdue = Math.max(0, (now - card.nextReview) / 86400000)
      totalOverdueDays += Math.min(daysOverdue, 3)
      // easeFactor 2.5 = well-known (0 penalty); 1.3 = barely above threshold (≈0.48 penalty)
      totalEasePenalty += Math.max(0, (2.5 - card.easeFactor) / 2.5)
      if (card.difficulty < 3) errorCount++
      if (card.lastSeen !== null) {
        if (earliestLastSeen === null || card.lastSeen < earliestLastSeen) {
          earliestLastSeen = card.lastSeen
        }
      }
    }

    const n = questions.length || 1
    const avgOverdue     = totalOverdueDays / n
    const avgEasePenalty = totalEasePenalty / n
    const errorRate      = seenCount > 0 ? errorCount / seenCount : 0
    // examPressure: 0 when >7d away, ramps up as exam nears
    const examPressure   = daysToExam <= 3 ? 4 : daysToExam <= 7 ? 2 : 0
    const weight         = TOPIC_WEIGHT[topic.id] ?? 2

    const raw = avgOverdue * 15 + avgEasePenalty * 20 + errorRate * 30 + examPressure * weight
    const riskScore = Math.min(100, Math.max(0, Math.round(raw)))

    const lastSeenDays = earliestLastSeen !== null
      ? Math.floor((now - earliestLastSeen) / 86400000)
      : null

    return {
      topicId:         topic.id,
      hebrewTitle:     topic.hebrewTitle,
      icon:            topic.icon,
      riskScore,
      examWeightLabel: (weight >= 3 ? 'גבוה' : 'בינוני') as 'גבוה' | 'בינוני',
      lastSeenDays,
      buildingId:      TOPIC_BUILDING[topic.id] ?? 'power',
    }
  }).sort((a, b) => b.riskScore - a.riskScore)
}
