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
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-150 ${
          selected
            ? 'border-violet-accent bg-violet-accent'
            : 'border-white/15 bg-white/[0.02]'
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </motion.div>

      {/* Token icon — 44px */}
      <div className="token-icon">
        {token.logoUrl ? (
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.style.display = 'none'
              if (img.parentElement) {
                img.parentElement.innerHTML =
                  `<span class="text-xs font-bold text-violet-light/60">${token.symbol.slice(0, 3)}</span>`
              }
            }}
          />
        ) : (
          <span className="text-xs font-bold text-violet-light/60">
            {token.symbol.slice(0, 3)}
          </span>
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold truncate leading-tight">{token.symbol}</p>
        <p className="text-xs text-text-muted truncate mt-0.5">
          {formatNumber(Number(token.balanceFormatted))} {token.name !== token.symbol ? token.name : ''}
        </p>
      </div>

      {/* USD Value */}
      <div className="text-right shrink-0">
        <p className="text-[15px] font-semibold tabular-nums">
          {token.usdValue > 0 ? formatUsd(token.usdValue) : '~'}
        </p>
      </div>
    </button>
  )
}
