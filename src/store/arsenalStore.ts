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

/** Hebrew labels, icons, accent colours, and the long-form description shown
   inside the togglable hover tooltip. The `kind` keys stay 'gotcha' / 'trick'
   / 'tip' for backwards-compatibility with stored entries — only the labels
   and icons changed. */
export const KIND_META: Record<ArsenalKind, {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  // "Catch" (קאצ'ים) — the realisation/insight type. Lightbulb 💡 stays as
  // the icon (universal Aha symbol). Label restored from "רגע אהה" to the
  // user's preferred "קאצ'ים" — short, slangy, matches the Hebrew slang for
  // catching subtle ideas.
  gotcha: {
    label: 'קאצ\'',
    icon: '💡',
    color: '#b45309',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.35)',
    description: 'קאצ׳ — תובנה או רגע גילוי שהאיר לכם משהו חדש על הנושא. חשוב לזכור כדי לא לטעות שוב.',
  },
  // "Trick" — memorised shortcut / technique. Wand for "magic shortcut"
  // (the lightbulb moved to gotcha so we needed something distinct).
  trick: {
    label: 'טריק',
    icon: '🪄',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    border: 'rgba(124,58,237,0.35)',
    description: 'קיצור דרך, נוסחה שווה לזכור, או תרגיל מנטלי שמקצר את החישוב — כלי מהיר להוצאה ביום הבחינה.',
  },
  // "Tip" — pinned advice. Pushpin replaces the gem so each kind has a
  // visually distinct icon now.
  tip: {
    label: 'טיפ',
    icon: '📌',
    color: '#1e40af',
    bg: 'rgba(99,102,241,0.10)',
    border: 'rgba(99,102,241,0.35)',
    description: 'עצה כללית או דגש שכדאי לזכור — לא טעות ולא טריק, אלא הכוונה לדרך הנכונה לחשוב על הנושא.',
  },
}
