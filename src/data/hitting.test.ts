import { describe, expect, it } from 'vitest'
import { arcPoint } from './passing'
import {
  BALL_R,
  HIT_ARC,
  HIT_POSES,
  HIT_TO,
  NET_H,
  NET_X,
  STEPS,
  hitPhases,
  type HitTechnique,
} from './hitting'

const TECHNIQUES: HitTechnique[] = ['swing', 'offspeed']

describe('hitting poses', () => {
  it.each(Object.entries(HIT_POSES))('%s is a profile figure the right way up', (_, p) => {
    expect(p.profile).toBe(true)
    expect(Math.min(p.feet[0][1], p.feet[1][1])).toBeGreaterThanOrEqual(0)
    expect(p.head[1]).toBeGreaterThan(p.neck[1])
    expect(p.neck[1]).toBeGreaterThan(p.hip[1])
    expect(p.hip[1]).toBeGreaterThan(Math.max(p.knees[0][1], p.knees[1][1]))
  })

  it('the plant loads low and the jump leaves the floor', () => {
    expect(HIT_POSES.plant.hip[1]).toBeLessThan(HIT_POSES.approach.hip[1] - 0.15)
    expect(HIT_POSES.plant.lift).toBe(0)
    expect(HIT_POSES.load.lift).toBeGreaterThan(0.3)
    expect(HIT_POSES.swingContact.lift).toBeGreaterThan(0.3)
  })

  it('the plant swings both arms back behind the hips', () => {
    for (const h of HIT_POSES.plant.hands) expect(h[0]).toBeLessThan(HIT_POSES.plant.hip[0])
  })
})

describe('hitting phases', () => {
  it.each(TECHNIQUES)('%s runs approach, plant, jump, contact, land with checkpoints', (t) => {
    const phases = hitPhases(t)
    expect(phases.map((p) => p.name)).toEqual(['Approach', 'Plant', 'Jump', 'Contact', 'Land'])
    for (const p of phases) {
      expect(p.checks.length).toBeGreaterThanOrEqual(3)
      expect(p.cue.length).toBeGreaterThan(20)
    }
    for (let i = 1; i < 5; i++) expect(phases[i].x).toBeGreaterThanOrEqual(phases[i - 1].x)
  })

  it('off-speed looks the same as a swing until contact', () => {
    const swing = hitPhases('swing')
    const off = hitPhases('offspeed')
    for (let i = 0; i < 3; i++) {
      expect(off[i].pose).toBe(swing[i].pose)
      expect(off[i].x).toBe(swing[i].x)
    }
  })

  it.each(TECHNIQUES)('%s contact is above the net, at reach, in front of the hitting shoulder', (t) => {
    const c = hitPhases(t)[3]
    expect(c.ball[1] - BALL_R).toBeGreaterThan(NET_H + 0.1)
    expect(c.ball[1]).toBeGreaterThan(c.pose.head[1] + c.pose.lift + 0.3)
    expect(c.ball[0]).toBeGreaterThan(c.x + c.pose.shoulders[1][0])
    expect(c.ball[0]).toBeLessThan(NET_X)
  })

  it.each(TECHNIQUES)('%s clears the net and lands beyond it', (t) => {
    const c = hitPhases(t)[3].ball
    for (let i = 0; i <= 100; i++) {
      const [x, y] = arcPoint(c, HIT_TO[t], HIT_ARC[t], i / 100)
      if (Math.abs(x - NET_X) < 0.02) expect(y - BALL_R).toBeGreaterThan(NET_H)
    }
    expect(HIT_TO[t][0]).toBeGreaterThan(NET_X + 1)
  })

  it('the ball drops into the court after the hit', () => {
    for (const t of TECHNIQUES) {
      const p = hitPhases(t)
      expect(p[4].ball[0]).toBeGreaterThan(NET_X)
      expect(p[4].ball[1]).toBeLessThan(p[3].ball[1] + 0.3)
    }
  })

  it('the hitter lands on their own side of the net', () => {
    const land = hitPhases('swing')[4]
    const toes = land.x + Math.max(land.pose.feet[0][0], land.pose.feet[1][0])
    expect(toes).toBeLessThan(NET_X - 0.2)
  })

  it('the approach ends right-left for a right-hander, with a long penultimate step', () => {
    expect(STEPS.map((s) => s.foot)).toEqual(['R', 'L', 'R', 'L'])
    const gaps = STEPS.slice(1).map((s, i) => s.x - STEPS[i].x)
    expect(gaps[1]).toBeGreaterThan(gaps[0])
    expect(gaps[2]).toBeLessThan(0.4)
  })
})
