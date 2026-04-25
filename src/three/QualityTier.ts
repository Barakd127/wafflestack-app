import { create } from 'zustand'

/**
 * QualityTier — adaptive quality state driven by R3F's <PerformanceMonitor>.
 *
 * Components subscribe to read tier and gate expensive work:
 *   - 'high': bloom on, shadow-map 2048, full instance density, animated props
 *   - 'mid':  bloom on (low), shadow-map 1024, 60% instance density
 *   - 'low':  bloom off, shadow-map 512, 40% instance density, freeze drift
 *
 * Set via setTier(tier). PerformanceMonitor's onIncline/onDecline callbacks
 * step through tiers; users can also force a tier via the dev panel.
 */
export type QualityTier = 'low' | 'mid' | 'high'

interface QualityState {
  tier: QualityTier
  setTier: (t: QualityTier) => void
  /** True when running in low/mid — disable optional eye-candy */
  reducedMotion: () => boolean
}

export const useQualityTier = create<QualityState>((set, get) => ({
  tier: 'high',
  setTier: (tier) => set({ tier }),
  reducedMotion: () => get().tier === 'low',
}))

/** Helper: shadow map size per tier */
export const SHADOW_MAP_SIZE: Record<QualityTier, number> = {
  high: 2048,
  mid:  1024,
  low:   512,
}

/** Helper: instance density multiplier per tier (0..1) */
export const INSTANCE_DENSITY: Record<QualityTier, number> = {
  high: 1.0,
  mid:  0.6,
  low:  0.4,
}

/** Helper: bloom enabled per tier */
export const BLOOM_ENABLED: Record<QualityTier, boolean> = {
  high: true,
  mid:  true,
  low:  false,
}

/** Helper: max device pixel ratio per tier */
export const DPR_MAX: Record<QualityTier, number> = {
  high: 1.75,
  mid:  1.4,
  low:  1.0,
}
