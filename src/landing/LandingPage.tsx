import './landing.css'
import { ScrollProgressBar } from './components/ScrollProgressBar'
import { HeroSection } from './sections/HeroSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { StatsSection } from './sections/StatsSection'
import { CTAFooterSection } from './sections/CTAFooterSection'

export default function LandingPage() {
  return (
    <div className="landing-root">
      <ScrollProgressBar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <CTAFooterSection />
    </div>
  )
}
