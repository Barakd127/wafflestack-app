import { useState, useEffect, useRef } from 'react'
import { LESSON_CONTENT } from '../data/lesson-content'

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
  const completedRef = useRef(false)

  const slides = lesson?.slides ?? []
  const total = slides.length
  const isFirst = currentSlide === 0
  const isLast = total > 0 && currentSlide === total - 1

  const handleStartQuiz = (markComplete: boolean) => {
    if (markComplete && !completedRef.current) {
      completedRef.current = true
      onComplete(topicId)
    }
    onStartQuiz()
  }

  const handleNext = () => {
    if (isLast) {
      handleStartQuiz(true)
    } else {
      setCurrentSlide(s => Math.min(total - 1, s + 1))
    }
  }
  const handlePrev = () => setCurrentSlide(s => Math.max(0, s - 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  return (
    <div dir="rtl" style={{ flex: 1, overflow: 'auto', padding: '32px 40px', fontFamily: "'Rubik', 'Assistant', sans-serif" }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onBack} style={backLinkStyle}>→ חזרה לבחירת נושא</button>
        <button onClick={() => handleStartQuiz(false)} style={skipLinkStyle}>דלג לתרגול ←</button>
      </div>

      {/* Title */}
      <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 6, textAlign: 'right' }}>
        📚 {lesson.hebrewName}
      </h2>
      <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 13, color: TEXT_LIGHT, marginBottom: 24, textAlign: 'right' }}>
        שקופית {currentSlide + 1} מתוך {total}
      </div>

      {/* Slide card */}
      <div style={{ ...glassCardStyle, padding: '32px 36px', maxWidth: 760, marginBottom: 24, minHeight: 320 }}>
        <h3 style={{ fontFamily: "'Rubik', sans-serif", fontSize: 22, fontWeight: 700, color: TEXT_DARK, marginTop: 0, marginBottom: 16, textAlign: 'right' }}>
          {slide.title}
        </h3>
        <div style={{ fontFamily: "'Assistant', sans-serif", fontSize: 16, color: TEXT_MED, lineHeight: 1.8, textAlign: 'right', whiteSpace: 'pre-wrap' }}>
          {slide.content}
        </div>
        {slide.formula && (
          <div style={{
            marginTop: 22,
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
        )}
      </div>

      {/* Footer controls */}
      <div style={{ maxWidth: 760, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button
          onClick={handlePrev}
          disabled={isFirst}
          style={{
            ...secondaryBtnStyle,
            opacity: isFirst ? 0.4 : 1,
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}
        >
          → הקודם
        </button>

        {/* Dot strip */}
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`עבור לשקופית ${idx + 1}`}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: idx === currentSlide ? BUTTON_COLOR : 'rgba(127,155,217,0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        <button onClick={handleNext} style={primaryBtnStyle}>
          {isLast ? 'התחל תרגול ←' : 'הבא ←'}
        </button>
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
