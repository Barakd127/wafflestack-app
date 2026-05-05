/**
 * Coachmark — Contextual tooltip with SVG spotlight cutout.
 *
 * Phase 4 progressive tutorial: instead of a 7-step modal taking over the
 * screen, each coachmark dims the page around a single element, draws an
 * arrow to it, and shows a short caption. Dismissed via "הבנתי"
 * (markSeen) or "דלג על הסיור" (setEnabled false).
 *
 * The host component registers the coachmark via `useTutorialStep`; this
 * component is mounted once at the app root by `<TutorialOverlay/>` and
 * reads the active step from the store.
 */
import { useEffect, useState } from 'react'
import { useTutorialStore } from '../store/tutorialStore'

export type Placement = 'top' | 'bottom' | 'left' | 'right'

export interface CoachmarkSpec {
  stepId: string
  title: string
  body: string
  placement?: Placement
  /** DOMRect of the highlighted element (already in viewport coords). */
  rect: DOMRect | null
}

const PADDING = 8       // spotlight grows this many px on every side
const TOOLTIP_GAP = 12  // distance from highlight rect to tooltip edge
const TOOLTIP_W = 280

function pickAnchor(rect: DOMRect, placement: Placement): { left: number; top: number; transform: string } {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  switch (placement) {
    case 'top':    return { left: cx, top: rect.top - TOOLTIP_GAP, transform: 'translate(-50%, -100%)' }
    case 'bottom': return { left: cx, top: rect.bottom + TOOLTIP_GAP, transform: 'translate(-50%, 0)' }
    case 'left':   return { left: rect.left - TOOLTIP_GAP, top: cy, transform: 'translate(-100%, -50%)' }
    case 'right':  return { left: rect.right + TOOLTIP_GAP, top: cy, transform: 'translate(0, -50%)' }
  }
}

export default function Coachmark({ spec }: { spec: CoachmarkSpec }) {
  const markSeen   = useTutorialStore(s => s.markSeen)
  const setEnabled = useTutorialStore(s => s.setEnabled)

  // Re-render on resize / scroll so the spotlight tracks the element
  const [, force] = useState(0)
  useEffect(() => {
    const tick = () => force(n => n + 1)
    window.addEventListener('resize', tick)
    window.addEventListener('scroll', tick, true)
    return () => {
      window.removeEventListener('resize', tick)
      window.removeEventListener('scroll', tick, true)
    }
  }, [])

  if (!spec.rect) return null

  const r = spec.rect
  const W = window.innerWidth
  const H = window.innerHeight
  const anchor = pickAnchor(r, spec.placement ?? 'bottom')

  return (
    <div
      role="dialog"
      aria-label={spec.title}
      style={{
        position: 'fixed', inset: 0, zIndex: 10_000,
        pointerEvents: 'auto',
      }}
    >
      {/* Dim layer with a rectangular cutout around the target */}
      <svg
        width={W} height={H}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
      >
        <defs>
          <mask id="coachmark-mask">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect
              x={r.left - PADDING}
              y={r.top - PADDING}
              width={r.width + PADDING * 2}
              height={r.height + PADDING * 2}
              rx={10}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x={0} y={0} width={W} height={H}
          fill="rgba(8,12,28,0.65)"
          mask="url(#coachmark-mask)"
        />
        {/* Highlight ring */}
        <rect
          x={r.left - PADDING}
          y={r.top - PADDING}
          width={r.width + PADDING * 2}
          height={r.height + PADDING * 2}
          rx={10}
          fill="none"
          stroke="rgba(99,162,255,0.95)"
          strokeWidth={2}
          style={{ filter: 'drop-shadow(0 0 8px rgba(99,162,255,0.55))' }}
        />
      </svg>

      {/* Tooltip card */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: anchor.left,
          top: anchor.top,
          transform: anchor.transform,
          width: TOOLTIP_W,
          maxWidth: 'calc(100vw - 24px)',
          background: 'rgba(20,24,40,0.97)',
          border: '1px solid rgba(99,162,255,0.45)',
          borderRadius: 14,
          padding: '14px 16px',
          color: '#f1f5ff',
          boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
          fontFamily: "'Rubik', sans-serif",
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing: '-0.2px' }}>
          {spec.title}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#cbd5ff', marginBottom: 12 }}>
          {spec.body}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setEnabled(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9aa4c7',
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 6px',
              fontFamily: "'Rubik', sans-serif",
            }}
          >
            דלג על הסיור
          </button>
          <button
            onClick={() => markSeen(spec.stepId)}
            style={{
              background: 'linear-gradient(135deg, #5b8bff, #6c63ff)',
              border: 'none',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 16px',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif",
              boxShadow: '0 4px 14px rgba(91,139,255,0.45)',
            }}
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  )
}
