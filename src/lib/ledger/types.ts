// ── Asset Economy ledger contract (Design Doc v1.1) ──────────────────────────
// Two append-only event streams: GRAPH (what the learner did — the source of
// truth for competence) and ASSETS (coin movements — always derived from graph
// events, never free-floating). Coin balance is ALWAYS a fold over the asset
// stream; it is never stored.

/** Who may see an event when sharing/aggregation features exist. */
export type Visibility =
  | 'private-struggle'
  | 'neutral'
  | 'public-pride'
  | 'shared-aggregate-only'

export type GraphEventType =
  | 'node-studied'
  | 'retrieval-passed'
  | 'retrieval-failed'
  | 'edge-drawn'
  | 'scaffold-step-completed'
  | 'weekly-ritual-completed'

export interface GraphEvent {
  id: string
  ts: number
  userId: string
  type: GraphEventType
  visibility: Visibility
  payload: Record<string, unknown>
}

// Payload shapes (documented, enforced by the writer functions in ledger.ts):
// retrieval-passed: { topicId: string; questionId: string; retentionIntervalDays: number; firstTry: boolean }
// edge-drawn:       { edgeId: string; sourceTopicId: string; targetTopicId: string; relationType: string; label: string }

export type AssetEventType =
  | 'payout'
  | 'sink-cosmetic'
  | 'sink-premium'
  | 'sink-burn-trade'

export interface AssetEvent {
  id: string
  ts: number
  userId: string
  type: AssetEventType
  coinDelta: number
  /** R15: every POSITIVE coinDelta must point at the graph event that earned it. */
  sourceEventId?: string
  /** Secondary reference (e.g. the skyway edgeId a dividend belongs to, or a sku id). */
  refId?: string
  memo: string
}

export interface Ledger {
  graph: GraphEvent[]
  assets: AssetEvent[]
}

/** A learner-drawn conceptual bridge between two topic districts. */
export interface SkywayEdge {
  edgeId: string
  sourceTopicId: string
  targetTopicId: string
  relationType: string
  label: string
  createdTs: number
}
