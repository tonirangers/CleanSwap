import { motion } from 'motion/react'
import { ArrowRight, Fuel } from 'lucide-react'
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5"
    >
      {/* Main value */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total Dust</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatUsd(totalUsdValue)}</p>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5">
            <Fuel className="h-3.5 w-3.5 text-violet-light" />
            <span className="text-sm font-semibold text-text-primary">{chainSymbol}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
        <span>{tokenCount} token{tokenCount !== 1 ? 's' : ''}</span>
        <span className="h-3 w-px bg-white/10" />
        <span>{batchCount === 1 ? '1 transaction' : `${batchCount} batches`}</span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-success">~70% gas saved</span>
      </div>
    </motion.div>
  )
}
