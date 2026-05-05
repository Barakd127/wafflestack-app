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

  if (!enabled) return null

  const registry = getRegistry()

  // Pick the step to render: explicitly active wins, else first unseen.
  let pick: ReturnType<typeof getRegistry> extends Map<string, infer V> ? V | null : never = null
  if (activeStepId && registry.has(activeStepId)) {
    pick = registry.get(activeStepId)!
  } else {
    for (const spec of registry.values()) {
      if (spec.when === false) continue
      if (seen[spec.stepId]) continue
      if (!spec.ref.current) continue
      pick = spec
      break
    }
  }

  if (!pick || !pick.ref.current) return null

  const rect = pick.ref.current.getBoundingClientRect()
  const cm: CoachmarkSpec = {
    stepId: pick.stepId,
    title: pick.title,
    body: pick.body,
    placement: pick.placement,
    rect,
  }
  return <Coachmark spec={cm} />
}
