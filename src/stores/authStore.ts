/**
 * authStore — Multi-user authentication backed by Supabase
 * Falls back to local-only guest session when Supabase is unavailable.
 *
 * SETUP: In Supabase Dashboard → Authentication → Settings →
 *   disable "Enable email confirmations" for development / username-only sign-in.
 *
 * Username-based sign-in uses the synthetic email pattern:
 *   {username}@wafflestack.app
 * No real emails are sent — usernames are the primary identity.
 */

import { supabase } from '../lib/supabase'

export interface User {
  userId: string
  username: string
  displayName?: string
  role: 'student' | 'teacher'
  createdAt: string
  lastActiveAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}@wafflestack.app`
}

function supabaseUserToUser(sbUser: {
  id: string
  user_metadata: Record<string, string>
  created_at: string
}): User {
  const meta = sbUser.user_metadata ?? {}
  return {
    userId: sbUser.id,
    username: meta.username ?? sbUser.id.slice(0, 8),
    displayName: meta.display_name,
    role: (meta.role as 'student' | 'teacher') ?? 'student',
    createdAt: sbUser.created_at,
    lastActiveAt: new Date().toISOString(),
  }
}

// ── Public API (same interface as before) ────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    return supabaseUserToUser(session.user as Parameters<typeof supabaseUserToUser>[0])
  } catch {
    return null
  }
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  })
  if (error || !data.user) return null
  return supabaseUserToUser(data.user as Parameters<typeof supabaseUserToUser>[0])
}

export async function registerUser(
  username: string,
  password: string,
  displayName?: string,
  role: 'student' | 'teacher' = 'student'
): Promise<User | string> {
  if (!username.trim()) return 'שם משתמש לא יכול להיות ריק'
  if (username.length < 2) return 'שם משתמש חייב להכיל לפחות 2 תווים'
  if (password.length < 4) return 'סיסמה חייבת להכיל לפחות 4 תווים'

  const { data, error } = await supabase.auth.signUp({
    email: toEmail(username),
    password,
    options: {
      data: {
        username: username.trim(),
        display_name: displayName?.trim() || username.trim(),
        role,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return 'שם המשתמש כבר קיים'
    }
    return error.message
  }
  if (!data.user) return 'הרשמה נכשלה'
  return supabaseUserToUser(data.user as Parameters<typeof supabaseUserToUser>[0])
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

export function initializeUser(): User {
  // Synchronous fallback for components that can't await — returns a guest.
  // Real auth state should be checked via getCurrentUser() or onAuthStateChange.
  return {
    userId: `guest-${Date.now()}`,
    username: 'guest',
    displayName: 'Guest',
    role: 'student',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
}

// ── Auth state listener — call once at app root ───────────────────────────────

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
      ? supabaseUserToUser(session.user as Parameters<typeof supabaseUserToUser>[0])
      : null
    callback(user)
  })
}

// ── Legacy helpers (kept for backward compat) ─────────────────────────────────

export async function listUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  // Server-side user listing requires the service_role key — not available client-side.
  // Return empty array; teacher dashboards should query via a Supabase Edge Function.
  return []
}

export function deleteUser(_userId: string): void {
  // Deletion requires the service_role key — handle via Supabase dashboard or Edge Function.
  console.warn('deleteUser: use Supabase Dashboard or Edge Function for user deletion')
}
