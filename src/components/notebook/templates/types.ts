/**
 * Shared types for notebook templates.
 *
 * A template is a recipe — when applied, it creates a fresh tldraw page
 * (with `meta.paperStyle`) and adds a set of pre-arranged shapes. We keep
 * the descriptor format loose (just the inputs `editor.createShape` takes)
 * so the templates can mix note-containers, equations, geo shapes, etc.
 */
import type { PaperStyle } from '../state/notebookStore'

/**
 * Loose shape descriptor for templates. We intentionally don't reuse
 * `TLShapePartial` here because that type requires a pre-minted `id` —
 * templates describe shapes positionally and let the applier mint ids.
 */
export interface TemplateShape {
  type: string
  x: number
  y: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
}

export interface NotebookTemplate {
  id: string
  /** Hebrew label used in the toolbar dropdown. */
  label: string
  description: string
  /** Default page name when this template spawns a new page. */
  pageName: string
  paperStyle: PaperStyle
  shapes: TemplateShape[]
}
