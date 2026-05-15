/**
 * TagsFilter — collects every `#tag` on note-container shapes in the
 * current page and renders them as a horizontal chip strip. Clicking a
 * chip sets `tagFilter` on the notebook store. When a filter is active,
 * non-matching containers are dimmed via a tldraw-side opacity update.
 *
 * Strip is rendered above PagesNav so the visual hierarchy reads:
 *   [section rail] -> [tags filter] -> [pages] -> [canvas]
 */
import { useEffect, useState } from 'react'
import type { Editor } from 'tldraw'
import { useNotebookStore } from '../state/notebookStore'
import type { NoteContainerShape } from '../shapes/NoteContainerShape'

interface TagsFilterProps {
  editor: Editor | null
}

export default function TagsFilter({ editor }: TagsFilterProps) {
  const tagFilter = useNotebookStore((s) => s.tagFilter)
  const setTagFilter = useNotebookStore((s) => s.setTagFilter)
  const [tags, setTags] = useState<string[]>([])

  // Scan all note-container shapes on the current page and collect tags.
  useEffect(() => {
    if (!editor) return
    const read = () => {
      const all = editor.getCurrentPageShapes()
      const found = new Set<string>()
      for (const s of all) {
        if (s.type !== 'note-container') continue
        const t = (s as NoteContainerShape).props.tags
        if (Array.isArray(t)) t.forEach((x) => found.add(x))
      }
      setTags(Array.from(found).sort())
    }
    read()
    const unsub = editor.store.listen(read, { scope: 'document' })
    return () => unsub()
  }, [editor])

  // Apply opacity to non-matching shapes whenever the filter changes.
  useEffect(() => {
    if (!editor) return
    const all = editor.getCurrentPageShapes()
    const updates = all
      .filter((s) => s.type === 'note-container')
      .map((s) => {
        const ns = s as NoteContainerShape
        const match = !tagFilter || (ns.props.tags ?? []).includes(tagFilter)
        return {
          id: ns.id,
          type: ns.type,
          opacity: match ? 1 : 0.25,
        } as const
      })
    if (updates.length > 0) editor.updateShapes(updates)
  }, [editor, tagFilter, tags.length])

  if (!editor || tags.length === 0) return null

  return (
    <div
      dir="rtl"
      style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 12px',
        background: 'rgba(11,27,62,0.55)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
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
        תגיות:
      </span>
      <button
        onClick={() => setTagFilter('')}
        style={{
          ...chipStyle,
          background: tagFilter === '' ? 'rgba(245,200,66,0.25)' : 'transparent',
          borderColor: tagFilter === '' ? '#F5C842' : 'rgba(255,255,255,0.18)',
        }}
      >
        הכל
      </button>
      {tags.map((t) => {
        const active = tagFilter === t
        return (
          <button
            key={t}
            onClick={() => setTagFilter(active ? '' : t)}
            style={{
              ...chipStyle,
              background: active ? 'rgba(245,200,66,0.25)' : 'transparent',
              borderColor: active ? '#F5C842' : 'rgba(255,255,255,0.18)',
            }}
          >
            #{t}
          </button>
        )
      })}
    </div>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '2px 10px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#fff',
  fontSize: 12,
  fontFamily: "'Rubik', sans-serif",
  cursor: 'pointer',
  flexShrink: 0,
}
