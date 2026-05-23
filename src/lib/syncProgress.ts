/**
 * syncProgress.ts — localStorage ↔ Supabase mirror for UserProgress.
 *
 * Strategy:
 *   - localStorage is the authoritative WORKING copy (fast, offline-friendly).
 *   - Supabase is the authoritative DURABLE copy (cross-device).
 *   - On login → pull remote, merge with local by lastSaved timestamp, store merged.
 *   - On save → write local immediately; debounce-push remote on top of existing
 *     localStorage debounce.
 *
 * No-op silently when Supabase env vars are missing (mock client) — app stays
 * in localStorage-only mode.
 */

import { supabase } from './supabase'
import type { UserProgress } from '../stores/progressStore'

const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

const REMOTE_DEBOUNCE_MS = 1500

let pushTimer: ReturnType<typeof setTimeout> | null = null

// ── Mapping: UserProgress ↔ progress row ──────────────────────────────────────

interface ProgressRow {
  user_id: string
  xp_total: number
  xp_this_week: number
  xp_this_month: number
  xp_breakdown: UserProgress['xp']['breakdown']
  current_streak: number
  longest_streak: number
  last_active_day: string | null
  total_days_active: number
  topics: UserProgress['topics']
  quiz_sessions: UserProgress['quizSessions']
  canvas_notes: UserProgress['canvasNotes']
  preferences: UserProgress['preferences']
  created_at?: string
  updated_at?: string
}

function progressToRow(p: UserProgress): ProgressRow {
  return {
    user_id:           p.userId,
    xp_total:          p.xp.total,
    xp_this_week:      p.xp.thisWeek,
    xp_this_month:     p.xp.thisMonth,
    xp_breakdown:      p.xp.breakdown,
    current_streak:    p.streaks.currentStreak,
    longest_streak:    p.streaks.longestStreak,
    last_active_day:   p.streaks.lastActiveDay || null,
    total_days_active: p.streaks.totalDaysActive,
    topics:            p.topics,
    quiz_sessions:     p.quizSessions,
    canvas_notes:      p.canvasNotes,
    preferences:       p.preferences,
  }
}

function rowToProgress(row: ProgressRow): UserProgress {
  return {
    userId:    row.user_id,
    createdAt: row.created_at ?? new Date().toISOString(),
    lastSaved: row.updated_at ?? new Date().toISOString(),
    topics:        row.topics ?? {},
    quizSessions:  row.quiz_sessions ?? [],
    canvasNotes:   row.canvas_notes ?? {},
    preferences:   row.preferences ?? { theme: 'light', language: 'hebrew' },
    streaks: {
      currentStreak:   row.current_streak ?? 0,
      longestStreak:   row.longest_streak ?? 0,
      lastActiveDay:   row.last_active_day ?? new Date().toISOString().slice(0, 10),
      totalDaysActive: row.total_days_active ?? 0,
    },
    xp: {
      total:     row.xp_total ?? 0,
      thisWeek:  row.xp_this_week ?? 0,
      thisMonth: row.xp_this_month ?? 0,
      breakdown: row.xp_breakdown ?? { quizzes: 0, masteries: 0, streaks: 0 },
    },
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Pull progress row from Supabase. Returns null if no row, no session, or no Supabase. */
export async function loadProgressRemote(userId: string): Promise<UserProgress | null> {
  if (!SUPABASE_CONFIGURED) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const { data, error } = await sb
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return rowToProgress(data as ProgressRow)
  } catch {
    return null
  }
}

/** Upsert progress to Supabase. Silent no-op if no session / no Supabase. */
export async function pushProgressRemote(progress: UserProgress): Promise<void> {
  if (!SUPABASE_CONFIGURED) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return  // guest / local mode
    await sb
      .from('progress')
      .upsert({ ...progressToRow(progress), updated_at: new Date().toISOString() })
  } catch (e) {
    console.warn('[syncProgress] push failed', e)
  }
}

/** Debounced remote push — schedule, replacing any pending push for the same user. */
export function queueRemotePush(progress: UserProgress): void {
  if (!SUPABASE_CONFIGURED) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { void pushProgressRemote(progress) }, REMOTE_DEBOUNCE_MS)
}

/**
 * Load progress with remote-first preference.
 *   - If remote row exists → use it (overwrite local).
 *   - Else if local row exists → push it remote, use it.
 *   - Else return null (caller should `initializeProgress`).
 *
 * Merge by lastSaved would be cleaner; for v1 remote-wins keeps the model simple
 * since we expect Supabase to be authoritative once user signs in.
 */
export async function loadProgressMerged(
  userId: string,
  localProgress: UserProgress | null,
): Promise<UserProgress | null> {
  const remote = await loadProgressRemote(userId)
  if (remote) return remote
  if (localProgress) {
    // First-time sync: push local up.
    void pushProgressRemote(localProgress)
    return localProgress
  }
  return null
}
