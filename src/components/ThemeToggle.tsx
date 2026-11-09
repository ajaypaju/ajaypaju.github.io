import { profile } from '../data/profile'
import type { Theme } from '../lib/theme'

interface Props {
  theme: Theme
  onToggle: () => void
}

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? '')

export function ThemeToggle({ theme, onToggle }: Props) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-text"
    >
      <span aria-hidden="true" className="text-accent">
        {theme === 'dark' ? '◐' : '◑'}
      </span>
      {theme}
      {/* The visible word starts the accessible name ("dark theme, switch to light"), so voice
          control users can say what they see (WCAG 2.5.3). */}
      <span className="sr-only">{fill(profile.ui.themeToggleHint, { next })}</span>
    </button>
  )
}
