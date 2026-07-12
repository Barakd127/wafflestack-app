/**
 * WhiteboardRecall — stage 4 of the Whiteboard Learning Plan: "the board erases
 * and asks."
 *
 * At the end of a lesson the board wipes itself and asks 2–3 recall questions.
 * Passing (≥2 correct) records a real quiz session via progressStore, which is
 * exactly what retrievalGate reads to GATE the topic — so this is the one place
 * in the app where learning *produces* the retrieval-gate pass the Bridge & City
 * economy consumes. Learn → recall → gate → (bridges + buildings unlock).
 *
 * MC-only (quiz-bank shape), RTL Hebrew, math rendered (never raw LaTeX).
 */
import { useEffect, useMemo, useState } from 'react'
import quizBank from '../data/quiz-bank.json'
import { MathText } from '../lib/mathRender'
import {
  loadProgress, recordQuizSession, saveProgress, type QuizAnswer,
} from '../stores/progressStore'

interface RecallQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

interface QuizBankShape {
  topics: Record<string, {
    concept?: string
    building?: string
    questions: Array<{ id: string; question: string; options: string[]; correctIndex: number }>
  }>
}

const PASS_THRESHOLD = 2 // ≥2 correct gates the topic (matches retrievalGate MIN_CORRECT)

/** Pull up to `n` questions for a topic. Stable per mount, light spread by id. */
function pickRecallQuestions(topicId: string, n = 3): RecallQuestion[] {
  const bank = (quizBank as unknown as QuizBankShape).topics?.[topicId]
  if (!bank?.questions?.length) return []
  const pool = bank.questions.filter(q => Array.isArray(q.options) && typeof q.correctIndex === 'number')
  // Spread the picks across the pool instead of always the first n.
  const step = Math.max(1, Math.floor(pool.length / n))
  const out: RecallQuestion[] = []
  for (let i = 0; i < pool.length && out.length < n; i += step) {
    const q = pool[i]
    out.push({ id: q.id, question: q.question, options: q.options, correctIndex: q.correctIndex })
  }
  return out
}

export interface WhiteboardRecallProps {
  topicId: string
  hebrewName: string
  userId: string
  /** Called after a passing recall (topic is now gated). */
  onPass: (topicId: string) => void
  onClose: () => void
}

type Phase = 'wipe' | 'recall' | 'result'

export default function WhiteboardRecall({ topicId, hebrewName, userId, onPass, onClose }: WhiteboardRecallProps) {
  const questions = useMemo(() => pickRecallQuestions(topicId, 3), [topicId])
  const [phase, setPhase] = useState<Phase>('wipe')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const startedAt = useMemo(() => Date.now(), [])

  // Kick off the wipe → recall transition (respects reduced motion via CSS).
  useEffect(() => {
    const t = setTimeout(() => setPhase(questions.length ? 'recall' : 'result'), 1300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const correctCount = answers.filter(a => a.correct).length
  const passed = correctCount >= PASS_THRESHOLD

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    const q = questions[qIndex]
    const correct = i === q.correctIndex
    const next = [...answers, { questionId: q.id, answered: true, correct, userAnswer: q.options[i] }]
    setAnswers(next)
    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1)
        setSelected(null)
      } else {
        finish(next)
      }
    }, 900)
  }

  function finish(finalAnswers: QuizAnswer[]) {
    const bank = (quizBank as unknown as QuizBankShape).topics?.[topicId]
    const progress = loadProgress(userId)
    const duration = Math.round((Date.now() - startedAt) / 1000)
    const updated = recordQuizSession(
      progress, topicId, bank?.concept ?? topicId, bank?.building ?? '', finalAnswers, duration,
    )
    saveProgress(updated)
    setPhase('result')
    if (finalAnswers.filter(a => a.correct).length >= PASS_THRESHOLD) onPass(topicId)
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 300, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(10,18,40,0.92)', backdropFilter: 'blur(4px)',
    padding: 16,
  }
  const card: React.CSSProperties = {
    maxWidth: 640, width: '100%', borderRadius: 16, padding: '28px 22px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--sh-text-dark)', textAlign: 'center',
  }

  return (
    <div dir="rtl" style={overlay} role="dialog" aria-modal="true" aria-label="לוח החזרה">
      {phase === 'wipe' && (
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div className="wr-wipe" aria-hidden />
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>מוחקים את הלוח…</div>
          <div style={{ fontSize: 15, opacity: 0.8 }}>מה נשאר לך בראש מ<strong> {hebrewName}</strong>?</div>
        </div>
      )}

      {phase === 'recall' && questions[qIndex] && (
        <div style={card}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>
            שליפה מהזיכרון · שאלה {qIndex + 1} מתוך {questions.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, lineHeight: 1.5 }}>
            <MathText text={questions[qIndex].question} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {questions[qIndex].options.map((opt, i) => {
              const isSel = selected === i
              const isCorrect = i === questions[qIndex].correctIndex
              let bg = 'rgba(255,255,255,0.06)'
              let border = 'rgba(255,255,255,0.14)'
              if (selected !== null) {
                if (isCorrect) { bg = 'rgba(52,168,83,0.22)'; border = 'rgba(52,168,83,0.5)' }
                else if (isSel) { bg = 'rgba(234,67,53,0.20)'; border = 'rgba(234,67,53,0.5)' }
              }
              return (
                <div
                  key={i}
                  role="button"
                  aria-disabled={selected !== null}
                  tabIndex={0}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') choose(i) }}
                  style={{
                    minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '10px 12px', borderRadius: 10, cursor: selected === null ? 'pointer' : 'default',
                    background: bg, border: `1px solid ${border}`, color: 'var(--sh-text-dark)',
                    fontSize: 15, fontWeight: 600, transition: 'background 0.2s, border 0.2s',
                  }}
                >
                  <MathText text={opt} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={card}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{passed ? '🌟' : '🌫️'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
            {passed ? 'הלוח נדלק מחדש!' : 'הלוח עדיין מעורפל'}
          </div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 6, lineHeight: 1.6 }}>
            {questions.length > 0
              ? `נזכרת נכון ב-${correctCount} מתוך ${questions.length}.`
              : 'אין עדיין שאלות חזרה לנושא הזה.'}
          </div>
          <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 20, lineHeight: 1.6 }}>
            {passed
              ? `נושא "${hebrewName}" עבר את לוח החזרה — נפתחו לו גשרים וחנות, והוא ייכנס לתור החזרה המרווחת (מחר, בעוד 3 ימים, בעוד שבוע).`
              : 'צריך עוד שליפה אחת מוצלחת כדי לפתוח את הנושא. אפשר לחזור על הלוח או ללמוד שוב.'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {!passed && questions.length > 0 && (
              <button
                onClick={() => { setAnswers([]); setQIndex(0); setSelected(null); setPhase('recall') }}
                style={btnStyle('rgba(212,175,55,0.9)')}
              >
                חזרה על הלוח
              </button>
            )}
            <button onClick={onClose} style={btnStyle('rgba(255,255,255,0.1)')}>
              {passed ? 'המשך' : 'סגור'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .wr-wipe {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent);
          transform: translateX(-100%);
          animation: wr-sweep 1.2s ease-in-out forwards;
        }
        @keyframes wr-sweep { to { transform: translateX(100%); } }
        @media (prefers-reduced-motion: reduce) {
          .wr-wipe { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    minHeight: 44, padding: '10px 20px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.2)', background: bg,
    color: 'var(--sh-text-dark)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  }
}
