import { describe, expect, it } from 'vitest'
import { isFrontRow, type Zone } from './court'
import { LINEUP, specFor } from './roles'
import { ROTATIONS, lineupZones, receiveFormation, receiveZones, setterZone } from './rotations'

describe('lineupZones', () => {
  it('puts the serving order in zones 1..6 for rotation 1', () => {
    const z = lineupZones(1)
    expect(LINEUP.map((p) => z[p.id])).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('moves everyone one zone clockwise per rotation', () => {
    for (let n = 1; n < 6; n++) {
      const a = lineupZones(n as 1 | 2 | 3 | 4 | 5)
      const b = lineupZones((n + 1) as 2 | 3 | 4 | 5 | 6)
      for (const p of LINEUP) {
        const expected = a[p.id] === 1 ? 6 : a[p.id] - 1
        expect(b[p.id]).toBe(expected)
      }
    }
  })

  it('names rotations by the setter zone: 1, 6, 5, 4, 3, 2', () => {
    expect(ROTATIONS.map(setterZone)).toEqual([1, 6, 5, 4, 3, 2])
  })

  it('keeps the opposite across from the setter', () => {
    for (const n of ROTATIONS) {
      const z = lineupZones(n)
      expect(((z.S + 2) % 6) + 1).toBe(z.OPP)
    }
  })
})

describe('receiveFormation', () => {
  it.each(ROTATIONS)('rotation %i has six players and the libero in for the back-row middle', (n) => {
    const zones = receiveZones(n)
    const ids = Object.keys(zones)
    expect(ids).toHaveLength(6)
    expect(new Set(Object.values(zones)).size).toBe(6)
    expect(ids).toContain('L')
    const mids = ids.filter((id) => specFor(id).role === 'MB')
    expect(mids).toHaveLength(1)
    expect(isFrontRow(zones[mids[0]])).toBe(true)
  })

  it.each(ROTATIONS)('rotation %i has three passers, a server target and a front-row outside', (n) => {
    const f = receiveFormation(n)
    expect(f.players.filter((p) => p.passer)).toHaveLength(3)
    expect(f.players.find((p) => p.spec.id === f.serveTo)?.passer).toBe(true)
    const hitter = f.players.find((p) => p.spec.id === f.setTo)
    expect(hitter?.frontRow).toBe(true)
    expect(hitter?.spec.role).toBe('OH')
    for (const p of f.players) expect(p.note.length).toBeGreaterThan(20)
  })

  it('front-row hitters move after contact and the setter ends at target', () => {
    const f = receiveFormation(3)
    const s = f.players.find((p) => p.spec.id === 'S')!
    expect(s.phases[1]).toEqual({ x: 6, y: 0.9 })
    const front = f.players.filter((p) => p.frontRow && p.spec.role !== 'S')
    for (const p of front) expect(p.phases[1]).not.toEqual(p.phases[0])
  })

  it('every position is on or just outside the court', () => {
    for (const n of ROTATIONS) {
      for (const p of receiveFormation(n).players) {
        for (const pos of p.phases) {
          expect(pos.x).toBeGreaterThan(-0.5)
          expect(pos.x).toBeLessThan(9.5)
          expect(pos.y).toBeGreaterThan(0.3)
          expect(pos.y).toBeLessThan(9.5)
        }
      }
    }
  })

  it('zones used by the formation match the lineup', () => {
    const zones = receiveZones(5)
    const f = receiveFormation(5)
    for (const p of f.players) expect(p.zone).toBe(zones[p.spec.id] as Zone)
  })
})
