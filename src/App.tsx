import { useState, useEffect, lazy, Suspense } from 'react'
import { Moon, Sun } from 'lucide-react'
import StudyHub from './components/StudyHub'
import MindMapCanvas from './components/MindMapCanvas'
import Tooltip from './components/Tooltip'
// Godot 3D city replaces the React-Three-Fiber WaffleStackCity. The iframe
// (/godot/index.html in public/godot/) shares localStorage with the host app,
// so progress (XP / coins / mastered) stays in sync without a postMessage bridge.
import WaffleStackCity from './components/WaffleStackCityGodot'
import MissionControl from './components/MissionControl'
import OnboardingFlow from './components/OnboardingFlow'
import SplitLayout from './components/SplitLayout'
import TutorialOverlay from './components/TutorialOverlay'
import DrawingScreen from './components/DrawingScreen'
import { TutorFAB } from './components/AITutor/TutorFAB'
import { TutorDrawer } from './components/AITutor/TutorDrawer'

const LandingPage = lazy(() => import('./landing/LandingPage'))
// PageNotebook: OneNote-style writing surface (MIT only, no tldraw license
// required). Sections rail + pages strip + warm-paper canvas with draggable
// text/math containers. See components/notebook/OneNoteSurface.tsx.
const PageNotebook = lazy(() => import('./components/notebook/OneNoteSurface'))

type View = 'onboarding' | 'study' | 'mindmap' | 'wafflecity' | 'mission' | 'split' | 'split-mindmap' | 'split-study-mindmap' | 'drawing' | 'landing' | 'notebook'

