/**
 * useTutorialStep — Register a contextual coachmark for an element.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null)
 *   useTutorialStep('study-sidebar', ref, {
 *     title: 'התפריט שלך',
 *     body:  'כאן תוכל לעבור בין נושאים, לימוד וחידונים.',
 *     placement: 'left',
 *   })
 *
 * The hook registers the spec in a module-level registry. The
 * `<TutorialOverlay/>` component (rendered once at the app root) reads
 * the registry, picks the next unseen step in registration order, and
 * renders a `<Coachmark/>` for it.
 */
import { useEffect, useRef, type RefObject } from 'react'
import { useTutorialStore } from '../store/tutorialStore'
import type { Placement } from '../components/Coachmark'

export interface TutorialSpec {
  stepId: string
  title: string
  body: string
  placement?: Placement
  ref: RefObject<HTMLElement | null>
  /** Optional: only show coachmark when this is true. Defaults to true. */
  when?: boolean
}

// Module-level registry — last writer wins per stepId.
const registry = new Map<string, TutorialSpec>()
const listeners = new Set<() => void>()

function notify() { listeners.forEach(l => l()) }

export function subscribeRegistry(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getRegistry(): Map<string, TutorialSpec> { return registry }

export function useTutorialStep(
  stepId: string,
  ref: RefObject<HTMLElement | null>,
  options: { title: string; body: string; placement?: Placement; when?: boolean }
): void {
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    const spec: TutorialSpec = {
      stepId,
      title: optsRef.current.title,
      body: optsRef.current.body,
      placement: optsRef.current.placement,
      ref,
      when: optsRef.current.when ?? true,
    }
    registry.set(stepId, spec)
    notify()
    return () => {
      registry.delete(stepId)
      notify()
    }
    // We intentionally don't include options in the dep array — the spec
    // is read by the overlay each render anyway via optsRef.current.
  }, [stepId, ref])
}

/** Imperatively trigger a step (e.g. from a button "Show me again"). */
export function triggerTutorialStep(stepId: string): void {
  useTutorialStore.getState().setActive(stepId)
}
