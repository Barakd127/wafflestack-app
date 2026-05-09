import { useEffect } from 'react'
import './landing.css'
import { ScrollProgressBar } from './components/ScrollProgressBar'
import { HeroSection } from './sections/HeroSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { StatsSection } from './sections/StatsSection'
import { CTAFooterSection } from './sections/CTAFooterSection'

export default function LandingPage() {
  // The host app sets `body { overflow: hidden }` and `#root { height: 100vh }`
  // for the in-app views (study/mindmap/city). The landing page is a long
  // scrollable marketing page, so while it's mounted we flip body to allow
  // window-level scrolling and #root to grow with content. Reverted on unmount
  // so the in-app layout stays unchanged when the user clicks a CTA.
  useEffect(() => {
    const body = document.body
    const root = document.getElementById('root')
    const prevBodyOverflow = body.style.overflow
    const prevRootHeight = root?.style.height ?? ''
    const prevRootMinHeight = root?.style.minHeight ?? ''
    body.style.overflow = 'auto'
    if (root) {
      root.style.height = 'auto'
      root.style.minHeight = '100vh'
    }
    return () => {
      body.style.overflow = prevBodyOverflow
      if (root) {
        root.style.height = prevRootHeight
        root.style.minHeight = prevRootMinHeight
      }
    }
  }, [])

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
