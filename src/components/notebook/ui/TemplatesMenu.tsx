/**
 * TemplatesMenu — toolbar dropdown that applies one of the Phase 2
 * starter templates. Applying a template creates a fresh tldraw page
 * (so it never destroys the user's current work) seeded with the
 * template's shapes.
 */
import { useState } from 'react'
import type { Editor, TLPageId, TLShapeId, TLShapePartial } from 'tldraw'
import { useNotebookStore } from '../state/notebookStore'
import { NOTEBOOK_TEMPLATES } from '../templates'
import type { NotebookTemplate } from '../templates/types'

interface TemplatesMenuProps {
  editor: Editor | null
}

export default function TemplatesMenu({ editor }: TemplatesMenuProps) {
  const [open, setOpen] = useState(false)
  const activeSectionId = useNotebookStore((s) => s.activeSectionId)

  if (!editor) return null

  const applyTemplate = (tpl: NotebookTemplate) => {
    const pageId = `page:${Date.now()}` as TLPageId
    editor.createPage({
      id: pageId,
      name: tpl.pageName,
      meta: { sectionId: activeSectionId, paperStyle: tpl.paperStyle },
    })
    editor.setCurrentPage(pageId)
    // tldraw's TLShapePartial requires an id. Mint one per template shape.
    const stamp = Date.now().toString(36)
    const shapes: TLShapePartial[] = tpl.shapes.map((s, i) => ({
      id: `shape:tpl${stamp}-${i}` as TLShapeId,
      type: s.type,
      x: s.x,
      y: s.y,
      props: s.props,
    })) as TLShapePartial[]
    editor.createShapes(shapes)
    setOpen(false)
  }

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
        aria-label="תבניות"
      >
        📋 תבניות
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
            minWidth: 240,
            zIndex: 100,
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          }}
        >
          {NOTEBOOK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: 0,
                borderRadius: 4,
                padding: '8px 10px',
                textAlign: 'right',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600 }}>{tpl.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                {tpl.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
