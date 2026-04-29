/**
 * ReviewMode — Compact review overlay for already-mastered buildings.
 * Shows concept explanation + formula + topic visualization; no quiz.
 * Mastered buildings open this instead of the full StatChallenge.
 */

import { TopicViz } from './TopicViz'
import { CHALLENGES, BuildingInfo } from './StatChallenge'


interface Props {
  building: BuildingInfo
  onClose: () => void
  onReQuiz?: () => void
}

export default function ReviewMode({ building, onClose, onReQuiz }: Props) {
  const challenge = CHALLENGES[building.id]
  const color = building.color ?? challenge?.color ?? '#4ECDC4'

  if (!challenge) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, backdropFilter: 'blur(12px)', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0a0a18 0%, #0f1525 100%)',
          border: `2px solid ${color}44`,
          borderRadius: 20, padding: '28px 32px',
          maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
          boxShadow: `0 0 60px ${color}22`, position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close review"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '5px 12px',
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>{challenge.emoji}</div>
          <div style={{ fontSize: 21, fontWeight: 800, color }}>{challenge.concept}</div>
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2,
            direction: 'rtl',
          }}>
            {challenge.conceptHe} — {building.label}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 8,
            background: 'rgba(78,205,196,0.12)',
            border: '1px solid rgba(78,205,196,0.3)',
            borderRadius: 20, padding: '2px 10px',
            fontSize: 11, color: '#4ECDC4',
          }}>
            ✓ Mastered
          </span>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.35)', borderRadius: 14,
          padding: '14px 8px 8px', marginBottom: 18,
          border: `1px solid ${color}22`, overflow: 'hidden',
        }}>
          <div style={{
            fontSize: 10, color: `${color}99`, letterSpacing: 2,
            marginBottom: 10, paddingLeft: 8, fontWeight: 600,
          }}>
            ✦ ויזואליזציה
          </div>
          <div style={{ minWidth: 0, overflowX: 'auto' }}>
            <TopicViz id={building.id} color={color} width={520} height={200} />
          </div>
        </div>

        <div style={{
          background: `${color}0d`,
          borderLeft: `3px solid ${color}`,
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px', marginBottom: 14,
          fontSize: 14, color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.7, direction: 'rtl', textAlign: 'right',
        }}>
          {challenge.explanation}
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${color}33`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 22,
          fontFamily: 'monospace', fontSize: 14,
          color, letterSpacing: 0.5, textAlign: 'center',
        }}>
          {challenge.formula}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {onReQuiz && (
            <button
              onClick={onReQuiz}
              style={{
                flex: 1, padding: '12px',
                background: `${color}22`,
                border: `1px solid ${color}55`,
                borderRadius: 10, color,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              🔄 Re-Quiz
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
