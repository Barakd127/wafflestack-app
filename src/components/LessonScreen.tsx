import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { LESSON_CONTENT } from '../data/lesson-content'
import { TOPIC_VISUALS } from './LessonVisuals'
import ArsenalCapture from './ArsenalCapture'
import { quickAddToMindmap } from '../lib/mindmapWriter'
import { MathLineBlock } from '../lib/mathRender'

// Design tokens — keep in sync with StudyHub.tsx
const GLASS_CARD  = 'var(--sh-glass-card)'
const CARD_SHADOW = 'var(--sh-card-shadow)'
const CARD_RADIUS = 24
const BUTTON_COLOR = 'var(--sh-btn-color)'
const TEXT_DARK   = 'var(--sh-text-dark)'
const TEXT_MED    = 'var(--sh-text-med)'
const TEXT_LIGHT  = 'var(--sh-text-light)'

interface LessonScreenProps {
  topicId: string
  onStartQuiz: () => void
  onBack: () => void
  onComplete: (topicId: string) => void
  graphSlides?: Array<{ Component: React.ComponentType; title: string; afterSlide?: number }>
}

export default function LessonScreen({ topicId, onStartQuiz, onBack, onComplete, graphSlides }: LessonScreenProps) {
  const lesson = LESSON_CONTENT.find(t => t.id === topicId)
  const [currentSlide, setCurrentSlide] = useState(0)
  // Theory defaults to FULL-SCREEN. User opens the side mind map explicitly
  // via the toggle when they want to take notes alongside the lesson.
  const [mindmapOpen, setMindmapOpen] = useState(false)
  const [splitPct, setSplitPct] = useState(45)  // mind map width %
  const [copied, setCopied] = useState<string | null>(null)
  // Transient toast shown after queuing/adding a node to the mind map. Gives
  // clear feedback even when the split is NOT open (per user 2026-05-30).
  const [mapToast, setMapToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showMapToast = (msg: string) => {
    setMapToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setMapToast(null), 2200)
  }
  const completedRef = useRef(false)
  const mindmapRef = useRef<HTMLIFrameElement>(null)
  const draggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Publish current topic so the WaffleStack formula keyboard tab can
  // filter chips to topic-relevant formulas. Cleared on unmount so
  // returning to StudyHub / Arsenal shows the full library again.
  useEffect(() => {
    try { localStorage.setItem('wafflestack-current-topic', topicId) } catch { /* quota */ }
    window.dispatchEvent(new CustomEvent('ws-current-topic-changed'))
    return () => {
      try { localStorage.removeItem('wafflestack-current-topic') } catch { /* ignore */ }
      window.dispatchEvent(new CustomEvent('ws-current-topic-changed'))
    }
  }, [topicId])

  const slides = lesson?.slides ?? []
  const lessonTotal = slides.length
  // Default 100% — per user feedback 2026-05-24. Was 0.7 which compressed
  // interactive visuals into unreadable thumbnails on first render.
  const [graphScale, setGraphScale] = useState(1.0)

  // Auto-inject TOPIC_VISUALS[topicId] as a synthetic graph card so every
  // topic's "lesson visual" becomes a standalone carousel slide instead of
  // an appendix rendered below every lesson card. Matches the mean topic
  // pattern. Appended to the explicit graphSlides; auto-positioned by the
  // distribution logic below (no afterSlide).
  const effectiveGraphs = useMemo(() => {
    const TopicVisual = TOPIC_VISUALS[topicId] as React.FC | undefined
    const base = graphSlides ?? []
    if (!TopicVisual) return base
    // Skip if user already added this Visual as an explicit graph entry
    const alreadyIncluded = base.some(g => g.Component === TopicVisual)
    if (alreadyIncluded) return base
    return [...base, { Component: TopicVisual as React.ComponentType, title: 'ויזואליזציה' }]
  }, [graphSlides, topicId])

  // Build merged sequence: lesson slide → optional graph(s) inserted after it.
  // Graphs with explicit `afterSlide` are placed exactly there. Graphs without
  // are auto-distributed evenly across the lesson so every topic gets the same
  // "graph-as-its-own-card, woven between lesson slides" treatment without
  // requiring per-topic afterSlide config.
  type SlideRef = { kind: 'lesson'; lessonIdx: number } | { kind: 'graph'; graphIdx: number }
  const mergedSequence: SlideRef[] = useMemo(() => {
    const out: SlideRef[] = []
    // Auto-position: distribute unpositioned graphs evenly through the lesson.
    // For N graphs and M lesson slides, step = floor(M / (N+1)); graph k goes
    // after slide (k+1)*step. Last graph clamped to lesson end so it never
    // falls past the last lesson slide.
    const autoPositions = new Map<number, number[]>()
    if (effectiveGraphs && lessonTotal > 0) {
      const unpositioned = effectiveGraphs
        .map((g, gi) => ({ g, gi }))
        .filter(x => x.g.afterSlide == null || x.g.afterSlide < 0 || x.g.afterSlide >= lessonTotal)
      if (unpositioned.length > 0) {
        const step = Math.max(1, Math.floor(lessonTotal / (unpositioned.length + 1)))
        unpositioned.forEach((x, k) => {
          const pos = Math.min(lessonTotal - 1, (k + 1) * step)
          if (!autoPositions.has(pos)) autoPositions.set(pos, [])
          autoPositions.get(pos)!.push(x.gi)
        })
      }
    }
    slides.forEach((_, i) => {
      out.push({ kind: 'lesson', lessonIdx: i })
      // Explicit afterSlide entries
      effectiveGraphs?.forEach((g, gi) => {
        if (g.afterSlide === i) out.push({ kind: 'graph', graphIdx: gi })
      })
      // Auto-positioned entries
      autoPositions.get(i)?.forEach(gi => {
        out.push({ kind: 'graph', graphIdx: gi })
      })
    })
    return out
  }, [lessonTotal, effectiveGraphs])

  const total = mergedSequence.length
  const currentRef = mergedSequence[currentSlide]
  const isGraphSlide = currentRef?.kind === 'graph'
  const isFirst = currentSlide === 0
  const isLast = total > 0 && currentSlide === total - 1
  const graphIdx = isGraphSlide ? (currentRef as { kind: 'graph'; graphIdx: number }).graphIdx : -1

  // userId for the mindmap iframe — keeps each profile's map separate
  const userId = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'

  const handleStartQuiz = (markComplete: boolean) => {
    if (markComplete && !completedRef.current) {
      completedRef.current = true
      onComplete(topicId)
    }
    onStartQuiz()
  }

  const handleNext = () => {
    if (isLast) handleStartQuiz(true)
    else setCurrentSlide(s => Math.min(total - 1, s + 1))
  }
  const handlePrev = () => setCurrentSlide(s => Math.max(0, s - 1))

  // Pending insertion (waiting for the user to choose connect-mode in the modal).
  // null while the modal is closed; populated when the user clicks "add to map".
  const [pendingInsert, setPendingInsert] = useState<
    { text: string; kind: 'text' | 'equation'; sourceLabel: 'formula' | 'title' } | null
  >(null)

  // Send a node into the mind map via postMessage. Equations render as KaTeX nodes.
  // `connectMode`:
  //   'central' → child of the ROOT central topic
  //   'current' → child of the currently-selected node (fallback root)
  //   'free'    → disconnected node (user connects later)
  // ('connected' kept as a legacy alias for 'central'.)
  const sendToMindMap = (
    text: string,
    kind: 'text' | 'equation' = 'text',
    connectMode: 'central' | 'current' | 'free' | 'connected' = 'central',
  ) => {
    const win = mindmapRef.current?.contentWindow
    if (!win) return false
    const payload = kind === 'equation'
      ? { type: 'ws-add-node', kind, latex: text, text, connectMode }
      : { type: 'ws-add-node', kind, text, connectMode }
    // Use window.location.origin instead of '*' so the postMessage only
    // reaches our own iframe (same-origin /mindmap.html). Prevents leaking
    // payload if iframe is ever swapped to a foreign URL.
    try { win.postMessage(payload, window.location.origin); return true } catch { return false }
  }

  // Confirm the chooser: complete the pending insert with the user's choice.
  // Two transport paths:
  //  (a) Live postMessage — when the mindmap iframe is already mounted.
  //  (b) localStorage queue — when iframe is closed/not yet mounted. The
  //      mindmap.html drains the queue on load. User no longer needs to
  //      open the split first. Per user 2026-05-24.
  const confirmInsert = (mode: 'central' | 'current' | 'free') => {
    if (!pendingInsert) return
    const { text, kind, sourceLabel } = pendingInsert
    setPendingInsert(null)

    // Always queue to localStorage so the equation lands eventually even
    // when the iframe never opens during this session (it'll be picked up
    // next time the user visits the mindmap).
    try {
      const KEY = 'wafflestack-mm-pending-adds'
      const raw = localStorage.getItem(KEY)
      const queue = raw ? JSON.parse(raw) : []
      queue.push({ kind, text, latex: kind === 'equation' ? text : undefined, connectMode: mode, ts: Date.now() })
      localStorage.setItem(KEY, JSON.stringify(queue.slice(-50)))  // cap at 50
    } catch { /* localStorage full / disabled — ignore */ }

    // Also try live postMessage if the iframe IS already mounted; gives instant feedback.
    // Either way, queue above guarantees the node lands when the map next opens,
    // so we always show the success toast regardless of split state.
    if (mindmapOpen) sendToMindMap(text, kind, mode)
    setCopied(sourceLabel)
    setTimeout(() => setCopied(null), 1500)
    showMapToast('נוסף למפה שלי')
  }

  const handleCopyFormula = (formula: string) => {
    setPendingInsert({ text: formula, kind: 'equation', sourceLabel: 'formula' })
  }

  const handleCopyTitle = () => {
    const slide = slides[currentSlide]
    if (!slide) return
    setPendingInsert({ text: slide.title, kind: 'text', sourceLabel: 'title' })
  }

  // Drag-to-resize the split
  const onMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true
    e.preventDefault()
    const updateFromClientX = (clientX: number) => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // RTL: the mind map is on the LEFT (visually) but in DOM order it's first child;
      // because the wrapper is dir="ltr" the percentage maps directly to clientX.
      const pct = ((clientX - rect.left) / rect.width) * 100
      setSplitPct(Math.max(20, Math.min(70, pct)))
    }
    const onMove = (ev: MouseEvent) => updateFromClientX(ev.clientX)
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length < 1) return
      ev.preventDefault()
      updateFromClientX(ev.touches[0].clientX)
    }
    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    window.addEventListener('touchcancel', onUp)
  }

  // Touch start handler for the splitter handle (mirrors onMouseDown).
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    draggingRef.current = true
    const startX = e.touches[0].clientX
    // Bootstrap the move loop by synthesising an initial move
    const evInit = { clientX: startX, preventDefault: () => {} } as React.MouseEvent
    onMouseDown(evInit)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrow keys when typing in the mind map iframe
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'IFRAME') return
      if (e.key === 'ArrowLeft') handleNext()           // RTL: left arrow = forward
      else if (e.key === 'ArrowRight') handlePrev()
      else if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentSlide, isLast, total])

  // Graceful fallback when no lesson is authored yet
  if (!lesson || total === 0) {
    return (
      <div data-tour="theory-screen" dir="rtl" style={{ flex: 1, overflow: 'auto', padding: '32px 40px', fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
        <button onClick={onBack} style={backLinkStyle}>→ חזרה לבחירת נושא</button>
        <div style={{ ...glassCardStyle, padding: 40, marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 12 }}>
            תוכן לימוד עבור נושא זה עדיין בהכנה
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 15, color: TEXT_LIGHT, marginBottom: 24 }}>
            ניתן לעבור ישירות לתרגול ולחזור מאוחר יותר.
          </div>
          <button onClick={onStartQuiz} style={primaryBtnStyle}>📝 המשך לתרגול</button>
        </div>
      </div>
    )
  }

  const lessonIdx = currentRef?.kind === 'lesson' ? currentRef.lessonIdx : 0
  const slide = slides[lessonIdx] ?? slides[0]
  // Slides may override the topic-level visual via `visualId` — used by the
  // probability lesson to attach distinct Venn variants to specific slides.
  // Per-slide Visual: only when slide explicitly sets visualId (e.g. probability
  // Venn variants). Topic-level visual moved to effectiveGraphs as carousel card.
  const SlideVisual = (!isGraphSlide && slide && slide.visualId)
    ? TOPIC_VISUALS[slide.visualId] as React.FC | undefined
    : undefined

  // ── Right-side content (slide + visualization + footer) ─────────────────────
  const rightPaneRef = useRef<HTMLDivElement>(null)
  // Scroll to top whenever the slide changes so slide card is always visible first
  useEffect(() => { rightPaneRef.current?.scrollTo({ top: 0 }) }, [currentSlide])

  const rightPane = (
    <div ref={rightPaneRef} dir="rtl" className="ws-lesson-rightpane" style={{
      flex: 1, overflow: 'auto', padding: '24px 28px',
      fontFamily: "'Rubik', 'Assistant', sans-serif",
    }}>
      {/* Floating "save to arsenal" chip listens at document level */}
      <ArsenalCapture />

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={backLinkStyle}>→ חזרה לבחירת נושא</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setMindmapOpen(v => !v)}
            title={mindmapOpen ? 'הסתר מפת מושגים' : 'הצג מפת מושגים'}
            style={mindmapToggleStyle(mindmapOpen)}
          >
            🧠 {mindmapOpen ? 'הסתר מפה' : 'הצג מפה'}
          </button>
          <button onClick={() => handleStartQuiz(false)} style={skipLinkStyle}>דלג לתרגול ←</button>
        </div>
      </div>

      {/* Title row with copy-to-mindmap action */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4, gap: 12 }}>
        <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: 0, textAlign: 'right' }}>
          📚 {lesson.hebrewName}
        </h2>
        {mindmapOpen && (
          <button
            onClick={handleCopyTitle}
            title="הוסף את כותרת השקופית למפת המושגים"
            style={copyChipStyle(copied === 'title')}
          >
            {copied === 'title' ? '✓ נוסף' : '🧠+ הוסף למפה'}
          </button>
        )}
      </div>
      {/* ── Slide navigation strip — clearly labeled prev/next at the top
          of the card. Sticks to the top of the scroll container so it's
          always visible without scrolling. RTL-aware: 'הקודם' on the right
          (where the user reads from), 'הבא' on the left. ─────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, marginBottom: 14, padding: '10px 14px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(127,155,217,0.30)',
        borderRadius: 14,
        boxShadow: '0 4px 14px rgba(31,62,108,0.10)',
      }}>
        <button
          onClick={handlePrev}
          disabled={isFirst}
          aria-label="שקופית קודמת"
          title="הקודם (חץ ימני)"
          style={{
            background: isFirst ? 'rgba(127,155,217,0.12)' : 'rgba(127,155,217,0.20)',
            color: isFirst ? TEXT_LIGHT : BUTTON_COLOR,
            border: `1.5px solid ${isFirst ? 'rgba(127,155,217,0.25)' : 'rgba(127,155,217,0.45)'}`,
            borderRadius: 10, padding: '8px 18px',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 700,
            fontFamily: "'Rubik', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: isFirst ? 0.55 : 1,
            transition: 'all 0.18s',
          }}
        >
          → הקודם
        </button>
        <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>
          {isGraphSlide && effectiveGraphs
            ? `📊 ${effectiveGraphs[graphIdx]?.title ?? 'גרף'}`
            : `שקופית ${currentSlide + 1} מתוך ${total}`}
        </div>
        <button
          onClick={handleNext}
          aria-label={isLast ? 'התחל תרגול' : 'שקופית הבאה'}
          title={isLast ? 'התחל תרגול' : 'הבא (חץ שמאלי)'}
          style={{
            background: isLast ? '#D4AF37' : BUTTON_COLOR,
            color: '#fff',
            border: 'none',
            borderRadius: 10, padding: '8px 20px',
            cursor: 'pointer',
            fontSize: 14, fontWeight: 700,
            fontFamily: "'Rubik', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: isLast ? '0 4px 14px rgba(212,175,55,0.45)' : '0 4px 14px rgba(31,62,108,0.30)',
            transition: 'all 0.18s',
          }}
        >
          {isLast ? 'התחל תרגול ✓' : 'הבא ←'}
        </button>
      </div>

      {!isGraphSlide && (
      <>{/* Slide card — theory is the heart of the lesson, give it presence */}
      <div
        data-arsenal-source="slide"
        data-arsenal-topic={topicId}
        className="ws-lesson-card"
        style={{
          ...glassCardStyle,
          padding: '40px 48px',
          marginBottom: 22,
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
          <h3 style={{
            fontFamily: "'Rubik', sans-serif", fontSize: 30, fontWeight: 700,
            color: TEXT_DARK, marginTop: 0, marginBottom: 0, textAlign: 'right',
            lineHeight: 1.3, letterSpacing: '-0.01em', flex: 1,
          }}>
            {slide.title}
          </h3>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 6 }}>
            <button
              onClick={() => {
                const ok = quickAddToMindmap({
                  text: slide.title,
                  body: typeof slide.content === 'string' ? slide.content : '',
                  iframeWindow: mindmapRef.current?.contentWindow ?? null,
                  userId,
                })
                if (ok) { setCopied('title-mm'); setTimeout(() => setCopied(null), 1500) }
              }}
              title="הוסף את הכותרת והתוכן למפת החשיבה"
              style={{
                background: copied === 'title-mm' ? 'rgba(52,168,83,0.18)' : 'rgba(99,102,241,0.10)',
                border: `1.5px solid ${copied === 'title-mm' ? 'rgba(52,168,83,0.5)' : 'rgba(99,102,241,0.3)'}`,
                color: copied === 'title-mm' ? '#34A853' : '#6366f1',
                borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {copied === 'title-mm' ? '✓ נוסף' : '🧠+ למפה'}
            </button>
            <button
              onClick={() => {
                const ok = quickAddToMindmap({
                  text: slide.title,
                  body: typeof slide.content === 'string' ? slide.content : '',
                  userId,
                })
                if (ok) { setCopied('title-nb'); setTimeout(() => setCopied(null), 1500) }
              }}
              title="הוסף כדף חדש במחברת (אותו עץ, תצוגת מחברת)"
              style={{
                background: copied === 'title-nb' ? 'rgba(52,168,83,0.18)' : 'rgba(245,158,11,0.10)',
                border: `1.5px solid ${copied === 'title-nb' ? 'rgba(52,168,83,0.5)' : 'rgba(245,158,11,0.35)'}`,
                color: copied === 'title-nb' ? '#34A853' : '#b45309',
                borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {copied === 'title-nb' ? '✓ נוסף' : '📔+ למחברת'}
            </button>
          </div>
        </div>
        {(() => {
          // Auto-split prose into numbered bullets so every slide reads
          // like a high-production-value card. Sentences are split on
          // periods that are followed by whitespace; sequences shorter
          // than ~12 chars (e.g. "x̄.") are merged with the previous one
          // so we don't fragment formulas. Slides that are already short
          // (< 80 chars) render as a single big bullet.
          const raw = String(slide.content || '').trim()
          // Split prose into sentence bullets, but NEVER split inside a `$…$`
          // math span — factorial "!", ellipsis "...", and "." inside LaTeX must
          // not break the pair (else the `$` go unbalanced and KaTeX can't render,
          // leaking raw "\cdot"/"$"). A boundary is a [.!?] + whitespace seen while
          // an even number of `$` precede it (i.e. we are outside math).
          const splitSentences = (s: string): string[] => {
            const out: string[] = []
            let last = 0, dollars = 0
            for (let i = 0; i < s.length; i++) {
              if (s[i] === '$') dollars++
              if (dollars % 2 === 0 && /[.!?]/.test(s[i]) && i + 1 < s.length && /\s/.test(s[i + 1])) {
                let j = i + 1
                while (j < s.length && /\s/.test(s[j])) j++
                out.push(s.slice(last, i + 1))
                last = j; i = j - 1
              }
            }
            if (last < s.length) out.push(s.slice(last))
            return out
          }
          const parts = raw.length < 80
            ? [raw]
            : splitSentences(raw).reduce((acc: string[], s) => {
                const t = s.trim(); if (!t) return acc
                if (acc.length && t.length < 12) acc[acc.length - 1] += ' ' + t
                else acc.push(t)
                return acc
              }, [])
          return (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              fontFamily: "'Assistant', sans-serif", textAlign: 'right',
              flex: 1,
            }}>
              {parts.map((bullet, i) => (
                <div
                  key={i}
                  className="ws-lesson-bullet"
                  style={{
                    // Parent has dir="rtl"; flex-direction: row places the
                    // first child (the accent chevron) on the RIGHT in Hebrew.
                    // No more numbered-circle chips — those read as multiple-
                    // choice quiz options. A small gold ▸ + left-border accent
                    // makes the bullet feel like a study-guide point.
                    display: 'flex', flexDirection: 'row', gap: 14,
                    alignItems: 'flex-start',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.045), rgba(99,102,241,0.015))',
                    borderInlineStart: '3px solid #FFD700',
                    border: '1px solid rgba(127,155,217,0.20)',
                    borderRadius: 14, padding: '14px 18px',
                    boxShadow: '0 2px 8px rgba(31,62,108,0.04)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(31,62,108,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(31,62,108,0.04)' }}
                >
                  <div style={{
                    flexShrink: 0,
                    width: 20, height: 20,
                    display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    marginTop: 5,
                    opacity: 0.85,
                  }} aria-hidden="true">
                    {/* Round Belgian waffle bullet — premium honey gradient,
                        ink outline, real cell pits. Matches v4 brand direction
                        (concept 01 from the brand system). Replaces the prior
                        flat 3x3-grid square rect per user feedback 2026-05-24. */}
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <defs>
                        <radialGradient id="waffle-bullet-grad" cx="0.42" cy="0.35" r="0.7">
                          <stop offset="0" stopColor="#FFE3A8"/>
                          <stop offset="0.55" stopColor="#F2A93E"/>
                          <stop offset="1" stopColor="#C97C18"/>
                        </radialGradient>
                      </defs>
                      <ellipse cx="10" cy="11.5" rx="8.5" ry="7.2" fill="#A36418" stroke="#1A1A2E" strokeWidth="0.9"/>
                      <ellipse cx="10" cy="10.5" rx="8.5" ry="7.2" fill="url(#waffle-bullet-grad)" stroke="#1A1A2E" strokeWidth="0.9"/>
                      <g stroke="#1A1A2E" strokeWidth="0.55" opacity="0.55">
                        <line x1="2" y1="10.5" x2="18" y2="10.5"/>
                        <line x1="10" y1="3.5" x2="10" y2="17.5"/>
                        <line x1="5.5" y1="5.5" x2="5.5" y2="15.5"/>
                        <line x1="14.5" y1="5.5" x2="14.5" y2="15.5"/>
                      </g>
                      <ellipse cx="7" cy="6.5" rx="3.5" ry="1.4" fill="#FFE3A8" opacity="0.55"/>
                    </svg>
                  </div>
                  {/* MathLineBlock renders each line in RTL flow; inline math
                      ($…$ or auto-detected) stays LTR + bidi-isolated so Hebrew
                      never flips and operators never mirror. The renderer owns
                      direction per line — no unicodeBidi override here. */}
                  <MathLineBlock
                    text={bullet}
                    style={{
                      flex: 1, minWidth: 0,
                      fontSize: 18.5, lineHeight: 1.85, color: TEXT_DARK,
                      whiteSpace: 'pre-wrap',
                      textAlign: 'right',
                    }}
                  />
                </div>
              ))}
            </div>
          )
        })()}
        {slide.formula && (
          <div style={{ position: 'relative', marginTop: 24 }}>
            <div className="ws-lesson-formula" style={{
              background: 'rgba(127,155,217,0.12)',
              border: '1px solid rgba(127,155,217,0.3)',
              borderRadius: 14,
              padding: '24px 22px',
              direction: 'ltr',
              textAlign: 'center',
              minHeight: 72,
              fontSize: 22,
              color: TEXT_DARK,
            }}>
              <KatexFormula latex={slide.formula} />
            </div>
            {/* Always available — even without an open split. confirmInsert
                queues to localStorage so the mindmap drains it on next open.
                Per user 2026-05-30: add formulas to my map without split-screen. */}
            <button
              className="ws-formula-copy"
              onClick={() => handleCopyFormula(slide.formula!)}
              title="הוסף את הנוסחה למפה שלי"
              style={formulaCopyBtnStyle(copied === 'formula')}
            >
              {copied === 'formula' ? '✓' : '➕'}
              <span className="cm-label">{copied === 'formula' ? 'נוסף' : 'הוסף למפה'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Per-slide Visual auto-render REMOVED — TOPIC_VISUALS[topicId] now
          injected as a standalone carousel card via effectiveGraphs (matches
          mean topic pattern). Visuals tied to specific slides via slide.visualId
          (e.g. probability Venn variants) still render via that path below. */}
      {SlideVisual && (<div><SlideVisual /></div>)}
      </>)}

      {/* Graph slide — rendered for graph entries in the merged sequence */}
      {isGraphSlide && effectiveGraphs && effectiveGraphs[graphIdx] && (
        <div style={{
          // Issue 5: transparent-ish wrapper so graphs blend into lesson theme
          // (navy on dark, cream on light). Keeps the gold border accent.
          background: 'rgba(11,27,62,0.06)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: 18,
          padding: '20px 18px',
          marginTop: 12,
          boxShadow: '0 4px 18px rgba(31,62,108,0.10)',
        }}>
          {/* Zoom controls */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginBottom: 10, paddingBottom: 10,
            borderBottom: '1px solid rgba(212,175,55,0.25)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sh-text-dark)', fontFamily: "'Rubik', sans-serif" }}>
              📊 {effectiveGraphs[graphIdx].title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setGraphScale(s => Math.max(0.4, +(s - 0.1).toFixed(2)))}
                aria-label="הקטן גרף"
                title="הקטן"
                style={{
                  background: 'rgba(31,62,108,0.08)', border: '1px solid rgba(31,62,108,0.25)',
                  color: 'var(--sh-text-dark)', borderRadius: 8, width: 30, height: 30,
                  cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1,
                }}
              >−</button>
              <span style={{ fontSize: 12, color: 'var(--sh-text-dark)', minWidth: 40, textAlign: 'center', fontFamily: "'Assistant', sans-serif" }}>
                {Math.round(graphScale * 100)}%
              </span>
              <button
                onClick={() => setGraphScale(s => Math.min(1.4, +(s + 0.1).toFixed(2)))}
                aria-label="הגדל גרף"
                title="הגדל"
                style={{
                  background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.5)',
                  color: 'var(--sh-text-dark)', borderRadius: 8, width: 30, height: 30,
                  cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1,
                }}
              >+</button>
              <button
                onClick={() => setGraphScale(1.0)}
                aria-label="ברירת מחדל"
                title="גודל ברירת מחדל"
                style={{
                  background: 'transparent', border: '1px solid rgba(212,175,55,0.45)',
                  color: 'var(--sh-text-dark)', borderRadius: 8, padding: '4px 10px',
                  cursor: 'pointer', fontSize: 11, fontFamily: "'Assistant', sans-serif",
                  marginInlineStart: 4,
                }}
              >איפוס</button>
            </div>
          </div>
          {/* Scaled graph container */}
          <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              transform: `scale(${graphScale})`,
              transformOrigin: 'top center',
              width: `${100 / graphScale}%`,
              height: 'auto',
            }}>
              <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: 'rgba(127,155,217,0.7)' }}>טוען גרף אינטראקטיבי…</div>}>
                {(() => { const G = effectiveGraphs[graphIdx].Component; return <G /> })()}
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Footer controls — dots for ALL slides (lesson + graph) */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: total }).map((_, idx) => {
          const isGraph = mergedSequence[idx]?.kind === 'graph'
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`עבור לשקופית ${idx + 1}`}
              style={{
                width: idx === currentSlide ? 14 : 10,
                height: idx === currentSlide ? 14 : 10,
                borderRadius: '50%',
                background: idx === currentSlide
                  ? (isGraph ? '#D4AF37' : BUTTON_COLOR)
                  : (isGraph ? 'rgba(212,175,55,0.4)' : 'rgba(127,155,217,0.35)'),
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
              }}
            />
          )
        })}
      </div>

      {/* Floating side-arrows removed — replaced by labeled prev/next buttons
          in the sticky strip at the top of the slide card (above). The strip
          stays visible regardless of scroll, and 'הקודם' / 'הבא' labels make
          the function unambiguous. */}
      {/* Formula copy button. Label is ALWAYS visible (was hover-only → showed a
          bare purple ➕ that users found cryptic). Per user 2026-06-07. */}
      <style>{`
        .ws-formula-copy { transition: all 0.2s ease; }
        .ws-formula-copy:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.4) !important; }
        .ws-formula-copy .cm-label {
          max-width: 160px; opacity: 1; margin-inline-start: 6px;
          overflow: hidden; white-space: nowrap; display: inline-block;
        }
      `}</style>
    </div>
  )

  // ── Single-pane fallback (mind map closed or mobile) ────────────────────────
  if (!mindmapOpen || isMobile) {
    return rightPane
  }

  // ── Split layout (mind map on the left in LTR DOM, RTL still works) ─────────
  return (
    <div ref={containerRef} data-tour="theory-screen" dir="ltr" style={{
      flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0,
      background: 'transparent',
    }}>
      {/* Mind map iframe — left side (LTR-first child) */}
      <div className="ws-lesson-mindmap-pane" style={{ width: `${splitPct}%`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <iframe
          ref={mindmapRef}
          src={`${import.meta.env.BASE_URL}mindmap.html?v=mm17-20260630&mode=mm&userId=${encodeURIComponent(userId)}&topic=${encodeURIComponent(topicId)}`}
          title="Mind Map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fafbff' }}
        />
        {/* The redundant "מפת המושגים שלי" chip used to sit here — removed
            because in RTL its top:right:12 anchor flipped to the LEFT visual
            edge and obscured the iframe's topbar buttons. Mind map is its
            own iframe, the user knows what they're looking at. */}
      </div>

      {/* Resize handle — mouse + touch */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="גרור לשינוי רוחב פאנל המפה"
        title="גרור לשינוי הרוחב"
        style={{
          width: 5, flexShrink: 0,
          background: 'rgba(99,102,241,0.18)',
          cursor: 'col-resize',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.18)' }}
      >
        <div style={{ width: 2, height: 36, borderRadius: 2, background: 'rgba(165,180,252,0.7)' }} />
      </div>

      {/* Lesson content — right side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {rightPane}
      </div>

      {/* ── Chooser modal: when adding to mindmap, ask whether to connect or
            create a free-floating node. Pedagogically: encourages the user to
            think about WHERE this concept fits before committing. ────────── */}
      {pendingInsert && (
        <div
          dir="rtl"
          onClick={() => setPendingInsert(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(13,22,40,0.62)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 18, padding: '24px 28px',
              maxWidth: 460, width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              border: '1px solid rgba(127,155,217,0.30)',
              fontFamily: "'Rubik','Assistant',sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🧠</span>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT_DARK }}>
                איך להוסיף למפת חשיבה?
              </h3>
            </div>
            <p style={{ margin: '6px 0 18px', fontSize: 14, color: TEXT_MED, lineHeight: 1.6 }}>
              בחרו איפה להוסיף את {pendingInsert.kind === 'equation' ? 'הנוסחה' : 'הכותרת'} במפת החשיבה שלכם.
            </p>
            <div style={{ background: 'rgba(127,155,217,0.10)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 14, color: TEXT_DARK, direction: pendingInsert.kind === 'equation' ? 'ltr' : 'rtl', textAlign: 'center', fontFamily: pendingInsert.kind === 'equation' ? "'Inter','Consolas',monospace" : 'inherit' }}>
              {pendingInsert.text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => confirmInsert('central')}
                style={{
                  background: BUTTON_COLOR, color: '#fff', border: 'none',
                  borderRadius: 12, padding: '12px 18px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  boxShadow: '0 4px 14px rgba(31,62,108,0.30)',
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ flex: 1, textAlign: 'right' }}>הוסף לנושא המרכזי</span>
              </button>
              <button
                onClick={() => confirmInsert('current')}
                style={{
                  background: '#fff', color: TEXT_DARK,
                  border: '1.5px solid rgba(127,155,217,0.50)',
                  borderRadius: 12, padding: '12px 18px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: 18 }}>🔗</span>
                <span style={{ flex: 1, textAlign: 'right' }}>הוסף לנושא הנוכחי</span>
              </button>
              <button
                onClick={() => confirmInsert('free')}
                style={{
                  background: '#fff', color: TEXT_DARK,
                  border: '1.5px solid rgba(127,155,217,0.50)',
                  borderRadius: 12, padding: '12px 18px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: 18 }}>✨</span>
                <span style={{ flex: 1, textAlign: 'right' }}>הוסף נושא צף (אחבר אחר כך)</span>
              </button>
              <button
                onClick={() => setPendingInsert(null)}
                style={{
                  background: 'transparent', color: TEXT_LIGHT, border: 'none',
                  padding: '8px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  marginTop: 4,
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add-to-map toast — confirms the formula/title was queued to the
          user's mind map, shown whether or not the split is open. */}
      {mapToast && (
        <div
          dir="rtl"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', bottom: 28, insetInlineStart: '50%',
            transform: 'translateX(-50%)', zIndex: 1200,
            background: 'rgba(16,185,129,0.96)', color: '#fff',
            borderRadius: 14, padding: '12px 22px',
            fontFamily: "'Rubik','Assistant',sans-serif", fontSize: 15, fontWeight: 700,
            boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 18 }}>🧠</span>
          <span>{mapToast}</span>
        </div>
      )}
    </div>
  )
}

// ── Local style helpers ───────────────────────────────────────────────────────
const glassCardStyle: React.CSSProperties = {
  background: GLASS_CARD,
  backdropFilter: 'blur(20px)',
  borderRadius: CARD_RADIUS,
  boxShadow: CARD_SHADOW,
  border: '1px solid rgba(255,255,255,0.5)',
}

const primaryBtnStyle: React.CSSProperties = {
  background: BUTTON_COLOR,
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  padding: '11px 22px',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif",
  boxShadow: '0px 2px 6px #8DA7FF',
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  color: TEXT_DARK,
  border: '1px solid rgba(127,155,217,0.4)',
  borderRadius: 24,
  padding: '11px 22px',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif",
}

const backLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: TEXT_DARK,
  fontFamily: "'Rubik', sans-serif",
  fontSize: 16,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const skipLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: TEXT_LIGHT,
  fontFamily: "'Rubik', sans-serif",
  fontSize: 14,
  padding: 0,
  textDecoration: 'underline',
}

function mindmapToggleStyle(open: boolean): React.CSSProperties {
  return {
    background: open ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.6)',
    color: open ? '#4338ca' : TEXT_DARK,
    border: `1px solid ${open ? 'rgba(99,102,241,0.45)' : 'rgba(127,155,217,0.4)'}`,
    borderRadius: 18, padding: '6px 14px',
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Rubik', sans-serif",
    transition: 'all 0.18s',
  }
}

function copyChipStyle(success: boolean): React.CSSProperties {
  return {
    background: success ? 'rgba(16,185,129,0.18)' : 'rgba(99,102,241,0.12)',
    color: success ? '#065f46' : '#4338ca',
    border: `1px solid ${success ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.3)'}`,
    borderRadius: 14, padding: '4px 12px',
    cursor: 'pointer', fontWeight: 600, fontSize: 11,
    fontFamily: "'Rubik', sans-serif",
    whiteSpace: 'nowrap',
    transition: 'all 0.18s',
  }
}

function formulaCopyBtnStyle(success: boolean): React.CSSProperties {
  return {
    position: 'absolute', top: 8, insetInlineStart: 8,
    background: success ? '#10b981' : 'rgba(99,102,241,0.9)',
    color: '#fff',
    border: 'none', borderRadius: 14,
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: "'Rubik', sans-serif",
    fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  }
}

// KaTeX renders the formula with proper math typography (real fraction bars,
// Greek letters, subscripts/superscripts). Falls back to plain text if KaTeX
// hasn't loaded yet (CDN race) or the LaTeX string is malformed.
declare global {
  interface Window { katex?: { renderToString: (latex: string, opts?: object) => string } }
}
function KatexFormula({ latex }: { latex: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    let cancelled = false
    const tryRender = () => {
      if (cancelled) return
      if (window.katex) {
        try {
          const html = window.katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
            output: 'html',
          })
          inner.innerHTML = html && html.trim().length > 0
            ? html
            : `<span style="font-family:monospace;color:#9CA3AF" dir="ltr">${latex}</span>`
          // Fit-to-width: measure rendered formula vs container, scale down if overflow.
          requestAnimationFrame(() => {
            if (cancelled) return
            const wrap = wrapRef.current
            if (!wrap || !inner) return
            const parentW = wrap.clientWidth
            const innerW = inner.scrollWidth
            if (innerW > parentW && parentW > 0) {
              setScale(Math.max(0.5, parentW / innerW))
            } else {
              setScale(1)
            }
          })
        } catch {
          inner.textContent = latex
        }
      } else {
        setTimeout(tryRender, 80)
      }
    }
    tryRender()
    return () => { cancelled = true }
  }, [latex])

  // Also recalc on window resize so formula refits when carousel/pane resizes.
  useEffect(() => {
    const onResize = () => {
      const wrap = wrapRef.current
      const inner = innerRef.current
      if (!wrap || !inner) return
      const parentW = wrap.clientWidth
      const innerW = inner.scrollWidth / scale  // unscaled width
      if (innerW > parentW && parentW > 0) {
        setScale(Math.max(0.5, parentW / innerW))
      } else {
        setScale(1)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [scale])

  return (
    <span
      ref={wrapRef}
      role="img"
      aria-label={`נוסחה: ${latex}`}
      dir="ltr"
      style={{
        display: 'block', width: '100%', textAlign: 'center', overflow: 'visible',
        // Math is direction-neutral; force LTR + bidi isolation so KaTeX
        // children (subscripts, fractions, operators) don't get mirrored
        // by ancestor `dir="rtl"` Hebrew containers.
        direction: 'ltr', unicodeBidi: 'isolate',
      }}
    >
      <span
        ref={innerRef}
        dir="ltr"
        style={{
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          transition: 'transform 0.12s ease-out',
          direction: 'ltr', unicodeBidi: 'isolate',
        }}
      >
        {latex}
      </span>
    </span>
  )
}

