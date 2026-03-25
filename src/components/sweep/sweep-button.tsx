import { motion } from 'motion/react'
import { Loader2, Sparkles, Check } from 'lucide-react'
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

  function handleClick() {
    if (isDone) {
      reset()
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
        return tokens.length === 0 ? 'No dust to sweep' : 'Clean All'
    }
  })()

  const icon = (() => {
    if (isProcessing) return <Loader2 className="h-5 w-5 animate-spin" />
    if (isDone) return <Check className="h-5 w-5" />
    return <Sparkles className="h-5 w-5" />
  })()

  return (
    <motion.button
      whileHover={!disabled && !isProcessing ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isProcessing ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold transition-all ${
        disabled || isProcessing
          ? 'cursor-not-allowed bg-white/5 text-text-dim'
          : isDone
            ? 'bg-success/20 text-success glow-violet'
            : 'bg-violet-accent text-white glow-violet hover:bg-violet-light'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  )
}
