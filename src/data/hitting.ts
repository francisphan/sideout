/**
 * The hitting lesson: one right-handed attacker seen side-on, approaching the
 * net (+x), stepped through approach, plant, jump, contact and landing. Poses
 * use the same joint format as the passing lesson (metres, feet on the floor
 * at y = 0, y up, profile). Index 1 of each arm pair is the hitting arm, drawn
 * nearest the camera. Ball positions are in the world frame.
 */
import { arcPoint } from './passing'
import type { Pose, Pt } from './poses'

export type HitTechnique = 'swing' | 'offspeed'
export type HitPhaseId = 0 | 1 | 2 | 3 | 4

export type HitAnchor =
  | 'head'
  | 'shoulders'
  | 'hip'
  | 'knee'
  | 'feet'
  | 'hitHand'
  | 'offHand'
  | 'elbow'
  | 'ball'

export interface HitCheckpoint {
  anchor: HitAnchor
  text: string
  /** Where the numbered marker sits relative to its anchor, when the default would collide. */
  offset?: Pt
}

export interface HitPhase {
  id: HitPhaseId
  name: string
  pose: Pose
  /** Where the hitter is, in metres along the floor. */
  x: number
  ball: Pt
  cue: string
  checks: HitCheckpoint[]
}

export const BALL_R = 0.11
/** The net, side-on: where it stands and the height of the tape (men's and coed). */
export const NET_X = 0.5
export const NET_H = 2.43
export const NET_DEPTH = 1

/** Where the set comes in from, high above the hitter. */
export const SET_FROM: Pt = [0.2, 3.7]
/** Where each attack ends up, and how much its path bows (negative dips). */
export const HIT_TO: Record<HitTechnique, Pt> = { swing: [3.4, 1.4], offspeed: [2.3, 0.1] }
export const HIT_ARC: Record<HitTechnique, number> = { swing: -0.1, offspeed: 1.8 }

/** A right-hander's four-step approach: where each foot lands, in order. */
export const STEPS: { x: number; foot: 'L' | 'R' }[] = [
  { x: -2.95, foot: 'R' },
  { x: -2.06, foot: 'L' },
  { x: -0.72, foot: 'R' },
  { x: -0.54, foot: 'L' },
]

export const PHASE_NAMES = ['Approach', 'Plant', 'Jump', 'Contact', 'Land'] as const

const profile = (p: Omit<Pose, 'profile'>): Pose => ({ ...p, profile: true })

export const HIT_POSES = {
  // Mid-stride on the first steps, arms swinging loosely.
  approach: profile({
    lift: 0.02,
    head: [0.22, 1.58],
    neck: [0.16, 1.42],
    hip: [0, 0.92],
    shoulders: [[0.08, 1.38], [0.16, 1.38]],
    elbows: [[-0.16, 1.18], [0.38, 1.2]],
    hands: [[-0.26, 0.96], [0.5, 1.38]],
    knees: [[-0.22, 0.52], [0.32, 0.58]],
    feet: [[-0.48, 0.14], [0.34, 0.04]],
  }),
  // Both feet planted ahead of the hips, hips low, both arms swung back.
  plant: profile({
    lift: 0,
    head: [0.36, 1.34],
    neck: [0.26, 1.22],
    hip: [-0.12, 0.76],
    shoulders: [[0.14, 1.16], [0.2, 1.16]],
    elbows: [[-0.07, 1.32], [-0.04, 1.36]],
    hands: [[-0.28, 1.48], [-0.24, 1.54]],
    knees: [[0.24, 0.42], [0.1, 0.4]],
    feet: [[0.38, 0.02], [0.2, 0.02]],
  }),
  // Rising: off arm up at the ball, hitting elbow drawn back high.
  load: profile({
    lift: 0.5,
    head: [0.1, 1.66],
    neck: [0.06, 1.5],
    hip: [0, 0.95],
    shoulders: [[0.02, 1.46], [0.08, 1.46]],
    elbows: [[0.24, 1.7], [-0.22, 1.56]],
    hands: [[0.38, 1.94], [-0.3, 1.82]],
    knees: [[0.14, 0.52], [0.06, 0.5]],
    feet: [[-0.18, 0.2], [-0.28, 0.16]],
  }),
  // Full reach, ball in front of the hitting shoulder, off arm pulled down.
  swingContact: profile({
    lift: 0.68,
    head: [0.14, 1.64],
    neck: [0.08, 1.48],
    hip: [0, 0.95],
    shoulders: [[0.02, 1.45], [0.1, 1.45]],
    elbows: [[0.22, 1.2], [0.18, 1.76]],
    hands: [[0.14, 0.98], [0.3, 2.04]],
    knees: [[0.18, 0.56], [-0.2, 0.58]],
    feet: [[-0.08, 0.2], [-0.48, 0.3]],
  }),
  // Same reach, arm slowed, fingertips lifting the ball over the block.
  tipContact: profile({
    lift: 0.68,
    head: [0.14, 1.64],
    neck: [0.08, 1.48],
    hip: [0, 0.95],
    shoulders: [[0.02, 1.45], [0.1, 1.45]],
    elbows: [[0.24, 1.22], [0.22, 1.75]],
    hands: [[0.16, 1.0], [0.38, 2.0]],
    knees: [[0.18, 0.56], [-0.2, 0.58]],
    feet: [[-0.08, 0.2], [-0.48, 0.3]],
  }),
  // Two feet, knees bent, hitting arm followed through past the hip.
  land: profile({
    lift: 0,
    head: [0.26, 1.4],
    neck: [0.18, 1.26],
    hip: [0, 0.72],
    shoulders: [[0.1, 1.21], [0.16, 1.21]],
    elbows: [[0.02, 0.98], [0.3, 0.98]],
    hands: [[0.14, 0.78], [0.2, 0.74]],
    knees: [[0.3, 0.4], [0.22, 0.38]],
    feet: [[0.22, 0.02], [0.04, 0.02]],
  }),
} satisfies Record<string, Pose>

