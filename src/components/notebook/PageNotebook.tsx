/**
 * PageNotebook — OneNote/iPad-Notes-style notebook with multi-page tabs,
 * pen/text/shapes, and bounded pages. Replaces the Heptabase-style
 * UnifiedNotebook (kept as .legacy for reference).
 *
 * Tech: tldraw (~200KB, MIT). Multi-page support built-in. Stylus-first.
 * Auto-persists to IndexedDB via `persistenceKey`.
 *
 * Page background presets (blank / lined / grid) toggled via Tldraw's
 * user preferences API. Header adds: home back-button, add-page, add-math.
 */
import { useState } from 'react'
import { Tldraw, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'

const GOLD = '#D4AF37'
const GOLD_BRIGHT = '#F5C842'

interface PageNotebookProps {
  onBack: () => void
}

export default function PageNotebook({ onBack }: PageNotebookProps) {
  const [editor, setEditor] = useState<Editor | null>(null)

  const addPage = () => {
    if (!editor) return
    const newPageId = `page:${Date.now()}` as const
    editor.createPage({ id: newPageId as never, name: `דף ${editor.getPages().length + 1}` })
    editor.setCurrentPage(newPageId as never)
  }

  const insertMath = () => {
    if (!editor) return
    const latex = window.prompt('הקלד נוסחת LaTeX (למשל: \\bar{x} = \\frac{1}{n}\\sum x_i):')
    if (!latex || !latex.trim()) return
    const { x, y } = editor.getViewportPageBounds().center
    editor.createShape({
      type: 'text',
      x: x - 100,
      y: y - 20,
      props: {
        richText: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `[KaTeX] ${latex}` }] }] },
        color: 'orange',
        size: 'l',
        autoSize: true,
      },
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0B1B3E 0%, #1E3A8A 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top toolbar — gold buttons matching app theme */}
      <div style={{
        height: 56, padding: '0 16px',
        background: 'rgba(11,27,62,0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${GOLD}55`,
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0, color: '#fff',
      }} dir="rtl">
        <button onClick={onBack} style={btnGoldStyle} aria-label="חזרה לדף הבית">← דף הבית</button>
        <button onClick={addPage} style={btnGlassStyle} aria-label="הוסף דף">📄 הוסף דף</button>
        <button onClick={insertMath} style={btnGlassStyle} aria-label="הוסף נוסחה">🧮 הוסף נוסחה</button>
        <div style={{ marginInlineStart: 'auto', fontSize: 14, opacity: 0.7, fontFamily: "'Rubik', sans-serif" }}>
          📓 המחברת שלי — נשמר אוטומטית
        </div>
      </div>

      {/* tldraw canvas — fills remaining space, persists per-user in IndexedDB */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Tldraw
          persistenceKey="wafflestack-notebook-v1"
          onMount={(ed) => setEditor(ed)}
        />
      </div>
    </div>
  )
}

const btnGoldStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`,
  color: '#0B1B3E',
  border: 0, borderRadius: 20,
  padding: '8px 18px',
  fontFamily: "'Rubik', sans-serif",
  fontWeight: 700, fontSize: 13,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(212,175,55,0.45)',
}

const btnGlassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 18, padding: '7px 16px',
  fontFamily: "'Rubik', sans-serif",
  fontWeight: 500, fontSize: 13,
  cursor: 'pointer',
  transition: 'background 0.15s',
}
