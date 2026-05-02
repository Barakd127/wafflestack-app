import { useEffect, useRef, useState } from 'react'

/**
 * Godot-powered 3D city, replacing the React-Three-Fiber WaffleStackCity.
 *
 * The Godot HTML5 export is hosted at /godot/index.html (in public/godot/) and
 * loaded inside an iframe. Because the iframe shares an origin with the host
 * React app, both share localStorage — so progress (XP, coins, mastered list,
 * placements) saved by Godot's GameState autoload is visible to the React app
 * and vice-versa, with no postMessage bridge needed.
 *
 * Keys used by both apps (must stay in sync):
 *   wafflestack-xp, wafflestack-coins, wafflestack-mastered,
 *   wafflestack-streak, wafflestack-city-placements, wafflestack-last-study
 */
export default function WaffleStackCityGodot({ onBack }: { onBack?: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Pass the username (if any) through to Godot via ?userId= so the autoload
  // can scope storage if it ever wants to. Keys remain shared regardless.
  const userId = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'
  const src = `/godot/index.html?userId=${encodeURIComponent(userId)}`

  // Re-focus the iframe so keyboard input (R to rotate, Esc to cancel) lands
  // on Godot rather than the parent page, when the user clicks into it.
  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    const handleClick = () => { try { el.focus() } catch { /* ignore */ } }
    el.addEventListener('mouseenter', handleClick)
    return () => { el.removeEventListener('mouseenter', handleClick) }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0f0f14] z-0">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="text-sm tracking-wide">Loading WaffleStack city…</div>
          </div>
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/25 transition-all shadow-lg"
        >
          ← Back to Study
        </button>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title="WaffleStack 3D city (Godot)"
        onLoad={() => setLoaded(true)}
        // allow="autoplay" so SoundFX in Godot can play without a user-gesture nag
        allow="autoplay; cross-origin-isolated; clipboard-write; gamepad; xr-spatial-tracking"
        className="w-full h-full border-0"
        style={{ display: 'block' }}
      />
    </div>
  )
}
