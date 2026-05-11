import React, { useEffect, useRef } from 'react'
import { registerTourRef } from './CoachmarkTour'

// MindMapCanvas — wraps the full xmind-replica v18 mind map as an iframe.
// The v18 HTML lives at /mindmap.html (WaffleStack public/ folder).
// All features: equations (KaTeX), tables, sticky notes, SVG connections,
// subtree-aware layout, collapsible nodes, pan/zoom, drag, themes.
//
// Header strip REMOVED in Phase 2.4 — the iframe's own topbar already
// has "← דף הבית" so we no longer duplicate it here. Wrapper is now a
// pure shell that hosts the iframe full-bleed.

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d' | 'split-mindmap') => void
  darkMode: boolean
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
}

const MindMapCanvas = ({ onViewChange: _onViewChange }: MindMapCanvasProps) => {
  // ws-go-home / ws-split / ws-theme messages from inside the iframe are
  // handled by App.tsx (single global listener). Keeping MindMapCanvas
  // free of cross-frame coupling makes it work identically when embedded
  // in SplitLayout's right-tab pane.
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Register iframe ref for tour anchoring (replaces previous back-btn ref).
    const cleanup = registerTourRef('mindmap-frame', iframeRef as React.RefObject<HTMLElement | null>)
    return () => cleanup()
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

      {/* v18 mind map — full screen, header strip removed (iframe topbar has back button) */}
      <iframe
        ref={iframeRef}
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
