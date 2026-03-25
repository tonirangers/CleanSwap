import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { Sparkles, ChevronDown, RefreshCw, Zap, ArrowDown } from 'lucide-react'
import { useDustTokens } from '@/hooks/use-dust-tokens'
import { useBatchStrategy } from '@/hooks/use-batch-strategy'
import { TokenRow } from './token-row'
import { SweepButton } from './sweep-button'
import { BatchProgress } from './batch-progress'
import { getChainConfig } from '@/config/chains'
import { formatUsd } from '@/lib/utils'

interface SweepWidgetProps {
  connected: boolean
}

export function SweepWidget({ connected }: SweepWidgetProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const chainConfig = getChainConfig(chainId)

  const { data: dustTokens, isLoading, error, refetch } = useDustTokens(
    connected ? address : undefined,
    chainId,
  )

  const [deselected, setDeselected] = useState<Set<string>>(new Set())

  // Reset state on wallet/chain change
  const prevAddress = useRef(address)
  const prevChainId = useRef(chainId)
  useEffect(() => {
    if (prevAddress.current !== address || prevChainId.current !== chainId) {
      setDeselected(new Set())
      prevAddress.current = address
      prevChainId.current = chainId
    }
  }, [address, chainId])

  const allSweepable = dustTokens?.filter((t) => t.isOdosSupported) ?? []
  const selectedTokens = allSweepable.filter((t) => !deselected.has(t.address))
  const batches = useBatchStrategy(selectedTokens)
  const totalUsdValue = selectedTokens.reduce((sum, t) => sum + t.usdValue, 0)

  function toggleToken(addr: string) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(addr)) next.delete(addr)
      else next.add(addr)
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (deselected.size === 0) {
      setDeselected(new Set(allSweepable.map((t) => t.address)))
    } else {
      setDeselected(new Set())
    }
  }, [deselected.size, allSweepable])

  const allSelected = deselected.size === 0

  // ── Not connected ──
  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-10 w-full">
        {/* Hero tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-gradient tagline-glow text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
            From Dust to Value
          </h1>
          <p className="mt-4 text-lg text-text-secondary sm:text-xl max-w-md mx-auto">
            Sweep all your dust tokens into gas. One click.
          </p>
        </motion.div>

        {/* Glass card — connect */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="liquid-glass w-full max-w-[580px] sm:max-w-[640px]"
        >
          <div className="relative z-10 flex flex-col items-center px-12 py-16 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-text-secondary mb-10"
            >
              Connect your wallet to start cleaning
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-[320px]"
            >
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openConnectModal}
                    className="btn-primary glow-violet w-full py-4 text-lg rounded-2xl"
                  >
                    Connect Wallet
                  </motion.button>
                )}
              </ConnectButton.Custom>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 text-sm text-text-dim"
            >
              11 chains supported &middot; Powered by Odos
            </motion.p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Connected state ──
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Hero tagline — smaller when connected */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-gradient tagline-glow text-3xl font-extrabold tracking-tight sm:text-4xl">
          From Dust to Value
        </h1>
      </motion.div>

      {/* Main sweep card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass w-full max-w-[580px] sm:max-w-[640px] overflow-hidden"
      >
        {/* ─── Header ─── */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-accent/10">
              <Zap className="h-4.5 w-4.5 text-violet-light" />
            </div>
            <span className="text-lg font-bold tracking-tight">Sweep</span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: -180 }}
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.04] hover:text-text-secondary disabled:opacity-30"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>

            <ConnectButton
              chainStatus="none"
              showBalance={false}
              accountStatus="avatar"
            />
          </div>
        </div>

        {/* ─── Chain selector pill ─── */}
        {chainConfig && (
          <div className="relative z-10 flex items-center justify-center border-b border-white/[0.06] py-4">
            <ConnectButton.Custom>
              {({ chain, openChainModal }) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openChainModal}
                  className="chain-selector-pill"
                >
                  {chain?.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} className="h-5 w-5 rounded-full" />
                  )}
                  <span>{chainConfig.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        )}

        {/* ─── Token List ─── */}
        <div className="relative z-10 border-b border-white/[0.06]">
          {/* Section header */}
          <div className="flex items-center justify-between px-7 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                {isLoading ? (
                  <span className="scan-pulse inline-flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-violet-accent" />
                    Scanning wallet...
                  </span>
                ) : (
                  'Your Dust'
                )}
              </span>
              {!isLoading && allSweepable.length > 0 && (
                <span className="count-badge">
                  {selectedTokens.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {allSweepable.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="toggle-all-btn"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              )}
            </div>
          </div>

          {/* Token list */}
          <div className="max-h-[420px] overflow-y-auto px-4 pb-4">
            {/* Loading */}
            {isLoading && (
              <div className="space-y-2 px-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-[64px]" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-error">{error.message}</p>
                <button onClick={() => refetch()} className="mt-3 text-sm text-violet-light hover:underline">
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && allSweepable.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                  <Sparkles className="h-7 w-7 text-success" />
                </div>
                <p className="text-lg font-semibold text-text-secondary">
                  Wallet is clean!
                </p>
                <p className="mt-1 text-sm text-text-muted">No dust tokens found on this chain</p>
                <ConnectButton.Custom>
                  {({ openChainModal }) => (
                    <button
                      onClick={openChainModal}
                      className="mt-3 text-sm text-violet-light hover:underline"
                    >
                      Try another chain
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            )}

            {/* Token rows */}
            {allSweepable.map((token, i) => (
              <motion.div
                key={token.address}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <TokenRow
                  token={token}
                  selected={!deselected.has(token.address)}
                  onToggle={() => toggleToken(token.address)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Summary + CTA ─── */}
        <div className="relative z-10 px-7 py-6">
          {selectedTokens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Dust value</p>
                <p className="text-3xl font-extrabold tabular-nums tracking-tight mt-1">{formatUsd(totalUsdValue)}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowDown className="h-5 w-5 text-violet-accent/50" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">You receive</p>
                <p className="flex items-center justify-end gap-2 text-xl font-bold text-violet-light mt-1">
                  <Zap className="h-5 w-5" />
                  {chainConfig?.symbol ?? 'ETH'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Divider */}
          {selectedTokens.length > 0 && (
            <div className="mb-6 h-px bg-white/[0.06]" />
          )}

          <BatchProgress batches={batches} />

          <SweepButton
            tokens={selectedTokens}
            batches={batches}
            disabled={selectedTokens.length === 0 || isLoading}
            onSuccess={() => {
              setDeselected(new Set())
              refetch()
            }}
          />

          {batches.length > 1 && (
            <p className="mt-4 text-center text-xs text-text-dim">
              {batches.length} transactions &middot; {selectedTokens.length} tokens
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
