import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { evaluateUnlocks, ALL_FEATURE_IDS, FEATURE_UNLOCKS_BY_ID, type FeatureId } from '../config/featureUnlocks'
import type { PersonalPlan, IntakeAnswers } from '../data/personalPlanTypes'

// ── SM-2 Spaced Repetition ────────────────────────────────────────────────────

export interface CardData {
  interval: number        // days until next review
  repetitions: number     // consecutive correct answers
  easeFactor: number      // SM-2 multiplier (min 1.3, default 2.5)
  nextReview: number      // ms timestamp; 0 = new card (never seen)
  lastSeen: number | null
  difficulty: number      // 0-5 quality rating from last answer
}

function sm2Update(card: CardData, quality: number): CardData {
  const EF_MIN = 1.3
  const EF_DEFAULT = 2.5
  const ef = card.easeFactor || EF_DEFAULT

  if (quality >= 3) {
    let interval: number
    if (card.repetitions === 0) interval = 1
    else if (card.repetitions === 1) interval = 6
    else interval = Math.round(card.interval * ef)

    const newEF = Math.max(EF_MIN, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    return {
      interval,
      repetitions: card.repetitions + 1,
      easeFactor: newEF,
      nextReview: Date.now() + interval * 86400000,
      lastSeen: Date.now(),
      difficulty: quality,
    }
  } else {
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: Math.max(EF_MIN, ef - 0.2),
      nextReview: Date.now() + 86400000,
      lastSeen: Date.now(),
      difficulty: quality,
    }
  }
}

function getXpMultiplier(interval: number, quality: number): number {
  if (quality < 3) return 0
  if (interval >= 16 && interval <= 30) return 3.5
  if (interval >= 45) return 2.5
  if (interval >= 6) return 2.0
  return 1.0
}

// ── Question Bank ────────────────────────────────────────────────────────────

export interface Question {
  id: string
  topic: 'normal' | 'hypothesis' | 'correlation' | 'mean' | 'median' | 'stddev' | 'sampling' | 'regression' | 'ci' | 'binomial'
  text: string
  options: string[]
  correct: number  // index into options
  explanation: string
  xpReward: number
}

