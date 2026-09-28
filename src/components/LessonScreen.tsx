import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { LESSON_CONTENT_ALL as LESSON_CONTENT } from '../data/lesson-content'
import { TOPIC_VISUALS } from './LessonVisuals'
import ArsenalCapture from './ArsenalCapture'
import { quickAddToMindmap } from '../lib/mindmapWriter'
import { MathLineBlock } from '../lib/mathRender'
import { parseLeadingEnumMarker, splitSentences } from '../lib/bidiSegments'
import BoardShell from './BoardShell'
import HierarchyBreadcrumb from './HierarchyBreadcrumb'
import PresentationOverlay, { type PresenterTool } from './PresentationOverlay'
import LessonComplete from './LessonComplete'
import { buildingNameForTopic, buildingForTopic } from './glass/cityNames'
import { useLearningStore } from '../store/learningStore'

// Design tokens — keep in sync with StudyHub.tsx
const GLASS_CARD  = 'var(--sh-glass-card)'
const CARD_SHADOW = 'var(--sh-card-shadow)'
const CARD_RADIUS = 24
const BUTTON_COLOR = 'var(--sh-btn-color)'
const TEXT_DARK   = 'var(--sh-text-dark)'
const TEXT_MED    = 'var(--sh-text-med)'
const TEXT_LIGHT  = 'var(--sh-text-light)'

/**
 * The screen's icons, drawn rather than typed. An emoji cannot take the
 * colour or the size of the control it sits in and renders differently on
 * every OS; these inherit both through `currentColor` and `size`.
 */
