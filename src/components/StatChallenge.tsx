/**
 * StatChallenge — Interactive statistics learning modal.
 * Opens when user clicks a building in WaffleStackCity.
 * Features: concept explanation, live distribution chart, parameter sliders, quiz.
 */

import { useState, useCallback } from 'react'
import DistributionChart, { DistributionType, DistributionParams } from './DistributionChart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

interface ChallengeContent {
  concept: string
  conceptHe: string
  emoji: string
  color: string
  explanation: string
  formula: string
  distribution: DistributionType
  defaultParams: DistributionParams
  sliders: SliderDef[]
  quiz: QuizQuestion[]
}

interface SliderDef {
  key: keyof DistributionParams
  label: string
  labelHe: string
  min: number
  max: number
  step: number
}

export interface BuildingInfo {
  id: string
  label: string
  statsConcept: string
  color?: string
}

// ─── Challenge Definitions ────────────────────────────────────────────────────

const CHALLENGES: Record<string, ChallengeContent> = {
  power: {
    concept: 'Mean', conceptHe: 'ממוצע',
    emoji: '⚡', color: '#FFD700',
    explanation: 'הממוצע הוא סכום כל הערכים חלקי מספרם. הוא מייצג את "מרכז הכובד" של הנתונים. אם לכולם יש אותה רמת חשמל, האנרגיה מתחלקת שווה — זה הממוצע!',
    formula: 'μ = (x₁ + x₂ + ... + xₙ) / n',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'mean', label: 'Mean (μ)', labelHe: 'ממוצע', min: -3, max: 3, step: 0.1 },
      { key: 'sigma', label: 'Spread (σ)', labelHe: 'פיזור', min: 0.3, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'חמישה סטודנטים קיבלו ציונים: 60, 70, 80, 90, 100. מה הממוצע?',
        options: ['75', '80', '85', '90'],
        correct: 1,
        explanation: 'סכום: 60+70+80+90+100 = 400. חלקי 5 = 80. ✓',
      },
      {
        q: 'אם הממוצע של 4 מספרים הוא 10, מה הסכום שלהם?',
        options: ['10', '20', '30', '40'],
        correct: 3,
        explanation: 'ממוצע = סכום / מספר ← סכום = 10 × 4 = 40. ✓',
      },
      {
        q: 'מה הממוצע של: 2, 4, 4, 4, 5, 5, 7, 9?',
        options: ['4', '5', '6', '7'],
        correct: 1,
        explanation: 'סכום = 40, חלקי 8 = 5. ✓',
      },
      {
        q: 'ערך קיצוני גדול מאוד מוסף לנתונים. מה קורה לממוצע?',
        options: ['יורד', 'לא משתנה', 'עולה', 'הופך לחציון'],
        correct: 2,
        explanation: 'הממוצע רגיש לערכים קיצוניים — ערך גדול מאוד מעלה אותו. ✓',
      },
    ],
  },

  housing: {
    concept: 'Median', conceptHe: 'חציון',
    emoji: '🏠', color: '#4ECDC4',
    explanation: 'החציון הוא הערך האמצעי כשהנתונים מסודרים מקטן לגדול. הוא פחות רגיש לערכים קיצוניים מהממוצע. בשכר דיור, החציון מספר לנו מה "אמצע" השוק.',
    formula: 'מסדרים את כל הנתונים → בוחרים את האמצעי',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1.5 },
    sliders: [
      { key: 'mean', label: 'Center', labelHe: 'מרכז', min: -3, max: 3, step: 0.1 },
      { key: 'sigma', label: 'Spread', labelHe: 'פיזור', min: 0.3, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'מה החציון של: 3, 7, 2, 9, 4?',
        options: ['3', '4', '5', '7'],
        correct: 1,
        explanation: 'מסודר: 2, 3, 4, 7, 9 → האמצעי הוא 4. ✓',
      },
      {
        q: 'מה החציון של: 1, 3, 5, 7?',
        options: ['3', '4', '5', '3.5'],
        correct: 1,
        explanation: 'זוגי מספרים → ממוצע שני האמצעיים: (3+5)/2 = 4. ✓',
      },
      {
        q: 'למה לעיתים עדיף להשתמש בחציון ולא בממוצע?',
        options: ['חציון תמיד גדול יותר', 'חציון פחות רגיש לערכים קיצוניים', 'חציון קל יותר לחישוב', 'ממוצע לא מדויק'],
        correct: 1,
        explanation: 'ערכים קיצוניים (כמו משכורת מיליארדר) מעוותים את הממוצע אך לא את החציון. ✓',
      },
    ],
  },

  traffic: {
    concept: 'Standard Deviation', conceptHe: 'סטיית תקן',
    emoji: '🚦', color: '#FF6B6B',
    explanation: 'סטיית התקן מודדת כמה הנתונים מפוזרים סביב הממוצע. σ קטנה = כולם קרובים לממוצע. σ גדולה = הנתונים פרושים. ב-68% מהמקרים הנתונים נמצאים בטווח μ±σ.',
    formula: 'σ = √[ Σ(xᵢ - μ)² / n ]',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'sigma', label: 'Std Dev (σ)', labelHe: 'סטיית תקן', min: 0.2, max: 4, step: 0.1 },
      { key: 'mean', label: 'Mean (μ)', labelHe: 'ממוצע', min: -3, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'התפלגות נורמלית עם μ=100 ו-σ=15. כמה אחוז מהנתונים בין 85 ל-115?',
        options: ['34%', '68%', '95%', '99.7%'],
        correct: 1,
        explanation: '85=μ-σ, 115=μ+σ. כלל 68-95-99.7: 68% מהנתונים בטווח μ±σ. ✓',
      },
      {
        q: 'σ=2 לעומת σ=5 — מה ההבדל בעקומת הפעמון?',
        options: ['σ=2 רחבה יותר', 'σ=5 רחבה יותר', 'שתיהן זהות', 'σ=2 גבוהה ורחבה יותר'],
        correct: 1,
        explanation: 'סטיית תקן גדולה = נתונים פרושים יותר = עקומה רחבה ונמוכה יותר. ✓',
      },
      {
        q: 'מה הסבירות לקבל ערך בין μ-2σ ל-μ+2σ?',
        options: ['68%', '75%', '95%', '99.7%'],
        correct: 2,
        explanation: 'כלל 68-95-99.7: כ-95% מהנתונים נמצאים בטווח 2σ מהממוצע. ✓',
      },
    ],
  },

  hospital: {
    concept: 'Normal Distribution', conceptHe: 'התפלגות נורמלית',
    emoji: '🏥', color: '#95E1D3',
    explanation: 'ההתפלגות הנורמלית ("עקומת הפעמון") מופיעה בטבע בכל מקום — גבהים, ציונים, לחץ דם. היא סימטרית סביב הממוצע, ו-68% מהנתונים נמצאים ב-σ± אחד.',
    formula: 'f(x) = (1/σ√2π) · e^(-(x-μ)²/2σ²)',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'mean', label: 'Mean (μ)', labelHe: 'ממוצע', min: -3, max: 3, step: 0.1 },
      { key: 'sigma', label: 'Std Dev (σ)', labelHe: 'סטיית תקן', min: 0.3, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'בהתפלגות נורמלית, מה הסבירות שנקבל ערך הגדול מ-μ?',
        options: ['25%', '50%', '68%', '95%'],
        correct: 1,
        explanation: 'ההתפלגות הנורמלית סימטרית — בדיוק 50% מהנתונים מעל הממוצע. ✓',
      },
    ],
  },

  school: {
    concept: 'Sampling', conceptHe: 'מדגם',
    emoji: '🏫', color: '#AA96DA',
    explanation: 'מדגם הוא קבוצה קטנה שנבחרת מתוך אוכלוסיה גדולה. אנחנו לומדים על כולם מתוך חלק. ככל שהמדגם גדול יותר ואקראי יותר, המסקנות מדויקות יותר.',
    formula: 'שגיאת מדגם = σ / √n',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'sigma', label: 'Sample Error', labelHe: 'שגיאת מדגם', min: 0.1, max: 3, step: 0.05 },
    ],
    quiz: [
      {
        q: 'מדגם של 100 סטודנטים מ-10,000. הגדלנו ל-400. שגיאת המדגם:',
        options: ['גדלה פי 4', 'קטנה פי 2', 'לא השתנתה', 'גדלה פי 2'],
        correct: 1,
        explanation: 'שגיאה ∝ 1/√n. כשn גדל פי 4, שגיאה קטנה פי 2 (√4=2). ✓',
      },
    ],
  },

  bank: {
    concept: 'Regression', conceptHe: 'רגרסיה',
    emoji: '🏦', color: '#FCBAD3',
    explanation: 'רגרסיה לינארית מוצאת את הקו הישר שמסביר הכי טוב את הקשר בין שני משתנים. משתמשים בו לחיזוי — לדוגמה, חיזוי ציון לפי שעות לימוד.',
    formula: 'y = β₀ + β₁x + ε',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 0.8 },
    sliders: [
      { key: 'sigma', label: 'Residuals (σ)', labelHe: 'שאריות', min: 0.1, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'קו הרגרסיה: y = 2x + 5. עבור x=3, מה y?',
        options: ['10', '11', '12', '15'],
        correct: 1,
        explanation: 'y = 2(3) + 5 = 6 + 5 = 11. ✓',
      },
    ],
  },

  market: {
    concept: 'Correlation', conceptHe: 'קורלציה',
    emoji: '🏪', color: '#A8E6CF',
    explanation: 'קורלציה מודדת כמה חזק הקשר בין שני משתנים (-1 עד 1). r=1: קשר חיובי מושלם. r=-1: הפוך מושלם. r=0: אין קשר. לא אומרת סיבתיות!',
    formula: 'r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / (n·σₓ·σᵧ)',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'mean', label: 'Correlation strength', labelHe: 'עוצמת קשר', min: -3, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'קורלציה של r=0.9 בין שעות לימוד לציון. מה זה אומר?',
        options: [
          'ציון גבוה גורם ללימוד רב',
          'קשר חיובי חזק — ככל שלומדים יותר, ציון גבוה יותר',
          'אין קשר בין השניים',
          'קשר שלילי חזק',
        ],
        correct: 1,
        explanation: 'r=0.9 הוא קשר חיובי חזק. שימו לב: קשר ≠ סיבתיות! ✓',
      },
    ],
  },

  'city-hall': {
    concept: 'Binomial Distribution', conceptHe: 'בינום',
    emoji: '🏛️', color: '#F38181',
    explanation: 'התפלגות בינומית מחשבת הסתברות של k הצלחות ב-n ניסיונות, כאשר כל ניסיון עצמאי עם הסתברות הצלחה p. לדוגמה: כמה מתוך 10 הטלות מטבע יצאו עץ?',
    formula: 'P(X=k) = C(n,k) · pᵏ · (1-p)^(n-k)',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1.5 },
    sliders: [
      { key: 'sigma', label: 'Spread', labelHe: 'פיזור', min: 0.5, max: 3, step: 0.1 },
    ],
    quiz: [
      {
        q: 'הטלת מטבע הוגן 4 פעמים. מה ההסתברות לקבל 0 עץ?',
        options: ['1/4', '1/8', '1/16', '1/2'],
        correct: 2,
        explanation: 'P(X=0) = (1/2)⁴ = 1/16. ✓',
      },
    ],
  },

  research: {
    concept: 'Hypothesis Testing', conceptHe: 'מבחן השערות',
    emoji: '🔬', color: '#C3A6FF',
    explanation: 'מבחן השערות בודק האם נתונים מספיקים כדי לדחות את ה-H₀ (השערת האפס). קובעים רמת מובהקות α (לרוב 0.05) ובודקים האם p-value < α.',
    formula: 'H₀: μ=μ₀ | H₁: μ≠μ₀ | p-value < α → דוחים H₀',
    distribution: 't',
    defaultParams: { df: 10 },
    sliders: [
      { key: 'df', label: 'Degrees of Freedom', labelHe: 'דרגות חופש', min: 1, max: 30, step: 1 },
    ],
    quiz: [
      {
        q: 'p-value = 0.03, α = 0.05. מה המסקנה?',
        options: [
          'לא דוחים H₀',
          'דוחים H₀, התוצאה מובהקת סטטיסטית',
          'לא ניתן לקבוע',
          'H₀ נכון',
        ],
        correct: 1,
        explanation: 'p=0.03 < α=0.05 → דוחים H₀. התוצאה מובהקת סטטיסטית. ✓',
      },
    ],
  },

  news: {
    concept: 'Confidence Interval', conceptHe: 'רווח סמך',
    emoji: '📰', color: '#FFB347',
    explanation: 'רווח סמך 95% אומר: "95% מהרווחים שנחשב בשיטה זו יכילו את הפרמטר האמיתי." הוא מראה כמה בטוחים אנחנו באמידה שלנו.',
    formula: 'CI = x̄ ± z·(σ/√n)',
    distribution: 'normal',
    defaultParams: { mean: 0, sigma: 1 },
    sliders: [
      { key: 'sigma', label: 'Interval width', labelHe: 'רוחב הרווח', min: 0.2, max: 3, step: 0.05 },
      { key: 'mean', label: 'Center', labelHe: 'מרכז', min: -2, max: 2, step: 0.1 },
    ],
    quiz: [
      {
        q: 'רווח סמך 95% הוא [70, 80]. מה המסקנה הנכונה?',
        options: [
          'הממוצע האמיתי הוא בוודאות 75',
          'יש סיכוי 95% שהממוצע האמיתי בין 70 ל-80',
          '95% מהנתונים בין 70 ל-80',
          'הרווח לא נכון',
        ],
        correct: 1,
        explanation: 'רווח סמך 95% = 95% מהרווחים שנחשב בדרך זו יכילו את הפרמטר האמיתי. ✓',
      },
    ],
  },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SliderRowProps {
  def: SliderDef
  value: number
  onChange: (val: number) => void
  color: string
}

