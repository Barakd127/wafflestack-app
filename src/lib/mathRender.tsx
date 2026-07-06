/**
 * mathRender.tsx — shared utility for rendering mixed Hebrew + math text.
 *
 * Pre-processes a line so the WHOLE equation (Hebrew label + math) renders
 * as ONE KaTeX block instead of fragmenting into mini-pieces. Per user
 * feedback 2026-05-24: lines like
 *   "ממוצע = Σx ÷ n = (60+70+80) ÷ 3 = 210 ÷ 3 = 70"
 * should be a single styled equation, not 5 fragments.
 */
import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    katex?: { renderToString: (latex: string, opts?: object) => string }
  }
}

const HEBREW_RE = /[֐-׿]/

/**
 * Merge adjacent `\begin{gathered}…\end{gathered}` blocks into ONE gathered.
 *
 * Legacy bug: some equation cards stored two formulas as back-to-back gathered
 * blocks (`…\end{gathered}\begin{gathered}…`). KaTeX renders those side-by-side
 * on one line instead of stacking. Replacing the `\end{gathered}\begin{gathered}`
 * seam with a row break ` \\ ` folds them into a single vertically-stacked
 * gathered. Render-time only; safe no-op when there's just one (or zero) block.
 */
export function mergeAdjacentGathered(latex: string): string {
  return latex.replace(/\\end\{gathered\}\s*\\begin\{gathered\}/g, ' \\\\ ')
}

/**
 * Build a line-numbered version of a (possibly multi-row) equation.
 *
 * KaTeX's `\tag` only works at the top level — NOT inside `gathered` — so we
 * build the body manually: split the gathered rows on the top-level `\\` row
 * separator and re-emit them as a 2-column `array`, each row carrying a
 * right-aligned `(n)` number. Column spec `cr` centres the formula and
 * right-aligns the number; a `\quad` before the number adds the gap. (KaTeX
 * 0.16 does NOT support the `@{…}` inter-column form, verified live — so the
 * gap goes inside the cell, not the preamble.)
 *
 * Always normalises legacy adjacent gathered blocks first. Returns the merged
 * (un-numbered) latex unchanged when there's only a single row — a lone formula
 * doesn't need a "(1)".
 */
export function buildNumberedLatex(latex: string): string {
  const merged = mergeAdjacentGathered(latex)
  const m = merged.match(/\\begin\{gathered\}([\s\S]*?)\\end\{gathered\}/)
  const inner = m ? m[1] : merged
  const rows = inner
    .split(/\\\\/)            // split on the `\\` row separator
    .map(r => r.trim())
    .filter(r => r.length > 0)
  if (rows.length < 2) return merged
  const body = rows.map((r, i) => `${r} & \\quad(${i + 1})`).join(' \\\\ ')
  return `\\begin{array}{cr} ${body} \\end{array}`
}

/** Convert a single line containing both Hebrew and math into a LaTeX string
 *  with `\text{...}` blocks around Hebrew runs. Returns null if the line
 *  is not a "mixed equation" (= leave as plain text). */
