import { ContactShadows } from '@react-three/drei'
import { useQualityTier, SHADOW_MAP_SIZE } from './QualityTier'

/**
 * CityLighting -- shared cozy 3-light setup for all WaffleStack 3D scenes.
 *
 *   - Directional sun: warm low-angle casts the only real shadow.
 *     Shadow-map size scales with quality tier.
 *   - Hemisphere fill: cool sky + warm ground bounce (cheap, no shadow cost).
 *   - Soft ambient: floor for very dark areas.
 *   - Fill light: second directional from back-left for Kenney toy-style flatness.
 *   - ContactShadows: cheap circular AO under everything for grounding.
 *
 * Tunable via props but defaults are tuned to the SkyGradient palette.
 */
interface CityLightingProps {
  sunPosition?: [number, number, number]
  sunColor?: string
  sunIntensity?: number
  hemiSky?: string
  hemiGround?: string
  ambientColor?: string
  /** Ambient intensity (default 0.4; use 0.7 for flat Kenney toy-style) */
  ambientIntensity?: number
  noContactShadows?: boolean
  contactShadowScale?: number
}

export default function CityLighting({
  sunPosition        = [25, 28, 18],
  sunColor           = '#ffeacb',
  sunIntensity       = 1.6,
  hemiSky            = '#9ec7ff',
  hemiGround         = '#c8a37a',
  ambientColor       = '#fff5e1',
  ambientIntensity   = 0.4,
  noContactShadows   = false,
  contactShadowScale = 40,
}: CityLightingProps) {
  const tier = useQualityTier(s => s.tier)
  const shadowMap = SHADOW_MAP_SIZE[tier]

  return (
    <>
      {/* Warm key light -- only shadow caster */}
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
      />

      {/* Cool fill -- no shadow cost */}
      <hemisphereLight color={hemiSky} groundColor={hemiGround} intensity={0.55} />

      {/* Soft floor ambient -- higher = flatter/more toy-like (Kenney style) */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Second soft fill from back-left -- reduces harsh shadow contrast */}
      <directionalLight position={[-15, 10, -15]} intensity={0.2} color="#d4e8ff" />

      {/* Cheap grounding under all objects */}
      {!noContactShadows && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.42}
          scale={contactShadowScale}
          blur={2.4}
          far={8}
          resolution={tier === 'low' ? 256 : 512}
          color="#2b1b08"
        />
      )}
    </>
  )
}
