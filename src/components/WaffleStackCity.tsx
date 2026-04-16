import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky, ContactShadows, Html, useProgress } from '@react-three/drei'
import { Suspense, useState, useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import StatChallenge, { BuildingInfo } from './StatChallenge'
import ScoreBoard from './ScoreBoard'
import { useCitySound } from './SoundManager'

// ─── localStorage helpers ────────────────────────────────────────────────────
function loadMastered(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('wafflestack-mastered') || '[]')) }
  catch { return new Set() }
}
function loadXP(): number {
  return parseInt(localStorage.getItem('wafflestack-xp') || '0')
}
function loadQuizSound(): boolean {
  return localStorage.getItem('wafflestack-quiz-sound') === 'true'
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

const CONCEPT_PREVIEW: Record<string, string> = {
  'power':     'The average (mean) is the sum of all values divided by the count. It represents the "center" of your data.',
  'housing':   'The median is the middle value when data is sorted. Less sensitive to extreme outliers than the mean.',
  'traffic':   'Standard deviation measures how spread out values are from the mean. Higher = more variability.',
  'hospital':  'The normal distribution (bell curve) describes many natural phenomena — heights, test scores, errors.',
  'school':    'Sampling is how we study a population without measuring everyone. Sample size affects accuracy.',
  'bank':      'Regression finds the line that best fits data points, letting us predict one variable from another.',
  'market':    'Correlation measures the strength and direction of the relationship between two variables (−1 to +1).',
  'city-hall': 'The binomial distribution counts successes in a fixed number of yes/no trials (coin flips, votes).',
  'research':  'Hypothesis testing decides if data provides enough evidence to reject the null hypothesis.',
  'news':      'A confidence interval gives a range where the true population parameter likely falls (e.g. 95% CI).',
}

// ─── Onboarding steps ────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to WaffleStack!',
    body: 'This is a 3D statistics city. Each building is a stats concept waiting to be learned.',
    position: 'center' as const,
  },
  {
    id: 'buildings',
    title: '🏙️ Click Any Building',
    body: 'Click on a building to learn about its statistics concept and take a quiz.',
    position: 'center' as const,
  },
  {
    id: 'topics',
    title: '📚 Quick Access',
    body: 'Use the Topics button to jump directly to any concept. Use ⭐ and 📊 to track your progress.',
    position: 'center' as const,
  },
  {
    id: 'keyboard',
    title: '⌨️ Keyboard Shortcuts',
    body: 'Press ? for keyboard shortcuts, Esc to close panels, M to toggle sound.',
    position: 'center' as const,
  },
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
@keyframes milestonein {
  0%   { opacity: 0; transform: scale(0.85); }
  60%  { transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes confetti-fall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
  100% { opacity: 0; transform: translateY(80px) rotate(360deg) scale(0.5); }
}
@keyframes xpmilestone-in {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
  60%  { transform: translate(-50%, -50%) scale(1.06); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes xpmilestone-out {
  0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
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
function Building({ def, onClick, isSelected, isMastered, isGlowing, isHovered, onHoverStart, onHoverEnd }: {
  def: BuildingDef
  onClick: (def: BuildingDef) => void
  isSelected: boolean
  isMastered: boolean
  isGlowing: boolean
  isHovered: boolean
  onHoverStart: (id: string) => void
  onHoverEnd: () => void
}) {
  const { scene } = useGLTF(`/models/kenney-suburban/${def.model}.glb`)
  const meshRef = useRef<THREE.Group>(null)
  const clonedScene = scene.clone()

  const emissiveIntensity = isGlowing ? 0.9 : isMastered ? 0.25 : isSelected ? 0.35 : isHovered ? 0.15 : 0
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
      onPointerEnter={(e) => { e.stopPropagation(); onHoverStart(def.id) }}
      onPointerLeave={() => onHoverEnd()}
    >
      <primitive object={clonedScene} />
      {/* Hover tooltip — lightweight, shows when hovered but not selected */}
      {isHovered && !isSelected && (
        <Html center distanceFactor={15} position={[0, 2.8, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.78)', color: 'white',
            padding: '5px 11px', borderRadius: 8, fontSize: 12,
            fontFamily: 'system-ui', textAlign: 'center',
            direction: 'rtl', whiteSpace: 'nowrap',
            border: `1px solid ${def.color ?? 'rgba(255,255,255,0.3)'}`,
            pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 600 }}>{def.label}</div>
            <div style={{ color: def.color ?? '#aaa', fontSize: 11, marginTop: 2 }}>
              {def.statsConcept} {isMastered ? '✓' : '○'}
            </div>
          </div>
        </Html>
      )}
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
  const [sessionStart] = useState(() => Date.now())
  const { playing: soundPlaying, toggle: toggleSound } = useCitySound()
  const [quizSoundEnabled, setQuizSoundEnabled] = useState(loadQuizSound)
  const [showHelp, setShowHelp] = useState(false)
  const [milestone, setMilestone] = useState<5 | 10 | null>(null)
  const [xpMilestone, setXpMilestone] = useState<number | null>(null)
  const [xpMilestoneFading, setXpMilestoneFading] = useState(false)
  const [showTopicsList, setShowTopicsList] = useState(false)
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)
  const [onboardingStep, setOnboardingStep] = useState<number>(() =>
    localStorage.getItem('wafflestack-onboarded') ? -1 : 0
  )

  const advanceOnboarding = () => {
    if (onboardingStep + 1 >= ONBOARDING_STEPS.length) {
      setOnboardingStep(-1)
      localStorage.setItem('wafflestack-onboarded', '1')
    } else {
      setOnboardingStep(s => s + 1)
    }
  }

  const skipOnboarding = () => {
    setOnboardingStep(-1)
    localStorage.setItem('wafflestack-onboarded', '1')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't fire when typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case '?':
        case '/':
          e.preventDefault()
          setShowHelp(h => !h)
          break
        case 'Escape':
          // Priority: challenge > info panel > scoreboard > help
          if (challengeBuilding !== null) {
            setChallengeBuilding(null)
          } else if (selectedBuilding !== null) {
            setSelectedBuilding(null)
          } else if (showScoreBoard) {
            setShowScoreBoard(false)
          } else if (showTopicsList) {
            setShowTopicsList(false)
          } else {
            setShowHelp(false)
          }
          break
        case 'm':
        case 'M':
          toggleSound()
          break
        case 's':
        case 'S':
          setShowScoreBoard(s => !s)
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [challengeBuilding, selectedBuilding, showScoreBoard, showTopicsList, toggleSound])

  const openChallenge = useCallback((building: BuildingDef) => {
    setChallengeBuilding({ id: building.id, label: building.label, statsConcept: building.statsConcept, color: building.color })
    setSelectedBuilding(null)
  }, [])

  const handleReset = useCallback(() => {
    localStorage.removeItem('wafflestack-mastered')
    localStorage.removeItem('wafflestack-xp')
    setMastered(new Set())
    setXp(0)
    setShowScoreBoard(false)
  }, [])

  const handleComplete = useCallback((buildingId: string) => {
    // Mark mastered
    setMastered(prev => {
      const next = new Set(prev)
      next.add(buildingId)
      localStorage.setItem('wafflestack-mastered', JSON.stringify([...next]))
      if (next.size === 5) setTimeout(() => setMilestone(5), 500)
      if (next.size === 10) setTimeout(() => setMilestone(10), 500)
      return next
    })
    // Add XP + check XP milestones
    setXp(prev => {
      const next = prev + 50
      localStorage.setItem('wafflestack-xp', String(next))
      const shown: number[] = JSON.parse(localStorage.getItem('wafflestack-xp-milestones') || '[]')
      for (const threshold of [250, 500, 750, 1000]) {
        if (prev < threshold && next >= threshold && !shown.includes(threshold)) {
          shown.push(threshold)
          localStorage.setItem('wafflestack-xp-milestones', JSON.stringify(shown))
          setTimeout(() => {
            setXpMilestone(threshold)
            setXpMilestoneFading(false)
            setTimeout(() => setXpMilestoneFading(true), 2600)
            setTimeout(() => setXpMilestone(null), 3200)
          }, 400)
          break
        }
      }
      return next
    })
    // Update streak
    const todayStr = new Date().toISOString().slice(0, 10)
    const lastStudy = localStorage.getItem('wafflestack-last-study') || ''
    const currentStreak = parseInt(localStorage.getItem('wafflestack-streak') || '0')
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = currentStreak
    if (lastStudy !== todayStr) {
      // First completion today
      newStreak = lastStudy === yesterday ? currentStreak + 1 : 1
      localStorage.setItem('wafflestack-streak', String(newStreak))
      localStorage.setItem('wafflestack-last-study', todayStr)
    }
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
          onClick={toggleSound}
          style={{
            background: 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20, padding: '6px 14px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={soundPlaying ? 'Mute city sound' : 'Unmute city sound'}
        >
          {soundPlaying ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => {
            const next = !quizSoundEnabled
            setQuizSoundEnabled(next)
            localStorage.setItem('wafflestack-quiz-sound', String(next))
          }}
          style={{
            background: quizSoundEnabled ? 'rgba(78,205,196,0.15)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${quizSoundEnabled ? 'rgba(78,205,196,0.5)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: quizSoundEnabled ? '#4ECDC4' : 'rgba(255,255,255,0.5)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={quizSoundEnabled ? 'Mute quiz sounds' : 'Enable quiz sounds'}
        >
          🎵
        </button>
        <button
          onClick={() => setShowTopicsList(t => !t)}
          style={{
            background: showTopicsList ? 'rgba(170,150,218,0.25)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showTopicsList ? 'rgba(170,150,218,0.6)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showTopicsList ? '#AA96DA' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="All topics list"
        >
          📚 Topics
        </button>
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

      {/* XP milestone overlay — auto-dismisses after 3s */}
      {xpMilestone !== null && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          zIndex: 650, pointerEvents: 'none',
          animation: xpMilestoneFading
            ? 'xpmilestone-out 0.6s ease forwards'
            : 'xpmilestone-in 0.4s ease forwards',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a1a30 0%, #0f2540 100%)',
            border: '2px solid rgba(255,215,0,0.6)',
            borderRadius: 20, padding: '28px 40px', textAlign: 'center',
            fontFamily: 'system-ui', color: 'white',
            boxShadow: '0 0 60px rgba(255,215,0,0.25)',
            position: 'relative', overflow: 'hidden',
            minWidth: 280,
          }}>
            {/* Confetti emoji elements */}
            {['🎊', '⭐', '🎉', '✨', '🎊', '⭐'].map((emoji, i) => (
              <span key={i} style={{
                position: 'absolute',
                top: `${10 + (i % 3) * 15}%`,
                left: `${5 + i * 15}%`,
                fontSize: 18,
                animation: `confetti-fall ${0.8 + i * 0.15}s ease ${i * 0.1}s both`,
                pointerEvents: 'none',
              }}>{emoji}</span>
            ))}
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FFD700', marginBottom: 6 }}>
              Level Up!
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
              {xpMilestone} XP reached
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              🏙️ City grows stronger
            </div>
          </div>
        </div>
      )}

      {/* Milestone celebration overlay */}
      {milestone !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 700, backdropFilter: 'blur(12px)',
          }}
          onClick={() => setMilestone(null)}
        >
          <div style={{
            background: milestone === 10
              ? 'linear-gradient(135deg, #1a0a30 0%, #2d1a50 100%)'
              : 'linear-gradient(135deg, #0a1a20 0%, #0f2535 100%)',
            border: `2px solid ${milestone === 10 ? '#FFD700' : '#4ECDC4'}`,
            borderRadius: 24, padding: '40px 48px', textAlign: 'center',
            fontFamily: 'system-ui', color: 'white', maxWidth: 460,
            boxShadow: `0 0 60px ${milestone === 10 ? 'rgba(255,215,0,0.3)' : 'rgba(78,205,196,0.3)'}`,
            animation: 'milestonein 0.4s ease forwards',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>
              {milestone === 10 ? '🏆' : '🌟'}
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900, marginBottom: 8,
              color: milestone === 10 ? '#FFD700' : '#4ECDC4',
            }}>
              {milestone === 10 ? 'City Complete!' : 'Halfway There!'}
            </div>
            <div style={{
              fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24,
            }}>
              {milestone === 10
                ? 'You mastered ALL 10 statistics concepts!\nWaffleStack City is fully built. 🏙️'
                : 'You mastered 5 out of 10 concepts!\nKeep going to complete the city!'}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: milestone === 10 ? '#FFD700' : '#4ECDC4',
              marginBottom: 24,
            }}>
              {milestone === 10 ? '🎓 Statistics Master' : '⭐ Great Progress!'}
            </div>
            <button
              onClick={() => setMilestone(null)}
              style={{
                background: milestone === 10
                  ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                  : 'linear-gradient(90deg, #4ECDC4, #44b8b0)',
                border: 'none', borderRadius: 12,
                padding: '12px 32px', color: '#000',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
              }}
            >
              {milestone === 10 ? '🏙️ View My City' : '🚀 Keep Building'}
            </button>
          </div>
        </div>
      )}

      {/* Onboarding overlay */}
      {onboardingStep >= 0 && onboardingStep < ONBOARDING_STEPS.length && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 650,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          pointerEvents: 'all',
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
            border: '1px solid rgba(78,205,196,0.3)', borderRadius: 20,
            padding: '32px 36px', maxWidth: 440, width: '90%',
            fontFamily: 'system-ui', color: 'white', textAlign: 'center',
            boxShadow: '0 0 60px rgba(78,205,196,0.15)',
          }}>
            {/* Step indicator dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
              {ONBOARDING_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === onboardingStep ? 20 : 6,
                  height: 6, borderRadius: 3,
                  background: i === onboardingStep ? '#4ECDC4' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
              {ONBOARDING_STEPS[onboardingStep].title}
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 28 }}>
              {ONBOARDING_STEPS[onboardingStep].body}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={skipOnboarding}
                style={{
                  padding: '10px 20px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                  color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer',
                }}
              >
                Skip
              </button>
              <button
                onClick={advanceOnboarding}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(90deg, #4ECDC4, #44b8b0)',
                  border: 'none', borderRadius: 10,
                  color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                }}
              >
                {onboardingStep + 1 >= ONBOARDING_STEPS.length ? '🚀 Let\'s Go!' : 'Next →'}
              </button>
            </div>
          </div>
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
              isHovered={hoveredBuilding === b.id}
              onHoverStart={setHoveredBuilding}
              onHoverEnd={() => setHoveredBuilding(null)}
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
          {CONCEPT_PREVIEW[selectedBuilding.id] && (
            <div style={{
              marginTop: 10, padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8, borderLeft: `3px solid ${selectedBuilding.color ?? '#4ECDC4'}`,
              fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6,
              direction: 'ltr', textAlign: 'left',
            }}>
              {CONCEPT_PREVIEW[selectedBuilding.id]}
            </div>
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
          soundEnabled={quizSoundEnabled}
        />
      )}

      {/* Score Board panel */}
      {showScoreBoard && (
        <ScoreBoard
          mastered={mastered}
          xp={xp}
          sessionStart={sessionStart}
          onClose={() => setShowScoreBoard(false)}
          onReset={handleReset}
        />
      )}

      {/* Topics List modal */}
      {showTopicsList && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 450, backdropFilter: 'blur(10px)', padding: 20,
        }} onClick={() => setShowTopicsList(false)}>
          <div style={{
            background: 'linear-gradient(160deg, #0a0a18 0%, #0f1525 100%)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            width: '100%', maxWidth: 560, maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>📚 All Topics</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {mastered.size}/10 mastered · Click to open challenge
                </div>
              </div>
              <button onClick={() => setShowTopicsList(false)} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* Building list */}
            <div style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {BUILDINGS.map(b => {
                const isMastered = mastered.has(b.id)
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setShowTopicsList(false)
                      openChallenge(b)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px', borderRadius: 12, cursor: 'pointer', width: '100%',
                      background: isMastered ? `linear-gradient(90deg, ${b.color ?? '#fff'}12 0%, transparent 100%)` : 'rgba(255,255,255,0.03)',
                      border: isMastered ? `1px solid ${b.color ?? '#fff'}30` : '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isMastered ? `linear-gradient(90deg, ${b.color ?? '#fff'}22 0%, transparent 100%)` : 'rgba(255,255,255,0.07)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isMastered ? `linear-gradient(90deg, ${b.color ?? '#fff'}12 0%, transparent 100%)` : 'rgba(255,255,255,0.03)' }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${b.color ?? '#fff'}18`, border: `1px solid ${b.color ?? '#fff'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {b.label.split(' ')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: isMastered ? '#fff' : 'rgba(255,255,255,0.7)',
                        direction: 'rtl', textAlign: 'right',
                      }}>
                        {b.label}
                      </div>
                      <div style={{ fontSize: 12, color: b.color ?? '#4ECDC4', marginTop: 2 }}>
                        {b.statsConcept}
                      </div>
                    </div>
                    <div style={{
                      flexShrink: 0, fontSize: 12, fontWeight: 700,
                      color: isMastered ? '#4ECDC4' : 'rgba(255,255,255,0.25)',
                    }}>
                      {isMastered ? '✓' : '→'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Help button — bottom-right */}
      <button
        onClick={() => setShowHelp(h => !h)}
        style={{
          position: 'absolute', bottom: 24, right: 24, zIndex: 50,
          background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
          width: 36, height: 36, color: 'rgba(255,255,255,0.6)',
          fontWeight: 700, fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Keyboard shortcuts"
      >
        ?
      </button>

      {/* Help overlay */}
      {showHelp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500, backdropFilter: 'blur(8px)',
        }} onClick={() => setShowHelp(false)}>
          <div style={{
            background: 'linear-gradient(180deg, #0a0a18 0%, #0f1525 100%)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20,
            padding: '28px 36px', minWidth: 340, maxWidth: 460,
            fontFamily: 'system-ui', color: 'white',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>⌨️ Keyboard Shortcuts</div>
            {[
              { key: '?', desc: 'Toggle this help overlay' },
              { key: 'Esc', desc: 'Close any open panel' },
              { key: 'M', desc: 'Toggle city sound' },
              { key: 'S', desc: 'Toggle score board' },
            ].map(({ key, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '3px 10px', fontFamily: 'monospace',
                  fontSize: 13, fontWeight: 700, minWidth: 40, textAlign: 'center',
                  color: '#4ECDC4',
                }}>{key}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{desc}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              Click anywhere outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Preload models
BUILDINGS.forEach(b => useGLTF.preload(`/models/kenney-suburban/${b.model}.glb`))
ROAD_MODELS.forEach(r => useGLTF.preload(`/models/kenney-suburban/${r.model}.glb`))
