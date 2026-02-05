import { useMemo, useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colorizeModel } from '../utils/colorizeModel'
import { ToonVertexShader, ToonFragmentShader, OutlineVertexShader, OutlineFragmentShader } from '../shaders/ToonShader'

interface HexagonCellProps {
  position: [number, number, number]
  height: number  // 0 = ground, 1 = base, 2+ = tall building
  color: string
  type?: 'grass' | 'dirt' | 'stone' | 'sand'
}

// Kenney asset mapping
const GROUND_MODELS = {
  grass: '/models/kenney/grass.glb',
  dirt: '/models/kenney/dirt.glb',
  stone: '/models/kenney/stone.glb',
  sand: '/models/kenney/sand.glb'
}

const BUILDING_MODELS = {
  height0: '/models/kenney/grass.glb',  // Ground
  height1: '/models/kenney/building-house.glb',  // Small house
  height2: '/models/kenney/building-cabin.glb',  // Medium
  height3: '/models/kenney/building-tower.glb',  // Tall tower
  height4: '/models/kenney/building-castle.glb',  // Castle
  height5: '/models/kenney/building-wizard-tower.glb'  // Wizard tower
}

const HexagonCell = ({ position, height, color, type = 'grass' }: HexagonCellProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)
  
  // Select model based on height
  const modelPath = useMemo(() => {
    if (height === 0) {
      return GROUND_MODELS[type]
    } else if (height >= 5) {
      return BUILDING_MODELS.height5
    } else if (height >= 4) {
      return BUILDING_MODELS.height4
    } else if (height >= 3) {
      return BUILDING_MODELS.height3
    } else if (height >= 2) {
      return BUILDING_MODELS.height2
    } else {
      return BUILDING_MODELS.height1
    }
  }, [height, type])
  
  // Load the model
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Clone and colorize scene (CRITICAL: useMemo to avoid re-cloning)
  const { mainScene, outlineScene } = useMemo(() => {
    const mainScene = originalScene.clone()
    const outlineScene = originalScene.clone()
    
    // Colorize main scene
    colorizeModel(mainScene, color)
    
    // Apply toon shader to main scene
    const colorObj = new THREE.Color(color)
    const toonMaterial = new THREE.ShaderMaterial({
      vertexShader: ToonVertexShader,
      fragmentShader: ToonFragmentShader,
      uniforms: {
        color: { value: colorObj },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() }
      }
    })
    
    mainScene.traverse((node: any) => {
      if (node instanceof THREE.Mesh) {
        node.material = toonMaterial
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    
    // Apply outline shader to outline scene
    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: OutlineVertexShader,
      fragmentShader: OutlineFragmentShader,
      uniforms: {
        outlineThickness: { value: 0.04 }
      },
      side: THREE.BackSide
    })
    
    outlineScene.traverse((node: any) => {
      if (node instanceof THREE.Mesh) {
        node.material = outlineMaterial
      }
    })
    
    return { mainScene, outlineScene }
  }, [originalScene, color])

  // Entrance animation (Townscaper "plop")
  useFrame((state, delta) => {
    if (scaleAnim < 1) {
      setScaleAnim((prev: number) => Math.min(prev + delta * 3, 1))
    }
    if (groupRef.current && scaleAnim < 1) {
      // Elastic bounce
      const elastic = scaleAnim < 0.5
        ? 2 * scaleAnim * scaleAnim
        : 1 - Math.pow(-2 * scaleAnim + 2, 2) / 2
      
      groupRef.current.scale.setScalar(elastic)
    }
  })

  useEffect(() => {
    setScaleAnim(0)  // Trigger animation
  }, [])

  return (
    <group ref={groupRef} position={position}>
      {/* Main model with toon shading */}
      <primitive object={mainScene} />
      {/* Black outline */}
      <primitive object={outlineScene} />
    </group>
  )
}

export default HexagonCell
