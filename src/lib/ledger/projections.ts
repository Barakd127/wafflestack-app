// ── Pure projections over SM-2 card state (Design Doc v1.1) ──────────────────
// Everything here is a pure function of (cards, questionTopicMap) — no ledger
// reads, no React, no store imports. `writeCityProjection` is the single
// impure escape hatch: it persists a snapshot for the future Godot bridge.

import type { SkywayEdge } from './types'

/** Structural subset of learningStore's CardData that projections need. */
export interface CardLike {
  interval: number
  repetitions: number
  nextReview: number // ms timestamp; 0 = new card (never seen)
}

export interface DueInfo {
  dueByTopic: Record<string, number>
  newAvailable: boolean
  totalDue: number
}

/** Count due cards per topic + whether any never-seen question remains. */
export function dueInfo(
  cards: Record<string, CardLike>,
  questionTopicMap: Record<string, string>
): DueInfo {
  const now = Date.now()
  const dueByTopic: Record<string, number> = {}
  let totalDue = 0
  let newAvailable = false
  for (const [qid, topicId] of Object.entries(questionTopicMap)) {
    const card = cards[qid]
    if (!card || card.nextReview === 0) {
      newAvailable = true
      continue
    }
    if (card.nextReview <= now) {
      dueByTopic[topicId] = (dueByTopic[topicId] ?? 0) + 1
      totalDue++
    }
  }
  return { dueByTopic, newAvailable, totalDue }
}

export interface Weathering {
  /** Up to 2 topic ids, worst first (ranked by accumulated overdue-days). */
  worstTopics: string[]
  /** 0–0.6 haze intensity: clamp(overdueCount / 10, 0, 1) * 0.6 */
  districtHaze: number
}

/** Which districts look weathered, and how hazy the city feels overall. */
export function weathering(
  cards: Record<string, CardLike>,
  questionTopicMap: Record<string, string>
): Weathering {
  const now = Date.now()
  const overdueDaysByTopic: Record<string, number> = {}
  let overdueCount = 0
  for (const [qid, topicId] of Object.entries(questionTopicMap)) {
    const card = cards[qid]
    if (!card || card.nextReview === 0) continue
    if (card.nextReview <= now) {
      overdueCount++
      const overdueDays = (now - card.nextReview) / 86400000
      overdueDaysByTopic[topicId] = (overdueDaysByTopic[topicId] ?? 0) + overdueDays
    }
  }
  const worstTopics = Object.entries(overdueDaysByTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([topicId]) => topicId)
  const districtHaze = Math.min(1, Math.max(0, overdueCount / 10)) * 0.6
  return { worstTopics, districtHaze }
}

/**
 * SM-2 health of one topic, 0–1. 1 = no overdue cards and real repetitions
 * exist; degrades linearly with the overdue fraction; halved when the topic
 * has been seen but never successfully repeated; 0 when never studied.
 */
function topicHealth(
  topicId: string,
  cards: Record<string, CardLike>,
  questionTopicMap: Record<string, string>
): number {
  const now = Date.now()
  let seen = 0
  let overdue = 0
  let hasRepetitions = false
  for (const [qid, t] of Object.entries(questionTopicMap)) {
    if (t !== topicId) continue
    const card = cards[qid]
    if (!card || card.nextReview === 0) continue
    seen++
    if (card.nextReview <= now) overdue++
    if (card.repetitions > 0) hasRepetitions = true
  }
  if (seen === 0) return 0
  let health = 1 - overdue / seen
  if (!hasRepetitions) health *= 0.5
  return Math.min(1, Math.max(0, health))
}

/** Skyway strength 0–1: average of both endpoint topics' SM-2 health. */
export function edgeStrength(
  edge: SkywayEdge,
  cards: Record<string, CardLike>,
  questionTopicMap: Record<string, string>
): number {
  return (
    (topicHealth(edge.sourceTopicId, cards, questionTopicMap) +
      topicHealth(edge.targetTopicId, cards, questionTopicMap)) /
    2
  )
}

/**
 * R14: sabbath is DERIVED from the queue — the due queue being empty IS the
 * golden calm. Never a timer, never its own stored state.
 */
export function isSabbath(totalDue: number): boolean {
  return totalDue === 0
}

/**
 * Persist a city-state snapshot for the future Godot bridge. Fire-and-forget;
 * storage failures are swallowed (the projection is always recomputable).
 */
export function writeCityProjection(userId: string, payload: Record<string, unknown>): void {
  try {
    localStorage.setItem(`wafflestack-city-projection-${userId}`, JSON.stringify(payload))
  } catch {
    /* quota / private mode — recomputable, safe to drop */
  }
}
