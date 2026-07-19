// ── Asset Economy ledger core (Design Doc v1.1) ──────────────────────────────
// Append-only dual-stream ledger persisted to localStorage. All coin balances
// are folds over the asset stream (never stored). R15 lives here as a schema
// constraint: a positive coinDelta MUST reference the graph event that earned
// it, and each (sourceEventId, type, refId) tuple pays at most once.
//
// No React in this module — components subscribe via onLedgerChange +
// ledgerVersion and re-read through loadLedger.

import type { AssetEvent, GraphEvent, Ledger, SkywayEdge } from './types'
import { useLearningStore } from '../../store/learningStore'
import { TOPIC_TO_BUILDING } from './topicMeta'

// ── Tunables (R7 / bridge economy, from Design Doc v1.1) ─────────────────────
const BASE_FIRST_TRY = 5
const BASE_RETRY = 2
const SKYWAY_PAYOUT = 10
const SKYWAYS_PER_DAY = 5
const DIVIDEND_PER_EDGE = 1
const DIVIDEND_CAP_PER_BRIDGE_WEEK = 15
const DIVIDEND_CAP_TOTAL_WEEK = 60
const RITUAL_PAYOUT = 25

/** Typed relation vocabulary for skyways (structural quality gate). */
export const RELATION_TYPES: string[] = [
  'סיבה ותוצאה',
  'הכללה',
  'ניגוד',
  'תנאי',
  'חישוב',
  'אנלוגיה',
]

/** Generic connective labels that carry no structural insight — rejected. */
const GENERIC_LABELS: string[] = ['קשור ל', 'דומה ל', 'חיבור', 'קשר', 'דבר']

// ── Storage ──────────────────────────────────────────────────────────────────

function storageKey(userId: string): string {
  return `wafflestack-ledger-${userId}`
}

/** Load a user's ledger. NEVER throws — corrupt/missing storage → empty ledger. */
export function loadLedger(userId: string): Ledger {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return { graph: [], assets: [] }
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as Ledger).graph) &&
      Array.isArray((parsed as Ledger).assets)
    ) {
      return parsed as Ledger
    }
    return { graph: [], assets: [] }
  } catch {
    return { graph: [], assets: [] }
  }
}

// ── Change notification (version counter + listener registry) ────────────────

const versions = new Map<string, number>()
const listeners = new Set<(userId: string) => void>()

/** Monotonic per-user version — bumps on every append. Components can poll it. */
export function ledgerVersion(userId: string): number {
  return versions.get(userId) ?? 0
}

/** Subscribe to any ledger append. Returns an unsubscribe function. */
export function onLedgerChange(cb: (userId: string) => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function saveLedger(userId: string, ledger: Ledger): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ledger))
  } catch {
    /* quota — listeners are still notified so UI reflects in-memory intent */
  }
  versions.set(userId, (versions.get(userId) ?? 0) + 1)
  for (const cb of listeners) {
    try {
      cb(userId)
    } catch {
      /* a broken listener must never break an append */
    }
  }
}

// ── Ids ──────────────────────────────────────────────────────────────────────

let idCounter = 0
function makeId(type: string, ts: number): string {
  return `${type}-${ts}-${idCounter++}`
}

// ── Append primitives ────────────────────────────────────────────────────────

export function appendGraphEvent(
  userId: string,
  e: Omit<GraphEvent, 'id' | 'ts' | 'userId'>
): GraphEvent {
  const ledger = loadLedger(userId)
  const ts = Date.now()
  const event: GraphEvent = { ...e, id: makeId(e.type, ts), ts, userId }
  ledger.graph.push(event)
  saveLedger(userId, ledger)
  return event
}

