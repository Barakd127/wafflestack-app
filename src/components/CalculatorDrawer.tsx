// CalculatorDrawer.tsx — floating, draggable-feeling panel that opens on
// the right edge above MathLive's virtual keyboard whenever the user
// long-presses a formula chip on the WaffleStack keyboard tab.
//
// Subscribes to: window event 'ws-open-calc' with detail { formulaId: string }.
//
// UI (RTL):
//   ┌──────────────────────────────┐
//   │ × close            label.    │
//   │ [KaTeX-rendered formula]     │
//   │ slot₁  [_______]             │
//   │ slot₂  [_______]             │
//   │ ─────────────                │
//   │ תוצאה:  42.0000              │
//   │ [📋 העתק תוצאה] [📐 הכנס]    │
//   └──────────────────────────────┘
//
// "Insert into equation" calls `wsActiveMathField.executeCommand(['insert',
// '= ' + result])` so the answer lands inline at the user's caret position
// in whichever math-field they last focused (Arsenal, Notebook, Mindmap).

import { useEffect, useMemo, useRef, useState } from 'react'
import { findFormula, type Formula } from '../data/formula-library'

declare global {
  interface Window {
    katex?: { renderToString: (latex: string, opts?: object) => string }
    wsActiveMathField?: { executeCommand?: (cmd: unknown) => void } | null
  }
}

// Palette (kept inline so this component is portable; matches
// wafflestack-conventions skill §16-§27).
const HONEY = '#F2A93E'
const EMBER = '#C97C18'
const INK = '#1A1A2E'
const PAPER = '#FFF7E8'
const SURFACE = 'rgba(255,255,255,0.06)'
const BORDER = 'rgba(242,169,62,0.45)'

/** Render a slot's text label. If the label looks like math (contains `_`,
 *  `^`, `\`, or `Σ` etc.) it renders via KaTeX so `s_y` looks like `s_y`
 *  with proper subscript instead of raw text. Per user 2026-05-27. */
function SlotLabel({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  // Heuristic: treat as math if it contains LaTeX commands or sub/super
  // markers. Plain Hebrew labels (like "ממוצע") render as text.
  const isMath = /[_^\\]/.test(text) || /[Σ∑μσπ√≤≥]/.test(text)
  useEffect(() => {
    if (!isMath) return
    const el = ref.current
    if (!el) return
    if (window.katex) {
      try {
        el.innerHTML = window.katex.renderToString(text, {
          throwOnError: false, displayMode: false, output: 'html',
        })
        return
      } catch { /* fall through */ }
    }
    el.textContent = text
  }, [text, isMath])
  if (!isMath) return (
    <span dir="ltr" style={{ minWidth: 80, fontSize: 13, color: HONEY, fontWeight: 600, textAlign: 'left' }}>
      {text}
    </span>
  )
  return (
    <span
      ref={ref}
      dir="ltr"
      style={{ minWidth: 80, fontSize: 14, color: HONEY, fontWeight: 600, textAlign: 'left' }}
    />
  )
}

/** Inline LaTeX block — used for the substitution row. */
function KatexBlock({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.katex) {
      try {
        el.innerHTML = window.katex.renderToString(latex, {
          throwOnError: false, displayMode: false, output: 'html',
        })
        return
      } catch { /* fall through */ }
    }
    el.textContent = latex
  }, [latex])
  return <span ref={ref} dir="ltr" style={{ display: 'inline-block' }} />
}

function FormulaPreview({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.katex) {
      try {
        el.innerHTML = window.katex.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          output: 'html',
        })
        return
      } catch { /* fallthrough */ }
    }
    el.textContent = latex
  }, [latex])
  return (
    <span
      ref={ref}
      dir="ltr"
      style={{
        display: 'block',
        background: SURFACE,
        border: '1px solid ' + BORDER,
        borderRadius: 10,
        padding: '10px 12px',
        margin: '8px 0 12px',
        color: PAPER,
        fontSize: 16,
        textAlign: 'center',
        overflowX: 'auto',
      }}
    />
  )
}

function evaluate(formula: Formula, vals: Record<string, string>): number | null {
  if (!formula.eval) return null
  const numeric: Record<string, number> = {}
  for (const slot of formula.slots) {
    const raw = (vals[slot.key] ?? '').trim()
    if (raw === '') return null
    // Allow simple `+/-/*//()` expressions per slot so the user can type
    // `60+70+80` for Σx without pre-summing.
    let n: number
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const f = new Function('return (' + raw + ')')
      n = Number(f())
    } catch {
      n = Number(raw)
    }
    if (!Number.isFinite(n)) return null
    numeric[slot.key] = n
  }
  try {
    const out = formula.eval(numeric)
    return Number.isFinite(out) ? out : null
  } catch {
    return null
  }
}

