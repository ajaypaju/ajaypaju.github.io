import { profile } from '../data/profile'
import { useCopy } from '../lib/clipboard'

interface Props {
  text: string
  /** Accessible name, e.g. "Copy email address". */
  label: string
  className?: string
}

/** Copies `text`; the visible label switches to "Copied" and a polite status announces it. */
export function CopyButton({ text, label, className = '' }: Props) {
  const { copy, status } = useCopy()
  const { ui } = profile
  const shown = status === 'copied' ? ui.copied : status === 'failed' ? ui.copyFailed : ui.copy
  return (
    <>
      <button
        type="button"
        onClick={() => copy(text)}
        aria-label={label}
        className={`inline-flex min-w-[5rem] items-center justify-center rounded border px-2 py-1 font-mono text-xs transition-colors ${
          status === 'copied' ? 'border-accent text-accent' : 'border-line text-muted hover:border-accent hover:text-text'
        } ${className}`}
      >
        [{shown}]
      </button>
      <span role="status" className="sr-only">
        {status === 'copied' ? ui.copied : status === 'failed' ? ui.copyFailed : ''}
      </span>
    </>
  )
}
