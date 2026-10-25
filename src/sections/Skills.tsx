import { useState, type ReactNode } from 'react'
import { CopyButton } from '../components/CopyButton'
import { Section } from '../components/Section'
import { profile } from '../data/profile'

const { ui } = profile

// skills.json is generated from profile.ts, never typed separately.
const skillsJson = JSON.stringify(
  Object.fromEntries(profile.skills.map((g) => [g.group, g.items])),
  null,
  2,
)

// Minimal JSON highlighting: keys, strings, punctuation.
function highlight(line: string, i: number) {
  const parts: ReactNode[] = []
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|([[\]{},])/g
  let last = 0
  let k = 0
  for (const match of line.matchAll(re)) {
    if (match.index > last) parts.push(line.slice(last, match.index))
    if (match[1]) {
      parts.push(
        <span key={k++} className={match[2] ? 'text-accent-2' : 'text-accent'}>
          {match[1]}
        </span>,
      )
      if (match[2]) parts.push(<span key={k++} className="text-muted">{match[2]}</span>)
    } else {
      parts.push(<span key={k++} className="text-muted">{match[3]}</span>)
    }
    last = match.index + match[0].length
  }
  parts.push(line.slice(last))
  return (
    <div key={i} className="flex">
      <span aria-hidden="true" className="w-8 shrink-0 select-none pr-3 text-right text-muted/50">
        {i + 1}
      </span>
      <span className="whitespace-pre-wrap break-words">{parts}</span>
    </div>
  )
}

type View = 'grid' | 'json'

export function Skills() {
  const [view, setView] = useState<View>('grid')

  return (
    <Section id="skills">
      <div role="group" aria-label={ui.skillsViewLabel} className="mt-8 inline-flex rounded-md border border-line bg-surface p-1">
        {(['grid', 'json'] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
              view === v ? 'bg-accent text-on-accent' : 'text-muted hover:text-text'
            }`}
          >
            {v === 'grid' ? ui.skillsGrid : ui.skillsJson}
          </button>
        ))}
      </div>

      {/* Both views share one grid cell. The grid view sets the height; the JSON view fills the
          same box and scrolls inside it, so toggling never changes the page height. The hidden
          view is inert: out of the tab order and hidden from assistive tech. */}
      <div className="relative mt-6 grid">
        <ul
          inert={view !== 'grid'}
          className={`col-start-1 row-start-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${view === 'grid' ? '' : 'invisible'}`}
        >
          {profile.skills.map((g) => (
            <li key={g.group} className="rounded-lg border border-line bg-surface p-5">
              <h3 className="font-semibold tracking-tight">{g.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((item) => (
                  <li key={item} className="rounded border border-line px-2 py-1 font-mono text-xs text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div
          inert={view !== 'json'}
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-line bg-surface ${
            view === 'json' ? '' : 'invisible'
          }`}
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-2">
            <p className="font-mono text-xs text-text">{ui.skillsFile}</p>
            <CopyButton text={skillsJson} label={`${ui.copy} ${ui.skillsFile}`} className="ml-auto" />
          </div>
          <pre tabIndex={0} aria-label={ui.skillsFile} className="flex-1 overflow-auto py-4 pr-4 font-mono text-[13px] leading-6">
            <code>{skillsJson.split('\n').map(highlight)}</code>
          </pre>
        </div>
      </div>
    </Section>
  )
}
