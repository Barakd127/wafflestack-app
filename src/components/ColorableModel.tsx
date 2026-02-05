import { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import PopIn from './PopIn'

interface ColorableModelProps {
  modelPath: string
  position: [number, number, number]
  color: string  // User-selected color
  scale?: number
  onClick?: () => void
}

const ColorableModel = ({ modelPath, position, color, scale = 1, onClick }: ColorableModelProps) => {
  const groupRef = useRef<THREE.Group>(null)
  
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Apply color using Kenney-aware architecture (based on technical analysis)
  const scene = useMemo(() => {
    const cloned = originalScene.clone(true)
    const selectedColor = new THREE.Color(color)
    
    // Debug flag - shows Kenney's internal structure
    const DEBUG_MATERIALS = true
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        if (child.material) {
          // 🔍 KENNEY ARCHITECTURE ANALYSIS
          // Per the technical document: Kenney models use Material Groups and Texture Atlases
          // Different parts may already have separate materials (usemtl groups from OBJ export)
          
          const meshName = (child.name || '').toLowerCase()
          const materialName = (child.material.name || '').toLowerCase()
          const originalColor = child.material.color ? child.material.color.clone() : null
          
          if (DEBUG_MATERIALS) {
            console.log('🎨 Kenney Asset Analysis:', {
              mesh: child.name,
              material: child.material.name,
              hasMap: !!child.material.map,
              originalColor: originalColor?.getHexString(),
              uvs: child.geometry.attributes.uv ? 'Present' : 'None'
            })
          }
          
          // 🎯 INTELLIGENT MATERIAL DETECTION
          // Based on Kenney's naming conventions and the technical analysis:
          
          // 1. Check if this is a detail/accent part (preserve original)
          const isDetailPart = 
            // Windows and glass (typically use blue/transparent in atlas)
            meshName.includes('window') || materialName.includes('window') ||
            meshName.includes('glass') || materialName.includes('glass') ||
            // Doors (often have specific texture regions)
            meshName.includes('door') || materialName.includes('door') ||
            // Roofs (use different material groups)
            meshName.includes('roof') || materialName.includes('roof') ||
            meshName.includes('shingle') || materialName.includes('shingle') ||
            // Decorative elements
            meshName.includes('trim') || materialName.includes('trim') ||
            meshName.includes('detail') || materialName.includes('detail') ||
            meshName.includes('accent') || materialName.includes('accent')
          
          // 2. Check if material has a texture map (Kenney atlas user)
          const usesAtlas = !!child.material.map
          
          // 3. Check if original color is significantly non-gray (likely intentional)
          let hasIntentionalColor = false
          if (originalColor) {
            const r = originalColor.r
            const g = originalColor.g
            const b = originalColor.b
            // If RGB values differ significantly, it's not gray
            const variance = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b))
            hasIntentionalColor = variance > 0.1 // Threshold for "colorful"
          }
          
          if (isDetailPart) {
            console.log('⏭️  Preserving detail part:', child.name || materialName)
            return // Skip - this is an accent element
          }
          
          if (usesAtlas && hasIntentionalColor) {
            console.log('🎨 Atlas-textured part with intentional color, preserving:', child.name)
            return // Skip - Kenney atlases use color for semantic meaning
          }
          
          // ✅ SAFE TO COLOR: This appears to be a main structure part
          child.material = child.material.clone()
          const mat = child.material as THREE.MeshStandardMaterial
          
          // Apply user color
          mat.color = selectedColor
          mat.needsUpdate = true
          
          // Maintain Kenney's material properties
          mat.metalness = mat.metalness || 0.1
          mat.roughness = mat.roughness || 0.8
          
          console.log('✅ Colored main structure:', child.name || 'wall', '→', color)
        }
      }
    })
    
    return cloned
  }, [originalScene, color])

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <PopIn>
        <primitive object={scene} scale={scale} />
      </PopIn>
    </group>
  )
}

export default ColorableModel
