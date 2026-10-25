import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { profile, type ArchNodeId } from '../data/profile'
import {
  along,
  clipEdge,
  DATA_NODES,
  DEPLOY_ROUTE,
  LAYOUTS,
  REQUEST_ROUTE,
  type ArchView,
  type Box,
  type Pt,
} from '../lib/archLayout'

const { nodes: NODES, hops: HOPS } = profile.architecture

// Timing (ms)
const SPAWN_EVERY = 2000 // ambient traffic: about one request every 2 s
const FORWARD = 1400
const RETURN = 1100
const TRACE_HOP = 900 // "Trace a request": one slow, highlighted request
const TRACE_HOLD = 450
const TRACE_RETURN = 1600
const TRACE_END = 1600
const DEPLOY_STAGE = 700
const DEPLOY_REST = 1500
const FLASH = 450
const REDUCED_TRACE = 5000 // reduced motion: the traced route and labels show statically this long
const POOL = 3

const TRACE_DATA: ArchNodeId = 'redis'
const TRACE_LABELS = [HOPS.edge, HOPS.web, HOPS.app, HOPS.data]

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

interface Hop {
  id: ArchNodeId
  text: string
}

/** One step of a scripted packet run: where the packet is during it, and what happens at its end. */
interface Phase {
  dur: number
  pos?: (p: number) => Pt
  color?: 'cyan' | 'mint'
  onEnd?: () => void
}

interface Props {
  view: ArchView
  wide: boolean
  reducedMotion: boolean
  selected: ArchNodeId | null
  onPreview: (id: ArchNodeId | null) => void
  onSelect: (id: ArchNodeId) => void
  tracing: boolean
  onTraceDone: () => void
  /** Id of the details panel the node buttons control. */
  panelId: string
}

