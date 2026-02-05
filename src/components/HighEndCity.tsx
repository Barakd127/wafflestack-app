import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Sky, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO, DepthOfField, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import Model3D from './Model3D'
import ProceduralTerrain from './ProceduralTerrain'

const HighEndCity = () => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [40, 30, 40], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        {/* High-End Lighting Setup */}
        <ambientLight intensity={0.3} />
        
        {/* Main sun */}
        <directionalLight
          position={[50, 50, 30]}
          intensity={2}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={300}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0001}
          color="#fff8e1"
        />
        
        {/* Fill light */}
        <hemisphereLight
          args={['#87ceeb', '#d4a574', 0.8]}
          position={[0, 100, 0]}
        />
        
        {/* Accent lights */}
        <pointLight position={[-40, 20, -40]} intensity={0.6} color="#ffa07a" distance={100} />
        <pointLight position={[40, 20, 40]} intensity={0.6} color="#87cefa" distance={100} />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#e6f2ff', 50, 200]} />

        {/* Beautiful Sky */}
        <Sky
          distance={450000}
          sunPosition={[50, 50, 30]}
          inclination={0.6}
          azimuth={0.25}
        />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          minDistance={15}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Beautiful Terrain Base */}
        <Suspense fallback={null}>
          <ProceduralTerrain
            config={{
              gridSize: 80,
              seed: 'highend-city',
              scale: 40,
              octaves: 5,
              persistence: 0.5,
              lacunarity: 2.0,
              heightMultiplier: 2,
              waterLevel: 0.25
            }}
            learningInfluences={[]}
            wireframe={false}
          />
        </Suspense>

        {/* 3D Models - Learning City */}
        <Suspense fallback={null}>
          {/* Center: Neo Utopian City (Main Achievement) */}
          <Model3D
            modelPath="/models/neo utopian city 3d model.glb"
            position={[0, 2, 0]}
            scale={2.5}
            rotation={[0, Math.PI / 4, 0]}
          />

          {/* Classical Temple (History/Philosophy) */}
          <Model3D
            modelPath="/models/classical temple 3d model.glb"
            position={[-15, 1.5, -10]}
            scale={1.8}
            rotation={[0, Math.PI / 6, 0]}
          />

          {/* Greco-Roman Temple (Literature) */}
          <Model3D
            modelPath="/models/greco-roman temple 3d model.glb"
            position={[15, 1.5, -15]}
            scale={1.6}
            rotation={[0, -Math.PI / 3, 0]}
          />

          {/* Fantasy Castle (Creativity/Art) */}
          <Model3D
            modelPath="/models/fantasy castle 3d model.glb"
            position={[-20, 2, 15]}
            scale={1.5}
            rotation={[0, Math.PI / 2, 0]}
          />

          {/* Stone Pagoda (Math/Logic) */}
          <Model3D
            modelPath="/models/stone pagoda 3d model.glb"
            position={[18, 1, 12]}
            scale={1.4}
            rotation={[0, -Math.PI / 4, 0]}
          />

          {/* Traditional Chinese Architecture (Culture) */}
          <Model3D
            modelPath="/models/traditional chinese architecture 3d model.glb"
            position={[-8, 1, 20]}
            scale={1.3}
            rotation={[0, Math.PI, 0]}
          />

          {/* Ancient Ruins (History) */}
          <Model3D
            modelPath="/models/ancient ruins 3d model.glb"
            position={[25, 0.5, -5]}
            scale={1.2}
            rotation={[0, Math.PI / 8, 0]}
          />

          {/* Stone Archway (Gateway) */}
          <Model3D
            modelPath="/models/stone archway 3d model.glb"
            position={[0, 0.5, -25]}
            scale={1.5}
            rotation={[0, 0, 0]}
          />

          {/* Snowy Stone Building (Winter Studies) */}
          <Model3D
            modelPath="/models/snowy stone building 3d model.glb"
            position={[-25, 1, -18]}
            scale={1.4}
            rotation={[0, Math.PI / 5, 0]}
          />

          {/* Cozy Apartment (Personal Space) */}
          <Model3D
            modelPath="/models/cozy apartment 3d model.glb"
            position={[8, 1, 25]}
            scale={1.1}
            rotation={[0, -Math.PI / 6, 0]}
          />

          {/* Zeppelin (Exploration/Discovery) */}
          <Model3D
            modelPath="/models/Zeppelin2.glb"
            position={[-10, 25, 0]}
            scale={3}
            rotation={[0, Math.PI / 4, 0]}
            castShadow={false}
          />
        </Suspense>

        {/* Ground Contact Shadows for Realism */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={100}
          blur={2}
          far={10}
        />

        {/* High-End Environment */}
        <Environment preset="sunset" />

        {/* Premium Post-Processing */}
        <EffectComposer multisampling={8}>
          {/* Bloom for beautiful glow */}
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          
          {/* Depth of Field for cinematic look */}
          <DepthOfField
            focusDistance={0.015}
            focalLength={0.08}
            bokehScale={4}
          />
          
          {/* Vignette for focus */}
          <Vignette
            offset={0.2}
            darkness={0.6}
          />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="backdrop-blur-xl bg-gradient-to-br from-black/30 to-black/20 border border-white/30 rounded-3xl p-8 shadow-2xl max-w-md">
          <h1 className="text-white text-3xl font-bold mb-2 bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
            🏛️ Learning City
          </h1>
          <p className="text-white/80 text-sm mb-6">
            Your Personal Knowledge Metropolis
          </p>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏙️</span>
              <div>
                <div className="text-white font-semibold">Neo City</div>
                <div className="text-white/60">Main Campus - All Topics</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏛️</span>
              <div>
                <div className="text-white font-semibold">Classical Temples</div>
                <div className="text-white/60">History & Philosophy</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏰</span>
              <div>
                <div className="text-white font-semibold">Fantasy Castle</div>
                <div className="text-white/60">Creativity & Arts</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛩️</span>
              <div>
                <div className="text-white font-semibold">Pagoda</div>
                <div className="text-white/60">Mathematics & Logic</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎈</span>
              <div>
                <div className="text-white font-semibold">Zeppelin</div>
                <div className="text-white/60">Exploration & Discovery</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-white/60 text-xs">
              Each building represents your learning achievements. 
              Your knowledge city grows with every lesson mastered!
            </div>
          </div>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="backdrop-blur-xl bg-black/20 border border-white/20 rounded-2xl p-4 shadow-xl">
          <h3 className="text-white text-sm font-semibold mb-3">🎮 Navigation</h3>
          <div className="space-y-2 text-xs text-white/70">
            <div className="flex justify-between gap-4">
              <span>Rotate</span>
              <kbd className="px-2 py-1 bg-white/10 rounded font-mono">Left Drag</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Zoom</span>
              <kbd className="px-2 py-1 bg-white/10 rounded font-mono">Scroll</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Pan</span>
              <kbd className="px-2 py-1 bg-white/10 rounded font-mono">Right Drag</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="text-white text-center">
          <div className="animate-pulse text-6xl mb-4">🏛️</div>
          <div className="text-white/80">Building your learning city...</div>
        </div>
      </div>
    </div>
  )
}

export default HighEndCity
