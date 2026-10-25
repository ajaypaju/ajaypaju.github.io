import { m } from 'framer-motion'
import { Section } from '../components/Section'
import { profile, type Role } from '../data/profile'
import { duration } from '../lib/dates'
import { usePrefersReducedMotion } from '../lib/motion'

const tag = 'rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted'

function RoleEntry({ role, current, reducedMotion }: { role: Role; current: boolean; reducedMotion: boolean }) {
  return (
    <m.li
      className="relative pl-8"
      // Short fade and slide as the role scrolls in; transform + opacity only, so no layout shift.
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Dot on the timeline line; the current role's dot pulses (static under reduced motion). */}
      <span aria-hidden="true" className="absolute -left-[5px] top-2 flex h-2.5 w-2.5">
        {current && <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${current ? 'bg-accent' : 'border border-muted bg-bg'}`} />
      </span>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="text-lg font-semibold tracking-tight">{role.title}</h4>
        {current && (
          <span className="rounded-full border border-accent/50 px-2 py-0.5 font-mono text-[11px] text-accent">
            {profile.ui.currentRole}
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-xs text-muted">
        {role.start} – {role.end} · {duration(role.start, role.end)}
      </p>

      <ul className="mt-4 space-y-2.5">
        {role.highlights.map((h) => (
          <li key={h} className="flex gap-3 leading-relaxed text-muted">
            <span aria-hidden="true" className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-accent-2" />
            {/* ~72 characters per line on desktop. */}
            <span className="max-w-[72ch]">{h}</span>
          </li>
        ))}
      </ul>
      <ul aria-label={`${role.title} tech`} className="mt-4 flex flex-wrap gap-1.5">
        {role.tags.map((t) => (
          <li key={t} className={tag}>
            {t}
          </li>
        ))}
      </ul>
    </m.li>
  )
}

export function Experience() {
  const reducedMotion = usePrefersReducedMotion()
  return (
    <Section id="experience">
      {profile.experience.map((company) => {
        const first = company.roles[company.roles.length - 1]
        const latest = company.roles[0]
        return (
          <div key={company.name} className="mt-10">
            <h3 className="font-semibold">
              {company.name} <span className="font-normal text-muted">· {company.location}</span>
            </h3>
            <p className="mt-1 font-mono text-xs text-muted">
              {first.start} – {latest.end} · {duration(first.start, latest.end)}
            </p>

            <ol className="relative mt-8 ml-1 space-y-10 border-l border-line">
              {company.roles.map((role, i) => (
                <RoleEntryWithMarker
                  key={role.title}
                  role={role}
                  index={i}
                  promotion={i === 1 ? company.promotion : undefined}
                  reducedMotion={reducedMotion}
                />
              ))}
            </ol>
          </div>
        )
      })}
    </Section>
  )
}

/** A role, preceded by the promotion marker when it is the role that was promoted from. */
function RoleEntryWithMarker({
  role,
  index,
  promotion,
  reducedMotion,
}: {
  role: Role
  index: number
  promotion?: string
  reducedMotion: boolean
}) {
  return (
    <>
      {promotion && (
        <li className="relative pl-8">
          <span aria-hidden="true" className="absolute -left-[7px] top-1/2 -translate-y-1/2 bg-bg font-mono text-xs leading-none text-accent">
            ↑
          </span>
          <p className="inline-block rounded-md border border-accent/40 bg-accent/5 px-2.5 py-1 font-mono text-xs text-accent">
            {promotion}
          </p>
        </li>
      )}
      <RoleEntry role={role} current={index === 0 && role.end === 'Present'} reducedMotion={reducedMotion} />
    </>
  )
}
