// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';
import { SIDEBAR_BG, SIDEBAR_ACTIVE } from './_shared.js';

// EduCity-style clean line icons. SVG with stroke-currentColor so the
// active-state gold tint applies uniformly. No emoji, no gradient chips.
// Each icon is a 22x22 viewBox 24, 1.8 stroke, rounded line caps.
const NAV_ITEMS = [
  { id: 'home',    label: 'דף הבית',        iconKey: 'home' },
  { id: 'courses', label: 'אזור למידה',     iconKey: 'book' },
  { id: 'arsenal', label: 'הארסנל שלי',     iconKey: 'trophy', feature: 'arsenal' },
  // 'מפת הלמידה שלי' removed as a separate destination — the concept map now
  // lives only inside אזור למידה (the 🗺️ מפה tab). Per user 2026-06-09.
  { id: null,      label: 'העולם שלי',      iconKey: 'globe', action: 'world' },
  { id: null,      label: 'סיורים מודרכים', iconKey: 'tour',  action: 'tours' },
];

function renderIcon(k) {
  const stroke = 'currentColor'
  const sw = 1.8
  const lc = 'round'
  const lj = 'round'
  switch (k) {
    case 'home':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
    case 'book':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/></svg>
    case 'trophy':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 6H3v2a3 3 0 0 0 3 3"/><path d="M19 6h2v2a3 3 0 0 1-3 3"/><path d="M9 19h6"/><path d="M12 14v5"/></svg>
    case 'map':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16"/><path d="M15 6v16"/></svg>
    case 'globe':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18"/><path d="M12 3a13 13 0 0 0 0 18"/></svg>
    case 'tour':
      return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap={lc} strokeLinejoin={lj}><path d="M5 21V4"/><path d="M5 4l9 3-9 3"/><path d="M5 13l11 3-11 3" opacity="0.55"/></svg>
    default:
      return null
  }
}

/**
 * AdminToggle — small pill at the bottom of the sidebar that flips adminMode.
 */
function AdminToggle({ collapsed }) {
  // [ds-extract] replaced useLearningStore adminMode/toggleAdminMode (zustand) with local useState — visual output unchanged
  const [adminMode, setAdminMode] = React.useState(false)
  const toggle = () => setAdminMode(v => !v)
  return (
    <button
      onClick={toggle}
      aria-pressed={adminMode}
      title={adminMode ? 'אדמין: פתוח — לחץ לכיבוי' : 'אדמין: סגור — לחץ לפתיחת הכל'}
      style={{
        marginTop: 'auto', alignSelf: 'stretch',
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10, padding: collapsed ? '8px' : '8px 12px',
        background: adminMode ? 'rgba(245,200,66,0.18)' : 'rgba(255,255,255,0.06)',
        border: '1px solid ' + (adminMode ? 'rgba(245,200,66,0.55)' : 'rgba(255,255,255,0.18)'),
        color: adminMode ? '#FFD700' : 'rgba(255,255,255,0.85)',
        borderRadius: 10, cursor: 'pointer',
        fontFamily: "'Rubik', sans-serif", fontSize: 12, fontWeight: 700,
        direction: 'rtl', transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: adminMode ? '#FFD700' : 'transparent',
        color: adminMode ? '#0B1B3E' : 'currentColor',
        border: '1px solid currentColor',
        borderRadius: 6, fontSize: 14, flexShrink: 0,
      }}>{adminMode ? '🔓' : '🔒'}</span>
      {!collapsed && (
        <span style={{ whiteSpace: 'nowrap' }}>
          {adminMode ? 'אדמין פעיל' : 'מצב אדמין'}
        </span>
      )}
    </button>
  )
}

/**
 * Sidebar — the 247px RTL app-shell sidebar: glass diamond logo header,
 * nav rows with ws-icon-chip icon badges, active solid-pill row state,
 * admin toggle + Pomodoro slot at the bottom.
 */
