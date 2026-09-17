import { useState, useEffect, useRef, useCallback } from 'react'
import { getStackOffset, useKeyboardOpen } from '../lib/uiStacks'

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
  /** Override the shared --ws-pomodoro-left CSS var (px). Rare. */
  leftOffset?: number
}

export default function PomodoroTimer({ leftOffset: _leftOffset }: PomodoroTimerProps = {}) {
  const [open, setOpen] = useState(false)
  const kbOpen = useKeyboardOpen()
  const stackPos = getStackOffset('br-content', 'pomodoro')
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

  // Guided-tour demo hook: open the timer and start a work session on demand.
  useEffect(() => {
    const onOpen = () => { setOpen(true); setMode('work'); setSecondsLeft(WORK_MIN * 60); setRunning(true) }
    window.addEventListener('ws-open-pomodoro', onOpen)
    return () => window.removeEventListener('ws-open-pomodoro', onOpen)
  }, [])

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
  /* Coral, the same value the avatar's XP ring uses. Both measure progress,
   * so they cannot be different colours without claiming to be different
   * things. Mode is carried by the icon, the label and the dots instead. */
  const accent = '#FF7A59'
  const R = 92
  const CIRC = 2 * Math.PI * R

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="טיימר — מפגש פוקוס"
        aria-label="Open Pomodoro timer"
        style={{
          // Position from uiStacks registry (bl stack slot 'pomodoro').
          // Hides with 200ms fade when MathLive virtual keyboard is open.
          position: 'fixed',
          bottom: stackPos.bottom,
          right: stackPos.right,
          zIndex: 235,
          opacity: kbOpen ? 0 : 1,
          pointerEvents: kbOpen ? 'none' : 'auto',
          transition: 'opacity 200ms ease',
          background: running ? 'rgba(255,107,107,0.18)' : 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${running ? accent : 'rgba(255,255,255,0.2)'}`,
          width: 56, height: 56, borderRadius: '50%', padding: 0,
          color: running ? accent : 'rgba(255,255,255,0.85)',
          fontSize: running ? 13 : 22, cursor: 'pointer',
          fontFamily: "'Heebo', system-ui, sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
          fontVariantNumeric: 'tabular-nums',
          // WCAG 2.5.5 touch target — 56px clears it outright now.
          lineHeight: 1,
        }}
      >
        {running ? <span>{fmtTime(secondsLeft)}</span> : (
          /* A stopwatch: stem, dial, hand. It names itself without the word. */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9.6 2.6h4.8" />
            <circle cx="12" cy="13.6" r="7.8" />
            <path d="M12 9.6v4l2.5 2" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 260,
        background: 'rgba(8,10,20,0.55)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* A dial, not a display.
       *
       * This panel used to be a 56px tabular-numeral readout over two chunky
       * buttons on a dark card — which is the visual signature of a
       * calculator, top display and keys below, and that is exactly how it
       * read. Nothing in it said "time": no clock, no hand, no dial. Shirli
       * saw it as a calculator, and she was reading it correctly.
       *
       * A ring that empties cannot be mistaken for a calculator, because no
       * calculator is round. It is also the same ring the avatar wears for XP,
       * in the same coral, because both are measuring progress.
       *
       * The dark is deliberate and it is on our scale — 800 into 900 — not the
       * off-palette #0d1d35 it was. A focus timer earning a darker surface than
       * the rest of the app is a mode, not an accident. */}
      <div
        onClick={e => e.stopPropagation()}
        dir="rtl"
        style={{
          background: 'radial-gradient(120% 90% at 30% 0%, #1D2434 0%, #101219 58%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 30, padding: '22px 26px 26px', width: 320,
          fontFamily: "'Assistant', sans-serif", color: '#fff',
          boxShadow: '0 24px 70px rgba(5,8,20,0.55)', textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => setOpen(false)}
            aria-label="סגור"
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%',
              color: 'rgba(255,255,255,0.75)', width: 34, height: 34, cursor: 'pointer',
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ position: 'relative', width: 220, height: 220, margin: '2px auto 20px' }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ display: 'block' }}>
            <circle cx="110" cy="110" r={R} fill="none"
                    stroke="rgba(255,255,255,0.10)" strokeWidth="10" />
            <circle cx="110" cy="110" r={R} fill="none"
                    stroke={accent} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC * (1 - pct / 100)}
                    transform="rotate(-90 110 110)"
                    style={{ transition: 'stroke-dashoffset .4s linear' }} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <div style={{
              fontSize: 46, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums', direction: 'ltr',
            }}>{fmtTime(secondsLeft)}</div>
            {/* Where you are in the four-session cycle. */}
            <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
              {[0, 1, 2, 3].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i < totalSessions % 4 ? accent : 'rgba(255,255,255,0.22)',
                }} />
              ))}
            </div>
            <div style={{
              fontSize: 11.5, fontWeight: 600, letterSpacing: '1.4px',
              color: 'rgba(255,255,255,0.55)', marginTop: 4,
            }}>{mode === 'work' ? 'פוקוס' : 'הפסקה'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button
            onClick={handleReset}
            aria-label="אפס"
            title="אפס"
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%',
              color: 'rgba(255,255,255,0.8)', width: 44, height: 44, cursor: 'pointer',
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >↺</button>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              background: running ? 'rgba(255,255,255,0.10)' : accent,
              color: running ? '#fff' : '#101219',
              border: 'none', borderRadius: 999, padding: '13px 30px',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              minWidth: 128, minHeight: 46,
            }}
          >{running ? 'השהה' : 'התחל'}</button>
        </div>

        <button
          onClick={handleSwitchMode}
          style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, marginTop: 14,
            textDecoration: 'underline', textUnderlineOffset: 4,
            minHeight: 36, padding: '0 8px',
          }}
        >{mode === 'work' ? 'דלג להפסקה' : 'דלג לפוקוס'}</button>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 20, paddingTop: 14,
          display: 'flex', justifyContent: 'space-around', fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{totalSessions}</div>
            <div>סשנים</div>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{totalFocusMin}</div>
            <div>דקות פוקוס</div>
          </div>
        </div>
      </div>
    </div>
  )
}
