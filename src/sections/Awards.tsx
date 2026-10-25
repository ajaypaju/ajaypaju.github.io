import { Section } from '../components/Section'
import { profile } from '../data/profile'

function Trophy() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M8 6H5v1.5A3.5 3.5 0 0 0 8.5 11M16 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M12 13v4M9 20h6M10 17h4" />
    </svg>
  )
}

function Cap() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v5" />
    </svg>
  )
}

export function Awards() {
  return (
    <Section id="awards">
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {profile.awards.map((a) => (
          <li
            key={a.title}
            className={`rounded-lg border p-5 ${
              a.highlight ? 'border-accent/50 bg-accent/5 shadow-[0_0_24px_-12px_var(--color-accent)]' : 'border-line bg-surface'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={a.highlight ? 'text-accent' : 'text-accent-2'}>
                <Trophy />
              </span>
              {a.year && <span className="font-mono text-xs text-muted">{a.year}</span>}
            </div>
            <h3 className="mt-4 font-semibold leading-snug tracking-tight">{a.title}</h3>
            {a.note && <p className="mt-1 text-sm text-muted">{a.note}</p>}
          </li>
        ))}
      </ul>

      <ul className="mt-4">
        {profile.education.map((e) => (
          <li key={e.degree} className="flex items-start gap-4 rounded-lg border border-line bg-surface p-5">
            <span className="mt-0.5 text-accent-2">
              <Cap />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold tracking-tight">{e.degree}</h3>
              <p className="mt-1 text-sm text-muted">{e.institution}</p>
            </div>
            <span className="font-mono text-xs text-muted">{e.year}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
