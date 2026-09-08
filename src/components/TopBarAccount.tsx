/**
 * TopBarAccount — the account cluster at the end of the top bar.
 *
 * Replaces three separate controls that used to sit in the bar and say the
 * same thing three ways: the "שלום, <name>" label, the standalone dark-mode
 * button, and the red יציאה pill. They are now one avatar with a chevron, and
 * everything they did lives behind it.
 *
 * The menu is deliberately shallow — settings that exist today are theme and
 * sign-out, so they are both one click from the chevron rather than nested in
 * a submenu that would hold two items.
 *
 * TopBarBell sits beside it. It takes a list and shows a red dot when the list
 * is not empty; with an empty list it opens an honest empty state rather than
 * nothing at all, because a control that does not respond reads as broken and
 * one that says "nothing here" reads as finished.
 *
 * NOTHING PRODUCES THAT LIST YET. The shape is here so the first producer is a
 * one-line change: the daily tip being ready, a level-up, a course unlocking.
 */
import { useEffect, useRef, useState } from 'react'

const INK = 'var(--sh-text-dark)'

/** Closes the popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  insetInlineStart: 0,
  minWidth: 216,
  background: '#fff',
  border: '1px solid rgba(31,62,108,0.14)',
  borderRadius: 16,
  boxShadow: '0 14px 34px rgba(20,34,78,0.20)',
  padding: 8,
  zIndex: 60,
  fontFamily: "'Assistant', sans-serif",
  direction: 'rtl',
  textAlign: 'right',
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '9px 12px',
  background: 'transparent', border: 'none', borderRadius: 10,
  cursor: 'pointer', fontSize: 15, color: INK,
  fontFamily: "'Assistant', sans-serif", textAlign: 'right',
}

const sectionStyle: React.CSSProperties = {
  padding: '8px 12px 4px',
  fontSize: 13, fontWeight: 600, letterSpacing: '0.2px',
  color: 'var(--sh-text-light)',
}

function BellIcon({ filled = false }: { filled?: boolean }) {
  /* Line at rest, solid once the panel is open — the same switch the sidebar
     rows make. Both are the same silhouette, so nothing moves when it flips. */
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.4a1.5 1.5 0 0 1 1.5 1.5v.55a6.7 6.7 0 0 1 5.2 6.53v2.92l1.62 2.5a1.05 1.05 0 0 1-.88 1.62H4.56a1.05 1.05 0 0 1-.88-1.62l1.62-2.5V11a6.7 6.7 0 0 1 5.2-6.53V3.9A1.5 1.5 0 0 1 12 2.4z" />
        <path d="M9.5 19.3h5a2.5 2.5 0 0 1-5 0z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.2 7.5-2.2 7.5h16.4S18 14.5 18 8.5Z" />
      <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden
         style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .16s ease' }}>
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}

/** One notification. Nothing produces these yet — see the note on TopBarBell. */
export type WsNotification = { id: string; text: string; when?: string }

export function TopBarBell({ items = [] }: { items?: WsNotification[] }) {
  const unread = items.length
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="התראות"
        title="התראות"
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(31,62,108,0.07)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
        style={{
          background: open ? 'rgba(31,62,108,0.14)' : 'transparent',
          border: 'none', borderRadius: 10, position: 'relative',
          transition: 'background .15s ease',
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#2530A6', cursor: 'pointer',
        }}
      >
        <BellIcon filled={open} />
        {unread > 0 && (
          /* The same mark the tour launcher already uses for "there is
             something new", down to the 2px white ring that keeps it legible
             against whatever it overlaps. One sign, one meaning. */
          <span aria-hidden style={{
            position: 'absolute', top: 6, insetInlineEnd: 6,
            width: 9, height: 9, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #fff',
          }} />
        )}
      </button>
      {open && (
        <div style={panelStyle} role="dialog" aria-label="התראות">
          <div style={sectionStyle}>התראות</div>
          {unread === 0 ? (
            <div style={{ padding: '10px 12px 12px', fontSize: 15, color: 'var(--sh-text-med)' }}>
              אין התראות חדשות
            </div>
          ) : (
            items.map(n => (
              <div key={n.id} style={{ padding: '9px 12px', fontSize: 15, color: INK, lineHeight: 1.45 }}>
                {n.text}
                {n.when && (
                  <div style={{ fontSize: 13, color: 'var(--sh-text-light)', marginTop: 2 }}>{n.when}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function TopBarAccount({
  userName, onLogout, darkMode, onToggleDark,
}: {
  userName: string
  onLogout?: () => void
  darkMode?: boolean
  onToggleDark?: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const initial = (userName || '').trim().charAt(0) || 'א'

  const themeRow = (label: string, wantDark: boolean) => {
    const active = !!darkMode === wantDark
    return (
      <button
        key={label}
        onClick={() => { if (!active) onToggleDark?.(); setOpen(false) }}
        style={{ ...rowStyle, fontWeight: active ? 700 : 400 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(31,62,108,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        aria-pressed={active}
      >
        <span style={{ width: 16, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 }}>
          {active ? '✓' : ''}
        </span>
        {label}
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`חשבון — ${userName}`}
        title={userName}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: open ? 'rgba(31,62,108,0.14)' : 'transparent',
          border: 'none', borderRadius: 999,
          padding: '3px 8px 3px 3px', cursor: 'pointer', color: INK,
        }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--sh-sidebar-bg)',
          border: '1px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: "'Assistant', sans-serif",
          fontSize: 15, fontWeight: 700, flexShrink: 0,
        }}>{initial}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div style={panelStyle} role="menu">
          <div style={{ ...sectionStyle, paddingTop: 4 }}>{userName}</div>
          <div style={{ height: 1, background: 'rgba(31,62,108,0.10)', margin: '6px 8px' }} />
          {onToggleDark && (
            <>
              <div style={sectionStyle}>ערכת נושא</div>
              {themeRow('מצב בהיר', false)}
              {themeRow('מצב כהה', true)}
              <div style={{ height: 1, background: 'rgba(31,62,108,0.10)', margin: '6px 8px' }} />
            </>
          )}
          {onLogout && (
            <button
              onClick={() => { setOpen(false); onLogout() }}
              style={{ ...rowStyle, color: '#C0392B', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,57,43,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: 16, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 }}>↩</span>
              יציאה
            </button>
          )}
        </div>
      )}
    </div>
  )
}
