/**
 * authStore — Multi-user authentication with LocalStorage
 * Supports student accounts with username + password.
 * All data is local — no server required.
 */

export interface User {
  userId: string
  username: string
  displayName?: string
  role: 'student' | 'teacher'
  createdAt: string
  lastActiveAt: string
}

interface UserRecord extends User {
  passwordHash: string
}

const USERS_KEY   = 'wafflestack-users'
const SESSION_KEY = 'wafflestack-session'

// ── Password hashing — SHA-256 + per-user salt via Web Crypto ─────────────────
// Salt is derived from username so the same password produces different hashes
// for different users (defeats rainbow tables across the user table). Output is
// a hex string.
async function hashPassword(password: string, username: string): Promise<string> {
  const salt = `wafflestack:${username.toLowerCase()}`
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers(): UserRecord[] {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    const session = JSON.parse(stored) as { userId: string; expiresAt: string }
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    const users = loadUsers()
    const record = users.find(u => u.userId === session.userId)
    if (!record) return null
    const { passwordHash: _ph, ...user } = record
    return { ...user, lastActiveAt: new Date().toISOString() }
  } catch { return null }
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const users = loadUsers()
  const record = users.find(u => u.username.toLowerCase() === username.toLowerCase())
  if (!record) return null
  const expected = await hashPassword(password, record.username)
  if (record.passwordHash !== expected) return null

  record.lastActiveAt = new Date().toISOString()
  saveUsers(users)

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: record.userId, expiresAt }))

  const { passwordHash: _ph, ...user } = record
  return user
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

  const users = loadUsers()
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return 'שם המשתמש כבר קיים'
  }

  const cleanName = username.trim()
  const newUser: UserRecord = {
    userId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
    username: cleanName,
    displayName: displayName?.trim() || cleanName,
    role,
    passwordHash: await hashPassword(password, cleanName),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.userId, expiresAt }))

  const { passwordHash: _ph, ...user } = newUser
  return user
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function listUsers(): Omit<User, 'passwordHash'>[] {
  return loadUsers().map(({ passwordHash: _ph, ...u }) => u)
}

export function deleteUser(userId: string): void {
  const users = loadUsers().filter(u => u.userId !== userId)
  saveUsers(users)
}

export function initializeUser(): User {
  const current = getCurrentUser()
  if (current) return current

  const oldKey = 'wafflestack-user'
  try {
    const old = localStorage.getItem(oldKey)
    if (old) {
      const parsed = JSON.parse(old)
      if (parsed?.userId) return parsed
    }
  } catch { /* ignore */ }

  const anon: User = {
    userId: `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    username: 'guest',
    displayName: 'Guest',
    role: 'student',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }
  return anon
}
