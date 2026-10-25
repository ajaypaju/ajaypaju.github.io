import { useCallback, useState } from 'react'
import { FlowMap } from '../components/FlowMap'
import { Section } from '../components/Section'
import { profile, type ArchNodeId } from '../data/profile'
import type { ArchView } from '../lib/archLayout'
import { useMediaQuery } from '../lib/media'
import { usePrefersReducedMotion } from '../lib/motion'

const content = profile.architecture
const PANEL_ID = 'arch-details'
const VIEWS: ArchView[] = ['request', 'deploy']

export function Architecture() {
  const reducedMotion = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)')
  const [view, setView] = useState<ArchView>('request')
  const [selected, setSelected] = useState<ArchNodeId | null>(null)
  const [preview, setPreview] = useState<ArchNodeId | null>(null)
  const [tracing, setTracing] = useState(false)
  const endTrace = useCallback(() => setTracing(false), [])

  // Hover or focus previews a node; a click or tap pins it.
  const shown = preview ?? selected
  const node = shown ? content.nodes[shown] : null

  const switchView = (next: ArchView) => {
    setView(next)
    setSelected(null)
    setPreview(null)
    setTracing(false)
  }

  return (
    <Section id="architecture">
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{content.intro}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div role="group" aria-label={content.ui.viewsLabel} className="inline-flex rounded-md border border-line bg-surface p-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => switchView(v)}
              className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                view === v ? 'bg-accent text-on-accent' : 'text-muted hover:text-text'
              }`}
            >
              {content.views[v]}
            </button>
          ))}
        </div>
        {/* Kept in layout for the deploy view (invisible), so toggling never shifts the row. */}
        <button
          type="button"
          onClick={() => setTracing(true)}
          disabled={tracing || view !== 'request'}
          aria-hidden={view !== 'request'}
          className={`inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 font-mono text-xs text-text transition-colors hover:border-accent disabled:cursor-default disabled:hover:border-line ${
            view === 'request' ? '' : 'invisible'
          }`}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-2" />
          {tracing ? content.ui.tracing : content.ui.trace}
        </button>
      </div>

      {/* The map takes the full content width; the details panel sits below it at every size. */}
      <div className="mt-6 grid gap-4">
        <div className="rounded-lg border border-line bg-surface/40 p-3 sm:p-5">
          <FlowMap
            view={view}
            wide={wide}
            reducedMotion={reducedMotion}
            selected={selected}
            onPreview={setPreview}
            onSelect={(id) => setSelected((s) => (s === id ? null : id))}
            tracing={tracing}
            onTraceDone={endTrace}
            panelId={PANEL_ID}
          />
        </div>

        {/* min-height = the tallest detail at each breakpoint (measured: 126 px below 640 px, 104 px
            above), so hovering nodes never shifts the page and there's no spare space. */}
        <aside
          id={PANEL_ID}
          aria-label={content.ui.detailsLabel}
          className="min-h-[126px] rounded-lg border border-line bg-surface p-4 sm:min-h-[104px]"
        >
          {node ? (
            <>
              <p className="font-mono text-xs text-accent-2">{node.label}</p>
              {node.sub && <p className="mt-0.5 font-mono text-[11px] text-muted">{node.sub}</p>}
              <p className="mt-3 text-sm leading-relaxed">{node.detail}</p>
            </>
          ) : (
            <p className="font-mono text-xs leading-relaxed text-muted">// {content.ui.prompt}</p>
          )}
        </aside>
      </div>

      <div className="sr-only">
        <ol aria-label={content.views.request}>
          {content.srRequest.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ol aria-label={content.views.deploy}>
          {content.srDeploy.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
