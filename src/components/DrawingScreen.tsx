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
  const onChange = useCallback((elements: readonly unknown[], appState: Record<string, unknown>) => {
    if (saveTimerRef.t) clearTimeout(saveTimerRef.t)
    saveTimerRef.t = setTimeout(() => {
      saveScene(userId, { elements: [...elements], appState: { viewBackgroundColor: appState?.viewBackgroundColor as string } })
    }, 600)
  }, [userId, saveTimerRef])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1a1a1a' }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 50,
          background: 'rgba(108,99,255,0.85)',
          color: '#fff', border: '1px solid rgba(165,180,252,0.5)',
          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
          fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(108,99,255,0.45)',
        }}
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
