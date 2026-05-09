import { Suspense, useRef, useMemo, useLayoutEffect, useState, useEffect } from 'react'
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

const ROTATION_SPEED = 0.7    // rad/s — full rotation ≈ 9s
const ROTATIONS_PER_BUILDING = 2
const FADE_DURATION = 0.6     // seconds for crossfade
// Each building gets normalised so its largest dimension fits this many world
// units. Tuned for the 260×300 (portrait) frame + camera at [3.6,2.8,6.0] /
// fov 36. Smaller value because portrait aspect narrows horizontal FOV.
const TARGET_FIT_SIZE = 2.0

// Preload at module scope so all 4 GLBs are ready before mount.
BUILDINGS.forEach(path => useGLTF.preload(path))

type Prepared = {
  /** Outer wrapper Group — its scale + position are tuned post-mount via bbox. */
  wrapper: THREE.Group
  /** Inner cloned scene — repositioned so wrapper origin sits at footprint centre. */
  inner: THREE.Object3D
  /** All cloned MeshStandardMaterials so we can drive opacity each frame. */
  materials: THREE.MeshStandardMaterial[]
}

function CyclingBuilding() {
  const root = useRef<THREE.Group>(null!)

  // Load all 4 scenes upfront — drei dedupes per-URL; module-level preload
  // ensures these resolve immediately so Suspense never falls back.
  const sceneA = useGLTF(BUILDINGS[0]).scene
  const sceneB = useGLTF(BUILDINGS[1]).scene
  const sceneC = useGLTF(BUILDINGS[2]).scene
  const sceneD = useGLTF(BUILDINGS[3]).scene
  const sources = [sceneA, sceneB, sceneC, sceneD]

  // Build wrappers with cloned scenes + glow materials, BUT do NOT compute
  // bbox here — world matrices are only valid AFTER the wrapper is parented
  // into the rendered scene graph (post-commit).
  const prepared = useMemo<Prepared[]>(() => {
    return sources.map(src => {
      const inner = SkeletonUtils.clone(src)
      const materials: THREE.MeshStandardMaterial[] = []
      inner.traverse((child: THREE.Object3D) => {
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
      const wrapper = new THREE.Group()
      wrapper.add(inner)
      // ALL wrappers start invisible. Post-mount effect will reveal index 0
      // only AFTER bbox auto-fit completes — prevents the multi-building flash.
      wrapper.visible = false
      return { wrapper, inner, materials }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drives index, fade, rotation. NEVER triggers React re-renders during
  // useFrame (no setState in the hot loop). Visibility is mutated directly
  // on wrapper.visible refs.
  const animRef = useRef({
    index: 0,
    rotationsDone: 0,
    lastFullRotY: 0,
    fadeStart: -1,   // -1 = not fading, otherwise timestamp seconds
  })

  // After mount: world matrices are valid → measure bbox → auto-fit each
  // wrapper to TARGET_FIT_SIZE. Then reveal index 0. Set `ready` ONCE.
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (!root.current) return
    prepared.forEach(p => {
      p.wrapper.updateMatrixWorld(true)
      const bbox = new THREE.Box3().setFromObject(p.inner)
      const size = new THREE.Vector3(); bbox.getSize(size)
      const center = new THREE.Vector3(); bbox.getCenter(center)
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      const fitScale = TARGET_FIT_SIZE / maxDim
      // Recentre the inner scene on the wrapper origin: x/z centred,
      // bbox.min.y mapped to 0 so model sits flush on the ground plane.
      p.inner.position.set(-center.x, -bbox.min.y, -center.z)
      p.wrapper.scale.setScalar(fitScale)
      p.wrapper.updateMatrixWorld(true)
      // Materials start fully opaque (wrapper invisible hides them anyway).
      p.materials.forEach(m => { m.opacity = 1 })
    })
    // Reveal index 0 only after all 4 are measured + scaled.
    prepared[0].wrapper.visible = true
    setReady(true)
  }, [prepared])

  // Defensive cleanup: on unmount mark every wrapper invisible so HMR
  // doesn't leave ghost models stuck on next remount.
  useEffect(() => () => {
    prepared.forEach(p => { p.wrapper.visible = false })
  }, [prepared])

  useFrame((_, delta) => {
    if (!root.current || !ready) return
    const s = animRef.current

    // Bobbing
    root.current.position.y = -1.0 + Math.sin(performance.now() * 0.0008) * 0.08

    if (s.fadeStart >= 0) {
      const elapsed = (performance.now() / 1000) - s.fadeStart
      const half = FADE_DURATION / 2
      const cur = prepared[s.index]
      if (elapsed < half) {
        const op = Math.max(0, 1 - (elapsed / half))
        cur.materials.forEach(m => { m.opacity = op })
      } else if (elapsed < FADE_DURATION) {
        // Mid-fade: swap visible model + start fading the next IN.
        if (cur.wrapper.visible) {
          cur.wrapper.visible = false
          cur.materials.forEach(m => { m.opacity = 0 })
          s.index = (s.index + 1) % prepared.length
          if (root.current) root.current.rotation.y = 0
          s.lastFullRotY = 0
          const next = prepared[s.index]
          next.wrapper.visible = true
          next.materials.forEach(m => { m.opacity = 0 })
        }
        const next = prepared[s.index]
        const op = (elapsed - half) / half
        next.materials.forEach(m => { m.opacity = op })
      } else {
        // Fade complete.
        prepared[s.index].materials.forEach(m => { m.opacity = 1 })
        s.fadeStart = -1
        s.rotationsDone = 0
      }
      return
    }

    // Normal rotation
    root.current.rotation.y += delta * ROTATION_SPEED
    if (root.current.rotation.y - s.lastFullRotY >= Math.PI * 2) {
      s.rotationsDone += 1
      s.lastFullRotY = root.current.rotation.y
      if (s.rotationsDone >= ROTATIONS_PER_BUILDING) {
        s.fadeStart = performance.now() / 1000
      }
    }
  })

  return (
    <group ref={root}>
      {prepared.map((p, i) => (
        <primitive key={i} object={p.wrapper} />
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
