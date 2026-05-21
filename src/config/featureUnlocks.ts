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
  description: string
  descriptionHe: string
}

export const FEATURE_UNLOCKS: UnlockRule[] = [
  // Tier 1 — First win (≥10 XP and ≥1 lesson read; spec says "5 min, 1 lesson, 1 correct")
  { feature: 'arsenal',          tier: 1, xp: 10,                            description: 'Answer your first question correctly',  descriptionHe: 'ענה נכון על שאלה ראשונה כדי לפתוח את הארסנל' },
  { feature: 'pomodoro',         tier: 1, xp: 10,                            description: 'Answer your first question correctly',  descriptionHe: 'ענה נכון על שאלה ראשונה כדי לפתוח את שעון הפומודורו' },

  // Tier 2 — Habit (50 XP OR 1 topic completed)
  { feature: 'ai-tutor',         tier: 2, xp: 50, topicsCompleted: 1,        description: 'Reach 50 XP or finish 1 topic',         descriptionHe: 'הגע ל-50 נק׳ או סיים נושא אחד כדי לפתוח את המורה הפרטי' },
  { feature: 'mindmap-view',     tier: 2, xp: 50, topicsCompleted: 1,        description: 'Reach 50 XP or finish 1 topic',         descriptionHe: 'הגע ל-50 נק׳ או סיים נושא אחד כדי לראות את מפת הלמידה' },

  // Tier 3 — Active note-taking (100 XP OR 2 topics completed)
  { feature: 'notebook',         tier: 3, xp: 100, topicsCompleted: 2,       description: 'Reach 100 XP or finish 2 topics',       descriptionHe: 'הגע ל-100 נק׳ או סיים 2 נושאים כדי לפתוח את המחברת' },
  { feature: 'mindmap-edit',     tier: 3, xp: 100, topicsCompleted: 2,       description: 'Reach 100 XP or finish 2 topics',       descriptionHe: 'הגע ל-100 נק׳ או סיים 2 נושאים כדי לערוך את מפת החשיבה' },
  { feature: 'paper-styles',     tier: 3, xp: 100, topicsCompleted: 2,       description: 'Reach 100 XP or finish 2 topics',       descriptionHe: 'הגע ל-100 נק׳ או סיים 2 נושאים כדי להחליף סגנון נייר' },

  // Tier 4 — Math at hand (200 XP OR 3 topics completed)
  { feature: 'math-widget',      tier: 4, xp: 200, topicsCompleted: 3,       description: 'Reach 200 XP or finish 3 topics',       descriptionHe: 'הגע ל-200 נק׳ או סיים 3 נושאים כדי לפתוח את עורך המשוואות' },
  { feature: 'formula-library',  tier: 4, xp: 200, topicsCompleted: 3,       description: 'Reach 200 XP or finish 3 topics',       descriptionHe: 'הגע ל-200 נק׳ או סיים 3 נושאים כדי לפתוח את ספריית הנוסחאות' },
  { feature: 'highlighter',      tier: 4, xp: 200, topicsCompleted: 3,       description: 'Reach 200 XP or finish 3 topics',       descriptionHe: 'הגע ל-200 נק׳ או סיים 3 נושאים כדי לפתוח את המסמן' },

  // Tier 5 — Visual thinking (400 XP OR 5 topics completed)
  { feature: 'whiteboard-basic', tier: 5, xp: 400, topicsCompleted: 5,       description: 'Reach 400 XP or finish 5 topics',       descriptionHe: 'הגע ל-400 נק׳ או סיים 5 נושאים כדי לפתוח את לוח הציור' },
  { feature: 'shapes',           tier: 5, xp: 400, topicsCompleted: 5,       description: 'Reach 400 XP or finish 5 topics',       descriptionHe: 'הגע ל-400 נק׳ או סיים 5 נושאים כדי לפתוח את כלי הצורות' },

  // Tier 6 — Layout & structure (600 XP OR 7 topics completed)
  { feature: 'templates',        tier: 6, xp: 600, topicsCompleted: 7,       description: 'Reach 600 XP or finish 7 topics',       descriptionHe: 'הגע ל-600 נק׳ או סיים 7 נושאים כדי לפתוח את התבניות' },
  { feature: 'whiteboard-full',  tier: 6, xp: 600, topicsCompleted: 7,       description: 'Reach 600 XP or finish 7 topics',       descriptionHe: 'הגע ל-600 נק׳ או סיים 7 נושאים כדי לפתוח את לוח הציור המלא' },
  { feature: 'color-picker',     tier: 6, xp: 600, topicsCompleted: 7,       description: 'Reach 600 XP or finish 7 topics',       descriptionHe: 'הגע ל-600 נק׳ או סיים 7 נושאים כדי לפתוח את בורר הצבעים' },

  // Tier 7 — Multi-surface workflow (1000 XP OR 9 topics completed)
  { feature: 'split-screen',          tier: 7, xp: 1000, topicsCompleted: 9, description: 'Reach 1000 XP or finish 9 topics',      descriptionHe: 'הגע ל-1000 נק׳ או סיים 9 נושאים כדי לפתוח פיצול מסך' },
  { feature: 'cross-link',            tier: 7, xp: 1000, topicsCompleted: 9, description: 'Reach 1000 XP or finish 9 topics',      descriptionHe: 'הגע ל-1000 נק׳ או סיים 9 נושאים כדי לפתוח קישור בין מסמכים' },
  { feature: 'global-search',         tier: 7, xp: 1000, topicsCompleted: 9, description: 'Reach 1000 XP or finish 9 topics',      descriptionHe: 'הגע ל-1000 נק׳ או סיים 9 נושאים כדי לפתוח חיפוש גלובלי' },
  { feature: 'drawing-board-full',    tier: 7, xp: 1000, topicsCompleted: 9, description: 'Reach 1000 XP or finish 9 topics',      descriptionHe: 'הגע ל-1000 נק׳ או סיים 9 נושאים כדי לפתוח את לוח הציור המלא' },

  // Tier 8 — City mastery (1500 XP OR 12 topics completed)
  { feature: 'city-editor',      tier: 8, xp: 1500, topicsCompleted: 12,     description: 'Reach 1500 XP or finish 12 topics',     descriptionHe: 'הגע ל-1500 נק׳ או סיים 12 נושאים כדי לפתוח את עורך העיר' },
  { feature: 'coins-store',      tier: 8, xp: 1500, topicsCompleted: 12,     description: 'Reach 1500 XP or finish 12 topics',     descriptionHe: 'הגע ל-1500 נק׳ או סיים 12 נושאים כדי לפתוח את חנות המטבעות' },
  { feature: 'city-themes',      tier: 8, xp: 1500, topicsCompleted: 12,     description: 'Reach 1500 XP or finish 12 topics',     descriptionHe: 'הגע ל-1500 נק׳ או סיים 12 נושאים כדי לפתוח ערכות נושא לעיר' },

  // Tier 9 — Stat-B unlocked (all 18 Stat-A topics completed; we only have 10 today, use 10+ as proxy)
  { feature: 'stat-b-native',        tier: 9, topicsCompleted: 18,            description: 'Finish all Stat-A topics',              descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ כדי לפתוח את סטטיסטיקה ב׳' },
  { feature: 'cross-course-quiz',    tier: 9, topicsCompleted: 18,            description: 'Finish all Stat-A topics',              descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ כדי לפתוח חידוני בין-קורסים' },

  // Tier 10 — Expert tools (~3000 XP)
  { feature: 'methods',              tier: 10, xp: 3000,                      description: 'Reach 3000 XP — master both courses',   descriptionHe: 'הגע ל-3000 נק׳ ושלוט בשני הקורסים כדי לפתוח שיטות מחקר' },
  { feature: 'anova',                tier: 10, xp: 3000,                      description: 'Reach 3000 XP — master both courses',   descriptionHe: 'הגע ל-3000 נק׳ ושלוט בשני הקורסים כדי לפתוח ניתוח שונות' },
  { feature: 'custom-topic',         tier: 10, xp: 3000,                      description: 'Reach 3000 XP — master both courses',   descriptionHe: 'הגע ל-3000 נק׳ ושלוט בשני הקורסים כדי ליצור נושא מותאם' },
  { feature: 'community-curated',    tier: 10, xp: 3000,                      description: 'Reach 3000 XP — master both courses',   descriptionHe: 'הגע ל-3000 נק׳ ושלוט בשני הקורסים כדי לפתוח ארסנל קהילתי' },
]

export const FEATURE_UNLOCKS_BY_ID: Record<string, UnlockRule> = Object.fromEntries(
  FEATURE_UNLOCKS.map(r => [r.feature, r])
)

/**
 * Given a learning state, return every FeatureId whose unlock criteria are
 * satisfied. Either xp OR topicsCompleted (whichever is present) qualifies —
 * meeting any threshold is enough.
 */
export function evaluateUnlocks(state: { xp: number; completedLessons: string[] }): FeatureId[] {
  const xp = state.xp ?? 0
  const topics = (state.completedLessons ?? []).length
  const out: FeatureId[] = []
  for (const rule of FEATURE_UNLOCKS) {
    let ok = false
    if (rule.xp !== undefined && xp >= rule.xp) ok = true
    if (rule.topicsCompleted !== undefined && topics >= rule.topicsCompleted) ok = true
    if (ok) out.push(rule.feature)
  }
  return out
}

/** All known feature ids (used by adminMode to flush every gate). */
export const ALL_FEATURE_IDS: FeatureId[] = FEATURE_UNLOCKS.map(r => r.feature)
