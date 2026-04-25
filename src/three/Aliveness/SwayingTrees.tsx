import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQualityTier, INSTANCE_DENSITY } from '../QualityTier'

/**
 * SwayingTrees — a small grove of low-poly stylized trees at fixed positions,
 * gently swaying with a sin-driven Z rotation. One InstancedMesh for the
 * trunks, one for the canopies — only 2 draw calls total.
 *
 * The list of positions is tuned to fill the corners/borders of the city
 * (z ∈ [0, 9], around the perimeter) without overlapping building footprints.
 */
interface SwayingTreesProps {
  /** Override default positions */
  positions?: Array<[number, number, number]>
  /** Trunk + canopy color */
  trunkColor?: string
  canopyColor?: string
  /** Sway intensity (default 0.06 rad) */
  swayAmount?: number
  /** Sway speed (default 0.9) */
  swaySpeed?: number
}

const DEFAULT_POSITIONS: Array<[number, number, number]> = [
  // Back row (behind buildings)
  [-13, 0, -12], [-7, 0, -13], [-1, 0, -13.5], [5, 0, -12.8], [12, 0, -12],
  // Sides
  [-14, 0, -5], [13, 0, -6], [-13.5, 0, 1], [13.5, 0, 0],
  // Front (along path edges, avoiding building cells)
  [-12, 0, 5], [-7, 0, 7], [0, 0, 8], [7, 0, 7], [12, 0, 6],
  // Park area at z=3 (already has tree-large/small, add more)
  [-4, 0, 6.5], [4, 0, 6.5], [9, 0, 5],
]

export default function SwayingTrees({
  positions   = DEFAULT_POSITIONS,
  trunkColor  = '#6b4226',
  canopyColor = '#5fa05a',
  swayAmount  = 0.06,
  swaySpeed   = 0.9,
}: SwayingTreesProps) {
  const tier = useQualityTier(s => s.tier)
  const trunkRef  = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)

  // Cull instances on lower tiers
  const trees = useMemo(() => {
    const density = INSTANCE_DENSITY[tier]
    const target = Math.max(4, Math.round(positions.length * density))
    // Take first N (deterministic), each with a random sway phase
    return positions.slice(0, target).map((p, i) => ({
      pos: p,
      phase: i * 1.31, // pseudo-random spread
      heightJitter: 0.85 + (i * 0.137) % 0.4, // 0.85-1.25
    }))
  }, [positions, tier])

  const tmp = useMemo(() => new THREE.Object3D(), [])
  const baseMat = useMemo(() => ({
    trunk: new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.95 }),
    canopy: new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.85 }),
  }), [trunkColor, canopyColor])

  // Static trunk transforms (don't sway)
  useFrame((state) => {
    if (!trunkRef.current || !canopyRef.current) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i]
      const [x, y, z] = tree.pos

      // Trunk — static
      tmp.position.set(x, y + 0.6 * tree.heightJitter, z)
      tmp.rotation.set(0, 0, 0)
      tmp.scale.set(1, tree.heightJitter, 1)
      tmp.updateMatrix()
      trunkRef.current.setMatrixAt(i, tmp.matrix)

      // Canopy — sways from base, sin-driven Z + slight X
      const swayZ = Math.sin(t * swaySpeed + tree.phase) * swayAmount
      const swayX = Math.cos(t * swaySpeed * 0.7 + tree.phase) * swayAmount * 0.5
      tmp.position.set(x, y + 1.4 * tree.heightJitter, z)
      tmp.rotation.set(swayX, 0, swayZ)
      tmp.scale.set(0.95 * tree.heightJitter, 0.95 * tree.heightJitter, 0.95 * tree.heightJitter)
      tmp.updateMatrix()
      canopyRef.current.setMatrixAt(i, tmp.matrix)
    }
    trunkRef.current.instanceMatrix.needsUpdate = true
    canopyRef.current.instanceMatrix.needsUpdate = true
  })

  if (trees.length === 0) return null

  return (
    <group>
      {/* Trunks: thin cylinders */}
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
        material={baseMat.trunk}
      >
        <cylinderGeometry args={[0.15, 0.22, 1.2, 6]} />
      </instancedMesh>

      {/* Canopies: low-poly icospheres / cones */}
      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        material={baseMat.canopy}
      >
        <icosahedronGeometry args={[1.0, 0]} />
      </instancedMesh>
    </group>
  )
}
