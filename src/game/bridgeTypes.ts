/**
 * bridgeTypes — shared types for the "Bridge & City" engine layer.
 *
 * A "bridge" is a player-authored connection between two topics in the
 * knowledge graph (R5: the knowledge graph is the single source of truth —
 * these edges are a player-facing overlay on top of it, not a replacement).
 */

export type BridgeKind = 'bridge' | 'analogy' | 'similarity'

export interface BridgeEdge {
  id: string
  sourceTopicId: string
  targetTopicId: string
  label: string
  kind: BridgeKind
  justification?: string
  createdAt: string
  coinsAwarded: number
}

export interface LedgerEntry {
  id: string
  ts: string
  amount: number
  verb: string
  refId?: string
}

export interface GateStatus {
  topicId: string
  gated: boolean
  reason: string
  lastRetrievalAt?: string
  nextReviewAt?: string
  overdue: boolean
}

export interface QualityVerdict {
  pass: boolean
  reason: string
}
