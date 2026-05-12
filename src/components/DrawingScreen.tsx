/**
 * DrawingScreen — Excalidraw-based freehand drawing surface.
 *
 * One scene per user, persisted to localStorage at
 * `wafflestack-excalidraw-${userId}`. Loaded lazily so the ~600KB
 * Excalidraw bundle doesn't hit users who never open this screen.
 *
 * The user's note (May 2026) explicitly asked for Excalidraw
 * integration; for v1 it lives as a top-level screen alongside the
 * mindmap. A follow-up will wire it into the mindmap as a new node
 * type so each node can carry its own Excalidraw scene.
 */
import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
// Excalidraw 0.18+ ships CSS separately — without this import the canvas
// renders as a blank screen because the toolbar/sidebar styles never load.
import '@excalidraw/excalidraw/index.css'

const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then(m => ({ default: m.Excalidraw }))
)

const KEY_PREFIX = 'wafflestack-excalidraw-'

interface DrawingScreenProps {
  userId: string
  onBack: () => void
}

interface SavedScene {
  elements: unknown[]
  appState?: Record<string, unknown>
}

function storageKey(userId: string): string {
  return KEY_PREFIX + (userId || 'default')
}

function loadScene(userId: string): SavedScene | null {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.elements)) return parsed
  } catch { /* ignore */ }
  return null
}

function saveScene(userId: string, scene: SavedScene): void {
  try { localStorage.setItem(storageKey(userId), JSON.stringify(scene)) } catch { /* quota */ }
}

export default function DrawingScreen({ userId, onBack }: DrawingScreenProps) {
  // We don't need to read the saved scene back into state — Excalidraw is
  // initialised with `initialData` once. We just save on change.
  const [initial, setInitial] = useState<SavedScene | null | 'loading'>('loading')

  useEffect(() => {
    setInitial(loadScene(userId))
  }, [userId])

  // Debounce save so we don't thrash localStorage on every brush-stroke.
  const saveTimerRef = useState<{ t: ReturnType<typeof setTimeout> | null }>(() => ({ t: null }))[0]
  const [savedFlash, setSavedFlash] = useState(false)
  const onChange = useCallback((elements: readonly unknown[], appState: Record<string, unknown>) => {
    if (saveTimerRef.t) clearTimeout(saveTimerRef.t)
    saveTimerRef.t = setTimeout(() => {
      saveScene(userId, { elements: [...elements], appState: { viewBackgroundColor: appState?.viewBackgroundColor as string } })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1400)
    }, 600)
  }, [userId, saveTimerRef])

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: '#1a1a1a', zIndex: 100 }}>
      {/* Auto-save toast — appears 0.6s after stroke commit, fades after 1.4s */}
      {savedFlash && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute', bottom: 20, right: 20, zIndex: 60,
            background: 'rgba(52,168,83,0.95)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 22, padding: '8px 18px',
            fontSize: 14, fontWeight: 700, fontFamily: "'Rubik', sans-serif",
            boxShadow: '0 6px 18px rgba(52,168,83,0.45)',
            pointerEvents: 'none',
            animation: 'savedFlashFade 1.4s ease-out',
          }}
        >
          ✓ נשמר
        </div>
      )}
      <style>{`@keyframes savedFlashFade{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateY(-4px)}}`}</style>
      <button
        onClick={onBack}
        aria-label="חזרה לדף הבית — יציאה מלוח הציור"
        // Moved to BOTTOM-LEFT so it doesn't overlap Excalidraw's top tool
        // palette (which is where the hamburger/menu sits). Pointer-events
        // explicit so the button always wins clicks on its own rect.
        style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 50,
          background: 'rgba(108,99,255,0.95)',
          color: '#fff', border: '1.5px solid rgba(212,175,55,0.65)',
          borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 700,
          fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(108,99,255,0.5)',
          pointerEvents: 'auto',
          minWidth: 44, minHeight: 44,
        }}
        onFocus={e => { (e.currentTarget as HTMLButtonElement).style.outline = '3px solid #D4AF37'; (e.currentTarget as HTMLButtonElement).style.outlineOffset = '3px' }}
        onBlur={e => { (e.currentTarget as HTMLButtonElement).style.outline = 'none' }}
      >
        ← דף הבית
      </button>
      <Suspense fallback={<div style={{ color: '#fff', padding: 60, textAlign: 'center' }}>טוען Excalidraw…</div>}>
        {initial !== 'loading' && (
          <Excalidraw
            initialData={(initial ?? undefined) as any}
            onChange={onChange as any}
            theme="dark"
            UIOptions={{
              canvasActions: {
                loadScene: false, // disable load-from-disk for now
              },
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