function SliderRow({ def, value, onChange, color }: SliderRowProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          {def.labelHe} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>({def.label})</span>
        </span>
        <span style={{
          fontSize: 13, fontWeight: 700, color,
          background: `${color}22`, padding: '1px 8px', borderRadius: 6,
        }}>
          {value.toFixed(def.step < 1 ? 1 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: 4, accentColor: color, cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{def.min}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{def.max}</span>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  building: BuildingInfo
  onClose: () => void
  onComplete?: (buildingId: string) => void
}

export default function StatChallenge({ building, onClose, onComplete }: Props) {
  const content = CHALLENGES[building.id] ?? CHALLENGES['hospital']
  const color = building.color ?? content.color

  // Distribution params state
  const [params, setParams] = useState<DistributionParams>(content.defaultParams)

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  const currentQ = content.quiz[quizIndex]

  const handleSlider = useCallback((key: keyof DistributionParams, val: number) => {
    setParams(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === currentQ.correct) setScore(s => s + 1)
  }

  const nextQuestion = () => {
    if (quizIndex + 1 >= content.quiz.length) {
      setQuizDone(true)
      onComplete?.(building.id)
    } else {
      setQuizIndex(i => i + 1)
      setSelected(null)
    }
  }

  const resetQuiz = () => {
    setQuizIndex(0)
    setSelected(null)
    setScore(0)
    setQuizDone(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(5, 5, 15, 0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
        border: `1px solid ${color}44`,
        borderRadius: 20,
        width: '100%', maxWidth: 900,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 60px ${color}22`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: `1px solid ${color}22`,
          display: 'flex', alignItems: 'center', gap: 14,
          background: `linear-gradient(90deg, ${color}11 0%, transparent 100%)`,
        }}>
          <div style={{
            fontSize: 36, background: `${color}22`,
            width: 56, height: 56, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}44`,
          }}>
            {content.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color, fontWeight: 600, marginBottom: 2 }}>
              {building.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              {content.conceptHe}
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 8 }}>
                ({content.concept})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, width: 36, height: 36,
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Body — two columns */}
        <div style={{
          flex: 1, overflow: 'auto', display: 'flex', gap: 0,
        }}>

          {/* Left — concept + chart + sliders */}
          <div style={{
            flex: '1 1 400px', padding: '22px 24px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>

            {/* Explanation */}
            <div style={{
              background: `${color}0d`, border: `1px solid ${color}22`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 20,
              fontSize: 13, color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.7, direction: 'rtl', textAlign: 'right',
            }}>
              {content.explanation}
            </div>

            {/* Formula */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 8,
              padding: '10px 14px', marginBottom: 20,
              fontFamily: 'monospace', fontSize: 13, color,
              letterSpacing: 0.5,
            }}>
              {content.formula}
            </div>

            {/* Distribution Chart */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 1 }}>
                LIVE DISTRIBUTION PREVIEW
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 10,
                border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <DistributionChart
                  distribution={content.distribution}
                  params={params}
                  width={340}
                  height={160}
                  color={color}
                />
              </div>
            </div>

            {/* Sliders */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1 }}>
                INTERACTIVE PARAMETERS — גרור לשינוי
              </div>
              {content.sliders.map(slider => (
                <SliderRow
                  key={slider.key}
                  def={slider}
                  value={(params[slider.key] as number) ?? slider.min}
                  onChange={val => handleSlider(slider.key, val)}
                  color={color}
                />
              ))}
            </div>
          </div>

          {/* Right — quiz */}
          <div style={{
            flex: '1 1 340px', padding: '22px 24px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color, marginBottom: 16, fontWeight: 600 }}>
              🎯 QUIZ — בחן את עצמך
            </div>

            {quizDone ? (
              /* Score screen */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 64 }}>
                  {score === content.quiz.length ? '🏆' : score > 0 ? '⭐' : '💪'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
                  {score}/{content.quiz.length}
                </div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
                  {score === content.quiz.length
                    ? 'מושלם! הבניין שלך שודרג! 🏙️'
                    : 'טוב! נסה שוב לשדרג את הבניין.'}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={resetQuiz} style={{
                    padding: '10px 24px', background: `${color}22`,
                    border: `1px solid ${color}44`, borderRadius: 10,
                    color, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}>🔄 שחק שוב</button>
                  <button onClick={onClose} style={{
                    padding: '10px 24px', background: color,
                    border: 'none', borderRadius: 10,
                    color: '#000', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  }}>🏙️ חזור לעיר</button>
                </div>
              </div>
            ) : (
              /* Question */
              <div style={{ flex: 1 }}>
                {/* Progress */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {content.quiz.map((_, i) => (
                    <div key={i} style={{
                      height: 3, flex: 1, borderRadius: 2,
                      background: i < quizIndex ? color : i === quizIndex ? `${color}88` : 'rgba(255,255,255,0.12)',
                    }} />
                  ))}
                </div>

                {/* Question text */}
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '16px 18px',
                  marginBottom: 16, fontSize: 14,
                  color: 'rgba(255,255,255,0.9)',
                  direction: 'rtl', textAlign: 'right',
                  lineHeight: 1.6,
                }}>
                  {currentQ.q}
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentQ.options.map((opt, idx) => {
                    const isCorrect = idx === currentQ.correct
                    const isSelected = idx === selected
                    let bg = 'rgba(255,255,255,0.04)'
                    let border = '1px solid rgba(255,255,255,0.1)'
                    let textColor = 'rgba(255,255,255,0.75)'
                    if (selected !== null) {
                      if (isCorrect) { bg = '#4ECDC422'; border = '1px solid #4ECDC4'; textColor = '#4ECDC4' }
                      else if (isSelected) { bg = '#FF6B6B22'; border = '1px solid #FF6B6B'; textColor = '#FF6B6B' }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selected !== null}
                        style={{
                          background: bg, border, borderRadius: 10,
                          padding: '12px 16px', cursor: selected !== null ? 'default' : 'pointer',
                          color: textColor, fontSize: 13, textAlign: 'right',
                          direction: 'rtl', transition: 'all 0.2s',
                          display: 'flex', gap: 10, alignItems: 'center',
                        }}
                      >
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: selected !== null && isCorrect ? '#4ECDC4' : 'rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                          color: selected !== null && isCorrect ? '#000' : 'inherit',
                        }}>
                          {selected !== null && isCorrect ? '✓' : String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation + Next */}
                {selected !== null && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      background: selected === currentQ.correct ? '#4ECDC411' : '#FF6B6B11',
                      border: `1px solid ${selected === currentQ.correct ? '#4ECDC444' : '#FF6B6B44'}`,
                      borderRadius: 10, padding: '10px 14px',
                      fontSize: 12, color: 'rgba(255,255,255,0.7)',
                      direction: 'rtl', textAlign: 'right', lineHeight: 1.6,
                      marginBottom: 10,
                    }}>
                      {selected === currentQ.correct ? '✅ ' : '❌ '}{currentQ.explanation}
                    </div>
                    <button onClick={nextQuestion} style={{
                      width: '100%', padding: '11px',
                      background: color, border: 'none', borderRadius: 10,
                      color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>
                      {quizIndex + 1 >= content.quiz.length ? '🏆 סיים' : 'שאלה הבאה →'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
