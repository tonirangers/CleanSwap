import { motion } from 'motion/react'
import { Wallet, Search, Zap } from 'lucide-react'

const steps = [
  {
    icon: Wallet,
    title: 'Connect',
    description: 'Link your wallet in one click. We support all major wallets.',
    step: '01',
  },
  {
    icon: Search,
    title: 'Scan',
    description: 'We auto-detect every dust token sitting in your wallet.',
    step: '02',
  },
  {
    icon: Zap,
    title: 'Sweep',
    description: 'One transaction converts everything to native gas. Done.',
    step: '03',
  },
]

export function HowItWorks() {
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
            How it works
          </h2>
          <p className="mt-3 text-text-muted">
            Three steps. Under 30 seconds.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card group p-7 text-center"
            >
              {/* Step number */}
              <span className="mb-4 inline-block text-xs font-medium tracking-widest text-violet-light/50">
                {step.step}
              </span>

              {/* Icon */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-accent/20 to-violet-accent/5 transition-all duration-300 group-hover:from-violet-accent/30 group-hover:to-violet-accent/10 group-hover:glow-violet-subtle">
                <step.icon className="h-7 w-7 text-violet-light" />
              </div>

              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
