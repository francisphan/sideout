import { describe, expect, it } from 'vitest'
import { project, unproject, VIEW } from './projection'

describe('projection', () => {
  it('keeps left on the left and the net above the endline', () => {
    const left = project({ x: 0, y: 9, z: 0 })
    const right = project({ x: 9, y: 9, z: 0 })
    const net = project({ x: 4.5, y: 0, z: 0 })
    const endline = project({ x: 4.5, y: 9, z: 0 })
    expect(left.sx).toBeLessThan(right.sx)
    expect(net.sy).toBeLessThan(endline.sy)
  })

  it('draws nearer things bigger and things in the air higher', () => {
    const near = project({ x: 4.5, y: 9, z: 0 })
    const far = project({ x: 4.5, y: 0, z: 0 })
    expect(near.k).toBeGreaterThan(far.k)
    const up = project({ x: 4.5, y: 4, z: 2 })
    const down = project({ x: 4.5, y: 4, z: 0 })
    expect(up.sy).toBeLessThan(down.sy)
    expect(up.sx).toBeCloseTo(down.sx)
  })

  it('round-trips floor points through unproject', () => {
    for (const p of [
      { x: 0, y: 0 },
      { x: 9, y: 9 },
      { x: 4.5, y: 3 },
      { x: 1.2, y: 7.7 },
      { x: 7.6, y: -0.9 },
    ]) {
      const { sx, sy } = project({ ...p, z: 0 })
      const back = unproject(sx, sy)
      expect(back).not.toBeNull()
      expect(back!.x).toBeCloseTo(p.x, 6)
      expect(back!.y).toBeCloseTo(p.y, 6)
    }
  })

  it('misses the floor for rays above the horizon', () => {
    expect(unproject(0, -100000)).toBeNull()
  })

  it('frames the whole court and the antennas', () => {
    const inside = (sx: number, sy: number) =>
      sx >= VIEW.minX && sx <= VIEW.minX + VIEW.width && sy >= VIEW.minY && sy <= VIEW.minY + VIEW.height
    for (const p of [
      { x: 0, y: 0, z: 0 },
      { x: 9, y: 0, z: 0 },
      { x: 0, y: 9, z: 0 },
      { x: 9, y: 9, z: 0 },
      { x: 0, y: 0, z: 3.25 },
      { x: 9, y: 0, z: 3.25 },
      { x: 4.5, y: 9, z: 2.4 },
    ]) {
      const { sx, sy } = project(p)
      expect(inside(sx, sy)).toBe(true)
    }
  })
})
