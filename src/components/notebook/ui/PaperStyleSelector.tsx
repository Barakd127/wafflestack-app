/**
 * PaperStyleSelector — Phase 2 control for switching the background "paper
 * rule" of the currently active tldraw page. Choice is stored on
 * `page.meta.paperStyle` so it persists alongside the rest of the page's
 * state in IndexedDB.
 *
 * The actual SVG pattern is rendered by `<PaperBackground />` (rendered as
 * an absolutely-positioned layer in PageNotebook). This component only
 * picks the value.
 */
import { useEffect, useState } from 'react'
import type { Editor } from 'tldraw'
import type { PaperStyle } from '../state/notebookStore'

interface PaperStyleSelectorProps {
  editor: Editor | null
}

const OPTIONS: { id: PaperStyle; label: string; icon: string }[] = [
  { id: 'blank', label: 'חלק', icon: '⬜' },
  { id: 'ruled', label: 'שורות', icon: '▤' },
  { id: 'grid', label: 'משבצות', icon: '▦' },
  { id: 'dots', label: 'נקודות', icon: '⋮⋮' },
]

export function readPaperStyle(editor: Editor | null): PaperStyle {
  if (!editor) return 'blank'
  const page = editor.getPage(editor.getCurrentPageId())
  const v = page?.meta?.paperStyle
  if (v === 'ruled' || v === 'grid' || v === 'dots' || v === 'blank') return v
  return 'blank'
}

export default function PaperStyleSelector({ editor }: PaperStyleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<PaperStyle>('blank')

  // Re-read current page's paperStyle whenever pages change.
  useEffect(() => {
    if (!editor) return
    const read = () => setCurrent(readPaperStyle(editor))
    read()
    const unsub = editor.store.listen(read, { scope: 'document' })
    return () => unsub()
  }, [editor])

  if (!editor) return null

  const pick = (style: PaperStyle) => {
    const pageId = editor.getCurrentPageId()
    const page = editor.getPage(pageId)
    if (!page) return
    editor.updatePage({
      id: pageId,
      meta: { ...(page.meta ?? {}), paperStyle: style },
    })
    setCurrent(style)
    setOpen(false)
  }

  const currentLabel = OPTIONS.find((o) => o.id === current)?.label ?? 'חלק'

  return (
    <div style={{ position: 'relative' }} dir="rtl">
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 18,
          padding: '7px 16px',
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
        }}
        aria-label="סגנון נייר"
      >
        📐 נייר: {currentLabel}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            insetInlineEnd: 0,
            background: '#0B1B3E',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 8,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 140,
            zIndex: 100,
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => pick(opt.id)}
              style={{
                background: opt.id === current ? 'rgba(245,200,66,0.15)' : 'transparent',
                color: '#fff',
                border: 0,
                borderRadius: 4,
                padding: '6px 10px',
                textAlign: 'right',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <span style={{ marginInlineStart: 6 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * PaperBackground — renders the chosen SVG pattern behind the tldraw canvas.
 * Patterns are pure SVG (no images) so they zoom cleanly and stay crisp.
 */
export function PaperBackground({ style }: { style: PaperStyle }) {
  if (style === 'blank') return null

  // Three patterns share a viewport-anchored SVG so the rule lines are fixed
  // in screen space — they don't pan with the canvas (matches OneNote/Word).
  const defs =
    style === 'ruled' ? (
      <pattern
        id="paper-ruled"
        width="40"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="31" x2="40" y2="31" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </pattern>
    ) : style === 'grid' ? (
      <pattern
        id="paper-grid"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 32 0 L 0 0 0 32"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
        />
      </pattern>
    ) : (
      <pattern
        id="paper-dots"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1.4" fill="rgba(255,255,255,0.25)" />
      </pattern>
    )

  const patternId =
    style === 'ruled' ? 'paper-ruled' : style === 'grid' ? 'paper-grid' : 'paper-dots'

  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>{defs}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
