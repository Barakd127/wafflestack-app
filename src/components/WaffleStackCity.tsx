import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky, ContactShadows, Html, useProgress } from '@react-three/drei'
import { Suspense, useState, useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import StatChallenge, { BuildingInfo, getQuizForBuilding } from './StatChallenge'
import ScoreBoard from './ScoreBoard'
import ExamMode from './ExamMode'
import { useCitySound, playBuildingPlacedTone } from './SoundManager'
import LearningMap from './LearningMap'

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
function loadColorVariations(): Record<string, 'A' | 'B' | 'C'> {
  try { return JSON.parse(localStorage.getItem('wafflestack-color-variations') || '{}') }
  catch { return {} }
}
function loadMasteryDates(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('wafflestack-mastery-dates') || '{}') }
  catch { return {} }
}
function daysSince(dateStr: string): number {
  const today = new Date().toISOString().slice(0, 10)
  return Math.round((new Date(today).getTime() - new Date(dateStr).getTime()) / 86400000)
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface BuildingDef {
  id: string
  model: string
  customModel?: string  // full path from models/ root for Tripo3D assets (spaces allowed)
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
  { id: 'housing',   model: 'building-type-c', label: '🏠 מנהל דיור',  statsConcept: 'חציון (Median)',      position: [-3, 0, -9], color: '#4ECDC4', customModel: 'models/cozy apartment 3d model.glb', scale: 1.0 },
  { id: 'traffic',   model: 'building-type-e', label: '🚦 בקרת תנועה', statsConcept: 'סטיית תקן (Std Dev)', position: [3,  0, -9], color: '#FF6B6B' },
  { id: 'hospital',  model: 'building-type-g', label: '🏥 בית חולים',  statsConcept: 'התפלגות נורמלית',    position: [9,  0, -9], color: '#95E1D3' },
  { id: 'school',    model: 'building-type-b', label: '🏫 בית ספר',    statsConcept: 'מדגם (Sampling)',     position: [-9, 0, -3], color: '#AA96DA' },
  { id: 'bank',      model: 'building-type-d', label: '🏦 בנק',        statsConcept: 'רגרסיה (Regression)', position: [-3, 0, -3], color: '#FCBAD3' },
  { id: 'market',    model: 'building-type-f', label: '🏪 שוק',        statsConcept: 'קורלציה (Correlation)',position: [3,  0, -3], color: '#A8E6CF', customModel: 'models/traditional chinese architecture 3d model.glb', scale: 1.0 },
  { id: 'city-hall', model: 'building-type-h', label: '🏛️ עיריה',      statsConcept: 'בינום (Binomial)',    position: [9,  0, -3], color: '#F38181', customModel: 'models/greco-roman temple 3d model.glb', scale: 1.0 },
  { id: 'research',  model: 'building-type-i', label: '🔬 מכון מחקר',  statsConcept: 'מבחן השערות',         position: [-3, 0, 3],  color: '#C3A6FF', customModel: 'models/ancient ruins 3d model.glb', scale: 1.0 },
  { id: 'news',      model: 'building-type-j', label: '📰 תחנת חדשות', statsConcept: 'רווח סמך (CI)',       position: [3,  0, 3],  color: '#FFB347', customModel: 'models/neo utopian city 3d model.glb', scale: 1.0 },
]

// ─── Kenney color variation palettes ─────────────────────────────────────────
const COLOR_VARIATIONS: Record<'A' | 'B' | 'C', Record<string, string>> = {
  A: { // Original warm tones (Kenney Variation A — orange/red/teal)
    power: '#FFD700', housing: '#4ECDC4', traffic: '#FF6B6B', hospital: '#95E1D3',
    school: '#AA96DA', bank: '#FCBAD3', market: '#A8E6CF', 'city-hall': '#F38181',
    research: '#C3A6FF', news: '#FFB347',
  },
  B: { // Cool tones (Kenney Variation B — blue/purple)
    power: '#5B8CFF', housing: '#7B5EA7', traffic: '#4A90D9', hospital: '#6C9DC9',
    school: '#8B77DB', bank: '#A78BFA', market: '#60A5FA', 'city-hall': '#818CF8',
    research: '#A855F7', news: '#6366F1',
  },
  C: { // Neutral tones (Kenney Variation C — gray/white)
    power: '#D4D4D4', housing: '#E8E8E8', traffic: '#B8B8B8', hospital: '#F0F0F0',
    school: '#D0D0D0', bank: '#E8DCDC', market: '#DCDCDC', 'city-hall': '#C8C8C8',
    research: '#DEDEDE', news: '#E8E4DC',
  },
}

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

const GLOSSARY_DATA: Record<string, { conceptEn: string; formula: string }> = {
  power:      { conceptEn: 'Mean',                  formula: 'μ = Σxᵢ / n' },
  housing:    { conceptEn: 'Median',                formula: 'Sort data → middle value' },
  traffic:    { conceptEn: 'Standard Deviation',    formula: 'σ = √[Σ(xᵢ-μ)²/n]' },
  hospital:   { conceptEn: 'Normal Distribution',   formula: 'f(x) = (1/σ√2π)·e^(-(x-μ)²/2σ²)' },
  school:     { conceptEn: 'Sampling',              formula: 'SE = σ / √n' },
  bank:       { conceptEn: 'Regression',            formula: 'y = β₀ + β₁x + ε' },
  market:     { conceptEn: 'Correlation',           formula: 'r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / (n·σₓ·σᵧ)' },
  'city-hall':{ conceptEn: 'Binomial Distribution', formula: 'P(X=k) = C(n,k)·pᵏ·(1-p)^(n-k)' },
  research:   { conceptEn: 'Hypothesis Testing',    formula: 'z = (x̄-μ₀) / (σ/√n)' },
  news:       { conceptEn: 'Confidence Interval',   formula: 'CI = x̄ ± z·(σ/√n)' },
}

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

// ─── Flash card data ─────────────────────────────────────────────────────────
const FLASH_CARDS = BUILDINGS.map(b => ({
  id: b.id,
  emoji: b.label.split(' ')[0],
  labelHe: b.statsConcept.split(' (')[0],
  labelEn: GLOSSARY_DATA[b.id]?.conceptEn ?? '',
  formula: GLOSSARY_DATA[b.id]?.formula ?? '',
  preview: CONCEPT_PREVIEW[b.id] ?? '',
  color: b.color ?? '#4ECDC4',
}))

// ─── Concept map layout ──────────────────────────────────────────────────────
const CONCEPT_MAP_POS: Record<string, [number, number]> = {
  power:        [140, 80],
  housing:      [290, 55],
  'city-hall':  [500, 80],
  traffic:      [65, 205],
  hospital:     [305, 205],
  school:       [510, 195],
  bank:         [100, 340],
  market:       [210, 260],
  research:     [425, 320],
  news:         [565, 310],
}

const CONCEPT_MAP_EDGES: [string, string][] = [
  ['power',     'housing'],
  ['power',     'traffic'],
  ['power',     'hospital'],
  ['housing',   'traffic'],
  ['traffic',   'hospital'],
  ['hospital',  'research'],
  ['hospital',  'news'],
  ['hospital',  'city-hall'],
  ['school',    'research'],
  ['school',    'news'],
  ['city-hall', 'school'],
  ['bank',      'market'],
  ['bank',      'hospital'],
  ['market',    'power'],
  ['research',  'news'],
]

// ─── Daily challenge helpers ──────────────────────────────────────────────────
function getDailyBuildingId(): string {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  return BUILDINGS[seed % BUILDINGS.length].id
}

function loadDailyChallengeDone(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return localStorage.getItem('wafflestack-daily-done') === today
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
.building-thumb {
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.55));
  transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
}
.building-thumb:hover {
  transform: scale(1.06);
  filter: drop-shadow(0 4px 14px rgba(0,0,0,0.7));
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
      fontFamily: "'Heebo', system-ui, sans-serif", zIndex: 10, pointerEvents: 'none',
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
function Building({ def, onClick, isSelected, isMastered, isGlowing, isHovered, onHoverStart, onHoverEnd, colorOverride }: {
  def: BuildingDef
  onClick: (def: BuildingDef) => void
  isSelected: boolean
  isMastered: boolean
  isGlowing: boolean
  isHovered: boolean
  onHoverStart: (id: string) => void
  onHoverEnd: () => void
  colorOverride?: string
}) {
  const modelUrl = def.customModel
    ? `${import.meta.env.BASE_URL}${def.customModel.replace(/ /g, '%20')}`
    : `${import.meta.env.BASE_URL}models/kenney-suburban/${def.model}.glb`
  const { scene } = useGLTF(modelUrl)
  const meshRef = useRef<THREE.Group>(null)
  const clonedScene = scene.clone()

  const activeColor = colorOverride ?? def.color
  const emissiveIntensity = isGlowing ? 0.9 : isMastered ? 0.25 : isSelected ? 0.35 : isHovered ? 0.15 : 0
  const emissiveColor = isGlowing ? '#ffffff' : isMastered ? (activeColor ?? '#4ECDC4') : '#ffffff'

  clonedScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
      if (activeColor) {
        // Use set() for variation B/C (clean palette swap); multiply for A (preserves model texture detail)
        if (colorOverride && colorOverride !== def.color) {
          mat.color.set(activeColor)
        } else if (def.color) {
          mat.color.multiply(new THREE.Color(def.color))
        }
      }
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
            fontFamily: "'Heebo', system-ui, sans-serif", textAlign: 'center',
            direction: 'rtl', whiteSpace: 'nowrap',
            border: `1px solid ${activeColor ?? 'rgba(255,255,255,0.3)'}`,
            pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 600 }}>{def.label}</div>
            <div style={{ color: activeColor ?? '#aaa', fontSize: 11, marginTop: 2 }}>
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
            fontFamily: "'Heebo', system-ui, sans-serif", textAlign: 'center',
            direction: 'rtl', whiteSpace: 'nowrap',
            border: `2px solid ${activeColor ?? '#fff'}`,
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
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/kenney-suburban/${model}.glb`)
  return <primitive object={scene.clone()} position={pos} rotation={[0, rot, 0]} scale={1.4} />
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
const GRID_X = [-9, -3, 3, 9]
const GRID_Z = [-9, -3, 3]
const OCCUPIED_CELLS = new Set(BUILDINGS.map(b => `${b.position[0]},${b.position[2]}`))

function snapToCell(x: number, z: number): [number, number] {
  const sx = GRID_X.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a)
  const sz = GRID_Z.reduce((a, b) => Math.abs(b - z) < Math.abs(a - z) ? b : a)
  return [sx, sz]
}

// ─── Ghost building preview ───────────────────────────────────────────────────
function GhostBuilding({ x, z, valid }: { x: number; z: number; valid: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3.2, 4, 3.2]} />
        <meshStandardMaterial
          color={valid ? '#00ff88' : '#ff4444'}
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 5.5]} />
        <meshStandardMaterial
          color={valid ? '#00ff88' : '#ff4444'}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Ground({ onMove, onLeave }: { onMove?: (x: number, z: number) => void; onLeave?: () => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, 0]}
      receiveShadow
      onPointerMove={(e) => onMove?.(e.point.x, e.point.z)}
      onPointerLeave={() => onLeave?.()}
    >
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#7ec850" roughness={0.9} />
    </mesh>
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function WaffleStackCity({ onBack }: { onBack?: () => void }) {
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
  const [colorVariations, setColorVariations] = useState<Record<string, 'A' | 'B' | 'C'>>(loadColorVariations)
  const [masteryDates, setMasteryDates] = useState<Record<string, string>>(loadMasteryDates)
  const [dailyDone, setDailyDone] = useState<boolean>(loadDailyChallengeDone)
  const dailyChallengeId = getDailyBuildingId()
  const dailyBuilding = BUILDINGS.find(b => b.id === dailyChallengeId) ?? null
  const [dailyGoalDismissed, setDailyGoalDismissed] = useState<boolean>(() => {
    const today = new Date().toISOString().slice(0, 10)
    return localStorage.getItem('wafflestack-daily-dismissed') === today
  })
  const [showHelp, setShowHelp] = useState(false)
  const [milestone, setMilestone] = useState<5 | 10 | null>(null)
  const [xpMilestone, setXpMilestone] = useState<number | null>(null)
  const [xpMilestoneFading, setXpMilestoneFading] = useState(false)
  const [showTopicsList, setShowTopicsList] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [showFlashCards, setShowFlashCards] = useState(false)
  const [showExamMode, setShowExamMode] = useState(false)
  const [showConceptMap, setShowConceptMap] = useState(false)
  const [showLearningMap, setShowLearningMap] = useState(false)
  const [flashCardIndex, setFlashCardIndex] = useState(0)
  const [flashCardFlipped, setFlashCardFlipped] = useState(false)
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)
  const [ghostCell, setGhostCell] = useState<[number, number] | null>(null)
  const [onboardingStep, setOnboardingStep] = useState<number>(() =>
    localStorage.getItem('wafflestack-onboarded') ? -1 : 0
  )

  // Weak spots practice quiz state
  interface WQQuestion { buildingId: string; buildingLabel: string; color: string; q: string; options: string[]; correct: number; explanation: string }
  const [showWeakSpotsQuiz, setShowWeakSpotsQuiz] = useState(false)
  const [wqQuestions, setWqQuestions] = useState<WQQuestion[]>([])
  const [wqIndex, setWqIndex] = useState(0)
  const [wqSelected, setWqSelected] = useState<number | null>(null)
  const [wqScore, setWqScore] = useState(0)
  const [wqDone, setWqDone] = useState(false)
  const [wqMode, setWqMode] = useState<'weak-spots' | 'quick-mix'>('weak-spots')

  // Formula Drill state
  const [formulaDrillActive, setFormulaDrillActive] = useState(false)
  const [fdIndex, setFdIndex] = useState(0)
  const [fdSelected, setFdSelected] = useState<number | null>(null)
  const [fdScore, setFdScore] = useState(0)
  const [fdDone, setFdDone] = useState(false)
  const [fdItems, setFdItems] = useState<{ buildingId: string; formula: string; emoji: string; options: string[]; correctIdx: number }[]>([])

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
          } else if (showGlossary) {
            setShowGlossary(false)
          } else if (showTopicsList) {
            setShowTopicsList(false)
          } else if (showFlashCards) {
            setShowFlashCards(false)
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
        case 't':
        case 'T':
          setShowTopicsList(t => !t)
          break
        case 'g':
        case 'G':
          setShowGlossary(g => !g)
          break
        case 'f':
        case 'F':
          setShowFlashCards(f => !f)
          setFlashCardFlipped(false)
          break
        case 'e':
        case 'E':
          setShowExamMode(m => !m)
          break
        case 'c':
        case 'C':
          setShowConceptMap(m => !m)
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [challengeBuilding, selectedBuilding, showScoreBoard, showTopicsList, showGlossary, showFlashCards, showExamMode, showConceptMap, toggleSound])

  // Handle deep-link hash on mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#topics') setShowTopicsList(true)
    else if (hash === '#score') setShowScoreBoard(true)
    else if (hash.startsWith('#challenge/')) {
      const buildingId = hash.slice('#challenge/'.length)
      const building = BUILDINGS.find(b => b.id === buildingId)
      if (building) setChallengeBuilding({ id: building.id, label: building.label, statsConcept: building.statsConcept, color: building.color })
    }
  }, [])

  // Keep hash in sync with current UI state
  useEffect(() => {
    if (challengeBuilding) window.location.hash = `#challenge/${challengeBuilding.id}`
    else if (showTopicsList) window.location.hash = '#topics'
    else if (showScoreBoard) window.location.hash = '#score'
    else window.location.hash = '#city'
  }, [challengeBuilding, showTopicsList, showScoreBoard])

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
    // Record mastery date (first time only)
    setMasteryDates(prev => {
      if (prev[buildingId]) return prev
      const next = { ...prev, [buildingId]: new Date().toISOString().slice(0, 10) }
      localStorage.setItem('wafflestack-mastery-dates', JSON.stringify(next))
      return next
    })
    // Daily challenge bonus XP
    if (buildingId === dailyChallengeId && !dailyDone) {
      setDailyDone(true)
      localStorage.setItem('wafflestack-daily-done', new Date().toISOString().slice(0, 10))
      setXp(prev => {
        const next = prev + 50
        localStorage.setItem('wafflestack-xp', String(next))
        return next
      })
    }
    // Glow + popup + placement sound
    setGlowBuilding(buildingId)
    setXpPopup(true)
    if (quizSoundEnabled) playBuildingPlacedTone()
    setTimeout(() => setGlowBuilding(null), 2200)
    setTimeout(() => setXpPopup(false), 2000)
  }, [quizSoundEnabled, dailyChallengeId, dailyDone])

  const handlePracticeWeakSpots = useCallback(() => {
    const qs: WQQuestion[] = BUILDINGS
      .filter(b => {
        const s = localStorage.getItem(`wafflestack-score-${b.id}`)
        const t = localStorage.getItem(`wafflestack-total-${b.id}`)
        return s && t && parseInt(s) / parseInt(t) < 0.7
      })
      .flatMap(b => getQuizForBuilding(b.id).slice(0, 2).map(q => ({
        buildingId: b.id, buildingLabel: b.label, color: b.color ?? '#4ECDC4', ...q,
      })))
    if (qs.length === 0) return
    setWqMode('weak-spots')
    setWqQuestions(qs)
    setWqIndex(0)
    setWqSelected(null)
    setWqScore(0)
    setWqDone(false)
    setShowWeakSpotsQuiz(true)
    setShowScoreBoard(false)
  }, [])

  const handleStartQuickMix = useCallback(() => {
    const shuffled = [...BUILDINGS].sort(() => Math.random() - 0.5).slice(0, 5)
    const qs: WQQuestion[] = shuffled.flatMap(b => {
      const questions = getQuizForBuilding(b.id)
      if (questions.length === 0) return []
      const q = questions[Math.floor(Math.random() * questions.length)]
      return [{ buildingId: b.id, buildingLabel: b.label, color: b.color ?? '#4ECDC4', ...q }]
    })
    if (qs.length === 0) return
    setWqMode('quick-mix')
    setWqQuestions(qs)
    setWqIndex(0)
    setWqSelected(null)
    setWqScore(0)
    setWqDone(false)
    setShowWeakSpotsQuiz(true)
    setShowTopicsList(false)
  }, [])

  const startFormulaDrill = useCallback(() => {
    const shuffled = [...BUILDINGS].sort(() => Math.random() - 0.5)
    const items = shuffled.map(b => {
      const correctName = b.statsConcept.split(' (')[0]
      const otherNames = BUILDINGS
        .filter(ob => ob.id !== b.id)
        .map(ob => ob.statsConcept.split(' (')[0])
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      const options = [...otherNames, correctName].sort(() => Math.random() - 0.5)
      return {
        buildingId: b.id,
        formula: GLOSSARY_DATA[b.id]?.formula ?? '?',
        emoji: b.label.split(' ')[0],
        options,
        correctIdx: options.indexOf(correctName),
      }
    })
    setFdItems(items)
    setFdIndex(0)
    setFdSelected(null)
    setFdScore(0)
    setFdDone(false)
    setFormulaDrillActive(true)
  }, [])

  const masteredCount = mastered.size

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Inject CSS animations */}
      <style>{ANIM_STYLE}</style>

      {/* Top-right controls: XP + ScoreBoard toggle */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Heebo', system-ui, sans-serif",
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
          onClick={() => { setShowFlashCards(f => !f); setFlashCardFlipped(false) }}
          style={{
            background: showFlashCards ? 'rgba(255,199,0,0.2)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showFlashCards ? 'rgba(255,199,0,0.5)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showFlashCards ? '#FFC700' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Flash Cards — review all concepts (F)"
        >
          📇 Flash
        </button>
        <button
          onClick={() => setShowExamMode(m => !m)}
          style={{
            background: showExamMode ? 'rgba(243,129,129,0.25)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showExamMode ? 'rgba(243,129,129,0.6)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showExamMode ? '#F38181' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Exam Mode — 10 questions, timed (E)"
        >
          📝 Exam
        </button>
        <button
          onClick={() => setShowConceptMap(m => !m)}
          style={{
            background: showConceptMap ? 'rgba(255,107,107,0.2)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showConceptMap ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showConceptMap ? '#FF6B6B' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Concept Map (C)"
        >
          🗺️ Map
        </button>
        <button
          onClick={() => setShowLearningMap(m => !m)}
          style={{
            background: showLearningMap ? 'rgba(78,205,196,0.2)' : 'rgba(10,10,20,0.75)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${showLearningMap ? 'rgba(78,205,196,0.5)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '6px 14px',
            color: showLearningMap ? '#4ECDC4' : 'rgba(255,255,255,0.8)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Learning Path — 5 core topics"
        >
          📍 Path
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
        padding: '6px 14px', fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
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

      {/* Daily goal chip */}
      {!dailyGoalDismissed && dailyBuilding && (
        <div
          onClick={() => {
            if (!dailyDone) setChallengeBuilding({ id: dailyBuilding.id, label: dailyBuilding.label, statsConcept: dailyBuilding.statsConcept, color: dailyBuilding.color })
          }}
          style={{
            position: 'absolute', top: 58, left: 60, zIndex: 50,
            background: dailyDone ? 'rgba(78,205,196,0.12)' : 'rgba(255,215,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${dailyDone ? 'rgba(78,205,196,0.35)' : 'rgba(255,215,0,0.3)'}`,
            borderRadius: 20, padding: '4px 10px 4px 13px',
            fontFamily: "'Heebo', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: dailyDone ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 11, color: dailyDone ? '#4ECDC4' : '#FFD700', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {dailyDone
              ? '✓ Daily done! +50 XP'
              : `🎯 היום: ${dailyBuilding.statsConcept.split(' (')[0]}`}
          </span>
          <button
            onClick={e => {
              e.stopPropagation()
              setDailyGoalDismissed(true)
              localStorage.setItem('wafflestack-daily-dismissed', new Date().toISOString().slice(0, 10))
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', fontSize: 10, padding: 0,
              lineHeight: 1, flexShrink: 0,
            }}
          >✕</button>
        </div>
      )}

      {/* Title */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: 20, fontWeight: 'bold',
        fontFamily: "'Heebo', system-ui, sans-serif", zIndex: 50, direction: 'rtl',
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
          color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'Heebo', system-ui, sans-serif", zIndex: 50,
          background: 'rgba(0,0,0,0.4)', padding: '5px 14px', borderRadius: 20,
          backdropFilter: 'blur(6px)', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          👆 לחץ על בניין כדי ללמוד ולשחק
        </div>
      )}

      {/* Back to landing */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', bottom: 24, left: 24, zIndex: 50,
            background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
            padding: '5px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 12,
            fontFamily: "'Heebo', system-ui, sans-serif", cursor: 'pointer',
          }}
        >
          ← Home
        </button>
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
            fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
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
            fontFamily: "'Heebo', system-ui, sans-serif", color: 'white', maxWidth: 460,
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
            fontFamily: "'Heebo', system-ui, sans-serif", color: 'white', textAlign: 'center',
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
          <Ground
            onMove={(x, z) => { const [sx, sz] = snapToCell(x, z); setGhostCell([sx, sz]) }}
            onLeave={() => setGhostCell(null)}
          />
          {ghostCell && !selectedBuilding && !challengeBuilding && (
            <GhostBuilding
              x={ghostCell[0]}
              z={ghostCell[1]}
              valid={!OCCUPIED_CELLS.has(`${ghostCell[0]},${ghostCell[1]}`)}
            />
          )}
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
              colorOverride={COLOR_VARIATIONS[colorVariations[b.id] ?? 'A'][b.id]}
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
          fontFamily: "'Heebo', system-ui, sans-serif", direction: 'rtl', textAlign: 'right',
          minWidth: 300, zIndex: 100, backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedBuilding.label}</div>
            <button onClick={() => setSelectedBuilding(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ marginTop: 8, color: selectedBuilding.color, fontSize: 15 }}>📊 {selectedBuilding.statsConcept}</div>
          {mastered.has(selectedBuilding.id) && (() => {
            const dateStr = masteryDates[selectedBuilding.id]
            const days = dateStr ? daysSince(dateStr) : null
            const needsReview = days !== null && days >= 5
            return (
              <div style={{ marginTop: 6, fontSize: 12, color: needsReview ? '#FFB347' : '#4ECDC4' }}>
                {needsReview ? '📅 כדאי לחזור — ' : '✓ כבר למדת — '}
                {days === 0 ? 'היום!' : days === 1 ? 'אתמול' : days !== null ? `לפני ${days} ימים` : '+50 XP הרווחת!'}
              </div>
            )
          })()}
          {/* Kenney color variation selector */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, direction: 'ltr' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>Color:</span>
            {(['A', 'B', 'C'] as const).map(v => {
              const label = v === 'A' ? '🟠' : v === 'B' ? '🔵' : '⬜'
              const isActive = (colorVariations[selectedBuilding.id] ?? 'A') === v
              return (
                <button
                  key={v}
                  onClick={() => {
                    const next = { ...colorVariations, [selectedBuilding.id]: v }
                    setColorVariations(next)
                    localStorage.setItem('wafflestack-color-variations', JSON.stringify(next))
                  }}
                  style={{
                    padding: '3px 9px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontWeight: isActive ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                  title={v === 'A' ? 'Variation A — warm/orange' : v === 'B' ? 'Variation B — cool/blue' : 'Variation C — neutral/gray'}
                >
                  {label} {v}
                </button>
              )
            })}
          </div>
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

      {/* Exam Mode */}
      {showExamMode && <ExamMode onClose={() => setShowExamMode(false)} />}

      {/* Challenge Modal */}
      {challengeBuilding && (() => {
        const nextUnmastered = BUILDINGS.find(b => !mastered.has(b.id) && b.id !== challengeBuilding.id)
        return (
          <StatChallenge
            building={challengeBuilding}
            onClose={() => setChallengeBuilding(null)}
            onComplete={handleComplete}
            soundEnabled={quizSoundEnabled}
            nextBuilding={nextUnmastered ? { id: nextUnmastered.id, label: nextUnmastered.label, statsConcept: nextUnmastered.statsConcept, color: nextUnmastered.color } : undefined}
            onNext={nextUnmastered ? () => openChallenge(nextUnmastered) : undefined}
            onNavigateTo={(id) => { const b = BUILDINGS.find(building => building.id === id); if (b) openChallenge(b) }}
          />
        )
      })()}

      {/* Score Board panel */}
      {showScoreBoard && (
        <ScoreBoard
          mastered={mastered}
          xp={xp}
          sessionStart={sessionStart}
          onClose={() => setShowScoreBoard(false)}
          onReset={handleReset}
          onPracticeWeakSpots={handlePracticeWeakSpots}
        />
      )}

      {/* Weak Spots Practice Quiz */}
      {showWeakSpotsQuiz && wqQuestions.length > 0 && (() => {
        const q = wqQuestions[wqIndex]
        if (wqDone) {
          return (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 450, backdropFilter: 'blur(10px)', padding: 20,
            }}>
              <div style={{
                background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
                border: '1px solid rgba(78,205,196,0.3)',
                borderRadius: 20, padding: '36px 32px', maxWidth: 440, width: '100%',
                fontFamily: "'Heebo', system-ui, sans-serif", textAlign: 'center',
                boxShadow: '0 0 60px rgba(78,205,196,0.1)',
              }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>
                  {wqScore === wqQuestions.length ? '🏆' : wqScore >= wqQuestions.length * 0.7 ? '⭐' : '📖'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ECDC4', marginBottom: 8 }}>
                  Practice Complete!
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: -2 }}>
                  {wqScore}<span style={{ fontSize: 28, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/{wqQuestions.length}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
                  {Math.round((wqScore / wqQuestions.length) * 100)}% correct
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 260, margin: '0 auto' }}>
                  {wqScore < wqQuestions.length && (
                    <button
                      onClick={() => { setWqIndex(0); setWqSelected(null); setWqScore(0); setWqDone(false) }}
                      style={{
                        padding: '12px', background: 'rgba(78,205,196,0.15)',
                        border: '1px solid rgba(78,205,196,0.4)', borderRadius: 10,
                        color: '#4ECDC4', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >🔄 Try Again</button>
                  )}
                  <button
                    onClick={() => setShowWeakSpotsQuiz(false)}
                    style={{
                      padding: '12px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                      color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    }}
                  >🏙️ Back to City</button>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 450, backdropFilter: 'blur(10px)', padding: 20,
          }}>
            <div style={{
              background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
              border: `1px solid ${q.color}44`,
              borderRadius: 20, padding: '24px 28px', maxWidth: 520, width: '100%',
              fontFamily: "'Heebo', system-ui, sans-serif", maxHeight: '90vh', overflowY: 'auto',
              boxShadow: `0 0 60px ${q.color}18`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: wqMode === 'quick-mix' ? '#FFD700' : '#4ECDC4', fontWeight: 600, marginBottom: 4 }}>
                    {wqMode === 'quick-mix' ? '🎲 QUICK MIX — חמש שאלות אקראיות' : '🎯 PRACTICE WEAK SPOTS'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: q.color,
                      background: `${q.color}18`, border: `1px solid ${q.color}44`,
                      borderRadius: 10, padding: '2px 8px',
                    }}>{q.buildingLabel}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      {wqIndex + 1} / {wqQuestions.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeakSpotsQuiz(false)}
                  style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, width: 32, height: 32,
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
              {/* Progress bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: q.color,
                  width: `${(wqIndex / wqQuestions.length) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              {/* Question */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '16px 18px', marginBottom: 16,
                fontSize: 14, color: 'rgba(255,255,255,0.9)',
                direction: 'rtl', textAlign: 'right', lineHeight: 1.6,
              }}>
                {q.q}
              </div>
              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct
                  const isSelected = idx === wqSelected
                  let bg = 'rgba(255,255,255,0.04)'
                  let border = '1px solid rgba(255,255,255,0.08)'
                  let textColor = 'rgba(255,255,255,0.75)'
                  if (wqSelected !== null) {
                    if (isCorrect) { bg = 'rgba(78,205,196,0.15)'; border = '2px solid #4ECDC4'; textColor = '#4ECDC4' }
                    else if (isSelected) { bg = '#FF6B6B22'; border = '1px solid #FF6B6B'; textColor = '#FF6B6B' }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (wqSelected !== null) return
                        setWqSelected(idx)
                        if (idx === q.correct) setWqScore(s => s + 1)
                      }}
                      disabled={wqSelected !== null}
                      style={{
                        background: bg, border, borderRadius: 10,
                        padding: '12px 16px', cursor: wqSelected !== null ? 'default' : 'pointer',
                        color: textColor, fontSize: 13, textAlign: 'right',
                        direction: 'rtl', transition: 'all 0.2s',
                        display: 'flex', gap: 10, alignItems: 'center',
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: wqSelected !== null && isCorrect ? '#4ECDC4' : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        color: wqSelected !== null && isCorrect ? '#000' : 'inherit',
                      }}>
                        {wqSelected !== null && isCorrect ? '✓' : String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {/* Explanation + Next */}
              {wqSelected !== null && (
                <div>
                  <div style={{
                    background: wqSelected === q.correct ? '#4ECDC411' : '#FF6B6B11',
                    border: `1px solid ${wqSelected === q.correct ? '#4ECDC444' : '#FF6B6B44'}`,
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 12, color: 'rgba(255,255,255,0.7)',
                    direction: 'rtl', textAlign: 'right', lineHeight: 1.6, marginBottom: 10,
                  }}>
                    {wqSelected === q.correct ? '✅ ' : '❌ '}{q.explanation}
                  </div>
                  <button
                    onClick={() => {
                      if (wqIndex + 1 >= wqQuestions.length) {
                        setWqDone(true)
                      } else {
                        setWqIndex(i => i + 1)
                        setWqSelected(null)
                      }
                    }}
                    style={{
                      width: '100%', padding: '11px',
                      background: q.color, border: 'none', borderRadius: 10,
                      color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    {wqIndex + 1 >= wqQuestions.length ? '🏆 סיים' : 'שאלה הבאה →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Topics List modal */}
      {showTopicsList && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 450, backdropFilter: 'blur(10px)', padding: 20,
        }} onClick={() => { setShowTopicsList(false); setFormulaDrillActive(false) }}>
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={handleStartQuickMix}
                  style={{
                    background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.35)',
                    borderRadius: 8, padding: '6px 12px', color: '#FFD700',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5,
                    whiteSpace: 'nowrap',
                  }}
                  title="5 random questions from across all topics"
                >
                  🎲 מיקס
                </button>
                <button
                  onClick={startFormulaDrill}
                  style={{
                    background: formulaDrillActive ? 'rgba(195,166,255,0.2)' : 'rgba(195,166,255,0.08)',
                    border: `1px solid ${formulaDrillActive ? 'rgba(195,166,255,0.6)' : 'rgba(195,166,255,0.3)'}`,
                    borderRadius: 8, padding: '6px 12px', color: '#C3A6FF',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5,
                    whiteSpace: 'nowrap',
                  }}
                  title="Formula matching drill — identify each formula"
                >
                  🧮 נוסחאות
                </button>
                <button onClick={() => { setShowTopicsList(false); setFormulaDrillActive(false) }} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            </div>

            {/* Building list / Formula Drill */}
            {formulaDrillActive ? (
              <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fdDone ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>
                      {fdScore === fdItems.length ? '🏆' : fdScore >= fdItems.length * 0.7 ? '⭐' : '📖'}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#C3A6FF', marginBottom: 8 }}>
                      {fdScore === fdItems.length ? 'Formula Master!' : fdScore >= fdItems.length * 0.7 ? 'Great Job!' : 'Keep Practicing!'}
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: -2 }}>
                      {fdScore}<span style={{ fontSize: 24, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/{fdItems.length}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                      {Math.round((fdScore / fdItems.length) * 100)}% correct
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 240, margin: '0 auto' }}>
                      <button onClick={startFormulaDrill} style={{
                        padding: '11px', background: 'rgba(195,166,255,0.15)',
                        border: '1px solid rgba(195,166,255,0.4)', borderRadius: 10,
                        color: '#C3A6FF', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}>🔄 Try Again</button>
                      <button onClick={() => setFormulaDrillActive(false)} style={{
                        padding: '11px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                        color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}>📚 Back to Topics</button>
                    </div>
                  </div>
                ) : fdItems.length > 0 ? (() => {
                  const item = fdItems[fdIndex]
                  return (
                    <>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {fdItems.map((_, i) => (
                          <div key={i} style={{
                            height: 4, flex: 1, borderRadius: 2,
                            background: i < fdIndex ? '#C3A6FF' : i === fdIndex ? 'rgba(195,166,255,0.55)' : 'rgba(255,255,255,0.12)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: 1 }}>
                        🧮 זהה את הנוסחה — {fdIndex + 1} / {fdItems.length}
                      </div>
                      <div style={{
                        background: 'rgba(195,166,255,0.08)', border: '1px solid rgba(195,166,255,0.25)',
                        borderRadius: 14, padding: '20px 24px', textAlign: 'center',
                        fontFamily: 'monospace', fontSize: 15, color: '#C3A6FF',
                        letterSpacing: 0.5, lineHeight: 1.7, direction: 'ltr',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 10, fontFamily: "'Heebo', system-ui, sans-serif" }}>{item.emoji}</div>
                        {item.formula}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', direction: 'rtl' }}>
                        לאיזה מושג שייכת הנוסחה הזו?
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {item.options.map((opt, idx) => {
                          const isCorrect = idx === item.correctIdx
                          const isSelected = idx === fdSelected
                          let bg = 'rgba(255,255,255,0.04)'
                          let border = '1px solid rgba(255,255,255,0.1)'
                          let color = 'rgba(255,255,255,0.75)'
                          if (fdSelected !== null) {
                            if (isCorrect) { bg = 'rgba(78,205,196,0.15)'; border = '2px solid #4ECDC4'; color = '#4ECDC4' }
                            else if (isSelected) { bg = 'rgba(255,107,107,0.12)'; border = '1px solid #FF6B6B'; color = '#FF6B6B' }
                          }
                          return (
                            <button key={idx} onClick={() => {
                              if (fdSelected !== null) return
                              setFdSelected(idx)
                              if (isCorrect) setFdScore(s => s + 1)
                            }} disabled={fdSelected !== null} style={{
                              padding: '11px 16px', borderRadius: 10,
                              cursor: fdSelected !== null ? 'default' : 'pointer',
                              background: bg, border, color, fontSize: 13, fontWeight: 600,
                              textAlign: 'center', direction: 'rtl', transition: 'all 0.2s',
                            }}>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                      {fdSelected !== null && (
                        <button onClick={() => {
                          if (fdIndex + 1 >= fdItems.length) {
                            setFdDone(true)
                          } else {
                            setFdIndex(i => i + 1)
                            setFdSelected(null)
                          }
                        }} style={{
                          padding: '12px', background: '#C3A6FF', border: 'none', borderRadius: 10,
                          color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                        }}>
                          {fdIndex + 1 >= fdItems.length ? '🏆 סיים' : 'הבא →'}
                        </button>
                      )}
                    </>
                  )
                })() : null}
              </div>
            ) : (
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
                    <div
                      className="building-thumb"
                      style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, ${b.color ?? '#fff'}28 0%, ${b.color ?? '#fff'}0e 100%)`,
                        border: `2px solid ${b.color ?? '#fff'}55`,
                        boxShadow: `0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 ${b.color ?? '#fff'}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}
                    >
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
                    {isMastered && masteryDates[b.id] && (() => {
                      const days = daysSince(masteryDates[b.id])
                      const needsReview = days >= 5
                      return (
                        <div style={{
                          fontSize: 10, fontWeight: 700,
                          color: needsReview ? '#FFB347' : '#4ECDC4',
                          background: needsReview ? 'rgba(255,179,71,0.12)' : 'rgba(78,205,196,0.1)',
                          border: `1px solid ${needsReview ? 'rgba(255,179,71,0.35)' : 'rgba(78,205,196,0.3)'}`,
                          borderRadius: 10, padding: '2px 7px', flexShrink: 0,
                        }}>
                          {needsReview ? '📅 חזור' : days === 0 ? '✓ היום' : `✓ ${days}d`}
                        </div>
                      )
                    })()}
                    {(() => {
                      const stored = localStorage.getItem(`wafflestack-difficulty-${b.id}`)
                      const diffRating = stored ? parseInt(stored) : null
                      if (diffRating === null) return null
                      return (
                        <div style={{
                          fontSize: 10, fontWeight: 700,
                          color: diffRating <= 2 ? '#4ECDC4' : diffRating === 3 ? '#FFD700' : '#FF6B6B',
                          background: diffRating <= 2 ? 'rgba(78,205,196,0.1)' : diffRating === 3 ? 'rgba(255,215,0,0.1)' : 'rgba(255,107,107,0.1)',
                          border: `1px solid ${diffRating <= 2 ? 'rgba(78,205,196,0.3)' : diffRating === 3 ? 'rgba(255,215,0,0.3)' : 'rgba(255,107,107,0.3)'}`,
                          borderRadius: 10, padding: '2px 7px', flexShrink: 0,
                        }}>
                          {'★'.repeat(diffRating)}
                        </div>
                      )
                    })()}
                    {b.id === dailyChallengeId && !dailyDone && (
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: '#FFD700',
                        background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.35)',
                        borderRadius: 10, padding: '2px 7px', flexShrink: 0,
                      }}>🌟 Daily</div>
                    )}
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
            )}
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

      {/* Concept Glossary overlay */}
      {showGlossary && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 490, backdropFilter: 'blur(10px)', padding: 20,
        }} onClick={() => setShowGlossary(false)}>
          <div style={{
            background: 'linear-gradient(160deg, #0a0a18 0%, #0f1525 100%)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            padding: '24px 28px', width: '100%', maxWidth: 580,
            maxHeight: '85vh', overflowY: 'auto',
            fontFamily: "'Heebo', system-ui, sans-serif",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>📚 Concept Glossary</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {mastered.size}/10 mastered · all formulas in one place
                </div>
              </div>
              <button onClick={() => setShowGlossary(false)} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BUILDINGS.map(b => {
                const isMastered = mastered.has(b.id)
                const glossary = GLOSSARY_DATA[b.id]
                return (
                  <div key={b.id} style={{
                    background: isMastered ? `${b.color}10` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isMastered ? `${b.color}30` : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 12, padding: '12px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${b.color}20`, border: `1px solid ${b.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {b.label.split(' ')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isMastered ? b.color : '#fff', direction: 'rtl' }}>
                          {b.statsConcept.split(' (')[0]}
                        </span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{glossary?.conceptEn}</span>
                        {isMastered && (
                          <span style={{
                            marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#4ECDC4',
                            background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)',
                            borderRadius: 10, padding: '2px 8px',
                          }}>✓ mastered</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 12, fontFamily: 'monospace', color: isMastered ? b.color : 'rgba(255,255,255,0.45)',
                        background: 'rgba(0,0,0,0.2)', borderRadius: 6,
                        padding: '4px 8px', display: 'inline-block',
                      }}>
                        {glossary?.formula}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Press G or click outside to close
            </div>
          </div>
        </div>
      )}

      {/* Flash Cards modal */}
      {showFlashCards && (() => {
        const card = FLASH_CARDS[flashCardIndex]
        const isMastered = mastered.has(card.id)
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 480, backdropFilter: 'blur(10px)', padding: 20,
          }} onClick={() => setShowFlashCards(false)}>
            <div style={{
              background: 'linear-gradient(160deg, #0a0a18 0%, #0f1525 100%)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
              padding: '28px 32px', width: '100%', maxWidth: 480,
              fontFamily: "'Heebo', system-ui, sans-serif", color: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>📇 Flash Cards</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {mastered.size}/10 mastered · כרטיס {flashCardIndex + 1} מתוך {FLASH_CARDS.length}
                  </div>
                </div>
                <button onClick={() => setShowFlashCards(false)} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>

              {/* Card */}
              <div
                onClick={() => setFlashCardFlipped(f => !f)}
                style={{
                  background: flashCardFlipped ? `linear-gradient(135deg, ${card.color}18 0%, transparent 100%)` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${flashCardFlipped ? card.color + '55' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 20, padding: '32px 28px', cursor: 'pointer',
                  minHeight: 200, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  transition: 'all 0.3s ease', marginBottom: 20,
                  position: 'relative',
                }}
              >
                {isMastered && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 10, color: '#4ECDC4', fontWeight: 700,
                    background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)',
                    borderRadius: 10, padding: '2px 8px',
                  }}>✓ נלמד</div>
                )}
                {!flashCardFlipped ? (
                  <>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>{card.emoji}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, direction: 'rtl' }}>
                      {card.labelHe}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                      👆 לחץ לגילוי
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 14, color: card.color, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
                      {card.labelEn}
                    </div>
                    <div style={{
                      fontSize: 14, fontFamily: 'monospace', color: card.color,
                      background: `${card.color}18`, border: `1px solid ${card.color}33`,
                      borderRadius: 8, padding: '8px 16px', marginBottom: 14,
                    }}>
                      {card.formula}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 340 }}>
                      {card.preview}
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => { setFlashCardIndex(i => (i - 1 + FLASH_CARDS.length) % FLASH_CARDS.length); setFlashCardFlipped(false) }}
                  style={{
                    flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                    color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}
                >← הקודם</button>
                <button
                  onClick={() => setFlashCardFlipped(f => !f)}
                  style={{
                    flex: 2, padding: '10px',
                    background: card.color + '22', border: `1px solid ${card.color}44`,
                    borderRadius: 10, color: card.color, fontSize: 13, cursor: 'pointer', fontWeight: 700,
                  }}
                >
                  {flashCardFlipped ? '↩ הצג שאלה' : '💡 הצג תשובה'}
                </button>
                <button
                  onClick={() => { setFlashCardIndex(i => (i + 1) % FLASH_CARDS.length); setFlashCardFlipped(false) }}
                  style={{
                    flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                    color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}
                >הבא →</button>
              </div>

              {/* Dot indicators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {FLASH_CARDS.map((fc, i) => (
                  <div
                    key={i}
                    onClick={() => { setFlashCardIndex(i); setFlashCardFlipped(false) }}
                    style={{
                      width: flashCardIndex === i ? 20 : 7, height: 7, borderRadius: 4,
                      background: flashCardIndex === i ? FLASH_CARDS[flashCardIndex].color : mastered.has(fc.id) ? 'rgba(78,205,196,0.4)' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Concept Map overlay */}
      {showConceptMap && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 460, backdropFilter: 'blur(8px)', padding: 20,
          }}
          onClick={() => setShowConceptMap(false)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #0f0f20 0%, #161628 100%)',
              border: '1px solid rgba(78,205,196,0.25)',
              borderRadius: 20, padding: '22px 24px',
              maxWidth: 700, width: '100%',
              fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
              boxShadow: '0 0 60px rgba(78,205,196,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>🗺️ מפת המושגים</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                  לחץ על מושג לפתיחת האתגר · קווים = מושגים קשורים
                </div>
              </div>
              <button
                onClick={() => setShowConceptMap(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, width: 36, height: 36,
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
            <svg viewBox="0 0 640 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Edges */}
              {CONCEPT_MAP_EDGES.map(([from, to]) => {
                const fp = CONCEPT_MAP_POS[from]
                const tp = CONCEPT_MAP_POS[to]
                const bothMastered = mastered.has(from) && mastered.has(to)
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fp[0]} y1={fp[1]} x2={tp[0]} y2={tp[1]}
                    stroke={bothMastered ? 'rgba(78,205,196,0.35)' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={bothMastered ? 2 : 1.5}
                  />
                )
              })}
              {/* Nodes */}
              {BUILDINGS.map(b => {
                const pos = CONCEPT_MAP_POS[b.id]
                if (!pos) return null
                const isMastered = mastered.has(b.id)
                const emoji = b.label.split(' ')[0]
                const hebrewName = b.statsConcept.split(' (')[0]
                const nodeColor = b.color ?? '#4ECDC4'
                return (
                  <g
                    key={b.id}
                    transform={`translate(${pos[0]}, ${pos[1]})`}
                    onClick={() => { openChallenge(b); setShowConceptMap(false) }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle r={32} fill="transparent" />
                    <circle
                      r={26}
                      fill={isMastered ? `${nodeColor}28` : 'rgba(15,15,35,0.95)'}
                      stroke={isMastered ? nodeColor : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isMastered ? 2 : 1}
                    />
                    <text textAnchor="middle" dominantBaseline="central" y={-7} fontSize={18} style={{ userSelect: 'none' }}>
                      {emoji}
                    </text>
                    <text
                      textAnchor="middle" dominantBaseline="central" y={9} fontSize={7.5}
                      fill={isMastered ? nodeColor : 'rgba(255,255,255,0.4)'}
                      style={{ userSelect: 'none' }}
                    >
                      {GLOSSARY_DATA[b.id]?.conceptEn ?? ''}
                    </text>
                    <text
                      textAnchor="middle" y={42} fontSize={9}
                      fill={isMastered ? nodeColor : 'rgba(255,255,255,0.55)'}
                      style={{ userSelect: 'none' }}
                    >
                      {hebrewName}
                    </text>
                    {isMastered && (
                      <>
                        <circle cx={18} cy={-18} r={8} fill="#4ECDC4" />
                        <text x={18} y={-18} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="#000" fontWeight="bold">✓</text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
            <div style={{ marginTop: 12, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(78,205,196,0.25)', border: '2px solid #4ECDC4' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>נלמד</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(255,255,255,0.18)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>טרם נלמד</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 2, background: 'rgba(78,205,196,0.35)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>קשר בין מושגים</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Map overlay */}
      {showLearningMap && (
        <LearningMap
          mastered={mastered}
          onClose={() => setShowLearningMap(false)}
          onOpenChallenge={(id) => {
            const b = BUILDINGS.find(bld => bld.id === id)
            if (b) openChallenge(b)
          }}
        />
      )}

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
            fontFamily: "'Heebo', system-ui, sans-serif", color: 'white',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>⌨️ Keyboard Shortcuts</div>
            {[
              { key: '?', desc: 'Toggle this help overlay' },
              { key: 'Esc', desc: 'Close any open panel' },
              { key: 'M', desc: 'Toggle city sound' },
              { key: 'S', desc: 'Toggle score board' },
              { key: 'T', desc: 'Toggle topics list' },
              { key: 'G', desc: 'Toggle concept glossary' },
              { key: 'F', desc: 'Toggle flash cards' },
              { key: 'C', desc: 'Toggle concept map' },
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
BUILDINGS.forEach(b => {
  const url = b.customModel
    ? `${import.meta.env.BASE_URL}${b.customModel.replace(/ /g, '%20')}`
    : `${import.meta.env.BASE_URL}models/kenney-suburban/${b.model}.glb`
  useGLTF.preload(url)
})
ROAD_MODELS.forEach(r => useGLTF.preload(`${import.meta.env.BASE_URL}models/kenney-suburban/${r.model}.glb`))
