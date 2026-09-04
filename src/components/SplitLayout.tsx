import { useState, useCallback, useRef, useEffect } from 'react'
import WaffleStackCity from './WaffleStackCityGodot'
import StudyHub from './StudyHub'
import MindMapCanvas from './MindMapCanvas'

type RightTab = 'study' | 'mindmap'

interface SplitLayoutProps {
  onBack: () => void
  darkMode?: boolean
  /** Which panel to show on the right side initially. Defaults to 'study'. */
  initialRight?: RightTab
}

/**
 * SplitLayout — two-panel view: Godot 3D city on the left, tabbed Study/MindMap
 * on the right. A draggable handle between them lets the user resize.
 */
export default function SplitLayout({ onBack, darkMode, initialRight = 'study' }: SplitLayoutProps) {
  const [cityPct, setCityPct] = useState(54)
  const [rightTab, setRightTab] = useState<RightTab>(initialRight)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

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

  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <StudyHub
          onViewChange={() => {}}
          darkMode={darkMode}
        />
      </div>
    )
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(99,102,241,0.30)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.65)' : 'rgba(255,255,255,0.12)'}`,
    color: active ? '#c7d2fe' : 'rgba(255,255,255,0.55)',
    borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
    minHeight: 36,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  })

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: '#0d0d1a',
      }}
    >
      {/* Top bar */}
      <div style={{
        height: 44,
        background: 'rgba(13,13,26,0.97)',
        borderBottom: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0, zIndex: 100,
      }}>
        {/* Home button — belt-and-suspenders 2026-05-24 (user reported
            home button didn't work). Now: (1) calls onBack (parent state),
            (2) sets hash so listener fires, (3) hard-fallback timer in case
            React state didn't flip — force location.hash = #study after a
            tick if we're still on a split route. Three independent paths. */}
        <button
          onClick={() => {
            try { onBack() } catch(_){}
            try { window.location.hash = '#study' } catch(_){}
            setTimeout(() => {
              const h = window.location.hash
              if (h.startsWith('#split')) window.location.hash = '#study'
            }, 50)
          }}
          aria-label="חזרה לדף הבית"
          title="חזרה לדף הבית"
          style={{
            background: 'linear-gradient(135deg, #F2AF13 0%, #b8941f 100%)',
            border: '1px solid rgba(242,175,19,0.65)',
            color: '#1F2640',
            borderRadius: 10,
            padding: '8px 18px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(242,175,19,0.45)',
            minHeight: 44,
          }}
        >
          <span aria-hidden style={{ fontSize: 16 }}>🏠</span>
          <span>דף הבית</span>
        </button>

        {/* Right-pane tab switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginInlineEnd: 6 }}>
            🏙️ עיר 3D | בצד ימין:
          </span>
          <button
            onClick={() => setRightTab('study')}
            style={tabBtnStyle(rightTab === 'study')}
            onMouseEnter={e => { if (rightTab !== 'study') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { if (rightTab !== 'study') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
          >
            📚 לימוד
          </button>
          <button
            onClick={() => setRightTab('mindmap')}
            style={tabBtnStyle(rightTab === 'mindmap')}
            onMouseEnter={e => { if (rightTab !== 'mindmap') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { if (rightTab !== 'mindmap') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
          >
            🧠 מפת חשיבה
          </button>
        </div>

        {/* Quick-split presets */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[['50/50', 50], ['60/40', 60], ['40/60', 40]].map(([label, pct]) => (
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
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {/* Split panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* City panel */}
        <div style={{ width: `${cityPct}%`, height: '100%', position: 'relative', flexShrink: 0 }}>
          <WaffleStackCity onBack={onBack} />
        </div>

        {/* Resize handle */}
        {/* Resize handle — bumped from 6px to 12px hit-area with a more
            visible gold accent so users actually find + use the drag
            affordance. Per user 2026-05-24 (didn't realize handle existed). */}
        <div
          onMouseDown={onMouseDown}
          aria-label="גרור לשינוי גודל החלונות"
          title="גרור לשינוי גודל"
          style={{
            width: 12, height: '100%', flexShrink: 0,
            background: 'rgba(242,175,19,0.18)',
            borderInline: '1px solid rgba(242,175,19,0.45)',
            cursor: 'col-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(242,175,19,0.45)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(242,175,19,0.18)' }}
        >
          <div style={{ width: 4, height: 56, borderRadius: 4, background: 'rgba(242,175,19,0.85)', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }} />
        </div>

        {/* Right panel — keeps both mounted so iframes don't reload on tab switch */}
        <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, visibility: rightTab === 'study' ? 'visible' : 'hidden' }}>
            <StudyHub
              onViewChange={() => {/* handled internally — no full-view transitions in split mode */}}
              darkMode={darkMode}
            />
          </div>
          <div style={{ position: 'absolute', inset: 0, visibility: rightTab === 'mindmap' ? 'visible' : 'hidden' }}>
            <MindMapCanvas
              onViewChange={() => {/* split mode owns navigation */}}
              darkMode={darkMode ?? true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
