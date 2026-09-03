// [ds-extract] from src/components/StudyHub.tsx @ c1a3ad12 (master)
import React from 'react';
import { TEXT_DARK } from './_shared.js';

// Ribbon — copied VERBATIM from src/components/Ribbon.tsx (types stripped);
// same markup as the bundle's app/Ribbon.jsx, inlined so TopBar is standalone.
function Ribbon({ label, hideLabel, children }) {
  return (
    <div className="ws-ribbon" aria-label={label}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {children}
      </div>
      {!hideLabel && <span className="ws-ribbon-label">{label}</span>}
    </div>
  )
}

/**
 * TopBar — the 70px app-shell top bar: page title + context controls on the
 * start side, the ribbon strip (progress XP / potions / account) on the end
 * side. Gold hairline bottom border via --sh-topbar-border over the
 * --sh-topbar-bg glass gradient.
 */
export function TopBar({
  title = 'דף הבית',
  onLogout,
  darkMode,
  onToggleDark,
  contextControls,
  // [ds-extract] replaced localStorage.getItem('userName') with userName prop — visual output unchanged
  userName = 'Student',
  // [ds-extract] replaced useLearningStore(state => state.xp) (zustand) with xp prop — visual output unchanged
  xp = 0,
  // [ds-extract] replaced <PotionInventory /> (economy-store potion icons) with potionsSlot prop, default null — ribbon shell unchanged
  potionsSlot = null,
  // [ds-extract] replaced <TourLauncher /> (tutorial-store guided-tours button) with tourLauncherSlot prop, default null — ribbon shell unchanged
  tourLauncherSlot = null,
}) {
  return (
    <div className="ws-topbar" style={{
      background: 'var(--sh-topbar-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--sh-topbar-border)',
      height: 70,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
    }} dir="rtl">
      {/* Title + context controls share the START side so nav controls (e.g.
          the topics מפה/רשימה toggle + back button) sit right next to the
          title instead of stealing space from the board content area. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 auto', minWidth: 0 }}>
        <h1 style={{
          fontFamily: "'Rubik', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: TEXT_DARK,
          margin: 0,
          letterSpacing: '-0.5px',
          textShadow: '0 1px 4px rgba(255,255,255,0.8)',
          // Shrink + ellipsize so the actions (logout etc.) never overlap the
          // title on narrow widths. Per user 2026-06-02.
          flex: '1 1 auto', minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginInlineEnd: 16,
        }}>{title}</h1>
        {contextControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {contextControls}
          </div>
        )}
      </div>
      <div className="ws-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }} dir="ltr">
        {/* Dark-mode toggle, integrated into topbar per user 2026-05-24
            (was a floating fixed button at top-right obscuring sidebar icons). */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            aria-label={darkMode ? 'הפעל מצב בהיר' : 'הפעל מצב כהה'}
            title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
            style={{
              background: 'rgba(31,62,108,0.08)',
              border: '1px solid rgba(31,62,108,0.25)',
              borderRadius: 10,
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sh-text-dark)',
              cursor: 'pointer',
            }}
          >
            {darkMode ? '☀' : '☾'}
          </button>
        )}
        <span className="ws-ribbon-divider" />
        {/* Ribbon A — Progress */}
        <Ribbon label="התקדמות">
          <span style={{
            background: 'rgba(212,175,55,0.15)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 999,
            padding: '3px 10px',
            color: '#D4AF37',
            fontSize: 13,
            fontFamily: "'Rubik', sans-serif",
          }}>
            ⭐ {xp} XP
          </span>
        </Ribbon>

        <span className="ws-ribbon-divider" />

        {/* Ribbon B — Potions (label hidden per user 2026-05-24, icons keep aria) */}
        <Ribbon label="שיקויים" hideLabel>
          {potionsSlot}
        </Ribbon>

        <span className="ws-ribbon-divider" />

        {/* Ribbon C — Account (label hidden per user 2026-05-24) */}
        <Ribbon label="חשבון" hideLabel>
          <span className="hidden md:inline" style={{ fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK }}>שלום, {userName}</span>
          {tourLauncherSlot}
          {onLogout && (
            // [ds-extract] replaced <Tooltip label="יציאה" description="התנתק מהחשבון"> wrapper (hover-only overlay, hidden at rest) with a native title attribute — visual output unchanged at rest
            <button onClick={onLogout} title="יציאה — התנתק מהחשבון" style={{
              background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.2)',
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
              color: '#d32f2f', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
            }}>
              ↩ יציאה
            </button>
          )}
        </Ribbon>
      </div>
    </div>
  )
}
