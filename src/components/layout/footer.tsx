import { ExternalLink } from 'lucide-react'

const links = [
  { href: 'https://t.me/cleanswap', label: 'Telegram' },
  { href: 'https://x.com/Clean_Swap', label: 'X' },
  { href: 'https://github.com/tonirangers/CleanSwap', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="relative z-10 px-6 py-10 text-center">
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-text-muted">
          CleanSwap — Sweep your dust tokens in one transaction.
        </p>
        <div className="mt-4 flex items-center justify-center gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-muted transition-colors duration-200 hover:text-violet-light"
            >
              <ExternalLink className="h-3 w-3" />
              {link.label}
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-dim">
          Powered by Odos &middot; Non-custodial &middot; Open source
        </p>
      </div>
    </footer>
  )
}
