import { useEffect, useRef, useState } from 'react'

/**
 * Godot-powered 3D city. Hosted at /godot/index.html and embedded in an
 * iframe; localStorage is shared because of same-origin, so XP/coins/mastered
 * sync without postMessage. The Godot HTML posts back two message types so we
 * can show a richer custom loader: { type: 'godot-progress', current, total }
 * and { type: 'godot-ready' }.
 */
export default function WaffleStackCityGodot({ onBack }: { onBack?: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [tip, setTip] = useState(0)

  const userId = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'
  const src = `/godot/index.html?userId=${encodeURIComponent(userId)}`

  // Listen for progress / ready messages from the Godot iframe
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; current?: number; total?: number }
      if (!d || typeof d.type !== 'string') return
      if (d.type === 'godot-progress' && typeof d.current === 'number' && typeof d.total === 'number') {
        setProgress({ current: d.current, total: d.total })
      } else if (d.type === 'godot-ready') {
        setReady(true)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Refocus the iframe so Godot keyboard shortcuts (R to rotate, Esc) land there
  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    const handle = () => { try { el.focus() } catch { /* ignore */ } }
    el.addEventListener('mouseenter', handle)
    return () => { el.removeEventListener('mouseenter', handle) }
  }, [])

  // Rotate tips every 3.5s so the loader feels alive
  useEffect(() => {
    if (ready) return
    const id = window.setInterval(() => setTip(t => t + 1), 3500)
    return () => window.clearInterval(id)
  }, [ready])

  const TIPS = [
    'בונים את העיר שלך — כל בניין מייצג מושג סטטיסטי שכבשת.',
    'טיפ: סיים שאלון על נושא כדי לפתוח את הבניין שלו בעיר.',
    'טיפ: לחיצת R תסובב בניין בזמן הצבה. Esc יבטל.',
    'טיפ: מרכז העיר הוא מגדל ה-Z — נפתח אחרי שתשלוט בציוני תקן.',
    'טיפ: מצב מבחן (📋) פותח שאלון רחב על כל הנושאים שכבשת.',
  ]

  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : 0
  const mb = progress ? (progress.current / 1048576).toFixed(1) : null
  const totalMb = progress ? (progress.total / 1048576).toFixed(0) : null

  return (
    // absolute (not fixed) so this fills its parent container — works for both
    // standalone full-screen mode AND split-pane mode without escaping the
    // panel boundary. Parent (App.tsx wafflecity wrapper or SplitLayout left
    // panel) provides position:relative.
    <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1f3f 100%)' }}>
      {/* Custom Hebrew loading overlay — masks the Godot canvas until ready */}
      {!ready && (
        <div
          dir="rtl"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(15,15,35,0.95) 70%)',
            zIndex: 30,
            fontFamily: "'Rubik', 'Assistant', sans-serif",
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 460, padding: 24 }}>
            {/* Animated stack of waffle / building icons */}
            <div style={{ fontSize: 64, marginBottom: 8, animation: 'wsBuild 2.4s ease-in-out infinite' }}>🏙️</div>

            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: 0.5 }}>
              טוען את העיר…
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 22 }}>
              WaffleStack City Builder
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%', maxWidth: 360, margin: '0 auto',
              height: 8, borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.25)',
            }}>
              <div style={{
                height: '100%',
                width: progress ? `${pct}%` : '15%',
                background: 'linear-gradient(90deg, #818cf8, #6366f1, #4338ca)',
                transition: 'width 240ms ease-out',
                animation: progress ? undefined : 'wsIndeterminate 1.4s linear infinite',
                backgroundSize: progress ? undefined : '200% 100%',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontVariantNumeric: 'tabular-nums' }}>
              {progress
                ? `${pct}% — ${mb} / ${totalMb} MB`
                : 'מתחבר למנוע Godot…'}
            </div>

            {/* Rotating tip */}
            <div
              key={tip}
              style={{
                marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.7)',
                animation: 'wsFadeIn 0.5s ease',
                lineHeight: 1.6,
                minHeight: 40,
              }}
            >
              💡 {TIPS[tip % TIPS.length]}
            </div>
          </div>

          {/* Inline keyframes — scoped to overlay */}
          <style>{`
            @keyframes wsBuild { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes wsIndeterminate { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            @keyframes wsFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          aria-label="חזרה ללימוד"
          // absolute (not fixed) so the button stays inside the city panel
          // when in split mode. Sits at top-LEFT to avoid collision with
          // App.tsx's dark-mode toggle at top-RIGHT.
          className="absolute top-3 left-3 z-50 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/25 transition-all shadow-lg"
        >
          ← חזרה ללימוד
        </button>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title="WaffleStack 3D city (Godot)"
        allow="autoplay; cross-origin-isolated; clipboard-write; gamepad; xr-spatial-tracking"
        className="w-full h-full border-0"
        // Fallback: even if the Godot project never posts 'godot-ready',
        // hide the loader once the iframe document itself loads. Godot
        // shows its own progress UI inside the iframe.
        onLoad={() => setReady(true)}
        style={{ display: 'block', visibility: ready ? 'visible' : 'hidden' }}
      />
    </div>
  )
}