export function appendAssetEvent(
  userId: string,
  e: Omit<AssetEvent, 'id' | 'ts' | 'userId'>
): AssetEvent {
  // R15a: coins are never minted out of thin air — every positive delta must
  // point at the graph event (real learning act) that earned it.
  if (e.coinDelta > 0 && !e.sourceEventId) {
    throw new Error('R15: positive coinDelta requires a sourceEventId')
  }
  const ledger = loadLedger(userId)
  // R15b: one payout per (sourceEventId, type, refId ?? '') — a learning act
  // can never be double-paid. Only enforced when sourceEventId is present
  // (sink events without a source, e.g. cosmetics, may legitimately repeat).
  if (e.sourceEventId) {
    const duplicate = ledger.assets.some(
      a =>
        a.sourceEventId === e.sourceEventId &&
        a.type === e.type &&
        (a.refId ?? '') === (e.refId ?? '')
    )
    if (duplicate) {
      throw new Error('R15: duplicate asset event for (sourceEventId, type, refId)')
    }
  }
  const ts = Date.now()
  const event: AssetEvent = { ...e, id: makeId(e.type, ts), ts, userId }
  ledger.assets.push(event)
  saveLedger(userId, ledger)
  return event
}

/** Coin balance is ALWAYS a fold over the asset stream — never stored. */
export function coinBalance(l: Ledger): number {
  return l.assets.reduce((sum, a) => sum + a.coinDelta, 0)
}

// ── Time helpers ─────────────────────────────────────────────────────────────

/** Local calendar day key, YYYY-MM-DD (local tz, NOT UTC toISOString). */
function dayKey(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** ISO-8601 week key, e.g. "2026-W29" (week-numbering year, Thursday rule). */
function isoWeekKey(ts: number): string {
  const src = new Date(ts)
  const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()))
  const dayOfWeek = d.getUTCDay() || 7 // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek) // shift to the ISO-week Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

// ── Payout math (R7) ─────────────────────────────────────────────────────────

/** Diminishing-ceiling multiplier over the SM-2 interval AT TIME OF PASS. */
function intervalMultiplier(days: number): number {
  if (days < 6) return 1.0
  if (days < 16) return 1.5 // 6–15
  if (days <= 45) return 2.0 // 16–45
  return 2.25 // >45 — the ceiling; deliberately NOT an overdue premium
}

/** djb2 string hash (unsigned 32-bit) — deterministic insight-spark source. */
function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  }
  return h
}

// ── Retrieval recording ──────────────────────────────────────────────────────

/**
 * Record a passed retrieval gate: appends the graph event, pays the R7 payout
 * (+ deterministic flat spark), then pays bridge dividends for skyways touching
 * the topic (weekly caps). Returns TOTAL coins earned (payout + dividends).
 */
export function recordRetrievalPass(
  userId: string,
  p: {
    topicId: string
    questionId: string
    retentionIntervalDays: number
    firstTry: boolean
    isNewCard: boolean
  }
): { coins: number; spark: boolean } {
  const graphEvent = appendGraphEvent(userId, {
    type: 'retrieval-passed',
    visibility: 'neutral',
    payload: {
      topicId: p.topicId,
      questionId: p.questionId,
      retentionIntervalDays: p.retentionIntervalDays,
      firstTry: p.firstTry,
    },
  })

  // R7: a repeat review under 1 day earns nothing (pass still logged above).
  // Dividends are gated by the same rule — otherwise same-day cramming on a
  // well-bridged topic would farm the dividend stream.
  if (!p.isNewCard && p.retentionIntervalDays < 1) {
    return { coins: 0, spark: false }
  }

  const base = p.firstTry ? BASE_FIRST_TRY : BASE_RETRY
  let raw = base * intervalMultiplier(p.retentionIntervalDays)
  // Insight spark: flat +20%, fully deterministic from the event id (R13 — no
  // gambling-style variable rewards).
  const spark = djb2(graphEvent.id) % 5 === 0
  if (spark) raw *= 1.2
  const coins = Math.round(raw)

  if (coins > 0) {
    appendAssetEvent(userId, {
      type: 'payout',
      coinDelta: coins,
      sourceEventId: graphEvent.id,
      memo: spark ? 'תגמול שליפה + ניצוץ תובנה' : 'תגמול שליפה',
    })
  }

  const dividends = payBridgeDividends(userId, graphEvent.id, p.topicId)
  return { coins: coins + dividends, spark }
}

