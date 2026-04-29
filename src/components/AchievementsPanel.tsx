/**
 * AchievementsPanel — milestone badges derived from existing localStorage.
 * Pure component. Renders a grid of unlocked + in-progress badges.
 * No store wiring, no new persisted keys: reads xp / mastered / streak / per-building accuracy.
 */

const BUILDING_IDS = [
  'power', 'housing', 'traffic', 'hospital', 'school',
  'bank', 'market', 'city-hall', 'research', 'news',
] as const

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number       // 0..1
  progressLabel: string  // "3 / 5"
}

interface Props {
  xp: number
  mastered: Set<string>
}

function loadStreak(): number {
  const raw = parseInt(localStorage.getItem('wafflestack-streak') || '0')
  return Number.isFinite(raw) ? raw : 0
}

function loadLongestStreak(currentStreak: number): number {
  const raw = parseInt(localStorage.getItem('wafflestack-longest-streak') || '0')
  const stored = Number.isFinite(raw) ? raw : 0
  return Math.max(stored, currentStreak)
}

function loadStudiedToday(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return localStorage.getItem('wafflestack-last-study') === today
}

function countPerfectBuildings(): number {
  let perfect = 0
  for (const id of BUILDING_IDS) {
    const score = parseInt(localStorage.getItem(`wafflestack-score-${id}`) || '-1')
    const total = parseInt(localStorage.getItem(`wafflestack-total-${id}`) || '-1')
    if (Number.isFinite(score) && Number.isFinite(total) && total > 0 && score === total) {
      perfect++
    }
  }
  return perfect
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function buildAchievements(xp: number, masteredCount: number): Achievement[] {
  const streak = loadStreak()
  const longestStreak = loadLongestStreak(streak)
  const studiedToday = loadStudiedToday()
  const perfectCount = countPerfectBuildings()

  const milestones: Array<Omit<Achievement, 'unlocked' | 'progress' | 'progressLabel'> & {
    current: number; threshold: number;
  }> = [
    { id: 'first_building',  title: 'First Step',     description: 'Master your first building',         icon: '⭐',  current: masteredCount,  threshold: 1 },
    { id: 'three_buildings', title: 'City Architect', description: 'Master 3 buildings',                 icon: '🏛️', current: masteredCount,  threshold: 3 },
    { id: 'five_buildings',  title: 'Master Planner', description: 'Master 5 buildings',                 icon: '🏆',  current: masteredCount,  threshold: 5 },
    { id: 'all_buildings',   title: 'Urban Legend',   description: 'Master all 10 buildings',            icon: '🌆',  current: masteredCount,  threshold: 10 },
    { id: 'xp_100',          title: 'Century',        description: 'Earn 100 XP',                        icon: '💯',  current: xp,             threshold: 100 },
    { id: 'xp_500',          title: 'Scholar',        description: 'Earn 500 XP',                        icon: '🎓',  current: xp,             threshold: 500 },
    { id: 'xp_1000',         title: 'XP Champion',    description: 'Earn 1,000 XP',                      icon: '👑',  current: xp,             threshold: 1000 },
    { id: 'streak_3',        title: 'Streak Starter', description: 'Study 3 days in a row',              icon: '🔥',  current: longestStreak,  threshold: 3 },
    { id: 'streak_7',        title: 'Streak Pro',     description: 'Study 7 days in a row',              icon: '⚡',  current: longestStreak,  threshold: 7 },
    { id: 'streak_14',       title: 'Streak Legend',  description: 'Study 14 days in a row',             icon: '💎',  current: longestStreak,  threshold: 14 },
    { id: 'sharpshooter',    title: 'Sharpshooter',   description: 'Get a perfect quiz on any building', icon: '🎯',  current: perfectCount,   threshold: 1 },
    { id: 'studied_today',   title: 'Daily Devotee',  description: 'Studied today',                      icon: '📅',  current: studiedToday ? 1 : 0, threshold: 1 },
  ]

  return milestones.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    icon: m.icon,
    unlocked: m.current >= m.threshold,
    progress: clamp01(m.current / m.threshold),
    progressLabel: m.threshold > 1 && m.current < m.threshold
      ? `${Math.min(m.current, m.threshold).toLocaleString()} / ${m.threshold.toLocaleString()}`
      : '',
  }))
}

export default function AchievementsPanel({ xp, mastered }: Props) {
  const achievements = buildAchievements(xp, mastered.size)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🏅 Achievements
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: unlockedCount > 0 ? '#FFD700' : 'rgba(255,255,255,0.3)',
          fontVariantNumeric: 'tabular-nums',
          background: unlockedCount > 0 ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${unlockedCount > 0 ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
          padding: '2px 8px', borderRadius: 999,
        }}>
          {unlockedCount} / {achievements.length}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
      }}>
        {achievements.map(a => (
          <div
            key={a.id}
            title={`${a.title} — ${a.description}${a.progressLabel ? `  (${a.progressLabel})` : ''}`}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px 10px',
              borderRadius: 10,
              background: a.unlocked
                ? 'linear-gradient(160deg, rgba(255,215,0,0.14) 0%, rgba(78,205,196,0.08) 100%)'
                : 'rgba(255,255,255,0.025)',
              border: `1px solid ${a.unlocked ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: a.unlocked ? '0 0 12px rgba(255,215,0,0.12)' : 'none',
              opacity: a.unlocked ? 1 : 0.7,
              transition: 'all 0.2s',
              overflow: 'hidden',
            }}
          >
            <span style={{
              fontSize: 22,
              filter: a.unlocked ? 'none' : 'grayscale(0.85) brightness(0.7)',
              lineHeight: 1.1,
            }}>
              {a.icon}
            </span>
            <span style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: 700,
              color: a.unlocked ? '#fff' : 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {a.title}
            </span>
            {!a.unlocked && a.progressLabel && (
              <span style={{
                marginTop: 3,
                fontSize: 9,
                color: 'rgba(255,255,255,0.4)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {a.progressLabel}
              </span>
            )}
            {!a.unlocked && a.progress > 0 && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 2,
                background: 'rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${a.progress * 100}%`,
                  background: '#4ECDC4',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
