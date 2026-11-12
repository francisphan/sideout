import { describe, expect, it } from 'vitest'
import { ATTACK_FROM, BLOCK_POSES, NET_X, blockPhases, type BlockTechnique } from './blocking'
import { BALL_R, NET_H } from './hitting'
import type { Pose, Pt } from './poses'

const TECHNIQUES: BlockTechnique[] = ['stuff', 'soft']

/** Every joint except the hands and forearms, in the world frame. */
function body(pose: Pose, x: number): Pt[] {
  const pts: Pt[] = [pose.head, pose.neck, pose.hip, ...pose.shoulders, ...pose.knees, ...pose.feet]
  return pts.map(([px, py]) => [x + px, py + pose.lift])
}

describe('blocking poses', () => {
  it.each(Object.entries(BLOCK_POSES))('%s is a profile figure the right way up', (_, p) => {
    expect(p.profile).toBe(true)
    expect(Math.min(p.feet[0][1], p.feet[1][1])).toBeGreaterThanOrEqual(0)
    expect(p.head[1]).toBeGreaterThan(p.neck[1])
    expect(p.neck[1]).toBeGreaterThan(p.hip[1])
    expect(p.hip[1]).toBeGreaterThan(Math.max(p.knees[0][1], p.knees[1][1]))
  })

  it('keeps the hands up from the ready position on', () => {
    for (const p of Object.values(BLOCK_POSES)) {
      for (const h of p.hands) expect(h[1]).toBeGreaterThan(p.shoulders[1][1] - 0.01)
    }
  })
})

describe('blocking phases', () => {
  it.each(TECHNIQUES)('%s runs ready, read, jump, press, land with checkpoints', (t) => {
    const phases = blockPhases(t)
    expect(phases.map((p) => p.name)).toEqual(['Ready', 'Read', 'Jump', 'Press', 'Land'])
    for (const p of phases) {
      expect(p.checks.length).toBeGreaterThanOrEqual(3)
      expect(p.cue.length).toBeGreaterThan(20)
    }
  })

  it.each(TECHNIQUES)('%s keeps the body behind the net the whole time', (t) => {
    for (const p of blockPhases(t)) {
      for (const [x] of body(p.pose, p.x)) expect(x).toBeLessThan(NET_X - 0.05)
    }
  })

  it('a stuff block reaches over the net, above the tape', () => {
    const p = blockPhases('stuff')[3]
    const [e, h]: Pt[] = [p.pose.elbows[1], p.pose.hands[1]].map(([x, y]) => [p.x + x, y + p.pose.lift])
    expect(h[0]).toBeGreaterThan(NET_X)
    // Where the forearm crosses the plane of the net, it is clear of the tape.
    const t = (NET_X - e[0]) / (h[0] - e[0])
    expect(e[1] + (h[1] - e[1]) * t).toBeGreaterThan(NET_H + 0.07)
  })

  it('a soft block stays behind the net with the hands up high', () => {
    const p = blockPhases('soft')[3]
    expect(p.x + p.pose.hands[1][0]).toBeLessThan(NET_X)
    expect(p.pose.hands[1][1] + p.pose.lift).toBeGreaterThan(NET_H + 0.15)
  })

  it.each(TECHNIQUES)('%s meets the attack above the net', (t) => {
    const ball = blockPhases(t)[3].ball
    expect(ball[1] - BALL_R).toBeGreaterThan(NET_H)
    expect(ATTACK_FROM[0]).toBeGreaterThan(NET_X)
  })

  it('a stuff goes down on their side, a soft block goes up on yours', () => {
    const [stuffAt, stuffAfter] = [blockPhases('stuff')[3].ball, blockPhases('stuff')[4].ball]
    expect(stuffAfter[0]).toBeGreaterThan(NET_X)
    expect(stuffAfter[1]).toBeLessThan(stuffAt[1])

    const [softAt, softAfter] = [blockPhases('soft')[3].ball, blockPhases('soft')[4].ball]
    expect(softAfter[0]).toBeLessThan(NET_X)
    expect(softAfter[1]).toBeGreaterThan(softAt[1])
  })

  it('the blocker jumps after the hitter', () => {
    const p = blockPhases('stuff')
    // When the hitter is loading in the air, the blocker is only on the way up.
    expect(p[2].hitter.pose.lift).toBeGreaterThan(p[2].pose.lift)
    expect(p[3].pose.lift).toBeGreaterThan(p[2].pose.lift)
  })
})
