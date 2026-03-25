import { motion } from 'motion/react'
import { TokenRow } from './token-row'
import { AlertCircle, RefreshCw, Inbox, Search } from 'lucide-react'
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
      <div className="space-y-1 p-1">
        <div className="flex items-center gap-2 px-2 pb-3">
          <Search className="h-4 w-4 text-violet-light animate-pulse" />
          <span className="text-sm text-text-secondary">Scanning wallet...</span>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-[52px]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
          <AlertCircle className="h-6 w-6 text-error" />
        </div>
        <div>
          <p className="text-sm font-medium">Something went wrong</p>
          <p className="mt-1 text-xs text-text-muted">{error}</p>
        </div>
        <button
          onClick={() => onRetry()}
          className="btn-glass flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
          <Inbox className="h-7 w-7 text-text-dim" />
        </div>
        <div>
          <p className="font-semibold">No dust found</p>
          <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-text-muted">
            Your wallet is already clean on this chain. Nice!
          </p>
        </div>
      </div>
    )
  }

  const supported = tokens.filter((t) => t.isOdosSupported)
  const unsupported = tokens.filter((t) => !t.isOdosSupported)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-3">
        <span className="text-sm font-medium text-text-secondary">
          {supported.length} token{supported.length !== 1 ? 's' : ''} to sweep
        </span>
        <span className="text-xs text-text-muted">USD Value</span>
      </div>

      {/* Supported tokens */}
      <div className="space-y-0.5">
        {supported.map((token, i) => (
          <motion.div
            key={token.address}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <TokenRow token={token} />
          </motion.div>
        ))}
      </div>

      {/* Unsupported tokens */}
      {unsupported.length > 0 && (
        <div className="mt-3 border-t border-white/[0.04] pt-3">
          <p className="mb-1 px-3 text-xs font-medium text-text-dim">
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
