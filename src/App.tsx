import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import StudyHub from './components/StudyHub'
import MindMapCanvas from './components/MindMapCanvas'
// Godot 3D city replaces the React-Three-Fiber WaffleStackCity. The iframe
// (/godot/index.html in public/godot/) shares localStorage with the host app,
// so progress (XP / coins / mastered) stays in sync without a postMessage bridge.
import WaffleStackCity from './components/WaffleStackCityGodot'
import MissionControl from './components/MissionControl'
import OnboardingFlow from './components/OnboardingFlow'
import SplitLayout from './components/SplitLayout'

type View = 'onboarding' | 'study' | 'mindmap' | 'wafflecity' | 'mission' | 'split' | 'split-mindmap'

function App() {
  const [activeView, setActiveView] = useState<View>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#view-wafflecity' || h === '#city' || h === '#topics' || h === '#score' || h.startsWith('#challenge/')) return 'wafflecity'
    if (h === '#study') return 'study'
    if (h === '#split') return 'split'
    if (h === '#split-mindmap') return 'split-mindmap'
    if (h === '#mindmap') return 'mindmap'
    return 'study'
  })
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
    if (activeView === 'study') window.location.hash = ''
    else if (activeView === 'split') window.location.hash = '#split'
    else if (activeView === 'split-mindmap') window.location.hash = '#split-mindmap'
    else if (activeView === 'wafflecity') { /* WaffleStackCity owns hash in this view */ }
    else if (activeView === 'mindmap') window.location.hash = '#mindmap'
  }, [activeView])

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 dark:from-[#0f0f14] dark:via-[#1a1a2e] dark:to-[#0f0f14]">
      <button
        onClick={() => setDarkMode(d => !d)}
        className="fixed top-4 left-4 z-[200] p-2.5 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all shadow-lg"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-10 w-full h-full">
        {activeView === 'study' && (
          <div className="relative w-full h-full">
            <StudyHub
              onViewChange={(v) => {
                if (v === 'mindmap') openMindMap('study')
                else if (v === '3d') setActiveView('wafflecity')
                else setActiveView(v as View)
              }}
              darkMode={darkMode}
            />
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

        {activeView === 'split' && (
          <SplitLayout
            onBack={() => setActiveView('study')}
            darkMode={darkMode}
            initialRight="study"
          />
        )}

        {activeView === 'split-mindmap' && (
          <SplitLayout
            onBack={() => setActiveView('mindmap')}
            darkMode={darkMode}
            initialRight="mindmap"
          />
        )}

        {activeView === 'mindmap' && (
          <div className="relative w-full h-full">
            <MindMapCanvas
              onViewChange={(v) => {
                if (v === 'study') setActiveView(mindmapFrom as View)
                else if (v === '3d') setActiveView('wafflecity')
                else setActiveView(v as View)
              }}
              darkMode={darkMode}
            />
            {/* Split-screen with city button — bottom-right */}
            <button
              onClick={() => setActiveView('split-mindmap')}
              style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
                background: 'rgba(51,81,202,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99,162,255,0.55)',
                borderRadius: 20, padding: '9px 18px',
                color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(51,81,202,0.45)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              ⊟ עיר + Mind Map
            </button>
          </div>
        )}

        {activeView === 'wafflecity' && (
          <div className="w-full h-full relative">
            <WaffleStackCity onBack={() => setActiveView('study')} />
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
            <MissionControl onViewChange={(v) => setActiveView(v as View)} />
          </div>
        )}
      </div>

      {activeView === 'onboarding' && (
        <OnboardingFlow onComplete={() => setActiveView('study')} />
      )}
    </div>
  )
}

export default App
