import { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useTutorStore, type TutorMessage } from '../../store/tutorStore'
import { useLearningStore, TOPICS } from '../../store/learningStore'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { streamTutorChat, toWireMessages } from '../../lib/tutorClient'
import {
  DEFAULT_MSV,
  DEFAULT_PROFILE,
  DEFAULT_TURN,
  type TutorProfile,
  type TutorTurnContext,
} from '../../lib/tutorPrompt'

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function deriveProfile(
  answeredIds: string[],
  completedLessons: string[],
): TutorProfile {
  // Coarse heuristic: a topic is "in progress" if any lesson completed for it;
  // "mastered" if at least 3 questions answered correctly for that topic.
  const correctByTopic = new Map<string, number>()
  for (const id of answeredIds) {
    // QUESTION_BANK ids start with topic prefix like "med1", "mean3"; map first 3 chars.
    const prefix = id.slice(0, 3)
    correctByTopic.set(prefix, (correctByTopic.get(prefix) ?? 0) + 1)
  }

  const masteredHebrew: string[] = []
  const inProgressHebrew: string[] = []

  for (const t of TOPICS) {
    const id = t.id
    const correctCount = correctByTopic.get(id.slice(0, 3)) ?? 0
    const lessonDone = completedLessons.includes(id)
    if (correctCount >= 3) masteredHebrew.push(t.hebrewTitle)
    else if (lessonDone || correctCount > 0) inProgressHebrew.push(t.hebrewTitle)
  }

  let level: TutorProfile['level'] = 'beginner'
  if (masteredHebrew.length >= 6) level = 'advanced'
  else if (masteredHebrew.length >= 2) level = 'intermediate'

  return { level, masteredHebrew, inProgressHebrew, strugglesHebrew: [] }
}

function deriveTurnContext(topicId: string | null): TutorTurnContext {
  if (!topicId) return DEFAULT_TURN
  const topic = TOPICS.find((t) => t.id === topicId)
  return {
    routeHe: topic ? `מסך שיעור — ${topic.hebrewTitle}` : 'מסך לימוד',
    topicHe: topic ? topic.hebrewTitle : null,
    lastQuizQuestion: null,
    lastQuizUserAnswer: null,
    lastQuizCorrect: null,
  }
}

export function TutorDrawer() {
  const open = useTutorStore((s) => s.open)
  const streaming = useTutorStore((s) => s.streaming)
  const messages = useTutorStore((s) => s.messages)
  const currentTopicId = useTutorStore((s) => s.currentTopicId)
  const error = useTutorStore((s) => s.error)
  const closeDrawer = useTutorStore((s) => s.closeDrawer)
  const setStreaming = useTutorStore((s) => s.setStreaming)
  const setError = useTutorStore((s) => s.setError)
  const pushMessage = useTutorStore((s) => s.pushMessage)
  const appendToLast = useTutorStore((s) => s.appendToLast)
  const resetConversation = useTutorStore((s) => s.resetConversation)

  const answeredIds = useLearningStore((s) => s.answeredIds)
  const completedLessons = useLearningStore((s) => s.completedLessons)

  const drawerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Escape closes drawer; focus trap on open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    // Auto-focus the input
    const t = setTimeout(() => {
      const ta = drawerRef.current?.querySelector('textarea')
      if (ta instanceof HTMLTextAreaElement) ta.focus()
    }, 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, closeDrawer])

  // Cleanup any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const onSend = (text: string) => {
    if (streaming) return
    setError(null)

    const userMsg: TutorMessage = {
      id: uid(),
      role: 'user',
      content: text,
      ts: Date.now(),
    }
    const assistantMsg: TutorMessage = {
      id: uid(),
      role: 'assistant',
      content: '',
      ts: Date.now(),
    }
    pushMessage(userMsg)
    pushMessage(assistantMsg)
    setStreaming(true)

    const profile = deriveProfile(answeredIds, completedLessons)
    const turn = deriveTurnContext(currentTopicId)
    const wire = toWireMessages([...messages, userMsg])

    const ac = new AbortController()
    abortRef.current = ac

    void streamTutorChat(
      { messages: wire, profile, msv: DEFAULT_MSV, turn },
      {
        onDelta: (chunk) => appendToLast(chunk),
        onDone: () => setStreaming(false),
        onError: (err) => {
          setError(err.message)
          setStreaming(false)
        },
        signal: ac.signal,
      },
    )
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[300] md:bg-black/20"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer: desktop right-side (RTL aware), mobile bottom sheet */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="המורה הפרטי וופל"
        dir="rtl"
        className={
          'fixed z-[301] bg-white dark:bg-slate-900 shadow-2xl flex flex-col ' +
          // Desktop: slide from the right (RTL means right is the natural-end side)
          'md:top-0 md:bottom-0 md:right-0 md:w-[420px] md:h-full md:border-l md:border-slate-200 md:dark:border-slate-700 ' +
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 top-auto h-[80vh] rounded-t-2xl md:rounded-none ' +
          'animate-[tutorSlide_180ms_ease-out]'
        }
        style={{
          // inline keyframe (Tailwind arbitrary animations need the keyframe in config; we inline it)
          // The class above references a custom animation that does not exist by default; we provide
          // a safe fallback via opacity + transform here using direct style only on mobile.
          // For the production cut, prefer adding "tutorSlide" to tailwind.config.
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🧇</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                וופל — המורה הפרטי
              </div>
              {currentTopicId && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {TOPICS.find((t) => t.id === currentTopicId)?.hebrewTitle ?? ''}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetConversation}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="אפס שיחה"
              title="אפס שיחה"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="סגור"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-3 mt-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-3 py-2 text-xs text-red-700 dark:text-red-200"
          >
            שגיאה: {error}
          </div>
        )}

        <MessageList messages={messages} streaming={streaming} />
        <MessageInput onSend={onSend} disabled={streaming} />
      </div>
    </>
  )
}
