/**
 * L-System Building Generator
 * 
 * Creates procedural buildings using L-System grammar rules.
 * Buildings represent learning achievements and grow with student progress.
 */

import { alea } from 'seedrandom'
import * as THREE from 'three'

export interface BuildingConfig {
  seed: string | number
  complexity: number  // 1-5, based on topic difficulty
  height: number  // Based on mastery level
  style: 'modern' | 'classical' | 'organic' | 'futuristic'
  color?: string
}

export interface LSystemRule {
  symbol: string
  replacement: string | ((context: string) => string)
}

export interface BuildingGeometry {
  positions: Float32Array
  indices: Uint16Array
  normals: Float32Array
  colors: Float32Array
}

/**
 * L-System axiom and rules for different building styles
 */
const buildingGrammars = {
  modern: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'F[+F][-F]F' },  // Rectangular modules
    ]
  },
  classical: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'FF[+F][-F]' },  // Symmetrical
    ]
  },
  organic: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'F[++F][--F]F' },  // Curved
    ]
  },
  futuristic: {
    axiom: 'F',
    rules: [
      { symbol: 'F', replacement: 'F[+F]F[-F]F' },  // Angular
    ]
  }
}

/**
 * Generate L-System string
 */
export const generateLSystem = (
  axiom: string,
  rules: LSystemRule[],
  iterations: number
): string => {
  let current = axiom
  
  for (let i = 0; i < iterations; i++) {
    let next = ''
    
    for (const char of current) {
      const rule = rules.find(r => r.symbol === char)
      
      if (rule) {
        if (typeof rule.replacement === 'function') {
          next += rule.replacement(current)
        } else {
          next += rule.replacement
        }
      } else {
        next += char
      }
    }
    
    current = next
  }
  
  return current
}

/**
 * Interpret L-System string as 3D geometry
 */
export const interpretLSystem = (
  lsystem: string,
  config: BuildingConfig
): BuildingGeometry => {
  const positions: number[] = []
  const indices: number[] = []
  const normals: number[] = []
  const colors: number[] = []
  
  // Building state
  const stack: Array<{pos: THREE.Vector3, dir: THREE.Vector3}> = []
  let currentPos = new THREE.Vector3(0, 0, 0)
  let currentDir = new THREE.Vector3(0, 1, 0)  // Up
  
  const prng = alea(config.seed.toString())
  const segmentHeight = config.height / 10
  const baseWidth = 0.8
  
  const colorObj = new THREE.Color(config.color || '#808080')
  
  let vertexIndex = 0
  
  const addCube = (position: THREE.Vector3, size: number) => {
    const halfSize = size / 2
    
    // 8 vertices of a cube
    const verts = [
      [-halfSize, -halfSize, -halfSize],
      [halfSize, -halfSize, -halfSize],
      [halfSize, halfSize, -halfSize],
      [-halfSize, halfSize, -halfSize],
      [-halfSize, -halfSize, halfSize],
      [halfSize, -halfSize, halfSize],
      [halfSize, halfSize, halfSize],
      [-halfSize, halfSize, halfSize],
    ]
    
    const startIdx = vertexIndex
    
    // Add vertices
    verts.forEach(v => {
      positions.push(
        position.x + v[0],
        position.y + v[1],
        position.z + v[2]
      )
      
      // Add color
      colors.push(
        colorObj.r + (prng() - 0.5) * 0.1,
        colorObj.g + (prng() - 0.5) * 0.1,
        colorObj.b + (prng() - 0.5) * 0.1
      )
      
      vertexIndex++
    })
    
    // Cube faces (12 triangles)
    const faces = [
      [0, 1, 2], [0, 2, 3], // Front
      [4, 6, 5], [4, 7, 6], // Back
      [0, 4, 5], [0, 5, 1], // Bottom
      [2, 6, 7], [2, 7, 3], // Top
      [0, 3, 7], [0, 7, 4], // Left
      [1, 5, 6], [1, 6, 2], // Right
    ]
    
    faces.forEach(face => {
      indices.push(
        startIdx + face[0],
        startIdx + face[1],
        startIdx + face[2]
      )
    })
  }
  
  // Interpret L-System
  for (const char of lsystem) {
    switch (char) {
      case 'F': // Forward (build upward)
        const nextPos = currentPos.clone().add(
          currentDir.clone().multiplyScalar(segmentHeight)
        )
        addCube(currentPos, baseWidth)
        currentPos = nextPos
        break
        
      case '+': // Turn right
        currentDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 6)
        break
        
      case '-': // Turn left
        currentDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 6)
        break
        
      case '[': // Push state
        stack.push({
          pos: currentPos.clone(),
          dir: currentDir.clone()
        })
        break
        
      case ']': // Pop state
        const state = stack.pop()
        if (state) {
          currentPos = state.pos
          currentDir = state.dir
        }
        break
    }
  }
  
  // Calculate normals (simplified - face normals)
  for (let i = 0; i < positions.length; i += 3) {
    normals.push(0, 1, 0) // Simplified - all pointing up
  }
  
  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors)
  }
}

/**
 * Generate a complete building
 */
export const generateBuilding = (config: BuildingConfig): BuildingGeometry => {
  const grammar = buildingGrammars[config.style]
  const iterations = Math.min(config.complexity, 3) // Limit iterations for performance
  
  const lsystem = generateLSystem(grammar.axiom, grammar.rules, iterations)
  return interpretLSystem(lsystem, config)
}

/**
 * Generate building color based on learning category
 */
export const getBuildingColorForCategory = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'math': '#6366f1',  // Indigo
    'science': '#10b981',  // Green
    'literature': '#f59e0b',  // Amber
    'history': '#8b5cf6',  // Purple
    'art': '#ec4899',  // Pink
    'technology': '#06b6d4',  // Cyan
    'default': '#64748b'  // Slate
  }
  
  return categoryColors[category.toLowerCase()] || categoryColors.default
}

/**
 * Calculate building config from learning data
 */
export const buildingFromLearningData = (
  topicId: string,
  topicName: string,
  mastery: number,  // 0-1
  difficulty: number,  // 1-5
  category: string = 'default'
): BuildingConfig => {
  return {
    seed: topicId,
    complexity: Math.ceil(difficulty),
    height: 2 + mastery * 8,  // 2-10 units tall
    style: difficulty > 3 ? 'futuristic' : difficulty > 2 ? 'modern' : 'classical',
    color: getBuildingColorForCategory(category)
  }
}