export const QUESTION_BANK: Question[] = [
  // ── Normal Distribution ──────────────────────────────────────────────────
  {
    id: 'n1', topic: 'normal',
    text: 'What percentage of data falls within ±1 standard deviation of the mean?',
    options: ['50%', '68%', '95%', '99.7%'],
    correct: 1,
    explanation: 'The empirical rule: 68% within ±1σ, 95% within ±2σ, 99.7% within ±3σ.',
    xpReward: 10,
  },
  {
    id: 'n2', topic: 'normal',
    text: 'In a normal distribution, what is the relationship between mean, median, and mode?',
    options: ['Mean > Median > Mode', 'Mode > Median > Mean', 'They are equal', 'It depends on the variance'],
    correct: 2,
    explanation: 'A perfectly symmetric normal distribution has mean = median = mode, all at the center.',
    xpReward: 10,
  },
  {
    id: 'n3', topic: 'normal',
    text: 'What does the formula Z = (X − μ) / σ produce?',
    options: ['A percentile rank', 'The variance', 'A standard (Z) score', 'The skewness'],
    correct: 2,
    explanation: 'Z-scores express how many standard deviations a value is from the mean, enabling comparison across distributions.',
    xpReward: 15,
  },
  {
    id: 'n4', topic: 'normal',
    text: 'The total area under the normal distribution curve equals:',
    options: ['0.5', '0.68', '0.95', '1.0'],
    correct: 3,
    explanation: 'The area under any probability density function equals 1.0, representing 100% of outcomes.',
    xpReward: 10,
  },
  {
    id: 'n5', topic: 'normal',
    text: 'A distribution with a long right tail is called:',
    options: ['Negatively skewed', 'Normal', 'Positively skewed', 'Bimodal'],
    correct: 2,
    explanation: 'A long right (positive) tail means most values cluster on the left. Skewness describes asymmetry direction.',
    xpReward: 15,
  },
  {
    id: 'n6', topic: 'normal',
    text: 'Which Z-score corresponds to the 50th percentile?',
    options: ['Z = -1', 'Z = 0', 'Z = 1', 'Z = 2'],
    correct: 1,
    explanation: 'Z = 0 is the mean, which sits at exactly the 50th percentile in a normal distribution.',
    xpReward: 10,
  },

  // ── Hypothesis Testing ───────────────────────────────────────────────────
  {
    id: 'h1', topic: 'hypothesis',
    text: 'What does a p-value represent?',
    options: [
      'The probability that H₀ is true',
      'The probability of results as extreme as observed, assuming H₀ is true',
      'The effect size',
      'The power of the test',
    ],
    correct: 1,
    explanation: 'p-value = P(data | H₀). A small p-value means the observed data is unlikely if the null is true — not that H₀ is false.',
    xpReward: 20,
  },
  {
    id: 'h2', topic: 'hypothesis',
    text: 'If p = 0.03 and α = 0.05, what do we conclude?',
    options: ['Fail to reject H₀', 'Reject H₀', 'Accept H₁ as proven', 'Increase the sample size'],
    correct: 1,
    explanation: 'Since p < α, we reject H₀. Note: we never "prove" H₁ — we only find evidence against H₀.',
    xpReward: 15,
  },
  {
    id: 'h3', topic: 'hypothesis',
    text: 'A Type I error (α) occurs when:',
    options: [
      'We fail to reject a false H₀',
      'We reject a true H₀',
      'The sample is too small',
      'Effect size is negligible',
    ],
    correct: 1,
    explanation: 'Type I error = false positive: we mistakenly conclude an effect exists. α is the tolerated rate of this error.',
    xpReward: 20,
  },
  {
    id: 'h4', topic: 'hypothesis',
    text: 'Statistical power (1 − β) is the probability of:',
    options: [
      'Making a Type I error',
      'The null hypothesis being true',
      'Correctly rejecting H₀ when it is false',
      'Getting p < 0.05',
    ],
    correct: 2,
    explanation: 'Power = probability of detecting a real effect. Higher power means fewer false negatives (Type II errors).',
    xpReward: 20,
  },
  {
    id: 'h5', topic: 'hypothesis',
    text: 'A two-tailed test is appropriate when:',
    options: [
      'We predict the direction of the effect',
      'p < 0.01',
      'We have no directional prediction',
      'The sample is larger than 30',
    ],
    correct: 2,
    explanation: 'Two-tailed tests check both directions (A > B or A < B). Use one-tailed only when theory strongly predicts direction.',
    xpReward: 15,
  },

  // ── Correlation ──────────────────────────────────────────────────────────
  {
    id: 'c1', topic: 'correlation',
    text: "Pearson's r = −0.85 indicates:",
    options: ['Weak positive relationship', 'Weak negative relationship', 'Strong negative relationship', 'No relationship'],
    correct: 2,
    explanation: 'r close to −1 means a strong negative linear relationship. As one variable increases, the other decreases.',
    xpReward: 10,
  },
  {
    id: 'c2', topic: 'correlation',
    text: 'Correlation does NOT imply:',
    options: ['A relationship exists', 'Direction of association', 'Causation', 'Magnitude of association'],
    correct: 2,
    explanation: 'Correlation ≠ causation. Ice cream sales and drowning rates correlate — both are driven by summer heat, a third variable.',
    xpReward: 15,
  },
  {
    id: 'c3', topic: 'correlation',
    text: "The valid range of Pearson's r is:",
    options: ['0 to 1', '0 to 100', '−∞ to +∞', '−1 to +1'],
    correct: 3,
    explanation: 'r is always between −1 (perfect negative) and +1 (perfect positive), with 0 indicating no linear relationship.',
    xpReward: 10,
  },
  {
    id: 'c4', topic: 'correlation',
    text: 'R² = 0.49 means:',
    options: ['r = 0.49', '49% of variance in Y is explained by X', 'p = 0.49', 'The slope is 0.49'],
    correct: 1,
    explanation: 'R² (coefficient of determination) is the proportion of variance in Y explained by the predictor X. Here r = 0.70.',
    xpReward: 20,
  },
  {
    id: 'c5', topic: 'correlation',
    text: 'A spurious correlation is caused by:',
    options: ['Measurement error', 'Small sample size', 'A third confounding variable', 'Non-normality'],
    correct: 2,
    explanation: 'Spurious correlations arise from confounders that affect both variables, creating the illusion of a direct relationship.',
    xpReward: 20,
  },

  // ── Mean ─────────────────────────────────────────────────────────────────
  { id: 'm1', topic: 'mean', text: 'What is the mean of [2, 4, 6, 8, 10]?', options: ['4', '5', '6', '8'], correct: 2, explanation: 'Sum = 30, n = 5, so mean = 30/5 = 6.', xpReward: 10 },
  { id: 'm2', topic: 'mean', text: 'Adding a constant k to every value in a dataset changes the mean by:', options: ['k²', 'k/n', 'k', '0'], correct: 2, explanation: 'Mean shifts by exactly k. Each value increases by k, so their average increases by k.', xpReward: 10 },
  { id: 'm3', topic: 'mean', text: 'Dataset [5,6,7,8,9]. A value of 1000 is added. The mean will:', options: ['Stay the same', 'Decrease slightly', 'Increase dramatically', 'Become the median'], correct: 2, explanation: 'The mean is sensitive to outliers. Adding 1000 pulls the mean from 7 to ~172.', xpReward: 15 },

  // ── Median ────────────────────────────────────────────────────────────────
  { id: 'med1', topic: 'median', text: 'What is the median of [3, 1, 9, 5, 7]?', options: ['3', '5', '7', '9'], correct: 1, explanation: 'Sorted: [1, 3, 5, 7, 9]. Middle value (3rd of 5) = 5.', xpReward: 10 },
  { id: 'med2', topic: 'median', text: 'Why is the median preferred over the mean for household income?', options: ['Easier to calculate', 'Always larger', 'Resistant to outliers', 'Equals the mode'], correct: 2, explanation: 'A few billionaires inflate the mean income. The median is unaffected by extreme high values.', xpReward: 15 },
  { id: 'med3', topic: 'median', text: 'For the dataset [1, 2, 3, 100], the median is:', options: ['3', '2.5', '26.5', '51.5'], correct: 1, explanation: 'Even n=4: average the 2nd and 3rd values = (2+3)/2 = 2.5. The outlier 100 has no effect.', xpReward: 10 },

  // ── Standard Deviation ────────────────────────────────────────────────────
  { id: 'sd1', topic: 'stddev', text: 'Standard deviation measures:', options: ['The center of the data', 'Spread/dispersion around the mean', 'The most frequent value', 'Sample size'], correct: 1, explanation: 'Standard deviation quantifies how spread out data points are from the mean.', xpReward: 10 },
  { id: 'sd2', topic: 'stddev', text: 'Dataset A has SD=10, Dataset B has SD=2. Which is more variable?', options: ['Dataset B', 'Dataset A', 'Equal', 'Cannot determine'], correct: 1, explanation: 'Higher standard deviation = more spread. Dataset A is 5× more variable than Dataset B.', xpReward: 10 },
  { id: 'sd3', topic: 'stddev', text: 'The relationship between variance (s²) and standard deviation (s) is:', options: ['s = s²²', 's = s²/n', 's = √s²', 's = s² + n'], correct: 2, explanation: 'Standard deviation is the square root of variance, returning values to original units.', xpReward: 15 },

  // ── Sampling ──────────────────────────────────────────────────────────────
  { id: 'samp1', topic: 'sampling', text: 'A random sample requires:', options: ['Most convenient participants', 'Equal probability for all population members', 'Exactly 30 participants', 'Only expert participants'], correct: 1, explanation: 'True random sampling gives every population member equal selection probability, minimizing bias.', xpReward: 10 },
  { id: 'samp2', topic: 'sampling', text: 'Larger sample sizes generally produce:', options: ['Less accurate estimates', 'Biased results', 'More accurate estimates', 'Higher variance'], correct: 2, explanation: 'By the Law of Large Numbers, larger samples better approximate population parameters.', xpReward: 10 },
  { id: 'samp3', topic: 'sampling', text: 'Sampling bias occurs when:', options: ['Sample size is small', 'Sample systematically differs from population', 'Mean is not normal', 'Stratified sampling is used'], correct: 1, explanation: 'Bias is systematic error — certain groups are over/under-represented, making results unrepresentative.', xpReward: 15 },

  // ── Regression ────────────────────────────────────────────────────────────
  { id: 'reg1', topic: 'regression', text: 'In Y = β₀ + β₁X + ε, β₁ represents:', options: ['The intercept', 'The error term', 'Slope: change in Y per unit X', 'Mean of Y'], correct: 2, explanation: 'β₁ is the slope: for each 1-unit increase in X, Y changes by β₁ on average.', xpReward: 15 },
  { id: 'reg2', topic: 'regression', text: 'OLS regression minimizes:', options: ['Sum of residuals', 'Sum of squared residuals', 'R²', 'SE of β₁'], correct: 1, explanation: 'OLS finds the line minimizing Σ(yᵢ − ŷᵢ)². Squaring prevents positive/negative errors from canceling.', xpReward: 15 },
  { id: 'reg3', topic: 'regression', text: 'A residual in regression is:', options: ['The predicted value', 'The slope', 'Actual minus predicted (yᵢ − ŷᵢ)', 'The intercept'], correct: 2, explanation: 'Residuals are the unexplained portions. Analyzing them verifies regression assumptions.', xpReward: 10 },

  // ── Confidence Intervals ──────────────────────────────────────────────────
  { id: 'ci1', topic: 'ci', text: 'A 95% confidence interval means:', options: ['95% chance the parameter is here', '95% of such intervals contain the true parameter', 'p < 0.05', 'Margin of error is 5%'], correct: 1, explanation: 'A 95% CI is a procedure: 95% of intervals built this way capture the true population parameter.', xpReward: 20 },
  { id: 'ci2', topic: 'ci', text: 'Increasing sample size (n) while keeping confidence level constant will:', options: ['Widen the interval', 'Narrow the interval', 'Have no effect', 'Change confidence level'], correct: 1, explanation: 'Margin of error = z*(σ/√n). Larger n → smaller SE → narrower, more precise CI.', xpReward: 15 },
  { id: 'ci3', topic: 'ci', text: 'Switching from a 95% CI to a 99% CI:', options: ['Narrows the interval', 'Keeps the same width', 'Widens the interval', 'Makes it exact'], correct: 2, explanation: 'Higher confidence needs a wider net. z* increases from 1.96 (95%) to 2.576 (99%).', xpReward: 15 },

  // ── Binomial ──────────────────────────────────────────────────────────────
  { id: 'bin1', topic: 'binomial', text: 'Binomial distribution requires:', options: ['Continuous outcomes', 'Fixed n, binary outcome, constant p, independent trials', 'Normal data, large n', 'Ranked data only'], correct: 1, explanation: 'Binomial: fixed n trials, binary outcome, constant p, independent trials.', xpReward: 10 },
  { id: 'bin2', topic: 'binomial', text: 'Expected value of Binomial(n=10, p=0.4) is:', options: ['0.4', '4.0', '6.0', '10'], correct: 1, explanation: 'E(X) = n × p = 10 × 0.4 = 4. On average 4 out of 10 trials succeed.', xpReward: 10 },
  { id: 'bin3', topic: 'binomial', text: 'P(exactly 3 heads in 6 fair coin flips) ≈:', options: ['0.5', '0.3125', '0.25', '0.0156'], correct: 1, explanation: 'P = C(6,3) × 0.5³ × 0.5³ = 20 × 0.5⁶ = 20/64 ≈ 0.3125.', xpReward: 15 },
]

