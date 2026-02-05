import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

// Test models from each kit
const TEST_MODELS = [
  { name: 'Hexagon House', path: '/models/kenney/building-house.glb', position: [-10, 0, 0] },
  { name: 'Commercial A', path: '/models/commercial/building-a.glb', position: [-5, 0, 0] },
  { name: 'Suburban A', path: '/models/suburban/building-type-a.glb', position: [0, 0, 0] },
  { name: 'Castle Tower', path: '/models/castle/tower-square.glb', position: [5, 0, 0] },
  { name: 'Fantasy Wall', path: '/models/fantasy-town/wall.glb', position: [10, 0, 0] },
]

function TestModel({ path, position, name }: { path: string; position: [number, number, number]; name: string }) {
  const { scene } = useGLTF(path)
  
  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={2} />
      {/* Label */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}

const ModelColorTest = () => {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        
        <color attach="background" args={['#87CEEB']} />
        
        <OrbitControls />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
        
        {/* Test models */}
        <Suspense fallback={null}>
          {TEST_MODELS.map((model) => (
            <TestModel 
              key={model.path}
              path={model.path}
              position={model.position as [number, number, number]}
              name={model.name}
            />
          ))}
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow-xl">
        <h1 className="text-xl font-bold mb-2">🎨 Color Test</h1>
        <p className="text-sm mb-2">Testing models from each kit:</p>
        <ul className="text-xs space-y-1">
          {TEST_MODELS.map((model, i) => (
            <li key={i}>• {model.name}</li>
          ))}
        </ul>
        <p className="text-xs mt-2 text-gray-600">
          Check if models show colors or are grey
        </p>
      </div>
    </div>
  )
}

export default ModelColorTest
