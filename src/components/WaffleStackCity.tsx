import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky, ContactShadows, Html } from '@react-three/drei'
import { Suspense, useState, useRef } from 'react'
import * as THREE from 'three'

// --- Types ---
interface BuildingDef {
  id: string
  model: string
  label: string
  statsConcept: string
  position: [number, number, number]
  rotation?: number
  scale?: number
  color?: string
}

// --- Statistics concept mapping ---
const BUILDINGS: BuildingDef[] = [
  { id: 'power',    model: 'building-type-a', label: '⚡ תחנת כוח',      statsConcept: 'ממוצע (Mean)',           position: [-9, 0, -9],  color: '#FFD700' },
  { id: 'housing',  model: 'building-type-c', label: '🏠 מנהל דיור',     statsConcept: 'חציון (Median)',         position: [-3, 0, -9],  color: '#4ECDC4' },
  { id: 'traffic',  model: 'building-type-e', label: '🚦 בקרת תנועה',    statsConcept: 'סטיית תקן (Std Dev)',    position: [3,  0, -9],  color: '#FF6B6B' },
  { id: 'hospital', model: 'building-type-g', label: '🏥 בית חולים',     statsConcept: 'התפלגות נורמלית',       position: [9,  0, -9],  color: '#95E1D3' },
  { id: 'school',   model: 'building-type-b', label: '🏫 בית ספר',       statsConcept: 'מדגם (Sampling)',        position: [-9, 0, -3],  color: '#AA96DA' },
  { id: 'bank',     model: 'building-type-d', label: '🏦 בנק',           statsConcept: 'רגרסיה (Regression)',    position: [-3, 0, -3],  color: '#FCBAD3' },
  { id: 'market',   model: 'building-type-f', label: '🏪 שוק',           statsConcept: 'קורלציה (Correlation)',  position: [3,  0, -3],  color: '#A8E6CF' },
  { id: 'city-hall',model: 'building-type-h', label: '🏛️ עיריה',         statsConcept: 'בינום (Binomial)',       position: [9,  0, -3],  color: '#F38181' },
  { id: 'research', model: 'building-type-i', label: '🔬 מכון מחקר',     statsConcept: 'מבחן השערות',            position: [-3, 0, 3],   color: '#C3A6FF' },
  { id: 'news',     model: 'building-type-j', label: '📰 תחנת חדשות',    statsConcept: 'רווח סמך (CI)',          position: [3,  0, 3],   color: '#FFB347' },
]

const ROAD_MODELS = [
  // Horizontal roads
  { model: 'path-long', pos: [-6, 0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long', pos: [0,  0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long', pos: [6,  0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long', pos: [-6, 0, -3] as [number,number,number], rot: 0 },
  { model: 'path-long', pos: [0,  0, -3] as [number,number,number], rot: 0 },
  { model: 'path-long', pos: [6,  0, -3] as [number,number,number], rot: 0 },
  // Trees as decoration
  { model: 'tree-large', pos: [0, 0, 3] as [number,number,number], rot: 0 },
  { model: 'tree-small', pos: [-6, 0, 3] as [number,number,number], rot: 0 },
  { model: 'tree-small', pos: [6, 0, 3] as [number,number,number], rot: 0 },
]

// --- Single Building Component ---
function Building({ def, onClick, isSelected }: {
  def: BuildingDef
  onClick: (def: BuildingDef) => void
  isSelected: boolean
}) {
  const path = `/models/kenney-suburban/${def.model}.glb`
  const { scene } = useGLTF(path)
  const meshRef = useRef<THREE.Group>(null)

  // Clone scene so multiple instances work
  const clonedScene = scene.clone()

  // Tint all meshes with the concept color
  clonedScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
      if (def.color) {
        mat.color.multiply(new THREE.Color(def.color))
      }
      if (isSelected) {
        mat.emissive = new THREE.Color('#ffffff')
        mat.emissiveIntensity = 0.3
      }
      mesh.material = mat
    }
  })

  return (
    <group
      ref={meshRef}
      position={def.position}
      rotation={[0, def.rotation ?? 0, 0]}
      scale={def.scale ?? 1.4}
      onClick={(e) => { e.stopPropagation(); onClick(def) }}
    >
      <primitive object={clonedScene} />
      {isSelected && (
        <Html center distanceFactor={15} position={[0, 3, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontFamily: 'system-ui',
            textAlign: 'center',
            direction: 'rtl',
            whiteSpace: 'nowrap',
            border: `2px solid ${def.color ?? '#fff'}`,
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{def.label}</div>
            <div style={{ opacity: 0.8 }}>📊 {def.statsConcept}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// --- Road/Prop Component ---
function Prop({ model, pos, rot }: { model: string, pos: [number,number,number], rot: number }) {
  const { scene } = useGLTF(`/models/kenney-suburban/${model}.glb`)
  return (
    <primitive
      object={scene.clone()}
      position={pos}
      rotation={[0, rot, 0]}
      scale={1.4}
    />
  )
}

// --- Ground ---
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#7ec850" roughness={0.9} />
    </mesh>
  )
}

// --- Info Panel ---
function InfoPanel({ building, onClose }: { building: BuildingDef | null, onClose: () => void }) {
  if (!building) return null
  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(10,10,20,0.92)',
      border: `2px solid ${building.color ?? '#fff'}`,
      borderRadius: 16, padding: '20px 28px', color: 'white',
      fontFamily: 'system-ui', direction: 'rtl', textAlign: 'right',
      minWidth: 280, zIndex: 100, backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>{building.label}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ marginTop: 8, color: building.color, fontSize: 15 }}>📊 {building.statsConcept}</div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
        לחץ על הבניין כדי לפתוח אתגר סטטיסטי ולשפר את העיר שלך!
      </div>
      <button style={{
        marginTop: 14, width: '100%', padding: '10px',
        background: building.color ?? '#4ECDC4', border: 'none', borderRadius: 8,
        color: '#000', fontWeight: 'bold', fontSize: 14, cursor: 'pointer'
      }}>
        🎯 התחל אתגר
      </button>
    </div>
  )
}

// --- Main Scene ---
export default function WaffleStackCity() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDef | null>(null)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Title */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: 22, fontWeight: 'bold',
        fontFamily: 'system-ui', zIndex: 50, direction: 'rtl',
        background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: 12,
        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
      }}>
        🏙️ WaffleStack — עיר הסטטיסטיקה
      </div>

      <Canvas
        shadows
        camera={{ position: [20, 18, 20], fov: 55 }}
        style={{ background: '#87CEEB' }}
      >
        <Sky sunPosition={[100, 50, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        <OrbitControls
          enablePan={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={8}
          maxDistance={60}
          target={[0, 0, -3]}
        />

        <Suspense fallback={null}>
          <Ground />

          {/* Roads & Props */}
          {ROAD_MODELS.map((r, i) => (
            <Prop key={i} model={r.model} pos={r.pos} rot={r.rot} />
          ))}

          {/* Buildings */}
          {BUILDINGS.map((b) => (
            <Building
              key={b.id}
              def={b}
              onClick={setSelectedBuilding}
              isSelected={selectedBuilding?.id === b.id}
            />
          ))}

          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} />
        </Suspense>
      </Canvas>

      <InfoPanel building={selectedBuilding} onClose={() => setSelectedBuilding(null)} />
    </div>
  )
}

// Preload all models
BUILDINGS.forEach(b => useGLTF.preload(`/models/kenney-suburban/${b.model}.glb`))
ROAD_MODELS.forEach(r => useGLTF.preload(`/models/kenney-suburban/${r.model}.glb`))
