import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useQualityTier } from '../QualityTier'

/**
 * Clouds — flat soft-edged billboards that drift across the sky.
 *
 * Cheap: one InstancedMesh, no shaders beyond a soft-disc fragment, sin-x drift,
 * frozen entirely on `'low'` quality tier (returns null).
 *
 * Position is in world space; clouds are placed in a band above the city.
 */
interface CloudsProps {
  /** Number of clouds (default 6). Halved automatically on 'mid' tier */
  count?: number
  /** Y altitude for the cloud band (default 22) */
  altitude?: number
  /** Horizontal range over which clouds drift (default 80) */
  range?: number
  /** Drift speed in world units / second (default 0.6) */
  speed?: number
}

export default function Clouds({
  count    = 6,
  altitude = 22,
  range    = 80,
  speed    = 0.6,
}: CloudsProps) {
  const tier = useQualityTier(s => s.tier)
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Per-instance constants (positions, scales, phase offsets)
  const inst = useMemo(() => {
    const effectiveCount = tier === 'mid' ? Math.ceil(count * 0.6) : count
    const items: Array<{ x: number; y: number; z: number; sx: number; sz: number; phase: number; speed: number }> = []
    for (let i = 0; i < effectiveCount; i++) {
      items.push({
        x: (Math.random() - 0.5) * range,
        y: altitude + (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * range * 0.6,
        sx: 6 + Math.random() * 4,         // 6-10 width
        sz: 3 + Math.random() * 1.5,       // 3-4.5 depth
        phase: Math.random() * Math.PI * 2,
        speed: speed * (0.7 + Math.random() * 0.6),
      })
    }
    return items
  }, [count, altitude, range, speed, tier])

  // Soft-edge cloud material: white core fading to alpha=0 at edges
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      tint: { value: new THREE.Color('#fff8ef') },
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
        // soft elliptical falloff
        vec2 d = (vUv - 0.5) * vec2(1.6, 1.0);
        float r = length(d);
        float a = smoothstep(0.55, 0.20, r);
        // little internal noise for fluffiness
        float fluff = 0.85 + 0.15 * sin(vUv.x * 30.0) * sin(vUv.y * 18.0);
        gl_FragColor = vec4(tint * fluff, a * 0.85);
      }
    `,
  }), [])

  const tmp = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < inst.length; i++) {
      const c = inst[i]
      // Looping drift across `range`
      const x = ((c.x + t * c.speed + range / 2) % range) - range / 2
      const y = c.y + Math.sin(t * 0.15 + c.phase) * 0.3
      tmp.position.set(x, y, c.z)
      tmp.rotation.set(-Math.PI / 2, 0, 0)
      tmp.scale.set(c.sx, c.sz, 1)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  if (tier === 'low') return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, inst.length]} frustumCulled={false} material={material}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  )
}
