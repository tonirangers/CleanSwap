import { formatNumber, formatUsd } from '@/lib/utils'
import type { DustToken } from '@/types'

interface TokenRowProps {
  token: DustToken
  dimmed?: boolean
}

export function TokenRow({ token, dimmed }: TokenRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        dimmed ? 'opacity-40' : 'hover:bg-white/5'
      }`}
    >
      {/* Token icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
        {token.logoUrl ? (
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className="text-xs font-medium text-text-muted">
            {token.symbol.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{token.symbol}</p>
        <p className="text-xs text-text-muted truncate">
          {formatNumber(Number(token.balanceFormatted))} {token.symbol}
        </p>
      </div>

      {/* USD Value */}
      <div className="text-right shrink-0">
        <p className="text-sm font-medium">{formatUsd(token.usdValue)}</p>
      </div>
    </div>
  )
}
