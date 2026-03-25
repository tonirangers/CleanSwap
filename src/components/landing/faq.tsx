import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What are "dust tokens"?',
    answer:
      'Dust tokens are small amounts of cryptocurrency sitting in your wallet — often worth less than $200. They\'re too small to swap individually because gas fees would eat up most of their value.',
  },
  {
    question: 'How does CleanSwap save me money?',
    answer:
      'Instead of executing separate transactions for each token (paying gas each time), CleanSwap batches multiple swaps into a single transaction. This can save up to 70% on gas fees compared to swapping tokens one by one.',
  },
  {
    question: 'What do I receive?',
    answer:
      'You receive the native gas token of the blockchain you\'re on — BNB on BNB Chain, ETH on Base, and so on. This gas token is immediately usable for your next DeFi transactions.',
  },
  {
    question: 'Are there any fees?',
    answer:
      'CleanSwap charges no visible platform fee. We earn a small referral fee from Odos (the DEX aggregator) on each swap — this is built into the routing and doesn\'t cost you anything extra.',
  },
  {
    question: 'Which chains are supported?',
    answer:
      'Currently BNB Chain and Base are live. We have 11 chains configured including Ethereum, Arbitrum, Polygon, Avalanche, Optimism, and more — rolling out progressively.',
  },
  {
    question: 'Is it safe?',
    answer:
      'CleanSwap never holds your funds. All swaps are executed directly through Odos smart contracts on-chain. You approve and sign every transaction in your own wallet.',
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">FAQ</h2>
          <p className="mt-3 text-text-muted">Common questions, quick answers.</p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="pr-4 text-sm font-medium leading-relaxed">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
