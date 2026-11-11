import { describe, expect, it } from 'vitest'
import { PASS_POSES, passPhases, platformNormal, type Stance, type Technique } from './passing'
import { poseTop } from './poses'

const COMBOS: [Technique, Stance][] = [
  ['forearm', 'low'],
  ['forearm', 'tall'],
  ['overhand', 'low'],
]

describe('passing poses', () => {
  it.each(Object.entries(PASS_POSES))('%s stands on the floor in profile', (_, p) => {
    expect(p.profile).toBe(true)
    expect(Math.min(p.feet[0][1], p.feet[1][1])).toBeGreaterThanOrEqual(0)
    expect(p.head[1]).toBeGreaterThan(p.neck[1])
    expect(p.neck[1]).toBeGreaterThan(p.hip[1])
    expect(p.hip[1]).toBeGreaterThan(Math.max(p.knees[0][1], p.knees[1][1]))
    expect(poseTop(p)).toBeGreaterThan(1.2)
  })

  it('the low stance really is lower than the tall one', () => {
    expect(PASS_POSES.lowContact.hip[1]).toBeLessThan(PASS_POSES.tallContact.hip[1] - 0.15)
  })
})

describe('passing phases', () => {
  it.each(COMBOS)('%s (%s) runs ready, move, contact, finish with checkpoints', (t, s) => {
    const phases = passPhases(t, s)
    expect(phases.map((p) => p.name)).toEqual(['Ready', 'Move', 'Contact', 'Finish'])
    for (const p of phases) {
      expect(p.checks.length).toBeGreaterThanOrEqual(3)
      expect(p.cue.length).toBeGreaterThan(20)
    }
    // The passer moves toward the ball and does not drift back.
    for (let i = 1; i < 4; i++) expect(phases[i].x).toBeGreaterThanOrEqual(phases[i - 1].x)
  })

  it('a forearm platform faces up and forward, toward the target', () => {
    for (const s of ['low', 'tall'] as Stance[]) {
      const [nx, ny] = platformNormal(passPhases('forearm', s)[2].pose)
      expect(nx).toBeGreaterThan(0.3)
      expect(ny).toBeGreaterThan(0.5)
    }
  })

  it('low contact is between waist and knees, tall contact is around the waist', () => {
    const low = passPhases('forearm', 'low')[2]
    const lowKnee = Math.max(low.pose.knees[0][1], low.pose.knees[1][1])
    expect(low.ball[1]).toBeGreaterThan(lowKnee)
    expect(low.ball[1]).toBeLessThan(low.pose.hip[1] + 0.2)

    const tall = passPhases('forearm', 'tall')[2]
    expect(Math.abs(tall.ball[1] - (tall.pose.hip[1] + 0.15))).toBeLessThan(0.2)
    expect(tall.ball[1]).toBeGreaterThan(low.ball[1])
  })

  it('an overhand receive meets the ball above the forehead and in front of it', () => {
    const c = passPhases('overhand', 'low')[2]
    expect(c.ball[1]).toBeGreaterThan(c.pose.head[1] + 0.2)
    expect(c.ball[0]).toBeGreaterThan(c.x + c.pose.head[0])
  })

  it('the ball rises toward the target after the pass', () => {
    for (const [t, s] of COMBOS) {
      const phases = passPhases(t, s)
      expect(phases[3].ball[0]).toBeGreaterThan(phases[2].ball[0])
      expect(phases[3].ball[1]).toBeGreaterThan(phases[2].ball[1])
    }
  })
})
