import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useState } from 'react'
import ProceduralTerrain from './ProceduralTerrain'
import ProceduralBuilding from './ProceduralBuilding'
import type { LearningInfluence } from '../utils/terrainGenerator'
import { buildingFromLearningData } from '../utils/buildingGenerator'

const TerrainDemo = () => {
  const [wireframe, setWireframe] = useState(false)
  const [showLearning, setShowLearning] = useState(true)
  const [showBuildings, setShowBuildings] = useState(true)
  const [seed, setSeed] = useState('student-123')

  // Example learning influences - simulating student progress
  const learningInfluences: LearningInfluence[] = showLearning ? [
    {
      position: [15, 15],
      mastery: 1.0,  // Fully mastered topic
      radius: 8,
      topic: 'Introduction to JavaScript'
    },
    {
      position: [35, 20],
      mastery: 0.7,  // Good understanding
      radius: 6,
      topic: 'React Fundamentals'
    },
    {
      position: [25, 35],
      mastery: 0.4,  // Still learning
      radius: 5,
      topic: 'TypeScript Basics'
    },
    {
      position: [10, 40],
      mastery: 0.9,  // Nearly mastered
      radius: 7,
      topic: 'CSS & Styling'
    }
  ] : []

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [30, 40, 30], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: false 
        }}
      >
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.5} />
        
        {/* Main sun light */}
        <directionalLight
          position={[30, 40, 30]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          color="#fff4e6"
        />
        
        {/* Fill lights for softer shadows */}
        <hemisphereLight
          args={['#87ceeb', '#654321', 0.6]}
          position={[0, 50, 0]}
        />
        
        {/* Accent lights */}
        <pointLight position={[-30, 25, -30]} intensity={0.4} color="#6495ed" distance={80} />
        <pointLight position={[30, 25, 30]} intensity={0.4} color="#ffd700" distance={80} />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#1a1a2e', 30, 120]} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          minDistance={20}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
        />

        {/* Procedural Terrain */}
        <ProceduralTerrain
          config={{
            gridSize: 50,
            seed: seed,
            scale: 20,
            octaves: 4,
            persistence: 0.5,
            lacunarity: 2.0,
            heightMultiplier: 3,
            waterLevel: 0.3
          }}
          learningInfluences={learningInfluences}
          wireframe={wireframe}
          animated={false}
        />

        {/* Procedural Buildings on Learning Peaks */}
        {showBuildings && learningInfluences.map((influence, idx) => {
          const buildingConfig = buildingFromLearningData(
            `building-${idx}`,
            influence.topic,
            influence.mastery,
            Math.ceil(influence.mastery * 5), // difficulty 1-5
            idx === 0 ? 'technology' : idx === 1 ? 'science' : idx === 2 ? 'math' : 'art'
          )
          
          // Place building at influence center, slightly above terrain
          const [x, z] = influence.position
          const worldX = x - 25  // Center terrain at 0,0
          const worldZ = z - 25
          const height = influence.mastery * 3 + 1  // Approximate terrain height
          
          return (
            <ProceduralBuilding
              key={`building-${idx}`}
              config={buildingConfig}
              position={[worldX, height, worldZ]}
              animated={true}
            />
          )
        })}

        {/* Enhanced Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>

        {/* Performance Stats */}
        <Stats />
      </Canvas>

      {/* UI Controls */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl max-w-sm">
          <h2 className="text-white text-xl font-bold mb-4">🏔️ Procedural Terrain Demo</h2>
          
          <div className="space-y-4">
            {/* Wireframe Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Wireframe Mode</label>
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  wireframe 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {wireframe ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Learning Influences Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Show Learning Progress</label>
              <button
                onClick={() => setShowLearning(!showLearning)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  showLearning 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {showLearning ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Buildings Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Show Buildings</label>
              <button
                onClick={() => setShowBuildings(!showBuildings)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  showBuildings 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {showBuildings ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Seed Input */}
            <div className="space-y-2">
              <label className="text-white text-sm">Student ID (Seed)</label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
                placeholder="Enter seed..."
              />
              <p className="text-xs text-white/60">Different IDs = Different terrains</p>
            </div>

            {/* Random Seed Button */}
            <button
              onClick={() => setSeed(`student-${Math.floor(Math.random() * 1000)}`)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all"
            >
              🎲 Generate Random Terrain
            </button>
          </div>

          {/* Legend */}
          {showLearning && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <h3 className="text-white text-sm font-semibold mb-2">Learning Peaks Legend:</h3>
              <div className="space-y-1 text-xs text-white/80">
                <div>🏔️ <span className="text-green-400">High peaks</span> = Mastered topics</div>
                <div>⛰️ <span className="text-yellow-400">Mid peaks</span> = Learning topics</div>
                <div>🏜️ <span className="text-blue-400">Valleys</span> = Unexplored areas</div>
              </div>
            </div>
          )}

          {/* Color Legend */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <h3 className="text-white text-sm font-semibold mb-2">Terrain Colors:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#1e40af]"></div>
                <span className="text-white/80">Water</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f4d03f]"></div>
                <span className="text-white/80">Sand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
                <span className="text-white/80">Grass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#15803d]"></div>
                <span className="text-white/80">Forest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#78716c]"></div>
                <span className="text-white/80">Rocky</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f5f5f4]"></div>
                <span className="text-white/80">Snow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-xl max-w-xs">
          <h3 className="text-white text-sm font-semibold mb-2">🎮 Controls</h3>
          <div className="space-y-1 text-xs text-white/70">
            <div className="flex justify-between">
              <span>Rotate</span>
              <kbd className="px-2 py-0.5 bg-white/20 rounded">Click + Drag</kbd>
            </div>
            <div className="flex justify-between">
              <span>Zoom</span>
              <kbd className="px-2 py-0.5 bg-white/20 rounded">Scroll</kbd>
            </div>
            <div className="flex justify-between">
              <span>Pan</span>
              <kbd className="px-2 py-0.5 bg-white/20 rounded">Right Click</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TerrainDemo
