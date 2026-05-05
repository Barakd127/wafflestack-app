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
  potionsUsed: Record<ArsenalKind, number>
  activePotion: ArsenalKind | null
  potionActivatedAt: number | null
  memoryTeaRemaining: number
  hydrate: (userId: string) => void
  addEntry: (input: Omit<ArsenalEntry, 'id' | 'createdAt' | 'pinned'>) => string
  removeEntry: (id: string) => void
  togglePin: (id: string) => void
  editEntry: (id: string, text: string) => void
  activatePotion: (kind: ArsenalKind) => void
  consumeMemoryTea: () => void
  clearActivePotion: () => void
}

const KEY_PREFIX = 'wafflestack-arsenal-v1-'
const POTION_KEY_PREFIX = 'wafflestack-potions-v1-'

function storageKey(userId: string): string {
  return KEY_PREFIX + userId
}

function potionStorageKey(userId: string): string {
  return POTION_KEY_PREFIX + userId
}

function loadPotionState(userId: string): { potionsUsed: Record<ArsenalKind, number> } {
  try {
    const raw = localStorage.getItem(potionStorageKey(userId))
    if (!raw) return { potionsUsed: { gotcha: 0, trick: 0, tip: 0 } }
    return JSON.parse(raw)
  } catch { return { potionsUsed: { gotcha: 0, trick: 0, tip: 0 } } }
}

function savePotionState(userId: string, data: { potionsUsed: Record<ArsenalKind, number> }): void {
  try { localStorage.setItem(potionStorageKey(userId), JSON.stringify(data)) } catch { /* quota */ }
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
  potionsUsed: { gotcha: 0, trick: 0, tip: 0 },
  activePotion: null,
  potionActivatedAt: null,
  memoryTeaRemaining: 0,

  hydrate: (userId) => {
    const { potionsUsed } = loadPotionState(userId)
    set({ entries: loadEntries(userId), currentUserId: userId, potionsUsed })
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

  activatePotion: (kind) => {
    const { entries, potionsUsed, currentUserId, activePotion } = get()
    if (activePotion) return // one at a time
    const earned = Math.floor(entries.filter(e => e.kind === kind).length / 3)
    const available = Math.max(0, earned - (potionsUsed[kind] ?? 0))
    if (available <= 0) return
    const newUsed = { ...potionsUsed, [kind]: (potionsUsed[kind] ?? 0) + 1 }
    if (currentUserId) savePotionState(currentUserId, { potionsUsed: newUsed })
    set({
      potionsUsed: newUsed,
      activePotion: kind,
      potionActivatedAt: Date.now(),
      memoryTeaRemaining: kind === 'tip' ? 3 : 0,
    })
  },

  consumeMemoryTea: () => {
    set(state => {
      const remaining = state.memoryTeaRemaining - 1
      if (remaining <= 0) return { memoryTeaRemaining: 0, activePotion: null, potionActivatedAt: null }
      return { memoryTeaRemaining: remaining }
    })
  },

  clearActivePotion: () => {
    set({ activePotion: null, potionActivatedAt: null, memoryTeaRemaining: 0 })
  },
}))

/** Convenience helper for code outside React (e.g. quiz wrong-answer button). */
export function quickAddArsenal(input: Omit<ArsenalEntry, 'id' | 'createdAt' | 'pinned'>): string {
  return useArsenalStore.getState().addEntry(input)
}

/** Hook: how many charges of this potion kind the user can still activate. */
export function useAvailablePotion(kind: ArsenalKind): number {
  const entries = useArsenalStore(s => s.entries)
  const potionsUsed = useArsenalStore(s => s.potionsUsed)
  const earned = Math.floor(entries.filter(e => e.kind === kind).length / 3)
  return Math.max(0, earned - (potionsUsed[kind] ?? 0))
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

export const POTION_META: Record<ArsenalKind, {
  name: string; nameHe: string; effect: string; icon: string; color: string; threshold: number
}> = {
  gotcha: { name: 'Insight Lens', nameHe: 'עדשת תובנה',   effect: 'שאלת MCQ הבאה: תשובה שגויה אחת מסומנת', icon: '🔮', color: '#b45309', threshold: 3 },
  trick:  { name: 'Speed Tonic',  nameHe: 'טוניק מהירות', effect: 'חידון בניין הבא: XP ×1.5 (5 דקות)',       icon: '⚗️', color: '#7c3aed', threshold: 3 },
  tip:    { name: 'Memory Tea',   nameHe: 'תה זיכרון',    effect: '3 שאלות הבאות: XP ×2',                    icon: '🍵', color: '#1e40af', threshold: 3 },
}
