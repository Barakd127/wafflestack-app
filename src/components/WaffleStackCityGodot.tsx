import { useEffect, useRef, useState } from 'react'
import Tooltip from './Tooltip'
import { useLearningStore } from '../store/learningStore'

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

  // Admin flag drives whether the Godot build palette (admin/dev tools) shows.
  // Students get the curated learning-progression UI; admins get the full
  // palette + free placement + clear. Read live from the learning store.
  const adminMode = useLearningStore(s => s.adminMode)
  const storeUserName = useLearningStore(s => s.userName)

  const userId = storeUserName || (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'default'

  // Mobile detection → Godot reads ?mobile=1 (GameState.is_mobile) to start the
  // camera zoomed-in and enlarge touch targets. Cover both narrow viewports and
  // touch-capable devices. Computed once (the iframe src is fixed after mount).
  const isMobile =
    typeof window !== 'undefined' &&
    (Math.min(window.innerWidth, window.innerHeight) <= 600 ||
      ('ontouchstart' in window && window.innerWidth <= 900))

  // admin=1 unlocks the raw palette inside Godot; omitted/0 = student mode.
  // mobile=1 → zoomed-in camera + touch-sized HUD inside Godot.
  //
  // ── CROSS-DEVICE CITY SAVE (status) ──────────────────────────────────────────
  // The city layout is persisted by Godot to localStorage under the CANONICAL
  // per-user key `wafflestack-city-placements-<userId>` (see GameState.gd
  // `_placements_key()`). Because the key is keyed by userId — not the device —
  // the SAME user sees the SAME city on every browser/tab on a given device, and
  // phone and laptop share the city ONLY if they share that browser's storage.
  //
  // True cross-DEVICE sync is NOT yet wired: the Supabase `progress` row
  // (src/lib/syncProgress.ts) mirrors UserProgress (xp/topics/streaks/preferences)
  // but has NO column for city placements, and Godot writes localStorage directly
  // rather than through the React progressStore. To enable phone↔laptop city sync:
  //   1. Add a `city_placements` JSONB column to the Supabase `progress` table
  //      (DB migration — human action), OR stash the placements inside the existing
  //      free-form `preferences` JSON that already syncs.
  //   2. On mount here, read `wafflestack-city-placements-<userId>` from localStorage
  //      and merge it into the progressStore payload so queueRemotePush ships it.
  //   3. On `godot-ready`, pull the remote placements back into that same localStorage
  //      key BEFORE the Godot iframe reads it (it reads in GameState._ready()).
  // The data is intentionally kept in ONE canonical key — do not fork it.
  // cb= busts the browser's heuristic cache of the godot shell html: vercel.json
  // sends no Cache-Control for .html, so Chrome was reviving a stale index.html
  // whose un-tagged pck URL then hit the year-long immutable CDN copy — players
  // kept seeing builds that were days old. Keyed to the session, not Date.now()
  // per render, so re-renders don't reload the iframe.
  const cacheBust = useRef(Date.now()).current
  const src = `/godot/index.html?userId=${encodeURIComponent(userId)}&admin=${adminMode ? 1 : 0}${isMobile ? '&mobile=1' : ''}&cb=${cacheBust}`

  // Listen for progress / ready messages from the Godot iframe
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      // Godot iframe is same-origin; ignore messages from anywhere else.
      if (e.origin !== window.location.origin) return
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
      style={{ background: '#0c1535' }}
    >
      {/* Branded loading overlay — stays until godot-ready (or 35s fallback) */}
      {!ready && (
        <div
          dir="rtl"
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(85,122,222,0.20) 0%, #0c1535 70%)',
            zIndex: 30,
            fontFamily: "'Rubik', 'Assistant', sans-serif",
            pointerEvents: 'none',
          }}
        >
          {/* App logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#A0B4EA', letterSpacing: -0.5, lineHeight: 1 }}>
                WaffleStack
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: 320, marginBottom: 10 }}>
            <div style={{
              height: 6,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(160,180,234,0.20)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: pct !== null ? `${pct}%` : '100%',
                background: 'linear-gradient(90deg, #A0B4EA, #557ADE)',
                transition: 'width 300ms ease-out',
                animation: pct === null ? 'wsSweep 1.8s ease-in-out infinite' : undefined,
                transformOrigin: pct === null ? 'left center' : undefined,
              }} />
            </div>
          </div>

          {/* Status text */}
          <div style={{ fontSize: 12, color: 'rgba(160,180,234,0.60)', marginBottom: 36, fontVariantNumeric: 'tabular-nums' }}>
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
              color: 'rgba(255,255,255,0.50)',
              lineHeight: 1.65,
              animation: 'wsFadeIn 0.6s ease',
              padding: '0 16px',
            }}
          >
            {TIPS[tip % TIPS.length]}
          </div>

          <style>{`
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