const H = HIT_POSES

/** The ball just in front of and above the hitting hand. */
function ballAtHand(pose: Pose, x: number): Pt {
  const h = pose.hands[1]
  return [x + h[0] + 0.07, h[1] + pose.lift + 0.1]
}

/** A point in the world frame for a checkpoint marker. */
export function hitAnchorPoint(phase: HitPhase, anchor: HitAnchor): Pt {
  const p = phase.pose
  const at = (pt: Pt): Pt => [phase.x + pt[0], pt[1] + p.lift]
  switch (anchor) {
    case 'head':
      return at(p.head)
    case 'shoulders':
      return at(p.shoulders[1])
    case 'hip':
      return at(p.hip)
    case 'knee':
      return at(p.knees[0][0] > p.knees[1][0] ? p.knees[0] : p.knees[1])
    case 'feet':
      return at(p.feet[0][0] > p.feet[1][0] ? p.feet[0] : p.feet[1])
    case 'hitHand':
      return at(p.hands[1])
    case 'offHand':
      return at(p.hands[0])
    case 'elbow':
      return at(p.elbows[1])
    case 'ball':
      return phase.ball
  }
}

/** Approach, plant and jump are the same for every attack: that is the disguise. */
const APPROACH: Omit<HitPhase, 'ball' | 'cue' | 'checks'>[] = [
  { id: 0, name: PHASE_NAMES[0], pose: H.approach, x: -2.48 },
  { id: 1, name: PHASE_NAMES[1], pose: H.plant, x: -0.92 },
  { id: 2, name: PHASE_NAMES[2], pose: H.load, x: -0.62 },
]

const SHARED_TEXT: Pick<HitPhase, 'cue' | 'checks'>[] = [
  {
    cue: 'Start slow and finish fast. The approach turns running speed into height, so the last two steps are the quickest. Don’t go until the set is on its way.',
    checks: [
      { anchor: 'feet', text: 'Right-handed: right, left, then a quick right-left. Left-handers mirror it. A three-step approach drops the first step.' },
      { anchor: 'head', text: 'Watch the ball off the setter’s hands. Where it is going decides where you go.' },
      { anchor: 'hitHand', text: 'Arms loose, swinging with your stride. Save the big swing for the plant.' },
    ],
  },
  {
    cue: 'The big step. A long, fast step with your right, then the left closes beside it. Both arms swing all the way back.',
    checks: [
      { anchor: 'feet', text: 'Plant heel first with both feet ahead of your hips, left foot slightly ahead. That stops you going forward and sends you up.' },
      { anchor: 'knee', text: 'Knees and hips bend deep, like a standing broad jump. This is where your height comes from.' },
      { anchor: 'hitHand', text: 'Both arms straight and swung back high behind you.', offset: [-0.34, 0.06] },
      { anchor: 'head', text: 'Chest forward over your knees, eyes up on the ball.' },
    ],
  },
  {
    cue: 'Jump up, not forward. Both arms swing up together, then the hitting arm draws back like pulling a bowstring.',
    checks: [
      { anchor: 'offHand', text: 'Off arm up, pointing at the ball. It helps you track it and gives the swing something to pull against.' },
      { anchor: 'elbow', text: 'Hitting elbow high, level with your shoulder or above it, hand back by your ear.', offset: [-0.34, 0.06] },
      { anchor: 'shoulders', text: 'Shoulders turned so the hitting shoulder is back. The swing uncoils from here.', offset: [-0.4, -0.12] },
      { anchor: 'feet', text: 'You took off from both feet and are going mostly up, so you will land close to where you jumped.' },
    ],
  },
]

