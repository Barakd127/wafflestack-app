// CoinPill + SpendDrawer + ArrivalCeremony — T1.2 of the Asset Economy.
//
// CoinPill        — the only place a coin BALANCE is ever displayed (R13: coin
//                   feedback is secondary to competence feedback; on learning
//                   surfaces the pill shrinks to a 20px icon with no number).
//                   Hidden entirely until the ledger holds ≥1 retrieval-passed
//                   event — coins appear with the first gate pass, never before.
// SpendDrawer     — the shop. R12 pull-never-push: opens only when the learner
//                   taps the pill, carries no nudges and no "earn more" copy,
//                   and EVERY sku notes its zero-coin path (coins buy beauty,
//                   never knowledge). Includes ספר החשבונות — the last 8 asset
//                   events, plainly listed.
// ArrivalCeremony — the slow, earned arrival of a purchased building tier.
//                   Fired ONLY after ledger.purchase() returns true — never on
//                   failed or ungated actions. Respects prefers-reduced-motion.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLearningStore } from '../../store/learningStore'
import {
  loadLedger,
  coinBalance,
  onLedgerChange,
  purchase,
  loadCosmetics,
} from '../../lib/ledger/ledger'
import type { AssetEvent } from '../../lib/ledger/types'
import { BUILDING_TO_TOPIC, TOPIC_HEBREW } from '../../lib/ledger/topicMeta'

// ── Formatting ───────────────────────────────────────────────────────────────

const nf = new Intl.NumberFormat('he-IL')
const df = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric' })

// ── Catalog (cosmetic tiers + ornaments) ─────────────────────────────────────

interface CosmeticTier {
  step: 1 | 2 | 3 | 4
  name: string
  cost: number
}

/** Cosmetic ladder per mastered building: צריף→בית→מגדל→ציון דרך. */
const BUILDING_TIERS: CosmeticTier[] = [
  { step: 1, name: 'צריף', cost: 10 },
  { step: 2, name: 'בית', cost: 40 },
  { step: 3, name: 'מגדל', cost: 100 },
  { step: 4, name: 'ציון דרך', cost: 200 },
]

function tierSkuId(buildingId: string, step: number): string {
  return `building-tier-${buildingId}-${step}`
}

/** Highest owned tier step for a building (0 = none), from cosmetics storage. */
function currentTierStep(buildingId: string, ownedSkus: string[]): number {
  let step = 0
  for (const tier of BUILDING_TIERS) {
    if (ownedSkus.includes(tierSkuId(buildingId, tier.step))) step = tier.step
  }
  return step
}

interface OrnamentSku {
  id: string
  name: string
  cost: number
}

const ORNAMENTS: OrnamentSku[] = [
  { id: 'ornament-community-garden', name: 'גינה קהילתית', cost: 10 },
  { id: 'ornament-fountain', name: 'מזרקה', cost: 18 },
  { id: 'ornament-tree-boulevard', name: 'שדרת עצים', cost: 25 },
]

/** Coins buy beauty never knowledge — every purchasable notes a free path. */
const ZERO_COIN_NOTE = 'נפתח גם בחינם בהמשך דרך התקדמות'

// ── Shared hooks ─────────────────────────────────────────────────────────────

/** Re-render on every ledger append for this user (subscription + version). */
function useLedgerVersion(userId: string): number {
  const [version, setVersion] = useState(0)
  useEffect(
    () =>
      onLedgerChange(uid => {
        if (uid === userId) setVersion(v => v + 1)
      }),
    [userId]
  )
  return version
}

function usePrefersReducedMotion(): boolean {
  const [reduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  return reduced
}

// ── Glyphs ───────────────────────────────────────────────────────────────────

function CoinGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" fill="var(--sh-gold)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
    </svg>
  )
}

function BuildingGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: 'block' }}>
      <polygon points="24,4 36,16 12,16" fill="var(--sh-gold)" />
      <rect x="14" y="16" width="20" height="26" rx="1.5" fill="var(--sh-gold)" />
      <rect x="19" y="22" width="4" height="5" fill="rgba(0,0,0,0.3)" />
      <rect x="25" y="22" width="4" height="5" fill="rgba(0,0,0,0.3)" />
      <rect x="19" y="30" width="4" height="5" fill="rgba(0,0,0,0.3)" />
      <rect x="25" y="30" width="4" height="5" fill="rgba(0,0,0,0.3)" />
      <rect x="21" y="36" width="6" height="6" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

