import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQualityTier } from '../QualityTier'

/**
 * Smoke — instanced billboard puffs that rise from a chimney/exhaust point.
 *
 * Each puff is a soft white quad that drifts upward, expands, and fades.
 * Recycled in a ring buffer — when alpha hits 0 it respawns at the source.
 *
 * Disabled on 'low' tier.
 */
interface SmokeProps {
  /** Source position (chimney/vent) */
  position: [number, number, number]
  /** Number of puffs in the plume (default 12) */
  count?: number
  /** Rise speed in world-units per second (default 0.45) */
  riseSpeed?: number
  /** Lateral drift in X (mild wind) */
  drift?: number
  /** Smoke tint (default warm white) */
  color?: string
  /** Initial puff size */
  startScale?: number
  /** Final puff size before fade */
  endScale?: number
}

export default function Smoke({
  position,
  count       = 12,
  riseSpeed   = 0.45,
  drift       = 0.15,
  color       = '#f5e9d8',
  startScale  = 0.6,
  endScale    = 1.6,
}: SmokeProps) {
  const tier = useQualityTier(s => s.tier)
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Per-puff state: t∈[0,1] is life-progress, with offset so puffs cascade
  const puffs = useMemo(() => {
    const effectiveCount = tier === 'mid' ? Math.ceil(count * 0.7) : count
    return Array.from({ length: effectiveCount }, (_, i) => ({
      offset: i / effectiveCount,
      seed: Math.random() * 100,
    }))
  }, [count, tier])

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      tint: { value: new THREE.Color(color) },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 tint;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = smoothstep(0.85, 0.35, r);
        gl_FragColor = vec4(tint, a * 0.55);
      }
    `,
  }), [color])

  const tmp = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const lifeSpan = 4.5 // seconds per puff
    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i]
      const life = ((t / lifeSpan + p.offset) % 1)         // 0 → 1
      const y = position[1] + life * riseSpeed * lifeSpan
      const x = position[0] + Math.sin(t + p.seed) * drift * life
      const z = position[2] + Math.cos(t * 0.7 + p.seed) * drift * life
      const scale = startScale + (endScale - startScale) * life

      tmp.position.set(x, y, z)
      tmp.rotation.set(0, 0, 0)
      tmp.scale.set(scale, scale, 1)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  if (tier === 'low') return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, puffs.length]} frustumCulled={false} material={material}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  )
}