export function FlowMap({ view, wide, reducedMotion, selected, onPreview, onSelect, tracing, onTraceDone, panelId }: Props) {
  const layout = LAYOUTS[view][wide ? 'wide' : 'narrow']
  const ids = Object.keys(layout.nodes) as ArchNodeId[]
  const nodeBox = (id: ArchNodeId) => layout.nodes[id] as Box

  const rootRef = useRef<HTMLDivElement>(null)
  const buttons = useRef<Partial<Record<ArchNodeId, HTMLButtonElement | null>>>({})
  const packets = useRef<(SVGGElement | null)[]>([])
  const [inView, setInView] = useState(false)
  const [hops, setHops] = useState<Hop[]>([])

  const traceIds = [...REQUEST_ROUTE, TRACE_DATA]
  const tracingHere = tracing && view === 'request'
  // The traced route, and under reduced motion every hop label at once, derive from `tracing`.
  const routeTo = (data: ArchNodeId): Pt[] => [
    ...REQUEST_ROUTE.map((id) => nodeBox(id)),
    ...(layout.via[data] ?? []),
    nodeBox(data),
  ]
  const traceRoute = tracingHere ? routeTo(TRACE_DATA) : null
  const shownHops: Hop[] =
    reducedMotion && tracingHere
      ? [...traceIds.slice(1).map((id, i) => ({ id, text: TRACE_LABELS[i] })), { id: 'client', text: HOPS.response }]
      : hops

  // Pause everything while the map is off-screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The animation engine. Packets are a small pool of SVG groups moved imperatively (transform +
  // opacity), so React never re-renders per frame; node highlights toggle data attributes that
  // fade a pre-drawn glow in and out (opacity only). Hop labels are React state, set at hop events.
  useEffect(() => {
    const L = LAYOUTS[view][wide ? 'wide' : 'narrow']
    const center = (id: ArchNodeId): Pt => {
      const b = L.nodes[id] as Box
      return { x: b.x, y: b.y }
    }
    const timers: number[] = []
    const flash = (id: ArchNodeId) => {
      const btn = buttons.current[id]
      if (!btn) return
      btn.dataset.hit = ''
      timers.push(window.setTimeout(() => delete btn.dataset.hit, FLASH))
    }
    const setDone = (id: ArchNodeId, done: boolean) => {
      const btn = buttons.current[id]
      if (!btn) return
      if (done) btn.dataset.done = ''
      else delete btn.dataset.done
    }
    const place = (slot: number, pt: Pt | null, color: 'cyan' | 'mint' = 'cyan') => {
      const g = packets.current[slot]
      if (!g) return
      if (!pt) {
        g.style.opacity = '0'
        return
      }
      g.style.opacity = '1'
      g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
      ;(g.children[0] as SVGGElement).style.opacity = color === 'cyan' ? '1' : '0'
      ;(g.children[1] as SVGGElement).style.opacity = color === 'mint' ? '1' : '0'
    }
    const hideAll = () => packets.current.forEach((_, i) => place(i, null))
    const cleanup = () => {
      timers.forEach(clearTimeout)
      hideAll()
      ;(Object.keys(L.nodes) as ArchNodeId[]).forEach((id) => {
        const btn = buttons.current[id]
        if (btn) {
          delete btn.dataset.hit
          delete btn.dataset.done
        }
      })
    }

    // Reduced motion: no packets. Tracing shows the route and every hop label at once (derived in
    // render), statically, for a while.
    if (reducedMotion) {
      hideAll()
      if (view === 'request' && tracing) timers.push(window.setTimeout(onTraceDone, REDUCED_TRACE))
      return cleanup
    }
    if (!inView) {
      hideAll()
      return cleanup
    }

    let raf = 0

    // Scripted runs (trace, deploy): phases played in order, optionally looping.
    const runPhases = (phases: Phase[], loop: boolean, onFinish?: () => void) => {
      let index = 0
      let phaseStart = performance.now()
      const frame = (now: number) => {
        let phase = phases[index]
        while (now - phaseStart >= phase.dur) {
          phase.onEnd?.()
          phaseStart += phase.dur
          index++
          if (index >= phases.length) {
            if (!loop) {
              place(0, null)
              onFinish?.()
              return
            }
            index = 0
          }
          phase = phases[index]
        }
        const p = (now - phaseStart) / phase.dur
        place(0, phase.pos ? phase.pos(p) : null, phase.color)
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    if (view === 'deploy') {
      const pts = DEPLOY_ROUTE.map(center)
      const phases: Phase[] = [
        {
          dur: DEPLOY_STAGE / 2,
          pos: () => pts[0],
          onEnd: () => {
            flash(DEPLOY_ROUTE[0])
            setDone(DEPLOY_ROUTE[0], true)
          },
        },
        ...DEPLOY_ROUTE.slice(1).map(
          (id, i): Phase => ({
            dur: DEPLOY_STAGE,
            pos: (p) => along([pts[i], pts[i + 1]], easeInOut(p)),
            color: 'cyan',
            onEnd: () => {
              flash(id)
              setDone(id, true)
            },
          }),
        ),
        { dur: DEPLOY_REST, onEnd: () => DEPLOY_ROUTE.forEach((id) => setDone(id, false)) },
      ]
      runPhases(phases, true)
    } else if (tracing) {
      const route = [...REQUEST_ROUTE, TRACE_DATA]
      const traceRoutePts = route.map(center)
      // Waypoints (the narrow layout's trunk) belong to the last hop, app servers → data node.
      const via = L.via[TRACE_DATA] ?? []
      const forward: Phase[] = route.slice(1).flatMap((id, i): Phase[] => [
        {
          dur: TRACE_HOP,
          pos: (p) =>
            along(
              i === route.length - 2 ? [traceRoutePts[i], ...via, traceRoutePts[i + 1]] : [traceRoutePts[i], traceRoutePts[i + 1]],
              easeInOut(p),
            ),
          color: 'cyan',
          onEnd: () => {
            flash(id)
            setHops((h) => [...h, { id, text: TRACE_LABELS[i] }])
          },
        },
        { dur: TRACE_HOLD, pos: () => traceRoutePts[i + 1], color: 'cyan' },
      ])
      const back = [...traceRoutePts.slice(0, -1), ...via, traceRoutePts[traceRoutePts.length - 1]].reverse()
      runPhases(
        [
          ...forward,
          {
            dur: TRACE_RETURN,
            pos: (p) => along(back, easeInOut(p)),
            color: 'mint',
            onEnd: () => {
              flash('client')
              setHops((h) => [...h, { id: 'client', text: HOPS.response }])
            },
          },
          { dur: TRACE_END },
        ],
        false,
        () => {
          setHops([])
          onTraceDone()
        },
      )
    } else {
      // Ambient traffic: calm, continuous; each request hits a different data node.
      const slots: ({ start: number; path: Pt[]; data: ArchNodeId; hit: boolean } | null)[] = Array(POOL).fill(null)
      let lastSpawn = -Infinity
      let lastData: ArchNodeId | null = null
      const frame = (now: number) => {
        if (now - lastSpawn >= SPAWN_EVERY) {
          const free = slots.findIndex((s) => !s)
          if (free >= 0) {
            const choices = DATA_NODES.filter((d) => d !== lastData)
            const data = choices[Math.floor(Math.random() * choices.length)]
            lastData = data
            slots[free] = { start: now, data, hit: false, path: [...REQUEST_ROUTE.map(center), ...(L.via[data] ?? []), center(data)] }
            lastSpawn = now
          }
        }
        slots.forEach((s, i) => {
          if (!s) return
          const t = now - s.start
          if (t < FORWARD) place(i, along(s.path, easeInOut(t / FORWARD)), 'cyan')
          else if (t < FORWARD + RETURN) {
            if (!s.hit) {
              s.hit = true
              flash(s.data)
            }
            place(i, along(s.path, 1 - easeInOut((t - FORWARD) / RETURN)), 'mint')
          } else {
            slots[i] = null
            place(i, null)
          }
        })
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      cleanup()
      setHops([])
    }
  }, [view, wide, reducedMotion, inView, tracing, onTraceDone])

  const pct = (v: number, of: number) => `${(v / of) * 100}%`

  return (
    <div ref={rootRef} className="relative w-full" style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 1 L9 5 L0 9 z" className="fill-muted" />
          </marker>
        </defs>

        {layout.edges.map(([a, b]) => {
          const [s, e] = clipEdge(nodeBox(a), nodeBox(b))
          return (
            <line
              key={`${a}-${b}`}
              x1={s.x}
              y1={s.y}
              x2={e.x}
              y2={e.y}
              className="stroke-line"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              markerEnd="url(#arch-arrow)"
            />
          )
        })}
        {layout.paths.map((path, i) => (
          <polyline
            key={i}
            points={path.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            className="stroke-line"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            markerEnd={path.arrow ? 'url(#arch-arrow)' : undefined}
          />
        ))}
        {layout.taps.map((tap) => (
          <line
            key={tap.x}
            x1={tap.x}
            y1={tap.y1}
            x2={tap.x}
            y2={tap.y2}
            className="stroke-line"
            strokeWidth={1.5}
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* The traced route, highlighted while "Trace a request" runs. */}
        <polyline
          points={(traceRoute ?? []).map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          className="stroke-accent-2 transition-opacity duration-300"
          strokeWidth={2.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: traceRoute ? 0.7 : 0 }}
        />

        {/* Packet pool: cyan on the way in, mint on the way back. */}
        {Array.from({ length: POOL }, (_, i) => (
          <g
            key={i}
            ref={(el) => {
              packets.current[i] = el
            }}
            style={{ opacity: 0 }}
          >
            <g>
              <circle r={10} className="fill-accent-2" opacity={0.18} />
              <circle r={4.5} className="fill-accent-2" />
            </g>
            <g style={{ opacity: 0 }}>
              <circle r={10} className="fill-accent" opacity={0.18} />
              <circle r={4.5} className="fill-accent" />
            </g>
          </g>
        ))}
      </svg>

      {ids.map((id) => {
        const b = nodeBox(id)
        const node = NODES[id]
        const isSelected = selected === id
        return (
          <button
            key={id}
            type="button"
            ref={(el) => {
              buttons.current[id] = el
            }}
            aria-pressed={isSelected}
            aria-controls={panelId}
            aria-describedby={`arch-desc-${id}`}
            onClick={() => onSelect(id)}
            onMouseEnter={() => onPreview(id)}
            onMouseLeave={() => onPreview(null)}
            onFocus={() => onPreview(id)}
            onBlur={() => onPreview(null)}
            className={`group absolute flex flex-col items-center justify-center rounded-md border bg-surface px-1.5 text-center leading-tight transition-colors ${
              isSelected ? 'border-accent' : 'border-line hover:border-accent/60'
            }`}
            style={{
              left: pct(b.x - b.w / 2, layout.width),
              top: pct(b.y - b.h / 2, layout.height),
              width: pct(b.w, layout.width),
              height: pct(b.h, layout.height),
            }}
          >
            {/* Packet-arrival glow: pre-drawn, only its opacity changes. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-md opacity-0 shadow-[0_0_18px_-2px_var(--color-accent)] ring-1 ring-accent transition-opacity duration-300 group-data-[hit]:opacity-100"
            />
            <span className="block max-w-full truncate text-xs font-medium">{node.label}</span>
            {node.sub && <span className="block max-w-full truncate font-mono text-[10px] text-muted">{node.sub}</span>}
            {view === 'deploy' && (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-accent opacity-0 transition-opacity duration-300 group-data-[done]:opacity-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
          </button>
        )
      })}

      {/* Hop labels for "Trace a request", just above each node. */}
      <AnimatePresence>
        {shownHops.map((hop) => {
          const b = nodeBox(hop.id)
          return (
            <m.span
              key={`${hop.id}-${hop.text}`}
              aria-hidden="true"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded border border-accent-2/60 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-accent-2"
              style={{ left: pct(b.x, layout.width), top: pct(b.y - b.h / 2, layout.height) }}
            >
              {hop.text}
            </m.span>
          )
        })}
      </AnimatePresence>

      {ids.map((id) => (
        <span key={id} id={`arch-desc-${id}`} className="sr-only">
          {NODES[id].detail}
        </span>
      ))}
    </div>
  )
}
