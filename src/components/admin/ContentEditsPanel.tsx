// ── ContentEditsPanel — admin changelog for in-place lesson edits ───────────
//
// Overlay dialog listing every tracked content edit (newest first), Word
// track-changes style: before-text struck through with a red tint, after-text
// with a green tint. Export copies + downloads the JSON changelog so Claude
// can patch the lesson source permanently. adminMode gates the opener button.

import { useEffect, useRef, useState } from 'react'
import { getAllEdits, clearAllEdits, removeEdit, exportEdits, type ContentEdit } from '../../lib/contentEdits'

const TEXT_DARK = 'var(--sh-text-dark)'
const TEXT_MED = 'var(--sh-text-med)'

function fmtTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })
  } catch { return String(ts) }
}

export default function ContentEditsPanel({ onClose }: { onClose: () => void }) {
  const [edits, setEdits] = useState<ContentEdit[]>(() => getAllEdits())
  const [exported, setExported] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const refresh = () => setEdits(getAllEdits())

  const handleExport = async () => {
    const json = exportEdits()
    try { await navigator.clipboard.writeText(json) } catch { /* clipboard blocked — download still works */ }
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wafflestack-content-edits-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleClear = () => {
    if (!window.confirm('למחוק את כל היסטוריית השינויים? פעולה זו אינה הפיכה.')) return
    clearAllEdits()
    refresh()
  }

  const handleRevert = (id: string) => {
    removeEdit(id)
    refresh()
  }

  const sorted = [...edits].sort((a, b) => b.ts - a.ts)

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(11,27,62,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="שינויי תוכן (אדמין)"
        dir="rtl"
        style={{
          background: 'var(--sh-glass-card, rgba(20,35,70,0.97))',
          border: '1px solid rgba(245,200,66,0.35)',
          borderRadius: 18, boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
          width: 'min(680px, 100%)', maxHeight: '82vh',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Rubik', 'Assistant', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: '16px 20px', borderBlockEnd: '1px solid rgba(127,155,217,0.25)',
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK }}>
            📋 שינויי תוכן ({edits.length})
          </div>
          <button
            onClick={onClose}
            aria-label="סגירה"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(127,155,217,0.3)',
              color: TEXT_MED, borderRadius: 10, minWidth: 44, minHeight: 44,
              fontSize: 16, cursor: 'pointer',
            }}
          >✕</button>
        </div>

        {/* Edit list */}
        <div style={{ overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {sorted.length === 0 && (
            <div style={{ color: TEXT_MED, fontSize: 14, textAlign: 'center', padding: '28px 0' }}>
              אין עדיין שינויי תוכן. הפעל מצב אדמין ולחץ על ✏️ בשקופית כדי לערוך.
            </div>
          )}
          {sorted.map(e => (
            <div key={e.id} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(127,155,217,0.22)',
              borderRadius: 12, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBlockEnd: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT_MED }}>
                  {e.topicId} · שקופית {e.slideIdx + 1} · {e.field === 'title' ? 'כותרת' : 'תוכן'}
                  {e.revert ? ' · שחזור' : ''}
                  <span style={{ fontWeight: 400, marginInlineStart: 8 }}>{fmtTs(e.ts)} · {e.user}</span>
                </div>
                <button
                  onClick={() => handleRevert(e.id)}
                  aria-label="שחזור מקור"
                  title="ביטול רשומת שינוי זו"
                  style={{
                    background: 'rgba(245,200,66,0.10)', border: '1px solid rgba(245,200,66,0.40)',
                    color: '#b8860b', borderRadius: 8, minWidth: 44, minHeight: 44,
                    fontSize: 14, cursor: 'pointer', flexShrink: 0,
                  }}
                >↺</button>
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.7, textAlign: 'start', color: TEXT_DARK,
                background: 'rgba(220,60,60,0.10)', border: '1px solid rgba(220,60,60,0.22)',
                borderRadius: 8, padding: '6px 10px', marginBlockEnd: 6,
                textDecoration: 'line-through', textDecorationColor: 'rgba(220,60,60,0.7)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{e.before}</div>
              <div style={{
                fontSize: 14, lineHeight: 1.7, textAlign: 'start', color: TEXT_DARK,
                background: 'rgba(52,168,83,0.10)', border: '1px solid rgba(52,168,83,0.25)',
                borderRadius: 8, padding: '6px 10px',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{e.after}</div>
            </div>
          ))}
        </div>

        {/* Footer actions — primary (export) on the LEFT per RTL convention */}
        <div style={{
          display: 'flex', flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 10,
          padding: '14px 20px', borderBlockStart: '1px solid rgba(127,155,217,0.25)',
        }}>
          <button
            onClick={handleExport}
            disabled={edits.length === 0}
            style={{
              background: edits.length === 0 ? 'rgba(127,155,217,0.20)' : 'var(--sh-btn-color, #1F3E6C)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 20px', minHeight: 44, minWidth: 44,
              fontSize: 14, fontWeight: 700, fontFamily: "'Rubik', sans-serif",
              cursor: edits.length === 0 ? 'not-allowed' : 'pointer',
              opacity: edits.length === 0 ? 0.6 : 1,
            }}
          >{exported ? '✓ הועתק והורד' : 'ייצוא שינויים'}</button>
          <button
            onClick={handleClear}
            disabled={edits.length === 0}
            style={{
              background: 'rgba(220,60,60,0.10)', color: '#c0392b',
              border: '1px solid rgba(220,60,60,0.35)', borderRadius: 10,
              padding: '10px 20px', minHeight: 44, minWidth: 44,
              fontSize: 14, fontWeight: 600, fontFamily: "'Rubik', sans-serif",
              cursor: edits.length === 0 ? 'not-allowed' : 'pointer',
              opacity: edits.length === 0 ? 0.6 : 1,
            }}
          >נקה הכל</button>
        </div>
      </div>
    </div>
  )
}
