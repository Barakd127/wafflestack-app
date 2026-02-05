import { useRef, useState } from 'react'
import * as THREE from 'three'
import Voxel from './Voxel'
import { useGameStore } from '../store/gameStore'

const VoxelGrid = () => {
  const gridRef = useRef<THREE.Group>(null)
  
  // Store state
  const voxels = useGameStore((state) => state.voxels)
  const selectedVoxelId = useGameStore((state) => state.selectedVoxelId)
  const selectedTool = useGameStore((state) => state.selectedTool)
  const toolMode = useGameStore((state) => state.toolMode)
  const gridSize = useGameStore((state) => state.gridSize)
  const showGrid = useGameStore((state) => state.showGrid)
  
  // Store actions
  const addVoxel = useGameStore((state) => state.addVoxel)
  const removeVoxelAt = useGameStore((state) => state.removeVoxelAt)
  const selectVoxel = useGameStore((state) => state.selectVoxel)
  
  // Local state for hover preview
  const [hoveredGridPos, setHoveredGridPos] = useState<[number, number, number] | null>(null)

  // Convert world position to grid coordinates
  const worldToGrid = (worldPos: THREE.Vector3): [number, number, number] => {
    const halfGrid = gridSize / 2
    const x = Math.floor(worldPos.x + halfGrid)
    const y = Math.floor(worldPos.y)
    const z = Math.floor(worldPos.z + halfGrid)
    return [x - halfGrid, y, z - halfGrid]
  }

  // Check if position is within grid bounds
  const isValidGridPosition = (pos: [number, number, number]): boolean => {
    const halfGrid = gridSize / 2
    return (
      pos[0] >= -halfGrid && pos[0] < halfGrid &&
      pos[1] >= 0 && pos[1] < 10 && // Max height of 10
      pos[2] >= -halfGrid && pos[2] < halfGrid
    )
  }

  // Handle grid click
  const handleGridClick = (event: THREE.Intersection) => {
    if (!event.face) return

    const clickPoint = event.point.clone()
    const normal = event.face.normal.clone()
    
    // Offset click point by normal to get target position
    clickPoint.add(normal.multiplyScalar(0.5))
    
    const gridPos = worldToGrid(clickPoint)
    
    if (!isValidGridPosition(gridPos)) return

    if (toolMode === 'erase') {
      // Remove block at this position
      removeVoxelAt(gridPos)
    } else {
      // Place new block
      addVoxel({
        position: gridPos,
        blockType: selectedTool,
        rotation: 0,
      })
    }
  }

  // Handle hover for preview
  const handleGridHover = (event: THREE.Intersection) => {
    if (!event.face) return

    const hoverPoint = event.point.clone()
    const normal = event.face.normal.clone()
    
    hoverPoint.add(normal.multiplyScalar(0.5))
    const gridPos = worldToGrid(hoverPoint)
    
    if (isValidGridPosition(gridPos)) {
      setHoveredGridPos(gridPos)
    } else {
      setHoveredGridPos(null)
    }
  }

  // Check if a voxel exists at position
  const getVoxelAt = useGameStore((state) => state.getVoxelAt)

  return (
    <group ref={gridRef}>
      {/* Interactive Grid Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          handleGridClick(e)
        }}
        onPointerMove={(e) => {
          e.stopPropagation()
          handleGridHover(e)
        }}
        onPointerLeave={() => setHoveredGridPos(null)}
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial 
          color="#111111"
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid Lines */}
      {showGrid && (
        <gridHelper 
          args={[gridSize, gridSize, '#00ffff', '#004444']} 
          position={[0, 0.01, 0]}
        />
      )}

      {/* Render all placed voxels */}
      {voxels.map((voxel) => (
        <Voxel
          key={voxel.id}
          voxel={voxel}
          isSelected={voxel.id === selectedVoxelId}
          onClick={() => selectVoxel(voxel.id)}
        />
      ))}

      {/* Hover Preview Ghost Block */}
      {hoveredGridPos && toolMode === 'place' && (
        <Voxel
          voxel={{
            id: 'ghost',
            position: hoveredGridPos,
            blockType: selectedTool,
            rotation: 0,
            timestamp: Date.now(),
          }}
          isGhost={true}
        />
      )}

      {/* Existing Blocks on Hover (for stacking) */}
      {voxels.map((voxel) => {
        // Render existing voxels with click handlers for stacking
        const handleVoxelClick = (event: any) => {
          event.stopPropagation()
          
          if (toolMode === 'erase') {
            // Erase mode - remove this voxel
            removeVoxelAt(voxel.position)
          } else {
            // Place mode - stack on top
            const abovePos: [number, number, number] = [
              voxel.position[0],
              voxel.position[1] + 1,
              voxel.position[2]
            ]
            
            if (isValidGridPosition(abovePos) && !getVoxelAt(abovePos)) {
              addVoxel({
                position: abovePos,
                blockType: selectedTool,
                rotation: 0,
              })
            }
          }
        }

        return (
          <mesh
            key={`clickable-${voxel.id}`}
            position={[voxel.position[0], voxel.position[1] + 0.5, voxel.position[2]]}
            onClick={handleVoxelClick}
            visible={false} // Invisible but interactive
          >
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )
      })}
    </group>
  )
}

export default VoxelGrid
