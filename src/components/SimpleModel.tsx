import { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SimpleModelProps {
  modelPath: string
  position: [number, number, number]
  scale?: number
  onClick?: () => void
}

const SimpleModel = ({ modelPath, position, scale = 1, onClick }: SimpleModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  // Load the GLB model with all its materials
  const { scene } = useGLTF(modelPath)
  
  // Enable shadows and ensure proper material rendering
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // Ensure materials render colors properly
        if (child.material) {
          const material = child.material as THREE.MeshStandardMaterial
          
          // Enable vertex colors if present
          if (child.geometry.attributes.color) {
            material.vertexColors = true
          }
          
          // Ensure proper color rendering
          material.needsUpdate = true
          
          // If no color/texture, use a default color
          if (!material.map && !material.color && !child.geometry.attributes.color) {
            material.color = new THREE.Color(0xcccccc)
          }
        }
      }
    })
  }, [scene])

  // Entrance animation
  useFrame((state, delta) => {
    if (scaleAnim < 1) {
      setScaleAnim(prev => Math.min(prev + delta * 3, 1))
    }
    if (groupRef.current && scaleAnim < 1) {
      // Elastic bounce effect
      const elasticScale = scaleAnim < 0.5
        ? 2 * scaleAnim * scaleAnim
        : 1 - Math.pow(-2 * scaleAnim + 2, 2) / 2
      
      groupRef.current.scale.setScalar(elasticScale * scale)
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(scale)
    }
  })

  useEffect(() => {
    // Trigger entrance animation
    setScaleAnim(0)
  }, [])

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <primitive object={scene} />
    </group>
  )
}

export default SimpleModel
