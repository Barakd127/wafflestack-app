// Personal Study Plan — types + defaults.
// See: Vault/Hybrid/specs/personal-plan-spec.md
//
// MVP rule-based plan (no AI). Stored alongside other learningStore fields
// via zustand persist. Re-runnable; last 3 plans kept in planHistory.

export type Goal =
  | 'final-exam-soon'    // < 3 weeks
  | 'final-exam-month'   // 3-6 weeks
  | 'mid-semester'
  | 'review-only'
  | 'curious'

export type Style = 'theory-first' | 'practice-first' | 'mixed'

export type MotivationProfile =
  | 'streak'
  | 'mastery'
  | 'competition'
  | 'understanding'

export interface IntakeAnswers {
  goal: Goal
  examDate: string | null   // YYYY-MM-DD
  dailyMinutes: number      // 5–120
  style: Style
  knownTopics: string[]     // topic ids the user feels strong on
  weakTopics: string[]      // topic ids the user feels weak on
  motivationProfile: MotivationProfile | null
  previousAttempts: boolean
  answeredAt: number
}

export type PlanBucket = 'weak' | 'strong' | 'unknown'

export interface PersonalPlanStep {
  topicId: string
  bucket: PlanBucket
  hint: string | null       // Hebrew, may be null for mid-plan steps
}

export interface PersonalPlan {
  version: 1
  sequence: PersonalPlanStep[]
  dailyTargetMin: number
  easyFirst: boolean
  generatedAt: number
}

/** Default intake — used to pre-fill the wizard for first-time users. */
export const DEFAULT_INTAKE: IntakeAnswers = {
  goal: 'mid-semester',
  examDate: null,
  dailyMinutes: 25,
  style: 'mixed',
  knownTopics: [],
  weakTopics: [],
  motivationProfile: null,
  previousAttempts: false,
  answeredAt: 0,
}

/** True iff a non-empty personal plan exists in state. */
export function isPlanActive(state: { personalPlan: PersonalPlan | null }): boolean {
  return !!state.personalPlan && state.personalPlan.sequence.length > 0
}
