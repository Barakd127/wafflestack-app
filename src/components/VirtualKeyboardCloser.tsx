/**
 * VirtualKeyboardCloser.tsx — global helper that surfaces a visible ✕ button
 * whenever MathLive's virtual keyboard is open. Without this the user has to
 * find the tiny ⌨ toggle inside MathLive's own UI — non-obvious + persists
 * across route changes per user feedback 2026-05-25.
 *
 * Also wires:
 *   - Escape key to close the keyboard
 *   - hashchange listener to auto-close on route navigation (the keyboard
 *     was "following" the user from Arsenal to other screens).
 */
import { useEffect, useState } from 'react'

// MathLive's own type declarations already live in node_modules/mathlive/dist/...
// We just consume getKB() at runtime via `any`.
type AnyKB = {
  visible?: boolean
  hide?: () => void
  addEventListener?: (event: string, fn: () => void) => void
  removeEventListener?: (event: string, fn: () => void) => void
}
function getKB(): AnyKB | undefined {
  return (window as unknown as { mathVirtualKeyboard?: AnyKB }).mathVirtualKeyboard
}

export default function VirtualKeyboardCloser() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: number | null = null
    const sync = () => { setVisible(!!getKB()?.visible) }
    const tryAttach = () => {
      const kb = getKB()
      if (!kb || !kb.addEventListener) { timer = window.setTimeout(tryAttach, 400); return }
      kb.addEventListener('geometrychange', sync)
      sync()
    }
    tryAttach()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && getKB()?.visible) {
        getKB()?.hide?.()
        setVisible(false)
      }
    }
    window.addEventListener('keydown', onKey)

    const onHash = () => {
      if (getKB()?.visible) {
        getKB()?.hide?.()
        setVisible(false)
      }
    }
    window.addEventListener('hashchange', onHash)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      getKB()?.removeEventListener?.('geometrychange', sync)
    }
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => {
        getKB()?.hide?.()
        setVisible(false)
      }}
      aria-label="סגור מקלדת"
      title="סגור מקלדת (Esc)"
      style={{
        position: 'fixed',
        bottom: 290,
        right: 16,
        zIndex: 100000,
        background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
        color: '#0B1B3E',
        border: 0,
        borderRadius: 24,
        padding: '10px 18px',
        fontFamily: "'Rubik', sans-serif",
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
      }}
    >
      <span aria-hidden style={{ fontSize: 16 }}>✕</span>
      <span>סגור מקלדת</span>
    </button>
  )
}
