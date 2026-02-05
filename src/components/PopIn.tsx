/**
 * PopIn Component - "The Juice" Animation Wrapper
 * Creates elastic "plop" effect when buildings spawn
 * Based on Townscaper's procedural animation philosophy
 */

import { useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

interface PopInProps {
  children: React.ReactNode
  delay?: number
}

const PopIn = ({ children, delay = 0 }: PopInProps) => {
  const groupRef = useRef<THREE.Group>(null)

  // 🎯 THE TOWNSCAPER "PLOP" EFFECT
  // High Tension + Low Friction = Elastic Overshoot
  const spring = useSpring({
    from: {
      scale: [0, 0, 0],
      rotation: [0, Math.random() * 0.2 - 0.1, 0], // Slight random twist
    },
    to: {
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    },
    config: {
      tension: 180, // High tension = faster initial movement
      friction: 12,  // Low friction = more bouncing
      mass: 1,
    },
    delay,
  })

  return (
    <animated.group
      ref={groupRef}
      scale={spring.scale as any}
      rotation={spring.rotation as any}
    >
      {children}
    </animated.group>
  )
}

export default PopIn
