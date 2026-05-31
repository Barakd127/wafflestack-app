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

/** React component: render a multi-line block. Each line that qualifies as
 *  a mixed-Hebrew equation renders as a KaTeX block. Other lines = plain text. */
export function MathLineBlock({ text, style }: { text: string; style?: React.CSSProperties }) {
  const lines = text.split(/\n/)
  return (
    <div style={style}>
      {lines.map((line, i) => {
        const latex = lineToLatex(line)
        if (latex === null) return <div key={i} dir="rtl" style={{ unicodeBidi: 'plaintext' }}>{line || ' '}</div>
        return <KatexLine key={i} latex={latex} />
      })}
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

function KatexLine({ latex }: { latex: string }) {
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
            throwOnError: false, displayMode: false, output: 'html',
          })
        } catch { node.textContent = latex }
      } else {
        setTimeout(render, 80)
      }
    }
    render()
    return () => { cancelled = true }
  }, [latex])
  return <div ref={ref} dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'center', padding: '4px 0' }} />
}
