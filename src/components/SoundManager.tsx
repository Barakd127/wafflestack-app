import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AudioNodes {
  ctx: AudioContext
  oscillator1: OscillatorNode
  oscillator2: OscillatorNode
  filter: BiquadFilterNode
  gainNode1: GainNode
  gainNode2: GainNode
}

interface CitySoundResult {
  playing: boolean
  toggle: () => void
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'wafflestack-sound'

function loadSoundPref(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    // Default is muted (false) — only return true if explicitly saved as 'true'
    return val === 'true'
  } catch {
    return false
  }
}

function saveSoundPref(playing: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(playing))
  } catch {
    // ignore storage errors
  }
}

// ─── Audio graph factory ──────────────────────────────────────────────────────

function createAudioNodes(ctx: AudioContext): AudioNodes {
  // Low-pass filter shared by both oscillators — city hum stays below 200Hz
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  filter.Q.value = 0.8

  // Oscillator 1 — 60Hz fundamental hum, gain 0.04
  const gainNode1 = ctx.createGain()
  gainNode1.gain.value = 0.04

  const oscillator1 = ctx.createOscillator()
  oscillator1.type = 'sine'
  oscillator1.frequency.value = 60

  oscillator1.connect(gainNode1)
  gainNode1.connect(filter)

  // Oscillator 2 — 180Hz harmonic, gain 0.02
  const gainNode2 = ctx.createGain()
  gainNode2.gain.value = 0.02

  const oscillator2 = ctx.createOscillator()
  oscillator2.type = 'sine'
  oscillator2.frequency.value = 180

  oscillator2.connect(gainNode2)
  gainNode2.connect(filter)

  // Filter → destination
  filter.connect(ctx.destination)

  // Start both oscillators immediately (they'll be audible only when ctx is running)
  oscillator1.start()
  oscillator2.start()

  return { ctx, oscillator1, oscillator2, filter, gainNode1, gainNode2 }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCitySound(): CitySoundResult {
  // Starts muted regardless of saved pref — autoplay policy requires user gesture
  const [playing, setPlaying] = useState(false)
  const nodesRef = useRef<AudioNodes | null>(null)
  // Track whether the user has interacted at all (first toggle creates AudioContext)
  const initializedRef = useRef(false)

  // On mount: read saved pref but do NOT auto-start audio (autoplay policy)
  // We only remember the intent; actual audio requires a user gesture.
  const savedPrefRef = useRef(loadSoundPref())

  const toggle = useCallback(() => {
    if (!initializedRef.current) {
      // First interaction — create AudioContext lazily
      initializedRef.current = true

      const ctx = new AudioContext()
      const nodes = createAudioNodes(ctx)
      nodesRef.current = nodes

      // Decide initial state: if user had previously enabled sound, start playing
      const shouldPlay = savedPrefRef.current
      if (shouldPlay) {
        // ctx is already running after user gesture — nothing extra needed
        setPlaying(true)
        saveSoundPref(true)
      } else {
        // User clicked mute button for the first time with no saved pref —
        // treat this first click as "enable sound"
        setPlaying(true)
        saveSoundPref(true)
      }
      return
    }

    // Subsequent toggles
    const nodes = nodesRef.current
    if (!nodes) return

    if (playing) {
      // Mute: suspend the audio context (pauses all audio, zero CPU)
      nodes.ctx.suspend().catch(() => undefined)
      setPlaying(false)
      saveSoundPref(false)
    } else {
      // Unmute: resume the audio context
      nodes.ctx.resume().catch(() => undefined)
      setPlaying(true)
      saveSoundPref(true)
    }
  }, [playing])

  // Cleanup on unmount — stop oscillators and close context
  useEffect(() => {
    return () => {
      const nodes = nodesRef.current
      if (!nodes) return
      try {
        nodes.oscillator1.stop()
        nodes.oscillator2.stop()
        nodes.ctx.close().catch(() => undefined)
      } catch {
        // ignore errors during cleanup
      }
      nodesRef.current = null
    }
  }, [])

  return { playing, toggle }
}

// ─── Quiz sound effects ───────────────────────────────────────────────────────

export function playCorrectTone(): void {
  try {
    const ctx = new AudioContext()
    // Ascending arpeggio: C5 → E5 → G5
    const notes: [number, number][] = [[523.25, 0], [659.25, 0.1], [783.99, 0.2]]
    for (const [freq, delay] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + delay
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.start(t)
      osc.stop(t + 0.2)
    }
    setTimeout(() => ctx.close().catch(() => undefined), 800)
  } catch {
    // ignore — audio not supported or blocked
  }
}

export function playBuildingPlacedTone(): void {
  try {
    const ctx = new AudioContext()
    // Short "pop": A5 sine burst with fast gain ramp
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t = ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.start(t)
    osc.stop(t + 0.2)
    setTimeout(() => ctx.close().catch(() => undefined), 500)
  } catch {
    // ignore
  }
}

export function playWrongTone(): void {
  try {
    const ctx = new AudioContext()
    // Descending: G4 → Eb4 → C4, triangle wave for slight buzz
    const notes: [number, number][] = [[392, 0], [311.13, 0.12], [261.63, 0.24]]
    for (const [freq, delay] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + delay
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.14, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      osc.start(t)
      osc.stop(t + 0.25)
    }
    setTimeout(() => ctx.close().catch(() => undefined), 900)
  } catch {
    // ignore
  }
}
