/**
 * tutorialStore — Tracks which contextual coachmark steps the user has
 * already seen, plus a global "tutorials enabled" flag.
 *
 * Storage is global (not per-user) — once a user dismisses a coachmark it
 * stays dismissed across profiles on the same browser. If we ever want
 * per-user tutorial state (so a teacher demoing on a student's device
 * doesn't burn through the new student's coachmarks), switch the key to
 * the `wafflestack-X-${userId}` pattern used in arsenalStore.
 */
import { create } from 'zustand'

const SEEN_KEY    = 'wafflestack-tutorial-seen-v1'
const ENABLED_KEY = 'wafflestack-tutorial-enabled-v1'
const TOURS_KEY   = 'wafflestack-tutorial-tours-v1'

interface ActiveTour {
  id: string
  steps: string[]
  currentIndex: number
}

interface TutorialState {
  seen: Record<string, true>
  enabled: boolean
  activeStepId: string | null
  activeTour: ActiveTour | null
  hasSeen: (stepId: string) => boolean
  markSeen: (stepId: string) => void
  setActive: (stepId: string | null) => void
  setEnabled: (enabled: boolean) => void
  reset: () => void
  startTour: (id: string, steps: string[]) => void
  advanceTour: () => void
  retreatTour: () => void
  closeTour: () => void
  hasCompletedTour: (id: string) => boolean
  resetTours: () => void
}

function loadSeen(): Record<string, true> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSeen(seen: Record<string, true>): void {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)) } catch { /* quota */ }
}

function loadEnabled(): boolean {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    return raw === null ? true : raw === 'true'
  } catch { return true }
}

function markTourCompleted(id: string): void {
  try {
    const raw = localStorage.getItem(TOURS_KEY)
    const existing: Record<string, true> = raw ? JSON.parse(raw) : {}
    localStorage.setItem(TOURS_KEY, JSON.stringify({ ...existing, [id]: true }))
  } catch { /* quota */ }
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  seen: loadSeen(),
  enabled: loadEnabled(),
  activeStepId: null,
  activeTour: null,

  hasSeen: (stepId) => !!get().seen[stepId],

  markSeen: (stepId) => {
    const next = { ...get().seen, [stepId]: true as const }
    saveSeen(next)
    set({ seen: next, activeStepId: get().activeStepId === stepId ? null : get().activeStepId })
  },

  setActive: (stepId) => set({ activeStepId: stepId }),

  setEnabled: (enabled) => {
    try { localStorage.setItem(ENABLED_KEY, String(enabled)) } catch { /* quota */ }
    set({ enabled, activeStepId: enabled ? get().activeStepId : null })
  },

  reset: () => {
    try { localStorage.removeItem(SEEN_KEY) } catch { /* quota */ }
    try { localStorage.removeItem(TOURS_KEY) } catch { /* quota */ }
    set({ seen: {}, activeStepId: null, activeTour: null })
  },

  startTour: (id, steps) => {
    if (get().hasCompletedTour(id)) return
    set({ activeTour: { id, steps, currentIndex: 0 } })
  },

  advanceTour: () => {
    const t = get().activeTour
    if (!t) return
    if (t.currentIndex + 1 >= t.steps.length) {
      markTourCompleted(t.id)
      set({ activeTour: null })
    } else {
      set({ activeTour: { ...t, currentIndex: t.currentIndex + 1 } })
    }
  },

  retreatTour: () => {
    const t = get().activeTour
    if (!t || t.currentIndex === 0) return
    set({ activeTour: { ...t, currentIndex: t.currentIndex - 1 } })
  },

  closeTour: () => {
    const t = get().activeTour
    if (!t) return
    markTourCompleted(t.id)
    set({ activeTour: null })
  },

  hasCompletedTour: (id) => {
    try {
      const raw = localStorage.getItem(TOURS_KEY)
      if (!raw) return false
      return !!(JSON.parse(raw)[id])
    } catch { return false }
  },

  resetTours: () => {
    try { localStorage.removeItem(TOURS_KEY) } catch { /* quota */ }
    set({ activeTour: null })
  },
}))
