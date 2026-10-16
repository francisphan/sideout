import { describe, expect, it } from 'vitest'
import { ZONE_HOME, type Pos, type Zone } from './court'
import { overlapViolations } from './overlap'
import { ROTATIONS, receiveFormation } from './rotations'

describe('overlapViolations', () => {
  it('accepts the neutral home alignment', () => {
    expect(overlapViolations(ZONE_HOME)).toEqual([])
  })

  it('flags a front-row player behind their back-row partner', () => {
    const pos: Record<Zone, Pos> = { ...ZONE_HOME, 2: { x: 7.5, y: 7 } }
    const v = overlapViolations(pos)
    expect(v).toHaveLength(1)
    expect(v[0]).toMatchObject({ a: 2, b: 1 })
  })

  it('flags a left/right swap within a row', () => {
    const pos: Record<Zone, Pos> = { ...ZONE_HOME, 5: { x: 5, y: 6.5 } }
    const v = overlapViolations(pos)
    expect(v.map((x) => `${x.a}-${x.b}`)).toEqual(['5-6'])
  })

  it('exempts the server on the serving team', () => {
    const pos: Record<Zone, Pos> = { ...ZONE_HOME, 1: { x: 3, y: 9.5 } }
    expect(overlapViolations(pos)).toHaveLength(1)
    expect(overlapViolations(pos, { serving: true })).toEqual([])
  })

  it.each(ROTATIONS)('rotation %i pre-serve formation is legal', (n) => {
    const f = receiveFormation(n)
    const pos = {} as Record<Zone, Pos>
    for (const p of f.players) pos[p.zone] = p.phases[0]
    expect(overlapViolations(pos)).toEqual([])
  })
})
