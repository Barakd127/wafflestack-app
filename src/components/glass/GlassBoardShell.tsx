/**
 * GlassBoardShell — a pane of glass held in front of the student's knowledge
 * city. Drop-in replacement for WhiteboardShell (same props) behind the
 * `wafflestack-glass-board` flag (see hooks/useGlassBoard.ts + BoardShell.tsx).
 *
 * Layers (all absolute inside the rounded root):
 *   world  — <CityBackdrop/> (the student's block; parallax with frost)
 *   glass  — frost gradient + backdrop blur driven by t ∈ [0,1], highlight, dot grid
 *   guard  — legibility backplate under the ink when the glass is nearly clear
 *   ink    — the content column (identical to WhiteboardShell's, bottom room for the dock)
 *   modes  — מיקוד (t .85) · הדגמה (t .4) · עיר (t 0), top-left
 *   dock   — hold-to-look pill + frost slider, bottom-left (clears the tutor FAB)
 *
 * Frost priority: hold-to-look > mastery clear > slider (manual) > mode.
 * Visual recipe + interaction logic copied from the approved canvas artboards
 * (direction C "Look-through" + B's progress overlay).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { WhiteboardShellProps } from '../WhiteboardShell'
import CityBackdrop from './CityBackdrop'
import { buildingNameForTopic } from './cityNames'

export type GlassMode = 'focus' | 'demo' | 'city'

export interface GlassBoardShellProps extends WhiteboardShellProps {
  /** lesson/quiz topic (learningStore TOPICS id, e.g. 'normal') */
  topicId?: string
  /** e.g. slide 3 of 11 → floors */
  progress?: { done: number; total: number; label?: string }
  /** fired once when done reaches total */
  onMastered?: () => void
  /** 'focus' | 'demo' | 'city'; default 'focus' */
  defaultMode?: GlassMode
  /**
   * Quiz board only. When true the resting frost is REVEAL_REST_FROST (city
   * hidden while a question is open); each time `progress.done` increases the
   * glass briefly clears to REVEAL_FROST as an answer reward, then returns to
   * rest. Manual overrides (slider / mode / hold-to-look) still win. Default
   * false — the lesson board is unaffected.
   */
  revealOnProgress?: boolean
}

const MODE_FROST: Record<GlassMode, number> = { focus: 0.85, demo: 0.4, city: 0 }
const MODE_LABEL: Record<GlassMode, string> = { focus: 'מיקוד', demo: 'הדגמה', city: 'עיר' }
const MODE_TITLE: Record<GlassMode, string> = {
  focus: 'זכוכית חלבית — לכתיבה',
  demo: 'חצי שקוף — להדגמה על העיר',
  city: 'זכוכית שקופה — רואים את העיר',
}
const MODES: GlassMode[] = ['focus', 'demo', 'city']

const NAVY = '#122460'
const INK = '#1F3E6C'
const FROST_KEY = 'ws-glass-frost'
const MASTERY_CLEAR_MS = 1600
const REVEAL_REST_FROST = 0.92
const REVEAL_FROST = 0.4
const REVEAL_MS = 2600
const TOAST_MS = 3200
const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5C842'
const DEEP_NAVY = '#0B1B3E'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function readSessionFrost(): number | null {
  try {
    const raw = sessionStorage.getItem(FROST_KEY)
    if (raw === null) return null
    const n = Number(raw)
    return Number.isFinite(n) ? clamp01(n) : null
  } catch {
    return null
  }
}

function writeSessionFrost(t: number) {
  try {
    sessionStorage.setItem(FROST_KEY, t.toFixed(3))
  } catch {
    /* ignore */
  }
}

const pillStyle = {
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(255,255,255,0.62)',
  boxShadow: '0 8px 22px rgba(11,27,62,0.2)',
  borderRadius: 999,
} as const

const labelFont = { fontFamily: "'Rubik', sans-serif", fontSize: 12.5, fontWeight: 600 } as const

const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function ModeIcon({ mode }: { mode: GlassMode }) {
  if (mode === 'focus') {
    return (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    )
  }
  if (mode === 'demo') {
    return (
      <svg {...svgProps}>
        <path d="M7 4.5v15l12-7.5z" />
      </svg>
    )
  }
  return (
    <svg {...svgProps}>
      <path d="M3 21h18" />
      <path d="M5 21V8l5-3v16" />
      <path d="M10 21V11h6v10" />
      <path d="M16 21v-7l3 1v6" />
    </svg>
  )
}

