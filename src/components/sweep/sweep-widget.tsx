import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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

  // Token selection state — all selected by default (zero friction)
  const [deselected, setDeselected] = useState<Set<string>>(new Set())
  const [tokenListOpen, setTokenListOpen] = useState(true)

  const allSweepable = dustTokens?.filter((t) => t.isOdosSupported) ?? []
  const selectedTokens = allSweepable.filter((t) => !deselected.has(t.address))
  const batches = useBatchStrategy(selectedTokens)
  const totalUsdValue = selectedTokens.reduce((sum, t) => sum + t.usdValue, 0)

  function toggleToken(address: string) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(address)) {
        next.delete(address)
      } else {
        next.add(address)
      }
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (deselected.size === 0) {
      // Deselect all
      setDeselected(new Set(allSweepable.map((t) => t.address)))
    } else {
      // Select all
      setDeselected(new Set())
    }
  }, [deselected.size, allSweepable])

  const allSelected = deselected.size === 0

  // ── Not connected ──
  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-[420px]"
      >
        <div className="relative z-10 flex flex-col items-center px-8 py-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-extrabold tracking-tight"
          >
            Clean your wallet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-sm text-text-muted"
          >
            Sweep all dust tokens into gas. One click.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 w-full"
          >
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openConnectModal}
                  className="btn-primary glow-violet w-full py-3.5 text-base"
                >
                  Connect Wallet
                </motion.button>
              )}
            </ConnectButton.Custom>
          </motion.div>

          {/* Supported chains hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-[11px] text-text-dim"
          >
            BSC &middot; Base &middot; ETH &middot; Arbitrum &middot; Polygon &middot; +6 chains
          </motion.p>
        </div>
      </motion.div>
    )
  }

  // ── Connected state ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card w-full max-w-[420px] overflow-hidden"
    >
      {/* ─── Widget Header with Chain Selector ─── */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-accent/20 to-violet-accent/5">
            <Zap className="h-3.5 w-3.5 text-violet-light" />
          </div>
          <span className="text-sm font-bold tracking-tight">Sweep</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: -180 }}
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-white/[0.04] hover:text-text-secondary disabled:opacity-30"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Chain + Account via RainbowKit */}
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </div>
      </div>

      {/* ─── Chain indicator bar ─── */}
      {chainConfig && (
        <div className="relative z-10 flex items-center justify-center border-b border-white/[0.04] px-5 py-2">
          <ConnectButton.Custom>
            {({ chain, openChainModal }) => (
              <button
                onClick={openChainModal}
                className="chain-selector-pill"
              >
                {chain?.hasIcon && chain.iconUrl && (
                  <img src={chain.iconUrl} alt={chain.name} className="h-4 w-4 rounded-full" />
                )}
                <span>{chainConfig.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      )}

      {/* ─── Token List Accordion ─── */}
      <div className="relative z-10 border-b border-white/[0.04]">
        {/* Accordion toggle */}
        <button
          onClick={() => setTokenListOpen(!tokenListOpen)}
          className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-text-secondary">
            {isLoading ? (
              <span className="scan-pulse inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-accent" />
                Scanning tokens...
              </span>
            ) : allSweepable.length === 0 ? (
              'No sweepable tokens found'
            ) : (
              `${selectedTokens.length}/${allSweepable.length} tokens selected`
            )}
          </span>

          <div className="flex items-center gap-2">
            {/* Select/Deselect all */}
            {allSweepable.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleAll() }}
                className="toggle-all-btn"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            )}

            <ChevronDown
              className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${
                tokenListOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Accordion body */}
        <AnimatePresence>
          {tokenListOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="max-h-[280px] overflow-y-auto px-2 pb-3">
                {/* Loading skeletons */}
                {isLoading && (
                  <div className="space-y-1 px-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton h-[44px]"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="px-3 py-6 text-center">
                    <p className="text-xs text-error">{error.message}</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 text-xs text-violet-light hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && allSweepable.length === 0 && (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-medium text-text-secondary">
                      Wallet is clean
                    </p>
                    <p className="mt-1 text-xs text-text-dim">
                      No dust on {chainConfig?.name ?? 'this chain'}. Try another chain.
                    </p>
                  </div>
                )}

                {/* Token rows */}
                {allSweepable.map((token, i) => (
                  <motion.div
                    key={token.address}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.25 }}
                  >
                    <TokenRow
                      token={token}
                      selected={!deselected.has(token.address)}
                      onToggle={() => toggleToken(token.address)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Summary + Action ─── */}
      <div className="relative z-10 px-5 py-4">
        {/* Summary */}
        {selectedTokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Dust value
              </p>
              <p className="text-xl font-extrabold tabular-nums tracking-tight">
                {formatUsd(totalUsdValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                You receive
              </p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-violet-light">
                <Zap className="h-3.5 w-3.5" />
                {chainConfig?.symbol ?? 'ETH'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Batch progress */}
        <BatchProgress batches={batches} />

        {/* CTA */}
        <SweepButton
          tokens={selectedTokens}
          batches={batches}
          disabled={selectedTokens.length === 0 || isLoading}
          onSuccess={() => {
            setDeselected(new Set())
            refetch()
          }}
        />

        {/* Batch info */}
        {batches.length > 1 && (
          <p className="mt-2.5 text-center text-[10px] text-text-dim">
            {batches.length} transactions needed &middot; {selectedTokens.length} tokens
          </p>
        )}
      </div>
    </motion.div>
  )
}
