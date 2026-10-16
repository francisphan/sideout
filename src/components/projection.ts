import type { Pos } from '../data/court'

/** A point on or above the court: x, y as in the data files, z metres up. */
export interface P3 {
  x: number
  y: number
  z: number
}

export interface Projected {
  sx: number
  sy: number
  /** Screen units per metre at this depth. */
  k: number
}

/** Focal length: screen units per metre at one metre from the camera. */
const F = 1000

/** A broadcast-style camera behind and above our own endline, looking at the net. */
const CAMERA = {
  pos: { x: 4.5, y: 12.5, z: 7.2 },
  target: { x: 4.5, y: 3.0, z: 0.4 },
}

type V = [number, number, number]
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}

const EYE: V = [CAMERA.pos.x, CAMERA.pos.y, CAMERA.pos.z]
const FWD = norm(sub([CAMERA.target.x, CAMERA.target.y, CAMERA.target.z], EYE))
const RIGHT = norm(cross([0, 0, 1], FWD))
const UP = cross(FWD, RIGHT)

export function project(p: P3): Projected {
  const d = sub([p.x, p.y, p.z], EYE)
  const px = dot(d, RIGHT)
  const py = dot(d, UP)
  const pz = dot(d, FWD)
  return { sx: (F * px) / pz, sy: (-F * py) / pz, k: F / pz }
}

/** Screen point back to the floor (z = 0), or null if the ray misses it. */
export function unproject(sx: number, sy: number): Pos | null {
  const dir: V = [
    (sx / F) * RIGHT[0] - (sy / F) * UP[0] + FWD[0],
    (sx / F) * RIGHT[1] - (sy / F) * UP[1] + FWD[1],
    (sx / F) * RIGHT[2] - (sy / F) * UP[2] + FWD[2],
  ]
  if (dir[2] >= 0) return null
  const t = -EYE[2] / dir[2]
  return { x: EYE[0] + t * dir[0], y: EYE[1] + t * dir[1] }
}

/** The patch of floor the scene draws. */
export const SCENE = { xMin: -0.8, xMax: 9.8, yMin: -2.4, yMax: 9.5 } as const

function bounds(points: P3[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    const { sx, sy } = project(p)
    minX = Math.min(minX, sx)
    maxX = Math.max(maxX, sx)
    minY = Math.min(minY, sy)
    maxY = Math.max(maxY, sy)
  }
  const padX = (maxX - minX) * 0.015
  const padY = (maxY - minY) * 0.03
  return {
    minX: minX - padX,
    minY: minY - padY,
    width: maxX - minX + padX * 2,
    height: maxY - minY + padY * 2,
  }
}

/** The SVG viewBox that frames the whole scene. */
export const VIEW = bounds([
  { x: SCENE.xMin, y: SCENE.yMax, z: 0 },
  { x: SCENE.xMax, y: SCENE.yMax, z: 0 },
  { x: SCENE.xMin, y: SCENE.yMin, z: 0 },
  { x: SCENE.xMax, y: SCENE.yMin, z: 0 },
  { x: 0, y: 0, z: 3.3 },
  { x: 9, y: 0, z: 3.3 },
  { x: 1, y: SCENE.yMin, z: 2.6 },
  { x: 8, y: SCENE.yMin, z: 2.6 },
])

export function polygon(points: P3[]): string {
  return points
    .map((p) => {
      const { sx, sy } = project(p)
      return `${sx.toFixed(1)},${sy.toFixed(1)}`
    })
    .join(' ')
}
