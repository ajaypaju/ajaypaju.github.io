import { useState } from 'react'
import { CopyButton } from '../components/CopyButton'
import { Section } from '../components/Section'
import { profile } from '../data/profile'
import { skillsJson } from '../lib/files'
import { HighlightedCode } from '../lib/highlight'

const { ui } = profile

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
            <code>
              <HighlightedCode code={skillsJson} numbered />
            </code>
          </pre>
        </div>
      </div>
    </Section>
  )
}
