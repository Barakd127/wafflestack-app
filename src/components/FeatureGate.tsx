import { cloneElement, isValidElement, type ReactNode } from 'react'
import { useLearningStore } from '../store/learningStore'
import { FEATURE_UNLOCKS_BY_ID, type FeatureId } from '../config/featureUnlocks'

type Mode = 'hide' | 'silhouette' | 'disable'

export interface FeatureGateProps {
  id: FeatureId
  children: ReactNode
  /** Default: 'silhouette' — shows a locked stub with tooltip + lock chip. */
  mode?: Mode
  /** Override the locked-state tooltip (Hebrew). Defaults to rule's descriptionHe. */
  lockedTooltip?: string
  /** Extra className for the locked container (silhouette mode). */
  className?: string
}

/**
 * Gates a piece of UI behind a feature unlock.
 *
 *  - unlocked → renders children unchanged
 *  - locked + mode='hide'        → renders nothing
 *  - locked + mode='silhouette'  → renders a disabled button with greyed icon
 *                                  + 🔒 chip + tooltip describing unlock criterion
 *  - locked + mode='disable'     → clones children, dims them, blocks pointer events,
 *                                  attaches tooltip
 *
 * adminMode bypasses every gate (handled inside isFeatureUnlocked via store).
 */
export default function FeatureGate({ id, children, mode = 'silhouette', lockedTooltip, className }: FeatureGateProps) {
  const adminMode = useLearningStore(s => s.adminMode)
  const unlockedFeatures = useLearningStore(s => s.unlockedFeatures)
  const rule = FEATURE_UNLOCKS_BY_ID[id]
  // No rule → tier 0 → always unlocked
  const unlocked = adminMode || !rule || unlockedFeatures.includes(id)

  if (unlocked) return <>{children}</>
  if (mode === 'hide') return null

  const tooltip = lockedTooltip ?? rule?.descriptionHe ?? 'נעול — המשך ללמוד כדי לפתוח'

  if (mode === 'disable') {
    if (!isValidElement(children)) return null
    // Clone child + dim + block clicks. Keep its layout in place so the
    // surrounding UI doesn't reflow when unlocked vs locked.
    const child = children as React.ReactElement<{ style?: React.CSSProperties; title?: string }>
    return cloneElement(child, {
      style: {
        ...(child.props.style ?? {}),
        opacity: 0.5,
        pointerEvents: 'none',
        filter: 'grayscale(0.7)',
      },
      title: tooltip,
    })
  }

  // silhouette
  return (
    <button
      type="button"
      // aria-disabled (not the boolean `disabled` attribute): keeps the button
      // in the tab order so keyboard / screen-reader users can DISCOVER what's
      // locked. `disabled` elements are skipped by Tab and don't announce
      // their tooltip — they're invisible to AT.
      aria-disabled="true"
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      title={tooltip}
      aria-label={tooltip}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.55,
        filter: 'grayscale(0.85)',
        cursor: 'not-allowed',
        background: 'transparent',
        border: 'none',
        padding: 0,
        color: 'inherit',
        direction: 'rtl',
      }}
    >
      <span style={{ pointerEvents: 'none' }}>{children}</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -4,
          insetInlineEnd: -4,
          background: 'linear-gradient(135deg, #1a237e, #0d1656)',
          color: '#FFD700',
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 999,
          padding: '2px 6px',
          border: '1px solid rgba(255,215,0,0.5)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          lineHeight: 1,
        }}
      >
        🔒
      </span>
    </button>
  )
}
