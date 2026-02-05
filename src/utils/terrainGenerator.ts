/**
 * Procedural Terrain Generation using Simplex Noise
 * 
 * Creates unique, organic terrain for each student's learning city.
 * Terrain height reflects learning progress and topic mastery.
 */

import { createNoise2D, createNoise3D } from 'simplex-noise'
import { alea } from 'seedrandom'

export interface TerrainConfig {
  gridSize: number
  seed: string | number
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  heightMultiplier: number
  waterLevel?: number
}

export interface HeightMap {
  width: number
  height: number
  data: Float32Array
  min: number
  max: number
}

/**
 * Generate a seeded random number generator
 */
export const createSeededRandom = (seed: string | number) => {
  return alea(seed.toString())
}

/**
 * Multi-octave Perlin/Simplex noise for natural-looking terrain
 * 
 * @param noise2D - Simplex noise function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - Terrain configuration
 * @returns Height value between -1 and 1
 */
export const multiOctaveNoise = (
  noise2D: ReturnType<typeof createNoise2D>,
  x: number,
  y: number,
  config: TerrainConfig
): number => {
  let total = 0
  let frequency = 1
  let amplitude = 1
  let maxValue = 0

  for (let octave = 0; octave < config.octaves; octave++) {
    const sampleX = (x / config.scale) * frequency
    const sampleY = (y / config.scale) * frequency
    
    const noiseValue = noise2D(sampleX, sampleY)
    total += noiseValue * amplitude

    maxValue += amplitude
    amplitude *= config.persistence
    frequency *= config.lacunarity
  }

  return total / maxValue
}

/**
 * Generate a height map for terrain
 * 
 * @param config - Terrain configuration
 * @returns HeightMap data structure
 */
export const generateHeightMap = (config: TerrainConfig): HeightMap => {
  const { gridSize } = config
  const data = new Float32Array(gridSize * gridSize)
  
  // Create seeded noise function
  const prng = createSeededRandom(config.seed)
  const noise2D = createNoise2D(prng)

  let min = Infinity
  let max = -Infinity

  // Generate height values
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x
      
      // Get base noise value
      let height = multiOctaveNoise(noise2D, x, y, config)
      
      // Apply height multiplier
      height *= config.heightMultiplier
      
      // Track min/max for normalization
      if (height < min) min = height
      if (height > max) max = height
      
      data[index] = height
    }
  }

  return {
    width: gridSize,
    height: gridSize,
    data,
    min,
    max
  }
}

/**
 * Apply learning data to modify terrain
 * Higher mastery = higher elevation
 * 
 * @param heightMap - Base height map
 * @param learningData - Student's learning progress
 * @returns Modified height map
 */
export const applyLearningInfluence = (
  heightMap: HeightMap,
  learningData: LearningInfluence[]
): HeightMap => {
  const newData = new Float32Array(heightMap.data)
  
  learningData.forEach(influence => {
    const { position, mastery, radius } = influence
    const [cx, cy] = position
    
    // Create a radial influence area
    for (let y = 0; y < heightMap.height; y++) {
      for (let x = 0; x < heightMap.width; x++) {
        const dx = x - cx
        const dy = y - cy
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < radius) {
          const index = y * heightMap.width + x
          
          // Falloff based on distance
          const falloff = 1 - (distance / radius)
          const heightBoost = mastery * 5 * falloff * falloff // Quadratic falloff
          
          newData[index] += heightBoost
        }
      }
    }
  })

  // Recalculate min/max
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < newData.length; i++) {
    if (newData[i] < min) min = newData[i]
    if (newData[i] > max) max = newData[i]
  }

  return {
    ...heightMap,
    data: newData,
    min,
    max
  }
}

/**
 * Learning influence point
 */
export interface LearningInfluence {
  position: [number, number]  // Grid position
  mastery: number  // 0-1, how well mastered
  radius: number  // Influence radius
  topic: string  // What topic this represents
}

/**
 * Normalize height map to 0-1 range
 */
export const normalizeHeightMap = (heightMap: HeightMap): HeightMap => {
  const range = heightMap.max - heightMap.min
  const normalizedData = new Float32Array(heightMap.data.length)
  
  for (let i = 0; i < heightMap.data.length; i++) {
    normalizedData[i] = (heightMap.data[i] - heightMap.min) / range
  }

  return {
    ...heightMap,
    data: normalizedData,
    min: 0,
    max: 1
  }
}

/**
 * Get height at specific coordinate (with interpolation)
 */
export const getHeightAt = (
  heightMap: HeightMap,
  x: number,
  y: number,
  interpolate: boolean = true
): number => {
  const { width, height, data } = heightMap
  
  // Clamp to bounds
  x = Math.max(0, Math.min(width - 1, x))
  y = Math.max(0, Math.min(height - 1, y))

  if (!interpolate) {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    return data[iy * width + ix]
  }

  // Bilinear interpolation
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, width - 1)
  const y1 = Math.min(y0 + 1, height - 1)

  const fx = x - x0
  const fy = y - y0

  const h00 = data[y0 * width + x0]
  const h10 = data[y0 * width + x1]
  const h01 = data[y1 * width + x0]
  const h11 = data[y1 * width + x1]

  const h0 = h00 * (1 - fx) + h10 * fx
  const h1 = h01 * (1 - fx) + h11 * fx

  return h0 * (1 - fy) + h1 * fy
}

/**
 * Create default terrain configuration
 */
export const createDefaultTerrainConfig = (overrides?: Partial<TerrainConfig>): TerrainConfig => ({
  gridSize: 50,
  seed: 'base44',
  scale: 20,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  heightMultiplier: 3,
  waterLevel: 0.3,
  ...overrides
})

/**
 * Generate terrain colors based on height
 */
export const getTerrainColor = (height: number, waterLevel: number = 0.3): string => {
  if (height < waterLevel) {
    return '#1e40af' // Deep water
  } else if (height < waterLevel + 0.05) {
    return '#3b82f6' // Shallow water
  } else if (height < 0.4) {
    return '#f4d03f' // Beach/sand
  } else if (height < 0.6) {
    return '#22c55e' // Grass
  } else if (height < 0.8) {
    return '#15803d' // Forest
  } else if (height < 0.9) {
    return '#78716c' // Rocky
  } else {
    return '#f5f5f4' // Snow peak
  }
}
