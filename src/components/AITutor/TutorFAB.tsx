import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTutorStore } from '../../store/tutorStore'
import { getStackOffset, useKeyboardOpen } from '../../lib/uiStacks'

/**
 * Floating action button + Cmd/Ctrl+K keyboard shortcut to open the tutor.
 * Mount once at the app root; it's safe inside any view.
 *
 * Position: bottom-left slot 'tutor-fab' from the uiStacks registry.
 * Visibility: hidden (200ms fade-out) while MathLive's virtual keyboard is
 * open so the FAB doesn't cover the keyboard's bottom-left keys.
 */
// Detect platform once at module load. navigator.platform is deprecated but
// still the most reliable Mac sniff across browsers; userAgentData is gated to
// Chromium so we keep this as the fallback. SSR-safe (window guard).
const IS_MAC = typeof navigator !== 'undefined'
  && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || '')
const SHORTCUT_LABEL = IS_MAC ? 'Cmd+K' : 'Ctrl+K'

export function TutorFAB() {
  const open = useTutorStore((s) => s.open)
  const openDrawer = useTutorStore((s) => s.openDrawer)
  const toggleDrawer = useTutorStore((s) => s.toggleDrawer)
  const kbOpen = useKeyboardOpen()

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

  const stackPos = getStackOffset('bl', 'tutor-fab')

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`שאל/י את וופל (${SHORTCUT_LABEL})`}
      title={`שאל/י את וופל · ${SHORTCUT_LABEL}`}
      style={{
        position: 'fixed',
        bottom: stackPos.bottom,
        left: stackPos.left,
        // z-index 230: FAB band (tutor-fab slot, per uiStacks z-index discipline).
        zIndex: 230,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FBBF24, #F97316)',
        color: '#fff',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        minWidth: 44,
        minHeight: 44,
        // 200ms fade-out when keyboard opens; restore on close.
        opacity: kbOpen ? 0 : 1,
        pointerEvents: kbOpen ? 'none' : 'auto',
        transition: 'opacity 200ms ease, transform 150ms ease',
        transform: 'scale(1)',
      }}
    >
      <MessageCircle size={26} />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          fontSize: 10,
          background: '#fff',
          color: '#EA580C',
          borderRadius: 999,
          padding: '2px 6px',
          fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      >
        🧇
      </span>
    </button>
  )
}
