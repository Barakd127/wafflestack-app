// Pure rule-based plan generator. No AI in MVP.
// See: Vault/Hybrid/specs/personal-plan-spec.md §3.

import type {
  IntakeAnswers,
  PersonalPlan,
  PersonalPlanStep,
  PlanBucket,
} from '../data/personalPlanTypes'

/**
 * Canonical topic order from BUILDING_UNLOCK_CHAIN (in learningStore.ts) +
 * lesson-only Stat-A topics from HEBREW_LABELS (StudyHub.tsx). Easiest first.
 * Kept as a self-contained constant so this module stays pure and unit-testable
 * (no circular import with the store).
 */
const TOPIC_ORDER: string[] = [
  'intro',
  'variable-types',
  'mean',
  'median',
  'std-dev',
  'weighted-combined',
  'observation-changes',
  'linear-transformations',
  'percentiles',
  'data-presentation',
  'distribution-shapes',
  'probability',
  'combinatorics',
  'discrete-rv',
  'binomial',
  'sampling',
  'hypothesis-testing',
  'confidence-intervals',
  'correlation',
  'pearson',
  'spearman',
  'cramer',
  'regression',
]

/** Hint string keyed by position + bucket. Hebrew, RTL-safe. */
function hintFor(
  step: { topicId: string; bucket: PlanBucket },
  position: number,
  isLast: boolean,
  goal: IntakeAnswers['goal']
): string | null {
  if (position === 0) {
    if (step.bucket === 'weak') return 'התחל כאן — חיזוק נקודה חלשה'
    if (step.bucket === 'strong') return 'התחממות — אתה כבר חזק כאן'
    return 'התחל כאן — נושא קל לבסיס'
  }
  if (isLast && step.bucket === 'strong' && (goal === 'final-exam-soon' || goal === 'final-exam-month')) {
    return 'סקירה אחרונה לפני המבחן'
  }
  return null
}

/** Sort an unordered topic list by the canonical prerequisite chain. */
function sortByPrereq(topics: string[]): string[] {
  const set = new Set(topics)
  return TOPIC_ORDER.filter(t => set.has(t))
}

/**
 * Build a personalized plan from intake answers.
 * Algorithm:
 *  1. Bucket each canonical topic as weak / strong / unknown.
 *  2. Order each bucket internally by prereq topology.
 *  3. Concatenate buckets per goal:
 *     - final-exam-soon  : weak → unknown → strong
 *     - review-only      : strong → unknown → weak
 *     - curious          : strong → unknown → weak
 *     - default          : 1 easy unknown (confidence prime) → weak → rest of unknown → strong
 *  4. Emit hints for first + last steps.
 */
export function generatePlan(answers: IntakeAnswers): PersonalPlan {
  const knownSet = new Set(answers.knownTopics)
  const weakSet = new Set(answers.weakTopics)

  const weak: string[] = []
  const strong: string[] = []
  const unknown: string[] = []
  for (const t of TOPIC_ORDER) {
    if (weakSet.has(t)) weak.push(t)
    else if (knownSet.has(t)) strong.push(t)
    else unknown.push(t)
  }

  const weakSorted = sortByPrereq(weak)
  const strongSorted = sortByPrereq(strong)
  const unknownSorted = sortByPrereq(unknown)

  let orderedTopics: { topicId: string; bucket: PlanBucket }[]
  if (answers.goal === 'final-exam-soon') {
    orderedTopics = [
      ...weakSorted.map(t => ({ topicId: t, bucket: 'weak' as PlanBucket })),
      ...unknownSorted.map(t => ({ topicId: t, bucket: 'unknown' as PlanBucket })),
      ...strongSorted.map(t => ({ topicId: t, bucket: 'strong' as PlanBucket })),
    ]
  } else if (answers.goal === 'review-only' || answers.goal === 'curious') {
    orderedTopics = [
      ...strongSorted.map(t => ({ topicId: t, bucket: 'strong' as PlanBucket })),
      ...unknownSorted.map(t => ({ topicId: t, bucket: 'unknown' as PlanBucket })),
      ...weakSorted.map(t => ({ topicId: t, bucket: 'weak' as PlanBucket })),
    ]
  } else {
    // mid-semester / final-exam-month — confidence prime
    const [firstUnknown, ...restUnknown] = unknownSorted
    const head: { topicId: string; bucket: PlanBucket }[] = firstUnknown
      ? [{ topicId: firstUnknown, bucket: 'unknown' }]
      : []
    orderedTopics = [
      ...head,
      ...weakSorted.map(t => ({ topicId: t, bucket: 'weak' as PlanBucket })),
      ...restUnknown.map(t => ({ topicId: t, bucket: 'unknown' as PlanBucket })),
      ...strongSorted.map(t => ({ topicId: t, bucket: 'strong' as PlanBucket })),
    ]
  }

  const lastIdx = orderedTopics.length - 1
  const sequence: PersonalPlanStep[] = orderedTopics.map((s, i) => ({
    topicId: s.topicId,
    bucket: s.bucket,
    hint: hintFor(s, i, i === lastIdx, answers.goal),
  }))

  const dailyTargetMin = Math.min(120, Math.max(5, Math.round(answers.dailyMinutes)))
  const easyFirst = sequence[0]?.bucket !== 'weak'

  return {
    version: 1,
    sequence,
    dailyTargetMin,
    easyFirst,
    generatedAt: Date.now(),
  }
}
