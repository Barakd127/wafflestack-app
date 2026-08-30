import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useLearningStore } from '../store/learningStore'
import { FEATURE_UNLOCKS_BY_ID, isFeatureUnlocked, type FeatureId } from '../config/featureUnlocks'
import PomodoroTimer from './PomodoroTimer'
import FeatureGate from './FeatureGate'
import BoardShell from './BoardShell'
import { useGlassBoard } from '../hooks/useGlassBoard'
import HierarchyBreadcrumb from './HierarchyBreadcrumb'
import { submitHelpRequest, fetchHelpAnswer, hasPendingHelp, emailHelpRequest } from '../lib/helpRequests'
import { toPng } from 'html-to-image'

// Lazy-load interactive graph components (per-topic visualizations).
// Each component is ~300-450 LOC of pure SVG + KaTeX; lazy keeps the bundle
// lean and only ships the graph when the user actually opens that topic.
const MeanInteractive = lazy(() => import('./graphs/MeanInteractive'))
const StdDevInteractive = lazy(() => import('./graphs/StdDevInteractive'))
const CLTInteractive = lazy(() => import('./graphs/CLTInteractive'))
const MedianInteractive = lazy(() => import('./graphs/MedianInteractive'))
const ZScoreInteractive = lazy(() => import('./graphs/ZScoreInteractive'))
const VarianceInteractive = lazy(() => import('./graphs/VarianceInteractive'))
const NormalDistInteractive = lazy(() => import('./graphs/NormalDistributionInteractive'))
const CorrelationInteractive = lazy(() => import('./graphs/CorrelationInteractive'))
const IQRInteractive = lazy(() => import('./graphs/IQRInteractive'))
const RegressionInteractive = lazy(() => import('./graphs/RegressionInteractive'))
const ConfidenceIntervalInteractive = lazy(() => import('./graphs/ConfidenceIntervalInteractive'))
const PValueInteractive = lazy(() => import('./graphs/PValueInteractive'))
const TTestInteractive = lazy(() => import('./graphs/TTestInteractive'))
const BinomialInteractive = lazy(() => import('./graphs/BinomialInteractive'))
const HypothesisTestingInteractive = lazy(() => import('./graphs/HypothesisTestingInteractive'))
const SamplingInteractive = lazy(() => import('./graphs/SamplingInteractive'))
const ANOVAInteractive = lazy(() => import('./graphs/ANOVAInteractive'))
const ChiSquareInteractive = lazy(() => import('./graphs/ChiSquareInteractive'))
const MeanRunningAverage = lazy(() => import('./graphs/MeanRunningAverage'))
const MeanVsMedianVsMode = lazy(() => import('./graphs/MeanVsMedianVsMode'))
const StdDevTwoDistributions = lazy(() => import('./graphs/StdDevTwoDistributions'))
const Normal68_95_99 = lazy(() => import('./graphs/Normal68_95_99'))
const ResidualPlotInteractive = lazy(() => import('./graphs/ResidualPlotInteractive'))
const EffectSizeInteractive = lazy(() => import('./graphs/EffectSizeInteractive'))
const PoissonInteractive = lazy(() => import('./graphs/PoissonInteractive'))
const PercentileInteractive = lazy(() => import('./graphs/PercentileInteractive'))
const BoxplotComparisonInteractive = lazy(() => import('./graphs/BoxplotComparisonInteractive'))
const SimpsonsParadoxInteractive = lazy(() => import('./graphs/SimpsonsParadoxInteractive'))
const BayesTheoremInteractive = lazy(() => import('./graphs/BayesTheoremInteractive'))
const ConditionalProbTreeInteractive = lazy(() => import('./graphs/ConditionalProbTreeInteractive'))
const TypeIErrorInteractive = lazy(() => import('./graphs/TypeIErrorInteractive'))
const RSquaredDecompositionInteractive = lazy(() => import('./graphs/RSquaredDecompositionInteractive'))
const CombinationsVsPermutationsInteractive = lazy(() => import('./graphs/CombinationsVsPermutationsInteractive'))
const LinearTransformationInteractive = lazy(() => import('./graphs/LinearTransformationInteractive'))
const SkewnessKurtosisInteractive = lazy(() => import('./graphs/SkewnessKurtosisInteractive'))
// ── Statistics B — 4 new dedicated simulators (gap topics with no exact prior sim) ──
const ChebyshevInteractive = lazy(() => import('./graphs/ChebyshevInteractive'))
// ── SQL course — 5 dedicated simulators (warehouse-clerk metaphor) ──
const SQLQueryBuilderInteractive = lazy(() => import('./graphs/SQLQueryBuilderInteractive'))
const SQLJoinInteractive = lazy(() => import('./graphs/SQLJoinInteractive'))
const SQLGroupByInteractive = lazy(() => import('./graphs/SQLGroupByInteractive'))
const SQLIndexRaceInteractive = lazy(() => import('./graphs/SQLIndexRaceInteractive'))
const SQLExecutionOrderInteractive = lazy(() => import('./graphs/SQLExecutionOrderInteractive'))
const DummyRegressionInteractive = lazy(() => import('./graphs/DummyRegressionInteractive'))
const InteractionSlopeInteractive = lazy(() => import('./graphs/InteractionSlopeInteractive'))
const LSDHomogeneousInteractive = lazy(() => import('./graphs/LSDHomogeneousInteractive'))
const BlocksAnovaInteractive = lazy(() => import('./graphs/BlocksAnovaInteractive'))
const McNemarInteractive = lazy(() => import('./graphs/McNemarInteractive'))
const PairedSamplesInteractive = lazy(() => import('./graphs/PairedSamplesInteractive'))
const WilcoxonInteractive = lazy(() => import('./graphs/WilcoxonInteractive'))

// Motivation AI components — Atomic Habits / Deep Work primitives.
// Wired into the home screen so the streak + lead-measure are always visible.
import { StreakCalendar } from './motivation/StreakCalendar'
import { LeadMeasureCard } from './motivation/LeadMeasureCard'
import { TwoMinChallengeCard } from './motivation/TwoMinChallengeCard'

// Lazy-load the rotating 3D hero used on the landing page so we can reuse
// it inside the home "כמעט שם" card instead of the static temple PNG.
// HeroScene exports a Canvas; we wrap it in a Suspense + fixed-size div.
const HeroScene = lazy(() => import('../landing/three/HeroScene').then(m => ({ default: m.HeroScene })))

// building_id → array of interactive components, each highlighting a DIFFERENT
// mathematical aspect (not the same concept twice). Cycle button below the
// active graph lets the user step through aspects. 3 hero topics ship with
// 3 aspects each; the other 15 have one entry until more aspects build.
type GraphEntry = {
  Component: React.LazyExoticComponent<React.ComponentType> | React.ComponentType
  title: string
  /** 0-indexed lesson slide to insert AFTER. Undefined/invalid → appended at end. */
  afterSlide?: number
}
const INTERACTIVE_GRAPHS_BY_TOPIC: Record<string, GraphEntry[]> = {
  'anova-multiple-regression': [{ Component: RegressionInteractive, title: 'רגרסיה — קו החיזוי' }],
  'anova-dummy-2': [{ Component: DummyRegressionInteractive, title: 'משתנה דמי — הזזת חותך' }],
  'anova-dummy-multi': [{ Component: DummyRegressionInteractive, title: 'משתני דמי מרובים' }],
  'anova-interaction': [{ Component: InteractionSlopeInteractive, title: 'אינטראקציה — שינוי שיפוע' }],
  'anova-oneway-model': [{ Component: ANOVAInteractive, title: 'ניתוח שונות חד-כיווני' }],
  'anova-oneway-ftest': [{ Component: ANOVAInteractive, title: 'פירוק שונות ומבחן F' }],
  'anova-posthoc': [{ Component: LSDHomogeneousInteractive, title: 'קבוצות הומוגניות — LSD' }],
  'anova-blocks': [{ Component: BlocksAnovaInteractive, title: 'ניתוח שונות עם בלוקים' }],
  // ── SQL course — warehouse-clerk simulators ──
  'sql-select': [
    { Component: SQLQueryBuilderInteractive,   title: 'בונה השאילתות — פתק בקשה חי' },
    { Component: SQLExecutionOrderInteractive, title: 'סדר הביצוע האמיתי' },
  ],
  'sql-where': [
    { Component: SQLQueryBuilderInteractive,   title: 'סינון עם WHERE — נסו בעצמכם' },
  ],
  'sql-order-limit': [
    { Component: SQLQueryBuilderInteractive,   title: 'ORDER BY על טבלה חיה' },
  ],
  'sql-join': [
    { Component: SQLJoinInteractive,           title: 'JOIN — שני פקידים משווים לוחות' },
  ],
  'sql-aggregate': [
    { Component: SQLGroupByInteractive,        title: 'פונקציות סיכום על תאים' },
  ],
  'sql-group-by': [
    { Component: SQLGroupByInteractive,        title: 'GROUP BY + HAVING — קופסאות לתאים' },
  ],
  'sql-subquery-cte': [
    { Component: SQLExecutionOrderInteractive, title: 'המשפך — איפה תת-שאילתה נכנסת' },
  ],
  'sql-index': [
    { Component: SQLIndexRaceInteractive,      title: 'מרוץ האינדקס — קטלוג מול סריקה' },
  ],
  'sql-window': [
    { Component: SQLGroupByInteractive,        title: 'להשוואה: GROUP BY שמכווץ שורות' },
  ],
  // ── Statistics B (סטטיסטיקה ב׳) — native topics; reuse existing sims + 4 new ones ──
  'b-intro': [
    { Component: CLTInteractive,           title: 'טעימה: משפט הגבול המרכזי' },
  ],
  'b-sampling-dist': [
    { Component: SamplingDistribution,     title: 'התפלגות הדגימה — סימולטור' },
    { Component: SamplingInteractive,      title: 'מדגם אקראי מאוכלוסייה' },
    { Component: MeanRunningAverage,       title: 'התכנסות הממוצע' },
  ],
  'b-chebyshev-lln': [
    { Component: ChebyshevInteractive,     title: 'חסם צ׳בישב' },
    { Component: MeanRunningAverage,       title: 'חוק המספרים הגדולים' },
  ],
  'b-clt': [
    { Component: CLTInteractive,           title: 'משפט הגבול המרכזי' },
    { Component: SamplingInteractive,      title: 'ממוצע המדגם' },
    { Component: Normal68_95_99,           title: 'כלל 68-95-99.7' },
  ],
  'b-point-estimation': [
    { Component: SamplingInteractive,      title: 'אומד מתוך מדגם' },
    { Component: MeanRunningAverage,       title: 'עקביות האומד' },
  ],
  'b-confidence-intervals': [
    { Component: ConfidenceIntervalInteractive, title: 'רווחי סמך — כיסוי' },
    { Component: ZScoreInteractive,        title: 'ערכים קריטיים z' },
  ],
  'b-hypothesis-testing': [
    { Component: HypothesisTestingInteractive, title: 'H₀ מול H₁' },
    { Component: PValueInteractive,        title: 'ערך p — אזור דחייה' },
    { Component: TTestInteractive,         title: 'התפלגות t' },
  ],
  'b-errors-power': [
    { Component: TypeIErrorInteractive,    title: 'שגיאות α · β · עוצמה' },
    { Component: HypothesisTestingInteractive, title: 'עוצמת המבחן' },
    { Component: EffectSizeInteractive,    title: 'גודל אפקט (Cohen d)' },
  ],
  'b-interpretation': [
    { Component: PValueInteractive,        title: 'פרשנות ערך p' },
    { Component: ConfidenceIntervalInteractive, title: 'רווח סמך כפרשנות' },
    { Component: EffectSizeInteractive,    title: 'מובהקות מול גודל אפקט' },
  ],
  'b-diff-means': [
    { Component: TTestInteractive,         title: 'מבחן t להפרש תוחלות' },
    { Component: BoxplotComparisonInteractive, title: 'השוואת שתי קבוצות' },
  ],
  'b-paired-samples': [
    { Component: PairedSamplesInteractive, title: 'לפני מול אחרי' },
    { Component: TTestInteractive,         title: 'מבחן t מזווג' },
  ],
  'b-proportion': [
    { Component: BinomialInteractive,      title: 'פרופורציה בינומית' },
    { Component: ConfidenceIntervalInteractive, title: 'רווח סמך לפרופורציה' },
  ],
  'b-variance-test': [
    { Component: ChiSquareInteractive,     title: 'מבחן χ² לשונות' },
    { Component: ANOVAInteractive,         title: 'יחס F בין שונויות' },
  ],
  'b-binomial-chisquare': [
    { Component: ChiSquareInteractive,     title: 'χ² — נצפה מול צפוי' },
    { Component: BinomialInteractive,      title: 'מבחן בינומי' },
  ],
  'b-independence-mcnemar': [
    { Component: ChiSquareInteractive,     title: 'χ² לאי-תלות' },
    { Component: McNemarInteractive,       title: 'מבחן מקנמר (מזווג)' },
  ],
  'b-wilcoxon-fisher': [
    { Component: WilcoxonInteractive,      title: 'וילקוקסון — דירוגים' },
    { Component: HypothesisTestingInteractive, title: 'החלטה א-פרמטרית' },
  ],
  'b-simple-regression': [
    { Component: RegressionInteractive,    title: 'קו רגרסיה (OLS)' },
    { Component: ResidualPlotInteractive,  title: 'תרשים שאריות' },
    { Component: RSquaredDecompositionInteractive, title: 'פירוק R²' },
  ],
  'b-multiple-regression': [
    { Component: RegressionInteractive,    title: 'רגרסיה — מנבא' },
    { Component: RSquaredDecompositionInteractive, title: 'R² מוסבר' },
  ],
  // ── Hero topics — 3 aspects each ──
  power: [
    { Component: MeanInteractive,        title: 'מהו ממוצע?' },
  ],
  traffic: [
    { Component: StdDevInteractive,      title: 'תחומי k·σ' },
    { Component: VarianceInteractive,    title: 'ריבועי סטיות (שונות)' },
    { Component: StdDevTwoDistributions, title: 'שתי התפלגויות' },
  ],
  hospital: [
    { Component: NormalDistInteractive,  title: 'גרירת גבולות' },
    { Component: ZScoreInteractive,      title: 'ציון z + אחוזון' },
    { Component: Normal68_95_99,         title: 'כלל 68-95-99.7' },
    { Component: PercentileInteractive,  title: 'אחוזונים' },
  ],
  // ── Complex topics — multi-aspect via reuse of related components ──
  housing: [
    { Component: MedianInteractive,        title: 'חציון מול ממוצע' },
    { Component: IQRInteractive,           title: 'טווח רבעוני (IQR)' },
  ],
  school: [
    { Component: SamplingInteractive,      title: 'מדגם אקראי' },
    { Component: MeanRunningAverage,       title: 'התכנסות הממוצע' },
    { Component: CLTInteractive,           title: 'מ-מדגם ל-CLT' },
  ],
  bank: [
    { Component: RegressionInteractive,    title: 'רגרסיה OLS' },
    { Component: CorrelationInteractive,   title: 'קורלציה (Pearson)' },
    { Component: ConfidenceIntervalInteractive, title: 'אמינות הקו' },
    { Component: ResidualPlotInteractive,  title: 'תרשים שאריות' },
  ],
  market: [
    { Component: CorrelationInteractive,   title: 'מקדם Pearson' },
    { Component: RegressionInteractive,    title: 'מקורלציה לרגרסיה' },
    { Component: SimpsonsParadoxInteractive, title: 'פרדוקס סימפסון' },
  ],
  'city-hall': [
    { Component: BinomialInteractive,      title: 'התפלגות בינומית' },
    { Component: NormalDistInteractive,    title: 'קירוב נורמלי לבינומית' },
    { Component: PoissonInteractive,       title: 'פואסון — λ גדל' },
  ],
  research: [
    { Component: HypothesisTestingInteractive, title: 'α · β · עוצמה' },
    { Component: PValueInteractive,        title: 'ערך p — אזורי דחייה' },
    { Component: ConfidenceIntervalInteractive, title: 'CI ↔ מבחן השערה' },
    { Component: EffectSizeInteractive,    title: 'גודל אפקט — Cohen d' },
  ],
  news: [
    { Component: ConfidenceIntervalInteractive, title: 'רווחי סמך' },
    { Component: Normal68_95_99,           title: 'כלל 68-95-99.7' },
  ],
  zscore: [
    { Component: ZScoreInteractive,        title: 'ציון z + אחוזון' },
    { Component: Normal68_95_99,           title: 'איפה z נופל בעקומה?' },
  ],
  pvalue: [
    { Component: PValueInteractive,        title: 'ערך p — שטח מתחת לעקומה' },
    { Component: HypothesisTestingInteractive, title: 'p לעומת α' },
  ],
  anova: [
    { Component: ANOVAInteractive,         title: 'F = MSB / MSW' },
    { Component: TTestInteractive,         title: 't² = F (2 קבוצות)' },
  ],
  ttest: [
    { Component: TTestInteractive,         title: 'התפלגות t' },
    { Component: ZScoreInteractive,        title: 't → z (df גדול)' },
  ],
  variance: [
    { Component: VarianceInteractive,      title: 'ריבועי סטיות' },
    { Component: StdDevInteractive,        title: 'σ² → σ (שורש)' },
  ],
  chisq: [
    { Component: ChiSquareInteractive,     title: 'χ² נצפה מול צפוי' },
    { Component: HypothesisTestingInteractive, title: 'χ² בתוך מבחן השערה' },
  ],
  iqr: [
    { Component: IQRInteractive,           title: 'Boxplot + חריגות' },
    { Component: MedianInteractive,        title: 'חציון בליבה של IQR' },
    { Component: BoxplotComparisonInteractive, title: 'השוואת קבוצות' },
  ],
  clt: [
    { Component: CLTInteractive,           title: 'משפט הגבול המרכזי' },
    { Component: SamplingInteractive,      title: 'מדגום ל-CLT' },
    { Component: MeanRunningAverage,       title: 'LLN — חוק המספרים הגדולים' },
  ],

  // ── Topic-ID keys (match quiz-bank.json / lesson-content.ts IDs). The
  // LessonScreen / InteractiveGraphCarousel receives a TOPIC ID (e.g. "mean",
  // "regression"), NOT a building ID. Without these entries the carousel was
  // looking up "mean" against a map keyed by "power" and finding nothing —
  // that's why users repeatedly asked "where are the graphs?". Each topic-id
  // key reuses the corresponding building-id list, then adds new deep-dive
  // components for hard topics (Bayes, Type-I/II, R² decomposition, etc.).
  // ──────────────────────────────────────────────────────────────────────
  mean: [
    { Component: MeanInteractive,        title: 'מהו ממוצע? (גרור נקודות)', afterSlide: 1 },
    { Component: MeanVisual, title: 'משחק כיתה — סרגלי ציון', afterSlide: 2 },
  ],
  median: [
    { Component: MedianInteractive,      title: 'חציון מול ממוצע' },
    { Component: IQRInteractive,         title: 'טווח רבעוני (IQR)' },
    { Component: MeanVsMedianVsMode,     title: 'ממוצע · חציון · שכיח' },
  ],
  'std-dev': [
    { Component: StdDevInteractive,      title: 'תחומי k·σ' },
    { Component: VarianceInteractive,    title: 'ריבועי סטיות (שונות)' },
    { Component: StdDevTwoDistributions, title: 'שתי התפלגויות' },
  ],
  probability: [
    { Component: BayesTheoremInteractive,        title: 'משפט בייס' },
    { Component: ConditionalProbTreeInteractive, title: 'הסתברות מותנית — עץ' },
    { Component: BinomialInteractive,             title: 'התפלגות בינומית' },
  ],
  binomial: [
    { Component: BinomialInteractive,    title: 'התפלגות בינומית' },
    { Component: NormalDistInteractive,  title: 'קירוב נורמלי לבינומית' },
    { Component: PoissonInteractive,     title: 'פואסון — λ גדל' },
  ],
  correlation: [
    { Component: CorrelationInteractive,     title: 'מקדם Pearson' },
    { Component: RegressionInteractive,      title: 'מקורלציה לרגרסיה' },
    { Component: SimpsonsParadoxInteractive, title: 'פרדוקס סימפסון' },
  ],
  regression: [
    { Component: RegressionInteractive,           title: 'רגרסיה OLS' },
    { Component: RSquaredDecompositionInteractive, title: 'R² — פירוק SST=SSE+SSR' },
    { Component: ResidualPlotInteractive,         title: 'תרשים שאריות' },
    { Component: ConfidenceIntervalInteractive,   title: 'אמינות הקו' },
  ],
  'hypothesis-testing': [
    { Component: HypothesisTestingInteractive, title: 'α · β · עוצמה' },
    { Component: TypeIErrorInteractive,        title: 'שגיאה I/II + Power' },
    { Component: PValueInteractive,            title: 'ערך p — אזורי דחייה' },
    { Component: EffectSizeInteractive,        title: 'גודל אפקט — Cohen d' },
  ],
  // X'd by user: sampling, confidence-intervals, intro, variable-types — no
  // carousel for those topics.
  'data-presentation': [
    { Component: BoxplotComparisonInteractive, title: 'Boxplot — השוואת קבוצות' },
    { Component: IQRInteractive,               title: 'IQR + חריגות' },
  ],
  'distribution-shapes': [
    { Component: SkewnessKurtosisInteractive, title: 'Skew & Kurtosis' },
    { Component: NormalDistInteractive,       title: 'התפלגות נורמלית' },
    { Component: MeanVsMedianVsMode,          title: 'מיקום מדדים בהתפלגויות אסימטריות' },
  ],
  'weighted-combined': [
    { Component: MeanInteractive,    title: 'ממוצע משוקלל' },
    { Component: VarianceInteractive, title: 'שונות מצורפת' },
  ],
  'observation-changes': [
    { Component: MeanInteractive,    title: 'השפעת תצפית בודדת על הממוצע' },
    { Component: MedianInteractive,  title: 'חוסן החציון' },
  ],
  'linear-transformations': [
    { Component: LinearTransformationInteractive, title: 'Y = aX + b' },
    { Component: ZScoreInteractive,               title: 'תקנון Z — מקרה פרטי' },
  ],
  percentiles: [
    { Component: PercentileInteractive, title: 'אחוזונים' },
    { Component: ZScoreInteractive,     title: 'ציון z + אחוזון' },
    { Component: Normal68_95_99,        title: 'אחוזונים במונחי σ' },
  ],
  combinatorics: [
    { Component: CombinationsVsPermutationsInteractive, title: 'צירופים מול חליפות' },
    { Component: BinomialInteractive,                   title: 'נוסחת הבינום בפעולה' },
  ],
  'discrete-rv': [
    { Component: BinomialInteractive, title: 'בינומית — דוגמה לבדיד' },
    { Component: PoissonInteractive,  title: 'פואסון — λ' },
  ],
  pearson: [
    { Component: CorrelationInteractive,     title: 'Pearson r' },
    { Component: RegressionInteractive,      title: 'r → b (שיפוע)' },
    { Component: SimpsonsParadoxInteractive, title: 'פרדוקס סימפסון' },
  ],
  spearman: [
    { Component: CorrelationInteractive, title: 'מתאם דרגות' },
  ],
  cramer: [
    { Component: ChiSquareInteractive, title: 'χ² — בסיס ל-Cramér' },
  ],
}

