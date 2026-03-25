import { formatNumber, formatUsd } from '@/lib/utils'
import type { DustToken } from '@/types'

interface TokenRowProps {
  token: DustToken
  dimmed?: boolean
}

export function TokenRow({ token, dimmed }: TokenRowProps) {
  return (
    <div
      className={`token-row ${
        dimmed ? 'opacity-30' : ''
      }`}
    >
      {/* Token icon */}
      <div className="token-icon">
        {token.logoUrl ? (
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <span className={`text-xs font-semibold text-violet-light ${token.logoUrl ? 'hidden' : ''}`}>
          {token.symbol.slice(0, 2)}
        </span>
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{token.symbol}</p>
        <p className="text-xs text-text-muted truncate">
          {formatNumber(Number(token.balanceFormatted))} {token.symbol}
        </p>
      </div>

      {/* USD Value */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums">{formatUsd(token.usdValue)}</p>
        {!dimmed && token.isOdosSupported && (
          <p className="text-[10px] text-success/70">Sweepable</p>
        )}
        {!dimmed && !token.isOdosSupported && (
          <p className="text-[10px] text-text-dim">Unsupported</p>
        )}
      </div>
    </div>
  )
}
