import { motion } from 'motion/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles, ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 lg:py-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-text-secondary"
        >
          <span className="h-2 w-2 rounded-full bg-success pulse-ring" />
          Live on BNB Chain &amp; Base
        </motion.div>

        {/* Icon with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mb-8"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-accent to-violet-dark glow-violet">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          {/* Floating particles effect */}
          <div className="absolute -inset-4 rounded-full bg-violet-accent/10 blur-2xl" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
        >
          One transaction.
          <br />
          <span className="text-gradient">Not ten.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary md:text-xl"
        >
          Convert all your dust tokens to native gas in a single sweep.
          <br className="hidden md:block" />
          No hassle, no wasted fees.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10"
        >
          <ConnectButton label="Connect Wallet to Start" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4, y: [0, 8, 0] }}
          transition={{ delay: 1.5, y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
          className="mt-16"
        >
          <ArrowDown className="h-5 w-5 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  )
}