/**
 * Bridge dividends: each retrieval-pass on topic T pays +1c per existing
 * skyway touching T. INVARIANT: dividend events are the ONLY 'payout' events
 * carrying a refId (the edgeId) — weekly caps are computed off that marker.
 */
function payBridgeDividends(userId: string, passEventId: string, topicId: string): number {
  const ledger = loadLedger(userId)
  const touching = listSkyways(ledger).filter(
    s => s.sourceTopicId === topicId || s.targetTopicId === topicId
  )
  if (touching.length === 0) return 0

  const now = Date.now()
  const week = isoWeekKey(now)
  const weekDividends = ledger.assets.filter(
    a => a.type === 'payout' && a.refId !== undefined && isoWeekKey(a.ts) === week
  )
  let weekTotal = weekDividends.reduce((s, a) => s + a.coinDelta, 0)

  let paid = 0
  for (const edge of touching) {
    if (weekTotal >= DIVIDEND_CAP_TOTAL_WEEK) break // 60c/week across all bridges
    const perBridge = weekDividends
      .filter(a => a.refId === edge.edgeId)
      .reduce((s, a) => s + a.coinDelta, 0)
    if (perBridge >= DIVIDEND_CAP_PER_BRIDGE_WEEK) continue // 15c/week per bridge
    appendAssetEvent(userId, {
      type: 'payout',
      coinDelta: DIVIDEND_PER_EDGE,
      sourceEventId: passEventId,
      refId: edge.edgeId,
      memo: 'דיבידנד גשר',
    })
    paid += DIVIDEND_PER_EDGE
    weekTotal += DIVIDEND_PER_EDGE
  }
  return paid
}

/** Record a failed retrieval. Private by design (R10 — struggle is not public). */
export function recordRetrievalFail(userId: string, topicId: string, questionId: string): void {
  appendGraphEvent(userId, {
    type: 'retrieval-failed',
    visibility: 'private-struggle',
    payload: { topicId, questionId },
  })
}

// ── Skyways (conceptual bridges) ─────────────────────────────────────────────

/**
 * Draw a skyway between two mastered topics. Gates: both endpoint buildings at
 * level 2 (admin mode bypasses, repo convention), structural label quality,
 * typed relation, no duplicate pair, max 5 per calendar day. Pays 10c.
 */
export function drawSkyway(
  userId: string,
  e: { sourceTopicId: string; targetTopicId: string; relationType: string; label: string }
): { ok: true; coins: number } | { ok: false; reason: string } {
  if (e.sourceTopicId === e.targetTopicId) {
    return { ok: false, reason: 'אי אפשר למתוח גשר מנושא אל עצמו' }
  }

  // Mastery gate: BOTH endpoint buildings at level 2.
  const { buildingProgress, adminMode } = useLearningStore.getState()
  if (!adminMode) {
    for (const topicId of [e.sourceTopicId, e.targetTopicId]) {
      const buildingId = TOPIC_TO_BUILDING[topicId]
      const level = buildingId ? buildingProgress[buildingId]?.level ?? 0 : 0
      if (level < 2) {
        return { ok: false, reason: 'גשר נמתח רק בין שני נושאים שהושלמו במלואם' }
      }
    }
  }

  // Structural quality gate.
  const label = e.label.trim()
  if (label.length < 4) {
    return { ok: false, reason: 'תיאור הקשר קצר מדי — נסחו את הרעיון במילים שלכם' }
  }
  if (GENERIC_LABELS.includes(label)) {
    return { ok: false, reason: 'תיאור כללי מדי — מה בדיוק מחבר בין שני הנושאים?' }
  }
  if (!RELATION_TYPES.includes(e.relationType)) {
    return { ok: false, reason: 'יש לבחור סוג קשר מהרשימה' }
  }

  const ledger = loadLedger(userId)

  // One bridge per unordered topic pair.
  const duplicate = listSkyways(ledger).some(
    s =>
      (s.sourceTopicId === e.sourceTopicId && s.targetTopicId === e.targetTopicId) ||
      (s.sourceTopicId === e.targetTopicId && s.targetTopicId === e.sourceTopicId)
  )
  if (duplicate) {
    return { ok: false, reason: 'כבר קיים גשר בין שני הנושאים האלה' }
  }

  // Daily cap: max 5 edges per calendar day.
  const today = dayKey(Date.now())
  const drawnToday = ledger.graph.filter(
    g => g.type === 'edge-drawn' && dayKey(g.ts) === today
  ).length
  if (drawnToday >= SKYWAYS_PER_DAY) {
    return { ok: false, reason: 'הגעתם למכסת הגשרים היומית — נמשיך מחר' }
  }

  const edgeId = makeId('edge', Date.now())
  const graphEvent = appendGraphEvent(userId, {
    type: 'edge-drawn',
    visibility: 'public-pride',
    payload: {
      edgeId,
      sourceTopicId: e.sourceTopicId,
      targetTopicId: e.targetTopicId,
      relationType: e.relationType,
      label,
    },
  })
  // NOTE: no refId here — the refId marker on 'payout' events is reserved for
  // bridge dividends (see payBridgeDividends invariant).
  appendAssetEvent(userId, {
    type: 'payout',
    coinDelta: SKYWAY_PAYOUT,
    sourceEventId: graphEvent.id,
    memo: 'בניית גשר חדש',
  })
  return { ok: true, coins: SKYWAY_PAYOUT }
}

