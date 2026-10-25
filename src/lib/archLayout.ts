import type { ArchNodeId } from '../data/profile'

// Geometry of the architecture map, in viewBox units. Each view has a wide (768 px+, left to right)
// and a narrow (vertical) layout; both views share one viewBox per breakpoint, so toggling views
// never changes the map's height.

export type ArchView = 'request' | 'deploy'

export interface Pt {
  x: number
  y: number
}

/** Centre point plus size. */
export interface Box extends Pt {
  w: number
  h: number
}

export interface MapLayout {
  width: number
  height: number
  nodes: Partial<Record<ArchNodeId, Box>>
  /** Directed edges, drawn border to border with an arrowhead. */
  edges: [ArchNodeId, ArchNodeId][]
  /** Hand-routed connectors (e.g. a trunk with branches), so no edge passes behind a node it
   *  doesn't connect to. */
  paths: { points: Pt[]; arrow: boolean }[]
  /** Waypoints a packet takes between the app servers and a data node, matching `paths`. */
  via: Partial<Record<ArchNodeId, Pt[]>>
  /** Dashed monitoring taps: vertical lines from a server-side node down to the band. */
  taps: { x: number; y1: number; y2: number }[]
}

export const DATA_NODES: ArchNodeId[] = ['redis', 'queue', 'mysql', 'mongo', 's3']
export const REQUEST_ROUTE: ArchNodeId[] = ['client', 'cloudflare', 'web', 'app']
export const DEPLOY_ROUTE: ArchNodeId[] = ['git', 'ci', 'build', 'deploy', 'monitoring']

const pathEdges: [ArchNodeId, ArchNodeId][] = [
  ['client', 'cloudflare'],
  ['cloudflare', 'web'],
  ['web', 'app'],
  ['app', 'ai'],
  ['app', 'integrations'],
]
const requestEdges: [ArchNodeId, ArchNodeId][] = [
  ...pathEdges,
  ...DATA_NODES.map((d): [ArchNodeId, ArchNodeId] => ['app', d]),
]
const deployEdges = DEPLOY_ROUTE.slice(1).map((to, i): [ArchNodeId, ArchNodeId] => [DEPLOY_ROUTE[i], to])

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h })

// Heights are trimmed to the content: ~24 units of padding above the top row and below Monitoring.
const WIDE = { width: 1000, height: 524 }
const NARROW = { width: 360, height: 770 }

// Narrow request layout: a vertical trunk down from the app servers (x = 180, between the two data
// columns), with a short branch into each data node.
const TRUNK_X = 180
const ROW_1 = 485 // redis | queue
const ROW_2 = 560 // mysql | mongo
const LEFT_EDGE = 92 + 65 // right edge of the left column (x 92, w 130)
const RIGHT_EDGE = 268 - 65 // left edge of the right column

export const LAYOUTS: Record<ArchView, { wide: MapLayout; narrow: MapLayout }> = {
  request: {
    // Left to right; data fanned out on the right, AI/integrations above the app servers,
    // monitoring as a band underneath the server-side nodes.
    wide: {
      ...WIDE,
      nodes: {
        client: box(90, 222, 160, 60),
        cloudflare: box(262, 222, 140, 60),
        web: box(425, 222, 140, 60),
        app: box(605, 222, 160, 64),
        ai: box(525, 52, 150, 56),
        integrations: box(705, 52, 150, 56),
        redis: box(890, 72, 160, 52),
        queue: box(890, 147, 160, 52),
        mysql: box(890, 222, 160, 52),
        mongo: box(890, 297, 160, 52),
        s3: box(890, 372, 160, 52),
        monitoring: box(640, 477, 600, 44),
      },
      // The fan from the app servers to the data column crosses no other node, so straight edges.
      edges: requestEdges,
      paths: [],
      via: {},
      taps: [
        { x: 425, y1: 252, y2: 455 },
        { x: 605, y1: 254, y2: 455 },
        { x: 890, y1: 398, y2: 455 },
      ],
    },
    // Vertical: the request path down the middle, AI/integrations as a side row above the app
    // servers, data nodes in a grid below, monitoring at the bottom.
    narrow: {
      ...NARROW,
      nodes: {
        client: box(180, 40, 240, 52),
        cloudflare: box(180, 125, 240, 52),
        web: box(180, 210, 240, 52),
        ai: box(92, 300, 150, 52),
        integrations: box(268, 300, 150, 52),
        app: box(180, 390, 240, 56),
        redis: box(92, ROW_1, 130, 52),
        queue: box(268, ROW_1, 130, 52),
        mysql: box(92, ROW_2, 130, 52),
        mongo: box(268, ROW_2, 130, 52),
        s3: box(180, 635, 150, 52),
        monitoring: box(180, 725, 320, 44),
      },
      edges: pathEdges,
      paths: [
        // Trunk from the app servers' bottom edge into AWS S3.
        { points: [{ x: TRUNK_X, y: 418 }, { x: TRUNK_X, y: 607 }], arrow: true },
        // Branches off the trunk into each data node's inner side.
        { points: [{ x: TRUNK_X, y: ROW_1 }, { x: LEFT_EDGE + 2, y: ROW_1 }], arrow: true },
        { points: [{ x: TRUNK_X, y: ROW_1 }, { x: RIGHT_EDGE - 2, y: ROW_1 }], arrow: true },
        { points: [{ x: TRUNK_X, y: ROW_2 }, { x: LEFT_EDGE + 2, y: ROW_2 }], arrow: true },
        { points: [{ x: TRUNK_X, y: ROW_2 }, { x: RIGHT_EDGE - 2, y: ROW_2 }], arrow: true },
      ],
      via: {
        redis: [{ x: TRUNK_X, y: ROW_1 }],
        queue: [{ x: TRUNK_X, y: ROW_1 }],
        mysql: [{ x: TRUNK_X, y: ROW_2 }],
        mongo: [{ x: TRUNK_X, y: ROW_2 }],
      },
      taps: [{ x: 180, y1: 661, y2: 703 }],
    },
  },
  deploy: {
    wide: {
      ...WIDE,
      nodes: Object.fromEntries(DEPLOY_ROUTE.map((id, i) => [id, box(100 + i * 200, WIDE.height / 2, 170, 64)])),
      edges: deployEdges,
      paths: [],
      via: {},
      taps: [],
    },
    narrow: {
      ...NARROW,
      nodes: Object.fromEntries(DEPLOY_ROUTE.map((id, i) => [id, box(180, 85 + i * 150, 240, 60)])),
      edges: deployEdges,
      paths: [],
      via: {},
      taps: [],
    },
  },
}

/** Edge endpoints clipped to both nodes' borders (with a gap for the arrowhead). */
export function clipEdge(a: Box, b: Box, gap = 5): [Pt, Pt] {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const toBorder = (n: Box) => Math.min(ux ? n.w / 2 / Math.abs(ux) : Infinity, uy ? n.h / 2 / Math.abs(uy) : Infinity)
  const s = toBorder(a)
  const e = toBorder(b) + gap
  return [
    { x: a.x + ux * s, y: a.y + uy * s },
    { x: b.x - ux * e, y: b.y - uy * e },
  ]
}

/** Point at fraction t (0..1) of the way along a polyline. */
export function along(points: Pt[], t: number): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y))
  let d = Math.max(0, Math.min(1, t)) * lengths.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, d / lengths[i]) : 0
      return { x: points[i].x + (points[i + 1].x - points[i].x) * f, y: points[i].y + (points[i + 1].y - points[i].y) * f }
    }
    d -= lengths[i]
  }
  return points[points.length - 1]
}
