/**
 * HierarchyBreadcrumb — compact "where am I in the material" trail.
 *
 * Redesign 2026-07-08 (Barak): the previous text-chain version overlapped the
 * lesson title (collision) and ate ~60% width. Per the ui-anti-collision
 * convention it now (a) lives in WhiteboardShell's RESERVED header band (in
 * document flow, never absolutely over content), and (b) is a small ICON trail:
 * the current topic as a labeled gold node, a hand-drawn connector, then small
 * ancestor DOTS that reveal their name on hover — tiny footprint, no collision.
 *
 * Reads the topic's ancestry (broad → specific) from topicHierarchy.
 * For 'mean': current = ממוצע; hover dots back through
 * מדדי מרכז ‹ מדדים סטטיסטיים תמציתיים ‹ סטטיסטיקה תיאורית.
 */
import { useState } from 'react'
import { ancestryOf } from '../data/topicHierarchy'
import { GRAPH_FONT } from './graphs/graphTheme'

const GOLD = '#C97C18'
const NAVY = '#1F3E6C'
const SLATE = '#64748B'

export default function HierarchyBreadcrumb({ topicId }: { topicId: string }) {
  const ancestry = ancestryOf(topicId)
  const [hover, setHover] = useState<number | null>(null)
  if (!ancestry || ancestry.length === 0) return null

  const chain = ancestry                     // broad → specific
  const current = chain[chain.length - 1]
  // ancestors ordered specific → broad (so they trail leftward from the current node)
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
        gap: 6,
        maxWidth: '100%',
        fontFamily: GRAPH_FONT,
        userSelect: 'none',
        background: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(31,62,108,0.10)',
        borderRadius: 999,
        padding: '3px 10px 3px 8px',
        boxShadow: '0 1px 3px rgba(31,62,108,0.08)',
        whiteSpace: 'nowrap',
      }}
    >
      {/* current topic — labeled gold node (always visible: you always know where you are) */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: GOLD, boxShadow: '0 0 0 3px rgba(201,124,24,0.18)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: NAVY }}>{current}</span>
      </span>

      {ancestors.length > 0 && (
        <>
          {/* hand-drawn connector — the "small visualization" linking the trail */}
          <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M1,6 C6,3 11,9 16,6 21,4 23,6 23,6" fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={1.4} strokeLinecap="round" />
          </svg>

          {/* ancestor dots — hover reveals the name (compact; no text taking space) */}
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
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default', outline: 'none' }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: hover === i ? GOLD : SLATE, opacity: hover === i ? 1 : Math.max(0.4, 0.75 - i * 0.12), transition: 'background .12s', flexShrink: 0 }} />
              {i < ancestors.length - 1 && <span style={{ width: 8, height: 1, background: GOLD, opacity: 0.3 }} />}
              {hover === i && (
                <span
                  role="tooltip"
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 6px)', right: '50%', transform: 'translateX(50%)',
                    background: NAVY, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
                    boxShadow: '0 3px 8px rgba(15,23,42,0.28)', zIndex: 5,
                  }}
                >
                  {label}
                </span>
              )}
            </span>
          ))}

          {/* root marker */}
          <span aria-hidden="true" style={{ fontSize: 12, opacity: 0.65, marginInlineStart: 2 }}>🏠</span>
        </>
      )}
    </div>
  )
}
