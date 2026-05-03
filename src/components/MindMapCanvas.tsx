import React, { useEffect } from 'react'

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
  // Listen for navigation + theme messages originating INSIDE the iframe.
  // mindmap.html posts:
  //   {type:'ws-go-home'}   ← דף הבית button
  //   {type:'ws-split'}     ⊟ split button
  //   {type:'ws-theme', dark} when the user toggles inside the iframe
  // We dispatch view changes / flip the parent app's <html.dark> class.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e?.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'ws-go-home') onViewChange('study')
      else if (d.type === 'ws-split') onViewChange('split-mindmap' as 'split-mindmap')
      else if (d.type === 'ws-theme' && typeof d.dark === 'boolean') {
        document.documentElement.classList.toggle('dark', d.dark)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onViewChange])

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
        <button
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
        <button
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
        <span style={{ color: '#6b7280', fontSize: 12, marginInlineStart: 8 }}>
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
