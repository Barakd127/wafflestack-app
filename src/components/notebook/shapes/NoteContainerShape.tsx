/**
 * NoteContainerShape — OneNote-style "click anywhere, start typing" text
 * container. Expands horizontally up to a max width, then wraps vertically.
 *
 * The shape is registered into tldraw's global shape map via module
 * augmentation (the documented pattern for v5 custom shapes), so the rest
 * of the codebase gets full type inference when reading `shape.props`.
 */
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  type RecordProps,
  type TLBaseShape,
} from 'tldraw'

export interface NoteContainerProps {
  w: number
  h: number
  text: string
  fontSize: number
  /** Phase 2: free-form `#tags` attached to this container. */
  tags: string[]
}

export type NoteContainerShape = TLBaseShape<'note-container', NoteContainerProps>

// Register the shape into tldraw's global shape registry so that
// editor.createShape({ type: 'note-container', ... }) type-checks and so
// any code that destructures TLShape sees the new variant.
declare module '@tldraw/tlschema' {
  interface TLGlobalShapePropsMap {
    'note-container': NoteContainerProps
  }
}

const noteContainerProps: RecordProps<NoteContainerShape> = {
  w: { validate: (v: unknown) => v as number },
  h: { validate: (v: unknown) => v as number },
  text: { validate: (v: unknown) => v as string },
  fontSize: { validate: (v: unknown) => v as number },
  tags: {
    validate: (v: unknown) => (Array.isArray(v) ? (v as string[]) : []),
  },
}

export const NOTE_CONTAINER_MIN_W = 120
export const NOTE_CONTAINER_MAX_W = 560
export const NOTE_CONTAINER_PAD = 10
export const NOTE_CONTAINER_DEFAULT_FONT = 16

export class NoteContainerShapeUtil extends ShapeUtil<NoteContainerShape> {
  static override type = 'note-container' as const
  static override props = noteContainerProps

  override getDefaultProps(): NoteContainerShape['props'] {
    return {
      w: NOTE_CONTAINER_MIN_W,
      h: 40,
      text: '',
      fontSize: NOTE_CONTAINER_DEFAULT_FONT,
      tags: [],
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

  override getGeometry(shape: NoteContainerShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override getIndicatorPath(shape: NoteContainerShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }

  component(shape: NoteContainerShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id
    const { text, fontSize, w, h, tags } = shape.props

    const addTagPrompt = () => {
      const raw = window.prompt('הוסף תגית (ללא #):')
      if (!raw) return
      const tag = raw.replace(/^#/, '').trim()
      if (!tag) return
      const next = Array.from(new Set([...(tags ?? []), tag]))
      this.editor.updateShape<NoteContainerShape>({
        id: shape.id,
        type: 'note-container',
        props: { ...shape.props, tags: next },
      })
    }

    const removeTag = (t: string) => {
      this.editor.updateShape<NoteContainerShape>({
        id: shape.id,
        type: 'note-container',
        props: { ...shape.props, tags: (tags ?? []).filter((x) => x !== t) },
      })
    }

    const onInput = (e: React.FormEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const newText = el.textContent ?? ''
      const newW = Math.min(
        NOTE_CONTAINER_MAX_W,
        Math.max(NOTE_CONTAINER_MIN_W, el.scrollWidth + NOTE_CONTAINER_PAD * 2)
      )
      const newH = Math.max(40, el.scrollHeight + NOTE_CONTAINER_PAD * 2)
      this.editor.updateShape<NoteContainerShape>({
        id: shape.id,
        type: 'note-container',
        props: { ...shape.props, text: newText, w: newW, h: newH },
      })
    }

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          pointerEvents: 'all',
          fontFamily: "'Rubik', 'Segoe UI', sans-serif",
          fontSize,
          lineHeight: 1.4,
          padding: NOTE_CONTAINER_PAD,
          boxSizing: 'border-box',
          background: 'transparent',
          border: `1px dashed ${isEditing ? '#D4AF37' : 'transparent'}`,
          borderRadius: 4,
          color: '#0B1B3E',
          direction: 'rtl',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
          cursor: isEditing ? 'text' : 'move',
        }}
      >
        <div
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={onInput}
          onPointerDown={(e) => {
            if (isEditing) e.stopPropagation()
          }}
          style={{ outline: 'none', minHeight: 20 }}
        >
          {text}
        </div>
        {/* Tag chips strip — visible at the bottom of the container. */}
        {(isEditing || (tags && tags.length > 0)) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 6,
              direction: 'rtl',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {(tags ?? []).map((t) => (
              <span
                key={t}
                onDoubleClick={() => removeTag(t)}
                title="לחיצה כפולה להסרה"
                style={{
                  background: 'rgba(212,175,55,0.18)',
                  color: '#7A5C00',
                  border: '1px solid rgba(212,175,55,0.5)',
                  borderRadius: 10,
                  padding: '1px 8px',
                  fontSize: 11,
                  fontFamily: "'Rubik', sans-serif",
                  cursor: 'pointer',
                }}
              >
                #{t}
              </span>
            ))}
            {isEditing && (
              <button
                onClick={addTagPrompt}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(212,175,55,0.5)',
                  borderRadius: 10,
                  color: '#7A5C00',
                  padding: '0 8px',
                  fontSize: 11,
                  fontFamily: "'Rubik', sans-serif",
                  cursor: 'pointer',
                }}
              >
                + תגית
              </button>
            )}
          </div>
        )}
      </HTMLContainer>
    )
  }
}
