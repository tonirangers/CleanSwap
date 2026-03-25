export function Footer() {
  return (
    <footer className="px-6 py-8 text-center text-sm text-text-muted">
      <p>
        CleanSwap &mdash; Sweep your dust tokens in one transaction.
      </p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <a
          href="https://t.me/cleanswap"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-primary"
        >
          Telegram
        </a>
        <a
          href="https://x.com/cleanswap"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-primary"
        >
          X / Twitter
        </a>
        <a
          href="https://github.com/tonirangers/CleanSwap"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-primary"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
