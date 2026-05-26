// WaffleStackKeyboard.tsx — registers a custom MathLive virtual-keyboard tab
// branded "וופלסטאק" with the Stat A formula library as tappable chips.
// Mounted once globally (alongside <VirtualKeyboardCloser />) so any
// <math-field> on any screen — Arsenal, Notebook, Mindmap embeds, lesson
// equation prompts — gets the tab for free.
//
// Behaviours:
//   • Tap chip   → inserts formula LaTeX into the focused math-field.
//   • Long-press → dispatches 'ws-open-calc' so the CalculatorDrawer can
//                  open the live evaluator for that formula. The dispatch
//                  is wired via a tiny `data-ws-formula` attribute on each
//                  chip's DOM node; we listen for pointer events globally
//                  because MathLive's layout API only supports onclick
//                  semantics via `command: 'insert' …`.
//   • Topic-aware: filters chips to formulas whose `topics` array contains
//                  localStorage['wafflestack-current-topic'] when set; falls
//                  back to all categories otherwise.
//   • Recent: tracks the last 6 used formula ids in
//             localStorage['wafflestack-formula-recent'] and pins them as
//             the first row when populated.
//
// The layout is re-registered when:
//   - The component first mounts (MathLive may not be loaded yet → retry).
//   - The current topic changes (storage event from LessonScreen).
//   - A formula is used (recents update).

import { useEffect, useRef } from 'react'
import { FORMULA_LIBRARY, allFormulas, type Formula } from '../data/formula-library'

const TOPIC_KEY = 'wafflestack-current-topic'
const RECENT_KEY = 'wafflestack-formula-recent'
const RECENT_MAX = 6
const LONG_PRESS_MS = 350

