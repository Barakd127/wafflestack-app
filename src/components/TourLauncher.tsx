import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTutorialStore } from '../store/tutorialStore'
import { useLearningStore } from '../store/learningStore'
import { MACRO_TIERS, FEATURE_UNLOCKS, FEATURE_META, FEATURE_UNLOCKS_BY_ID, macroTierForFeature, type MacroTier, type FeatureId } from '../config/featureUnlocks'
import { featureTourStepIds, tourStepIds } from './CoachmarkTour'
import Tooltip from './Tooltip'

/**
 * 🎓 סיור launcher. Lists EVERY feature, grouped into 3 collapsible tier
 * sections (בסיסי / בינוני / מתקדם). Clicking a feature force-replays that
 * feature's guided demo. Locked features are previewable (🔒). Pulses while a
 * tour is pending (a feature unlocked but wasn't auto-opened this session).
 */

// Features per macro tier, in continuum order.
const FEATURES_BY_TIER: Record<MacroTier, FeatureId[]> = FEATURE_UNLOCKS.reduce((acc, r) => {
  const t = macroTierForFeature(r.feature)
  if (t) acc[t].push(r.feature)
  return acc
}, { basic: [], intermediate: [], advanced: [] } as Record<MacroTier, FeatureId[]>)

export default function TourLauncher() {
  const open            = useTutorialStore(s => s.launcherOpen)
  const setOpenStore    = useTutorialStore(s => s.setLauncherOpen)
  const startTour       = useTutorialStore(s => s.startTour)
  const pendingTourId   = useTutorialStore(s => s.pendingTourId)
  const setPendingTour  = useTutorialStore(s => s.setPendingTour)
  const unlocked        = useLearningStore(s => s.unlockedFeatures)
  const adminMode       = useLearningStore(s => s.adminMode)
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenStore(typeof v === 'function' ? v(useTutorialStore.getState().launcherOpen) : v)

  const isUnlocked = (fid: FeatureId) => adminMode || unlocked.includes(fid)
  const unlockedCountFor = (tier: MacroTier) => FEATURES_BY_TIER[tier].filter(isUnlocked).length

  // Expanded sections: default-open the tiers that have any unlocked feature,
  // plus the tier holding a pending demo; collapse fully-locked tiers.
  const [expanded, setExpanded] = useState<Record<MacroTier, boolean>>(() => {
    const out = { basic: false, intermediate: false, advanced: false } as Record<MacroTier, boolean>
    MACRO_TIERS.forEach(t => { out[t.id] = FEATURES_BY_TIER[t.id].some(isUnlocked) })
    if (!out.basic && !out.intermediate && !out.advanced) out.basic = true
    return out
  })

  // Opening the launcher clears the pending nudge.
  useEffect(() => { if (open && pendingTourId) setPendingTour(null) }, [open, pendingTourId, setPendingTour])

  const launchFeature = (fid: FeatureId) => {
    startTour('feat-' + fid, featureTourStepIds(fid), true) // force = replay even if completed
    setOpen(false)
  }

  // Always-on intro walkthrough — launchable regardless of XP/unlocks.
  const launchBasic = () => {
    startTour('tour-basic', tourStepIds('tour-basic'), true)
    setOpen(false)
  }

  const pulse = !!pendingTourId && !open

  return (
    <div style={{ position: 'relative' }}>
      <style>{'@keyframes ws-tourbtn-pulse{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)}50%{box-shadow:0 0 0 7px rgba(99,102,241,0)}}'}</style>
      <Tooltip label="סיורים מודרכים" description="בחר פיצ'ר וצפה בהדגמה">
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
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10_000 }} />
          <div
            role="menu" dir="rtl"
            style={{
              position: 'fixed', top: 64, insetInlineEnd: 12, zIndex: 10_001,
              width: 320, maxWidth: 'calc(100vw - 24px)', maxHeight: '78vh', overflowY: 'auto',
              background: '#fff', borderRadius: 14,
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
              padding: 12, fontFamily: "'Rubik', sans-serif",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1F2640', marginBottom: 2 }}>סיורים מודרכים</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>בחר פיצ׳ר וצפה בהדגמה חיה</div>

            {/* Pinned always-on intro walkthrough — launchable at 0 XP, before
                any feature unlocks. Sits above the tier sections. */}
            <button
              role="menuitem"
              onClick={launchBasic}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'right',
                cursor: 'pointer', marginBottom: 10,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.05))',
                border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, padding: '10px 12px',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 20, width: 24, textAlign: 'center' }}>👋</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 13.5, color: '#1F2640' }}>סיור היכרות</span>
                <span style={{ display: 'block', fontSize: 10.5, color: '#6b7280', marginTop: 1, lineHeight: 1.35 }}>איך לומדים, איך צוברים XP ואיך נפתחים כלים — תמיד זמין</span>
              </span>
              <span style={{ fontSize: 14, color: '#6366f1' }}>▸</span>
            </button>

            {MACRO_TIERS.map(tier => {
              const feats = FEATURES_BY_TIER[tier.id]
              const have = unlockedCountFor(tier.id)
              const isOpen = expanded[tier.id]
              // Fully-locked tier (no unlocked feature, not admin) → off-coloured
              // header that matches the locked feature rows below it.
              const dim = have === 0 && !adminMode
              return (
                <div key={tier.id} style={{ marginBottom: 8 }}>
                  {/* Tier section header */}
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [tier.id]: !e[tier.id] }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'right',
                      cursor: 'pointer',
                      background: dim ? 'rgba(31,38,64,0.05)' : 'rgba(99,102,241,0.06)',
                      border: dim ? '1px solid rgba(31,38,64,0.12)' : '1px solid rgba(99,102,241,0.18)',
                      borderRadius: 10, padding: '8px 10px',
                      fontFamily: 'inherit',
                      opacity: dim ? 0.55 : 1,
                      filter: dim ? 'grayscale(0.85)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{dim ? '🔒' : tier.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: dim ? '#8b90a0' : '#1F2640' }}>{tier.labelHe}</span>
                      <span style={{ fontSize: 10, color: dim ? '#9aa0ad' : '#16a34a', fontWeight: 600, marginInlineStart: 8 }}>{have}/{feats.length} פתוחים</span>
                    </span>
                    <span style={{ fontSize: 13, color: dim ? '#b6bac6' : '#6366f1', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▸</span>
                  </button>

                  {/* Feature rows */}
                  {isOpen && (
                    <div style={{ paddingTop: 6 }}>
                      {feats.map(fid => {
                        const meta = FEATURE_META[fid]
                        const locked = !isUnlocked(fid)
                        const isNew = pendingTourId === 'feat-' + fid
                        return (
                          <button
                            key={fid}
                            role="menuitem"
                            aria-disabled={locked || undefined}
                            onClick={locked ? undefined : () => launchFeature(fid)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'right',
                              cursor: locked ? 'default' : 'pointer',
                              background: locked ? 'rgba(31,38,64,0.05)' : (isNew ? 'rgba(99,102,241,0.08)' : 'transparent'),
                              border: isNew ? '1px solid rgba(99,102,241,0.45)' : '1px solid transparent',
                              borderRadius: 9, padding: '8px 10px', marginBottom: 2, fontFamily: 'inherit',
                              opacity: locked ? 0.5 : 1,
                              filter: locked ? 'grayscale(0.8)' : 'none',
                            }}
                          >
                            <span style={{ fontSize: 18, lineHeight: 1, width: 22, textAlign: 'center', position: 'relative' }}>
                              {locked ? '🔒' : meta?.emoji}
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: locked ? '#8b90a0' : '#1F2640' }}>{meta?.labelHe}</span>
                                {locked && <span style={{ fontSize: 9, fontWeight: 700, color: '#6b7280', background: 'rgba(31,38,64,0.08)', borderRadius: 999, padding: '1px 6px' }}>נעול</span>}
                                {isNew && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#6366f1', borderRadius: 999, padding: '1px 6px' }}>חדש ✨</span>}
                              </span>
                              <span style={{ display: 'block', fontSize: 10.5, color: locked ? '#9aa0ad' : '#6b7280', marginTop: 1, lineHeight: 1.35 }}>
                                {FEATURE_UNLOCKS_BY_ID[fid]?.descriptionHe}
                              </span>
                            </span>
                            <span style={{ fontSize: 14, color: locked ? '#b6bac6' : '#6366f1' }}>{locked ? '🔒' : '▸'}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
