import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * SkyGradient — backside sphere with a 2-stop golden-hour gradient.
 *
 * Cheaper than HDRI <Environment>, fits the cozy stylized look.
 * Horizon: warm peach (#ffd5a3). Zenith: soft cool blue (#9ec7ff).
 *
 * Pass `intensity` to dim/brighten without recompiling the shader.
 * Always renders behind everything (renderOrder=-1, depthWrite off).
 */
interface SkyGradientProps {
  /** Color at the horizon (default warm peach) */
  horizonColor?: string
  /** Color at the zenith (default soft blue) */
  zenithColor?: string
  /** Color below horizon (default subtle warm) */
  groundColor?: string
  /** Multiplicative brightness (0..1.5), default 1 */
  intensity?: number
  /** Sphere radius — must enclose the scene */
  radius?: number
}

export default function SkyGradient({
  horizonColor = '#ffd5a3',
  zenithColor  = '#9ec7ff',
  groundColor  = '#f4d4a8',
  intensity    = 1,
  radius       = 400,
}: SkyGradientProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        topColor:    { value: new THREE.Color(zenithColor) },
        midColor:    { value: new THREE.Color(horizonColor) },
        bottomColor: { value: new THREE.Color(groundColor) },
        intensity:   { value: intensity },
      },
      vertexShader: /* glsl */`
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform float intensity;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y;
          // Smooth blend: bottom -> horizon -> zenith
          vec3 col = mix(bottomColor, midColor, smoothstep(-0.15, 0.05, h));
          col      = mix(col,         topColor, smoothstep(0.05, 0.55, h));
          gl_FragColor = vec4(col * intensity, 1.0);
        }
      `,
    })
  }, [horizonColor, zenithColor, groundColor, intensity])

  return (
    <mesh renderOrder={-1} frustumCulled={false} material={material}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  )
}
