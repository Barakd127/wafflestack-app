/**
 * useGlassBoard — feature flag for the glass board (lesson/quiz whiteboard →
 * pane of glass in front of the knowledge city).
 *
 * Source of truth: localStorage['wafflestack-glass-board'] === '1'. A URL flag
 * (`?glass=1` / `#…glass=1`) wins over storage and is persisted so reloads keep
 * it. Same persistence style as the dark-mode flag in App.tsx
 * ('wafflestack-dark-mode'). Toggling dispatches a window CustomEvent so every
 * mounted BoardShell re-renders without a page reload.
 */
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'wafflestack-glass-board'
const EVENT_NAME = 'ws-glass-board'

function readStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeStorage(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* storage unavailable (private mode) — the in-memory event still works */
  }
}

/** `?glass=1` in the search string, or `glass=1` anywhere in the hash (`#study?glass=1`). */
function readUrlFlag(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const q = new URLSearchParams(window.location.search).get('glass')
    if (q !== null) return q === '1'
    const m = window.location.hash.match(/[?&#]glass=([^&]*)/)
    if (m) return m[1] === '1'
  } catch {
    /* ignore malformed URLs */
  }
  return null
}

/** Pure read: URL flag wins over storage. No side effects (safe inside a useState initializer). */
function readGlassBoardFlag(): boolean {
  if (typeof window === 'undefined') return false
  return readUrlFlag() ?? readStorage()
}

/** Imperative read that also persists a URL flag so reloads keep it (spec §1). */
export function isGlassBoardEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const fromUrl = readUrlFlag()
  if (fromUrl !== null) {
    writeStorage(fromUrl)
    return fromUrl
  }
  return readStorage()
}

export function setGlassBoardEnabled(on: boolean): void {
  writeStorage(on)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: on }))
}

export function useGlassBoard(): [boolean, (on: boolean) => void] {
  // Read only during render; the URL flag is persisted in the effect below
  // (same split as App.tsx's dark-mode: read in useState, write in useEffect).
  const [enabled, setEnabled] = useState<boolean>(readGlassBoardFlag)

  useEffect(() => {
    const fromUrl = readUrlFlag()
    if (fromUrl !== null) writeStorage(fromUrl)

    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<boolean>).detail
      setEnabled(typeof d === 'boolean' ? d : readStorage())
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) setEnabled(readStorage())
    }
    window.addEventListener(EVENT_NAME, onEvent)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT_NAME, onEvent)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return [enabled, setGlassBoardEnabled]
}
