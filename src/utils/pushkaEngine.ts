// Pure logic for Probability Pushka game engine.
// No React, no side effects — safe to unit-test in isolation.

export interface Chip {
  id: string
  value: number   // integer 1–9
  isOutlier: boolean
}

export interface PushkaTarget {
  id: string
  prompt: string
  subPrompt: string
  lowBound: number
  highBound: number
  explanation: string
}

export interface RunningStats {
  n: number
  mean: number
  variance: number
  sd: number
  se: number
  ciLow95: number
  ciHigh95: number
  ciWidth: number
}

export interface RoundScore {
  shekels: number
  inRange: boolean
  isBust: boolean
  reason: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const BUST_CI_WIDTH = 4.5   // CI wider than this = too noisy = bust
export const MIN_DRAWS_BEFORE_STOP = 2

// ── Chip factory ─────────────────────────────────────────────────────────────

let _chipCounter = 0
function makeChip(value: number): Chip {
  _chipCounter++
  return { id: `chip-${_chipCounter}`, value, isOutlier: value <= 2 || value >= 8 }
}

export function createDefaultJar(): Chip[] {
  // Distribution around mean 5.2 — target will ask for mean in [4,7]
  // Two outlier chips (2 and 8) add bust risk
  const values = [2, 4, 4, 5, 5, 5, 6, 6, 7, 8]
  return values.map(v => makeChip(v))
}

export function shuffleChips(chips: Chip[]): Chip[] {
  const arr = [...chips]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Stats engine ─────────────────────────────────────────────────────────────

export function computeStats(drawn: Chip[]): RunningStats {
  const n = drawn.length
  if (n === 0) {
    return { n: 0, mean: 0, variance: 0, sd: 0, se: 0, ciLow95: 0, ciHigh95: 0, ciWidth: 0 }
  }
  const values = drawn.map(c => c.value)
  const mean = values.reduce((a, b) => a + b, 0) / n

  if (n === 1) {
    return { n: 1, mean, variance: 0, sd: 0, se: 0, ciLow95: mean, ciHigh95: mean, ciWidth: 0 }
  }

  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1)
  const sd = Math.sqrt(variance)
  const se = sd / Math.sqrt(n)

  // Use z=1.96 approximation (good enough for n≥5; simplicity wins for MVP)
  const margin = 1.96 * se
  return {
    n,
    mean: +mean.toFixed(2),
    variance: +variance.toFixed(2),
    sd: +sd.toFixed(2),
    se: +se.toFixed(2),
    ciLow95: +(mean - margin).toFixed(2),
    ciHigh95: +(mean + margin).toFixed(2),
    ciWidth: +(2 * margin).toFixed(2),
  }
}

export function isBust(stats: RunningStats): boolean {
  if (stats.n < 3) return false
  return stats.ciWidth > BUST_CI_WIDTH
}

export function isInTargetRange(stats: RunningStats, target: PushkaTarget): boolean {
  return stats.mean >= target.lowBound && stats.mean <= target.highBound
}

// ── Scoring ───────────────────────────────────────────────────────────────────
// Reward stopping early with a tight CI that hits the target range.
// More shekels for fewer draws + narrower CI.

export function scoreRound(
  stats: RunningStats,
  target: PushkaTarget,
  jarSize: number,
  bust: boolean,
): RoundScore {
  if (bust) {
    return { shekels: 0, inRange: false, isBust: true, reason: 'פוצץ! CI רחב מדי — דגמת יותר מדי מהצנצנת' }
  }
  const inRange = isInTargetRange(stats, target)
  if (!inRange) {
    return { shekels: 1, inRange: false, isBust: false, reason: 'האומדן שלך מחוץ לטווח היעד' }
  }
  // Base: 5 shekels. Bonus: 1 shekel for each chip NOT drawn (saved sampling budget).
  const saved = jarSize - stats.n
  const tightBonus = stats.ciWidth < 2 ? 3 : stats.ciWidth < 3 ? 1 : 0
  const shekels = 5 + Math.max(0, saved) + tightBonus
  return {
    shekels,
    inRange: true,
    isBust: false,
    reason: `ממוצע ${stats.mean} בטווח ✓ — ${stats.n} שבבים, שומרים ${saved}`,
  }
}

// ── Hebrew target bank ────────────────────────────────────────────────────────

export const TARGET_BANK: PushkaTarget[] = [
  {
    id: 't1',
    prompt: 'האם ממוצע ציוני הכיתה בין 5 ל-7?',
    subPrompt: 'שלוף שבבים עד שאתה בטוח בתשובה',
    lowBound: 5, highBound: 7,
    explanation: 'ממוצע גבוה מ-5 וקטן מ-7 = כיתה עמדה ביעד',
  },
  {
    id: 't2',
    prompt: 'האם הממוצע נמוך מ-4.5?',
    subPrompt: 'ממוצע מתחת ל-4.5 = כישלון סטטיסטי',
    lowBound: 1, highBound: 4.5,
    explanation: 'ממוצע < 4.5 מסמן תוצאה חלשה — בדוק עם מדגם',
  },
  {
    id: 't3',
    prompt: 'האם הממוצע בין 4 ל-6?',
    subPrompt: 'ה"ממוצע הטוב" לפי הבודק הוא בין 4 ל-6',
    lowBound: 4, highBound: 6,
    explanation: 'טווח מצומצם — תצטרכ.י יותר שבבים לוודאות',
  },
  {
    id: 't4',
    prompt: 'האם הממוצע גבוה מ-5?',
    subPrompt: 'הוכח שהממוצע עולה על 5',
    lowBound: 5, highBound: 9,
    explanation: 'טווח רחב = קל יותר להגיע, אבל כמה שבבים צריך?',
  },
  {
    id: 't5',
    prompt: 'האם הממוצע בדיוק בין 5.5 ל-6.5?',
    subPrompt: 'טווח צר — תצטרכ.י מדגם גדול',
    lowBound: 5.5, highBound: 6.5,
    explanation: 'רווח סמך צר מצריך הרבה נתונים — כמה שווה לדגום?',
  },
]

export function pickTarget(round: number): PushkaTarget {
  return TARGET_BANK[round % TARGET_BANK.length]
}

// ── Shop operations ───────────────────────────────────────────────────────────

export const SHOP_PRICES = {
  ADD_LOW: 2,    // add a chip with value 3 (reduces mean)
  ADD_MID: 3,    // add a chip with value 5 (neutral)
  ADD_HIGH: 2,   // add a chip with value 7 (increases mean)
  REMOVE: 2,     // remove the highest outlier chip
  SWAP: 4,       // swap an outlier for a value-5 chip
} as const

export function applyShopAdd(jar: Chip[], value: number): Chip[] {
  return [...jar, makeChip(value)]
}

export function applyShopRemove(jar: Chip[]): Chip[] {
  if (jar.length === 0) return jar
  // Remove the chip with the most extreme deviation from 5
  const sorted = [...jar].sort((a, b) => Math.abs(b.value - 5) - Math.abs(a.value - 5))
  return jar.filter(c => c.id !== sorted[0].id)
}

export function applyShopSwap(jar: Chip[]): Chip[] {
  const outlier = [...jar].sort((a, b) => Math.abs(b.value - 5) - Math.abs(a.value - 5))[0]
  if (!outlier) return jar
  return [...jar.filter(c => c.id !== outlier.id), makeChip(5)]
}
