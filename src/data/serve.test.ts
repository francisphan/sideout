import { describe, expect, it } from 'vitest'
import { distanceToSegment } from '../components/pathGeometry'
import { ROTATIONS, receiveFormation } from './rotations'
import { DEFAULT_SERVER_X, LANE_CLEARANCE, SERVER_Y, arrivingBall, serverX } from './serve'

describe('serverX', () => {
  it('keeps the usual spot when the lane is clear', () => {
    expect(serverX({ x: 6, y: 6 }, [{ x: 1, y: 1 }])).toBe(DEFAULT_SERVER_X)
    expect(serverX({ x: 6, y: 6 }, [])).toBe(DEFAULT_SERVER_X)
  })

  it('moves along the endline when a player stands in the lane', () => {
    const target = { x: 6, y: 6 }
    const blocker = { x: 6.1, y: 1 }
    const x = serverX(target, [blocker])
    expect(x).not.toBe(DEFAULT_SERVER_X)
    expect(distanceToSegment(blocker, { x, y: SERVER_Y }, target)).toBeGreaterThanOrEqual(LANE_CLEARANCE)
  })

  it.each(ROTATIONS)('rotation %i: the serve lane clears everyone but the passer', (n) => {
    for (const passer of ['opposite', 'outside', 'four'] as const) {
      const f = receiveFormation(n, passer)
      const p = f.players.find((pl) => pl.spec.id === f.serveTo)!
      const target = arrivingBall(p.phases[1])
      const others = f.players.filter((pl) => pl.spec.id !== f.serveTo).map((pl) => pl.phases[1])
      const x = serverX(target, others)
      for (const o of others) {
        expect(distanceToSegment(o, { x, y: SERVER_Y }, target)).toBeGreaterThanOrEqual(LANE_CLEARANCE)
      }
    }
  })
})
