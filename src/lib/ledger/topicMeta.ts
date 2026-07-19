// ── Topic universe + question→topic map for the asset economy ────────────────
// Local reimplementation of the 10-building → quiz-bank-topic map (kept in sync
// with src/hooks/useQuiz.ts BUILDING_TO_TOPIC on purpose — we do NOT import
// from the hook to avoid coupling ledger code to React hook modules).

import { HEBREW_LABELS } from '../../data/topicLabels'
import quizBank from '../../data/quiz-bank.json'

/** StatChallenge building id → quiz-bank topic key (the 10 core buildings). */
export const BUILDING_TO_TOPIC: Record<string, string> = {
  power: 'mean',
  housing: 'median',
  traffic: 'std-dev',
  hospital: 'probability', // closest topic; quiz-bank has no "normal-distribution"
  school: 'sampling',
  bank: 'regression',
  market: 'correlation',
  'city-hall': 'binomial',
  research: 'hypothesis-testing',
  news: 'confidence-intervals',
}

/** Inverse map: quiz-bank topic key → building id. */
export const TOPIC_TO_BUILDING: Record<string, string> = Object.fromEntries(
  Object.entries(BUILDING_TO_TOPIC).map(([building, topic]) => [topic, building])
)

/** Hebrew display name for each of the 10 core quiz topics. */
export const TOPIC_HEBREW: Record<string, string> = Object.fromEntries(
  Object.values(BUILDING_TO_TOPIC).map(topicId => [topicId, HEBREW_LABELS[topicId] ?? topicId])
)

export interface TopicMeta {
  topicId: string
  buildingId: string
  hebrewName: string
}

/** The 10-topic universe of the asset economy (one per core building). */
export const TOPICS: TopicMeta[] = Object.entries(BUILDING_TO_TOPIC).map(
  ([buildingId, topicId]) => ({
    topicId,
    buildingId,
    hebrewName: HEBREW_LABELS[topicId] ?? topicId,
  })
)

// ── questionId → topicId, built from the full quiz bank ──────────────────────
// Covers EVERY topic in quiz-bank.json (not just the 10 core ones) so
// projections can map any SM-2 card back to a topic; consumers that only care
// about the 10-building universe filter through TOPICS.
const bankTopics = quizBank.topics as Record<string, { questions: { id: string }[] }>

export const questionTopicMap: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [topicId, data] of Object.entries(bankTopics)) {
    for (const q of data.questions) map[q.id] = topicId
  }
  return map
})()
