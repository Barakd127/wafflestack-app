import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

function RotatingBuilding() {
  const group = useRef<THREE.Group>(null!)
  const { scene } = useGLTF('/kenney/building-skyscraper-a.glb')
  const cloned = SkeletonUtils.clone(scene)

  cloned.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh
    if (mesh.isMesh && mesh.material) {
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
    }
  })

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.getElapsedTime() * 0.18
    group.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08
  })

  return <group ref={group} scale={0.95} position={[0, -0.6, 0]}><primitive object={cloned} /></group>
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [4.2, 3.2, 7.2], fov: 38 }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.55} color="#cfdfff" />
      <directionalLight intensity={1.3} position={[5, 8, 3]} color="#fff5d2" />
      <pointLight intensity={0.9} position={[-3, 4, -2]} color="#2b5ce6" />
      <Sparkles count={40} scale={4} size={1.5} speed={0.3} color="#E8C84A" opacity={0.6} />
      <Suspense fallback={null}>
        <RotatingBuilding />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/kenney/building-skyscraper-a.glb')
