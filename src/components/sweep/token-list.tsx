import { motion } from 'motion/react'
import { TokenRow } from './token-row'
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'
import type { DustToken } from '@/types'

interface TokenListProps {
  tokens: DustToken[]
  isLoading: boolean
  error?: string
  onRetry: () => void
}

export function TokenList({ tokens, isLoading, error, onRetry }: TokenListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Scanning wallet...</span>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl bg-white/5"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-error" />
        <p className="text-sm text-text-muted">{error}</p>
        <button
          onClick={() => onRetry()}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Inbox className="h-10 w-10 text-text-dim" />
        <div>
          <p className="font-medium">No dust found</p>
          <p className="mt-1 text-sm text-text-muted">
            Your wallet is already clean on this chain.
          </p>
        </div>
      </div>
    )
  }

  const supported = tokens.filter((t) => t.isOdosSupported)
  const unsupported = tokens.filter((t) => !t.isOdosSupported)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-sm text-text-muted">
          {supported.length} token{supported.length !== 1 ? 's' : ''} to sweep
        </span>
        <span className="text-sm text-text-muted">Value</span>
      </div>

      {supported.map((token, i) => (
        <motion.div
          key={token.address}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <TokenRow token={token} />
        </motion.div>
      ))}

      {unsupported.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <p className="px-1 pb-2 text-xs text-text-dim">
            Not supported by Odos ({unsupported.length})
          </p>
          {unsupported.map((token) => (
            <TokenRow key={token.address} token={token} dimmed />
          ))}
        </div>
      )}
    </div>
  )
}
