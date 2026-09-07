/**
 * CardIcon — the line icon that sits above every home-screen container title.
 *
 * Duotone fill: one colour, two opacities, no stroke at all. Shirli's brief: thin
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

/** The mass — the large soft shape behind. It is the sidebar's own blue, so
 *  the icons relate to the chrome rather than to the text under them.
 *  Shirli, 2026-09-07. */
export const CARD_ICON_MASS = '#3351CA'

/** The detail — the small solid shape in front. Deeper and darker than the
 *  mass, which is what makes the shape read at 26px: the two are 6.6:1 apart
 *  once the mass is laid down at .3, even though as flat colours they are only
 *  1.6:1 apart and would collapse into one shape. The opacity is doing the
 *  separating; the hues are doing the character. */
export const CARD_ICON_DETAIL = '#293681'

/** Kept for the course cards, which take a single colour. */
export const CARD_ICON_COLOR = CARD_ICON_DETAIL

/** The back layer's opacity. The whole duotone effect is this number. */
export const CARD_ICON_BACK = 0.3

/** Coral is no longer part of an icon. It keeps the meaning it has everywhere
 *  else — "this moved" — and belongs to charts, timelines and achievements,
 *  plus the selected row in the sidebar rail, which still imports it. */
export const CARD_ICON_ACCENT = '#FF854C'

