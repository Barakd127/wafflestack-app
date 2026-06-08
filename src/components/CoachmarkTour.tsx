import React, { useState, useEffect } from 'react'
import { useTutorialStore } from '../store/tutorialStore'
import { FEATURE_META, FEATURE_UNLOCKS_BY_ID, type FeatureId } from '../config/featureUnlocks'

// ── Module-level ref registry ────────────────────────────────────────────────
// Components register their DOM refs here so CoachmarkTour can spotlight them.
const tourRefs = new Map<string, React.RefObject<HTMLElement | null>>()

export function registerTourRef(id: string, ref: React.RefObject<HTMLElement | null>): () => void {
  tourRefs.set(id, ref)
  return () => { tourRefs.delete(id) }
}

// ── Module-level action registry ─────────────────────────────────────────────
// Components register callbacks (open a menu, switch a tab) so a tour step can
// actually DEMONSTRATE a workflow — the UI moves as the user advances. Actions
// must be defensive (no-op when not applicable) since the launcher can replay a
// tour from any screen.
const tourActions = new Map<string, () => void>()

export function registerTourAction(id: string, fn: () => void): () => void {
  tourActions.set(id, fn)
  return () => { if (tourActions.get(id) === fn) tourActions.delete(id) }
}

/**
 * Step ids for a tour, in order. Launchers/triggers pass this to
 * `startTour(id, steps, force)` so the store knows the tour length (advanceTour
 * ends when currentIndex+1 >= steps.length). Rendering reads TOUR_STEPS by id.
 */
export function tourStepIds(id: string): string[] {
  return (TOUR_STEPS[id] ?? []).map(s => s.id)
}

// ── Tour step definitions ─────────────────────────────────────────────────────
interface TourStep {
  id: string
  target: string        // ref key, or 'center' for modal-only (no spotlight)
  title: string
  body: string
  action?: string       // optional registered action key to run on step enter
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  // Always-on intro walkthrough — launchable from the 🎓 launcher regardless of
  // XP/unlocks. Explains the learn→XP→unlock loop so a brand-new (0-XP) user
  // understands why most tools start locked. All steps are modal-centered so it
  // works on any screen; the final step points at the 🎓 button (data-tour).
  'tour-basic': [
    { id: 'basic-1', target: 'center', title: '👋 ברוכים הבאים ל-WaffleStack', body: 'הופכים סטטיסטיקה למשחק בנייה. נסביר ב-30 שניות איך זה עובד.' },
    { id: 'basic-2', target: 'center', title: '🎯 לומדים ⟵ צוברים XP', body: 'כל תשובה נכונה בתרגול מזכה אותך בנקודות XP. ככל שתתרגל, ה-XP גדל.' },
    { id: 'basic-3', target: 'center', title: '🔒 XP פותח כלים', body: 'הכלים נפתחים אחד-אחד לפי XP: הארסנל, מפת המושגים, המורה הפרטי, הקנבס ועוד. מה שנעול (🔒) ייפתח כשתגיע לסף.' },
    { id: 'basic-4', target: 'center', title: '🧭 איפה הכל נמצא', body: 'הכלים שנפתחו מופיעים בסרגל הצד ובמתג התחתון שליד התרגיל. כלים נעולים מסומנים ב-🔒.' },
    { id: 'basic-5', target: 'tour-btn', title: '🎓 הסיורים תמיד כאן', body: 'בכל רגע אפשר לחזור לכפתור 🎓 כדי לראות הדגמה חיה של כל כלי שנפתח. קדימה — בהצלחה!' },
  ],

  // Legacy in-mindmap tour (kept).
  mindmap: [
    { id: 'mm-1', target: 'back-btn',  title: 'ניווט בתוך ה-iframe',  body: 'בתוך המפה: גרור להזזה, גלגלת עכבר לזום פנימה/החוצה.' },
    { id: 'mm-2', target: 'split-btn', title: 'מצב מפוצל',             body: 'לחץ כאן לצפייה במפת המושגים ובעיר בו-זמנית.' },
    { id: 'mm-3', target: 'center',    title: 'לחיצה על צומת',         body: 'לחיצה על כל צומת במפה תפתח את השיעור המתאים.' },
    { id: 'mm-4', target: 'center',    title: 'סגירת המפה',            body: 'לסגירה — לחץ על כפתור "← דף הבית" בפינה הימנית העליונה.' },
    { id: 'mm-5', target: 'help-btn',  title: 'חזרה על הסיור',         body: 'לחץ על "?" בכל עת לחזרה על ההדרכה הזו.' },
  ],

}

