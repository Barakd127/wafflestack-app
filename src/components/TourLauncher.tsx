import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTutorialStore } from '../store/tutorialStore'
import { useLearningStore } from '../store/learningStore'
import { MACRO_TIERS, FEATURE_UNLOCKS, macroTierForFeature, type MacroTier } from '../config/featureUnlocks'
import { tourStepIds } from './CoachmarkTour'
import Tooltip from './Tooltip'

/**
 * 🎓 סיור launcher. Replaces the old "reset coachmarks" button. Opens a small
 * panel with one tab per macro tier (בסיסי / בינוני / מתקדם); picking a tier
 * force-replays its guided tour. A tier whose features the user hasn't unlocked
 * yet shows a 🔒 hint but is still previewable. Pulses while a tour is pending
 * (a tier unlocked but wasn't auto-opened this session — anti-bombard nudge).
 */

// How many features live in each macro tier (for the "x/y פתוחים" hint).
const TIER_FEATURE_COUNT: Record<MacroTier, number> = FEATURE_UNLOCKS.reduce((acc, r) => {
  const t = macroTierForFeature(r.feature)
  if (t) acc[t] = (acc[t] ?? 0) + 1
  return acc
}, { basic: 0, intermediate: 0, advanced: 0 } as Record<MacroTier, number>)

export default function TourLauncher() {
  // Open state lives in the store so the mobile hamburger menu can open the
  // same launcher (the topbar button is hidden inside an account ribbon on
  // mobile). The panel is portaled to <body> so it shows even though this
  // component renders inside that hidden ribbon.
  const open            = useTutorialStore(s => s.launcherOpen)
  const setOpenStore    = useTutorialStore(s => s.setLauncherOpen)
  const startTour       = useTutorialStore(s => s.startTour)
  const pendingTourId   = useTutorialStore(s => s.pendingTourId)
  const setPendingTour  = useTutorialStore(s => s.setPendingTour)
  const unlocked        = useLearningStore(s => s.unlockedFeatures)
  const adminMode       = useLearningStore(s => s.adminMode)
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenStore(typeof v === 'function' ? v(useTutorialStore.getState().launcherOpen) : v)

  // Opening the launcher clears the pending nudge.
  useEffect(() => { if (open && pendingTourId) setPendingTour(null) }, [open, pendingTourId, setPendingTour])

  const unlockedCountFor = (tier: MacroTier): number =>
    unlocked.filter(id => macroTierForFeature(id as never) === tier).length

  const launch = (tourId: string) => {
    startTour(tourId, tourStepIds(tourId), true) // force = replay even if completed
    setOpen(false)
  }

  const pulse = !!pendingTourId && !open

  return (
    <div style={{ position: 'relative' }}>
      <style>{'@keyframes ws-tourbtn-pulse{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)}50%{box-shadow:0 0 0 7px rgba(99,102,241,0)}}'}</style>
      <Tooltip label="סיורים מודרכים" description="בחר טיר וצפה בסיור">
        <button
          data-tour="tour-btn"
          onClick={() => setOpen(o => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{
            position: 'relative',
            background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            color: '#6366f1', fontSize: 12, fontFamily: "'Rubik', sans-serif", fontWeight: 600,
            animation: pulse ? 'ws-tourbtn-pulse 1.4s ease-out infinite' : undefined,
          }}
        >
          🎓 סיור
          {pulse && (
            <span style={{
              position: 'absolute', top: -4, insetInlineEnd: -4, width: 9, height: 9,
              borderRadius: '50%', background: '#ef4444', border: '2px solid #fff',
            }} />
          )}
        </button>
      </Tooltip>

      {open && createPortal(
        <>
          {/* click-away */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10_000 }} />
          {/* Panel is portaled to <body> + position:FIXED so it escapes the
              topbar/ribbon clipping & the (mobile) hidden account ribbon, and is
              never cut off. Anchored under the topbar on the inline-end edge. */}
          <div
            role="menu" dir="rtl"
            style={{
              position: 'fixed', top: 64, insetInlineEnd: 12, zIndex: 10_001,
              width: 290, maxWidth: 'calc(100vw - 24px)',
              background: '#fff', borderRadius: 14,
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
              padding: 12, fontFamily: "'Rubik', sans-serif",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1F2640', marginBottom: 4 }}>סיורים מודרכים</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>בחר רמה כדי לצפות בסיור שלה</div>

            {MACRO_TIERS.map(meta => {
              const total = TIER_FEATURE_COUNT[meta.id]
              const have = adminMode ? total : unlockedCountFor(meta.id)
              const isLocked = have === 0 && !adminMode
              const isNew = pendingTourId === meta.tourId
              return (
                <button
                  key={meta.id}
                  role="menuitem"
                  onClick={() => launch(meta.tourId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    textAlign: 'right', cursor: 'pointer',
                    background: isNew ? 'rgba(99,102,241,0.08)' : 'rgba(31,38,64,0.03)',
                    border: isNew ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(31,38,64,0.08)',
                    borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{meta.emoji}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1F2640' }}>{meta.labelHe}</span>
                      {isLocked && <span title="עדיין לא נפתח — תצוגה מקדימה" style={{ fontSize: 11 }}>🔒</span>}
                      {isNew && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#6366f1', borderRadius: 999, padding: '1px 7px' }}>חדש ✨</span>}
                    </span>
                    <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{meta.descHe}</span>
                    <span style={{ display: 'block', fontSize: 10, color: isLocked ? '#b45309' : '#16a34a', marginTop: 3, fontWeight: 600 }}>
                      {isLocked ? 'תצוגה מקדימה' : `${have}/${total} פיצ׳רים פתוחים`}
                    </span>
                  </span>
                  <span style={{ fontSize: 16, color: '#6366f1' }}>▸</span>
                </button>
              )
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
