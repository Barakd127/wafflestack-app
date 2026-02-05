# Procedural Terrain - Usage Guide

## 🎉 Phase 1: COMPLETE! ✅

The procedural terrain generation system is now fully implemented and ready to use!

---

## 🚀 Quick Start

### 1. Install Required Packages

```bash
cd base44
npm install simplex-noise seedrandom
npm install --save-dev @types/seedrandom
```

### 2. Run the Application

```bash
npm run dev
```

### 3. View the Terrain Demo

The app will open showing the **Procedural Terrain Demo** by default. You can:
- Toggle wireframe mode
- Turn learning influences on/off
- Change the seed to generate different terrains
- Click "🎲 Generate Random Terrain" for instant variations

---

## 📚 How to Use

### Basic Usage

```typescript
import ProceduralTerrain from './components/ProceduralTerrain'

function MyScene() {
  return (
    <ProceduralTerrain
      config={{
        gridSize: 50,
        seed: 'my-unique-seed',
        scale: 20,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.0,
        heightMultiplier: 3
      }}
    />
  )
}
```

### With Learning Influences

```typescript
import ProceduralTerrain from './components/ProceduralTerrain'
import type { LearningInfluence } from '../utils/terrainGenerator'

function StudentCity() {
  const learningData: LearningInfluence[] = [
    {
      position: [25, 25],
      mastery: 0.8,  // 80% mastered
      radius: 10,
      topic: 'Advanced React'
    },
    {
      position: [40, 15],
      mastery: 0.5,
      radius: 8,
      topic: 'TypeScript'
    }
  ]

  return (
    <ProceduralTerrain
      config={{
        gridSize: 50,
        seed: `student-${studentId}`,
        scale: 20,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.0,
        heightMultiplier: 3
      }}
      learningInfluences={learningData}
      wireframe={false}
    />
  )
}
```

---

## 🎛️ Configuration Options

### TerrainConfig Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gridSize` | number | 50 | Size of the terrain grid (50 = 50x50) |
| `seed` | string\|number | 'base44' | Seed for deterministic generation |
| `scale` | number | 20 | Controls feature size (higher = bigger features) |
| `octaves` | number | 4 | Noise detail levels (more = more detail) |
| `persistence` | number | 0.5 | Amplitude reduction per octave |
| `lacunarity` | number | 2.0 | Frequency increase per octave |
| `heightMultiplier` | number | 3 | Overall terrain height |
| `waterLevel` | number | 0.3 | Height threshold for water (0-1) |

### LearningInfluence Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `position` | [number, number] | Grid coordinates [x, y] |
| `mastery` | number | Learning level (0-1) |
| `radius` | number | Influence area radius |
| `topic` | string | Topic name (for reference) |

---

## 🎨 Customization Examples

### 1. Smooth Gentle Hills

```typescript
<ProceduralTerrain
  config={{
    gridSize: 50,
    seed: 'gentle-hills',
    scale: 30,      // Larger features
    octaves: 3,     // Less detail
    persistence: 0.4,
    lacunarity: 1.8,
    heightMultiplier: 2  // Lower peaks
  }}
/>
```

### 2. Rugged Mountains

```typescript
<ProceduralTerrain
  config={{
    gridSize: 50,
    seed: 'mountains',
    scale: 15,      // Smaller features
    octaves: 6,     // Lots of detail
    persistence: 0.6,
    lacunarity: 2.5,
    heightMultiplier: 5  // Tall peaks
  }}
/>
```

### 3. Island with Ocean

```typescript
<ProceduralTerrain
  config={{
    gridSize: 50,
    seed: 'island',
    scale: 20,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    heightMultiplier: 3,
    waterLevel: 0.5  // Higher water level
  }}
/>
```

---

## 🧩 Integration with Learning Data

### Example: Course Progress → Terrain

```typescript
interface CourseProgress {
  topicId: string
  topicName: string
  completionPercentage: number
  position: [number, number]
}

const convertToLearningInfluences = (
  progress: CourseProgress[]
): LearningInfluence[] => {
  return progress.map(topic => ({
    position: topic.position,
    mastery: topic.completionPercentage / 100,
    radius: Math.max(5, topic.completionPercentage / 10),
    topic: topic.topicName
  }))
}

// Usage
const studentProgress: CourseProgress[] = [
  { topicId: '1', topicName: 'Intro', completionPercentage: 100, position: [10, 10] },
  { topicId: '2', topicName: 'Advanced', completionPercentage: 60, position: [30, 20] }
]

const influences = convertToLearningInfluences(studentProgress)

<ProceduralTerrain
  config={{ seed: studentId }}
  learningInfluences={influences}
/>
```

---

## 🎯 Best Practices

### 1. Use Student/Course ID as Seed
```typescript
const seed = `${studentId}-${courseId}-${semester}`
```
This ensures each student gets a unique but reproducible terrain.

