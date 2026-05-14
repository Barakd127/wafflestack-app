import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TutorRole = 'user' | 'assistant'

export interface TutorMessage {
  id: string
  role: TutorRole
  content: string
  ts: number
}

interface TutorState {
  open: boolean
  streaming: boolean
  messages: TutorMessage[]
  error: string | null
  // Screen context derived from outside, but kept here so it survives drawer toggles
  currentTopicId: string | null
  currentRoute: string | null

  // Actions
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  setStreaming: (s: boolean) => void
  setError: (e: string | null) => void
  pushMessage: (m: TutorMessage) => void
  appendToLast: (chunk: string) => void
  resetConversation: () => void
  setScreenContext: (ctx: { topicId: string | null; route: string | null }) => void
}

const MAX_TURNS = 20 // keep last 20 messages in memory & on disk

export const useTutorStore = create<TutorState>()(
  persist(
    (set) => ({
      open: false,
      streaming: false,
      messages: [],
      error: null,
      currentTopicId: null,
      currentRoute: null,

      openDrawer: () => set({ open: true }),
      closeDrawer: () => set({ open: false }),
      toggleDrawer: () => set((s) => ({ open: !s.open })),
      setStreaming: (s) => set({ streaming: s }),
      setError: (e) => set({ error: e }),

      pushMessage: (m) =>
        set((s) => {
          const next = [...s.messages, m]
          return { messages: next.slice(-MAX_TURNS) }
        }),

      appendToLast: (chunk) =>
        set((s) => {
          if (s.messages.length === 0) return s
          const last = s.messages[s.messages.length - 1]
          if (last.role !== 'assistant') return s
          const updated: TutorMessage = { ...last, content: last.content + chunk }
          return { messages: [...s.messages.slice(0, -1), updated] }
        }),

      resetConversation: () => set({ messages: [], error: null }),
      setScreenContext: (ctx) => set({ currentTopicId: ctx.topicId, currentRoute: ctx.route }),
    }),
    {
      name: 'wafflestack-tutor-v1',
      partialize: (s) => ({ messages: s.messages.slice(-MAX_TURNS) }),
    },
  ),
)
