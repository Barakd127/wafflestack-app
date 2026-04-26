/**
 * StatChallenge — Interactive statistics learning modal.
 * Opens when user clicks a building in WaffleStackCity.
 * Features: concept explanation, live distribution chart, parameter sliders, quiz.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import DistributionChart, { DistributionType, DistributionParams } from './DistributionChart'
import { playCorrectTone, playWrongTone } from './SoundManager'
import { getQuestionsForBuilding } from '../hooks/useQuiz'

// ─── Responsive helper ────────────────────────────────────────────────────────

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setW(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return w
}

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
    distribution: 'bar-mean',
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
    distribution: 'bar-median',
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
    distribution: 'sampling',
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
      {
        q: 'מהו מדגם אקראי פשוט?',
        options: ['בוחרים את הראשונים ברשימה', 'כל אחד מהאוכלוסיה קיים אפשרות שווה להיבחר', 'בוחרים כל k-יה', 'בוחרים לפי קבוצות'],
        correct: 1,
        explanation: 'במדגם אקראי פשוט לכל פרט יש אפשרות שווה להיכלל. ✓',
      },
      {
        q: 'למה מדגם טוב יותר ממפקד מלא לעיתים?',
        options: ['מדגם תמיד מדויק יותר', 'זול וגמיש יותר', 'אינו מחייב אישור אתי', 'נותן תוצאות מיידיות'],
        correct: 1,
        explanation: 'מדגם חוסך זמן ומשאבים — לעיתים מפקד מלא בלתי אפשרי. ✓',
      },
      {
        q: '1000 סטודנטים נבחרו מ-50,000. מה שיעור המדגם?',
        options: ['0.5%', '2%', '5%', '10%'],
        correct: 1,
        explanation: '1000/50000 = 0.02 = 2%. ✓',
      },
    ],
  },

  bank: {
    concept: 'Regression', conceptHe: 'רגרסיה',
    emoji: '🏦', color: '#FCBAD3',
    explanation: 'רגרסיה לינארית מוצאת את הקו הישר שמסביר הכי טוב את הקשר בין שני משתנים. משתמשים בו לחיזוי — לדוגמה, חיזוי ציון לפי שעות לימוד.',
    formula: 'y = β₀ + β₁x + ε',
    distribution: 'scatter-regression',
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
      {
        q: 'מה פירוש β₁=3 בקו רגרסיה y=β₀+β₁x?',
        options: ['הקטוע הוא 3', 'כל עלייה של 1 ב-x מעלה y ב-3', 'השגיאה היא 3', 'המתאם הוא 3'],
        correct: 1,
        explanation: 'β₁ הוא השיפוע — עלייה של יחידה ב-x גורמת לעלייה של β₁ ב-y. ✓',
      },
      {
        q: 'R²=0.85 ברגרסיה. מה זה אומר?',
        options: ['85% מהתצפיות על הקו', '85% מהשונות ב-y מוסברת ע"י x', 'המתאם הוא 0.85', 'שגיאת החיזוי היא 15%'],
        correct: 1,
        explanation: 'R² (coefficient of determination) מייצג כמה מהשונות של y מוסברת על ידי המודל. ✓',
      },
      {
        q: 'מה הן שאריות (residuals) ברגרסיה?',
        options: ['ערכי x הלא ידועים', 'ההפרש בין הערך הנצפה לערך החזוי', 'מקדמי הקו', 'ממוצע הטעויות'],
        correct: 1,
        explanation: 'שאריות = y_נצפה - y_חזוי. ניתוח שאריות חושף האם המודל מתאים. ✓',
      },
    ],
  },

  market: {
    concept: 'Correlation', conceptHe: 'קורלציה',
    emoji: '🏪', color: '#A8E6CF',
    explanation: 'קורלציה מודדת כמה חזק הקשר בין שני משתנים (-1 עד 1). r=1: קשר חיובי מושלם. r=-1: הפוך מושלם. r=0: אין קשר. לא אומרת סיבתיות!',
    formula: 'r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / (n·σₓ·σᵧ)',
    distribution: 'scatter-pos',
    defaultParams: { correlation: 0.75 },
    sliders: [
      { key: 'correlation', label: 'Correlation (r)', labelHe: 'עוצמת קשר', min: -0.99, max: 0.99, step: 0.05 },
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
      {
        q: 'מה פירוש קורלציה שלילית (r=-0.8)?',
        options: ['אין קשר', 'ככל שעולה אחד, יורד השני', 'שניהם עולים ביחד', 'השונות שלהם זהה'],
        correct: 1,
        explanation: 'קורלציה שלילית = כשמשתנה אחד עולה, השני נוטה לרדת. ✓',
      },
      {
        q: 'מה הטווח האפשרי של מקדם הקורלציה r?',
        options: ['0 עד 1', '-1 עד 0', '-1 עד 1', '-∞ עד ∞'],
        correct: 2,
        explanation: 'r תמיד בין -1 (קשר שלילי מושלם) ל-1 (קשר חיובי מושלם). ✓',
      },
      {
        q: 'r=0 בין שתי משתנים. מה אפשר להסיק?',
        options: ['אין קשר ליניארי', 'אין קשר מכל סוג', 'יש קשר חזק', 'יש קשר סיבתי'],
        correct: 0,
        explanation: 'r=0 אומר רק שאין קשר ליניארי — עשוי להיות קשר לא ליניארי. ✓',
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
      {
        q: 'מהם התנאים להתפלגות בינומית?',
        options: ['ניסויים תלויים, סתברות משתנה', 'n ניסויים עצמאיים, p קבוע', 'ניסוי אחד עם n תוצאות', 'ממוצע = שונות'],
        correct: 1,
        explanation: 'בינומי: n ניסויים עצמאיים, 2 תוצאות, הסתברות p קבועה בכל ניסוי. ✓',
      },
      {
        q: 'X~B(10, 0.5). מה הממוצע?',
        options: ['0.5', '2.5', '5', '10'],
        correct: 2,
        explanation: 'ממוצע התפלגות בינומית = n·p = 10·0.5 = 5. ✓',
      },
      {
        q: '30% מהסטודנטים עוברים בחינה. מה ההסתברות ש-3 מתוך 5 יעברו?',
        options: ['C(5,3)·0.3³·0.7²', 'C(5,3)·0.7³·0.3²', '0.3³', '0.3³·0.7²'],
        correct: 0,
        explanation: 'P(X=3) = C(5,3)·0.3³·0.7² = 10·0.027·0.49 ≈ 0.132. ✓',
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
      {
        q: 'מהי שגיאת סוג I?',
        options: ['לא לדחות H₁ שגויה', 'לדחות H₀ נכונה', 'לקבל H₀ שגויה', 'לא מסיק כלום'],
        correct: 1,
        explanation: 'שגיאת סוג I (False Positive): דחינו את H₀ למרות שהיא נכונה. ההסתברות שלה = α. ✓',
      },
      {
        q: 'מה פירוש רמת מובהקות α=0.05?',
        options: ['5% מהנתונים חורגים', 'מוכנים לטעות סוג I ב-5% מהמקרים', 'הסיכוי לH₀ הוא 5%', 'דחינו 5% מהשערות'],
        correct: 1,
        explanation: 'α מגדיר את הסיכון המקסימלי שאנחנו מוכנים לטעות ולדחות H₀ נכונה. ✓',
      },
      {
        q: 'p-value = 0.12, α = 0.05. מה עושים?',
        options: ['דוחים H₀', 'לא דוחים H₀', 'מגדילים n', 'מוחקים הנתונים'],
        correct: 1,
        explanation: 'p=0.12 > α=0.05 → אין מספיק ראיות לדחות H₀. לא דוחים. ✓',
      },
    ],
  },

  news: {
    concept: 'Confidence Interval', conceptHe: 'רווח סמך',
    emoji: '📰', color: '#FFB347',
    explanation: 'רווח סמך 95% אומר: "95% מהרווחים שנחשב בשיטה זו יכילו את הפרמטר האמיתי." הוא מראה כמה בטוחים אנחנו באמידה שלנו.',
    formula: 'CI = x̄ ± z·(σ/√n)',
    distribution: 'confidence-interval',
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
      {
        q: 'מה יקרה לרווח הסמך אם נגדיל את n?',
        options: ['יתרחב', 'יצטמצם', 'לא ישתנה', 'יהפוך לאפס'],
        correct: 1,
        explanation: 'רווח סמך = x̄ ± z·σ/√n — כשn גדל, σ/√n קטן, הרווח מצטמצם. ✓',
      },
      {
        q: 'מה ההבדל בין רווח סמך 90% ל-99%?',
        options: ['99% צר יותר', '99% רחב יותר', 'זהים', '90% מדויק יותר'],
        correct: 1,
        explanation: 'רמת ביטחון גבוהה יותר = z גדול יותר = רווח רחב יותר. Tradeoff בין דיוק לביטחון. ✓',
      },
      {
        q: 'שגיאת הדגימה היא ±3 ברמת 95%. מה רווח הסמך עבור x̄=50?',
        options: ['[47, 53]', '[44, 56]', '[48, 52]', '[46, 54]'],
        correct: 0,
        explanation: 'CI = x̄ ± שגיאה = 50 ± 3 = [47, 53]. ✓',
      },
    ],
  },
}

// ─── Visualization lookup ────────────────────────────────────────────────────

export function getVisualizationForTopic(buildingId: string): { distribution: DistributionType; params: DistributionParams } {
  const c = CHALLENGES[buildingId]
  if (!c) return { distribution: 'bar-mean', params: { mean: 0, sigma: 1 } }
  return { distribution: c.distribution, params: c.defaultParams }
}

// ─── Related concept links ───────────────────────────────────────────────────

const RELATED_CONCEPTS: Record<string, string[]> = {
  power:       ['housing', 'traffic', 'hospital'],
  housing:     ['power', 'traffic'],
  traffic:     ['power', 'hospital'],
  hospital:    ['traffic', 'research', 'news'],
  school:      ['research', 'news'],
  bank:        ['market', 'hospital'],
  market:      ['bank', 'power'],
  'city-hall': ['hospital', 'school'],
  research:    ['hospital', 'news', 'school'],
  news:        ['research', 'school', 'hospital'],
}

// ─── Simple analogies for quiz warm-up ──────────────────────────────────────

const SIMPLE_ANALOGIES: Record<string, string> = {
  power:       'חשוב על ממוצע כמו חלוקת חשבון במסעדה בין חברים — כמה כל אחד משלם?',
  housing:     'כמו למצוא את ה"שכן האמצעי" בבניין — לא הכי עשיר, לא הכי עני.',
  traffic:     'בפקק: האם כולם נוסעים במהירות דומה, או שיש כזה שנוסע 20 וכזה שנוסע 120?',
  hospital:    'ציוני הפסיכומטרי, גבהים, לחץ דם — בטבע כולם מתפזרים כמו פעמון סביב הממוצע.',
  school:      'כמו לשאול 1,000 אנשים ברחוב כדי לנחש מה 6 מיליון ישראלים חושבים.',
  bank:        'כמו לנחש את מחיר הדירה לפי מספר חדרים — מצא את הקו הישר שמסביר הכי טוב.',
  market:      'מעשנים יותר → סרטן ריאות יותר. קשר חזק = r קרוב ל-1. אבל קשר ≠ סיבה!',
  'city-hall': 'כמו לנחש כמה "עץ" יצאו אם הטלת 10 מטבעות הוגנים.',
  research:    'כמו חוקר תרופות: "האם ההשפעה אמיתית — או שנחשבנו פשוט?"',
  news:        'כמו מד דיוק: "±3% ב-95% מהסקרים" — כמה בטוחים אנחנו בממצאים?',
}

// ─── Real-world fact cards ───────────────────────────────────────────────────

const DID_YOU_KNOW: Record<string, string> = {
  power:       'הממוצע משמש בישראל לחישוב ממוצע הבגרות — הבסיס לקבלה לאוניברסיטאות.',
  housing:     'הלמ"ס מדווח על חציון השכר, לא הממוצע, כי מיליארדרים מעוותים את הממוצע.',
  traffic:     'חברות ביטוח מחשבות סטיית תקן של נזקי שיטפון כדי לתמחר פוליסות ביטוח.',
  hospital:    'ציוני הפסיכומטרי בישראל מתוכנן לפי התפלגות נורמלית — ממוצע 500, סטיית תקן 100.',
  school:      'כל סקר בחירות בישראל הוא מדגם — בדרך כלל ~1,000 איש מתוך 6 מיליון מצביעים.',
  bank:        'הבנקים בישראל משתמשים ברגרסיה לינארית לחיזוי סיכון אשראי של לווים.',
  market:      'הקורלציה בין מדד ת"א 35 לשוק האמריקאי עומדת על ~0.7 — ישראל גלובלית מאוד.',
  'city-hall': 'הסיכוי שנולד בן הוא ~51%. ב-10 לידות, הממוצע הבינומי הוא 5.1 בנים.',
  research:    'במחקרי תרופות בישראל, נדרש p<0.05 לפני אישור תרופה חדשה לשוק.',
  news:        'סקרי שביעות רצון ממשלתיים מדווחים עם רווח סמך של ±3% ברמת ביטחון 95%.',
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

// ─── Confetti animation ──────────────────────────────────────────────────────

const CONFETTI_STYLE = `
@keyframes confetti-fly {
  0%   { opacity: 1; transform: translate(0, 0) scale(1.2) rotate(0deg); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3) rotate(540deg); }
}
`

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  building: BuildingInfo
  onClose: () => void
  onComplete?: (buildingId: string) => void
  soundEnabled?: boolean
  nextBuilding?: BuildingInfo
  onNext?: () => void
  onNavigateTo?: (buildingId: string) => void
}

export function getQuizForBuilding(id: string): { q: string; options: string[]; correct: number; explanation: string }[] {
  return CHALLENGES[id]?.quiz ?? []
}

export default function StatChallenge({ building, onClose, onComplete, soundEnabled = false, nextBuilding, onNext, onNavigateTo }: Props) {
  const content = CHALLENGES[building.id] ?? CHALLENGES['hospital']
  const color = building.color ?? content.color

  // Responsive
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 720
  const [mobileTab, setMobileTab] = useState<'learn' | 'quiz'>('learn')

  // Distribution params state
  const [params, setParams] = useState<DistributionParams>(content.defaultParams)

  // Load questions from quiz-bank; fall back to CHALLENGES hardcoded quiz
  const questions = useMemo(() => {
    const bankQuestions = getQuestionsForBuilding(building.id)
    return bankQuestions.length > 0 ? bankQuestions : content.quiz
  }, [building.id, content.quiz])

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [hintShown, setHintShown] = useState(false)
  const [confettiBurst, setConfettiBurst] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState<{ qIndex: number; chosen: number }[]>([])
  const [showMistakes, setShowMistakes] = useState(false)

  // Reflection state — persisted per building
  const [reflection, setReflection] = useState(
    () => localStorage.getItem(`wafflestack-reflection-${building.id}`) ?? ''
  )
  const handleReflectionChange = (text: string) => {
    setReflection(text)
    localStorage.setItem(`wafflestack-reflection-${building.id}`, text)
  }

  // Difficulty rating — persisted per building
  const [difficultyRating, setDifficultyRating] = useState<number | null>(() => {
    const stored = localStorage.getItem(`wafflestack-difficulty-${building.id}`)
    return stored ? parseInt(stored) : null
  })
  const handleDifficultyRating = (rating: number) => {
    setDifficultyRating(rating)
    localStorage.setItem(`wafflestack-difficulty-${building.id}`, String(rating))
  }

  const currentQ = questions[quizIndex]

  const handleSlider = useCallback((key: keyof DistributionParams, val: number) => {
    setParams(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === currentQ.correct) {
      setScore(s => s + 1)
      setConfettiBurst(true)
      setTimeout(() => setConfettiBurst(false), 900)
      if (soundEnabled) playCorrectTone()
    } else {
      setWrongAnswers(prev => [...prev, { qIndex: quizIndex, chosen: idx }])
      if (soundEnabled) playWrongTone()
    }
  }

  const nextQuestion = () => {
    if (quizIndex + 1 >= questions.length) {
      setQuizDone(true)
      const finalScore = score + (selected === currentQ.correct ? 1 : 0)
      localStorage.setItem(`wafflestack-score-${building.id}`, String(finalScore))
      localStorage.setItem(`wafflestack-total-${building.id}`, String(questions.length))
      if (finalScore / questions.length >= 0.7) {
        onComplete?.(building.id)
      }
    } else {
      setQuizIndex(i => i + 1)
      setSelected(null)
      setHintShown(false)
    }
  }

  const resetQuiz = () => {
    setQuizIndex(0)
    setSelected(null)
    setScore(0)
    setQuizDone(false)
    setHintShown(false)
    setWrongAnswers([])
    setShowMistakes(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(5, 5, 15, 0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 8 : 20,
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{CONFETTI_STYLE}</style>
      <div style={{
        background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
        border: `1px solid ${color}44`,
        borderRadius: 20,
        width: '100%', maxWidth: 900,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 60px ${color}22`,
        fontFamily: "'Heebo', system-ui, sans-serif",
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
          flex: 1, overflow: 'hidden', display: 'flex',
          flexDirection: isMobile ? 'column' : 'row', gap: 0,
        }}>

          {/* Mobile tab switcher */}
          {isMobile && (
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              {(['learn', 'quiz'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  style={{
                    flex: 1, padding: '12px', background: 'none',
                    border: 'none', borderBottom: `2px solid ${mobileTab === tab ? color : 'transparent'}`,
                    color: mobileTab === tab ? color : 'rgba(255,255,255,0.4)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s', letterSpacing: 0.5,
                  }}
                >
                  {tab === 'learn' ? '📖 Learn' : '🎯 Quiz'}
                </button>
              ))}
            </div>
          )}

          {/* Left — concept + chart + sliders */}
          {(!isMobile || mobileTab === 'learn') && (
          <div style={{
            flex: isMobile ? 'unset' : '1 1 400px',
            overflow: 'auto',
            padding: '22px 24px',
            borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
          }}>

            {/* Previous reflection — shown if student has already written one */}
            {reflection.length > 10 && (
              <div style={{
                background: 'rgba(78,205,196,0.07)', border: '1px solid rgba(78,205,196,0.2)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 14,
                direction: 'rtl', textAlign: 'right',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(78,205,196,0.6)', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' as const }}>
                  ✍️ הגדרה שלך מהפעם הקודמת
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  {reflection}
                </div>
              </div>
            )}

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
          )}

          {/* Right — quiz */}
          {(!isMobile || mobileTab === 'quiz') && (
          <div style={{
            flex: isMobile ? 'unset' : '1 1 380px',
            overflow: 'auto',
            padding: '22px 24px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.38)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' as const }}>
              🎯 בחן את עצמך
            </div>

            {quizDone ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
                textAlign: 'center',
              }}>
                {/* Grade badge */}
                <div style={{
                  fontSize: 72, marginBottom: 8,
                  filter: `drop-shadow(0 0 20px ${color}66)`,
                }}>
                  {score === questions.length ? '🏆' : score >= questions.length * 0.75 ? '⭐' : score >= questions.length * 0.5 ? '👍' : '📖'}
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 4 }}>
                  {score === questions.length ? 'Perfect Score!' : score >= questions.length * 0.75 ? 'Great Job!' : score >= questions.length * 0.5 ? 'Good Effort!' : 'Keep Practicing!'}
                </div>

                {/* Score fraction */}
                <div style={{
                  fontSize: 48, fontWeight: 900, color: '#fff',
                  marginBottom: 4, letterSpacing: -2,
                }}>
                  {score}<span style={{ fontSize: 28, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/{questions.length}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                  {Math.round((score / questions.length) * 100)}% correct
                </div>

                {/* Score bar */}
                <div style={{ width: '100%', maxWidth: 240, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: score === questions.length ? '#4ECDC4' : score >= questions.length * 0.75 ? '#FFD700' : score >= questions.length * 0.5 ? '#FF9F43' : '#FF6B6B',
                    width: `${(score / questions.length) * 100}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                {/* Mistakes review — shown when any answers were wrong */}
                {wrongAnswers.length > 0 && (
                  <div style={{ width: '100%', maxWidth: 320, marginBottom: 16 }}>
                    <button
                      onClick={() => setShowMistakes(m => !m)}
                      style={{
                        width: '100%', padding: '9px 14px',
                        background: showMistakes ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.07)',
                        border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10,
                        color: '#FF6B6B', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <span>📝 {wrongAnswers.length} שגיאה לחזרה</span>
                      <span style={{ fontSize: 10 }}>{showMistakes ? '▲ סגור' : '▼ הצג'}</span>
                    </button>
                    {showMistakes && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        {wrongAnswers.map(({ qIndex, chosen }) => {
                          const q = questions[qIndex]
                          return (
                            <div key={qIndex} style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,107,107,0.2)',
                              borderRadius: 10, padding: '10px 12px',
                            }}>
                              <div style={{
                                fontSize: 12, color: 'rgba(255,255,255,0.75)',
                                direction: 'rtl', textAlign: 'right', marginBottom: 8, lineHeight: 1.5,
                              }}>
                                {q.q}
                              </div>
                              <div style={{
                                fontSize: 11, color: '#FF6B6B', direction: 'rtl',
                                textAlign: 'right', marginBottom: 4,
                              }}>
                                ✗ {q.options[chosen]}
                              </div>
                              <div style={{
                                fontSize: 11, color: '#4ECDC4', direction: 'rtl',
                                textAlign: 'right', marginBottom: 6,
                              }}>
                                ✓ {q.options[q.correct]}
                              </div>
                              <div style={{
                                fontSize: 10, color: 'rgba(255,255,255,0.4)',
                                direction: 'rtl', textAlign: 'right', lineHeight: 1.5,
                              }}>
                                {q.explanation}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* XP earned — only on perfect score */}
                {score === questions.length && (
                  <div style={{
                    background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)',
                    borderRadius: 12, padding: '8px 20px', marginBottom: 20,
                    fontSize: 14, color: '#FFD700', fontWeight: 700,
                  }}>
                    ⭐ +50 XP Earned!
                  </div>
                )}

                {/* Try-again prompt — shown when score < 70% (building reward not granted) */}
                {score / questions.length < 0.7 && (
                  <div style={{
                    background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)',
                    borderRadius: 12, padding: '12px 20px', marginBottom: 20,
                    fontSize: 13, color: '#FF6B6B', fontWeight: 600,
                    textAlign: 'center', lineHeight: 1.5,
                  }}>
                    נדרשים 70% לפחות כדי לקבל את הבניין.<br />
                    <span style={{ fontWeight: 400, color: 'rgba(255,107,107,0.8)' }}>
                      Try again to earn your building reward!
                    </span>
                  </div>
                )}

                {/* Did You Know fact card */}
                {DID_YOU_KNOW[building.id] && (
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                    maxWidth: 320, textAlign: 'right', direction: 'rtl',
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1 }}>
                      🌍 ידעת?
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                      {DID_YOU_KNOW[building.id]}
                    </div>
                  </div>
                )}

                {/* Related Concepts */}
                {(RELATED_CONCEPTS[building.id] ?? []).length > 0 && (
                  <div style={{ width: '100%', maxWidth: 320, marginBottom: 16 }}>
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
                      marginBottom: 8, textTransform: 'uppercase' as const,
                      textAlign: 'right', direction: 'rtl',
                    }}>
                      🔗 מושגים קשורים
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                      {(RELATED_CONCEPTS[building.id] ?? []).map(relId => {
                        const rel = CHALLENGES[relId]
                        if (!rel) return null
                        return (
                          <button
                            key={relId}
                            onClick={() => { onNavigateTo?.(relId); onClose() }}
                            disabled={!onNavigateTo}
                            style={{
                              background: `${rel.color}18`,
                              border: `1px solid ${rel.color}44`,
                              borderRadius: 20, padding: '5px 12px',
                              color: rel.color, fontSize: 12,
                              cursor: onNavigateTo ? 'pointer' : 'default',
                              fontWeight: 600, transition: 'all 0.15s',
                            }}
                          >
                            {rel.emoji} {rel.conceptHe}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Difficulty rating */}
                <div style={{ width: '100%', maxWidth: 320, marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
                    marginBottom: 8, textAlign: 'right', direction: 'rtl',
                  }}>
                    ⭐ כמה קשה היה המושג הזה?
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleDifficultyRating(rating)}
                        style={{
                          background: difficultyRating !== null && rating <= difficultyRating
                            ? `${color}33` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${difficultyRating !== null && rating <= difficultyRating ? color + '66' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                          fontSize: 16, transition: 'all 0.15s', color: '#fff',
                        }}
                      >
                        {difficultyRating !== null && rating <= difficultyRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  {difficultyRating !== null && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, textAlign: 'right' }}>
                      {difficultyRating <= 2 ? '😊 קל — ' : difficultyRating === 3 ? '😐 בינוני — ' : '😤 קשה — '}נשמר
                    </div>
                  )}
                </div>

                {/* "In My Own Words" reflection box */}
                <div style={{ width: '100%', maxWidth: 320, marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
                    marginBottom: 8, textTransform: 'uppercase' as const,
                    textAlign: 'right', direction: 'rtl',
                  }}>
                    ✍️ בלשוני שלי — הסבר את המושג במילים שלך
                  </div>
                  <textarea
                    value={reflection}
                    onChange={e => handleReflectionChange(e.target.value)}
                    placeholder={`${content.conceptHe} הוא...`}
                    rows={3}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${reflection.length > 10 ? color + '55' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: 10, padding: '10px 12px',
                      color: '#fff', fontSize: 13, lineHeight: 1.6,
                      outline: 'none', resize: 'vertical' as const,
                      fontFamily: "'Heebo', system-ui, sans-serif", direction: 'rtl',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  {reflection.length > 10 && (
                    <div style={{ fontSize: 11, color: '#4ECDC4', marginTop: 4, textAlign: 'right' }}>
                      ✓ נשמר
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
                  {nextBuilding && onNext && score / questions.length >= 0.7 && (
                    <button
                      onClick={onNext}
                      style={{
                        padding: '13px', background: 'linear-gradient(90deg, #4ECDC4, #44b8b0)',
                        border: 'none', borderRadius: 10,
                        color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      <span>🚀 Next: {nextBuilding.statsConcept.split(' (')[0]}</span>
                      <span style={{ opacity: 0.7 }}>→</span>
                    </button>
                  )}
                  <button
                    onClick={resetQuiz}
                    style={{
                      padding: '12px', background: `${color}22`,
                      border: `1px solid ${color}44`, borderRadius: 10,
                      color, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '12px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                      color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    🏙️ Back to City
                  </button>
                </div>
              </div>
            ) : (
              /* Question */
              <div style={{ flex: 1 }}>
                {/* Analogy warm-up card */}
                {SIMPLE_ANALOGIES[building.id] && (
                  <div style={{
                    background: 'rgba(255,179,71,0.07)',
                    border: '1px solid rgba(255,179,71,0.22)',
                    borderRadius: 10, padding: '10px 14px',
                    marginBottom: 14,
                    fontSize: 12, color: 'rgba(255,255,255,0.65)',
                    direction: 'rtl', textAlign: 'right',
                    lineHeight: 1.6,
                  }}>
                    <span style={{ color: '#FFB347', fontWeight: 700, marginLeft: 6 }}>💡 חשוב על זה כך:</span>
                    {SIMPLE_ANALOGIES[building.id]}
                  </div>
                )}
                {/* Question counter pill */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
                }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 20, padding: '4px 12px', fontSize: 12,
                    color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace',
                  }}>
                    Q {quizIndex + 1} / {questions.length}
                  </span>
                </div>
                {/* Progress */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {questions.map((_, i) => (
                    <div key={i} style={{
                      height: 3, flex: 1, borderRadius: 2,
                      background: i < quizIndex ? color : i === quizIndex ? `${color}88` : 'rgba(255,255,255,0.12)',
                    }} />
                  ))}
                </div>

                {/* Question text — P1: full visual weight, accent border as color-hierarchy anchor */}
                <div style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.55,
                  direction: 'rtl',
                  textAlign: 'right',
                  marginBottom: 16,
                  padding: '16px 18px',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  borderRight: `3px solid ${color}`,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.10)',
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
                      if (isCorrect) { bg = 'rgba(78,205,196,0.15)'; border = '2px solid #4ECDC4'; textColor = '#4ECDC4' }
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

                {/* Confetti burst on correct answer */}
                {confettiBurst && (
                  <div style={{ position: 'relative', height: 0, overflow: 'visible', pointerEvents: 'none' }}>
                    {([
                      { dx: '-70px', dy: '-90px', emoji: '⭐', delay: '0ms' },
                      { dx: '70px',  dy: '-90px', emoji: '✨', delay: '40ms' },
                      { dx: '95px',  dy: '-35px', emoji: '🎉', delay: '20ms' },
                      { dx: '-95px', dy: '-35px', emoji: '🌟', delay: '60ms' },
                      { dx: '10px',  dy: '-110px', emoji: '⭐', delay: '10ms' },
                      { dx: '-40px', dy: '-60px', emoji: '✨', delay: '50ms' },
                      { dx: '50px',  dy: '-55px', emoji: '🎊', delay: '30ms' },
                    ] as { dx: string; dy: string; emoji: string; delay: string }[]).map(({ dx, dy, emoji, delay }, i) => (
                      <div key={i} style={{
                        position: 'absolute',
                        top: -20, left: '50%',
                        fontSize: 18,
                        animation: `confetti-fly 0.8s ease-out ${delay} both`,
                        ['--dx' as string]: dx,
                        ['--dy' as string]: dy,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      } as React.CSSProperties}>
                        {emoji}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hint button — shown after wrong answer, before explanation */}
                {selected !== null && selected !== currentQ.correct && !hintShown && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={() => setHintShown(true)}
                      style={{
                        width: '100%', padding: '9px 14px',
                        background: 'rgba(255,180,0,0.08)',
                        border: '1px solid rgba(255,180,0,0.25)',
                        borderRadius: 10, cursor: 'pointer',
                        color: '#FFB347', fontSize: 13, fontWeight: 600,
                      }}
                    >
                      💡 הצג רמז
                    </button>
                  </div>
                )}

                {/* Hint text */}
                {hintShown && selected !== null && selected !== currentQ.correct && (
                  <div style={{
                    marginTop: 10,
                    background: 'rgba(255,180,0,0.1)',
                    border: '1px solid rgba(255,180,0,0.3)',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 13, color: '#FFB347',
                    direction: 'rtl', textAlign: 'right', lineHeight: 1.5,
                  }}>
                    💡 {currentQ.explanation.split('.')[0]}.
                  </div>
                )}

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
                      {quizIndex + 1 >= questions.length ? '🏆 סיים' : 'שאלה הבאה →'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
