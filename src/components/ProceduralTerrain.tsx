import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  generateHeightMap,
  normalizeHeightMap,
  applyLearningInfluence,
  createDefaultTerrainConfig,
  getTerrainColor,
  type TerrainConfig,
  type LearningInfluence
} from '../utils/terrainGenerator'

interface ProceduralTerrainProps {
  config?: Partial<TerrainConfig>
  learningInfluences?: LearningInfluence[]
  wireframe?: boolean
  animated?: boolean
}

const ProceduralTerrain = ({
  config = {},
  learningInfluences = [],
  wireframe = false,
  animated = false
}: ProceduralTerrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Generate terrain geometry
  const geometry = useMemo(() => {
    const terrainConfig = createDefaultTerrainConfig(config)
    const { gridSize } = terrainConfig
    
    // Generate base height map
    let heightMap = generateHeightMap(terrainConfig)
    
    // Apply learning influences if provided
    if (learningInfluences.length > 0) {
      heightMap = applyLearningInfluence(heightMap, learningInfluences)
    }
    
    // Normalize to 0-1 range
    heightMap = normalizeHeightMap(heightMap)
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      gridSize - 1,
      gridSize - 1
    )
    
    // Apply heights to vertices
    const positions = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      const x = Math.floor(i % gridSize)
      const y = Math.floor(i / gridSize)
      const heightIndex = y * gridSize + x
      
      // Z is height in Three.js plane geometry
      positions[i * 3 + 2] = heightMap.data[heightIndex] * terrainConfig.heightMultiplier
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    // Add vertex colors based on height
    const colors = new Float32Array(positions.length)
    for (let i = 0; i < positions.length / 3; i++) {
      const height = positions[i * 3 + 2] / terrainConfig.heightMultiplier
      const colorHex = getTerrainColor(height, terrainConfig.waterLevel || 0.3)
      const color = new THREE.Color(colorHex)
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geometry
  }, [config, learningInfluences])

  // Optional animation
  useFrame((state) => {
    if (animated && meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          wireframe={wireframe}
          flatShading={false}
          roughness={0.7}
          metalness={0.1}
          envMapIntensity={0.5}
          // Enhanced visual quality
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Add subtle ambient occlusion effect with ground plane */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.1]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  )
}

export default ProceduralTerrain
