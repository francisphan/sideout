/**
 * The seam pattern of an 18-panel volleyball, computed rather than drawn.
 *
 * A real ball is a sphere divided like a cube into six faces, each face cut
 * into three parallel strips, with the strip direction turning by a quarter
 * from face to face. Every seam is therefore an arc of a great circle. We
 * build those arcs, look at the ball from near a corner where three faces
 * meet, and keep only the visible half.
 */
type V = [number, number, number]

const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

function slerp(a: V, b: V, t: number): V {
  const omega = Math.acos(Math.min(1, Math.max(-1, dot(a, b))))
  const so = Math.sin(omega)
  if (so < 1e-9) return a
  const wa = Math.sin((1 - t) * omega) / so
  const wb = Math.sin(t * omega) / so
  return [wa * a[0] + wb * b[0], wa * a[1] + wb * b[1], wa * a[2] + wb * b[2]]
}

/** Endpoints of every seam, as points on the cube (normalised later). */
export function seamArcs(): [V, V][] {
  const out: [V, V][] = []
  const verts: V[] = []
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) verts.push([x, y, z])
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const a = verts[i]
      const b = verts[j]
      const apart = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
      if (apart === 2) out.push([a, b])
    }
  }
  const third = 1 / 3
  for (const s of [-1, 1]) {
    for (const c of [-third, third]) {
      out.push([[s, c, -1], [s, c, 1]])
      out.push([[-1, s, c], [1, s, c]])
      out.push([[c, -1, s], [c, 1, s]])
    }
  }
  return out
}

/** Maps a point on the sphere to [screen x, screen y (down), depth toward viewer]. */
function viewer(): (p: V) => V {
  const toward = norm([1, 1, 1])
  const right = norm(cross([0, 0, 1], toward))
  const up = cross(toward, right)
  const tilt = 0.3
  const roll = 0.4
  return (p) => {
    const q = norm(p)
    const x = dot(q, right)
    const y0 = dot(q, up)
    const z0 = dot(q, toward)
    const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt)
    const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt)
    const xr = x * Math.cos(roll) - y * Math.sin(roll)
    const yr = x * Math.sin(roll) + y * Math.cos(roll)
    return [xr, -yr, z]
  }
}

/** SVG path data for the visible seams of a unit-radius ball centred at the origin. */
export function seamPath(segments = 20): string {
  const view = viewer()
  const parts: string[] = []
  for (const [a, b] of seamArcs()) {
    const A = norm(a)
    const B = norm(b)
    let run: string[] = []
    for (let i = 0; i <= segments; i++) {
      const p = view(slerp(A, B, i / segments))
      if (p[2] > 0.05) {
        run.push(`${run.length ? 'L' : 'M'} ${p[0].toFixed(3)} ${p[1].toFixed(3)}`)
      } else if (run.length) {
        parts.push(run.join(' '))
        run = []
      }
    }
    if (run.length) parts.push(run.join(' '))
  }
  return parts.join(' ')
}

export const SEAM_PATH = seamPath()
