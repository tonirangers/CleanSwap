import { motion } from 'motion/react'
import { useAccount, useChainId } from 'wagmi'
import { Sparkles, AlertTriangle } from 'lucide-react'
import { useDustTokens } from '@/hooks/use-dust-tokens'
import { useBatchStrategy } from '@/hooks/use-batch-strategy'
import { TokenList } from '@/components/sweep/token-list'
import { SweepSummary } from '@/components/sweep/sweep-summary'
import { SweepButton } from '@/components/sweep/sweep-button'
import { BatchProgress } from '@/components/sweep/batch-progress'
import { getChainConfig } from '@/config/chains'

export function SweepPage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const chainConfig = getChainConfig(chainId)

  const { data: dustTokens, isLoading, error, refetch } = useDustTokens(address, chainId)

  const cleanableTokens = dustTokens?.filter((t) => t.isOdosSupported) ?? []
  const batches = useBatchStrategy(cleanableTokens)

  const totalUsdValue = cleanableTokens.reduce((sum, t) => sum + t.usdValue, 0)

  if (!chainConfig?.enabled) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-sm p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <h2 className="text-xl font-bold">Chain Not Supported</h2>
          <p className="mt-2 text-sm text-text-muted">
            Switch to <strong className="text-text-primary">BNB Chain</strong> or{' '}
            <strong className="text-text-primary">Base</strong> to use CleanSwap.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-4"
      >
        {/* Page header */}
        <div className="flex items-center justify-center gap-3 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-accent/25 to-violet-accent/5">
            <Sparkles className="h-5 w-5 text-violet-light" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sweep Your Dust</h1>
            <p className="text-xs text-text-muted">on {chainConfig.name}</p>
          </div>
        </div>

        {/* Token List Card */}
        <div className="glass-card p-4">
          <TokenList
            tokens={dustTokens ?? []}
            isLoading={isLoading}
            error={error?.message}
            onRetry={refetch}
          />
        </div>

        {/* Summary */}
        {cleanableTokens.length > 0 && (
          <SweepSummary
            totalUsdValue={totalUsdValue}
            tokenCount={cleanableTokens.length}
            batchCount={batches.length}
            chainSymbol={chainConfig.symbol}
          />
        )}

        {/* Batch Progress */}
        <BatchProgress batches={batches} />

        {/* Clean All Button */}
        <SweepButton
          tokens={cleanableTokens}
          batches={batches}
          disabled={cleanableTokens.length === 0 || isLoading}
          onSuccess={refetch}
        />
      </motion.div>
    </div>
  )
}
