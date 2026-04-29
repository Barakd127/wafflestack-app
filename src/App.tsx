import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import StudyHub from './components/StudyHub'
import MindMapCanvas from './components/MindMapCanvas'
import HighEndCity from './components/HighEndCity'
import TownscaperScene from './components/TownscaperScene'
import CityModeScene from './components/CityModeScene'
import ModelColorTest from './components/ModelColorTest'
import WaffleStackCity from './components/WaffleStackCity'
import MissionControl from './components/MissionControl'
import LandingPage from './components/LandingPage'
import OnboardingFlow from './components/OnboardingFlow'
import LessonPage, { LessonTopicId } from './components/LessonPage'
import SplitLayout from './components/SplitLayout'
import { useLearningStore } from './store/learningStore'

function App() {
  const onboardingCompleted = useLearningStore(s => s.onboardingCompleted)
  const hasUserName = Boolean(localStorage.getItem('userName') || onboardingCompleted)
  const [activeView, setActiveView] = useState<
    'onboarding' | 'study' | 'mindmap' | 'city' | 'townscaper' | 'citymode' |
    'colortest' | 'wafflecity' | 'mission' | 'landing' | 'lesson' | 'split'
  >(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#view-highcity') return 'city'
    if (h === '#view-townscaper') return 'townscaper'
    if (h === '#view-citymode') return 'citymode'
    if (h === '#view-wafflecity') return 'wafflecity'
    if (h === '#study') return 'study'
    if (h === '#split') return 'split'
    return hasUserName ? 'study' : 'onboarding'
  })
  const [lessonTopic, setLessonTopic] = useState<LessonTopicId>('mean')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('wafflestack-dark-mode')
    return stored !== null ? stored === 'true' : true
  })
  const [mindmapFrom, setMindmapFrom] = useState<string>('study')

  const openMindMap = (from: string) => {
    setMindmapFrom(from)
    setActiveView('mindmap')
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('wafflestack-dark-mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#city' || hash === '#topics' || hash === '#score' || hash.startsWith('#challenge/')) {
      setActiveView('wafflecity')
    } else if (hash === '#landing') setActiveView('landing')
    else if (hash === '#study') setActiveView('study')
    else if (hash === '#split') setActiveView('split')
    else if (hash === '#view-highcity') setActiveView('city')
    else if (hash === '#view-townscaper') setActiveView('townscaper')
    else if (hash === '#view-citymode') setActiveView('citymode')
    else if (hash === '#view-wafflecity') setActiveView('wafflecity')
  }, [])

  useEffect(() => {
    if (activeView === 'study') window.location.hash = ''
    else if (activeView === 'landing') window.location.hash = ''
    else if (activeView === 'split') window.location.hash = '#split'
    else if (activeView === 'wafflecity') { /* WaffleStackCity owns hash in this view */ }
    else if (activeView === 'mindmap') window.location.hash = '#mindmap'
  }, [activeView])

  const goToLesson = (id: LessonTopicId) => { setLessonTopic(id); setActiveView('lesson') }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 dark:from-[#0f0f14] dark:via-[#1a1a2e] dark:to-[#0f0f14]">
      {/* Dark mode toggle — always visible, fixed */}
      <button
        onClick={() => setDarkMode(d => !d)}
        className="fixed top-4 left-4 z-[200] p-2.5 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all shadow-lg"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">

        {/* ── Study Hub ─────────────────────────────────────────────────────── */}
        {activeView === 'study' && (
          <div className="relative w-full h-full">
            <StudyHub
              onViewChange={(v) => {
                if (v === 'mindmap') openMindMap('study')
                else if (v === '3d') setActiveView('wafflecity')
                else setActiveView(v as Parameters<typeof setActiveView>[0])
              }}
              darkMode={darkMode}
              onOpenLesson={goToLesson}
            />
            {/* Split-screen shortcut button — bottom-left corner */}
            <button
              onClick={() => setActiveView('split')}
              style={{
                position: 'fixed', bottom: 24, left: 72, zIndex: 200,
                background: 'rgba(51,81,202,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99,162,255,0.5)',
                borderRadius: 20, padding: '8px 18px',
                color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(51,81,202,0.4)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              ⊟ עיר + לימוד
            </button>
          </div>
        )}

        {/* ── Split Layout (City + Study side by side) ──────────────────────── */}
        {activeView === 'split' && (
          <SplitLayout
            onBack={() => setActiveView('study')}
            onOpenLesson={goToLesson}
            darkMode={darkMode}
          />
        )}

        {/* ── Lesson Page ───────────────────────────────────────────────────── */}
        {activeView === 'lesson' && (
          <LessonPage
            topicId={lessonTopic}
            onBack={() => setActiveView('study')}
            onStartQuiz={() => setActiveView('wafflecity')}
          />
        )}

        {/* ── Mind Map Canvas ───────────────────────────────────────────────── */}
        {activeView === 'mindmap' && (
          <MindMapCanvas
            onViewChange={(v) => {
              if (v === 'study') setActiveView(mindmapFrom as Parameters<typeof setActiveView>[0])
              else if (v === '3d') setActiveView('wafflecity')
              else setActiveView(v)
            }}
            darkMode={darkMode}
          />
        )}

        {/* ── 3D City views ─────────────────────────────────────────────────── */}
        {activeView === 'city' && (
          <div className="w-full h-full relative">
            <HighEndCity />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('townscaper')}
                className="px-4 py-2 backdrop-blur-xl bg-pink-500/80 border border-pink-400/50 rounded-xl text-white hover:bg-pink-600/80 transition-all"
              >
                🏘️ Townscaper
              </button>
            </div>
          </div>
        )}

        {activeView === 'townscaper' && (
          <div className="w-full h-full relative">
            <TownscaperScene />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button onClick={() => setActiveView('citymode')}
                className="px-4 py-2 backdrop-blur-xl bg-green-500/80 border border-green-400/50 rounded-xl text-white hover:bg-green-600/80 transition-all">
                🏙️ City Mode
              </button>
              <button onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all">
                🏛️ 3D City
              </button>
            </div>
          </div>
        )}

        {activeView === 'citymode' && (
          <div className="w-full h-full relative">
            <CityModeScene />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button onClick={() => setActiveView('townscaper')}
                className="px-4 py-2 backdrop-blur-xl bg-pink-500/80 border border-pink-400/50 rounded-xl text-white hover:bg-pink-600/80 transition-all">
                🏘️ Townscaper
              </button>
              <button onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all">
                🏛️ 3D City
              </button>
              <button onClick={() => setActiveView('study')}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
                📚 Study
              </button>
            </div>
          </div>
        )}

        {activeView === 'colortest' && (
          <div className="w-full h-full relative">
            <ModelColorTest />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button onClick={() => setActiveView('wafflecity')}
                className="px-4 py-2 backdrop-blur-xl bg-green-500/80 border border-green-400/50 rounded-xl text-white hover:bg-green-600/80 transition-all">
                🏙️ WaffleStack City
              </button>
            </div>
          </div>
        )}

        {/* ── Waffle City ───────────────────────────────────────────────────── */}
        {activeView === 'wafflecity' && (
          <div className="w-full h-full relative">
            <WaffleStackCity onBack={() => setActiveView('study')} />
            {/* Bottom-right action buttons */}
            <div className="absolute bottom-6 right-6 z-50 pointer-events-auto flex gap-2">
              <button
                onClick={() => setActiveView('split')}
                style={{
                  background: 'rgba(51,81,202,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99,162,255,0.5)',
                  borderRadius: 20, padding: '8px 18px',
                  color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(51,81,202,0.4)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                ⊟ מסך מפוצל
              </button>
              <button
                onClick={() => openMindMap('wafflecity')}
                style={{
                  background: 'rgba(109,40,217,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(167,139,250,0.5)',
                  borderRadius: 20, padding: '8px 18px',
                  color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                🧠 Mind Map
              </button>
            </div>
          </div>
        )}

        {activeView === 'mission' && (
          <div className="w-full h-full">
            <MissionControl onViewChange={(v) => setActiveView(v as Parameters<typeof setActiveView>[0])} />
          </div>
        )}

        {activeView === 'landing' && (
          <div className="w-full h-full">
            <LandingPage
              onEnterCity={() => setActiveView('wafflecity')}
              onOpenStudy={() => setActiveView('study')}
            />
          </div>
        )}
      </div>

      {/* Onboarding overlay — rendered on top of everything */}
      {activeView === 'onboarding' && (
        <OnboardingFlow onComplete={() => setActiveView('study')} />
      )}
    </div>
  )
}

export default App
