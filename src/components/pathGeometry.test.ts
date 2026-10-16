import { describe, expect, it } from 'vitest'
import type { CourtPath } from './courtTypes'
import {
  MARKER_INSET,
  MIN_MOVE,
  distanceToSegment,
  flightPoints,
  labelPoint,
  pathPoints,
  polylineLength,
  routePoints,
  svgPath,
  trimPolyline,
} from './pathGeometry'

describe('routePoints', () => {
  it('is a plain segment without a waypoint', () => {
    expect(routePoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ])
  })

  it('bends through the waypoint at its midpoint', () => {
    const pts = routePoints({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 2 }, 8)
    expect(pts).toHaveLength(9)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[8]).toEqual({ x: 4, y: 0 })
    expect(pts[4].x).toBeCloseTo(2)
    expect(pts[4].y).toBeCloseTo(2)
  })
})

describe('trimPolyline', () => {
  it('shortens a segment from both ends', () => {
    const t = trimPolyline([{ x: 0, y: 0 }, { x: 10, y: 0 }], 1, 2)!
    expect(t[0].x).toBeCloseTo(1)
    expect(t[t.length - 1].x).toBeCloseTo(8)
  })

  it('trims by arc length across several segments', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]
    const t = trimPolyline(pts, 1.5, 0.25)!
    expect(t[0]).toEqual({ x: 1, y: 0.5 })
    expect(t[t.length - 1]).toEqual({ x: 1.75, y: 1 })
    expect(polylineLength(t)).toBeCloseTo(3 - 1.75)
  })

  it('returns null when the insets eat the whole path', () => {
    expect(trimPolyline([{ x: 0, y: 0 }, { x: 1, y: 0 }], 0.6, 0.6)).toBeNull()
  })
})

describe('flightPoints', () => {
  it('is a flat segment when nothing is in the air', () => {
    expect(flightPoints({ x: 0, y: 0 }, { x: 1, y: 1 })).toHaveLength(2)
  })

  it('rises to the arc height above the chord and lands at the end heights', () => {
    const pts = flightPoints({ x: 0, y: 0, z: 1 }, { x: 4, y: 0, z: 3 }, 1.5, 10)
    expect(pts[0].z).toBe(1)
    expect(pts[10].z).toBe(3)
    expect(pts[5].z).toBeCloseTo(2 + 1.5)
    expect(pts[5].x).toBeCloseTo(2)
    for (const p of pts) expect(p.z).toBeGreaterThanOrEqual(1)
  })
})

describe('pathPoints', () => {
  const move = (from: CourtPath['from'], to: CourtPath['to'], via?: CourtPath['via']): CourtPath => ({
    id: 'm',
    from,
    to,
    via,
    kind: 'move',
  })

  it('skips moves that are too short to draw', () => {
    expect(pathPoints(move({ x: 1, y: 1 }, { x: 1, y: 1 }))).toBeNull()
    expect(pathPoints(move({ x: 1, y: 1 }, { x: 1, y: 1 + MIN_MOVE - 0.05 }))).toBeNull()
  })

  it('stops a move short of the destination so the arrowhead clears the marker', () => {
    const pts = pathPoints(move({ x: 0, y: 0 }, { x: 3, y: 0 }))!
    expect(pts[0]).toEqual({ x: 0, y: 0, z: 0 })
    expect(pts[pts.length - 1].x).toBeCloseTo(3 - MARKER_INSET)
  })

  it('curves a move through its waypoint', () => {
    const pts = pathPoints(move({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 2 }))!
    expect(pts.length).toBeGreaterThan(4)
    expect(Math.max(...pts.map((p) => p.y))).toBeGreaterThan(1.9)
  })

  it('keeps lanes and the ball at full length', () => {
    const shot: CourtPath = { id: 's', from: { x: 0, y: 0 }, to: { x: 0, y: 0.3 }, kind: 'shot' }
    expect(pathPoints(shot)).toHaveLength(2)
    const ball: CourtPath = { id: 'b', from: { x: 0, y: 0, z: 1 }, to: { x: 2, y: 2, z: 2 }, kind: 'ball', arc: 1 }
    const pts = pathPoints(ball)!
    expect(pts[0]).toEqual({ x: 0, y: 0, z: 1 })
    expect(pts[pts.length - 1]).toEqual({ x: 2, y: 2, z: 2 })
  })
})

describe('helpers', () => {
  it('measures the distance to a segment, clamped to its ends', () => {
    expect(distanceToSegment({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(1)
    expect(distanceToSegment({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(3)
  })

  it('writes SVG path data', () => {
    expect(svgPath([{ x: 0, y: 0 }, { x: 1.5, y: 2 }])).toBe('M 0.000 0.000 L 1.500 2.000')
  })

  it('puts a lane label just past the end of the lane', () => {
    const p = labelPoint({ id: 'l', from: { x: 0, y: 0 }, to: { x: 0, y: 4 }, kind: 'shot' }, 0.5)
    expect(p).toEqual({ x: 0, y: 4.5 })
  })
})
