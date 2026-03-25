import { motion } from 'motion/react'
import { chainConfigs, SUPPORTED_CHAINS } from '@/config/chains'

export function ChainsSupported() {
  const chains = Object.values(chainConfigs)

  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Multi-chain support
          </h2>
          <p className="mb-12 text-text-muted">
            11 chains configured. More going live soon.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {chains.map((chain, i) => {
            const isLive = SUPPORTED_CHAINS.includes(chain.id)
            return (
              <motion.div
                key={chain.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                whileHover={isLive ? { scale: 1.05, transition: { duration: 0.15 } } : {}}
                className={`glass glass-hover inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium ${
                  isLive
                    ? 'border-violet-accent/20 text-text-primary'
                    : 'opacity-40 text-text-muted'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLive ? 'bg-success pulse-ring' : 'bg-text-dim'
                  }`}
                />
                {chain.name}
                {isLive && (
                  <span className="rounded-full bg-violet-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-light">
                    Live
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
