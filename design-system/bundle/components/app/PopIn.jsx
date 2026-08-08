// [ds-extract] from src/components/PopIn.tsx @ c1a3ad12 (master)
/**
 * PopIn Component - "The Juice" Animation Wrapper
 * Creates elastic "plop" effect when buildings spawn
 * Based on Townscaper's procedural animation philosophy
 */
import React from 'react';

// [ds-extract] replaced @react-spring/three useSpring + animated.group with a self-contained
// requestAnimationFrame spring integrator using the same physics constants
// (tension 180, friction 12, mass 1) driving a plain <group> — visual output unchanged
export function PopIn({ children, delay = 0 }) {
  const groupRef = React.useRef(null)
  const twistRef = React.useRef(Math.random() * 0.2 - 0.1) // Slight random twist

  // 🎯 THE TOWNSCAPER "PLOP" EFFECT
  // High Tension + Low Friction = Elastic Overshoot
  const [frame, setFrame] = React.useState({ scale: 0, rotY: twistRef.current })

  React.useEffect(() => {
    const tension = 180 // High tension = faster initial movement
    const friction = 12  // Low friction = more bouncing
    const mass = 1
    let raf = 0
    let last = 0
    let s = 0, sv = 0                 // scale value / velocity
    let r = twistRef.current, rv = 0  // rotation-Y value / velocity
    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      sv += ((tension * (1 - s) - friction * sv) / mass) * dt
      s += sv * dt
      rv += ((tension * (0 - r) - friction * rv) / mass) * dt
      r += rv * dt
      const settled =
        Math.abs(1 - s) < 0.001 && Math.abs(sv) < 0.001 &&
        Math.abs(r) < 0.001 && Math.abs(rv) < 0.001
      if (settled) {
        setFrame({ scale: 1, rotY: 0 })
      } else {
        setFrame({ scale: s, rotY: r })
        raf = requestAnimationFrame(step)
      }
    }
    const timer = setTimeout(() => {
      last = performance.now()
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [delay])

  return (
    <group
      ref={groupRef}
      scale={[frame.scale, frame.scale, frame.scale]}
      rotation={[0, frame.rotY, 0]}
    >
      {children}
    </group>
  )
}
