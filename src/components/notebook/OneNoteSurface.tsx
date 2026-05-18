/**
 * OneNoteSurface — Light-mode OneNote-style notebook with document-flow writing.
 *
 * - One big contentEditable per page (no per-click spawning of boxes).
 * - Light cream/white theme by default; dark mode toggle in the corner.
 * - Mind-map style ribbon toolbar (most buttons stub a "בקרוב" toast).
 * - Auto-save HTML body of each page into the persisted Zustand store.
 * - Equations: MathLive lazy-imported, rendered inline via KaTeX (inline-block).
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────────────────
// Types & store
// ─────────────────────────────────────────────────────────────────────────────

type PaperStyle = 'blank' | 'ruled' | 'grid' | 'dots'

interface NotebookPage {
  id: string
  title: string
  sectionId: string
  paperStyle: PaperStyle
  body: string // HTML content
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
  themeMode: 'light' | 'dark'
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
  setPageBody: (pageId: string, html: string) => void
  setThemeMode: (mode: 'light' | 'dark') => void
}

const SECTION_COLORS = ['#F5C842', '#7BB6F7', '#8EE7A8', '#E58FB8', '#C7A6F2', '#F39A6B']

const uid = () => Math.random().toString(36).slice(2, 10)

function makeStarter(): Pick<
  OneNoteState,
  'sections' | 'pages' | 'activeSectionId' | 'activePageId' | 'lastSavedAt' | 'themeMode'
> {
  const sectionId = uid()
  const pageId = uid()
  return {
    sections: [{ id: sectionId, name: 'מתמטיקה', color: SECTION_COLORS[0]!, pageIds: [pageId] }],
    pages: {
      [pageId]: {
        id: pageId,
        title: 'דף חדש',
        sectionId,
        paperStyle: 'ruled',
        body: '',
      },
    },
    activeSectionId: sectionId,
    activePageId: pageId,
    lastSavedAt: Date.now(),
    themeMode: 'light',
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
            [pageId]: { id: pageId, title: 'דף חדש', sectionId: id, paperStyle: 'ruled', body: '' },
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
        set({ activeSectionId: id, activePageId: sec.pageIds[0] ?? '' })
      },

      addPage: (sectionId, title) => {
        const id = uid()
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, pageIds: [...sec.pageIds, id] } : sec,
          ),
          pages: {
            ...s.pages,
            [id]: { id, title: title || 'דף חדש', sectionId, paperStyle: 'ruled', body: '' },
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
          pages: s.pages[pageId]
            ? { ...s.pages, [pageId]: { ...s.pages[pageId]!, paperStyle: style } }
            : s.pages,
          lastSavedAt: Date.now(),
        })),

      setPageBody: (pageId, html) =>
        set((s) => ({
          pages: s.pages[pageId]
            ? { ...s.pages, [pageId]: { ...s.pages[pageId]!, body: html } }
            : s.pages,
          lastSavedAt: Date.now(),
        })),

      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'wafflestack-onenote-v1',
      // safe defaults for older persisted shape (no body field)
      migrate: (state: unknown) => {
        const s = state as Partial<OneNoteState> & {
          pages?: Record<string, Partial<NotebookPage> & { body?: string }>
        }
        if (s && s.pages) {
          const fixed: Record<string, NotebookPage> = {}
          Object.entries(s.pages).forEach(([id, p]) => {
            fixed[id] = {
              id: p.id ?? id,
              title: p.title ?? 'דף',
              sectionId: p.sectionId ?? '',
              paperStyle: (p.paperStyle as PaperStyle) ?? 'ruled',
              body: typeof p.body === 'string' ? p.body : '',
            }
          })
          s.pages = fixed
        }
        if (!s.themeMode) s.themeMode = 'light'
        return s as OneNoteState
      },
    },
  ),
)

// ─────────────────────────────────────────────────────────────────────────────
// MathLive lazy-load
// ─────────────────────────────────────────────────────────────────────────────

let mathLivePromise: Promise<boolean> | null = null
function ensureMathLive(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as unknown as { __mathliveReady?: boolean }).__mathliveReady) return Promise.resolve(true)
  if (mathLivePromise) return mathLivePromise
  mathLivePromise = import('mathlive')
    .then(() => {
      ;(window as unknown as { __mathliveReady?: boolean }).__mathliveReady = true
      return true
    })
    .catch(() => false)
  return mathLivePromise
}

declare global {
  interface Window {
    katex?: { renderToString: (latex: string, opts?: object) => string }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeTokens {
  bg: string
  toolbarBg: string
  railBg: string
  pagesStripBg: string
  paperBg: string
  ink: string
  inkMuted: string
  divider: string
  btnBg: string
  btnBorder: string
  btnHoverBg: string
  accent: string
  accentBg: string
  accentBorder: string
  dropdownBg: string
  shadow: string
}

const LIGHT: ThemeTokens = {
  bg: '#FBF8F1',
  toolbarBg: '#FBF8F1',
  railBg: '#F5F4EE',
  pagesStripBg: '#F5F4EE',
  paperBg: '#FBF8F1',
  ink: '#1F2640',
  inkMuted: 'rgba(31,38,64,0.6)',
  divider: 'rgba(31,38,64,0.12)',
  btnBg: '#FFFFFF',
  btnBorder: 'rgba(31,38,64,0.14)',
  btnHoverBg: '#F0EEE5',
  accent: '#D4AF37',
  accentBg: 'linear-gradient(180deg, #F5C842 0%, #D4AF37 100%)',
  accentBorder: 'rgba(212,175,55,0.55)',
  dropdownBg: '#FFFFFF',
  shadow: '0 2px 8px rgba(31,38,64,0.08)',
}

const DARK: ThemeTokens = {
  bg: '#0B1B3E',
  toolbarBg: '#0B1B3E',
  railBg: '#0F2350',
  pagesStripBg: '#0F2350',
  paperBg: '#FBF8F1',
  ink: '#fff',
  inkMuted: 'rgba(255,255,255,0.6)',
  divider: 'rgba(255,255,255,0.12)',
  btnBg: 'rgba(255,255,255,0.06)',
  btnBorder: 'rgba(255,255,255,0.14)',
  btnHoverBg: 'rgba(255,255,255,0.1)',
  accent: '#F5C842',
  accentBg: 'rgba(212,175,55,0.2)',
  accentBorder: 'rgba(212,175,55,0.5)',
  dropdownBg: '#0B1B3E',
  shadow: '0 12px 30px rgba(0,0,0,0.45)',
}

// ─────────────────────────────────────────────────────────────────────────────
// Paper background
// ─────────────────────────────────────────────────────────────────────────────

function PaperBackground({ style, base }: { style: PaperStyle; base: string }) {
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
        <rect width="160" height="160" fill={base} />
      </pattern>
    )
  const patternId =
    style === 'ruled' ? 'paper-ruled' : style === 'grid' ? 'paper-grid' : style === 'dots' ? 'paper-dots' : 'paper-grain'
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    >
      <defs>{defs}</defs>
      <rect width="100%" height="100%" fill={base} />
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
          opacity="0.45"
        />
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast (portal-less, fixed-position div managed by parent)
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(31,38,64,0.92)',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 22,
        fontSize: 14,
        fontFamily: "'Assistant', sans-serif",
        zIndex: 9999,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}
    >
      {message}
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
  const themeMode = useOneNoteStore((s) => s.themeMode)
  const addSection = useOneNoteStore((s) => s.addSection)
  const setActiveSection = useOneNoteStore((s) => s.setActiveSection)
  const deleteSection = useOneNoteStore((s) => s.deleteSection)
  const renameSection = useOneNoteStore((s) => s.renameSection)
  const addPage = useOneNoteStore((s) => s.addPage)
  const setActivePage = useOneNoteStore((s) => s.setActivePage)
  const deletePage = useOneNoteStore((s) => s.deletePage)
  const renamePage = useOneNoteStore((s) => s.renamePage)
  const setPaperStyle = useOneNoteStore((s) => s.setPaperStyle)
  const setPageBody = useOneNoteStore((s) => s.setPageBody)
  const setThemeMode = useOneNoteStore((s) => s.setThemeMode)

  const t = themeMode === 'light' ? LIGHT : DARK

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const editorRef = useRef<HTMLDivElement | null>(null)
  const idleSaveTimer = useRef<number | null>(null)
  const lastSetPageId = useRef<string | null>(null)

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0],
    [sections, activeSectionId],
  )
  const activePage = activePageId ? pages[activePageId] : undefined
  const sectionPages = useMemo(
    () =>
      activeSection
        ? (activeSection.pageIds.map((id) => pages[id]).filter(Boolean) as NotebookPage[])
        : [],
    [activeSection, pages],
  )

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1500)
  }, [])

  const stub = useCallback(() => showToast('בקרוב'), [showToast])

  // Auto-save flash
  useEffect(() => {
    setSavedFlash(true)
    const tt = window.setTimeout(() => setSavedFlash(false), 900)
    return () => window.clearTimeout(tt)
  }, [lastSavedAt])

  // Set innerHTML once per page-switch to avoid React fighting contentEditable.
  useEffect(() => {
    if (!editorRef.current || !activePage) return
    if (lastSetPageId.current === activePage.id) return
    editorRef.current.innerHTML = activePage.body || ''
    lastSetPageId.current = activePage.id
    // place caret at end on mount
    const el = editorRef.current
    requestAnimationFrame(() => {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }, [activePage])

  const queueSave = useCallback(() => {
    if (!activePage) return
    if (idleSaveTimer.current) window.clearTimeout(idleSaveTimer.current)
    idleSaveTimer.current = window.setTimeout(() => {
      if (editorRef.current && activePage) {
        setPageBody(activePage.id, editorRef.current.innerHTML)
      }
    }, 800)
  }, [activePage, setPageBody])

  const flushSave = useCallback(() => {
    if (editorRef.current && activePage) {
      setPageBody(activePage.id, editorRef.current.innerHTML)
    }
  }, [activePage, setPageBody])

  // ── Inline equation insertion ──────────────────────────────────────────────
  const insertEquationInline = useCallback(async () => {
    if (!editorRef.current) return
    const latex = window.prompt('הזן ביטוי LaTeX (לדוגמה: \\frac{a}{b})', '')
    if (!latex || !latex.trim()) return
    await ensureMathLive().catch(() => false)
    let html = latex
    if (window.katex) {
      try {
        html = window.katex.renderToString(latex, { throwOnError: false, displayMode: false })
      } catch {
        /* keep raw */
      }
    }
    const span = document.createElement('span')
    span.contentEditable = 'false'
    span.setAttribute('data-latex', latex)
    span.style.display = 'inline-block'
    span.style.padding = '0 4px'
    span.style.margin = '0 2px'
    span.style.verticalAlign = 'middle'
    span.style.background = 'rgba(212,175,55,0.08)'
    span.style.borderRadius = '4px'
    span.innerHTML = html
    editorRef.current.focus()
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(span)
      // move caret after the node
      range.setStartAfter(span)
      range.setEndAfter(span)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      editorRef.current.appendChild(span)
    }
    flushSave()
  }, [flushSave])

  const insertHighlight = useCallback(() => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand('hiliteColor', false, '#FFF1A8')
    queueSave()
  }, [queueSave])

  const insertTemplate = useCallback(
    (kind: 'problem' | 'definition' | 'proof') => {
      if (!editorRef.current) return
      const labels: Record<string, string> = {
        problem: 'שאלה:',
        definition: 'הגדרה:',
        proof: 'הוכחה:',
      }
      const label = labels[kind] ?? ''
      const html = `<p><strong>${label}</strong></p><p><br/></p>`
      editorRef.current.focus()
      document.execCommand('insertHTML', false, html)
      setOpenMenu(null)
      queueSave()
    },
    [queueSave],
  )

  const paperStyle: PaperStyle = activePage?.paperStyle ?? 'ruled'

  // ── Toolbar button helpers ─────────────────────────────────────────────────
  const tb = (opts: { accent?: boolean; active?: boolean } = {}): React.CSSProperties => ({
    background: opts.accent ? t.accentBg : opts.active ? t.accentBg : t.btnBg,
    color: opts.accent ? '#1F2640' : t.ink,
    border: `1px solid ${opts.accent || opts.active ? t.accentBorder : t.btnBorder}`,
    borderRadius: 16,
    padding: '6px 12px',
    fontFamily: "'Assistant', 'Rubik', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  })

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '110%',
    insetInlineStart: 0,
    background: t.dropdownBg,
    border: `1px solid ${t.divider}`,
    borderRadius: 8,
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 160,
    zIndex: 200,
    boxShadow: t.shadow,
  }

  const dropdownItemStyle: React.CSSProperties = {
    background: 'transparent',
    color: t.ink,
    border: 0,
    borderRadius: 4,
    padding: '7px 10px',
    textAlign: 'right',
    fontFamily: "'Assistant', 'Rubik', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        fontFamily: "'Assistant', 'Rubik', system-ui, sans-serif",
        color: t.ink,
        display: 'grid',
        gridTemplateRows: 'auto 38px 1fr',
        gridTemplateColumns: '1fr 240px',
        overflow: 'hidden',
      }}
      onClick={() => setOpenMenu(null)}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          gridRow: '1',
          gridColumn: '1 / span 2',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '10px 18px',
          gap: 8,
          background: t.toolbarBg,
          borderBottom: `1px solid ${t.divider}`,
          boxShadow: themeMode === 'light' ? t.shadow : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => onBack?.()} style={tb({ accent: true })} title="חזרה לדף הבית">
          ← דף הבית
        </button>
        <div style={{ width: 1, height: 24, background: t.divider, margin: '0 2px' }} />

        {/* Mind-map ribbon stubs */}
        <button onClick={stub} style={tb()} title="סדר מחדש">סדר מחדש</button>
        <button onClick={stub} style={tb()} title="חיפוש">🔍</button>
        <button onClick={stub} style={tb()} title="פומודורו">🍅</button>
        <button onClick={stub} style={tb()} title="סיור">🎓</button>

        <button
          onClick={() => window.postMessage({ type: 'ws-split' }, '*')}
          style={tb()}
          title="פצל תצוגה"
        >
          פצל ▾
        </button>

        {/* Add ▾ */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenu(openMenu === 'add' ? null : 'add')
            }}
            style={tb()}
            title="הוסף"
          >
            הוסף ▾
          </button>
          {openMenu === 'add' && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              <button
                style={dropdownItemStyle}
                onClick={() => {
                  if (activeSection) addPage(activeSection.id)
                  setOpenMenu(null)
                }}
              >
                📄 דף חדש
              </button>
              <button
                style={dropdownItemStyle}
                onClick={() => {
                  insertEquationInline()
                  setOpenMenu(null)
                }}
              >
                🧮 משוואה
              </button>
              <button
                style={dropdownItemStyle}
                onClick={() => {
                  insertHighlight()
                  setOpenMenu(null)
                }}
              >
                🖍 מסמן
              </button>
            </div>
          )}
        </div>

        <button onClick={stub} style={tb()} title="תצוגה">תצוגה ▾</button>

        {/* Templates ▾ */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenu(openMenu === 'tpl' ? null : 'tpl')
            }}
            style={tb()}
            title="תבניות"
          >
            תבניות ▾
          </button>
          {openMenu === 'tpl' && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('problem')}>שאלה</button>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('definition')}>הגדרה</button>
              <button style={dropdownItemStyle} onClick={() => insertTemplate('proof')}>הוכחה</button>
            </div>
          )}
        </div>

        <button onClick={stub} style={tb()} title="קבצים">קבצים ▾</button>

        <div style={{ width: 1, height: 24, background: t.divider, margin: '0 2px' }} />

        {/* Legacy explicit buttons */}
        <button onClick={insertEquationInline} style={tb()} title="הוסף משוואה">🧮 משוואה</button>
        <button onClick={insertHighlight} style={tb()} title="מסמן">🖍 מסמן</button>

        {/* Paper style ▾ */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenu(openMenu === 'paper' ? null : 'paper')
            }}
            style={tb()}
            title="סגנון נייר"
          >
            📐 נייר: {PAPER_OPTIONS.find((o) => o.id === paperStyle)?.label}
          </button>
          {openMenu === 'paper' && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              {PAPER_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  style={{
                    ...dropdownItemStyle,
                    background: o.id === paperStyle ? 'rgba(212,175,55,0.18)' : 'transparent',
                  }}
                  onClick={() => {
                    if (activePage) setPaperStyle(activePage.id, o.id)
                    setOpenMenu(null)
                  }}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => activeSection && addPage(activeSection.id)}
          style={tb()}
          title="הוסף דף חדש"
        >
          📄 הוסף דף
        </button>

        <div style={{ width: 1, height: 24, background: t.divider, margin: '0 2px' }} />

        {/* Hub buttons (real handlers) */}
        <button
          onClick={() => window.postMessage({ type: 'ws-split' }, '*')}
          style={tb()}
          title="העיר שלי"
        >
          🏙️ העיר שלי
        </button>
        <button
          onClick={() => window.postMessage({ type: 'ws-split-study' }, '*')}
          style={tb()}
          title="איזור הלמידה"
        >
          📚 איזור הלמידה
        </button>
        <button
          onClick={() => window.postMessage({ type: 'ws-split-study' }, '*')}
          style={tb()}
          title="הארסנל שלי"
        >
          🎯 הארסנל שלי
        </button>

        <div style={{ flex: 1, minWidth: 8 }} />

        <div
          style={{
            fontSize: 12,
            color: savedFlash ? '#2F8F4A' : t.inkMuted,
            transition: 'color 200ms',
            minWidth: 110,
            textAlign: 'left',
          }}
        >
          {savedFlash ? '✓ נשמר אוטומטית' : 'שמירה אוטומטית'}
        </div>

        {/* Light/dark toggle */}
        <button
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          style={tb()}
          title="החלף מצב תצוגה"
        >
          {themeMode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* ── Pages strip ──────────────────────────────────────────────────── */}
      <div
        style={{
          gridRow: '2',
          gridColumn: '1',
          height: 38,
          background: t.pagesStripBg,
          borderBottom: `1px solid ${t.divider}`,
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
              onClick={() => {
                flushSave()
                setActivePage(p.id)
              }}
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
                background: isActive ? t.btnBg : 'transparent',
                color: t.ink,
                cursor: 'pointer',
                fontSize: 13,
                userSelect: 'none',
                border: `1px solid ${isActive ? t.accentBorder : 'transparent'}`,
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
                    color: t.inkMuted,
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
            border: `1px dashed ${t.divider}`,
            color: t.inkMuted,
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

      {/* ── Sections rail (right) ────────────────────────────────────────── */}
      <div
        style={{
          gridRow: '2 / span 2',
          gridColumn: '2',
          background: t.railBg,
          borderInlineStart: `1px solid ${t.divider}`,
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
            color: t.inkMuted,
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
              onClick={() => {
                flushSave()
                setActiveSection(sec.id)
              }}
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
                border: `1px solid ${isActive ? t.accentBorder : 'transparent'}`,
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
              <span style={{ flex: 1, fontSize: 14, color: t.ink }}>{sec.name}</span>
              {sections.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`למחוק את "${sec.name}"?`)) deleteSection(sec.id)
                  }}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: t.inkMuted,
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
            background: t.btnBg,
            border: `1px dashed ${t.divider}`,
            color: t.ink,
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

      {/* ── Writing surface (document flow) ─────────────────────────────── */}
      <div
        style={{
          gridRow: '3',
          gridColumn: '1',
          position: 'relative',
          overflow: 'auto',
          background: t.bg,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '100%',
          }}
        >
          <PaperBackground style={paperStyle} base={t.paperBg} />

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            spellCheck={false}
            data-placeholder={
              activePage && !activePage.body ? 'התחל לכתוב…' : ''
            }
            onInput={queueSave}
            onBlur={flushSave}
            onKeyDown={(e) => {
              // Default Enter = <p>; Shift+Enter = <br>. Browsers handle this; just queue save.
              if (e.key === 'Enter' && !e.shiftKey) {
                // Let the browser insert paragraph
              }
            }}
            style={{
              position: 'relative',
              zIndex: 1,
              minHeight: 'calc(100vh - 120px)',
              outline: 'none',
              padding: '40px 64px 80px 80px',
              fontFamily: "'Assistant', 'Rubik', system-ui, sans-serif",
              fontSize: 18,
              lineHeight: '28px',
              color: t.ink,
              whiteSpace: 'pre-wrap',
              caretColor: t.accent,
            }}
          />
        </div>
      </div>

      <Toast message={toast} />

      {/* Placeholder styling for empty contentEditable */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: ${t.inkMuted};
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  )
}
