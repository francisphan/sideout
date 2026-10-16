import type { Pos } from '../data/court'
import type { CourtPath, PathPoint } from './courtTypes'

/** A point in court metres with a height. */
export interface Point3 {
  x: number
  y: number
  z: number
}

/** Moves shorter than this are not drawn: the player is already there. */
export const MIN_MOVE = 0.75

/** How far short of its destination a move arrow stops, so the head sits just outside the player marker. */
export const MARKER_INSET = 0.52

const dist = (a: Pos, b: Pos) => Math.hypot(b.x - a.x, b.y - a.y)

/** Shortest distance from `p` to the segment `ab`. */
export function distanceToSegment(p: Pos, a: Pos, b: Pos): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2))
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy })
}

export function polylineLength(pts: Pos[]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i])
  return total
}

/**
 * Points along a route: a straight segment, or a quadratic curve that passes
 * through `via` at its midpoint when a waypoint is given.
 */
export function routePoints(from: Pos, to: Pos, via?: Pos, steps = 16): Pos[] {
  if (!via) return [from, to]
  // Control point that makes the curve pass through `via` at t = 0.5.
  const cx = 2 * via.x - (from.x + to.x) / 2
  const cy = 2 * via.y - (from.y + to.y) / 2
  const out: Pos[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = (1 - t) * (1 - t)
    const b = 2 * t * (1 - t)
    const c = t * t
    out.push({ x: a * from.x + b * cx + c * to.x, y: a * from.y + b * cy + c * to.y })
  }
  return out
}

function cutStart(pts: Pos[], inset: number): Pos[] | null {
  if (inset <= 0) return pts
  let left = inset
  for (let i = 1; i < pts.length; i++) {
    const seg = dist(pts[i - 1], pts[i])
    if (seg > left) {
      const t = left / seg
      const start = {
        x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
        y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y),
      }
      return [start, ...pts.slice(i)]
    }
    left -= seg
  }
  return null
}

/** Drops `start` metres from the front and `end` metres from the back. Null when nothing is left. */
export function trimPolyline(pts: Pos[], start: number, end: number): Pos[] | null {
  if (pts.length < 2) return null
  if (polylineLength(pts) <= start + end + 1e-6) return null
  const front = cutStart(pts, start)
  if (!front) return null
  const back = cutStart([...front].reverse(), end)
  return back ? back.reverse() : null
}

/**
 * The flight of a ball: x and y run straight from `from` to `to`, and the
 * height follows a parabola that peaks `arc` metres above the straight line
 * between the two heights.
 */
export function flightPoints(from: PathPoint, to: PathPoint, arc = 0, steps = 20): Point3[] {
  const z0 = from.z ?? 0
  const z1 = to.z ?? 0
  if (arc === 0 && z0 === 0 && z1 === 0) {
    return [
      { x: from.x, y: from.y, z: 0 },
      { x: to.x, y: to.y, z: 0 },
    ]
  }
  const out: Point3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    out.push({
      x: from.x + t * (to.x - from.x),
      y: from.y + t * (to.y - from.y),
      z: z0 + t * (z1 - z0) + 4 * arc * t * (1 - t),
    })
  }
  return out
}

/**
 * The points to draw for a court path, in metres with height, or null when
 * the path should not be drawn at all. Moves are skipped when too short to
 * mean anything and stop short of the destination so the arrowhead clears
 * the player marker; the ball flies; everything else lies on the floor.
 */
export function pathPoints(path: CourtPath): Point3[] | null {
  if (path.kind === 'ball') return flightPoints(path.from, path.to, path.arc)
  const floor = routePoints(path.from, path.to, path.via)
  let pts: Pos[] | null = floor
  if (path.kind === 'move') {
    if (polylineLength(floor) < MIN_MOVE) return null
    pts = trimPolyline(floor, 0, MARKER_INSET)
  }
  return pts ? pts.map((p) => ({ x: p.x, y: p.y, z: 0 })) : null
}

/** SVG path data through the given points. */
export function svgPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' ')
}

/** Where a lane label sits: a little past the end of the lane, continuing its direction. */
export function labelPoint(path: CourtPath, gap = 0.6): Pos {
  const dx = path.to.x - path.from.x
  const dy = path.to.y - path.from.y
  const l = Math.hypot(dx, dy)
  if (l === 0) return { x: path.to.x, y: path.to.y + gap }
  return { x: path.to.x + (dx / l) * gap, y: path.to.y + (dy / l) * gap }
}
