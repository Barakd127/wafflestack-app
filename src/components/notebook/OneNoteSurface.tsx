/**
 * OneNoteSurface — a free, MIT-only OneNote-style notebook.
 *
 * Replaces the legacy UnifiedNotebook. No tldraw, no paid deps.
 * - Sections rail (left), pages strip (top), warm-paper writing surface.
 * - Click empty paper to spawn a draggable text container.
 * - Math containers use MathLive's <math-field> (MIT) when available;
 *   falls back to a textarea + KaTeX preview (window.katex from CDN).
 * - Zustand `persist` middleware keeps everything in localStorage.
 * - Full RTL Hebrew, accessible from the keyboard.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────────────────
// Types & store
// ─────────────────────────────────────────────────────────────────────────────

type PaperStyle = 'blank' | 'ruled' | 'grid' | 'dots'
type ContainerKind = 'text' | 'math'

interface NoteContainer {
  id: string
  x: number
  y: number
  w: number
  h: number
  kind: ContainerKind
  body: string
}

interface NotebookPage {
  id: string
  title: string
  sectionId: string
  containers: NoteContainer[]
  paperStyle: PaperStyle
}

interface NotebookSection {
  id: string
  name: string
  color: string
  pageIds: string[]
}

interface OneNoteState {
  sections: NotebookSection[]
  pages: Record<string, NotebookPage>
  activeSectionId: string
  activePageId: string
  lastSavedAt: number
  // mutators
  addSection: (name: string) => void
  renameSection: (id: string, name: string) => void
  deleteSection: (id: string) => void
  setActiveSection: (id: string) => void
  addPage: (sectionId: string, title?: string) => void
  renamePage: (id: string, title: string) => void
  deletePage: (id: string) => void
  setActivePage: (id: string) => void
  setPaperStyle: (pageId: string, style: PaperStyle) => void
  addContainer: (pageId: string, c: NoteContainer) => void
  updateContainer: (pageId: string, id: string, patch: Partial<NoteContainer>) => void
  deleteContainer: (pageId: string, id: string) => void
}

const SECTION_COLORS = ['#F5C842', '#7BB6F7', '#8EE7A8', '#E58FB8', '#C7A6F2', '#F39A6B']

const uid = () => Math.random().toString(36).slice(2, 10)

function makeStarter(): Pick<OneNoteState, 'sections' | 'pages' | 'activeSectionId' | 'activePageId' | 'lastSavedAt'> {
  const sectionId = uid()
  const pageId = uid()
  return {
    sections: [{ id: sectionId, name: 'מתמטיקה', color: SECTION_COLORS[0]!, pageIds: [pageId] }],
    pages: {
      [pageId]: {
        id: pageId,
        title: 'דף חדש',
        sectionId,
        containers: [],
        paperStyle: 'ruled',
      },
    },
    activeSectionId: sectionId,
    activePageId: pageId,
    lastSavedAt: Date.now(),
  }
}

const useOneNoteStore = create<OneNoteState>()(
  persist(
    (set, get) => ({
      ...makeStarter(),

      addSection: (name) => {
        const id = uid()
        const color = SECTION_COLORS[get().sections.length % SECTION_COLORS.length]!
        const pageId = uid()
        set((s) => ({
          sections: [...s.sections, { id, name: name || 'קטע חדש', color, pageIds: [pageId] }],
          pages: {
            ...s.pages,
            [pageId]: { id: pageId, title: 'דף חדש', sectionId: id, containers: [], paperStyle: 'ruled' },
          },
          activeSectionId: id,
          activePageId: pageId,
          lastSavedAt: Date.now(),
        }))
      },

      renameSection: (id, name) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.id === id ? { ...sec, name } : sec)),
          lastSavedAt: Date.now(),
        })),

      deleteSection: (id) =>
        set((s) => {
          if (s.sections.length <= 1) return s
          const sec = s.sections.find((x) => x.id === id)
          if (!sec) return s
          const newPages = { ...s.pages }
          sec.pageIds.forEach((pid) => delete newPages[pid])
          const sections = s.sections.filter((x) => x.id !== id)
          const nextSection = sections[0]!
          const nextPage = nextSection.pageIds[0]
          return {
            sections,
            pages: newPages,
            activeSectionId: nextSection.id,
            activePageId: nextPage ?? '',
            lastSavedAt: Date.now(),
          }
        }),

      setActiveSection: (id) => {
        const sec = get().sections.find((s) => s.id === id)
        if (!sec) return
        set({
          activeSectionId: id,
          activePageId: sec.pageIds[0] ?? '',
        })
      },

      addPage: (sectionId, title) => {
        const id = uid()
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, pageIds: [...sec.pageIds, id] } : sec,
          ),
          pages: {
            ...s.pages,
            [id]: {
              id,
              title: title || 'דף חדש',
              sectionId,
              containers: [],
              paperStyle: 'ruled',
            },
          },
          activePageId: id,
          activeSectionId: sectionId,
          lastSavedAt: Date.now(),
        }))
      },

      renamePage: (id, title) =>
        set((s) => ({
          pages: s.pages[id] ? { ...s.pages, [id]: { ...s.pages[id]!, title } } : s.pages,
          lastSavedAt: Date.now(),
        })),

      deletePage: (id) =>
        set((s) => {
          const page = s.pages[id]
          if (!page) return s
          const sec = s.sections.find((x) => x.id === page.sectionId)
          if (!sec || sec.pageIds.length <= 1) return s
          const newPages = { ...s.pages }
          delete newPages[id]
          const sections = s.sections.map((x) =>
            x.id === sec.id ? { ...x, pageIds: x.pageIds.filter((p) => p !== id) } : x,
          )
          const nextPageId = sections.find((x) => x.id === sec.id)!.pageIds[0]!
          return {
            sections,
            pages: newPages,
            activePageId: s.activePageId === id ? nextPageId : s.activePageId,
            lastSavedAt: Date.now(),
          }
        }),

      setActivePage: (id) => set({ activePageId: id }),

      setPaperStyle: (pageId, style) =>
        set((s) => ({
          pages: s.pages[pageId] ? { ...s.pages, [pageId]: { ...s.pages[pageId]!, paperStyle: style } } : s.pages,
          lastSavedAt: Date.now(),
        })),

      addContainer: (pageId, c) =>
        set((s) => {
          const p = s.pages[pageId]
          if (!p) return s
          return {
            pages: { ...s.pages, [pageId]: { ...p, containers: [...p.containers, c] } },
            lastSavedAt: Date.now(),
          }
        }),

      updateContainer: (pageId, id, patch) =>
        set((s) => {
          const p = s.pages[pageId]
          if (!p) return s
          return {
            pages: {
              ...s.pages,
              [pageId]: {
                ...p,
                containers: p.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
              },
            },
            lastSavedAt: Date.now(),
          }
        }),

      deleteContainer: (pageId, id) =>
        set((s) => {
          const p = s.pages[pageId]
          if (!p) return s
          return {
            pages: {
              ...s.pages,
              [pageId]: { ...p, containers: p.containers.filter((c) => c.id !== id) },
            },
            lastSavedAt: Date.now(),
          }
        }),
    }),
    { name: 'wafflestack-onenote-v1' },
  ),
)

// ─────────────────────────────────────────────────────────────────────────────
// MathLive: lazy-load on first need so the bundle isn't bloated
// ─────────────────────────────────────────────────────────────────────────────

let mathLiveLoadPromise: Promise<boolean> | null = null
function ensureMathLive(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as unknown as { __mathliveReady?: boolean }).__mathliveReady) return Promise.resolve(true)
  if (mathLiveLoadPromise) return mathLiveLoadPromise
  mathLiveLoadPromise = import('mathlive')
    .then(() => {
      ;(window as unknown as { __mathliveReady?: boolean }).__mathliveReady = true
      return true
    })
    .catch((e: unknown) => {
      console.warn('mathlive load failed; falling back to KaTeX preview', e)
      return false
    })
  return mathLiveLoadPromise
}

// ─────────────────────────────────────────────────────────────────────────────
// PaperBackground (copied verbatim from PaperStyleSelector concept)
// ─────────────────────────────────────────────────────────────────────────────

function PaperBackground({ style }: { style: PaperStyle }) {
  const PAPER_BASE = style === 'ruled' ? '#FBF8F1' : '#FAF7EE'
  const ruledMarginX = 56
  const defs =
    style === 'ruled' ? (
      <pattern id="paper-ruled" width="40" height="28" patternUnits="userSpaceOnUse">
        <line x1="0" y1="27" x2="40" y2="27" stroke="#A8B8D6" strokeWidth="0.6" opacity="0.55" />
      </pattern>
    ) : style === 'grid' ? (
      <pattern id="paper-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#D8D2C0" strokeWidth="0.7" opacity="0.65" />
      </pattern>
    ) : style === 'dots' ? (
      <pattern id="paper-dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#C3B8A0" opacity="0.55" />
      </pattern>
    ) : (
      <pattern id="paper-grain" width="160" height="160" patternUnits="userSpaceOnUse">
        <rect width="160" height="160" fill={PAPER_BASE} />
        <circle cx="40" cy="60" r="0.8" fill="#000" opacity="0.02" />
        <circle cx="110" cy="30" r="0.6" fill="#000" opacity="0.02" />
        <circle cx="70" cy="120" r="0.7" fill="#000" opacity="0.02" />
        <circle cx="130" cy="100" r="0.5" fill="#000" opacity="0.02" />
      </pattern>
    )
  const patternId =
    style === 'ruled' ? 'paper-ruled' :
    style === 'grid' ? 'paper-grid' :
    style === 'dots' ? 'paper-dots' : 'paper-grain'
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    >
      <defs>{defs}</defs>
      <rect width="100%" height="100%" fill={PAPER_BASE} />
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      {style === 'ruled' && (
        <line
          x1={`calc(100% - ${ruledMarginX}px)`}
          y1="0"
          x2={`calc(100% - ${ruledMarginX}px)`}
          y2="100%"
          stroke="#E07474"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MathField — uses <math-field> when MathLive is loaded; else KaTeX preview.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    katex?: { renderToString: (latex: string, opts?: object) => string }
  }
  // <math-field> is a custom element from MathLive
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'virtual-keyboard-mode'?: string
        'smart-mode'?: string
        'default-mode'?: string
      }
    }
  }
}

function MathField({
  value,
  editing,
  onChange,
  onDoneEditing,
}: {
  value: string
  editing: boolean
  onChange: (v: string) => void
  onDoneEditing: () => void
}) {
  const [mlReady, setMlReady] = useState<boolean>(
    typeof window !== 'undefined' && !!(window as unknown as { __mathliveReady?: boolean }).__mathliveReady,
  )
  const fieldRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  // Trigger MathLive load only when we actually need a math field
  useEffect(() => {
    let cancelled = false
    void ensureMathLive().then((ok) => {
      if (!cancelled) setMlReady(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Wire <math-field> input events (custom element doesn't go through React's synthetic system reliably)
  useEffect(() => {
    if (!editing || !mlReady) return
    const el = fieldRef.current
    if (!el) return
    const handler = () => {
      const v = (el as HTMLElement & { value?: string }).value ?? ''
      onChange(v)
    }
    el.addEventListener('input', handler)
    // Ensure value applied
    ;(el as HTMLElement & { value?: string }).value = value
    // Focus shortly after mount
    requestAnimationFrame(() => (el as HTMLElement).focus())
    return () => el.removeEventListener('input', handler)
  }, [editing, mlReady, onChange, value])

  // Render KaTeX preview (used both as fallback and as "view" mode)
  useEffect(() => {
    if (editing && mlReady) return // <math-field> handles rendering itself
    const el = previewRef.current
    if (!el || !window.katex) {
      if (el) el.textContent = value || ''
      return
    }
    try {
      el.innerHTML = window.katex.renderToString(value || '\\;', { throwOnError: false, displayMode: true })
    } catch {
      el.textContent = value
    }
  }, [value, editing, mlReady])

  if (editing && mlReady) {
    return (
      <math-field
        ref={(node: HTMLElement | null) => {
          fieldRef.current = node
        }}
        virtual-keyboard-mode="onfocus"
        smart-mode="on"
        default-mode="math"
        style={{
          display: 'block',
          minWidth: 80,
          minHeight: 40,
          fontSize: 22,
          padding: '6px 8px',
          background: 'transparent',
          outline: 'none',
        }}
        onBlur={onDoneEditing}
      />
    )
  }

  if (editing && !mlReady) {
    // Fallback editor: textarea + live KaTeX preview
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <textarea
          autoFocus
          value={value}
          dir="ltr"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onDoneEditing}
          placeholder="LaTeX, e.g.  \\frac{a}{b}"
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 4,
            padding: 6,
            fontFamily: 'monospace',
            fontSize: 14,
            minHeight: 56,
            outline: 'none',
            background: 'rgba(255,255,255,0.85)',
            resize: 'vertical',
          }}
        />
        <div
          ref={previewRef}
          dir="ltr"
          style={{ minHeight: 30, color: '#1F2640', fontSize: 20, padding: '2px 6px' }}
        />
      </div>
    )
  }

  return (
    <div
      ref={previewRef}
      dir="ltr"
      style={{ minHeight: 36, color: '#1F2640', fontSize: 22, padding: '4px 6px', cursor: 'text' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteContainerView — draggable text/math card
// ─────────────────────────────────────────────────────────────────────────────

function NoteContainerView({
  c,
  pageId,
}: {
  c: NoteContainer
  pageId: string
}) {
  const updateContainer = useOneNoteStore((s) => s.updateContainer)
  const deleteContainer = useOneNoteStore((s) => s.deleteContainer)
  const [editing, setEditing] = useState(c.body === '' && c.kind === 'text')
  const [hover, setHover] = useState(false)
  const textRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)

  const onPointerDownHandle = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture(e.pointerId)
      dragStateRef.current = { startX: e.clientX, startY: e.clientY, baseX: c.x, baseY: c.y }
    },
    [c.x, c.y],
  )

  const onPointerMoveHandle = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragStateRef.current
      if (!s) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      updateContainer(pageId, c.id, { x: Math.max(0, s.baseX + dx), y: Math.max(0, s.baseY + dy) })
    },
    [c.id, pageId, updateContainer],
  )

  const onPointerUpHandle = useCallback(() => {
    dragStateRef.current = null
  }, [])

  // Text autofocus when entering edit mode
  useEffect(() => {
    if (editing && c.kind === 'text' && textRef.current) {
      const el = textRef.current
      el.focus()
      // Move caret to end
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing, c.kind])

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        left: c.x,
        top: c.y,
        minWidth: 160,
        maxWidth: 640,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(2px)',
        border: editing ? '1.5px solid #D4AF37' : hover ? '1px solid rgba(31,38,64,0.18)' : '1px solid rgba(31,38,64,0.08)',
        borderRadius: 6,
        boxShadow: editing ? '0 0 0 4px rgba(212,175,55,0.18)' : '0 1px 2px rgba(0,0,0,0.04)',
        padding: '6px 10px 8px 10px',
        zIndex: editing ? 5 : 2,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {/* Drag handle (top-right since RTL — but spec said top-left; we honor RTL by using inset-inline-start) */}
      <div
        onPointerDown={onPointerDownHandle}
        onPointerMove={onPointerMoveHandle}
        onPointerUp={onPointerUpHandle}
        title="גרור כדי להזיז"
        style={{
          position: 'absolute',
          top: 4,
          insetInlineStart: 4,
          width: 18,
          height: 18,
          borderRadius: 3,
          background: hover || editing ? 'rgba(31,38,64,0.12)' : 'transparent',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#1F2640',
          userSelect: 'none',
        }}
      >
        ⠿
      </div>

      {/* Delete button (shows on hover) */}
      {(hover || editing) && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteContainer(pageId, c.id)
          }}
          title="מחק"
          style={{
            position: 'absolute',
            top: 4,
            insetInlineEnd: 4,
            width: 18,
            height: 18,
            borderRadius: 3,
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            fontSize: 12,
            color: '#9A3B3B',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}

      <div style={{ paddingTop: 14 }}>
        {c.kind === 'text' ? (
          <div
            ref={textRef}
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) => {
              updateContainer(pageId, c.id, { body: (e.currentTarget as HTMLDivElement).innerText })
              setEditing(false)
              // delete empty
              if (!(e.currentTarget as HTMLDivElement).innerText.trim()) {
                deleteContainer(pageId, c.id)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            style={{
              fontFamily: "'Assistant', system-ui, sans-serif",
              fontSize: 18,
              lineHeight: 1.55,
              color: '#1F2640',
              outline: 'none',
              whiteSpace: 'pre-wrap',
              minHeight: 24,
              cursor: editing ? 'text' : 'default',
            }}
            data-placeholder="כתוב כאן…"
          >
            {/* contentEditable doesn't take controlled prop — set initial only */}
            {!editing ? c.body : undefined}
          </div>
        ) : (
          <MathField
            value={c.body}
            editing={editing}
            onChange={(v) => updateContainer(pageId, c.id, { body: v })}
            onDoneEditing={() => setEditing(false)}
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main surface
// ─────────────────────────────────────────────────────────────────────────────

const PAPER_OPTIONS: { id: PaperStyle; label: string; icon: string }[] = [
  { id: 'blank', label: 'חלק', icon: '⬜' },
  { id: 'ruled', label: 'שורות', icon: '▤' },
  { id: 'grid', label: 'משבצות', icon: '▦' },
  { id: 'dots', label: 'נקודות', icon: '⋮⋮' },
]

interface OneNoteSurfaceProps {
  onBack?: () => void
}

export default function OneNoteSurface({ onBack }: OneNoteSurfaceProps) {
  const sections = useOneNoteStore((s) => s.sections)
  const pages = useOneNoteStore((s) => s.pages)
  const activeSectionId = useOneNoteStore((s) => s.activeSectionId)
  const activePageId = useOneNoteStore((s) => s.activePageId)
  const lastSavedAt = useOneNoteStore((s) => s.lastSavedAt)
  const addSection = useOneNoteStore((s) => s.addSection)
  const setActiveSection = useOneNoteStore((s) => s.setActiveSection)
  const deleteSection = useOneNoteStore((s) => s.deleteSection)
  const renameSection = useOneNoteStore((s) => s.renameSection)
  const addPage = useOneNoteStore((s) => s.addPage)
  const setActivePage = useOneNoteStore((s) => s.setActivePage)
  const deletePage = useOneNoteStore((s) => s.deletePage)
  const renamePage = useOneNoteStore((s) => s.renamePage)
  const setPaperStyle = useOneNoteStore((s) => s.setPaperStyle)
  const addContainer = useOneNoteStore((s) => s.addContainer)

  const [paperMenuOpen, setPaperMenuOpen] = useState(false)
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [zoom, setZoom] = useState(1)
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0],
    [sections, activeSectionId],
  )
  const activePage = activePageId ? pages[activePageId] : undefined
  const sectionPages = useMemo(
    () => (activeSection ? activeSection.pageIds.map((id) => pages[id]).filter(Boolean) as NotebookPage[] : []),
    [activeSection, pages],
  )

  // Auto-save flash
  useEffect(() => {
    setSavedFlash(true)
    const t = setTimeout(() => setSavedFlash(false), 900)
    return () => clearTimeout(t)
  }, [lastSavedAt])

  // Paper click → spawn text container
  const onSurfaceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activePage) return
      if (e.target !== e.currentTarget) return // only direct clicks on the paper
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom
      addContainer(activePage.id, {
        id: uid(),
        x: Math.max(8, x - 12),
        y: Math.max(8, y - 12),
        w: 220,
        h: 60,
        kind: 'text',
        body: '',
      })
    },
    [activePage, addContainer, zoom],
  )

  const insertEquation = useCallback(() => {
    if (!activePage) return
    const rect = surfaceRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 / zoom - 100 : 200
    const cy = rect ? Math.min(rect.height / 2, 220) : 120
    addContainer(activePage.id, {
      id: uid(),
      x: Math.max(20, cx),
      y: Math.max(20, cy),
      w: 240,
      h: 80,
      kind: 'math',
      body: '',
    })
  }, [activePage, addContainer, zoom])

  const insertTemplate = useCallback(
    (kind: 'problem' | 'definition' | 'proof') => {
      if (!activePage) return
      const labelMap: Record<string, string> = {
        problem: 'שאלה:\n\n',
        definition: 'הגדרה:\n\n',
        proof: 'הוכחה:\n\n',
      }
      addContainer(activePage.id, {
        id: uid(),
        x: 40 + Math.random() * 40,
        y: 40 + Math.random() * 40,
        w: 320,
        h: 120,
        kind: 'text',
        body: labelMap[kind] ?? '',
      })
      setTemplateMenuOpen(false)
    },
    [activePage, addContainer],
  )

  const paperStyle: PaperStyle = activePage?.paperStyle ?? 'ruled'

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0B1B3E',
        fontFamily: "'Assistant', 'Rubik', system-ui, sans-serif",
        color: '#fff',
        display: 'grid',
        gridTemplateRows: '56px 38px 1fr',
        gridTemplateColumns: '240px 1fr',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          gridRow: '1',
          gridColumn: '1 / span 2',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 10,
          background: '#0B1B3E',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={() => onBack?.()}
          style={toolbarBtn({ accent: true })}
          title="חזרה לדף הבית"
        >
          ← דף הבית
        </button>
        <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
        <button
          onClick={() => activeSection && addPage(activeSection.id)}
          style={toolbarBtn()}
          title="הוסף דף חדש"
        >
          📄 הוסף דף
        </button>
        <button onClick={insertEquation} style={toolbarBtn()} title="הוסף משוואה">
          🧮 משוואה
        </button>
        <button
          onClick={() => {
            if (!activePage) return
            // toggle "highlighter" feel by inserting a yellow-tinted note
            addContainer(activePage.id, {
              id: uid(),
              x: 60,
              y: 80,
              w: 260,
              h: 60,
              kind: 'text',
              body: '✎ הערה צהובה',
            })
          }}
          style={toolbarBtn()}
          title="מסמן/הערה"
        >
          🖍 מסמן
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setTemplateMenuOpen((v) => !v)} style={toolbarBtn()} title="הוסף תבנית">
            📋 תבנית
          </button>
          {templateMenuOpen && (
            <div style={dropdownStyle}>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('problem')}>שאלה</button>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('definition')}>הגדרה</button>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('proof')}>הוכחה</button>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setPaperMenuOpen((v) => !v)} style={toolbarBtn()} title="סגנון נייר">
            📐 נייר: {PAPER_OPTIONS.find((o) => o.id === paperStyle)?.label}
          </button>
          {paperMenuOpen && (
            <div style={dropdownStyle}>
              {PAPER_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  style={{ ...dropdownItemStyle, background: o.id === paperStyle ? 'rgba(245,200,66,0.15)' : 'transparent' }}
                  onClick={() => {
                    if (activePage) setPaperStyle(activePage.id, o.id)
                    setPaperMenuOpen(false)
                  }}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontSize: 12,
            color: savedFlash ? '#8EE7A8' : 'rgba(255,255,255,0.55)',
            transition: 'color 200ms',
          }}
        >
          {savedFlash ? '✓ נשמר אוטומטית' : 'שמירה אוטומטית'}
        </div>
      </div>

      {/* Sections rail */}
      <div
        style={{
          gridRow: '2 / span 2',
          gridColumn: '1',
          background: '#0F2350',
          borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '0 4px 4px 4px',
          }}
        >
          קטעים
        </div>
        {sections.map((sec) => {
          const isActive = sec.id === activeSectionId
          return (
            <div
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              onDoubleClick={() => {
                const next = window.prompt('שם הקטע', sec.name)
                if (next && next.trim()) renameSection(sec.id, next.trim())
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                background: isActive ? 'rgba(212,175,55,0.16)' : 'transparent',
                border: isActive ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              title="לחיצה כפולה לשינוי שם"
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: sec.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 14, color: '#fff' }}>{sec.name}</span>
              {sections.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`למחוק את "${sec.name}"?`)) deleteSection(sec.id)
                  }}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                  title="מחק קטע"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
        <button
          onClick={() => {
            const name = window.prompt('שם הקטע החדש', 'קטע חדש')
            if (name && name.trim()) addSection(name.trim())
          }}
          style={{
            marginTop: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px dashed rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: 6,
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          + קטע חדש
        </button>
      </div>

      {/* Pages strip */}
      <div
        style={{
          gridRow: '2',
          gridColumn: '2',
          height: 38,
          background: '#0F2350',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 6,
          overflowX: 'auto',
        }}
      >
        {sectionPages.map((p) => {
          const isActive = p.id === activePageId
          return (
            <div
              key={p.id}
              onClick={() => setActivePage(p.id)}
              onDoubleClick={() => {
                const next = window.prompt('שם הדף', p.title)
                if (next && next.trim()) renamePage(p.id, next.trim())
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 14,
                background: isActive ? '#FBF8F1' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#1F2640' : 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                fontSize: 13,
                userSelect: 'none',
                border: isActive ? '1px solid rgba(212,175,55,0.5)' : '1px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{p.title}</span>
              {sectionPages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`למחוק את "${p.title}"?`)) deletePage(p.id)
                  }}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: isActive ? 'rgba(31,38,64,0.5)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
        <button
          onClick={() => activeSection && addPage(activeSection.id)}
          style={{
            background: 'transparent',
            border: '1px dashed rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 14,
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          + דף חדש
        </button>
      </div>

      {/* Writing surface */}
      <div
        style={{
          gridRow: '3',
          gridColumn: '2',
          position: 'relative',
          overflow: 'auto',
          background: '#0B1B3E',
        }}
      >
        <div
          ref={surfaceRef}
          onClick={onSurfaceClick}
          style={{
            position: 'relative',
            width: `${100 / zoom}%`,
            minHeight: `${100 / zoom}%`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top right',
          }}
        >
          {/* Paper canvas */}
          <div
            onClick={onSurfaceClick}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100vh',
              cursor: 'text',
            }}
          >
            <PaperBackground style={paperStyle} />

            {/* Empty-state hint */}
            {activePage && activePage.containers.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  color: 'rgba(31,38,64,0.35)',
                  fontSize: 18,
                  fontFamily: "'Assistant', sans-serif",
                  zIndex: 1,
                }}
              >
                לחץ כדי להתחיל לכתוב
              </div>
            )}

            {/* Containers */}
            {activePage?.containers.map((c) => (
              <NoteContainerView key={c.id} c={c} pageId={activePage.id} />
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            insetInlineStart: 16,
            display: 'flex',
            gap: 4,
            background: 'rgba(11,27,62,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: 4,
            backdropFilter: 'blur(4px)',
          }}
        >
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} style={zoomBtn}>−</button>
          <div style={{ alignSelf: 'center', color: '#fff', fontSize: 12, minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} style={zoomBtn}>+</button>
          <button onClick={() => setZoom(1)} style={zoomBtn} title="איפוס">⤾</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// styles helpers
// ─────────────────────────────────────────────────────────────────────────────

function toolbarBtn({ accent }: { accent?: boolean } = {}): React.CSSProperties {
  return {
    background: accent ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.06)',
    color: accent ? '#F5C842' : '#fff',
    border: `1px solid ${accent ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.14)'}`,
    borderRadius: 18,
    padding: '7px 14px',
    fontFamily: "'Assistant', 'Rubik', sans-serif",
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
  }
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '110%',
  insetInlineStart: 0,
  background: '#0B1B3E',
  border: '1px solid rgba(212,175,55,0.4)',
  borderRadius: 8,
  padding: 6,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 140,
  zIndex: 200,
  boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
}

const dropdownItemStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#fff',
  border: 0,
  borderRadius: 4,
  padding: '6px 10px',
  textAlign: 'right',
  fontFamily: "'Assistant', 'Rubik', sans-serif",
  fontSize: 13,
  cursor: 'pointer',
}

const zoomBtn: React.CSSProperties = {
  background: 'transparent',
  border: 0,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  width: 26,
  height: 26,
  borderRadius: 13,
}
