import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DeformationVertexShader, DeformationFragmentShader, OutlineVertexShader, OutlineFragmentShader } from '../shaders/DeformationShader'

interface DeformableCellProps {
  // Four corners of the irregular grid cell (world space)
  corners: {
    a: THREE.Vector3  // bottom-left
    b: THREE.Vector3  // bottom-right
    c: THREE.Vector3  // top-right
    d: THREE.Vector3  // top-left
  }
  height: number
  color: string
  onClick?: () => void
}

const DeformableCell = ({ corners, height, color, onClick }: DeformableCellProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.Mesh>(null)
  const [scaleAnim, setScaleAnim] = useState(0)

  // Create unit cube geometry (will be deformed by shader)
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, height, 1)
    // Center at origin, height goes up from 0
    geo.translate(0.5, height / 2, 0.5)
    return geo
  }, [height])

  // Deformation material
  const deformMaterial = useMemo(() => {
    const colorObj = new THREE.Color(color)
    
    return new THREE.ShaderMaterial({
      vertexShader: DeformationVertexShader,
      fragmentShader: DeformationFragmentShader,
      uniforms: {
        cornerA: { value: corners.a },
        cornerB: { value: corners.b },
        cornerC: { value: corners.c },
        cornerD: { value: corners.d },
        color: { value: colorObj },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() }
      }
    })
  }, [corners, color])

  // Outline material (also needs deformation)
  const outlineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: DeformationVertexShader,
      fragmentShader: `void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }`,
      uniforms: {
        cornerA: { value: corners.a },
        cornerB: { value: corners.b },
        cornerC: { value: corners.c },
        cornerD: { value: corners.d },
        outlineThickness: { value: 0.05 }
      },
      side: THREE.BackSide
    })
  }, [corners])

  // Entrance animation
  useFrame((state, delta) => {
    if (scaleAnim < 1) {
      setScaleAnim((prev: number) => Math.min(prev + delta * 3, 1))
    }
    
    if (meshRef.current && outlineRef.current && scaleAnim < 1) {
      // Elastic bounce on Y axis only
      const elastic = scaleAnim < 0.5
        ? 2 * scaleAnim * scaleAnim
        : 1 - Math.pow(-2 * scaleAnim + 2, 2) / 2
      
      meshRef.current.scale.y = elastic
      outlineRef.current.scale.y = elastic
    }
  })

  useEffect(() => {
    setScaleAnim(0)
  }, [])

  return (
    <group onClick={onClick}>
      {/* Main deformed mesh */}
      <mesh ref={meshRef} geometry={geometry} material={deformMaterial} castShadow receiveShadow />
      {/* Outline */}
      <mesh ref={outlineRef} geometry={geometry} material={outlineMaterial} />
    </group>
  )
}

export default DeformableCell
