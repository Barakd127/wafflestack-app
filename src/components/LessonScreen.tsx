import { useState, useEffect, useRef } from 'react'
import { LESSON_CONTENT } from '../data/lesson-content'
import { TOPIC_VISUALS } from './LessonVisuals'
import ArsenalCapture from './ArsenalCapture'

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

  // Send a node into the mind map via postMessage. Equations render as KaTeX nodes.
  const sendToMindMap = (text: string, kind: 'text' | 'equation' = 'text') => {
    const win = mindmapRef.current?.contentWindow
    if (!win) return false
    const payload = kind === 'equation'
      ? { type: 'ws-add-node', kind, latex: text, text }
      : { type: 'ws-add-node', kind, text }
    try { win.postMessage(payload, '*'); return true } catch { return false }
  }

  const handleCopyFormula = (formula: string) => {
    if (!mindmapOpen) setMindmapOpen(true)
    // Slight delay so the iframe is mounted/loaded if it was just opened
    setTimeout(() => {
      const ok = sendToMindMap(formula, 'equation')
      if (ok) {
        setCopied('formula')
        setTimeout(() => setCopied(null), 1500)
      }
    }, mindmapOpen ? 0 : 320)
  }

  const handleCopyTitle = () => {
    if (!mindmapOpen) setMindmapOpen(true)
    const slide = slides[currentSlide]
    if (!slide) return
    setTimeout(() => {
      const ok = sendToMindMap(slide.title, 'text')
      if (ok) {
        setCopied('title')
        setTimeout(() => setCopied(null), 1500)
      }
    }, mindmapOpen ? 0 : 320)
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
  const Visual = TOPIC_VISUALS[topicId] as React.FC | undefined

  // ── Right-side content (slide + visualization + footer) ─────────────────────
  const rightPane = (
    <div dir="rtl" style={{
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
      <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginBottom: 18, textAlign: 'right' }}>
        שקופית {currentSlide + 1} מתוך {total}
      </div>

      {/* Slide card */}
      <div
        data-arsenal-source="slide"
        data-arsenal-topic={topicId}
        style={{ ...glassCardStyle, padding: '26px 30px', marginBottom: 18 }}
      >
        <h3 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 20, fontWeight: 700, color: TEXT_DARK, marginTop: 0, marginBottom: 14, textAlign: 'right' }}>
          {slide.title}
        </h3>
        <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 15.5, color: TEXT_MED, lineHeight: 1.8, textAlign: 'right', whiteSpace: 'pre-wrap' }}>
          {slide.content}
        </div>
        {slide.formula && (
          <div style={{ position: 'relative', marginTop: 18 }}>
            <div style={{
              background: 'rgba(127,155,217,0.12)',
              border: '1px solid rgba(127,155,217,0.3)',
              borderRadius: 12,
              padding: '14px 18px',
              fontFamily: "'Inter', 'Consolas', monospace",
              fontSize: 17,
              color: TEXT_DARK,
              direction: 'ltr',
              textAlign: 'center',
              letterSpacing: 0.3,
            }}>
              {slide.formula}
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

      {/* Footer controls */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={handlePrev}
          disabled={isFirst}
          style={{ ...secondaryBtnStyle, opacity: isFirst ? 0.4 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
        >
          → הקודם
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`עבור לשקופית ${idx + 1}`}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: idx === currentSlide ? BUTTON_COLOR : 'rgba(127,155,217,0.35)',
                border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <button onClick={handleNext} style={primaryBtnStyle}>
          {isLast ? 'התחל תרגול ←' : 'הבא ←'}
        </button>
      </div>
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

  // ── Single-pane fallback (mind map closed) ──────────────────────────────────
  if (!mindmapOpen) {
    return rightPane
  }

  // ── Split layout (mind map on the left in LTR DOM, RTL still works) ─────────
  return (
    <div ref={containerRef} dir="ltr" style={{
      flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0,
      background: 'transparent',
    }}>
      {/* Mind map iframe — left side (LTR-first child) */}
      <div style={{ width: `${splitPct}%`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <iframe
          ref={mindmapRef}
          src={`${import.meta.env.BASE_URL}mindmap.html?mode=mm&userId=${encodeURIComponent(userId)}`}
          title="Mind Map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fafbff' }}
        />
        {/* Pinned label in iframe corner */}
        <div style={{
          position: 'absolute', top: 8, right: 12, zIndex: 4,
          background: 'rgba(99,102,241,0.85)', color: '#fff',
          padding: '4px 12px', borderRadius: 12,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
          fontFamily: "'Rubik', sans-serif",
          pointerEvents: 'none',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
        }}>
          🧠 מפת המושגים שלי
        </div>
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

