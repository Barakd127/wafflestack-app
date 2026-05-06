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
          m.emissive = new THREE.Color('#1a56db')
          m.emissiveIntensity = 0.12
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

  return <group ref={group} scale={1.4}><primitive object={cloned} /></group>
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [3, 2.5, 5], fov: 35 }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} color="#a8c5ff" />
      <directionalLight intensity={1.2} position={[5, 8, 3]} color="#fff5d2" />
      <pointLight intensity={0.8} position={[-3, 4, -2]} color="#1a56db" />
      <Sparkles count={40} scale={4} size={1.5} speed={0.3} color="#f59e0b" opacity={0.5} />
      <Suspense fallback={null}>
        <RotatingBuilding />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/kenney/building-skyscraper-a.glb')
