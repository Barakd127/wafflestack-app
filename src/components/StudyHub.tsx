import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useLearningStore } from '../store/learningStore'
import { FEATURE_UNLOCKS_BY_ID, type FeatureId } from '../config/featureUnlocks'
import PomodoroTimer from './PomodoroTimer'
import FeatureGate from './FeatureGate'

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
import { HEBREW_LABELS } from '../data/topicLabels'
import { TOPIC_ORDER } from '../lib/generatePlan'
import { MeanVisual } from './LessonVisuals'
import SamplingDistribution from './SamplingDistribution'
import ArsenalScreen, { normalizeMathGlyphs } from './ArsenalScreen'
import DrawingScreen from './DrawingScreen'
import { useArsenalStore, quickAddArsenal, looksLikeMath, serializeEquation } from '../store/arsenalStore'
import PotionInventory from './PotionInventory'
import { useTutorialStep } from '../hooks/useTutorialStep'
import { useTutorialStore } from '../store/tutorialStore'
import Tooltip from './Tooltip'
import Ribbon from './Ribbon'
import { RiskBoard } from './RiskBoard'
import MistakeAutopsy, { type ErrorTag } from './MistakeAutopsy'
import PersonalPlanWizard from './PersonalPlanWizard'

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
  id: 'stat-a' | 'stat-b' | 'methods' | 'anova'
  label: string
  icon: string                   // emoji shown on the card
  desc: string
  active: boolean
  bg: string                     // tile gradient
  /** If set, course opens an external page in a fullscreen iframe. */
  embedUrl?: string
}
const COURSES: CourseDef[] = [
  { id: 'stat-a',  label: "סטטיסטיקה א'",        icon: '📊', desc: 'מבוא, מדדים, התפלגויות, רגרסיה, הסתברות',  active: true,  bg: 'linear-gradient(135deg,#F5C842,#D4AF37)' },
  { id: 'stat-b',  label: "סטטיסטיקה ב'",        icon: '📈', desc: 'הסקה סטטיסטית, מבחני השערות, מדגם, רווחי סמך', active: true,  bg: 'linear-gradient(135deg,#7CB7F8,#4A90E2)', embedUrl: 'https://stats-viz-mata.vercel.app/' },
  { id: 'methods', label: 'שיטות מחקר',          icon: '🔬', desc: 'תכנון מחקר, מדידה, מהימנות ותקפות',         active: false, bg: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { id: 'anova',   label: 'ניתוח שונות / רב-משתנית', icon: '📐', desc: 'ANOVA, MANOVA, רגרסיה מרובה, מודלים מורכבים', active: false, bg: 'linear-gradient(135deg,#67C29E,#229E69)' },
]

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
                src="/building-figma.png"
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
            {error && <div style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.3)', borderRadius: 10, padding: '10px 14px', color: '#d32f2f', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <button type="submit" disabled={loading}
              className="ws-cta-btn"
              style={{
                marginTop: 6, padding: '14px 0',
                background: 'linear-gradient(135deg,#1F3E6C,#254A9F)',
                color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: "'Rubik', sans-serif",
                boxShadow: '0 6px 20px rgba(31,62,108,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                width: '100%',
              }}>
              {loading ? '...' : mode === 'login' ? 'כניסה →' : 'צור חשבון →'}
            </button>
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
  const hasLesson = LESSON_CONTENT.some(t => t.id === topicId)
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
            <button onClick={onReadLesson} style={{
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
function QuizDifficultyBadge({ level, xp }: { level: 'easy' | 'medium' | 'hard'; xp: number }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    easy:   { label: 'קל',     bg: 'rgba(16,185,129,0.22)', color: '#a7f3d0' },
    medium: { label: 'בינוני', bg: 'rgba(245,158,11,0.22)', color: '#fde68a' },
    hard:   { label: 'מאתגר',  bg: 'rgba(239,68,68,0.22)',  color: '#fecaca' },
  }
  const c = cfg[level] ?? cfg.medium
  return (
    <span style={{
      marginInlineStart: 8,
      background: c.bg,
      color: c.color,
      borderRadius: 10,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span>{c.label}</span>
      <span style={{ opacity: 0.7, fontSize: 10 }}>+{xp} XP</span>
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
}

/**
 * CourseGate — 4-tile course picker shown when user clicks "אזור למידה" in
 * the sidebar. Active course (Stat-A) routes into the topic grid. Inactive
 * courses (Stat-B / Methods / ANOVA) open a "Coming soon" splash overlay.
 */
function CourseGate({ onSelectActive }: { onSelectActive: () => void }) {
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
    if(c.embedUrl) {
      // stats-viz-mata.vercel.app + most modern apps set X-Frame-Options
      // DENY or CSP frame-ancestors 'none' which blocks iframe embedding.
      // Show a small launcher overlay that opens the site in a new tab.
      setEmbedded(c); return
    }
    onSelectActive()
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
            {/* Icon chip */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, marginBottom: 14,
              boxShadow: '0 6px 18px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>{c.icon}</div>
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
              background: comingSoon.bg,
              margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44,
              boxShadow: '0 10px 28px rgba(0,0,0,0.15)',
            }}>{comingSoon.icon}</div>
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

function TopicSelector({ userProgress, onSelectTopic, onBack }: TopicSelectorProps) {
  // Re-order topics according to the user's personal plan when one exists.
  // Topics not in the plan trail at the end in their natural order.
  const personalPlan = useLearningStore(s => s.personalPlan)
  const sortedTopics = (() => {
    if (!personalPlan) return QUIZ_TOPICS
    const order = new Map(personalPlan.sequence.map((s, i) => [s.topicId, i]))
    return [...QUIZ_TOPICS].sort((a, b) => {
      const ai = order.has(a.id) ? (order.get(a.id) as number) : 9999
      const bi = order.has(b.id) ? (order.get(b.id) as number) : 9999
      return ai - bi
    })
  })()
  const hintByTopic = new Map<string, string>(
    personalPlan?.sequence.filter(s => s.hint).map(s => [s.topicId, s.hint as string]) ?? []
  )
  return (
    <div className="ws-screen-pad" style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: TEXT_DARK,
          fontFamily: "'Rubik', sans-serif",
          fontSize: 16,
          marginBottom: 24,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        → חזרה לדף הבית
      </button>

      <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 28, textAlign: 'right' }}>
        בחר נושא ללמוד 📚
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 1200 }}>
        {sortedTopics.map(topic => {
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
                textAlign: 'right',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ fontSize: 32 }}>{isMastered ? '⭐' : '📖'}</div>
                <div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>
                    {topic.label}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginTop: 4 }}>
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
        })}
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
          {total > 0 ? `+${total.toLocaleString()} XP` : 'אין פעילות עדיין'}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        role="img"
        aria-label={total > 0
          ? `תרשים פעילות השבוע — סה"כ ${total.toLocaleString()} XP על פני 7 ימים`
          : 'תרשים פעילות השבוע — אין פעילות עדיין'}
        style={{ maxWidth: W, display: 'block', height: 'auto', overflow: 'visible' }}>
        <title>{total > 0 ? `+${total.toLocaleString()} XP בשבוע האחרון` : 'אין פעילות בשבוע האחרון'}</title>
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
          background: course.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{course.icon}</div>
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
        background: course.bg, margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, boxShadow: '0 10px 28px rgba(0,0,0,0.15)',
      }}>{course.icon}</div>
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
function Sidebar({ active, onNav, onGoWorld, onGoMindmap, onGoDrawing, onGoNotebook, width = 247 }: {
  active: InternalView
  onNav: (v: InternalView) => void
  onGoWorld: () => void
  onGoMindmap: () => void
  onGoDrawing: () => void
  onGoNotebook: () => void
  width?: number
}) {
  // EduCity-style clean line icons. SVG with stroke-currentColor so the
  // active-state gold tint applies uniformly. No emoji, no gradient chips.
  // Each icon is a 22x22 viewBox 24, 1.8 stroke, rounded line caps.
  type IconKey = 'home' | 'book' | 'trophy' | 'map' | 'globe'
  const items: Array<{ id: InternalView | null; label: string; iconKey: IconKey; action?: string; feature?: FeatureId }> = [
    { id: 'home',     label: 'דף הבית',           iconKey: 'home' },
    { id: 'courses', label: 'אזור למידה',        iconKey: 'book' },
    { id: 'arsenal',  label: 'הארסנל שלי',        iconKey: 'trophy', feature: 'arsenal' },
    { id: null,       label: 'מפת הלמידה שלי',    iconKey: 'map',   action: 'mindmap', feature: 'mindmap-view' },
    { id: null,       label: 'העולם שלי',         iconKey: 'globe', action: 'world' },
  ]
  // Subscribe to gating state once per render so each row knows lock status.
  const _adminMode = useLearningStore(s => s.adminMode)
  const _unlockedFeatures = useLearningStore(s => s.unlockedFeatures)
  const isLocked = (f?: FeatureId) => {
    if (!f) return false
    if (_adminMode) return false
    if (!FEATURE_UNLOCKS_BY_ID[f]) return false
    return !_unlockedFeatures.includes(f)
  }
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
function TopBar({ title, onLogout, darkMode, onToggleDark }: { title: string; onLogout?: () => void; darkMode?: boolean; onToggleDark?: () => void }) {
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
      <h1 style={{
        fontFamily: "'Rubik', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: TEXT_DARK,
        margin: 0,
        letterSpacing: '-0.5px',
        textShadow: '0 1px 4px rgba(255,255,255,0.8)',
      }}>{title}</h1>
      <div className="ws-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }} dir="ltr">
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
          <Tooltip label="סיור מודרך" description="הפעל מחדש את ההדרכה">
            <button
              onClick={() => {
                useTutorialStore.getState().setEnabled(true)
                useTutorialStore.getState().reset()
              }}
              style={{
                background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                color: '#6366f1', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
              }}
            >
              🎓 סיור
            </button>
          </Tooltip>
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
function HomeScreen({ onGoLearning, onGoWorld, onGoMindmap, onSelectTopic }: {
  onGoLearning: () => void
  onGoWorld: () => void
  onGoMindmap: () => void
  onSelectTopic: (topicId: string) => void
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
        onClose={() => setPlanWizardOpen(false)}
        onSelectTopic={onSelectTopic}
      />
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

        {/* ── ROW 1 ──────────────────────────────────── */}
        <div className="ws-home-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* Card: כמעט שם! */}
          <div className="ws-glass-card" style={{
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 22px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 6 }}>כמעט שם!</div>
            <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_TIP, lineHeight: 1.6, marginBottom: 16 }}>
              {!hasAnyProgress ? (
                <>בוא נתחיל בהתחלה<br />{currentTopicName}</>
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
            <button onClick={() => onSelectTopic(currentTopicId)}
              className="ws-cta-btn"
              style={{ background: BUTTON_COLOR, color: '#fff', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, fontFamily: "'Rubik', sans-serif", boxShadow: '0px 4px 14px rgba(51,81,202,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
              המשך ←
            </button>
          </div>

          {/* Card: לוח לבן דיגיטלי */}
          <div className="ws-glass-card" style={{
            borderRadius: CARD_RADIUS,
            padding: '28px 28px 24px',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
          }}>
            <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_MED, marginBottom: 16, textAlign: 'right' }}>לוח לבן דיגיטלי</div>
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
            {/* CTA button */}
            <button onClick={onGoMindmap} style={{ marginTop: 12, background: 'linear-gradient(90deg,#254A9F,#3351CA)', color:'#fff', border:'none', borderRadius:24, padding:'10px 0', fontWeight:600, fontSize:15, cursor:'pointer', fontFamily:"'Rubik',sans-serif", width:'100%', boxShadow:'0px 2px 6px rgba(51,81,202,0.4)' }}>
              🗺 פתח מפת מושגים
            </button>
          </div>
        </div>

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
            <button onClick={onGoWorld}
              style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 24, padding: '11px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: "'Rubik', sans-serif", boxShadow: '0px 2px 6px #8DA7FF' }}>
              כניסה לעולם 🌆
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

  // Mistake Autopsy: shown after a wrong self-assessment before advancing
  const [autopsyOpen, setAutopsyOpen] = useState(false)
  const [autopsyDots, setAutopsyDots] = useState<Array<'empty' | 'current' | 'correct' | 'wrong' | 'future'> | null>(null)

  // When any companion tool opens → auto-float the question card on desktop,
  // or switch to bottom-sheet mode on mobile. Closing tool → back to normal.
  // Also auto-enter fullscreen (hides sidebar + topbar) on tab activation so
  // the canvas + question get full viewport. Closing tab → exit fullscreen.
  const handleSetTab = useCallback((newTab: typeof tab) => {
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
  }, [fullscreen, onToggleFullscreen])

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
    const state = dotStates[index]
    // Can only jump to answered or current questions (not future unvisited ones)
    if (state === 'empty') return
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
  // previous question (always navigable since it's already been seen). 'הבא'
  // jumps forward but only to questions the user has already reached
  // (otherwise it would skip unread material). On the LAST answered question
  // it falls back to handleSkip so 'הבא' always advances something.
  const isFirstQ = currentQ === 0
  const isLastQ = currentQ === total - 1
  const canGoNextQ =
    currentQ + 1 < total &&
    dotStates[currentQ + 1] !== 'empty' // already visited
  const navPrev = () => { if (!isFirstQ) navigateToQuestion(currentQ - 1) }
  const navNext = () => {
    if (canGoNextQ) navigateToQuestion(currentQ + 1)
    else if (!isLastQ) handleSkip() // unseen → mark current as skipped and advance
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

    if (correct) {
      setTimeout(() => goNext(next), 900)
    } else {
      // Wrong answer — open Mistake Autopsy before advancing
      setAutopsyDots(next)
      setAutopsyOpen(true)
    }
  }

  const handleAutopsyDone = (tag: ErrorTag | null) => {
    setAutopsyOpen(false)
    if (tag && q) recordErrorTag(q.id, tag)
    setTimeout(() => goNext(autopsyDots ?? dotStates), 500)
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
    next[currentQ] = 'wrong'
    setDotStates(next)
    goNext(next)
  }

  const goNext = (currentDots?: typeof dotStates) => {
    const dots = currentDots ?? dotStates
    const ni = currentQ + 1
    if (ni >= total) {
      setPhase('done')
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
    setCurrentQ(0)
    setAnswer('')
    setMcSelected(null)
    setPhase('write')
    setDotStates(QUESTIONS.map((_, i) => i === 0 ? 'current' : 'empty'))
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
    recordAnswer(`studyhub-q${q.id}`, correct, xpReward)

    const nextDots = [...dotStates]
    nextDots[currentQ] = correct ? 'correct' : 'wrong'
    setDotStates(nextDots)

    if (correct && xpReward > 0) setXpBurst(xpReward)

    if (correct) {
      setTimeout(() => goNext(nextDots), 900)
    } else {
      // Wrong — keep feedback visible briefly, then open Mistake Autopsy
      setTimeout(() => {
        setAutopsyDots(nextDots)
        setAutopsyOpen(true)
      }, 900)
    }
  }

  const isDone = phase === 'done'

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
      {fullscreen && onToggleFullscreen && (
        <>
          <button
            onClick={() => setSplitMenuOpen(o => !o)}
            aria-label="פיצול מסך — בחר כלי לחלונית התחתונה"
            aria-haspopup="menu"
            aria-expanded={splitMenuOpen}
            title="פיצול מסך — בחר כלי לחלונית התחתונה"
            style={{
              position: 'fixed', bottom: 150, left: 52, zIndex: 300,
              background: 'linear-gradient(135deg,#4ECDC4,#3FB8AF)',
              color: '#0B1B3E',
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
            ⊟ פיצול מסך {splitMenuOpen ? '▾' : '▸'}
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
                  .map(([key, label]) => (
                    <button
                      key={key}
                      role="menuitem"
                      onClick={() => { handleSetTab(key as typeof tab); setSplitMenuOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', width: '100%',
                        textAlign: 'start',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: 8, padding: '9px 10px',
                        color: '#1F3E6C', fontFamily: "'Rubik', sans-serif",
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        minHeight: 40,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.16)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      {label}
                    </button>
                  ))}
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
        <img src={`${import.meta.env.BASE_URL}building-figma.png`} alt="" style={{ width: 34, height: 26, objectFit: 'cover', borderRadius: 5 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: '#E4E4E4', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${isDone ? 100 : ((currentQ)/total)*100}%`, height: '100%', background: 'rgba(212,175,55,0.75)', borderRadius: 10, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 11, color: TEXT_LIGHT, marginTop: 2 }}>
            {answeredCount} / {total} · {correctCount} ✓
          </div>
        </div>
        <div className="ws-quiz-topic" style={{ fontFamily: "'Assistant', sans-serif", fontSize: 14, color: TEXT_DARK }}>
          <span style={{ fontWeight: 700 }}>סטטיסטיקה</span>{!isDone && ` | ${q.topic}`}
        </div>
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
      <div ref={contentRowRef} style={{ flex: (tab === 'none' && !isDone) ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'flex-end', overflow: (tab === 'none' && !isDone) ? 'visible' : 'hidden', minHeight: 0, background: 'var(--sh-page-bg)', position: 'relative' }}>

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
                src={`${import.meta.env.BASE_URL}mindmap.html?userId=${userId || 'default'}`}
                title="מפת חשיבה — תוך כדי תרגול"
                style={{ position: 'absolute', inset: 0, border: 'none', width: '100%', height: '100%', display: 'block' }}
                allow="clipboard-read; clipboard-write"
              />
            )}
            {tab === 'canvas' && (
              <>
                {/* Per-question canvas navigation (Issue 4): each question gets
                    its own wb scene, persisted under wb-scene-q-<id>. Lets the
                    user jump back to a prior question's canvas without losing
                    work. */}
                <div style={{
                  position: 'absolute', top: 6, insetInlineStart: 6, zIndex: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(13,22,40,0.78)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(212,175,55,0.35)', borderRadius: 999,
                  padding: '4px 10px', fontFamily: "'Rubik', sans-serif",
                  fontSize: 12, color: '#e9edf7',
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
                  // Per-question scene key: changing q.id remounts the iframe so
                  // mindmap.html loads the matching wb-scene-q-<id> from
                  // localStorage. wbScene query param is read inside mindmap.html.
                  key={`quiz-wb-${q?.id || currentQ}`}
                  src={`${import.meta.env.BASE_URL}mindmap.html?mode=wb&userId=${userId || 'default'}&wbScene=q-${encodeURIComponent(q?.id ?? `idx${currentQ}`)}`}
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
            ? { flexShrink: 0, zIndex: 2, display: 'flex', flexDirection: 'column', maxHeight: '38vh', overflow: 'hidden' }
            : tab === 'none' || isDone
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
                  background: 'var(--sh-q-card-bg, rgba(255,255,255,0.97))',
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
                  background: 'var(--sh-q-card-bg, #ffffff)',
                  borderRadius: 0,
                  borderBottom: '1px solid rgba(127,155,217,0.22)',
                  overflow: 'auto',           // scroll if question + MC options exceed cap
                  display: 'flex', flexDirection: 'column',
                  // Was 25vh — too tight: header strip (~40px) + question stem +
                  // 4 MC options + KaTeX often clipped, hiding option D entirely.
                  // 38vh gives full options room while still leaving ~62vh for
                  // the canvas/mindmap pane beneath.
                  maxHeight: '38vh',
                  minHeight: '180px',
                }
              : tab === 'none' || isDone
              ? {
                  width: 'min(720px, 100%)',
                  background: 'var(--sh-q-card-bg, #ffffff)',
                  borderRadius: 18,
                  boxShadow: 'var(--sh-card-shadow)',
                  border: '1px solid rgba(127,155,217,0.3)',
                  overflow: 'hidden',
                }
              : {
                  width: '100%',
                  background: 'var(--sh-q-card-bg, rgba(255,255,255,0.97))',
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
                Also serves as drag handle when floatMode is on. */}
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
                <span title={floatMode ? 'גרור' : 'גרור לחלון צף'} style={{ width: 28, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: -4, marginRight: 4 }} aria-hidden="true" />
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
                  onClick={navNext}
                  disabled={isLastQ && !canGoNextQ}
                  aria-label="שאלה הבאה"
                  title={canGoNextQ ? 'הבא' : 'דלג והבא'}
                  style={{
                    background: '#D4AF37',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8, padding: '5px 14px',
                    cursor: (isLastQ && !canGoNextQ) ? 'not-allowed' : 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    opacity: (isLastQ && !canGoNextQ) ? 0.45 : 1,
                    boxShadow: '0 2px 8px rgba(212,175,55,0.35)',
                  }}
                >
                  הבא ←
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
                  ⤢
                </button>
              )}
              {/* Mobile: close-tool button instead of collapse chip */}
              {!isDone && isMobile && tab !== 'none' && (
                <button
                  onClick={() => handleSetTab('none')}
                  title="סגור כלי"
                  aria-label="סגור כלי וחזור לשאלה"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, marginRight: 'auto' }}
                >
                  ✕
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

            {/* Card body — height/scroll scales with mode */}
            <div style={{
              padding: '20px 22px 18px',
              maxHeight: (!isMobile && !floatMode && tab !== 'none' && !isDone) ? 'min(44vh, 360px)' : (floatMode || (isMobile && tab !== 'none' && !isDone)) ? 'calc(100vh - 280px)' : 'min(60vh, 520px)',
              overflowY: 'auto',
              flex: (floatMode || (isMobile && tab !== 'none' && !isDone)) ? 1 : 'unset',
            }}>

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
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#EA4335' }}>{total - correctCount}</div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>לשיפור</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: '#D4AF37' }}>
                    {questions.filter((_: any, i: number) => dotStates[i] === 'correct').reduce((s: number, q: any) => s + q.xp, 0)}
                  </div>
                  <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_LIGHT }}>XP הרווחת</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
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
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: TEXT_DARK, marginBottom: 10, textAlign: 'right' }}>
                שאלה {currentQ + 1} / {total}
              </div>

              <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 19, color: 'var(--sh-q-text-color)', lineHeight: 1.7, whiteSpace: 'pre-line', textAlign: 'right', marginBottom: 16, width: '100%' }}>
                {q.text}
              </div>

              {((q as any).format === 'mc' && Array.isArray((q as any).options)) ? (
                /* ── Multiple-choice render — 2×2 grid so all 4 options fit
                     w/o scrolling alongside the 25vh question card. Per user
                     2026-05-24: max-width + auto margins to center the grid
                     so answers don't push right of the question text. ── */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, maxWidth: 640, marginInline: 'auto', placeItems: 'stretch', justifyItems: 'stretch' }} dir="rtl">
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
                          minHeight: 44,
                          padding: '10px 16px',
                          background: bg,
                          border: `2.5px solid ${border}`,
                          borderRadius: 10,
                          color,
                          fontFamily: "'Assistant', sans-serif",
                          fontSize: 15,
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
                          minWidth: 32, height: 32, borderRadius: 16,
                          background: '#D4AF37', color: '#fff',
                          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
                          flexShrink: 0,
                        }}>
                          {letter}
                        </span>
                        <span style={{ lineHeight: 1.5, textAlign: 'center' }}>{opt}</span>
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
              ) : (
                <div style={{ border: `2px solid ${answer.trim() ? '#3351CA' : '#C8D0E0'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 18, transition: 'border-color 0.2s' }}>
                  <textarea
                    ref={quizTutRef}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="כתוב/י את פתרונך כאן..."
                    dir="rtl"
                    style={{
                      width: '100%', minHeight: 110,
                      border: 'none', outline: 'none',
                      padding: '14px 18px',
                      fontSize: 18, color: TEXT_DARK,
                      background: 'transparent',
                      fontFamily: "'Assistant', sans-serif",
                      resize: 'vertical', direction: 'rtl',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_LIGHT, cursor: 'pointer', textDecoration: 'underline' }} onClick={handleSkip}>דלג</span>

                {/* Dots — clickable navigation */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                    style={{ background: answer.trim() ? BUTTON_COLOR : '#C8D0E0', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 28px', fontFamily: "'Rubik', sans-serif", fontSize: 16, fontWeight: 700, cursor: answer.trim() ? 'pointer' : 'not-allowed', boxShadow: answer.trim() ? '0px 2px 6px #8DA7FF' : 'none', transition: 'all 0.2s' }}>
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
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK }}>שאלה {currentQ + 1} / {total}</div>
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
                  style={{ background: 'linear-gradient(135deg, rgba(52,168,83,0.08), rgba(52,168,83,0.04))', borderRadius: 10, padding: '14px 18px', border: '1.5px solid rgba(52,168,83,0.3)', fontFamily: "'Assistant', sans-serif", fontSize: 17, color: TEXT_DARK, lineHeight: 1.9, whiteSpace: 'pre-wrap', textAlign: 'right' }}
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
                        style={{ background: 'rgba(51,81,202,0.08)', color: BUTTON_COLOR, border: `1.5px solid rgba(51,81,202,0.25)`, borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        ← Previous
                      </button>
                    )}
                    {currentQ < total - 1 ? (
                      <button onClick={() => navigateToQuestion(currentQ + 1)}
                        style={{ background: BUTTON_COLOR, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(51,81,202,0.3)' }}>
                        Next →
                      </button>
                    ) : (
                      <button onClick={() => setPhase('done')}
                        style={{ background: '#D4AF37', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 22px', fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        Finish 🏆
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

            </div>
          </div>
        </div>
        )}

        {/* ── Spacer (only in calm mode) so the tab row sits at the bottom ── */}
        {tab === 'none' && !isDone && <div style={{ flex: 1, minHeight: 0 }} />}

        {/* ── Tab row: tool launcher / switcher ──────────────────────────────
             Hidden on mobile when a tool is open (bottom sheet covers it).
             On desktop it sits below the canvas with a dark gradient. */}
        {!isDone && !(isMobile && tab !== 'none') && (
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
              return (
                <button
                  key={key}
                  onClick={() => handleSetTab(key as typeof tab)}
                  title={hint}
                  style={{
                    background: active ? BUTTON_COLOR : (onTool ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)'),
                    color: active ? '#fff' : TEXT_DARK,
                    border: `1.5px solid ${active ? BUTTON_COLOR : (onTool ? 'rgba(127,155,217,0.55)' : 'rgba(127,155,217,0.35)')}`,
                    borderRadius: 22, padding: '8px 18px',
                    fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    boxShadow: active ? '0 4px 14px rgba(51,81,202,0.30)' : (onTool ? '0 2px 8px rgba(0,0,0,0.25)' : 'none'),
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

      </div>{/* end content wrap */}

      {/* Mistake Autopsy overlay — shown after wrong self-assessment */}
      {autopsyOpen && <MistakeAutopsy onDone={handleAutopsyDone} />}

    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────
const StudyHub = ({ onViewChange, darkMode, onToggleDarkMode, onLoggedIn, onLoggedOut }: StudyHubProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [internalView, setInternalView] = useState<InternalView>('home')
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>()
  const [quizDifficulty, setQuizDifficulty] = useState<DifficultyFilter>('all')
  const [userProgress, setUserProgress] = useState<UserProgress>(() =>
    loadProgress(initializeUser().userId)
  )
  const [sidebarWidth, setSidebarWidth] = useState(247)
  // Distraction-free fullscreen for the practice/learning view. When true,
  // sidebar + topbar are hidden so only the quiz + companion tool remain.
  const [learningFullscreen, setLearningFullscreen] = useState(false)
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
    internalView === 'topics' ? "סטטיסטיקה א' — בחר נושא" :
    'Study Zone'

  const handleSelectTopic = (topicId: string, mode: 'lesson' | 'quiz' = 'lesson') => {
    setSelectedTopic(topicId)
    setInternalView(mode === 'lesson' ? 'lesson' : 'quiz-intro')
  }

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
    setCurrentUser(null)
    onLoggedOut?.()
  }

  // Hydrate the per-user arsenal whenever the active user changes.
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.userId || currentUser.username || 'default'
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
            position: 'fixed', top: 12, right: 64, zIndex: 250,
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
        {!(learningFullscreen && internalView === 'learning') && (
          <header ref={topbarTutRef}><TopBar title={title} onLogout={handleLogout} darkMode={darkMode} onToggleDark={onToggleDarkMode} /></header>
        )}
        {internalView === 'home' && (
          <HomeScreen
            onGoLearning={() => setInternalView('topics')}
            onGoWorld={() => onViewChange('3d')}
            onGoMindmap={() => onViewChange('mindmap')}
            onSelectTopic={(topicId) => handleSelectTopic(topicId, 'quiz')}
          />
        )}
        {internalView === 'courses' && (
          <CourseGate
            onSelectActive={() => setInternalView('topics')}
          />
        )}
        {internalView === 'topics' && (
          <TopicSelector
            userProgress={userProgress}
            onSelectTopic={handleSelectTopic}
            onBack={() => setInternalView('courses')}
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
