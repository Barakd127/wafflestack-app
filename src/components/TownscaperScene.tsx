import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Outline, N8AO } from '@react-three/postprocessing'
import { useState, useMemo, Suspense } from 'react'
import { PaintableAsset } from './PaintableAsset'
import BuildingLibrary from './BuildingLibrary'
import { AssetItem, ASSET_LIBRARY } from '../config/assetLibrary'
import { generateIrregularGrid, GridCell } from '../utils/irregularGrid'
import * as THREE from 'three'

// Townscaper-style pastel color palette
const PASTEL_COLORS = {
  coral: '#FF6B6B',
  mint: '#4ECDC4',
  yellow: '#FFE66D',
  sky: '#95E1D3',
  pink: '#F38181',
  lavender: '#AA96DA',
  peach: '#FCBAD3',
  lime: '#A8E6CF'
}

const COLOR_ARRAY = Object.values(PASTEL_COLORS)

// Map of building types to 3D models
const BUILDING_MODELS = {
  temple: '/models/classical temple 3d model.glb',
  castle: '/models/fantasy castle 3d model.glb',
  pagoda: '/models/stone pagoda 3d model.glb',
  chinese: '/models/traditional chinese architecture 3d model.glb',
  ruins: '/models/ancient ruins 3d model.glb',
  archway: '/models/stone archway 3d model.glb',
  snowy: '/models/snowy stone building 3d model.glb',
  apartment: '/models/cozy apartment 3d model.glb',
  greco: '/models/greco-roman temple 3d model.glb'
} as const

type BuildingType = keyof typeof BUILDING_MODELS

interface Building {
  id: string
  gridX: number
  gridZ: number
  color: string
  assetPath: string  // Path to the GLB model
  assetName: string  // Name for display
  thumbnail: string  // Preview image
}

const TownscaperScene = () => {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS.coral)
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(
    ASSET_LIBRARY[0].assets.find(a => a.id === 'hex-house') || ASSET_LIBRARY[0].assets[0]
  )
  const [selectedKit, setSelectedKit] = useState('hexagon')
  const [hoveredCell, setHoveredCell] = useState<{ x: number, z: number } | null>(null)

  const gridSize = 15
  const cellSize = 3

  // Generate irregular grid once
  const irregularGrid = useMemo(() => {
    return generateIrregularGrid(gridSize, gridSize, cellSize, 0.25)
  }, [gridSize, cellSize])

  // Create water plane
  const WaterPlane = () => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[gridSize * cellSize * 2, gridSize * cellSize * 2]} />
        <meshStandardMaterial 
          color="#5DADE2"
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    )
  }

  // Irregular Grid Wireframe
  const IrregularGridWireframe = () => {
    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry()
      const positions: number[] = []
      
      irregularGrid.forEach(cell => {
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
        <lineBasicMaterial color="#ffffff" opacity={0.6} transparent />
      </lineSegments>
    )
  }

  // Handle grid cell click (irregular grid)
  const handleCellClick = (cell: GridCell) => {
    const existingIndex = buildings.findIndex(b => b.gridX === cell.col && b.gridZ === cell.row)
    
    if (existingIndex >= 0) {
      // Remove building if exists
      setBuildings(prev => prev.filter((_, i) => i !== existingIndex))
    } else if (selectedAsset) {
      // Add new building
      setBuildings(prev => [...prev, {
        id: `building-${Date.now()}`,
        gridX: cell.col,
        gridZ: cell.row,
        color: selectedColor,
        assetPath: selectedAsset.path,
        assetName: selectedAsset.name,
        thumbnail: selectedAsset.thumbnail || '/previews/hexagon/placeholder.png'
      }])
    }
  }

  // Get cell center position
  const getCellCenter = (gridX: number, gridZ: number): [number, number, number] => {
    const cell = irregularGrid.find(c => c.col === gridX && c.row === gridZ)
    if (cell) {
      return [cell.center.x, cell.center.y, cell.center.z]
    }
    return [0, 0, 0]
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [30, 25, 30], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Improved Lighting Setup */}
        <ambientLight intensity={0.8} />
        {/* Main sun light */}
        <directionalLight
          position={[20, 30, 15]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          color="#ffffff"
        />
        {/* Fill light */}
        <directionalLight
          position={[-15, 20, -10]}
          intensity={0.8}
          color="#b8d4ff"
        />
        {/* Rim light */}
        <directionalLight
          position={[0, 10, -20]}
          intensity={0.4}
          color="#ffd4a3"
        />

        {/* Sky color */}
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 30, 100]} />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          minDistance={10}
          maxDistance={80}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Water */}
        <WaterPlane />

        {/* Irregular Grid */}
        <IrregularGridWireframe />

        {/* Clickable ground cells */}
        {irregularGrid.map(cell => (
          <mesh
            key={cell.id}
            position={[cell.center.x, 0.01, cell.center.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation()
              handleCellClick(cell)
            }}
          >
            <planeGeometry args={[2.5, 2.5]} />
            <meshBasicMaterial 
              color="#88CC88" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Buildings with user-selected colors */}
        <Suspense fallback={null}>
          {buildings.map(building => (
            <PaintableAsset
              key={building.id}
              url={building.assetPath}
              position={getCellCenter(building.gridX, building.gridZ)}
              color={building.color}
              scale={2.5}
            />
          ))}
        </Suspense>

        {/* 🎨 TOWNSCAPER POST-PROCESSING EFFECTS */}
        <EffectComposer multisampling={8}>
          {/* Black ink outlines (hand-drawn look) */}
          <Outline
            edgeStrength={2.5}
            pulseSpeed={0}
            // @ts-ignore - accepts color strings at runtime
            visibleEdgeColor="black"
            // @ts-ignore - accepts color strings at runtime
            hiddenEdgeColor="black"
            blur
          />
          {/* Soft ambient occlusion (shadows in corners) */}
          <N8AO 
            aoRadius={0.5}
            intensity={1.5}
          />
        </EffectComposer>

      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-auto z-50">
        <div className="backdrop-blur-xl bg-white/90 border-2 border-black rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            🏘️ Townscaper City
          </h1>
          
          <div className="space-y-4">
            {/* Color Palette */}
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-700">Choose Color:</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PASTEL_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all border-2 ${
                      selectedColor === color
                        ? 'border-black scale-110 shadow-lg ring-2 ring-blue-400'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="pt-4 border-t-2 border-gray-300">
              <p className="text-xs text-gray-600">
                <strong>1.</strong> Select building from library<br />
                <strong>2.</strong> Click grid to place<br />
                <strong>3.</strong> Click placed to remove<br />
                <strong>Drag</strong> to rotate view
              </p>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700">
                Buildings: {buildings.length}
              </p>
            </div>

            {/* Clear button */}
            {buildings.length > 0 && (
              <button
                onClick={() => setBuildings([])}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors border-2 border-black"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Building Library */}
      <BuildingLibrary
        selectedAsset={selectedAsset}
        onSelectAsset={setSelectedAsset}
        selectedKit={selectedKit}
        onSelectKit={setSelectedKit}
      />
    </div>
  )
}

export default TownscaperScene
