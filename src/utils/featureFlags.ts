/**
 * Thin localStorage-backed feature flag system.
 *
 * Enable a flag in the browser console:
 *   localStorage.setItem('ws_flag_ws_triage_mode_v1', 'true'); location.reload()
 *
 * In development (Vite dev server) all flags default to ON so you can
 * see new features without touching localStorage manually.
 */
export function isFeatureEnabled(flag: string): boolean {
  try {
    const stored = localStorage.getItem(`ws_flag_${flag}`)
    if (stored !== null) return stored === 'true'
    return import.meta.env.DEV
  } catch {
    return false
  }
}

export function enableFeature(flag: string): void {
  try { localStorage.setItem(`ws_flag_${flag}`, 'true') } catch { /* noop */ }
}

export function disableFeature(flag: string): void {
  try { localStorage.setItem(`ws_flag_${flag}`, 'false') } catch { /* noop */ }
}
