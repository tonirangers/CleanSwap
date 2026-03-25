import { motion } from 'motion/react'
import type { SweepBatch } from '@/types'

interface BatchProgressProps {
  batches: SweepBatch[]
}

export function BatchProgress({ batches }: BatchProgressProps) {
  if (batches.length <= 1) return null

  const hasActivity = batches.some((b) => b.status !== 'pending')
  if (!hasActivity) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="glass-card p-5"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
        Batch progress
      </p>
      <div className="flex gap-2">
        {batches.map((batch) => {
          const isActive = ['quoting', 'signing', 'executing'].includes(batch.status)
          return (
            <motion.div
              key={batch.id}
              className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
                batch.status === 'done'
                  ? 'bg-success'
                  : batch.status === 'error'
                    ? 'bg-error'
                    : batch.status === 'pending'
                      ? 'bg-white/[0.06]'
                      : 'bg-violet-accent'
              }`}
              animate={isActive ? { opacity: [1, 0.4, 1] } : {}}
              transition={isActive ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : {}}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-dim">
        {batches.map((batch) => (
          <span key={batch.id}>
            {batch.status === 'done' ? 'Done' : batch.status === 'error' ? 'Failed' : batch.status === 'pending' ? 'Pending' : 'Processing...'}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
