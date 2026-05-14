/**
 * notebookStore — Zustand store for OneNote-style two-level navigation.
 *
 * Sections are a purely logical grouping that lives on top of tldraw's
 * native pages. Each tldraw page carries `meta.sectionId` to remember
 * which section it belongs to. Section names + ordering are persisted in
 * localStorage so they survive reloads without a backend.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotebookSection {
  id: string
  name: string
  color: string
  createdAt: number
}

export interface NotebookViewState {
  /** 'infinite' = classic tldraw, 'bounded' = letter-paper bounded canvas */
  mode: 'infinite' | 'bounded'
}

interface NotebookStore {
  sections: NotebookSection[]
  activeSectionId: string | null
  view: NotebookViewState

  addSection: (name: string) => NotebookSection
  renameSection: (id: string, name: string) => void
  removeSection: (id: string) => void
  setActiveSection: (id: string | null) => void

  setViewMode: (mode: NotebookViewState['mode']) => void
}

const DEFAULT_SECTION_COLORS = [
  '#D4AF37', // gold (default)
  '#5B8DEF', // blue
  '#67C29E', // green
  '#E17C7C', // red
  '#B07ED4', // purple
  '#E8A85B', // orange
]

let colorCursor = 0
function pickColor() {
  const c = DEFAULT_SECTION_COLORS[colorCursor % DEFAULT_SECTION_COLORS.length]
  colorCursor++
  return c
}

export const useNotebookStore = create<NotebookStore>()(
  persist(
    (set, get) => ({
      sections: [
        {
          id: 'section-default',
          name: 'קטע ראשי',
          color: DEFAULT_SECTION_COLORS[0],
          createdAt: 0,
        },
      ],
      activeSectionId: 'section-default',
      view: { mode: 'infinite' },

      addSection: (name) => {
        const section: NotebookSection = {
          id: `section-${Date.now()}`,
          name: name.trim() || 'קטע חדש',
          color: pickColor(),
          createdAt: Date.now(),
        }
        set({
          sections: [...get().sections, section],
          activeSectionId: section.id,
        })
        return section
      },

      renameSection: (id, name) =>
        set({
          sections: get().sections.map((s) =>
            s.id === id ? { ...s, name: name.trim() || s.name } : s
          ),
        }),

      removeSection: (id) => {
        const remaining = get().sections.filter((s) => s.id !== id)
        const nextActive =
          get().activeSectionId === id
            ? (remaining[0]?.id ?? null)
            : get().activeSectionId
        set({ sections: remaining, activeSectionId: nextActive })
      },

      setActiveSection: (id) => set({ activeSectionId: id }),

      setViewMode: (mode) => set({ view: { mode } }),
    }),
    {
      name: 'wafflestack-notebook-sections-v2',
      version: 2,
    }
  )
)
