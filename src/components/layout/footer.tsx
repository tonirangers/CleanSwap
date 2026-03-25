export function Footer() {
  return (
    <footer className="relative z-10 px-6 py-6 text-center">
      <div className="flex items-center justify-center gap-4 text-[11px] text-text-dim">
        <a
          href="https://x.com/Clean_Swap"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-muted"
        >
          X
        </a>
        <span className="opacity-30">&middot;</span>
        <a
          href="https://t.me/cleanswap"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-text-muted"
        >
          Telegram
        </a>
        <span className="opacity-30">&middot;</span>
        <span>Powered by Odos</span>
      </div>
    </footer>
  )
}
