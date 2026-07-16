import { Suspense, useRef, useMemo, useLayoutEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Pool of buildings. Each page load randomly shows ONE of them — there is NO
// switching/crossfade between buildings anymore. The building-swap crossfade
// was the source of the recurring "insanely fast transition" complaint
// (≈20 reports). Per user 2026-05-30: "ditch the switch per load — let each
// load randomly assign one building and spin it slowly without switching."
// Absolute '/kenney/...' resolves against the DOMAIN root, not the app's
// deployed subpath (GitHub Pages serves this app under /wafflestack-app/) —
// that mismatch 404'd every model and killed the hero's WebGL context.
const BUILDINGS = [
  'kenney/building-skyscraper-a.glb',
  'kenney/building-skyscraper-c.glb',
  'kenney/building-n.glb',
  'kenney/building-a.glb',
].map(p => `${import.meta.env.BASE_URL}${p}`)

// Gentle continuous rotation. The angle is an ABSOLUTE function of time that we
// ASSIGN (not +=). Accumulation was the entire fast-spin bug: if more than one
// useFrame loop ever touched the group (HMR ghosts, StrictMode double-mount),
// each ADDED its increment so N loops = N× speed. Assigning a pure function of
// time makes any number of loops compute the SAME angle — a speed-up is
// arithmetically impossible. No crossfade, no delta, no loop counting.
const ROTATION_SPEED = 0.18                 // rad/s → full turn ≈ 35s (gentle)
const TARGET_FIT_SIZE = 4.2                 // normalise each model's largest dim to this

// Preload all GLBs so the randomly-chosen one resolves instantly (no Suspense flash).
BUILDINGS.forEach(path => useGLTF.preload(path))

// HMR self-heal: the useFrame loop is created once on <Canvas> mount, so a
// hot-swap of THIS module would leave the old loop running. Force a full reload
// on hot-update so the loop is recreated with new code. Dev-only.
if (import.meta.hot) {
  import.meta.hot.accept(() => { window.location.reload() })
}

function SingleBuilding() {
  const root = useRef<THREE.Group>(null!)

  // Pick ONE building at random, once, for this page load. Stable for the
  // component's lifetime (state initializer runs once).
  const [idx] = useState(() => Math.floor(Math.random() * BUILDINGS.length))
  const scene = useGLTF(BUILDINGS[idx]).scene

  // Clone the chosen scene + apply the blue glow. No opacity animation needed.
  const { wrapper, inner } = useMemo(() => {
    const inner = SkeletonUtils.clone(scene)
    inner.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      const applyGlow = (mat: THREE.Material) => {
        const m = mat.clone() as THREE.MeshStandardMaterial
        if ('emissive' in m) {
          m.emissive = new THREE.Color('#2b5ce6')
          m.emissiveIntensity = 0.15
        }
        return m
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(applyGlow)
        : applyGlow(mesh.material)
    })
    const wrapper = new THREE.Group()
    wrapper.add(inner)
    wrapper.visible = false   // revealed after bbox auto-fit, to avoid a flash
    return { wrapper, inner }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [ready, setReady] = useState(false)

  // After mount: world matrices are valid → measure bbox → auto-fit to
  // TARGET_FIT_SIZE, recentre on the ground plane, then reveal.
  useLayoutEffect(() => {
    if (!root.current) return
    wrapper.updateMatrixWorld(true)
    const bbox = new THREE.Box3().setFromObject(inner)
    const size = new THREE.Vector3(); bbox.getSize(size)
    const center = new THREE.Vector3(); bbox.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    inner.position.set(-center.x, -bbox.min.y, -center.z)
    wrapper.scale.setScalar(TARGET_FIT_SIZE / maxDim)
    wrapper.updateMatrixWorld(true)
    wrapper.visible = true
    setReady(true)
  }, [wrapper, inner])

  useFrame(() => {
    if (!root.current || !ready) return
    // Gentle bob + absolute time-based rotation. Assigning (not accumulating)
    // means stray/ghost loops can never speed it up.
    root.current.position.y = -1.8 + Math.sin(performance.now() * 0.0008) * 0.08
    root.current.rotation.y = (performance.now() / 1000) * ROTATION_SPEED
    root.current.rotation.z = 0
  })

  return (
    <group ref={root}>
      <primitive object={wrapper} />
    </group>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [5.0, 3.6, 8.5], fov: 38 }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.2} color="#d8e7fa" />
      <directionalLight intensity={1.6} position={[5, 8, 3]} color="#ffffff" />
      <pointLight intensity={0.6} position={[-3, 4, -2]} color="#3351CA" />
      <Sparkles count={30} scale={4} size={1.2} speed={0.25} color="#D4AF37" opacity={0.45} />
      <Suspense fallback={null}>
        <SingleBuilding />
      </Suspense>
    </Canvas>
  )
}