### 2. Map Learning Progress to Elevation
- **Mastery 0.0-0.3**: Valleys (just started)
- **Mastery 0.3-0.6**: Hills (making progress)
- **Mastery 0.6-0.8**: Mountains (solid understanding)
- **Mastery 0.8-1.0**: Peaks (mastered)

### 3. Adjust Radius by Topic Importance
```typescript
radius: topic.isCore ? 10 : 5
```

### 4. Update Terrain as Student Progresses
```typescript
const [influences, setInfluences] = useState<LearningInfluence[]>([])

// Update when student completes work
const handleTopicComplete = (topicId: string, mastery: number) => {
  setInfluences(prev => prev.map(inf => 
    inf.topic === topicId 
      ? { ...inf, mastery }
      : inf
  ))
}
```

---

## 🌈 Terrain Color Legend

The terrain automatically colors based on height:

| Color | Hex | Height Range | Meaning |
|-------|-----|--------------|---------|
| Deep Blue | #1e40af | < 0.3 | Deep water / Unexplored |
| Light Blue | #3b82f6 | 0.3-0.35 | Shallow water |
| Yellow | #f4d03f | 0.35-0.4 | Beach / Starting point |
| Light Green | #22c55e | 0.4-0.6 | Grassland / Learning |
| Dark Green | #15803d | 0.6-0.8 | Forest / Practicing |
| Gray | #78716c | 0.8-0.9 | Rocky / Advanced |
| White | #f5f5f4 | > 0.9 | Snow peak / Mastered |

---

## 🔧 Advanced Features

### Custom Color Mapping

Modify `getTerrainColor()` in `terrainGenerator.ts`:

```typescript
export const getTerrainColor = (height: number, waterLevel: number = 0.3): string => {
  // Your custom color logic
  if (height < 0.5) return '#yourColor'
  // ...
}
```

### Export Terrain Data

```typescript
import { generateHeightMap, normalizeHeightMap } from '../utils/terrainGenerator'

const config = createDefaultTerrainConfig({ seed: 'my-seed' })
const heightMap = normalizeHeightMap(generateHeightMap(config))

// Export as JSON
const terrainData = {
  width: heightMap.width,
  height: heightMap.height,
  heights: Array.from(heightMap.data)
}

console.log(JSON.stringify(terrainData))
```

### Animate Terrain Growth

```typescript
const [growthFactor, setGrowthFactor] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setGrowthFactor(prev => Math.min(prev + 0.01, 1))
  }, 50)
  return () => clearInterval(interval)
}, [])

const scaledInfluences = influences.map(inf => ({
  ...inf,
  mastery: inf.mastery * growthFactor
}))

<ProceduralTerrain learningInfluences={scaledInfluences} />
```

---

## 🎓 Educational Use Cases

### 1. Course Progress Visualization
- Each topic = influence point
- Height = understanding level
- Students see their learning landscape grow

### 2. Concept Relationships
- Related topics placed near each other
- Connected topics create mountain ranges
- Isolated topics = lone peaks

### 3. Learning Paths
- Valleys between peaks = suggested learning routes
- High peaks = prerequisites mastered
- Low areas = future exploration

### 4. Gamification
- Unlock new terrain areas as you progress
- "Terraform" your learning landscape
- Compare terrain with peers (anonymously)

---

## 📊 Performance Notes

- **Grid Size 50x50** = 2,500 vertices (smooth performance)
- **Grid Size 100x100** = 10,000 vertices (still good on modern GPUs)
- **Grid Size 200x200** = 40,000 vertices (consider LOD)

Terrain generation happens once per configuration change, so it's very efficient!

---

## 🐛 Troubleshooting

### Terrain appears flat
- Increase `heightMultiplier`
- Check `learningInfluences` have mastery > 0
- Verify `octaves` > 1

### Terrain too spiky
- Reduce `octaves`
- Decrease `persistence`
- Lower `heightMultiplier`

### All one color
- Check `waterLevel` value (should be 0-1)
- Verify height calculation in color function

### Terrain doesn't change with different seeds
- Ensure seed is actually changing
- Check console for errors
- Verify `simplex-noise` package is installed

---

## 🚀 Next Steps (Future Phases)

Now that Phase 1 (Terrain) is complete, we can implement:

- **Phase 2**: Building Generation (L-Systems)
- **Phase 3**: City Layout (Wave Function Collapse)
- **Phase 4**: Detail Elements (Trees, lights, particles)
- **Phase 5**: Snapshot & Export System

Each phase builds on the previous, creating increasingly complex and beautiful learning cities!

---

## 📝 Credits

Built with:
- **React Three Fiber** - React renderer for Three.js
- **simplex-noise** - Organic terrain generation
- **seedrandom** - Deterministic random numbers
- **Three.js** - WebGL 3D library

Inspired by procedural generation techniques from game development and educational psychology principles.

---

**Happy Terrain Building! 🏔️✨**
