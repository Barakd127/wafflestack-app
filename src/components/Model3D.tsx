import { useRef, useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

interface Model3DProps {
  modelPath: string
  position: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
  /** Material treatment. 'standard' keeps original PBR, 'toon' swaps to MeshToonMaterial for stylized look */
  tone?: 'standard' | 'toon'
  /** Override base color (applied to all materials) */
  colorOverride?: string
  /** Emissive color for hover/selected glow (use ref-driven intensity for animation) */
  emissive?: string
  /** Emissive intensity (0..1+); set via parent ref for animated glow */
  emissiveIntensity?: number
}

/**
 * Lazily-built shared toon gradient map (3-step). Reused across all toon-mode meshes.
 */
let _toonGradient: THREE.Texture | null = null
function getToonGradient(): THREE.Texture {
  if (_toonGradient) return _toonGradient
  const data = new Uint8Array([60, 60, 60, 255, 160, 160, 160, 255, 240, 240, 240, 255])
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat)
  tex.needsUpdate = true
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  _toonGradient = tex
  return tex
}

/**
 * Model3D — loads a GLB once and renders an instance with cloned materials.
 *
 * Performance notes:
 *   - `useGLTF` caches the loaded scene globally (one fetch + parse).
 *   - We use `SkeletonUtils.clone` once (memoized) per mount, which clones
 *     the node tree and skeletons but SHARES geometry (huge GC win vs. naive
 *     `scene.clone(true)` on every render).
 *   - Materials are cloned per-instance so per-mesh tint/emissive don't bleed.
 *   - Toon mode swaps MeshStandardMaterial → MeshToonMaterial with a shared
 *     3-step gradient map — gives a cozy stylized look at zero extra memory.
 */
const Model3D = ({
  modelPath,
  position,
  scale = 1,
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
  tone = 'standard',
  colorOverride,
  emissive,
  emissiveIntensity = 0,
}: Model3DProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene: originalScene } = useGLTF(modelPath)

  // Clone once per mount (shares geometry, clones nodes/materials)
  const scene = useMemo(() => {
    const clone = SkeletonUtils.clone(originalScene)

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!(mesh.isMesh)) return

      mesh.castShadow    = castShadow
      mesh.receiveShadow = receiveShadow

      const swapMaterial = (mat: THREE.Material): THREE.Material => {
        if (tone === 'toon' && mat instanceof THREE.MeshStandardMaterial) {
          // Convert PBR → toon, preserving color/map
          const toon = new THREE.MeshToonMaterial({
            color: colorOverride ?? mat.color,
            map:   mat.map ?? undefined,
            gradientMap: getToonGradient(),
            transparent: mat.transparent,
            opacity:     mat.opacity,
            emissive: emissive ? new THREE.Color(emissive) : new THREE.Color(0x000000),
            emissiveIntensity,
          })
          return toon
        }
        // Standard mode — clone original to detach from cache
        const cloned = mat.clone()
        if (cloned instanceof THREE.MeshStandardMaterial) {
          if (colorOverride) cloned.color.set(colorOverride)
          if (emissive) {
            cloned.emissive.set(emissive)
            cloned.emissiveIntensity = emissiveIntensity
          }
          cloned.envMapIntensity = 1
          cloned.needsUpdate = true
        }
        return cloned
      }

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(swapMaterial)
      } else if (mesh.material) {
        mesh.material = swapMaterial(mesh.material)
      }
    })

    return clone
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalScene, tone, colorOverride, emissive])

  // Allow live emissiveIntensity updates without rebuilding the scene
  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      const apply = (mat: THREE.Material) => {
        if ('emissiveIntensity' in mat) {
          (mat as THREE.MeshStandardMaterial).emissiveIntensity = emissiveIntensity
        }
      }
      Array.isArray(mesh.material) ? mesh.material.forEach(apply) : apply(mesh.material)
    })
  }, [scene, emissiveIntensity])

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={rotation}
    >
      <primitive object={scene} />
    </group>
  )
}

export default Model3D
