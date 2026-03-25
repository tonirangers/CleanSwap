import { motion } from 'motion/react'
import { Layers, Route, ShieldCheck, Globe } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Batch Swap',
    description:
      'Multiple tokens converted in a single transaction. Save up to 70% on gas fees.',
    accent: 'from-violet-accent/20 to-indigo-500/10',
  },
  {
    icon: Route,
    title: 'Smart Routing',
    description:
      'Powered by Odos. Best prices across all DEXs, automatically optimized.',
    accent: 'from-blue-500/20 to-violet-accent/10',
  },
  {
    icon: ShieldCheck,
    title: 'No Hidden Fees',
    description:
      'Zero platform fees. We earn from aggregator referrals only — costs you nothing extra.',
    accent: 'from-emerald-500/20 to-violet-accent/10',
  },
  {
    icon: Globe,
    title: 'Multi-Chain',
    description:
      '11 chains configured. BNB Chain and Base live today, more rolling out soon.',
    accent: 'from-amber-500/20 to-violet-accent/10',
  },
]

export function Features() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for DeFi users
          </h2>
          <p className="mt-3 text-text-muted">
            Everything you need. Nothing you don't.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card group p-7"
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} transition-all duration-300`}>
                <feature.icon className="h-6 w-6 text-violet-light" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
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
