// ── Feature Progression Rules ───────────────────────────────────────────────
// Spec: Barak's Vault/Hybrid/specs/feature-progression-plan.md
//
// Tier-based unlocks. Tier 0 features (lesson, quiz, sidebar home/courses,
// hint, streak, onboarding) have NO entry here → isFeatureUnlocked() treats
// "no rule" as "always unlocked".
//
// adminMode in learningStore bypasses every rule (same pattern as
// isBuildingUnlocked).
//
// Unlock rule evaluator runs every time XP or completedLessons changes;
// matching features get pushed onto the `newlyUnlocked` toast queue.

export type FeatureId =
  | 'arsenal' | 'pomodoro'
  | 'ai-tutor' | 'mindmap-view' | 'mindmap-edit'
  | 'notebook' | 'paper-styles'
  | 'math-widget' | 'formula-library' | 'highlighter'
  | 'whiteboard-basic' | 'shapes'
  | 'templates' | 'whiteboard-full' | 'color-picker'
  | 'split-screen' | 'cross-link' | 'global-search' | 'drawing-board-full'
  | 'city-editor' | 'coins-store' | 'city-themes'
  | 'stat-b-native' | 'cross-course-quiz'
  | 'methods' | 'anova' | 'custom-topic' | 'community-curated'

export interface UnlockRule {
  feature: FeatureId
  tier: number
  xp?: number
  topicsCompleted?: number
  /**
   * Unlock as soon as a SPECIFIC lesson/topic id appears in completedLessons
   * (e.g. 'intro'). Lets us anchor early unlocks to a concrete milestone —
   * "finish the intro lesson → unlock the mindmap" — rather than a raw XP gate.
   * ORs with xp / topicsCompleted: meeting ANY criterion unlocks the feature.
   */
  requiresLesson?: string
  description: string
  descriptionHe: string
}

