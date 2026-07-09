/**
 * HierarchyBreadcrumb — small hand-drawn "where am I in the material" trail.
 * Sits in WhiteboardShell's topRightSlot on a lesson/quiz board.
 *
 * Reads the topic's ancestry (broad → specific) from topicHierarchy and
 * renders it reversed (specific → broad), e.g. for 'mean':
 *   ממוצע ‹ מדדי מרכז ‹ מדדים סטטיסטיים תמציתיים ‹ סטטיסטיקה תיאורית
 *
 * The current (most specific) topic is emphasized in navy; ancestors fade
 * out in size/weight/colour. A single soft, wobbly SVG polyline runs under
 * the chain for a marker-ink, hand-drawn feel — decorative only, kept light
 * so it never competes with the text for readability.
 */
import type { CSSProperties } from 'react'
import { ancestryOf } from '../data/topicHierarchy'
import { GRAPH_FONT } from './graphs/graphTheme'

const GOLD = '#C97C18'
const NAVY = '#1F3E6C'
const SLATE = '#64748B'

/** Deterministic (per-topic) small integer seed, so the wobble is stable
 *  across re-renders but varies gently from one topic to another. */
function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

/** A gentle, sketchy wave across a fixed viewBox — stretched to 100% width
 *  via preserveAspectRatio="none" so it always spans the rendered chain,
 *  whatever its length or wrap. */
function buildWobblePath(seed: number): string {
  const segments = 6
  const w = 240
  const baseY = 5
  let d = `M0,${baseY}`
  for (let i = 1; i <= segments; i++) {
    const x1 = ((i - 0.66) / segments) * w
    const x2 = ((i - 0.33) / segments) * w
    const x = (i / segments) * w
    // deterministic pseudo-random wobble derived from seed + segment index
    const wobA = ((seed >> (i % 5)) % 5) - 2 // -2..2
    const wobB = ((seed >> ((i + 2) % 7)) % 5) - 2
    const y1 = baseY + wobA
    const y2 = baseY - wobB
    const y = baseY + (((seed + i) % 3) - 1)
    d += ` C${x1},${y1} ${x2},${y2} ${x},${y}`
  }
  return d
}

const chainWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: 6,
  rowGap: 2,
  maxWidth: '60%',
  paddingBottom: 6,
  fontFamily: GRAPH_FONT,
  userSelect: 'none',
  lineHeight: 1.3,
}

const currentLabelStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: NAVY,
}

const ancestorLabelStyle: CSSProperties = {
  fontWeight: 400,
  fontSize: 12,
  color: SLATE,
}

const separatorStyle: CSSProperties = {
  fontSize: 12,
  color: GOLD,
  opacity: 0.8,
}

export default function HierarchyBreadcrumb({ topicId }: { topicId: string }) {
  const ancestry = ancestryOf(topicId)
  if (!ancestry || ancestry.length === 0) return null

  // ancestryOf is broad → specific; the breadcrumb reads specific → broad.
  const chain = [...ancestry].reverse()
  const wobblePath = buildWobblePath(seedFromString(topicId))

  return (
    <div dir="rtl" style={chainWrapStyle} aria-label="מיקום בחומר">
      {chain.map((label, i) => (
        <span key={`${topicId}-${i}`} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          {i > 0 && <span style={separatorStyle} aria-hidden="true">‹</span>}
          <span style={i === 0 ? currentLabelStyle : ancestorLabelStyle}>{label}</span>
        </span>
      ))}
      <svg
        viewBox="0 0 240 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 8, pointerEvents: 'none' }}
      >
        <path d={wobblePath} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    </div>
  )
}
