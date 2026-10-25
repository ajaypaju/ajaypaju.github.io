import type { ReactNode } from 'react'
import { profile, sectionById, type SectionId } from '../data/profile'

// Numbered in page order (hero excluded), so adding a section renumbers the rest.
const numbered = profile.sections.filter((s) => s.id !== 'hero').map((s) => s.id)

interface Props {
  id: SectionId
  /** Extra classes for the <section>, e.g. a background. */
  className?: string
  children?: ReactNode
}

export function Section({ id, className = '', children }: Props) {
  const meta = sectionById(id)
  const headingId = `${id}-heading`
  const index = String(numbered.indexOf(id) + 1).padStart(2, '0')
  return (
    // tabIndex -1: navigation (terminal, palette) moves focus here; not in the tab order.
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={-1}
      className={`border-t border-line py-16 outline-none sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">
          <span aria-hidden="true">{index} / </span>
          {id}
        </p>
        <h2 id={headingId} className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {meta.heading}
        </h2>
        {children ?? <p className="mt-4 font-mono text-sm text-muted">// {meta.placeholder}</p>}
      </div>
    </section>
  )
}
