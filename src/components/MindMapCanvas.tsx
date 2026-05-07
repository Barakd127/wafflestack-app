import React, { useEffect, useRef } from 'react'
import Tooltip from './Tooltip'
import { registerTourRef } from './CoachmarkTour'
import { useTutorialStore } from '../store/tutorialStore'

// MindMapCanvas — wraps the full xmind-replica v18 mind map as an iframe.
// The v18 HTML lives at /mindmap.html (WaffleStack public/ folder).
// All features: equations (KaTeX), tables, sticky notes, SVG connections,
// subtree-aware layout, collapsible nodes, pan/zoom, drag, themes.

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d' | 'split-mindmap') => void
  darkMode: boolean
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
}

const MindMapCanvas = ({ onViewChange }: MindMapCanvasProps) => {
  // ws-go-home / ws-split / ws-theme messages from inside the iframe are
  // now handled by App.tsx (single global listener). Keeping MindMapCanvas
  // free of cross-frame coupling makes it work identically when embedded
  // in SplitLayout's right-tab pane.
  useEffect(() => { /* listener moved to App.tsx */ }, [onViewChange])

  const backBtnRef  = useRef<HTMLButtonElement>(null)
  const splitBtnRef = useRef<HTMLButtonElement>(null)
  const helpBtnRef  = useRef<HTMLButtonElement>(null)
  const startTour   = useTutorialStore(s => s.startTour)

  useEffect(() => {
    const cleanups = [
      registerTourRef('back-btn',  backBtnRef as React.RefObject<HTMLElement | null>),
      registerTourRef('split-btn', splitBtnRef as React.RefObject<HTMLElement | null>),
      registerTourRef('help-btn',  helpBtnRef as React.RefObject<HTMLElement | null>),
    ]
    return () => cleanups.forEach(c => c())
  }, [])

  return (
    <main
      aria-label="מפת חשיבה"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: '#0d0d1a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1 style={SR_ONLY}>מפת חשיבה — WaffleStack</h1>
      {/* Sticky back bar — z-index higher than iframe so it never gets hidden */}
      <header
        style={{
          height: 44,
          background: 'rgba(13,13,26,0.97)',
          borderBottom: '1px solid #2a2a3d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        <Tooltip label="חזרה" description="חזור לדף הראשי">
          <button
            ref={backBtnRef}
            onClick={() => onViewChange('study')}
            aria-label="חזרה לדף הבית"
            style={{
              background: 'rgba(108,99,255,0.22)',
              border: '1px solid #6c63ff',
              color: '#a5b4fc',
              borderRadius: 8,
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            ← דף הבית
          </button>
        </Tooltip>
        <Tooltip label="מפה מפוצלת" description="צפה במפה ובעיר במקביל">
          <button
            ref={splitBtnRef}
            onClick={() => onViewChange('split-mindmap' as 'split-mindmap')}
            aria-label="פצל מסך — עיר ומפת חשיבה"
            style={{
              background: 'rgba(51,81,202,0.22)',
              border: '1px solid rgba(99,162,255,0.5)',
              color: '#a5b4fc',
              borderRadius: 8,
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            ⊟ עיר + מפה
          </button>
        </Tooltip>
        <Tooltip label="סיור מודרך" description="למד איך להשתמש במפת המושגים">
          <button
            ref={helpBtnRef}
            onClick={() => startTour('mindmap', ['mm-1', 'mm-2', 'mm-3', 'mm-4', 'mm-5'])}
            className="rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold border border-white/20 bg-white/10 hover:bg-white/20 text-white/80 transition-all"
            aria-label="סיור מודרך"
          >?</button>
        </Tooltip>
        <span className="hidden md:inline" style={{ color: '#6b7280', fontSize: 12, marginInlineStart: 8 }}>
          🧠 מפת חשיבה — קנבס מלא, משוואות וגרירה
        </span>
      </header>

      {/* v18 mind map — full remaining height */}
      <iframe
        src="mindmap.html"
        title="מפת חשיבה — קנבס אינטראקטיבי"
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          display: 'block',
        }}
        allow="clipboard-read; clipboard-write"
      />
    </main>
  )
}

export default MindMapCanvas