// ── Topic Metadata ───────────────────────────────────────────────────────────

export const TOPICS = [
  { id: 'normal' as const,     title: 'Normal Distribution', hebrewTitle: 'התפלגות נורמלית', icon: '🔔', color: 'from-blue-500 to-indigo-600',   borderColor: 'border-blue-400/40',   questions: QUESTION_BANK.filter(q => q.topic === 'normal').length,     unlocked: true },
  { id: 'hypothesis' as const, title: 'Hypothesis Testing',  hebrewTitle: 'מבחני השערות',   icon: '🧪', color: 'from-purple-500 to-violet-600', borderColor: 'border-purple-400/40', questions: QUESTION_BANK.filter(q => q.topic === 'hypothesis').length, unlocked: true },
  { id: 'correlation' as const,title: 'Correlation',         hebrewTitle: 'מתאם',             icon: '📈', color: 'from-emerald-500 to-teal-600',  borderColor: 'border-emerald-400/40',questions: QUESTION_BANK.filter(q => q.topic === 'correlation').length,unlocked: true },
  { id: 'mean' as const,       title: 'Mean',                hebrewTitle: 'ממוצע',            icon: '⚡', color: 'from-yellow-500 to-amber-600',  borderColor: 'border-yellow-400/40', questions: QUESTION_BANK.filter(q => q.topic === 'mean').length,       unlocked: true },
  { id: 'median' as const,     title: 'Median',              hebrewTitle: 'חציון',            icon: '🏠', color: 'from-teal-500 to-cyan-600',     borderColor: 'border-teal-400/40',   questions: QUESTION_BANK.filter(q => q.topic === 'median').length,     unlocked: true },
  { id: 'stddev' as const,     title: 'Std Deviation',       hebrewTitle: 'סטיית תקן',        icon: '🚦', color: 'from-red-500 to-rose-600',      borderColor: 'border-red-400/40',    questions: QUESTION_BANK.filter(q => q.topic === 'stddev').length,     unlocked: true },
  { id: 'sampling' as const,   title: 'Sampling',            hebrewTitle: 'מדגם',             icon: '🏫', color: 'from-purple-400 to-indigo-500', borderColor: 'border-purple-400/40', questions: QUESTION_BANK.filter(q => q.topic === 'sampling').length,   unlocked: true },
  { id: 'regression' as const, title: 'Regression',          hebrewTitle: 'רגרסיה',           icon: '🏦', color: 'from-pink-500 to-rose-600',     borderColor: 'border-pink-400/40',   questions: QUESTION_BANK.filter(q => q.topic === 'regression').length, unlocked: true },
  { id: 'ci' as const,         title: 'Confidence Intervals',hebrewTitle: 'רווח סמך',         icon: '📰', color: 'from-orange-500 to-amber-600',  borderColor: 'border-orange-400/40', questions: QUESTION_BANK.filter(q => q.topic === 'ci').length,         unlocked: true },
  { id: 'binomial' as const,   title: 'Binomial',            hebrewTitle: 'בינום',            icon: '🏛️', color: 'from-red-400 to-pink-600',      borderColor: 'border-red-400/40',    questions: QUESTION_BANK.filter(q => q.topic === 'binomial').length,   unlocked: true },
]

