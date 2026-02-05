import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ToonVertexShader, ToonFragmentShader, OutlineVertexShader, OutlineFragmentShader } from '../shaders/ToonShader'

interface ToonBuildingProps {
  position: [number, number, number]
  color: string
  type: 'house' | 'tower' | 'building' | 'small'
  onClick?: () => void
}

const ToonBuilding = ({ position, color, type, onClick }: ToonBuildingProps) => {
  const meshRef = useRef<THREE.Group>(null)
  const [scaleAnim, setScaleAnim] = useState(0)

  // Building dimensions based on type
  const dimensions = useMemo(() => {
    switch (type) {
      case 'tower':
        return { width: 1.5, height: 4, depth: 1.5 }
      case 'building':
        return { width: 2, height: 2.5, depth: 2 }
      case 'house':
        return { width: 1.8, height: 2, depth: 1.8 }
      case 'small':
        return { width: 1.2, height: 1.5, depth: 1.2 }
      default:
        return { width: 1.5, height: 2, depth: 1.5 }
    }
  }, [type])

  // Toon material with custom shader
  const toonMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: ToonVertexShader,
      fragmentShader: ToonFragmentShader,
      uniforms: {
        color: { value: new THREE.Color(color) },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() }
      }
    })
  }, [color])

  // Black outline material
  const outlineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: OutlineVertexShader,
      fragmentShader: OutlineFragmentShader,
      uniforms: {
        outlineThickness: { value: 0.05 }
      },
      side: THREE.BackSide
    })
  }, [])

  // Entrance animation
  useFrame((state, delta) => {
    if (scaleAnim < 1) {
      setScaleAnim((prev: number) => Math.min(prev + delta * 3, 1))
    }
    if (meshRef.current && scaleAnim < 1) {
      // Elastic bounce effect
      const elasticScale = scaleAnim < 0.5
        ? 2 * scaleAnim * scaleAnim
        : 1 - Math.pow(-2 * scaleAnim + 2, 2) / 2
      
      meshRef.current.scale.setScalar(elasticScale)
    }
  })

  // Create building geometry
  const buildingGeometry = useMemo(() => {
    const group = new THREE.Group()

    // Main body
    const bodyGeo = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)
    bodyGeo.translate(0, dimensions.height / 2, 0)

    // Roof (pyramid)
    const roofHeight = 0.6
    const roofGeo = new THREE.ConeGeometry(dimensions.width * 0.7, roofHeight, 4)
    roofGeo.rotateY(Math.PI / 4)
    roofGeo.translate(0, dimensions.height + roofHeight / 2, 0)

    return { body: bodyGeo, roof: roofGeo }
  }, [dimensions])

  // Slightly darker roof color
  const roofMaterial = useMemo(() => {
    const c = new THREE.Color(color)
    const darker = c.clone().multiplyScalar(0.7)
    
    return new THREE.ShaderMaterial({
      vertexShader: ToonVertexShader,
      fragmentShader: ToonFragmentShader,
      uniforms: {
        color: { value: darker },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() }
      }
    })
  }, [color])

  useEffect(() => {
    // Trigger entrance animation
    setScaleAnim(0)
  }, [])

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      {/* Main building body with outline */}
      <mesh geometry={buildingGeometry.body} material={toonMaterial} />
      <mesh geometry={buildingGeometry.body} material={outlineMaterial} />
      
      {/* Roof with outline */}
      <mesh geometry={buildingGeometry.roof} material={roofMaterial} />
      <mesh geometry={buildingGeometry.roof} material={outlineMaterial} />
    </group>
  )
}

export default ToonBuilding
