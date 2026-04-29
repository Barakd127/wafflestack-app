import { useState, useEffect } from 'react'

// Educational "Did You Know?" facts in Hebrew. One auto-shown per day-of-year.
// Each fact references a stat concept the student is studying so it doubles as
// a small spaced-repetition reminder of why these ideas matter outside class.
interface Fact {
  emoji: string
  concept: string // Hebrew concept name shown as a tag
  text: string    // Hebrew, ~1–2 sentences
}

const FACTS: Fact[] = [
  { emoji: '☕', concept: 'ממוצע',
    text: 'הסטטיסטיקה של המאה ה-20 התחילה בבירה — ויליאם גוסט פיתח את מבחן ה-t עבור מבשלת גינס כדי להעריך איכות שעורה.' },
  { emoji: '🎯', concept: 'התפלגות נורמלית',
    text: 'גובה האדם, לחץ דם, ואפילו ציוני IQ — כולם מתפלגים בערך נורמלית. זאת הסיבה שעקומת הפעמון בכל מקום.' },
  { emoji: '🗳️', concept: 'מדגם',
    text: 'סקר של 1,000 אנשים יכול לחזות תוצאות בחירות של מיליונים — אם המדגם אקראי. גודל המדגם פחות חשוב מאיכותו.' },
  { emoji: '💊', concept: 'מבחן השערות',
    text: 'כל תרופה שאתם לוקחים עברה מבחן השערות — H₀ אומרת "התרופה לא עובדת" ומחקרים מנסים לדחות אותה.' },
  { emoji: '📈', concept: 'רגרסיה',
    text: 'ה-iPhone ניבא תכונות הזמנה הבאה שלכם בעזרת רגרסיה לוגיסטית — אותו עקרון שלמדו סטודנטים בשנה א\'.' },
  { emoji: '🎰', concept: 'בינום',
    text: 'הקזינו בלאס וגאס מרוויח כי גם רווח של 1% פר משחק, מוכפל באלפי משחקים, יוצר רווח כמעט ודאי. זאת בינומית בפעולה.' },
  { emoji: '🌡️', concept: 'סטיית תקן',
    text: 'תחזית מזג אוויר אומרת "20°C ± 3°C" — אותו ± הוא סטיית תקן. ככל שהיא קטנה, כך התחזית בטוחה יותר.' },
  { emoji: '🏥', concept: 'רווח סמך',
    text: 'כשרופא אומר "אחוז הצלחה 95%", הוא מתכוון לרווח סמך — סטטיסטיקאים מציגים אי-וודאות, לא בטחון מוחלט.' },
  { emoji: '📱', concept: 'קורלציה',
    text: 'פייסבוק יודע שאם חברים שלכם קונים מוצר, סביר שתקנו גם — אבל קורלציה אינה סיבתיות. רק רגרסיה אקראית מוכיחה.' },
  { emoji: '⚖️', concept: 'חציון',
    text: 'משכורת חציונית בישראל נמוכה ב-30% מהממוצע — כי ערכים קיצוניים (טייקונים) מעוותים את הממוצע אך לא את החציון.' },
  { emoji: '🎲', concept: 'התפלגות נורמלית',
    text: 'משפט הגבול המרכזי: גם אם הנתונים המקוריים אינם נורמליים, ממוצעים של מדגמים גדולים תמיד יהיו נורמליים.' },
  { emoji: '🧪', concept: 'מבחן השערות',
    text: 'p < 0.05 הוא הסף הקלאסי — אבל בפיזיקה מודרנית דורשים p < 0.0000003 (5σ) כדי להכריז על תגלית.' },
  { emoji: '🚦', concept: 'סטיית תקן',
    text: 'נתיב באוטוסטרדה עם זמן נסיעה ממוצע של 30 דק\' וסטיית תקן של 20 דק\' — לא אמין יותר מנתיב אחר עם 35 דק\' ו-2 דק\' בלבד.' },
  { emoji: '🎓', concept: 'מדגם',
    text: 'במחקרי סוציולוגיה ישראליים, מדגם של 400-1,000 משתתפים מספיק כדי לייצג סטודנטים בכל הארץ ברמת דיוק של ±5%.' },
  { emoji: '🏀', concept: 'רגרסיה',
    text: '"Moneyball": קבוצת ה-Oakland A\'s ניצחה משכורות גדולות פי 3 בעזרת רגרסיה — סטטיסטיקה גוברת על אינטואיציה.' },
  { emoji: '🌍', concept: 'מדגם',
    text: 'גוגל לא סופר את כל החיפושים בעולם — רק דגימה אקראית. זה מספיק כדי להראות מגמות לרבע מיליארד משתמשים.' },
  { emoji: '🧠', concept: 'התפלגות נורמלית',
    text: 'מבחני IQ בנויים כך שהממוצע = 100 וסטיית התקן = 15. זה אומר ש-68% מהאנשים נמצאים בין 85 ל-115.' },
  { emoji: '🎬', concept: 'קורלציה',
    text: 'נטפליקס משתמש בקורלציה בין הצפיות שלכם לצפיות של מיליונים — כך הם ממליצים על הסדרה הבאה.' },
  { emoji: '🥦', concept: 'מבחן השערות',
    text: 'כל פעם שעיתון אומר "מחקר חדש מוכיח ש..." — תבדקו את גודל המדגם וערך ה-p לפני שמשנים את התזונה.' },
  { emoji: '⚡', concept: 'ממוצע',
    text: 'חשמל ביתי בישראל הוא 230V — בממוצע. בפועל הוא נע בין 220 ל-240, וסטיית התקן הזאת חשובה לתכנון מכשירים.' },
  { emoji: '🛒', concept: 'בינום',
    text: 'אמזון מציעה לכם מוצרים על בסיס סבירות בינומית — אם 60% מהקונים של מוצר X גם קנו Y, סביר שתקנו גם.' },
  { emoji: '🏠', concept: 'חציון',
    text: 'מחיר דירה חציוני בתל אביב גבוה ב-40% מהחציון הארצי — סטטיסטיקה ממשלתית משתמשת בחציונים כי הם יציבים יותר.' },
  { emoji: '🔬', concept: 'מבחן השערות',
    text: 'תרופת קורונה אושרה רק אחרי שמבחן השערות עם 30,000 משתתפים הראה הבדל מובהק לעומת פלצבו.' },
  { emoji: '📊', concept: 'רווח סמך',
    text: 'סקר בחירות שמראה "45% ± 3%" עם רווח סמך של 95% — לא מוכיח ניצחון אם המתחרה ב-43%. החפיפה משמעותית.' },
  { emoji: '🧬', concept: 'רגרסיה',
    text: 'גנטיקאים מוצאים גנים לסיכוני מחלות בעזרת רגרסיה לוגיסטית — אותה שיטה שלמדתם, פשוט עם מיליוני משתנים.' },
  { emoji: '🚗', concept: 'התפלגות נורמלית',
    text: 'מהירות אוטו ממוצעת בכביש 6 = 110 קמ"ש, סטיית תקן = 15. רק 2.5% נוסעים מעל 140 — והם הסטטיסטיקה של דוחות.' },
  { emoji: '🎮', concept: 'בינום',
    text: 'משחקי וידאו עם "אחוז הצלחה 5%" לפריט נדיר — אחרי 100 ניסיונות עדיין יש 0.6% סיכוי שלא תקבלו אף פריט.' },
  { emoji: '🌧️', concept: 'רווח סמך',
    text: 'תחזית "70% גשם" אומרת — אם נריץ את היום הזה 100 פעם, ב-70 פעמים ירד גשם. לא אומרת על איזה אזור או באיזו עוצמה.' },
  { emoji: '📧', concept: 'מבחן השערות',
    text: 'מסנן ספאם של ג\'ימייל הוא מבחן השערות — H₀ = "מייל לגיטימי", H₁ = "ספאם". טעות סוג I = מייל אמיתי שנפל לספאם.' },
  { emoji: '🎂', concept: 'בינום',
    text: 'בקבוצה של 23 אנשים, יש כבר יותר מ-50% סיכוי ששניים חולקים יום הולדת — פרדוקס שמראה איך אינטואיציה כושלת בסטטיסטיקה.' },
]