// MathLive's virtual keyboard API is typed loosely on window. We treat it
// as `any` here — the package's own d.ts exports don't surface `layouts`.
type AnyKB = {
  layouts?: unknown
  visible?: boolean
}
function getKB(): AnyKB | undefined {
  return (window as unknown as { mathVirtualKeyboard?: AnyKB }).mathVirtualKeyboard
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function pushRecentFormula(id: string): void {
  const cur = readRecent().filter(x => x !== id)
  cur.unshift(id)
  const next = cur.slice(0, RECENT_MAX)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch { /* quota — ignore */ }
  window.dispatchEvent(new CustomEvent('ws-formula-recent-changed'))
}

// Each chip is rendered as a small key with the formula's LaTeX label
// (MathLive renders the `label` via its own LaTeX renderer when it starts
// with `\` or contains math). We also tag the key with a `class` carrying
// `ws-formula-chip ws-fid-<id>` so the global pointerdown listener can
// detect long-press on the right DOM element.
function chipForFormula(f: Formula): Record<string, unknown> {
  // MathLive renders the `latex` field as the visual KaTeX on the keycap AND
  // as the inserted content. Previous attempt set `label: "$$…$$"` thinking
  // MathLive would render labels-with-delimiters — it does NOT (the dollars
  // are shown verbatim). Per user 2026-05-26 screenshot. Drop `label`
  // entirely so the keycap visual comes from the `latex` field directly.
  return {
    latex: f.latex,
    class: `small ws-formula-chip ws-fid-${f.id}`,
    tooltip: f.label + (f.desc ? ' — ' + f.desc : ''),
    width: 1.6,
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function buildRows(): unknown[] {
  const currentTopic = (() => {
    try { return localStorage.getItem(TOPIC_KEY) || '' } catch { return '' }
  })()
  const recentIds = readRecent()
  const all = allFormulas()

  const rows: unknown[] = []

  // Row 1 — recents (if any)
  if (recentIds.length) {
    const recents = recentIds
      .map(id => all.find(f => f.id === id))
      .filter((f): f is Formula => !!f)
    if (recents.length) {
      rows.push([
        { class: 'separator w10', label: '🕓 אחרונים' },
        ...recents.map(chipForFormula),
      ])
    }
  }

  // Topic-filtered section
  let topicFormulas: Formula[] = []
  if (currentTopic) {
    topicFormulas = all.filter(f => f.topics.includes(currentTopic))
  }
  if (topicFormulas.length) {
    rows.push([{ class: 'separator w10', label: '⭐ נושא נוכחי' }])
    // 4 chips per row.
    for (const row of chunk(topicFormulas, 4)) {
      rows.push(row.map(chipForFormula))
    }
  }

  // All categories
  for (const cat of FORMULA_LIBRARY) {
    // Don't double-render formulas already shown in the topic section.
    const remaining = cat.formulas.filter(f => !topicFormulas.includes(f))
    if (!remaining.length) continue
    rows.push([{ class: 'separator w10', label: cat.label }])
    for (const row of chunk(remaining, 4)) {
      rows.push(row.map(chipForFormula))
    }
  }

  if (!rows.length) {
    rows.push([{ class: 'separator', label: 'אין נוסחאות' }])
  }

  return rows
}

function registerLayout(): boolean {
  const kb = getKB()
  if (!kb) return false
  const rows = buildRows()
  // The custom-layout shape MathLive accepts: { label, tooltip, rows }.
  // We keep the 4 standard MathLive tabs alongside ours so the user never
  // loses ABC/numeric/symbols/greek. Using the expanded names (not 'default')
  // because MathLive resets `layouts` to the expanded form on first keyboard
  // show, which silently dropped our custom entry. Per user 2026-05-26.
  const customLayout = {
    label: 'וופלסטאק',
    tooltip: 'נוסחאות וופלסטאק',
    rows,
  }
  try {
    ;(kb as { layouts?: unknown }).layouts = [
      'numeric', 'symbols', 'alphabetic', 'greek', customLayout,
    ]
    return true
  } catch {
    return false
  }
}

/** Check whether our custom layout is actually in MathLive's layouts list.
 *  Used by the retry loop — MathLive may overwrite `layouts` on first show,
 *  so we keep re-registering until our entry sticks. */
function isRegistered(): boolean {
  const kb = getKB() as { layouts?: unknown[] } | undefined
  if (!kb?.layouts) return false
  return kb.layouts.some(l =>
    typeof l === 'object' && l !== null &&
    (l as { label?: string }).label === 'וופלסטאק',
  )
}

export default function WaffleStackKeyboard() {
  const longPressTimer = useRef<number | null>(null)
  const longPressFired = useRef(false)

  useEffect(() => {
    // Retry registration until MathLive's `mathVirtualKeyboard` exists, then
    // hook into its `before-virtual-keyboard-toggle` event so we re-register
    // every time the keyboard is shown. MathLive resets the `layouts` array
    // back to its 4 default tabs on first show, silently dropping our custom
    // layout — the event-driven re-registration plugs that hole. Per user
    // 2026-05-26: וופלסטאק tab was disappearing after page reload.
    let attempts = 0
    let listenerAttached = false
    const attachListener = () => {
      if (listenerAttached) return
      const kb = getKB() as (EventTarget & { addEventListener?: (t: string, f: () => void) => void }) | undefined
      if (!kb?.addEventListener) return
      kb.addEventListener('before-virtual-keyboard-toggle', () => {
        if (!isRegistered()) registerLayout()
      })
      kb.addEventListener('virtual-keyboard-toggle', () => {
        if (!isRegistered()) registerLayout()
      })
      listenerAttached = true
    }
    const tryRegister = () => {
      if (!isRegistered()) registerLayout()
      attachListener()
      attempts++
      if (!isRegistered() && attempts < 120) {
        window.setTimeout(tryRegister, 500)
      }
    }
    tryRegister()

    // Re-register on topic change (LessonScreen writes TOPIC_KEY on enter)
    // and on recents update.
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOPIC_KEY || e.key === RECENT_KEY) registerLayout()
    }
    const onRecent = () => registerLayout()
    const onTopicLocal = () => registerLayout()
    window.addEventListener('storage', onStorage)
    window.addEventListener('ws-formula-recent-changed', onRecent)
    window.addEventListener('ws-current-topic-changed', onTopicLocal)

    // Global long-press detector — runs on capture-phase pointerdown so it
    // sees taps inside MathLive's shadow-root-less keyboard DOM.
    const onPointerDown = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null
      if (!target) return
      // MathLive renders keys as divs with class names that include our
      // `ws-fid-<id>` tag (set via chipForFormula). Walk up to find one.
      let node: HTMLElement | null = target
      let fid: string | null = null
      while (node && node !== document.body) {
        const cls = node.className
        if (typeof cls === 'string') {
          const m = cls.match(/ws-fid-([a-z0-9_]+)/i)
          if (m) { fid = m[1]; break }
        }
        node = node.parentElement
      }
      if (!fid) return
      longPressFired.current = false
      const id = fid
      longPressTimer.current = window.setTimeout(() => {
        longPressFired.current = true
        window.dispatchEvent(new CustomEvent('ws-open-calc', { detail: { formulaId: id } }))
        // Hide the keyboard so the calculator can claim screen real estate.
        const kb = getKB() as { hide?: () => void } | undefined
        kb?.hide?.()
      }, LONG_PRESS_MS)
    }
    const cancelLongPress = () => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
    // On tap (pointerup without long-press firing), record it as recent.
    const onPointerUp = (ev: PointerEvent) => {
      cancelLongPress()
      if (longPressFired.current) return
      const target = ev.target as HTMLElement | null
      if (!target) return
      let node: HTMLElement | null = target
      while (node && node !== document.body) {
        const cls = node.className
        if (typeof cls === 'string') {
          const m = cls.match(/ws-fid-([a-z0-9_]+)/i)
          if (m) { pushRecentFormula(m[1]); break }
        }
        node = node.parentElement
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerUp, true)
    document.addEventListener('pointercancel', cancelLongPress, true)
    document.addEventListener('pointerleave', cancelLongPress, true)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ws-formula-recent-changed', onRecent)
      window.removeEventListener('ws-current-topic-changed', onTopicLocal)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerUp, true)
      document.removeEventListener('pointercancel', cancelLongPress, true)
      document.removeEventListener('pointerleave', cancelLongPress, true)
      cancelLongPress()
    }
  }, [])

  // No visible DOM — this is a side-effect-only component.
  return null
}
