import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, TiltShift2, Noise } from '@react-three/postprocessing'
import { Suspense } from 'react'
import VoxelGrid from './VoxelGrid'
import AssetLoader from './AssetLoader'

const GameScene = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [10, 10, 10], fov: 50 }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
    >
      {/* Lighting Setup - Cinematic Quality */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4444ff" />

      {/* Environment - City Preset for High-End Look */}
      <Environment preset="city" />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={50}
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.2}
      />

      <Suspense fallback={null}>
        {/* Interactive Voxel Grid System */}
        <VoxelGrid />
        
        {/* Asset Loader - Will handle .glb models from Tripo */}
        <AssetLoader modelUrl={null} />
      </Suspense>

      {/* Post-Processing Effects - Cinematic Quality */}
      <EffectComposer>
        {/* Bloom - Neon Glow Effect */}
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        
        {/* TiltShift2 - Toy/Miniature Effect */}
        <TiltShift2 blur={0.2} />
        
        {/* Noise - Filmic Look */}
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  )
}

export default GameScene
