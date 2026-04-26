import { useEffect, useState } from 'react'

interface Score {
  name: string
  xp: number
  mastered: number
  date: string
}

interface Props {
  onClose: () => void
}

export function saveSessionScore(xp: number, mastered: number): void {
  const name = localStorage.getItem('userName') || 'Player'
  const date = new Date().toISOString().slice(0, 10)
  const entry: Score = { name, xp, mastered, date }
  try {
    const existing: Score[] = JSON.parse(localStorage.getItem('wafflestack_scores') || '[]')
    const updated = [...existing, entry]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5)
    localStorage.setItem('wafflestack_scores', JSON.stringify(updated))
  } catch {
    localStorage.setItem('wafflestack_scores', JSON.stringify([entry]))
  }
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export default function LocalLeaderboard({ onClose }: Props) {
  const [scores, setScores] = useState<Score[]>([])

  useEffect(() => {
    try {
      setScores(JSON.parse(localStorage.getItem('wafflestack_scores') || '[]'))
    } catch {
      setScores([])
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: 20, padding: '28px 28px 22px',
          minWidth: 320, maxWidth: 440, width: '90%',
          fontFamily: "'Heebo', system-ui, sans-serif",
          boxShadow: '0 0 60px rgba(255,215,0,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#FFD700', fontSize: 20, fontWeight: 700, margin: 0 }}>🏆 לוח תוצאות</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >✕</button>
        </div>

        {scores.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '24px 0', fontSize: 14 }}>
            אין עדיין תוצאות.<br />שחק קצת ותחזור! 🎮
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: i === 0 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: '10px 14px',
                }}
              >
                <span style={{ fontSize: 22, minWidth: 28 }}>{MEDALS[i]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{s.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#4ECDC4', fontWeight: 700, fontSize: 16 }}>{s.xp} XP</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{s.mastered}/10 מבנים</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 18 }}>
          תוצאות נשמרות מקומית במכשיר זה
        </p>
      </div>
    </div>
  )
}
