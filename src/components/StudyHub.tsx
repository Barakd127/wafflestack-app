import { useEffect, useState } from 'react'
import { Home, Map, BookOpen, Trophy, Settings, Bell, User, Network } from 'lucide-react'
import { LessonTopicId } from './LessonPage'
import { useLearningStore } from '../store/learningStore'
import type { Achievement } from '../store/learningStore'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
  darkMode: boolean
  onOpenLesson: (id: LessonTopicId) => void
}

const TOPIC_CARDS: { id: LessonTopicId; hebrewTitle: string; emoji: string; color: string; building: string }[] = [
  { id: 'mean', hebrewTitle: 'ממוצע', emoji: '🏪', color: 'from-amber-500 to-yellow-600', building: 'שוק העיר' },
  { id: 'median', hebrewTitle: 'חציון', emoji: '📚', color: 'from-teal-500 to-cyan-600', building: 'ספריית העיר' },
  { id: 'standard-deviation', hebrewTitle: 'סטיית תקן', emoji: '🌤️', color: 'from-blue-500 to-indigo-600', building: 'מגדל מזג האוויר' },
  { id: 'probability', hebrewTitle: 'הסתברות', emoji: '🎰', color: 'from-purple-500 to-pink-600', building: 'קזינו ואולם אירועים' },
  { id: 'sampling', hebrewTitle: 'דגימה', emoji: '📊', color: 'from-green-500 to-emerald-600', building: 'מרכז הסקרים' },
]

