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

/** Dark grey, per the brief — not the app navy, so the icons read as chrome. */
export const CARD_ICON_COLOR = '#4B5563'

const PATHS: Record<CardIconName, JSX.Element> = {
  plan: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="15" cy="7" r="2.2" /><circle cx="9" cy="12" r="2.2" /><circle cx="16" cy="17" r="2.2" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </>
  ),
  study: (
    <>
      <path d="M12 6.5C10.5 5.2 8.4 4.6 5 4.6v12.8c3.4 0 5.5.6 7 1.9" />
      <path d="M12 6.5c1.5-1.3 3.6-1.9 7-1.9v12.8c-3.4 0-5.5.6-7 1.9z" />
      <line x1="12" y1="6.5" x2="12" y2="19.3" />
    </>
  ),
  practice: (
    <>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" />
      <line x1="14.5" y1="6.5" x2="17.5" y2="9.5" />
    </>
  ),
  insights: (
    <>
      <line x1="6" y1="20" x2="6" y2="13" /><line x1="12" y1="20" x2="12" y2="6" /><line x1="18" y1="20" x2="18" y2="10" />
    </>
  ),
  risk: (
    <>
      <circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.9" fill={CARD_ICON_COLOR} />
    </>
  ),
  chart: (
    <>
      <polyline points="3.5,16.5 9,11 13,15 20.5,7.5" />
      <polyline points="15.5,7.5 20.5,7.5 20.5,12.5" />
    </>
  ),
  world: (
    <>
      <circle cx="12" cy="12" r="8.6" /><ellipse cx="12" cy="12" rx="3.6" ry="8.6" />
      <line x1="3.4" y1="12" x2="20.6" y2="12" />
      <path d="M5.2 7.2c1.9 1 4.2 1.6 6.8 1.6s4.9-.6 6.8-1.6" />
      <path d="M5.2 16.8c1.9-1 4.2-1.6 6.8-1.6s4.9.6 6.8 1.6" />
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
  fontFamily: "'Rubik', sans-serif",
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
 * Every call-to-action on the home screen.
 *
 * Sized to its label rather than stretched across the card, and pinned to the
 * RIGHT edge (flex-start under dir="rtl") so the eye runs icon → title → copy →
 * action down one side instead of crossing the card.
 *
 * Depth leads, colour follows. A pressed button is dark and flat — which is
 * exactly what a saturated, shadowless fill looks like, so the earlier version
 * read as already-pressed and had nowhere left to go. Rest is therefore the
 * LIGHTER end of the ramp and clearly raised; `.ws-cta` in index.css takes it
 * up on hover and sinks it below the surface on press.
 *
 * Copy is gender-neutral throughout: Hebrew imperatives inflect, so "בוא"
 * addresses a man. First-person plural ("מתחילים") invites without picking one.
 */
export const CTA_BTN: CSSProperties = {
  background: 'linear-gradient(270deg, #4438A0 0%, #6354C6 100%)',
  boxShadow: '0 3px 8px rgba(39,24,126,0.32)',
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  padding: '11px 26px',
  fontWeight: 600,
  fontSize: 16,
  fontFamily: "'Rubik', sans-serif",
  cursor: 'pointer',
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
}

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
