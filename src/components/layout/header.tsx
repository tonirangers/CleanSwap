import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="glass-strong sticky top-0 z-50 mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-2.5 sm:mx-4 sm:mt-4 sm:px-6 sm:py-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet-subtle">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">CleanSwap</span>
      </div>

      {/* Chain selector (centered) + Wallet */}
      <div className="flex items-center gap-2">
        <ConnectButton
          chainStatus={{
            smallScreen: 'icon',
            largeScreen: 'full',
          }}
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      </div>
    </header>
  )
}
