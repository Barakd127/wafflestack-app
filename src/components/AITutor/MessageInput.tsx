import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div
      dir="rtl"
      className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900"
    >
      <div className="flex items-end gap-2">
        <textarea
          dir="rtl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="שאל/י את וופל..."
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-h-[44px] max-h-32"
          aria-label="הקלד/י שאלה"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !value.trim()}
          aria-label="שלח הודעה"
          className="min-w-[44px] min-h-[44px] rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
        🔒 פרטי · השיחה נשלחת לשירות AI חיצוני להנפקת תשובה
      </p>
    </div>
  )
}
