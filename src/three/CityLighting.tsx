import { ContactShadows } from '@react-three/drei'
import { useQualityTier, SHADOW_MAP_SIZE } from './QualityTier'

/**
 * CityLighting — shared cozy 3-light setup for all WaffleStack 3D scenes.
 *
 *   - Directional sun: warm low-angle (golden hour ~25° elevation, 35° azimuth)
 *     casts the only real shadow. Shadow-map size scales with quality tier.
 *   - Hemisphere fill: cool sky + warm ground bounce (cheap, no shadow cost).
 *   - Soft ambient: floor for very dark areas (low intensity).
 *   - ContactShadows: cheap circular AO under everything for grounding.
 *
 * Tunable via props but defaults are tuned to the SkyGradient palette.
 */
interface CityLightingProps {
  /** Position of the directional sun light (also defines its shadow camera origin) */
  sunPosition?: [number, number, number]
  /** Sun color (default warm) */
  sunColor?: string
  /** Sun intensity (default 1.6) */
  sunIntensity?: number
  /** Hemisphere sky color */
  hemiSky?: string
  /** Hemisphere ground color */
  hemiGround?: string
  /** Ambient color */
  ambientColor?: string
  /** Disable ContactShadows entirely */
  noContactShadows?: boolean
  /** Scale of contact-shadow plane (default 40) */
  contactShadowScale?: number
}

export default function CityLighting({
  sunPosition        = [25, 28, 18],   // ~25° elevation, 35° azimuth
  sunColor           = '#ffeacb',
  sunIntensity       = 1.6,
  hemiSky            = '#9ec7ff',
  hemiGround         = '#c8a37a',
  ambientColor       = '#fff5e1',
  noContactShadows   = false,
  contactShadowScale = 40,
}: CityLightingProps) {
  const tier = useQualityTier(s => s.tier)
  const shadowMap = SHADOW_MAP_SIZE[tier]

  return (
    <>
      {/* Warm key light — only shadow caster */}
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
      />

      {/* Cool fill — no shadow cost */}
      <hemisphereLight color={hemiSky} groundColor={hemiGround} intensity={0.55} />

      {/* Soft floor — bumped to 0.4 for better scene fill with Sky component */}
      <ambientLight color={ambientColor} intensity={0.4} />

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