// ── Building Unlock Chain ─────────────────────────────────────────────────────

export const BUILDING_UNLOCK_CHAIN: Record<string, string | null> = {
  power: null,        // Mean — always unlocked
  housing: 'power',   // Median
  traffic: 'housing', // Std Dev
  hospital: 'traffic',// Normal Distribution
  school: 'hospital', // Sampling
  research: 'school', // Hypothesis Testing
  market: 'research', // Correlation
  bank: 'market',     // Regression
  'city-hall': 'bank',// Binomial
  news: 'city-hall',  // Confidence Intervals
  // ── 8 ADVANCED stat-buildings (P4) ───────────────────────────────────────
  // These mirror the advanced landmarks in the Godot building registry
  // (BuildingData.STATS_CATALOG). ids match the Godot stats ids EXACTLY so the
  // Godot bridge (GameState.ADVANCED_TO_BASE) auto-spawns each advanced
  // landmark once its base topic-building reaches level 2. Each `requires`
  // points at the closest existing topic-building so the unlock chain stays
  // coherent and these enter `buildingProgress`/`INITIAL_BUILDING_PROGRESS`.
  zscore:   'hospital', // Z-Score      ← Normal distribution
  variance: 'traffic',  // Variance     ← Std Dev
  iqr:      'housing',  // IQR          ← Median
  pvalue:   'research', // P-Value      ← Hypothesis Testing
  ttest:    'research', // T-Test       ← Hypothesis Testing
  anova:    'research', // ANOVA        ← Hypothesis Testing
  chisq:    'research', // Chi-Square   ← Hypothesis Testing
  clt:      'news',     // CLT          ← Confidence Intervals
}

export interface BuildingProgress {
  level: 0 | 1 | 2  // 0=locked, 1=unlocked (not mastered), 2=mastered
  answeredIds: string[]
  leveledUpAt: number | null
}

const INITIAL_BUILDING_PROGRESS: Record<string, BuildingProgress> = Object.fromEntries(
  Object.keys(BUILDING_UNLOCK_CHAIN).map(id => [
    id,
    { level: id === 'power' ? 1 : 0, answeredIds: [], leveledUpAt: null } as BuildingProgress,
  ])
)

