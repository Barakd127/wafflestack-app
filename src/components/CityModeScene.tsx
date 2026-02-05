import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useMemo } from 'react'
import DeformableCell from './DeformableCell'
import { generateIrregularGrid, GridCell } from '../utils/irregularGrid'
import * as THREE from 'three'

// Pastel colors
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF']

interface Building {
  id: string
  cellId: string
  height: number
  color: string
}

const CityModeScene = () => {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  
  // Generate irregular grid once
  const gridCells = useMemo(() => {
    return generateIrregularGrid(15, 15, 2, 0.35)
  }, [])
  
  // Visualize grid wireframe
  const GridWireframe = () => {
    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry()
      const positions: number[] = []
      
      gridCells.forEach(cell => {
        const { a, b, c, d } = cell.corners
        // Draw cell edges
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
        positions.push(b.x, b.y, b.z, c.x, c.y, c.z)
        positions.push(c.x, c.y, c.z, d.x, d.y, d.z)
        positions.push(d.x, d.y, d.z, a.x, a.y, a.z)
      })
      
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      return geo
    }, [])
    
    return (
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </lineSegments>
    )
  }
  
  // Handle cell click
  const handleCellClick = (cell: GridCell) => {
    const existing = buildings.find(b => b.cellId === cell.id)
    
    if (existing) {
      if (existing.height < 5) {
        // Increase height
        setBuildings(prev => prev.map(b =>
          b.cellId === cell.id ? { ...b, height: b.height + 1 } : b
        ))
      } else {
        // Remove if at max height
        setBuildings(prev => prev.filter(b => b.cellId !== cell.id))
      }
    } else {
      // Add new building
      setBuildings(prev => [...prev, {
        id: `building-${Date.now()}`,
        cellId: cell.id,
        height: 2,
        color: selectedColor
      }])
    }
  }
  
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [30, 25, 30], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          color="#fff5e1"
        />
        
        {/* Sky */}
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 30, 100]} />
        
        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          minDistance={10}
          maxDistance={80}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        {/* Water plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#5DADE2" />
        </mesh>
        
        {/* Irregular grid wireframe */}
        <GridWireframe />
        
        {/* Ground cells (clickable) */}
        {gridCells.map(cell => (
          <mesh
            key={cell.id}
            position={[cell.center.x, 0.01, cell.center.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation()
              handleCellClick(cell)
            }}
          >
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial 
              color="#88CC88" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        
        {/* Deformable buildings */}
        {buildings.map(building => {
          const cell = gridCells.find(c => c.id === building.cellId)
          if (!cell) return null
          
          return (
            <DeformableCell
              key={building.id}
              corners={cell.corners}
              height={building.height}
              color={building.color}
            />
          )
        })}
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-auto z-50">
        <div className="backdrop-blur-xl bg-white/90 border-2 border-black rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            🏙️ City Mode
          </h1>
          <p className="text-xs text-gray-600 mb-4">
            Deformable buildings on irregular grid
          </p>
          
          {/* Color Palette */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Choose Color:</p>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-black scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="pt-4 border-t-2 border-gray-300 text-xs text-gray-600">
            <strong>Click</strong> cell to place<br />
            <strong>Click again</strong> to grow (max 5)<br />
            <strong>At max</strong> click to remove
          </div>
          
          {/* Stats */}
          <div className="pt-4 border-t-2 border-gray-300">
            <p className="text-sm font-semibold">
              Buildings: {buildings.length}
            </p>
          </div>
          
          {buildings.length > 0 && (
            <button
              onClick={() => setBuildings([])}
              className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold border-2 border-black"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {/* Info badge */}
      <div className="absolute bottom-6 right-6 pointer-events-auto z-50">
        <div className="backdrop-blur-xl bg-white/90 border-2 border-black rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-gray-700">
            ✨ Bilinear Vertex Deformation
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Square meshes → Irregular grid
          </p>
        </div>
      </div>
    </div>
  )
}

export default CityModeScene
