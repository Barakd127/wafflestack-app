import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky, ContactShadows, Html, useProgress } from '@react-three/drei'
import { Suspense, useState, useRef, useCallback } from 'react'
import * as THREE from 'three'
import StatChallenge, { BuildingInfo } from './StatChallenge'
import ScoreBoard from './ScoreBoard'

// ─── localStorage helpers ────────────────────────────────────────────────────
function loadMastered(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('wafflestack-mastered') || '[]')) }
  catch { return new Set() }
}
function loadXP(): number {
  return parseInt(localStorage.getItem('wafflestack-xp') || '0')
}

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Data ────────────────────────────────────────────────────────────────────
const BUILDINGS: BuildingDef[] = [
  { id: 'power',     model: 'building-type-a', label: '⚡ תחנת כוח',   statsConcept: 'ממוצע (Mean)',        position: [-9, 0, -9], color: '#FFD700' },
  { id: 'housing',   model: 'building-type-c', label: '🏠 מנהל דיור',  statsConcept: 'חציון (Median)',      position: [-3, 0, -9], color: '#4ECDC4' },
  { id: 'traffic',   model: 'building-type-e', label: '🚦 בקרת תנועה', statsConcept: 'סטיית תקן (Std Dev)', position: [3,  0, -9], color: '#FF6B6B' },
  { id: 'hospital',  model: 'building-type-g', label: '🏥 בית חולים',  statsConcept: 'התפלגות נורמלית',    position: [9,  0, -9], color: '#95E1D3' },
  { id: 'school',    model: 'building-type-b', label: '🏫 בית ספר',    statsConcept: 'מדגם (Sampling)',     position: [-9, 0, -3], color: '#AA96DA' },
  { id: 'bank',      model: 'building-type-d', label: '🏦 בנק',        statsConcept: 'רגרסיה (Regression)', position: [-3, 0, -3], color: '#FCBAD3' },
  { id: 'market',    model: 'building-type-f', label: '🏪 שוק',        statsConcept: 'קורלציה (Correlation)',position: [3,  0, -3], color: '#A8E6CF' },
  { id: 'city-hall', model: 'building-type-h', label: '🏛️ עיריה',      statsConcept: 'בינום (Binomial)',    position: [9,  0, -3], color: '#F38181' },
  { id: 'research',  model: 'building-type-i', label: '🔬 מכון מחקר',  statsConcept: 'מבחן השערות',         position: [-3, 0, 3],  color: '#C3A6FF' },
  { id: 'news',      model: 'building-type-j', label: '📰 תחנת חדשות', statsConcept: 'רווח סמך (CI)',       position: [3,  0, 3],  color: '#FFB347' },
]