// ── Achievements ──────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: number | null
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_correct',       title: 'First Step',           description: 'Answer your first question correctly',                icon: '⭐', unlockedAt: null },
  { id: 'streak_3',            title: 'On Fire',              description: '3 correct answers in a row',                          icon: '🔥', unlockedAt: null },
  { id: 'streak_5',            title: 'Unstoppable',          description: '5 correct answers in a row',                          icon: '⚡', unlockedAt: null },
  { id: 'topic_normal',        title: 'Bell Curve',           description: 'Complete all Normal Distribution questions',           icon: '🔔', unlockedAt: null },
  { id: 'topic_hypothesis',    title: 'Null Slayer',          description: 'Complete all Hypothesis Testing questions',            icon: '🧪', unlockedAt: null },
  { id: 'topic_correlation',   title: 'Correlation Detective',description: 'Complete all Correlation questions',                   icon: '🕵️', unlockedAt: null },
  { id: 'xp_100',              title: 'Century',              description: 'Earn 100 XP',                                         icon: '💯', unlockedAt: null },
  { id: 'xp_500',              title: 'Scholar',              description: 'Earn 500 XP',                                         icon: '🎓', unlockedAt: null },
  { id: 'first_ttest',         title: 'First T-Test',         description: 'Answer your first hypothesis testing question correctly', icon: '🔬', unlockedAt: null },
  { id: 'distribution_master', title: 'Distribution Master',  description: 'Complete all questions across every topic',            icon: '🏆', unlockedAt: null },
  { id: 'daily_streak_5',      title: '5-Day Streak',         description: 'Study for 5 consecutive days',                        icon: '📅', unlockedAt: null },
  { id: 'first_building',      title: 'City Builder',         description: 'Master your first building',                          icon: '🏗️', unlockedAt: null },
  { id: 'three_buildings',     title: 'Architect',            description: 'Master 3 buildings',                                  icon: '🏛️', unlockedAt: null },
  { id: 'all_buildings',       title: 'Urban Legend',         description: 'Master all 10 buildings',                             icon: '🌆', unlockedAt: null },
]

// ── Persistent Learning Store ─────────────────────────────────────────────────

interface LearningState {
  xp: number
  streak: number
  bestStreak: number
  totalAnswered: number
  totalCorrect: number
  lastStudied: number | null
  studyDays: number
  answeredIds: string[]  // question IDs answered correctly
  achievements: Achievement[]
  newAchievements: Achievement[]  // just-unlocked, for animations

  // SM-2 spaced repetition
  cards: Record<string, CardData>

  // Onboarding
  userName: string
  onboardingCompleted: boolean

  // Daily session streak (separate from answer streak)
  lastSessionDate: string | null  // YYYY-MM-DD
  currentStreak: number           // consecutive days studied
  longestStreak: number           // all-time best daily streak

  // Daily challenge
  dailyChallengeDate: string | null  // YYYY-MM-DD
  dailyChallengeProgress: number     // 0-3 questions completed today

  // Building progression
  buildingProgress: Record<string, BuildingProgress>

  // Lesson reading progress (one entry per topic id read at least once)
  completedLessons: string[]

  // Exam date for risk score calculation (ISO date string YYYY-MM-DD or null)
  examDate: string | null

  // Per-topic target-date overrides for the personal plan (topicId → ISO date
  // YYYY-MM-DD). Default targets are derived on the fly from the plan sequence
  // + examDate; an entry here means the user extended/edited that topic's date
  // (e.g. via "בקש הארכה"). Persisted so extensions survive reloads.
  planTargets: Record<string, string>

  // Mistake Autopsy: latest error tag per question id + aggregate counts
  errorTags: Record<string, string>
  errorTagCounts: Record<string, number>

  // Admin override: when true, gating helpers report all features unlocked
  // regardless of XP / mastery / prerequisite state. Persisted so toggle
  // survives reloads.
  adminMode: boolean

  // Feature progression (see src/config/featureUnlocks.ts).
  // unlockedFeatures: ids the user has unlocked (persisted string[]).
  // newlyUnlocked: queue of ids that just unlocked → UnlockToast drains.
  unlockedFeatures: string[]
  newlyUnlocked: string[]

  // Personal study plan (rule-based, optional). See: personal-plan-spec.md
  personalPlan: PersonalPlan | null
  intakeAnswers: IntakeAnswers | null
  planHistory: { plan: PersonalPlan; answers: IntakeAnswers }[]

  // Actions
  recordAnswer: (questionId: string, correct: boolean, xpReward: number) => void
  recordSM2Answer: (questionId: string, quality: number, xpReward: number) => void
  getNextQuestion: (topic?: string) => Question | null
  getDailyChallenge: () => Question[]
  recordDailyChallengeAnswer: (questionId: string, quality: number) => void
  completeBuildingQuiz: (buildingId: string) => void
  completeLesson: (topicId: string) => void
  clearNewAchievements: () => void
  resetProgress: () => void
  completeOnboarding: (name: string) => void
  /** Switch the active account: reset to defaults + load that user's saved slice. */
  hydrateForUser: (userId: string) => void
  setExamDate: (date: string | null) => void
  // Set an explicit target date (YYYY-MM-DD) for a plan topic. Clamped to
  // examDate when one is set (a target can't fall after the exam).
  setPlanTarget: (topicId: string, date: string) => void
  // Push a plan topic's target date later by `days`, starting from its current
  // (override or derived) target. Capped at examDate. `derivedTarget` is the
  // fallback when no override exists yet (the RiskBoard computes it).
  extendPlanTarget: (topicId: string, days: number, derivedTarget: string) => void
  recordErrorTag: (questionId: string, tag: string) => void
  toggleAdminMode: () => void
  unlockFeature: (id: FeatureId) => void
  clearNewlyUnlocked: (id?: string) => void
  setPersonalPlan: (plan: PersonalPlan, answers: IntakeAnswers) => void
  clearPersonalPlan: () => void
}

// Helper: is a feature unlocked? Admin wins. Features with no rule are
// considered tier 0 (always available).
export function isFeatureUnlocked(state: LearningState, featureId: FeatureId): boolean {
  if (state.adminMode) return true
  if (!FEATURE_UNLOCKS_BY_ID[featureId]) return true
  return state.unlockedFeatures.includes(featureId)
}

// Helper: is a building unlocked for the current user? Admin mode wins.
// Read-only — does not mutate state.
export function isBuildingUnlocked(state: LearningState, buildingId: string): boolean {
  if(state.adminMode) return true
  const prog = state.buildingProgress?.[buildingId]
  return !!prog && prog.level >= 1
}

