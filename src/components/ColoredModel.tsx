import { useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ColoredModelProps {
  modelPath: string
  position: [number, number, number]
  scale?: number
  onClick?: () => void
}

const ColoredModel = ({ modelPath, position, scale = 1, onClick }: ColoredModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  // Load the GLB model
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Clone the scene to avoid sharing materials
  const scene = useMemo(() => {
    const cloned = originalScene.clone(true)
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // Clone materials to avoid shared state
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => mat.clone())
          } else {
            child.material = child.material.clone()
          }
          
          // Handle all material types
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          
          materials.forEach((mat: any) => {
            // Enable vertex colors if geometry has them
            if (child.geometry?.attributes?.color) {
              mat.vertexColors = true
            }
            
            // Ensure material properties are set correctly
            if (mat.color && mat.color instanceof THREE.Color) {
              // Material already has a color, keep it
              mat.needsUpdate = true
            } else if (!mat.map) {
              // No texture or color, set a default
              mat.color = new THREE.Color(0xffffff)
              mat.needsUpdate = true
            }
            
            // Ensure proper lighting response
            if (mat.type === 'MeshStandardMaterial') {
              mat.metalness = mat.metalness !== undefined ? mat.metalness : 0.0
              mat.roughness = mat.roughness !== undefined ? mat.roughness : 1.0
            }
          })
        }
      }
    })
    
    return cloned
  }, [originalScene])

  // Entrance animation
  useFrame((state, delta) => {
    if (scaleAnim < 1) {
      setScaleAnim(prev => Math.min(prev + delta * 3, 1))
    }
    if (groupRef.current && scaleAnim < 1) {
      const elasticScale = scaleAnim < 0.5
        ? 2 * scaleAnim * scaleAnim
        : 1 - Math.pow(-2 * scaleAnim + 2, 2) / 2
      
      groupRef.current.scale.setScalar(elasticScale * scale)
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(scale)
    }
  })

  useEffect(() => {
    setScaleAnim(0)
  }, [])

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <primitive object={scene} />
    </group>
  )
}

export default ColoredModel
