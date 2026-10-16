import { describe, expect, it } from 'vitest'
import { ZONES } from './court'
import { ORIGINS, SYSTEMS, baseRead, defenseRead } from './defense'

describe('defenseRead', () => {
  it.each(SYSTEMS)('%s has positions and notes for all six zones at every origin', (system) => {
    for (const origin of ORIGINS) {
      const r = defenseRead(system, origin)
      for (const z of ZONES) {
        expect(r.positions[z]).toBeDefined()
        expect(r.notes[z].length).toBeGreaterThan(10)
        expect(r.positions[z].x).toBeGreaterThanOrEqual(0)
        expect(r.positions[z].x).toBeLessThanOrEqual(9)
        expect(r.positions[z].y).toBeGreaterThan(0)
        expect(r.positions[z].y).toBeLessThan(9)
      }
    }
    const b = baseRead(system)
    for (const z of ZONES) expect(b.positions[z]).toBeDefined()
  })

  it('mirrors the left read from the right read', () => {
    for (const system of SYSTEMS) {
      const right = defenseRead(system, 'right')
      const left = defenseRead(system, 'left')
      expect(left.positions[4].x).toBeCloseTo(9 - right.positions[2].x)
      expect(left.positions[5].x).toBeCloseTo(9 - right.positions[1].x)
      expect(left.positions[6].x).toBeCloseTo(9 - right.positions[6].x)
      expect(left.blockers.sort()).toEqual([3, 4])
      expect(right.blockers.sort()).toEqual([2, 3])
    }
  })

  it('uses a single middle blocker against the quick', () => {
    for (const system of SYSTEMS) expect(defenseRead(system, 'middle').blockers).toEqual([3])
  })

  it('blockers stand at the net', () => {
    for (const system of SYSTEMS) {
      for (const origin of ORIGINS) {
        const r = defenseRead(system, origin)
        for (const z of r.blockers) expect(r.positions[z].y).toBeLessThan(1)
      }
    }
  })
})
