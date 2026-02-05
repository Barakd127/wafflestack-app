import { useState } from 'react'
import StudyHub from './components/StudyHub'
import MindMapCanvas from './components/MindMapCanvas'
import GameScene from './components/GameScene'
import UIOverlay from './components/UIOverlay'
import BottomDock from './components/BottomDock'
import TerrainDemo from './components/TerrainDemo'
import HighEndCity from './components/HighEndCity'
import TownscaperScene from './components/TownscaperScene'
import CityModeScene from './components/CityModeScene'
import { useGameStore } from './store/gameStore'
import ModelColorTest from './components/ModelColorTest'

function App() {
  const [activeView, setActiveView] = useState<'study' | 'mindmap' | '3d' | 'terrain' | 'city' | 'townscaper' | 'citymode' | 'colortest'>('townscaper')
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content - Switches between views */}
      <div className="relative z-10 w-full h-full">
        {activeView === 'study' && (
          <>
            {/* Background 3D Scene - Ambient background for study view */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <GameScene />
            </div>
            <StudyHub onViewChange={setActiveView} />
          </>
        )}
        
        {activeView === 'mindmap' && <MindMapCanvas onViewChange={setActiveView} />}
        
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
                onClick={() => setActiveView('townscaper')}
                className="px-4 py-2 backdrop-blur-xl bg-pink-500/80 border border-pink-400/50 rounded-xl text-white hover:bg-pink-600/80 transition-all"
              >
                ← Back to Townscaper
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
