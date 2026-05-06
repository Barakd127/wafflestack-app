import './landing.css'
import { HeroSection } from './sections/HeroSection'

export default function LandingPage() {
  return (
    <div className="landing-root" style={{ position: 'relative' }}>
      <HeroSection />
    </div>
  )
}
