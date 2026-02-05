import { useRef } from 'react'
import { MeshPhysicalMaterial } from 'three'
import * as THREE from 'three'

const VoxelFloor = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create high-quality glass-like material
  const material = new MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.8,
  })

  const gridSize = 20
  const cellSize = 1

  return (
    <group position={[0, 0, 0]}>
      {/* Main Floor Plane with Glass Material */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[gridSize, gridSize, 20, 20]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Grid Lines for Voxel Effect */}
      <gridHelper 
        args={[gridSize, gridSize, '#00ffff', '#004444']} 
        position={[0, 0.01, 0]}
      />

      {/* Border Frame - Product Design Touch */}
      <lineSegments>
        <edgesGeometry 
          args={[
            new THREE.PlaneGeometry(gridSize, gridSize)
          ]}
        />
        <lineBasicMaterial color="#00ffff" linewidth={2} />
      </lineSegments>
    </group>
  )
}

export default VoxelFloor
