/**
 * VirtualKeyboardCloser.tsx — global helper that surfaces a visible ✕ button
 * whenever MathLive's virtual keyboard is open. Without this the user has to
 * find the tiny ⌨ toggle inside MathLive's own UI — non-obvious + persists
 * across route changes per user feedback 2026-05-25.
 *
 * Position: dynamically computed from mathVirtualKeyboard.boundingRect.top - 56
 * so the button always sits ABOVE the keyboard top edge. Falls back to
 * right:BASE, bottom:BASE when the rect is unavailable.
 * Z-index: 240 (FAB band, per uiStacks z-index discipline).
 *
 * Also wires:
 *   - Escape key to close the keyboard
 *   - hashchange listener to auto-close on route navigation (the keyboard
 *     was "following" the user from Arsenal to other screens).
 */
import { useEffect, useState } from 'react'
import { setKeyboardOpen } from '../lib/uiStacks'

// MathLive's own type declarations already live in node_modules/mathlive/dist/...
// We just consume getKB() at runtime via `any`.
type AnyKB = {
  visible?: boolean
  hide?: () => void
  addEventListener?: (event: string, fn: () => void) => void
  removeEventListener?: (event: string, fn: () => void) => void
  boundingRect?: DOMRect
}
function getKB(): AnyKB | undefined {
  return (window as unknown as { mathVirtualKeyboard?: AnyKB }).mathVirtualKeyboard
}

export default function VirtualKeyboardCloser() {
  const [visible, setVisible] = useState(false)
  // Dynamic bottom offset derived from keyboard top edge. When the keyboard is
  // not yet visible (first render) we use a safe fallback of 290px.
  const [bottomOffset, setBottomOffset] = useState(290)

  useEffect(() => {
    let timer: number | null = null
    const sync = () => {
      const kb = getKB()
      const isVisible = !!kb?.visible
      setVisible(isVisible)
      // Propagate to global uiStacks signal so other FABs can hide.
      setKeyboardOpen(isVisible)
      // Compute position just above the keyboard top edge.
      if (isVisible && kb?.boundingRect) {
        const kbTop = kb.boundingRect.top
        // viewport height - kbTop gives us how far the keyboard is from the
        // bottom. Add 56px so the button clears the tab bar.
        const fromBottom = window.innerHeight - kbTop + 56
        setBottomOffset(Math.max(56, fromBottom))
      }
    }
    const tryAttach = () => {
      const kb = getKB()
      if (!kb || !kb.addEventListener) { timer = window.setTimeout(tryAttach, 400); return }
      kb.addEventListener('geometrychange', sync)
      kb.addEventListener('before-virtual-keyboard-toggle', sync)
      kb.addEventListener('virtual-keyboard-toggle', sync)
      sync()
    }
    tryAttach()
    // Safety net poll — some MathLive open paths don't fire toggle events.
    const poll = window.setInterval(sync, 600)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && getKB()?.visible) {
        getKB()?.hide?.()
        setVisible(false)
        setKeyboardOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)

    const onHash = () => {
      if (getKB()?.visible) {
        getKB()?.hide?.()
        setVisible(false)
        setKeyboardOpen(false)
      }
    }
    window.addEventListener('hashchange', onHash)

    return () => {
      if (timer) clearTimeout(timer)
      window.clearInterval(poll)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      getKB()?.removeEventListener?.('geometrychange', sync)
      getKB()?.removeEventListener?.('before-virtual-keyboard-toggle', sync)
      getKB()?.removeEventListener?.('virtual-keyboard-toggle', sync)
    }
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => {
        getKB()?.hide?.()
        setVisible(false)
        setKeyboardOpen(false)
      }}
      aria-label="סגור מקלדת"
      title="סגור מקלדת (Esc)"
      style={{
        position: 'fixed',
        bottom: bottomOffset,
        right: 16,
        // z-index 240: FAB band (keyboard-closer slot in br stack).
        // Previously 100000 — that was a collision band-aid; other FABs
        // now hide while the keyboard is open so 240 is sufficient.
        zIndex: 240,
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
