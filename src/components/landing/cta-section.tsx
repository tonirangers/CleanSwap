import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-xl"
      >
        {/* Background glow */}
        <div className="absolute -inset-8 rounded-3xl bg-violet-accent/5 blur-3xl" />

        <div className="glass-card relative p-10 text-center md:p-14">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-accent/30 to-violet-accent/10">
            <Sparkles className="h-7 w-7 text-violet-light" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ready to clean your wallet?
          </h2>
          <p className="mt-4 text-text-muted">
            Connect your wallet and sweep your dust in seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <ConnectButton label="Get Started" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
