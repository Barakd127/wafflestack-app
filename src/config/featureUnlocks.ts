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

// ── One-at-a-time progression continuum ─────────────────────────────────────
// The core study loop (theory + practice + sidebar home/courses + hints +
// streaks) has NO rule here → always unlocked. Everything below is a *reward*
// that the learner collects ONE AT A TIME along a smooth XP curve — never in
// clusters. Each feature has a UNIQUE xp threshold (monotonically increasing),
// so no two features ever unlock at the same moment.
//
// Design contract (see Vault spec + plan snazzy-sauteeing-charm.md):
//   • XP is the single smooth axis (a correct answer = 10-20 XP → fine grain).
//   • Each `tier` is now the feature's ORDINAL position in the continuum (1..28),
//     NOT a shared band. macroTierForFeature() groups them into basic/inter/adv.
//   • `topicsCompleted` is kept ONLY where it's semantically the real gate
//     (stat-b-native / cross-course-quiz = "finish all Stat-A topics"). It was
//     removed from every XP-driven rule because an OR'd topic gate is exactly
//     what made features pop in clusters when a topic completed.
//   • `requiresLesson:'intro'` stays on the first couple so finishing the
//     1-minute intro still lights up the very first reward.
// Rules still OR together (xp OR topicsCompleted OR a specific lesson) — but
// since each xp value is unique, they fire sequentially.
export const FEATURE_UNLOCKS: UnlockRule[] = [
  // ── Basic band (ordinals 1-7) — tight spacing for early momentum ──────────
  { feature: 'arsenal',          tier: 1,  xp: 10,  requiresLesson: 'intro', description: 'Finish the intro lesson or answer one question', descriptionHe: 'סיים את שיעור הפתיחה או ענה נכון על שאלה אחת — נפתח הארסנל' },
  { feature: 'pomodoro',         tier: 2,  xp: 20,                            description: 'Reach 20 XP',  descriptionHe: 'הגע ל-20 נק׳ כדי לפתוח את שעון הפומודורו' },
  { feature: 'mindmap-view',     tier: 3,  xp: 35,  requiresLesson: 'intro', description: 'Finish the intro lesson or reach 35 XP', descriptionHe: 'סיים את שיעור הפתיחה או הגע ל-35 נק׳ — תראה את מפת הלמידה שלך' },
  { feature: 'ai-tutor',         tier: 4,  xp: 50,                            description: 'Reach 50 XP',  descriptionHe: 'הגע ל-50 נק׳ כדי לפתוח את המורה הפרטי' },
  { feature: 'notebook',         tier: 5,  xp: 70,                            description: 'Reach 70 XP',  descriptionHe: 'הגע ל-70 נק׳ כדי לפתוח את המחברת' },
  { feature: 'mindmap-edit',     tier: 6,  xp: 95,                            description: 'Reach 95 XP',  descriptionHe: 'הגע ל-95 נק׳ כדי לערוך את מפת החשיבה' },
  { feature: 'paper-styles',     tier: 7,  xp: 120,                           description: 'Reach 120 XP', descriptionHe: 'הגע ל-120 נק׳ כדי להחליף סגנון נייר' },

  // ── Intermediate band (ordinals 8-18) — widening spacing ──────────────────
  { feature: 'highlighter',      tier: 8,  xp: 150,                           description: 'Reach 150 XP', descriptionHe: 'הגע ל-150 נק׳ כדי לפתוח את המסמן' },
  { feature: 'whiteboard-basic', tier: 9,  xp: 185,                           description: 'Reach 185 XP', descriptionHe: 'הגע ל-185 נק׳ כדי לפתוח את לוח הציור' },
  { feature: 'shapes',           tier: 10, xp: 225,                           description: 'Reach 225 XP', descriptionHe: 'הגע ל-225 נק׳ כדי לפתוח את כלי הצורות' },
  { feature: 'math-widget',      tier: 11, xp: 270,                           description: 'Reach 270 XP', descriptionHe: 'הגע ל-270 נק׳ כדי לפתוח את עורך המשוואות' },
  { feature: 'formula-library',  tier: 12, xp: 320,                           description: 'Reach 320 XP', descriptionHe: 'הגע ל-320 נק׳ כדי לפתוח את ספריית הנוסחאות' },
  { feature: 'color-picker',     tier: 13, xp: 375,                           description: 'Reach 375 XP', descriptionHe: 'הגע ל-375 נק׳ כדי לפתוח את בורר הצבעים' },
  { feature: 'templates',        tier: 14, xp: 435,                           description: 'Reach 435 XP', descriptionHe: 'הגע ל-435 נק׳ כדי לפתוח את התבניות' },
  { feature: 'whiteboard-full',  tier: 15, xp: 500,                           description: 'Reach 500 XP', descriptionHe: 'הגע ל-500 נק׳ כדי לפתוח את לוח הציור המלא' },
  { feature: 'city-editor',      tier: 16, xp: 570,                           description: 'Reach 570 XP', descriptionHe: 'הגע ל-570 נק׳ כדי לפתוח את עורך העיר' },
  { feature: 'coins-store',      tier: 17, xp: 645,                           description: 'Reach 645 XP', descriptionHe: 'הגע ל-645 נק׳ כדי לפתוח את חנות המטבעות' },
  { feature: 'city-themes',      tier: 18, xp: 725,                           description: 'Reach 725 XP', descriptionHe: 'הגע ל-725 נק׳ כדי לפתוח ערכות נושא לעיר' },

  // ── Advanced band (ordinals 19-28) — aspirational; split-screen leads ─────
  { feature: 'split-screen',         tier: 19, xp: 810,                       description: 'Reach 810 XP', descriptionHe: 'הגע ל-810 נק׳ כדי לפתוח פיצול מסך' },
  { feature: 'cross-link',           tier: 20, xp: 900,                       description: 'Reach 900 XP', descriptionHe: 'הגע ל-900 נק׳ כדי לפתוח קישור בין מסמכים' },
  { feature: 'global-search',        tier: 21, xp: 995,                       description: 'Reach 995 XP', descriptionHe: 'הגע ל-995 נק׳ כדי לפתוח חיפוש גלובלי' },
  { feature: 'drawing-board-full',   tier: 22, xp: 1095,                      description: 'Reach 1095 XP', descriptionHe: 'הגע ל-1095 נק׳ כדי לפתוח את לוח הציור המלא' },
  // Semantic gate: Stat-B opens by finishing all Stat-A topics (10), not raw XP.
  { feature: 'stat-b-native',        tier: 23, topicsCompleted: 10,           description: 'Finish all Stat-A topics', descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ כדי לפתוח את סטטיסטיקה ב׳' },
  { feature: 'cross-course-quiz',    tier: 24, xp: 1320, topicsCompleted: 10, description: 'Finish all Stat-A topics or reach 1320 XP', descriptionHe: 'סיים את כל נושאי סטטיסטיקה א׳ (או הגע ל-1320 נק׳) כדי לפתוח חידוני בין-קורסים' },
  { feature: 'methods',              tier: 25, xp: 1200,                      description: 'Reach 1200 XP', descriptionHe: 'הגע ל-1200 נק׳ כדי לפתוח שיטות מחקר' },
  { feature: 'anova',                tier: 26, xp: 1340,                      description: 'Reach 1340 XP', descriptionHe: 'הגע ל-1340 נק׳ כדי לפתוח ניתוח שונות' },
  { feature: 'custom-topic',         tier: 27, xp: 1480,                      description: 'Reach 1480 XP', descriptionHe: 'הגע ל-1480 נק׳ כדי ליצור נושא מותאם' },
  { feature: 'community-curated',    tier: 28, xp: 1620,                      description: 'Reach 1620 XP', descriptionHe: 'הגע ל-1620 נק׳ כדי לפתוח ארסנל קהילתי' },
]

// ── Macro-tier grouping (label + tour layer over the continuum) ─────────────
// The 28-feature continuum is grouped into 3 macro tiers for: (a) the 🎓 סיור
// launcher tabs, (b) the auto-open-tour-on-unlock trigger. A macro tier owns a
// contiguous span of ordinals.
export type MacroTier = 'basic' | 'intermediate' | 'advanced'

/** Ordinal (rule.tier) → macro tier. basic = 1-7, intermediate = 8-18, advanced = 19-28. */
export function macroTierForOrdinal(ordinal: number): MacroTier {
  if (ordinal <= 7) return 'basic'
  if (ordinal <= 18) return 'intermediate'
  return 'advanced'
}

/** Which macro tier a feature belongs to (null if the id has no rule). */
export function macroTierForFeature(id: FeatureId): MacroTier | null {
  const rule = FEATURE_UNLOCKS_BY_ID[id]
  return rule ? macroTierForOrdinal(rule.tier) : null
}

export interface MacroTierMeta {
  id: MacroTier
  tourId: string
  emoji: string
  labelHe: string
  descHe: string
}

/** Drives the launcher tier sections + auto-open trigger. Order = display order. */
export const MACRO_TIERS: MacroTierMeta[] = [
  { id: 'basic',        tourId: 'tour-basic',        emoji: '🌱', labelHe: 'בסיסי',  descHe: 'הצעדים הראשונים — ארסנל, מחברת, מפת מושגים ומורה פרטי' },
  { id: 'intermediate', tourId: 'tour-intermediate', emoji: '✏️', labelHe: 'בינוני',  descHe: 'כלי הקנבס — מסמן, צורות, עורך משוואות, ספריית נוסחאות והעיר' },
  { id: 'advanced',     tourId: 'tour-advanced',     emoji: '🚀', labelHe: 'מתקדם',  descHe: 'זרימת העבודה המלאה — פיצול מסך עם תיאוריה, קנבס ותרגול' },
]

/** Short display name + icon per feature — drives the per-feature tour launcher. */
export const FEATURE_META: Record<FeatureId, { emoji: string; labelHe: string }> = {
  'arsenal':            { emoji: '📦', labelHe: 'הארסנל שלי' },
  'pomodoro':           { emoji: '⏱️', labelHe: 'שעון פומודורו' },
  'ai-tutor':           { emoji: '🧑‍🏫', labelHe: 'מורה פרטי' },
  'mindmap-view':       { emoji: '🗺️', labelHe: 'מפת מושגים' },
  'mindmap-edit':       { emoji: '✏️', labelHe: 'עריכת מפה' },
  'notebook':           { emoji: '📔', labelHe: 'מחברת' },
  'paper-styles':       { emoji: '📄', labelHe: 'סגנונות נייר' },
  'math-widget':        { emoji: '➗', labelHe: 'עורך משוואות' },
  'formula-library':    { emoji: '∑',  labelHe: 'ספריית נוסחאות' },
  'highlighter':        { emoji: '🖍️', labelHe: 'מסמן' },
  'whiteboard-basic':   { emoji: '🎨', labelHe: 'לוח ציור' },
  'shapes':             { emoji: '🔷', labelHe: 'צורות' },
  'templates':          { emoji: '📐', labelHe: 'תבניות' },
  'whiteboard-full':    { emoji: '🖌️', labelHe: 'לוח ציור מלא' },
  'color-picker':       { emoji: '🌈', labelHe: 'בורר צבעים' },
  'split-screen':       { emoji: '⊟',  labelHe: 'פיצול מסך' },
  'cross-link':         { emoji: '🔗', labelHe: 'קישור בין מסמכים' },
  'global-search':      { emoji: '🔍', labelHe: 'חיפוש גלובלי' },
  'drawing-board-full': { emoji: '🖼️', labelHe: 'לוח שרטוט מלא' },
  'city-editor':        { emoji: '🏙️', labelHe: 'העולם שלי' },
  'coins-store':        { emoji: '🪙', labelHe: 'חנות מטבעות' },
  'city-themes':        { emoji: '🏛️', labelHe: 'ערכות נושא לעיר' },
  'stat-b-native':      { emoji: '📈', labelHe: 'סטטיסטיקה ב׳' },
  'cross-course-quiz':  { emoji: '🎲', labelHe: 'חידון בין-קורסים' },
  'methods':            { emoji: '🔬', labelHe: 'שיטות מחקר' },
  'anova':              { emoji: '📊', labelHe: 'ניתוח שונות' },
  'custom-topic':       { emoji: '➕', labelHe: 'נושא מותאם' },
  'community-curated':  { emoji: '🌐', labelHe: 'ארסנל קהילתי' },
}

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

/**
 * Single source of truth for "is this control usable right now". A feature with
 * NO unlock rule is always available; adminMode flushes every gate. Mirrors the
 * inline check in FeatureGate so every gated control (sidebar, canvas switcher,
 * map toggle, split FAB) shares one predicate.
 */
export function isFeatureUnlocked(
  id: FeatureId,
  unlockedFeatures: readonly string[] | undefined,
  adminMode: boolean,
): boolean {
  if (adminMode) return true
  if (!FEATURE_UNLOCKS_BY_ID[id]) return true // no rule → always open
  return !!unlockedFeatures && unlockedFeatures.includes(id)
}
