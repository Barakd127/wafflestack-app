import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  generateBuilding,
  type BuildingConfig
} from '../utils/buildingGenerator'

interface ProceduralBuildingProps {
  config: BuildingConfig
  position: [number, number, number]
  animated?: boolean
}

const ProceduralBuilding = ({
  config,
  position,
  animated = false
}: ProceduralBuildingProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Generate building geometry
  const geometry = useMemo(() => {
    const buildingGeom = generateBuilding(config)
    
    const geometry = new THREE.BufferGeometry()
    
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(buildingGeom.positions, 3)
    )
    
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(buildingGeom.colors, 3)
    )
    
    geometry.setIndex(new THREE.BufferAttribute(buildingGeom.indices, 1))
    
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    
    return geometry
  }, [config])

  // Optional entrance animation
  useFrame((state) => {
    if (animated && meshRef.current) {
      const scale = Math.min(state.clock.elapsedTime / 2, 1)
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        metalness={0.3}
        roughness={0.7}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

export default ProceduralBuilding
