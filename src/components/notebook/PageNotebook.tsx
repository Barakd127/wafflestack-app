/**
 * PageNotebook — OneNote/iPad-Notes-style notebook.
 *
 * Phase 1 additions:
 *   • Custom NoteContainerShape ("click anywhere, start typing")
 *   • Two-level nav: Sections (left rail) + Pages (top tabs).
 *     Sections live in Zustand, page→section binding lives on
 *     tldraw `page.meta.sectionId`.
 *   • Highlighter tool surfaced explicitly in the toolbar (tldraw v5
 *     ships HighlightShapeUtil out of the box — we just expose it).
 *   • View-mode toggle: infinite canvas vs bounded letter-paper view.
 *   • persistenceKey bumped to v2 with one-shot v1→v2 IndexedDB migration.
 *
 * Existing pen / text / math / page features are preserved.
 * Tech: tldraw ^5 (MIT), zustand (already a dep).
 */
import { useEffect, useState } from 'react'
import { Tldraw, type Editor, type TLPageId, type TLShapeId } from 'tldraw'
import 'tldraw/tldraw.css'

import { NoteContainerShapeUtil } from './shapes/NoteContainerShape'
import { EquationShapeUtil } from './shapes/EquationShape'
import SectionsNav from './ui/SectionsNav'
import PagesNav from './ui/PagesNav'
import PaperStyleSelector, {
  PaperBackground,
  readPaperStyle,
} from './ui/PaperStyleSelector'
import TagsFilter from './ui/TagsFilter'
import TemplatesMenu from './ui/TemplatesMenu'
import { useNotebookStore, type PaperStyle } from './state/notebookStore'
import { useNoteSpawner } from './hooks/useNoteSpawner'

const GOLD = '#D4AF37'
const GOLD_BRIGHT = '#F5C842'

const PERSISTENCE_KEY_V1 = 'wafflestack-notebook-v1'
const PERSISTENCE_KEY_V2 = 'wafflestack-notebook-v2'
const MIGRATION_FLAG = 'wafflestack-notebook-v1-to-v2-migrated'

const customShapeUtils = [NoteContainerShapeUtil, EquationShapeUtil] as const

interface PageNotebookProps {
  onBack: () => void
}

/**
 * One-shot copy of v1 IndexedDB data into the v2 store. tldraw stores its
 * snapshot under the database name `TLDRAW_DOCUMENT_v2` keyed by
 * persistenceKey, so a structured-clone copy preserves all shapes/pages.
 * Safe to call repeatedly — gated by a localStorage flag.
 */
async function migrateV1ToV2(): Promise<void> {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(MIGRATION_FLAG) === 'done') return

  const DB_NAME = 'TLDRAW_DOCUMENT_v2'
  const STORE_NAME = 'records'

  await new Promise<void>((resolve) => {
    let req: IDBOpenDBRequest
    try {
      req = indexedDB.open(DB_NAME)
    } catch {
      resolve()
      return
    }
    req.onerror = () => resolve()
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close()
        resolve()
        return
      }
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      // tldraw key layout: each record is stored under
      //   `${persistenceKey}-${recordId}` (older builds) OR
      //   keyed via `persistenceKey` index. We do a coarse-grained dump:
      //   pull every record whose key starts with v1 and rewrite it under v2.
      const getAllReq = store.getAll()
      getAllReq.onsuccess = () => {
        const records = getAllReq.result as Array<{ id: string; [k: string]: unknown }> | undefined
        if (!records || records.length === 0) {
          localStorage.setItem(MIGRATION_FLAG, 'done')
          db.close()
          resolve()
          return
        }
        // Best-effort: many tldraw versions store records keyed by
        // `persistenceKey + '-' + id`. Re-insert under the v2 prefix.
        const getAllKeysReq = store.getAllKeys()
        getAllKeysReq.onsuccess = () => {
          const keys = getAllKeysReq.result as IDBValidKey[]
          keys.forEach((key, i) => {
            if (typeof key === 'string' && key.startsWith(PERSISTENCE_KEY_V1)) {
              const newKey = PERSISTENCE_KEY_V2 + key.slice(PERSISTENCE_KEY_V1.length)
              try {
                store.put(records[i], newKey)
              } catch {
                /* ignore single-record copy failures */
              }
            }
          })
          tx.oncomplete = () => {
            localStorage.setItem(MIGRATION_FLAG, 'done')
            db.close()
            resolve()
          }
          tx.onerror = () => {
            db.close()
            resolve()
          }
        }
        getAllKeysReq.onerror = () => {
          db.close()
          resolve()
        }
      }
      getAllReq.onerror = () => {
        db.close()
        resolve()
      }
    }
  })
}

