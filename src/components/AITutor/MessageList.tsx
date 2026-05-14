import { useEffect, useRef } from 'react'
import type { TutorMessage } from '../../store/tutorStore'

interface Props {
  messages: TutorMessage[]
  streaming: boolean
}

export function MessageList({ messages, streaming }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  if (messages.length === 0) {
    return (
      <div
        ref={scrollRef}
        dir="rtl"
        className="flex-1 overflow-y-auto px-4 py-6 text-right text-slate-600 dark:text-slate-300"
      >
        <div className="rounded-2xl bg-blue-50 dark:bg-slate-800/60 p-4 leading-relaxed">
          <p className="font-semibold mb-1">היי 👋 אני וופל.</p>
          <p className="text-sm">
            שאל/י אותי כל דבר על הקורס — מנוסחה ספציפית עד "אני לא מצליח/ה
            להבין את הפרק". במה אעזור?
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      dir="rtl"
      role="log"
      aria-live="polite"
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={
            m.role === 'user'
              ? 'flex justify-start'
              : 'flex justify-end'
          }
        >
          <div
            className={
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ' +
              (m.role === 'user'
                ? 'bg-blue-600 text-white rounded-bl-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-br-sm')
            }
          >
            {m.content || (m.role === 'assistant' && streaming ? '…' : '')}
          </div>
        </div>
      ))}
      {streaming && (
        <div className="flex justify-end">
          <div
            className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1"
            aria-label="הבוט מקליד"
          >
            וופל מקליד… ●●●
          </div>
        </div>
      )}
    </div>
  )
}