// ── CoinPill ─────────────────────────────────────────────────────────────────

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 44,
  paddingBlock: 8,
  paddingInline: 14,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-gold)',
  fontSize: 15,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  cursor: 'pointer',
}

export function CoinPill({
  userId,
  surface,
}: {
  userId: string
  surface: 'economy' | 'learning'
}) {
  const version = useLedgerVersion(userId)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { hasPass, balance } = useMemo(() => {
    const ledger = loadLedger(userId)
    return {
      hasPass: ledger.graph.some(g => g.type === 'retrieval-passed'),
      balance: coinBalance(ledger),
    }
    // version is the invalidation signal for the localStorage-backed ledger.
  }, [userId, version])

  // Approved decision: coins do not exist until the first retrieval gate pass.
  if (!hasPass) return null

  if (surface === 'learning') {
    // R13: on learning surfaces the coin is a quiet presence — icon only,
    // no number, nothing clickable, nothing that competes with competence.
    return (
      <span role="img" aria-label="מטבעות" title="מטבעות" style={{ display: 'inline-flex' }}>
        <CoinGlyph size={20} />
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label={`מטבעות: ${nf.format(balance)} — פתיחת חנות הקישוטים`}
        style={pillStyle}
      >
        <CoinGlyph size={20} />
        <span style={{ direction: 'ltr' /* keep digit run stable inside RTL pill */ }}>
          {nf.format(balance)}
        </span>
      </button>
      <SpendDrawer userId={userId} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

// ── SpendDrawer ──────────────────────────────────────────────────────────────

// Backdrop + panel are viewport-fixed overlay elements; inset logical props
// are still used so RTL keeps the drawer on the inline-end edge.
const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(4,8,20,0.55)',
  zIndex: 1100,
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  insetBlockStart: 0,
  insetInlineEnd: 0,
  blockSize: '100%',
  inlineSize: 'min(400px, 92vw)',
  overflowY: 'auto',
  background: 'linear-gradient(180deg, rgba(10,16,38,0.97), rgba(16,24,52,0.97))',
  borderInlineStart: '1px solid rgba(255,255,255,0.12)',
  padding: 16,
  zIndex: 1101,
  color: 'var(--sh-cream)',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const drawerHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
}

const drawerTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: 'var(--sh-gold)',
}

const closeBtnStyle: CSSProperties = {
  minHeight: 44,
  minWidth: 44,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-cream)',
  fontSize: 16,
  cursor: 'pointer',
}

const balanceLineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--sh-gold)',
  fontVariantNumeric: 'tabular-nums',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--sh-gold)',
  marginBlockStart: 4,
}

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const skuNameStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--sh-cream)',
}

const ladderRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
}

const chipStyle: CSSProperties = {
  fontSize: 14,
  paddingBlock: 2,
  paddingInline: 8,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-cream)',
  opacity: 0.5,
}

const chipOwnedStyle: CSSProperties = {
  color: 'var(--sh-gold)',
  border: '1px solid var(--sh-gold)',
  opacity: 1,
}

const buyBtnStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid var(--sh-gold)',
  color: 'var(--sh-gold)',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  paddingInline: 12,
}

const buyBtnLockedStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-cream)',
  opacity: 0.55,
  cursor: 'default',
}

// Plain statement of fact — R12: no "earn more!" push copy anywhere.
const missingLineStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--sh-cream)',
  opacity: 0.75,
}

const zeroCoinNoteStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--sh-cream)',
  opacity: 0.6,
}

const ownedLineStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--sh-gold)',
}

const emptyLineStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--sh-cream)',
  opacity: 0.75,
}

const bookToggleStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-cream)',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  paddingInline: 12,
  textAlign: 'start',
}

const bookRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  fontSize: 14,
  paddingBlock: 6,
  borderBlockEnd: '1px solid rgba(255,255,255,0.12)',
}

