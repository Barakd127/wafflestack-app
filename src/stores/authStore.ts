/**
 * authStore — User authentication and profile management
 * Handles LocalStorage-based user initialization and profile
 */

export interface User {
  userId: string
  email?: string
  name?: string
  createdAt: string
  lastActiveAt: string
}

const AUTH_KEY = 'wafflestack-user'

export function initializeUser(): User {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const user = JSON.parse(stored) as User
      // Update lastActiveAt
      user.lastActiveAt = new Date().toISOString()
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      return user
    }
  } catch {
    // Corrupt data, start fresh
  }

  // Create new user
  const newUser: User = {
    userId: `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser))
  return newUser
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function updateUserProfile(updates: Partial<User>): User {
  const user = getCurrentUser() || initializeUser()
  const updated = { ...user, ...updates, lastActiveAt: new Date().toISOString() }
  localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
  return updated
}
