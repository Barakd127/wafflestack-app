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
import { useLearningStore } from './store/learningStore'

function App() {
  const onboardingCompleted = useLearningStore(s => s.onboardingCompleted)
  // Per spec: skip onboarding if userName already set (either via localStorage key or Zustand store)
  const hasUserName = Boolean(localStorage.getItem('userName') || onboardingCompleted)
  const [activeView, setActiveView] = useState<'onboarding' | 'study' | 'mindmap' | 'city' | 'townscaper' | 'citymode' | 'colortest' | 'wafflecity' | 'mission' | 'landing' | 'lesson'>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#view-highcity') return 'city'
    if (h === '#view-townscaper') return 'townscaper'
    if (h === '#view-citymode') return 'citymode'
    if (h === '#view-wafflecity') return 'wafflecity'
    if (h === '#study') return 'study'
    // Always land on landing page (not mid-city hashes like #city/#topics)
    return hasUserName ? 'landing' : 'onboarding'
  })
  const [lessonTopic, setLessonTopic] = useState<LessonTopicId>('mean')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('wafflestack-dark-mode') === 'true'
  })
  // Track which view opened the mind map, so the close button returns correctly
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

  // Hash-based deep linking: navigate to correct view on load
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#city' || hash === '#topics' || hash === '#score' || hash.startsWith('#challenge/')) {
      setActiveView('wafflecity')
    } else if (hash === '#landing') setActiveView('landing')
    else if (hash === '#study') setActiveView('study')
    else if (hash === '#view-highcity') setActiveView('city')
    else if (hash === '#view-townscaper') setActiveView('townscaper')
    else if (hash === '#view-citymode') setActiveView('citymode')
    else if (hash === '#view-wafflecity') setActiveView('wafflecity')
  }, [])

  // Update hash when top-level view changes (WaffleStackCity manages its own sub-hashes)
  useEffect(() => {
    if (activeView === 'landing') window.location.hash = ''  // clear city sub-hashes on landing
    else if (activeView === 'wafflecity') { /* WaffleStackCity owns hash in this view */ }
    else if (activeView === 'study') window.location.hash = '#study'
    else if (activeView === 'mindmap') window.location.hash = '#mindmap'
  }, [activeView])

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-[#0f0f14] dark:via-[#1a1a2e] dark:to-[#0f0f14]">
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
        {activeView === 'study' && (
          <StudyHub
            onViewChange={(v) => {
              if (v === 'mindmap') openMindMap('study')
              else if (v === '3d') setActiveView('wafflecity')
              else setActiveView(v)
            }}
            darkMode={darkMode}
            onOpenLesson={(id) => { setLessonTopic(id); setActiveView('lesson') }}
          />
        )}

        {activeView === 'lesson' && (
          <LessonPage
            topicId={lessonTopic}
            onBack={() => setActiveView('study')}
            onStartQuiz={() => setActiveView('wafflecity')}
          />
        )}

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

        {activeView === 'city' && (
          <div className="w-full h-full relative">
            <HighEndCity />
            {/* Navigation */}
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
            {/* Navigation */}
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('citymode')}
                className="px-4 py-2 backdrop-blur-xl bg-green-500/80 border border-green-400/50 rounded-xl text-white hover:bg-green-600/80 transition-all"
              >
                🏙️ City Mode
              </button>
              <button
                onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all"
              >
                🏛️ 3D City
              </button>
            </div>
          </div>
        )}

        {activeView === 'citymode' && (
          <div className="w-full h-full relative">
            <CityModeScene />
            {/* Navigation */}
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('townscaper')}
                className="px-4 py-2 backdrop-blur-xl bg-pink-500/80 border border-pink-400/50 rounded-xl text-white hover:bg-pink-600/80 transition-all"
              >
                🏘️ Townscaper
              </button>
              <button
                onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all"
              >
                🏛️ 3D City
              </button>
              <button
                onClick={() => setActiveView('study')}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                📚 Study
              </button>
            </div>
          </div>
        )}

        {activeView === 'colortest' && (
          <div className="w-full h-full relative">
            <ModelColorTest />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('wafflecity')}
                className="px-4 py-2 backdrop-blur-xl bg-green-500/80 border border-green-400/50 rounded-xl text-white hover:bg-green-600/80 transition-all"
              >
                🏙️ WaffleStack City
              </button>
            </div>
          </div>
        )}

        {activeView === 'wafflecity' && (
          <div className="w-full h-full relative">
            <WaffleStackCity onBack={() => setActiveView('landing')} />
            {/* Mind Map button — bottom-right, away from WaffleStackCity's top HUD */}
            <div className="absolute bottom-6 right-6 z-50 pointer-events-auto">
              <button
                onClick={() => openMindMap('wafflecity')}
                style={{
                  background: 'rgba(109,40,217,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(167,139,250,0.5)',
                  borderRadius: 20,
                  padding: '8px 18px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
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
        <OnboardingFlow onComplete={() => setActiveView('landing')} />
      )}
    </div>
  )
}

export default App
