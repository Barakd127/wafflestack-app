/**
 * Ask-a-Human relay — "🙋 שאל בן אדם"
 * ===================================
 * When a student is stuck on a quiz question they can escalate to Barak.
 *
 * The WaffleStack app runs in the browser (GitHub Pages / Vercel) and CANNOT
 * write files to Barak's vault directly, so the request is persisted two ways:
 *
 *   1. ALWAYS → localStorage queue  `wafflestack-help-requests`
 *      A durable, offline-safe array of HelpRequest objects. Survives reloads.
 *      This is the source of truth the relay picks up.
 *
 *   2. BEST-EFFORT → Supabase table `help_requests`
 *      Mirrors the same shape so a request raised on the student's device
 *      reaches Barak's laptop even without shared storage. Fails silently in
 *      local mode / when the table is absent — the localStorage copy still
 *      stands.
 *
 * ── HOW BARAK SEES + ANSWERS THESE ──────────────────────────────────────────
 * The `relay-outbox-monitor` scheduled task watches
 *   Barak's Vault/Agent/Inbox/*.md
 * and routes `type: alert` messages to Agent/Alerts/. A tiny companion step
 * (documented in the PR / TODO below) drains the Supabase `help_requests`
 * table (status='pending') into that Inbox as alert .md files, e.g.:
 *
 *   ---
 *   from: wafflestack-app
 *   type: alert
 *   priority: normal
 *   topic: <topicId>
 *   userId: <userId>
 *   ---
 *   # 🙋 בקשת עזרה מתלמיד
 *   **שאלה:** <question text>
 *   **הניסיון של התלמיד:** <attempt>
 *
 * Barak answers by setting the row's `answer` + status='answered' (or replying
 * via the relay Outbox). The app polls `fetchHelpAnswer(id)` and surfaces the
 * reply on the question that was flagged (see surfacing TODO in StudyHub).
 *
 * If Supabase is unavailable, the request is still queued locally + visible to
 * Barak via the relay once the device syncs — nothing is lost.
 */
import { supabase } from './supabase'

// Loose-typed client: the shared supabase client has no generated schema, so
// .from().insert() narrows to `never`. Cast so our columns insert cleanly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb: any = supabase

export const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const HELP_REQUESTS_KEY = 'wafflestack-help-requests'

export type HelpRequestStatus = 'pending' | 'answered'

export interface HelpRequest {
  id: string
  question: string
  topicId: string | null
  attempt: string | null
  userId: string | null
  timestamp: string // ISO 8601
  status: HelpRequestStatus
  /** Filled in once a human replies (via relay → Supabase). */
  answer?: string
  /** Whether the Supabase mirror write succeeded (diagnostic). */
  synced?: boolean
}

function loadQueue(): HelpRequest[] {
  try {
    const raw = localStorage.getItem(HELP_REQUESTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveQueue(queue: HelpRequest[]): void {
  try {
    localStorage.setItem(HELP_REQUESTS_KEY, JSON.stringify(queue))
  } catch {
    /* quota — ignore */
  }
}

/** All locally queued help requests (newest first). */
export function getHelpRequests(): HelpRequest[] {
  return loadQueue().sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/** Has THIS question already been escalated (pending or answered)? */
export function hasPendingHelp(questionId: string): boolean {
  return loadQueue().some(r => r.id === questionId || r.id.startsWith(questionId + '::'))
}

interface SubmitInput {
  questionId: string
  question: string
  topicId?: string | null
  attempt?: string | null
  userId?: string | null
}

/**
 * Queue a help request. Writes to localStorage immediately (always succeeds)
 * and best-effort mirrors to Supabase. Returns the stored request.
 */
export async function submitHelpRequest(input: SubmitInput): Promise<HelpRequest> {
  // Stable, per-question id so re-asking the same question doesn't duplicate.
  const id = input.questionId
  const req: HelpRequest = {
    id,
    question: input.question,
    topicId: input.topicId ?? null,
    attempt: input.attempt?.trim() ? input.attempt.trim() : null,
    userId: input.userId ?? null,
    timestamp: new Date().toISOString(),
    status: 'pending',
    synced: false,
  }

  // 1) Persist locally (dedupe by id).
  const queue = loadQueue().filter(r => r.id !== id)
  queue.push(req)
  saveQueue(queue)

  // 2) Best-effort Supabase mirror so it reaches Barak's relay.
  if (SUPABASE_CONFIGURED) {
    try {
      const { error } = await sb.from('help_requests').insert({
        question_id: id,
        question: req.question,
        topic_id: req.topicId,
        attempt: req.attempt,
        user_id: req.userId,
        status: 'pending',
        created_at: req.timestamp,
      })
      if (!error) {
        req.synced = true
        const after = loadQueue().map(r => (r.id === id ? { ...r, synced: true } : r))
        saveQueue(after)
      }
    } catch {
      /* table missing / offline — localStorage copy still queued for the relay */
    }
  }

  return req
}

/**
 * Poll for a human answer to a previously-submitted request.
 * Checks Supabase first (authoritative), falls back to the local copy.
 * On finding an answer, updates the local queue so the UI can surface it.
 */
export async function fetchHelpAnswer(questionId: string): Promise<string | null> {
  if (SUPABASE_CONFIGURED) {
    try {
      const { data, error } = await sb
        .from('help_requests')
        .select('answer, status')
        .eq('question_id', questionId)
        .eq('status', 'answered')
        .maybeSingle()
      if (!error && data?.answer) {
        const after = loadQueue().map(r =>
          r.id === questionId ? { ...r, status: 'answered' as const, answer: data.answer } : r,
        )
        saveQueue(after)
        return data.answer as string
      }
    } catch {
      /* fall through to local */
    }
  }
  const local = loadQueue().find(r => r.id === questionId)
  return local?.status === 'answered' ? local.answer ?? null : null
}
