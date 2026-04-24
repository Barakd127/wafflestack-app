import { useMemo } from 'react'

interface LearningMapProps {
  mastered: Set<string>
  onClose: () => void
  onOpenChallenge: (buildingId: string) => void
}

const LEARNING_PATH = [
  { id: 'power',    labelHe: 'ממוצע',            labelEn: 'Mean',                emoji: '⚡', xpReq: 0   },
  { id: 'traffic',  labelHe: 'סטיית תקן',         labelEn: 'Std Dev',             emoji: '🚦', xpReq: 50  },
  { id: 'hospital', labelHe: 'התפלגות נורמלית',   labelEn: 'Normal Distribution', emoji: '🏥', xpReq: 100 },
  { id: 'research', labelHe: 'מבחן השערות',        labelEn: 'Hypothesis Testing',  emoji: '🔬', xpReq: 150 },
  { id: 'bank',     labelHe: 'רגרסיה',            labelEn: 'Regression',          emoji: '🏦', xpReq: 200 },
]

export default function LearningMap({ mastered, onClose, onOpenChallenge }: LearningMapProps) {
  const nodeStates = useMemo(() => {
    return LEARNING_PATH.map((node, i) => {
      const isMastered = mastered.has(node.id)
      const prevMastered = i === 0 || mastered.has(LEARNING_PATH[i - 1].id)
      const isLocked = !prevMastered && !isMastered
      return { ...node, isMastered, isLocked }
    })
  }, [mastered])

  const currentIndex = nodeStates.findIndex(n => !n.isMastered && !n.isLocked)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 460, backdropFilter: 'blur(8px)', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
          border: '1px solid rgba(78,205,196,0.25)',
          borderRadius: 20, padding: '24px 28px',
          maxWidth: 680, width: '100%',
          fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
          boxShadow: '0 0 60px rgba(78,205,196,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>📍 מסלול הלמידה</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
              5 מושגים מרכזיים · לחץ על מושג לפתיחת האתגר
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, width: 36, height: 36,
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Path */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {nodeStates.map((node, i) => {
            const isCurrent = i === currentIndex
            const borderColor = node.isMastered ? '#4ECDC4' : isCurrent ? '#FFD700' : 'rgba(255,255,255,0.15)'
            const bgColor = node.isMastered ? 'rgba(78,205,196,0.15)' : isCurrent ? 'rgba(255,215,0,0.1)' : 'rgba(15,15,35,0.9)'
            const textColor = node.isMastered ? '#4ECDC4' : isCurrent ? '#FFD700' : 'rgba(255,255,255,0.35)'
            const badge = node.isMastered ? '✓' : isCurrent ? '→' : '🔒'

            return (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Connector line */}
                {i > 0 && (
                  <div style={{
                    width: 36, height: 2,
                    background: nodeStates[i - 1].isMastered && !node.isLocked
                      ? 'rgba(78,205,196,0.5)'
                      : 'rgba(255,255,255,0.1)',
                    flexShrink: 0,
                  }} />
                )}

                {/* Node */}
                <button
                  onClick={() => { if (!node.isLocked) { onOpenChallenge(node.id); onClose() } }}
                  disabled={node.isLocked}
                  title={node.isLocked ? 'שלב נעול — השלם את השלב הקודם תחילה' : `${node.labelHe} · לחץ לפתיחת האתגר`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, background: 'none', border: 'none', cursor: node.isLocked ? 'default' : 'pointer',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: node.isMastered ? '0 0 16px rgba(78,205,196,0.25)' : isCurrent ? '0 0 12px rgba(255,215,0,0.2)' : 'none',
                  }}>
                    <span style={{ fontSize: 22 }}>{node.isLocked ? '🔒' : node.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: borderColor }}>{badge}</span>
                  </div>
                  <div style={{ textAlign: 'center', maxWidth: 80 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{node.labelHe}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{node.labelEn}</div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center', marginTop: 28,
          fontSize: 12, color: 'rgba(255,255,255,0.45)',
        }}>
          <span><span style={{ color: '#4ECDC4' }}>✓</span> נלמד</span>
          <span><span style={{ color: '#FFD700' }}>→</span> עכשיו</span>
          <span>🔒 נעול</span>
        </div>

        {/* Progress summary */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'rgba(78,205,196,0.06)', borderRadius: 12,
          border: '1px solid rgba(78,205,196,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            התקדמות: <span style={{ color: '#4ECDC4', fontWeight: 700 }}>
              {nodeStates.filter(n => n.isMastered).length} / {LEARNING_PATH.length}
            </span> מושגים
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {nodeStates.map(n => (
              <div
                key={n.id}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: n.isMastered ? '#4ECDC4' : n.isLocked ? 'rgba(255,255,255,0.1)' : '#FFD700',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
