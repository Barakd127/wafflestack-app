/**
 * EquationShape — OneNote-style editable equation object.
 *
 * Phase 2 addition. Same pattern as NoteContainerShape (Phase 1):
 *   • Custom tldraw shape, registered via module augmentation.
 *   • Double-click to edit raw LaTeX through MathLive (`<math-field>`).
 *   • Renders KaTeX preview when not focused.
 *
 * MathLive (~400KB) is loaded lazily via dynamic import the first time an
 * equation shape enters edit mode, so the notebook's initial bundle is not
 * affected. KaTeX is assumed to be already present as `window.katex`.
 */
import { createElement, useEffect, useRef, useState } from 'react'

// Create a `<math-field>` custom element. React doesn't have type bindings
// for the MathLive web component; we hand-roll it here to keep TS strict
// happy without polluting the global JSX namespace.
function createMathField(
  latex: string,
  fontSize: number,
  refCb: (el: HTMLElement | null) => void
) {
  // User-facing setting: NEVER show raw LaTeX source.
  //   mathVirtualKeyboardPolicy="manual" + virtual-keyboard-mode "onfocus" —
  //     on-screen math keyboard appears, LaTeX source bar stays hidden.
  //   smartMode=true — typing "sin x" auto-converts to \sin x without user
  //     needing to know LaTeX.
  //   readOnly is off; user edits rendered math directly.
  return createElement(
    'math-field' as unknown as 'div',
    {
      ref: refCb as unknown as React.Ref<HTMLDivElement>,
      'math-virtual-keyboard-policy': 'manual',
      'virtual-keyboard-mode': 'onfocus',
      'smart-mode': 'true',
      'default-mode': 'math',
      style: {
        minWidth: '100%',
        fontSize,
        border: 0,
        outline: 'none',
        background: 'transparent',
        // Hide MathLive's default LaTeX-source caret + popover so user only
        // sees the rendered math.
        '--keystroke-caret-color': 'transparent',
        '--latex-color': 'transparent',
      } as React.CSSProperties,
    },
    latex
  )
}
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw'

export interface EquationProps {
  w: number
  h: number
  /** LaTeX source — the canonical representation. */
  latex: string
  fontSize: number
}

export type EquationShape = TLBaseShape<'equation', EquationProps>

declare module '@tldraw/tlschema' {
  interface TLGlobalShapePropsMap {
    'equation': EquationProps
  }
}

const equationProps: RecordProps<EquationShape> = {
  w: { validate: (v: unknown) => v as number },
  h: { validate: (v: unknown) => v as number },
  latex: { validate: (v: unknown) => v as string },
  fontSize: { validate: (v: unknown) => v as number },
}

export const EQUATION_MIN_W = 80
export const EQUATION_MIN_H = 40
export const EQUATION_DEFAULT_FONT = 20

// One-time MathLive import promise so multiple equation shapes share it.
let mathliveLoader: Promise<unknown> | null = null
function loadMathLive(): Promise<unknown> {
  if (mathliveLoader) return mathliveLoader
  mathliveLoader = import(
    /* @vite-ignore */
    'mathlive'
  ).catch((err: unknown) => {
    // Reset so a later attempt can retry once the dep is installed.
    mathliveLoader = null
    console.warn('[EquationShape] MathLive failed to load:', err)
    return null
  })
  return mathliveLoader
}

// KaTeX is loaded globally elsewhere in the app (see index.html). We read it
// off the window so this file doesn't take a hard dep on the package.
interface KatexLike {
  renderToString: (
    latex: string,
    options?: { throwOnError?: boolean; displayMode?: boolean }
  ) => string
}
function getKatex(): KatexLike | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { katex?: KatexLike }
  return w.katex ?? null
}

