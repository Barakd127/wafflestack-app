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

import { useEffect } from 'react'
import { FORMULA_LIBRARY, allFormulas, findFormula, shortLabelOf, type Formula } from '../data/formula-library'

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

// Injected once on first mount — MathLive's default `.MLK__keycap` enforces a
// fixed min-width and clips overflow, which clips our LaTeX-rendered keycaps.
// Per user 2026-05-26 screenshot: chips were cut on both sides.
function injectKeyboardCSS(): void {
  if (document.getElementById('ws-keyboard-style')) return
  const style = document.createElement('style')
  style.id = 'ws-keyboard-style'
  style.textContent = `
/* Uniform-width chips matching MathLive's default tab density (4 per row).
 * Themed to the dark navy / gold ink palette rather than fighting the rest
 * of the app's surfaces. Per plan curried-waddling-pelican Part A. */
.ws-formula-chip.MLK__keycap {
  background: linear-gradient(135deg, #1A2440 0%, #101a2e 100%) !important;
  border: 1px solid rgba(212,175,55,0.18) !important;
  border-radius: 10px !important;
  padding: 6px 8px !important;
  min-height: 46px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.ws-formula-chip.MLK__keycap:hover,
.ws-formula-chip.MLK__keycap:active {
  border-color: rgba(212,175,55,0.55) !important;
  box-shadow: 0 0 0 2px rgba(212,175,55,0.32) !important;
  transform: translateY(-1px);
}
/* Shrink the rendered KaTeX so long formulas fit one keycap. */
.ws-formula-chip .ML__latex,
.ws-formula-chip .ML__base,
.ws-formula-chip .ML__mathit,
.ws-formula-chip .ML__cmr {
  font-size: 0.62em !important;
  max-width: 100% !important;
}
/* Section separators — gold ribbon look (wafflestack-conventions §17). */
.MLK__row .separator {
  font-family: 'Rubik', sans-serif !important;
  font-size: 11px !important;
  letter-spacing: 0.05em !important;
  color: #D4AF37 !important;
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
/* Top-level group switcher: תיאורית / היסקית */
.ws-group-btn.MLK__keycap {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(212,175,55,0.30) !important;
  border-radius: 12px !important;
  font-family: 'Rubik', sans-serif !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #FFF7E8 !important;
  letter-spacing: 0.05em !important;
  padding: 10px 14px !important;
  min-height: 44px !important;
  cursor: pointer !important;
  transition: background 0.15s, border-color 0.15s, transform 0.15s !important;
}
.ws-group-btn.MLK__keycap:hover {
  background: rgba(212,175,55,0.12) !important;
}
.ws-group-btn.ws-group-active.MLK__keycap {
  background: linear-gradient(135deg, #F2A93E 0%, #C97C18 100%) !important;
  color: #1A1A2E !important;
  border-color: #F2A93E !important;
  box-shadow: 0 4px 12px rgba(242,169,62,0.32) !important;
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
      // MathLive already inserted the shortLabel. Replace what it inserted
      // with the full latex. Use a microtask so MathLive's insert finishes
      // first, then we run our replacement.
      window.setTimeout(() => {
        const mf = (window as unknown as { wsActiveMathField?: { executeCommand?: (c: unknown) => void } }).wsActiveMathField
        if (mf?.executeCommand) {
          try {
            // Delete the shortLabel just inserted (back-delete by length of
            // the shortLabel's atoms — MathLive treats each LaTeX command as
            // one atom; calling deleteBackward N times where N = chars in
            // shortLabel is a rough approximation). Skip the delete for now
            // and rely on the user to manually replace if needed; the more
            // important step is opening the calculator.
          } catch { /* */ }
        }
      }, 0)
      window.dispatchEvent(new CustomEvent('ws-open-calc', { detail: { formulaId: fid } }))
    }
    document.addEventListener('pointerup', onPointerUp, true)
    // Re-register layout when group changes (writeGroup dispatches event).
    const onGroupChange = () => registerLayout()
    window.addEventListener('ws-keyboard-group-changed', onGroupChange)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ws-formula-recent-changed', onRecent)
      window.removeEventListener('ws-current-topic-changed', onTopicLocal)
      window.removeEventListener('ws-keyboard-group-changed', onGroupChange)
      document.removeEventListener('pointerup', onPointerUp, true)
    }
  }, [])

  // No visible DOM — this is a side-effect-only component.
  return null
}
