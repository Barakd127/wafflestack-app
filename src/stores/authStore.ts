/**
 * authStore — Multi-user authentication.
 *
 * When Supabase env vars are present → full Supabase auth.
 * When absent (local dev / Vercel without secrets) → localStorage-based auth
 *   with a DJB2-hashed password. Good enough for classroom/demo use.
 *
 * SETUP (Supabase mode): Dashboard → Authentication → Settings →
 *   disable "Enable email confirmations" for username-only sign-in.
 *   Username maps to synthetic email: {username}@wafflestack.app
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

const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Local-auth helpers ────────────────────────────────────────────────────────

const LOCAL_USERS_KEY  = 'wafflestack-local-users'
const LOCAL_ACTIVE_KEY = 'wafflestack-active-user'

interface LocalUserRecord extends User {
  passwordHash: number
}

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return h >>> 0
}

function stableId(username: string): string {
  const a = djb2(username.toLowerCase())
  const b = djb2(username + 'wafflestack')
  return `local-${a.toString(16)}-${b.toString(16)}`
}

function loadLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    return raw ? (JSON.parse(raw) as LocalUserRecord[]) : []
  } catch { return [] }
}

function saveLocalUsers(users: LocalUserRecord[]): void {
  try { localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users)) } catch { /* quota */ }
}

function getActiveLocalUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch { return null }
}

function setActiveLocalUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(LOCAL_ACTIVE_KEY, JSON.stringify(user))
    else localStorage.removeItem(LOCAL_ACTIVE_KEY)
  } catch { /* quota */ }
}

function toPublicUser(r: LocalUserRecord): User {
  const { passwordHash: _omit, ...pub } = r
  return { ...pub, lastActiveAt: new Date().toISOString() }
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function toEmail(username: string): string {
  return `${username.toLowerCase().trim().split('@')[0]}@wafflestack.app`
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

// ── Public API ────────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  if (!SUPABASE_CONFIGURED) {
    return getActiveLocalUser()
  }
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    return supabaseUserToUser(session.user as Parameters<typeof supabaseUserToUser>[0])
  } catch {
    return null
  }
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  if (!SUPABASE_CONFIGURED) {
    const users = loadLocalUsers()
    const record = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim())
    if (!record) return null
    if (record.passwordHash !== djb2(password)) return null
    const user = toPublicUser(record)
    setActiveLocalUser(user)
    return user
  }

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

  if (!SUPABASE_CONFIGURED) {
    const users = loadLocalUsers()
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
      return 'שם המשתמש כבר קיים'
    }
    const now = new Date().toISOString()
    const record: LocalUserRecord = {
      userId: stableId(username),
      username: username.trim(),
      displayName: displayName?.trim() || username.trim(),
      role,
      createdAt: now,
      lastActiveAt: now,
      passwordHash: djb2(password),
    }
    saveLocalUsers([...users, record])
    const user = toPublicUser(record)
    setActiveLocalUser(user)
    return user
  }

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
  if (!SUPABASE_CONFIGURED) {
    setActiveLocalUser(null)
    return
  }
  await supabase.auth.signOut()
}

export function initializeUser(): User {
  return {
    userId: `guest-${Date.now()}`,
    username: 'guest',
    displayName: 'Guest',
    role: 'student',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!SUPABASE_CONFIGURED) {
    // Local mode: no persistent listener needed — state is synchronous.
    callback(getActiveLocalUser())
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
      ? supabaseUserToUser(session.user as Parameters<typeof supabaseUserToUser>[0])
      : null
    callback(user)
  })
}

// ── Legacy helpers (kept for backward compat) ─────────────────────────────────

export async function listUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  if (!SUPABASE_CONFIGURED) {
    return loadLocalUsers().map(toPublicUser)
  }
  return []
}

export function deleteUser(_userId: string): void {
  if (!SUPABASE_CONFIGURED) {
    const users = loadLocalUsers().filter(u => u.userId !== _userId)
    saveLocalUsers(users)
    return
  }
  console.warn('deleteUser: use Supabase Dashboard or Edge Function for user deletion')
}