// React component split from the ShapeUtil so we can use hooks safely.
function EquationView(props: {
  shape: EquationShape
  isEditing: boolean
  onChange: (latex: string) => void
  onResize: (w: number, h: number) => void
}) {
  const { shape, isEditing, onChange, onResize } = props
  const { latex, fontSize, w, h } = shape.props
  const previewRef = useRef<HTMLDivElement | null>(null)
  const mathFieldRef = useRef<HTMLElement | null>(null)
  const [mathLiveReady, setMathLiveReady] = useState(false)

  // Lazy-load MathLive the first time we enter edit mode.
  useEffect(() => {
    if (!isEditing) return
    let active = true
    loadMathLive().then(() => {
      if (active) setMathLiveReady(true)
    })
    return () => {
      active = false
    }
  }, [isEditing])

  // Render KaTeX preview whenever LaTeX changes and we're not editing.
  useEffect(() => {
    if (isEditing) return
    const host = previewRef.current
    if (!host) return
    const katex = getKatex()
    if (!katex) {
      host.textContent = latex || 'נוסחה'
      return
    }
    try {
      host.innerHTML = katex.renderToString(latex || '\\text{נוסחה}', {
        throwOnError: false,
        displayMode: true,
      })
    } catch (err) {
      host.textContent = latex
    }

    // Auto-size to fit the rendered preview.
    requestAnimationFrame(() => {
      if (!host) return
      const newW = Math.max(EQUATION_MIN_W, host.scrollWidth + 24)
      const newH = Math.max(EQUATION_MIN_H, host.scrollHeight + 16)
      if (newW !== w || newH !== h) onResize(newW, newH)
    })
  }, [latex, isEditing, w, h, onResize])

  // Wire `<math-field>` input events once MathLive is ready.
  useEffect(() => {
    if (!isEditing || !mathLiveReady) return
    const el = mathFieldRef.current
    if (!el) return
    const handler = () => {
      const value = (el as unknown as { value: string }).value
      onChange(value)
    }
    el.addEventListener('input', handler)
    // Focus the math field so the user can start typing immediately.
    ;(el as unknown as { focus: () => void }).focus()
    return () => {
      el.removeEventListener('input', handler)
    }
  }, [isEditing, mathLiveReady, onChange])

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        width: w,
        height: h,
        pointerEvents: 'all',
        fontFamily: "'Rubik', 'Segoe UI', sans-serif",
        fontSize,
        background: 'rgba(255,255,255,0.92)',
        border: `1px ${isEditing ? 'solid' : 'dashed'} ${isEditing ? '#D4AF37' : 'rgba(212,175,55,0.45)'}`,
        borderRadius: 6,
        padding: 8,
        boxSizing: 'border-box',
        color: '#0B1B3E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isEditing ? 'text' : 'move',
        direction: 'ltr',
      }}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation()
      }}
    >
      {isEditing ? (
        mathLiveReady ? (
          // The <math-field> custom element from MathLive. TypeScript JSX
          // doesn't know about custom elements, so we create it imperatively
          // via React.createElement on an "unknown" intrinsic name.
          createMathField(latex, fontSize, (el) => (mathFieldRef.current = el))
        ) : (
          <span style={{ fontSize: 12, color: '#666' }}>טוען עורך נוסחאות…</span>
        )
      ) : (
        <div ref={previewRef} style={{ width: '100%', textAlign: 'center' }} />
      )}
    </HTMLContainer>
  )
}

export class EquationShapeUtil extends ShapeUtil<EquationShape> {
  static override type = 'equation' as const
  static override props = equationProps

  override getDefaultProps(): EquationShape['props'] {
    return {
      w: 160,
      h: EQUATION_MIN_H,
      latex: '',
      fontSize: EQUATION_DEFAULT_FONT,
    }
  }

  override canEdit() {
    return true
  }
  override canResize() {
    return true
  }
  override hideRotateHandle() {
    return true
  }

  override getGeometry(shape: EquationShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override getIndicatorPath(shape: EquationShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }

  component(shape: EquationShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id
    return (
      <EquationView
        shape={shape}
        isEditing={isEditing}
        onChange={(latex) => {
          this.editor.updateShape<EquationShape>({
            id: shape.id,
            type: 'equation',
            props: { ...shape.props, latex },
          })
        }}
        onResize={(w, h) => {
          this.editor.updateShape<EquationShape>({
            id: shape.id,
            type: 'equation',
            props: { ...shape.props, w, h },
          })
        }}
      />
    )
  }
}
