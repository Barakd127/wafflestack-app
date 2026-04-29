import { useState, useEffect } from 'react'
import { getQuestionsForBuilding } from '../hooks/useQuiz'
import { getQuizForBuilding } from './StatChallenge'

const BUILDINGS_META = [
  { id: 'power',      label: '⚡ תחנת כוח',   concept: 'ממוצע',          color: '#FFD700' },
  { id: 'housing',    label: '🏠 מנהל דיור',  concept: 'חציון',          color: '#4ECDC4' },
  { id: 'traffic',    label: '🚦 בקרת תנועה', concept: 'סטיית תקן',      color: '#FF6B6B' },
  { id: 'hospital',   label: '🏥 בית חולים',  concept: 'נורמלית',        color: '#95E1D3' },
  { id: 'school',     label: '🏫 בית ספר',    concept: 'מדגם',           color: '#AA96DA' },
  { id: 'bank',       label: '🏦 בנק',        concept: 'רגרסיה',         color: '#FCBAD3' },
  { id: 'market',     label: '🏪 שוק',        concept: 'קורלציה',        color: '#A8E6CF' },
  { id: 'city-hall',  label: '🏛️ עיריה',      concept: 'בינום',          color: '#F38181' },
  { id: 'research',   label: '🔬 מכון מחקר',  concept: 'מבחן השערות',    color: '#C3A6FF' },
  { id: 'news',       label: '📰 תחנת חדשות', concept: 'רווח סמך',       color: '#FFB347' },
]

interface ExamQuestion {
  buildingId: string
  label: string
  concept: string
  color: string
  q: string
  options: string[]
  correct: number
  explanation: string
}

interface Props {
  onClose: () => void
}

const EXAM_DURATION = 10 * 60

