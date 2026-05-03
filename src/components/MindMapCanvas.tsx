import React from 'react'

// MindMapCanvas — wraps the full xmind-replica v18 mind map as an iframe.
// The v18 HTML lives at /mindmap.html (WaffleStack public/ folder).
// All features: equations (KaTeX), tables, sticky notes, SVG connections,
// subtree-aware layout, collapsible nodes, pan/zoom, drag, themes.

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode: boolean
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
}

const MindMapCanvas = ({ onViewChange }: MindMapCanvasProps) => {
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
      {/* Thin back bar */}
      <header
        style={{
          height: 42,
          background: 'rgba(13,13,26,0.95)',
          borderBottom: '1px solid #2a2a3d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => onViewChange('study')}
          aria-label="חזרה לעיר"
          style={{
            background: 'rgba(108,99,255,0.18)',
            border: '1px solid #6c63ff',
            color: '#6c63ff',
            borderRadius: 7,
            padding: '4px 14px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
          }}
        >
          ← חזרה לעיר
        </button>
        <span style={{ color: '#555', fontSize: 12 }}>
          🧠 מפת חשיבה — קנבס מלא, משוואות, טבלאות וגרירה
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
