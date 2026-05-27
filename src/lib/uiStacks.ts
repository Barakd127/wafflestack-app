/**
 * uiStacks.ts — central FAB / fixed-element position registry.
 *
 * Implements the ui-anti-collision skill §3-4 "central uiStacks.ts" convention.
 * Every fixed-position component must read its bottom/top/left/right offset from
 * this registry — no more hard-coded magic numbers scattered across components.
 *
 * Z-index discipline (per skill §"Z-index discipline"):
 *   • toast band   : 300-320  (UnlockToast z 320)
 *   • FABs         : 230-249  (TutorFAB 230, PomodoroTimer 235, VirtualKeyboardCloser 240, CalculatorDrawer 245)
 *   • inline / overlay: 100-149
 *
 * Corner slots — order in the array = bottom-to-top stacking order.
 * STACK_STEP = 72px between centres so chips never overlap at 44px min-height.
 */

import { useState, useEffect } from 'react'

export type Corner = 'bl' | 'br' | 'tl' | 'tr'

const STACK_STEP = 72   // px between FAB centres in the same corner stack
const BASE = 20         // px from the viewport edge to the first FAB centre

const slots: Record<Corner, string[]> = {
  bl: ['tutor-fab', 'pomodoro', 'restore-chrome'],
  br: ['keyboard-closer', 'calculator-drawer', 'home-fab'],
  tl: ['back-home-btn'],
  tr: ['theme-toggle', 'admin-mode', 'profile-menu'],
}

/**
 * Returns the CSS bottom/top and left/right values (in px) for a named slot.
 * Components should spread this into their `style` prop:
 *   style={{ position: 'fixed', ...getStackOffset('bl', 'tutor-fab'), zIndex: 230 }}
 */
export function getStackOffset(
  corner: Corner,
  name: string,
): { bottom?: number; top?: number; left?: number; right?: number } {
  const list = slots[corner] ?? []
  const idx = list.indexOf(name)
  const offset = BASE + (idx < 0 ? 0 : idx) * STACK_STEP

  switch (corner) {
    case 'bl': return { bottom: offset, left: BASE }
    case 'br': return { bottom: offset, right: BASE }
    case 'tl': return { top: offset, left: BASE }
    case 'tr': return { top: offset, right: BASE }
  }
}

// ── Keyboard-open global signal ───────────────────────────────────────────────

let _kbOpen = false
type Listener = (open: boolean) => void
const _listeners = new Set<Listener>()

/**
 * Called from App.tsx when MathLive's `virtual-keyboard-toggle` fires.
 * All subscribers (useKeyboardOpen hooks) are notified synchronously.
 */
export function setKeyboardOpen(open: boolean): void {
  if (_kbOpen === open) return
  _kbOpen = open
  _listeners.forEach(fn => fn(open))
}

/**
 * React hook — returns true while MathLive's virtual keyboard is visible.
 * FABs use this to hide themselves with a 200ms fade-out transition so they
 * don't cover the keyboard layout.
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(_kbOpen)
  useEffect(() => {
    // Sync immediately in case the value changed between render and effect.
    setOpen(_kbOpen)
    const fn: Listener = (v) => setOpen(v)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])
  return open
}
