import { useEffect, useState, useCallback } from 'react'

export interface FlashCard {
  id: string
  emoji: string
  labelHe: string
  labelEn: string
  formula: string
  preview: string
  color: string
}

interface Props {
  cards: FlashCard[]
  mastered: Set<string>
  onClose: () => void
}

const REVIEWED_KEY = 'wafflestack-reviewed'

function loadReviewed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(REVIEWED_KEY) || '[]')) }
  catch { return new Set() }
}
function saveReviewed(s: Set<string>) {
  localStorage.setItem(REVIEWED_KEY, JSON.stringify(Array.from(s)))
}

const FLIP_STYLE = `
@keyframes fc-fadein { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
.fc-scene { perspective: 1200px; }
.fc-card {
  position: relative;
  width: 100%;
  min-height: 220px;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(.4,.2,.2,1);
  cursor: pointer;
}
.fc-card.flipped { transform: rotateY(180deg); }
.fc-face {
  position: absolute; inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 20px;
  padding: 32px 28px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}
.fc-face.back { transform: rotateY(180deg); }
`

export default function FlashcardMode({ cards, mastered, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Set<string>>(() => loadReviewed())

  const card = cards[index]
  const isMastered = mastered.has(card.id)
  const isReviewed = reviewed.has(card.id)

  const next = useCallback(() => { setIndex(i => (i + 1) % cards.length); setFlipped(false) }, [cards.length])
  const prev = useCallback(() => { setIndex(i => (i - 1 + cards.length) % cards.length); setFlipped(false) }, [cards.length])
  const flip = useCallback(() => setFlipped(f => !f), [])

  const markReviewed = useCallback(() => {
    setReviewed(prev => {
      const updated = new Set(prev)
      updated.add(card.id)
      saveReviewed(updated)
      return updated
    })
    setTimeout(next, 250)
  }, [card.id, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      else if (e.key === ' ') { e.preventDefault(); flip() }
      else if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, flip, onClose])

  const reviewedCount = reviewed.size

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 480, backdropFilter: 'blur(10px)', padding: 20,
        animation: 'fc-fadein 0.18s ease-out',
      }}
      onClick={onClose}
    >
      <style>{FLIP_STYLE}</style>
      <div
        style={{
          background: 'linear-gradient(160deg, #0a0a18 0%, #0f1525 100%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
          padding: '28px 32px', width: '100%', maxWidth: 480,
          fontFamily: "'Heebo', system-ui, sans-serif", color: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>📇 Flash Cards</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {reviewedCount}/{cards.length} reviewed · כרטיס {index + 1} מתוך {cards.length}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="סגור"
          >✕</button>
        </div>

        <div className="fc-scene" style={{ marginBottom: 20 }}>
          <div className={`fc-card${flipped ? ' flipped' : ''}`} onClick={flip}>
            <div
              className="fc-face front"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.12)',
              }}
            >
              {(isMastered || isReviewed) && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6,
                }}>
                  {isMastered && (
                    <span style={{
                      fontSize: 10, color: '#4ECDC4', fontWeight: 700,
                      background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)',
                      borderRadius: 10, padding: '2px 8px',
                    }}>✓ נלמד</span>
                  )}
                  {isReviewed && !isMastered && (
                    <span style={{
                      fontSize: 10, color: '#FFC700', fontWeight: 700,
                      background: 'rgba(255,199,0,0.12)', border: '1px solid rgba(255,199,0,0.25)',
                      borderRadius: 10, padding: '2px 8px',
                    }}>✓ נסקר</span>
                  )}
                </div>
              )}
              <div style={{ fontSize: 56, marginBottom: 12 }}>{card.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, direction: 'rtl' }}>
                {card.labelHe}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                👆 לחץ לגילוי · רווח להפוך
              </div>
            </div>
            <div
              className="fc-face back"
              style={{
                background: `linear-gradient(135deg, ${card.color}18 0%, transparent 100%)`,
                border: `2px solid ${card.color}55`,
              }}
            >
              <div style={{ fontSize: 14, color: card.color, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
                {card.labelEn}
              </div>
              <div style={{
                fontSize: 14, fontFamily: 'monospace', color: card.color,
                background: `${card.color}18`, border: `1px solid ${card.color}33`,
                borderRadius: 8, padding: '8px 16px', marginBottom: 14,
              }}>
                {card.formula}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 340 }}>
                {card.preview}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={prev}
            style={{
              flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
              color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
            }}
            aria-label="הקודם"
          >← הקודם</button>
          <button
            onClick={markReviewed}
            disabled={isReviewed}
            style={{
              flex: 2, padding: '10px',
              background: isReviewed ? 'rgba(78,205,196,0.18)' : `${card.color}22`,
              border: `1px solid ${isReviewed ? 'rgba(78,205,196,0.4)' : card.color + '44'}`,
              borderRadius: 10,
              color: isReviewed ? '#4ECDC4' : card.color,
              fontSize: 13, cursor: isReviewed ? 'default' : 'pointer', fontWeight: 700,
              opacity: isReviewed ? 0.85 : 1,
            }}
          >
            {isReviewed ? '✓ אני יודע את זה' : '💡 אני יודע את זה'}
          </button>
          <button
            onClick={next}
            style={{
              flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
              color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
            }}
            aria-label="הבא"
          >הבא →</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {cards.map((c, i) => (
            <div
              key={c.id}
              onClick={() => { setIndex(i); setFlipped(false) }}
              style={{
                width: index === i ? 20 : 7, height: 7, borderRadius: 4,
                background: index === i
                  ? card.color
                  : reviewed.has(c.id)
                    ? 'rgba(255,199,0,0.5)'
                    : mastered.has(c.id)
                      ? 'rgba(78,205,196,0.4)'
                      : 'rgba(255,255,255,0.2)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
