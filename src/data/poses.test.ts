import { describe, expect, it } from 'vitest'
import { POSES, poseTop, type PoseName } from './poses'

describe('poses', () => {
  const names = Object.keys(POSES) as PoseName[]

  it.each(names)('%s stands on the floor with the head above the hips', (name) => {
    const p = POSES[name]
    expect(p.feet[0][1]).toBeGreaterThanOrEqual(0)
    expect(p.feet[1][1]).toBeGreaterThanOrEqual(0)
    expect(p.head[1]).toBeGreaterThan(p.neck[1])
    expect(p.neck[1]).toBeGreaterThan(p.hip[1])
    expect(p.hip[1]).toBeGreaterThan(p.knees[0][1])
    expect(poseTop(p)).toBeGreaterThan(1.2)
    expect(poseTop(p)).toBeLessThan(3)
  })

  it('side-on poses are marked as profiles so they can be mirrored', () => {
    expect(POSES.run.profile).toBe(true)
    expect(POSES.hit.profile).toBe(true)
    expect(POSES.ready.profile).toBe(false)
    expect(POSES.pass.profile).toBe(false)
  })

  it('jumping poses leave the floor and reach above the net band', () => {
    expect(POSES.block.lift).toBeGreaterThan(0)
    expect(POSES.hit.lift).toBeGreaterThan(0)
    expect(poseTop(POSES.block)).toBeGreaterThan(2.43)
    expect(poseTop(POSES.hit)).toBeGreaterThan(2.43)
  })
})