// ── Per-user persistence ──────────────────────────────────────────────────────
// The store persists to `wafflestack-learning-${activeUserId}` (a USER-AWARE
// key) so XP / unlocks / progress are isolated per account — mirrors arsenalStore
// (`wafflestack-arsenal-v1-${userId}`). `hydrateForUser(userId)` (below) switches
// the active user, resets to defaults, then reloads that user's slice.
let _activeUserId = 'default'
const userAwareStorage = {
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(`${name}-${_activeUserId}`) } catch { return null }
  },
  setItem: (name: string, value: string): void => {
    try { localStorage.setItem(`${name}-${_activeUserId}`, value) } catch { /* quota */ }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(`${name}-${_activeUserId}`) } catch { /* quota */ }
  },
}

// Fresh per-user defaults (new function each call so arrays/objects aren't shared).
const makeLearningDefaults = () => ({
  xp: 0, streak: 0, bestStreak: 0, totalAnswered: 0, totalCorrect: 0, lastStudied: null,
  studyDays: 0, answeredIds: [], achievements: ACHIEVEMENTS, newAchievements: [], cards: {},
  userName: '', onboardingCompleted: false, lastSessionDate: null, currentStreak: 0, longestStreak: 0,
  dailyChallengeDate: null, dailyChallengeProgress: 0, buildingProgress: INITIAL_BUILDING_PROGRESS,
  completedLessons: [], examDate: null, planTargets: {}, adminMode: false, errorTags: {}, errorTagCounts: {},
  unlockedFeatures: [], newlyUnlocked: [], personalPlan: null, intakeAnswers: null, planHistory: [],
})

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      ...makeLearningDefaults(),

      recordAnswer: (questionId, correct, xpReward) => {
        const state = get()
        const now = Date.now()
        const todayStr = new Date().toISOString().slice(0, 10)

        const newStreak = correct ? state.streak + 1 : 0
        const newXp = correct ? state.xp + xpReward : state.xp
        const newAnsweredIds = correct && !state.answeredIds.includes(questionId)
          ? [...state.answeredIds, questionId]
          : state.answeredIds

        // Update daily session streak
        let newCurrentStreak = state.currentStreak
        let newLongestStreak = state.longestStreak
        let newLastSessionDate = state.lastSessionDate
        if (todayStr !== state.lastSessionDate) {
          const yesterday = new Date(now - 86400000).toISOString().slice(0, 10)
          newCurrentStreak = state.lastSessionDate === yesterday ? state.currentStreak + 1 : 1
          newLongestStreak = Math.max(newCurrentStreak, state.longestStreak)
          newLastSessionDate = todayStr
        }

        // Check achievements
        const newlyUnlocked: Achievement[] = []
        const updatedAchievements = state.achievements.map(a => {
          if (a.unlockedAt) return a  // already unlocked
          let unlock = false
          switch (a.id) {
            case 'first_correct': unlock = correct && state.totalCorrect === 0; break
            case 'streak_3': unlock = newStreak >= 3; break
            case 'streak_5': unlock = newStreak >= 5; break
            case 'topic_normal': unlock = QUESTION_BANK.filter(q => q.topic === 'normal').every(q => newAnsweredIds.includes(q.id)); break
            case 'topic_hypothesis': unlock = QUESTION_BANK.filter(q => q.topic === 'hypothesis').every(q => newAnsweredIds.includes(q.id)); break
            case 'topic_correlation': unlock = QUESTION_BANK.filter(q => q.topic === 'correlation').every(q => newAnsweredIds.includes(q.id)); break
            case 'xp_100': unlock = newXp >= 100; break
            case 'xp_500': unlock = newXp >= 500; break
            case 'first_ttest':
              unlock = correct &&
                QUESTION_BANK.find(q2 => q2.id === questionId)?.topic === 'hypothesis' &&
                !state.answeredIds.some(id => QUESTION_BANK.find(q2 => q2.id === id)?.topic === 'hypothesis')
              break
            case 'distribution_master': unlock = QUESTION_BANK.every(q => newAnsweredIds.includes(q.id)); break
            case 'daily_streak_5': unlock = newCurrentStreak >= 5; break
          }
          if (unlock) {
            const unlocked = { ...a, unlockedAt: now }
            newlyUnlocked.push(unlocked)
            return unlocked
          }
          return a
        })

        // Evaluate feature unlocks against the NEW xp / completedLessons.
        const evalState = { xp: newXp, completedLessons: state.completedLessons }
        const earnedFeatures = evaluateUnlocks(evalState)
        const freshFeatures = earnedFeatures.filter(f => !state.unlockedFeatures.includes(f))

        set({
          xp: newXp,
          streak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          totalAnswered: state.totalAnswered + 1,
          totalCorrect: correct ? state.totalCorrect + 1 : state.totalCorrect,
          lastStudied: now,
          answeredIds: newAnsweredIds,
          achievements: updatedAchievements,
          newAchievements: newlyUnlocked,
          lastSessionDate: newLastSessionDate,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          unlockedFeatures: freshFeatures.length
            ? [...state.unlockedFeatures, ...freshFeatures]
            : state.unlockedFeatures,
          newlyUnlocked: freshFeatures.length
            ? [...state.newlyUnlocked, ...freshFeatures]
            : state.newlyUnlocked,
        })
      },

      recordSM2Answer: (questionId, quality, xpReward) => {
        const state = get()
        const existing: CardData = state.cards[questionId] ?? {
          interval: 0, repetitions: 0, easeFactor: 2.5,
          nextReview: 0, lastSeen: null, difficulty: 0,
        }
        const multiplier = getXpMultiplier(existing.interval, quality)
        const adjustedXp = Math.round(xpReward * multiplier)
        const updated = sm2Update(existing, quality)
        set({ cards: { ...state.cards, [questionId]: updated } })
        get().recordAnswer(questionId, quality >= 3, adjustedXp)
      },

      getNextQuestion: (topic?) => {
        const { cards } = get()
        const now = Date.now()
        const pool = topic
          ? QUESTION_BANK.filter(q => q.topic === topic)
          : QUESTION_BANK

        // 1. New cards (never seen)
        const newCards = pool.filter(q => !cards[q.id] || cards[q.id].nextReview === 0)
        if (newCards.length > 0) {
          return newCards[Math.floor(Math.random() * newCards.length)]
        }

        // 2. Due cards (overdue first)
        const due = pool
          .filter(q => cards[q.id] && cards[q.id].nextReview <= now)
          .sort((a, b) => (cards[a.id]?.nextReview ?? 0) - (cards[b.id]?.nextReview ?? 0))
        if (due.length > 0) return due[0]

        // 3. Soonest upcoming
        const upcoming = pool
          .filter(q => cards[q.id] && cards[q.id].nextReview > now)
          .sort((a, b) => (cards[a.id]?.nextReview ?? 0) - (cards[b.id]?.nextReview ?? 0))
        return upcoming[0] ?? null
      },

      getDailyChallenge: () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const seed = todayStr.split('-').reduce((acc, n) => acc * 100 + parseInt(n), 0)
        const seededRand = (i: number) => {
          const x = Math.sin(seed + i) * 10000
          return x - Math.floor(x)
        }
        const shuffled = [...QUESTION_BANK]
          .map((q, i) => ({ q, r: seededRand(i) }))
          .sort((a, b) => a.r - b.r)
          .map(x => x.q)
        return shuffled.slice(0, 3)
      },

      recordDailyChallengeAnswer: (questionId, quality) => {
        const state = get()
        const todayStr = new Date().toISOString().slice(0, 10)
        const isNewDay = state.dailyChallengeDate !== todayStr
        const currentProgress = isNewDay ? 0 : state.dailyChallengeProgress
        if (currentProgress >= 3) return
        const xpReward = 20
        get().recordSM2Answer(questionId, quality, xpReward * 2)
        set({
          dailyChallengeDate: todayStr,
          dailyChallengeProgress: currentProgress + 1,
        })
      },

      completeBuildingQuiz: (buildingId) => {
        const now = Date.now()
        set(state => {
          const updated = { ...state.buildingProgress }
          // Ensure buildingProgress has this building (handle users with old stored state)
          updated[buildingId] = { ...(updated[buildingId] ?? { level: 1, answeredIds: [], leveledUpAt: null }), level: 2, leveledUpAt: now }

          // Unlock the next building in the chain
          const nextId = Object.entries(BUILDING_UNLOCK_CHAIN).find(([, req]) => req === buildingId)?.[0]
          if (nextId && updated[nextId] && updated[nextId].level === 0) {
            updated[nextId] = { ...updated[nextId], level: 1 }
          }

          const masteredCount = Object.values(updated).filter(b => b.level === 2).length
          const newlyUnlocked: Achievement[] = []
          const updatedAchievements = state.achievements.map(a => {
            if (a.unlockedAt) return a
            let unlock = false
            switch (a.id) {
              case 'first_building': unlock = masteredCount >= 1; break
              case 'three_buildings': unlock = masteredCount >= 3; break
              case 'all_buildings': unlock = masteredCount >= 10; break
            }
            if (unlock) { const u = { ...a, unlockedAt: now }; newlyUnlocked.push(u); return u }
            return a
          })

          // Feature-unlock evaluation (state hasn't changed XP here, but a
          // building quiz often runs alongside answers; still re-check in case
          // unlockedFeatures drifted from current state).
          const earnedFeatures = evaluateUnlocks({ xp: state.xp, completedLessons: state.completedLessons })
          const freshFeatures = earnedFeatures.filter(f => !state.unlockedFeatures.includes(f))

          return {
            buildingProgress: updated,
            achievements: updatedAchievements,
            newAchievements: [...state.newAchievements, ...newlyUnlocked],
            unlockedFeatures: freshFeatures.length
              ? [...state.unlockedFeatures, ...freshFeatures]
              : state.unlockedFeatures,
            newlyUnlocked: freshFeatures.length
              ? [...state.newlyUnlocked, ...freshFeatures]
              : state.newlyUnlocked,
          }
        })
      },

      completeLesson: (topicId) => {
        const state = get()
        if (state.completedLessons.includes(topicId)) return
        const newCompleted = [...state.completedLessons, topicId]
        const newXp = state.xp + 5
        const earnedFeatures = evaluateUnlocks({ xp: newXp, completedLessons: newCompleted })
        const freshFeatures = earnedFeatures.filter(f => !state.unlockedFeatures.includes(f))
        set({
          completedLessons: newCompleted,
          xp: newXp,
          unlockedFeatures: freshFeatures.length
            ? [...state.unlockedFeatures, ...freshFeatures]
            : state.unlockedFeatures,
          newlyUnlocked: freshFeatures.length
            ? [...state.newlyUnlocked, ...freshFeatures]
            : state.newlyUnlocked,
        })
      },

      clearNewAchievements: () => set({ newAchievements: [] }),
      resetProgress: () => set({
        xp: 0, streak: 0, bestStreak: 0, totalAnswered: 0, totalCorrect: 0, answeredIds: [],
        achievements: ACHIEVEMENTS, newAchievements: [], cards: {},
        dailyChallengeDate: null, dailyChallengeProgress: 0,
        buildingProgress: INITIAL_BUILDING_PROGRESS,
        completedLessons: [],
      }),
      completeOnboarding: (name: string) => set({ userName: name, onboardingCompleted: true }),

      // Switch the active account: reset to fresh defaults, then load THIS user's
      // persisted slice. New user → 0 XP / no unlocks; returning user → their data.
      hydrateForUser: (userId: string) => {
        const uid = userId || 'default'
        _activeUserId = uid
        // One-time migration: the first account to hydrate after the per-user
        // upgrade inherits the legacy GLOBAL map (so existing progress isn't
        // lost); the legacy key is then consumed so later accounts start clean.
        try {
          const legacy = localStorage.getItem('wafflestack-learning')
          if (legacy) {
            const userKey = `wafflestack-learning-${uid}`
            if (!localStorage.getItem(userKey)) localStorage.setItem(userKey, legacy)
            localStorage.removeItem('wafflestack-learning')
          }
        } catch { /* ignore */ }
        set(makeLearningDefaults())
        void useLearningStore.persist.rehydrate()
      },
      // examDate is NOT reset on resetProgress — it's real-world metadata, not learning state
      setExamDate: (date: string | null) => set({ examDate: date }),

      setPlanTarget: (topicId, date) => {
        const { examDate, planTargets } = get()
        // A target can never fall after the exam.
        const clamped = examDate && date > examDate ? examDate : date
        set({ planTargets: { ...planTargets, [topicId]: clamped } })
      },
      extendPlanTarget: (topicId, days, derivedTarget) => {
        const { examDate, planTargets } = get()
        const base = planTargets[topicId] ?? derivedTarget
        // Add `days` to the current target (YYYY-MM-DD, UTC-safe).
        const dt = new Date(base + 'T00:00:00Z')
        dt.setUTCDate(dt.getUTCDate() + days)
        let next = dt.toISOString().slice(0, 10)
        if (examDate && next > examDate) next = examDate
        set({ planTargets: { ...planTargets, [topicId]: next } })
      },
      recordErrorTag: (questionId: string, tag: string) => {
        const { errorTags, errorTagCounts } = get()
        set({
          errorTags: { ...errorTags, [questionId]: tag },
          errorTagCounts: { ...errorTagCounts, [tag]: (errorTagCounts[tag] ?? 0) + 1 },
        })
      },
      toggleAdminMode: () => {
        const wasAdmin = get().adminMode
        // When turning admin ON, hoist every locked building (level 0) to
        // level 1 so the city + topic gates render unlocked immediately.
        // Existing mastery (level 2) is preserved.
        if(!wasAdmin) {
          const next: Record<string, BuildingProgress> = {}
          for(const [id, p] of Object.entries(get().buildingProgress)) {
            next[id] = { ...p, level: Math.max(p.level, 1) as 0 | 1 | 2 }
          }
          set({ adminMode: true, buildingProgress: next, unlockedFeatures: [...ALL_FEATURE_IDS] })
        } else {
          // Turning admin OFF: recompute unlockedFeatures from REAL XP +
          // completed-lessons state so gates re-engage. Otherwise the array
          // stays at [...ALL_FEATURE_IDS] from when admin was turned on and
          // every feature stays unlocked.
          const s = get()
          const earned = evaluateUnlocks({ xp: s.xp, completedLessons: s.completedLessons })
          set({ adminMode: false, unlockedFeatures: earned })
        }
      },
      unlockFeature: (id) => {
        const state = get()
        if (state.unlockedFeatures.includes(id)) return
        set({
          unlockedFeatures: [...state.unlockedFeatures, id],
          newlyUnlocked: [...state.newlyUnlocked, id],
        })
      },
      clearNewlyUnlocked: (id) => {
        const state = get()
        if (id === undefined) { set({ newlyUnlocked: [] }); return }
        set({ newlyUnlocked: state.newlyUnlocked.filter(x => x !== id) })
      },
      setPersonalPlan: (plan, answers) => {
        const state = get()
        // Archive the previous plan into planHistory (cap at 3 entries).
        const archived = state.personalPlan && state.intakeAnswers
          ? [{ plan: state.personalPlan, answers: state.intakeAnswers }, ...state.planHistory].slice(0, 3)
          : state.planHistory
        set({
          personalPlan: plan,
          intakeAnswers: answers,
          planHistory: archived,
          // A fresh plan invalidates any per-topic target overrides — they were
          // anchored to the previous sequence/exam window.
          planTargets: {},
        })
      },
      clearPersonalPlan: () => set({ personalPlan: null, intakeAnswers: null, planTargets: {} }),
    }),
    {
      name: 'wafflestack-learning',
      storage: createJSONStorage(() => userAwareStorage),
      // After rehydrating, auto-heal stale unlockedFeatures: if admin is OFF
      // but the persisted list contains features the user shouldn't have
      // earned yet (left over from a previous admin-ON session), recompute
      // from real xp + completedLessons. Fixes "locks not engaging after
      // turning admin off" without forcing a re-toggle.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.adminMode) return
        const earned = evaluateUnlocks({ xp: state.xp, completedLessons: state.completedLessons })
        // Only mutate if persisted list contains something it shouldn't.
        const stale = state.unlockedFeatures.some(id => !earned.includes(id as FeatureId))
        if (stale) state.unlockedFeatures = earned
      },
    }
  )
)
