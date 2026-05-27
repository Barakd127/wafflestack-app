import { useEffect, useRef, useState } from 'react'
import Tooltip from './Tooltip'

/**
 * Godot-powered 3D city. Hosted at /godot/index.html and embedded in an
 * iframe (same-origin so localStorage syncs without postMessage).
 * The patched Godot HTML posts: { type: 'godot-progress', current, total }
 * and { type: 'godot-ready' } so we can show a proper branded loader.
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
        // Small delay so the city has a frame to render before we reveal it
        setTimeout(() => setReady(true), 400)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Safety fallback: if godot-ready never arrives, dismiss after 35s
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 35_000)
    return () => clearTimeout(id)
  }, [])

  // Refocus the iframe so Godot keyboard events land there
  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    const handle = () => { try { el.focus() } catch { /* ignore */ } }
    el.addEventListener('mouseenter', handle)
    return () => el.removeEventListener('mouseenter', handle)
  }, [])

  // Rotate tips every 4s
  useEffect(() => {
    if (ready) return
    const id = window.setInterval(() => setTip(t => t + 1), 4000)
    return () => window.clearInterval(id)
  }, [ready])

  const TIPS = [
    'בונים את העיר שלך — כל בניין מייצג מושג סטטיסטי שכבשת.',
    'טיפ: סיים שאלון על נושא כדי לפתוח את הבניין שלו בעיר.',
    'טיפ: גרור לסובב את המצלמה, גלגל לזום.',
    'טיפ: מרכז העיר הוא מגדל ה-Z — נפתח אחרי שתשלוט בציוני תקן.',
    'טיפ: לחץ Build כדי לבחור מבנה ולמקם אותו על הרשת.',
  ]

  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : null
  const mb = progress ? (progress.current / 1_048_576).toFixed(1) : null
  const totalMb = progress ? (progress.total / 1_048_576).toFixed(0) : null

  return (
    <div
      className="absolute inset-0 z-0 ws-godot-shell"
      style={{ background: '#0e1a3f' }}
    >
      {/* Branded loading overlay — stays until godot-ready (or 35s fallback) */}
      {!ready && (
        <div
          dir="rtl"
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(84,121,221,0.18) 0%, #0e1a3f 70%)',
            zIndex: 30,
            fontFamily: "'Rubik', 'Assistant', sans-serif",
            pointerEvents: 'none',
          }}
        >
          {/* App logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <img
              src="/building-figma.png"
              alt="WaffleStack"
              style={{
                height: 72,
                width: 'auto',
                animation: 'wsFloat 2.8s ease-in-out infinite',
                filter: 'drop-shadow(0 6px 18px rgba(84,121,221,0.6))',
              }}
            />
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#F5C842', letterSpacing: -0.5, lineHeight: 1 }}>
                WaffleStack
              </div>
              <div style={{ fontSize: 13, color: 'rgba(146,168,230,0.80)', marginTop: 3, fontWeight: 400 }}>
                עיר הסטטיסטיקה שלך
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: 320, marginBottom: 10 }}>
            <div style={{
              height: 6,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(146,168,230,0.20)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: pct !== null ? `${pct}%` : '100%',
                background: 'linear-gradient(90deg, #92A8E6, #5479DD)',
                transition: 'width 300ms ease-out',
                animation: pct === null ? 'wsSweep 1.8s ease-in-out infinite' : undefined,
                transformOrigin: pct === null ? 'left center' : undefined,
              }} />
            </div>
          </div>

          {/* Status text */}
          <div style={{ fontSize: 12, color: 'rgba(146,168,230,0.65)', marginBottom: 36, fontVariantNumeric: 'tabular-nums' }}>
            {pct !== null
              ? `טוען… ${pct}% — ${mb} / ${totalMb} MB`
              : 'טוען את העיר…'}
          </div>

          {/* Rotating tip */}
          <div
            key={tip}
            style={{
              maxWidth: 340,
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.65,
              animation: 'wsFadeIn 0.6s ease',
              padding: '0 16px',
            }}
          >
            {TIPS[tip % TIPS.length]}
          </div>

          <style>{`
            @keyframes wsFloat {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-7px); }
            }
            @keyframes wsSweep {
              0%   { transform: translateX(-100%) scaleX(0.4); }
              50%  { transform: translateX(60%)  scaleX(0.6); }
              100% { transform: translateX(200%) scaleX(0.4); }
            }
            @keyframes wsFadeIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {onBack && (
        <Tooltip label="חזרה ללימוד" description="חזור לאזור הלמידה" placement="top">
          <button
            onClick={onBack}
            aria-label="חזרה ללימוד"
            className="ws-godot-back-btn absolute left-4 z-50"
            style={{
              bottom: 20,
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
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title="WaffleStack 3D city (Godot)"
        allow="autoplay; cross-origin-isolated; clipboard-write; gamepad; xr-spatial-tracking"
        className="w-full h-full border-0"
        style={{ display: 'block', visibility: ready ? 'visible' : 'hidden' }}
      />
    </div>
  )
}
