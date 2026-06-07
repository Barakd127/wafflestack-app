import { useEffect, useRef } from 'react'
import { useLearningStore } from '../store/learningStore'
import { useTutorialStore } from '../store/tutorialStore'
import { type FeatureId } from '../config/featureUnlocks'
import { featureTourStepIds } from './CoachmarkTour'

/**
 * TierTourTrigger — no UI. Watches `learningStore.newlyUnlocked` and, when a
 * feature freshly unlocks, opens THAT feature's guided demo (`feat-<id>`).
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

  const seenFeats  = useRef<Set<string>>(new Set())
  const featToOpen = useRef<FeatureId | null>(null)

  // 1) Classify each fresh unlock into its per-feature demo tour.
  useEffect(() => {
    if (adminMode || !newlyUnlocked || newlyUnlocked.length === 0) return
    const { hasCompletedTour } = useTutorialStore.getState()
    for (const feat of newlyUnlocked as FeatureId[]) {
      if (seenFeats.current.has(feat)) continue
      seenFeats.current.add(feat)
      const tourId = 'feat-' + feat
      if (hasCompletedTour(tourId)) continue               // already saw this demo
      if (!openedThisSession && !featToOpen.current) {
        featToOpen.current = feat                          // first → auto-open after toast
      } else {
        setPendingTour(tourId)                             // rest → gentle pulse nudge
      }
    }
  }, [newlyUnlocked, adminMode, setPendingTour])

  // 2) Once the unlock toast queue empties, auto-open the queued demo (once).
  useEffect(() => {
    if (adminMode) return
    if (newlyUnlocked && newlyUnlocked.length > 0) return  // toast still showing
    const feat = featToOpen.current
    if (!feat || openedThisSession) return
    const timer = setTimeout(() => {
      if (openedThisSession) return
      if (useTutorialStore.getState().activeTour) return   // user already in a tour
      openedThisSession = true
      featToOpen.current = null
      startTour('feat-' + feat, featureTourStepIds(feat))  // non-force: respects completion
    }, 700)                                                 // small beat after toast exit
    return () => clearTimeout(timer)
  }, [newlyUnlocked, adminMode, startTour])

  return null
}
