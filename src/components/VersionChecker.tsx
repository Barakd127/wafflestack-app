import { useEffect, useState } from 'react'

/**
 * VersionChecker — avoids the "blank page after a deploy" trap.
 *
 * GitHub Pages serves index.html with a ~10-min cache and each Vite deploy ships
 * new hashed chunks (deleting the old ones). Two guards:
 *   1. Poll the live index.html (no-store) and compare its main module hash to
 *      the one this tab loaded. On a mismatch, show a non-blocking banner with a
 *      cache-busting reload button.
 *   2. Listen for Vite's `vite:preloadError` (a lazy chunk 404'd because it was
 *      deleted by a newer deploy) and auto-reload ONCE with a cache-buster.
 */
export default function VersionChecker() {
  const [stale, setStale] = useState(false)

  const cacheBustReload = () => {
    const url = location.origin + location.pathname + '?v=' + Date.now() + location.hash
    location.replace(url)
  }

  useEffect(() => {
    // hash of the module this tab is running
    const current = [...document.querySelectorAll('script[type="module"][src]')]
      .map(s => (s as HTMLScriptElement).src)
      .find(s => /\/assets\/index-.*\.js/.test(s)) || ''

    // Guard 2: a lazy chunk failed to load (deleted by a newer deploy) → reload once.
    const onPreloadError = () => {
      if (!sessionStorage.getItem('ws-reloaded-for-chunk')) {
        sessionStorage.setItem('ws-reloaded-for-chunk', '1')
        cacheBustReload()
      }
    }
    window.addEventListener('vite:preloadError', onPreloadError as EventListener)

    // Guard 1: poll for a newer deployed index.html.
    let alive = true
    const check = async () => {
      if (!current) return
      try {
        const base = import.meta.env.BASE_URL || '/'
        const res = await fetch(`${base}index.html?ts=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const html = await res.text()
        const m = html.match(/src="([^"]*\/assets\/index-[^"]*\.js)"/)
        if (!m) return
        const latest = new URL(m[1], location.href).href
        if (alive && latest !== current) setStale(true)
      } catch {
        /* offline or blocked — ignore, try again next tick */
      }
    }
    const id = window.setInterval(check, 60_000)
    const onVis = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      alive = false
      window.clearInterval(id)
      window.removeEventListener('vite:preloadError', onPreloadError as EventListener)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  if (!stale) return null

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed', insetInlineStart: 16, bottom: 16, zIndex: 9999,
        background: '#1F3E6C', color: '#fff', borderRadius: 12,
        padding: '12px 16px', boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: "'Rubik', sans-serif", fontSize: 14,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      <span>יצאה גרסה חדשה של WaffleStack.</span>
      <button
        onClick={cacheBustReload}
        style={{
          background: '#D4A017', color: '#1F2640', border: 'none',
          borderRadius: 8, padding: '6px 14px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, whiteSpace: 'nowrap',
        }}
      >
        רענן עכשיו
      </button>
    </div>
  )
}
