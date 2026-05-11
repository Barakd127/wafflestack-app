import { useState, useEffect, useRef } from 'react'
import { LESSON_CONTENT } from '../data/lesson-content'
import { TOPIC_VISUALS } from './LessonVisuals'
import ArsenalCapture from './ArsenalCapture'
import { quickAddToMindmap } from '../lib/mindmapWriter'

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
}

export default function LessonScreen({ topicId, onStartQuiz, onBack, onComplete }: LessonScreenProps) {
  const lesson = LESSON_CONTENT.find(t => t.id === topicId)
  const [currentSlide, setCurrentSlide] = useState(0)
  // Theory defaults to FULL-SCREEN. User opens the side mind map explicitly
  // via the toggle when they want to take notes alongside the lesson.
  const [mindmapOpen, setMindmapOpen] = useState(false)
  const [splitPct, setSplitPct] = useState(45)  // mind map width %
  const [copied, setCopied] = useState<string | null>(null)
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

  const slides = lesson?.slides ?? []
  const total = slides.length
  const isFirst = currentSlide === 0
  const isLast = total > 0 && currentSlide === total - 1

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
  // `connectMode`: 'connected' (default — adds as child of root, connection
  // line drawn) | 'free' (creates a disconnected node so the user can decide
  // later where to connect it).
  const sendToMindMap = (
    text: string,
    kind: 'text' | 'equation' = 'text',
    connectMode: 'connected' | 'free' = 'connected',
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
  const confirmInsert = (mode: 'connected' | 'free') => {
    if (!pendingInsert) return
    const { text, kind, sourceLabel } = pendingInsert
    setPendingInsert(null)
    if (!mindmapOpen) setMindmapOpen(true)
    setTimeout(() => {
      const ok = sendToMindMap(text, kind, mode)
      if (ok) {
        setCopied(sourceLabel)
        setTimeout(() => setCopied(null), 1500)
      }
    }, mindmapOpen ? 0 : 320)
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
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // RTL: the mind map is on the LEFT (visually) but in DOM order it's first child;
      // because the wrapper is dir="ltr" the percentage maps directly to clientX.
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setSplitPct(Math.max(20, Math.min(70, pct)))
    }
    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
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
      <div dir="rtl" style={{ flex: 1, overflow: 'auto', padding: '32px 40px', fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
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

  const slide = slides[currentSlide]
  // Slides may override the topic-level visual via `visualId` — used by the
  // probability lesson to attach distinct Venn variants to specific slides.
  const Visual = TOPIC_VISUALS[slide.visualId ?? topicId] as React.FC | undefined

  // ── Right-side content (slide + visualization + footer) ─────────────────────
  const rightPane = (
    <div dir="rtl" className="ws-lesson-rightpane" style={{
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
          שקופית {currentSlide + 1} מתוך {total}
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

      {/* Slide card — theory is the heart of the lesson, give it presence */}
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
          const parts = raw.length < 80
            ? [raw]
            : raw.split(/(?<=[.!?])\s+/).reduce((acc: string[], s) => {
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
                    // first child (the number badge) on the RIGHT — which is
                    // what we want in Hebrew. row-reverse would push it left.
                    display: 'flex', flexDirection: 'row', gap: 16,
                    alignItems: 'flex-start',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.045), rgba(99,102,241,0.015))',
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
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #5b8bff, #6c63ff)',
                    color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
                    boxShadow: '0 2px 6px rgba(91,139,255,0.45)',
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    flex: 1, minWidth: 0,
                    fontSize: 18.5, lineHeight: 1.85, color: TEXT_DARK,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {bullet}
                  </div>
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
            {mindmapOpen && (
              <button
                className="ws-formula-copy"
                onClick={() => handleCopyFormula(slide.formula!)}
                title="הוסף את הנוסחה למפת המושגים"
                style={formulaCopyBtnStyle(copied === 'formula')}
              >
                {copied === 'formula' ? '✓' : '🧠+'}
                <span className="cm-label">{copied === 'formula' ? 'נוסף' : 'הוסף למפה'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Interactive visualization */}
      {Visual && (<div><Visual /></div>)}

      {/* Footer controls — dot navigation only (prev/next moved to floating arrows) */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`עבור לשקופית ${idx + 1}`}
            style={{
              width: idx === currentSlide ? 14 : 10, height: idx === currentSlide ? 14 : 10, borderRadius: '50%',
              background: idx === currentSlide ? BUTTON_COLOR : 'rgba(127,155,217,0.35)',
              border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Floating side-arrows removed — replaced by labeled prev/next buttons
          in the sticky strip at the top of the slide card (above). The strip
          stays visible regardless of scroll, and 'הקודם' / 'הבא' labels make
          the function unambiguous. */}
      {/* Hover styles for the formula copy button */}
      <style>{`
        .ws-formula-copy { transition: all 0.2s ease; }
        .ws-formula-copy:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.4) !important; }
        .ws-formula-copy:hover .cm-label { max-width: 140px; opacity: 1; margin-inline-start: 6px; }
        .ws-formula-copy .cm-label {
          max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap;
          transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
          display: inline-block;
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
    <div ref={containerRef} dir="ltr" style={{
      flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0,
      background: 'transparent',
    }}>
      {/* Mind map iframe — left side (LTR-first child) */}
      <div className="ws-lesson-mindmap-pane" style={{ width: `${splitPct}%`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <iframe
          ref={mindmapRef}
          src={`${import.meta.env.BASE_URL}mindmap.html?mode=mm&userId=${encodeURIComponent(userId)}`}
          title="Mind Map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fafbff' }}
        />
        {/* The redundant "מפת המושגים שלי" chip used to sit here — removed
            because in RTL its top:right:12 anchor flipped to the LEFT visual
            edge and obscured the iframe's topbar buttons. Mind map is its
            own iframe, the user knows what they're looking at. */}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
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
              {pendingInsert.kind === 'equation'
                ? 'בחרו אם הנוסחה הזו נקשרת לנושא הנוכחי שלכם, או שתעמוד בענף משלה ותתחברו אליה אחר כך.'
                : 'בחרו אם הכותרת הזו נקשרת לנושא הנוכחי שלכם, או שתעמוד בענף משלה ותתחברו אליה אחר כך.'}
            </p>
            <div style={{ background: 'rgba(127,155,217,0.10)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 14, color: TEXT_DARK, direction: pendingInsert.kind === 'equation' ? 'ltr' : 'rtl', textAlign: 'center', fontFamily: pendingInsert.kind === 'equation' ? "'Inter','Consolas',monospace" : 'inherit' }}>
              {pendingInsert.text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => confirmInsert('connected')}
                style={{
                  background: BUTTON_COLOR, color: '#fff', border: 'none',
                  borderRadius: 12, padding: '12px 18px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  boxShadow: '0 4px 14px rgba(31,62,108,0.30)',
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: 18 }}>🔗</span>
                <span style={{ flex: 1, textAlign: 'right' }}>חבר עכשיו לנושא הנוכחי</span>
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
                <span style={{ flex: 1, textAlign: 'right' }}>התחל ענף חדש (אחבר אחר כך)</span>
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
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
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
          // Empty result on bad LaTeX — fall back to readable text instead of
          // a silent gap. Screen readers + sighted users both see something.
          node.innerHTML = html && html.trim().length > 0
            ? html
            : `<span style="font-family:monospace;color:#9CA3AF" dir="ltr">${latex}</span>`
        } catch {
          node.textContent = latex
        }
      } else {
        setTimeout(tryRender, 80)
      }
    }
    tryRender()
    return () => { cancelled = true }
  }, [latex])
  // role="img" + aria-label exposes the equation as a single AT-readable
  // unit (skill ux Accessibility/Alt Text HIGH). LaTeX source is the best
  // descriptor we have without a math-to-speech bridge.
  return (
    <span
      ref={ref}
      role="img"
      aria-label={`נוסחה: ${latex}`}
      style={{ overflowX: 'auto', maxWidth: '100%', display: 'inline-block' }}
    >
      {latex}
    </span>
  )
}

