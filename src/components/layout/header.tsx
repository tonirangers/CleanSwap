import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'

export function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-accent to-violet-dark">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-text-secondary">CleanSwap</span>
      </div>

      {/* Wallet (only when connected) */}
      {isConnected && (
        <ConnectButton
          chainStatus="none"
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
      )}
    </header>
  )
}
