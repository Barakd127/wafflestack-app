import { useEffect, useRef, useState } from 'react'
import Tooltip from './Tooltip'

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
    <div className="absolute inset-0 z-0 ws-godot-shell" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1f3f 100%)' }}>
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
            <div className="ws-godot-emoji" style={{ fontSize: 64, marginBottom: 8, animation: 'wsBuild 2.4s ease-in-out infinite' }}>🏙️</div>

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
        <>
          {/* Bottom-left back-to-learning button (existing) */}
          <Tooltip label="חזרה ללימוד" description="חזור לאזור הלמידה" placement="top">
            <button
              onClick={onBack}
              aria-label="חזרה ללימוד"
              className="ws-godot-back-btn absolute left-4 z-50"
              style={{
                bottom: 88,
                padding: '10px 18px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#1F3E6C,#2c4f8a)',
                border: '2px solid #D4AF37',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Rubik','Assistant',sans-serif",
                boxShadow: '0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 18 }}>←</span>
              <span>חזרה ללימוד</span>
            </button>
          </Tooltip>

          {/* Top-left HOME button (new). Routes to study-hub home via the same
              onBack callback. Distinct visual treatment (gold gradient + house
              icon) so it reads as "home" not "back". */}
          <Tooltip label="דף הבית" description="חזרה למסך הראשי" placement="bottom">
            <button
              onClick={onBack}
              aria-label="דף הבית"
              className="ws-godot-home-btn absolute top-4 left-4 z-50"
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#F5C842,#D4AF37)',
                border: '2px solid rgba(255,255,255,0.5)',
                color: '#0B1B3E',
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "'Rubik','Assistant',sans-serif",
                boxShadow: '0 6px 20px rgba(212,175,55,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              🏠
            </button>
          </Tooltip>
        </>
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
