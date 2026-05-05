/**
 * PotionInventory — compact chip strip shown in the StudyHub top bar.
 *
 * Each potion kind (gotcha → Insight Lens, trick → Speed Tonic, tip →
 * Memory Tea) earns one charge per 3 collected arsenal entries of that kind.
 * Available charges are shown; clicking a chip activates the next one.
 * Only one potion can be active at a time.
 */
import { useState, useEffect } from 'react'
import {
  useArsenalStore,
  useAvailablePotion,
  POTION_META,
  type ArsenalKind,
} from '../store/arsenalStore'

const KINDS: ArsenalKind[] = ['gotcha', 'trick', 'tip']

// ── Single potion chip ──────────────────────────────────────────────────────

interface ChipProps {
  kind: ArsenalKind
  available: number
}

function PotionChip({ kind, available }: ChipProps) {
  const activePotion      = useArsenalStore(s => s.activePotion)
  const potionActivatedAt = useArsenalStore(s => s.potionActivatedAt)
  const memoryTeaRemaining = useArsenalStore(s => s.memoryTeaRemaining)
  const activatePotion    = useArsenalStore(s => s.activatePotion)
  const clearActivePotion = useArsenalStore(s => s.clearActivePotion)

  const meta = POTION_META[kind]
  const isActive  = activePotion === kind
  const canClick  = available > 0 && !activePotion

  // Speed Tonic countdown timer (5 min = 300 s)
  const TONIC_DURATION = 5 * 60
  const [tonicSecondsLeft, setTonicSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (isActive && kind === 'trick' && potionActivatedAt) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - potionActivatedAt) / 1000)
        const left = Math.max(0, TONIC_DURATION - elapsed)
        setTonicSecondsLeft(left)
        if (left === 0) clearActivePotion()
      }
      tick()
      const id = setInterval(tick, 1000)
      return () => clearInterval(id)
    }
    setTonicSecondsLeft(null)
  }, [isActive, kind, potionActivatedAt, clearActivePotion])

  // What to show inside the chip
  const label = (() => {
    if (isActive && kind === 'trick' && tonicSecondsLeft !== null) {
      const m = Math.floor(tonicSecondsLeft / 60)
      const s = String(tonicSecondsLeft % 60).padStart(2, '0')
      return `${m}:${s}`
    }
    if (isActive && kind === 'tip') return `×${memoryTeaRemaining}`
    return `×${available}`
  })()

  const tooltipText = `${meta.nameHe} (${meta.name})\n${meta.effect}${
    available > 0 ? `\nזמין: ${available} מנות` : ''
  }`

  return (
    <button
      onClick={() => canClick && activatePotion(kind)}
      disabled={!canClick && !isActive}
      title={tooltipText}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        background: isActive
          ? `${meta.color}18`
          : available > 0
          ? 'rgba(255,255,255,0.08)'
          : 'transparent',
        border: isActive
          ? `1.5px solid ${meta.color}`
          : available > 0
          ? `1px solid ${meta.color}50`
          : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 999,
        padding: '2px 7px 2px 5px',
        cursor: canClick ? 'pointer' : 'default',
        opacity: available === 0 && !isActive ? 0.3 : 1,
        transition: 'all 0.18s',
        outline: 'none',
        boxShadow: isActive ? `0 0 0 2px ${meta.color}30` : 'none',
        animation: isActive ? 'potion-pulse 1.8s ease-in-out infinite' : 'none',
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{meta.icon}</span>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'Rubik', sans-serif",
        color: isActive ? meta.color : available > 0 ? meta.color : '#aaa',
        letterSpacing: '-0.2px',
        minWidth: 14,
        textAlign: 'center',
      }}>
        {label}
      </span>
    </button>
  )
}

// ── Container ───────────────────────────────────────────────────────────────

export default function PotionInventory() {
  const availableG = useAvailablePotion('gotcha')
  const availableT = useAvailablePotion('trick')
  const availableTi = useAvailablePotion('tip')
  const activePotion = useArsenalStore(s => s.activePotion)

  // Only render if at least one potion is available or active
  if (availableG === 0 && availableT === 0 && availableTi === 0 && !activePotion) return null

  return (
    <>
      {/* keyframe — injected once, harmless if duplicated across renders */}
      <style>{`
        @keyframes potion-pulse {
          0%, 100% { box-shadow: 0 0 0 2px transparent; }
          50%       { box-shadow: 0 0 0 3px rgba(100,100,200,0.25); }
        }
      `}</style>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 3 }}
        title="סיר הקסמים — מנות זמינות"
      >
        {/* Subtle separator before the chip strip */}
        <span style={{ color: 'rgba(0,0,0,0.15)', fontSize: 14, marginLeft: 2, marginRight: 2 }}>|</span>
        <PotionChip kind="gotcha" available={availableG} />
        <PotionChip kind="trick"  available={availableT} />
        <PotionChip kind="tip"    available={availableTi} />
      </div>
    </>
  )
}
