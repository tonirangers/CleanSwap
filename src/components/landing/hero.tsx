import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-text-muted"
        >
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Live on BNB Chain &amp; Base
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-accent glow-violet"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          One transaction.
          <br />
          <span className="text-violet-light">Not ten.</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-md text-lg text-text-muted md:text-xl">
          Convert all your dust tokens to native gas in a single sweep.
          No hassle, no wasted fees.
        </p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <ConnectButton label="Connect Wallet to Start" />
        </motion.div>
      </motion.div>
    </section>
  )
}