const Ico = ({ d, size = 17, w = 1.8 }: { d: string; size?: number; w?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden
       style={{ flexShrink: 0 }}
       dangerouslySetInnerHTML={{ __html: d }} />
)
const I = {
  book: '<path d="M9.5 3.1A3 3 0 0 0 6.5 6.1v11.8a3 3 0 0 0 3 3"/><rect x="9.5" y="3.1" width="10.4" height="17.8" rx="2.6"/><path d="M9.5 16.7h10.4"/>',
  mind: '<circle cx="12" cy="6" r="2.6"/><circle cx="5.5" cy="17" r="2.6"/><circle cx="18.5" cy="17" r="2.6"/><path d="M10.4 7.6 7 14.6"/><path d="M13.6 7.6 17 14.6"/>',
  check: '<polyline points="20,6 9,17 4,12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  present: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4"/><path d="M8.5 20h7"/>',
  play: '<polygon points="7,4 20,12 7,20"/>',
  pause: '<rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
  point: '<path d="M8.5 11V5.4a1.7 1.7 0 0 1 3.4 0V11"/><path d="M11.9 11V9.6a1.6 1.6 0 0 1 3.2 0V11"/><path d="M15.1 11.2a1.6 1.6 0 0 1 3.2 0v3.6a5.6 5.6 0 0 1-5.6 5.6h-1a4.6 4.6 0 0 1-3.6-1.8L5 14.6a1.6 1.6 0 0 1 2.5-2l1 1.2"/>',
  laser: '<circle cx="12" cy="12" r="2.4"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m18.4 5.6-2.1 2.1"/><path d="m7.7 16.3-2.1 2.1"/>',
  pen: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  underline: '<path d="M7 4v6a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.4-1.4"/>',
  float: '<circle cx="12" cy="12" r="7" stroke-dasharray="3 3"/><path d="M12 9.5v5"/><path d="M9.5 12h5"/>',
  notebook: '<path d="M7.5 3.2A2.4 2.4 0 0 0 5.1 5.6v12.8a2.4 2.4 0 0 0 2.4 2.4"/><rect x="7.5" y="3.2" width="11.4" height="17.6" rx="2.4"/><path d="M10.6 8h5.2"/><path d="M10.6 12h5.2"/>',
  back: '<path d="M5 12h14"/><polyline points="12,5 19,12 12,19"/>',
}

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
  // Presentation mode: a cartoon hand presents the slide on the whiteboard
  // (auto choreography), or follows the mouse with a chosen tool (manual).
  const [presenting, setPresenting] = useState(false)
  const [presAuto, setPresAuto] = useState(false)
  const [presTool, setPresTool] = useState<PresenterTool>('point')
  /* The BOARD's height as a percentage, not the map's width — the pane moved
     under the board. Same default and clamp as the practice screen, because
     they are the same control doing the same job. */
  const SPLIT_MIN = 25, SPLIT_MAX = 80
  const [splitPct, setSplitPct] = useState(56)
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
    return [...base, { Component: TopicVisual as React.ComponentType, title: 'ויזואליזציה — מסע סטטיסטי' }]
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

  /* The last slide no longer walks straight out to the quiz. It stops and
     shows what the unit earned — see LessonComplete. Both ways on from there
     (collect, or practise) still run handleStartQuiz's completion, so nothing
     can be earned twice and nothing can be skipped. */
  const [doneOpen, setDoneOpen] = useState(false)
  const xpBefore = useLearningStore(s => s.xp)
  const lessonAlreadyDone = useLearningStore(s => s.completedLessons.includes(topicId))
  const handleNext = () => {
    if (isLast) setDoneOpen(true)
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

  const addSlideTo = (toMap: boolean) => {
    const ok = quickAddToMindmap({
      text: slide?.title ?? '',
      body: typeof slide?.content === 'string' ? slide.content : '',
      // the map wants the live iframe so the node lands in the open pane;
      // the notebook is the same tree written straight to storage
      iframeWindow: toMap ? (mindmapRef.current?.contentWindow ?? null) : undefined,
      userId,
    })
    if (ok) {
      setCopied(toMap ? 'title-mm' : 'title-nb')
      setTimeout(() => setCopied(null), 1500)
    }
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
    const updateFromClientY = (clientY: number) => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (!rect.height) return
      // The board is the first child and sits on top, so the pointer's distance
      // from the container's top IS the board's share. No direction to reason
      // about — which is the point of leaving the horizontal axis behind.
      const pct = ((clientY - rect.top) / rect.height) * 100
      setSplitPct(Math.max(SPLIT_MIN, Math.min(SPLIT_MAX, pct)))
    }
    const onMove = (ev: MouseEvent) => updateFromClientY(ev.clientY)
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length < 1) return
      ev.preventDefault()
      updateFromClientY(ev.touches[0].clientY)
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
      <div data-tour="theory-screen" dir="rtl" style={{ flex: 1, overflow: 'auto', padding: '32px 40px', fontFamily: "'Assistant', 'Assistant', sans-serif" }}>
        <button onClick={onBack} className="ws-cta-nav"><Ico d={I.back} size={16} />חזרה לנושאים</button>
        <div style={{ ...glassCardStyle, padding: 40, marginTop: 24, textAlign: 'center' }}>
          <div style={{ marginBottom: 16, color: TEXT_LIGHT, display: 'flex', justifyContent: 'center' }}><Ico d={I.book} size={48} w={1.3} /></div>
          <div style={{ fontFamily: 'var(--ws-display)', fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 12 }}>
            תוכן לימוד עבור נושא זה עדיין בהכנה
          </div>
          <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 15, color: TEXT_LIGHT, marginBottom: 24 }}>
            ניתן לעבור ישירות לתרגול ולחזור מאוחר יותר.
          </div>
          <button onClick={onStartQuiz} style={primaryBtnStyle}>המשך לתרגול</button>
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
    /* A flex column rather than a block, so the board can take whatever height
       is left instead of a fixed clamp. That is what puts the slide bar on the
       same line as the admin chip in the rail, and it gives theory and practice
       the full page — per Shirli. */
    <div ref={rightPaneRef} dir="rtl" className="ws-lesson-rightpane" style={{
      flex: 1, overflow: 'auto', padding: '24px 28px 16px',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Assistant', 'Assistant', sans-serif",
    }}>
      {/* Floating "save to arsenal" chip listens at document level */}
      <ArsenalCapture />

      {/* ── The row above the board: where I came from on the right, what I can
          switch on this screen on the left. Same type, same colours and same
          segmented pill as the row above the topic list.

          The page heading that used to follow it is gone — the top bar already
          carries "הקדמה לסטטיסטיקה · שיעור", and the board now starts where
          that heading started. ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, gap: 16, flexWrap: 'wrap', flexShrink: 0,
      }}>
        <button onClick={onBack} className="ws-cta-nav"><Ico d={I.back} size={17} />חזרה לנושאים</button>

        {/* The trail joins the toolbar instead of floating on the board. It is
            wayfinding, and this row is where this screen says where you are
            and what you can do about it. */}
        <div style={{ flex: '0 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <HierarchyBreadcrumb topicId={topicId} />
        </div>

        {/* Two buttons, not a segmented control: they are independent, both can
            be on, and neither is an alternative to the other. Styled as the
            home screen's own CTA — light at rest, dark when down. */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              setPresenting(v => {
                const next = !v
                setPresAuto(next) // entering starts the auto demo; exiting stops it
                if (next) setPresTool('point')
                return next
              })
            }}
            title={presenting ? 'סיום מצב הצגה' : 'היד מציגה את השקופית על הלוח'}
            aria-pressed={presenting}
            className={`ws-cta ws-cta-sm${presenting ? ' is-on' : ''}`}
          >
            <Ico d={presenting ? I.close : I.present} size={17} />
            {presenting ? 'סיום הצגה' : 'מצב הצגה'}
          </button>
          <button
            onClick={() => setMindmapOpen(v => !v)}
            title={mindmapOpen ? 'הסתר מפת מושגים' : 'הצג מפת מושגים'}
            aria-pressed={mindmapOpen}
            className={`ws-cta ws-cta-sm${mindmapOpen ? ' is-on' : ''}`}
          >
            <Ico d={I.mind} size={17} />
            {mindmapOpen ? 'הסתר מפה' : 'הצג מפה'}
          </button>
        </div>
      </div>

      {/* Presentation tool bar — visible only while presenting */}
      {presenting && !isGraphSlide && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          marginBottom: 10, padding: '8px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(127,155,217,0.30)',
          borderRadius: 12,
        }}>
          <button
            onClick={() => setPresAuto(v => !v)}
            style={{
              background: presAuto ? 'rgba(212,175,55,0.22)' : 'rgba(255,255,255,0.85)',
              color: presAuto ? '#8a6d1a' : TEXT_DARK,
              border: '1.5px solid rgba(127,155,217,0.45)', borderRadius: 10,
              padding: '6px 13px', fontSize: 13, fontWeight: 700,
              fontFamily: "'Assistant', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <Ico d={presAuto ? I.pause : I.play} size={14} />
            {presAuto ? 'עצור הדגמה' : 'הדגמה אוטומטית'}
          </button>
          <span style={{ fontFamily: "'Assistant', sans-serif", fontSize: 13, fontWeight: 700, color: BUTTON_COLOR }}>כלי הצבעה:</span>
          {([['point', 'הצבעה', I.point], ['laser', 'לייזר', I.laser], ['draw', 'ציור חופשי', I.pen], ['underline', 'קו תחתון', I.underline]] as Array<[PresenterTool, string, string]>).map(([id, label, glyph]) => (
            <button
              key={id}
              onClick={() => { setPresAuto(false); setPresTool(id) }}
              aria-pressed={!presAuto && presTool === id}
              style={{
                background: !presAuto && presTool === id ? BUTTON_COLOR : 'rgba(255,255,255,0.9)',
                color: !presAuto && presTool === id ? '#fff' : TEXT_DARK,
                border: `1.5px solid ${!presAuto && presTool === id ? BUTTON_COLOR : 'rgba(127,155,217,0.40)'}`,
                borderRadius: 10, padding: '6px 13px', fontSize: 13, fontWeight: 700,
                fontFamily: "'Assistant', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Ico d={glyph} size={14} />
              {label}
            </button>
          ))}
          <span style={{ fontFamily: "'Assistant', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginInlineStart: 'auto' }}>
            {presAuto ? 'ההדגמה רצה — לחצו ״עצור הדגמה״ כדי לשלוט ביד' : 'הזיזו את העכבר על הלוח — היד עוקבת. לחיצה מפעילה את הכלי.'}
          </span>
        </div>
      )}

      {/* Lesson content is drawn directly on a whiteboard surface — the
          hierarchy breadcrumb is pinned in the board's top-right corner.
          The relative wrapper hosts the presentation overlay (hand/laser/ink)
          so it can sit above the slide but under the aluminium frame. */}
      {/* WhiteboardShell is height:100% internally — without an explicit
          height here it collapses to its content (a 2-bullet slide reads as
          a tiny stub, not a whiteboard). Clamp gives a real board on any
          viewport; content that overflows still scrolls inside (see the
          flex:1 / overflowY:auto content column in WhiteboardShell). */}
      <div style={{ position: 'relative', flex: 1, minHeight: 360, borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
      {/* ── 3. The slide's two actions are the quiet level of the same button:
          `.ws-cta-outline`, outlined in the card title's blue with no fill at
          rest — the level below the toolbar's CTAs, which is what they are.
          They keep the board's own inset so they line up with the frost
          slider in the corner below. ─────────────────────────────────────── */}
      <BoardShell
        topLeftSlot={<>
          <button onClick={() => addSlideTo(true)} title="הוסף את הכותרת והתוכן למפת החשיבה"
                  className={`ws-cta-outline ws-cta-xs${copied === 'title-mm' ? ' is-done' : ''}`}>
            <Ico d={copied === 'title-mm' ? I.check : I.mind} size={16} />
            {copied === 'title-mm' ? 'נוסף' : 'הוספה למפה'}
          </button>
          <button onClick={() => addSlideTo(false)} title="הוסף כדף חדש במחברת"
                  className={`ws-cta-outline ws-cta-xs${copied === 'title-nb' ? ' is-done' : ''}`}>
            <Ico d={copied === 'title-nb' ? I.check : I.notebook} size={16} />
            {copied === 'title-nb' ? 'נוסף' : 'הוספה למחברת'}
          </button>
        </>}
        topicId={topicId}
        progress={{ done: currentSlide + 1, total }}
      >
      {!isGraphSlide && (
      <>{/* Slide card — theory is the heart of the lesson, give it presence */}
      <div
        data-arsenal-source="slide"
        data-arsenal-topic={topicId}
        className="ws-lesson-card"
        style={{
          // Drawn ON the board — no glass-card chrome (no background/
          // border/shadow); content sits directly on the whiteboard surface.
          padding: '8px 6px',
          marginBottom: 22,
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
          <h3 style={{
            fontFamily: 'var(--ws-display)', fontSize: 30, fontWeight: 700,
            color: TEXT_DARK, marginTop: 0, marginBottom: 0, textAlign: 'right',
            lineHeight: 1.3, letterSpacing: '-0.01em', flex: 1,
          }}>
            {slide.title}
          </h3>
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
          // splitSentences moved to lib/bidiSegments — the quiz stem needs the same
          // rule, and one copy of it is enough.
          // Break a sentence before any INLINE enumeration marker ("… 1) foo")
          // so each numbered item becomes its own bullet instead of trailing on
          // the intro sentence ("מאפשרת: 1) …"). A marker at position 0 is left
          // alone (it's already the head of its own bullet). User 2026-07-08.
          const splitEnumItems = (s: string): string[] =>
            s.split(/\s+(?=\d{1,3}[).]\s)/).map(x => x.trim()).filter(Boolean)
          const parts = raw.length < 80
            ? [raw]
            : splitSentences(raw)
                .flatMap(splitEnumItems)
                .reduce((acc: string[], s) => {
                  const t = s.trim(); if (!t) return acc
                  // Don't merge a short enumeration item ("3) כן.") into the
                  // previous bullet — it must keep its own marker + row.
                  const isEnum = /^\d{1,3}[).]\s/.test(t)
                  if (acc.length && t.length < 12 && !isEnum) acc[acc.length - 1] += ' ' + t
                  else acc.push(t)
                  return acc
                }, [])
          return (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              fontFamily: "'Assistant', sans-serif", textAlign: 'right',
              flex: 1,
            }}>
              {parts.map((bullet, i) => {
                // A numbered bullet ("1) …") shows its number as the RIGHT-side
                // marker (in the waffle's slot) with a DOT to the LEFT of the
                // number (".1" — Hebrew list convention), and drops the waffle.
                // User 2026-07-08. Non-numbered bullets keep the waffle.
                const marker = parseLeadingEnumMarker(bullet)
                const bodyText = marker ? marker.rest : bullet
                return (
                <div
                  key={i}
                  className="ws-lesson-bullet"
                  style={{
                    // Parent has dir="rtl"; flex-direction: row places the
                    // first child (the marker/waffle) on the RIGHT in Hebrew.
                    // Drawn ON the board — no box background/border/shadow;
                    // just the marker + text sitting directly on the whiteboard.
                    display: 'flex', flexDirection: 'row', gap: 14,
                    alignItems: 'flex-start',
                    padding: '6px 4px',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  <div style={{
                    flexShrink: 0,
                    minWidth: 22, height: 22,
                    display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    marginTop: 4,
                    opacity: 0.9,
                  }} aria-hidden="true">
                    {marker ? (
                      // Number marker: dot LEFT of number (".1"). RTL container +
                      // two LTR-isolated children → num right, dot left, non-mirrored.
                      <span dir="rtl" style={{ unicodeBidi: 'isolate', fontFamily: "'Assistant', sans-serif", fontWeight: 800, fontSize: 17, color: '#C97C18' }}>
                        <span dir="ltr">{marker.num}</span>
                        <span dir="ltr">.</span>
                      </span>
                    ) : (
                    /* Round Belgian waffle bullet — premium honey gradient,
                       ink outline, real cell pits. */
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
                    )}
                  </div>
                  <MathLineBlock
                    text={bodyText}
                    style={{
                      flex: 1, minWidth: 0,
                      fontSize: 18.5, lineHeight: 1.85, color: TEXT_DARK,
                      whiteSpace: 'pre-wrap',
                      textAlign: 'right',
                      // Handwritten, whiteboard-marker feel — readable Hebrew
                      // handwriting font first, falls back to Assistant.
                      fontFamily: "'Playpen Sans Hebrew','Assistant',sans-serif",
                    }}
                  />
                </div>
                )
              })}
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
              <Ico d={copied === 'formula' ? I.check : I.plus} size={15} />
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
          // No panel, no border, no shadow: the glass board is the screen, and
          // a graph is its content — not a second screen shown inside it.
          marginTop: 0,
          // and it takes the height the board has left, on any screen
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        }}>
          {/* Zoom controls */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, marginBottom: 14, paddingBottom: 0, padding: '8px 6px 0',
          }}>
            <h3 style={{
              fontFamily: 'var(--ws-display)', fontSize: 30, fontWeight: 700,
              color: TEXT_DARK, margin: 0, textAlign: 'right',
              lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {effectiveGraphs[graphIdx].title}
            </h3>
          </div>
          {/* Scaled graph container */}
          <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', flex: 1, minHeight: 0 }}>
            <div style={{
              transform: `scale(${graphScale})`,
              transformOrigin: 'top center',
              width: `${100 / graphScale}%`,
              height: '100%',
              display: 'flex', flexDirection: 'column', minHeight: 0,
            }}>
              <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: 'rgba(127,155,217,0.7)' }}>טוען גרף אינטראקטיבי…</div>}>
                {(() => { const G = effectiveGraphs[graphIdx].Component; return <G /> })()}
              </Suspense>
            </div>
          </div>
        </div>
      )}
      </BoardShell>
      <PresentationOverlay
        active={presenting && !isGraphSlide}
        autoOn={presAuto}
        tool={presTool}
        slideKey={currentSlide}
        onAutoDone={() => setPresAuto(false)}
      />
      </div>

      {/* ── Slide bar — one strip at the foot of the card. It used to be two
          things in two places: a labelled prev/next strip ABOVE the card and a
          bare row of dots far BELOW it, with nothing beside the dots to say
          what they counted. Joined per Shirli: back on the right (where the
          reader starts), the dots and the count in the middle, forward on the
          left. Arrow keys still work. ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, marginTop: 0, padding: '10px 16px',
        background: '#fff',
        border: '1px solid rgba(127,155,217,0.30)',
        borderTop: '1px solid rgba(127,155,217,0.22)',
        borderRadius: '0 0 18px 18px',
        boxShadow: '0 8px 20px rgba(31,62,108,0.10)',
      }}>
        <button
          onClick={handlePrev}
          disabled={isFirst}
          aria-label="שקופית קודמת"
          title="הקודם (חץ ימני)"
          style={{
            background: 'transparent',
            color: isFirst ? TEXT_LIGHT : BUTTON_COLOR,
            border: 'none',
            borderRadius: 12, padding: '8px 14px',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600,
            fontFamily: "'Assistant', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: isFirst ? 0.45 : 1,
            transition: 'all 0.18s',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" /><polyline points="12,5 19,12 12,19" />
          </svg>
          הקודם
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: total }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`עבור לשקופית ${idx + 1}`}
                aria-current={idx === currentSlide ? 'true' : undefined}
                style={{
                  width: idx === currentSlide ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: idx === currentSlide ? BUTTON_COLOR : 'rgba(127,155,217,0.35)',
                  border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
          <div style={{
            fontFamily: "'Assistant', sans-serif", fontSize: 13, fontWeight: 600,
            color: TEXT_MED, whiteSpace: 'nowrap',
          }}>
            {isGraphSlide && effectiveGraphs
              ? (effectiveGraphs[graphIdx]?.title ?? 'גרף')
              : `שקופית ${currentSlide + 1} מתוך ${total}`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {!isLast && (
          <button onClick={() => handleStartQuiz(false)} style={skipLinkStyle}>
            דלג לתרגול
          </button>
        )}
        <button
          onClick={handleNext}
          aria-label={isLast ? 'התחל תרגול' : 'שקופית הבאה'}
          title={isLast ? 'התחל תרגול' : 'הבא (חץ שמאלי)'}
          className="ws-cta"
          style={{ padding: '9px 20px', fontSize: 14, whiteSpace: 'nowrap' }}
        >
          {isLast ? 'התחל תרגול' : 'הבא'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        </div>
      </div>

      {/* Floating side-arrows removed — replaced by labeled prev/next buttons
          in the compact strip above the slide card, the footer dots below, and
          arrow keys. The strip is non-sticky so it never obscures the board;
          'הקודם' / 'הבא' labels make the function unambiguous. */}
      <LessonComplete
        open={doneOpen}
        building={buildingForTopic(topicId)}
        buildingName={buildingNameForTopic(topicId)}
        xp={xpBefore}
        gain={lessonAlreadyDone ? 0 : 5}
        onCollect={() => { if (!completedRef.current) { completedRef.current = true; onComplete(topicId) } }}
        onPractise={() => { setDoneOpen(false); handleStartQuiz(true) }}
        onClose={() => setDoneOpen(false)}
      />

      {/* Formula copy button. The label is ALWAYS visible — it used to appear on
          hover only, leaving a bare glyph that readers could not interpret. */}
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

  // ── Split layout: the board on top, the map under it ───────────────────────
  // dir stays rtl now. The wrapper used to be forced to ltr so a left-to-right
  // percentage would map straight onto clientX; on a vertical axis there is no
  // such thing to work around.
  return (
    <div ref={containerRef} data-tour="theory-screen" dir="rtl" style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
      background: 'transparent',
    }}>
      {/* Lesson content — the board, on top */}
      <div style={{ height: `${splitPct}%`, display: 'flex', flexDirection: 'column', minHeight: 0, flexShrink: 0 }}>
        {rightPane}
      </div>

      {/* The divider — same control as the practice screen's, to the pixel */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDoubleClick={() => setSplitPct(56)}
        role="separator"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(splitPct)}
        aria-valuemin={SPLIT_MIN}
        aria-valuemax={SPLIT_MAX}
        aria-label="גובה הלוח — גרור לשינוי, לחיצה כפולה לאיפוס"
        title="גרור לשינוי גובה הלוח · לחיצה כפולה מאפסת"
        style={{
          flexShrink: 0, height: 14, cursor: 'row-resize',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'none', background: 'transparent',
        }}
      >
        <span style={{ width: 56, height: 4, borderRadius: 99, background: 'rgba(31,62,108,0.30)' }} aria-hidden="true" />
      </div>

      {/* Mind map iframe — under the board, full width. A fan needs width more
          than anything else, and beside the board it only ever had half. */}
      <div className="ws-lesson-mindmap-pane" style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <iframe
          ref={mindmapRef}
          src={`${import.meta.env.BASE_URL}mindmap.html?v=mm19-20260708&mode=mm&userId=${encodeURIComponent(userId)}&topic=${encodeURIComponent(topicId)}`}
          title="Mind Map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fafbff' }}
        />
        {/* The redundant "מפת המושגים שלי" chip used to sit here — removed
            because in RTL its top:right:12 anchor flipped to the LEFT visual
            edge and obscured the iframe's topbar buttons. Mind map is its
            own iframe, the user knows what they're looking at. */}
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
              fontFamily: "'Assistant','Assistant',sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: BUTTON_COLOR, display: 'inline-flex' }}><Ico d={I.mind} size={24} /></span>
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
                <Ico d={I.target} size={18} />
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
                <Ico d={I.link} size={18} />
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
                <Ico d={I.float} size={18} />
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
            fontFamily: "'Assistant','Assistant',sans-serif", fontSize: 15, fontWeight: 700,
            boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
          }}
        >
          <Ico d={I.mind} size={18} />
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
  fontFamily: "'Assistant', sans-serif",
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
  fontFamily: "'Assistant', sans-serif",
}

