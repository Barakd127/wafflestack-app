import { describe, it, expect } from 'vitest'
import {
  computeStats,
  isBust,
  isInTargetRange,
  scoreRound,
  createDefaultJar,
  applyShopAdd,
  applyShopRemove,
  TARGET_BANK,
  BUST_CI_WIDTH,
  type Chip,
} from './pushkaEngine'

// ── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('returns zeros for empty draw', () => {
    const s = computeStats([])
    expect(s.n).toBe(0)
    expect(s.mean).toBe(0)
  })

  it('returns exact mean for single chip', () => {
    const chip: Chip = { id: 'a', value: 7, isOutlier: false }
    const s = computeStats([chip])
    expect(s.n).toBe(1)
    expect(s.mean).toBe(7)
    expect(s.ciWidth).toBe(0)
  })

  it('computes correct mean and CI for known values', () => {
    const chips: Chip[] = [
      { id: 'a', value: 4, isOutlier: false },
      { id: 'b', value: 6, isOutlier: false },
      { id: 'c', value: 5, isOutlier: false },
    ]
    const s = computeStats(chips)
    expect(s.mean).toBe(5)
    expect(s.n).toBe(3)
    // variance = ((1+1+0)/2) = 1, sd=1, se=1/sqrt(3)≈0.577, margin=1.13
    expect(s.sd).toBeCloseTo(1, 1)
    expect(s.ciLow95).toBeLessThan(5)
    expect(s.ciHigh95).toBeGreaterThan(5)
  })

  it('CI narrows as n increases', () => {
    const base: Chip[] = [
      { id: 'a', value: 4, isOutlier: false },
      { id: 'b', value: 6, isOutlier: false },
    ]
    const extended: Chip[] = [
      ...base,
      { id: 'c', value: 5, isOutlier: false },
      { id: 'd', value: 5, isOutlier: false },
      { id: 'e', value: 5, isOutlier: false },
    ]
    const s2 = computeStats(base)
    const s5 = computeStats(extended)
    expect(s5.ciWidth).toBeLessThan(s2.ciWidth)
  })
})

// ── isBust ────────────────────────────────────────────────────────────────────

describe('isBust', () => {
  it('never busts with fewer than 3 draws', () => {
    const wide = { n: 2, mean: 5, variance: 100, sd: 10, se: 10, ciLow95: -15, ciHigh95: 25, ciWidth: 40 }
    expect(isBust(wide)).toBe(false)
  })

  it('busts when CI width exceeds threshold', () => {
    const wide = { n: 5, mean: 5, variance: 10, sd: 3.16, se: 1.41, ciLow95: 2.22, ciHigh95: 7.78, ciWidth: BUST_CI_WIDTH + 0.1 }
    expect(isBust(wide)).toBe(true)
  })

  it('does not bust when CI is tight', () => {
    const tight = { n: 5, mean: 5, variance: 0.1, sd: 0.32, se: 0.14, ciLow95: 4.73, ciHigh95: 5.27, ciWidth: 0.54 }
    expect(isBust(tight)).toBe(false)
  })
})

// ── isInTargetRange ───────────────────────────────────────────────────────────

describe('isInTargetRange', () => {
  const target = TARGET_BANK[0] // lowBound:5, highBound:7

  it('returns true when mean inside range', () => {
    const s = computeStats([
      { id: 'a', value: 5, isOutlier: false },
      { id: 'b', value: 6, isOutlier: false },
      { id: 'c', value: 6, isOutlier: false },
    ])
    expect(isInTargetRange(s, target)).toBe(true)
  })

  it('returns false when mean below range', () => {
    const s = { n:3, mean:4.5, variance:0, sd:0, se:0, ciLow95:4, ciHigh95:5, ciWidth:1 }
    expect(isInTargetRange(s, target)).toBe(false)
  })
})

// ── scoreRound ────────────────────────────────────────────────────────────────

describe('scoreRound', () => {
  const target = TARGET_BANK[0]

  it('scores 0 shekels on bust', () => {
    const s = { n:3, mean:5, variance:0, sd:0, se:0, ciLow95:4, ciHigh95:6, ciWidth:2 }
    const r = scoreRound(s, target, 10, true)
    expect(r.shekels).toBe(0)
    expect(r.isBust).toBe(true)
  })

  it('scores 1 shekel when out of range', () => {
    const s = { n:3, mean:4, variance:0, sd:0, se:0, ciLow95:3, ciHigh95:5, ciWidth:2 }
    const r = scoreRound(s, target, 10, false)
    expect(r.shekels).toBe(1)
    expect(r.inRange).toBe(false)
  })

  it('scores more shekels for stopping early and hitting range', () => {
    const sEarly = { n:3, mean:6, variance:0.1, sd:0.32, se:0.18, ciLow95:5.65, ciHigh95:6.35, ciWidth:0.7 }
    const sLate  = { n:9, mean:6, variance:0.1, sd:0.32, se:0.11, ciLow95:5.78, ciHigh95:6.22, ciWidth:0.44 }
    const rEarly = scoreRound(sEarly, target, 10, false)
    const rLate  = scoreRound(sLate, target, 10, false)
    expect(rEarly.inRange).toBe(true)
    expect(rLate.inRange).toBe(true)
    expect(rEarly.shekels).toBeGreaterThan(rLate.shekels)
  })
})

// ── createDefaultJar ──────────────────────────────────────────────────────────

describe('createDefaultJar', () => {
  it('returns 10 chips', () => {
    expect(createDefaultJar()).toHaveLength(10)
  })

  it('all chips have values 1–9', () => {
    createDefaultJar().forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(1)
      expect(c.value).toBeLessThanOrEqual(9)
    })
  })

  it('marks extreme chips as outliers', () => {
    const jar = createDefaultJar()
    jar.forEach(c => {
      if (c.value <= 2 || c.value >= 8) expect(c.isOutlier).toBe(true)
      else expect(c.isOutlier).toBe(false)
    })
  })
})

// ── shop operations ───────────────────────────────────────────────────────────

describe('applyShopAdd', () => {
  it('grows the jar by one', () => {
    const jar = createDefaultJar()
    expect(applyShopAdd(jar, 5)).toHaveLength(jar.length + 1)
  })
})

describe('applyShopRemove', () => {
  it('shrinks the jar by one', () => {
    const jar = createDefaultJar()
    expect(applyShopRemove(jar)).toHaveLength(jar.length - 1)
  })

  it('removes the most extreme chip', () => {
    const chips: Chip[] = [
      { id: 'a', value: 5, isOutlier: false },
      { id: 'b', value: 2, isOutlier: true },
      { id: 'c', value: 6, isOutlier: false },
    ]
    const result = applyShopRemove(chips)
    expect(result.find(c => c.id === 'b')).toBeUndefined()
  })
})
