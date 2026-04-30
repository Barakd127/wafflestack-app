/**
 * progressStore — User progress and mastery tracking
 * Handles quiz sessions, scores, streaks, XP, and building mastery
 */

export interface QuizAnswer {
  questionId: string
  answered: boolean
  correct: boolean
  userAnswer?: string
}

export interface QuizSession {
  sessionId: string
  topic: string
  timestamp: string
  score: number
  totalQuestions: number
  correctCount: number
  duration: number // seconds
  answers: QuizAnswer[]
}

export interface TopicProgress {
  topic: string
  concept: string
  building: string
  sessionsAttempted: number
  bestScore: number
  averageScore: number
  mastered: boolean
  masteredAt?: string
  streakDays: number
  lastAttemptAt?: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDay: string
  totalDaysActive: number
}

export interface XPData {
  total: number
  thisWeek: number
  thisMonth: number
  breakdown: {
    quizzes: number
    masteries: number
    streaks: number
  }
}

export interface UserProgress {
  userId: string
  createdAt: string
  lastSaved: string
  topics: Record<string, TopicProgress>
  quizSessions: QuizSession[]
  streaks: StreakData
  xp: XPData
  canvasNotes: Record<string, string> // topic -> notes
  preferences: {
    theme: 'light' | 'dark'
    language: 'hebrew' | 'english'
  }
}

const PROGRESS_KEY = 'wafflestack-user-progress'
const SAVE_DEBOUNCE_MS = 500

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function initializeProgress(userId: string): UserProgress {
  return {
    userId,
    createdAt: new Date().toISOString(),
    lastSaved: new Date().toISOString(),
    topics: {},
    quizSessions: [],
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDay: new Date().toISOString().slice(0, 10),
      totalDaysActive: 0,
    },
    xp: {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      breakdown: { quizzes: 0, masteries: 0, streaks: 0 },
    },
    canvasNotes: {},
    preferences: {
      theme: 'light',
      language: 'hebrew',
    },
  }
}

export function loadProgress(userId: string): UserProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.userId) {
        return parsed
      }
    }
  } catch {
    // Corrupt data
  }
  return initializeProgress(userId)
}

export function saveProgress(progress: UserProgress): void {
  progress.lastSaved = new Date().toISOString()
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function queueProgressSave(progress: UserProgress): void {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveProgress(progress)
  }, SAVE_DEBOUNCE_MS)
}

export function recordQuizSession(
  progress: UserProgress,
  topic: string,
  concept: string,
  building: string,
  answers: QuizAnswer[],
  duration: number
): UserProgress {
  const correct = answers.filter(a => a.correct).length
  const total = answers.length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0

  // Create session
  const session: QuizSession = {
    sessionId: `sess-${Date.now()}`,
    topic,
    timestamp: new Date().toISOString(),
    score,
    totalQuestions: total,
    correctCount: correct,
    duration,
    answers,
  }

  // Update topic progress
  if (!progress.topics[topic]) {
    progress.topics[topic] = {
      topic,
      concept,
      building,
      sessionsAttempted: 0,
      bestScore: 0,
      averageScore: 0,
      mastered: false,
      streakDays: 0,
    }
  }

  const topicProgress = progress.topics[topic]
  topicProgress.sessionsAttempted += 1
  topicProgress.bestScore = Math.max(topicProgress.bestScore, score)
  topicProgress.averageScore =
    (topicProgress.averageScore * (topicProgress.sessionsAttempted - 1) + score) /
    topicProgress.sessionsAttempted
  topicProgress.lastAttemptAt = new Date().toISOString()

  // Check for mastery (avg > 85% over 3+ sessions)
  if (
    topicProgress.sessionsAttempted >= 3 &&
    topicProgress.averageScore > 85 &&
    !topicProgress.mastered
  ) {
    topicProgress.mastered = true
    topicProgress.masteredAt = new Date().toISOString()
    // Award XP for mastery
    progress.xp.breakdown.masteries += 200
    progress.xp.total += 200
  }

  // Award XP for quiz completion
  const xpReward = Math.max(10, Math.round(correct * 5))
  progress.xp.breakdown.quizzes += xpReward
  progress.xp.total += xpReward

  // Update weekly/monthly XP
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  if (new Date(session.timestamp) > weekAgo) {
    progress.xp.thisWeek += xpReward
  }
  if (new Date(session.timestamp) > monthAgo) {
    progress.xp.thisMonth += xpReward
  }

  // Update streak
  const today = now.toISOString().slice(0, 10)
  const lastActive = progress.streaks.lastActiveDay

  if (lastActive !== today) {
    const lastDate = new Date(lastActive)
    const todayDate = new Date(today)
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    )

    if (daysDiff === 1) {
      // Consecutive day
      progress.streaks.currentStreak += 1
    } else if (daysDiff > 1) {
      // Streak broken
      progress.streaks.currentStreak = 1
    }

    progress.streaks.lastActiveDay = today
    progress.streaks.totalDaysActive += 1
    progress.streaks.longestStreak = Math.max(
      progress.streaks.longestStreak,
      progress.streaks.currentStreak
    )

    // Award streak XP
    if (progress.streaks.currentStreak > 1) {
      const streakBonus = Math.min(50, progress.streaks.currentStreak * 10)
      progress.xp.breakdown.streaks += streakBonus
      progress.xp.total += streakBonus
    }
  }

  // Add session
  progress.quizSessions.push(session)

  // Keep only last 100 sessions
  if (progress.quizSessions.length > 100) {
    progress.quizSessions = progress.quizSessions.slice(-100)
  }

  queueProgressSave(progress)
  return progress
}

export function saveCanvasNotes(progress: UserProgress, topic: string, notes: string): UserProgress {
  progress.canvasNotes[topic] = notes
  queueProgressSave(progress)
  return progress
}
