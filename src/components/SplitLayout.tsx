import { useState, useCallback, useRef } from 'react'
import WaffleStackCity from './WaffleStackCityGodot'
import StudyHub from './StudyHub'

interface SplitLayoutProps {
  onBack: () => void
  darkMode?: boolean
}

/**
 * SplitLayout — two-panel view: 3D city on the left, Study Hub on the right.
 *
 * A draggable resize handle at the boundary lets the user adjust the split.
 * Default split: 55% city / 45% study.
 *
 * The exit button (top-centre) navigates back to the caller.
 */
export default function SplitLayout({ onBack, darkMode }: SplitLayoutProps) {
  // City panel width as a percentage (clamped to 30%–75%)
  const [cityPct, setCityPct] = useState(54)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Drag-to-resize ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    e.preventDefault()

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setCityPct(Math.max(30, Math.min(75, pct)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: '#0d0d1a',
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        height: 40,
        background: 'rgba(13,13,26,0.97)',
        borderBottom: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0, zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#818cf8', borderRadius: 8,
            padding: '4px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          ← חזרה
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            🏙️ עיר 3D
          </span>
          <div style={{
            width: 1, height: 14,
            background: 'rgba(99,102,241,0.35)',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            📚 לימוד
          </span>
        </div>

        {/* Quick-split presets */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[['50/50', 50], ['60/40', 60], ['40/60', 40]] .map(([label, pct]) => (
            <button
              key={label as string}
              onClick={() => setCityPct(pct as number)}
              style={{
                background: cityPct === pct ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${cityPct === pct ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)'}`,
                color: cityPct === pct ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
                fontSize: 11, fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split panels ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* City panel */}
        <div style={{ width: `${cityPct}%`, height: '100%', position: 'relative', flexShrink: 0 }}>
          <WaffleStackCity onBack={onBack} />
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          style={{
            width: 6, height: '100%', flexShrink: 0,
            background: 'rgba(99,102,241,0.2)',
            cursor: 'col-resize',
            position: 'relative',
            transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.55)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.2)' }}
        >
          <div style={{
            width: 2, height: 40, borderRadius: 2,
            background: 'rgba(165,180,252,0.6)',
          }} />
        </div>

        {/* Study panel */}
        <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
          <StudyHub
            onViewChange={() => {/* handled internally — no full-view transitions in split mode */}}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  )
}