const FINISH: Record<HitTechnique, Omit<HitPhase, 'ball'>[]> = {
  swing: [
    {
      id: 3,
      name: PHASE_NAMES[3],
      pose: H.swingContact,
      x: -0.38,
      cue: 'Reach high and hit the ball in front of your hitting shoulder. Fast arm, loose wrist.',
      checks: [
        { anchor: 'hitHand', text: 'Full reach: arm straight at contact, as high as you can comfortably hit it. Height opens the court more than power does.', offset: [-0.44, 0.14] },
        { anchor: 'ball', text: 'Ball in front of your hitting shoulder, never behind your head. A ball behind you can only be pushed.', offset: [0.42, 0.16] },
        { anchor: 'hitHand', text: 'Whole open hand on the ball, then snap your wrist over the top. The topspin brings it down inside the court.', offset: [0.44, -0.26] },
        { anchor: 'offHand', text: 'Off arm pulls down to your side as the hitting arm comes through. That pull speeds up the swing.' },
      ],
    },
    {
      id: 4,
      name: PHASE_NAMES[4],
      pose: H.land,
      x: -0.3,
      cue: 'Land on both feet, on your side of the net, and get ready for the next ball.',
      checks: [
        { anchor: 'feet', text: 'Two feet, balanced, near where you took off. Landing on one foot, or on someone else’s under the net, is how ankles get hurt.' },
        { anchor: 'knee', text: 'Knees soft to absorb the landing.', offset: [0.32, -0.08] },
        { anchor: 'hitHand', text: 'The hitting arm follows through down and across your body. Stopping it short is hard on the shoulder.', offset: [-0.34, -0.2] },
        { anchor: 'head', text: 'Eyes up. Cover a blocked ball, or get off the net for the next attack.' },
      ],
    },
  ],
  offspeed: [
    {
      id: 3,
      name: PHASE_NAMES[3],
      pose: H.tipContact,
      x: -0.38,
      cue: 'Same approach, same jump, same arm until the last moment. Then slow the arm and lift the ball over the block with your fingertips.',
      checks: [
        { anchor: 'hitHand', text: 'Fingertips firm and spread, hand a little cupped. One quick touch: a ball that rests in your hand is a catch.', offset: [-0.44, 0.14] },
        { anchor: 'ball', text: 'Contact high and slightly in front, so the ball goes up over the blockers’ hands before it drops.', offset: [0.42, 0.16] },
        { anchor: 'head', text: 'Aim for space: just behind the block, the middle of the court, or a deep corner nobody is in.', offset: [-0.4, 0.1] },
        { anchor: 'offHand', text: 'Off arm still pulls down. It should look like a full swing right up to contact.' },
      ],
    },
    {
      id: 4,
      name: PHASE_NAMES[4],
      pose: H.land,
      x: -0.3,
      cue: 'Land the same way and stay ready. A tip that gets dug comes back quickly.',
      checks: [
        { anchor: 'feet', text: 'Two feet, balanced, on your side of the net.' },
        { anchor: 'knee', text: 'Knees soft to absorb the landing.', offset: [0.32, -0.08] },
        { anchor: 'head', text: 'Watch where it lands. If they dig it, you are first in line to cover or hit again.' },
      ],
    },
  ],
}

/** The five phases for an attack, with the ball's path through them. */
export function hitPhases(technique: HitTechnique): HitPhase[] {
  const base: Omit<HitPhase, 'ball'>[] = [
    ...APPROACH.map((a, i) => ({ ...a, ...SHARED_TEXT[i] })),
    ...FINISH[technique],
  ]
  const contact = ballAtHand(base[3].pose, base[3].x)
  const balls: Pt[] = [
    arcPoint(SET_FROM, contact, 0, 0.1),
    arcPoint(SET_FROM, contact, 0, 0.4),
    arcPoint(SET_FROM, contact, 0, 0.72),
    contact,
    arcPoint(contact, HIT_TO[technique], HIT_ARC[technique], 0.62),
  ]
  return base.map((ph, i) => ({ ...ph, ball: balls[i] }))
}
