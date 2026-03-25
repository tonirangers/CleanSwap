import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function CtaSection() {
  return (
    <section className="px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-lg glass-card p-10 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ready to clean your wallet?
        </h2>
        <p className="mt-3 text-text-muted">
          Connect your wallet and sweep your dust in seconds.
        </p>
        <div className="mt-8 flex justify-center">
          <ConnectButton label="Get Started" />
        </div>
      </motion.div>
    </section>
  )
}