const StudyHub = ({ onViewChange, darkMode: _darkMode, onOpenLesson }: StudyHubProps) => {
  const { currentStreak, longestStreak, dailyChallengeDate, dailyChallengeProgress, getDailyChallenge, recordDailyChallengeAnswer, newAchievements, clearNewAchievements } = useLearningStore()
  const todayStr = new Date().toISOString().slice(0, 10)
  const isChallengeDay = dailyChallengeDate === todayStr
  const challengeProgress = isChallengeDay ? dailyChallengeProgress : 0
  const dailyQuestions = getDailyChallenge()
  const challengeDone = challengeProgress >= 3

  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    if (newAchievements.length > 0) {
      setToastAchievement(newAchievements[0])
      const t = setTimeout(() => {
        setToastAchievement(null)
        clearNewAchievements()
      }, 3500)
      return () => clearTimeout(t)
    }
  }, [newAchievements])

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'דף הבית', color: 'text-cyan-400' },
    { id: 'mindmap', icon: Network, label: 'מפת חשיבה', onClick: () => onViewChange('mindmap') },
    { id: 'progress', icon: Map, label: 'אזור למידה' },
    { id: 'achievements', icon: Trophy, label: 'העולם שלי', onClick: () => onViewChange('3d') },
  ]

  return (
    <div className="w-full h-full flex dark:bg-[#0f0f14]" dir="rtl">
      {/* Right Sidebar - Navigation */}
      <div className="w-64 h-full backdrop-blur-2xl bg-gradient-to-b from-indigo-900/95 to-indigo-950/95 dark:from-[#0f0f20]/95 dark:to-[#0a0a18]/95 border-l border-white/10 shadow-2xl flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">לומו</div>
            <div className="text-xs text-cyan-400 font-semibold">אזור הלמידה שלך</div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Hi, Bdakar</div>
              <div className="text-white/50 text-xs">Level 5</div>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === 'home'

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 relative group text-right ${isActive ? 'bg-cyan-500/20' : 'hover:bg-white/5'}`}
              >
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l" />}
                <Icon size={20} className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-white/60 group-hover:text-white'}`} />
                <span className={`text-sm transition-colors ${isActive ? 'text-cyan-400 font-medium' : 'text-white/80 group-hover:text-white'}`}>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-white/10 p-2 space-y-1">
          <button className="w-full px-4 py-2 rounded-xl flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Bell size={18} />
            <span className="text-sm">התראות</span>
          </button>
          <button className="w-full px-4 py-2 rounded-xl flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={18} />
            <span className="text-sm">הגדרות</span>
          </button>
        </div>
      </div>

      {/* Main Content - Bento Grid */}
      <div className="flex-1 h-full overflow-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f0f14] dark:to-[#1a1a2e]">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">דף הבית</h1>
            <div className="flex items-center gap-3">
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full" title={`שיא אישי: ${longestStreak} ימים`}>
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
                  <span className="text-xs text-orange-500 dark:text-orange-500">יום</span>
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">Hi, Bdakar</span>
              <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-700 dark:text-gray-300"><User size={20} /></button>
              <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-700 dark:text-gray-300"><Bell size={20} /></button>
              <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-700 dark:text-gray-300"><Settings size={20} /></button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Large Card - Left: Building Progress */}
            <div className="col-span-5 row-span-2 backdrop-blur-2xl bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">כמעט שם!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">נשארו רק עוד 2 שאלות בקורס סטטיסטיקה תיאורית!</p>
                </div>
              </div>
              <div className="relative h-48 flex items-center justify-center my-4">
                <div className="w-40 h-40 bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/50 dark:to-amber-800/50 rounded-2xl transform rotate-3 shadow-lg flex items-center justify-center">
                  <div className="text-6xl">🏛️</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">התקדמות</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">האם הגעת?</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
                המשך ←
              </button>
            </div>

            {/* Welcome Card */}
            <div className="col-span-7 backdrop-blur-2xl bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">לוח לבן דיגיטלי</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                היי ברק, היום אנחנו הולכים לכבוש את 'סטטיה החציון' ולפתוח את מגדל השעון של האוכלוסייה!
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">טיפ</div>
            </div>

            {/* Statistics Formulas */}
            <div className="col-span-4 backdrop-blur-2xl bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">ממוצע (ממוצע) [V]</h3>
              <div className="space-y-3 text-right">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-mono">חציון ושכיח (ממוצע)</span>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-mono">סטיית תקן (קירוב)</span>
                </div>
              </div>
            </div>

            {/* 3D World Preview */}
            <div
              className="col-span-3 backdrop-blur-2xl bg-gradient-to-br from-indigo-500/90 to-purple-600/90 border border-white/50 dark:border-white/10 rounded-3xl p-0 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewChange('3d')}
            >
              <div className="relative h-full w-full">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23667eea' width='100' height='100'/%3E%3C/svg%3E"
                  alt="3D World"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Trophy size={48} className="mx-auto mb-2" />
                    <div className="font-bold">העולם שלי</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="col-span-3 backdrop-blur-2xl bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-slate-600" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="88" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">35%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mind Map Preview */}
            <div
              className="col-span-4 backdrop-blur-2xl bg-gradient-to-br from-purple-500/90 to-pink-500/90 border border-white/50 dark:border-white/10 rounded-3xl p-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewChange('mindmap')}
            >
              <div className="relative h-full w-full p-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <Map size={48} className="mx-auto mb-2" />
                  <div className="font-bold text-lg">מפת מושגים</div>
                  <div className="text-sm opacity-80 mt-1">חקור את כל הנושאים</div>
                </div>
              </div>
            </div>

            {/* Daily Challenge */}
            <div className="col-span-12 backdrop-blur-2xl bg-gradient-to-br from-amber-500/90 to-orange-600/90 border border-white/20 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">🏆 אתגר יומי</h3>
                  <p className="text-sm text-white/80 mt-0.5">3 שאלות × 2× XP — מתאפס בחצות</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{challengeProgress}/3</div>
                  {challengeDone && <div className="text-xs text-white/80 mt-0.5">✓ הושלם היום!</div>}
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(challengeProgress / 3) * 100}%` }}
                />
              </div>
              {/* Questions */}
              {!challengeDone ? (
                <div className="space-y-2">
                  {dailyQuestions.map((q, idx) => {
                    const done = idx < challengeProgress
                    const isCurrent = idx === challengeProgress
                    return (
                      <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? 'bg-white/10 opacity-60' : isCurrent ? 'bg-white/20 ring-2 ring-white/50' : 'bg-white/10 opacity-40'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-400 text-white' : 'bg-white/30 text-white'}`}>
                          {done ? '✓' : idx + 1}
                        </div>
                        <span className="text-white text-sm flex-1 text-right line-clamp-1">{q.text}</span>
                        {isCurrent && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => recordDailyChallengeAnswer(q.id, 5)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-400 text-white text-xs rounded-lg transition-all"
                            >✓</button>
                            <button
                              onClick={() => recordDailyChallengeAnswer(q.id, 1)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-all"
                            >✗</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-white font-bold">השלמת את האתגר היומי!</div>
                  <div className="text-white/70 text-sm mt-1">חזור מחר לאתגר חדש</div>
                </div>
              )}
            </div>

            {/* Learning Area — 5 lesson topic cards */}
            <div className="col-span-12 backdrop-blur-2xl bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">אזור למידה</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">לחצו על נושא כדי לפתוח את שיעור הלמידה</p>
              <div className="grid grid-cols-5 gap-3">
                {TOPIC_CARDS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => onOpenLesson(topic.id)}
                    className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer overflow-hidden bg-gradient-to-br ${topic.color}`}
                  >
                    <span className="text-3xl">{topic.emoji}</span>
                    <div className="text-center">
                      <div className="font-bold text-white text-sm">{topic.hebrewTitle}</div>
                      <div className="text-white/70 text-xs mt-0.5">{topic.building}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Achievement badge toast */}
      {toastAchievement && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl border border-white/20 text-white">
          <span className="text-2xl">{toastAchievement.icon}</span>
          <div>
            <div className="text-xs font-semibold text-white/70">🎉 הישג חדש!</div>
            <div className="font-bold text-sm">{toastAchievement.title}</div>
            <div className="text-xs text-white/70">{toastAchievement.description}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyHub
