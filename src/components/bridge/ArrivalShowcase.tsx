import { useEffect, useMemo, useState } from 'react'
import type { BridgeKind } from '../../game/bridgeTypes'

// ── ArrivalShowcase ───────────────────────────────────────────────────────────
// Full-screen reward overlay shown right after a bridge/analogy/similarity is
// successfully built. Announces the coin reward first, then plays a short 3D
// rotation + descent of an emoji "building" before auto-dismissing.
// Physical left/right ARE allowed here (viewport-fixed overlay), not logical
// properties, per the house style-rule exception for fixed overlays.

export interface ArrivalShowcaseProps {
  kind: BridgeKind
  coinsAwarded: number
  onDismiss: () => void
  /** Total time on screen before auto-dismiss, ms. Defaults per motion pref. */
  durationMs?: number
  /**
   * 'bridge' (default) renders the existing bridge/analogy/similarity reward
   * copy + coin total. 'building' renders a City Coins purchase moment
   * instead — a spend, not an award, so no coin total is shown.
   */
  variant?: 'bridge' | 'building'
  /** building variant only — overrides the headline text. */
  title?: string
  /** building variant only — overrides the big emoji. */
  emoji?: string
  /** building variant only — optional secondary line under the headline. */
  subtitle?: string
}

const KIND_EMOJI: Record<BridgeKind, string> = {
  bridge: '🌉',
  analogy: '🌟',
  similarity: '🏛️',
}

const KIND_TITLE: Record<BridgeKind, string> = {
  bridge: 'גשר חדש נבנה!',
  analogy: 'אנלוגיה חדשה נמצאה!',
  similarity: 'קשר דמיון חדש נמצא!',
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return reduced
}

export default function ArrivalShowcase({
  kind,
  coinsAwarded,
  onDismiss,
  durationMs,
  variant = 'bridge',
  title: titleOverride,
  emoji: emojiOverride,
  subtitle,
}: ArrivalShowcaseProps) {
  const reducedMotion = usePrefersReducedMotion()
  const effectiveDuration = durationMs ?? (reducedMotion ? 1500 : 4000)
  const isBuilding = variant === 'building'
  const emoji = isBuilding ? (emojiOverride ?? '🏛️') : (KIND_EMOJI[kind] ?? '🌉')
  const title = isBuilding ? (titleOverride ?? '') : (KIND_TITLE[kind] ?? KIND_TITLE.bridge)

  useEffect(() => {
    const t = setTimeout(onDismiss, effectiveDuration)
    return () => clearTimeout(t)
  }, [effectiveDuration, onDismiss])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onDismiss])

  const coinLabel = useMemo(() => {
    // Hebrew has no simple plural rule that applies cleanly to "מטבעות"; keep
    // the noun fixed and hard-code the only two shapes we actually need.
    return coinsAwarded === 1 ? '1 מטבע' : `${coinsAwarded} מטבעות`
  }, [coinsAwarded])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir="rtl"
      onClick={onDismiss}
      style={{
        // Physical positioning: this overlay is viewport-fixed, not flow content.
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'rgba(8,10,20,0.82)',
        backdropFilter: 'blur(3px)',
        cursor: 'pointer',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div
        aria-live="assertive"
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: 'var(--sh-cream)',
        }}
      >
        {title}
        {!isBuilding && <span style={{ color: 'var(--sh-gold)' }}> +{coinLabel} 🪙</span>}
      </div>

      {isBuilding && subtitle && (
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--sh-cream)', opacity: 0.85 }}>
          {subtitle}
        </div>
      )}

      {reducedMotion ? (
        <div
          style={{
            fontSize: 72,
            filter: 'drop-shadow(0 0 22px var(--sh-gold))',
          }}
          aria-hidden="true"
        >
          {emoji}
        </div>
      ) : (
        <div
          style={{
            fontSize: 84,
            animation: 'bridgeArrivalSpin 4s ease-in-out forwards',
            filter: 'drop-shadow(0 0 26px var(--sh-gold))',
          }}
          aria-hidden="true"
        >
          {emoji}
        </div>
      )}

      <div style={{ fontSize: 14, color: 'var(--sh-text-light, var(--sh-cream))', opacity: 0.85 }}>
        לחץ בכל מקום כדי להמשיך
      </div>

      {!reducedMotion && (
        <style>{`
          @keyframes bridgeArrivalSpin {
            0%   { transform: translateY(-140px) rotateY(0deg);   opacity: 0; }
            15%  { opacity: 1; }
            100% { transform: translateY(0)       rotateY(360deg); opacity: 1; }
          }
        `}</style>
      )}
    </div>
  )
}