const PATHS: Record<CardIconName, JSX.Element> = {
  plan: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 9.96 2.81 C 9.56 2.51 9.04 2.44 8.56 2.61 C 7.48 3.00 6.47 3.59 5.58 4.33 C 5.20 4.66 5.00 5.15 5.06 5.64 C 5.13 6.40 5 7.12 4.64 7.75 C 4.28 8.38 3.71 8.86 3.02 9.17 C 2.56 9.37 2.24 9.79 2.15 10.28 C 1.95 11.42 1.95 12.58 2.15 13.72 C 2.24 14.26 2.61 14.65 3.02 14.83 C 3.71 15.14 4.28 15.62 4.64 16.25 C 5 16.88 5.13 17.60 5.06 18.36 C 5.01 18.81 5.17 19.32 5.58 19.67 C 6.47 20.41 7.48 21.00 8.56 21.39 C 9.04 21.56 9.56 21.49 9.96 21.19 C 10.58 20.75 11.28 20.5 12 20.5 C 12.72 20.5 13.42 20.75 14.04 21.19 C 14.40 21.46 14.93 21.58 15.44 21.39 C 16.52 21.00 17.53 20.41 18.42 19.67 C 18.84 19.32 18.99 18.81 18.94 18.36 C 18.87 17.60 19.00 16.88 19.36 16.25 C 19.72 15.62 20.29 15.14 20.98 14.83 C 21.39 14.65 21.76 14.26 21.85 13.72 C 22.05 12.58 22.05 11.42 21.85 10.28 C 21.76 9.79 21.43 9.37 20.98 9.17 C 20.29 8.86 19.72 8.38 19.36 7.75 C 19.00 7.12 18.87 6.40 18.94 5.64 C 19.00 5.15 18.80 4.66 18.42 4.33 C 17.53 3.59 16.52 3.00 15.44 2.61 C 14.96 2.44 14.44 2.51 14.04 2.81 C 13.42 3.25 12.72 3.5 12 3.5 C 11.28 3.5 10.58 3.25 9.96 2.81 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 9 12 C 9 9.69 11.5 8.25 13.5 9.40 C 14.43 9.94 15 10.93 15 12 C 15 14.31 12.5 15.75 10.5 14.60 C 9.57 14.06 9 13.07 9 12 Z" />
    </>
  ),
  video: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 2 5 C 2 3.90 2.90 3 4 3 L 20 3 C 21.11 3 22 3.90 22 5 L 22 19 C 22 20.11 21.11 21 20 21 L 4 21 C 2.90 21 2 20.11 2 19 L 2 5 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 13 8 L 16 8 L 17 5 L 14 5 L 13 8 Z" />
    </>
  ),
  study: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 6 2 C 4.89 2 4 2.90 4 4 L 4 5 C 3.23 5 2.75 5.83 3.13 6.5 C 3.31 6.81 3.64 7 4 7 L 4 9 C 3.23 9 2.75 9.83 3.13 10.5 C 3.31 10.81 3.64 11 4 11 L 4 13 C 3.23 13 2.75 13.83 3.13 14.5 C 3.31 14.81 3.64 15 4 15 L 4 17 C 3.23 17 2.75 17.83 3.13 18.5 C 3.31 18.81 3.64 19 4 19 L 4 20 C 4 21.11 4.89 22 6 22 L 18 22 C 19.11 22 20 21.11 20 20 L 20 4 C 20 2.90 19.11 2 18 2 L 6 2 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 8.5 6 C 7.67 6 7 6.67 7 7.5 L 7 8.5 C 7 9.33 7.67 10 8.5 10 L 15.5 10 C 16.33 10 17 9.33 17 8.5 L 17 7.5 C 17 6.67 16.33 6 15.5 6 L 8.5 6 Z" />
    </>
  ),
  practice: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 7 3 L 7 4 C 7 5.11 7.89 6 9 6 L 15 6 C 16.11 6 17 5.11 17 4 L 17 3 L 18 3 C 19.11 3 20 3.90 20 5 L 20 16 C 20 19.31 17.31 22 14 22 L 6 22 C 4.89 22 4 21.11 4 20 L 4 5 C 4 3.90 4.89 3 6 3 L 7 3 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 14 2 C 14.77 2.00 15.25 2.83 14.86 3.50 C 14.71 3.77 14.43 3.96 14.12 3.99 L 14 4 L 10 4 C 9.23 4.00 8.75 3.17 9.14 2.50 C 9.29 2.23 9.57 2.04 9.88 2.01 L 10 2 L 14 2 Z" />
    </>
  ),
  insights: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M4.6 12.6h3.6a1.6 1.6 0 0 1 1.6 1.6v4.2a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.4v-4.2a1.6 1.6 0 0 1 1.6-1.6zM10.4 8.4H14a1.6 1.6 0 0 1 1.6 1.6v8.4a1.6 1.6 0 0 1-1.6 1.6h-3.6a1.6 1.6 0 0 1-1.6-1.6V10a1.6 1.6 0 0 1 1.6-1.6z" />
      <path fill={CARD_ICON_DETAIL} d="M17.8 4h1.6A1.6 1.6 0 0 1 21 5.6v12.8a1.6 1.6 0 0 1-1.6 1.6h-1.6a1.6 1.6 0 0 1-1.6-1.6V5.6A1.6 1.6 0 0 1 17.8 4zM2.2 20h19.6a1.1 1.1 0 0 1 0 2.2H2.2a1.1 1.1 0 0 1 0-2.2z" />
    </>
  ),
  risk: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 12 2 C 12.51 2 12.93 2.38 12.99 2.88 L 13 3 L 13 3.06 C 17.08 3.51 20.33 6.67 20.91 10.73 L 20.95 11 L 21 11 C 21.77 11.00 22.25 11.84 21.86 12.50 C 21.71 12.77 21.43 12.96 21.12 12.99 L 21 13 L 20.95 13 C 20.49 17.08 17.33 20.33 13.27 20.91 L 13 20.95 L 13 21 C 13.00 21.77 12.16 22.25 11.50 21.86 C 11.23 21.71 11.04 21.43 11.01 21.12 L 11 21 L 11 20.95 C 6.92 20.49 3.67 17.33 3.09 13.27 L 3.06 13 L 3 13 C 2.23 13.00 1.75 12.16 2.14 11.50 C 2.29 11.23 2.57 11.04 2.88 11.01 L 3 11 L 3.06 11 C 3.51 6.92 6.67 3.67 10.73 3.09 L 11 3.06 L 11 3 C 11 2.45 11.45 2 12 2 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 12 7 C 8.15 7 5.75 11.17 7.67 14.5 C 8.56 16.05 10.21 17 12 17 C 15.85 17 18.25 12.83 16.33 9.5 C 15.44 7.95 13.79 7 12 7 Z" />
    </>
  ),
  chart: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} d="M 19 11 C 20.05 11 20.92 11.81 21.00 12.85 L 21 13 L 21 19 C 21 20.05 20.19 20.92 19.15 21.00 L 19 21 L 15 21 C 13.95 21 13.08 20.19 13.01 19.15 L 13 19 L 13 13 C 13 11.95 13.81 11.08 14.85 11.01 L 15 11 L 19 11 Z" />
      <path fill={CARD_ICON_DETAIL} d="M 9 3 C 10.11 3 11 3.90 11 5 L 11 11 C 11 12.11 10.11 13 9 13 L 5 13 C 3.90 13 3 12.11 3 11 L 3 5 C 3 3.90 3.90 3 5 3 L 9 3 Z" />
    </>
  ),
  /* העולם שלי — the city, not a planet. Shirli picked it from a reference
   * and it replaces the globe from the ready-made set: the app's world is a
   * place you build. The slanted slab and the pitched tower are what keep
   * three buildings from reading as three measured columns, i.e. a chart. */
  world: (
    <>
      <path fill={CARD_ICON_MASS} opacity={CARD_ICON_BACK} stroke={CARD_ICON_MASS} strokeWidth={0.9} strokeLinejoin="round" d="M2.3 13.9 7.3 9.6V21H2.3zM16.7 13.3a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V21h-5z" />
      <path fill={CARD_ICON_DETAIL} stroke={CARD_ICON_DETAIL} strokeWidth={0.9} strokeLinejoin="round" d="M9.7 7.4 12 4.5 14.3 7.4V21H9.7z" />
    </>
  ),
}

export default function CardIcon({ name, size = 26 }: { name: CardIconName; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
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
