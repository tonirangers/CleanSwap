import { motion } from 'motion/react'
import type { SweepBatch } from '@/types'

interface BatchProgressProps {
  batches: SweepBatch[]
}

export function BatchProgress({ batches }: BatchProgressProps) {
  // Only show when there are multiple batches and at least one is processing
  if (batches.length <= 1) return null

  const hasActivity = batches.some(
    (b) => b.status !== 'pending',
  )
  if (!hasActivity) return null

  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-sm text-text-muted">Batch progress</p>
      <div className="flex gap-2">
        {batches.map((batch) => (
          <motion.div
            key={batch.id}
            className={`h-2 flex-1 rounded-full ${
              batch.status === 'done'
                ? 'bg-success'
                : batch.status === 'error'
                  ? 'bg-error'
                  : batch.status === 'pending'
                    ? 'bg-white/10'
                    : 'bg-violet-accent'
            }`}
            animate={
              batch.status === 'quoting' ||
              batch.status === 'signing' ||
              batch.status === 'executing'
                ? { opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1 }}
          />
        ))}
      </div>
    </div>
  )
}