function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n)
  // Trim to 6 sig figs, drop trailing zeros.
  const fixed = n.toFixed(6)
  return fixed.replace(/\.?0+$/, '')
}

export default function CalculatorDrawer() {
  const [formula, setFormula] = useState<Formula | null>(null)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { formulaId?: string } | undefined
      const id = detail?.formulaId
      if (!id) return
      const f = findFormula(id)
      if (!f) return
      setFormula(f)
      setVals({})
      setCopied(false)
    }
    window.addEventListener('ws-open-calc', onOpen)
    return () => window.removeEventListener('ws-open-calc', onOpen)
  }, [])

  useEffect(() => {
    if (!formula) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFormula(null)
    }
    window.addEventListener('keydown', onKey)
    // Auto-focus first slot input on open so user can type values immediately.
    // Per plan curried-waddling-pelican Part B / Commit 6.
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 80)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [formula])

  // Compute substitution string — replace each slot's label/key in the LaTeX
  // with the parenthesised value the user typed. Best-effort: works well for
  // labels like 'n', 'k', 'r'. For multi-glyph labels (Σx) it tries the
  // simple replace first; if the slot's literal label can't be found in the
  // raw latex (because LaTeX-rendered Σ is `\sum`), we fall back to the
  // 2-line view (formula → result). Per user 2026-05-27.
  const allFilled = formula && formula.slots.every(s => (vals[s.key] ?? '').trim() !== '')
  const substLatex = useMemo(() => {
    if (!formula || !allFilled) return null
    let out = formula.latex
    let allReplaced = true
    for (const slot of formula.slots) {
      const raw = (vals[slot.key] ?? '').trim()
      const display = '(' + raw + ')'
      // Prefer slot.sym (the LaTeX substring authored for this slot), then
      // fall back to slot.label / slot.key as literal find targets.
      const candidates = [slot.sym, slot.label, slot.key]
      let replaced = false
      for (const c of candidates) {
        if (!c) continue
        if (out.includes(c)) {
          out = out.split(c).join(display)
          replaced = true
          break
        }
      }
      if (!replaced) allReplaced = false
    }
    return allReplaced ? out : null
  }, [formula, vals, allFilled])

  if (!formula) return null

  const result = evaluate(formula, vals)
  const resultText = result == null ? null : formatResult(result)
  const canInsertOrCopy = result != null

  const copyResult = async () => {
    if (result == null) return
    try {
      await navigator.clipboard.writeText(formatResult(result))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked */ }
  }

  const insertIntoField = () => {
    if (result == null) return
    const mf = window.wsActiveMathField
    if (mf?.executeCommand) {
      try {
        mf.executeCommand(['insert', '= ' + formatResult(result)])
      } catch { /* MathLive command rejected */ }
    }
  }

  const insertFormulaIntoField = () => {
    const mf = window.wsActiveMathField
    if (mf?.executeCommand) {
      try {
        mf.executeCommand(['insert', formula.latex])
      } catch { /* MathLive command rejected */ }
    }
  }

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-label="מחשבון נוסחה"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 100,
        width: 360,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        zIndex: 100001,
        background: 'rgba(26,26,46,0.96)',
        backdropFilter: 'blur(16px)',
        border: '2px solid ' + BORDER,
        borderRadius: 16,
        boxShadow: '0 18px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)',
        padding: 16,
        color: PAPER,
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <button
          onClick={() => setFormula(null)}
          aria-label="סגור מחשבון"
          title="סגור (Esc)"
          style={{
            background: SURFACE,
            border: '1px solid ' + BORDER,
            borderRadius: 12,
            padding: '6px 10px',
            color: PAPER,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 44,
            minWidth: 44,
          }}
        >
          ✕
        </button>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: HONEY, fontWeight: 600, letterSpacing: 0.4 }}>
            מחשבון נוסחה
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: PAPER }}>
            {formula.label}
          </div>
        </div>
      </div>

      {/* Formula preview */}
      <FormulaPreview latex={formula.latex} />

      {/* Slots */}
      {formula.slots.length === 0 ? (
        <div style={{ fontSize: 12, color: 'rgba(255,247,232,0.6)', margin: '8px 0' }}>
          לנוסחה זו אין משתנים לחישוב.
        </div>
      ) : (
        formula.slots.map((slot, slotIdx) => (
          <label
            key={slot.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              margin: '8px 0',
            }}
          >
            <SlotLabel text={slot.label} />
            <input
              ref={slotIdx === 0 ? firstInputRef : undefined}
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder={slot.placeholder || '0'}
              value={vals[slot.key] ?? ''}
              onChange={e => setVals(v => ({ ...v, [slot.key]: e.target.value }))}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: SURFACE,
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 10,
                color: PAPER,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                outline: 'none',
                minHeight: 44,
              }}
              onFocus={e => (e.target.style.borderColor = HONEY)}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
            />
          </label>
        ))
      )}

      {/* Substitution step — formula with values plugged in. Shown only when
       *  all slots filled AND substitution succeeded. Per user 2026-05-27. */}
      {formula.eval && substLatex && resultText && (
        <div
          dir="ltr"
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px dashed ' + BORDER,
            borderRadius: 10,
            textAlign: 'center',
            color: PAPER,
            fontSize: 14,
            overflowX: 'auto',
          }}
        >
          <div style={{ fontSize: 10, color: HONEY, marginBottom: 6, fontWeight: 600, letterSpacing: 0.3, direction: 'rtl' }}>
            הצבה
          </div>
          <KatexBlock latex={substLatex} />
        </div>
      )}

      {/* Result OR friendly missing-values hint */}
      {!formula.eval ? (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: SURFACE,
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: 10,
            fontSize: 12,
            color: 'rgba(255,247,232,0.7)',
            textAlign: 'center',
          }}
        >
          לנוסחה זו אין חישוב נומרי מובנה — נדרשת טבלה / כלי חיצוני.
        </div>
      ) : resultText == null ? (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px dashed rgba(242,169,62,0.45)',
            borderRadius: 10,
            fontSize: 13,
            color: 'rgba(255,247,232,0.85)',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          מלא ערכים לכל המשתנים כדי לראות תוצאה
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(242,169,62,0.18), rgba(201,124,24,0.12))',
            border: '1px solid ' + BORDER,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: HONEY, fontWeight: 600 }}>תוצאה</span>
          <span
            dir="ltr"
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: PAPER,
            }}
          >
            {resultText}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          onClick={copyResult}
          disabled={!canInsertOrCopy}
          style={{
            flex: 1,
            minHeight: 44,
            minWidth: 120,
            background: canInsertOrCopy
              ? `linear-gradient(135deg, ${HONEY}, ${EMBER})`
              : SURFACE,
            border: '1px solid ' + BORDER,
            borderRadius: 12,
            color: canInsertOrCopy ? INK : 'rgba(255,247,232,0.55)',
            fontFamily: "'Rubik', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            cursor: canInsertOrCopy ? 'pointer' : 'not-allowed',
            padding: '10px 14px',
          }}
        >
          {copied ? '✓ הועתק' : '📋 העתק תוצאה'}
        </button>
        <button
          onClick={insertIntoField}
          disabled={!canInsertOrCopy}
          style={{
            flex: 1,
            minHeight: 44,
            minWidth: 120,
            background: SURFACE,
            border: '1px solid ' + BORDER,
            borderRadius: 12,
            color: canInsertOrCopy ? PAPER : 'rgba(255,247,232,0.55)',
            fontFamily: "'Rubik', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: canInsertOrCopy ? 'pointer' : 'not-allowed',
            padding: '10px 14px',
          }}
          title="הכנס את התוצאה לתוך שדה המשוואה הפעיל"
        >
          📐 הכנס תוצאה
        </button>
      </div>

      {/* Secondary action — insert the formula's LaTeX itself into the
       *  focused math-field, even before the user filled values. Per plan
       *  curried-waddling-pelican Part B / Commit 6. */}
      <button
        onClick={insertFormulaIntoField}
        style={{
          marginTop: 8,
          width: '100%',
          minHeight: 40,
          background: 'transparent',
          border: '1px dashed ' + BORDER,
          borderRadius: 10,
          color: 'rgba(255,247,232,0.78)',
          fontFamily: "'Rubik', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 12px',
        }}
        title="הכנס את הנוסחה עצמה (LaTeX) למשוואה הפעילה"
      >
        ✍️ הכנס את הנוסחה למשוואה
      </button>
    </div>
  )
}
