import { CopyButton } from '../components/CopyButton'
import { Section } from '../components/Section'
import { profile } from '../data/profile'

const { ui, links, email } = profile
const bare = (href: string) => href.replace(/^https?:\/\//, '')

const btn = 'inline-flex h-11 items-center justify-center rounded-md px-5 font-mono text-sm transition-colors'

export function Contact() {
  const rows = [
    { key: 'email', value: <a href={`mailto:${email}`} className="text-accent-2 hover:underline">{email}</a>, copy: true },
    { key: 'linkedin', value: <External href={links.linkedin.href} /> },
    { key: 'github', value: <External href={links.github.href} /> },
    { key: 'location', value: <span>{profile.location}</span> },
  ]

  return (
    <Section id="contact">
      <div className="mt-10 overflow-hidden rounded-lg border border-line bg-surface">
        <div aria-hidden="true" className="flex gap-1.5 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className="p-4 font-mono text-[13px] leading-7 sm:p-6 sm:text-sm">
          <p>
            <span aria-hidden="true" className="text-muted">$ </span>
            {ui.contactCommand}
          </p>
          {/* Phones: each label above its value (long URLs have no break points). From 640 px: aligned
              columns, with the copy button in a third column. */}
          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6">
            {rows.map((r, i) => (
              <div key={r.key} className="contents">
                <dt className={`text-xs text-muted sm:mt-0 sm:text-sm ${i > 0 ? 'mt-3' : ''}`}>{r.key}</dt>
                <dd className="min-w-0 break-words">{r.value}</dd>
                <dd aria-hidden={!r.copy} className={r.copy ? 'mt-1.5 sm:mt-0' : 'hidden sm:block'}>
                  {r.copy && <CopyButton text={email} label={`${ui.copy} ${email}`} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`mailto:${email}`} className={`${btn} bg-accent text-on-accent hover:opacity-90`}>
          {ui.emailMe}
        </a>
        <a href={profile.cvPath} download className={`${btn} border border-line bg-surface text-text hover:border-accent`}>
          {ui.downloadCv}
        </a>
      </div>
    </Section>
  )
}

function External({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-2 hover:underline">
      {bare(href)}
    </a>
  )
}
