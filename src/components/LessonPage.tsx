import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

export type LessonTopicId = 'mean' | 'median' | 'standard-deviation' | 'probability' | 'sampling'

interface QuickCheckItem {
  question: string
  answer: string
}

interface LessonData {
  id: LessonTopicId
  hebrewTitle: string
  buildingName: string
  buildingEmoji: string
  color: string
  tagline: string
  intro: string
  whyItMatters: string
  workedExample: {
    scenario: string
    steps: { label: string; content: string }[]
    conclusion: string
  }
  formula: string
  formulaBreakdown: string[]
  cityConnection: string
  quickCheck: QuickCheckItem[]
}

const LESSONS: Record<LessonTopicId, LessonData> = {
  mean: {
    id: 'mean',
    hebrewTitle: 'ממוצע',
    buildingName: 'שוק העיר',
    buildingEmoji: '🏪',
    color: 'from-amber-500 to-yellow-600',
    tagline: 'מה הנתח ההוגן של כל אחד?',
    intro:
      'הממוצע הוא מספר ה"חלוקה ההוגנת" — מה שכל אחד היה מקבל אם חלקת את הסכום הכולל בשווה בין כולם. דמיינו שהעיר שלכם גובה מיסים מחמישה שכונות. הממוצע מספר לכם: אם כל שכונה שילמה בדיוק אותה כמות, כמה כל אחת הייתה משלמת? כדי לחשב, מחברים את כל הערכים ומחלקים במספרם.',
    whyItMatters:
      'מתכנני ערים משתמשים בממוצע כדי להבין ממוצעים — תנועת הולכי רגל הממוצעת בפארק, צריכת חשמל חודשית ממוצעת לבניין, ציוני מבחנים ממוצעים במחוז שלם. ללא הממוצע, אתם רק מנחשים מהו ה"נורמלי".',
    workedExample: {
      scenario:
        'דוכן אוכל ברחוב הראשי של WaffleStack רשם לקוחות יומיים ל-5 ימים:',
      steps: [
        { label: 'יום 1: 40 | יום 2: 55 | יום 3: 60 | יום 4: 45 | יום 5: 50', content: '' },
        { label: 'שלב 1 — חיבור כל הערכים:', content: '40 + 55 + 60 + 45 + 50 = 250' },
        { label: 'שלב 2 — ספירת הערכים:', content: 'ישנם 5 ימים' },
        { label: 'שלב 3 — חלוקת הסכום במספר:', content: '250 ÷ 5 = 50' },
      ],
      conclusion: 'ממוצע הלקוחות היומי הוא 50. ביום טיפוסי, הדוכן משרת כ-50 אנשים — שימושי להחלטה על כמות מלאי!',
    },
    formula: 'x̄ = (Σx) / n',
    formulaBreakdown: [
      'x̄ (קרא "x-בר") = הממוצע',
      'Σx = סכום כל ערכי הנתונים',
      'n = מספר הערכים',
    ],
    cityConnection:
      'שליטה בממוצע פותחת את שוק העיר — לב המסחר הפועם של עיר WaffleStack שלכם. השוק משתמש בנתוני תנועה ממוצעת כדי לקבוע שעות אופטימליות ורמות מלאי. בנו אותו וצפו בכלכלת העיר שלכם לוקחת תאוצה!',
    quickCheck: [
      {
        question: 'חמישה חברים קיבלו את הנקודות הבאות במשחק מיני: 30, 40, 50, 60, 70. מהו ציון הממוצע?',
        answer: '(30 + 40 + 50 + 60 + 70) ÷ 5 = 250 ÷ 5 = 50 נקודות',
      },
      {
        question: 'בלוק עירוני יש 4 בניינים בגבהים: 10מ׳, 14מ׳, 18מ׳ ו-22מ׳. מהו הגובה הממוצע?',
        answer: '(10 + 14 + 18 + 22) ÷ 4 = 64 ÷ 4 = 16 מטר',
      },
    ],
  },

  median: {
    id: 'median',
    hebrewTitle: 'חציון',
    buildingName: 'ספריית העיר',
    buildingEmoji: '📚',
    color: 'from-teal-500 to-cyan-600',
    tagline: 'הערך האמצעי שחוצה את הנתונים בדיוק לשניים',
    intro:
      'החציון הוא הערך האמצעי ברשימה ממוינת — המספר שמחלק את הנתונים בדיוק לשניים, עם 50% מהערכים מתחתיו ו-50% מעליו. תחשבו עליו כנקודת האמצע של רחוב: מחצית הבניינים נמצאים משמאל ומחצית מימין. שלא כמו הממוצע, החציון לא מושפע מערך אחד גבוה או נמוך בצורה חריגה, מה שהופך אותו לכלי מצוין לאיתור מה שטיפוסי באמת.',
    whyItMatters:
      'כאשר נתוני הכנסות עירוניות מוטות על ידי כמה תושבים עשירים מאוד, הכנסת החציון נותנת תמונה כנה יותר של מה שרוב האנשים באמת מרוויחים. סוכני נדל"ן, מתכנני ערים וכלכלנים מסתמכים על החציון בדיוק מסיבה זו.',
    workedExample: {
      scenario: '7 מחוזות עירוניים של WaffleStack דיווחו על גדלי פארקיהם (בדונמים):',
      steps: [
        { label: 'הנתונים: 3, 8, 2, 9, 5, 7, 4', content: '' },
        { label: 'שלב 1 — מיון הערכים מהקטן לגדול:', content: '2, 3, 4, 5, 7, 8, 9' },
        { label: 'שלב 2 — מציאת המיקום האמצעי:', content: 'ישנם 7 ערכים. המיקום האמצעי הוא הערך ה-4 (3 ערכים בכל צד).' },
        { label: 'שלב 3 — זיהוי החציון:', content: 'הערך ה-4 הוא 5' },
      ],
      conclusion: 'גודל הפארק החציוני הוא 5 דונמים. עם מספר זוגי של ערכים, לוקחים את שני הערכים האמצעיים ומחשבים את ממוצעם.',
    },
    formula: 'מיקום אמצעי = (n + 1) ÷ 2',
    formulaBreakdown: [
      'לספירה אי-זוגית: החציון = הערך האמצעי לאחר המיון',
      'לספירה זוגית: החציון = ממוצע שני הערכים האמצעיים לאחר המיון',
      'n = מספר הערכים — תמיד מיינו קודם!',
    ],
    cityConnection:
      'שליטה בחציון פותחת את ספריית העיר — בניין מפואר בלב עירכם שבו אזרחים באים ללמוד ולשתף ידע. הספרייה משתמשת בנתוני חציון כדי להחליט אילו ספרים לרכוש ואילו שירותים להציע בהתבסס על מה שרוב התושבים באמת צריכים.',
    quickCheck: [
      {
        question: 'מצאו את החציון של ציוני המבחן הבאים: 72, 88, 65, 91, 78.',
        answer: 'מיינו קודם: 65, 72, 78, 88, 91. הערך האמצעי הוא 78.',
      },
      {
        question: 'סקר עירוני רשם זמני נסיעה יומיים (בדקות): 20, 35, 15, 50, 25, 40. מהו החציון?',
        answer: 'מיינו: 15, 20, 25, 35, 40, 50. ספירה זוגית, לכן שני ערכים אמצעיים: (25 + 35) ÷ 2 = 30 דקות.',
      },
    ],
  },

  'standard-deviation': {
    id: 'standard-deviation',
    hebrewTitle: 'סטיית תקן',
    buildingName: 'מגדל מזג האוויר',
    buildingEmoji: '🌤️',
    color: 'from-blue-500 to-indigo-600',
    tagline: 'כמה הנתונים מפוזרים סביב הממוצע?',
    intro:
      'סטיית התקן מודדת כמה הנתונים שלכם מפוזרים סביב הממוצע. סטיית תקן קטנה אומרת שרוב הערכים מקובצים קרוב לממוצע — הבניינים בעירכם כולם בגובה דומה. סטיית תקן גדולה אומרת שהערכים מפוזרים הרחק — חלק מהבניינים קטנים וחלקם הם גורדי שחקים. זוהי הדרך החזקה ביותר לתאר שונות בסט נתונים.',
    whyItMatters:
      'סטיית תקן חיונית בכל מקרה שבו עקביות חשובה. מהנדס רשת חשמל עירונית צריך לדעת לא רק את הדרישה הממוצעת לחשמל, אלא כמה היא משתנה בצורה קיצונית — כי עליות קיצוניות הן מה שגורם להפסקות חשמל.',
    workedExample: {
      scenario: 'חמישה בניינים ב-WaffleStack בגבהים הבאים (בקומות): 2, 4, 4, 4, 6',
      steps: [
        { label: 'שלב 1 — מצאו את הממוצע:', content: '(2 + 4 + 4 + 4 + 6) ÷ 5 = 20 ÷ 5 = 4' },
        { label: 'שלב 2 — חסרו את הממוצע מכל ערך וריבעו:', content: '(2−4)²=4 | (4−4)²=0 | (4−4)²=0 | (4−4)²=0 | (6−4)²=4' },
        { label: 'שלב 3 — מצאו את ממוצע ריבועי ההפרשים (שונות):', content: '(4+0+0+0+4) ÷ 5 = 8 ÷ 5 = 1.6' },
        { label: 'שלב 4 — הוציאו שורש ריבועי:', content: '√1.6 ≈ 1.26' },
      ],
      conclusion: 'סטיית התקן היא כ-1.26 קומות. רוב הבניינים נמצאים בתוך כ-1.26 קומות מהממוצע של 4 — קו אופק עקבי למדי!',
    },
    formula: 'σ = √[ Σ(x − x̄)² / n ]',
    formulaBreakdown: [
      'σ (סיגמא) = סטיית תקן',
      'x = כל ערך בודד',
      'x̄ = הממוצע',
      'n = מספר הערכים',
      'הצעדים: מצאו ממוצע → חסרו וריבעו כל הפרש → מצאו ממוצע הריבועים → הוציאו שורש',
    ],
    cityConnection:
      'שליטה בסטיית תקן פותחת את מגדל מזג האוויר — צריח תצפית אלגנטי שמנטר טמפרטורה, גשם ושונות רוח ברחבי עירכם. המגדל משתמש בסטיית תקן כדי להוציא התרעות כאשר התנאים סוטים רחוק מהנורמה, ושומר על אזרחיכם בטוחים.',
    quickCheck: [
      {
        question: 'לשני סטים של ציוני בחינה יש ממוצע זהה של 70. לסט א׳ יש סטיית תקן של 2; לסט ב׳ יש סטיית תקן של 15. איזה כיתה ביצעה בצורה עקבית יותר?',
        answer: 'סט א׳ — סטיית תקן קטנה יותר אומרת שהציונים מקובצים קרוב יותר לממוצע, כך שהביצועים עקביים יותר.',
      },
      {
        question: 'אם כל ערך בסט נתונים זהה לחלוטין (לדוגמה: 5, 5, 5, 5), מהי סטיית התקן?',
        answer: '0 — אין פיזור כלל כאשר כל ערך שווה לממוצע.',
      },
    ],
  },

  probability: {
    id: 'probability',
    hebrewTitle: 'הסתברות',
    buildingName: 'קזינו ואולם אירועים',
    buildingEmoji: '🎰',
    color: 'from-purple-500 to-pink-600',
    tagline: 'מה הסיכוי שאירוע יקרה?',
    intro:
      'ההסתברות היא מתמטיקת המקריות — היא אומרת לכם כמה סביר שאירוע יקרה, מבוטא כמספר בין 0 ל-1 (או 0% עד 100%). הסתברות של 0 אומרת שמשהו בלתי אפשרי; הסתברות של 1 אומרת שהוא ודאי. כל השאר נמצא איפשהו ביניהם. תחשבו עליה כתחזית הסיכון של עיר: מה הסיכויים שיהיה פקק כבד ביום שני בבוקר?',
    whyItMatters:
      'מחיזוי מזג אוויר ועד תמחור ביטוח ועד עיצוב משחקים, ההסתברות מניעה החלטות תחת אי-ודאות. עירכם זקוקה למודלי הסתברות לתכנון שירותי חירום, עיצוב מערכות תחבורה, ואפילו לאיזון המשחק WaffleStack עצמו.',
    workedExample: {
      scenario: 'הגרלת עיר WaffleStack משתמשת בשקית עם אריחים צבעוניים: 3 אדומים, 5 כחולים ו-2 ירוקים (10 אריחים סה"כ).',
      steps: [
        { label: 'שאלה: מהי ההסתברות לשלוף אריח כחול באקראי?', content: '' },
        { label: 'שלב 1 — זהו את התוצאות הנוחות:', content: 'ישנם 5 אריחים כחולים' },
        { label: 'שלב 2 — זהו את סך התוצאות האפשריות:', content: 'ישנם 10 אריחים סה"כ' },
        { label: 'שלב 3 — חלקו:', content: 'P(כחול) = 5 ÷ 10 = 0.5 (או 50%)' },
      ],
      conclusion: 'יש סיכוי של 50% לשלוף אריח כחול — כמו הטלת מטבע! P(לא כחול) = 1 − 0.5 = 0.5',
    },
    formula: 'P(אירוע) = מספר תוצאות נוחות ÷ סך תוצאות אפשריות',
    formulaBreakdown: [
      'ההסתברות תמיד נמצאת בין 0 ל-1 (כולל)',
      'P(אירוע) + P(לא אירוע) = 1',
      'אם כל התוצאות שוות סיכוי, הנוסחה עובדת ישירות',
    ],
    cityConnection:
      'שליטה בהסתברות פותחת את הקזינו ואולם האירועים — מקום בידור מרהיב שבו האזרחים מנסים את מזלם ומשתתפים בפסטיבלים ממותגים. אולם האירועים מנהל את משחקיו ומתזמן אירועים באמצעות מודלי הסתברות כדי שהכל יישאר מרגש והוגן. בנו אותו והביאו ריגוש לעירכם!',
    quickCheck: [
      {
        question: 'גלגל מחולק ל-8 מדורים שווים: 3 צהובים, 3 אדומים ו-2 סגולים. מהי ההסתברות לנחות על סגול?',
        answer: 'P(סגול) = 2 ÷ 8 = 0.25 (או 25%)',
      },
      {
        question: 'ההסתברות שיורד גשם מחר היא 0.3. מהי ההסתברות שלא יורד גשם?',
        answer: 'P(אין גשם) = 1 − 0.3 = 0.7 (או 70%)',
      },
    ],
  },

  sampling: {
    id: 'sampling',
    hebrewTitle: 'דגימה',
    buildingName: 'מרכז הסקרים העירוני',
    buildingEmoji: '📊',
    color: 'from-green-500 to-emerald-600',
    tagline: 'הסקה על אוכלוסייה שלמה מתוך מדגם קטן',
    intro:
      'דגימה היא תהליך איסוף מידע מקבוצה קטנה יותר (המדגם) כדי להסיק מסקנות מושכלות על קבוצה גדולה יותר (האוכלוסייה). אי אפשר לראיין כל תושב בעיר של מיליון איש — אבל אם תסקרו 1,000 תושבים שנבחרו בקפידה, עדיין ניתן להסיק מסקנות מהימנות. המפתח הוא שהמדגם צריך להיות מייצג: עליו לשקף את המגוון המלא של האוכלוסייה.',
    whyItMatters:
      'כל החלטה מרכזית בתכנון עירוני — היכן לבנות בית ספר חדש, האם התושבים רוצים יותר שטח ירוק, עד כמה הם מרוצים מהתחבורה הציבורית — מסתמכת על סקרים ומדגמים. מדגם גרוע מוביל להחלטות רעות; מדגם טוב יכול לחשוף מה כל עיר חושבת וצריכה.',
    workedExample: {
      scenario: 'WaffleStack רוצה לדעת את מספר השעות הממוצע שתושבים מבלים בפארקי העיר מדי שבוע. לעיר 10,000 תושבים — יותר מדי לשאול את כולם.',
      steps: [
        { label: 'שלב 1 — הגדרת האוכלוסייה:', content: 'כל 10,000 תושבי WaffleStack' },
        { label: 'שלב 2 — בחירת גודל מדגם:', content: 'העיר בוחרת 100 תושבים באקראי (דגימה אקראית — לכל תושב הסיכוי שווה להיבחר)' },
        { label: 'שלב 3 — איסוף נתונים:', content: '100 התושבים מדווחים על שעות הפארק השבועיות שלהם. הממוצע הוא 3.4 שעות.' },
        { label: 'שלב 4 — הסקה על האוכלוסייה:', content: 'אנו מעריכים שהתושב הממוצע ב-WaffleStack מבלה כ-3.4 שעות בשבוע בפארקים.' },
      ],
      conclusion: 'מדוע אקראיות חשובה: אם העיר היתה סוקרת רק תושבים הגרים ליד פארקים, ההערכה היתה מוטה כלפי מעלה.',
    },
    formula: 'x̄ ≈ μ (כאשר המדגם גדול מספיק ואקראי)',
    formulaBreakdown: [
      'אוכלוסייה: הקבוצה כולה שרוצים ללמוד עליה',
      'מדגם: הקבוצה הקטנה יותר שבפועל מודדים',
      'מדגם אקראי: לכל חבר אוכלוסייה יש סיכוי שווה להיבחר',
      'הטיה: כאשר מדגם מייצג-יתר או מייצג-חסר חלק מהאוכלוסייה',
    ],
    cityConnection:
      'שליטה בדגימה פותחת את מרכז הסקרים העירוני — בניין מחקר אזרחי מתקדם שבו תושבי WaffleStack מגישים משוב שעיצוב עתיד שדרוגי העיר. המרכז מנהל סקרים ומפיק דוחות נתונים שמניעים את מפת הפיתוח של עירכם. בנו אותו ותנו לאזרחיכם קול!',
    quickCheck: [
      {
        question: 'בית ספר רוצה לדעת את מקצוע הלימוד המועדף על התלמידים. במקום לשאול את כל 800 התלמידים, הוא שואל רק את תלמידי קבוצת הכדורגל. האם זה מדגם טוב? מדוע?',
        answer: 'לא — זה מדגם מוטה. חברי קבוצת הכדורגל אינם מייצגים את כל 800 התלמידים. מדגם אקראי מכל הכיתות יהיה הרבה יותר טוב.',
      },
      {
        question: 'מה ההבדל בין אוכלוסייה למדגם?',
        answer: 'האוכלוסייה היא הקבוצה כולה שרוצים ללמוד עליה. המדגם הוא תת-קבוצה קטנה יותר שממנה אוספים נתונים, שמשמשת להסקת מסקנות על האוכלוסייה.',
      },
    ],
  },
}

