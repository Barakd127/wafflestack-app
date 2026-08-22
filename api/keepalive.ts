/**
 * Vercel Edge Function: /api/keepalive
 *
 * Supabase pauses FREE-tier projects after 7 days without database activity and
 * e-mails "Your project WaffleStack has been paused" — students then hit a dead
 * backend until someone unpauses it from the dashboard. The Vercel cron in
 * vercel.json calls this route once a day; it runs ONE real PostgREST query
 * (same public anon key the client ships with), which counts as activity and
 * resets Supabase's inactivity timer.
 *
 * Manual check: GET https://wafflestack-app.vercel.app/api/keepalive
 *   → 200 { ok: true, status: 200, at } while the project is awake
 *   → 502 { ok: false, status } if Supabase is paused or the key changed.
 */

export const config = { runtime: 'edge' }

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export default async function handler(_req: Request): Promise<Response> {
  const env = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env ?? {}
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return json({ ok: false, error: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set' }, 500)

  // RLS may return an empty list for the anon role — the query still executes on the DB.
  const r = await fetch(`${url}/rest/v1/progress?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  const ok = r.ok
  return json({ ok, status: r.status, at: new Date().toISOString() }, ok ? 200 : 502)
}