export default function GlassBoardShell({
  children,
  style,
  topRightSlot,
  topicId,
  progress,
  onMastered,
  defaultMode = 'focus',
  revealOnProgress = false,
}: GlassBoardShellProps) {
  // Initial frost: the session's last value (if any) wins over the default mode.
  // If it matches a mode exactly that mode is lit; otherwise it's a manual override.
  const [mode, setMode] = useState<GlassMode | null>(() => {
    const stored = readSessionFrost()
    if (stored === null) return defaultMode
    const match = MODES.find(m => Math.abs(MODE_FROST[m] - stored) < 0.005)
    return match ?? null
  })
  const [manual, setManual] = useState<number | null>(() => {
    const stored = readSessionFrost()
    if (stored === null) return null
    const match = MODES.find(m => Math.abs(MODE_FROST[m] - stored) < 0.005)
    return match ? null : stored
  })
  const [peek, setPeek] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [masteryClear, setMasteryClear] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  // revealOnProgress: the temporary "answer reward" frost (null when at rest).
  const [autoReveal, setAutoReveal] = useState<number | null>(null)

  const trackRef = useRef<HTMLSpanElement | null>(null)
  const masteredFiredRef = useRef(false)
  const onMasteredRef = useRef(onMastered)
  // True only once the student explicitly clicks a mode pill in this mount —
  // distinguishes "mode chosen as an override" from `mode` merely holding its
  // initial default, so revealOnProgress's own resting frost isn't shadowed
  // by a mode nobody actually picked.
  const modePickedRef = useRef(false)
  const revealTimerRef = useRef<number | null>(null)
  // null until the first reveal-effect run establishes a baseline, so a board
  // that mounts mid-progress (done already > 0) doesn't fire a spurious reveal.
  const prevDoneRef = useRef<number | null>(null)
  onMasteredRef.current = onMastered

  const done = progress ? Math.max(0, progress.done) : 0
  const total = progress ? Math.max(0, progress.total) : 0
  const mastered = total > 0 && done >= total
  const buildingNameHe = buildingNameForTopic(topicId)

  // Mastery (single owner — CityBackdrop is presentational): clear the glass
  // for 1.6s, show the toast, fire onMastered once per mount/topic.
  useEffect(() => {
    if (!mastered) {
      masteredFiredRef.current = false
      return
    }
    if (masteredFiredRef.current) return
    masteredFiredRef.current = true
    setMasteryClear(true)
    setToastVisible(true)
    const clearId = window.setTimeout(() => setMasteryClear(false), MASTERY_CLEAR_MS)
    const toastId = window.setTimeout(() => setToastVisible(false), TOAST_MS)
    onMasteredRef.current?.()
    return () => {
      window.clearTimeout(clearId)
      window.clearTimeout(toastId)
    }
  }, [mastered, topicId])

  // revealOnProgress (quiz board): whenever `done` increases, open the glass
  // to REVEAL_FROST as an answer reward, then close it back to rest after
  // REVEAL_MS. One timer, owned by revealTimerRef; the effect's own cleanup
  // clears it both on unmount and before every re-trigger — no timers are
  // created during render.
  useEffect(() => {
    if (!revealOnProgress) return
    if (prevDoneRef.current !== null && done > prevDoneRef.current) {
      setAutoReveal(REVEAL_FROST)
      revealTimerRef.current = window.setTimeout(() => {
        setAutoReveal(null)
        revealTimerRef.current = null
      }, REVEAL_MS)
    }
    prevDoneRef.current = done
    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
    }
  }, [done, revealOnProgress])

  // A manual interaction (slider / mode pick / hold-to-look) cancels any
  // pending auto-return — the override already wins in `base` below, but
  // this also stops the stale timer from later clearing a value nobody is
  // showing anymore.
  const cancelAutoReveal = useCallback(() => {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
    setAutoReveal(null)
  }, [])

  const modeFrost = modePickedRef.current && mode !== null ? MODE_FROST[mode] : null
  const restFrost = revealOnProgress ? REVEAL_REST_FROST : MODE_FROST[mode ?? defaultMode]
  const autoFrost = revealOnProgress ? autoReveal : null
  const base = manual ?? modeFrost ?? autoFrost ?? restFrost
  const t = peek || masteryClear ? 0 : base

  // Persist the resting frost (not the transient peek / mastery clear), and
  // only once a slider drag has ended — not per pointermove.
  useEffect(() => {
    if (!dragging) writeSessionFrost(base)
  }, [base, dragging])

  // ── Frost slider (RTL track: inline-start is the right edge) ──────────────
  const frostFromEvent = useCallback((clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r || !r.width) return
    setManual(clamp01((r.right - clientX) / r.width))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => frostFromEvent(e.clientX)
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, frostFromEvent])

  const onTrackDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.preventDefault()
    // preventDefault suppresses focus; restore it so arrow keys work after a click (like a native range)
    trackRef.current?.focus()
    cancelAutoReveal()
    frostFromEvent(e.clientX)
    setDragging(true)
  }

  const nudge = (delta: number) => { cancelAutoReveal(); setManual(clamp01(Math.round((base + delta) * 100) / 100)) }

  const onTrackKey = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    // Track runs right→left, so ArrowLeft raises the frost (moves the thumb along the fill).
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); nudge(0.05) }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nudge(-0.05) }
    else if (e.key === 'Home') { e.preventDefault(); cancelAutoReveal(); setManual(0) }
    else if (e.key === 'End') { e.preventDefault(); cancelAutoReveal(); setManual(1) }
  }

  // ── Hold-to-look ──────────────────────────────────────────────────────────
  const onPeekDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
    cancelAutoReveal()
    setPeek(true)
  }
  const onPeekRelease = () => setPeek(false)
  const onPeekKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (e.repeat) return // one press = one toggle; holding the key must not flicker the glass
      cancelAutoReveal()
      setPeek(p => !p)
    }
  }

  const pickMode = (m: GlassMode) => () => { modePickedRef.current = true; cancelAutoReveal(); setMode(m); setManual(null) }

  // ── Derived visuals ───────────────────────────────────────────────────────
  const pct = Math.round(t * 100)
  // Extra milk above .5 only: מיקוד becomes a calm whiteboard, הדגמה/עיר stay see-through.
  const veilOpacity = (Math.max(0, (t - 0.5) / 0.5) * 0.3).toFixed(2)
  const guard = t < 0.3
  const guardSoft = !guard && t < 0.5
  // The lit segment is the chosen mode. When the slider / hold overrides it, the
  // segment nearest the live frost gets a thin gold underline instead.
  const overriding = peek || manual !== null
  const nearest: GlassMode = t >= 0.6 ? 'focus' : t >= 0.2 ? 'demo' : 'city'
  const active: GlassMode | null = manual !== null ? null : mode
  const glassTransition = dragging ? 'none' : undefined

  const inkClass = ['ws-glass-ink', guard ? 'ws-glass-ink--guard' : '', guardSoft ? 'ws-glass-ink--soft' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      dir="rtl"
      className="ws-glass-board"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 320,
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 16px 40px rgba(11,27,62,0.34), inset 0 1px 0 rgba(255,255,255,0.5)',
        ...style,
      }}
    >
      {/* World — the student's block. Parallax + world fade are applied once,
          inside CityBackdrop (driven by `frost`); this wrapper is a plain box. */}
      <div aria-hidden="true" className="ws-glass-world" style={{ position: 'absolute', inset: 0 }}>
        <CityBackdrop topicId={topicId} progress={progress} frost={t} mastered={mastered} />
      </div>

      {/* Glass — frost (blur + milk) driven by t */}
      <div
        aria-hidden="true"
        className="ws-glass-pane"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(155deg, rgba(255,255,255,0.5), rgba(214,230,255,0.3) 60%, rgba(255,255,255,0.4))',
          backdropFilter: `blur(${(t * 16).toFixed(1)}px) saturate(150%)`,
          WebkitBackdropFilter: `blur(${(t * 16).toFixed(1)}px) saturate(150%)`,
          opacity: 0.25 + 0.75 * t,
          transition: glassTransition ?? 'opacity 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: '#fff',
          opacity: Number(veilOpacity),
          transition: glassTransition ?? 'opacity 0.35s ease',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '58%',
          height: '44%',
          pointerEvents: 'none',
          background: 'linear-gradient(215deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)',
          opacity: 0.25 + 0.75 * t,
          transition: glassTransition ?? 'opacity 0.35s ease',
        }}
      />
      <div
        aria-hidden="true"
        className="ws-glass-dots"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.7,
        }}
      />

      {/* Ink column — same geometry as WhiteboardShell's content column, with
          room for the dock at the bottom. The legibility guard (backplate +
          etched text) is CSS-driven via the modifier classes (index.css). */}
      <div
        className={inkClass}
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          right: 28,
          bottom: 108,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        {topRightSlot && (
          // paddingInlineEnd clears the mode control (left:30, ~250px wide) so a
          // slot item pushed to inline-end (the quiz's 'שאלה N / M' counter) is not drawn under it
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-start', marginBottom: 10, minHeight: 22, paddingInlineEnd: 260 }}>
            {topRightSlot}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>

      {/* Mastery toast — top-centre, a sibling of the ink column (NOT inside the
          aria-hidden world) so role="status" is actually announced. */}
      {toastVisible && buildingNameHe && (
        <div
          role="status"
          dir="rtl"
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            padding: '10px 18px',
            borderRadius: 24,
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
            color: DEEP_NAVY,
            fontFamily: "'Rubik', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 10px 26px rgba(11,27,62,0.28), inset 0 1px 0 rgba(255,255,255,0.55)',
            animation: 'ws-glass-toast-in .35s ease-out',
          }}
        >
          <style>{`@keyframes ws-glass-toast-in { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
          {`${buildingNameHe} הושלם — העיר שלך גדלה`}
        </div>
      )}

      {/* Modes — segmented glass control, top-left (never touches the breadcrumb on the right) */}
      <div
        role="group"
        aria-label="מצב הזכוכית"
        style={{
          position: 'absolute',
          left: 30,
          top: 24,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 4,
          ...pillStyle,
        }}
      >
        {MODES.map(m => {
          const lit = active === m
          const near = overriding && nearest === m && !lit
          return (
            <button
              key={m}
              type="button"
              className="ws-glass-seg"
              data-near={near ? 'true' : undefined}
              aria-pressed={lit}
              title={MODE_TITLE[m]}
              onClick={pickMode(m)}
              style={{
                position: 'relative',
                height: 36,
                padding: '0 14px 0 12px',
                border: 0,
                borderRadius: 999,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                ...labelFont,
                background: lit ? NAVY : 'transparent',
                color: lit ? '#fff' : INK,
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              <ModeIcon mode={m} />
              <span>{MODE_LABEL[m]}</span>
            </button>
          )
        })}
      </div>

      {/* Dock — bottom-left, clear of the tutor FAB: frost slider + hold-to-look */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: 96,
          bottom: 24,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Frost slider — the manual override; dragging it leaves the mode unlit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 44,
            padding: '0 14px',
            touchAction: 'none',
            userSelect: 'none',
            ...pillStyle,
          }}
        >
          <svg {...svgProps} width={20} height={20} stroke={INK}>
            <path d="M12 3v18" />
            <path d="M4.5 7.5 19.5 16.5" />
            <path d="M19.5 7.5 4.5 16.5" />
            <path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2" />
          </svg>
          <span style={{ ...labelFont, color: INK, whiteSpace: 'nowrap' }}>שקיפות הזכוכית</span>
          <span
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="שקיפות הזכוכית"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={`${pct}%`}
            onPointerDown={onTrackDown}
            onKeyDown={onTrackKey}
            className="ws-glass-track"
            style={{ width: 84, height: 16, display: 'flex', alignItems: 'center', position: 'relative', cursor: 'ew-resize', borderRadius: 8 }}
          >
            <span style={{ position: 'absolute', insetInline: 0, top: 6, height: 5, borderRadius: 999, background: 'rgba(31,62,108,0.18)' }} />
            <span
              style={{
                position: 'absolute',
                insetInlineStart: 0,
                top: 6,
                height: 5,
                borderRadius: 999,
                background: '#3351CA',
                width: `${pct}%`,
                transition: glassTransition ?? 'width 0.35s ease',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: 1,
                insetInlineStart: `${pct}%`,
                width: 14,
                height: 14,
                marginInlineStart: -7,
                borderRadius: 999,
                background: '#fff',
                border: '1px solid rgba(31,62,108,0.3)',
                boxShadow: '0 2px 6px rgba(11,27,62,0.28)',
                transition: glassTransition ?? 'inset-inline-start 0.35s ease',
              }}
            />
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11.5,
              fontWeight: 600,
              color: '#465CA5',
              fontVariantNumeric: 'tabular-nums',
              width: 30,
              textAlign: 'left',
            }}
          >
            {pct}%
          </span>
        </div>

        {/* Press-and-hold to look through (Space/Enter toggles for keyboard users) */}
        <button
          type="button"
          aria-label="החזק כדי להביט דרך הזכוכית"
          aria-pressed={peek}
          onPointerDown={onPeekDown}
          onPointerUp={onPeekRelease}
          onPointerCancel={onPeekRelease}
          onLostPointerCapture={onPeekRelease}
          onKeyDown={onPeekKey}
          onBlur={onPeekRelease}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 44,
            padding: '0 16px 0 10px',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            ...labelFont,
            ...pillStyle,
            background: peek ? NAVY : pillStyle.background,
            color: peek ? '#fff' : INK,
            transition: 'background 0.2s, color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: peek ? 'rgba(255,255,255,0.16)' : 'rgba(51,81,202,0.12)',
              transition: 'background 0.2s',
            }}
          >
            <svg {...svgProps} width={20} height={20}>
              <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <span>{peek ? 'מביט בעיר…' : 'החזק כדי להביט'}</span>
        </button>
      </div>
    </div>
  )
}
