import { useAccount, useChainId } from 'wagmi'
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
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Chain Not Supported</h2>
          <p className="text-text-muted">
            Please switch to BNB Chain or Base to use CleanSwap.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Sweep Your Dust
          </h1>
          <p className="mt-1 text-text-muted">
            on {chainConfig.name}
          </p>
        </div>

        {/* Token List */}
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

        {/* Batch Progress (only shown during sweep) */}
        <BatchProgress batches={batches} />

        {/* Clean All Button */}
        <SweepButton
          tokens={cleanableTokens}
          batches={batches}
          disabled={cleanableTokens.length === 0 || isLoading}
          onSuccess={refetch}
        />
      </div>
    </div>
  )
}
