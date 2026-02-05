import { useRef, useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ToonVertexShader, ToonFragmentShader, OutlineVertexShader, OutlineFragmentShader } from '../shaders/ToonShader'

interface ToonModelProps {
  modelPath: string
  position: [number, number, number]
  color: string
  scale?: number
  onClick?: () => void
}

const ToonModel = ({ modelPath, position, color, scale = 1, onClick }: ToonModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  // Load the GLB model
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Clone and prepare the scene
  const { scene, outlineScene } = useMemo(() => {
    const scene = originalScene.clone()
    const outlineScene = originalScene.clone()
    
    const colorObj = new THREE.Color(color)
    
    // Toon material
    const toonMaterial = new THREE.ShaderMaterial({
      vertexShader: ToonVertexShader,
      fragmentShader: ToonFragmentShader,
      uniforms: {
        color: { value: colorObj },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() }
      }
    })
    
    // Outline material
    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: OutlineVertexShader,
      fragmentShader: OutlineFragmentShader,
      uniforms: {
        outlineThickness: { value: 0.03 }
      },
      side: THREE.BackSide
    })
    
    // Apply toon material to main scene
    scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material = toonMaterial
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    // Apply outline material to outline scene
    outlineScene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material = outlineMaterial
      }
    })
    
    return { scene, outlineScene }
  }, [originalScene, color])

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
      {/* Main model with toon shading */}
      <primitive object={scene} />
      {/* Outline */}
      <primitive object={outlineScene} />
    </group>
  )
}

export default ToonModel
