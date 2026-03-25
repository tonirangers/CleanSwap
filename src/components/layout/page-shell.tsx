import type { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col relative">
      {/* Animated gradient background */}
      <div className="bg-gradient-scene">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-noise" />

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