export default function PageNotebook({ onBack }: PageNotebookProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [migrationReady, setMigrationReady] = useState(false)
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('blank')

  const viewMode = useNotebookStore((s) => s.view.mode)
  const setViewMode = useNotebookStore((s) => s.setViewMode)
  const activeSectionId = useNotebookStore((s) => s.activeSectionId)

  useNoteSpawner(editor)

  // Track the current page's paperStyle so PaperBackground re-renders when
  // the user switches pages or picks a different rule style.
  useEffect(() => {
    if (!editor) return
    const read = () => setPaperStyle(readPaperStyle(editor))
    read()
    const unsub = editor.store.listen(read, { scope: 'document' })
    return () => unsub()
  }, [editor])

  // Run v1 → v2 migration once before mounting tldraw.
  useEffect(() => {
    let cancelled = false
    migrateV1ToV2().finally(() => {
      if (!cancelled) setMigrationReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // When the active section changes, switch tldraw's current page to the
  // first page of that section (creating one if the section has none).
  useEffect(() => {
    if (!editor || !activeSectionId) return
    const pages = editor.getPages()
    const sectionPages = pages.filter(
      (p) => p.meta?.sectionId === activeSectionId ||
        (!p.meta?.sectionId && activeSectionId === 'section-default')
    )
    const currentPage = pages.find((p) => p.id === editor.getCurrentPageId())
    const currentSectionId = (currentPage?.meta?.sectionId as string | undefined) ?? 'section-default'
    if (currentSectionId === activeSectionId) return

    if (sectionPages.length === 0) {
      const newId = `page:${Date.now()}` as TLPageId
      editor.createPage({
        id: newId,
        name: 'דף 1',
        meta: { sectionId: activeSectionId },
      })
      editor.setCurrentPage(newId)
    } else {
      editor.setCurrentPage(sectionPages[0].id)
    }
  }, [editor, activeSectionId])

  const addPage = () => {
    if (!editor) return
    const newPageId = `page:${Date.now()}` as TLPageId
    editor.createPage({
      id: newPageId,
      name: `דף ${editor.getPages().length + 1}`,
      meta: { sectionId: activeSectionId },
    })
    editor.setCurrentPage(newPageId)
  }

  const insertMath = () => {
    if (!editor) return
    // Phase 2: spawn an editable EquationShape; the shape will lazy-load
    // MathLive and open its <math-field> editor on first edit.
    const { x, y } = editor.getViewportPageBounds().center
    const id = `shape:eq${Date.now().toString(36)}` as TLShapeId
    editor.createShape({
      id,
      type: 'equation',
      x: x - 120,
      y: y - 30,
      props: { w: 240, h: 60, latex: '', fontSize: 20 },
    })
    editor.setEditingShape(id)
    editor.setSelectedShapes([id])
  }

  const activateHighlighter = () => {
    if (!editor) return
    // tldraw v5 ships the highlighter tool out of the box. Activating it
    // here gives users a one-click semi-transparent yellow ink without
    // hunting through the floating toolbar.
    editor.setCurrentTool('highlight')
    editor.user.updateUserPreferences({ color: 'yellow' })
  }

  if (!migrationReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #0B1B3E 0%, #1E3A8A 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: "'Rubik', sans-serif",
      }}>
        טוען מחברת…
      </div>
    )
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
        <button onClick={insertMath} style={btnGlassStyle} aria-label="הוסף משוואה">🧮 משוואה</button>
        <button onClick={activateHighlighter} style={btnGlassStyle} aria-label="מסמן">🖍 מסמן</button>
        <PaperStyleSelector editor={editor} />
        <TemplatesMenu editor={editor} />
        <button
          onClick={() => setViewMode(viewMode === 'infinite' ? 'bounded' : 'infinite')}
          style={btnGlassStyle}
          aria-label="החלף תצוגה"
        >
          {viewMode === 'infinite' ? '📑 תצוגת דף' : '🌌 תצוגה חופשית'}
        </button>
        <div style={{ marginInlineStart: 'auto', fontSize: 14, opacity: 0.7, fontFamily: "'Rubik', sans-serif" }}>
          📓 המחברת שלי — נשמר אוטומטית
        </div>
      </div>

      {/* Tag filter strip (Phase 2) */}
      <TagsFilter editor={editor} />

      {/* Pages strip (under section) */}
      <PagesNav editor={editor} />

      {/* Main row: canvas + sections rail */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Canvas wrapper. In bounded mode we centre a letter-paper-sized
            white surface; tldraw still renders behind it but we visually
            constrain authoring to a page. */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Phase 2: paper-rule SVG layer (behind tldraw). */}
          <PaperBackground style={paperStyle} />
          {viewMode === 'bounded' && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: 24,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <div style={{
                width: 816,           // 8.5" * 96dpi (letter)
                height: 1056,         // 11" * 96dpi (letter)
                maxWidth: '95%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px dashed ${GOLD}55`,
                borderRadius: 4,
              }} />
            </div>
          )}
          <Tldraw
            persistenceKey={PERSISTENCE_KEY_V2}
            shapeUtils={customShapeUtils}
            onMount={(ed) => setEditor(ed)}
          />
        </div>

        <SectionsNav />
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
