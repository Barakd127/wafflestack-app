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
