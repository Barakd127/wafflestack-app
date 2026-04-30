import { useState, useEffect, useRef, useCallback } from 'react'

const WORK_MIN = 25
const BREAK_MIN = 5
const SESSIONS_KEY = 'wafflestack-pomodoro-sessions'
const FOCUS_MIN_KEY = 'wafflestack-focus-minutes'

type Mode = 'work' | 'break'

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function loadInt(key: string): number {
  const raw = parseInt(localStorage.getItem(key) || '0')
  return Number.isFinite(raw) ? raw : 0
}

function playChime(mode: Mode) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const notes = mode === 'work' ? [659, 784, 988] : [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.45)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.5)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch { /* audio unavailable */ }
}

interface PomodoroTimerProps {
  leftOffset?: number
}

export default function PomodoroTimer({ leftOffset = 90 }: PomodoroTimerProps = {}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('work')
  const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60)
  const [running, setRunning] = useState(false)
  const [totalSessions, setTotalSessions] = useState(() => loadInt(SESSIONS_KEY))
  const [totalFocusMin, setTotalFocusMin] = useState(() => loadInt(FOCUS_MIN_KEY))
  const tickRef = useRef<number | null>(null)

  const handleComplete = useCallback(() => {
    playChime(mode)
    if (mode === 'work') {
      const sessions = loadInt(SESSIONS_KEY) + 1
      const focus = loadInt(FOCUS_MIN_KEY) + WORK_MIN
      localStorage.setItem(SESSIONS_KEY, String(sessions))
      localStorage.setItem(FOCUS_MIN_KEY, String(focus))
      setTotalSessions(sessions)
      setTotalFocusMin(focus)
      setMode('break')
      setSecondsLeft(BREAK_MIN * 60)
    } else {
      setMode('work')
      setSecondsLeft(WORK_MIN * 60)
    }
    setRunning(false)
  }, [mode])

  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (tickRef.current) window.clearInterval(tickRef.current) }
  }, [running, handleComplete])

  const handleReset = () => {
    setRunning(false)
    setSecondsLeft(mode === 'work' ? WORK_MIN * 60 : BREAK_MIN * 60)
  }

  const handleSwitchMode = () => {
    setRunning(false)
    if (mode === 'work') {
      setMode('break')
      setSecondsLeft(BREAK_MIN * 60)
    } else {
      setMode('work')
      setSecondsLeft(WORK_MIN * 60)
    }
  }

  const totalSec = mode === 'work' ? WORK_MIN * 60 : BREAK_MIN * 60
  const pct = ((totalSec - secondsLeft) / totalSec) * 100
  const accent = mode === 'work' ? '#FF6B6B' : '#4ECDC4'

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="טיימר פומודורו"
        aria-label="Open Pomodoro timer"
        style={{
          position: 'absolute', bottom: 24, left: leftOffset, zIndex: 50,
          background: running ? 'rgba(255,107,107,0.18)' : 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${running ? accent : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 20, padding: '5px 12px',
          color: running ? accent : 'rgba(255,255,255,0.85)',
          fontSize: 12, cursor: 'pointer',
          fontFamily: "'Heebo', system-ui, sans-serif",
          display: 'flex', alignItems: 'center', gap: 6,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>🍅</span>
        {running && <span>{fmtTime(secondsLeft)}</span>}
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 260,
        background: 'rgba(5,10,25,0.55)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        dir="rtl"
        style={{
          background: 'linear-gradient(135deg, #0d1d35 0%, #14294a 100%)',
          border: `1px solid ${accent}55`,
          borderRadius: 24, padding: '32px 36px', minWidth: 320,
          fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
          boxShadow: `0 8px 50px ${accent}33`, textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.7 }}>טיימר פומודורו</div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
              color: 'rgba(255,255,255,0.7)', width: 26, height: 26, cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        </div>

        <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 4 }}>
          {mode === 'work' ? '🍅 פוקוס' : '☕ הפסקה'}
        </div>

        <div style={{
          fontSize: 56, fontWeight: 900, letterSpacing: 1,
          fontVariantNumeric: 'tabular-nums', margin: '6px 0',
        }}>
          {fmtTime(secondsLeft)}
        </div>

        <div style={{
          height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden', margin: '10px 0 18px',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: accent,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              background: running ? 'rgba(255,255,255,0.1)' : accent,
              color: running ? 'white' : '#0a1530',
              border: 'none', borderRadius: 12, padding: '10px 22px',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              minWidth: 100,
            }}
          >
            {running ? '⏸ השהה' : '▶ התחל'}
          </button>
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
              padding: '10px 18px', fontFamily: 'inherit', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            🔄 אפס
          </button>
        </div>

        <button
          onClick={handleSwitchMode}
          style={{
            background: 'transparent', color: 'rgba(255,255,255,0.55)',
            border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 10,
            padding: '6px 14px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
            marginBottom: 18,
          }}
        >
          {mode === 'work' ? 'דלג להפסקה ☕' : 'דלג לפוקוס 🍅'}
        </button>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12,
          display: 'flex', justifyContent: 'space-around', fontSize: 12,
          color: 'rgba(255,255,255,0.65)',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFD700' }}>{totalSessions}</div>
            <div>סשנים</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ECDC4' }}>{totalFocusMin}</div>
            <div>דקות פוקוס</div>
          </div>
        </div>
      </div>
    </div>
  )
}
