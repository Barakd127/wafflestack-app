/**
 * Topic → building mapping + Hebrew building names for the glass board.
 * Kept out of CityBackdrop.tsx so that file exports only a component
 * (react-refresh/only-export-components) and the shell's mastery toast can
 * reuse the names without importing the backdrop's internals.
 */

// topicId → buildingId, same chain as BUILDING_UNLOCK_CHAIN in learningStore
// These 10 are the legacy ids (untouched — kept exactly as they were).
export const TOPIC_TO_BUILDING: Record<string, string> = {
  mean: 'power',
  median: 'housing',
  stddev: 'traffic',
  normal: 'hospital',
  sampling: 'school',
  hypothesis: 'research',
  correlation: 'market',
  regression: 'bank',
  binomial: 'city-hall',
  ci: 'news',

  // ── curated: the real lesson/quiz topic ids (topicLabels.ts / topicHierarchy.ts /
  // lesson-content*.ts), mapped to a building by meaning. Ids that already match a
  // legacy key above (mean, median, sampling, correlation, regression, binomial)
  // are not repeated here — the legacy entry already covers them.

  // Stat-A "original 10" ids that differ from the legacy short forms
  'std-dev':               'traffic',   // spread — same bucket as legacy stddev
  probability:             'hospital',  // chance / distributions
  'hypothesis-testing':    'research',  // inference — same bucket as legacy hypothesis
  'confidence-intervals':  'news',      // reporting a range — same bucket as legacy ci

  // Stat-A: 30111-syllabus lesson topics
  intro:                    'city-hall',  // overview/civic centre
  'variable-types':         'city-hall',  // foundations, grouped with intro
  'data-presentation':      'news',       // presenting/reporting data
  'distribution-shapes':    'hospital',   // shape of a distribution
  'weighted-combined':      'power',      // extension of the mean
  'observation-changes':    'housing',    // extension of the median
  'linear-transformations': 'traffic',    // rescaling — spread bucket
  percentiles:               'traffic',   // position/spread, grouped with std-dev
  combinatorics:             'hospital',  // grouped with probability
  'discrete-rv':             'city-hall', // grouped with binomial
  pearson:                   'market',    // correlation family
  spearman:                  'market',    // correlation family
  cramer:                    'bank',      // correlation family

  // Stat-B (inferential) lesson topics
  'b-intro':                   'city-hall',
  'b-sampling-dist':           'school',
  'b-chebyshev-lln':           'school',
  'b-clt':                     'school',
  'b-point-estimation':        'research',
  'b-confidence-intervals':    'news',
  'b-hypothesis-testing':      'research',
  'b-errors-power':            'research',
  'b-interpretation':          'news',
  'b-diff-means':              'power',
  'b-paired-samples':          'research',
  'b-proportion':              'research',
  'b-variance-test':           'traffic',
  'b-binomial-chisquare':      'city-hall',
  'b-independence-mcnemar':    'city-hall',
  'b-wilcoxon-fisher':         'research',
  'b-simple-regression':       'bank',
  'b-multiple-regression':     'bank',

  // SQL lesson topics — spread across market / bank / news / research
  'sql-select':             'market',
  'sql-where':               'research',
  'sql-order-limit':         'news',
  'sql-null':                 'research',
  'sql-join':                 'bank',
  'sql-aggregate':            'market',
  'sql-group-by':             'market',
  'sql-subquery-cte':         'research',
  'sql-dml':                  'bank',
  'sql-create-constraints':   'city-hall',
  'sql-index':                 'traffic',
  'sql-window':                'news',

  // ANOVA / multiple-regression lesson topics
  'anova-multiple-regression': 'bank',
  'anova-dummy-2':             'bank',
  'anova-dummy-multi':         'bank',
  'anova-interaction':         'bank',
  'anova-oneway-model':        'research',
  'anova-oneway-ftest':        'research',
  'anova-posthoc':             'research',
  'anova-blocks':              'research',
}

// The 10 buildings, in a fixed order — used as the fallback pool for unknown ids.
const BUILDING_IDS = [
  'power', 'housing', 'traffic', 'hospital', 'school',
  'research', 'market', 'bank', 'city-hall', 'news',
] as const

// Hebrew names — the ExamMode labels without the emoji
export const BUILDING_NAME_HE: Record<string, string> = {
  power: 'תחנת כוח',
  housing: 'מנהל דיור',
  traffic: 'בקרת תנועה',
  hospital: 'בית חולים',
  school: 'בית ספר',
  bank: 'בנק',
  market: 'שוק',
  'city-hall': 'עיריה',
  research: 'מכון מחקר',
  news: 'תחנת חדשות',
}

// Stable string hash (djb2) — deterministic, no Math.random, same input → same building.
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return h >>> 0
}

/**
 * Resolve a topicId to a buildingId. Curated ids use TOPIC_TO_BUILDING; any
 * other non-empty id falls back to a deterministic pick from the 10 buildings
 * (same id always lands on the same building). Undefined/empty topicId → undefined.
 */
export function buildingForTopic(topicId?: string): string | undefined {
  if (!topicId) return undefined
  const curated = TOPIC_TO_BUILDING[topicId]
  if (curated) return curated
  return BUILDING_IDS[hashString(topicId) % BUILDING_IDS.length]
}

/** Hebrew building name for a topic (undefined only when topicId itself is undefined/empty). */
export function buildingNameForTopic(topicId?: string): string | undefined {
  const id = buildingForTopic(topicId)
  return id ? BUILDING_NAME_HE[id] : undefined
}
