import React from 'react'

// MindMapCanvas — wraps the full xmind-replica v18 mind map as an iframe.
// The v18 HTML lives at /mindmap.html (WaffleStack public/ folder).
// All features: equations (KaTeX), tables, sticky notes, SVG connections,
// subtree-aware layout, collapsible nodes, pan/zoom, drag, themes.

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode: boolean
}

const MindMapCanvas = ({ onViewChange }: MindMapCanvasProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: '#0d0d1a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thin back bar */}
      <div
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
          ← Back to City
        </button>
        <span style={{ color: '#555', fontSize: 12 }}>
          🧠 Mind Map v18 — full canvas, equations, tables, drag &amp; drop
        </span>
      </div>

      {/* v18 mind map — full remaining height */}
      <iframe
        src="mindmap.html"
        title="Mind Map v18"
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          display: 'block',
        }}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}

export default MindMapCanvas
