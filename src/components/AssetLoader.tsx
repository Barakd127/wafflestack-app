import { useGLTF } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useEffect, useState } from 'react'

interface AssetLoaderProps {
  modelUrl: string | null
  position?: [number, number, number]
}

const AssetLoader = ({ modelUrl, position = [0, 0, 0] }: AssetLoaderProps) => {
  const [isVisible, setIsVisible] = useState(false)

  // Spring animation for "pop-in" effect
  const springs = useSpring({
    scale: isVisible ? [1, 1, 1] : [0, 0, 0],
    position: isVisible ? position : [position[0], position[1] - 2, position[2]],
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
    }
  })

  useEffect(() => {
    if (modelUrl) {
      // Trigger animation when model loads
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [modelUrl])

  // If no model URL provided, don't render anything
  if (!modelUrl) {
    return null
  }

  // Load the .glb model
  const { scene } = useGLTF(modelUrl)

  return (
    <animated.group
      // @ts-ignore - react-spring types
      scale={springs.scale}
      position={springs.position}
    >
      <primitive object={scene} castShadow receiveShadow />
    </animated.group>
  )
}

// Preload helper for optimization
export const preloadModel = (url: string) => {
  useGLTF.preload(url)
}

export default AssetLoader
