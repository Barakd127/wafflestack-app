/**
 * Utility to colorize GLB models
 * Traverses scene and applies color to all meshes
 */

import * as THREE from 'three'

export function colorizeModel(scene: THREE.Object3D, color: string | THREE.Color): void {
  const colorObj = color instanceof THREE.Color ? color : new THREE.Color(color)
  
  scene.traverse((node: any) => {
    if (node instanceof THREE.Mesh) {
      if (node.material) {
        // Handle both single material and material array
        const materials = Array.isArray(node.material) ? node.material : [node.material]
        
        materials.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
            // Clone material to avoid affecting other instances
            const newMat = mat.clone()
            newMat.color.copy(colorObj)
            node.material = newMat
          }
        })
      }
    }
  })
}
