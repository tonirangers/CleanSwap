import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { formatNumber, formatUsd } from '@/lib/utils'
import type { DustToken } from '@/types'

interface TokenRowProps {
  token: DustToken
  selected: boolean
  onToggle: () => void
  dimmed?: boolean
}

export function TokenRow({ token, selected, onToggle, dimmed }: TokenRowProps) {
  return (
    <button
      onClick={onToggle}
      className={`token-row w-full text-left transition-all duration-150 ${
        dimmed ? 'opacity-20 pointer-events-none' : ''
      } ${!selected ? 'opacity-40' : ''}`}
    >
      {/* Checkbox */}
      <motion.div
        whileTap={{ scale: 0.8 }}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-150 ${
          selected
            ? 'border-violet-accent bg-violet-accent'
            : 'border-white/12 bg-white/[0.02]'
        }`}
      >
        {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </motion.div>

      {/* Token icon */}
      <div className="token-icon">
        {token.logoUrl ? (
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling &&
                ((e.target as HTMLImageElement).parentElement!.innerHTML =
                  `<span class="text-[9px] font-bold text-violet-light/60">${token.symbol.slice(0, 2)}</span>`)
            }}
          />
        ) : (
          <span className="text-[9px] font-bold text-violet-light/60">
            {token.symbol.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">{token.symbol}</p>
        <p className="text-[10px] text-text-muted truncate">
          {formatNumber(Number(token.balanceFormatted))}
        </p>
      </div>

      {/* USD Value */}
      <div className="text-right shrink-0">
        <p className="text-[13px] font-semibold tabular-nums">
          {token.usdValue > 0 ? formatUsd(token.usdValue) : '~'}
        </p>
      </div>
    </button>
  )
}