// ── Per-feature tours ─────────────────────────────────────────────────────────
// One short demo per feature. Headline features get a rich LIVE demo whose
// `action`s navigate into the real screen and actually USE the feature (open
// the formula panel, start the timer, open the tutor…). Every other feature
// falls back to a generated 1-step "you unlocked X" card (getFeatureSteps).
// Tour id convention: `feat-<featureId>`.
const FEATURE_TOURS: Partial<Record<FeatureId, TourStep[]>> = {
  arsenal: [
    { id: 'arsenal-1', target: 'center', title: '📦 הארסנל שלי', body: 'כאן נאסף כל מה שלמדת — נוסחאות, הגדרות, טעויות נפוצות וטריקים.' },
    { id: 'arsenal-2', target: 'arsenal-screen', title: 'הנה הארסנל שלך', body: 'כל פריט הוא קלף. לחיצה על נוסחה פותחת אותה — אפשר להעתיק, לערוך ולהשתמש בה בתרגול.', action: 'nav-arsenal' },
  ],
  pomodoro: [
    { id: 'pomo-1', target: 'center', title: '⏱️ שעון פומודורו', body: 'טכניקת מיקוד: 25 דקות עבודה רצופה ואז הפסקה קצרה. עוזר להישאר מרוכז.' },
    { id: 'pomo-2', target: 'center', title: 'הפעלנו לך סשן', body: 'הנה — שעון פומודורו רץ. ככה מתחילים סשן מיקוד לפני תרגול.', action: 'start-pomodoro' },
  ],
  'ai-tutor': [
    { id: 'tutor-1', target: 'center', title: '🧑‍🏫 מורה פרטי', body: 'תקוע על שאלה? שאל את המורה הפרטי וקבל הסבר מותאם — בעברית.' },
    { id: 'tutor-2', target: 'center', title: 'פתחנו לך אותו', body: 'כתוב כאן כל שאלה על החומר והמורה יענה. זמין בכל מסך.', action: 'open-tutor' },
  ],
  'mindmap-view': [
    { id: 'mmv-1', target: 'center', title: '🗺️ מפת מושגים', body: 'תצוגה ויזואלית של כל הקורס כמפה — רואים איך הנושאים מתחברים.' },
    { id: 'mmv-2', target: 'center', title: 'נכנסים למפה', body: 'הבאנו אותך למפה שלך. הסיור שבתוך המפה ידריך אותך מכאן.', action: 'nav-mindmap' },
  ],
  'formula-library': [
    { id: 'fl-1', target: 'center', title: '∑ ספריית נוסחאות', body: 'מאגר נוסחאות מוכנות שמוצב ישר על הקנבס — בלי להקליד מחדש.' },
    { id: 'fl-2', target: 'practice-tab', title: '1. נכנסים לתרגול', body: 'נתחיל מתוך תרגול.', action: 'nav-practice' },
    { id: 'fl-3', target: 'canvas-tab', title: '2. פותחים קנבס', body: 'הקנבס נפתח לצד התרגיל.', action: 'switch-canvas' },
    { id: 'fl-4', target: 'canvas-frame', title: '3. ספריית הנוסחאות', body: 'פתחנו את הספרייה (∑ מימין). לחיצה על נוסחה מציבה אותה ישר על הקנבס.', action: 'open-formula-panel' },
  ],
  'math-widget': [
    { id: 'mw-1', target: 'center', title: '➗ עורך משוואות', body: 'כתוב משוואות משלך עם עורך מתמטי מלא — שורשים, שברים, סכומים.' },
    { id: 'mw-2', target: 'canvas-frame', title: 'על הקנבס', body: 'פתחנו קנבס. מכאן מוסיפים משוואה משלך ופותרים ליד התרגיל.', action: 'switch-canvas' },
  ],
  'split-screen': [
    { id: 'ss-1', target: 'center', title: '⊟ פיצול מסך — זרימת העבודה המלאה', body: 'הפיצ׳ר המתקדם: תיאוריה, תרגול וקנבס פתוחים יחד באותו מסך.' },
    { id: 'ss-2', target: 'center', title: '1. קוראים תיאוריה', body: 'מתחילים בחומר.', action: 'nav-theory' },
    { id: 'ss-3', target: 'practice-tab', title: '2. עוברים לתרגול', body: 'עכשיו לתרגל את מה שקראנו.', action: 'nav-practice' },
    { id: 'ss-4', target: 'canvas-tab', title: '3. מוסיפים קנבס לצד', body: 'פותחים לוח ציור לצד התרגיל — שני חלונות יחד.' },
    { id: 'ss-5', target: 'canvas-frame', title: '4. הכל יחד', body: 'עכשיו התרגיל והקנבס פתוחים זה לצד זה — פותרים ויזואלית בלי לעזוב את השאלה.', action: 'switch-canvas' },
    { id: 'ss-6', target: 'center', title: 'זה הפיצול 🎉', body: 'תיאוריה + תרגול + קנבס במסך אחד. ככה עובדים מתקדם.' },
  ],
  'city-editor': [
    { id: 'city-1', target: 'center', title: '🏙️ העולם שלי', body: 'עיר תלת-ממדית שנבנית ככל שאתה לומד — כל הישג בונה עוד בניין.' },
    { id: 'city-2', target: 'center', title: 'נכנסים לעיר', body: 'הנה העולם שלך (נטען רגע…). בנה אותו ככל שתתקדם בקורס.', action: 'nav-world' },
  ],
}

