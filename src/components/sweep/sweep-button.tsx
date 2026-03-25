import { motion } from 'motion/react'
import { Loader2, Sparkles, Check, RotateCcw } from 'lucide-react'
import { useCleanSweep } from '@/hooks/use-clean-sweep'
import type { DustToken, SweepBatch } from '@/types'

interface SweepButtonProps {
  tokens: DustToken[]
  batches: SweepBatch[]
  disabled: boolean
  onSuccess?: () => void
}

export function SweepButton({ tokens, batches, disabled, onSuccess }: SweepButtonProps) {
  const { sweep, status, activeBatch, totalBatches, reset } = useCleanSweep()

  const isProcessing = status === 'approving' || status === 'signing' || status === 'sweeping'
  const isDone = status === 'done'
  const isError = status === 'error'

  function handleClick() {
    if (isDone) {
      reset()
      return
    }
    if (isError) {
      reset()
      sweep(batches, onSuccess)
      return
    }
    sweep(batches, onSuccess)
  }

  const label = (() => {
    switch (status) {
      case 'approving':
        return 'Approving tokens...'
      case 'signing':
        return 'Sign in wallet...'
      case 'sweeping':
        return totalBatches > 1
          ? `Sweeping batch ${activeBatch + 1}/${totalBatches}...`
          : 'Sweeping...'
      case 'done':
        return 'Done! Sweep again?'
      case 'error':
        return 'Retry Clean All'
      default:
        return tokens.length === 0 ? 'No dust to sweep' : `Clean All — ${tokens.length} token${tokens.length !== 1 ? 's' : ''}`
    }
  })()

  const icon = (() => {
    if (isProcessing) return <Loader2 className="h-5 w-5 animate-spin" />
    if (isDone) return <Check className="h-5 w-5" />
    if (isError) return <RotateCcw className="h-5 w-5" />
    return <Sparkles className="h-5 w-5" />
  })()

  return (
    <motion.button
      whileHover={!disabled && !isProcessing ? { scale: 1.015 } : {}}
      whileTap={!disabled && !isProcessing ? { scale: 0.985 } : {}}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`relative flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-lg font-bold transition-all duration-300 ${
        disabled || isProcessing
          ? 'cursor-not-allowed bg-white/[0.04] text-text-dim border border-white/[0.04]'
          : isDone
            ? 'bg-success/15 text-success border border-success/20 glow-success'
            : isError
              ? 'bg-error/15 text-error border border-error/20'
              : 'btn-primary glow-violet'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  )
}
