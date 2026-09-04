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

import { useEffect, useRef, useState } from 'react'
import { FORMULA_LIBRARY, allFormulas, findFormula, shortLabelOf, type Formula } from '../data/formula-library'
import { useKeyboardOpen, getStackOffset } from '../lib/uiStacks'

const TOPIC_KEY = 'wafflestack-current-topic'
const RECENT_KEY = 'wafflestack-formula-recent'
const GROUP_KEY = 'wafflestack-keyboard-group'    // 'descriptive' | 'inferential'
const RECENT_MAX = 6

function readGroup(): 'descriptive' | 'inferential' {
  try {
    const v = localStorage.getItem(GROUP_KEY)
    if (v === 'inferential') return 'inferential'
  } catch { /* */ }
  return 'descriptive'
}

function writeGroup(g: 'descriptive' | 'inferential'): void {
  try { localStorage.setItem(GROUP_KEY, g) } catch { /* */ }
  window.dispatchEvent(new CustomEvent('ws-keyboard-group-changed'))
}

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
  // Chip caption = shortLabel (s², b, x̄ …). MathLive renders this LaTeX
  // and would also insert it on tap — we override the insert manually in
  // the pointerup handler so the FULL `f.latex` is what reaches the
  // math-field. Per user 2026-05-27: "אני רוצה לראות רק את הסטטיסטי, לא
  // את הנוסחה המלאה".
  return {
    latex: shortLabelOf(f),
    class: `small ws-formula-chip ws-fid-${f.id}`,
    tooltip: f.label + (f.desc ? ' — ' + f.desc : ''),
    width: 2,
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
  const group = readGroup()
  const recentIds = readRecent()
  const all = allFormulas()

  const rows: unknown[] = []

  // (Essentials digit/edit row removed per user 2026-05-28 — they didn't want
  // it. Pure WaffleStack chips; numbers come from the calculator, editing from
  // the physical keyboard.)

  // Top row — תיאורית / היסקית group switcher.
  // The "ws-group-btn" class is intercepted by the pointerup handler.
  // MathLive treats these as keycaps but our handler stops the default
  // insert and swaps the active group instead.
  rows.push([
    {
      class: `ws-group-btn ws-group-descriptive ${group === 'descriptive' ? 'ws-group-active' : ''} MLK__keycap`,
      label: 'תיאורית',
      width: 5,
    },
    {
      class: `ws-group-btn ws-group-inferential ${group === 'inferential' ? 'ws-group-active' : ''} MLK__keycap`,
      label: 'היסקית',
      width: 5,
    },
  ])

  // Recents — visible regardless of selected group (user expects to see
  // what they used recently, no matter which side of the split).
  if (recentIds.length) {
    const recents = recentIds
      .map(id => findFormula(id))
      .filter((f): f is Formula => !!f)
    if (recents.length) {
      rows.push([{ class: 'separator w10', label: '🕓 אחרונים' }])
      for (const row of chunk(recents.map(chipForFormula), 4)) {
        rows.push(row)
      }
    }
  }

  // Topic-filtered section — also visible across groups.
  let topicFormulas: Formula[] = []
  if (currentTopic) {
    topicFormulas = all.filter(f => f.topics.includes(currentTopic))
  }
  if (topicFormulas.length) {
    rows.push([{ class: 'separator w10', label: '⭐ נושא נוכחי' }])
    for (const row of chunk(topicFormulas.map(chipForFormula), 4)) {
      rows.push(row)
    }
  }

  // Group-filtered categories.
  for (const cat of FORMULA_LIBRARY) {
    const catGroup = cat.group ?? 'descriptive'
    if (catGroup !== group) continue
    const remaining = cat.formulas.filter(f => !topicFormulas.includes(f))
    if (!remaining.length) continue
    rows.push([{ class: 'separator w10', label: cat.label }])
    for (const row of chunk(remaining.map(chipForFormula), 4)) {
      rows.push(row)
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
  // ONLY the WaffleStack layout — numeric (123) and alphabetic (abc) tabs
  // dropped per user 2026-05-28 ("רק של הוופלסטאק"). buildRows() prepends a
  // slim essentials row (digits + operators + backspace + arrows) so the
  // single keyboard stays usable for typing values + editing without a
  // separate tab.
  const customLayout = {
    label: 'וופלסטאק',
    tooltip: 'נוסחאות וופלסטאק',
    rows,
  }
  try {
    ;(kb as { layouts?: unknown }).layouts = [customLayout]
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

// Injected once on first mount — MathLive's default `.MLK__keycap` enforces a
// fixed min-width and clips overflow, which clips our LaTeX-rendered keycaps.
// Per user 2026-05-26 screenshot: chips were cut on both sides.
function injectKeyboardCSS(): void {
  if (document.getElementById('ws-keyboard-style')) return
  const style = document.createElement('style')
  style.id = 'ws-keyboard-style'
  style.textContent = `
/* Blue-toned keyboard theme that FOLLOWS the OS color-scheme — light-blue
 * plate + navy text in light mode, blue-dark plate + light text in dark mode.
 * Never the harsh near-black. Per user 2026-05-28: "אני רוצה רקע כחול".
 * We drive MathLive's own CSS custom properties (the clean way) rather than
 * hard background-color overrides. */
@media (prefers-color-scheme: light) {
  .ML__keyboard,
  .ML__keyboard .MLK__plate,
  .ML__keyboard .MLK__backdrop {
    --keyboard-background: #E8F0FF !important;
    --keyboard-text: #1F3E6C !important;
    --keycap-background: #F0F4FF !important;
    --keycap-background-hover: #E2ECFF !important;
    --keycap-text: #1F3E6C !important;
    --keycap-border: #C5D9F5 !important;
    --keycap-primary-background: #3351CA !important;
    --keycap-primary-text: #FFFFFF !important;
    --keyboard-toolbar-text: #1F3E6C !important;
    background-color: #E8F0FF !important;
    color: #1F3E6C !important;
  }
  .ML__keyboard .MLK__toolbar .left > div,
  .ML__keyboard .MLK__toolbar .right > div { color: #1F3E6C !important; }
  .ML__keyboard .MLK__keycap:not(.ws-formula-chip):not(.ws-group-btn) {
    background-color: #F0F4FF !important;
    color: #1F3E6C !important;
    border-color: #C5D9F5 !important;
  }
}
@media (prefers-color-scheme: dark) {
  .ML__keyboard,
  .ML__keyboard .MLK__plate,
  .ML__keyboard .MLK__backdrop {
    /* Lighter dark-mode blue (was #14213d near-black) per user 2026-05-28. */
    --keyboard-background: #243860 !important;
    --keyboard-text: #EAF1FF !important;
    --keycap-background: #2f4673 !important;
    --keycap-background-hover: #3a5488 !important;
    --keycap-text: #EAF1FF !important;
    --keycap-border: #436099 !important;
    --keycap-primary-background: #3351CA !important;
    --keycap-primary-text: #FFFFFF !important;
    --keyboard-toolbar-text: #EAF1FF !important;
    background-color: #243860 !important;
    color: #EAF1FF !important;
  }
  .ML__keyboard .MLK__toolbar .left > div,
  .ML__keyboard .MLK__toolbar .right > div { color: #EAF1FF !important; }
  .ML__keyboard .MLK__keycap:not(.ws-formula-chip):not(.ws-group-btn) {
    background-color: #2f4673 !important;
    color: #EAF1FF !important;
    border-color: #436099 !important;
  }
}
/* Uniform-width chips matching MathLive's default tab density (4 per row).
 * Themed to the dark navy / gold ink palette rather than fighting the rest
 * of the app's surfaces. Per plan curried-waddling-pelican Part A. */
.ws-formula-chip.MLK__keycap {
  /* Light app-palette chips: sky-blue gradient + navy ink text, instead of
   * the dark navy that fought the bright app theme. Per user 2026-05-27
   * "צבעים בהירים של האפליקציה". */
  background: linear-gradient(135deg, #F2F7FF 0%, #DCE8FB 100%) !important;
  border: 1px solid rgba(31,62,108,0.18) !important;
  border-radius: 10px !important;
  padding: 6px 8px !important;
  min-height: 46px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #1F3E6C !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.ws-formula-chip.MLK__keycap:hover,
.ws-formula-chip.MLK__keycap:active {
  background: linear-gradient(135deg, #FFFFFF 0%, #E8F1FF 100%) !important;
  border-color: rgba(242,175,19,0.65) !important;
  box-shadow: 0 0 0 2px rgba(242,175,19,0.40) !important;
  transform: translateY(-1px);
}
/* Chips show the short symbol at a readable size, in navy ink so it reads
 * on the light chip. KaTeX inherits the color property from the chip. */
.ws-formula-chip .ML__latex {
  font-size: 1.15em !important;
  max-width: 100% !important;
  color: #1F3E6C !important;
}
/* Section separators — gold ribbon look (wafflestack-conventions §17). */
.MLK__row .separator {
  font-family: 'Rubik', sans-serif !important;
  font-size: 11px !important;
  letter-spacing: 0.05em !important;
  color: #F2AF13 !important;
  padding: 10px 0 4px !important;
  text-align: center !important;
  width: 100% !important;
  background: transparent !important;
  border: 0 !important;
  font-weight: 700 !important;
}
/* Row spacing comfortable on the dark plate. */
.MLK__row:has(.ws-formula-chip) {
  gap: 6px;
  padding: 2px 8px;
}
/* Dockable keyboard: cap the height so it doesn't swallow the whole screen,
 * and let the chip rows scroll inside. The .ws-kb-expanded class (toggled by
 * the expand FAB) removes the cap for true fullscreen. Per user 2026-05-28. */
.ML__keyboard:not(.ws-kb-expanded) .MLK__plate {
  max-height: 46vh !important;
}
.ML__keyboard:not(.ws-kb-expanded) .MLK__rows {
  max-height: calc(46vh - 52px) !important;
  overflow-y: auto !important;
}
.ML__keyboard.ws-kb-expanded .MLK__plate {
  max-height: 92vh !important;
}
.ML__keyboard.ws-kb-expanded .MLK__rows {
  max-height: calc(92vh - 52px) !important;
  overflow-y: auto !important;
}
/* Top-level group switcher: תיאורית / היסקית.
 * INACTIVE state must stay legible on BOTH the light and dark plate — the
 * old near-white text on a near-transparent bg vanished on the light-mode
 * plate (user 2026-05-28 circled the washed-out 'תיאורית' button). */
.ws-group-btn.MLK__keycap {
  border: 1.5px solid rgba(242,175,19,0.55) !important;
  border-radius: 12px !important;
  font-family: 'Rubik', sans-serif !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  letter-spacing: 0.05em !important;
  padding: 10px 14px !important;
  min-height: 44px !important;
  cursor: pointer !important;
  transition: background 0.15s, border-color 0.15s, transform 0.15s !important;
}
@media (prefers-color-scheme: light) {
  .ws-group-btn.MLK__keycap { background: #FFFFFF !important; color: #1F3E6C !important; }
  .ws-group-btn.MLK__keycap:hover { background: #FFF7E0 !important; }
}
@media (prefers-color-scheme: dark) {
  .ws-group-btn.MLK__keycap { background: rgba(255,255,255,0.06) !important; color: #FFF7E8 !important; }
  .ws-group-btn.MLK__keycap:hover { background: rgba(242,175,19,0.16) !important; }
}
.ws-group-btn.ws-group-active.MLK__keycap {
  background: linear-gradient(135deg, #F5C842 0%, #F2AF13 100%) !important;
  color: #1A1A2E !important;
  border-color: #F2AF13 !important;
  box-shadow: 0 4px 12px rgba(242,169,62,0.40) !important;
}
.MLK__row:has(.ws-group-btn) {
  gap: 12px;
  padding: 10px 12px 6px;
  justify-content: center;
}
`
  document.head.appendChild(style)
}

export default function WaffleStackKeyboard() {
  // Snapshot of the active math-field value taken at pointerdown on a chip,
  // before MathLive auto-inserts the shortLabel. Used to overwrite with the
  // full formula latex on its own line.
  const valueBeforeTap = useRef<string>('')
  useEffect(() => {
    injectKeyboardCSS()
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

    // Safety: also re-check + re-register every time ANY math-field gets
    // focus. MathLive's toggle events sometimes don't fire (race vs. lazy
    // load), and once layouts is reset the keyboard ships without our tab.
    // Listening on document for focusin handles every math-field across
    // every surface (Arsenal, Notebook, Mindmap embed). Per user 2026-05-27.
    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement | null
      if (!target) return
      // math-field is a custom element; nodeName is 'MATH-FIELD'
      if (target.tagName === 'MATH-FIELD' || target.closest?.('math-field')) {
        // Delay so MathLive's own focus handler runs first and may overwrite.
        window.setTimeout(() => {
          if (!isRegistered()) registerLayout()
          attachListener()
        }, 60)
      }
    }
    document.addEventListener('focusin', onFocusIn, true)

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

    // Tap interception — capture-phase pointerup catches both group-switch
    // buttons (top of the וופלסטאק tab) and formula chips. For chips: we
    // override MathLive's default insert (which would insert the shortLabel)
    // and instead insert the full f.latex via wsActiveMathField, then open
    // the calculator drawer with the formula's slots.
    const onPointerUp = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null
      if (!target) return
      // Walk ancestors looking for either group-switch or formula-chip class.
      let node: HTMLElement | null = target
      let fid: string | null = null
      let groupSwitch: 'descriptive' | 'inferential' | null = null
      while (node && node !== document.body) {
        const cls = node.className
        if (typeof cls === 'string') {
          if (cls.includes('ws-group-descriptive')) { groupSwitch = 'descriptive'; break }
          if (cls.includes('ws-group-inferential')) { groupSwitch = 'inferential'; break }
          const m = cls.match(/ws-fid-([a-z0-9_]+)/i)
          if (m) { fid = m[1]; break }
        }
        node = node.parentElement
      }
      if (groupSwitch) {
        // Switch group + suppress MathLive's default insert (the 'תיאורית'
        // label was being inserted as text).
        ev.stopImmediatePropagation()
        ev.preventDefault()
        writeGroup(groupSwitch)
        registerLayout()
        return
      }
      if (!fid) return
      const formula = findFormula(fid)
      if (!formula) return
      pushRecentFormula(fid)
      // Tapping a chip should ONLY open the calculator — NOT add the formula
      // to the equation field. (Previously tap auto-inserted AND opened the
      // calc, which double-added when the user then pressed an insert button.)
      // MathLive's keycap handler still auto-inserts the chip's shortLabel, so
      // we restore the pre-tap snapshot to undo it. The actual insert happens
      // only via the calculator's buttons. Per user 2026-05-28.
      window.setTimeout(() => {
        const mf = (window as unknown as { wsActiveMathField?: { value?: string } }).wsActiveMathField
        if (mf && typeof mf.value === 'string') {
          mf.value = valueBeforeTap.current ?? ''
        }
      }, 0)
      window.dispatchEvent(new CustomEvent('ws-open-calc', { detail: { formulaId: fid } }))
    }
    // Capture-phase pointerdown fires BEFORE MathLive's keycap handler, so we
    // snapshot the math-field value as it was just before this tap inserts.
    const onPointerDown = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null
      if (!target) return
      let node: HTMLElement | null = target
      while (node && node !== document.body) {
        const cls = node.className
        if (typeof cls === 'string' && /ws-fid-/.test(cls)) {
          const mf = (window as unknown as { wsActiveMathField?: { value?: string } }).wsActiveMathField
          valueBeforeTap.current = mf?.value ?? ''
          return
        }
        node = node.parentElement
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerUp, true)
    // Re-register layout when group changes (writeGroup dispatches event).
    const onGroupChange = () => registerLayout()
    window.addEventListener('ws-keyboard-group-changed', onGroupChange)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ws-formula-recent-changed', onRecent)
      window.removeEventListener('ws-current-topic-changed', onTopicLocal)
      window.removeEventListener('ws-keyboard-group-changed', onGroupChange)
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerUp, true)
    }
  }, [])

  // Expand/collapse toggle for the keyboard footprint. Visible only while the
  // keyboard is open. Default = docked (capped height, scrolls). Per user
  // 2026-05-28: "אפשרות להרחיב למסך מלא, או לגלול".
  const kbOpen = useKeyboardOpen()
  const [expanded, setExpanded] = useState<boolean>(() => {
    try { return localStorage.getItem('wafflestack-keyboard-expanded') === '1' } catch { return false }
  })
  useEffect(() => {
    const kb = document.querySelector('.ML__keyboard')
    if (!kb) return
    kb.classList.toggle('ws-kb-expanded', expanded)
  }, [expanded, kbOpen])

  if (!kbOpen) return null
  const pos = getStackOffset('br', 'calculator-drawer') // sits just above keyboard-closer
  return (
    <button
      type="button"
      onClick={() => {
        setExpanded(v => {
          const next = !v
          try { localStorage.setItem('wafflestack-keyboard-expanded', next ? '1' : '0') } catch { /* */ }
          const kb = document.querySelector('.ML__keyboard')
          kb?.classList.toggle('ws-kb-expanded', next)
          return next
        })
      }}
      aria-label={expanded ? 'כווץ מקלדת' : 'הרחב מקלדת'}
      title={expanded ? 'כווץ מקלדת' : 'הרחב מקלדת למסך מלא'}
      style={{
        position: 'fixed',
        ...pos,
        zIndex: 242,
        background: 'linear-gradient(135deg,#F5C842,#F2AF13)',
        color: '#0B1B3E',
        border: 0,
        borderRadius: 24,
        padding: '8px 14px',
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
      <span aria-hidden style={{ fontSize: 16 }}>{expanded ? '⤡' : '⤢'}</span>
      <span>{expanded ? 'כווץ' : 'הרחב'}</span>
    </button>
  )
}
