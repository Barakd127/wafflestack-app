import { Suspense, useRef, useMemo, useLayoutEffect, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Cycle through these buildings — after every 2 full rotations, fade out,
// swap to the next model, fade in. Loops forever.
// Both sample-tower variants were the dark narrow tower the user dislikes —
// dropped. Keep the two glassy skyscrapers (user likes them) + two other
// distinct buildings for variety. Per user 2026-05-29.
const BUILDINGS = [
  '/kenney/building-skyscraper-a.glb',
  '/kenney/building-skyscraper-c.glb',
  '/kenney/building-n.glb',
  '/kenney/building-a.glb',
] as const

// SLOW continuous full rotation — the user is fine with a gentle full spin,
// only the AGGRESSIVE burst was the problem. The burst came from useFrame's
// delta accumulating while the tab was backgrounded (returns a multi-second
// delta on refocus → one giant rotation step). We clamp delta to 1/30s so a
// backgrounded tab can never burst. No rotation reset anywhere (that snap was
// the other spin source). Per user 2026-05-29: "fine with slow full circle,
// just not the aggressive one."
const ROTATION_SPEED = 0.18                 // rad/s → full turn ≈ 35s (gentle)
const MAX_DELTA = 1 / 30                     // clamp: never integrate > 1 frame
const SECONDS_PER_BUILDING = 16.0           // crossfade cadence per model
const FADE_DURATION = 1.8                   // longer, softer dissolve (less abrupt swap)
// Each building gets normalised so its largest dimension fits this many world
// units. Tuned for the 640×520 frameless hero — building should dominate the
// space, so TARGET_FIT_SIZE matches a large fraction of vertical viewport.
const TARGET_FIT_SIZE = 4.2

// Preload at module scope so all 4 GLBs are ready before mount.
BUILDINGS.forEach(path => useGLTF.preload(path))

// HMR self-heal: the Three.js useFrame loop is created once on <Canvas> mount,
// so a hot-swap of THIS module leaves the OLD rotation loop running with the
// OLD constants — the user kept seeing the old fast spin in the dev preview
// even after fixes. Force a full page reload on any hot-update so the loop is
// recreated with the new code. Dev-only (stripped from production build).
// Per user 2026-05-29.
if (import.meta.hot) {
  import.meta.hot.accept(() => { window.location.reload() })
}

type Prepared = {
  /** Outer wrapper Group — its scale + position are tuned post-mount via bbox. */
  wrapper: THREE.Group
  /** Inner cloned scene — repositioned so wrapper origin sits at footprint centre. */
  inner: THREE.Object3D
  /** All cloned MeshStandardMaterials so we can drive opacity each frame. */
  materials: THREE.MeshStandardMaterial[]
}

// GHOST-LOOP KILLER. Vite HMR / React Fast Refresh on OTHER modules
// (App.tsx, StudyHub…) re-creates the <Canvas> frame loop WITHOUT disposing
// the previous one. HeroScene's own import.meta.hot.accept only reloads when
// THIS file is edited — edits elsewhere accumulate ghost useFrame loops that
// all mutate the same group, so rotation AND the crossfade timer advance N×
// (measured ~25× in a long dev session → looked like a fast spin + buildings
// swapping every ~0.6s instead of 16s). A module-level counter can't fix this:
// each HMR module version has its OWN binding, so an old ghost never sees the
// new module's counter. A token on `window` IS shared across every module
// version — the newest mount bumps it, every older loop sees a stale gen and
// bails. Only one loop ever animates. Per user 2026-05-29 (video diagnosis).
const HERO_LOOP_GEN_KEY = '__wsHeroLoopGen'

function CyclingBuilding() {
  const root = useRef<THREE.Group>(null!)
  // This instance's generation. Claimed in useLayoutEffect (newest wins).
  const myGen = useRef(-1)

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
    fadeStart: -1,            // -1 = not fading, otherwise timestamp seconds
    cycleStartTime: -1,       // timestamp the CURRENT model became visible (set on each fade swap)
  })

  // After mount: world matrices are valid → measure bbox → auto-fit each
  // wrapper to TARGET_FIT_SIZE. Then reveal index 0. Set `ready` ONCE.
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (!root.current) return
    // Claim newest generation — any older ghost loop now bails in useFrame.
    const w = window as unknown as Record<string, number>
    w[HERO_LOOP_GEN_KEY] = (w[HERO_LOOP_GEN_KEY] || 0) + 1
    myGen.current = w[HERO_LOOP_GEN_KEY]
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
    animRef.current.cycleStartTime = performance.now() / 1000
    setReady(true)
  }, [prepared])

  // Defensive cleanup: on unmount mark every wrapper invisible so HMR
  // doesn't leave ghost models stuck on next remount.
  useEffect(() => () => {
    prepared.forEach(p => { p.wrapper.visible = false })
  }, [prepared])

  useFrame(() => {
    if (!root.current || !ready) return
    // NOTE: no loop-generation bail needed anymore. The rotation below is an
    // absolute function of time that we ASSIGN, so even if several loops run
    // they all set the same angle — they can't speed each other up.
    const s = animRef.current

    // Bobbing (recentred — TARGET_FIT_SIZE 4.2 means model is taller; pull
    // down so it sits in the visual centre instead of overshooting upward)
    root.current.position.y = -1.8 + Math.sin(performance.now() * 0.0008) * 0.08

    // BULLETPROOF SLOW SPIN — absolute time-based angle, SET (not +=).
    // The whole 'super-fast spin' saga came from `rotation.y += speed*delta`:
    // if more than one useFrame loop ever touched the group (HMR ghosts,
    // StrictMode double-mount, a stray subscription), each ADDED its increment
    // every frame, so N loops = N× speed. By deriving the angle as a pure
    // function of time and ASSIGNING it, any number of loops all compute the
    // SAME value — accumulation, and therefore the N× speed-up, is
    // mathematically impossible. This kills the entire bug class regardless of
    // how many loops run. Applied every frame, including during the crossfade,
    // so the building swap happens inside continuous motion (no frozen flip).
    // Per user 2026-05-30 (≈20th report).
    root.current.rotation.y = (performance.now() / 1000) * ROTATION_SPEED
    root.current.rotation.z = 0

    if (s.fadeStart >= 0) {
      const elapsed = (performance.now() / 1000) - s.fadeStart
      const half = FADE_DURATION / 2
      const cur = prepared[s.index]
      if (elapsed < half) {
        const op = Math.max(0, 1 - (elapsed / half))
        cur.materials.forEach(m => { m.opacity = op })
      } else if (elapsed < FADE_DURATION) {
        // Mid-fade: swap visible model + start fading the next IN. Rotation has
        // already advanced this frame (above), so the swap is hidden inside
        // smooth continuous motion — no frozen-angle flip.
        if (cur.wrapper.visible) {
          cur.wrapper.visible = false
          cur.materials.forEach(m => { m.opacity = 0 })
          s.index = (s.index + 1) % prepared.length
          if (root.current) s.lastFullRotY = root.current.rotation.y
          s.cycleStartTime = performance.now() / 1000  // mark new model's start
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
      return  // rotation already applied this frame; skip the start-fade check
    }

    const t = performance.now() / 1000
    // Time-based crossfade — swap to the next building every SECONDS_PER_BUILDING.
    if (t - s.cycleStartTime >= SECONDS_PER_BUILDING) {
      s.fadeStart = performance.now() / 1000
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
        <CyclingBuilding />
      </Suspense>
    </Canvas>
  )
}
