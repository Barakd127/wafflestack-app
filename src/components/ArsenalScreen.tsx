/**
 * ArsenalScreen — full-page view of the user's collected gotchas / tricks / tips.
 *
 * Layout: header (title + count + add) → filter pills (kind + topic) → card grid.
 * All client-side; reads from arsenalStore. Animations use scoped CSS classes
 * defined in index.css (`arsenal-card-in`, `arsenal-pin-pulse`, `arsenal-card-out`).
 */
import { useState, useMemo } from 'react'
import { useArsenalStore, KIND_META, type ArsenalEntry, type ArsenalKind } from '../store/arsenalStore'

// Keep in sync with HEBREW_LABELS in StudyHub.tsx
const TOPIC_LABELS: Record<string, string> = {
  'mean':                 'ממוצע',
  'median':               'חציון',
  'std-dev':              'סטיית תקן',
  'probability':          'הסתברות',
  'regression':           'רגרסיה',
  'correlation':          'קורלציה',
  'binomial':             'בינום',
  'hypothesis-testing':   'מבחן השערות',
  'sampling':             'מדגם',
  'confidence-intervals': 'רווח סמך',
}

const TEXT_DARK  = 'var(--sh-text-dark)'
const TEXT_MED   = 'var(--sh-text-med)'
const TEXT_LIGHT = 'var(--sh-text-light)'

type FilterKind = 'all' | ArsenalKind | 'pinned'
type FilterTopic = 'all' | string