// Generated fallback for a feature without a rich demo: a single "you unlocked
// X" card built from FEATURE_META + the unlock rule's Hebrew description.
function defaultFeatureSteps(fid: FeatureId): TourStep[] {
  const meta = FEATURE_META[fid]
  const desc = FEATURE_UNLOCKS_BY_ID[fid]?.descriptionHe ?? ''
  return [{ id: `${fid}-default`, target: 'center', title: `${meta?.emoji ?? '🔓'} ${meta?.labelHe ?? fid}`, body: desc }]
}

/** Steps for a feature tour (rich demo or generated default). */
export function getFeatureSteps(fid: FeatureId): TourStep[] {
  return FEATURE_TOURS[fid] ?? defaultFeatureSteps(fid)
}

/** Step ids for a feature tour — pass to startTour('feat-'+fid, …). */
export function featureTourStepIds(fid: FeatureId): string[] {
  return getFeatureSteps(fid).map(s => s.id)
}

const FEAT_PREFIX = 'feat-'

/** Resolve the active tour id (legacy TOUR_STEPS key OR `feat-<id>`) to steps. */
function resolveSteps(tourId: string): TourStep[] | undefined {
  if (tourId.startsWith(FEAT_PREFIX)) return getFeatureSteps(tourId.slice(FEAT_PREFIX.length) as FeatureId)
  return TOUR_STEPS[tourId]
}

const PADDING = 8
const TOOLTIP_W = 300
const TOOLTIP_GAP = 22   // extra gap leaves room for the arrow between tooltip & target

// One-time keyframes for the pulsing spotlight + bouncing arrow.
const TOUR_CSS = `
@keyframes ws-tour-ring     { 0%,100% { opacity:.95; } 50% { opacity:.35; } }
@keyframes ws-tour-halo     { 0% { r:0; opacity:.5; } 100% { r:46; opacity:0; } }
@keyframes ws-tour-bounce   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes ws-tour-bounceUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(9px); } }
@keyframes ws-tour-dash     { to { stroke-dashoffset: -28; } }
`

