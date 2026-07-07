// ── contentEdits — admin in-place lesson editing with track-changes ─────────
//
// Admins (adminMode in learningStore) can edit slide titles/content in place.
// Every change is appended to a persistent changelog (Word-style track
// changes) in localStorage. The latest edit per (topicId, slideIdx, field)
// acts as a runtime override on top of the bundled lesson content. An export
// produces a pretty JSON doc that can be handed to Claude to patch the
// source files permanently.
//
// localStorage key: 'wafflestack-content-edits' — single JSON doc:
//   { edits: ContentEdit[] }

const STORAGE_KEY = 'wafflestack-content-edits'
const SCHEMA_VERSION = 1
const APP_VERSION = '1.0.0' // keep in sync with package.json

export type EditField = 'title' | 'content'

export interface ContentEdit {
  id: string
  topicId: string
  slideIdx: number
  field: EditField
  before: string
  after: string
  ts: number
  user: string
  /** true when this entry restores the original (revert action, kept in history) */
  revert?: boolean
}

interface EditsDoc {
  edits: ContentEdit[]
}

function currentUser(): string {
  try { return localStorage.getItem('userName') || 'admin' } catch { return 'admin' }
}

function loadDoc(): EditsDoc {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { edits: [] }
    const parsed = JSON.parse(raw) as EditsDoc
    if (!parsed || !Array.isArray(parsed.edits)) return { edits: [] }
    return parsed
  } catch {
    return { edits: [] }
  }
}

function saveDoc(doc: EditsDoc): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)) } catch { /* quota — ignore */ }
}

function makeId(): string {
  return `ce-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Latest-wins override for a slide field. Returns null when no active
 * override exists (never edited, or last entry for the key is a revert).
 */
export function getOverride(topicId: string, slideIdx: number, field: EditField): string | null {
  const { edits } = loadDoc()
  for (let i = edits.length - 1; i >= 0; i--) {
    const e = edits[i]
    if (e.topicId === topicId && e.slideIdx === slideIdx && e.field === field) {
      return e.revert ? null : e.after
    }
  }
  return null
}

/** Append an edit; it immediately becomes the active override for its key. */
export function recordEdit(topicId: string, slideIdx: number, field: EditField, before: string, after: string): ContentEdit {
  const doc = loadDoc()
  const edit: ContentEdit = {
    id: makeId(), topicId, slideIdx, field, before, after,
    ts: Date.now(), user: currentUser(),
  }
  doc.edits.push(edit)
  saveDoc(doc)
  return edit
}

/**
 * Revert a slide field back to the original source text. Appends a revert
 * entry (history is preserved) whose `after` is the pre-edit original.
 * No-op when there is no active override.
 */
export function revertOverride(topicId: string, slideIdx: number, field: EditField): void {
  const doc = loadDoc()
  // Find the FIRST non-revert edit for this key — its `before` is the original.
  const first = doc.edits.find(e => e.topicId === topicId && e.slideIdx === slideIdx && e.field === field && !e.revert)
  const active = getOverride(topicId, slideIdx, field)
  if (!first || active === null) return
  doc.edits.push({
    id: makeId(), topicId, slideIdx, field,
    before: active, after: first.before,
    ts: Date.now(), user: currentUser(), revert: true,
  })
  saveDoc(doc)
}

/** Remove a single edit entry by id (used by per-edit revert in the panel). */
export function removeEdit(id: string): void {
  const doc = loadDoc()
  doc.edits = doc.edits.filter(e => e.id !== id)
  saveDoc(doc)
}

export function getAllEdits(): ContentEdit[] {
  return loadDoc().edits
}

export function clearAllEdits(): void {
  saveDoc({ edits: [] })
}

/** Pretty JSON changelog with schema header — hand this to Claude to patch source. */
export function exportEdits(): string {
  return JSON.stringify({
    schema: 'wafflestack-content-edits',
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    edits: loadDoc().edits,
  }, null, 2)
}
