import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useQualityTier } from '../QualityTier'

/**
 * CameraDrift — gentle ambient orbit on the camera target.
 *
 * Adds a soft sin-based offset (±0.18 units in X/Z) to OrbitControls' target,
 * giving the city a subtle "breathing" feel. Pauses while the user is actively
 * dragging or zooming.
 *
 * Mount inside <Canvas>, after <OrbitControls>. Pass the OrbitControls ref via
 * `controlsRef` (drei OrbitControls forwards a ref). Disabled on 'low' tier.
 */
interface CameraDriftProps {
  /** Drift amplitude in world units (default 0.18) */
  amplitude?: number
  /** Drift speed (default 0.15) */
  speed?: number
}

export default function CameraDrift({ amplitude = 0.18, speed = 0.15 }: CameraDriftProps) {
  const tier = useQualityTier(s => s.tier)
  const { controls } = useThree() as any
  const interacting = useRef(false)
  const baseTarget = useRef<{ x: number; y: number; z: number } | null>(null)

  // Hook into OrbitControls' interaction lifecycle
  useEffect(() => {
    if (!controls) return
    const onStart = () => { interacting.current = true }
    const onEnd   = () => {
      interacting.current = false
      // Re-anchor base target after user finishes dragging
      baseTarget.current = { x: controls.target.x, y: controls.target.y, z: controls.target.z }
    }
    if (!baseTarget.current && controls.target) {
      baseTarget.current = { x: controls.target.x, y: controls.target.y, z: controls.target.z }
    }
    controls.addEventListener?.('start', onStart)
    controls.addEventListener?.('end',   onEnd)
    return () => {
      controls.removeEventListener?.('start', onStart)
      controls.removeEventListener?.('end',   onEnd)
    }
  }, [controls])

  useFrame((state) => {
    if (tier === 'low') return
    if (interacting.current) return
    if (!controls?.target || !baseTarget.current) return

    const t = state.clock.elapsedTime
    controls.target.x = baseTarget.current.x + Math.sin(t * speed)        * amplitude
    controls.target.z = baseTarget.current.z + Math.cos(t * speed * 0.83) * amplitude
    controls.update?.()
  })

  return null
}
