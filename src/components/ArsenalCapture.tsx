/**
 * ArsenalCapture — floating chip that appears when the user selects text
 * inside any element marked `data-arsenal-source`. Click the chip to
 * "catch" the selection into the arsenal as a gotcha / trick / tip.
 *
 * Optional context attribute: `data-arsenal-topic` on the source element
 * pre-fills the topic for the saved entry.
 *
 * Listens at the document level so it works across the lesson screen and
 * quiz explanations without needing to be wired per-component.
 */
import { useEffect, useRef, useState } from 'react'
import { useArsenalStore, KIND_META, type ArsenalKind } from '../store/arsenalStore'

interface ChipState {
  text: string
  topicId?: string
  source: 'slide' | 'quiz' | 'manual'
  rect: { left: number; top: number; width: number; height: number }
}

export default function ArsenalCapture() {
  const [chip, setChip] = useState<ChipState | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const addEntry = useArsenalStore(s => s.addEntry)
  const lastSelectionRef = useRef<string>('')

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setChip(null)
        setExpanded(false)
        return
      }
      const text = sel.toString().trim()
      if (text.length < 3) {
        setChip(null)
        setExpanded(false)
        return
      }
      // Both anchor and focus must sit inside an arsenal source element
      const anchor = sel.anchorNode?.parentElement?.closest('[data-arsenal-source]') as HTMLElement | null
      const focus = sel.focusNode?.parentElement?.closest('[data-arsenal-source]') as HTMLElement | null
      if (!anchor || !focus || anchor !== focus) {
        setChip(null)
        setExpanded(false)
        return
      }
      const range = sel.getRangeAt(0)
      const r = range.getBoundingClientRect()
      const sourceVal = (anchor.dataset.arsenalSource as 'slide' | 'quiz' | 'manual' | undefined) || 'slide'
      const topicId = anchor.dataset.arsenalTopic || undefined
      lastSelectionRef.current = text
      setChip({
        text,
        topicId,
        source: sourceVal,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      })
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  const handleSave = (kind: ArsenalKind) => {
    if (!chip) return
    addEntry({ kind, text: chip.text, topicId: chip.topicId, source: chip.source })
    setChip(null)
    setExpanded(false)
    setShowFlash(true)
    window.setTimeout(() => setShowFlash(false), 1500)
    // Clear browser selection so chip doesn't immediately re-appear
    try { window.getSelection()?.removeAllRanges() } catch { /* */ }
  }

  // Position the chip *above* the selection, clamped to viewport
  const chipStyle = (): React.CSSProperties => {
    if (!chip) return {}
    const TOP_OFFSET = 38
    const PAD = 8
    const left = Math.max(PAD, Math.min(window.innerWidth - 260 - PAD, chip.rect.left + chip.rect.width / 2 - 130))
    const top = Math.max(PAD, chip.rect.top - TOP_OFFSET)
    return { position: 'fixed', left, top, zIndex: 250 }
  }

  return (
    <>
      {chip && (
        <div
          dir="rtl"
          style={{
            ...chipStyle(),
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(15,15,35,0.95)',
            color: '#fff',
            borderRadius: 14,
            padding: '6px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.5)',
            fontFamily: "'Rubik', sans-serif",
            fontSize: 13, fontWeight: 600,
            animation: 'arsenalChipIn 0.16s ease',
            backdropFilter: 'blur(12px)',
          }}
          // Prevent the chip click from clearing the selection before we can read it
          onMouseDown={e => e.preventDefault()}
        >
          {expanded ? (
            <>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginInlineEnd: 4 }}>
                שמור כ:
              </span>
              {(['gotcha', 'trick', 'tip'] as ArsenalKind[]).map(k => {
                const m = KIND_META[k]
                return (
                  <button
                    key={k}
                    onClick={() => handleSave(k)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: `1px solid ${m.border}`,
                      borderRadius: 10,
                      padding: '4px 9px',
                      cursor: 'pointer',
                      fontFamily: "'Rubik', sans-serif",
                      fontSize: 12, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = m.color }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                  >
                    <span>{m.icon}</span><span>{m.label}</span>
                  </button>
                )
              })}
              <button
                onClick={() => { setChip(null); setExpanded(false) }}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', cursor: 'pointer', fontSize: 14, marginInlineStart: 2 }}
                title="בטל"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              style={{
                background: 'transparent', color: '#fff', border: 'none',
                cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                fontSize: 13, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>🎯</span><span>שמור לארסנל</span>
            </button>
          )}
        </div>
      )}

      {showFlash && (
        <div
          dir="rtl"
          style={{
            position: 'fixed', top: 28, left: '50%', transform: 'translateX(-50%)',
            background: '#10b981', color: '#fff',
            padding: '10px 20px', borderRadius: 14,
            fontFamily: "'Rubik', sans-serif",
            fontSize: 14, fontWeight: 700,
            boxShadow: '0 8px 28px rgba(16,185,129,0.45)',
            zIndex: 260,
            animation: 'wsAddNoteFlash 1.5s ease forwards',
            pointerEvents: 'none',
          }}
        >
          ✓ נשמר לארסנל
        </div>
      )}
    </>
  )
}
