import { useMemo, useState } from 'react'
import type { BridgeKind } from '../../game/bridgeTypes'
import { getDueTopics } from '../../game/retrievalGate'
import { useBridgeStore } from '../../stores/bridgeStore'
import { HEBREW_LABELS } from '../../data/topicLabels'
import type { QuizSession } from '../../stores/progressStore'
import ArrivalShowcase from './ArrivalShowcase'

// ── BridgePanel ────────────────────────────────────────────────────────────
// Hebrew/RTL panel for building "bridges" between topics the player has
// already unlocked via retrieval practice. Reads quiz sessions from the host
// screen (progressStore keeps sessions as plain data, not a hook) so this
// component stays decoupled from how the caller sources them.

export interface BridgePanelProps {
  /** Quiz sessions to evaluate topic gating against. */
  quizSessions: QuizSession[]
  /** Topic ids eligible for bridging. Defaults to every topic with a Hebrew label. */
  topicIds?: string[]
}

const KIND_OPTIONS: { value: BridgeKind; label: string }[] = [
  { value: 'bridge', label: 'גשר' },
  { value: 'analogy', label: 'אנלוגיה' },
  { value: 'similarity', label: 'דמיון והבדל' },
]

const pillBase: React.CSSProperties = {
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 14px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--sh-text-dark)',
  userSelect: 'none',
}

const fieldBase: React.CSSProperties = {
  minHeight: 44,
  width: '100%',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--sh-text-dark)',
  fontSize: 14,
  padding: '0 12px',
  boxSizing: 'border-box',
}

function labelFor(topicId: string): string {
  return HEBREW_LABELS[topicId] ?? topicId
}

