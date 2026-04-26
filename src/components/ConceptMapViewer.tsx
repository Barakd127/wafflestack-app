import { useState } from 'react'
import ConceptMapGalaxy  from './ConceptMapGalaxy'
import ConceptMapFlow    from './ConceptMapFlow'
import ConceptMapCluster from './ConceptMapCluster'

type MapVersion = 'galaxy' | 'flow' | 'cluster'

const VERSIONS: { id: MapVersion; label: string; description: string; emoji: string }[] = [
  { id: 'galaxy',  emoji: '🌌', label: 'גלקסיה',   description: 'מבנה רדיאלי — ממוצע במרכז, כל המושגים מקיפים אותו' },
  { id: 'flow',    emoji: '➡️', label: 'זרימה',    description: 'מסלול לימוד — מיסודות להסקה סטטיסטית' },
  { id: 'cluster', emoji: '🫧', label: 'אשכולות', description: 'קבוצות לפי תחום — מרכז, פיזור, הסקה' },
]

interface Props {
  onClose: () => void
  onOpenChallenge?: (buildingId: string) => void
}

export default function ConceptMapViewer({ onClose }: Props) {
  const [active, setActive] = useState<MapVersion>('galaxy')

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,5,15,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 460, backdropFilter: 'blur(8px)', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
          border: '1px solid rgba(78,205,196,0.22)',
          borderRadius: 22,
          width: '100%', maxWidth: 760,
          fontFamily: "'Heebo', system-ui, sans-serif",
          color: 'white',
          boxShadow: '0 0 60px rgba(78,205,196,0.1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, direction: 'rtl' }}>🗺️ מפת המושגים</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 4, direction: 'rtl' }}>
              {VERSIONS.find(v => v.id === active)?.description}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10, width: 36, height: 36, color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Version tabs */}
        <div style={{
          display: 'flex', gap: 8, padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          direction: 'rtl',
        }}>
          {VERSIONS.map(v => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              style={{
                background: active === v.id ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${active === v.id ? 'rgba(78,205,196,0.5)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 20, padding: '6px 16px',
                color: active === v.id ? '#4ECDC4' : 'rgba(255,255,255,0.55)',
                fontSize: 13, fontWeight: active === v.id ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.18s',
                fontFamily: "'Heebo', system-ui, sans-serif",
              }}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>

        {/* Map canvas */}
        <div style={{ padding: '0 12px 12px', overflow: 'hidden' }}>
          {active === 'galaxy'  && <ConceptMapGalaxy />}
          {active === 'flow'    && <ConceptMapFlow />}
          {active === 'cluster' && <ConceptMapCluster />}
        </div>
      </div>
    </div>
  )
}
