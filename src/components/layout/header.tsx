import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="glass sticky top-0 z-50 mx-4 mt-4 flex items-center justify-between rounded-2xl px-6 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-accent">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">CleanSwap</span>
      </div>

      <ConnectButton
        chainStatus="icon"
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </header>
  )
}
