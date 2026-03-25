import { motion } from 'motion/react'
import { chainConfigs, SUPPORTED_CHAINS } from '@/config/chains'

export function ChainsSupported() {
  const chains = Object.values(chainConfigs)

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
          Multi-chain support
        </h2>
        <p className="mb-10 text-text-muted">
          11 chains configured. More going live soon.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {chains.map((chain, i) => {
            const isLive = SUPPORTED_CHAINS.includes(chain.id)
            return (
              <motion.div
                key={chain.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  isLive ? 'border-violet-accent/30' : 'opacity-50'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLive ? 'bg-success' : 'bg-text-dim'
                  }`}
                />
                {chain.name}
                {isLive && (
                  <span className="text-xs text-violet-light">Live</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