interface LessonPageProps {
  topicId: LessonTopicId
  onBack: () => void
  onStartQuiz: () => void
}

export default function LessonPage({ topicId, onBack, onStartQuiz }: LessonPageProps) {
  const lesson = LESSONS[topicId]
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({})

  const toggleAnswer = (index: number) => {
    setOpenAnswers(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-sm"
          >
            <ArrowRight size={16} />
            חזרה
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{lesson.buildingEmoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{lesson.hebrewTitle}</h1>
              <p className="text-sm text-white/60">{lesson.tagline}</p>
            </div>
          </div>
        </div>

        {/* Intro Section */}
        <section className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-3">מבוא למושג</h2>
          <p className="text-white/80 leading-relaxed">{lesson.intro}</p>
        </section>

        {/* Why it matters */}
        <section className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-3">למה זה חשוב?</h2>
          <p className="text-white/80 leading-relaxed">{lesson.whyItMatters}</p>
        </section>

        {/* Worked Example */}
        <section className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">דוגמה מחושבת צעד אחר צעד</h2>
          <p className="text-white/70 mb-4 text-sm">{lesson.workedExample.scenario}</p>
          <div className="space-y-3">
            {lesson.workedExample.steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                {step.label.startsWith('שלב') && (
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${lesson.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {i}
                  </div>
                )}
                <div className={step.label.startsWith('שלב') ? '' : 'pr-10'}>
                  <span className="text-white/90 font-medium text-sm">{step.label}</span>
                  {step.content && (
                    <span className="text-teal-300 font-mono text-sm mr-2">{step.content}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-teal-500/15 border border-teal-400/30">
            <p className="text-teal-300 text-sm">{lesson.workedExample.conclusion}</p>
          </div>
        </section>

        {/* Formula */}
        <section className="mb-6 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-400/20">
          <h2 className="text-lg font-bold text-white mb-3">נוסחה / כלל מרכזי</h2>
          <div className="text-center py-4 mb-4">
            <code className={`text-2xl font-mono font-bold bg-gradient-to-r ${lesson.color} bg-clip-text text-transparent`}>
              {lesson.formula}
            </code>
          </div>
          <ul className="space-y-1">
            {lesson.formulaBreakdown.map((line, i) => (
              <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* City Connection */}
        <section className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-400/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{lesson.buildingEmoji}</span>
            <h2 className="text-lg font-bold text-amber-300">קישור לעיר: {lesson.buildingName}</h2>
          </div>
          <p className="text-white/80 leading-relaxed text-sm">{lesson.cityConnection}</p>
        </section>

        {/* Quick Check */}
        <section className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">בדיקה מהירה</h2>
          <p className="text-white/60 text-sm mb-4">בדקו את עצמכם לפני שעוברים לחידון:</p>
          <div className="space-y-4">
            {lesson.quickCheck.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <button
                  className="w-full p-4 text-right flex items-start justify-between gap-3 hover:bg-white/5 transition-all"
                  onClick={() => toggleAnswer(i)}
                >
                  <span className="text-white/90 text-sm leading-relaxed">{`שאלה ${i + 1}: ${item.question}`}</span>
                  {openAnswers[i] ? (
                    <ChevronUp size={16} className="text-white/40 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown size={16} className="text-white/40 flex-shrink-0 mt-0.5" />
                  )}
                </button>
                {openAnswers[i] && (
                  <div className="px-4 pb-4">
                    <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-400/20">
                      <span className="text-teal-300 text-sm font-medium">תשובה: </span>
                      <span className="text-teal-200 text-sm">{item.answer}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={onStartQuiz}
          className={`w-full py-4 rounded-2xl bg-gradient-to-r ${lesson.color} text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
        >
          לחידון ← בנו את {lesson.buildingName}!
        </button>
      </div>
    </div>
  )
}

export { LESSONS }
