/**
 * PagesNav — horizontal page tabs underneath the toolbar, scoped to the
 * currently active section. Mimics OneNote's page list on the right (we
 * render horizontally to keep the design RTL-friendly and to make space
 * for the canvas).
 *
 * Pages are tldraw-native (`editor.getPages()`); section membership lives
 * on `page.meta.sectionId`. New pages created here get the active section
 * stamped onto their meta.
 */
import { useEffect, useState } from 'react'
import type { Editor, TLPageId } from 'tldraw'
import { useNotebookStore } from '../state/notebookStore'

interface PagesNavProps {
  editor: Editor | null
}

interface PageInfo {
  id: TLPageId
  name: string
  sectionId: string | null
  isCurrent: boolean
}

export default function PagesNav({ editor }: PagesNavProps) {
  const activeSectionId = useNotebookStore((s) => s.activeSectionId)
  const [pages, setPages] = useState<PageInfo[]>([])

  // Re-read pages whenever the tldraw store changes. This is the simplest
  // reactive bridge — tldraw fires a store.listen callback on every change.
  useEffect(() => {
    if (!editor) return
    const read = () => {
      const currentId = editor.getCurrentPageId()
      setPages(
        editor.getPages().map((p) => ({
          id: p.id,
          name: p.name,
          sectionId: (p.meta?.sectionId as string | undefined) ?? null,
          isCurrent: p.id === currentId,
        }))
      )
    }
    read()
    const unsub = editor.store.listen(read, { scope: 'document' })
    return () => unsub()
  }, [editor])

  if (!editor) return null

  const sectionPages = pages.filter((p) => {
    // Pages with no section yet are shown under the default section so
    // v1 data isn't orphaned after migration.
    if (!p.sectionId) return activeSectionId === 'section-default'
    return p.sectionId === activeSectionId
  })

  const addPage = () => {
    const newId = `page:${Date.now()}` as TLPageId
    const idx = editor.getPages().length + 1
    editor.createPage({
      id: newId,
      name: `דף ${idx}`,
      meta: { sectionId: activeSectionId },
    })
    editor.setCurrentPage(newId)
  }

  const renamePage = (id: TLPageId, currentName: string) => {
    const next = window.prompt('שם הדף:', currentName)
    if (next && next.trim()) editor.updatePage({ id, name: next.trim() })
  }

  const deletePage = (id: TLPageId) => {
    if (editor.getPages().length <= 1) {
      window.alert('לא ניתן למחוק את הדף האחרון.')
      return
    }
    if (window.confirm('למחוק את הדף?')) editor.deletePage(id)
  }

  return (
    <div
      dir="rtl"
      style={{
        height: 38,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 12px',
        background: 'rgba(11,27,62,0.6)',
        borderBottom: '1px solid rgba(212,175,55,0.2)',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#F5C842',
          fontFamily: "'Rubik', sans-serif",
          marginInlineEnd: 4,
          flexShrink: 0,
        }}
      >
        דפים:
      </span>
      {sectionPages.map((p) => (
        <div
          key={p.id}
          onClick={() => editor.setCurrentPage(p.id)}
          onDoubleClick={() => renamePage(p.id, p.name)}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            background: p.isCurrent ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${p.isCurrent ? '#F5C842' : 'rgba(255,255,255,0.1)'}`,
            color: '#fff',
            fontSize: 12,
            fontFamily: "'Rubik', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span>{p.name}</span>
          {sectionPages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                deletePage(p.id)
              }}
              aria-label="מחק דף"
              style={{
                background: 'transparent',
                border: 0,
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addPage}
        aria-label="הוסף דף"
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: 'transparent',
          color: '#F5C842',
          border: '1px dashed rgba(245,200,66,0.5)',
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: "'Rubik', sans-serif",
          flexShrink: 0,
        }}
      >
        + דף חדש
      </button>
    </div>
  )
}
