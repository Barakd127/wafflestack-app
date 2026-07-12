/**
 * bridgeStore — "Bridge & City" engine state: player-authored bridge /
 * analogy / similarity edges between topics, their coin payouts, and the
 * coin ledger.
 *
 * Storage follows the manual-localStorage pattern used across this codebase
 * (see src/store/arsenalStore.ts, src/store/tutorialStore.ts) rather than
 * zustand's `persist` middleware — no persist middleware is used anywhere in
 * this repo, so this store loads its snapshot at module init and writes back
 * on every mutating action, matching sibling stores.
 *
 * Enforces (binding design rules):
 *   R1 — every payout requires the Retrieval Gate (enforced by callers via
 *        retrievalGate.ts; this store enforces the quality gate + caps).
 *   R5 — the knowledge graph (topicHierarchy) is the single source of truth;
 *        edges here reference topicIds but never redefine them.
 *   Anti-runaway caps — max 5 bridges/day, max 3 analogies/day.
 *   Quality gate — rejects lazy labels (qualityGate.ts).
 */
import { create } from 'zustand'
import { checkLabelWithJustification } from '../game/qualityGate'
import type { BridgeEdge, BridgeKind, LedgerEntry } from '../game/bridgeTypes'

const STORAGE_KEY = 'wafflestack-bridge-v1'

const MAX_BRIDGES_PER_DAY = 5
const MAX_ANALOGIES_PER_DAY = 3

const PAYOUT: Record<BridgeKind, number> = {
  bridge: 10,
  analogy: 15,
  similarity: 12,
}

export interface SubmitEdgeInput {
  sourceTopicId: string
  targetTopicId: string
  label: string
  kind: BridgeKind
  justification?: string
}

export interface SubmitEdgeResult {
  ok: boolean
  reason?: string
  edge?: BridgeEdge
  coins?: number
}

interface BridgeState {
  edges: BridgeEdge[]
  coins: number
  ledger: LedgerEntry[]
  sessionBridgeCount: number
  sessionDate: string
  dailyAnalogyCount: number
  submitEdge: (input: SubmitEdgeInput) => SubmitEdgeResult
  spendCoins: (amount: number, reason: string) => boolean
  resetSession: () => void
}

interface PersistedShape {
  edges: BridgeEdge[]
  coins: number
  ledger: LedgerEntry[]
  sessionBridgeCount: number
  sessionDate: string
  dailyAnalogyCount: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function initialState(): PersistedShape {
  return {
    edges: [],
    coins: 0,
    ledger: [],
    sessionBridgeCount: 0,
    sessionDate: today(),
    dailyAnalogyCount: 0,
  }
}

function loadPersisted(): PersistedShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<PersistedShape>
    return {
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
      sessionBridgeCount: typeof parsed.sessionBridgeCount === 'number' ? parsed.sessionBridgeCount : 0,
      sessionDate: typeof parsed.sessionDate === 'string' ? parsed.sessionDate : today(),
      dailyAnalogyCount: typeof parsed.dailyAnalogyCount === 'number' ? parsed.dailyAnalogyCount : 0,
    }
  } catch {
    return initialState()
  }
}

function savePersisted(state: PersistedShape): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* quota */ }
}

function persistedSlice(state: BridgeState): PersistedShape {
  return {
    edges: state.edges,
    coins: state.coins,
    ledger: state.ledger,
    sessionBridgeCount: state.sessionBridgeCount,
    sessionDate: state.sessionDate,
    dailyAnalogyCount: state.dailyAnalogyCount,
  }
}

function isDuplicateEdge(edges: BridgeEdge[], sourceTopicId: string, targetTopicId: string, kind: BridgeKind): boolean {
  return edges.some(e =>
    e.kind === kind &&
    ((e.sourceTopicId === sourceTopicId && e.targetTopicId === targetTopicId) ||
     (e.sourceTopicId === targetTopicId && e.targetTopicId === sourceTopicId))
  )
}

export const useBridgeStore = create<BridgeState>((set, get) => ({
  ...loadPersisted(),

  submitEdge: (input) => {
    const { sourceTopicId, targetTopicId, label, kind, justification } = input

    if (sourceTopicId === targetTopicId) {
      return { ok: false, reason: 'לא ניתן ליצור גשר של נושא לעצמו' }
    }

    const state = get()

    if (isDuplicateEdge(state.edges, sourceTopicId, targetTopicId, kind)) {
      return { ok: false, reason: 'גשר כזה כבר קיים בין הנושאים האלה' }
    }

    const verdict = checkLabelWithJustification(label, kind, justification)
    if (!verdict.pass) {
      return { ok: false, reason: verdict.reason }
    }

    // Roll daily counters forward if the session date has changed.
    const isNewDay = state.sessionDate !== today()
    const sessionBridgeCount = isNewDay ? 0 : state.sessionBridgeCount
    const dailyAnalogyCount = isNewDay ? 0 : state.dailyAnalogyCount
    const sessionDate = today()

    if (kind === 'bridge' && sessionBridgeCount >= MAX_BRIDGES_PER_DAY) {
      return { ok: false, reason: `הגעת למכסה היומית של ${MAX_BRIDGES_PER_DAY} גשרים — נסה שוב מחר` }
    }
    if ((kind === 'analogy' || kind === 'similarity') && dailyAnalogyCount >= MAX_ANALOGIES_PER_DAY) {
      return { ok: false, reason: `הגעת למכסה היומית של ${MAX_ANALOGIES_PER_DAY} אנלוגיות/דמיונות — נסה שוב מחר` }
    }

    const coinsAwarded = PAYOUT[kind]
    const edge: BridgeEdge = {
      id: makeId(),
      sourceTopicId,
      targetTopicId,
      label: label.trim(),
      kind,
      justification: justification?.trim() || undefined,
      createdAt: new Date().toISOString(),
      coinsAwarded,
    }

    const ledgerEntry: LedgerEntry = {
      id: makeId(),
      ts: edge.createdAt,
      amount: coinsAwarded,
      verb: kind,
      refId: edge.id,
    }

    const nextEdges = [...state.edges, edge]
    const nextLedger = [...state.ledger, ledgerEntry]
    const nextCoins = state.coins + coinsAwarded
    const nextBridgeCount = kind === 'bridge' ? sessionBridgeCount + 1 : sessionBridgeCount
    const nextAnalogyCount = (kind === 'analogy' || kind === 'similarity') ? dailyAnalogyCount + 1 : dailyAnalogyCount

    const nextState: BridgeState = {
      ...state,
      edges: nextEdges,
      coins: nextCoins,
      ledger: nextLedger,
      sessionBridgeCount: nextBridgeCount,
      sessionDate,
      dailyAnalogyCount: nextAnalogyCount,
    }

    set(nextState)
    savePersisted(persistedSlice(nextState))

    return { ok: true, edge, coins: nextCoins }
  },

  spendCoins: (amount, reason) => {
    const state = get()
    if (amount <= 0 || state.coins < amount) return false

    const ledgerEntry: LedgerEntry = {
      id: makeId(),
      ts: new Date().toISOString(),
      amount: -amount,
      verb: reason,
    }

    const nextState: BridgeState = {
      ...state,
      coins: state.coins - amount,
      ledger: [...state.ledger, ledgerEntry],
    }

    set(nextState)
    savePersisted(persistedSlice(nextState))
    return true
  },

  resetSession: () => {
    const state = get()
    const nextState: BridgeState = {
      ...state,
      sessionBridgeCount: 0,
      sessionDate: today(),
      dailyAnalogyCount: 0,
    }
    set(nextState)
    savePersisted(persistedSlice(nextState))
  },
}))
