import { Home, Map, BookOpen, Trophy, Settings, Bell, User } from 'lucide-react'

interface StudyHubProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
}

const StudyHub = ({ onViewChange }: StudyHubProps) => {
  const sidebarItems = [
    { id: 'home', icon: Home, label: 'דף הבית', color: 'text-cyan-400' },
    { id: 'study', icon: BookOpen, label: 'מפת לימוד', onClick: () => onViewChange('mindmap') },
    { id: 'progress', icon: Map, label: 'אזור למידה' },
    { id: 'achievements', icon: Trophy, label: 'העולם שלי', onClick: () => onViewChange('3d') },
  ]

  return (
    <div className="w-full h-full flex" dir="rtl">
      {/* Right Sidebar - Navigation */}
      <div className="w-64 h-full backdrop-blur-2xl bg-gradient-to-b from-indigo-900/95 to-indigo-950/95 border-l border-white/10 shadow-2xl flex flex-col">
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
      <div className="flex-1 h-full overflow-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">דף הבית</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hi, Bdakar</span>
              <button className="p-2 hover:bg-white rounded-lg transition-all"><User size={20} /></button>
              <button className="p-2 hover:bg-white rounded-lg transition-all"><Bell size={20} /></button>
              <button className="p-2 hover:bg-white rounded-lg transition-all"><Settings size={20} /></button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Large Card - Left: 3D Building Progress */}
            <div className="col-span-5 row-span-2 backdrop-blur-2xl bg-white/90 border border-white/50 rounded-3xl p-6 shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">כמעט שם!</h3>
                  <p className="text-sm text-gray-600">נשארו רק עוד 2 שאלות בקורס סטטיסטיקה תיאורית!</p>
                </div>
              </div>
              <div className="relative h-48 flex items-center justify-center my-4">
                <div className="w-40 h-40 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-2xl transform rotate-3 shadow-lg flex items-center justify-center">
                  <div className="text-6xl">🏛️</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">התקדמות</span>
                  <span className="font-semibold text-indigo-600">האם הגעת?</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
                המשך ←
              </button>
            </div>

            {/* Large Card - Right Top: Welcome Card */}
            <div className="col-span-7 backdrop-blur-2xl bg-white/90 border border-white/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">לוח לבן דיגיטלי</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                היי ברק, היום אנחנו הולכים לכבוש את 'סטטיה החציון' ולפתוח את מגדל השעון של האוכלוסייה!
              </p>
              <div className="mt-4 text-sm text-gray-500">טיפ</div>
            </div>

            {/* Medium Card - Statistics Formulas */}
            <div className="col-span-4 backdrop-blur-2xl bg-white/90 border border-white/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ממוצע (ממוצע) [V]</h3>
              <div className="space-y-3 text-right">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <span className="text-gray-700 font-mono">חציון ושכיח (ממוצע)</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <span className="text-gray-700 font-mono">סטיית תקן (קירוב)</span>
                </div>
              </div>
            </div>

            {/* Medium Card - 3D World Preview */}
            <div className="col-span-3 backdrop-blur-2xl bg-gradient-to-br from-indigo-500/90 to-purple-600/90 border border-white/50 rounded-3xl p-0 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all" onClick={() => onViewChange('3d')}>
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

            {/* Small Card - Progress Chart */}
            <div className="col-span-3 backdrop-blur-2xl bg-white/90 border border-white/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="88" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">35%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Card - Mind Map Preview */}
            <div className="col-span-4 backdrop-blur-2xl bg-gradient-to-br from-purple-500/90 to-pink-500/90 border border-white/50 rounded-3xl p-0 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all" onClick={() => onViewChange('mindmap')}>
              <div className="relative h-full w-full p-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <Map size={48} className="mx-auto mb-2" />
                  <div className="font-bold text-lg">מפת מושגים</div>
                  <div className="text-sm opacity-80 mt-1">חקור את כל הנושאים</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyHub
