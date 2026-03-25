import { motion } from 'motion/react'
import { Wallet, Search, Zap } from 'lucide-react'

const steps = [
  {
    icon: Wallet,
    title: 'Connect',
    description: 'Link your wallet in one click.',
  },
  {
    icon: Search,
    title: 'Scan',
    description: 'We auto-detect all your dust tokens.',
  },
  {
    icon: Zap,
    title: 'Sweep',
    description: 'One transaction converts everything to gas.',
  },
]

export function HowItWorks() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
          How it works
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="glass-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-accent/20">
                <step.icon className="h-6 w-6 text-violet-light" />
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