export default function CoachmarkTour() {
  const activeTour  = useTutorialStore(s => s.activeTour)
  const advanceTour = useTutorialStore(s => s.advanceTour)
  const retreatTour = useTutorialStore(s => s.retreatTour)
  const closeTour   = useTutorialStore(s => s.closeTour)

  // Re-measure on tick so spotlights track moving / newly-mounted elements.
  const [, force] = useState(0)
  useEffect(() => {
    if (!activeTour) return
    const id = setInterval(() => force(n => n + 1), 250)
    return () => clearInterval(id)
  }, [activeTour])

  // Escape closes the tour.
  useEffect(() => {
    if (!activeTour) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTour() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeTour, closeTour])

  // Run a step's registered action once, when that step becomes active. This is
  // what makes the flagship demo actually open the split menu / switch tabs.
  const tourId = activeTour?.id
  const stepIdx = activeTour?.currentIndex
  useEffect(() => {
    if (tourId == null || stepIdx == null) return
    const step = resolveSteps(tourId)?.[stepIdx]
    if (!step?.action) return
    const fn = tourActions.get(step.action)
    if (fn) { try { fn() } catch { /* action is best-effort */ } }
  }, [tourId, stepIdx])

  if (!activeTour) return null

  const steps = resolveSteps(activeTour.id)
  if (!steps) return null

  const step = steps[activeTour.currentIndex]
  if (!step) return null

  const isFirst = activeTour.currentIndex === 0
  const isLast  = activeTour.currentIndex === steps.length - 1

  const W = window.innerWidth
  const H = window.innerHeight

  // Resolve target rect. Prefer a registered ref; fall back to a DOM element
  // tagged `data-tour="<key>"` (lets large components opt in by adding a single
  // attribute instead of threading a React ref through deep JSX).
  let targetRect: DOMRect | null = null
  if (step.target !== 'center') {
    const ref = tourRefs.get(step.target)
    const el: HTMLElement | null = ref?.current
      ?? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) targetRect = r
    }
  }

  const isCentered = step.target === 'center' || !targetRect

  const navRow = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <button
        onClick={retreatTour}
        disabled={isFirst}
        style={{
          background: 'transparent',
          border: '1px solid rgba(99,162,255,0.3)',
          color: isFirst ? '#4a5568' : '#a5b4fc',
          fontSize: 12,
          cursor: isFirst ? 'not-allowed' : 'pointer',
          padding: '6px 12px',
          borderRadius: 8,
          fontFamily: "'Rubik', sans-serif",
        }}
      >
        ← קודם
      </button>
      <button
        onClick={closeTour}
        style={{
          background: 'transparent', border: 'none',
          color: '#9aa4c7', fontSize: 12, cursor: 'pointer',
          padding: '4px 6px', fontFamily: "'Rubik', sans-serif",
        }}
      >
        דלג
      </button>
      <button
        onClick={advanceTour}
        style={{
          background: 'linear-gradient(135deg, #5b8bff, #6c63ff)',
          border: 'none', color: '#fff',
          fontSize: 14, fontWeight: 700, padding: '9px 20px',
          borderRadius: 999, cursor: 'pointer',
          fontFamily: "'Rubik', sans-serif",
          boxShadow: '0 4px 16px rgba(91,139,255,0.5)',
        }}
      >
        {isLast ? 'סיום ✓' : 'הבא →'}
      </button>
    </div>
  )

  // Progress dots — a more prominent indicator than "x / n" text alone.
  const dots = (
    <div style={{ display: 'flex', gap: 5, marginTop: 10, justifyContent: 'flex-start' }}>
      {steps.map((s, i) => (
        <span key={s.id} style={{
          width: i === activeTour.currentIndex ? 18 : 7, height: 7, borderRadius: 999,
          background: i === activeTour.currentIndex ? 'linear-gradient(90deg,#D4AF37,#f0c651)' : 'rgba(255,255,255,0.22)',
          transition: 'width .25s',
        }} />
      ))}
    </div>
  )

  const cardContent = (
    <>
      <div style={{
        display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#0d1320',
        background: 'linear-gradient(90deg,#D4AF37,#f0c651)', padding: '2px 9px',
        borderRadius: 999, marginBottom: 8, letterSpacing: '.3px',
      }}>
        שלב {activeTour.currentIndex + 1} מתוך {steps.length}
      </div>
      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 7, letterSpacing: '-0.2px', lineHeight: 1.25 }}>{step.title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#d3dcff' }}>{step.body}</div>
      {dots}
      {navRow}
    </>
  )

  const cardStyle: React.CSSProperties = {
    width: TOOLTIP_W,
    maxWidth: 'calc(100vw - 24px)',
    background: 'linear-gradient(160deg, rgba(24,28,48,0.985), rgba(16,19,34,0.985))',
    border: '1px solid rgba(120,170,255,0.5)',
    borderRadius: 16,
    padding: '16px 18px',
    color: '#f1f5ff',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.18), 0 0 40px rgba(91,139,255,0.18)',
    fontFamily: "'Rubik', sans-serif",
    backdropFilter: 'blur(10px)',
  }

  if (isCentered) {
    return (
      <div
        role="dialog"
        aria-label={step.title}
        style={{
          position: 'fixed', inset: 0, zIndex: 10_001,
          pointerEvents: 'auto',
          background: 'rgba(6,9,22,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <style>{TOUR_CSS}</style>
        <div dir="rtl" style={{ ...cardStyle, animation: 'ws-tour-bounce 2.4s ease-in-out infinite' }}>{cardContent}</div>
      </div>
    )
  }

  const r = targetRect!
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  // Place tooltip below by default; flip above if too close to bottom. We
  // compute the card's TOP-LEFT directly (no translateY flip) and CLAMP it fully
  // inside the viewport so later / edge-anchored steps are never cut off.
  const fitsBelow = r.bottom + TOOLTIP_GAP + 200 < H
  const EST_H = 230
  let cardTop = fitsBelow ? r.bottom + TOOLTIP_GAP : r.top - TOOLTIP_GAP - EST_H
  cardTop = Math.max(12, Math.min(cardTop, H - EST_H - 12))
  const halfW = TOOLTIP_W / 2
  const cardLeft = Math.max(halfW + 8, Math.min(cx, W - halfW - 8))
  const tooltipTop = cardTop
  const tooltipXform = 'translateX(-50%)'

  // Arrow geometry: a short, bold pointer sitting between the target and the
  // tooltip, pointing AT the target. Bounces toward the target to draw the eye.
  const arrowGap = 6
  const arrowLen = 34
  const arrowX = cx
  const arrowTailY = fitsBelow ? r.bottom + arrowGap + arrowLen : r.top - arrowGap - arrowLen
  const arrowHeadY = fitsBelow ? r.bottom + arrowGap : r.top - arrowGap
  const headSize = 13
  // Triangle arrowhead pointing toward the target edge.
  const headPath = fitsBelow
    ? `M ${arrowX - headSize} ${arrowHeadY + headSize} L ${arrowX} ${arrowHeadY} L ${arrowX + headSize} ${arrowHeadY + headSize} Z`
    : `M ${arrowX - headSize} ${arrowHeadY - headSize} L ${arrowX} ${arrowHeadY} L ${arrowX + headSize} ${arrowHeadY - headSize} Z`
  const bounceAnim = fitsBelow ? 'ws-tour-bounceUp 1s ease-in-out infinite' : 'ws-tour-bounce 1s ease-in-out infinite'

  return (
    <div
      role="dialog"
      aria-label={step.title}
      style={{ position: 'fixed', inset: 0, zIndex: 10_001, pointerEvents: 'auto' }}
    >
      <style>{TOUR_CSS}</style>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect
              x={r.left - PADDING} y={r.top - PADDING}
              width={r.width + PADDING * 2} height={r.height + PADDING * 2}
              rx={12} fill="black"
            />
          </mask>
        </defs>
        {/* Dimmed backdrop with the target cut out */}
        <rect x={0} y={0} width={W} height={H} fill="rgba(6,9,22,0.72)" mask="url(#tour-spotlight-mask)" />
        {/* Expanding halo around the target */}
        <circle cx={cx} cy={cy} r={0} fill="none" stroke="rgba(212,175,55,0.9)" strokeWidth={2}
          style={{ animation: 'ws-tour-halo 1.6s ease-out infinite' }} />
        {/* Pulsing spotlight ring */}
        <rect
          x={r.left - PADDING} y={r.top - PADDING}
          width={r.width + PADDING * 2} height={r.height + PADDING * 2}
          rx={12} fill="none"
          stroke="#D4AF37" strokeWidth={3}
          style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.7))', animation: 'ws-tour-ring 1.3s ease-in-out infinite' }}
        />
        {/* Bouncing arrow pointing at the target */}
        <g style={{ animation: bounceAnim, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>
          <line x1={arrowX} y1={arrowTailY} x2={arrowX} y2={arrowHeadY}
            stroke="#D4AF37" strokeWidth={5} strokeLinecap="round"
            strokeDasharray="7 7" style={{ animation: 'ws-tour-dash .7s linear infinite' }} />
          <path d={headPath} fill="#D4AF37" />
        </g>
      </svg>
      <div
        dir="rtl"
        style={{
          ...cardStyle,
          position: 'absolute',
          left: cardLeft,
          top: tooltipTop,
          transform: tooltipXform,
          maxHeight: 'calc(100vh - 24px)', overflowY: 'auto',
        }}
      >
        {cardContent}
      </div>
    </div>
  )
}
