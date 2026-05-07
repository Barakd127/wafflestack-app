/**
 * TutorialOverlay — Mounted once at the app root. Reads the tutorial
 * registry + store and renders a single `<Coachmark/>` for the next
 * unseen step whose target element is currently in the DOM.
 *
 * This is intentionally simple: one coachmark visible at a time,
 * dismissed sequentially. If we later want a guided multi-step tour
 * (where one dismiss advances to the next), we can extend this to
 * auto-advance through a curated step list instead of "all unseen".
 */
import { useEffect, useState } from 'react'
import Coachmark, { type CoachmarkSpec } from './Coachmark'
import CoachmarkTour from './CoachmarkTour'
import { getRegistry, subscribeRegistry } from '../hooks/useTutorialStep'
import { useTutorialStore } from '../store/tutorialStore'

export default function TutorialOverlay() {
  const enabled      = useTutorialStore(s => s.enabled)
  const seen         = useTutorialStore(s => s.seen)
  const activeStepId = useTutorialStore(s => s.activeStepId)

  // Re-render when the registry changes
  const [, force] = useState(0)
  useEffect(() => subscribeRegistry(() => force(n => n + 1)), [])

  // Re-measure DOMRects on a slow tick — the target element may move (e.g.
  // sidebar resize, content shift). 250ms is human-imperceptible and cheap.
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => force(n => n + 1), 250)
    return () => clearInterval(id)
  }, [enabled])

  // The coachmark tour was designed for desktop (sidebar + topbar landmarks).
  // On mobile the sidebar is hidden behind a hamburger, so the spotlight
  // target either has zero size or sits in a slide-in overlay — neither
  // produces a useful tour. Disable the overlay on small screens.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  if (!enabled || isMobile) return <CoachmarkTour />

  const registry = getRegistry()

  // A target is "visible" if it's mounted AND has a non-zero rect. Elements
  // hidden via `display: none` (e.g. the sidebar nav on mobile) report a
  // zero-size rect — dimming the screen with no visible cutout would block
  // the entire UI, so we skip those steps until the target becomes visible.
  const hasVisibleRect = (el: HTMLElement | null): boolean => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }

  // Pick the step to render: explicitly active wins, else first unseen with
  // a visible target.
  let pick: ReturnType<typeof getRegistry> extends Map<string, infer V> ? V | null : never = null
  if (activeStepId && registry.has(activeStepId)) {
    const active = registry.get(activeStepId)!
    if (hasVisibleRect(active.ref.current)) pick = active
  }
  if (!pick) {
    for (const spec of registry.values()) {
      if (spec.when === false) continue
      if (seen[spec.stepId]) continue
      if (!hasVisibleRect(spec.ref.current)) continue
      pick = spec
      break
    }
  }

  if (!pick || !pick.ref.current) return <CoachmarkTour />

  const rect = pick.ref.current.getBoundingClientRect()
  const cm: CoachmarkSpec = {
    stepId: pick.stepId,
    title: pick.title,
    body: pick.body,
    placement: pick.placement,
    rect,
  }
  return (
    <>
      <Coachmark spec={cm} />
      <CoachmarkTour />
    </>
  )
}