/** All skyways, folded from the graph stream. */
export function listSkyways(l: Ledger): SkywayEdge[] {
  return l.graph
    .filter(g => g.type === 'edge-drawn')
    .map(g => ({
      edgeId: String(g.payload.edgeId ?? g.id),
      sourceTopicId: String(g.payload.sourceTopicId ?? ''),
      targetTopicId: String(g.payload.targetTopicId ?? ''),
      relationType: String(g.payload.relationType ?? ''),
      label: String(g.payload.label ?? ''),
      createdTs: g.ts,
    }))
}

// ── Weekly ritual ────────────────────────────────────────────────────────────

/** 25c once per ISO week. Returns coins earned (0 if already done this week). */
export function completeWeeklyRitual(userId: string): number {
  const ledger = loadLedger(userId)
  const week = isoWeekKey(Date.now())
  const alreadyDone = ledger.graph.some(
    g => g.type === 'weekly-ritual-completed' && isoWeekKey(g.ts) === week
  )
  if (alreadyDone) return 0
  const graphEvent = appendGraphEvent(userId, {
    type: 'weekly-ritual-completed',
    visibility: 'neutral',
    payload: { isoWeek: week },
  })
  appendAssetEvent(userId, {
    type: 'payout',
    coinDelta: RITUAL_PAYOUT,
    sourceEventId: graphEvent.id,
    memo: 'טקס שבועי הושלם',
  })
  return RITUAL_PAYOUT
}

// ── Purchases (coins buy beauty, never knowledge) ────────────────────────────

function cosmeticsKey(userId: string): string {
  return `wafflestack-cosmetics-${userId}`
}

/** Owned cosmetic sku ids. Never throws. */
export function loadCosmetics(userId: string): string[] {
  try {
    const raw = localStorage.getItem(cosmeticsKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Buy a cosmetic sku. Returns false when balance is insufficient or the sku is
 * already owned; on success appends the sink event and records ownership.
 */
export function purchase(
  userId: string,
  sku: { id: string; cost: number; kind: 'sink-cosmetic' }
): boolean {
  const ledger = loadLedger(userId)
  if (coinBalance(ledger) < sku.cost) return false
  const owned = loadCosmetics(userId)
  if (owned.includes(sku.id)) return false
  appendAssetEvent(userId, {
    type: 'sink-cosmetic',
    coinDelta: -sku.cost,
    refId: sku.id,
    memo: `רכישת קישוט: ${sku.id}`,
  })
  try {
    localStorage.setItem(cosmeticsKey(userId), JSON.stringify([...owned, sku.id]))
  } catch {
    /* quota — the sink event is the source of truth either way */
  }
  return true
}