const ROAD_MODELS = [
  { model: 'path-long',  pos: [-6, 0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long',  pos: [0,  0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long',  pos: [6,  0, -9] as [number,number,number], rot: 0 },
  { model: 'path-long',  pos: [-6, 0, -3] as [number,number,number], rot: 0 },
  { model: 'path-long',  pos: [0,  0, -3] as [number,number,number], rot: 0 },
  { model: 'path-long',  pos: [6,  0, -3] as [number,number,number], rot: 0 },
  { model: 'tree-large', pos: [0, 0, 3]   as [number,number,number], rot: 0 },
  { model: 'tree-small', pos: [-6, 0, 3]  as [number,number,number], rot: 0 },
  { model: 'tree-small', pos: [6, 0, 3]   as [number,number,number], rot: 0 },
]

// ─── CSS for animations ──────────────────────────────────────────────────────
const ANIM_STYLE = `
@keyframes xpfloat {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  20%  { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1.15); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-70px) scale(0.9); }
}
@keyframes cityload {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(150%); }
  100% { transform: translateX(-100%); }
}
@keyframes masteredpulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(78,205,196,0); }
  50%     { box-shadow: 0 0 16px 4px rgba(78,205,196,0.6); }
}
`

// ─── Loading overlay — lives OUTSIDE Canvas (valid HTML) ─────────────────────
function CityLoader() {
  const { progress, active } = useProgress()
  if (!active) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #87CEEB 0%, #b0e0f5 100%)',
      fontFamily: 'system-ui', zIndex: 10, pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🏙️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2a3a', marginBottom: 20 }}>
        Loading WaffleStack City... {Math.round(progress)}%
      </div>
      <div style={{ width: 220, height: 6, background: 'rgba(0,0,0,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#4ECDC4', borderRadius: 3,
          width: `${progress}%`, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Building component ──────────────────────────────────────────────────────
function Building({ def, onClick, isSelected, isMastered, isGlowing }: {
  def: BuildingDef
  onClick: (def: BuildingDef) => void
  isSelected: boolean
  isMastered: boolean
  isGlowing: boolean
}) {
  const { scene } = useGLTF(`/models/kenney-suburban/${def.model}.glb`)
  const meshRef = useRef<THREE.Group>(null)
  const clonedScene = scene.clone()

  const emissiveIntensity = isGlowing ? 0.9 : isMastered ? 0.25 : isSelected ? 0.35 : 0
  const emissiveColor = isGlowing ? '#ffffff' : isMastered ? (def.color ?? '#4ECDC4') : '#ffffff'

  clonedScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
      if (def.color) mat.color.multiply(new THREE.Color(def.color))
      if (emissiveIntensity > 0) {
        mat.emissive = new THREE.Color(emissiveColor)
        mat.emissiveIntensity = emissiveIntensity
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
            background: 'rgba(0,0,0,0.88)', color: 'white',
            padding: '8px 14px', borderRadius: 10, fontSize: 13,
            fontFamily: 'system-ui', textAlign: 'center',
            direction: 'rtl', whiteSpace: 'nowrap',
            border: `2px solid ${def.color ?? '#fff'}`,
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{def.label}</div>
            <div style={{ opacity: 0.8 }}>📊 {def.statsConcept}</div>
            {isMastered && <div style={{ color: '#4ECDC4', fontSize: 11, marginTop: 4 }}>✓ נלמד</div>}
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Road/Prop ───────────────────────────────────────────────────────────────
function Prop({ model, pos, rot }: { model: string, pos: [number,number,number], rot: number }) {
  const { scene } = useGLTF(`/models/kenney-suburban/${model}.glb`)
  return <primitive object={scene.clone()} position={pos} rotation={[0, rot, 0]} scale={1.4} />
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#7ec850" roughness={0.9} />
    </mesh>
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function WaffleStackCity() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDef | null>(null)
  const [challengeBuilding, setChallengeBuilding] = useState<BuildingInfo | null>(null)
  const [mastered, setMastered] = useState<Set<string>>(loadMastered)
  const [xp, setXp] = useState(loadXP)
  const [xpPopup, setXpPopup] = useState(false)
  const [glowBuilding, setGlowBuilding] = useState<string | null>(null)
  const [showScoreBoard, setShowScoreBoard] = useState(false)

  const openChallenge = useCallback((building: BuildingDef) => {
    setChallengeBuilding({ id: building.id, label: building.label, statsConcept: building.statsConcept, color: building.color })
    setSelectedBuilding(null)
  }, [])

  const handleComplete = useCallback((buildingId: string) => {
    // Mark mastered
    setMastered(prev => {
      const next = new Set(prev)
      next.add(buildingId)
      localStorage.setItem('wafflestack-mastered', JSON.stringify([...next]))
      return next
    })
    // Add XP
    setXp(prev => {
      const next = prev + 50
      localStorage.setItem('wafflestack-xp', String(next))
      return next
    })
    // Glow + popup
    setGlowBuilding(buildingId)
    setXpPopup(true)
    setTimeout(() => setGlowBuilding(null), 2200)
    setTimeout(() => setXpPopup(false), 2000)
  }, [])

  const masteredCount = mastered.size

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Inject CSS animations */}
      <style>{ANIM_STYLE}</style>

      {/* Top-right controls: XP + ScoreBoard toggle */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'system-ui',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20,
          padding: '6px 14px',
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 16 }}>{xp} XP</span>
        </div>
        <button
          onClick={() => setShowScoreBoard(s => !s)}
          style={{
            background: showScoreBoard ? 'rgba(78,205,196,0.25)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showScoreBoard ? 'rgba(78,205,196,0.6)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showScoreBoard ? '#4ECDC4' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Toggle Score Board"
        >
          📊 Scores
        </button>
      </div>

      {/* Progress bar — top left */}
      <div style={{
        position: 'absolute', top: 16, left: 60, zIndex: 50,
        background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(78,205,196,0.3)', borderRadius: 20,
        padding: '6px 14px', fontFamily: 'system-ui', color: 'white',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          🏙️ {masteredCount}/{BUILDINGS.length} buildings mastered
        </span>
        <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
          <div style={{
            height: '100%', borderRadius: 3, background: '#4ECDC4',
            width: `${(masteredCount / BUILDINGS.length) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: 20, fontWeight: 'bold',
        fontFamily: 'system-ui', zIndex: 50, direction: 'rtl',
        background: 'rgba(0,0,0,0.5)', padding: '7px 18px', borderRadius: 12,
        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
        whiteSpace: 'nowrap',
      }}>
        🏙️ WaffleStack — עיר הסטטיסטיקה
      </div>

      {/* Hint */}
      {!selectedBuilding && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'system-ui', zIndex: 50,
          background: 'rgba(0,0,0,0.4)', padding: '5px 14px', borderRadius: 20,
          backdropFilter: 'blur(6px)', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          👆 לחץ על בניין כדי ללמוד ולשחק
        </div>
      )}

      {/* XP popup animation */}
      {xpPopup && (
        <div style={{
          position: 'fixed', top: '38%', left: '50%',
          fontSize: 42, fontWeight: 900, color: '#FFD700',
          animation: 'xpfloat 2s forwards', zIndex: 600,
          pointerEvents: 'none',
          textShadow: '0 2px 20px rgba(255,180,0,0.8), 0 0 40px rgba(255,215,0,0.4)',
          letterSpacing: 2,
        }}>
          +50 XP ⭐
        </div>
      )}

      {/* Loading overlay — HTML div, lives outside Canvas */}
      <CityLoader />

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [20, 18, 20], fov: 55 }} style={{ background: '#87CEEB' }}>
        <Sky sunPosition={[100, 50, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[30, 40, 20]} intensity={1.5} castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100} shadow-camera-left={-30}
          shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30}
        />
        <OrbitControls enablePan maxPolarAngle={Math.PI / 2.1} minDistance={8} maxDistance={60} target={[0, 0, -3]} />

        <Suspense fallback={null}>
          <Ground />
          {ROAD_MODELS.map((r, i) => <Prop key={i} model={r.model} pos={r.pos} rot={r.rot} />)}
          {BUILDINGS.map((b) => (
            <Building
              key={b.id}
              def={b}
              onClick={setSelectedBuilding}
              isSelected={selectedBuilding?.id === b.id}
              isMastered={mastered.has(b.id)}
              isGlowing={glowBuilding === b.id}
            />
          ))}
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} />
        </Suspense>
      </Canvas>

      {/* Info Panel */}
      {selectedBuilding && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,10,20,0.92)', border: `2px solid ${selectedBuilding.color ?? '#fff'}`,
          borderRadius: 16, padding: '20px 28px', color: 'white',
          fontFamily: 'system-ui', direction: 'rtl', textAlign: 'right',
          minWidth: 300, zIndex: 100, backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedBuilding.label}</div>
            <button onClick={() => setSelectedBuilding(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ marginTop: 8, color: selectedBuilding.color, fontSize: 15 }}>📊 {selectedBuilding.statsConcept}</div>
          {mastered.has(selectedBuilding.id) && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#4ECDC4' }}>✓ כבר למדת את זה — +50 XP הרווחת!</div>
          )}
          <div style={{ marginTop: 10, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
            לחץ "התחל אתגר" ללמוד, לראות גרף אינטראקטיבי ולענות על שאלות!
          </div>
          <button
            onClick={() => openChallenge(selectedBuilding)}
            style={{
              marginTop: 14, width: '100%', padding: '11px',
              background: selectedBuilding.color ?? '#4ECDC4', border: 'none', borderRadius: 8,
              color: '#000', fontWeight: 'bold', fontSize: 14, cursor: 'pointer',
            }}>
            {mastered.has(selectedBuilding.id) ? '🔄 שחק שוב' : '🎯 התחל אתגר'}
          </button>
        </div>
      )}

      {/* Challenge Modal */}
      {challengeBuilding && (
        <StatChallenge
          building={challengeBuilding}
          onClose={() => setChallengeBuilding(null)}
          onComplete={handleComplete}
        />
      )}

      {/* Score Board panel */}
      {showScoreBoard && (
        <ScoreBoard
          mastered={mastered}
          xp={xp}
          onClose={() => setShowScoreBoard(false)}
        />
      )}
    </div>
  )
}

// Preload models
BUILDINGS.forEach(b => useGLTF.preload(`/models/kenney-suburban/${b.model}.glb`))
ROAD_MODELS.forEach(r => useGLTF.preload(`/models/kenney-suburban/${r.model}.glb`))