// Carousel: shows one graph at a time + chip selector + "הבא ←" cycle button.
// Resets graphIdx to 0 whenever selectedTopic changes.
function InteractiveGraphCarousel({ selectedTopic }: { selectedTopic: string }) {
  const graphs = INTERACTIVE_GRAPHS_BY_TOPIC[selectedTopic] || []
  const [graphIdx, setGraphIdx] = useState(0)
  useEffect(() => { setGraphIdx(0) }, [selectedTopic])
  if (graphs.length === 0) return null
  const Active = graphs[graphIdx]?.Component
  if (!Active) return null
  return (
    <div dir="rtl" style={{ width: '100%', marginTop: 24 }}>
      {/* Prominent section header — makes the carousel feel like its own block,
          not a continuation of the lesson. Addresses 5x repeated "where are
          the new graphs?" — they were buried below LessonScreen. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        margin: '0 auto 14px', maxWidth: 720,
        padding: '12px 18px',
        background: 'linear-gradient(135deg, rgba(245,200,66,0.18), rgba(212,175,55,0.10))',
        border: '1px solid rgba(212,175,55,0.5)',
        borderRadius: 14,
        boxShadow: '0 2px 12px rgba(212,175,55,0.18)',
      }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Rubik', sans-serif", color: 'var(--sh-text-dark)' }}>
            גרפים אינטראקטיביים — {graphs.length} {graphs.length === 1 ? 'היבט' : 'היבטים'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sh-text-med)', marginTop: 2 }}>
            לחץ על הצ'יפים מטה כדי לעבור בין היבטי הנושא
          </div>
        </div>
      </div>
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>טוען גרף אינטראקטיבי…</div>}>
        <Active />
      </Suspense>
      {graphs.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', margin: '8px auto 24px', maxWidth: 700,
        }}>
          {graphs.map((g, i) => (
            <button key={i} onClick={() => setGraphIdx(i)}
              style={{
                background: i === graphIdx ? 'linear-gradient(135deg, #F5C842, #D4AF37)' : 'rgba(31,62,108,0.08)',
                color: i === graphIdx ? '#0B1B3E' : 'var(--sh-text-dark)',
                border: '1px solid ' + (i === graphIdx ? '#D4AF37' : 'rgba(31,62,108,0.15)'),
                padding: '6px 14px', borderRadius: 20,
                fontWeight: i === graphIdx ? 700 : 500,
                fontSize: 13, fontFamily: "'Rubik', sans-serif",
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {g.title}
            </button>
          ))}
          <button onClick={() => setGraphIdx((graphIdx + 1) % graphs.length)}
            style={{
              background: 'var(--sh-btn-color)', color: '#fff', border: 0,
              padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13,
              fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
              boxShadow: '0 2px 6px #8DA7FF',
            }}>
            הבא ←
          </button>
        </div>
      )}
    </div>
  )
}
import { initializeUser, getCurrentUser, loginUser, registerUser, logoutUser, onAuthStateChange, type User } from '../stores/authStore'
import { loadProgress, recordQuizSession, saveCanvasNotes, saveProgress, type QuizAnswer, type UserProgress } from '../stores/progressStore'
import { loadProgressMerged } from '../lib/syncProgress'
import quizBankData from '../data/quiz-bank.json'
import LessonScreen from './LessonScreen'
import { LESSON_CONTENT } from '../data/lesson-content'
import { LESSON_CONTENT_STAT_B } from '../data/lesson-content-stat-b'
import { LESSON_CONTENT_SQL } from '../data/lesson-content-sql'
import { LESSON_CONTENT_ANOVA } from '../data/lesson-content-anova'
import { HEBREW_LABELS } from '../data/topicLabels'
import { TOPIC_ORDER } from '../lib/generatePlan'
import { MathText } from '../lib/mathRender'
import { MeanVisual } from './LessonVisuals'
import SamplingDistribution from './SamplingDistribution'
import ArsenalScreen, { normalizeMathGlyphs } from './ArsenalScreen'
import DrawingScreen from './DrawingScreen'
import { useArsenalStore, quickAddArsenal, looksLikeMath, serializeEquation } from '../store/arsenalStore'
import PotionInventory from './PotionInventory'
import { useTutorialStep } from '../hooks/useTutorialStep'
import { useTutorialStore } from '../store/tutorialStore'
import { useTutorStore } from '../store/tutorStore'
import { registerTourAction, tourStepIds } from './CoachmarkTour'
import TourLauncher from './TourLauncher'
import Tooltip from './Tooltip'
import Ribbon from './Ribbon'
import { RiskBoard } from './RiskBoard'
import MistakeAutopsy, { type ErrorTag } from './MistakeAutopsy'
import PersonalPlanWizard from './PersonalPlanWizard'
import IntroTutorialVideo from './IntroTutorialVideo'
import LearningInsights from './LearningInsights'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d' | 'drawing') => void
  darkMode?: boolean
  /** When provided, StudyHub renders a dark-mode toggle inside its TopBar
   *  (per user 2026-05-24). The parent App.tsx is then responsible for
   *  hiding any duplicate floating toggle. */
  onToggleDarkMode?: () => void
  onLoggedIn?: () => void
  onLoggedOut?: () => void
}

type InternalView = 'home' | 'learning' | 'courses' | 'topics' | 'lesson' | 'quiz-intro' | 'arsenal' | 'complete'

// 4 stat courses for the gate screen. Only 'stat-a' is active right now;
// the rest show a "Coming soon" splash. The folder labels live here as the
// single source of truth — UI + future analytics can reference COURSES[].
interface CourseDef {
  id: 'stat-a' | 'stat-b' | 'methods' | 'anova' | 'sql'
  label: string
  icon: string                   // emoji shown on the card
  desc: string
  active: boolean
  bg: string                     // tile gradient
  /** If set, course opens an external page in a fullscreen iframe. */
  embedUrl?: string
  /** If set, course is a self-hosted static page opened in a new tab
   *  (page owns its layout/i18n, so the RTL app shell stays out of its way). */
  pageUrl?: string
}
const COURSES: CourseDef[] = [
  { id: 'stat-a',  label: "סטטיסטיקה א'",        icon: '📊', desc: 'מבוא, מדדים, התפלגויות, רגרסיה, הסתברות',  active: true,  bg: 'linear-gradient(135deg,#F5C842,#D4AF37)' },
  { id: 'stat-b',  label: "סטטיסטיקה ב'",        icon: '📈', desc: 'דגימה, אמידה, רווחי סמך, בדיקת השערות, א-פרמטריים, רגרסיה', active: true,  bg: 'linear-gradient(135deg,#7CB7F8,#4A90E2)' },
  { id: 'methods', label: 'שיטות מחקר',          icon: '🔬', desc: 'תכנון מחקר, מדידה, מהימנות ותקפות',         active: false, bg: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { id: 'anova',   label: 'ניתוח שונות ורגרסיה', icon: '📐', desc: 'רגרסיה מרובה, משתני דמי, ANOVA חד-כיווני, השוואות מרובות ובלוקים', active: true, bg: 'linear-gradient(135deg,#67C29E,#229E69)' },
  { id: 'sql',     label: 'SQL — שפת מסדי נתונים',  icon: '🗄️', desc: 'שאילתות, JOIN, אינדקסים ופונקציות חלון — במטאפורת מחסן, עם סימולטורים וחידונים', active: true, bg: 'linear-gradient(135deg,#F0B429,#C97C18)' },
]

// Course icons follow the sidebar icon language (see Sidebar renderIcon):
// stroke-only line SVGs, viewBox 24, 1.8 stroke, round caps, currentColor.
// Each mark is bespoke to the course content rather than a stock glyph —
// stat-a: histogram with a normal curve rising over it; stat-b: bell curve
// with a dashed mean and a confidence-interval bracket; methods: checklist
// sheet under a magnifier; anova: three groups as vertical 3-point columns
// (one x per group, means rising) on axes; sql: data cylinder (warehouse).
function CourseIcon({ id, size = 30 }: { id: CourseDef['id']; size?: number }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (id) {
    case 'stat-a':
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M5.5 20v-5h3.2v5" />
          <path d="M10.4 20v-9h3.2v9" />
          <path d="M15.3 20v-6.5h3.2v6.5" />
          <path d="M3.5 15.5C7 14.5 8.5 4.5 12 4.5s5 10 8.5 11" />
        </svg>
      )
    case 'stat-b':
      return (
        <svg {...common}>
          <path d="M3 16.5c3.6 0 4.8-11 9-11s5.4 11 9 11" />
          <path d="M12 6.5v10" strokeDasharray="0.5 3" />
          <path d="M6.5 21h11" />
          <path d="M6.5 19.3v3.4" />
          <path d="M17.5 19.3v3.4" />
        </svg>
      )
    case 'methods':
      return (
        <svg {...common}>
          <path d="M6 3.5h9a1.5 1.5 0 0 1 1.5 1.5v4.5" />
          <path d="M6 3.5A1.5 1.5 0 0 0 4.5 5v12A1.5 1.5 0 0 0 6 18.5h4" />
          <path d="M7.5 8h6" />
          <path d="M7.5 11.5h4" />
          <circle cx="15.5" cy="15.5" r="4" />
          <path d="M18.5 18.5l3 3" />
        </svg>
      )
    case 'anova':
      return (
        <svg {...common}>
          <path d="M4 4.5V20h16" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="12.9" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.8" cy="15.3" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="5.6" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'sql':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5.5" rx="7" ry="2.6" />
          <path d="M5 5.5v13c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6v-13" />
          <path d="M5 10c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" />
          <path d="M5 14.4c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" />
        </svg>
      )
  }
}

// Hebrew labels for each topic now live in ../data/topicLabels (shared with
// PersonalPlanWizard). Imported at top of file as HEBREW_LABELS.

// Extract topics from quiz-bank data
// Build the topic picker from BOTH quiz-bank.json AND lesson-content.ts so
// lesson-only topics (no quiz yet) still show up. quiz-bank entries take
// precedence (they have building / concept / question metadata); lesson-only
// topics come last with questionCount=0 so the UI can label them as
// "תיאוריה בלבד" if desired.
const QUIZ_TOPICS = (() => {
  const quizEntries = Object.entries(quizBankData.topics || {}).map(([key, data]: [string, any]) => ({
    id: key,
    label: HEBREW_LABELS[key] || data.concept || key,
    building: data.building || '',
    concept: data.concept || key,
    questionCount: (data.questions || []).length,
  }))
  const quizIds = new Set(quizEntries.map(e => e.id))
  const lessonOnly = LESSON_CONTENT
    .filter(l => !quizIds.has(l.id))
    .map(l => ({
      id: l.id,
      label: HEBREW_LABELS[l.id] || l.hebrewName,
      building: '',
      concept: l.hebrewName,
      questionCount: 0,
    }))
  return [...quizEntries, ...lessonOnly]
})()

// ── Statistics B topic sets ───────────────────────────────────────────────────
// Keep the two courses' topic lists disjoint so neither course's grid ever shows
// the other's topics (the "נוספים" catch-all in TopicSelector would otherwise leak
// b-* topics into Stat-A). QUIZ_TOPICS_A = everything that is NOT a Stat-B id;
// QUIZ_TOPICS_B is built straight from the Stat-B lesson list (labels from the
// lesson hebrewName), pulling questionCount/building from quiz-bank when present.
const STAT_B_IDS = new Set(LESSON_CONTENT_STAT_B.map(t => t.id))
const SQL_IDS = new Set(LESSON_CONTENT_SQL.map(t => t.id))
const ANOVA_IDS = new Set(LESSON_CONTENT_ANOVA.map(t => t.id))
const QUIZ_TOPICS_A = QUIZ_TOPICS.filter(t => !STAT_B_IDS.has(t.id) && !SQL_IDS.has(t.id) && !ANOVA_IDS.has(t.id))
const QUIZ_TOPICS_B = LESSON_CONTENT_STAT_B.map(l => {
  const q = (quizBankData.topics as Record<string, any>)[l.id]
  return {
    id: l.id,
    label: HEBREW_LABELS[l.id] || l.hebrewName,
    building: q?.building || '',
    concept: l.hebrewName,
    questionCount: (q?.questions || []).length,
  }
})

// SQL course topic set — built from the SQL lesson list, same pattern as Stat-B.
const QUIZ_TOPICS_SQL = LESSON_CONTENT_SQL.map(l => {
  const q = (quizBankData.topics as Record<string, any>)[l.id]
  return {
    id: l.id,
    label: HEBREW_LABELS[l.id] || l.hebrewName,
    building: q?.building || '',
    concept: l.hebrewName,
    questionCount: (q?.questions || []).length,
  }
})

// ANOVA course topic set — built from the ANOVA lesson list, same pattern as SQL.
const QUIZ_TOPICS_ANOVA = LESSON_CONTENT_ANOVA.map(l => {
  const q = (quizBankData.topics as Record<string, any>)[l.id]
  return {
    id: l.id,
    label: HEBREW_LABELS[l.id] || l.hebrewName,
    building: q?.building || '',
    concept: l.hebrewName,
    questionCount: (q?.questions || []).length,
  }
})

// ── Topic taxonomy — parent groups → subtopics ────────────────────────────────
// Clusters the ~23 flat topics into 7 parent "topics" so the תיאוריה selector
// reads as topic → subtopic (e.g. ממוצע/חציון under מדדי מרכז). Subtopic order
// follows the canonical TOPIC_ORDER. Any topic NOT listed here falls into a
// "נוספים" catch-all so nothing is ever hidden. Per user 2026-06-07.
interface TopicGroup { id: string; labelHe: string; emoji: string; topicIds: string[] }
const TOPIC_GROUPS: TopicGroup[] = [
  { id: 'intro',        labelHe: 'מבוא',           emoji: '🚪', topicIds: ['intro', 'variable-types'] },
  { id: 'central',      labelHe: 'מדדי מרכז',      emoji: '🎯', topicIds: ['mean', 'median', 'weighted-combined'] },
  { id: 'spread',       labelHe: 'מדדי פיזור',     emoji: '📏', topicIds: ['std-dev', 'observation-changes', 'linear-transformations', 'percentiles'] },
  { id: 'presentation', labelHe: 'הצגת נתונים',    emoji: '📊', topicIds: ['data-presentation', 'distribution-shapes'] },
  { id: 'probability',  labelHe: 'הסתברות',        emoji: '🎲', topicIds: ['probability', 'combinatorics', 'discrete-rv', 'binomial'] },
  { id: 'inference',    labelHe: 'הסקה סטטיסטית',  emoji: '🔬', topicIds: ['sampling', 'hypothesis-testing', 'confidence-intervals'] },
  { id: 'association',  labelHe: 'קשר בין משתנים', emoji: '🔗', topicIds: ['correlation', 'pearson', 'spearman', 'cramer', 'regression'] },
]

// Statistics B taxonomy — 5 units matching the source curriculum order.
const TOPIC_GROUPS_B: TopicGroup[] = [
  { id: 'b-limits',      labelHe: 'דגימה ומשפטי גבול',        emoji: '🎲', topicIds: ['b-intro', 'b-sampling-dist', 'b-chebyshev-lln', 'b-clt'] },
  { id: 'b-inference',   labelHe: 'אמידה ובדיקת השערות',       emoji: '🔬', topicIds: ['b-point-estimation', 'b-confidence-intervals', 'b-hypothesis-testing', 'b-errors-power', 'b-interpretation'] },
  { id: 'b-advanced',    labelHe: 'רווחי סמך והשוואות מתקדמות', emoji: '⚖️', topicIds: ['b-diff-means', 'b-paired-samples', 'b-proportion', 'b-variance-test'] },
  { id: 'b-nonparam',    labelHe: 'מבחנים א-פרמטריים',          emoji: '📋', topicIds: ['b-binomial-chisquare', 'b-independence-mcnemar', 'b-wilcoxon-fisher'] },
  { id: 'b-regression',  labelHe: 'רגרסיה',                    emoji: '📈', topicIds: ['b-simple-regression', 'b-multiple-regression'] },
]

// SQL course taxonomy — 3 units: request-slip basics, advanced queries, design & speed.
const TOPIC_GROUPS_SQL: TopicGroup[] = [
  { id: 'sql-basics',   labelHe: 'פתקי בקשה — יסודות',       emoji: '✏️', topicIds: ['sql-select', 'sql-where', 'sql-order-limit', 'sql-null'] },
  { id: 'sql-advanced', labelHe: 'שאילתות מתקדמות',           emoji: '🔍', topicIds: ['sql-join', 'sql-aggregate', 'sql-group-by', 'sql-subquery-cte'] },
  { id: 'sql-design',   labelHe: 'עיצוב המחסן וביצועים',      emoji: '🗂️', topicIds: ['sql-dml', 'sql-create-constraints', 'sql-index', 'sql-window'] },
]

const TOPIC_GROUPS_ANOVA: TopicGroup[] = [
  { id: 'anova-regression',   labelHe: 'רגרסיה מרובה ומשתני דמי', emoji: '📈', topicIds: ['anova-multiple-regression', 'anova-dummy-2', 'anova-dummy-multi', 'anova-interaction'] },
  { id: 'anova-oneway',       labelHe: 'ניתוח שונות חד-כיווני',   emoji: '📊', topicIds: ['anova-oneway-model', 'anova-oneway-ftest', 'anova-posthoc'] },
  { id: 'anova-blocks-unit',  labelHe: 'מודלים עם בלוקים',        emoji: '🧱', topicIds: ['anova-blocks'] },
]

// ── Design tokens — driven by CSS custom properties for dark/light mode ────────
const PAGE_BG       = 'var(--sh-page-bg)'
const SIDEBAR_BG    = 'var(--sh-sidebar-bg)'
const SIDEBAR_ACTIVE = 'var(--sh-sidebar-active)'
const GLASS_CARD    = 'var(--sh-glass-card)'
const GLASS_CARD_SM = 'var(--sh-glass-card-sm)'
const CARD_SHADOW   = 'var(--sh-card-shadow)'
const CARD_RADIUS   = 24
const BUTTON_COLOR  = 'var(--sh-btn-color)'
const TEXT_DARK     = 'var(--sh-text-dark)'
const TEXT_MED      = 'var(--sh-text-med)'
const TEXT_LIGHT    = 'var(--sh-text-light)'
const TEXT_TIP      = 'var(--sh-text-tip)'

// ── Login / Register Screen ────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreedIP, setAgreedIP] = useState(false)
  const existingUsers: User[] = []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await loginUser(username, password)
        if (result) {
          onLogin(result)
        } else {
          setError('שם משתמש או סיסמה שגויים')
        }
      } else {
        if (!agreedIP) {
          setError('יש לאשר שהתוכן והמערכת הם קניין רוחני של ברק דקר כדי להמשיך')
          return
        }
        const result = await registerUser(username, password, displayName)
        if (typeof result === 'string') {
          setError(result)
        } else {
          onLogin(result)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (_userId: string) => {
    // Not available with Supabase — panel never renders (existingUsers is always empty)
  }

  return (
    <div dir="rtl" style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(145deg, #c8dcff 0%, #d6e8ff 35%, #e8f0ff 65%, #bdd4ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Rubik', 'Assistant', sans-serif",
      position: 'fixed', inset: 0, overflow: 'auto',
    }}>
      {/* Ambient glow blobs behind the card */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(51,81,202,0.18) 0%, transparent 70%)', top: '10%', right: '15%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(131,178,248,0.22) 0%, transparent 70%)', bottom: '15%', left: '20%', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 900, padding: 24, display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

        {/* Auth card — liquid glass */}
        <div className="ws-glass-card" style={{
          flex: 1,
          borderRadius: 28,
          padding: '40px 44px',
        }}>
          {/* Logo — Kenney city image */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <img
                src="/high-tech.png"
                alt="WaffleStack city"
                width={180}
                height={120}
                style={{
                  borderRadius: 14,
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  boxShadow: '0 4px 16px rgba(31,62,108,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              />
            </div>
            <div style={{ fontWeight: 800, fontSize: 26, color: '#1F3E6C' }}>WaffleStack</div>
            <div style={{ fontSize: 13, color: '#7F9BD9', marginTop: 4 }}>פלטפורמת למידה לסטטיסטיקה</div>
          </div>

          {/* Mode tabs — glass pill */}
          <div style={{ display: 'flex', borderRadius: 14, background: 'rgba(31,62,108,0.07)', padding: 4, marginBottom: 24, gap: 4, backdropFilter: 'blur(8px)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={mode === m ? 'ws-cta-btn' : ''}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  background: mode === m ? 'linear-gradient(135deg,#1F3E6C,#254A9F)' : 'transparent',
                  border: mode === m ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  color: mode === m ? '#fff' : '#1F3E6C',
                  fontWeight: 600, fontSize: 14,
                  boxShadow: mode === m ? '0 4px 14px rgba(31,62,108,0.3), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
                  transition: 'all 0.2s',
                  fontFamily: "'Rubik', sans-serif",
                }}>
                {m === 'login' ? '🔑 כניסה' : '✨ הרשמה'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>שם מלא</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(196,220,255,0.8)', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s' }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>שם משתמש</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="username"
                autoComplete="username"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(196,220,255,0.8)', borderRadius: 12, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C', direction: 'ltr', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#7F9BD9', fontWeight: 600, display: 'block', marginBottom: 5 }}>סיסמה</label>
              <input value={password} onChange={e => setPassword(e.target.value)} required
                type="password" placeholder="••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(196,220,255,0.8)', borderRadius: 12, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F3E6C', direction: 'ltr', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s' }} />
            </div>
            {mode === 'register' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#5b6f93', lineHeight: 1.5, textAlign: 'right' }}>
                <input
                  type="checkbox"
                  checked={agreedIP}
                  onChange={e => setAgreedIP(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: '#254A9F', flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  אני מאשר/ת שאני יודע/ת שהתוכן, התרגילים והמערכת הם <b style={{ color: '#1F3E6C' }}>קניין רוחני של ברק דקר</b> — ואין להעתיק, לשכפל או להפיץ ללא אישור בכתב.
                </span>
              </label>
            )}
            {error && <div style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.3)', borderRadius: 10, padding: '10px 14px', color: '#d32f2f', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <button type="submit" disabled={loading || (mode === 'register' && !agreedIP)}
              className="ws-cta-btn"
              style={{
                marginTop: 6, padding: '14px 0',
                background: 'linear-gradient(135deg,#1F3E6C,#254A9F)',
                color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700,
                cursor: (loading || (mode === 'register' && !agreedIP)) ? 'not-allowed' : 'pointer',
                opacity: (loading || (mode === 'register' && !agreedIP)) ? 0.6 : 1,
                fontFamily: "'Rubik', sans-serif",
                boxShadow: '0 6px 20px rgba(31,62,108,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                width: '100%',
              }}>
              {loading ? '...' : mode === 'login' ? 'כניסה →' : 'צור חשבון →'}
            </button>

            {/* Guest entry — no account, no cloud. Progress lives in this
                browser's localStorage under the fixed 'guest' id, so anyone
                testing the app (or a student trying it before signing up) can
                get straight in. Per user 2026-08-26. */}
            <button
              type="button"
              onClick={() => onLogin({
                userId: 'guest',
                username: 'guest',
                displayName: 'אורח',
                role: 'student',
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
              })}
              style={{
                marginTop: 10, padding: '11px 0', width: '100%',
                background: 'rgba(31,62,108,0.06)',
                border: '1px solid rgba(31,62,108,0.22)',
                borderRadius: 14, color: '#254A9F',
                fontSize: 14, fontWeight: 600, fontFamily: "'Rubik', sans-serif",
                cursor: 'pointer',
              }}
            >
              כניסה כאורח — בלי חשבון
            </button>
            <div style={{ marginTop: 6, fontSize: 11.5, color: '#7F9BD9', textAlign: 'center', fontFamily: "'Assistant', sans-serif" }}>
              ההתקדמות נשמרת בדפדפן הזה בלבד
            </div>
          </form>
        </div>

        {/* Student quick-login panel */}
        {existingUsers.length > 0 && (
          <div className="ws-glass-card" style={{
            width: 240,
            borderRadius: 20, padding: '24px 20px',
            flexShrink: 0,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1F3E6C', marginBottom: 14, textAlign: 'right' }}>
              👥 כניסה מהירה
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {existingUsers.map(u => (
                <button key={u.userId} onClick={() => handleQuickLogin(u.userId)}
                  className="ws-glass-card"
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', textAlign: 'right', width: '100%',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#254A9F,#7F9BD9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {(u.displayName || u.username).slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1F3E6C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.username}</div>
                    <div style={{ fontSize: 10, color: '#7F9BD9' }}>{u.role === 'teacher' ? '👩‍🏫 מורה' : '🎓 תלמיד'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toolbar buttons (restored from 3D city HUD) ────────────────────────────────
interface ToolbarButton {
  id: string
  label: string
  icon: string
  description: string
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { id: 'flash', label: 'Flash', icon: '⚡', description: 'Flashcard drill mode' },
  { id: 'calc', label: 'Calc', icon: '🧮', description: 'Calculator tool' },
  { id: 'topics', label: 'Topics', icon: '📚', description: 'Topic browser' },
  { id: 'scores', label: 'Scores', icon: '📊', description: 'Performance dashboard' },
  { id: 'streaks', label: '30Days', icon: '🔥', description: '30-day challenge' },
]

// ── Quiz Intro Card ─────────────────────────────────────────────────────────────
// Centred preview screen shown before launching the actual quiz. Replaces the
// previous "instant pop-up" behaviour where pressing 📝 תרגול jumped straight
// into the question carousel.
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

function QuizIntroCard({ topicId, onStart, onBack, onReadLesson }: {
  topicId: string
  onStart: (difficulty: DifficultyFilter) => void
  onBack: () => void
  onReadLesson: () => void
}) {
  const topicData = (quizBankData.topics as Record<string, { concept?: string; questions?: Array<{ difficulty: string }> }>)[topicId]
  const questions = topicData?.questions || []
  const counts: Record<DifficultyFilter, number> = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  }
  const hebrewName = HEBREW_LABELS[topicId] || topicData?.concept || topicId
  const hasLesson = LESSON_CONTENT.some(t => t.id === topicId) || LESSON_CONTENT_STAT_B.some(t => t.id === topicId) || LESSON_CONTENT_SQL.some(t => t.id === topicId) || LESSON_CONTENT_ANOVA.some(t => t.id === topicId)
  const [selected, setSelected] = useState<DifficultyFilter>('all')

  return (
    <div dir="rtl" style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: "'Rubik', 'Assistant', sans-serif",
    }}>
      <div className="ws-quiz-intro" style={{
        width: '100%', maxWidth: 540,
        background: GLASS_CARD,
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: CARD_SHADOW,
        border: '1px solid rgba(255,255,255,0.5)',
        padding: 36,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📝</div>
        <h2 className="ws-h2" style={{ fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: '0 0 6px' }}>
          תרגול: {hebrewName}
        </h2>
        <div style={{ fontSize: 14, color: TEXT_LIGHT, marginBottom: 22 }}>
          בחר/י רמת קושי. מקל למאתגר.
        </div>

        {/* Difficulty selector — clickable cards, one of which is selected */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          <DifficultySelectorCard
            label="הכל" count={counts.all} icon="🎯"
            color="#6366f1" bg="rgba(99,102,241,0.12)"
            selected={selected === 'all'} onClick={() => setSelected('all')} />
          <DifficultySelectorCard
            label="קל" count={counts.easy} icon="🌱"
            color="#10b981" bg="rgba(16,185,129,0.12)"
            selected={selected === 'easy'} onClick={() => setSelected('easy')}
            disabled={counts.easy === 0} />
          <DifficultySelectorCard
            label="בינוני" count={counts.medium} icon="⚡"
            color="#f59e0b" bg="rgba(245,158,11,0.12)"
            selected={selected === 'medium'} onClick={() => setSelected('medium')}
            disabled={counts.medium === 0} />
          <DifficultySelectorCard
            label="מאתגר" count={counts.hard} icon="🔥"
            color="#ef4444" bg="rgba(239,68,68,0.12)"
            selected={selected === 'hard'} onClick={() => setSelected('hard')}
            disabled={counts.hard === 0} />
        </div>

        {/* Pep-talk paragraph */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: 14,
          padding: '14px 18px',
          fontSize: 14,
          color: TEXT_MED,
          lineHeight: 1.7,
          marginBottom: 28,
          textAlign: 'right',
        }}>
          🎯 התשובה תיבדק אוטומטית. תקבל פידבק מיידי, הסבר על כל שאלה, ו-XP על כל תשובה נכונה.
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onStart(selected)} disabled={counts[selected] === 0} style={{
            background: BUTTON_COLOR, color: '#fff', border: 'none',
            borderRadius: 24, padding: '12px 28px',
            fontWeight: 700, fontSize: 16,
            cursor: counts[selected] === 0 ? 'not-allowed' : 'pointer',
            opacity: counts[selected] === 0 ? 0.4 : 1,
            fontFamily: "'Rubik', sans-serif",
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            התחל תרגול ({counts[selected]} שאלות) ←
          </button>
          {hasLesson && (
            <button data-tour="theory-btn" onClick={onReadLesson} style={{
              background: 'rgba(255,255,255,0.6)', color: TEXT_DARK,
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 24, padding: '12px 22px',
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
            }}>
              📚 קרא תיאוריה
            </button>
          )}
          <button onClick={onBack} style={{
            background: 'transparent', color: TEXT_LIGHT,
            border: 'none', cursor: 'pointer',
            fontSize: 14, padding: '12px 16px', fontFamily: "'Rubik', sans-serif",
          }}>
            → חזרה
          </button>
        </div>
      </div>
    </div>
  )
}

// Small "save to arsenal" chip rendered next to the quiz model-answer header.
// One click saves the explanation as a `gotcha` and shows a brief success state.
function ArsenalQuizCaptureChip({ explanation, topicId }: { explanation: string; topicId?: string }) {
  const [saved, setSaved] = useState(false)
  const handle = () => {
    if (saved || !explanation) return
    quickAddArsenal({ kind: 'gotcha', text: explanation, topicId, source: 'quiz' })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  return (
    <button
      onClick={handle}
      title="שמור את ההסבר כטעות נפוצה בארסנל"
      style={{
        background: saved ? '#10b981' : 'rgba(99,102,241,0.12)',
        color: saved ? '#fff' : '#4338ca',
        border: `1px solid ${saved ? '#10b981' : 'rgba(99,102,241,0.35)'}`,
        borderRadius: 12, padding: '4px 10px',
        cursor: saved ? 'default' : 'pointer',
        fontFamily: "'Rubik', sans-serif",
        fontSize: 11, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        transition: 'all 0.2s ease',
      }}
    >
      {saved ? '✓ נשמר לארסנל' : '🎯 שמור כטעות נפוצה'}
    </button>
  )
}

// Small inline badge shown next to "שאלה X / Y" in the active quiz card —
// communicates the current question's difficulty level and XP reward at a glance.
/**
 * Difficulty chip. `tone` matters: the original palette is pale-on-translucent,
 * readable only on the dark navy strip. Since the chip also sits in the light
 * top bar (2026-07-25), 'light' swaps to dark ink on a tinted fill.
 * `showXp={false}` when the XP chip is already next to it.
 */
function QuizDifficultyBadge({ level, xp, tone = 'dark', showXp = true }: {
  level: 'easy' | 'medium' | 'hard'
  xp: number
  tone?: 'dark' | 'light'
  showXp?: boolean
}) {
  const onDark: Record<string, { label: string; bg: string; color: string; border: string }> = {
    easy:   { label: 'קל',     bg: 'rgba(16,185,129,0.22)', color: '#a7f3d0', border: 'transparent' },
    medium: { label: 'בינוני', bg: 'rgba(245,158,11,0.22)', color: '#fde68a', border: 'transparent' },
    hard:   { label: 'מאתגר',  bg: 'rgba(239,68,68,0.22)',  color: '#fecaca', border: 'transparent' },
  }
  const onLight: Record<string, { label: string; bg: string; color: string; border: string }> = {
    easy:   { label: 'קל',     bg: 'rgba(16,185,129,0.14)', color: '#0F7A5A', border: 'rgba(16,185,129,0.45)' },
    medium: { label: 'בינוני', bg: 'rgba(245,158,11,0.14)', color: '#8A5A00', border: 'rgba(245,158,11,0.45)' },
    hard:   { label: 'מאתגר',  bg: 'rgba(239,68,68,0.12)',  color: '#A32B22', border: 'rgba(239,68,68,0.40)' },
  }
  const cfg = tone === 'light' ? onLight : onDark
  const c = cfg[level] ?? cfg.medium
  return (
    <span style={{
      marginInlineStart: 8,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '2px 8px',
      fontSize: tone === 'light' ? 12 : 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span>{c.label}</span>
      {showXp && <span style={{ opacity: 0.7, fontSize: 10 }}>+{xp} XP</span>}
    </span>
  )
}

function DifficultySelectorCard({ label, count, icon, color, bg, selected, onClick, disabled }: {
  label: string
  count: number
  icon: string
  color: string
  bg: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: selected ? color : bg,
        border: `2px solid ${selected ? color : color + '40'}`,
        color: selected ? '#fff' : color,
        borderRadius: 14,
        padding: '10px 6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        fontFamily: "'Rubik', sans-serif",
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 6px 18px ${color}60` : 'none',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{count}</div>
    </button>
  )
}

// ── Topic Selector Component ───────────────────────────────────────────────────
interface TopicSelectorProps {
  userProgress: UserProgress
  onSelectTopic: (topicId: string, mode: 'lesson' | 'quiz') => void
  onBack: () => void
  darkMode?: boolean
  onToggleDark?: () => void
  /** Reports whether the embedded mindmap ("מפה") view is active, so the shell can hide its title bar. */
  onMapModeChange?: (on: boolean) => void
  /** Which course's topic grid to show. Defaults to Stat-A. */
  course?: 'stat-a' | 'stat-b' | 'sql' | 'anova'
  /** List/mindmap toggle state — lifted to the root so the topbar can render it as a context control. */
  viewMode: 'list' | 'mindmap'
  onViewModeChange: (mode: 'list' | 'mindmap') => void
}

/**
 * CourseGate — 4-tile course picker shown when user clicks "אזור למידה" in
 * the sidebar. Active course (Stat-A) routes into the topic grid. Inactive
 * courses (Stat-B / Methods / ANOVA) open a "Coming soon" splash overlay.
 */
function CourseGate({ onSelectActive }: { onSelectActive: (courseId: 'stat-a' | 'stat-b' | 'sql' | 'anova') => void }) {
  const [comingSoon, setComingSoon] = useState<CourseDef | null>(null)
  const [embedded, setEmbedded] = useState<CourseDef | null>(null)
  // ESC dismisses whichever modal is open. Click-outside is already wired via
  // the backdrop's onClick. Without ESC, keyboard users had no exit short of
  // hunting for the small "ביטול" / "סגור" button — fails WAI-ARIA dialog
  // pattern (Escape must close).
  useEffect(() => {
    if (!comingSoon && !embedded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (embedded) setEmbedded(null)
      else if (comingSoon) setComingSoon(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [comingSoon, embedded])
  const pickCourse = (c: CourseDef) => {
    if(!c.active) { setComingSoon(c); return }
    if(c.pageUrl) {
      // Self-hosted static page (e.g. SQL academy) — same origin, opens in a
      // new tab so the LTR/English page isn't squeezed into the RTL app shell.
      window.open(c.pageUrl, '_blank', 'noopener,noreferrer'); return
    }
    if(c.embedUrl) {
      // Legacy path for any future partner course that can't iframe. Stat-A and
      // Stat-B are both NATIVE now (no embedUrl) → they route into the topic grid.
      setEmbedded(c); return
    }
    onSelectActive(c.id as 'stat-a' | 'stat-b' | 'sql' | 'anova')
  }
  // Full-screen course player. Replaces the old "open external" modal: now
  // the embedded course renders inside a tab strip so we can ship our own
  // native simulators alongside any third-party tool. Tab 1 is always our
  // native sampling-distribution playground; Tab 2 launches the external
  // partner tool (mata"m visualisation site) in a new browser tab.
  if(embedded) {
    return <CoursePlayer course={embedded} onClose={() => setEmbedded(null)} />
  }
  return (
    <div className="ws-screen-pad" style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }} dir="rtl">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Rubik', sans-serif", color: TEXT_DARK, fontSize: 26, fontWeight: 700, margin: 0 }}>הקורסים שלי</h2>
        <p style={{ color: TEXT_MED, fontSize: 14, margin: '6px 0 0' }}>בחר את הקורס בו ברצונך להתחיל ללמוד</p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 22,
        maxWidth: 1200,
      }}>
        {COURSES.map(c => (
          <button
            key={c.id}
            onClick={() => pickCourse(c)}
            className="ws-glass-card"
            style={{
              borderRadius: 22,
              padding: '28px 24px',
              cursor: 'pointer',
              textAlign: 'right',
              fontFamily: "'Rubik', sans-serif",
              direction: 'rtl',
            }}
          >
            {/* Icon chip — same visual language as the sidebar nav: flat
                translucent chip + stroke-only line icon, no gradient fill. */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'var(--sh-sidebar-bg)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}><CourseIcon id={c.id} size={30} /></div>
            <div style={{ fontSize: 19, fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.45 }}>{c.desc}</div>
            {!c.active && (
              // Pin moved from insetInlineStart (right edge in RTL — collided
              // with the centered course icon) to insetInlineEnd (left edge
              // in RTL) per user feedback 2026-05-24. Convention §23.
              <div style={{
                position: 'absolute', top: 14, insetInlineEnd: 14,
                background: 'rgba(127,155,217,0.18)',
                color: '#1f3e6c', border: '1px solid rgba(127,155,217,0.45)',
                borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
              }}>בקרוב</div>
            )}
          </button>
        ))}
      </div>

      {/* Coming soon splash */}
      {comingSoon && (
        <div
          onClick={() => setComingSoon(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(11,27,62,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: '36px 40px',
              maxWidth: 460, textAlign: 'center',
              boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
              fontFamily: "'Rubik', sans-serif",
            }}
            dir="rtl"
          >
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'var(--sh-sidebar-bg)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><CourseIcon id={comingSoon.id} size={44} /></div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0B1B3E', marginBottom: 6 }}>{comingSoon.label}</div>
            <div style={{ fontSize: 14, color: TEXT_MED, marginBottom: 4 }}>{comingSoon.desc}</div>
            <div style={{
              display: 'inline-block', marginTop: 18,
              background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
              color: '#0B1B3E', borderRadius: 999,
              padding: '6px 16px', fontSize: 13, fontWeight: 700,
            }}>בקרוב — בפיתוח</div>
            <div style={{ marginTop: 22 }}>
              <button onClick={() => setComingSoon(null)} style={{
                background: 'transparent', border: '1px solid rgba(31,62,108,0.2)',
                borderRadius: 10, padding: '8px 22px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, color: TEXT_DARK,
              }}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TopicSelector({ userProgress, onSelectTopic, onBack, darkMode, onToggleDark, onMapModeChange, course = 'stat-a', viewMode, onViewModeChange }: TopicSelectorProps) {
  // Course-scoped topic list + taxonomy. The two courses are kept disjoint so
  // neither grid ever leaks the other's topics (see QUIZ_TOPICS_A/_B above).
  const baseTopics = course === 'stat-b' ? QUIZ_TOPICS_B : course === 'sql' ? QUIZ_TOPICS_SQL : course === 'anova' ? QUIZ_TOPICS_ANOVA : QUIZ_TOPICS_A
  const activeGroups = course === 'stat-b' ? TOPIC_GROUPS_B : course === 'sql' ? TOPIC_GROUPS_SQL : course === 'anova' ? TOPIC_GROUPS_ANOVA : TOPIC_GROUPS
  // Re-order topics according to the user's personal plan when one exists.
  // Topics not in the plan trail at the end in their natural order.
  const personalPlan = useLearningStore(s => s.personalPlan)
  // Map view is an unlock-ladder feature (mindmap-view, 35 XP). The מפה/רשימה
  // toggle now lives in the topbar (contextControls) and owns its own gating
  // check; this component only needs adminMode for the mindmap iframe src below.
  const _adminMode = useLearningStore(s => s.adminMode)
  const sortedTopics = (() => {
    // Personal-plan reordering is a Stat-A construct; Stat-B and SQL keep curriculum order.
    if (!personalPlan || course !== 'stat-a') return baseTopics
    const order = new Map(personalPlan.sequence.map((s, i) => [s.topicId, i]))
    return [...baseTopics].sort((a, b) => {
      const ai = order.has(a.id) ? (order.get(a.id) as number) : 9999
      const bi = order.has(b.id) ? (order.get(b.id) as number) : 9999
      return ai - bi
    })
  })()
  const hintByTopic = new Map<string, string>(
    personalPlan?.sequence.filter(s => s.hint).map(s => [s.topicId, s.hint as string]) ?? []
  )
  useEffect(() => { if (onMapModeChange) onMapModeChange(viewMode === 'mindmap') }, [viewMode, onMapModeChange])

  // The מפה tab embeds the real interactive mindmap (mindmap.html). When a topic
  // node's 📖/📝 chip is clicked it posts {type:'ws-open-topic', topicId, mode}
  // — route it to the lesson / practice via the same handler the cards use.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; topicId?: string; mode?: string }
      if (!d || d.type !== 'ws-open-topic' || !d.topicId) return
      onSelectTopic(d.topicId, d.mode === 'quiz' ? 'quiz' : 'lesson')
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [onSelectTopic])

  // Build the parent→subtopic structure. Ungrouped topics fall into "נוספים".
  type TopicItem = (typeof QUIZ_TOPICS)[number]
  const topicById = new Map<string, TopicItem>(sortedTopics.map(t => [t.id, t]))
  const groupedSections: Array<{ id: string; labelHe: string; emoji: string; topics: TopicItem[] }> =
    activeGroups.map(g => ({
      id: g.id, labelHe: g.labelHe, emoji: g.emoji,
      topics: g.topicIds.map(id => topicById.get(id)).filter((t): t is TopicItem => !!t),
    })).filter(s => s.topics.length > 0)
  const groupedIds = new Set(activeGroups.flatMap(g => g.topicIds))
  const extraTopics = sortedTopics.filter(t => !groupedIds.has(t.id))
  if (extraTopics.length) groupedSections.push({ id: 'extra', labelHe: 'נוספים', emoji: '✨', topics: extraTopics })

  const renderTopicCard = (topic: TopicItem) => {
    const progress = userProgress.topics[topic.id]
    const planHint = hintByTopic.get(topic.id)
    const isMastered = progress?.mastered
    const bestScore = progress?.bestScore || 0
    const sessionsAttempted = progress?.sessionsAttempted || 0
    return (
      <div
        key={topic.id}
        className="ws-topic-card"
        style={{
          background: GLASS_CARD,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${isMastered ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.3)'}`,
          borderRadius: CARD_RADIUS,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
          transition: 'all 0.3s',
          boxShadow: CARD_SHADOW,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px rgba(51,81,202,0.25)`
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 32 }}>{isMastered ? '⭐' : '📖'}</div>
          <div>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK, textAlign: 'center' }}>
              {topic.label}
            </div>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginTop: 4, textAlign: 'center' }}>
              {topic.building}
            </div>
          </div>
        </div>

        {planHint && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,200,66,0.22), rgba(212,175,55,0.12))',
            border: '1px solid rgba(212,175,55,0.5)',
            borderRadius: 10, padding: '6px 10px',
            fontFamily: "'Rubik', sans-serif", fontSize: 12,
            color: '#8a6d1c', fontWeight: 600, textAlign: 'right',
          }}>
            🎯 {planHint}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT_MED }}>
              {sessionsAttempted}
            </div>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>סשנים</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: bestScore > 85 ? '#34A853' : TEXT_MED }}>
              {bestScore}%
            </div>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>ציון הטוב</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: '#D4AF37' }}>
              {topic.questionCount}
            </div>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>שאלות</div>
          </div>
        </div>

        {isMastered && (
          <div style={{
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: "'Rubik', sans-serif",
            fontSize: 12,
            color: '#D4AF37',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            ✅ הושגת שליטה!
          </div>
        )}

        {/* Lesson / Quiz action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => onSelectTopic(topic.id, 'lesson')}
            style={{
              flex: 1,
              background: BUTTON_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
              boxShadow: '0px 2px 6px rgba(51,81,202,0.35)',
            }}
          >
            📚 תיאוריה
          </button>
          <button
            onClick={() => onSelectTopic(topic.id, 'quiz')}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.7)',
              color: TEXT_DARK,
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 14,
              padding: '10px 0',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
            }}
          >
            📝 תרגול
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ws-screen-pad" style={viewMode === 'mindmap' ? { flex: 1, overflow: 'auto', padding: '5px 8px 6px' } : { flex: 1, overflow: 'auto', padding: '32px 40px' }}>
      {viewMode === 'mindmap' ? null : (
        <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 28, textAlign: 'right' }}>
          בחר נושא ללמוד 📚
        </h2>
      )}

      {viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 1200 }}>
          {groupedSections.map(section => {
            const masteredCount = section.topics.filter(t => userProgress.topics[t.id]?.mastered).length
            return (
              <div key={section.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 24 }}>{section.emoji}</span>
                  <h3 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 21, fontWeight: 800, color: TEXT_DARK, margin: 0 }}>{section.labelHe}</h3>
                  <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, background: 'rgba(127,155,217,0.12)', borderRadius: 999, padding: '2px 10px' }}>
                    {masteredCount}/{section.topics.length} נושאים
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {section.topics.map(renderTopicCard)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // The real interactive mindmap (same map as מפת הלמידה שלי). Topic nodes
        // carry 📖/📝 chips that open theory/practice; sub-topics can be added.
        <iframe
          src={`${import.meta.env.BASE_URL}mindmap.html?v=mm19-20260708&scene=topics&course=${course}&admin=${_adminMode ? '1' : '0'}`}
          title="מפת הנושאים"
          style={{ width: '100%', height: 'calc(100dvh - 104px)', border: 'none', borderRadius: 14, boxShadow: CARD_SHADOW, display: 'block' }}
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  )
}

// ── Topic mindmap view — a REAL mindmap matching "מפת הלמידה שלי" ──────────────
// Central root → group branches → topic sub-branches, drawn with curved SVG
// connectors on the app's blue background. Clicking a topic leaf opens its
// lesson. Horizontally scrollable when wide. Mirrors the mindmap.html aesthetic.
function TopicMindmap({ groups, userProgress, onSelectTopic }: {
  groups: Array<{ id: string; labelHe: string; emoji: string; topics: (typeof QUIZ_TOPICS) }>
  userProgress: UserProgress
  onSelectTopic: (id: string, mode: 'lesson' | 'quiz') => void
}) {
  // Branch colours cycle like the real mindmap (blue / red alternating spine).
  const BRANCH_COLORS = ['#3351CA', '#C0392B', '#2563EB', '#B23B6E', '#1E7F6B', '#7C5CBF', '#C77D2E']
  const COL_W = 196
  const ROOT_TOP = 16, ROOT_H = 46
  const GROUP_TOP = 132, GROUP_H = 42
  const TOPIC_TOP0 = 232, TOPIC_STEP = 50, TOPIC_H = 38
  const cols = Math.max(groups.length, 1)
  const W = Math.max(cols * COL_W, 560)
  const maxTopics = Math.max(1, ...groups.map(g => g.topics.length))
  const H = TOPIC_TOP0 + maxTopics * TOPIC_STEP + 24
  const rootX = W / 2
  const colX = (i: number) => i * COL_W + COL_W / 2

  // Bezier from (x1,y1) down to (x2,y2) with a vertical control midpoint.
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const my = (y1 + y2) / 2
    return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
  }

  return (
    <div style={{
      position: 'relative', width: '100%', overflowX: 'auto', overflowY: 'hidden',
      background: 'linear-gradient(160deg,#1F3E6C 0%,#254A9F 100%)',
      borderRadius: 18, boxShadow: CARD_SHADOW, padding: 4,
    }}>
      <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }} dir="rtl">
        {/* Connectors */}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {groups.map((g, i) => {
            const c = BRANCH_COLORS[i % BRANCH_COLORS.length]
            const gx = colX(i)
            return (
              <g key={g.id}>
                <path d={curve(rootX, ROOT_TOP + ROOT_H, gx, GROUP_TOP)} fill="none" stroke={c} strokeWidth={2.5} opacity={0.9} />
                {g.topics.map((t, j) => (
                  <path key={t.id} d={curve(gx, GROUP_TOP + GROUP_H, gx, TOPIC_TOP0 + j * TOPIC_STEP + TOPIC_H / 2)}
                    fill="none" stroke={c} strokeWidth={1.8} opacity={0.55} />
                ))}
              </g>
            )
          })}
        </svg>

        {/* Root */}
        <div style={{
          position: 'absolute', left: rootX, top: ROOT_TOP, transform: 'translateX(-50%)',
          height: ROOT_H, display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px',
          background: 'linear-gradient(135deg,#FFFFFF,#EEF2FB)', color: '#1F2640',
          borderRadius: 23, border: '2px solid rgba(212,175,55,0.7)', whiteSpace: 'nowrap',
          fontFamily: "'Rubik', sans-serif", fontWeight: 800, fontSize: 16,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        }}>📊 סטטיסטיקה</div>

        {/* Group branches */}
        {groups.map((g, i) => {
          const c = BRANCH_COLORS[i % BRANCH_COLORS.length]
          return (
            <div key={g.id} style={{
              position: 'absolute', left: colX(i), top: GROUP_TOP, transform: 'translateX(-50%)',
              height: GROUP_H, maxWidth: COL_W - 12, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
              background: c, color: '#fff', borderRadius: 21, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: "'Rubik', sans-serif", fontWeight: 800, fontSize: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
            }}>
              <span style={{ fontSize: 16 }}>{g.emoji}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.labelHe}</span>
            </div>
          )
        })}

        {/* Topic sub-branches */}
        {groups.map((g, i) =>
          g.topics.map((t, j) => {
            const mastered = userProgress.topics[t.id]?.mastered
            return (
              <button
                key={t.id}
                onClick={() => onSelectTopic(t.id, 'lesson')}
                title={`פתח תיאוריה — ${t.label}`}
                style={{
                  position: 'absolute', left: colX(i), top: TOPIC_TOP0 + j * TOPIC_STEP,
                  transform: 'translateX(-50%)', height: TOPIC_H, maxWidth: COL_W - 16,
                  display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', cursor: 'pointer',
                  background: mastered ? 'linear-gradient(135deg,#F7D774,#E9B949)' : 'rgba(255,255,255,0.95)',
                  color: '#1F2640', borderRadius: 19,
                  border: `1.5px solid ${mastered ? '#E6A800' : 'rgba(255,255,255,0.6)'}`,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 12.5,
                  boxShadow: '0 3px 9px rgba(0,0,0,0.22)',
                }}
              >
                <span style={{ fontSize: 13 }}>{mastered ? '⭐' : '📖'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Questions with model answers ──────────────────────────────────────────────
// Fallback for initial questions (will be overridden by quiz-bank data)
const QUESTIONS = [
  {
    id: 1, topic: 'ממוצע',
    text: 'בכיתה יש 10 תלמידים. ציוני המבחן שלהם הם:\n65, 70, 70, 75, 80, 85, 85, 90, 95, 100\n\nא. חשב/י את הממוצע\nב. מצא/י את החציון\nג. קבע/י מהו השכיח\nד. חשב/י את הטווח',
    answer: 'א. ממוצע = (65+70+70+75+80+85+85+90+95+100) ÷ 10 = 815 ÷ 10 = 81.5\nב. חציון = ממוצע הערך ה-5 וה-6 = (80+85) ÷ 2 = 82.5\nג. שכיח: 70 ו-85 מופיעים כל אחד פעמיים (רב-שכיחי)\nד. טווח = 100 − 65 = 35',
    xp: 15,
  },
  {
    id: 2, topic: 'ממוצע',
    text: 'גבהות (בס"מ) של 5 שחקני כדורסל:\n180, 195, 188, 202, 175\n\nא. חשב/י את הממוצע\nב. מה ההפרש בין הגובה הגבוה לנמוך ביותר?',
    answer: 'א. ממוצע = (180+195+188+202+175) ÷ 5 = 940 ÷ 5 = 188 ס"מ\nב. גבוה ביותר: 202, נמוך ביותר: 175 → הפרש = 202 − 175 = 27 ס"מ',
    xp: 10,
  },
  {
    id: 3, topic: 'חציון',
    text: 'הצג/י את הנתונים הבאים בסדר עולה:\n12, 7, 3, 18, 5, 9, 14\n\nא. מצא/י את החציון\nב. כמה ערכים גדולים מהחציון?',
    answer: 'סדר עולה: 3, 5, 7, 9, 12, 14, 18  (7 ערכים)\nא. חציון = ערך האמצעי = הערך ה-4 = 9\nב. ערכים גדולים מ-9: 12, 14, 18 → 3 ערכים',
    xp: 10,
  },
  {
    id: 4, topic: 'שכיח',
    text: 'ציוני בוחן של כיתה: 70, 80, 80, 90, 80, 70, 95, 80\n\nא. מהו השכיח?\nב. כמה פעמים מופיע השכיח?',
    answer: 'ספירה: 70→2, 80→4, 90→1, 95→1\nא. שכיח = 80 (מופיע הכי הרבה)\nב. השכיח מופיע 4 פעמים',
    xp: 8,
  },
  {
    id: 5, topic: 'טווח',
    text: 'נתון מדגם: 4, 8, 15, 16, 23, 42\n\nא. חשב/י את הטווח\nב. מה הממוצע?',
    answer: 'א. טווח = 42 − 4 = 38\nב. ממוצע = (4+8+15+16+23+42) ÷ 6 = 108 ÷ 6 = 18',
    xp: 10,
  },
  {
    id: 6, topic: 'ממוצע',
    text: 'ממוצע ציוני 4 תלמידים הוא 80. תלמיד חמישי קיבל 100.\nמהו הממוצע החדש?',
    answer: 'סכום 4 תלמידים = 4 × 80 = 320\nסכום חדש = 320 + 100 = 420\nממוצע חדש = 420 ÷ 5 = 84',
    xp: 12,
  },
  {
    id: 7, topic: 'חציון',
    text: 'סדרה: 2, 4, 6, 8, 10, 12\nמצא/י חציון לסדרה זו ונמק/י.',
    answer: 'הסדרה כבר מסודרת בסדר עולה. 6 ערכים זוגי.\nחציון = ממוצע הערך ה-3 וה-4 = (6+8) ÷ 2 = 7\nהחציון הוא 7 (אינו אחד מהערכים בסדרה)',
    xp: 10,
  },
  {
    id: 8, topic: 'שכיח',
    text: 'נתוני מכירות שבועיות: 5, 8, 5, 12, 8, 5, 9, 5\n\nא. מהו השכיח?\nב. האם הממוצע גדול מהשכיח?',
    answer: 'ספירה: 5→4, 8→2, 12→1, 9→1\nא. שכיח = 5\nב. ממוצע = (5+8+5+12+8+5+9+5) ÷ 8 = 57 ÷ 8 = 7.125\n   כן, הממוצע (7.125) גדול מהשכיח (5)',
    xp: 12,
  },
]

// ── Activity chart SVG — driven by real XP history (wafflestack-xp-history) ───
const HE_DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const XP_HISTORY_KEY = 'wafflestack-xp-history'

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface ActivityDay {
  key: string
  dayHe: string
  value: number
  isToday: boolean
}

// Mirrors ScoreBoard.buildWeeklyBars: cumulative XP snapshot per day → daily delta.
function loadActivityWeek(): ActivityDay[] {
  let history: Record<string, number> = {}
  try {
    const raw = localStorage.getItem(XP_HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') history = parsed
    }
  } catch { /* ignore corrupt history */ }

  const today = new Date()
  const todayKey = dateKey(today)
  const windowStart = new Date(today); windowStart.setDate(windowStart.getDate() - 6)
  const windowStartKey = dateKey(windowStart)
  const earlierKeys = Object.keys(history).filter(k => k < windowStartKey).sort()
  let prevXp = earlierKeys.length > 0 ? history[earlierKeys[earlierKeys.length - 1]] : 0

  const days: ActivityDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const key = dateKey(d)
    const recorded = history[key]
    const xpEnd = recorded !== undefined ? recorded : prevXp
    const delta = Math.max(0, xpEnd - prevXp)
    days.push({ key, dayHe: HE_DAY_NAMES[d.getDay()], value: delta, isToday: key === todayKey })
    prevXp = xpEnd
  }
  return days
}

function ActivityChart() {
  const week = loadActivityWeek()
  const values = week.map(w => w.value)
  const total = values.reduce((s, v) => s + v, 0)
  const dataMax = values.reduce((m, v) => Math.max(m, v), 0)
  // Floor at 100 so an empty week still draws sensible gridlines.
  const niceMax = dataMax === 0
    ? 100
    : Math.max(100, Math.ceil((dataMax * 1.15) / 50) * 50)
  const tickStep = niceMax / 4

  const W = 460, H = 200, padL = 36, padB = 28, padT = 10, padR = 10
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const toX = (i: number) => padL + (i / (week.length - 1)) * innerW
  const toY = (v: number) => padT + innerH - (v / niceMax) * innerH

  const pts = values.map((v, i) => [toX(i), toY(v)] as [number, number])
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = line + ` L${pts[pts.length-1][0]},${padT+innerH} L${pts[0][0]},${padT+innerH} Z`
  const ticks = [0, tickStep, tickStep * 2, tickStep * 3, niceMax]

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px 10px', direction: 'rtl' as const,
      }}>
        <span style={{
          fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 700, color: TEXT_DARK,
        }}>
          📈 פעילות השבוע
        </span>
        <span style={{
          fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
          color: total > 0 ? '#D4AF37' : TEXT_LIGHT, fontVariantNumeric: 'tabular-nums',
        }}>
          {total > 0 ? `+${total.toLocaleString('he-IL')} XP` : 'אין פעילות עדיין'}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        role="img"
        aria-label={total > 0
          ? `תרשים פעילות השבוע — סה"כ ${total.toLocaleString('he-IL')} XP על פני 7 ימים`
          : 'תרשים פעילות השבוע — אין פעילות עדיין'}
        style={{ maxWidth: W, display: 'block', height: 'auto', overflow: 'visible' }}>
        <title>{total > 0 ? `+${total.toLocaleString('he-IL')} XP בשבוע האחרון` : 'אין פעילות בשבוע האחרון'}</title>
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.45)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.03)" />
          </linearGradient>
        </defs>
        {ticks.map(v => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={padL+innerW} y2={toY(v)} stroke="#DBDEE4" strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL-5} y={toY(v)+4} textAnchor="end" fontSize={10} fill="#54555A" fontFamily="Inter">{Math.round(v)}</text>
          </g>
        ))}
        <path d={area} fill="url(#chartArea)" />
        <path d={line} fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => {
          const day = week[i]
          return (
            <g key={i}>
              <circle
                cx={x} cy={y}
                r={day.isToday ? 5 : 3.5}
                fill={day.isToday ? '#FFC700' : '#D4AF37'}
                stroke={day.isToday ? '#fff' : 'none'}
                strokeWidth={day.isToday ? 1.5 : 0}
              >
                <title>{`${day.key}: +${day.value} XP`}</title>
              </circle>
            </g>
          )
        })}
        {week.map((day, i) => (
          <text
            key={i}
            x={toX(i)} y={H-4}
            textAnchor="middle"
            fontSize={9}
            fill={day.isToday ? '#D4AF37' : '#54555A'}
            fontWeight={day.isToday ? 700 : 400}
            fontFamily="Rubik"
          >
            {day.dayHe}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── CoursePlayer ─────────────────────────────────────────────────────────────
// Fullscreen tabbed shell for any "embedded" course. Tab 1 hosts our native
// React simulator(s) for that course; Tab 2 links out to the third-party
// partner site (stats-viz-mata for stat-b) since modern hosts block iframe
// embedding via X-Frame-Options. ESC closes; click outside the chrome
// doesn't (the player owns the whole viewport).
type CourseTab = { id: string; label: string; render: () => React.ReactNode }
function CoursePlayer({ course, onClose }: {
  course: CourseDef
  onClose: () => void
}) {
  // For stat-b the simulator is the headline experience; the external tool
  // is offered as a secondary "extras" tab. Other embed-style courses can
  // reuse this component by adding their own tab list.
  const tabs: CourseTab[] = course.id === 'stat-b'
    ? [
      { id: 'sampling', label: '🎯 התפלגות הדגימה', render: () => <SamplingDistribution /> },
      { id: 'external', label: '🔗 כלי מתא"ם (חיצוני)', render: () => <ExternalLinkPanel course={course} /> },
    ]
    : [
      { id: 'external', label: course.label, render: () => <ExternalLinkPanel course={course} /> },
    ]
  const [active, setActive] = useState<string>(tabs[0].id)
  const activeTab = tabs.find(t => t.id === active) ?? tabs[0]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'linear-gradient(180deg, #F0F4FB 0%, #E8EFF8 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Rubik', 'Assistant', sans-serif",
      }}
      dir="rtl"
    >
      {/* Top chrome — close + title + tab strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 22px',
        background: '#fff',
        borderBottom: `1px solid ${'rgba(127,155,217,0.25)'}`,
        boxShadow: '0 2px 12px rgba(31,62,108,0.06)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={onClose}
          aria-label="חזרה לרשימת הקורסים"
          style={{
            background: 'rgba(127,155,217,0.15)', color: '#0B1B3E',
            border: `1px solid ${'rgba(127,155,217,0.4)'}`,
            borderRadius: 10, padding: '6px 14px',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >→ חזרה לקורסים</button>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--sh-sidebar-bg)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><CourseIcon id={course.id} size={22} /></div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0B1B3E' }}>{course.label}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>{course.desc}</div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                background: active === t.id
                  ? 'linear-gradient(135deg,#5b8bff,#6c63ff)'
                  : 'rgba(127,155,217,0.10)',
                color: active === t.id ? '#fff' : '#4338ca',
                border: `1px solid ${active === t.id ? 'transparent' : 'rgba(127,155,217,0.35)'}`,
                borderRadius: 999, padding: '7px 16px',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: active === t.id ? '0 4px 12px rgba(99,102,241,0.30)' : 'none',
                transition: 'all 0.18s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab body */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab.render()}
      </div>
    </div>
  )
}

// Subtle external-link landing card for partner courses that can't iframe.
function ExternalLinkPanel({ course }: { course: CourseDef }) {
  const open = () => {
    if (course.embedUrl) window.open(course.embedUrl, '_blank', 'noopener,noreferrer')
  }
  return (
    <div dir="rtl" style={{
      maxWidth: 560, margin: '60px auto', padding: '40px 36px',
      background: '#fff', borderRadius: 22, textAlign: 'center',
      boxShadow: '0 24px 70px rgba(0,0,0,0.10)',
      fontFamily: "'Rubik', sans-serif",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'var(--sh-sidebar-bg)', margin: '0 auto 18px',
        border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><CourseIcon id={course.id} size={44} /></div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0B1B3E', marginBottom: 6 }}>
        כלי ויזואליזציה — מתא"ם
      </div>
      <div style={{ fontSize: 14, color: '#4A5568', marginBottom: 16 }}>
        5 לשוניות אינטראקטיביות: איחוד מתאמים (פרדוקס סימפסון), רגרסיה, ממוצע ופיזור,
        מתאם בסיסי, ו-α/β. הכלי מתארח באתר חיצוני ולכן יפתח בכרטיסיית דפדפן חדשה.
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 18, direction: 'ltr' }}>
        {course.embedUrl}
      </div>
      <button
        onClick={open}
        style={{
          background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
          color: '#0B1B3E', border: 0, borderRadius: 12,
          padding: '12px 28px', fontFamily: "'Rubik', sans-serif",
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(212,175,55,0.45)',
        }}
      >פתח את הכלי החיצוני ↗</button>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onGoWorld, onGoMindmap, onGoDrawing, onGoNotebook, onOpenTours, width = 247 }: {
  active: InternalView
  onNav: (v: InternalView) => void
  onGoWorld: () => void
  onGoMindmap: () => void
  onGoDrawing: () => void
  onGoNotebook: () => void
  onOpenTours: () => void
  width?: number
}) {
  // EduCity-style clean line icons. SVG with stroke-currentColor so the
  // active-state gold tint applies uniformly. No emoji, no gradient chips.
  // Each icon is a 22x22 viewBox 24, 1.8 stroke, rounded line caps.
  type IconKey = 'home' | 'book' | 'trophy' | 'map' | 'globe' | 'tour'
  const items: Array<{ id: InternalView | null; label: string; iconKey: IconKey; action?: string; feature?: FeatureId }> = [
    { id: 'home',     label: 'דף הבית',           iconKey: 'home' },
    { id: 'courses', label: 'אזור למידה',        iconKey: 'book' },
    { id: 'arsenal',  label: 'הארסנל שלי',        iconKey: 'trophy', feature: 'arsenal' },
    // 'מפת הלמידה שלי' removed as a separate destination — the concept map now
    // lives only inside אזור למידה (the 🗺️ מפה tab), framed as an upgrade of the
    // learning area rather than a standalone screen. Per user 2026-06-09.
    { id: null,       label: 'העולם שלי',         iconKey: 'globe', action: 'world' },
    { id: null,       label: 'סיורים מודרכים',    iconKey: 'tour',  action: 'tours' },
  ]
  // Subscribe to gating state once per render so each row knows lock status.
  const _adminMode = useLearningStore(s => s.adminMode)
  const _unlockedFeatures = useLearningStore(s => s.unlockedFeatures)
  const isLocked = (f?: FeatureId) => !!f && !isFeatureUnlocked(f, _unlockedFeatures, _adminMode)
  const renderIcon = (k: IconKey) => {
    const stroke = 'currentColor'
    const sw = 1.8
    const lc = 'round' as const
    const lj = 'round' as const
    switch (k) {
      case 'home':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
      case 'book':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/></svg>
      case 'trophy':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 6H3v2a3 3 0 0 0 3 3"/><path d="M19 6h2v2a3 3 0 0 1-3 3"/><path d="M9 19h6"/><path d="M12 14v5"/></svg>
      case 'map':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16"/><path d="M15 6v16"/></svg>
      case 'globe':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18"/><path d="M12 3a13 13 0 0 0 0 18"/></svg>
      case 'tour':
        return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M5 21V4"/><path d="M5 4l9 3-9 3"/><path d="M5 13l11 3-11 3" opacity="0.55"/></svg>
    }
  }

  const collapsed = width < 80
  return (
    <div style={{
      background: SIDEBAR_BG,
      width: '100%',
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(51,81,202,0.25)',
      overflow: 'hidden',
    }}>
      {/* Logo / avatar area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(31,41,55,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {/* Diamond icon matching Figma */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polygon points="18,4 30,14 18,32 6,14" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
            <polygon points="18,4 30,14 18,17 6,14" fill="rgba(255,255,255,0.3)" />
            <line x1="6" y1="14" x2="30" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => {
          const isActive = item.id !== null && item.id === active
          const locked = isLocked(item.feature)
          const lockTip = locked && item.feature ? FEATURE_UNLOCKS_BY_ID[item.feature]?.descriptionHe : undefined
          return (
            <button key={i}
              disabled={locked}
              onClick={() => {
                if (locked) return
                if (item.action === 'world') { onGoWorld(); return }
                if (item.action === 'mindmap') { onGoMindmap(); return }
                if (item.action === 'drawing') { onGoDrawing(); return }
                if (item.action === 'notebook') { onGoNotebook(); return }
                if (item.action === 'tours') { onOpenTours(); return }
                if (item.id !== null) onNav(item.id)
              }}
              title={locked ? lockTip : (collapsed ? item.label : undefined)}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                borderRadius: 32,
                padding: collapsed ? '12px 0' : '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                direction: 'rtl',
                border: 'none',
                cursor: locked ? 'not-allowed' : 'pointer',
                width: '100%',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 17,
                fontWeight: isActive ? 600 : 400,
                color: '#FFFFFF',
                opacity: locked ? 0.5 : 1,
                filter: locked ? 'grayscale(0.7)' : 'none',
                transition: 'background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive && !locked) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { if (!isActive && !locked) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <span
                className={`ws-icon-chip ${isActive ? 'ws-icon-chip--active' : 'ws-icon-chip--inactive'}`}
                style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#FFD700' : 'rgba(255,255,255,0.92)',
                  borderRadius: 10,
                  border: '1px solid',
                  transition: 'color 0.15s, background 0.15s, transform 0.15s',
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                }}>{renderIcon(item.iconKey)}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              {locked && (
                <span aria-hidden="true" style={{
                  position: 'absolute',
                  top: 6, insetInlineEnd: 8,
                  background: 'linear-gradient(135deg, #1a237e, #0d1656)',
                  color: '#FFD700',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: '2px 6px',
                  border: '1px solid rgba(255,215,0,0.5)',
                  lineHeight: 1,
                }}>🔒</span>
              )}
            </button>
          )
        })}
        <AdminToggle collapsed={collapsed} />
        {/* Pomodoro mounted in sidebar bottom; gated by feature unlock */}
        <FeatureGate id="pomodoro" mode="hide"><PomodoroTimer /></FeatureGate>
      </nav>
    </div>
  )
}

/**
 * AdminToggle — small pill at the bottom of the sidebar that flips the
 * global adminMode flag in learningStore. When ON, gating helpers report
 * everything unlocked + every BuildingProgress.level is hoisted to >=1
 * (mastered stays mastered).
 */
function AdminToggle({ collapsed }: { collapsed: boolean }) {
  const adminMode = useLearningStore(s => s.adminMode)
  const toggle = useLearningStore(s => s.toggleAdminMode)
  return (
    <button
      onClick={toggle}
      aria-pressed={adminMode}
      title={adminMode ? 'אדמין: פתוח — לחץ לכיבוי' : 'אדמין: סגור — לחץ לפתיחת הכל'}
      style={{
        marginTop: 'auto', alignSelf: 'stretch',
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10, padding: collapsed ? '8px' : '8px 12px',
        background: adminMode ? 'rgba(245,200,66,0.18)' : 'rgba(255,255,255,0.06)',
        border: '1px solid ' + (adminMode ? 'rgba(245,200,66,0.55)' : 'rgba(255,255,255,0.18)'),
        color: adminMode ? '#FFD700' : 'rgba(255,255,255,0.85)',
        borderRadius: 10, cursor: 'pointer',
        fontFamily: "'Rubik', sans-serif", fontSize: 12, fontWeight: 700,
        direction: 'rtl', transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: adminMode ? '#FFD700' : 'transparent',
        color: adminMode ? '#0B1B3E' : 'currentColor',
        border: '1px solid currentColor',
        borderRadius: 6, fontSize: 14, flexShrink: 0,
      }}>{adminMode ? '🔓' : '🔒'}</span>
      {!collapsed && (
        <span style={{ whiteSpace: 'nowrap' }}>
          {adminMode ? 'אדמין פעיל' : 'מצב אדמין'}
        </span>
      )}
    </button>
  )
}

// ── Top bar ────────────────────────────────────────────────────────────────────
/**
 * GlassBoardAdminToggle — admin-only flag switch for the glass board (the
 * lesson/quiz whiteboard → pane of glass in front of the knowledge city, see
 * hooks/useGlassBoard.ts). Renders nothing for students; when adminMode is ON
 * it sits in the topbar next to the 🎓 סיור pill with the same styling.
 */
function GlassBoardAdminToggle() {
  const adminMode = useLearningStore(s => s.adminMode)
  const [enabled, setEnabled] = useGlassBoard()
  if (!adminMode) return null
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      title={enabled ? 'לוח זכוכית פעיל — לחץ לחזרה ללוח המחיק' : 'לוח זכוכית כבוי — לחץ להפעלה'}
      style={{
        background: enabled ? 'rgba(51,81,202,0.14)' : 'rgba(99,102,241,0.10)',
        border: '1px solid ' + (enabled ? 'rgba(51,81,202,0.55)' : 'rgba(99,102,241,0.3)'),
        borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
        color: enabled ? '#3351CA' : '#6366f1', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      🪟 לוח זכוכית
    </button>
  )
}

function TopBar({ title, onLogout, darkMode, onToggleDark, contextControls }: { title: string; onLogout?: () => void; darkMode?: boolean; onToggleDark?: () => void; contextControls?: React.ReactNode }) {
  const userName = localStorage.getItem('userName') || 'Student'
  const xp = useLearningStore(state => state.xp)
  return (
    <div className="ws-topbar" style={{
      background: 'var(--sh-topbar-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--sh-topbar-border)',
      height: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
    }} dir="rtl">
      {/* Title + context controls share the START side so nav controls (e.g.
          the topics מפה/רשימה toggle + back button) sit right next to the
          title instead of stealing space from the board content area. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 auto', minWidth: 0 }}>
        <h1 style={{
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: TEXT_DARK,
          margin: 0,
          letterSpacing: '-0.5px',
          textShadow: '0 1px 4px rgba(255,255,255,0.8)',
          // Shrink + ellipsize so the actions (logout etc.) never overlap the
          // title on narrow widths. Per user 2026-06-02.
          flex: '1 1 auto', minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginInlineEnd: 16,
        }}>{title}</h1>
        {contextControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {contextControls}
          </div>
        )}
      </div>
      <div className="ws-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }} dir="ltr">
        {/* Dark-mode toggle, integrated into topbar per user 2026-05-24
            (was a floating fixed button at top-right obscuring sidebar icons). */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            aria-label={darkMode ? 'הפעל מצב בהיר' : 'הפעל מצב כהה'}
            title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
            style={{
              background: 'rgba(31,62,108,0.08)',
              border: '1px solid rgba(31,62,108,0.25)',
              borderRadius: 10,
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sh-text-dark)',
              cursor: 'pointer',
            }}
          >
            {darkMode ? '☀' : '☾'}
          </button>
        )}
        <span className="ws-ribbon-divider" />
        {/* Ribbon A — Progress */}
        <Ribbon label="התקדמות">
          <span style={{
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 999,
            padding: '3px 10px',
            color: '#D4AF37',
            fontSize: 13,
            fontFamily: "'Rubik', sans-serif",
          }}>
            ⭐ {xp} XP
          </span>
        </Ribbon>

        <span className="ws-ribbon-divider" />

        {/* Ribbon B — Potions (label hidden per user 2026-05-24, icons keep aria) */}
        <Ribbon label="שיקויים" hideLabel>
          <PotionInventory />
        </Ribbon>

        <span className="ws-ribbon-divider" />

        {/* Ribbon C — Account (label hidden per user 2026-05-24) */}
        <Ribbon label="חשבון" hideLabel>
          <span className="hidden md:inline" style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK }}>שלום, {userName}</span>
          <TourLauncher />
          <GlassBoardAdminToggle />
          {onLogout && (
            <Tooltip label="יציאה" description="התנתק מהחשבון">
              <button onClick={onLogout} style={{
                background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.2)',
                borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                color: '#d32f2f', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
              }}>
                ↩ יציאה
              </button>
            </Tooltip>
          )}
        </Ribbon>
      </div>
    </div>
  )
}

// ── Home screen ────────────────────────────────────────────────────────────────
function HomeScreen({ onGoLearning, onGoWorld, onGoMindmap, onSelectTopic, onStartPractice }: {
  onGoLearning: () => void
  onGoWorld: () => void
  onGoMindmap: () => void
  onSelectTopic: (topicId: string) => void
  onStartPractice: (topicId: string) => void
}) {
  const xp = useLearningStore(s => s.xp)
  const totalCorrect = useLearningStore(s => s.totalCorrect)
  const currentStreak = useLearningStore(s => s.currentStreak)
  const XP_PER_LEVEL = 100
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const topicsMastered = useLearningStore(s => s.completedLessons.length)
  const completedLessons = useLearningStore(s => s.completedLessons)
  const answeredIds = useLearningStore(s => s.answeredIds)
  const personalPlan = useLearningStore(s => s.personalPlan)
  const clearPersonalPlan = useLearningStore(s => s.clearPersonalPlan)
  const [planWizardOpen, setPlanWizardOpen] = useState(false)

  // ── First-run funnel ────────────────────────────────────────────────────────
  // Brand-new user → auto-play the intro tour → its end opens the goals
  // questionnaire → finishing/closing it lands them here with both home cards
  // pulsing. Gated by per-user `onboardingCompleted` so it fires exactly once.
  const activeTour           = useTutorialStore(s => s.activeTour)
  const [funnelStage, setFunnelStage] = useState<'idle' | 'active' | 'done'>('idle')
  const [pulseCards, setPulseCards]   = useState(false)
  const prevTourRef = useRef(activeTour)

  // Kick off the funnel ONCE per user. CRITICAL: defer the decision to the next
  // frame and read state via getState(), NOT a reactive selector. On mount the
  // persisted store hasn't merged yet (and this child's effect runs before the
  // parent's hydrateForUser effect), so a reactive `onboardingCompleted` reads a
  // transient `false` → the intro re-fired on every visit home. By rAF time all
  // hydration effects have settled, so getState() returns the real value.
  // We also persist onboardingCompleted immediately (not at tour-end) so the
  // guard is durable even if the user abandons the tour.
  useEffect(() => {
    if (funnelStage !== 'idle') return
    let cancelled = false
    // Settle delay: auth resolution + per-user hydrateForUser + the async persist
    // rehydrate can all land across several frames. Waiting ~700ms then reading
    // getState() (NOT a reactive selector) guarantees we see the REAL persisted
    // onboardingCompleted, never a transient default-false — which is what made
    // the intro re-fire on every home visit.
    const id = window.setTimeout(() => {
      if (cancelled) return
      const ls = useLearningStore.getState()
      if (ls.onboardingCompleted) { setFunnelStage('done'); return }
      setFunnelStage('active')
      ls.completeOnboarding(ls.userName || '')
      // force=true: tour completion is stored globally, so a fresh account could
      // otherwise be skipped if a previous user already saw the intro.
      useTutorialStore.getState().startTour('tour-basic', tourStepIds('tour-basic'), true)
    }, 700)
    return () => { cancelled = true; window.clearTimeout(id) }
  }, [funnelStage])

  // When the intro tour ends during the funnel → open the goals questionnaire.
  useEffect(() => {
    const prev = prevTourRef.current
    prevTourRef.current = activeTour
    if (funnelStage === 'active' && prev && prev.id === 'tour-basic' && !activeTour) {
      setPlanWizardOpen(true)
    }
  }, [activeTour, funnelStage])

  // Questionnaire closed (finished OR skipped) → land on home with both cards
  // pulsing to point the user at the next action.
  const finishFunnel = useCallback(() => {
    if (funnelStage !== 'active') return
    setFunnelStage('done')
    setPulseCards(true)
    window.setTimeout(() => setPulseCards(false), 6000)
  }, [funnelStage])

  // ── Progress-driven home content ──────────────────────────────────────────
  // Ordered topic list: prefer the user's personal plan, else the canonical
  // easy-first course order (same chain the plan generator uses).
  const planOrder = personalPlan?.sequence?.map(s => s.topicId).filter(Boolean) ?? []
  const topicOrder = planOrder.length ? planOrder : TOPIC_ORDER
  const completedSet = new Set(completedLessons)
  // Current = the topic right AFTER the furthest-completed one. This puts the
  // user's position in the MIDDLE of the timeline — a done topic BEFORE it and
  // an upcoming topic AFTER it (user 2026-05-31: "where the person is should be
  // in the middle, with a before and an after"). Brand-new user → first topic;
  // everything done → last topic. Using furthest-done (not first-incomplete)
  // handles non-linear completion so a finished topic never appears "ahead".
  const completedIdxs = topicOrder.map((t, i) => (completedSet.has(t) ? i : -1)).filter(i => i >= 0)
  const lastDoneIdx = completedIdxs.length ? Math.max(...completedIdxs) : -1
  const currentIdx = Math.min(lastDoneIdx + 1, topicOrder.length - 1)
  const currentTopicId = topicOrder[currentIdx]
  const currentTopicName = HEBREW_LABELS[currentTopicId] || currentTopicId
  // Per-topic answered count — answers are stored as `studyhub-q<id>`.
  const currentTopicQuestions: Array<{ id: string }> =
    (quizBankData.topics as Record<string, any>)[currentTopicId]?.questions ?? []
  const answeredInTopic = currentTopicQuestions.filter(q => answeredIds.includes(`studyhub-q${q.id}`)).length
  const remainingInTopic = Math.max(0, currentTopicQuestions.length - answeredInTopic)
  const studyhubAnswered = answeredIds.some(id => id.startsWith('studyhub-q'))
  const hasAnyProgress = completedLessons.length > 0 || studyhubAnswered
  const topicPct = currentTopicQuestions.length
    ? Math.round((answeredInTopic / currentTopicQuestions.length) * 100)
    : 0
  // Up to 3 timeline stages centered on the current topic, clamped at edges.
  const windowStart = Math.max(0, Math.min(currentIdx - 1, topicOrder.length - 3))
  const timelineSlice = topicOrder.slice(windowStart, windowStart + 3).map(tid => ({
    topicId: tid,
    name: HEBREW_LABELS[tid] || tid,
    state: (tid === currentTopicId ? 'current' : completedSet.has(tid) ? 'done' : 'upcoming') as 'current' | 'done' | 'upcoming',
  }))

  return (
    <div className="ws-screen-pad" style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }} dir="rtl">
      <PersonalPlanWizard
        open={planWizardOpen}
        onClose={() => { setPlanWizardOpen(false); finishFunnel() }}
        onSelectTopic={onSelectTopic}
      />
      <style>{'@keyframes ws-card-pulse{0%,100%{box-shadow:0 0 0 0 rgba(51,81,202,0)}50%{box-shadow:0 0 0 6px rgba(51,81,202,0.28)}}'}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Personal study plan CTA / banner — opens 3-step intake wizard. */}
        {!personalPlan ? (
          <button
            onClick={() => setPlanWizardOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(245,200,66,0.18), rgba(212,175,55,0.10))',
              border: '1.5px solid rgba(212,175,55,0.55)',
              borderRadius: CARD_RADIUS,
              padding: '18px 24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16, textAlign: 'right',
              fontFamily: "'Rubik', sans-serif",
              boxShadow: '0 4px 16px rgba(212,175,55,0.18)',
            }}
          >
            <div style={{ fontSize: 36 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK }}>התאם תכנית אישית</div>
              <div style={{ fontSize: 13, color: TEXT_MED, marginTop: 3 }}>
                שאלון של פחות מדקה — נסדר את הנושאים בדיוק לפי המטרה והזמן שלך
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg,#F5C842,#D4AF37)', color: '#0B1B3E',
              padding: '8px 16px', borderRadius: 24, fontSize: 13, fontWeight: 700,
            }}>
              התחל ←
            </div>
          </button>
        ) : (
          <div style={{
            background: GLASS_CARD_SM,
            backdropFilter: 'blur(20px)',
            borderRadius: CARD_RADIUS,
            padding: '16px 22px',
            border: '1px solid rgba(212,175,55,0.45)',
            display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: "'Rubik', sans-serif",
            boxShadow: CARD_SHADOW,
          }}>
            <div style={{ fontSize: 28 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK }}>
                התכנית שלך · {personalPlan.sequence.length} נושאים · {personalPlan.dailyTargetMin} דק׳ ביום
              </div>
              <div style={{ fontSize: 12, color: TEXT_MED, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {personalPlan.sequence.slice(0, 4).map(s => HEBREW_LABELS[s.topicId] || s.topicId).join(' → ')}
                {personalPlan.sequence.length > 4 ? ' …' : ''}
              </div>
            </div>
            <button
              onClick={() => setPlanWizardOpen(true)}
              style={{
                background: 'rgba(212,175,55,0.18)', color: '#8a6d1c',
                border: '1px solid rgba(212,175,55,0.45)',
                borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >✏️ ערוך</button>
            <button
              onClick={() => { if (confirm('לאפס את התכנית האישית?')) clearPersonalPlan() }}
              style={{
                background: 'transparent', color: '#9a3b3b',
                border: '1px solid rgba(154,59,59,0.3)',
                borderRadius: 10, padding: '6px 10px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >🗑</button>
          </div>
        )}

        {/* Motivation widgets row removed per user feedback (kanban B7) —
            home was too crowded. The 2-min challenge card (leftmost) stays
            accessible via the TwoMinChallengeCard preserved in motivation/,
            ready to be wired into a dedicated motivation tab in the future. */}

        {/* Onboarding tutorial video — replay card + first-visit auto-modal. */}
        <IntroTutorialVideo />

        {/* ── ROW 1 ──────────────────────────────────── */}
        <div className="ws-home-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* Card: כמעט שם! (תרגול) — order:2 so it sits on the LEFT in RTL,
              after the study card. User asked to swap study↔practice. */}
          <div className="ws-glass-card" style={{
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 22px',
            display: 'flex', flexDirection: 'column',
            order: 2,
            animation: pulseCards ? 'ws-card-pulse 1.4s ease-out 3' : undefined,
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 6 }}>תרגול</div>
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_TIP, lineHeight: 1.6, marginBottom: 16 }}>
              {completedLessons.length === 0 ? (
                <>בואו נתחיל בהתחלה<br />{currentTopicName}</>
              ) : answeredInTopic > 0 && remainingInTopic > 0 ? (
                <>נשארו לך עוד {remainingInTopic} שאלות<br />{currentTopicName}</>
              ) : (
                <>נמשיך מאיפה שעצרת<br />{currentTopicName}</>
              )}
            </div>
            {/* Rotating 3D hero — same Kenney-building cycler as the landing
                page, scaled to ~150px tall to fit the home card. Replaces the
                old static temple PNG with the live cycling preview. */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16, minHeight: 150, height: 150, borderRadius: 12, overflow: 'hidden' }}>
              <Suspense fallback={<div style={{ color: 'rgba(31,41,55,0.4)', fontSize: 12 }}>טוען…</div>}>
                <HeroScene />
              </Suspense>
            </div>
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginBottom: 8, textAlign: 'right' }}>הצעה למבנה הבא בעירך</div>
            {/* Progress bar — reflects answered share of the current topic */}
            <div style={{ height: 7, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${topicPct}%`, height: '100%', background: 'rgba(212,175,55,0.7)', borderRadius: 10, transition: 'width 0.4s' }} />
            </div>
            {/* Brand-new user (zero progress) → jump straight into the intro
                practice quiz, bypassing the difficulty picker. Returning users
                keep the existing picker flow so they can pick difficulty / resume. */}
            <button onClick={() => (completedLessons.length > 0 ? onSelectTopic(currentTopicId) : onStartPractice(currentTopicId))}
              className="ws-cta-btn"
              style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px rgba(18,36,96,0.3)' }}>
              {completedLessons.length > 0 ? 'המשך ←' : 'בוא נתרגל ←'}
            </button>
          </div>

          {/* Card: לימוד חומר — order:1 so it sits on the RIGHT in RTL (first). */}
          <div className="ws-glass-card" style={{
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 24px',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            order: 1,
            animation: pulseCards ? 'ws-card-pulse 1.4s ease-out 3' : undefined,
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_MED, marginBottom: 16, textAlign: 'right' }}>לימוד חומר</div>
            {/* Whiteboard area with glassmorphism */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.51) 54.33%, rgba(255,255,255,0.17) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: CARD_SHADOW,
              borderRadius: CARD_RADIUS,
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 160,
            }}>
              {/* "טיפ" label */}
              <div style={{ position: 'absolute', top: 16, left: 20, fontFamily: "'Rubik', sans-serif", fontSize: 18, color: TEXT_TIP }}>טיפ</div>
              {/* Floating 3D cube (CSS) */}
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, opacity: 0.7, transform: 'rotate(22deg)' }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="40,5 75,22 75,58 40,75 5,58 5,22" fill="rgba(131,178,248,0.35)" stroke="rgba(131,178,248,0.6)" strokeWidth="1.5" />
                  <polygon points="40,5 75,22 40,39 5,22" fill="rgba(131,178,248,0.5)" stroke="rgba(131,178,248,0.7)" strokeWidth="1" />
                  <polygon points="40,39 75,22 75,58 40,75" fill="rgba(51,81,202,0.25)" />
                </svg>
              </div>
              <div style={{ position: 'absolute', bottom: -15, left: -15, width: 70, height: 70, opacity: 0.5, transform: 'rotate(-89deg)' }}>
                <svg viewBox="0 0 70 70" fill="none">
                  <ellipse cx="35" cy="35" rx="30" ry="28" fill="rgba(51,81,202,0.2)" stroke="rgba(131,178,248,0.4)" strokeWidth="1" />
                  <ellipse cx="35" cy="35" rx="18" ry="16" fill="rgba(51,81,202,0.3)" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 18, color: TEXT_DARK, lineHeight: 1.9, textAlign: 'right', marginTop: 40 }}>
                בוא נמפה את הנושאים בקורס שלך
              </div>
            </div>
            {/* CTA button — liquid-glass to match the תרגול card's ws-cta-btn.
                Map starts collapsed, so the label is "בוא נלמד" (let's learn). */}
            <button onClick={onGoMindmap} className="ws-cta-btn"
              style={{ marginTop: 12, background: BUTTON_COLOR, color: '#fff', border:'none', borderRadius:24, padding:'11px 0', fontWeight:600, fontSize:16, cursor:'pointer', fontFamily:"'Rubik',sans-serif", width:'100%', boxShadow:'0px 2px 6px rgba(18,36,96,0.3)' }}>
              📖 בוא נלמד ←
            </button>
          </div>
        </div>

        {/* ── LEARNING INSIGHTS — accuracy + what to strengthen ── */}
        <LearningInsights />

        {/* ── LEARNING PATH STRIP ─────────────────────── */}
        <div style={{
          background: GLASS_CARD_SM,
          backdropFilter: 'blur(20px)',
          boxShadow: CARD_SHADOW,
          borderRadius: CARD_RADIUS,
          padding: '22px 40px',
          border: '1px solid rgba(255,255,255,0.4)',
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', left: '10%', right: '10%', top: 28, height: 1, border: '1px solid #F4C52E', zIndex: 0 }} />

            {/* Stages — progress-driven slice centered on the current topic.
                done = green check · current = gold gem · upcoming = small node. */}
            {timelineSlice.map(stage => (
              <div key={stage.topicId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
                {stage.state === 'done' ? (
                  <div style={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #34A853 0%, #22833F 100%)',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(52,168,83,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* Proper-orientation check ✓ (no Y-flip) */}
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : stage.state === 'current' ? (
                  <div style={{
                    width: 35, height: 35,
                    background: 'linear-gradient(115.34deg, rgba(255,194,0,0.35) -8.31%, rgba(154,106,4,0.5) 168.93%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 24,
                    boxShadow: '0px 3px 5.8px rgba(142,122,59,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* Gold gem */}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <polygon points="9,2 15,7 9,16 3,7" fill="rgba(212,175,55,0.8)" stroke="rgba(212,175,55,1)" strokeWidth="1" />
                      <polygon points="9,2 15,7 9,10 3,7" fill="rgba(255,220,80,0.5)" />
                    </svg>
                  </div>
                ) : (
                  <div style={{
                    width: 27, height: 27,
                    background: 'linear-gradient(34.36deg, #E6C55D -10.48%, #806E34 267.01%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 24,
                    boxShadow: '0px 3px 5.8px rgba(142,122,59,0.5)',
                    transform: 'matrix(1,0,0,-1,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="2" width="6" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
                      <path d="M5 5.5h4M5 7.5h3" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
                      <circle cx="7" cy="11" r="1.5" fill="rgba(255,255,255,0.5)" />
                    </svg>
                  </div>
                )}
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: stage.state === 'current' ? 16 : 14, color: TEXT_DARK, textAlign: 'center', fontWeight: stage.state === 'upcoming' ? 400 : 600 }}>{stage.name}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: stage.state === 'done' ? '#22833F' : TEXT_LIGHT, fontWeight: stage.state === 'done' ? 600 : 400 }}>
                  {stage.state === 'done' ? '✓ הושלם' : stage.state === 'current' ? '(עכשיו)' : '(בקרוב)'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RISK BOARD ─────────────────────────────── */}
        <RiskBoard onSelectTopic={onSelectTopic} />

        {/* ── ROW 2 ──────────────────────────────────── */}
        <div className="ws-home-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Card: Activity chart */}
          <div className="ws-card-pad" style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: '24px 20px 16px',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <ActivityChart />
          </div>

          {/* Card: העולם שלי */}
          <div className="ws-card-pad" style={{
            background: GLASS_CARD,
            backdropFilter: 'blur(20px)',
            boxShadow: CARD_SHADOW,
            borderRadius: CARD_RADIUS,
            padding: 28,
            display: 'flex', flexDirection: 'column', gap: 12,
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, textAlign: 'right' }}>העולם שלי</div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'center', background: 'rgba(212,175,55,0.12)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: '#D4AF37' }}>⭐ {xp}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>XP סה"כ</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(52,168,83,0.10)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(52,168,83,0.25)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: '#34A853' }}>✓ {totalCorrect}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>תשובות נכונות</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(51,81,202,0.10)', borderRadius: 14, padding: '8px 14px', border: '1px solid rgba(51,81,202,0.22)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_MED }}>🔥 {currentStreak}</div>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT }}>ימים ברצף</div>
              </div>
            </div>

            {/* XP level bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>רמה {level}</span>
                <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT }}>{xpInLevel}/{XP_PER_LEVEL} נק׳</span>
              </div>
              <div style={{ height: 7, background: 'rgba(212,175,55,0.15)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%`, height: '100%', background: 'rgba(212,175,55,0.75)', borderRadius: 10, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{ flex: 1 }} />
            <button onClick={onGoWorld} className="ws-cta-btn"
              style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px rgba(18,36,96,0.3)' }}>
              כניסה לעולם
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── XP Burst animation ─────────────────────────────────────────────────────────
function XpBurst({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, pointerEvents: 'none',
      animation: 'xpBurst 1.4s ease-out forwards',
    }}>
      <style>{`
        @keyframes xpBurst {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(0px); }
          20%  { opacity: 1; transform: translateX(-50%) scale(1.3) translateY(-10px); }
          70%  { opacity: 1; transform: translateX(-50%) scale(1.1) translateY(-30px); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(-60px); }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg,#D4AF37,#F5CC50)',
        borderRadius: 99, padding: '10px 22px',
        boxShadow: '0 4px 24px rgba(212,175,55,0.5)',
        fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22,
        color: '#fff', whiteSpace: 'nowrap',
      }}>
        +{amount} XP ⭐
      </div>
    </div>
  )
}

// ── Learning area screen ───────────────────────────────────────────────────────
interface LearningScreenProps {
  onBack: () => void
  selectedTopic?: string
  difficultyFilter?: DifficultyFilter
  userProgress: UserProgress
  onProgressUpdate: (progress: UserProgress) => void
  userId?: string
  isMobile?: boolean
  /** Distraction-free mode: parent hides sidebar+topbar when true. */
  fullscreen?: boolean
  onToggleFullscreen?: () => void
}

function LearningScreen({ onBack, selectedTopic, difficultyFilter = 'all', userProgress, onProgressUpdate, userId, isMobile = false, fullscreen = false, onToggleFullscreen }: LearningScreenProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  // Coachmark anchor for the quiz card (first time the user sees a question)
  const quizTutRef = useRef<HTMLTextAreaElement>(null)
  useTutorialStep('quiz-intro', quizTutRef, {
    title: 'איך עונים על שאלה',
    body: 'כתוב את התשובה כאן (תומך בעברית RTL). אם המערכת מזהה מספר בתשובה היא תבדוק אוטומטית עם טווח סבילות של ±0.3. אפשר גם לנתק את הכרטיסייה לחלון צף עם ⤢.',
    placement: 'top',
  })
  const [phase, setPhase] = useState<'write' | 'review' | 'done'>('write')
  const [xpBurst, setXpBurst] = useState<number | null>(null)
  // Store each question's typed answer so users can navigate back and re-read
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  // MC-mode: tracks which option index the user clicked for the current question.
  // Null while unanswered; reset on question change. Used for green/red feedback.
  const [mcSelected, setMcSelected] = useState<number | null>(null)
  // ── Ask-a-Human ("🙋 שאל בן אדם") ──────────────────────────────────────────
  // Per-questionId map: 'sending' while writing to the relay, 'pending' once
  // queued (waiting on a human), 'answered' when a reply arrives.
  const [helpState, setHelpState] = useState<Record<string, 'sending' | 'pending' | 'answered'>>({})
  const [helpAnswer, setHelpAnswer] = useState<Record<string, string>>({})
  // Two-mode layout:
  //   tab === 'none'  → calm centered card, tabs row is the LAUNCHER.
  //   tab !== 'none'  → companion tool fills the screen; question becomes a
  //                     floating chip docked top-right (RTL primary corner).
  //                     chipExpanded toggles between a tiny pill and a full
  //                     compact card with answer field + dots.
  const [tab, setTab] = useState<'none' | 'mindmap' | 'arsenal' | 'canvas' | 'excalidraw'>('none')
  const [chipExpanded, setChipExpanded] = useState<boolean>(true)
  // "⊟ פיצול מסך" FAB → swap-pane dropdown. Lists the companion surfaces that
  // can fill the BOTTOM pane (תרגול is always locked on top). The currently
  // active surface is excluded so we never offer a pane already in the split.
  // Per user 2026-05-29.
  const [splitMenuOpen, setSplitMenuOpen] = useState<boolean>(false)
  // Pop-out + drag state for the question card. When floatMode is true the
  // card detaches into a draggable floating panel positioned at floatPos.
  const [floatMode, setFloatMode] = useState<boolean>(false)
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 580) : 60,
    y: 90,
  }))
  const floatDragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null)
  const onFloatHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile || tab === 'none') return
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    let ox = floatPos.x
    let oy = floatPos.y
    if (!floatMode) {
      // Card is stacked — grab its current rect and initiate float from there
      const cardEl = (e.currentTarget as HTMLElement).parentElement
      const rect = cardEl?.getBoundingClientRect()
      ox = rect ? rect.left : Math.max(20, window.innerWidth - 460)
      oy = rect ? rect.top : 90
      setFloatMode(true)
      setFloatPos({ x: ox, y: oy })
    }
    floatDragRef.current = { ox, oy, sx: e.clientX, sy: e.clientY }
    const onMove = (ev: MouseEvent) => {
      const d = floatDragRef.current; if (!d) return
      setFloatPos({
        x: Math.max(8, Math.min(window.innerWidth - 340, d.ox + (ev.clientX - d.sx))),
        y: Math.max(8, Math.min(window.innerHeight - 100, d.oy + (ev.clientY - d.sy))),
      })
    }
    const onUp = () => {
      floatDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [floatMode, floatPos.x, floatPos.y, isMobile, tab])
  const contentRowRef = useRef<HTMLDivElement>(null)
  const recordAnswer = useLearningStore(s => s.recordAnswer)
  const recordErrorTag = useLearningStore(s => s.recordErrorTag)
  const completePracticeSession = useLearningStore(s => s.completePracticeSession)

  // ── Feature gating for the companion-tool tabs + split FAB ──────────────────
  // Each bottom-pane surface is an unlock-ladder feature; the split FAB itself is
  // split-screen (810 XP). adminMode flushes every gate. One predicate
  // (isFeatureUnlocked) drives the locked styling + the handleSetTab guard.
  const _adminMode = useLearningStore(s => s.adminMode)
  const _unlockedFeatures = useLearningStore(s => s.unlockedFeatures)
  const TOOL_FEATURE: Partial<Record<typeof tab, FeatureId>> = {
    mindmap: 'mindmap-edit', canvas: 'whiteboard-basic', excalidraw: 'whiteboard-full', arsenal: 'arsenal',
  }
  const toolLocked = (key: typeof tab): boolean => {
    const f = TOOL_FEATURE[key]
    return !!f && !isFeatureUnlocked(f, _unlockedFeatures, _adminMode)
  }
  const toolLockTip = (key: typeof tab): string | undefined => {
    const f = TOOL_FEATURE[key]
    return f ? FEATURE_UNLOCKS_BY_ID[f]?.descriptionHe : undefined
  }
  const splitLocked = !isFeatureUnlocked('split-screen', _unlockedFeatures, _adminMode)

  // Mistake Autopsy: shown after a wrong self-assessment before advancing
  const [autopsyOpen, setAutopsyOpen] = useState(false)
  const [autopsyDots, setAutopsyDots] = useState<Array<'empty' | 'current' | 'correct' | 'wrong' | 'future'> | null>(null)
  // "תרגל את הטעויות" — when set, the question list is restricted to these ids.
  const [retryWrongIds, setRetryWrongIds] = useState<string[] | null>(null)
  // Consecutive-correct streak → combo bonus XP + a flame indicator.
  const [streak, setStreak] = useState(0)

  // When any companion tool opens → auto-float the question card on desktop,
  // or switch to bottom-sheet mode on mobile. Closing tool → back to normal.
  // Also auto-enter fullscreen (hides sidebar + topbar) on tab activation so
  // the canvas + question get full viewport. Closing tab → exit fullscreen.
  const handleSetTab = useCallback((newTab: typeof tab) => {
    // Locked surface → no-op (gate every entry point at once).
    if (newTab !== 'none') {
      const f = TOOL_FEATURE[newTab]
      if (f && !isFeatureUnlocked(f, _unlockedFeatures, _adminMode)) return
    }
    setTab(newTab)
    setChipExpanded(true)
    if (newTab === 'none') {
      setFloatMode(false)
      // Tab cleared → restore chrome
      if (fullscreen && onToggleFullscreen) onToggleFullscreen()
    } else {
      // Tab opened → auto-hide chrome if not already
      if (!fullscreen && onToggleFullscreen) onToggleFullscreen()
    }
  }, [fullscreen, onToggleFullscreen, _unlockedFeatures, _adminMode])

  // Register the in-practice 'switch-canvas' tour action so guided tours can
  // open the canvas (full-screen on mobile, side-by-side on desktop) and
  // spotlight it. Only active while LearningScreen is mounted.
  useEffect(() => {
    const cleanups = [
      registerTourAction('switch-canvas', () => handleSetTab('canvas')),
      // Open the canvas, then tell the wb iframe to expand its ∑Formulas panel
      // (mindmap.html listens for {type:'ws-open-formula'}). Demonstrates the
      // formula library "live" inside split-screen.
      registerTourAction('open-formula-panel', () => {
        handleSetTab('canvas')
        setTimeout(() => {
          const f = document.querySelector<HTMLIFrameElement>('iframe[src*="mode=wb"]')
          f?.contentWindow?.postMessage({ type: 'ws-open-formula' }, '*')
        }, 900)
      }),
    ]
    return () => cleanups.forEach(fn => fn())
  }, [handleSetTab])

  // Esc to exit fullscreen (don't hijack when editing inside a textarea)
  useEffect(() => {
    if (!fullscreen || !onToggleFullscreen) return
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      onToggleFullscreen()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [fullscreen, onToggleFullscreen])

  // Load questions from selected topic, sorted progressively easy → medium → hard.
  // XP scales with difficulty so harder questions feel more rewarding.
  const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
  const DIFFICULTY_XP: Record<string, number> = { easy: 10, medium: 15, hard: 25 }
  const questions = selectedTopic && (quizBankData.topics as Record<string, any>)[selectedTopic]
    ? [...(quizBankData.topics as Record<string, any>)[selectedTopic].questions]
        .filter((q: any) => difficultyFilter === 'all' || q.difficulty === difficultyFilter)
        .filter((q: any) => !retryWrongIds || retryWrongIds.includes(q.id))
        .sort((a: any, b: any) => (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1))
        .map((q: any) => ({
          id: q.id,
          topic: selectedTopic,
          text: q.question,
          answer: q.explanation,
          xp: DIFFICULTY_XP[q.difficulty] ?? 15,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard' | undefined,
          // MC schema (v1) — preserved for the multiple-choice render path
          format: q.format as 'mc' | undefined,
          options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : undefined,
          correctAnswer: q.correct_answer as string | undefined,
        }))
    : QUESTIONS

  const [dotStates, setDotStates] = useState<Array<'empty' | 'current' | 'correct' | 'wrong' | 'future'>>(
    questions.map((_: any, i: number) => i === 0 ? 'current' : 'empty')
  )

  const q = questions[currentQ]
  const total = questions.length
  const answeredCount = dotStates.filter(s => s === 'correct' || s === 'wrong').length
  const correctCount = dotStates.filter(s => s === 'correct').length

  const handleReveal = () => {
    if (!answer.trim()) return
    setUserAnswers(prev => ({ ...prev, [currentQ]: answer }))
    setPhase('review')
  }

  // ── Ask-a-Human: package {question, topic, attempt, userId, ts} → relay ──────
  // Stable per-question id so re-asking doesn't duplicate the queue entry.
  const helpId = q ? `studyhub-q${q.id}` : ''
  const helpStatus = helpState[helpId] ?? (helpId && hasPendingHelp(helpId) ? 'pending' : undefined)

  const handleAskHuman = async () => {
    if (!q || !helpId) return
    if (helpStatus === 'sending' || helpStatus === 'pending' || helpStatus === 'answered') return
    setHelpState(prev => ({ ...prev, [helpId]: 'sending' }))
    // Capture the student's current attempt (typed answer or chosen MC option).
    const attempt = answer.trim()
      ? answer.trim()
      : mcSelected !== null && Array.isArray((q as any).options)
        ? `בחר/ה: ${(q as any).options[mcSelected]}`
        : null
    try {
      await submitHelpRequest({
        questionId: helpId,
        question: q.text,
        topicId: selectedTopic ?? q.topic ?? null,
        attempt,
        userId: userId ?? null,
      })
    } catch {
      /* submit always queues locally; ignore mirror errors */
    }
    // Best-effort: screenshot the question + email it to Barak via /api/ask-human.
    // Capture BEFORE flipping to 'pending' so the card still shows the question.
    let screenshot: string | null = null
    try {
      if (contentRowRef.current) {
        screenshot = await toPng(contentRowRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      }
    } catch {
      /* canvas/iframe taint or unsupported node — send without the image */
    }
    void emailHelpRequest({
      question: q.text,
      attempt,
      userId: userId ?? null,
      topicId: selectedTopic ?? q.topic ?? null,
      screenshot,
    })
    setHelpState(prev => ({ ...prev, [helpId]: 'pending' }))
  }

  // Poll for a human reply to whichever question the student is viewing, if it
  // was escalated. Surfaces the answer inline when it lands.
  useEffect(() => {
    if (!helpId || helpStatus !== 'pending') return
    let cancelled = false
    const check = async () => {
      const ans = await fetchHelpAnswer(helpId)
      if (cancelled || !ans) return
      setHelpAnswer(prev => ({ ...prev, [helpId]: ans }))
      setHelpState(prev => ({ ...prev, [helpId]: 'answered' }))
    }
    void check()
    const t = setInterval(check, 30000)
    return () => { cancelled = true; clearInterval(t) }
  }, [helpId, helpStatus])

  // Auto-check numeric answers with ±0.3 tolerance. Returns {correct, expected}
  // when the model answer contains a recognisable number, otherwise null and
  // the UI falls back to manual self-assessment.
  const autoCheckResult = (() => {
    if (phase !== 'review' || !q) return null
    const nums = (s: string): number[] => {
      const matches = String(s ?? '').match(/-?\d+(?:[.,]\d+)?/g) || []
      return matches.map(t => parseFloat(t.replace(',', '.'))).filter(n => !Number.isNaN(n))
    }
    const userNums = nums(answer)
    const modelNums = nums(q.answer)
    if (modelNums.length === 0 || userNums.length === 0) return null
    // Last number in the model answer is almost always the final result
    // ("...לכן הממוצע הוא 4.2" ends in 4.2). Compare the user's last number.
    const expected = modelNums[modelNums.length - 1]
    const got = userNums[userNums.length - 1]
    const correct = Math.abs(got - expected) <= 0.3
    return { correct, expected, got }
  })()

  // Navigate to any question by clicking its dot
  const navigateToQuestion = (index: number) => {
    if (index === currentQ) return
    if (index < 0 || index >= questions.length) return
    const state = dotStates[index]
    // Block only FORWARD jumps to unseen questions. Going BACK is always allowed
    // — including to a skipped ('empty') earlier question (user: "must be able to
    // go back!"). Previously any 'empty' target was blocked, so back-to-skipped
    // silently failed.
    if (state === 'empty' && index > currentQ) return
    // Save current in-progress answer before leaving
    if (answer.trim()) setUserAnswers(prev => ({ ...prev, [currentQ]: answer }))
    setCurrentQ(index)
    setAnswer(userAnswers[index] || '')
    // Reset MC selection — for already-answered MC questions we let the user
    // pick again rather than locking the buttons; the dot state stays correct/wrong.
    setMcSelected(null)
    if (state === 'correct' || state === 'wrong') {
      setPhase('review')
    } else {
      setPhase('write')
    }
  }

  // Quiz prev/next — same UX as LessonScreen. 'הקודם' goes back if there's a
  // previous question (always navigable since it's already been seen).
  // 'הבא' is PURE NAVIGATION (per user 2026-07-25): it moves on without the
  // current question being answered, graded or penalised for you. An untouched
  // question stays 'empty' (revisitable, never counted wrong) and the combo
  // streak survives — only the explicit 'דלג' link breaks it. On the last
  // question 'הבא' ends the session instead of being disabled.
  const isFirstQ = currentQ === 0
  const isLastQ = currentQ === total - 1
  const canGoNextQ =
    currentQ + 1 < total &&
    dotStates[currentQ + 1] !== 'empty' // already visited
  const navPrev = () => { if (!isFirstQ) navigateToQuestion(currentQ - 1) }
  const navNext = () => {
    // Already-visited target → restore its saved answer / review state.
    if (canGoNextQ) { navigateToQuestion(currentQ + 1); return }
    // Keep any draft the user typed so coming back doesn't lose it.
    if (answer.trim()) setUserAnswers(prev => ({ ...prev, [currentQ]: answer }))
    const next = [...dotStates]
    if (next[currentQ] === 'current') next[currentQ] = 'empty'
    setDotStates(next)
    goNext(next)   // past the last question this finishes the session
  }

  const handleSelfAssess = (correct: boolean) => {
    let xpReward = correct ? q.xp : 0
    // Memory Tea: double XP for the next 3 correct answers
    if (correct && xpReward > 0 && useArsenalStore.getState().activePotion === 'tip') {
      xpReward = xpReward * 2
      useArsenalStore.getState().consumeMemoryTea()
    }
    recordAnswer(`studyhub-q${q.id}`, correct, xpReward)

    const next = [...dotStates]
    next[currentQ] = correct ? 'correct' : 'wrong'
    setDotStates(next)

    if (correct && xpReward > 0) {
      setXpBurst(xpReward)
    }

    if (!correct) {
      // Wrong answer — open Mistake Autopsy. Advancing stays the user's call.
      setAutopsyDots(next)
      setAutopsyOpen(true)
    }
    // Correct: NO auto-advance. The review panel switches to its
    // "already assessed" state (result chip + הקודם / הבא / סיום), so the user
    // reads the solution and moves on when ready. Per user 2026-07-25.
  }

  const handleAutopsyDone = (tag: ErrorTag | null) => {
    setAutopsyOpen(false)
    if (tag && q) recordErrorTag(q.id, tag)
    if (autopsyDots) setDotStates(autopsyDots)
    // No auto-advance — closing the autopsy returns to the question with the
    // right answer revealed; 'הבא ←' moves on.
  }

  const handleQuizComplete = () => {
    if (!selectedTopic) return

    // Record quiz session in progress store
    const topicData = (quizBankData.topics as Record<string, any>)[selectedTopic]
    if (!topicData) return

    const answers: QuizAnswer[] = questions.map((q: any, i: number) => ({
      questionId: q.id || `q${i}`,
      answered: dotStates[i] !== 'empty',
      correct: dotStates[i] === 'correct',
      userAnswer: answer,
    }))

    const duration = 0 // Could track actual time if needed
    const updatedProgress = recordQuizSession(
      userProgress,
      selectedTopic,
      topicData.concept || selectedTopic,
      topicData.building || '',
      answers,
      duration
    )

    onProgressUpdate(updatedProgress)
  }

  const handleSkip = () => {
    const next = [...dotStates]
    // Skipping / pressing "הבא" without answering must NOT penalize: leave the
    // question UNANSWERED ('empty'), so it stays revisitable and never counts as
    // wrong. Applies to every topic quiz (shared LearningScreen). Per user
    // 2026-05-31: advancing should treat the question as not-yet-answered.
    if (next[currentQ] === 'current') next[currentQ] = 'empty'
    setDotStates(next)
    setStreak(0)   // skipping breaks the combo
    goNext(next)
  }

  const goNext = (currentDots?: typeof dotStates) => {
    const dots = currentDots ?? dotStates
    const ni = currentQ + 1
    if (ni >= total) {
      setPhase('done')
      // A full practice session finished → bump the counter that gates the
      // basic-tier feature unlocks (arsenal after 1, pomodoro after 2, …).
      completePracticeSession()
      return
    }
    const next = [...dots]
    if (next[ni] === 'empty') next[ni] = 'current'
    setDotStates(next)
    setCurrentQ(ni)
    setAnswer('')
    setMcSelected(null)
    setPhase('write')
  }

  const handleReset = () => {
    setRetryWrongIds(null)        // full topic again
    setStreak(0)
    setCurrentQ(0)
    setAnswer('')
    setMcSelected(null)
    setPhase('write')
    setDotStates(questions.map((_: any, i: number) => i === 0 ? 'current' : 'empty'))
  }

  // Re-run only the questions answered wrong this session (spaced practice of
  // mistakes). dotStates is set to the wrong-count explicitly so it matches the
  // filtered question list on the next render.
  const handleRetryWrong = () => {
    // Everything not answered correctly — wrong AND skipped (skip leaves 'empty').
    const wrongIds = questions.filter((_: any, i: number) => dotStates[i] !== 'correct').map((qq: any) => qq.id)
    if (!wrongIds.length) { handleReset(); return }
    setRetryWrongIds(wrongIds)
    setStreak(0)
    setCurrentQ(0)
    setAnswer('')
    setMcSelected(null)
    setPhase('write')
    setDotStates(wrongIds.map((_: string, i: number) => i === 0 ? 'current' : 'empty'))
  }

  // MC click handler — commits the answer immediately, shows green/red feedback,
  // then advances. Mirrors handleSelfAssess but skips the textarea/review flow.
  const handleMcChoose = (idx: number) => {
    if (mcSelected !== null || !q) return
    const opts: string[] | undefined = (q as any).options
    const correctIdx: number | undefined = (q as any).correctIndex
    if (!opts || typeof correctIdx !== 'number') return

    setMcSelected(idx)
    const chosenText = opts[idx]
    setAnswer(chosenText)
    setUserAnswers(prev => ({ ...prev, [currentQ]: chosenText }))

    const correct = idx === correctIdx
    let xpReward = correct ? q.xp : 0
    if (correct && xpReward > 0 && useArsenalStore.getState().activePotion === 'tip') {
      xpReward = xpReward * 2
      useArsenalStore.getState().consumeMemoryTea()
    }
    // Combo streak: +5 bonus XP at 3, 5, then every 5 in a row. Wrong resets it.
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak === 3 || newStreak === 5 || (newStreak >= 10 && newStreak % 5 === 0)) xpReward += 5
    } else {
      setStreak(0)
    }
    recordAnswer(`studyhub-q${q.id}`, correct, xpReward)

    const nextDots = [...dotStates]
    nextDots[currentQ] = correct ? 'correct' : 'wrong'
    setDotStates(nextDots)

    if (correct && xpReward > 0) setXpBurst(xpReward)

    if (!correct) {
      // Wrong — keep feedback visible briefly, then open Mistake Autopsy
      setTimeout(() => {
        setAutopsyDots(nextDots)
        setAutopsyOpen(true)
      }, 900)
    }
    // Correct: the explanation stays on the board and we do NOT jump on our own
    // (was a 4.5s auto-advance that yanked the question away mid-read).
    // 'הבא ←' in the header is the only thing that moves the session forward.
  }

  // Keyboard answering for MCQ: press A–D or 1–4 to choose (matches the letter
  // pill on each card). Speeds up practice; ignored while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const ae = document.activeElement as HTMLElement | null
      const tag = ae?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || ae?.isContentEditable) return
      if (!q || (q as any).format !== 'mc' || !Array.isArray((q as any).options)) return
      if (mcSelected !== null) return // already answered
      const opts = (q as any).options as string[]
      let idx = -1
      if (e.key >= '1' && e.key <= '9') idx = parseInt(e.key, 10) - 1
      else { const k = e.key.toLowerCase(); if (k >= 'a' && k <= 'z') idx = k.charCodeAt(0) - 97 }
      if (idx >= 0 && idx < opts.length) { e.preventDefault(); handleMcChoose(idx) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, mcSelected])

  const isDone = phase === 'done'

  // Calm mode (no companion tool, mid-session) = the whiteboard IS the page:
  // no outer card, board stretched to the full content area. bigBoard also
  // scales the type/controls drawn on it so the extra room is actually used.
  // Per user 2026-07-25: "way too small … drop the outside card, extract the
  // whiteboard and increase its width and length".
  // floatMode is excluded: there the card lives in a 420px fixed window that
  // still needs its own draggable header strip.
  const boardFullBleed = tab === 'none' && !isDone && !floatMode
  const bigBoard = boardFullBleed && !isMobile

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} dir="rtl">
      {xpBurst !== null && <XpBurst amount={xpBurst} onDone={() => setXpBurst(null)} />}

      {/* Fullscreen FAB stack (visible only when fullscreen / chrome hidden).
          ISSUE 4 (2026-05-31): these left-edge FABs used to sit at left:12 and
          the home FAB at top:12 — that covered the ∑Formulas rail (a 34px-wide
          full-height toggle on the LEFT edge of the mindmap/canvas iframe), the
          top scrollbar, and the canvas prev/next nav pill. Fixes:
            • left lane pushed to FAB_LEFT (52) so it clears the 34px ∑Formulas
              rail with a comfortable gap.
            • home FAB moved OUT of the top corner and into the bottom-left
              stack so it never overlaps the top scrollbar / nav pill.
            • vertical stack (above TutorFAB which ends ~bottom 76):
                bottom: 90  → ☰ הצג כלי לימוד
                bottom:150  → ⊟ פיצול מסך
                bottom:210  → 🏠 דף הבית
              60px steps keep 44px-min FABs from touching. */}
      {/* MOBILE (≤768px): the three stacked FABs above overlapped the answer
          cards. Collapse them into ONE round menu FAB whose popover offers the
          same actions (home / show-tools / split-pane picker). */}
      {fullscreen && onToggleFullscreen && isMobile && (
        <>
          <button
            data-tour="split-btn"
            onClick={() => setSplitMenuOpen(o => !o)}
            aria-label="תפריט כלים"
            aria-haspopup="menu"
            aria-expanded={splitMenuOpen}
            title="תפריט כלים"
            style={{
              position: 'fixed', top: 64, left: 16, zIndex: 300,
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
              color: '#0B1B3E', border: 0,
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, cursor: 'pointer',
            }}
          >
            {splitMenuOpen ? '✕' : '⋮'}
          </button>
          {splitMenuOpen && (
            <>
              <div onClick={() => setSplitMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 305, background: 'transparent' }} />
              <div
                role="menu" aria-label="תפריט כלים" dir="rtl"
                style={{
                  position: 'fixed', top: 124, left: 16, zIndex: 306,
                  background: '#FBF8F1', border: '1px solid rgba(212,175,55,0.55)',
                  borderRadius: 12, boxShadow: '0 10px 28px rgba(11,27,62,0.30)',
                  padding: 6, minWidth: 200, fontFamily: "'Rubik', sans-serif",
                }}
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    try { onBack() } catch(_){}
                    try { window.location.hash = '#study' } catch(_){}
                    setSplitMenuOpen(false)
                  }}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'start', background: 'transparent', border: '1px solid transparent', borderRadius: 8, padding: '11px 10px', color: '#1F3E6C', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
                >🏠 דף הבית</button>
                <button
                  role="menuitem"
                  onClick={() => { onToggleFullscreen(); setSplitMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'start', background: 'transparent', border: '1px solid transparent', borderRadius: 8, padding: '11px 10px', color: '#1F3E6C', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
                >☰ הצג כלי לימוד</button>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1F3E6C', opacity: 0.6, padding: '8px 10px 4px', borderTop: '1px solid rgba(212,175,55,0.3)', marginTop: 4 }}>פיצול מסך</div>
                {([
                  ['mindmap',    '🧠 מפת חשיבה'],
                  ['canvas',     '✏️ קנבס'],
                  ['excalidraw', '🎨 לוח ציור'],
                  ['arsenal',    '🎯 הארסנל שלי'],
                ] as const)
                  .filter(([key]) => key !== tab)
                  .map(([key, label]) => {
                    const locked = toolLocked(key as typeof tab)
                    return (
                    <button
                      key={key} role="menuitem"
                      aria-disabled={locked || undefined}
                      title={locked ? toolLockTip(key as typeof tab) : undefined}
                      onClick={() => { if (locked) return; handleSetTab(key as typeof tab); setSplitMenuOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'start', background: 'transparent', border: '1px solid transparent', borderRadius: 8, padding: '10px 10px', color: '#1F3E6C', fontSize: 13, fontWeight: 600, cursor: locked ? 'not-allowed' : 'pointer', minHeight: 40, opacity: locked ? 0.5 : 1, filter: locked ? 'grayscale(0.8)' : 'none' }}
                    >{locked ? '🔒 ' : ''}{label}</button>
                  )})}
              </div>
            </>
          )}
        </>
      )}

      {/* DESKTOP: the original three-FAB stack. */}
      {fullscreen && onToggleFullscreen && !isMobile && (
        <>
          <button
            data-tour="split-btn"
            onClick={() => { if (splitLocked) return; setSplitMenuOpen(o => !o) }}
            aria-label={splitLocked ? FEATURE_UNLOCKS_BY_ID['split-screen']?.descriptionHe : 'פיצול מסך — בחר כלי לחלונית התחתונה'}
            aria-haspopup="menu"
            aria-expanded={splitMenuOpen}
            aria-disabled={splitLocked || undefined}
            title={splitLocked ? FEATURE_UNLOCKS_BY_ID['split-screen']?.descriptionHe : 'פיצול מסך — בחר כלי לחלונית התחתונה'}
            style={{
              position: 'fixed', bottom: 150, left: 52, zIndex: 300,
              background: 'linear-gradient(135deg,#4ECDC4,#3FB8AF)',
              color: '#0B1B3E',
              border: 0, borderRadius: 14,
              padding: '8px 14px',
              fontFamily: "'Rubik', sans-serif",
              fontSize: 12, fontWeight: 800,
              cursor: splitLocked ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44,
              opacity: splitLocked ? 0.55 : 1, filter: splitLocked ? 'grayscale(0.85)' : 'none',
            }}
          >
            {splitLocked ? '🔒 ' : '⊟ '}פיצול מסך {splitMenuOpen ? '▾' : '▸'}
          </button>
          {/* Swap-pane popover anchored above the FAB. תרגול stays locked on
              top; picking a surface swaps the BOTTOM pane via handleSetTab.
              The active surface is excluded. Light card, navy text, gold
              accents — matches the app. Per user 2026-05-29. */}
          {splitMenuOpen && (
            <>
              {/* click-away backdrop */}
              <div
                onClick={() => setSplitMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 305, background: 'transparent' }}
              />
              <div
                role="menu"
                aria-label="בחר כלי לחלונית התחתונה"
                dir="rtl"
                style={{
                  position: 'fixed', bottom: 202, left: 52, zIndex: 306,
                  background: '#FBF8F1',
                  border: '1px solid rgba(212,175,55,0.55)',
                  borderRadius: 12,
                  boxShadow: '0 10px 28px rgba(11,27,62,0.30)',
                  padding: 6, minWidth: 188,
                  fontFamily: "'Rubik', sans-serif",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1F3E6C', opacity: 0.7, padding: '4px 10px 6px' }}>
                  כלי לחלונית התחתונה
                </div>
                {([
                  ['mindmap',    '🧠 מפת חשיבה'],
                  ['canvas',     '✏️ קנבס'],
                  ['excalidraw', '🎨 לוח ציור'],
                  ['arsenal',    '🎯 הארסנל שלי'],
                ] as const)
                  .filter(([key]) => key !== tab)
                  .map(([key, label]) => {
                    const locked = toolLocked(key as typeof tab)
                    return (
                    <button
                      key={key}
                      role="menuitem"
                      aria-disabled={locked || undefined}
                      title={locked ? toolLockTip(key as typeof tab) : undefined}
                      onClick={() => { if (locked) return; handleSetTab(key as typeof tab); setSplitMenuOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', width: '100%',
                        textAlign: 'start',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: 8, padding: '9px 10px',
                        color: '#1F3E6C', fontFamily: "'Rubik', sans-serif",
                        fontSize: 13, fontWeight: 600, cursor: locked ? 'not-allowed' : 'pointer',
                        minHeight: 40, opacity: locked ? 0.5 : 1, filter: locked ? 'grayscale(0.8)' : 'none',
                      }}
                      onMouseEnter={e => { if (locked) return; e.currentTarget.style.background = 'rgba(212,175,55,0.16)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      {locked ? '🔒 ' : ''}{label}
                    </button>
                  )})}
              </div>
            </>
          )}
          <button
            onClick={() => {
              try { onBack() } catch(_){}
              try { window.location.hash = '#study' } catch(_){}
              setTimeout(() => {
                const h = window.location.hash
                if (h.startsWith('#split') || h.startsWith('#mindmap')) window.location.hash = '#study'
              }, 50)
            }}
            aria-label="חזרה לדף הבית"
            title="חזרה לדף הבית"
            style={{
              // ISSUE 4 (2026-05-31): moved from top:12 (which covered the top
              // scrollbar + canvas nav pill) into the bottom-left lane, top of
              // the stack, clear of the ∑Formulas rail (left:52).
              position: 'fixed', bottom: 210, left: 52, zIndex: 300,
              background: 'linear-gradient(135deg,#D4AF37,#b8941f)',
              color: '#1F2640',
              border: 0, borderRadius: 14,
              padding: '8px 14px',
              fontFamily: "'Rubik', sans-serif",
              fontSize: 12, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44,
            }}
          >
            🏠 דף הבית
          </button>
          <button
            onClick={onToggleFullscreen}
            aria-label="הצג כלי לימוד (סרגל צד + סרגל עליון)"
            title="הצג סרגלים"
            style={{
              // ISSUE 4 (2026-05-31): left:12→52 clears the ∑Formulas rail.
              position: 'fixed', bottom: 90,
              left: 52,
              zIndex: 300,
              background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
              color: '#0B1B3E',
              border: 0, borderRadius: 14,
              padding: '8px 14px',
              fontFamily: "'Rubik', sans-serif",
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ☰ הצג כלי לימוד
          </button>
        </>
      )}

      {/* Top bar — hidden in fullscreen so canvas + question get full
          viewport. The floating "הצג כלי לימוד" chip above restores it. */}
      {!fullscreen && (
      <div className="ws-quiz-topbar" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(127,155,217,0.30)', boxShadow: '0 2px 6px rgba(18,36,96,0.15)', height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, gap: 12, zIndex: 10 }}>
        <img src={`${import.meta.env.BASE_URL}high-tech.png`} alt="" style={{ width: 34, height: 26, objectFit: 'cover', borderRadius: 5 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${isDone ? 100 : ((currentQ)/total)*100}%`, height: '100%', background: 'rgba(212,175,55,0.75)', borderRadius: 10, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 11, color: TEXT_LIGHT, marginTop: 2 }}>
            {answeredCount} / {total} · {correctCount} ✓{streak >= 2 ? <span style={{ color: '#FF7A1A', fontWeight: 800 }}> · 🔥{streak}</span> : null}
          </div>
        </div>
        <div className="ws-quiz-topic" style={{ fontFamily: "'Assistant', sans-serif", fontSize: 14, color: TEXT_DARK }}>
          <span style={{ fontWeight: 700 }}>סטטיסטיקה</span>{!isDone && ` | ${q.topic}`}
        </div>
        {/* Difficulty chip — relocated here 2026-07-25 when the navy strip
            over the board was removed. The top bar is the single source of
            truth for question metadata, so difficulty joins the XP chip. */}
        {!isDone && boardFullBleed && (q as any).difficulty && (
          <QuizDifficultyBadge level={(q as any).difficulty} xp={q.xp} tone="light" showXp={false} />
        )}
        {/* XP-per-question chip (moved here from inside question card per
            user request — keeps card lighter, header is the single source
            of truth for question metadata) */}
        {!isDone && (
          <div style={{
            background: 'rgba(212,175,55,0.16)',
            border: '1px solid rgba(212,175,55,0.5)',
            color: '#7A5C00',
            borderRadius: 12,
            padding: '4px 10px',
            fontFamily: "'Rubik', sans-serif",
            fontSize: 12, fontWeight: 700,
          }}>+{q.xp} XP ⭐</div>
        )}
        {/* Float toggle — also relocated out of the removed navy strip; it
            sits next to the fullscreen toggle since both change the frame
            the question is shown in. */}
        {!isDone && !isMobile && boardFullBleed && (
          <button
            onClick={() => setFloatMode(true)}
            aria-label="נתק לחלון צף"
            title="נתק לחלון צף נגרר"
            style={{
              background: 'rgba(127,155,217,0.10)',
              border: '1px solid rgba(127,155,217,0.30)',
              color: TEXT_DARK,
              borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >⤢ צף</button>
        )}
        {/* Fullscreen toggle — distraction-free practice; parent hides sidebar+topbar */}
        {onToggleFullscreen && !isMobile && (
          <button
            onClick={onToggleFullscreen}
            aria-label={fullscreen ? 'יציאה ממסך מלא' : 'מסך מלא — ללא הסחות דעת'}
            title={fullscreen ? 'יציאה ממסך מלא (Esc)' : 'מסך מלא'}
            style={{
              background: fullscreen ? 'rgba(212,175,55,0.18)' : 'rgba(127,155,217,0.10)',
              border: '1px solid ' + (fullscreen ? 'rgba(212,175,55,0.55)' : 'rgba(127,155,217,0.30)'),
              color: fullscreen ? '#7A5C00' : TEXT_DARK,
              borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {fullscreen ? '↘ צא ממסך מלא' : '⛶ מסך מלא'}
          </button>
        )}
      </div>
      )}{/* end !fullscreen topbar guard */}

      {/* ── Quick-switch (תרגיל ⇄ קנבס) ──────────────────────────────────────
          On MOBILE a side-by-side split is too cramped and was rendering blank,
          so the canvas opens as a reliable FULL-SCREEN overlay and a pill flips
          between the exercise and the canvas. On DESKTOP the same pill drives
          the existing side-by-side split (handleSetTab). */}
      {!isDone && isMobile && tab === 'canvas' && (
        <div data-tour="canvas-frame" style={{ position: 'fixed', inset: 0, zIndex: 400, background: '#0d1628' }}>
          <iframe
            key={`qs-wb-${q?.id || currentQ}`}
            src={`${import.meta.env.BASE_URL}mindmap.html?v=mm19-20260708&mode=wb&userId=${userId || 'default'}&wbScene=q-${encodeURIComponent(q?.id ?? `idx${currentQ}`)}`}
            title="קנבס לשאלה"
            style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
            allow="clipboard-read; clipboard-write"
          />
        </div>
      )}
      {/* Quick-switch pill — MOBILE ONLY. On desktop the 5-surface bottom row
          (below) already provides תרגיל/קנבס switching, and both at bottom-center
          collided. The pill exists for mobile, where that row is hidden. */}
      {!isDone && isMobile && (
        <div role="tablist" aria-label="מעבר מהיר בין תרגיל לקנבס" style={{
          position: 'fixed', bottom: isMobile ? 14 : 18, left: '50%', transform: 'translateX(-50%)',
          zIndex: 402, display: 'flex', gap: 4, padding: 4,
          background: 'rgba(13,22,40,0.92)', borderRadius: 999,
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        }}>
          {([['none', '📝 תרגיל'], ['canvas', '✏️ קנבס']] as const).map(([key, label]) => {
            const active = key === 'none' ? tab === 'none' : tab === 'canvas'
            const locked = key === 'canvas' && toolLocked('canvas')
            return (
              <button
                key={key} role="tab" aria-selected={active}
                data-tour={key === 'canvas' ? 'canvas-tab' : 'practice-tab'}
                aria-disabled={locked || undefined}
                title={locked ? toolLockTip('canvas') : undefined}
                onClick={() => { if (locked) return; handleSetTab(key === 'none' ? 'none' : 'canvas') }}
                style={{
                  border: 'none', borderRadius: 999, padding: '8px 18px', cursor: locked ? 'not-allowed' : 'pointer',
                  fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700, minHeight: 40,
                  background: active ? 'linear-gradient(135deg,#F5C842,#D4AF37)' : 'transparent',
                  color: active ? '#0B1B3E' : 'rgba(255,255,255,0.85)',
                  transition: 'all 0.15s', opacity: locked ? 0.5 : 1, filter: locked ? 'grayscale(0.8)' : 'none',
                }}
              >{locked ? '🔒 ' : ''}{label}</button>
            )
          })}
        </div>
      )}

      {/* Two-mode layout — calm focus when tab='none', tool-fullscreen with
          docked chip when a companion tool is active.
          Per user: when desktop split is active, the QUESTION card renders
          at the TOP (so it's immediately readable + room for the answer
          textarea), and the companion tool fills the remaining space BELOW.
          That mirrors textbook-style problem→workspace layout. */}
      {/* When tab === 'none' (no companion tool active), the contentRow
          container should NOT take flex:1 — there's nothing to fill the
          vertical space with, so a flex:1 column-reverse produces a
          200-500px dead band between the chips at the top and the quiz
          card pushed to the bottom. justifyContent:'flex-end' (PR #47)
          worked in theory but the user kept seeing the gap — root cause
          is the container OWNING height it doesn't need. Conditional
          flex sizing makes the gap structurally impossible.

          Tab active: flex:1 + column-reverse so the iframe/canvas fills
            the viewport with the quiz card at the bottom (textbook layout).
          Tab none:   flex:0 0 auto + column-reverse so the container is
            only as tall as its content (tabs + quiz card touching).
          Per user 2026-05-24 (7th flag of this issue). */}
      {/* 2026-07-25: in calm mode the container now DOES take flex:1 — the
          whiteboard itself fills the leftover height (the old dead-band worry
          is gone because the quiz pane, not a spacer, owns that space). */}
      <div ref={contentRowRef} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'flex-end', overflow: 'hidden', minHeight: 0, background: 'var(--sh-page-bg)', position: 'relative' }}>

        {/* ── Companion tool ── */}
        {!isDone && tab !== 'none' && (
          <div style={
            !isMobile && !floatMode
              ? { flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', zIndex: 1,
                  background: tab === 'arsenal' ? 'var(--sh-page-bg)' : '#0d1628' }
              : { position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1,
                  background: tab === 'arsenal' ? 'var(--sh-page-bg)' : '#0d1628' }
          }>
            {tab === 'mindmap' && (
              <iframe
                key="quiz-mm"
                src={`${import.meta.env.BASE_URL}mindmap.html?v=mm19-20260708&userId=${userId || 'default'}${selectedTopic ? `&topic=${encodeURIComponent(selectedTopic)}` : ''}`}
                title="מפת חשיבה — תוך כדי תרגול"
                style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
                allow="clipboard-read; clipboard-write"
              />
            )}
            {tab === 'canvas' && !isMobile && (
              <>
                {/* Per-question canvas navigation (Issue 4): each question gets
                    its own wb scene, persisted under wb-scene-q-<id>. Lets the
                    user jump back to a prior question's canvas without losing
                    work. */}
                <div style={{
                  // Bottom of the canvas pane (was top:6 → overlapped the quiz
                  // options just above the split divider). Per user 2026-06.
                  position: 'absolute', bottom: 8, insetInlineStart: 8, zIndex: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(13,22,40,0.82)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(212,175,55,0.35)', borderRadius: 999,
                  padding: '4px 10px', fontFamily: "'Rubik', sans-serif",
                  fontSize: 12, color: '#e9edf7', boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                }}>
                  <button
                    onClick={() => setCurrentQ((i: number) => Math.max(0, i - 1))}
                    disabled={currentQ <= 0}
                    aria-label="קנבס קודם"
                    title="קנבס קודם"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(212,175,55,0.45)',
                      color: currentQ <= 0 ? 'rgba(233,237,247,0.35)' : '#D4AF37',
                      borderRadius: 6, padding: '2px 8px',
                      cursor: currentQ <= 0 ? 'default' : 'pointer',
                      fontSize: 12, fontWeight: 700,
                    }}
                  >← קודם</button>
                  <span style={{ opacity: 0.75 }}>קנבס {currentQ + 1}/{questions.length}</span>
                  <button
                    onClick={() => setCurrentQ((i: number) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentQ >= questions.length - 1}
                    aria-label="קנבס הבא"
                    title="קנבס הבא"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(212,175,55,0.45)',
                      color: currentQ >= questions.length - 1 ? 'rgba(233,237,247,0.35)' : '#D4AF37',
                      borderRadius: 6, padding: '2px 8px',
                      cursor: currentQ >= questions.length - 1 ? 'default' : 'pointer',
                      fontSize: 12, fontWeight: 700,
                    }}
                  >הבא →</button>
                </div>
                <iframe
                  data-tour="canvas-frame"
                  // Per-question scene key: changing q.id remounts the iframe so
                  // mindmap.html loads the matching wb-scene-q-<id> from
                  // localStorage. wbScene query param is read inside mindmap.html.
                  key={`quiz-wb-${q?.id || currentQ}`}
                  src={`${import.meta.env.BASE_URL}mindmap.html?v=mm19-20260708&mode=wb&userId=${userId || 'default'}&wbScene=q-${encodeURIComponent(q?.id ?? `idx${currentQ}`)}`}
                  title={`קנבס לשאלה ${currentQ + 1}`}
                  style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
                  allow="clipboard-read; clipboard-write"
                />
              </>
            )}
            {tab === 'arsenal' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} dir="rtl">
                <ArsenalScreen />
              </div>
            )}
            {tab === 'excalidraw' && (
              // Full Excalidraw board embedded in the companion pane, with a
              // per-question scene so each question keeps its own drawing.
              // Per user 2026-05-29 (5th companion option).
              <DrawingScreen
                userId={userId || 'default'}
                embed
                sceneId={`q-${q?.id ?? `idx${currentQ}`}`}
              />
            )}
          </div>
        )}

        {/* ── Floating mini-pill (mobile only — desktop uses the split panel) ── */}
        {!isDone && tab !== 'none' && !chipExpanded && isMobile && (
          <button
            onClick={() => setChipExpanded(true)}
            title="הצג שאלה"
            style={{
              position: 'absolute',
              bottom: 72,
              insetInlineEnd: 12,
              zIndex: 50,
              background: 'linear-gradient(135deg,#1F3E6C,#2c4f8a)',
              border: '1px solid rgba(127,155,217,0.5)',
              borderRadius: 22, padding: '8px 16px',
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            📝 שאלה {currentQ + 1} / {total}
            {(q as any)?.difficulty && <QuizDifficultyBadge level={(q as any).difficulty} xp={q.xp} />}
          </button>
        )}

        {/* ── Question card ──────────────────────────────────────────────────
             • tab='none'          → centered in the page (normal flow)
             • tab active, mobile  → bottom sheet (fixed, 50 vh, rounded top)
             • tab active, desktop → right-side split panel (420 px wide)
        ─────────────────────────────────────────────────────────────────── */}
        {(isDone || tab === 'none' || !isMobile || chipExpanded) && (
        <div style={
          isMobile && tab !== 'none' && !isDone
            ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 250, display: 'flex', flexDirection: 'column' }
            : floatMode
            ? { position: 'fixed', top: floatPos.y, left: floatPos.x, zIndex: 250, width: 'min(420px, calc(100vw - 24px))', maxHeight: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }
            : !isMobile && tab !== 'none' && !isDone
            // Desktop split: question card capped to ~38vh so the canvas /
            // mindmap below still gets ~62vh for meaningful interaction.
            // Raised from 25vh because long stems + 4 MC options + KaTeX
            // were getting cropped (option D invisible). Internal scroll
            // on the inner card if needed.
            ? { flexShrink: 0, zIndex: 2, display: 'flex', flexDirection: 'column', maxHeight: 'min(56vh, 520px)', overflow: 'hidden' }
            : boardFullBleed
            // Calm mode: the pane GROWS to fill everything under the tab chips
            // so the whiteboard gets the whole content area (was a 6px-padded
            // shrink-to-fit strip holding a 720px card).
            ? { flex: 1, minHeight: 0, padding: bigBoard ? '4px 20px 10px' : '4px 8px 8px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }
            : isDone
            // Padding tightened per user 2026-05-24 — was 18px top / 12px bot
            // creating a big empty gap between the companion-tab chips above
            // and the quiz card. Now 6/6.
            ? { flexShrink: 0, padding: '6px 24px 6px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }
            : { position: 'absolute', bottom: 72, insetInlineEnd: 14, zIndex: 60, width: 'min(420px, calc(100vw - 28px))', maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }
        }>
          <div style={
            isMobile && tab !== 'none' && !isDone
              ? {
                  width: '100%',
                  // Own box background removed — the question content now sits
                  // inside a WhiteboardShell (its own #FCFDFF paper surface), so
                  // this outer card is just a transparent positioning/elevation
                  // shell (header strip supplies the only opaque chrome).
                  background: 'transparent',
                  borderRadius: '20px 20px 0 0',
                  boxShadow: '0 -4px 32px rgba(31,62,108,0.18)',
                  border: '1px solid rgba(127,155,217,0.3)',
                  borderBottom: 'none',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  maxHeight: '52vh',
                }
              : !isMobile && tab !== 'none' && !isDone
              ? {
                  width: '100%',
                  background: 'transparent',
                  borderRadius: 0,
                  borderBottom: '1px solid rgba(127,155,217,0.22)',
                  overflow: 'hidden',         // card is a flex column; its body is the sole scroller
                  display: 'flex', flexDirection: 'column',
                  // Sole height authority for the split quiz pane. 38vh starved
                  // stem + 4 MC options + KaTeX (option C/D clipped behind the
                  // canvas toolbar). min(56vh,520px) fits four options; the body
                  // below scrolls if a stem is unusually long. Canvas still gets
                  // the remaining ~44vh.
                  maxHeight: 'min(56vh, 520px)',
                  minHeight: '180px',
                }
              : boardFullBleed
              ? {
                  // The outer card is GONE in calm mode — no white box, no
                  // border, no shadow. What's left is the nav strip + the
                  // whiteboard, stretched to the full pane.
                  width: '100%',
                  maxWidth: bigBoard ? 1600 : '100%',
                  height: '100%',
                  minHeight: 0,
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  borderRadius: 0,
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }
              : isDone
              ? {
                  width: 'min(720px, 100%)',
                  background: 'transparent',
                  borderRadius: 18,
                  boxShadow: 'var(--sh-card-shadow)',
                  border: '1px solid rgba(127,155,217,0.3)',
                  overflow: 'hidden',
                }
              : {
                  width: '100%',
                  background: 'transparent',
                  borderRadius: 16,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
                  border: '1px solid rgba(127,155,217,0.45)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  maxHeight: 'inherit',
                }
          }>
            {/* Card header strip — labeled prev/next buttons (same UX as
                LessonScreen) + question counter + difficulty + chip-collapse.
                Also serves as drag handle when floatMode is on.
                REMOVED on the full-bleed board (2026-07-25): a navy bar across
                the top of a whiteboard reads as app chrome, not as a board.
                Its parts moved out — counter to the board's own header band,
                prev/next to the board's footer, difficulty + ⤢ צף to the top
                bar. It still renders for the split pane, the mobile sheet and
                the floating window, which have no other header. */}
            {!boardFullBleed && (
            <div
              onMouseDown={onFloatHeaderMouseDown}
              style={{
                background: 'linear-gradient(135deg,#1F3E6C,#2c4f8a)',
                color: '#fff', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600,
                flexShrink: 0,
                cursor: (tab !== 'none' && !isMobile) ? 'move' : 'default',
                userSelect: (tab !== 'none' && !isMobile) ? 'none' : undefined,
              }}>
              {/* Drag handle pill — visible when tool is active on desktop */}
              {tab !== 'none' && !isMobile && (
                <span title={floatMode ? 'גרור' : 'גרור לחלון צף'} style={{ width: 28, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', flexShrink: 0, marginInlineStart: -4, marginRight: 4 }} aria-hidden="true" />
              )}
              {/* Mobile bottom-sheet drag pill at very top */}
              {isMobile && tab !== 'none' && !isDone && (
                <span style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
              )}
              {!isDone && (
                <button
                  onClick={navPrev}
                  disabled={isFirstQ}
                  aria-label="שאלה קודמת"
                  title="הקודם"
                  style={{
                    background: isFirstQ ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, padding: '5px 12px',
                    cursor: isFirstQ ? 'not-allowed' : 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    opacity: isFirstQ ? 0.45 : 1,
                  }}
                >
                  → הקודם
                </button>
              )}
              <span style={{ flex: 1, textAlign: 'center' }}>{isDone ? '🏆 סיום' : `שאלה ${currentQ + 1} / ${total}`}</span>
              {!isDone && (q as any).difficulty && <QuizDifficultyBadge level={(q as any).difficulty} xp={q.xp} />}
              {!isDone && (
                <button
                  data-tour="practice-btn"
                  onClick={navNext}
                  aria-label={isLastQ ? 'סיים את הסשן' : 'שאלה הבאה'}
                  title={isLastQ ? 'סיום' : 'הבא — בלי לענות ובלי להיחשב טעות'}
                  style={{
                    background: '#D4AF37',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8, padding: '5px 14px',
                    cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(212,175,55,0.35)',
                  }}
                >
                  {isLastQ ? 'סיום 🏆' : 'הבא ←'}
                </button>
              )}
              {/* ⤢ button: only show when tab=none (manual float toggle) */}
              {!isDone && !isMobile && tab === 'none' && (
                <button
                  onClick={() => setFloatMode(v => !v)}
                  title={floatMode ? 'החזר לתצוגה רגילה' : 'נתק לחלון צף נגרר'}
                  aria-label={floatMode ? 'החזר לתצוגה רגילה' : 'נתק לחלון צף'}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  }}
                >
                  ⤢ צף
                </button>
              )}
              {/* Mobile: close-tool button instead of collapse chip */}
              {!isDone && isMobile && tab !== 'none' && (
                <button
                  onClick={() => handleSetTab('none')}
                  title="סגור כלי"
                  aria-label="סגור כלי וחזור לשאלה"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, marginRight: 'auto', minHeight: 40 }}
                >
                  ✕ סגור
                </button>
              )}
              {/* Desktop collapse chip — only when floating (not in split panel) */}
              {!isDone && tab !== 'none' && !isMobile && floatMode && (
                <button
                  onClick={() => setChipExpanded(false)}
                  title="כווץ"
                  aria-label="כווץ שאלה"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 6, width: 24, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ▴
                </button>
              )}
            </div>
            )}

            {/* Card body — height/scroll scales with mode.
                Calm mode: zero padding + no height cap; the WhiteboardShell
                below fills it and owns the scrolling (its own inset content
                column), so the board reaches the edges of the pane. */}
            <div style={boardFullBleed ? {
              padding: 0,
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              paddingBottom: isMobile ? 'calc(56px + env(safe-area-inset-bottom))' : 0,
            } : {
              padding: '20px 22px 18px',
              maxHeight: (!isMobile && !floatMode && tab !== 'none' && !isDone) ? 'none' : (floatMode || (isMobile && tab !== 'none' && !isDone)) ? 'calc(100vh - 280px)' : 'min(60vh, 520px)',
              overflowY: 'auto',
              // Bottom zone on mobile so the quick-switch pill (bottom-center)
              // never covers the last answer/content.
              paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom))' : 8,
              flex: (floatMode || (isMobile && tab !== 'none' && !isDone) || (!isMobile && !floatMode && tab !== 'none' && !isDone)) ? 1 : 'unset',
              minHeight: 0,
            }}>

          {/* Question content is drawn directly on a whiteboard surface — the
              hierarchy breadcrumb is pinned in the board's top-right corner.
              (Same pattern as LessonScreen's theory slides.) */}
          <BoardShell
            topicId={selectedTopic || undefined}
            progress={{ done: answeredCount, total }}
            revealOnProgress
            layout="tray"
            topRightSlot={
              // paddingInline clears the board's 36px corner brackets (they sit
              // at inset 5 and paint at z-index 61, ON TOP of content — the
              // counter was being cut in half by the top-left one).
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', paddingInline: boardFullBleed ? 22 : 0 }}>
                <HierarchyBreadcrumb topicId={selectedTopic || ''} />
                {/* Question counter — lives on the board itself now that the
                    navy strip is gone, written in the board's own hand. */}
                {boardFullBleed && !isDone && (
                  <span style={{
                    marginInlineStart: 'auto',
                    fontFamily: "'Rubik', sans-serif",
                    fontSize: bigBoard ? 16 : 14,
                    fontWeight: 700,
                    color: 'var(--sh-text-dark)',
                    opacity: 0.85,
                    whiteSpace: 'nowrap',
                  }}>
                    שאלה {currentQ + 1} / {total}
                  </span>
                )}
              </div>
            }
            style={boardFullBleed
              ? {
                  flex: 1,
                  height: 'auto',
                  // Desktop: the flex chain above has a definite height, so
                  // flex:1 alone fills it. Mobile: that chain is content-sized,
                  // so flex:1 would collapse the board to 0 — pin a viewport
                  // -relative floor there instead.
                  minHeight: isMobile ? 'calc(100dvh - 240px)' : 0,
                  // All four corners now that no strip caps the top.
                  borderRadius: 18,
                }
              : undefined}
          >
          {/* Full-bleed board: flex column + minHeight 100% so the footer nav
              (below) sits on the bottom edge of the board when the question is
              short, and directly after the content when it's long. */}
          <div style={boardFullBleed
            ? { display: 'flex', flexDirection: 'column', minHeight: '100%' }
            : undefined}>
          {isDone ? (
            /* ── Completion panel ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 18 }}>
              <div style={{ fontSize: 60 }}>🏆</div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 28, color: TEXT_DARK, textAlign: 'center' }}>
                סיימת את הסשן!
              </div>
              <div style={{ display: 'flex', gap: 24, margin: '4px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#34A853' }}>{correctCount}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>נכון</div>
                </div>
                {/* "לשיפור" counts only questions you actually ANSWERED wrong.
                    Questions you moved past unanswered are reported separately
                    as "דילגת" — free forward nav must not look like failure. */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#EA4335' }}>{answeredCount - correctCount}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>לשיפור</div>
                </div>
                {total - answeredCount > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: TEXT_LIGHT }}>{total - answeredCount}</div>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>דילגת</div>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#D4AF37' }}>
                    {questions.filter((_: any, i: number) => dotStates[i] === 'correct').reduce((s: number, q: any) => s + q.xp, 0)}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>XP הרווחת</div>
                </div>
              </div>
              {/* Accuracy headline — out of the questions you answered, not out
                  of the whole set (skipping shouldn't tank the number). */}
              {answeredCount > 0 && (
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 15, color: TEXT_LIGHT, marginTop: -4 }}>
                  דיוק: <span style={{ fontWeight: 800, color: correctCount / answeredCount >= 0.7 ? '#34A853' : '#D4AF37' }}>{Math.round((correctCount / answeredCount) * 100)}%</span>
                  <span style={{ opacity: 0.75 }}> ({correctCount}/{answeredCount} שנענו)</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Retry only the mistakes — spaced practice of errors. */}
                {total - correctCount > 0 && (
                  <button onClick={handleRetryWrong}
                    style={{ background: 'linear-gradient(135deg,#EA4335,#C5221F)', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 28px', fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(234,67,53,0.4)', minHeight: 44 }}>
                    🔁 תרגל מה שפספסת ({total - correctCount})
                  </button>
                )}
                <button onClick={() => {
                  handleQuizComplete()
                  onBack()
                }}
                  style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0px 2px 6px rgba(18,36,96,0.3)' }}>
                  חזור לדף הבית
                </button>
                <button onClick={handleReset}
                  style={{ background: 'rgba(255,255,255,0.10)', color: BUTTON_COLOR, border: `2px solid ${BUTTON_COLOR}`, borderRadius: 24, padding: '12px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer', minHeight: 44, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                  סשן נוסף
                </button>
              </div>
            </div>

          ) : phase === 'write' ? (
            /* ── Write your answer ── */
            <>
              {/* Question title — full width, no XP chip here (moved into
                  outer ws-quiz-topbar). User asked for fewer competing chips
                  on the question card itself. */}
              {/* Counter suppressed on the full-bleed board — the nav strip
                  directly above already reads "שאלה X / Y"; two of them just
                  ate ~44px of board height. */}
              {!boardFullBleed && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: TEXT_DARK, marginBottom: 10, textAlign: 'right' }}>
                  שאלה {currentQ + 1} / {total}
                </div>
              )}

              {/* Handwritten stem on the board (Playpen Sans Hebrew, same hand
                  as the mind-map). KaTeX inside MathText keeps its own font —
                  math must stay math, and it stays LTR-isolated. */}
              {/* Gveret Levin sits smaller on the line than a print face, so
                  the hand sizes run ~3px larger than the sans equivalents. */}
              <div className="ws-quiz-stem" style={{ fontFamily: "'Assistant', sans-serif", fontSize: bigBoard ? 25 : 19, color: 'var(--sh-q-text-color)', lineHeight: 1.7, whiteSpace: 'pre-line', textAlign: 'right', marginBottom: bigBoard ? 20 : 16, width: '100%' }}>
                <MathText text={q.text} />
              </div>

              {((q as any).format === 'mc' && Array.isArray((q as any).options)) ? (
                /* ── Multiple-choice render — 2×2 grid so all 4 options fit
                     w/o scrolling alongside the 25vh question card. Per user
                     2026-05-24: max-width + auto margins to center the grid
                     so answers don't push right of the question text. ── */
                <>
                <div className="ws-quiz-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: bigBoard ? 16 : 10, marginBottom: 14, maxWidth: bigBoard ? 1180 : 640, marginInline: 'auto', placeItems: 'stretch', justifyItems: 'stretch' }} dir="rtl">
                  {((q as any).options as string[]).map((opt: string, idx: number) => {
                    const correctIdx: number = (q as any).correctIndex
                    const isChosen = mcSelected === idx
                    const isCorrect = idx === correctIdx
                    const revealed = mcSelected !== null
                    // Color logic: green for correct (when revealed), red for chosen-wrong,
                    // dimmed for non-chosen-incorrect. Default = translucent-white so the
                    // option chip reads on the dark themed shell (was solid #FFFFFF — a
                    // Notion-paste white card in a navy/honey theme; convention 16/18).
                    // Default = SOLID white card + thick navy border so the
                    // options separate clearly from the light quiz background
                    // (was translucent white 0.08 → invisible on the pale shell).
                    // Per user 2026-05-28.
                    let bg = '#FFFFFF'
                    let border = 'rgba(31,62,108,0.45)'
                    let color = 'var(--sh-text-dark)'
                    let marker: string | null = null
                    if (revealed) {
                      if (isCorrect) {
                        bg = 'rgba(52,168,83,0.18)'
                        border = '#34A853'
                        color = '#1E7E34'
                        marker = '✓'
                      } else if (isChosen) {
                        bg = 'rgba(234,67,53,0.18)'
                        border = '#EA4335'
                        color = '#B92E22'
                        marker = '✗'
                      } else {
                        bg = 'rgba(255,255,255,0.55)'
                        border = 'rgba(31,62,108,0.20)'
                        color = TEXT_LIGHT
                      }
                    }
                    const letter = String.fromCharCode(0x41 + idx) // A, B, C, D
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMcChoose(idx)}
                        disabled={revealed}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                          minHeight: bigBoard ? 76 : 44,
                          padding: bigBoard ? '16px 22px' : '10px 16px',
                          background: bg,
                          border: `2.5px solid ${border}`,
                          borderRadius: bigBoard ? 14 : 10,
                          color,
                          fontFamily: "'Assistant', sans-serif",
                          fontSize: bigBoard ? 19 : 15,
                          fontWeight: 500,
                          cursor: revealed ? 'default' : 'pointer',
                          textAlign: 'center',
                          direction: 'rtl',
                          transition: 'all 0.18s',
                          boxShadow: revealed ? (isChosen ? '0 2px 8px rgba(0,0,0,0.12)' : 'none') : '0 2px 6px rgba(31,62,108,0.12)',
                        }}
                        onMouseEnter={e => { if (!revealed) (e.currentTarget as HTMLElement).style.background = '#EAF1FF' }}
                        onMouseLeave={e => { if (!revealed) (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
                      >
                        {/* RTL primary corner = right side → letter pill comes FIRST in DOM */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: bigBoard ? 40 : 32, height: bigBoard ? 40 : 32, borderRadius: 20,
                          background: '#D4AF37', color: '#fff',
                          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: bigBoard ? 18 : 15,
                          flexShrink: 0,
                        }}>
                          {letter}
                        </span>
                        <span style={{ lineHeight: 1.5, textAlign: 'center' }}><MathText text={opt} /></span>
                        {marker && (
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20,
                            color: marker === '✓' ? '#34A853' : '#EA4335',
                            flexShrink: 0,
                          }}>
                            {marker}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {mcSelected === null && (
                  <div className="ws-quiz-hint" style={{ textAlign: 'center', fontSize: 12, color: 'rgba(31,62,108,0.55)', marginBottom: 10, fontFamily: "'Assistant', sans-serif" }} dir="rtl">💡 אפשר גם במקלדת — לחצו A–D או 1–4</div>
                )}
                {/* Reinforcement on a CORRECT answer — show the explanation.
                    Was missing: correct answers auto-skipped with zero learning,
                    despite the setup screen promising "הסבר על כל שאלה". */}
                {mcSelected !== null && mcSelected === (q as any).correctIndex && (q as any).answer ? (
                  <div style={{ maxWidth: bigBoard ? 1180 : 640, margin: '0 auto 14px', background: 'linear-gradient(135deg, rgba(52,168,83,0.12), rgba(52,168,83,0.05))', border: '1.5px solid rgba(52,168,83,0.4)', borderRadius: 12, padding: bigBoard ? '16px 22px' : '12px 16px', textAlign: 'right', direction: 'rtl' }} dir="rtl">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 14, color: '#1E7E34' }}>✓ נכון! הנה למה:</div>
                      <ArsenalQuizCaptureChip explanation={(q as any).answer} topicId={selectedTopic} />
                    </div>
                    <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: bigBoard ? 18 : 15, color: TEXT_DARK, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}><MathText text={(q as any).answer} /></div>
                  </div>
                ) : null}
                </>
              ) : (
                <div style={{ border: `2px solid ${answer.trim() ? '#3351CA' : '#C8D0E0'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 18, transition: 'border-color 0.2s' }}>
                  <textarea
                    ref={quizTutRef}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="כתוב/י את פתרונך כאן..."
                    dir="rtl"
                    style={{
                      width: '100%', minHeight: bigBoard ? 200 : 110,
                      border: 'none', outline: 'none',
                      padding: bigBoard ? '18px 22px' : '14px 18px',
                      fontSize: bigBoard ? 20 : 18, color: TEXT_DARK,
                      background: 'transparent',
                      fontFamily: "'Assistant', sans-serif",
                      resize: 'vertical', direction: 'rtl',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* ── 🙋 שאל בן אדם — escalate a stuck question to Barak ── */}
              <div className="ws-quiz-ask" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }} dir="rtl">
                {(!helpStatus) && (
                  <button
                    type="button"
                    onClick={handleAskHuman}
                    title="נשלח לברק בקשת עזרה על השאלה הזו"
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'rgba(212,175,55,0.12)', color: '#9A7B1A',
                      border: '1.5px dashed rgba(212,175,55,0.6)', borderRadius: 20,
                      padding: '8px 18px', cursor: 'pointer',
                      fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600,
                    }}
                  >
                    🙋 שאל בן אדם
                  </button>
                )}
                {helpStatus === 'sending' && (
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>שולח…</div>
                )}
                {helpStatus === 'pending' && (
                  <div style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(51,81,202,0.10)', color: BUTTON_COLOR,
                    border: '1.5px solid rgba(51,81,202,0.3)', borderRadius: 20,
                    padding: '8px 16px',
                    fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                  }}>
                    🙋 נשלח — ממתין לתשובה מבן אדם
                  </div>
                )}
                {helpStatus === 'answered' && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(52,168,83,0.10), rgba(52,168,83,0.04))',
                    border: '1.5px solid rgba(52,168,83,0.35)', borderRadius: 12,
                    padding: '12px 16px', textAlign: 'right',
                  }}>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700, color: '#1E7E34', marginBottom: 6 }}>
                      🙋 תשובה מבן אדם:
                    </div>
                    <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_DARK, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {helpAnswer[helpId]}
                    </div>
                  </div>
                )}
              </div>

              <div className="ws-quiz-controls-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="ws-quiz-skip" style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_LIGHT, cursor: 'pointer', textDecoration: 'underline' }} onClick={handleSkip}>דלג</span>

                {/* Dots — clickable navigation */}
                <div className="ws-quiz-dots" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {dotStates.map((state, i) => {
                    const bg = state === 'correct' ? '#34A853' : state === 'wrong' ? '#EA4335' : state === 'current' ? BUTTON_COLOR : '#D8E0F0'
                    const isClickable = state === 'correct' || state === 'wrong' || state === 'current'
                    const size = state === 'current' ? 16 : isClickable ? 12 : 9
                    return (
                      <div
                        key={i}
                        title={isClickable ? `Question ${i + 1}${state === 'correct' ? ' ✓' : state === 'wrong' ? ' ✗' : ''}` : ''}
                        onClick={() => navigateToQuestion(i)}
                        style={{
                          width: size, height: size,
                          borderRadius: '50%',
                          background: bg,
                          transition: 'all 0.25s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 7, color: '#fff', fontWeight: 700,
                          cursor: isClickable ? 'pointer' : 'default',
                          opacity: isClickable ? 1 : 0.45,
                          boxShadow: state === 'current' ? `0 0 0 2px rgba(51,81,202,0.3)` : 'none',
                          transform: isClickable && i !== currentQ ? 'scale(1)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (isClickable && i !== currentQ) (e.currentTarget as HTMLElement).style.transform = 'scale(1.35)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                      >
                        {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : ''}
                      </div>
                    )
                  })}
                </div>

                {(q as any).format === 'mc' ? (
                  /* MC mode: clicking an option commits — no separate reveal button */
                  <div style={{ width: 120 }} />
                ) : (
                  <button onClick={handleReveal} disabled={!answer.trim()}
                    style={{ background: answer.trim() ? BUTTON_COLOR : '#C8D0E0', color: answer.trim() ? '#fff' : 'rgba(100,110,140,0.75)', border: 'none', borderRadius: 24, padding: '10px 28px', fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 700, cursor: answer.trim() ? 'pointer' : 'not-allowed', boxShadow: answer.trim() ? '0px 2px 6px #8DA7FF' : 'none', transition: 'all 0.2s', minHeight: 44, opacity: answer.trim() ? 1 : 0.65 }}>
                    בדוק תשובה ←
                  </button>
                )}
              </div>
            </>

          ) : (
            /* ── Review: show model answer ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>+{q.xp} XP ⭐ אם נכון</div>
                {/* Counter hidden on the full-bleed board — it's written in the
                    board's header band instead. */}
                {!boardFullBleed && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>שאלה {currentQ + 1} / {total}</div>
                )}
              </div>

              {/* User's answer */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT, marginBottom: 6, textAlign: 'right' }}>התשובה שלך:</div>
                <div style={{ background: 'var(--sh-answer-bg)', borderRadius: 10, padding: '12px 16px', border: '1.5px solid var(--sh-answer-border)', fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_DARK, lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                  {answer}
                </div>
              </div>

              {/* Model answer */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: '#34A853', textAlign: 'right', fontWeight: 600 }}>✅ פתרון מלא:</div>
                  <ArsenalQuizCaptureChip explanation={q.answer} topicId={selectedTopic} />
                </div>
                <div
                  data-arsenal-source="quiz"
                  data-arsenal-topic={selectedTopic || ''}
                  style={{ background: 'linear-gradient(135deg, rgba(52,168,83,0.08), rgba(52,168,83,0.04))', borderRadius: 10, padding: bigBoard ? '18px 22px' : '14px 18px', border: '1.5px solid rgba(52,168,83,0.3)', fontFamily: "'Assistant', sans-serif", fontSize: bigBoard ? 20 : 17, color: TEXT_DARK, lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'right' }}
                >
                  {q.answer}
                </div>
              </div>

              {/* Self-assessment or already-reviewed navigation */}
              {dotStates[currentQ] === 'correct' || dotStates[currentQ] === 'wrong' ? (
                /* Navigated back to an already-assessed question — show result + nav */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 20px', borderRadius: 99,
                    background: dotStates[currentQ] === 'correct' ? 'rgba(52,168,83,0.12)' : 'rgba(234,67,53,0.10)',
                    border: `1.5px solid ${dotStates[currentQ] === 'correct' ? 'rgba(52,168,83,0.4)' : 'rgba(234,67,53,0.35)'}`,
                    fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 15,
                    color: dotStates[currentQ] === 'correct' ? '#34A853' : '#EA4335',
                  }}>
                    {dotStates[currentQ] === 'correct' ? '✅ Marked correct' : '❌ Marked incorrect'}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {currentQ > 0 && (
                      <button onClick={() => navigateToQuestion(currentQ - 1)}
                        style={{ background: 'rgba(51,81,202,0.08)', color: BUTTON_COLOR, border: `1.5px solid rgba(51,81,202,0.25)`, borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', minHeight: 44 }}>
                        → הקודם
                      </button>
                    )}
                    {currentQ < total - 1 ? (
                      <button onClick={() => navigateToQuestion(currentQ + 1)}
                        style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(51,81,202,0.3)', minHeight: 44 }}>
                        הבא ←
                      </button>
                    ) : (
                      <button onClick={() => setPhase('done')}
                        style={{ background: '#D4AF37', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', minHeight: 44 }}>
                        סיום 🏆
                      </button>
                    )}
                  </div>
                </div>
              ) : autoCheckResult ? (
                /* Fresh review — auto-checked numeric answer (±0.3 tolerance) */
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '10px 22px', borderRadius: 99, marginBottom: 14,
                    background: autoCheckResult.correct ? 'rgba(52,168,83,0.12)' : 'rgba(234,67,53,0.10)',
                    border: `1.5px solid ${autoCheckResult.correct ? 'rgba(52,168,83,0.4)' : 'rgba(234,67,53,0.35)'}`,
                    fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 15,
                    color: autoCheckResult.correct ? '#34A853' : '#EA4335',
                  }}>
                    {autoCheckResult.correct
                      ? `✅ נכון! (התשובה: ${autoCheckResult.expected})`
                      : `❌ לא נכון. התשובה: ${autoCheckResult.expected}  (טווח סבילות ±0.3)`}
                  </div>
                  <div>
                    <button onClick={() => handleSelfAssess(autoCheckResult.correct)}
                      style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '10px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(51,81,202,0.3)' }}>
                      המשך →
                    </button>
                  </div>
                </div>
              ) : (
                /* Fresh review — non-numeric, fall back to self-assessment */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_MED, marginBottom: 14 }}>
                    כמה הצלחת? (לא ניתן היה לבדוק אוטומטית)
                  </div>
                  <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                    <button onClick={() => handleSelfAssess(false)}
                      style={{ background: 'rgba(234,67,53,0.1)', color: '#EA4335', border: '2px solid rgba(234,67,53,0.35)', borderRadius: 24, padding: '10px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                      😅 לא ממש
                    </button>
                    <button onClick={() => handleSelfAssess(true)}
                      style={{ background: 'rgba(52,168,83,0.1)', color: '#34A853', border: '2px solid rgba(52,168,83,0.35)', borderRadius: 24, padding: '10px 32px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                      ✅ הצלחתי!
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Board footer nav — the other half of the deleted navy strip.
               Sticks to the bottom edge of the board (marginTop:auto pushes it
               there when the question is short; sticky keeps it in view while a
               long stem scrolls). Chalk-ish buttons so it reads as part of the
               board, not as app chrome. ── */}
          {boardFullBleed && !isDone && (
            <div className="ws-quiz-footer" style={{
              marginTop: 'auto',
              position: 'sticky',
              bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12,
              paddingTop: 14,
              // Same corner-bracket clearance as the header band — the bottom
              // brackets and the marker tray paint over this row otherwise.
              paddingInline: 22,
              // Fade so scrolled text doesn't run into the buttons.
              background: 'linear-gradient(180deg, rgba(252,253,255,0) 0%, #FCFDFF 45%)',
            }}>
              <button
                onClick={navPrev}
                /* aria-disabled (not HTML disabled) keeps it discoverable by
                   keyboard/SR; navPrev already no-ops on the first question. */
                aria-disabled={isFirstQ || undefined}
                aria-label="שאלה קודמת"
                title={isFirstQ ? 'זו השאלה הראשונה' : 'הקודם'}
                style={{
                  background: 'transparent',
                  color: isFirstQ ? 'rgba(31,62,108,0.30)' : 'var(--sh-text-dark)',
                  border: `2px solid ${isFirstQ ? 'rgba(31,62,108,0.15)' : 'rgba(31,62,108,0.35)'}`,
                  borderRadius: 22,
                  padding: bigBoard ? '9px 22px' : '8px 16px',
                  cursor: isFirstQ ? 'default' : 'pointer',
                  fontFamily: "'Rubik', sans-serif",
                  fontSize: bigBoard ? 15 : 14, fontWeight: 700,
                  minHeight: 44,
                }}
              >
                → הקודם
              </button>

              <button
                data-tour="practice-btn"
                onClick={navNext}
                aria-label={isLastQ ? 'סיים את הסשן' : 'שאלה הבאה'}
                title={isLastQ ? 'סיום' : 'הבא — בלי לענות ובלי להיחשב טעות'}
                style={{
                  background: '#D4AF37',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 22,
                  padding: bigBoard ? '10px 30px' : '9px 22px',
                  cursor: 'pointer',
                  fontFamily: "'Rubik', sans-serif",
                  fontSize: bigBoard ? 15 : 14, fontWeight: 700,
                  minHeight: 44,
                  boxShadow: '0 2px 10px rgba(212,175,55,0.40)',
                }}
              >
                {isLastQ ? 'סיום 🏆' : 'הבא ←'}
              </button>
            </div>
          )}
          </div>
          </BoardShell>

            </div>
          </div>
        </div>
        )}

        {/* No spacer in calm mode any more — the whiteboard pane itself is
            flex:1, so it (not an empty div) absorbs the leftover height. */}

        {/* ── Tab row: tool launcher / switcher ──────────────────────────────
             DESKTOP ONLY — on mobile the quick-switch pill (above) is the single
             bottom switcher; this full row stays on desktop and the two no longer
             collide at bottom-center. The ⋮ split-menu covers other surfaces on
             mobile. */}
        {!isDone && !isMobile && (
          <div style={{
            // Was 12/16 → 6/6 per user 2026-05-24 to remove the big empty band
            // between the tab chips and the quiz card.
            flexShrink: 0, padding: '6px 24px 6px',
            display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
            // When a companion tool is active, ALWAYS pin tabs to viewport
            // bottom (was previously only mobile/floatMode). Otherwise tabs
            // could fall below the canvas at 100% zoom + only show on
            // zoom-out. Per user: keep them reachable always.
            position: (tab !== 'none') ? 'fixed' : 'relative',
            bottom: (tab !== 'none') ? 0 : undefined,
            left: (tab !== 'none') ? 0 : undefined,
            right: (tab !== 'none') ? 0 : undefined,
            zIndex: 80,
            background: (tab !== 'none') ? 'linear-gradient(180deg, rgba(13,22,40,0) 0%, rgba(13,22,40,0.82) 60%, rgba(13,22,40,0.95) 100%)' : 'transparent',
          }}>
            {([
              ['none',       '🚫 ללא',         'התמקדו רק בשאלה'],
              ['mindmap',    '🧠 מפת חשיבה',   'הוסיפו תובנות למפה תוך כדי'],
              ['arsenal',    '🎯 הארסנל שלי',   'תפסו רגעי אהה וטריקים'],
              ['canvas',     '✏️ קנבס',         'ציירו, רשמו, פתרו ויזואלית'],
              ['excalidraw', '🎨 לוח ציור',     'לוח ציור Excalidraw מלא'],
            ] as const).map(([key, label, hint]) => {
              const active = tab === key
              const onTool = tab !== 'none'
              const locked = toolLocked(key as typeof tab)
              return (
                <button
                  key={key}
                  onClick={() => { if (locked) return; handleSetTab(key as typeof tab) }}
                  title={locked ? toolLockTip(key as typeof tab) : hint}
                  aria-disabled={locked || undefined}
                  style={{
                    background: active ? BUTTON_COLOR : (onTool ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)'),
                    color: active ? '#fff' : TEXT_DARK,
                    border: `1.5px solid ${active ? BUTTON_COLOR : (onTool ? 'rgba(127,155,217,0.55)' : 'rgba(127,155,217,0.35)')}`,
                    borderRadius: 22, padding: '8px 18px',
                    fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: locked ? 'not-allowed' : 'pointer', transition: 'all 0.18s ease',
                    boxShadow: active ? '0 4px 14px rgba(51,81,202,0.30)' : (onTool ? '0 2px 8px rgba(0,0,0,0.25)' : 'none'),
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                    opacity: locked ? 0.55 : 1, filter: locked ? 'grayscale(0.8)' : 'none',
                  }}
                >
                  {locked ? '🔒 ' : ''}{label}
                </button>
              )
            })}
          </div>
        )}

      </div>{/* end content wrap */}

      {/* Mistake Autopsy overlay — shown after wrong self-assessment */}
      {autopsyOpen && (
        <MistakeAutopsy
          onDone={handleAutopsyDone}
          correctAnswer={Array.isArray((q as any)?.options) && typeof (q as any)?.correctIndex === 'number' ? (q as any).options[(q as any).correctIndex] : undefined}
          explanation={(q as any)?.answer}
        />
      )}

    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange, darkMode, onToggleDarkMode, onLoggedIn, onLoggedOut }: StudyHubProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [internalView, setInternalView] = useState<InternalView>('home')
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  // Which course the learner entered from the gate — drives the topic grid + title.
  const [activeCourse, setActiveCourse] = useState<'stat-a' | 'stat-b' | 'sql' | 'anova'>('stat-a')
  const [quizDifficulty, setQuizDifficulty] = useState<DifficultyFilter>('all')
  const [userProgress, setUserProgress] = useState<UserProgress>(() =>
    loadProgress(initializeUser().userId)
  )
  const [sidebarWidth, setSidebarWidth] = useState(247)
  // Distraction-free fullscreen for the practice/learning view. When true,
  // sidebar + topbar are hidden so only the quiz + companion tool remain.
  const [learningFullscreen, setLearningFullscreen] = useState(false)
  const [mapActive, setMapActive] = useState(false) // embedded "מפה" mindmap active → hide the shell title bar on mobile
  // Topics-screen list/mindmap toggle — lifted here (was local state inside
  // TopicSelector) so the topbar's contextControls can render + drive it.
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list')
  // Map view is an unlock-ladder feature (mindmap-view, 35 XP); adminMode flushes the gate.
  const _topicsUnlockedFeatures = useLearningStore(s => s.unlockedFeatures)
  const _topicsAdminMode = useLearningStore(s => s.adminMode)
  const mapUnlocked = isFeatureUnlocked('mindmap-view', _topicsUnlockedFeatures, _topicsAdminMode)
  // Mobile (<=768px): sidebar collapses entirely and is opened as a hamburger overlay.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  )
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])
  const sidebarDragging = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const sidebarTutRef = useRef<HTMLElement>(null)
  const topbarTutRef = useRef<HTMLElement>(null)

  useTutorialStep('study-sidebar', sidebarTutRef, {
    title: 'התפריט שלך',
    body:  'מכאן עוברים בין דף הבית, נושאי לימוד, חידונים והקאצ\'ים שאספת. אפשר לגרור את הקצה כדי לשנות רוחב.',
    placement: 'left',
  })
  useTutorialStep('study-topbar', topbarTutRef, {
    title: 'הסטטוס שלך',
    body:  'כאן מופיעים ה-XP, המטבעות, ומנות הסיר שצברת. ככל שתאסוף יותר קאצ\'ים — תקבל יותר מנות.',
    placement: 'bottom',
  })

  useEffect(() => {
    void (async () => {
      const user = await getCurrentUser()
      if (!user) return
      setCurrentUser(user)
      // 1. Show local progress immediately for snappy first paint.
      const local = loadProgress(user.userId)
      setUserProgress(local)
      onLoggedIn?.()
      // 2. Then pull Supabase row; if it exists, it's authoritative and overrides.
      const merged = await loadProgressMerged(user.userId, local)
      if (merged && merged !== local) {
        setUserProgress(merged)
        saveProgress(merged) // mirror remote → local cache
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onSidebarDragStart = useCallback((e: React.MouseEvent) => {
    sidebarDragging.current = true
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      if (!sidebarDragging.current || !rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const fromRight = rect.right - ev.clientX
      setSidebarWidth(Math.min(360, Math.max(60, fromRight)))
    }
    const onUp = () => {
      sidebarDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const title =
    internalView === 'home' ? 'דף הבית' :
    internalView === 'courses' ? 'הקורסים שלי' :
    internalView === 'topics' ? (activeCourse === 'stat-b' ? "סטטיסטיקה ב' — בחר נושא" : activeCourse === 'sql' ? "SQL — בחר נושא" : activeCourse === 'anova' ? "ניתוח שונות — בחר נושא" : "סטטיסטיקה א' — בחר נושא") :
    'Study Zone'

  // ── Topbar context controls ─────────────────────────────────────────────
  // Nav controls that used to live INSIDE the content area (topics' מפה/רשימה
  // toggle + back button; lesson/quiz's back button) now render in the topbar
  // itself, next to the title, so the board/content pane below gets the full
  // remaining height. See TopBar's contextControls prop.
  const topBarContextControls: React.ReactNode =
    internalView === 'topics' ? (
      <>
        <button
          onClick={() => setInternalView('courses')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DARK, fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
        >
          → חזרה
        </button>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(127,155,217,0.12)', padding: 3, borderRadius: 999, flexShrink: 0 }}>
          {([['list', '📋 רשימה'], ['mindmap', '🗺️ מפה']] as const).map(([m, lbl]) => {
            const locked = m === 'mindmap' && !mapUnlocked
            const tip = locked ? FEATURE_UNLOCKS_BY_ID['mindmap-view']?.descriptionHe : undefined
            return (
              <button key={m} onClick={() => { if (!locked) setViewMode(m) }} title={tip} aria-label={tip} aria-disabled={locked || undefined}
                style={{ border: 'none', borderRadius: 999, padding: '4px 12px', cursor: locked ? 'not-allowed' : 'pointer', fontFamily: "'Rubik', sans-serif", fontSize: 12, fontWeight: 700, background: viewMode === m ? BUTTON_COLOR : 'transparent', color: viewMode === m ? '#fff' : TEXT_MED, transition: 'all 0.15s', opacity: locked ? 0.5 : 1, filter: locked ? 'grayscale(0.8)' : 'none', whiteSpace: 'nowrap' }}>
                {locked ? '🔒 ' : ''}{lbl}
              </button>
            )
          })}
        </div>
      </>
    ) : (internalView === 'lesson' || internalView === 'quiz-intro' || internalView === 'learning') ? (
      <button
        onClick={() => setInternalView('topics')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_DARK, fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
      >
        → חזרה
      </button>
    ) : undefined

  const handleSelectTopic = (topicId: string, mode: 'lesson' | 'quiz' = 'lesson') => {
    setSelectedTopic(topicId)
    setInternalView(mode === 'lesson' ? 'lesson' : 'quiz-intro')
  }

  // Brand-new user path: skip the QuizIntroCard difficulty picker and drop the
  // learner straight into the practice quiz (all difficulties). Used by the
  // home "תרגול" CTA when the user has zero progress, so a first session lands
  // immediately on the intro practice questions instead of an extra picker.
  const handleStartPractice = (topicId: string, difficulty: DifficultyFilter = 'all') => {
    setSelectedTopic(topicId)
    setQuizDifficulty(difficulty)
    setInternalView('learning')
  }

  // Register NAVIGATION tour actions so guided tours can take the user INTO the
  // real screens (arsenal / theory / practice / canvas / mindmap) and spotlight
  // them there — not just narrate. The tour overlay lives above StudyHub, so it
  // persists across these view changes and re-measures the new target.
  useEffect(() => {
    const demoTopic = () => selectedTopic || Object.keys(quizBankData.topics)[0]
    const cleanups = [
      registerTourAction('nav-arsenal',  () => setInternalView('arsenal')),
      registerTourAction('nav-theory',   () => handleSelectTopic(demoTopic(), 'lesson')),
      registerTourAction('nav-practice', () => handleStartPractice(demoTopic())),
      registerTourAction('nav-mindmap',  () => onViewChange('mindmap')),
      registerTourAction('nav-home',     () => setInternalView('home')),
      // Demonstration actions — actually USE the feature, not just navigate.
      registerTourAction('nav-world',      () => onViewChange('3d')),
      registerTourAction('open-tutor',     () => useTutorStore.getState().openDrawer()),
      registerTourAction('start-pomodoro', () => window.dispatchEvent(new CustomEvent('ws-open-pomodoro'))),
    ]
    return () => cleanups.forEach(fn => fn())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic])

  const handleProgressUpdate = (updated: UserProgress) => {
    setUserProgress(updated)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    const local = loadProgress(user.userId)
    setUserProgress(local)
    localStorage.setItem('userName', user.displayName || user.username)
    // Pull authoritative remote progress (if any) and overwrite local cache.
    void loadProgressMerged(user.userId, local).then(merged => {
      if (merged && merged !== local) {
        setUserProgress(merged)
        saveProgress(merged)
      }
    })
    onLoggedIn?.()
  }

  const handleLogout = () => {
    logoutUser()
    useLearningStore.getState().hydrateForUser('default')
    setCurrentUser(null)
    onLoggedOut?.()
  }

  // Hydrate per-user stores whenever the active user changes. learningStore
  // (XP / unlocks / progress) and arsenalStore are both per-account now — a new
  // account starts at 0 XP instead of inheriting the previous user's data.
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.userId || currentUser.username || 'default'
      useLearningStore.getState().hydrateForUser(userId)
      useArsenalStore.getState().hydrate(userId)
    }
  }, [currentUser])

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', direction: 'rtl', background: PAGE_BG, fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>WaffleStack — דף הבית</h1>
      {/* Mobile hamburger button — only on small screens. Stays clear of the
          dark-mode toggle (top-right) by anchoring to top-right with a left offset. */}
      {isMobile && (
        <button
          onClick={() => setMobileSidebarOpen(o => !o)}
          aria-label={mobileSidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}
          style={{
            position: 'fixed', top: 12, right: 12, zIndex: 250,
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(51,81,202,0.85)',
            border: '1px solid rgba(99,162,255,0.5)',
            color: '#fff', fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(51,81,202,0.4)',
          }}
        >
          {mobileSidebarOpen ? '✕' : '☰'}
        </button>
      )}
      {/* Mobile backdrop */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 240 }}
        />
      )}
      {/* Sidebar — right side (RTL). On mobile becomes a slide-in overlay.
          Hidden entirely in learning-fullscreen mode for distraction-free practice. */}
      <nav
        ref={sidebarTutRef}
        aria-label="ניווט ראשי"
        style={
          learningFullscreen && internalView === 'learning'
            ? { display: 'none' }
            : isMobile
            ? {
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 260, zIndex: 245,
                display: mobileSidebarOpen ? 'flex' : 'none',
                transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.25s ease',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
              }
            : { width: sidebarWidth, flexShrink: 0, position: 'relative', display: 'flex' }
        }
      >
        <Sidebar
          active={internalView}
          onNav={(view) => {
            if (view === 'topics') {
              setInternalView('topics')
            } else {
              setInternalView(view)
            }
            if (isMobile) setMobileSidebarOpen(false)
          }}
          onGoWorld={() => { onViewChange('3d'); if (isMobile) setMobileSidebarOpen(false) }}
          onGoMindmap={() => { onViewChange('mindmap'); if (isMobile) setMobileSidebarOpen(false) }}
          onGoDrawing={() => { onViewChange('drawing'); if (isMobile) setMobileSidebarOpen(false) }}
          onGoNotebook={() => { window.location.hash = '#notebook'; if (isMobile) setMobileSidebarOpen(false) }}
          onOpenTours={() => { useTutorialStore.getState().setLauncherOpen(true); if (isMobile) setMobileSidebarOpen(false) }}
          width={isMobile ? 260 : sidebarWidth}
        />
        {/* Sidebar resize handle — on the left edge (RTL: left is outer edge) */}
        <div
          onMouseDown={onSidebarDragStart}
          title="גרור לשינוי רוחב הסרגל"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
            cursor: 'col-resize', zIndex: 10,
            background: 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(127,155,217,0.35)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
        />
      </nav>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!(learningFullscreen && internalView === 'learning') && !(internalView === 'topics' && mapActive && isMobile) && (
          <header ref={topbarTutRef}><TopBar title={title} onLogout={handleLogout} darkMode={darkMode} onToggleDark={onToggleDarkMode} contextControls={topBarContextControls} /></header>
        )}
        {internalView === 'home' && (
          <HomeScreen
            onGoLearning={() => setInternalView('topics')}
            onGoWorld={() => onViewChange('3d')}
            onGoMindmap={() => onViewChange('mindmap')}
            onSelectTopic={(topicId) => handleSelectTopic(topicId, 'quiz')}
            onStartPractice={(topicId) => handleStartPractice(topicId)}
          />
        )}
        {internalView === 'courses' && (
          <CourseGate
            onSelectActive={(id) => { setActiveCourse(id); setInternalView('topics') }}
          />
        )}
        {internalView === 'topics' && (
          <TopicSelector
            userProgress={userProgress}
            onSelectTopic={handleSelectTopic}
            onBack={() => setInternalView('courses')}
            darkMode={darkMode}
            onToggleDark={isMobile ? onToggleDarkMode : undefined}
            onMapModeChange={setMapActive}
            course={activeCourse}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}
        {internalView === 'lesson' && selectedTopic && (
          <LessonScreen
            topicId={selectedTopic}
            onStartQuiz={() => setInternalView('quiz-intro')}
            onBack={() => setInternalView('topics')}
            onComplete={(id) => useLearningStore.getState().completeLesson(id)}
            graphSlides={INTERACTIVE_GRAPHS_BY_TOPIC[selectedTopic] ?? []}
          />
        )}
        {internalView === 'arsenal' && <ArsenalScreen />}
        {internalView === 'quiz-intro' && selectedTopic && (
          <QuizIntroCard
            topicId={selectedTopic}
            onStart={(d) => { setQuizDifficulty(d); setInternalView('learning') }}
            onBack={() => setInternalView('topics')}
            onReadLesson={() => setInternalView('lesson')}
          />
        )}
        {internalView === 'learning' && (
          <LearningScreen
            onBack={() => { setLearningFullscreen(false); setInternalView('topics') }}
            selectedTopic={selectedTopic}
            difficultyFilter={quizDifficulty}
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
            userId={currentUser?.userId}
            isMobile={isMobile}
            fullscreen={learningFullscreen}
            onToggleFullscreen={() => setLearningFullscreen(f => !f)}
          />
        )}
      </main>
    </div>
  )
}

export default StudyHub
