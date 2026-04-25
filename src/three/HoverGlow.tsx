import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * HoverGlow — applies an animated emissive intensity to all meshes inside its
 * wrapped group, lerping toward `target` each frame.
 *
 * Cheaper than React state-driven hover: zero re-renders, zero React commits.
 * Wrap a building/group with this to get cozy "warm-up on hover" feel.
 *
 * Usage:
 *   <HoverGlow target={hovered ? 0.6 : 0} color="#ffd166">
 *     <mesh ... />
 *   </HoverGlow>
 */
interface HoverGlowProps {
  target: number          // desired emissiveIntensity (0..1+)
  color?: string          // emissive color (default warm gold)
  speed?: number          // lerp speed factor (default 0.12)
  children: React.ReactNode
}

export default function HoverGlow({
  target,
  color = '#ffd166',
  speed = 0.12,
  children,
}: HoverGlowProps) {
  const ref = useRef<THREE.Group>(null)
  const current = useRef(0)
  const colorObj = useRef(new THREE.Color(color))

  // Sync color when prop changes (rare)
  useEffect(() => { colorObj.current.set(color) }, [color])

  useFrame(() => {
    const grp = ref.current
    if (!grp) return
    // Lerp current → target
    current.current += (target - current.current) * speed
    if (Math.abs(current.current - target) < 0.001) current.current = target

    grp.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      const apply = (mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial
        if ('emissive' in m) {
          m.emissive.copy(colorObj.current)
          m.emissiveIntensity = current.current
        }
      }
      Array.isArray(mesh.material) ? mesh.material.forEach(apply) : apply(mesh.material)
    })
  })

  return <group ref={ref}>{children}</group>
}