export function SpendDrawer({
  userId,
  open,
  onClose,
}: {
  userId: string
  open: boolean
  onClose: () => void
}) {
  const version = useLedgerVersion(userId)
  const buildingProgress = useLearningStore(s => s.buildingProgress)
  const [bookOpen, setBookOpen] = useState(false)
  const [ceremonyTier, setCeremonyTier] = useState<string | null>(null)

  const { balance, lastEvents, ownedSkus } = useMemo(() => {
    const ledger = loadLedger(userId)
    return {
      balance: coinBalance(ledger),
      lastEvents: ledger.assets.slice(-8).reverse() as AssetEvent[],
      ownedSkus: loadCosmetics(userId),
    }
    // version invalidates the localStorage-backed reads after every append.
  }, [userId, version])

  // Only the 10 core topic-buildings participate in the cosmetic ladder.
  const masteredBuildings = useMemo(
    () =>
      Object.keys(BUILDING_TO_TOPIC).filter(
        buildingId => (buildingProgress[buildingId]?.level ?? 0) === 2
      ),
    [buildingProgress]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const buyTier = (buildingId: string, tier: CosmeticTier, buildingName: string) => {
    if (balance < tier.cost) return // inert while insufficient (aria-disabled)
    const ok = purchase(userId, {
      id: tierSkuId(buildingId, tier.step),
      cost: tier.cost,
      kind: 'sink-cosmetic',
    })
    // Ceremony fires ONLY on a real, paid tier-up — never on failed actions.
    if (ok) setCeremonyTier(`${tier.name} · ${buildingName}`)
  }

  const buyOrnament = (sku: OrnamentSku) => {
    if (balance < sku.cost) return // inert while insufficient (aria-disabled)
    purchase(userId, { id: sku.id, cost: sku.cost, kind: 'sink-cosmetic' })
  }

  if (!open && ceremonyTier === null) return null

  return (
    <>
      {open && (
        <>
          <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="חנות הקישוטים" style={panelStyle}>
            <div style={drawerHeaderStyle}>
              <div style={drawerTitleStyle}>חנות הקישוטים</div>
              <button type="button" onClick={onClose} aria-label="סגירה" style={closeBtnStyle}>
                ✕
              </button>
            </div>

            <div style={balanceLineStyle}>
              <CoinGlyph size={20} />
              <span>
                {'יתרה: '}
                <span style={{ direction: 'ltr' /* stable digit run in RTL */ }}>
                  {nf.format(balance)}
                </span>
                {' מטבעות'}
              </span>
            </div>

            {/* ── (a) שדרוגי מבנים ─────────────────────────────────────── */}
            <div style={sectionTitleStyle}>שדרוגי מבנים</div>
            {masteredBuildings.length === 0 && (
              <div style={emptyLineStyle}>
                שדרוגים נפתחים עבור מבנים שהושלמו במלואם.
              </div>
            )}
            {masteredBuildings.map(buildingId => {
              const topicId = BUILDING_TO_TOPIC[buildingId]
              const buildingName = TOPIC_HEBREW[topicId] ?? topicId
              const owned = currentTierStep(buildingId, ownedSkus)
              const nextTier = BUILDING_TIERS.find(t => t.step === owned + 1)
              const affordable = nextTier !== undefined && balance >= nextTier.cost
              return (
                <div key={buildingId} style={cardStyle}>
                  <div style={skuNameStyle}>{buildingName}</div>
                  <div style={ladderRowStyle}>
                    {BUILDING_TIERS.map(t => (
                      <span
                        key={t.step}
                        style={{ ...chipStyle, ...(owned >= t.step ? chipOwnedStyle : {}) }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  {nextTier === undefined ? (
                    <div style={ownedLineStyle}>ציון דרך — הסולם הושלם</div>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-disabled={!affordable}
                        onClick={() => {
                          if (!affordable) return
                          buyTier(buildingId, nextTier, buildingName)
                        }}
                        style={{ ...buyBtnStyle, ...(affordable ? {} : buyBtnLockedStyle) }}
                      >
                        {`שדרוג הבא: ${nextTier.name} · ${nf.format(nextTier.cost)} מטבעות`}
                      </button>
                      {!affordable && (
                        <div style={missingLineStyle}>
                          {`חסרים עוד ${nf.format(nextTier.cost - balance)} מטבעות`}
                        </div>
                      )}
                    </>
                  )}
                  <div style={zeroCoinNoteStyle}>{ZERO_COIN_NOTE}</div>
                </div>
              )
            })}

            {/* ── (b) קישוטי העיר ──────────────────────────────────────── */}
            <div style={sectionTitleStyle}>קישוטי העיר</div>
            {ORNAMENTS.map(sku => {
              const isOwned = ownedSkus.includes(sku.id)
              const affordable = balance >= sku.cost
              return (
                <div key={sku.id} style={cardStyle}>
                  <div style={skuNameStyle}>{sku.name}</div>
                  {isOwned ? (
                    <div style={ownedLineStyle}>נרכש ✓</div>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-disabled={!affordable}
                        onClick={() => {
                          if (!affordable) return
                          buyOrnament(sku)
                        }}
                        style={{ ...buyBtnStyle, ...(affordable ? {} : buyBtnLockedStyle) }}
                      >
                        {`רכישה · ${nf.format(sku.cost)} מטבעות`}
                      </button>
                      {!affordable && (
                        <div style={missingLineStyle}>
                          {`חסרים עוד ${nf.format(sku.cost - balance)} מטבעות`}
                        </div>
                      )}
                    </>
                  )}
                  <div style={zeroCoinNoteStyle}>{ZERO_COIN_NOTE}</div>
                </div>
              )
            })}

            {/* ── ספר החשבונות ─────────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => setBookOpen(o => !o)}
              aria-expanded={bookOpen}
              style={bookToggleStyle}
            >
              {bookOpen ? 'ספר החשבונות ▲' : 'ספר החשבונות ▼'}
            </button>
            {bookOpen && (
              <div>
                {lastEvents.length === 0 && <div style={emptyLineStyle}>עוד אין תנועות בספר.</div>}
                {lastEvents.map(ev => (
                  <div key={ev.id} style={bookRowStyle}>
                    <span style={{ flex: 1, color: 'var(--sh-cream)' }}>{ev.memo}</span>
                    <span
                      style={{
                        direction: 'ltr', // signed number stays LTR inside RTL row
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 700,
                        color: ev.coinDelta >= 0 ? 'var(--sh-gold)' : 'var(--sh-cream)',
                        opacity: ev.coinDelta >= 0 ? 1 : 0.8,
                      }}
                    >
                      {ev.coinDelta >= 0
                        ? `+${nf.format(ev.coinDelta)}`
                        : `−${nf.format(Math.abs(ev.coinDelta))}`}
                    </span>
                    <span style={{ opacity: 0.6, color: 'var(--sh-cream)' }}>{df.format(ev.ts)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {ceremonyTier !== null && (
        <ArrivalCeremony tierName={ceremonyTier} onDone={() => setCeremonyTier(null)} />
      )}
    </>
  )
}

// ── ArrivalCeremony ──────────────────────────────────────────────────────────

const ceremonyOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  background: 'rgba(8,12,28,0.93)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--sh-cream)',
  overflow: 'hidden',
}

const ceremonyTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: 'var(--sh-gold)',
  textAlign: 'center',
  paddingInline: 24,
}

const ceremonyChimeStyle: CSSProperties = {
  marginBlockStart: 20,
  fontSize: 15,
  color: 'var(--sh-cream)',
  opacity: 0.85,
}

type CeremonyPhase = 'announce' | 'descent' | 'settled'

export function ArrivalCeremony({
  tierName,
  onDone,
}: {
  tierName: string
  onDone: () => void
}) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<CeremonyPhase>('announce')
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const timers: number[] = []
    if (reduced) {
      // Instant arrival: announcement, then the settled state, no descent.
      timers.push(window.setTimeout(() => setPhase('settled'), 1000))
      timers.push(window.setTimeout(() => onDoneRef.current(), 3000))
    } else {
      timers.push(window.setTimeout(() => setPhase('descent'), 1000)) // 1s announce
      timers.push(window.setTimeout(() => setPhase('settled'), 5000)) // 4s descent
      timers.push(window.setTimeout(() => onDoneRef.current(), 6800)) // settle + dismiss
    }
    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [reduced])

  return (
    <div style={ceremonyOverlayStyle} role="status" aria-live="polite">
      <style>{`
        @keyframes ae-descend {
          from { transform: translateY(-46vh) scale(0.92); opacity: 0.15; }
          60%  { opacity: 1; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ae-descend-glyph { animation: none !important; }
        }
      `}</style>
      <div style={ceremonyTitleStyle}>{`ציון דרך חדש עולה: ${tierName}`}</div>
      {(phase === 'descent' || phase === 'settled') && (
        <div
          className="ae-descend-glyph"
          style={{
            marginBlockStart: 28,
            animation:
              !reduced && phase === 'descent'
                ? 'ae-descend 4s cubic-bezier(0.22, 1, 0.36, 1) forwards'
                : 'none',
            filter: 'drop-shadow(0 0 22px var(--sh-gold))',
          }}
        >
          <BuildingGlyph size={96} />
        </div>
      )}
      {phase === 'settled' && <div style={ceremonyChimeStyle}>המבנה התיישב במקומו.</div>}
    </div>
  )
}
