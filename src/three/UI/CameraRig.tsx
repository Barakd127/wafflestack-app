import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CameraRig — smoothly animates the camera and OrbitControls target between
 * "home" view and a focused view on a specific building.
 *
 * When `focusOn` is null → glides back to `homePosition` / `homeTarget`.
 * When set      → glides to a position near `focusOn` (offset upward + back).
 *
 * Uses simple per-frame lerp (no react-spring import needed; we already pull
 * in three) — gives a soft ease-out feel when factor is small (~0.06).
 *
 * Mount inside the Canvas, AFTER <OrbitControls makeDefault />.
 */
interface CameraRigProps {
  focusOn: [number, number, number] | null
  /** Camera offset from the focus point (default looks down + back) */
  focusOffset?: [number, number, number]
  /** Home camera position to return to */
  homePosition?: [number, number, number]
  /** Home target to return to */
  homeTarget?: [number, number, number]
  /** Lerp speed (0..1 per frame, default 0.07) */
  speed?: number
}

export default function CameraRig({
  focusOn,
  focusOffset  = [4, 5, 6],
  homePosition = [20, 18, 20],
  homeTarget   = [0, 0, -3],
  speed        = 0.07,
}: CameraRigProps) {
  const camera = useThree(s => s.camera)
  const controls = useThree(s => s.controls) as any

  const desiredPos     = useRef(new THREE.Vector3(...homePosition))
  const desiredTarget  = useRef(new THREE.Vector3(...homeTarget))
  const animating      = useRef(false)

  // When focusOn changes, set the new desired pose
  useEffect(() => {
    if (focusOn) {
      desiredTarget.current.set(focusOn[0], focusOn[1] + 1.5, focusOn[2])
      desiredPos.current.set(
        focusOn[0] + focusOffset[0],
        focusOn[1] + focusOffset[1],
        focusOn[2] + focusOffset[2],
      )
    } else {
      desiredPos.current.set(...homePosition)
      desiredTarget.current.set(...homeTarget)
    }
    animating.current = true
  }, [focusOn, focusOffset, homePosition, homeTarget])

  useFrame(() => {
    if (!animating.current) return
    if (!controls) return

    // Lerp camera position
    camera.position.lerp(desiredPos.current, speed)
    // Lerp controls target
    controls.target.lerp(desiredTarget.current, speed)

    // Stop when close enough
    const posErr    = camera.position.distanceTo(desiredPos.current)
    const targetErr = controls.target.distanceTo(desiredTarget.current)
    if (posErr < 0.05 && targetErr < 0.05) {
      camera.position.copy(desiredPos.current)
      controls.target.copy(desiredTarget.current)
      animating.current = false
    }
    controls.update?.()
  })

  return null
}
