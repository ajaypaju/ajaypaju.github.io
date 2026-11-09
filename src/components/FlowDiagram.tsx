import { Fragment, type ReactNode } from 'react'
import type { FlowIcon, FlowStep } from '../data/profile'
import { packetProgress, stepStatus, type StepStatus, type Timeline } from '../lib/promptTimeline'

// Vertical pipeline: an edge leads into each node, and a cyan packet travels it when the step runs.
// Decorative (aria-hidden); the section provides a visually hidden list of the same steps.

const EDGE_H = 32
const AXIS_X = 29 // centre of the node icon: 1 px border + 8 px padding + 20 px

const ICONS: Record<FlowIcon, ReactNode> = {
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M12.5 15H17" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 4v4M9.5 13h.01M14.5 13h.01M9.5 16h5" />
    </>
  ),
}

function Icon({ name }: { name: FlowIcon }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}

function Edge({ progress, status, first }: { progress: number; status: StepStatus; first: boolean }) {
  const y = progress * EDGE_H
  const travelling = status === 'active' && progress > 0 && progress < 1
  return (
    <svg width={AXIS_X * 2} height={EDGE_H} className="block overflow-visible">
      {first && <circle cx={AXIS_X} cy={2} r={2.5} className="fill-muted" />}
      <line x1={AXIS_X} y1={first ? 5 : 0} x2={AXIS_X} y2={EDGE_H} className="stroke-line" strokeWidth={2} />
      {progress > 0 && (
        <line x1={AXIS_X} y1={first ? 5 : 0} x2={AXIS_X} y2={Math.max(y, first ? 5 : 0)} className="stroke-accent-2" strokeWidth={2} />
      )}
      {travelling && (
        <circle cx={AXIS_X} cy={y} r={4} className="fill-accent-2" style={{ filter: 'drop-shadow(0 0 6px var(--accent-2))' }} />
      )}
    </svg>
  )
}

const CARD: Record<StepStatus, string> = {
  // Upcoming steps are quieter through color, not opacity: dimming the whole card dropped its text
  // below 4.5:1. Muted text on the surface stays above it in both themes.
  upcoming: 'border-dashed border-line',
  active: 'border-accent shadow-[0_0_28px_-6px_var(--color-accent)]',
  done: 'border-line',
}

interface Props {
  steps: FlowStep[]
  timeline: Timeline
  t: number
}

export function FlowDiagram({ steps, timeline, t }: Props) {
  return (
    <div aria-hidden="true">
      {steps.map((step, i) => {
        const timing = timeline.steps[i]
        const status = stepStatus(timing, t, timeline.total)
        return (
          <Fragment key={step.node}>
            <Edge progress={packetProgress(timing, t)} status={status} first={i === 0} />
            <div
              className={`flex items-center gap-3 rounded-lg border bg-surface px-2 py-2.5 transition-[border-color,box-shadow,opacity] duration-300 motion-reduce:transition-none ${CARD[status]}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line transition-colors duration-300 ${
                  status === 'upcoming' ? 'text-muted' : 'text-accent'
                }`}
              >
                <Icon name={step.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className={`font-mono text-[11px] ${status === 'upcoming' ? 'text-muted' : 'text-accent-2'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold ${status === 'upcoming' ? 'text-muted' : ''}`}>{step.node}</span>
                </p>
                <p className="text-sm text-muted">{step.caption}</p>
              </div>
              <svg
                viewBox="0 0 24 24"
                className={`mr-2 h-4 w-4 shrink-0 text-accent transition-opacity duration-300 ${status === 'done' ? 'opacity-100' : 'opacity-0'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
