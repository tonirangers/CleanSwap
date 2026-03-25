import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 opacity-80 sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-accent to-violet-dark">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-text-secondary">
          CleanSwap
        </span>
      </div>
      <div />
    </header>
  )
}