export function Sidebar({ activeItem = 'home', onNavigate = () => {}, lockedFeatures = [], lockTips = {} }) {
  // [ds-extract] replaced useLearningStore adminMode/unlockedFeatures + isFeatureUnlocked gating with lockedFeatures prop (default: everything unlocked) — visual output unchanged
  const isLocked = (f) => !!f && lockedFeatures.includes(f)
  // [ds-extract] collapse/drag-resize removed — width fixed at 247 (collapsed = width < 80 is statically false) — visual output unchanged
  const collapsed = false
  return (
    <div style={{
      background: SIDEBAR_BG,
      width: 247, // [ds-extract] replaced width:'100%' inside the app's resizable <nav width={sidebarWidth}> wrapper with the fixed 247px default — visual output unchanged
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 24px rgba(51,81,202,0.25)',
      overflow: 'hidden',
    }}>
      {/* Logo / avatar area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(31,41,55,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {/* Diamond icon matching Figma */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polygon points="18,4 30,14 18,32 6,14" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
            <polygon points="18,4 30,14 18,17 6,14" fill="rgba(255,255,255,0.3)" />
            <line x1="6" y1="14" x2="30" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.id !== null && item.id === activeItem
          const locked = isLocked(item.feature)
          // [ds-extract] replaced FEATURE_UNLOCKS_BY_ID[item.feature]?.descriptionHe lookup with lockTips prop — visual output unchanged
          const lockTip = locked && item.feature ? lockTips[item.feature] : undefined
          return (
            <button key={i}
              disabled={locked}
              onClick={() => {
                if (locked) return
                // [ds-extract] replaced onNav/onGoWorld/onGoMindmap/onGoDrawing/onGoNotebook/onOpenTours callbacks with a single onNavigate(idOrAction) prop — visual output unchanged
                onNavigate(item.action != null ? item.action : item.id)
              }}
              title={locked ? lockTip : (collapsed ? item.label : undefined)}
              style={{
                background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                borderRadius: 32,
                padding: collapsed ? '12px 0' : '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                direction: 'rtl',
                border: 'none',
                cursor: locked ? 'not-allowed' : 'pointer',
                width: '100%',
                fontFamily: "'Rubik', sans-serif",
                fontSize: 17,
                fontWeight: isActive ? 600 : 400,
                color: '#FFFFFF',
                opacity: locked ? 0.5 : 1,
                filter: locked ? 'grayscale(0.7)' : 'none',
                transition: 'background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive && !locked) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { if (!isActive && !locked) e.currentTarget.style.background = 'transparent' }}
            >
              <span
                className={`ws-icon-chip ${isActive ? 'ws-icon-chip--active' : 'ws-icon-chip--inactive'}`}
                style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#FFD700' : 'rgba(255,255,255,0.92)',
                  borderRadius: 10,
                  border: '1px solid',
                  transition: 'color 0.15s, background 0.15s, transform 0.15s',
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                }}>{renderIcon(item.iconKey)}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              {locked && (
                <span aria-hidden="true" style={{
                  position: 'absolute',
                  top: 6, insetInlineEnd: 8,
                  background: 'linear-gradient(135deg, #1a237e, #0d1656)',
                  color: '#FFD700',
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: '2px 6px',
                  border: '1px solid rgba(255,215,0,0.5)',
                  lineHeight: 1,
                }}>🔒</span>
              )}
            </button>
          )
        })}
        <AdminToggle collapsed={collapsed} />
        {/* [ds-extract] replaced <FeatureGate id="pomodoro" mode="hide"><PomodoroTimer /></FeatureGate> with an empty placeholder slot honoring the shared --ws-pomodoro-left token (the real pill is a fixed bottom-left overlay anchored at left: var(--ws-pomodoro-left)) — visual output unchanged at rest */}
        <div aria-hidden="true" style={{ position: 'fixed', bottom: 'var(--ws-bottom-fab-inset, 20px)', left: 'var(--ws-pomodoro-left, 90px)' }} />
      </nav>
    </div>
  )
}
