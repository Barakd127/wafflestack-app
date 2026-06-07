import { useEffect, useRef } from 'react'
import { useLearningStore } from '../store/learningStore'
import { useTutorialStore } from '../store/tutorialStore'
import { macroTierForFeature, MACRO_TIERS, type FeatureId } from '../config/featureUnlocks'
import { tourStepIds } from './CoachmarkTour'

/**
 * TierTourTrigger — no UI. Watches `learningStore.newlyUnlocked` and, when a
 * freshly-unlocked feature belongs to a macro tier whose tour the user hasn't
 * completed, opens that tier's guided tour.
 *
 * Anti-bombard pacing (per product requirement "don't overwhelm the student"):
 *   • At most ONE tour auto-opens per page session (module flag below).
 *   • Auto-open waits until the unlock toast queue drains, so toast → tour are
 *     sequential, never stacked.
 *   • Any further tier that unlocks the same session does NOT auto-open — it
 *     sets `pendingTourId` so the 🎓 סיור button gently pulses instead.
 *   • Suppressed entirely in adminMode (that toggle unlocks everything at once).
 */

// Resets on a full page reload — exactly the "once per session" window we want.
let openedThisSession = false

export default function TierTourTrigger() {
  const newlyUnlocked  = useLearningStore(s => s.newlyUnlocked)
  const adminMode      = useLearningStore(s => s.adminMode)
  const startTour      = useTutorialStore(s => s.startTour)
  const setPendingTour = useTutorialStore(s => s.setPendingTour)

  const seenTours  = useRef<Set<string>>(new Set())
  const tourToOpen = useRef<string | null>(null)

  // 1) Classify each fresh unlock into a macro-tier tour.
  useEffect(() => {
    if (adminMode || !newlyUnlocked || newlyUnlocked.length === 0) return
    const { hasCompletedTour } = useTutorialStore.getState()
    for (const feat of newlyUnlocked) {
      const tier = macroTierForFeature(feat as FeatureId)
      if (!tier) continue
      const meta = MACRO_TIERS.find(m => m.id === tier)
      if (!meta || seenTours.current.has(meta.tourId)) continue
      seenTours.current.add(meta.tourId)
      if (hasCompletedTour(meta.tourId)) continue          // already toured this tier
      if (!openedThisSession && !tourToOpen.current) {
        tourToOpen.current = meta.tourId                   // first → auto-open after toast
      } else {
        setPendingTour(meta.tourId)                        // rest → gentle pulse nudge
      }
    }
  }, [newlyUnlocked, adminMode, setPendingTour])

  // 2) Once the unlock toast queue empties, auto-open the queued tour (once).
  useEffect(() => {
    if (adminMode) return
    if (newlyUnlocked && newlyUnlocked.length > 0) return  // toast still showing
    const tid = tourToOpen.current
    if (!tid || openedThisSession) return
    const timer = setTimeout(() => {
      if (openedThisSession) return
      if (useTutorialStore.getState().activeTour) return   // user already in a tour
      openedThisSession = true
      tourToOpen.current = null
      startTour(tid, tourStepIds(tid))                     // non-force: respects completion
    }, 700)                                                 // small beat after toast exit
    return () => clearTimeout(timer)
  }, [newlyUnlocked, adminMode, startTour])

  return null
}
