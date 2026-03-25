import { motion } from 'motion/react'
import { Layers, Route, ShieldCheck, Globe } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Batch Swap',
    description:
      'Multiple tokens converted in a single transaction. Save up to 70% on gas fees.',
  },
  {
    icon: Route,
    title: 'Smart Routing',
    description:
      'Powered by Odos AlgoAssistant. Best prices across all DEXs, automatically.',
  },
  {
    icon: ShieldCheck,
    title: 'No Hidden Fees',
    description:
      'Zero platform fees visible to you. We earn from aggregator referrals only.',
  },
  {
    icon: Globe,
    title: 'Multi-Chain',
    description:
      '11 chains configured. BNB Chain and Base live today, more coming soon.',
  },
]

export function Features() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
          Built for DeFi users
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-accent/20">
                <feature.icon className="h-5 w-5 text-violet-light" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
