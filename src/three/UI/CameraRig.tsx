import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CameraRig — smoothly animates the camera and OrbitControls target
 * ONLY when a building is selected (focusOn changes to non-null) or when
 * it is first deselected. Does NOT fight OrbitControls continuously.
 *
 * Bug fix: the old version put array-literal props in the dep array, so the
 * useEffect re-fired every render and kept resetting animating → true, which
 * pulled the camera back to home even while the user was zooming/panning.
 */
interface CameraRigProps {
  focusOn: [number, number, number] | null
  focusOffset?: [number, number, number]
  homePosition?: [number, number, number]
  homeTarget?: [number, number, number]
  speed?: number
}

export default function CameraRig({
  focusOn,
  focusOffset  = [5, 4, 7],
  homePosition = [0, 25, 45],
  homeTarget   = [0, 0, 0],
  speed        = 0.07,
}: CameraRigProps) {
  const camera   = useThree(s => s.camera)
  const controls = useThree(s => s.controls) as any

  const desiredPos    = useRef(new THREE.Vector3(...homePosition))
  const desiredTarget = useRef(new THREE.Vector3(...homeTarget))
  const animating     = useRef(false)
  // Store previous focusOn so we only animate on ACTUAL changes
  const prevFocusKey  = useRef<string>('')
  const hasInitiated  = useRef(false)

  useEffect(() => {
    // Build a key so we only react to actual focusOn changes, not re-renders
    const key = focusOn ? focusOn.join(',') : 'home'
    if (key === prevFocusKey.current && hasInitiated.current) return
    prevFocusKey.current = key
    hasInitiated.current = true

    if (focusOn) {
      desiredTarget.current.set(focusOn[0], focusOn[1] + 1.5, focusOn[2])
      desiredPos.current.set(
        focusOn[0] + focusOffset[0],
        focusOn[1] + focusOffset[1],
        focusOn[2] + focusOffset[2],
      )
      animating.current = true
    }
    // Note: when focusOn goes null we do NOT auto-fly home anymore — the user
    // already positioned the camera where they want it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOn])

  useFrame(() => {
    if (!animating.current || !controls) return

    camera.position.lerp(desiredPos.current, speed)
    controls.target.lerp(desiredTarget.current, speed)

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