export function lineToLatex(line: string): string | null {
  if (line.includes('$')) return null              // user wrapped it themselves
  if (!line.includes('=')) return null             // no '=' means probably not equation
  if (!HEBREW_RE.test(line)) return null           // pure-math line — let upstream wrap
  if (!/[=+\-*/÷×·\d]/.test(line)) return null    // no actual math

  let out = ''
  let buf = ''
  let mode: 'heb' | 'math' = 'math'
  const flush = () => {
    if (!buf) return
    out += mode === 'heb' ? `\\text{${buf.replace(/[{}\\]/g, '')}}` : buf
    buf = ''
  }
  for (const ch of line) {
    const isHeb = /[֐-׿]/.test(ch)
    const isSpace = /\s/.test(ch)
    let newMode: 'heb' | 'math' = mode
    if (!isSpace) newMode = isHeb ? 'heb' : 'math'
    if (newMode !== mode) { flush(); mode = newMode }
    buf += ch
  }
  flush()
  return out
    .replace(/÷/g, ' \\div ')
    .replace(/×/g, ' \\times ')
    .replace(/·/g, ' \\cdot ')
    .replace(/Σ/g, '\\Sigma ')
    .replace(/π/g, '\\pi ')
    .replace(/μ/g, '\\mu ')
    .replace(/σ/g, '\\sigma ')
    .replace(/√/g, '\\sqrt ')
    .replace(/∞/g, '\\infty ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≠/g, ' \\ne ')
}

// A run is "math" worth LTR-isolating only if it actually carries a digit,
// Latin letter, or a strong math symbol — so lone Hebrew-adjacent punctuation
// (":", "—", ".") still flows RTL instead of becoming an LTR island.
const STRONG_MATH_RE = /[0-9A-Za-z=<>+\-*/^_·×÷√∑Σπμσ≤≥≠∪∩∅⊂⊆⊇∈∉∞|]/

/** Split a line into alternating Hebrew (RTL) and non-Hebrew (math/LTR) runs.
 *  Whitespace sticks to the current run so equations keep their internal
 *  spacing ("P(A) = 0.6" stays one LTR unit). */
// Bidi-neutral punctuation sticks to the CURRENT run instead of opening a new
// math run. Without this, Hebrew-adjacent punctuation gets glued into the LTR
// island: "מאפשרת: 1)" segmented ":" + "1)" as one LTR unit tears the colon off
// the Hebrew word and visually flips the paren ("מאפשרת(1 :") — the recurring
// "numbering is off" bug. With it, "מאפשרת: " stays RTL and "1)" is its own
// LTR-isolated unit, so numbered points render exactly as authored.
const NEUTRAL_PUNCT_RE = /[:;,.()\[\]"'«»?!…—–]/

function bidiSafeSegments(line: string): Array<{ ltr: boolean; text: string }> {
  const segs: Array<{ ltr: boolean; text: string }> = []
  let buf = ''
  let mode: 'heb' | 'math' | null = null
  const flush = () => { if (buf) { segs.push({ ltr: mode === 'math', text: buf }); buf = '' } }
  for (const ch of line) {
    let m: 'heb' | 'math' = mode === 'heb' ? 'heb' : 'math'
    // Whitespace and neutral punctuation inherit the current run's direction;
    // only strongly-typed characters (Hebrew vs everything else) switch modes.
    if (!/\s/.test(ch) && !NEUTRAL_PUNCT_RE.test(ch)) m = HEBREW_RE.test(ch) ? 'heb' : 'math'
    if (mode === null) mode = m
    if (m !== mode) { flush(); mode = m }
    buf += ch
  }
  flush()
  return segs
}

/** Render ONE line in natural RTL flow with any math kept LTR + bidi-isolated.
 *  - `$…$` runs → inline KaTeX (real notation), LTR-isolated.
 *  - un-delimited lines → conservative fallback: maximal non-Hebrew runs that
 *    carry digits/Latin/operators are wrapped LTR so `≤`/`≥`/`<`/`>`/parens
 *    never mirror and runs never jump sides; Hebrew stays plain RTL. */
function MathLine({ line }: { line: string }) {
  if (!line) return <div dir="rtl">{' '}</div>

  // 1) Explicit $…$ math — split keeping delimiters (same contract as MathText).
  if (line.includes('$')) {
    const parts = line.split(/(\$[^$]+\$)/g)
    return (
      <div dir="rtl" style={{ unicodeBidi: 'isolate', textAlign: 'right' }}>
        {parts.map((part, i) =>
          part.length >= 2 && part.startsWith('$') && part.endsWith('$')
            ? <KatexInline key={i} latex={part.slice(1, -1)} style={{ verticalAlign: 'middle' }} />
            : <React.Fragment key={i}>{part}</React.Fragment>
        )}
      </div>
    )
  }

  // 2) No $ but Hebrew + math mixed — bidi-safe fallback. Wrap each math run in
  //    an INLINE (not inline-block, which swallows adjacent spaces) LTR-isolated
  //    span so operators never mirror; keep the spaces AROUND each run as plain
  //    text nodes so word spacing stays natural ("b הוא", "ערך X").
  if (HEBREW_RE.test(line) && STRONG_MATH_RE.test(line)) {
    return (
      <div dir="rtl" style={{ unicodeBidi: 'isolate', textAlign: 'right' }}>
        {bidiSafeSegments(line).map((seg, i) => {
          if (!(seg.ltr && STRONG_MATH_RE.test(seg.text))) {
            return <React.Fragment key={i}>{seg.text}</React.Fragment>
          }
          const mm = seg.text.match(/^(\s*)([\s\S]*?)(\s*)$/)
          const lead = mm ? mm[1] : ''
          const core = mm ? mm[2] : seg.text
          const trail = mm ? mm[3] : ''
          return (
            <React.Fragment key={i}>
              {lead}
              <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{core}</span>
              {trail}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  // 3) Plain line (pure Hebrew or pure math) — natural direction.
  return <div dir="rtl" style={{ unicodeBidi: 'plaintext', textAlign: 'right' }}>{line}</div>
}

/** React component: render a multi-line block. Every line renders in RTL flow;
 *  math (whether `$…$`-delimited or auto-detected) stays LTR + bidi-isolated so
 *  Hebrew never flips and comparison operators never mirror. */
export function MathLineBlock({ text, style }: { text: string; style?: React.CSSProperties }) {
  const lines = String(text ?? '').split(/\n/)
  return (
    <div style={style}>
      {lines.map((line, i) => <MathLine key={i} line={line} />)}
    </div>
  )
}
/** Render a raw LaTeX string as KaTeX. Use this when you have only LaTeX
 *  (no Hebrew, no surrounding text) and just want the rendered equation. */
export function KatexInline({ latex, displayMode = false, style }: {
  latex: string; displayMode?: boolean; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let cancelled = false
    const render = () => {
      if (cancelled) return
      if (window.katex) {
        try {
          node.innerHTML = window.katex.renderToString(latex, {
            throwOnError: false, displayMode, output: 'html',
          })
        } catch { node.textContent = latex }
      } else {
        setTimeout(render, 80)
      }
    }
    render()
    return () => { cancelled = true }
  }, [latex, displayMode])
  return <div ref={ref} dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block', ...style }} />
}

/** Render a mixed Hebrew/plain string that may contain inline `$…$` math
 *  segments. Plain runs render as-is (inherit the surrounding RTL flow);
 *  each `$…$` run renders as LTR-isolated KaTeX via {@link KatexInline}.
 *
 *  Used by the quiz renderer so a question/option like
 *    "הערך $\bar{X}=110$ הוא סטטיסטי" / "$\mu$ של אוכלוסיה"
 *  shows real notation instead of plain "X=110". No `$` in the string → the
 *  text is returned verbatim (zero overhead for non-math options). */
export function MathText({ text, style }: { text?: string; style?: React.CSSProperties }) {
  if (!text) return null
  if (!text.includes('$')) return <>{text}</>
  // Split on `$…$` runs, keeping the delimiters so we can tell math from text.
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.length >= 2 && part.startsWith('$') && part.endsWith('$')) {
          return (
            <KatexInline
              key={i}
              latex={part.slice(1, -1)}
              style={{ verticalAlign: 'middle', ...style }}
            />
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