function buildExam(): ExamQuestion[] {
  return BUILDINGS_META.map(b => {
    const bankQs = getQuestionsForBuilding(b.id)
    const pool = bankQs.length > 0 ? bankQs : getQuizForBuilding(b.id)
    const q = pool[Math.floor(Math.random() * pool.length)]
    return { buildingId: b.id, label: b.label, concept: b.concept, color: b.color, ...q }
  })
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** מזהה אם מחרוזת כוללת עברית ומחזיר direction מתאים */
function textDir(text: string): 'rtl' | 'ltr' {
  return /[֐-׿]/.test(text) ? 'rtl' : 'ltr'
}

export default function ExamMode({ onClose }: Props) {
  const [questions] = useState<ExamQuestion[]>(() => buildExam())
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(10).fill(null))
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [done, setDone] = useState(false)
  const [timeTakenSecs, setTimeTakenSecs] = useState(0)
  const [startTime] = useState(() => Date.now())

  useEffect(() => {
    if (done) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setDone(true)
          setTimeTakenSecs(Math.floor((Date.now() - startTime) / 1000))
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [done, startTime])

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    const next = [...answers]
    next[index] = idx
    setAnswers(next)
  }

  const goNext = () => {
    if (index + 1 >= questions.length) {
      setDone(true)
      setTimeTakenSecs(Math.floor((Date.now() - startTime) / 1000))
    } else {
      setIndex(i => i + 1)
      setSelected(null)
    }
  }

  const score = answers.filter((a, i) => a !== null && a === questions[i].correct).length
  const current = questions[index]
  const urgent = timeLeft <= 60 && !done

  if (done) {
    const timedOut = timeLeft === 0
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Heebo', system-ui, sans-serif", padding: 16,
      }}>
        <div style={{
          background: 'linear-gradient(35deg, #FFFFFF, #D8E7FA, #B8D0F5)',
          border: '1px solid rgba(31,62,108,0.2)',
          borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflow: 'auto', padding: '28px 24px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>
              {score >= 9 ? '🏆' : score >= 7 ? '⭐' : score >= 5 ? '👍' : '📖'}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#1F3E6C', lineHeight: 1, marginBottom: 4 }}>
              {score}/10
            </div>
            <div style={{ fontSize: 12, color: '#7F9BD9', marginBottom: 8 }}>
              {timedOut ? '⏰ Time\'s up!' : `⏱️ ${formatTime(timeTakenSecs)}`}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1F3E6C', marginBottom: 4 }}>
              {score >= 9 ? 'מצוין! כמעט מושלם!' : score >= 7 ? 'כל הכבוד!' : score >= 5 ? 'המשיכו לתרגל' : 'צריכים עוד תרגול'}
            </div>
            <div style={{ fontSize: 12, color: '#7F9BD9', marginBottom: 20 }}>
              {Math.round((score / 10) * 100)}% correct
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {questions.map((q, i) => {
              const ans = answers[i]
              const correct = ans !== null && ans === q.correct
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 10,
                  background: correct ? 'rgba(31,122,110,0.12)' : 'rgba(155,32,32,0.08)',
                  border: `1px solid ${correct ? 'rgba(31,122,110,0.3)' : 'rgba(155,32,32,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 11, color: q.color, fontWeight: 700 }}>{q.concept}</span>
                    <span style={{
                      fontSize: 11, color: '#7F9BD9',
                      direction: 'rtl', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {q.q}
                    </span>
                    {!correct && ans !== null && (
                      <span style={{ fontSize: 10, color: '#1F7A6E', direction: 'rtl' }}>
                        ✓ {q.options[q.correct]}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 16, marginLeft: 10, flexShrink: 0, color: correct ? '#1F7A6E' : '#9B2020' }}>
                    {correct ? '✓' : '✗'}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setAnswers(new Array(10).fill(null))
                setIndex(0)
                setSelected(null)
                setTimeLeft(EXAM_DURATION)
                setDone(false)
                setTimeTakenSecs(0)
              }}
              style={{
                flex: 1, padding: '11px',
                background: 'rgba(31,122,110,0.12)', border: '1px solid rgba(31,122,110,0.3)',
                borderRadius: 10, color: '#1F7A6E', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              🔄 נסו שוב
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '11px',
                background: 'rgba(31,62,108,0.07)', border: '1px solid rgba(31,62,108,0.2)',
                borderRadius: 10, color: '#254A9F', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              🏙️ חזרה לעיר
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: "'Heebo', system-ui, sans-serif",
    }}>
      <div style={{
        background: 'linear-gradient(35deg, #FFFFFF, #D8E7FA, #B8D0F5)',
        border: `1px solid ${urgent ? '#FF6B6B44' : current.color + '44'}`,
        borderRadius: 20, width: '100%', maxWidth: 580,
        overflow: 'hidden',
        boxShadow: `0 0 60px ${urgent ? 'rgba(255,107,107,0.1)' : current.color + '18'}`,
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(31,62,108,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: urgent ? 'rgba(155,32,32,0.06)' : 'rgba(255,255,255,0.4)',
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#7F9BD9', textTransform: 'uppercase' as const, marginBottom: 2 }}>
              📝 מצב בחינה — EXAM MODE
            </div>
            <div style={{ fontSize: 13, color: current.color, fontWeight: 700 }}>
              {current.concept} — {current.label}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              fontSize: 15, fontWeight: 800,
              color: urgent ? '#9B2020' : '#254A9F',
              fontFamily: 'monospace',
            }}>
              {urgent ? '⚠️ ' : '⏱️ '}{formatTime(timeLeft)}
            </span>
            <span style={{ fontSize: 11, color: '#7F9BD9', fontFamily: 'monospace' }}>
              {index + 1}/{questions.length}
            </span>
            <button
              onClick={onClose}
              title="Exit exam"
              style={{
                background: 'rgba(31,62,108,0.07)', border: '1px solid rgba(31,62,108,0.2)',
                borderRadius: 8, width: 30, height: 30, color: '#254A9F',
                cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(31,62,108,0.08)' }}>
          <div style={{
            height: '100%', background: urgent ? '#9B2020' : current.color,
            width: `${(index / questions.length) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Body */}
        <div style={{ padding: '22px 22px' }}>
          {/* Question text */}
          <div style={{
            fontSize: 17, fontWeight: 700, color: '#1F3E6C',
            lineHeight: 1.55, direction: textDir(current.q), textAlign: textDir(current.q) === 'rtl' ? 'right' : 'left',
            marginBottom: 14, padding: '16px 18px',
            background: 'rgba(255,255,255,0.55)',
            borderRadius: 12,
            borderRight: `3px solid ${current.color}`,
            boxShadow: '0 0 0 1px rgba(31,62,108,0.08)',
          }}>
            {current.q}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {current.options.map((opt, idx) => {
              const isCorrect = idx === current.correct
              const isSelected = idx === selected
              let bg = 'rgba(255,255,255,0.55)'
              let border = '1px solid rgba(31,62,108,0.1)'
              let textColor = '#254A9F'
              if (selected !== null) {
                if (isCorrect) { bg = 'rgba(31,122,110,0.12)'; border = '2px solid #1F7A6E'; textColor = '#1F7A6E' }
                else if (isSelected) { bg = 'rgba(155,32,32,0.08)'; border = '1px solid #9B2020'; textColor = '#9B2020' }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  style={{
                    background: bg, border, borderRadius: 10,
                    padding: '11px 14px', cursor: selected !== null ? 'default' : 'pointer',
                    color: textColor, fontSize: 13,
                    textAlign: textDir(opt) === 'rtl' ? 'right' : 'left',
                    direction: textDir(opt), transition: 'all 0.2s',
                    display: 'flex', gap: 10, alignItems: 'center',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: selected !== null && isCorrect ? '#1F7A6E' : 'rgba(31,62,108,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    color: selected !== null && isCorrect ? '#fff' : 'inherit',
                  }}>
                    {selected !== null && isCorrect ? '✓' : String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Next button */}
          {selected !== null && (
            <div style={{ marginTop: 14 }}>
              <button
                onClick={goNext}
                style={{
                  width: '100%', padding: '11px',
                  background: '#3351CA', border: 'none', borderRadius: 10,
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                {index + 1 >= questions.length ? '📊 ראו תוצאות' : 'שאלה הבאה →'}
              </button>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 11, color: '#7F9BD9', textAlign: 'center' }}>
            מצב בחינה — ללא רמזים · הסברים מוצגים בסיום
          </div>
        </div>
      </div>
    </div>
  )
}
