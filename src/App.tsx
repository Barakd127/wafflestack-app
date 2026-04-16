import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import StudyHub from './components/StudyHub'
import MindMapCanvas from './components/MindMapCanvas'
import GameScene from './components/GameScene'
import UIOverlay from './components/UIOverlay'
import BottomDock from './components/BottomDock'
import TerrainDemo from './components/TerrainDemo'
import HighEndCity from './components/HighEndCity'
import TownscaperScene from './components/TownscaperScene'
import CityModeScene from './components/CityModeScene'
import ModelColorTest from './components/ModelColorTest'
import WaffleStackCity from './components/WaffleStackCity'
import MissionControl from './components/MissionControl'
import LandingPage from './components/LandingPage'
import OnboardingFlow from './components/OnboardingFlow'
import { useLearningStore } from './store/learningStore'

function App() {
  const onboardingCompleted = useLearningStore(s => s.onboardingCompleted)
  const [activeView, setActiveView] = useState<'onboarding' | 'study' | 'mindmap' | '3d' | 'terrain' | 'city' | 'townscaper' | 'citymode' | 'colortest' | 'wafflecity' | 'mission' | 'landing'>(() =>
    onboardingCompleted ? 'landing' : 'onboarding'
  )
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('wafflestack-dark-mode') === 'true'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('wafflestack-dark-mode', String(darkMode))
  }, [darkMode])

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
          <>
            {/* Background 3D Scene - Ambient background for study view */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <GameScene />
            </div>
            <StudyHub onViewChange={setActiveView} darkMode={darkMode} />
          </>
        )}

        {activeView === 'mindmap' && <MindMapCanvas onViewChange={setActiveView} darkMode={darkMode} />}

        {activeView === '3d' && (
          <div className="w-full h-full relative">
            {/* Full 3D Scene */}
            <GameScene />

            {/* UI Overlay - Top navigation and side panels */}
            <UIOverlay />

            {/* Bottom Dock - Block selection tools */}
            <BottomDock />

            {/* Navigation Buttons */}
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all"
              >
                🏛️ Learning City
              </button>
              <button
                onClick={() => setActiveView('terrain')}
                className="px-4 py-2 backdrop-blur-xl bg-purple-500/80 border border-purple-400/50 rounded-xl text-white hover:bg-purple-600/80 transition-all"
              >
                🏔️ Terrain Demo
              </button>
              <button
                onClick={() => setActiveView('study')}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                Study Mode →
              </button>
            </div>
          </div>
        )}

        {activeView === 'terrain' && (
          <div className="w-full h-full relative">
            <TerrainDemo />
            {/* Navigation */}
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('city')}
                className="px-4 py-2 backdrop-blur-xl bg-amber-500/80 border border-amber-400/50 rounded-xl text-white hover:bg-amber-600/80 transition-all"
              >
                🏛️ Learning City
              </button>
              <button
                onClick={() => setActiveView('3d')}
                className="px-4 py-2 backdrop-blur-xl bg-cyan-500/80 border border-cyan-400/50 rounded-xl text-white hover:bg-cyan-600/80 transition-all"
              >
                🎮 City Builder
              </button>
              <button
                onClick={() => setActiveView('study')}
                className="px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                Study Mode →
              </button>
            </div>
          </div>
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
              <button
                onClick={() => setActiveView('terrain')}
                className="px-4 py-2 backdrop-blur-xl bg-purple-500/80 border border-purple-400/50 rounded-xl text-white hover:bg-purple-600/80 transition-all"
              >
                🏔️ Terrain
              </button>
              <button
                onClick={() => setActiveView('3d')}
                className="px-4 py-2 backdrop-blur-xl bg-cyan-500/80 border border-cyan-400/50 rounded-xl text-white hover:bg-cyan-600/80 transition-all"
              >
                🎮 Voxel
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
              <button
                onClick={() => setActiveView('terrain')}
                className="px-4 py-2 backdrop-blur-xl bg-purple-500/80 border border-purple-400/50 rounded-xl text-white hover:bg-purple-600/80 transition-all"
              >
                🏔️ Terrain
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
            <WaffleStackCity />
            <div className="absolute top-6 right-6 flex gap-2 z-50 pointer-events-auto">
              <button
                onClick={() => setActiveView('mission')}
                className="px-4 py-2 backdrop-blur-xl bg-teal-500/80 border border-teal-400/50 rounded-xl text-white hover:bg-teal-600/80 transition-all"
              >
                🎯 Mission Control
              </button>
              <button
                onClick={() => setActiveView('townscaper')}
                className="px-4 py-2 backdrop-blur-xl bg-pink-500/80 border border-pink-400/50 rounded-xl text-white hover:bg-pink-600/80 transition-all"
              >
                🏘️ Townscaper
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
            <LandingPage onEnterCity={() => setActiveView('wafflecity')} />
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
