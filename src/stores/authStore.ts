/**
 * authStore — Multi-user authentication with LocalStorage
 * Supports student accounts with username + password (client-side hashing).
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

// Internal record that also stores the password hash
interface UserRecord extends User {
  passwordHash: string
}

const USERS_KEY   = 'wafflestack-users'
const SESSION_KEY = 'wafflestack-session'

// ── Simple client-side hash (educational use — not for sensitive data) ─────────
function hashPassword(password: string): string {
  // XOR-based hash with btoa encoding — sufficient for a study app
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i)
    hash |= 0
  }
  return btoa(`ws-${Math.abs(hash)}-${password.length}`)
}

// ── User storage helpers ───────────────────────────────────────────────────────
function loadUsers(): UserRecord[] {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Return the currently logged-in user, or null */
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
    // Return without passwordHash
    const { passwordHash: _ph, ...user } = record
    return { ...user, lastActiveAt: new Date().toISOString() }
  } catch { return null }
}

/** Log in with username + password. Returns user on success or null on failure. */
export function loginUser(username: string, password: string): User | null {
  const users = loadUsers()
  const record = users.find(u => u.username.toLowerCase() === username.toLowerCase())
  if (!record) return null
  if (record.passwordHash !== hashPassword(password)) return null

  // Update lastActiveAt
  record.lastActiveAt = new Date().toISOString()
  saveUsers(users)

  // Create session valid for 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: record.userId, expiresAt }))

  const { passwordHash: _ph, ...user } = record
  return user
}

/** Register a new user. Returns the user on success or an error string. */
export function registerUser(
  username: string,
  password: string,
  displayName?: string,
  role: 'student' | 'teacher' = 'student'
): User | string {
  if (!username.trim()) return 'שם משתמש לא יכול להיות ריק'
  if (username.length < 2) return 'שם משתמש חייב להכיל לפחות 2 תווים'
  if (password.length < 4) return 'סיסמה חייבת להכיל לפחות 4 תווים'

  const users = loadUsers()
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return 'שם המשתמש כבר קיים'
  }

  const newUser: UserRecord = {
    userId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
    username: username.trim(),
    displayName: displayName?.trim() || username.trim(),
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  // Auto-login
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.userId, expiresAt }))

  const { passwordHash: _ph, ...user } = newUser
  return user
}

/** Log out the current user */
export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY)
}

/** List all registered users (for teacher view) */
export function listUsers(): Omit<User, 'passwordHash'>[] {
  return loadUsers().map(({ passwordHash: _ph, ...u }) => u)
}

/** Delete a user by userId (teacher only) */
export function deleteUser(userId: string): void {
  const users = loadUsers().filter(u => u.userId !== userId)
  saveUsers(users)
}

/** Legacy: get or create an anonymous user (for backward compat) */
export function initializeUser(): User {
  const current = getCurrentUser()
  if (current) return current

  // Check for old-style anonymous user
  const oldKey = 'wafflestack-user'
  try {
    const old = localStorage.getItem(oldKey)
    if (old) {
      const parsed = JSON.parse(old)
      if (parsed?.userId) return parsed
    }
  } catch { /* ignore */ }

  // Create new anonymous user
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
