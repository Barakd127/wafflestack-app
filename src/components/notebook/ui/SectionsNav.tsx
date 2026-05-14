/**
 * SectionsNav — left rail showing notebook sections (OneNote's vertical
 * coloured tabs along the side). Click to switch; double-click to rename.
 *
 * Sections live entirely in the Zustand store; tldraw pages reference
 * them via `meta.sectionId`.
 */
import { useState } from 'react'
import { useNotebookStore } from '../state/notebookStore'

export default function SectionsNav() {
  const sections = useNotebookStore((s) => s.sections)
  const activeId = useNotebookStore((s) => s.activeSectionId)
  const setActive = useNotebookStore((s) => s.setActiveSection)
  const addSection = useNotebookStore((s) => s.addSection)
  const renameSection = useNotebookStore((s) => s.renameSection)
  const removeSection = useNotebookStore((s) => s.removeSection)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const onAdd = () => {
    const name = window.prompt('שם הקטע החדש:')
    if (name) addSection(name)
  }

  const commitRename = (id: string) => {
    renameSection(id, draft)
    setRenamingId(null)
    setDraft('')
  }

  return (
    <div
      dir="rtl"
      style={{
        width: 168,
        height: '100%',
        background: 'rgba(11,27,62,0.85)',
        borderInlineStart: '1px solid rgba(212,175,55,0.25)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: '#F5C842',
          letterSpacing: 0.4,
          fontFamily: "'Rubik', sans-serif",
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>קטעים</span>
        <button
          onClick={onAdd}
          aria-label="הוסף קטע"
          title="הוסף קטע"
          style={{
            background: 'transparent',
            color: '#F5C842',
            border: '1px solid rgba(245,200,66,0.5)',
            borderRadius: 12,
            width: 22,
            height: 22,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: '18px',
            padding: 0,
          }}
        >
          +
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
        {sections.map((s) => {
          const isActive = s.id === activeId
          const isRenaming = renamingId === s.id
          return (
            <div
              key={s.id}
              onClick={() => !isRenaming && setActive(s.id)}
              onDoubleClick={() => {
                setRenamingId(s.id)
                setDraft(s.name)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                marginBottom: 4,
                borderRadius: 8,
                cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: `1px solid ${isActive ? s.color : 'transparent'}`,
                fontFamily: "'Rubik', sans-serif",
                color: '#fff',
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              {isRenaming ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(s.id)
                    if (e.key === 'Escape') {
                      setRenamingId(null)
                      setDraft('')
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(245,200,66,0.5)',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    borderRadius: 4,
                    padding: '2px 6px',
                    minWidth: 0,
                  }}
                />
              ) : (
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </span>
              )}
              {sections.length > 1 && !isRenaming && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`למחוק את הקטע "${s.name}"? הדפים בקטע יעברו לקטע הראשי.`)) {
                      removeSection(s.id)
                    }
                  }}
                  aria-label="מחק קטע"
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
