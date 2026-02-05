import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface Model3DProps {
  modelPath: string
  position: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
}

const Model3D = ({
  modelPath,
  position,
  scale = 1,
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true
}: Model3DProps) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the GLB model using drei's useGLTF
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Clone the scene to avoid shared references
  const scene = originalScene.clone()
  
  useEffect(() => {
    // Enable shadows on all meshes
    scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadow
        child.receiveShadow = receiveShadow
        
        // Enhance materials for better visuals
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.envMapIntensity = 1
                mat.needsUpdate = true
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
          }
        }
      }
    })
  }, [scene, castShadow, receiveShadow])

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