export default function ArsenalScreen() {
  const entries = useArsenalStore(s => s.entries)
  const removeEntry = useArsenalStore(s => s.removeEntry)
  const togglePin = useArsenalStore(s => s.togglePin)
  const editEntry = useArsenalStore(s => s.editEntry)
  const addEntry = useArsenalStore(s => s.addEntry)

  const [kindFilter, setKindFilter] = useState<FilterKind>('all')
  const [topicFilter, setTopicFilter] = useState<FilterTopic>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  // Counts per kind (includes pinned across all kinds)
  const counts = useMemo(() => ({
    all: entries.length,
    gotcha: entries.filter(e => e.kind === 'gotcha').length,
    trick:  entries.filter(e => e.kind === 'trick').length,
    tip:    entries.filter(e => e.kind === 'tip').length,
    pinned: entries.filter(e => e.pinned).length,
  }), [entries])

  // Filtered + sorted (pinned first, then newest)
  const visible = useMemo(() => {
    let list = entries
    if (kindFilter === 'pinned') list = list.filter(e => e.pinned)
    else if (kindFilter !== 'all') list = list.filter(e => e.kind === kindFilter)
    if (topicFilter !== 'all') list = list.filter(e => e.topicId === topicFilter)
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.createdAt - a.createdAt
    })
  }, [entries, kindFilter, topicFilter])

  // Topics actually present in the current set (so we don't show empty filter options)
  const presentTopics = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.topicId) set.add(e.topicId) })
    return Array.from(set)
  }, [entries])

  const handleDelete = (id: string) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      removeEntry(id)
      setRemovingIds(prev => { const next = new Set(prev); next.delete(id); return next })
    }, 220)
  }

  const startEdit = (entry: ArsenalEntry) => {
    setEditingId(entry.id)
    setEditingText(entry.text)
  }
  const commitEdit = () => {
    if (editingId && editingText.trim()) editEntry(editingId, editingText.trim())
    setEditingId(null)
    setEditingText('')
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  return (
    <div dir="rtl" style={{
      flex: 1, overflow: 'auto', padding: '32px 40px',
      fontFamily: "'Rubik', 'Assistant', sans-serif",
      background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(99,102,241,0.04) 50%, rgba(168,85,247,0.05) 100%)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT_DARK, margin: 0, letterSpacing: 0.3 }}>
            🎯 ארסנל הקאצ'ים שלי
          </h1>
          <div style={{ fontSize: 14, color: TEXT_LIGHT, marginTop: 4 }}>
            {entries.length === 0
              ? 'אוסף אישי של גוטצ\'ות, טריקים וטיפים שתפסת בדרך'
              : `${entries.length} פריטים שתפסת עד עכשיו · המשך לתפוס!`}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={primaryBtn}
        >
          + הוסף חדש
        </button>
      </div>

      {/* Kind filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <FilterPill label="הכל" icon="🎯" count={counts.all}
          selected={kindFilter === 'all'} onClick={() => setKindFilter('all')}
          color="#6366f1" bg="rgba(99,102,241,0.12)" />
        <FilterPill label="גוטצ'ות" icon="🐛" count={counts.gotcha}
          selected={kindFilter === 'gotcha'} onClick={() => setKindFilter('gotcha')}
          color="#b91c1c" bg="rgba(239,68,68,0.12)" />
        <FilterPill label="טריקים" icon="💡" count={counts.trick}
          selected={kindFilter === 'trick'} onClick={() => setKindFilter('trick')}
          color="#b45309" bg="rgba(245,158,11,0.12)" />
        <FilterPill label="טיפים" icon="💎" count={counts.tip}
          selected={kindFilter === 'tip'} onClick={() => setKindFilter('tip')}
          color="#1e40af" bg="rgba(99,102,241,0.12)" />
        <FilterPill label="מוצמדים" icon="📌" count={counts.pinned}
          selected={kindFilter === 'pinned'} onClick={() => setKindFilter('pinned')}
          color="#92400e" bg="rgba(251,191,36,0.18)" />

        {/* Topic dropdown — pushed to the start (RTL: visually left) */}
        {presentTopics.length > 0 && (
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value as FilterTopic)}
            style={{
              marginInlineStart: 'auto',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 18, padding: '8px 14px',
              fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_DARK,
              cursor: 'pointer',
            }}
          >
            <option value="all">כל הנושאים</option>
            {presentTopics.map(t => (
              <option key={t} value={t}>{TOPIC_LABELS[t] || t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Card grid OR empty state */}
      {visible.length === 0 ? (
        <EmptyState hasEntries={entries.length > 0} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 6,
        }}>
          {visible.map((entry, idx) => (
            <ArsenalCard
              key={entry.id}
              entry={entry}
              indexInList={idx}
              isEditing={editingId === entry.id}
              editingText={editingText}
              onEditingTextChange={setEditingText}
              onStartEdit={() => startEdit(entry)}
              onCommitEdit={commitEdit}
              onCancelEdit={cancelEdit}
              onTogglePin={() => togglePin(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              removing={removingIds.has(entry.id)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onSave={(kind, text, topicId) => {
            addEntry({ kind, text, topicId, source: 'manual' })
            setShowAddModal(false)
          }}
          presentTopics={Object.keys(TOPIC_LABELS)}
        />
      )}
    </div>
  )
}

// ── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, icon, count, selected, onClick, color, bg }: {
  label: string; icon: string; count: number; selected: boolean; onClick: () => void; color: string; bg: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: selected ? color : bg,
        border: `1.5px solid ${selected ? color : color + '50'}`,
        color: selected ? '#fff' : color,
        borderRadius: 18, padding: '7px 14px',
        cursor: 'pointer', fontWeight: 600, fontSize: 13,
        fontFamily: "'Rubik', sans-serif",
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 4px 14px ${color}55` : 'none',
        transform: selected ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span style={{ opacity: selected ? 0.95 : 0.7, fontSize: 11, fontWeight: 700 }}>({count})</span>
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
function ArsenalCard({
  entry, indexInList, isEditing, editingText, onEditingTextChange,
  onStartEdit, onCommitEdit, onCancelEdit, onTogglePin, onDelete, removing,
}: {
  entry: ArsenalEntry
  indexInList: number
  isEditing: boolean
  editingText: string
  onEditingTextChange: (s: string) => void
  onStartEdit: () => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
  removing: boolean
}) {
  const meta = KIND_META[entry.kind]
  const topicLabel = entry.topicId ? TOPIC_LABELS[entry.topicId] || entry.topicId : null

  return (
    <div
      className={`arsenal-card ${removing ? 'arsenal-card-out' : 'arsenal-card-in'}`}
      style={{
        background: 'var(--sh-glass-card, rgba(255,255,255,0.85))',
        borderRadius: 18,
        boxShadow: 'var(--sh-card-shadow, 0 6px 22px rgba(31,62,108,0.15))',
        border: `1px solid ${entry.pinned ? '#f59e0b80' : 'rgba(255,255,255,0.5)'}`,
        padding: 16,
        position: 'relative',
        animationDelay: `${Math.min(indexInList * 50, 600)}ms`,
        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 140,
      }}
    >
      {/* Top row: kind badge, topic chip, pinned star */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: meta.bg, color: meta.color,
          border: `1px solid ${meta.border}`,
          padding: '3px 10px', borderRadius: 10,
          fontSize: 11, fontWeight: 700,
        }}>
          {meta.icon} {meta.label}
        </span>
        {topicLabel && (
          <span style={{
            background: 'rgba(99,102,241,0.08)', color: '#4338ca',
            padding: '3px 10px', borderRadius: 10,
            fontSize: 11, fontWeight: 600,
          }}>
            {topicLabel}
          </span>
        )}
        {entry.pinned && (
          <span style={{ marginInlineStart: 'auto', fontSize: 14 }}>📌</span>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <textarea
          autoFocus
          value={editingText}
          onChange={e => onEditingTextChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onCommitEdit()
            else if (e.key === 'Escape') onCancelEdit()
          }}
          style={{
            flex: 1, resize: 'vertical', minHeight: 70,
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 10, padding: '8px 10px',
            fontFamily: "'Assistant', sans-serif", fontSize: 14,
            lineHeight: 1.6, color: TEXT_DARK,
            background: 'rgba(255,255,255,0.7)',
          }}
        />
      ) : (
        <div style={{
          flex: 1, fontFamily: "'Assistant', sans-serif", fontSize: 14,
          color: TEXT_MED, lineHeight: 1.6, whiteSpace: 'pre-wrap',
        }}>
          {entry.text}
        </div>
      )}

      {/* Footer: timestamp + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: TEXT_LIGHT }}>
          {relativeTime(entry.createdAt)}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {isEditing ? (
            <>
              <button onClick={onCommitEdit} style={iconBtn('rgba(16,185,129,0.18)', '#065f46')} title="שמור">✓</button>
              <button onClick={onCancelEdit} style={iconBtn('rgba(127,155,217,0.18)', TEXT_DARK)} title="בטל">✕</button>
            </>
          ) : (
            <>
              <button
                onClick={onTogglePin}
                style={iconBtn(entry.pinned ? 'rgba(245,158,11,0.22)' : 'rgba(127,155,217,0.12)', entry.pinned ? '#92400e' : TEXT_LIGHT)}
                title={entry.pinned ? 'בטל הצמדה' : 'הצמד'}
              >
                📌
              </button>
              <button onClick={onStartEdit} style={iconBtn('rgba(127,155,217,0.12)', TEXT_LIGHT)} title="ערוך">✏️</button>
              <button onClick={onDelete} style={iconBtn('rgba(239,68,68,0.12)', '#b91c1c')} title="מחק">🗑</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add modal ────────────────────────────────────────────────────────────────
function AddEntryModal({ onClose, onSave, presentTopics }: {
  onClose: () => void
  onSave: (kind: ArsenalKind, text: string, topicId?: string) => void
  presentTopics: string[]
}) {
  const [kind, setKind] = useState<ArsenalKind>('tip')
  const [text, setText] = useState('')
  const [topicId, setTopicId] = useState<string>('')

  const canSave = text.trim().length > 0

  return (
    <div
      dir="rtl"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,15,35,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'wsFadeIn 0.18s ease',
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(480px, calc(100% - 32px))',
          background: 'var(--sh-glass-card, #fff)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: 26,
          animation: 'arsenalCardIn 0.25s cubic-bezier(.22,1.36,.36,1)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', color: TEXT_DARK, fontSize: 20, fontWeight: 700 }}>
          + הוסף פריט חדש לארסנל
        </h3>

        {/* Kind selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['gotcha', 'trick', 'tip'] as ArsenalKind[]).map(k => {
            const m = KIND_META[k]
            const active = kind === k
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                style={{
                  flex: 1,
                  background: active ? m.color : m.bg,
                  border: `1.5px solid ${active ? m.color : m.border}`,
                  color: active ? '#fff' : m.color,
                  borderRadius: 14, padding: '10px 6px',
                  cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Text */}
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="כתוב/י את הקאצ' שלך כאן…"
          style={{
            width: '100%', minHeight: 110, resize: 'vertical',
            border: '1px solid rgba(127,155,217,0.4)', borderRadius: 12,
            padding: '10px 12px', fontFamily: "'Assistant', sans-serif",
            fontSize: 15, lineHeight: 1.6, color: TEXT_DARK,
            background: 'rgba(255,255,255,0.6)',
            boxSizing: 'border-box',
          }}
        />

        {/* Optional topic */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 4 }}>
            נושא (אופציונלי)
          </label>
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px',
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 10, fontFamily: "'Rubik', sans-serif",
              background: 'rgba(255,255,255,0.6)', fontSize: 13, color: TEXT_DARK,
              boxSizing: 'border-box',
            }}
          >
            <option value="">— ללא נושא —</option>
            {presentTopics.map(t => (
              <option key={t} value={t}>{TOPIC_LABELS[t] || t}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtn}>ביטול</button>
          <button
            onClick={() => canSave && onSave(kind, text.trim(), topicId || undefined)}
            disabled={!canSave}
            style={{ ...primaryBtn, opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            שמור לארסנל
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasEntries }: { hasEntries: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 20px', textAlign: 'center',
      color: TEXT_LIGHT, fontFamily: "'Rubik', sans-serif",
    }}>
      <div style={{ fontSize: 64, marginBottom: 18, opacity: 0.85 }}>🎯</div>
      <div style={{ fontSize: 18, color: TEXT_DARK, fontWeight: 600, marginBottom: 8 }}>
        {hasEntries ? 'אין פריטים שתואמים את הסינון' : 'הארסנל שלך עדיין ריק'}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 460 }}>
        {hasEntries
          ? 'נסה לשנות את סוג הפריט או את הנושא, או הוסף פריט חדש.'
          : 'תפוס גוטצ\'ות, טריקים וטיפים בזמן הלימוד —\nסמן טקסט בשיעור וייפתח כפתור "שמור לארסנל", או לחץ על "🎯 שמור כטעות נפוצה" אחרי שאלה שטעית בה.'}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'לפני רגע'
  if (mins < 60) return `לפני ${mins} דק'`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שעות`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'אתמול'
  if (days < 7) return `לפני ${days} ימים`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `לפני ${weeks} שבועות`
  return new Date(ts).toLocaleDateString('he-IL')
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--sh-btn-color, #6366f1)', color: '#fff', border: 'none',
  borderRadius: 22, padding: '10px 22px', cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 700,
  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
}

const secondaryBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)', color: TEXT_DARK,
  border: '1px solid rgba(127,155,217,0.4)',
  borderRadius: 22, padding: '10px 18px', cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600,
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${color}30`, color,
    borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
    fontSize: 12, fontFamily: "'Rubik', sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 4,
    transition: 'all 0.12s',
  }
}
