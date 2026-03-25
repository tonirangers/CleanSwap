import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-accent to-violet-dark">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-text-muted">
          CleanSwap
        </span>
      </div>

      {/* Empty right side — wallet + chain are in the widget */}
      <div />
    </header>
  )
}
