import { formatUsd } from '@/lib/utils'

interface SweepSummaryProps {
  totalUsdValue: number
  tokenCount: number
  batchCount: number
  chainSymbol: string
}

export function SweepSummary({
  totalUsdValue,
  tokenCount,
  batchCount,
  chainSymbol,
}: SweepSummaryProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">Total dust value</span>
        <span className="text-lg font-semibold">{formatUsd(totalUsdValue)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-text-muted">
        <span>{tokenCount} tokens</span>
        <span>
          &rarr; {chainSymbol}
          {batchCount > 1 && ` (${batchCount} batches)`}
        </span>
      </div>
    </div>
  )
}
