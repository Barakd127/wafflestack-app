import { useState } from 'react'
import { 
  Plus, 
  Box, 
  Image, 
  Settings, 
  Play,
  Save,
  Download,
  Home,
  Layers,
  Grid3x3,
  Palette,
  Moon,
  Sun
} from 'lucide-react'

const UIOverlay = () => {
  const [activeSection, setActiveSection] = useState<string>('home')
  const [activeToolPanel, setActiveToolPanel] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true)

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'build', icon: Box, label: 'Build' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'terrain', icon: Grid3x3, label: 'Terrain' },
    { id: 'assets', icon: Palette, label: 'Assets' },
  ]

  const buildTools = [
    { id: 'add', icon: Plus, label: 'Add Object', description: 'Place new objects in scene' },
    { id: 'model', icon: Box, label: '3D Model (Tripo)', description: 'Generate AI 3D models' },
    { id: 'texture', icon: Image, label: 'Generate Texture', description: 'Create AI textures' },
  ]

  const settingsTools = [
    { id: 'play', icon: Play, label: 'Play Mode' },
    { id: 'save', icon: Save, label: 'Save Project' },
    { id: 'export', icon: Download, label: 'Export' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none font-sans">
      {/* Left Sidebar - Clean Professional */}
      <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-auto">
        <div className="h-full backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-r border-white/10 shadow-2xl flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-center border-b border-white/10">
            <div className="text-center">
              <div className="text-xl font-bold text-white">B</div>
              <div className="text-[10px] text-cyan-400 font-semibold tracking-wider">44</div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setActiveToolPanel(null)
                  }}
                  className={`
                    w-full h-16 flex flex-col items-center justify-center gap-1
                    transition-all duration-200 relative group
                    ${isActive ? 'bg-cyan-500/20' : 'hover:bg-white/5'}
                  `}
                  title={item.label}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r" />
                  )}
                  <Icon 
                    size={22} 
                    className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-white/60 group-hover:text-white'
                    }`}
                  />
                  <span className={`text-[10px] transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-white/60 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-white/10 py-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full h-14 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Top Bar - Minimal & Clean */}
      <div className="absolute top-6 left-28 right-6 pointer-events-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-3 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">
              Untitled Project
            </h1>
            <span className="text-xs text-white/40 px-2 py-1 bg-white/5 rounded">Auto-saved 2m ago</span>
          </div>
          
          <div className="flex items-center gap-2">
            {settingsTools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolPanel(tool.id)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  title={tool.label}
                >
                  <Icon size={18} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Context-Based Tools */}
      {activeSection !== 'home' && (
        <div className="absolute right-6 top-24 bottom-6 w-80 pointer-events-auto">
          <div className="h-full backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h2>
              <p className="text-xs text-white/50 mt-1">
                {activeSection === 'build' && 'Create and place objects'}
                {activeSection === 'layers' && 'Manage scene layers'}
                {activeSection === 'terrain' && 'Edit terrain and landscape'}
                {activeSection === 'assets' && 'Manage your assets'}
              </p>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeSection === 'build' && (
                <>
                  {buildTools.map((tool) => {
                    const Icon = tool.icon
                    const isActive = activeToolPanel === tool.id
                    
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveToolPanel(isActive ? null : tool.id)}
                        className={`
                          w-full p-4 rounded-xl border transition-all text-left
                          ${isActive 
                            ? 'bg-cyan-500/20 border-cyan-500/50' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isActive ? 'bg-cyan-500/30' : 'bg-white/10'
                          }`}>
                            <Icon size={20} className={
                              isActive ? 'text-cyan-400' : 'text-white/80'
                            } />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${
                              isActive ? 'text-cyan-400' : 'text-white'
                            }`}>
                              {tool.label}
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Content */}
                        {isActive && tool.id === 'model' && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <p className="text-xs text-white/70">
                              Upload 4 orthographic views to generate a 3D model
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {['Front View', 'Back View', 'Left View', 'Right View'].map((view) => (
                                <div key={view} className="space-y-1">
                                  <label className="text-xs text-white/50">{view}</label>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-xs text-white file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white file:text-xs hover:file:bg-cyan-600 file:cursor-pointer file:font-medium cursor-pointer bg-white/5 border border-white/10 rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/20">
                              Generate 3D Model
                            </button>
                          </div>
                        )}

                        {isActive && tool.id === 'texture' && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <p className="text-xs text-white/70">
                              Describe the texture you want to generate
                            </p>
                            <textarea 
                              placeholder="e.g., Weathered brick wall with moss..."
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-400 resize-none"
                              rows={3}
                            />
                            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                              Generate Texture
                            </button>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </>
              )}

              {activeSection === 'layers' && (
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white font-medium">Scene Objects</div>
                    <div className="text-xs text-white/50 mt-1">No objects yet</div>
                  </div>
                </div>
              )}

              {activeSection === 'terrain' && (
                <div className="text-center py-8 text-white/40 text-sm">
                  Terrain tools coming soon
                </div>
              )}

              {activeSection === 'assets' && (
                <div className="text-center py-8 text-white/40 text-sm">
                  Asset library coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar - Bottom */}
      <div className="absolute bottom-6 left-28 pointer-events-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-2 shadow-xl">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70">Ready</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white/50">Camera: Perspective</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white/50">Grid: 20x20</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {activeSection === 'home' && (
        <div className="absolute bottom-6 right-6 pointer-events-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3 shadow-xl max-w-xs">
            <div className="text-xs font-semibold text-white mb-2">Quick Actions</div>
            <div className="space-y-1.5 text-xs text-white/60">
              <div className="flex justify-between gap-4">
                <span>Rotate Camera</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/80">Click + Drag</kbd>
              </div>
              <div className="flex justify-between gap-4">
                <span>Zoom</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/80">Scroll</kbd>
              </div>
              <div className="flex justify-between gap-4">
                <span>Pan Camera</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/80">Right Click</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UIOverlay
