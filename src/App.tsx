import { useState, useEffect, useRef, lazy, Suspense } from 'react'
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
import FeatureGate from './components/FeatureGate'
import UnlockToast from './components/UnlockToast'
import TierTourTrigger from './components/TierTourTrigger'
import VirtualKeyboardCloser from './components/VirtualKeyboardCloser'
import WaffleStackKeyboard from './components/WaffleStackKeyboard'
import CalculatorDrawer from './components/CalculatorDrawer'
import { setKeyboardOpen } from './lib/uiStacks'
import { useLearningStore } from './store/learningStore'
import { useArsenalStore, serializeTable } from './store/arsenalStore'

const LandingPage = lazy(() => import('./landing/LandingPage'))
// Notebook view is now a different render-mode of mindmap.html (loaded as an
// iframe with ?view=notebook). The OneNoteSurface React component is no longer
// wired here — kept on disk for reference. Unified data source: notebook and
// mindmap share the same MM.nodes[id].body field inside mindmap.html.

type View = 'onboarding' | 'study' | 'mindmap' | 'wafflecity' | 'mission' | 'split' | 'split-mindmap' | 'split-study-mindmap' | 'drawing' | 'landing' | 'notebook'

function App() {
  const [activeView, setActiveView] = useState<View>(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#landing') return 'landing'
    if (h === '#view-wafflecity' || h === '#city' || h === '#topics' || h === '#score' || h.startsWith('#challenge/')) return 'wafflecity'
    if (h === '#study') return 'study'
    if (h === '#split') return 'split'
    if (h === '#split-mindmap') return 'split-mindmap'
    if (h === '#split-study-mindmap') return 'split-study-mindmap'
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
  // When the calculator is opened from a canvas/notebook equation inside the
  // mindmap iframe, remember that frame so the CalculatorDrawer's insert can be
  // posted back into it (it has no live math-field to write into). See Bug 2.
  const calcFrameRef = useRef<MessageEventSource | null>(null)

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
      } else if (d.type === 'ws-open-calc' && typeof d.formulaId === 'string') {
        // Cross-frame bridge: mindmap.html (iframe) posts this when the user
        // clicks a rendered equation that matched a library formula. Re-dispatch
        // as the local ws-open-calc CustomEvent the CalculatorDrawer listens for.
        // source:'canvas' → no live math-field; remember the frame so the
        // drawer's insert is posted back into it as a canvas/notebook equation.
        const fromCanvas = d.source === 'canvas'
        calcFrameRef.current = fromCanvas ? e.source : null
        window.dispatchEvent(new CustomEvent('ws-open-calc', { detail: { formulaId: d.formulaId, canvas: fromCanvas } }))
      } else if (d.type === 'ws-arsenal-add-table' && d.table && typeof d.table === 'object') {
        // Cross-frame bridge: mindmap.html (iframe) posts this when the user
        // picks "Save to Arsenal" on a canvas table. Serialize + add as a
        // 'table'-kind entry. Hydrate the store first if the user hasn't opened
        // the Arsenal yet this session (otherwise addEntry can't persist).
        const store = useArsenalStore.getState()
        if (!store.currentUserId) {
          const uid = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'
          store.hydrate(uid)
        }
        useArsenalStore.getState().addEntry({
          kind: 'table',
          text: serializeTable(d.table as Parameters<typeof serializeTable>[0]),
          source: 'manual',
        })
      }
    }
    // The CalculatorDrawer fires this when its insert buttons run in canvas
    // context. Forward the built LaTeX back into the originating iframe.
    const onCanvasInsert = (ev: Event) => {
      const latex = (ev as CustomEvent).detail?.latex
      const frame = calcFrameRef.current
      if (typeof latex === 'string' && frame) {
        try { (frame as Window).postMessage({ type: 'ws-canvas-insert-eq', latex }, '*') } catch { /* */ }
      }
    }
    window.addEventListener('message', onMessage)
    window.addEventListener('ws-insert-canvas-eq', onCanvasInsert)
    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('ws-insert-canvas-eq', onCanvasInsert)
    }
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
      else if (h === '#split-study-mindmap') setActiveView('split-study-mindmap')
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
    else if (activeView === 'split-study-mindmap') window.location.hash = '#split-study-mindmap'
    else if (activeView === 'wafflecity') { /* WaffleStackCity owns hash in this view */ }
    else if (activeView === 'mindmap') window.location.hash = '#mindmap'
    else if (activeView === 'notebook') window.location.hash = '#notebook'
  }, [activeView])

  // Bridge MathLive's virtual-keyboard visibility into the uiStacks signal
  // so every fixed FAB (TutorFAB, PomodoroTimer, UnlockToast) can hide while
  // the keyboard is on screen. Per plan curried-waddling-pelican Part D.
  // MathLive lazy-loads — retry attaching the listener until the global is
  // ready. Once attached, both `before-virtual-keyboard-toggle` and
  // `virtual-keyboard-toggle` events sync the flag (catches show + hide).
  useEffect(() => {
    type AnyKB = {
      visible?: boolean
      addEventListener?: (event: string, fn: () => void) => void
      removeEventListener?: (event: string, fn: () => void) => void
    }
    const getKB = () => (window as unknown as { mathVirtualKeyboard?: AnyKB }).mathVirtualKeyboard
    let kb: AnyKB | undefined
    let attached = false
    let timer: number | null = null
    const sync = () => setKeyboardOpen(!!getKB()?.visible)
    const attach = () => {
      kb = getKB()
      if (!kb?.addEventListener) { timer = window.setTimeout(attach, 400); return }
      kb.addEventListener('before-virtual-keyboard-toggle', sync)
      kb.addEventListener('virtual-keyboard-toggle', sync)
      kb.addEventListener('geometrychange', sync)
      attached = true
      sync()
    }
    attach()
    // Safety net: poll every 600ms in case events don't fire in some edge case.
    const poll = window.setInterval(sync, 600)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.clearInterval(poll)
      if (attached && kb) {
        kb.removeEventListener?.('before-virtual-keyboard-toggle', sync)
        kb.removeEventListener?.('virtual-keyboard-toggle', sync)
        kb.removeEventListener?.('geometrychange', sync)
      }
    }
  }, [])

  // Hide the floating dark-mode toggle in views where the iframe (mindmap or
  // Godot city) has its own theme button at the bottom — two buttons in the
  // top-right corner is what the user sees as "the toggle obscures the
  // back/split buttons".
  // Floating dark-mode toggle hides on views that have their own integrated
  // dark-mode control (study screen ships one inside its TopBar per user
  // feedback 2026-05-24 — was obscuring sidebar lock icons at top-right).
  const showDarkToggle = activeView !== 'study' && activeView !== 'mindmap' && activeView !== 'wafflecity' && activeView !== 'split' && activeView !== 'split-mindmap' && activeView !== 'landing'

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
              onToggleDarkMode={() => setDarkMode(d => !d)}
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
                position: 'absolute', top: 12, left: 12, zIndex: 1000,
                background: 'rgba(108,99,255,0.9)', border: '1px solid rgba(165,180,252,0.55)',
                color: '#fff', borderRadius: 12, padding: '10px 16px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                minHeight: 44, minWidth: 44,
                boxShadow: '0 4px 12px rgba(108,99,255,0.35)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
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
            {/* "עיר + מפת חשיבה" floating split button removed per user
                feedback 2026-05-24. Same split is reachable from the
                top-right WaffleCity controls; the duplicate FAB just
                cluttered the mindmap view bottom-right. */}
          </div>
        )}

        {activeView === 'wafflecity' && (
          <div className="w-full h-full relative">
            <WaffleStackCity onBack={() => setActiveView('study')} />
            <div className="ws-godot-controls absolute bottom-6 right-6 z-50 pointer-events-auto flex flex-col gap-2 items-end">
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
        <FeatureGate id="notebook" mode="hide">
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#FBF8F1' }}>
            <iframe
              src={`/mindmap.html?v=mm12-20260630&view=notebook&embed=1&userId=${encodeURIComponent((typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default')}`}
              title="WaffleStack notebook"
              allow="autoplay; clipboard-write"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
        </FeatureGate>
      )}

      {loggedIn && <TutorialOverlay />}

      {/* AI Study Tutor — global FAB + slide-out drawer, shown on study views only
          (hidden in wafflecity so the city back button sits cleanly at bottom-left) */}
      {activeView !== 'landing' && activeView !== 'wafflecity' && activeView !== 'split' && activeView !== 'split-mindmap' && activeView !== 'split-study-mindmap' && activeView !== 'mindmap' && activeView !== 'drawing' && (
        <>
          <FeatureGate id="ai-tutor" mode="hide"><TutorFAB /></FeatureGate>
          <TutorDrawer />
        </>
      )}

      {/* Global unlock celebration toast (drains learningStore.newlyUnlocked). */}
      <UnlockToast />
      {/* Auto-opens a macro-tier guided tour the first time that tier unlocks
          (one per session; rest pulse the 🎓 סיור button). No UI of its own. */}
      {loggedIn && <TierTourTrigger />}
      {/* Floating ✕ button visible whenever MathLive's virtual keyboard is
          open. Closes via API + on Escape + on route change. Per user 2026-05-25. */}
      <VirtualKeyboardCloser />
      {/* Registers a "וופלסטאק" tab on MathLive's virtual keyboard with
          formula chips from FORMULA_LIBRARY. Side-effect-only component. */}
      <WaffleStackKeyboard />
      {/* Slot-input formula evaluator. Subscribes to 'ws-open-calc' fired
          by a long-press on a keyboard chip. */}
      <CalculatorDrawer />
    </div>
  )
}

// Expose unlocked-features map on window so vanilla-JS iframes (mindmap.html,
// xmind-replica.html) can read gate state via window.parent.__wsFeatures.
// PR 2 caveat: whiteboard clusters inside mindmap.html still need to opt-in
// to reading this — gating of those vanilla-JS buttons is a future task.
if (typeof window !== 'undefined') {
  const sync = () => {
    const s = useLearningStore.getState()
    ;(window as unknown as { __wsFeatures: { adminMode: boolean; unlocked: string[] } }).__wsFeatures = {
      adminMode: s.adminMode,
      unlocked: s.unlockedFeatures,
    }
  }
  sync()
  useLearningStore.subscribe(sync)
}

export default App

