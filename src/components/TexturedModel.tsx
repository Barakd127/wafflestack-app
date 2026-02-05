import { useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TexturedModelProps {
  modelPath: string
  thumbnailPath: string  // Preview image path
  position: [number, number, number]
  scale?: number
  onClick?: () => void
}

const TexturedModel = ({ modelPath, thumbnailPath, position, scale = 1, onClick }: TexturedModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  const { scene: originalScene } = useGLTF(modelPath)
  const texture = useTexture(thumbnailPath)
  
  // Apply texture from preview image
  const scene = useMemo(() => {
    const cloned = originalScene.clone(true)
    
    // Configure texture
    texture.encoding = THREE.sRGBEncoding
    texture.flipY = false
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        if (child.material) {
          // Create new material with texture
          const mat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1,
          })
          
          child.material = mat
        }
      }
    })
    
    return cloned
  }, [originalScene, texture])

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

export default TexturedModel
