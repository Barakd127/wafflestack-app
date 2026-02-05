import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BLOCK_TYPES } from '../config/blockConfig'
import type { Voxel as VoxelType } from '../store/gameStore'

interface VoxelProps {
  voxel: VoxelType
  isSelected?: boolean
  isGhost?: boolean
  onRemove?: () => void
  onClick?: () => void
}

const Voxel = ({ voxel, isSelected = false, isGhost = false, onRemove, onClick }: VoxelProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [scale, setScale] = useState(0)
  
  const blockConfig = BLOCK_TYPES[voxel.blockType]
  
  if (!blockConfig) {
    console.warn(`Block type "${voxel.blockType}" not found in config`)
    return null
  }

  // Entrance animation
  useEffect(() => {
    const targetScale = isGhost ? 0.9 : 1
    const interval = setInterval(() => {
      setScale((prev) => {
        if (prev < targetScale) {
          return Math.min(prev + 0.05, targetScale)
        }
        clearInterval(interval)
        return targetScale
      })
    }, 16)
    return () => clearInterval(interval)
  }, [isGhost])

  // Hover pulse animation
  useFrame((state) => {
    if (meshRef.current && (hovered || isSelected) && scale >= 1) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1
      meshRef.current.scale.setScalar(pulse)
    } else if (meshRef.current && !hovered && !isSelected) {
      meshRef.current.scale.setScalar(scale)
    }
  })

  // Create material based on block type
  const createMaterial = () => {
    const props = blockConfig.material.properties

    switch (blockConfig.material.type) {
      case 'neon':
        return (
          <meshStandardMaterial
            {...props}
            transparent={isGhost}
            opacity={isGhost ? 0.5 : 1}
            toneMapped={false} // Important for emissive to glow properly
          />
        )

      case 'physical':
        return (
          <meshPhysicalMaterial
            {...props}
            transparent={true}
            opacity={isGhost ? props.opacity * 0.5 : props.opacity}
          />
        )

      case 'standard':
      default:
        return (
          <meshStandardMaterial
            {...props}
            transparent={isGhost}
            opacity={isGhost ? 0.5 : 1}
          />
        )
    }
  }

  // World position from grid coordinates
  const worldPosition: [number, number, number] = [
    voxel.position[0],
    voxel.position[1] + 0.5, // Offset to sit on grid
    voxel.position[2]
  ]

  return (
    <group position={worldPosition}>
      {/* Main Voxel Mesh */}
      <mesh
        ref={meshRef}
        castShadow={!isGhost}
        receiveShadow={!isGhost}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        rotation-y={(voxel.rotation * Math.PI) / 180}
        scale={scale}
      >
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        {createMaterial()}
      </mesh>

      {/* Selection Ring - Figma-like */}
      {isSelected && (
        <mesh rotation-x={Math.PI / 2} position={[0, -0.49, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover Ring */}
      {hovered && !isSelected && !isGhost && (
        <mesh rotation-x={Math.PI / 2} position={[0, -0.49, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Edge Highlight for Neon Blocks */}
      {blockConfig.category === 'neon' && !isGhost && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.95, 0.95)]} />
          <lineBasicMaterial 
            color={blockConfig.color} 
            transparent 
            opacity={0.3}
            linewidth={2}
          />
        </lineSegments>
      )}
    </group>
  )
}

export default Voxel
