/**
 * Arsenal הקאצ'ים שלי — user-curated catches:
 *   • gotcha — common mistakes worth remembering
 *   • trick  — memorized shortcuts / techniques
 *   • tip    — pinned tips to refer back to
 *
 * Storage is per-user (key = `wafflestack-arsenal-v1-${userId}`), so different
 * profiles on the same browser don't collide. Same pattern as the mindmap
 * iframe (`mm-data-${userId}`) and progressStore. We load/save explicitly via
 * `hydrate(userId)` so the store re-loads when the active user changes — a
 * persist middleware would fix its key at module init and miss switches.
 */
import { create } from 'zustand'

export type ArsenalKind = 'gotcha' | 'trick' | 'tip'

export interface ArsenalEntry {
  id: string
  kind: ArsenalKind
  text: string
  topicId?: string
  source?: 'slide' | 'quiz' | 'manual'
  createdAt: number
  pinned: boolean
}

interface ArsenalState {
  entries: ArsenalEntry[]
  currentUserId: string | null
  hydrate: (userId: string) => void
  addEntry: (input: Omit<ArsenalEntry, 'id' | 'createdAt' | 'pinned'>) => string
  removeEntry: (id: string) => void
  togglePin: (id: string) => void
  editEntry: (id: string, text: string) => void
}

const KEY_PREFIX = 'wafflestack-arsenal-v1-'

function storageKey(userId: string): string {
  return KEY_PREFIX + userId
}

function loadEntries(userId: string): ArsenalEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ArsenalEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEntries(userId: string, entries: ArsenalEntry[]): void {
  try { localStorage.setItem(storageKey(userId), JSON.stringify(entries)) } catch { /* quota or disabled */ }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const useArsenalStore = create<ArsenalState>((set, get) => ({
  entries: [],
  currentUserId: null,

  hydrate: (userId) => {
    set({ entries: loadEntries(userId), currentUserId: userId })
  },

  addEntry: (input) => {
    const entry: ArsenalEntry = {
      ...input,
      id: makeId(),
      createdAt: Date.now(),
      pinned: false,
    }
    const userId = get().currentUserId
    set((state) => {
      const next = [entry, ...state.entries]
      if (userId) saveEntries(userId, next)
      return { entries: next }
    })
    return entry.id
  },

  removeEntry: (id) => {
    const userId = get().currentUserId
    set((state) => {
      const next = state.entries.filter(e => e.id !== id)
      if (userId) saveEntries(userId, next)
      return { entries: next }
    })
  },

  togglePin: (id) => {
    const userId = get().currentUserId
    set((state) => {
      const next = state.entries.map(e => e.id === id ? { ...e, pinned: !e.pinned } : e)
      if (userId) saveEntries(userId, next)
      return { entries: next }
    })
  },

  editEntry: (id, text) => {
    const userId = get().currentUserId
    set((state) => {
      const next = state.entries.map(e => e.id === id ? { ...e, text } : e)
      if (userId) saveEntries(userId, next)
      return { entries: next }
    })
  },
}))

/** Convenience helper for code outside React (e.g. quiz wrong-answer button). */
export function quickAddArsenal(input: Omit<ArsenalEntry, 'id' | 'createdAt' | 'pinned'>): string {
  return useArsenalStore.getState().addEntry(input)
}

/** Hebrew labels and metadata for each kind, used by UI. */
export const KIND_META: Record<ArsenalKind, { label: string; icon: string; color: string; bg: string; border: string }> = {
  gotcha: { label: 'גוטצ\'ה',  icon: '🐛', color: '#b91c1c', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.35)' },
  trick:  { label: 'טריק',     icon: '💡', color: '#b45309', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)' },
  tip:    { label: 'טיפ',      icon: '💎', color: '#1e40af', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.35)' },
}