// ── Generous, motivating ladder ─────────────────────────────────────────────
// The core study loop (theory + practice + sidebar home/courses + hints +
// streaks) has NO rule here → always unlocked. Everything below is a *reward*
// that lands quickly and feels celebratory, NOT a wall. Thresholds were tuned
// down from the original steep version so a learner hits a new unlock almost
// every short session. Rules OR together (xp OR topicsCompleted OR a specific
// lesson) — meeting any one criterion is enough.
//
// ~XP intuition: a correct answer is 10-20 XP, finishing a lesson is +5 XP,
// so "10 correct answers" ≈ 100-150 XP and "1 topic" is one entry in
// completedLessons.
export const FEATURE_UNLOCKS: UnlockRule[] = [
  // Tier 1 — First win. Finish the very first lesson (intro) OR a single
  // correct answer (10 XP) lights up the first reward features.
  { feature: 'arsenal',          tier: 1, xp: 10, requiresLesson: 'intro',   description: 'Finish the intro lesson or answer one question',  descriptionHe: 'סיים את שיעור הפתיחה או ענה נכון על שאלה אחת כדי לפתוח את הארסנל' },
  { feature: 'pomodoro',         tier: 1, xp: 10, requiresLesson: 'intro',   description: 'Finish the intro lesson or answer one question',  descriptionHe: 'סיים את שיעור הפתיחה או ענה נכון על שאלה אחת כדי לפתוח את שעון הפומודורו' },

  // Tier 2 — Mindmap is the headline early reward: finish the intro lesson and
  // you can see your learning map immediately (also unlocks at 30 XP).
  { feature: 'mindmap-view',     tier: 2, xp: 30, requiresLesson: 'intro',   description: 'Finish the intro lesson to see your learning map',  descriptionHe: 'סיים את שיעור הפתיחה כדי לראות את מפת הלמידה שלך' },
  { feature: 'ai-tutor',         tier: 2, xp: 30, topicsCompleted: 1,        description: 'Reach 30 XP or finish 1 topic',         descriptionHe: 'הגע ל-30 נק׳ או סיים נושא אחד כדי לפתוח את המורה הפרטי' },

  // Tier 3 — Note-taking surfaces (50 XP OR 1 topic).
  { feature: 'notebook',         tier: 3, xp: 50, topicsCompleted: 1,        description: 'Reach 50 XP or finish 1 topic',         descriptionHe: 'הגע ל-50 נק׳ או סיים נושא אחד כדי לפתוח את המחברת' },
  { feature: 'mindmap-edit',     tier: 3, xp: 50, topicsCompleted: 1,        description: 'Reach 50 XP or finish 1 topic',         descriptionHe: 'הגע ל-50 נק׳ או סיים נושא אחד כדי לערוך את מפת החשיבה' },
  { feature: 'paper-styles',     tier: 3, xp: 50, topicsCompleted: 1,        description: 'Reach 50 XP or finish 1 topic',         descriptionHe: 'הגע ל-50 נק׳ או סיים נושא אחד כדי להחליף סגנון נייר' },

  // Tier 4 — Canvas / whiteboard after ~10 correct answers (≈100 XP) or 1 topic.
  { feature: 'whiteboard-basic', tier: 4, xp: 100, topicsCompleted: 1,       description: 'Answer ~10 questions (100 XP) to unlock the canvas',         descriptionHe: 'ענה על כ-10 שאלות (100 נק׳) כדי לפתוח את לוח הציור' },
  { feature: 'shapes',           tier: 4, xp: 100, topicsCompleted: 1,       description: 'Answer ~10 questions or finish 1 topic',descriptionHe: 'ענה על כ-10 שאלות (100 נק׳) כדי לפתוח את כלי הצורות' },
  { feature: 'highlighter',      tier: 4, xp: 100, topicsCompleted: 1,       description: 'Answer ~10 questions or finish 1 topic',descriptionHe: 'ענה על כ-10 שאלות (100 נק׳) כדי לפתוח את המסמן' },

  // Tier 5 — Math tools (150 XP OR 2 topics).
  { feature: 'math-widget',      tier: 5, xp: 150, topicsCompleted: 2,       description: 'Reach 150 XP or finish 2 topics',       descriptionHe: 'הגע ל-150 נק׳ או סיים 2 נושאים כדי לפתוח את עורך המשוואות' },
  { feature: 'formula-library',  tier: 5, xp: 150, topicsCompleted: 2,       description: 'Reach 150 XP or finish 2 topics',       descriptionHe: 'הגע ל-150 נק׳ או סיים 2 נושאים כדי לפתוח את ספריית הנוסחאות' },

  // Tier 6 — City build + coins after a real habit (3 topics OR 250 XP).
  { feature: 'city-editor',      tier: 6, xp: 250, topicsCompleted: 3,       description: 'Reach 250 XP or finish 3 topics',       descriptionHe: 'הגע ל-250 נק׳ או סיים 3 נושאים כדי לפתוח את עורך העיר' },
  { feature: 'coins-store',      tier: 6, xp: 250, topicsCompleted: 3,       description: 'Reach 250 XP or finish 3 topics',       descriptionHe: 'הגע ל-250 נק׳ או סיים 3 נושאים כדי לפתוח את חנות המטבעות' },
  { feature: 'city-themes',      tier: 6, xp: 250, topicsCompleted: 3,       description: 'Reach 250 XP or finish 3 topics',       descriptionHe: 'הגע ל-250 נק׳ או סיים 3 נושאים כדי לפתוח ערכות נושא לעיר' },

  // Tier 7 — Layout & structure (400 XP OR 4 topics).
  { feature: 'templates',        tier: 7, xp: 400, topicsCompleted: 4,       description: 'Reach 400 XP or finish 4 topics',       descriptionHe: 'הגע ל-400 נק׳ או סיים 4 נושאים כדי לפתוח את התבניות' },
  { feature: 'whiteboard-full',  tier: 7, xp: 400, topicsCompleted: 4,       description: 'Reach 400 XP or finish 4 topics',       descriptionHe: 'הגע ל-400 נק׳ או סיים 4 נושאים כדי לפתוח את לוח הציור המלא' },
  { feature: 'color-picker',     tier: 7, xp: 400, topicsCompleted: 4,       description: 'Reach 400 XP or finish 4 topics',       descriptionHe: 'הגע ל-400 נק׳ או סיים 4 נושאים כדי לפתוח את בורר הצבעים' },

  // Tier 8 — Multi-surface workflow (600 XP OR 6 topics).
  { feature: 'split-screen',          tier: 8, xp: 600, topicsCompleted: 6,  description: 'Reach 600 XP or finish 6 topics',      descriptionHe: 'הגע ל-600 נק׳ או סיים 6 נושאים כדי לפתוח פיצול מסך' },
  { feature: 'cross-link',            tier: 8, xp: 600, topicsCompleted: 6,  description: 'Reach 600 XP or finish 6 topics',      descriptionHe: 'הגע ל-600 נק׳ או סיים 6 נושאים כדי לפתוח קישור בין מסמכים' },
  { feature: 'global-search',         tier: 8, xp: 600, topicsCompleted: 6,  description: 'Reach 600 XP or finish 6 topics',      descriptionHe: 'הגע ל-600 נק׳ או סיים 6 נושאים כדי לפתוח חיפוש גלובלי' },
  { feature: 'drawing-board-full',    tier: 8, xp: 600, topicsCompleted: 6,  description: 'Reach 600 XP or finish 6 topics',      descriptionHe: 'הגע ל-600 נק׳ או סיים 6 נושאים כדי לפתוח את לוח הציור המלא' },

  // Tier 9 — Stat-B unlocked (finish all Stat-A topics; 10 topics today).
  { feature: 'stat-b-native',        tier: 9, topicsCompleted: 10,            description: 'Finish all Stat-A topics',              descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ כדי לפתוח את סטטיסטיקה ב׳' },
  { feature: 'cross-course-quiz',    tier: 9, topicsCompleted: 10,            description: 'Finish all Stat-A topics',              descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ כדי לפתוח חידוני בין-קורסים' },

  // Tier 10 — Expert tools (1200 XP OR 10 topics).
  { feature: 'methods',              tier: 10, xp: 1200, topicsCompleted: 10, description: 'Reach 1200 XP or master every topic',   descriptionHe: 'הגע ל-1200 נק׳ או שלוט בכל הנושאים כדי לפתוח שיטות מחקר' },
  { feature: 'anova',                tier: 10, xp: 1200, topicsCompleted: 10, description: 'Reach 1200 XP or master every topic',   descriptionHe: 'הגע ל-1200 נק׳ או שלוט בכל הנושאים כדי לפתוח ניתוח שונות' },
  { feature: 'custom-topic',         tier: 10, xp: 1200, topicsCompleted: 10, description: 'Reach 1200 XP or master every topic',   descriptionHe: 'הגע ל-1200 נק׳ או שלוט בכל הנושאים כדי ליצור נושא מותאם' },
  { feature: 'community-curated',    tier: 10, xp: 1200, topicsCompleted: 10, description: 'Reach 1200 XP or master every topic',   descriptionHe: 'הגע ל-1200 נק׳ או שלוט בכל הנושאים כדי לפתוח ארסנל קהילתי' },
]

export const FEATURE_UNLOCKS_BY_ID: Record<string, UnlockRule> = Object.fromEntries(
  FEATURE_UNLOCKS.map(r => [r.feature, r])
)

/**
 * Given a learning state, return every FeatureId whose unlock criteria are
 * satisfied. Either xp OR topicsCompleted (whichever is present) qualifies —
 * meeting any threshold is enough.
 */
// Lesson ids that count as onboarding, NOT real statistics topics. They drive
// `requiresLesson` unlocks but must NOT inflate the `topicsCompleted` count
// (otherwise finishing the 1-minute intro would unlock mid-ladder features).
const NON_TOPIC_LESSONS = new Set(['intro'])

export function evaluateUnlocks(state: { xp: number; completedLessons: string[] }): FeatureId[] {
  const xp = state.xp ?? 0
  const completed = state.completedLessons ?? []
  const topics = completed.filter(id => !NON_TOPIC_LESSONS.has(id)).length
  const out: FeatureId[] = []
  for (const rule of FEATURE_UNLOCKS) {
    let ok = false
    if (rule.xp !== undefined && xp >= rule.xp) ok = true
    if (rule.topicsCompleted !== undefined && topics >= rule.topicsCompleted) ok = true
    if (rule.requiresLesson !== undefined && completed.includes(rule.requiresLesson)) ok = true
    if (ok) out.push(rule.feature)
  }
  return out
}

/** All known feature ids (used by adminMode to flush every gate). */
export const ALL_FEATURE_IDS: FeatureId[] = FEATURE_UNLOCKS.map(r => r.feature)
