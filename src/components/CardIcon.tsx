/**
 * CardIcon — the line icon that sits above every home-screen container title.
 *
 * One stroke weight, one colour, no background shape. Shirli's brief: thin
 * outline icons in dark grey, nothing behind them, icon on top and the title
 * underneath, both flush to the right edge in RTL.
 *
 * These eight are deliberately plain placeholders. The set gets replaced with
 * one designed icon language later — keeping every path in this file means
 * that swap is a one-file change instead of a hunt through four components.
 *
 * Pair it with `cardTitle` and `cardHead` below so the stack is identical
 * everywhere:
 *
 *   <div style={cardHead}>
 *     <CardIcon name="study" />
 *     <div style={cardTitle}>לימוד חומר</div>
 *   </div>
 */
import type { CSSProperties } from 'react'

export type CardIconName =
  | 'plan'      // התאם תכנית אישית — sliders
  | 'video'     // סרטון הדרכה — screen with a play triangle
  | 'study'     // לימוד חומר — open book
  | 'practice'  // תרגול — pencil
  | 'insights'  // תובנות למידה — bar chart
  | 'risk'      // לוח סיכונים — target
  | 'chart'     // פעילות השבוע — trend line
  | 'world'     // העולם שלי — globe

/** The title's blue, so the icon and the title under it are one colour. It was
 *  the button's darker ink, which on 26px of line work read as black. */
export const CARD_ICON_COLOR = 'var(--sh-text-med)'

/** The one coral element inside each icon. It always marks where the action
 *  happens, so the accent keeps the meaning it has everywhere else in the app
 *  — "this moved" — instead of becoming decoration. */
export const CARD_ICON_ACCENT = '#FF854C'

const PATHS: Record<CardIconName, JSX.Element> = {
  plan: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="15" cy="7" r="2.2" fill={CARD_ICON_COLOR} stroke="none" />
      <circle cx="16" cy="17" r="2.2" fill={CARD_ICON_COLOR} stroke="none" />
      <circle cx="9" cy="12" r="2.4" fill={CARD_ICON_ACCENT} stroke="none" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill={CARD_ICON_ACCENT} stroke={CARD_ICON_ACCENT} strokeWidth={1.5} />
    </>
  ),
  study: (
    <>
      <path d="M12 6.5C10.5 5.2 8.4 4.6 5 4.6v12.8c3.4 0 5.5.6 7 1.9" />
      <path d="M12 6.5c1.5-1.3 3.6-1.9 7-1.9v12.8c-3.4 0-5.5.6-7 1.9z" />
      <line x1="12" y1="6.5" x2="12" y2="19.3" />
      <rect x="15.4" y="4.4" width="2.4" height="6" rx="1.2" fill={CARD_ICON_ACCENT} stroke="none" />
    </>
  ),
  practice: (
    <>
      <rect x="5" y="3.4" width="14" height="17.2" rx="2.6" />
      <line x1="8.4" y1="8.2" x2="15.6" y2="8.2" />
      <line x1="8.4" y1="11.6" x2="13.4" y2="11.6" />
      <polyline points="8.6,16.1 10.7,18.2 15.5,13.4" stroke={CARD_ICON_ACCENT} strokeWidth={2.2} />
    </>
  ),
  insights: (
    <>
      <rect x="4.6" y="13.2" width="4.2" height="6.8" rx=".8" />
      <rect x="9.9" y="9.2" width="4.2" height="10.8" rx=".8" />
      <rect x="15.2" y="5.2" width="4.2" height="14.8" rx=".8" />
      <line x1="3" y1="20" x2="21" y2="20" stroke={CARD_ICON_ACCENT} strokeWidth={2.2} />
    </>
  ),
  risk: (
    <>
      <circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.6" fill={CARD_ICON_ACCENT} stroke="none" />
    </>
  ),
  chart: (
    <>
      <polyline points="3.5,16.5 9,11 13,15 20.5,7.5" />
      <polyline points="15.5,7.5 20.5,7.5 20.5,12.5" />
      <circle cx="20.5" cy="7.5" r="2" fill={CARD_ICON_ACCENT} stroke="none" />
    </>
  ),
  world: (
    <>
      <circle cx="12" cy="12" r="8.6" /><ellipse cx="12" cy="12" rx="3.6" ry="8.6" />
      <line x1="3.4" y1="12" x2="20.6" y2="12" />
      <path d="M5.2 7.2c1.9 1 4.2 1.6 6.8 1.6s4.9-.6 6.8-1.6" />
      <path d="M5.2 16.8c1.9-1 4.2-1.6 6.8-1.6s4.9.6 6.8 1.6" />
      <circle cx="15.2" cy="8.6" r="1.9" fill={CARD_ICON_ACCENT} stroke="none" />
    </>
  ),
}

export default function CardIcon({ name, size = 26 }: { name: CardIconName; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={CARD_ICON_COLOR} strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: 'block' }}
    >
      {PATHS[name]}
    </svg>
  )
}

/** Every container title on the home screen. Taken from לימוד חומר, which
 *  Shirli picked as the reference. */
export const cardTitle: CSSProperties = {
  fontFamily: 'var(--ws-display)',
  fontWeight: 700,
  fontSize: 23,
  color: 'var(--sh-text-med)',
  textAlign: 'right',
}

/** The icon-over-title stack. flex-start is the RIGHT edge under dir="rtl". */
export const cardHead: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 9,
}

/**
 * The call-to-action buttons live entirely in `.ws-cta` (src/index.css), not
 * in a style object here.
 *
 * That is deliberate. Inline styles outrank every class selector, so any rest
 * appearance set in JS silently beats :hover and :active and the states never
 * fire. Keeping the whole button in CSS is what lets it actually react.
 *
 *   <button className="ws-cta" onClick={…}>מתחילים ללמוד<CtaArrow /></button>
 *
 * Copy is gender-neutral throughout: Hebrew imperatives inflect, so "בוא"
 * addresses a man. First-person plural ("מתחילים") invites without picking one.
 */

/**
 * The arrow that closes every CTA. Compact, stroked, no disc behind it, and
 * pointing LEFT — in Hebrew, forward is leftward. `currentColor` means it
 * follows the label through every state instead of needing its own colour.
 */
export function CtaArrow() {
  return (
    <svg
      width={16} height={16} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </svg>
  )
}
