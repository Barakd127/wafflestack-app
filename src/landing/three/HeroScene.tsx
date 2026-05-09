import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Cycle through these buildings — after every 2 full rotations, fade out,
// swap to the next model, fade in. Loops forever.
const BUILDINGS = [
  '/kenney/building-skyscraper-a.glb',
  '/kenney/building-skyscraper-c.glb',
  '/kenney/building-sample-tower-a.glb',
  '/kenney/building-j.glb',
] as const

const ROTATION_SPEED = 0.7    // rad/s — full rotation ≈ 9s (2× previous)
const ROTATIONS_PER_BUILDING = 2
const FADE_DURATION = 0.6     // seconds for crossfade
// Each building gets normalised so its largest dimension fits this many world
// units. Keeps short and tall models visually consistent in the hero frame.
const TARGET_FIT_SIZE = 2.6

// Preload at module scope so all 4 models are ready before the component
// mounts. Avoids Suspense flashes when the model index changes.
BUILDINGS.forEach(path => useGLTF.preload(path))

function CyclingBuilding() {
  const group = useRef<THREE.Group>(null!)

  // Load all 4 scenes up front (drei dedupes per-URL). Pre-clone + pre-glow
  // each one so swapping is just toggling visibility — no Suspense, no
  // re-clone, no React re-render per frame.
  const scenes = [
    useGLTF(BUILDINGS[0]).scene,
    useGLTF(BUILDINGS[1]).scene,
    useGLTF(BUILDINGS[2]).scene,
    useGLTF(BUILDINGS[3]).scene,
  ]

  const prepared = useMemo(() => {
    return scenes.map(scene => {
      const c = SkeletonUtils.clone(scene)
      const materials: THREE.MeshStandardMaterial[] = []
      c.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh || !mesh.material) return
        const applyGlow = (mat: THREE.Material) => {
          const m = mat.clone() as THREE.MeshStandardMaterial
          if ('emissive' in m) {
            m.emissive = new THREE.Color('#2b5ce6')
            m.emissiveIntensity = 0.15
          }
          m.transparent = true
          m.opacity = 1
          materials.push(m)
          return m
        }
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(applyGlow)
          : applyGlow(mesh.material)
      })
      // Normalise: compute world-space bounding box, recentre origin,
      // uniform-scale to TARGET_FIT_SIZE so tall and squat buildings render
      // at the same visual height. Wrap in an outer Group so .scale and
      // .position act on the whole subtree without fighting the model's
      // internal transforms.
      const bbox = new THREE.Box3().setFromObject(c)
      const size = new THREE.Vector3(); bbox.getSize(size)
      const center = new THREE.Vector3(); bbox.getCenter(center)
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      const fitScale = TARGET_FIT_SIZE / maxDim
      const wrapper = new THREE.Group()
      c.position.set(-center.x, -bbox.min.y, -center.z)  // sit on Y=0, centred X/Z
      wrapper.add(c)
      wrapper.scale.setScalar(fitScale)
      return { object: wrapper, materials }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // All driven imperatively in useFrame — no React state, no per-frame
  // re-render. fading: -1 = not fading, otherwise = fadeStart timestamp.
  const stateRef = useRef({
    index: 0,
    rotationsDone: 0,
    lastFullRotY: 0,
    fadeStart: -1,
  })

  // Set initial visibility — only model 0 visible
  useMemo(() => {
    prepared.forEach((p, i) => { p.object.visible = (i === 0) })
  }, [prepared])

  useFrame((_, delta) => {
    if (!group.current) return
    const s = stateRef.current

    // Bobbing
    group.current.position.y = Math.sin(performance.now() * 0.0008) * 0.08

    if (s.fadeStart >= 0) {
      const elapsed = (performance.now() / 1000) - s.fadeStart
      const half = FADE_DURATION / 2
      const cur = prepared[s.index]
      if (elapsed < half) {
        // Fade out current
        const op = Math.max(0, 1 - (elapsed / half))
        cur.materials.forEach(m => { m.opacity = op })
      } else if (elapsed < FADE_DURATION) {
        // Mid-fade: swap visible model + fade IN the next one
        if (cur.object.visible) {
          cur.object.visible = false
          cur.materials.forEach(m => { m.opacity = 0 })
          s.index = (s.index + 1) % prepared.length
          group.current.rotation.y = 0
          s.lastFullRotY = 0
          const next = prepared[s.index]
          next.object.visible = true
          next.materials.forEach(m => { m.opacity = 0 })
        }
        const next = prepared[s.index]
        const op = (elapsed - half) / half
        next.materials.forEach(m => { m.opacity = op })
      } else {
        // Done
        prepared[s.index].materials.forEach(m => { m.opacity = 1 })
        s.fadeStart = -1
        s.rotationsDone = 0
      }
      return
    }

    // Normal rotation
    group.current.rotation.y += delta * ROTATION_SPEED
    if (group.current.rotation.y - s.lastFullRotY >= Math.PI * 2) {
      s.rotationsDone += 1
      s.lastFullRotY = group.current.rotation.y
      if (s.rotationsDone >= ROTATIONS_PER_BUILDING) {
        s.fadeStart = performance.now() / 1000
      }
    }
  })

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {prepared.map((p, i) => (
        <primitive key={i} object={p.object} />
      ))}
    </group>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [3.6, 2.8, 6.0], fov: 36 }}
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
