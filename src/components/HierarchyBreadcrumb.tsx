/**
 * HierarchyBreadcrumb — compact "where am I in the material" trail.
 *
 * It says two things: where you are, named, and the steps back to the root as
 * dots on a hairline that give up their names on hover. Small on purpose — the
 * top bar already carries the course and the mode, so this is the level below
 * that, inside the material.
 *
 * Redesign 2026-09-16 (Shirli): it moved off the glass board and onto the
 * screen's toolbar row, and lost the four decisions that were not ours —
 * Playpen Sans Hebrew, a gold #C97C18 node, a hand-drawn gold squiggle for a
 * connector, and slate #64748B dots. One typeface, one ink at three strengths.
 *
 * Reads the topic's ancestry (broad → specific) from topicHierarchy.
 * For 'mean': current = ממוצע; hover dots back through
 * מדדי מרכז ‹ מדדים סטטיסטיים תמציתיים ‹ סטטיסטיקה תיאורית.
 */
import { useState } from 'react'
import { ancestryOf } from '../data/topicHierarchy'
/* One ink at three strengths: the name, the steps, the line between them.
   Gold #C97C18 and slate #64748B are gone with the squiggle they drew. */
const INK = '#254A9F'
const FADE = 'rgba(37,74,159,0.42)'
const LINE = 'rgba(37,74,159,0.22)'

export default function HierarchyBreadcrumb({ topicId }: { topicId: string }) {
  const ancestry = ancestryOf(topicId)
  const [hover, setHover] = useState<number | null>(null)
  if (!ancestry || ancestry.length === 0) return null

  const chain = ancestry                     // broad → specific
  const current = chain[chain.length - 1]
  // ancestors ordered specific → broad, so under RTL they trail leftward from
  // the current node toward the root — you are here, and that is the way back
  const ancestors = chain.slice(0, -1).reverse()
  const fullPath = [...chain].reverse().join(' ‹ ')

  return (
    <div
      dir="rtl"
      title={fullPath}
      aria-label={'מיקום בחומר: ' + fullPath}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        maxWidth: '100%',
        fontFamily: "'Assistant', sans-serif",
        userSelect: 'none',
        whiteSpace: 'nowrap',
        color: INK,
      }}
    >
      {/* where you are — named, because it is the only part worth reading */}
      <span style={{ fontWeight: 700, fontSize: 13.5, color: INK, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {current}
      </span>

      {ancestors.length > 0 && (
        <>
          {/* the way back — one hairline carrying a dot per step, no squiggle */}
          <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {ancestors.map((label, i) => (
              <span
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                title={label}
                aria-label={label}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'default', outline: 'none' }}
              >
                <span style={{ width: 10, height: 1, background: LINE, flexShrink: 0 }} />
                <span
                  style={{
                    width: hover === i ? 8 : 6,
                    height: hover === i ? 8 : 6,
                    borderRadius: '50%',
                    background: hover === i ? INK : FADE,
                    transition: 'all .12s',
                    flexShrink: 0,
                  }}
                />
                {hover === i && (
                  <span
                    role="tooltip"
                    style={{
                      position: 'absolute', bottom: 'calc(100% + 7px)', right: '50%', transform: 'translateX(50%)',
                      background: INK, color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '4px 9px',
                      borderRadius: 8, boxShadow: '0 3px 8px rgba(31,62,108,0.28)', zIndex: 5, whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                )}
              </span>
            ))}
            <span style={{ width: 10, height: 1, background: LINE, flexShrink: 0 }} />
          </span>

          {/* the root */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FADE}
               strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden
               style={{ flexShrink: 0 }}>
            <path d="M3 11.5L12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" />
          </svg>
        </>
      )}
    </div>
  )
}
