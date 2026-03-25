import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { Sparkles, ChevronDown, AlertTriangle } from 'lucide-react'
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

  // Token selection state — all selected by default
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

  // ── Not connected state ──
  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-md"
      >
        <div className="flex flex-col items-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Clean your wallet
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            One transaction. All your dust → gas.
          </p>

          <div className="mt-6 w-full">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={openConnectModal}
                  className="btn-primary glow-violet w-full py-3.5 text-base"
                >
                  Connect Wallet
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Chain not supported ──
  if (!chainConfig?.enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10">
          <AlertTriangle className="h-6 w-6 text-warning" />
        </div>
        <h2 className="text-lg font-bold">Chain Not Supported</h2>
        <p className="mt-2 text-sm text-text-muted">
          Switch to a supported chain using the selector above.
        </p>
      </motion.div>
    )
  }

  // ── Connected state — The Widget ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card w-full max-w-md overflow-hidden"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-accent/25 to-violet-accent/5">
            <Sparkles className="h-4 w-4 text-violet-light" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Sweep Dust</h2>
            <p className="text-[11px] text-text-muted">on {chainConfig.name}</p>
          </div>
        </div>

        {/* Chain selector */}
        <ConnectButton
          chainStatus="full"
          showBalance={false}
          accountStatus="avatar"
        />
      </div>

      {/* ─── Token List (accordion) ─── */}
      <div className="border-b border-white/[0.04]">
        {/* Accordion header */}
        <button
          onClick={() => setTokenListOpen(!tokenListOpen)}
          className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-xs font-medium text-text-secondary">
            {isLoading
              ? 'Scanning...'
              : allSweepable.length === 0
                ? 'No sweepable tokens found'
                : `${selectedTokens.length}/${allSweepable.length} tokens selected`}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${
              tokenListOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Accordion content */}
        <AnimatePresence>
          {tokenListOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="max-h-[320px] overflow-y-auto px-2 pb-3">
                {/* Loading */}
                {isLoading && (
                  <div className="space-y-1 px-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton h-[48px]"
                        style={{ animationDelay: `${i * 0.1}s` }}
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

                {/* Empty */}
                {!isLoading && !error && allSweepable.length === 0 && (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-medium text-text-muted">
                      No dust tokens found
                    </p>
                    <p className="mt-1 text-xs text-text-dim">
                      Your wallet is clean on {chainConfig.name}!
                    </p>
                  </div>
                )}

                {/* Token rows */}
                {allSweepable.map((token, i) => (
                  <motion.div
                    key={token.address}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
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
      <div className="px-5 py-4">
        {/* Summary line */}
        {selectedTokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-text-muted">Total dust value</p>
              <p className="text-xl font-bold tabular-nums">{formatUsd(totalUsdValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">You receive</p>
              <p className="text-sm font-semibold text-violet-light">
                {chainConfig.symbol}
              </p>
            </div>
          </motion.div>
        )}

        {/* Batch progress */}
        <BatchProgress batches={batches} />

        {/* Sweep button */}
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
          <p className="mt-2 text-center text-[10px] text-text-dim">
            {batches.length} batches needed ({selectedTokens.length} tokens)
          </p>
        )}
      </div>
    </motion.div>
  )
}
