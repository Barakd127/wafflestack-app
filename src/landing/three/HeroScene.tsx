import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Cycle through these buildings — after the user has seen 2 full rotations,
// fade out, swap to the next model, fade in. Loops forever.
const BUILDINGS = [
  '/kenney/building-skyscraper-a.glb',
  '/kenney/building-skyscraper-c.glb',
  '/kenney/building-sample-tower-a.glb',
  '/kenney/building-j.glb',
] as const

const ROTATION_SPEED = 0.35   // rad/s — full rotation ≈ 18s
const ROTATIONS_PER_BUILDING = 2
const FADE_DURATION = 0.6     // seconds for crossfade

function CyclingBuilding() {
  const group = useRef<THREE.Group>(null!)
  const [index, setIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const cycleRef = useRef({ rotationsDone: 0, lastY: 0, fadeStart: 0, fading: false })

  // Preload all models so swap is instant — no flash of empty.
  BUILDINGS.forEach(path => useGLTF.preload(path))

  const { scene } = useGLTF(BUILDINGS[index])
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    c.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const applyGlow = (mat: THREE.Material) => {
          const m = mat.clone() as THREE.MeshStandardMaterial
          if ('emissive' in m) {
            m.emissive = new THREE.Color('#2b5ce6')
            m.emissiveIntensity = 0.15
          }
          m.transparent = true
          return m
        }
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(applyGlow)
          : applyGlow(mesh.material)
      }
    })
    return c
  }, [scene, index])

  // Sync material opacity whenever it changes (for fade in/out)
  useEffect(() => {
    cloned.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const setOp = (mat: THREE.Material) => {
          const m = mat as THREE.MeshStandardMaterial
          m.opacity = opacity
          m.transparent = true
          m.needsUpdate = true
        }
        if (Array.isArray(mesh.material)) mesh.material.forEach(setOp)
        else setOp(mesh.material)
      }
    })
  }, [opacity, cloned])

  useFrame((_, delta) => {
    if (!group.current) return

    // Bobbing
    group.current.position.y = Math.sin(performance.now() * 0.0008) * 0.08

    const c = cycleRef.current

    if (c.fading) {
      // Fade out, swap model, fade in
      const elapsed = (performance.now() / 1000) - c.fadeStart
      const halfDur = FADE_DURATION / 2
      if (elapsed < halfDur) {
        // Fade out current
        setOpacity(Math.max(0, 1 - (elapsed / halfDur)))
      } else if (elapsed < FADE_DURATION) {
        // Mid-fade: swap model + start fading in
        if (opacity < 0.05) {
          setIndex(i => (i + 1) % BUILDINGS.length)
          c.lastY = 0
          group.current.rotation.y = 0
        }
        setOpacity((elapsed - halfDur) / halfDur)
      } else {
        // Done fading
        setOpacity(1)
        c.fading = false
        c.rotationsDone = 0
      }
      return
    }

    // Normal rotation
    group.current.rotation.y += delta * ROTATION_SPEED
    const totalRot = group.current.rotation.y
    if (totalRot - c.lastY >= Math.PI * 2) {
      c.rotationsDone += 1
      c.lastY = totalRot
      if (c.rotationsDone >= ROTATIONS_PER_BUILDING) {
        c.fading = true
        c.fadeStart = performance.now() / 1000
      }
    }
  })

  return (
    <group ref={group} scale={0.95} position={[0, -0.6, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [4.2, 3.2, 7.2], fov: 38 }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.2} color="#d8e7fa" />
      <directionalLight intensity={1.6} position={[5, 8, 3]} color="#ffffff" />
      <pointLight intensity={0.6} position={[-3, 4, -2]} color="#3351CA" />
      <Sparkles count={30} scale={4} size={1.2} speed={0.25} color="#D4AF37" opacity={0.45} />
      <Suspense fallback={null}>
        <CyclingBuilding />
      </Suspense>
    </Canvas>
  )
}
