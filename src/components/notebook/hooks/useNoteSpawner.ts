/**
 * useNoteSpawner — OneNote's "click anywhere, start typing" gesture.
 *
 * When the user double-clicks empty canvas while the select tool is active,
 * we spawn a fresh NoteContainerShape at the click point and immediately
 * enter editing mode. Single-click is left alone so it still works for
 * selection/deselection.
 *
 * We piggy-back on tldraw's native pointer events via `editor.on`. This
 * keeps us decoupled from the React tree and lets the host component
 * mount/unmount the listener cleanly.
 */
import { useEffect } from 'react'
import type { Editor, TLShapeId } from 'tldraw'

// tldraw's TLShapeId is the branded string `shape:${string}`. The package
// exports `createShapeId` from `@tldraw/editor` but not from the umbrella
// `tldraw` entry, so we mint the id ourselves to avoid a deeper import.
function makeShapeId(): TLShapeId {
  const rand = Math.random().toString(36).slice(2, 10)
  return `shape:${Date.now().toString(36)}${rand}` as TLShapeId
}

export function useNoteSpawner(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return

    const handleDoubleClick = (e: MouseEvent) => {
      // Only spawn when the user is in the select tool — otherwise let the
      // active tool (draw, highlight, etc.) handle the gesture.
      if (editor.getCurrentToolId() !== 'select') return

      // Ignore double-clicks that land on an existing shape — tldraw will
      // already route those to the shape's edit handler.
      const screenPoint = { x: e.clientX, y: e.clientY }
      const pagePoint = editor.screenToPage(screenPoint)
      const hit = editor.getShapeAtPoint(pagePoint, {
        hitInside: true,
        margin: 0,
      })
      if (hit) return

      const id = makeShapeId()
      editor.createShape({
        id,
        type: 'note-container',
        x: pagePoint.x,
        y: pagePoint.y,
        props: { w: 200, h: 40, text: '', fontSize: 16, tags: [] },
      })
      editor.setEditingShape(id)
      editor.setSelectedShapes([id])
    }

    const container = editor.getContainer()
    container.addEventListener('dblclick', handleDoubleClick)
    return () => {
      container.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [editor])
}
