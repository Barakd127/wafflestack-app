import React, { useState, useEffect } from 'react'
import { useTutorialStore } from '../store/tutorialStore'

// ── Module-level ref registry ────────────────────────────────────────────────
// Components register their DOM refs here so CoachmarkTour can spotlight them.
const tourRefs = new Map<string, React.RefObject<HTMLElement | null>>()

export function registerTourRef(id: string, ref: React.RefObject<HTMLElement | null>): () => void {
  tourRefs.set(id, ref)
  return () => { tourRefs.delete(id) }
}

// ── Tour step definitions ─────────────────────────────────────────────────────
interface TourStep {
  id: string
  target: string  // ref key, or 'center' for modal-only (no spotlight)
  title: string
  body: string
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  mindmap: [
    { id: 'mm-1', target: 'back-btn',  title: 'ניווט בתוך ה-iframe',  body: 'בתוך המפה: גרור להזזה, גלגלת עכבר לזום פנימה/החוצה.' },
    { id: 'mm-2', target: 'split-btn', title: 'מצב מפוצל',             body: 'לחץ כאן לצפייה במפת המושגים ובעיר בו-זמנית.' },
    { id: 'mm-3', target: 'center',    title: 'לחיצה על צומת',         body: 'לחיצה על כל צומת במפה תפתח את השיעור המתאים.' },
    { id: 'mm-4', target: 'center',    title: 'סגירת המפה',            body: 'לסגירה — לחץ על כפתור "← דף הבית" בפינה הימנית העליונה.' },
    { id: 'mm-5', target: 'help-btn',  title: 'חזרה על הסיור',         body: 'לחץ על "?" בכל עת לחזרה על ההדרכה הזו.' },
  ],
}

const PADDING = 8
const TOOLTIP_W = 280
const TOOLTIP_GAP = 12

export default function CoachmarkTour() {
  const activeTour  = useTutorialStore(s => s.activeTour)
  const advanceTour = useTutorialStore(s => s.advanceTour)
  const retreatTour = useTutorialStore(s => s.retreatTour)
  const closeTour   = useTutorialStore(s => s.closeTour)

  // Re-measure on tick so spotlights track moving elements
  const [, force] = useState(0)
  useEffect(() => {
    if (!activeTour) return
    const id = setInterval(() => force(n => n + 1), 250)
    return () => clearInterval(id)
  }, [activeTour])

  // Escape closes the tour
  useEffect(() => {
    if (!activeTour) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTour() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeTour, closeTour])

  if (!activeTour) return null

  const steps = TOUR_STEPS[activeTour.id]
  if (!steps) return null

  const step = steps[activeTour.currentIndex]
  if (!step) return null

  const isFirst = activeTour.currentIndex === 0
  const isLast  = activeTour.currentIndex === steps.length - 1

  const W = window.innerWidth
  const H = window.innerHeight

  // Resolve target rect
  let targetRect: DOMRect | null = null
  if (step.target !== 'center') {
    const ref = tourRefs.get(step.target)
    if (ref?.current) {
      const r = ref.current.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) targetRect = r
    }
  }

  const isCentered = step.target === 'center' || !targetRect

  const navRow = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <button
        onClick={retreatTour}
        disabled={isFirst}
        style={{
          background: 'transparent',
          border: '1px solid rgba(99,162,255,0.3)',
          color: isFirst ? '#4a5568' : '#a5b4fc',
          fontSize: 12,
          cursor: isFirst ? 'not-allowed' : 'pointer',
          padding: '5px 10px',
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
          fontSize: 13, fontWeight: 600, padding: '7px 16px',
          borderRadius: 999, cursor: 'pointer',
          fontFamily: "'Rubik', sans-serif",
          boxShadow: '0 4px 14px rgba(91,139,255,0.45)',
        }}
      >
        {isLast ? 'סיום ✓' : 'הבא →'}
      </button>
    </div>
  )

  const cardContent = (
    <>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing: '-0.2px' }}>{step.title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: '#cbd5ff', marginBottom: 4 }}>{step.body}</div>
      <div style={{ fontSize: 11, color: '#6b7280' }}>{activeTour.currentIndex + 1} / {steps.length}</div>
      {navRow}
    </>
  )

  const cardStyle: React.CSSProperties = {
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
  }

  if (isCentered) {
    return (
      <div
        role="dialog"
        aria-label={step.title}
        style={{
          position: 'fixed', inset: 0, zIndex: 10_001,
          pointerEvents: 'auto',
          background: 'rgba(8,12,28,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div dir="rtl" style={cardStyle}>{cardContent}</div>
      </div>
    )
  }

  const r = targetRect!
  const cx = r.left + r.width / 2
  // Place tooltip below by default; flip above if too close to bottom
  const fitsBelow = r.bottom + TOOLTIP_GAP + 160 < H
  const tooltipTop  = fitsBelow ? r.bottom + TOOLTIP_GAP : r.top - TOOLTIP_GAP
  const tooltipXform = fitsBelow ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)'

  return (
    <div
      role="dialog"
      aria-label={step.title}
      style={{ position: 'fixed', inset: 0, zIndex: 10_001, pointerEvents: 'auto' }}
    >
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect
              x={r.left - PADDING} y={r.top - PADDING}
              width={r.width + PADDING * 2} height={r.height + PADDING * 2}
              rx={10} fill="black"
            />
          </mask>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="rgba(8,12,28,0.65)" mask="url(#tour-spotlight-mask)" />
        <rect
          x={r.left - PADDING} y={r.top - PADDING}
          width={r.width + PADDING * 2} height={r.height + PADDING * 2}
          rx={10} fill="none"
          stroke="rgba(99,162,255,0.95)" strokeWidth={2}
          style={{ filter: 'drop-shadow(0 0 8px rgba(99,162,255,0.55))' }}
        />
      </svg>
      <div
        dir="rtl"
        style={{
          ...cardStyle,
          position: 'absolute',
          left: cx,
          top: tooltipTop,
          transform: tooltipXform,
        }}
      >
        {cardContent}
      </div>
    </div>
  )
}
