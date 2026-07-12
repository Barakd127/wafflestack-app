import { useMemo, useState } from 'react'
import { getGateStatus } from '../../game/retrievalGate'
import { useBridgeStore, TIER_PRICE, TIER_LABEL_HE } from '../../stores/bridgeStore'
import type { BuildingTier } from '../../stores/bridgeStore'
import { HEBREW_LABELS } from '../../data/topicLabels'
import type { QuizSession } from '../../stores/progressStore'
import ArrivalShowcase from './ArrivalShowcase'

// ── CoinsStore ─────────────────────────────────────────────────────────────
// The SPEND side of the Bridge & City Coins economy — the sink where earned
// Coins buy buildings for gated topics. Mirrors BridgePanel's props pattern:
// quiz sessions are sourced from the host screen (progressStore keeps them
// as plain data, not a hook), so this component stays decoupled from how
// the caller sources them.

export interface CoinsStoreProps {
  /** Quiz sessions to evaluate topic gating against. */
  quizSessions: QuizSession[]
  /** Topic ids eligible for building. Defaults to every topic with a Hebrew label. */
  topicIds?: string[]
}

const TIERS: BuildingTier[] = ['shack', 'house', 'tower', 'landmark']

const BUILDING_EMOJI = '🏛️'

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

const cardBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 14,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
}

function labelFor(topicId: string): string {
  return HEBREW_LABELS[topicId] ?? topicId
}

function makeBuildingId(topicId: string, tier: BuildingTier): string {
  return `${topicId}-${tier}`
}

interface TopicCardProps {
  topicId: string
  coins: number
  onBuy: (topicId: string, tier: BuildingTier) => void
}

function TopicCard({ topicId, coins, onBuy }: TopicCardProps) {
  const [selectedTier, setSelectedTier] = useState<BuildingTier>('shack')
  const price = TIER_PRICE[selectedTier]
  const shortfall = price - coins
  const canAfford = shortfall <= 0

  return (
    <div style={cardBase}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sh-text-dark)' }}>
        {labelFor(topicId)}
      </div>

      <div role="radiogroup" aria-label="דרגת מבנה" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TIERS.map((tier) => {
          const active = selectedTier === tier
          return (
            <span
              key={tier}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => setSelectedTier(tier)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedTier(tier)
                }
              }}
              style={{
                ...pillBase,
                background: active ? 'var(--sh-gold)' : pillBase.background,
                color: 'var(--sh-text-dark)',
                borderColor: active ? 'var(--sh-gold)' : (pillBase.border as string),
              }}
            >
              {TIER_LABEL_HE[tier]} · {TIER_PRICE[tier]} 🪙
            </span>
          )
        })}
      </div>

      {!canAfford && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sh-amber, #d99a2b)' }}>
          חסרים {shortfall} מטבעות
        </div>
      )}

      <span
        role="button"
        tabIndex={0}
        aria-disabled={!canAfford}
        onClick={canAfford ? () => onBuy(topicId, selectedTier) : undefined}
        onKeyDown={(e) => {
          if (!canAfford) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onBuy(topicId, selectedTier)
          }
        }}
        style={{
          ...pillBase,
          alignSelf: 'flex-start',
          minWidth: 100,
          background: canAfford ? 'var(--sh-gold)' : 'rgba(255,255,255,0.06)',
          color: 'var(--sh-text-dark)',
          opacity: canAfford ? 1 : 0.5,
          cursor: canAfford ? 'pointer' : 'default',
        }}
      >
        בנה
      </span>
    </div>
  )
}

export default function CoinsStore({ quizSessions, topicIds }: CoinsStoreProps) {
  const coins = useBridgeStore((s) => s.coins)
  const ownedBuildings = useBridgeStore((s) => s.ownedBuildings)
  const buyBuilding = useBridgeStore((s) => s.buyBuilding)

  const allTopicIds = useMemo(() => topicIds ?? Object.keys(HEBREW_LABELS), [topicIds])

  const ownedTopicIds = useMemo(
    () => new Set(ownedBuildings.map((b) => b.topicId)),
    [ownedBuildings]
  )

  const buildableTopicIds = useMemo(
    () =>
      allTopicIds.filter(
        (id) => !ownedTopicIds.has(id) && getGateStatus(id, quizSessions).gated
      ),
    [allTopicIds, quizSessions, ownedTopicIds]
  )

  const [showcase, setShowcase] = useState<{ topicId: string; tier: BuildingTier } | null>(null)

  const handleBuy = (topicId: string, tier: BuildingTier) => {
    const result = buyBuilding(topicId, makeBuildingId(topicId, tier), tier)
    if (!result.ok) return
    setShowcase({ topicId, tier })
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
          חנות המטבעות
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

      {/* Buildable topics */}
      {buildableTopicIds.length === 0 ? (
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
          עברו בוחן והשלימו לוח חזרה כדי לפתוח נושא לבנייה
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {buildableTopicIds.map((id) => (
            <TopicCard key={id} topicId={id} coins={coins} onBuy={handleBuy} />
          ))}
        </div>
      )}

      {/* Owned buildings — private trophy shelf */}
      {ownedBuildings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--sh-text-dark)' }}>
            העיר שלי
          </h3>
          {ownedBuildings.map((b) => (
            <div
              key={b.buildingId}
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
                <span aria-hidden="true">{BUILDING_EMOJI}</span> {labelFor(b.topicId)}
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
                {TIER_LABEL_HE[b.tier]}
              </span>
            </div>
          ))}
        </div>
      )}

      {showcase && (
        <ArrivalShowcase
          kind="similarity"
          coinsAwarded={0}
          variant="building"
          emoji={BUILDING_EMOJI}
          title={`${TIER_LABEL_HE[showcase.tier]} חדש נבנה!`}
          subtitle={labelFor(showcase.topicId)}
          onDismiss={() => setShowcase(null)}
        />
      )}
    </div>
  )
}