export default function BridgePanel({ quizSessions, topicIds }: BridgePanelProps) {
  const edges = useBridgeStore((s) => s.edges)
  const coins = useBridgeStore((s) => s.coins)
  const submitEdge = useBridgeStore((s) => s.submitEdge)

  const allTopicIds = useMemo(() => topicIds ?? Object.keys(HEBREW_LABELS), [topicIds])

  const gateStatuses = useMemo(
    () => getDueTopics(quizSessions, allTopicIds),
    [quizSessions, allTopicIds]
  )

  const gatedTopicIds = useMemo(
    () => gateStatuses.filter((g) => g.gated).map((g) => g.topicId),
    [gateStatuses]
  )

  const overdueTopics = useMemo(
    () => gateStatuses.filter((g) => g.overdue),
    [gateStatuses]
  )

  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [kind, setKind] = useState<BridgeKind>('bridge')
  const [label, setLabel] = useState('')
  const [justification, setJustification] = useState('')
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [showcase, setShowcase] = useState<{ kind: BridgeKind; coins: number } | null>(null)

  const hasEnoughGatedTopics = gatedTopicIds.length >= 2
  const needsJustification = kind === 'analogy' || kind === 'similarity'

  const canSubmit =
    hasEnoughGatedTopics &&
    sourceId !== '' &&
    targetId !== '' &&
    sourceId !== targetId &&
    label.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const result = submitEdge({
      sourceTopicId: sourceId,
      targetTopicId: targetId,
      label: label.trim(),
      kind,
      justification: needsJustification ? justification.trim() || undefined : undefined,
    })
    if (!result.ok) {
      setErrorReason(result.reason ?? 'לא ניתן היה לבנות את הגשר')
      return
    }
    setErrorReason(null)
    setLabel('')
    setJustification('')
    setShowcase({ kind, coins: result.coins ?? result.edge?.coinsAwarded ?? 0 })
  }

  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        color: 'var(--sh-text-dark)',
        fontSize: 14,
      }}
    >
      {/* Header band */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--sh-text-dark)' }}>
          גשרים בין רעיונות
        </h2>
        <div
          style={{
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--sh-gold)',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          <span aria-hidden="true">🪙</span>
          <span>{coins}</span>
        </div>
      </div>

      {/* Due-for-review strip */}
      {overdueTopics.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {overdueTopics.map((g) => (
            <span
              key={g.topicId}
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--sh-amber, #d99a2b)',
              }}
            >
              <span aria-hidden="true">⏰</span>
              <span>{labelFor(g.topicId)} — דורש רענון</span>
            </span>
          ))}
        </div>
      )}

      {/* Bridge builder */}
      {!hasEnoughGatedTopics ? (
        <div
          style={{
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--sh-text-light, var(--sh-text-dark))',
            fontSize: 14,
          }}
        >
          עבור בוחן קצר בנושא כדי לפתוח אותו לגשרים
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 14,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              aria-label="נושא מקור"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              style={{ ...fieldBase, flex: '1 1 160px' }}
            >
              <option value="">בחר נושא מקור</option>
              {gatedTopicIds.map((id) => (
                <option key={id} value={id}>{labelFor(id)}</option>
              ))}
            </select>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 18 }} aria-hidden="true">↔</span>
            <select
              aria-label="נושא יעד"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              style={{ ...fieldBase, flex: '1 1 160px' }}
            >
              <option value="">בחר נושא יעד</option>
              {gatedTopicIds.map((id) => (
                <option key={id} value={id}>{labelFor(id)}</option>
              ))}
            </select>
          </div>

          <div role="radiogroup" aria-label="סוג הקשר" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {KIND_OPTIONS.map((opt) => {
              const active = kind === opt.value
              return (
                <span
                  key={opt.value}
                  role="radio"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() => setKind(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setKind(opt.value)
                    }
                  }}
                  style={{
                    ...pillBase,
                    background: active ? 'var(--sh-gold)' : pillBase.background,
                    color: active ? 'var(--sh-text-dark)' : 'var(--sh-text-dark)',
                    borderColor: active ? 'var(--sh-gold)' : (pillBase.border as string),
                  }}
                >
                  {opt.label}
                </span>
              )
            })}
          </div>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="מה הקשר? למשל: X קובע את הרוחב של Y"
            aria-label="תיאור הקשר"
            style={fieldBase}
          />

          {needsJustification && (
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="הסבר קצר מדוע זו אנלוגיה טובה"
              aria-label="נימוק"
              rows={3}
              style={{ ...fieldBase, minHeight: 66, padding: '10px 12px', resize: 'vertical' }}
            />
          )}

          {errorReason && (
            <div
              role="status"
              aria-live="polite"
              style={{ color: 'var(--sh-amber, #d99a2b)', fontSize: 13, fontWeight: 600 }}
            >
              {errorReason}
            </div>
          )}

          <span
            role="button"
            tabIndex={0}
            aria-disabled={!canSubmit}
            onClick={canSubmit ? handleSubmit : undefined}
            onKeyDown={(e) => {
              if (!canSubmit) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            style={{
              ...pillBase,
              alignSelf: 'flex-start',
              minWidth: 120,
              background: canSubmit ? 'var(--sh-gold)' : 'rgba(255,255,255,0.06)',
              color: 'var(--sh-text-dark)',
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? 'pointer' : 'default',
            }}
          >
            בנה גשר
          </span>
        </div>
      )}

      {/* Edges list */}
      {edges.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {edges.map((edge) => (
            <div
              key={edge.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 13,
              }}
            >
              <span>
                {labelFor(edge.sourceTopicId)} ↔ {labelFor(edge.targetTopicId)} — &quot;{edge.label}&quot;
              </span>
              <span
                style={{
                  minHeight: 28,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0 8px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--sh-gold)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <span aria-hidden="true">🪙</span>
                {edge.coinsAwarded}
              </span>
            </div>
          ))}
        </div>
      )}

      {showcase && (
        <ArrivalShowcase
          kind={showcase.kind}
          coinsAwarded={showcase.coins}
          onDismiss={() => setShowcase(null)}
        />
      )}
    </div>
  )
}
