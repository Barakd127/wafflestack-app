import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// When env vars are absent (local dev / Vercel without secrets configured)
// we export a no-op mock so the app loads in guest/localStorage-only mode.
function makeMock() {
  const noop = () => Promise.resolve({ data: { user: null, session: null }, error: null })
  return {
    auth: {
      getSession:              () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword:      () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel' } }),
      signUp:                  () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel' } }),
      signOut:                 noop,
      onAuthStateChange:       (_event: unknown, _cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: ReturnType<typeof createClient> = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (makeMock() as any)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[WaffleStack] Supabase env vars missing — running in guest/localStorage-only mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel to enable multi-user auth.')
}
