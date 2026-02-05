import { useRef, useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OutlineVertexShader, OutlineFragmentShader } from '../shaders/ToonShader'

interface NaturalToonModelProps {
  modelPath: string
  position: [number, number, number]
  scale?: number
  onClick?: () => void
}

const NaturalToonModel = ({ modelPath, position, scale = 1, onClick }: NaturalToonModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  // Load the GLB model
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Clone and prepare the scene with natural colors
  const { scene, outlineScene } = useMemo(() => {
    const scene = originalScene.clone()
    const outlineScene = originalScene.clone()
    
    // Outline material
    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: OutlineVertexShader,
      fragmentShader: OutlineFragmentShader,
      uniforms: {
        outlineThickness: { value: 0.03 }
      },
      side: THREE.BackSide
    })
    
    // Keep original materials with all their properties
    scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        // Ensure original material is properly configured
        if (child.material) {
          // Clone the material to avoid modifying the original
          child.material = child.material.clone()
          // Enable proper lighting
          child.material.needsUpdate = true
          // Ensure colors and textures are visible
          if (child.material.map) {
            child.material.map.needsUpdate = true
          }
        }
      }
    })
    
    // Apply outline material to outline scene
    outlineScene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material = outlineMaterial
      }
    })
    
    return { scene, outlineScene }
  }, [originalScene])

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
      {/* Main model with natural colors */}
      <primitive object={scene} />
      {/* Outline */}
      <primitive object={outlineScene} />
    </group>
  )
}

export default NaturalToonModel
