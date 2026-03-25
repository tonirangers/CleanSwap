import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { Sparkles, ChevronDown, RefreshCw, Zap } from 'lucide-react'
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
      <div className="flex flex-col items-center gap-8">
        {/* Hero tagline — big */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-gradient tagline-glow text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            From Dust to Value
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            Sweep all your dust tokens into gas. One click.
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="liquid-glass w-full max-w-[480px] sm:max-w-[520px]"
        >
          <div className="relative z-10 flex flex-col items-center px-10 py-12 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base text-text-secondary"
            >
              Connect your wallet to start cleaning
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 w-full"
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
              className="mt-5 text-xs text-text-dim"
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
    <div className="flex flex-col items-center gap-6">
      {/* Hero tagline — stays visible but smaller */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-gradient tagline-glow text-2xl font-extrabold tracking-tight sm:text-3xl">
          From Dust to Value
        </h1>
      </motion.div>

      {/* Widget */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass w-full max-w-[480px] sm:max-w-[520px] overflow-hidden"
      >
        {/* ─── Header ─── */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-violet-light" />
            <span className="text-base font-bold tracking-tight">Sweep</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: -180 }}
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.04] hover:text-text-secondary disabled:opacity-30"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
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
          <div className="relative z-10 flex items-center justify-center border-b border-white/[0.06] py-3.5">
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

        {/* ─── Token List — ALWAYS VISIBLE (no accordion) ─── */}
        <div className="relative z-10 border-b border-white/[0.06]">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {isLoading ? (
                  <span className="scan-pulse inline-flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-accent" />
                    Scanning...
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

          {/* Token list — always open */}
          <div className="max-h-[360px] overflow-y-auto px-3 pb-3">
            {/* Loading */}
            {isLoading && (
              <div className="space-y-1.5 px-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-[56px]" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-error">{error.message}</p>
                <button onClick={() => refetch()} className="mt-3 text-sm text-violet-light hover:underline">
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && allSweepable.length === 0 && (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10">
                  <Sparkles className="h-6 w-6 text-success" />
                </div>
                <p className="text-base font-semibold text-text-secondary">
                  Wallet is clean!
                </p>
                <ConnectButton.Custom>
                  {({ openChainModal }) => (
                    <button
                      onClick={openChainModal}
                      className="mt-2 text-sm text-violet-light hover:underline"
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
        <div className="relative z-10 px-6 py-5">
          {selectedTokens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Dust value</p>
                <p className="text-2xl font-extrabold tabular-nums tracking-tight">{formatUsd(totalUsdValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">You receive</p>
                <p className="flex items-center justify-end gap-1.5 text-base font-bold text-violet-light">
                  <Zap className="h-4 w-4" />
                  {chainConfig?.symbol ?? 'ETH'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Divider */}
          {selectedTokens.length > 0 && (
            <div className="mb-5 h-px bg-white/[0.06]" />
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
            <p className="mt-3 text-center text-xs text-text-dim">
              {batches.length} transactions &middot; {selectedTokens.length} tokens
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
