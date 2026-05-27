// Feature flags — new experiments live here behind a flag.
// Set to `false` before merging to main. Flip to `true` only on demo/feature branches.

export const FEATURE_FLAGS = {
  // Probability Pushka: bag-building + push-your-luck stats game
  // Cycle 2 prototype — CEO demo branch, set true for preview
  PUSHKA_MODE: true,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
