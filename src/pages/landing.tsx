import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Features } from '@/components/landing/features'
import { ChainsSupported } from '@/components/landing/chains-supported'
import { Faq } from '@/components/landing/faq'
import { CtaSection } from '@/components/landing/cta-section'

export function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <HowItWorks />
      <Features />
      <ChainsSupported />
      <Faq />
      <CtaSection />
    </div>
  )
}
