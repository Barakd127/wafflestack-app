/**
 * Irregular Grid Generator
 * Creates an organic, Townscaper-style grid with distorted quads
 */

import * as THREE from 'three'

export interface GridCell {
  id: string
  row: number
  col: number
  corners: {
    a: THREE.Vector3  // bottom-left
    b: THREE.Vector3  // bottom-right
    c: THREE.Vector3  // top-right
    d: THREE.Vector3  // top-left
  }
  center: THREE.Vector3
}

/**
 * Generate an irregular grid
 * @param rows Number of rows
 * @param cols Number of columns
 * @param cellSize Base cell size
 * @param irregularity Amount of randomness (0-1)
 */
export function generateIrregularGrid(
  rows: number,
  cols: number,
  cellSize: number,
  irregularity: number = 0.3
): GridCell[] {
  const cells: GridCell[] = []
  
  // Generate vertex grid with noise
  const vertices: THREE.Vector3[][] = []
  
  for (let r = 0; r <= rows; r++) {
    vertices[r] = []
    for (let c = 0; c <= cols; c++) {
      const baseX = c * cellSize - (cols * cellSize) / 2
      const baseZ = r * cellSize - (rows * cellSize) / 2
      
      // Add random offset for irregularity
      const offsetX = (Math.random() - 0.5) * cellSize * irregularity
      const offsetZ = (Math.random() - 0.5) * cellSize * irregularity
      
      // Keep edge vertices aligned
      const finalOffsetX = (r === 0 || r === rows || c === 0 || c === cols) ? 0 : offsetX
      const finalOffsetZ = (r === 0 || r === rows || c === 0 || c === cols) ? 0 : offsetZ
      
      vertices[r][c] = new THREE.Vector3(
        baseX + finalOffsetX,
        0,
        baseZ + finalOffsetZ
      )
    }
  }
  
  // Create cells from vertices
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const corners = {
        a: vertices[r][c].clone(),         // bottom-left
        b: vertices[r][c + 1].clone(),     // bottom-right
        c: vertices[r + 1][c + 1].clone(), // top-right
        d: vertices[r + 1][c].clone()      // top-left
      }
      
      // Calculate center
      const center = new THREE.Vector3()
      center.add(corners.a)
      center.add(corners.b)
      center.add(corners.c)
      center.add(corners.d)
      center.divideScalar(4)
      
      cells.push({
        id: `cell-${r}-${c}`,
        row: r,
        col: c,
        corners,
        center
      })
    }
  }
  
  return cells
}
