/**
 * CommunityArsenalTab — global feed of arsenal entries shared by all users.
 *
 * Fetches from Supabase via src/lib/communityArsenal. Renders kind + sort +
 * topic filters, an optimistic-toggle upvote button, a "copy to my arsenal"
 * action, and an own-entry delete. Falls back to a Hebrew notice when the
 * Supabase env vars are absent.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  fetchFeed,
  toggleUpvote,
  deleteOwnEntry,
  SUPABASE_CONFIGURED,
  type CommunityEntry,
} from '../lib/communityArsenal'
import { quickAddArsenal, KIND_META, type ArsenalKind } from '../store/arsenalStore'
import { getCurrentUser, type User } from '../stores/authStore'

const TEXT_DARK  = 'var(--sh-text-dark)'
const TEXT_MED   = 'var(--sh-text-med)'
const TEXT_LIGHT = 'var(--sh-text-light)'

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

type KindFilter = 'all' | ArsenalKind
type SortMode = 'new' | 'top'

export default function CommunityArsenalTab() {
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [sort, setSort] = useState<SortMode>('new')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [entries, setEntries] = useState<CommunityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())

  // Load current user once for "is this mine?" + upvote highlight
  useEffect(() => {
    let cancelled = false
    getCurrentUser().then(u => { if (!cancelled) setCurrentUser(u) })
    return () => { cancelled = true }
  }, [])

  // Reload feed when filters change
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchFeed({
      kind: kindFilter === 'all' ? undefined : kindFilter,
      topicId: topicFilter === 'all' ? undefined : topicFilter,
      sort,
    }).then(res => {
      if (cancelled) return
      setEntries(res.entries)
      setError(res.error ?? null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [kindFilter, topicFilter, sort])

  const handleUpvote = async (entry: CommunityEntry) => {
    if (!SUPABASE_CONFIGURED) return
    // Optimistic: flip locally first
    const wasUpvoted = entry.viewerHasUpvoted
    setEntries(list => list.map(e => e.id === entry.id ? {
      ...e,
      viewerHasUpvoted: !wasUpvoted,
      upvotes: Math.max(0, e.upvotes + (wasUpvoted ? -1 : 1)),
    } : e))
    const res = await toggleUpvote(entry.id)
    if (res.error) {
      // Revert on error
      setEntries(list => list.map(e => e.id === entry.id ? {
        ...e,
        viewerHasUpvoted: wasUpvoted,
        upvotes: Math.max(0, e.upvotes + (wasUpvoted ? 1 : -1)),
      } : e))
      setError(res.error)
    }
  }

  const handleCopyToArsenal = (entry: CommunityEntry) => {
    quickAddArsenal({
      kind: entry.kind,
      text: entry.text,
      topicId: entry.topicId,
      source: 'manual',
    })
    setCopiedIds(prev => new Set(prev).add(entry.id))
  }

  const handleDelete = async (entry: CommunityEntry) => {
    if (!confirm('למחוק את הפריט מהקהילה?')) return
    const prev = entries
    setEntries(list => list.filter(e => e.id !== entry.id))
    const res = await deleteOwnEntry(entry.id)
    if (!res.ok) {
      setEntries(prev)
      setError(res.error ?? 'מחיקה נכשלה')
    }
  }

  const presentTopics = useMemo(() => Object.keys(TOPIC_LABELS), [])

  if (!SUPABASE_CONFIGURED) {
    return (
      <div dir="rtl" style={noticeStyle}>
        השיתוף הקהילתי דורש חיבור לשרת — אין מצב אורח
      </div>
    )
  }

  return (
    <div dir="rtl">
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <PillBtn label="הכל" icon="🌐" selected={kindFilter === 'all'} onClick={() => setKindFilter('all')} color="#6366f1" bg="rgba(99,102,241,0.12)" />
        <PillBtn label={KIND_META.gotcha.label + 'ים'} icon={KIND_META.gotcha.icon}
          selected={kindFilter === 'gotcha'} onClick={() => setKindFilter('gotcha')}
          color={KIND_META.gotcha.color} bg={KIND_META.gotcha.bg} />
        <PillBtn label={KIND_META.trick.label + 'ים'} icon={KIND_META.trick.icon}
          selected={kindFilter === 'trick'} onClick={() => setKindFilter('trick')}
          color={KIND_META.trick.color} bg={KIND_META.trick.bg} />
        <PillBtn label={KIND_META.tip.label + 'ים'} icon={KIND_META.tip.icon}
          selected={kindFilter === 'tip'} onClick={() => setKindFilter('tip')}
          color={KIND_META.tip.color} bg={KIND_META.tip.bg} />

        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            style={selectStyle}
          >
            <option value="new">חדש</option>
            <option value="top">פופולרי</option>
          </select>
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">כל הנושאים</option>
            {presentTopics.map(t => (
              <option key={t} value={t}>{TOPIC_LABELS[t] || t}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: 'rgba(239,68,68,0.12)', color: '#b91c1c',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 12, padding: '10px 14px',
            marginBottom: 12, fontSize: 13,
            fontFamily: "'Rubik', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={() => {
              // Re-fire the same fetch effect by bumping a no-op state (filter trio)
              setError(null)
              setLoading(true)
              fetchFeed({
                kind: kindFilter === 'all' ? undefined : kindFilter,
                topicId: topicFilter === 'all' ? undefined : topicFilter,
                sort,
              }).then(res => { setEntries(res.entries); setError(res.error ?? null); setLoading(false) })
            }}
            style={{
              background: '#fff', color: '#b91c1c',
              border: '1.5px solid rgba(239,68,68,0.5)',
              borderRadius: 999, padding: '6px 14px',
              fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700,
              cursor: 'pointer', minHeight: 36,
            }}
          >
            ↻ נסה שוב
          </button>
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              height: 160, borderRadius: 18,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.85), rgba(255,255,255,0.5))',
              backgroundSize: '200% 100%',
              animation: 'wsShimmer 1.4s linear infinite',
              border: '1px solid rgba(255,255,255,0.5)',
            }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '60px 20px', textAlign: 'center',
          color: TEXT_LIGHT, fontFamily: "'Rubik', sans-serif",
        }}>
          <div style={{ fontSize: 64, marginBottom: 18, opacity: 0.85 }}>🌐</div>
          <div style={{ fontSize: 16, color: TEXT_DARK, fontWeight: 600 }}>
            עדיין אין קאצ׳ים בקהילה — היה הראשון לשתף!
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {entries.map(entry => (
            <CommunityCard
              key={entry.id}
              entry={entry}
              isOwn={!!currentUser && entry.authorId === currentUser.userId}
              alreadyCopied={copiedIds.has(entry.id)}
              onUpvote={() => handleUpvote(entry)}
              onCopy={() => handleCopyToArsenal(entry)}
              onDelete={() => handleDelete(entry)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── card ─────────────────────────────────────────────────────────────────
function CommunityCard({
  entry, isOwn, alreadyCopied, onUpvote, onCopy, onDelete,
}: {
  entry: CommunityEntry
  isOwn: boolean
  alreadyCopied: boolean
  onUpvote: () => void
  onCopy: () => void
  onDelete: () => void
}) {
  const meta = KIND_META[entry.kind]
  const topicLabel = entry.topicId ? TOPIC_LABELS[entry.topicId] || entry.topicId : null
  const upvoteColor = entry.viewerHasUpvoted ? '#7c3aed' : TEXT_MED
  const upvoteBg = entry.viewerHasUpvoted ? 'rgba(124,58,237,0.18)' : 'rgba(127,155,217,0.10)'

  return (
    <div
      dir="rtl"
      style={{
        background: 'var(--sh-glass-card, rgba(255,255,255,0.85))',
        borderRadius: 18,
        boxShadow: 'var(--sh-card-shadow, 0 6px 22px rgba(31,62,108,0.15))',
        border: '1px solid rgba(255,255,255,0.5)',
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 160,
      }}
    >
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
        <span style={{
          marginInlineStart: 'auto', fontSize: 11, color: TEXT_LIGHT, fontWeight: 500,
        }}>
          @{entry.authorUsername}
        </span>
      </div>

      <div
        dir="rtl"
        style={{
          flex: 1, fontFamily: "'Assistant', sans-serif", fontSize: 14,
          color: TEXT_MED, lineHeight: 1.6, whiteSpace: 'pre-wrap',
          direction: 'rtl', textAlign: 'right',
          unicodeBidi: 'plaintext' as React.CSSProperties['unicodeBidi'],
        }}
      >
        {entry.text}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 4, gap: 6, flexWrap: 'wrap',
      }}>
        <button
          onClick={onUpvote}
          style={{
            background: upvoteBg,
            border: `1px solid ${upvoteColor}30`,
            color: upvoteColor,
            borderRadius: 10, padding: '5px 11px', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            fontFamily: "'Rubik', sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'all 0.15s',
          }}
          title={entry.viewerHasUpvoted ? 'בטל לייק' : 'תן לייק'}
        >
          👍 {entry.upvotes}
        </button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={onCopy}
            disabled={alreadyCopied}
            style={{
              background: alreadyCopied ? 'rgba(16,185,129,0.18)' : 'rgba(99,102,241,0.12)',
              border: `1px solid ${alreadyCopied ? '#06966380' : 'rgba(99,102,241,0.35)'}`,
              color: alreadyCopied ? '#065f46' : '#4338ca',
              borderRadius: 10, padding: '5px 11px',
              cursor: alreadyCopied ? 'default' : 'pointer',
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Rubik', sans-serif",
            }}
          >
            {alreadyCopied ? '✓ נוסף' : '📥 הוסף לארסנל שלי'}
          </button>
          {isOwn && (
            <button
              onClick={onDelete}
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#b91c1c',
                borderRadius: 10, padding: '5px 11px', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                fontFamily: "'Rubik', sans-serif",
              }}
              title="מחק"
            >
              🗑 מחק
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── styles ───────────────────────────────────────────────────────────────
function PillBtn({ label, icon, selected, onClick, color, bg }: {
  label: string; icon: string; selected: boolean; onClick: () => void; color: string; bg: string
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
    </button>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(127,155,217,0.4)',
  borderRadius: 18, padding: '8px 14px',
  fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_DARK,
  cursor: 'pointer',
}

const noticeStyle: React.CSSProperties = {
  background: 'rgba(245,158,11,0.10)',
  border: '1px solid rgba(245,158,11,0.35)',
  color: '#92400e', padding: '24px 28px', borderRadius: 14,
  fontFamily: "'Rubik', sans-serif", fontSize: 15, fontWeight: 600,
  textAlign: 'center', maxWidth: 560, margin: '40px auto',
  lineHeight: 1.7,
}
