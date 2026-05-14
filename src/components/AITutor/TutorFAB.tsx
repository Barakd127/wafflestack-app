import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTutorStore } from '../../store/tutorStore'

/**
 * Floating action button + Cmd/Ctrl+K keyboard shortcut to open the tutor.
 * Mount once at the app root; it's safe inside any view.
 */
export function TutorFAB() {
  const open = useTutorStore((s) => s.open)
  const openDrawer = useTutorStore((s) => s.openDrawer)
  const toggleDrawer = useTutorStore((s) => s.toggleDrawer)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')
      if (isCmdK) {
        e.preventDefault()
        toggleDrawer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleDrawer])

  if (open) return null

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label="שאל/י את וופל (Cmd+K)"
      title="שאל/י את וופל · Cmd/Ctrl+K"
      className="fixed bottom-5 left-5 z-[250] w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-white/30 min-w-[44px] min-h-[44px]"
    >
      <MessageCircle size={26} />
      <span
        aria-hidden="true"
        className="absolute -top-1 -right-1 text-[10px] bg-white text-orange-600 rounded-full px-1.5 py-0.5 font-bold shadow"
      >
        🧇
      </span>
    </button>
  )
}
