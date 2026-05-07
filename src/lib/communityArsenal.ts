/**
 * Community Arsenal — Supabase-backed sharing of personal Arsenal entries
 * (gotchas / tricks / tips) into a global feed any user can browse, upvote,
 * and copy into their own local arsenal.
 *
 * Local-mode safety: when Supabase env vars are missing the wrappers all
 * resolve to `{ error: 'local-mode' }` so the UI can render a notice
 * instead of crashing. The Arsenal screen is the only consumer.
 */
import { supabase } from './supabase'
import { getCurrentUser } from '../stores/authStore'
import type { ArsenalKind } from '../store/arsenalStore'

// The shared supabase client is typed without a generated schema, which makes
// from().insert() narrow values to `never`. Cast to a loose builder type so
// our typed columns can be inserted without schema generation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb: any = supabase

export const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface CommunityEntry {
  id: string
  authorId: string
  authorUsername: string
  kind: ArsenalKind
  text: string
  topicId?: string
  upvotes: number
  createdAt: string
  viewerHasUpvoted: boolean
}

interface PublishInput {
  kind: ArsenalKind
  text: string
  topicId?: string
}

interface FeedFilter {
  kind?: ArsenalKind
  topicId?: string
  sort: 'new' | 'top'
}

const LOCAL_MODE_ERR = 'השיתוף הקהילתי דורש חיבור לשרת. נסה שוב לאחר התחברות.'
const NOT_SIGNED_IN_ERR = 'יש להתחבר כדי לשתף בקהילה.'

// ── helpers ────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToEntry(row: any, voterId: string | null): CommunityEntry {
  const upvoterIds: string[] = Array.isArray(row.community_arsenal_upvotes)
    ? row.community_arsenal_upvotes.map((u: any) => u.voter_id)
    : []
  return {
    id: row.id,
    authorId: row.author_id,
    authorUsername: row.author_username,
    kind: row.kind,
    text: row.text,
    topicId: row.topic_id ?? undefined,
    upvotes: row.upvotes ?? 0,
    createdAt: row.created_at,
    viewerHasUpvoted: voterId ? upvoterIds.includes(voterId) : false,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── publish ────────────────────────────────────────────────────────────────

export async function publishEntry(
  entry: PublishInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: LOCAL_MODE_ERR }
  const text = entry.text.trim()
  if (text.length < 3) return { ok: false, error: 'הטקסט קצר מדי (מינימום 3 תווים).' }
  if (text.length > 800) return { ok: false, error: 'הטקסט ארוך מדי (מקסימום 800 תווים).' }
  try {
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: NOT_SIGNED_IN_ERR }
    const { data, error } = await sb
      .from('community_arsenal')
      .insert({
        author_id: user.userId,
        author_username: user.username,
        kind: entry.kind,
        text,
        topic_id: entry.topicId ?? null,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: (data as { id: string } | null)?.id }
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? 'שגיאה לא ידועה' }
  }
}

// ── fetch ──────────────────────────────────────────────────────────────────

export async function fetchFeed(
  filter: FeedFilter,
): Promise<{ entries: CommunityEntry[]; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { entries: [], error: LOCAL_MODE_ERR }
  try {
    const user = await getCurrentUser()
    let q = sb
      .from('community_arsenal')
      .select('id, author_id, author_username, kind, text, topic_id, upvotes, created_at, community_arsenal_upvotes(voter_id)')
      .limit(50)
    if (filter.kind) q = q.eq('kind', filter.kind)
    if (filter.topicId) q = q.eq('topic_id', filter.topicId)
    if (filter.sort === 'top') q = q.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
    else q = q.order('created_at', { ascending: false })
    const { data, error } = await q
    if (error) return { entries: [], error: error.message }
    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>
    return { entries: rows.map(r => rowToEntry(r, user?.userId ?? null)) }
  } catch (e) {
    return { entries: [], error: (e as Error).message ?? 'שגיאה לא ידועה' }
  }
}

// ── upvote toggle ──────────────────────────────────────────────────────────

export async function toggleUpvote(
  entryId: string,
): Promise<{ upvoted: boolean; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { upvoted: false, error: LOCAL_MODE_ERR }
  try {
    const user = await getCurrentUser()
    if (!user) return { upvoted: false, error: NOT_SIGNED_IN_ERR }
    const { data: existing, error: selErr } = await sb
      .from('community_arsenal_upvotes')
      .select('entry_id')
      .eq('entry_id', entryId)
      .eq('voter_id', user.userId)
      .maybeSingle()
    if (selErr) return { upvoted: false, error: selErr.message }
    if (existing) {
      const { error } = await sb
        .from('community_arsenal_upvotes')
        .delete()
        .eq('entry_id', entryId)
        .eq('voter_id', user.userId)
      if (error) return { upvoted: true, error: error.message }
      return { upvoted: false }
    }
    const { error } = await sb
      .from('community_arsenal_upvotes')
      .insert({ entry_id: entryId, voter_id: user.userId })
    if (error) return { upvoted: false, error: error.message }
    return { upvoted: true }
  } catch (e) {
    return { upvoted: false, error: (e as Error).message ?? 'שגיאה לא ידועה' }
  }
}

// ── delete own ─────────────────────────────────────────────────────────────

export async function deleteOwnEntry(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: LOCAL_MODE_ERR }
  try {
    const { error } = await sb
      .from('community_arsenal')
      .delete()
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? 'שגיאה לא ידועה' }
  }
}