function App() {
  const [activeView, setActiveView] = useState<View>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#landing') return 'landing'
    if (h === '#view-wafflecity' || h === '#city' || h === '#topics' || h === '#score' || h.startsWith('#challenge/')) return 'wafflecity'
    if (h === '#study') return 'study'
    if (h === '#split') return 'split'
    if (h === '#split-mindmap') return 'split-mindmap'
    if (h === '#mindmap') return 'mindmap'
    if (h === '#notebook') return 'notebook'
    // First-time / no-hash visitor → landing page. Returning users keep their
    // hash route (#study, #mindmap, etc.) so refreshing stays in-app.
    return 'landing'
  })
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('wafflestack-dark-mode')
    return stored !== null ? stored === 'true' : false
  })
  const [mindmapFrom, setMindmapFrom] = useState<string>('study')
  const [loggedIn, setLoggedIn] = useState(false)

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

  // Listen for theme changes posted from inside the mind map iframe.
  // The iframe's ☀/🌙 button writes to localStorage and posts ws-theme;
  // we update React state here so the rest of the app re-renders correctly
  // (rather than just toggling <html.dark> directly which the next render
  // would overwrite).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e?.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'ws-theme' && typeof d.dark === 'boolean') {
        setDarkMode(d.dark)
      } else if (d.type === 'ws-go-home') {
        // Iframe's ← דף הבית button — always go to StudyHub regardless of where the user came from.
        setActiveView('study')
      } else if (d.type === 'ws-split') {
        // Don't allow splitting a split — if we're already in any split-*
        // view, ignore. Prevents nested-split confusion when the user clicks
        // an iframe-internal split button while already inside a split pane.
        setActiveView(prev => (prev === 'split' || prev === 'split-mindmap' || prev === 'split-study-mindmap') ? prev : 'split-mindmap')
      } else if (d.type === 'ws-split-study') {
        setActiveView(prev => (prev === 'split' || prev === 'split-mindmap' || prev === 'split-study-mindmap') ? prev : 'split-study-mindmap')
      } else if (d.type === 'ws-go-drawing') {
        // Iframe's "🎨 לוח ציור" button — full-screen Excalidraw drawing surface.
        setActiveView('drawing')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Hash-driven navigation: <a href="#study"> on the landing page (and
  // anywhere else) needs to re-route activeView. Without this, clicking a
  // CTA on the landing page only changes the URL — the React state stays
  // on 'landing' and nothing visually moves.
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash
      if (h === '#landing') setActiveView('landing')
      else if (h === '#mindmap') setActiveView('mindmap')
      else if (h === '#notebook') setActiveView('notebook')
      else if (h === '#split') setActiveView('split')
      else if (h === '#split-mindmap') setActiveView('split-mindmap')
      else if (h === '#view-wafflecity' || h === '#city' || h === '#topics' || h === '#score' || h.startsWith('#challenge/')) setActiveView('wafflecity')
      else if (h === '#study' || h === '') setActiveView('study')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (activeView === 'study') window.location.hash = ''
    else if (activeView === 'landing') window.location.hash = '#landing'
    else if (activeView === 'split') window.location.hash = '#split'
    else if (activeView === 'split-mindmap') window.location.hash = '#split-mindmap'
    else if (activeView === 'wafflecity') { /* WaffleStackCity owns hash in this view */ }
    else if (activeView === 'mindmap') window.location.hash = '#mindmap'
    else if (activeView === 'notebook') window.location.hash = '#notebook'
  }, [activeView])

  // Hide the floating dark-mode toggle in views where the iframe (mindmap or
  // Godot city) has its own theme button at the bottom — two buttons in the
  // top-right corner is what the user sees as "the toggle obscures the
  // back/split buttons".
  const showDarkToggle = activeView !== 'mindmap' && activeView !== 'wafflecity' && activeView !== 'split' && activeView !== 'split-mindmap' && activeView !== 'landing'

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 dark:from-[#0f0f14] dark:via-[#1a1a2e] dark:to-[#0f0f14]">
      {showDarkToggle && (
        <button
          onClick={() => setDarkMode(d => !d)}
          className="fixed top-4 right-4 z-[200] p-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={darkMode ? 'הפעל מצב בהיר' : 'הפעל מצב כהה'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      {activeView === 'landing' && (
        <Suspense fallback={<div style={{background:'#1a237e',width:'100vw',height:'100vh'}}/>}>
          <LandingPage />
        </Suspense>
      )}

      <div className="relative z-10 w-full h-full">
        {activeView === 'study' && (
          <div className="relative w-full h-full">
            <StudyHub
              onViewChange={(v) => {
                if (v === 'mindmap') openMindMap('study')
                else if (v === '3d') setActiveView('wafflecity')
                else if (v === 'drawing') setActiveView('drawing')
                else setActiveView(v as View)
              }}
              darkMode={darkMode}
              onLoggedIn={() => setLoggedIn(true)}
              onLoggedOut={() => setLoggedIn(false)}
            />
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

        {/* Split: StudyHub on the right (RTL primary), MindMap iframe on the
            left. Reached from the iframe's "⊟ לימוד + מפה" button. */}
        {activeView === 'split-study-mindmap' && (
          <div dir="ltr" style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', background: '#0d0d1a' }}>
            <div style={{ width: '50%', height: '100%', position: 'relative', flexShrink: 0 }}>
              <iframe
                src="mindmap.html"
                title="מפת חשיבה — קנבס אינטראקטיבי"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="clipboard-read; clipboard-write"
              />
            </div>
            <div style={{ width: 4, flexShrink: 0, background: 'rgba(99,102,241,0.25)', cursor: 'col-resize' }} />
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative' }} dir="rtl">
              <StudyHub
                onViewChange={() => {/* split mode owns navigation */}}
                darkMode={darkMode}
              />
            </div>
            <button
              onClick={() => setActiveView('mindmap')}
              aria-label="סגור פיצול"
              style={{
                position: 'absolute', top: 8, left: 8, zIndex: 1000,
                background: 'rgba(108,99,255,0.85)', border: '1px solid rgba(165,180,252,0.5)',
                color: '#fff', borderRadius: 8, padding: '5px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ✕ סגור פיצול
            </button>
          </div>
        )}

        {activeView === 'mindmap' && (
          <div className="relative w-full h-full">
            <MindMapCanvas
              onViewChange={(v) => {
                // The "← דף הבית" button always goes to StudyHub, regardless
                // of where the user came from. (Old behaviour using
                // mindmapFrom would route them back to wafflecity if they
                // came from there, which contradicts the button's label.)
                if (v === 'study') setActiveView('study')
                else if (v === '3d') setActiveView('wafflecity')
                else setActiveView(v as View)
              }}
              darkMode={darkMode}
            />
            {/* Split-screen with city button — bottom-right */}
            <button
              onClick={() => setActiveView('split-mindmap')}
              aria-label="פצל מסך — עיר ומפת חשיבה"
              className="ws-split-btn"
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
              ⊟ עיר + מפת חשיבה
            </button>
          </div>
        )}

        {activeView === 'wafflecity' && (
          <div className="w-full h-full relative">
            <WaffleStackCity onBack={() => setActiveView('study')} />
            <div className="ws-godot-controls absolute bottom-6 right-6 z-50 pointer-events-auto flex gap-2 flex-wrap justify-end" style={{ maxWidth: 'calc(100vw - 120px)' }}>
              <button
                onClick={() => setActiveView('split')}
                aria-label="פצל מסך — עיר ולימוד"
                className="ws-split-btn"
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
              <Tooltip label="מפת מושגים" description="פתח מפת הנושאים">
                <button
                  onClick={() => openMindMap('wafflecity')}
                  aria-label="פתח מפת חשיבה"
                  className="ws-godot-mindmap-btn"
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
                  🧠 מפת חשיבה
                </button>
              </Tooltip>
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

      {activeView === 'drawing' && (
        <DrawingScreen
          userId={(typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'}
          onBack={() => setActiveView('study')}
        />
      )}

      {activeView === 'notebook' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#0B1B3E' }}>
          <Suspense fallback={<div style={{ background: '#0B1B3E', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>טוען מחברת…</div>}>
            <PageNotebook onBack={() => setActiveView('study')} />
          </Suspense>
        </div>
      )}

      {loggedIn && <TutorialOverlay />}

      {/* AI Study Tutor — global FAB + slide-out drawer, shown on study views only
          (hidden in wafflecity so the city back button sits cleanly at bottom-left) */}
      {activeView !== 'landing' && activeView !== 'wafflecity' && (
        <>
          <TutorFAB />
          <TutorDrawer />
        </>
      )}
    </div>
  )
}

export default App