const SEEN_KEY = 'wafflestack-fact-seen-date'
const SHUFFLE_KEY = 'wafflestack-fact-index'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Pick a fact based on day-of-year so the rotation is stable across reloads
// but different every day. Persists last-shown index so manual cycling works.
function pickFactForToday(): { fact: Fact; index: number } {
  const stored = parseInt(localStorage.getItem(SHUFFLE_KEY) || '-1')
  if (stored >= 0 && stored < FACTS.length) {
    return { fact: FACTS[stored], index: stored }
  }
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  const idx = dayOfYear % FACTS.length
  return { fact: FACTS[idx], index: idx }
}

export default function DailyStatFact() {
  const [visible, setVisible] = useState(false)
  const [{ fact, index }, setCurrent] = useState(() => pickFactForToday())

  useEffect(() => {
    const lastSeen = localStorage.getItem(SEEN_KEY) || ''
    if (lastSeen !== todayISO()) {
      const t = setTimeout(() => setVisible(true), 1800)
      return () => clearTimeout(t)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(SEEN_KEY, todayISO())
    setVisible(false)
  }

  const handleNext = () => {
    const nextIdx = (index + 1) % FACTS.length
    localStorage.setItem(SHUFFLE_KEY, String(nextIdx))
    setCurrent({ fact: FACTS[nextIdx], index: nextIdx })
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 48,
        background: 'linear-gradient(135deg, rgba(10,15,30,0.92) 0%, rgba(20,28,50,0.92) 100%)',
        border: '1px solid rgba(78,205,196,0.35)',
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        fontFamily: "'Heebo', system-ui, sans-serif",
        color: '#fff',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(78,205,196,0.15)',
        direction: 'rtl',
        maxWidth: 560,
        width: 'calc(100vw - 96px)',
        animation: 'fact-slide-up 0.4s cubic-bezier(0.2,0.9,0.3,1.2)',
      }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes fact-slide-up {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{fact.emoji}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#4ECDC4',
            background: 'rgba(78,205,196,0.12)',
            border: '1px solid rgba(78,205,196,0.3)',
            padding: '2px 8px', borderRadius: 999, letterSpacing: '0.04em',
          }}>
            💡 עובדה היומית
          </span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600,
          }}>
            {fact.concept}
          </span>
        </div>
        <div style={{
          fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)',
          fontWeight: 500,
        }}>
          {fact.text}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleNext}
          aria-label="Next fact"
          title="Next fact"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: 'rgba(255,255,255,0.7)',
            width: 26, height: 26, fontSize: 13,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ↻
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss daily fact"
          title="Dismiss for today"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: 'rgba(255,255,255,0.7)',
            width: 26, height: 26, fontSize: 11,
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
