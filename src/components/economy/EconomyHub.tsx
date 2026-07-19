/**
 * EconomyHub — self-contained overlay manager for the Asset Economy.
 * Mounted once on the city page. Renders:
 *   1. CoinPill (surface='economy') pinned in a fixed cluster (top inline-end).
 *   2. A compact vertical action rail: Library / Observatory / Skyway.
 *   3. Overlay state machine: none | library | bench | observatory | skyway.
 *   4. A weathering whisper — one soft line, never a popup, never red (R14b).
 * Reads learningStore (cards / buildingProgress) + subscribes to ledger appends.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLearningStore } from '../../store/learningStore'
import { onLedgerChange } from '../../lib/ledger/ledger'
import { weathering } from '../../lib/ledger/projections'
import { questionTopicMap, TOPIC_HEBREW } from '../../lib/ledger/topicMeta'
import { HEBREW_LABELS } from '../../data/topicLabels'
import { CoinPill } from './CoinPill'
import { Library } from './Library'
import { RebuildBench } from './RebuildBench'
import { Observatory } from './Observatory'
import { SkywayPanel } from './SkywayPanel'

// ── Overlay state machine ────────────────────────────────────────────────────

type Overlay =
  | { kind: 'none' }
  | { kind: 'library' }
  | { kind: 'bench'; topicId: string; questionId: string }
  | { kind: 'observatory' }
  | { kind: 'skyway' }

// ── Styles (repo convention: inline objects, logical props, CSS vars) ────────

const clusterStyle: CSSProperties = {
  position: 'fixed',
  insetInlineEnd: 16,
  top: 72,
  // z 210: ABOVE the city canvas / district labels (< 200) but BELOW the FAB
  // ladder + toasts (220+) per the ui-anti-collision corner-stacking ladder —
  // a coin pill must never cover an action button.
  zIndex: 210,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 8,
}

const railStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const railButtonBase: CSSProperties = {
  width: 48,
  height: 48,
  minHeight: 44, // touch-target floor
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  cursor: 'pointer',
  padding: 0,
}

const whisperStyle: CSSProperties = {
  // Soft one-line banner (R14b): calm surface, gold text, no red, no popup.
  minHeight: 44, // tappable — touch-target floor applies
  maxWidth: 240,
  display: 'flex',
  alignItems: 'center',
  paddingBlock: 6,
  paddingInline: 14,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: 'var(--sh-gold)',
  fontSize: 14,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'pointer',
  textAlign: 'start',
}

// ── Gold-line icons (inline SVG, stroke = --sh-gold, no deps) ────────────────

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'var(--sh-gold)',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function BookIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 6c-1.5-1.6-3.8-2-6.5-2v14c2.7 0 5 .4 6.5 2 1.5-1.6 3.8-2 6.5-2V4c-2.7 0-5 .4-6.5 2Z" />
      <path d="M12 6v14" />
    </svg>
  )
}

function ObservatoryIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M12 5l4 6" />
      <path d="M3 13h18" />
      <path d="M7 13v6M17 13v6" />
    </svg>
  )
}

function SkywayIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 15h18" />
      <path d="M6 15V9M18 15V9" />
      <path d="M6 9c2 3.5 10 3.5 12 0" />
      <path d="M12 12v3M9 11.5V15M15 11.5V15" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function EconomyHub({
  userId,
  onOpenLesson,
}: {
  userId: string
  onOpenLesson?: (topicId: string) => void
}) {
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' })

  // Store subscriptions (zustand selectors keep re-renders scoped).
  const cards = useLearningStore(s => s.cards)
  const buildingProgress = useLearningStore(s => s.buildingProgress)

  // Ledger subscription: any append bumps a tick so ledger-derived UI in the
  // cluster stays fresh (and weathering re-evaluates with a fresh Date.now()).
  const [ledgerTick, setLedgerTick] = useState(0)
  useEffect(
    () =>
      onLedgerChange(changedUserId => {
        if (changedUserId === userId) setLedgerTick(t => t + 1)
      }),
    [userId]
  )

  // Semester-arc gate: Skyway verb opens after >=2 retrieval gates passed
  // (two buildings mastered to level 2).
  const skywayUnlocked = useMemo(
    () => Object.values(buildingProgress).filter(b => b.level === 2).length >= 2,
    [buildingProgress]
  )

  // Weathering whisper — worst topic only, one line, cap enforced by ellipsis.
  const whisperTopic = useMemo(() => {
    const w = weathering(cards, questionTopicMap)
    return w.worstTopics[0] ?? null
    // ledgerTick re-runs the projection so "now"-relative overdue state drifts
    // forward as the session progresses (retrieval passes append to the ledger).
  }, [cards, ledgerTick])

  const whisperName = whisperTopic
    ? (TOPIC_HEBREW[whisperTopic] ?? HEBREW_LABELS[whisperTopic] ?? whisperTopic)
    : null

  const closeOverlay = () => setOverlay({ kind: 'none' })

  return (
    <>
      {/* Fixed cluster: coin pill + whisper + action rail */}
      <div style={clusterStyle}>
        <CoinPill userId={userId} surface="economy" />

        {whisperName !== null && (
          <button
            type="button"
            style={whisperStyle}
            onClick={() => setOverlay({ kind: 'library' })}
            aria-label={`${whisperName} מחכה לחזרה — פתיחת בית הספרים`}
          >
            {whisperName} מחכה לחזרה
          </button>
        )}

        <div style={railStyle} role="toolbar" aria-label="פעולות הכלכלה">
          <button
            type="button"
            style={railButtonBase}
            title="בית הספרים"
            aria-label="בית הספרים"
            onClick={() => setOverlay({ kind: 'library' })}
          >
            <BookIcon />
          </button>

          <button
            type="button"
            style={railButtonBase}
            title="מצפה הדעת"
            aria-label="מצפה הדעת"
            onClick={() => setOverlay({ kind: 'observatory' })}
          >
            <ObservatoryIcon />
          </button>

          <button
            type="button"
            style={{
              ...railButtonBase,
              ...(skywayUnlocked ? {} : { opacity: 0.45, cursor: 'default' }),
            }}
            title={skywayUnlocked ? 'לסלול כביש אוויר' : 'נפתח אחרי שני שערי שליפה'}
            aria-label={skywayUnlocked ? 'לסלול כביש אוויר' : 'נפתח אחרי שני שערי שליפה'}
            aria-disabled={!skywayUnlocked}
            onClick={() => {
              // Locked state stays clickable-but-inert (convention: no HTML
              // disabled — the tooltip still teaches what unlocks it).
              if (!skywayUnlocked) return
              setOverlay({ kind: 'skyway' })
            }}
          >
            <SkywayIcon />
          </button>
        </div>
      </div>

      {/* Overlays — exactly one at a time */}
      {overlay.kind === 'library' && (
        <Library
          userId={userId}
          onOpenBench={(topicId: string, questionId: string) =>
            setOverlay({ kind: 'bench', topicId, questionId })
          }
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'bench' && (
        <RebuildBench
          userId={userId}
          topicId={overlay.topicId}
          questionId={overlay.questionId}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'observatory' && (
        <Observatory
          userId={userId}
          onOpenTopic={topicId => {
            if (onOpenLesson) {
              onOpenLesson(topicId)
              closeOverlay()
            } else {
              closeOverlay()
            }
          }}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'skyway' && (
        <SkywayPanel userId={userId} onClose={closeOverlay} />
      )}
    </>
  )
}