/* Matched to the topic list's back link, one screen back, so the way out of a
   screen looks the same wherever you are. */
/* And to the list/map switch beside it: a pill that fills TEXT_MED when it is
   on. Two toggles rather than two alternatives, so both may be lit at once. */
function toggleStyle(on: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 7,
    border: 'none', borderRadius: 999, padding: '7px 15px',
    cursor: 'pointer',
    fontFamily: "'Assistant', sans-serif", fontSize: 14, fontWeight: 600,
    background: on ? TEXT_MED : 'transparent',
    color: on ? '#fff' : TEXT_MED,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s',
  }
}

/* The slide's own two actions, in the board's top-left corner. */
function slideActionStyle(done: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: done ? '#254A9F' : 'rgba(255,255,255,0.72)',
    border: `1.5px solid ${done ? '#254A9F' : 'rgba(127,155,217,0.35)'}`,
    color: done ? '#fff' : '#254A9F',
    borderRadius: 12, padding: '8px 14px', fontSize: 13.5, fontWeight: 600,
    fontFamily: "'Assistant', sans-serif", cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 0.2s',
  }
}

/* The quiet way forward, beside the loud one. It was TEXT_LIGHT and
   underlined at the end of a button row — the faintest thing on the screen,
   and the only one that left it. */
const skipLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: TEXT_MED,
  fontFamily: "'Assistant', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 14px',
  borderRadius: 12,
  whiteSpace: 'nowrap',
}

function mindmapToggleStyle(open: boolean): React.CSSProperties {
  return {
    background: open ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.6)',
    color: open ? '#4338ca' : TEXT_DARK,
    border: `1px solid ${open ? 'rgba(99,102,241,0.45)' : 'rgba(127,155,217,0.4)'}`,
    borderRadius: 18, padding: '6px 14px',
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Assistant', sans-serif",
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
    fontFamily: "'Assistant', sans-serif",
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
    fontFamily: "'Assistant', sans-serif",
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

