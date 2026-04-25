import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * SwayingTrees — a grove of stylized low-poly trees at fixed positions,
 * gently swaying with a sin-driven Z rotation. One InstancedMesh for the
 * trunks, one for the canopies — only 2 draw calls total.
 *
 * Tree count is intentionally FIXED (no tier-based culling) because:
 *  - Changing InstancedMesh count between frames causes visual pop-in/pop-out
 *  - 17 trees at 2 draw calls is negligible cost on every tier
 *
 * Canopy uses a 7-sided cone — recognizable, stylized, very low-poly.
 */
interface SwayingTreesProps {
  positions?: Array<[number, number, number]>
  trunkColor?: string
  canopyColor?: string
  swayAmount?: number
  swaySpeed?: number
}

const DEFAULT_POSITIONS: Array<[number, number, number]> = [
  // Back row (behind buildings)
  [-13, 0, -12], [-7, 0, -13], [-1, 0, -13.5], [5, 0, -12.8], [12, 0, -12],
  // Sides
  [-14, 0, -5], [13, 0, -6], [-13.5, 0, 1], [13.5, 0, 0],
  // Front (along path edges, avoiding building cells)
  [-12, 0, 5], [-7, 0, 7], [0, 0, 8], [7, 0, 7], [12, 0, 6],
  // Park area at z=3
  [-4, 0, 6.5], [4, 0, 6.5], [9, 0, 5],
]

// Per-tree data computed once, never changes with tier
const TREE_DATA = DEFAULT_POSITIONS.map((pos, i) => ({
  pos,
  phase: i * 1.31,
  heightJitter: 0.85 + (i * 0.137) % 0.4, // 0.85-1.25
}))

export default function SwayingTrees({
  positions   = DEFAULT_POSITIONS,
  trunkColor  = '#7a5c3a',
  canopyColor = '#4e9e52',
  swayAmount  = 0.055,
  swaySpeed   = 0.75,
}: SwayingTreesProps) {
  const trunkRef  = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)

  // Use treeData derived from positions (not tier — stable count!)
  const treeData = useMemo(() => {
    return positions.map((pos, i) => ({
      pos,
      phase: i * 1.31,
      heightJitter: 0.85 + (i * 0.137) % 0.4,
    }))
  }, [positions])

  const COUNT = treeData.length

  const tmp = useMemo(() => new THREE.Object3D(), [])

  const materials = useMemo(() => ({
    trunk: new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.95 }),
    canopy: new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.82, flatShading: true }),
  }), [trunkColor, canopyColor])

  useFrame((state) => {
    if (!trunkRef.current || !canopyRef.current) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < treeData.length; i++) {
      const tree = treeData[i]
      const [x, y, z] = tree.pos

      // Trunk — static cylinder
      tmp.position.set(x, y + 0.6 * tree.heightJitter, z)
      tmp.rotation.set(0, 0, 0)
      tmp.scale.set(1, tree.heightJitter, 1)
      tmp.updateMatrix()
      trunkRef.current.setMatrixAt(i, tmp.matrix)

      // Canopy cone — sways from pivot at its base
      const swayZ = Math.sin(t * swaySpeed + tree.phase) * swayAmount
      const swayX = Math.cos(t * swaySpeed * 0.65 + tree.phase) * swayAmount * 0.4
      // Cone origin is at center, so shift up by half-height (0.9) to pivot from base
      const coneHalfH = 0.9 * tree.heightJitter
      tmp.position.set(x, y + 1.2 * tree.heightJitter + coneHalfH, z)
      tmp.rotation.set(swayX, 0, swayZ)
      tmp.scale.set(tree.heightJitter, tree.heightJitter, tree.heightJitter)
      tmp.updateMatrix()
      canopyRef.current.setMatrixAt(i, tmp.matrix)
    }

    trunkRef.current.instanceMatrix.needsUpdate = true
    canopyRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* Trunks: hexagonal cylinders */}
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, COUNT]}
        castShadow
        receiveShadow
        material={materials.trunk}
      >
        <cylinderGeometry args={[0.13, 0.20, 1.2, 6]} />
      </instancedMesh>

      {/* Canopies: 7-sided cones — recognizable stylized tree silhouette */}
      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, COUNT]}
        castShadow
        material={materials.canopy}
      >
        {/* radiusTop=0 (pointy), radiusBottom=0.85, height=1.8, radialSegments=7 */}
        <coneGeometry args={[0.85, 1.8, 7]} />
      </instancedMesh>
    </group>
  )
}
