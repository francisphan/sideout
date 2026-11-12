/**
 * The blocking lesson: one blocker seen side-on, facing the net (+x), stepped
 * through ready, read, jump, press and landing, with the opposing hitter on
 * the far side drawn from the hitting lesson's poses, mirrored. The net is at
 * x = 0. Poses use the same joint format as the other technique lessons.
 */
import { HIT_POSES } from './hitting'
import { arcPoint } from './passing'
import type { Pose, Pt } from './poses'

export type BlockTechnique = 'stuff' | 'soft'
export type BlockPhaseId = 0 | 1 | 2 | 3 | 4

export type BlockAnchor = 'head' | 'shoulders' | 'hip' | 'knee' | 'feet' | 'hands' | 'elbow' | 'ball'

export interface BlockCheckpoint {
  anchor: BlockAnchor
  text: string
  /** Where the numbered marker sits relative to its anchor, when the default would collide. */
  offset?: Pt
}

export interface BlockPhase {
  id: BlockPhaseId
  name: string
  pose: Pose
  /** Where the blocker is, in metres along the floor (the net is at 0). */
  x: number
  /** The opposing hitter on the far side, facing back toward the net. */
  hitter: { pose: Pose; x: number }
  ball: Pt
  cue: string
  checks: BlockCheckpoint[]
}

export const NET_X = 0

/** Where the attack is hit from, on the far side of the net. */
export const ATTACK_FROM: Pt = [0.51, 2.82]
/** Where the ball goes off the block, and how much its path bows. */
export const BLOCK_TO: Record<BlockTechnique, Pt> = { stuff: [1.15, 0.1], soft: [-1.9, 3.0] }
export const BLOCK_ARC: Record<BlockTechnique, number> = { stuff: 0.15, soft: 0.6 }

export const PHASE_NAMES = ['Ready', 'Read', 'Jump', 'Press', 'Land'] as const

const profile = (p: Omit<Pose, 'profile'>): Pose => ({ ...p, profile: true })

export const BLOCK_POSES = {
  // An arm's length off the net, hands up in front, knees soft.
  ready: profile({
    lift: 0,
    head: [0.04, 1.6],
    neck: [0.02, 1.44],
    hip: [-0.04, 0.9],
    shoulders: [[0, 1.4], [0.04, 1.4]],
    elbows: [[0.12, 1.2], [0.16, 1.22]],
    hands: [[0.16, 1.5], [0.2, 1.52]],
    knees: [[0.08, 0.48], [0.04, 0.47]],
    feet: [[0.02, 0.02], [-0.06, 0.02]],
  }),
  // Planted square to the net after the footwork, a quick shallow load.
  load: profile({
    lift: 0,
    head: [0.08, 1.38],
    neck: [0.04, 1.22],
    hip: [-0.12, 0.68],
    shoulders: [[0, 1.18], [0.04, 1.18]],
    elbows: [[0.14, 1.0], [0.18, 1.02]],
    hands: [[0.2, 1.3], [0.24, 1.32]],
    knees: [[0.18, 0.4], [0.14, 0.38]],
    feet: [[0.04, 0.02], [-0.04, 0.02]],
  }),
  // Rising straight up, arms going up in front of the face.
  jump: profile({
    lift: 0.3,
    head: [0.05, 1.64],
    neck: [0.02, 1.48],
    hip: [-0.02, 0.94],
    shoulders: [[0, 1.44], [0.04, 1.44]],
    elbows: [[0.14, 1.72], [0.18, 1.74]],
    hands: [[0.18, 2.0], [0.22, 2.02]],
    knees: [[0.08, 0.5], [0.04, 0.5]],
    feet: [[0, 0.06], [-0.08, 0.06]],
  }),
  // At the top, arms reaching over the net and pressing down into their court.
  stuff: profile({
    lift: 0.7,
    head: [0.08, 1.62],
    neck: [0.04, 1.48],
    hip: [-0.06, 0.95],
    shoulders: [[0.04, 1.44], [0.08, 1.44]],
    elbows: [[0.26, 1.66], [0.27, 1.68]],
    hands: [[0.45, 1.88], [0.46, 1.9]],
    knees: [[0.06, 0.5], [0.02, 0.5]],
    feet: [[-0.06, 0.08], [-0.12, 0.06]],
  }),
  // At the top, arms straight up behind the net, hands tilted back.
  soft: profile({
    lift: 0.62,
    head: [0.06, 1.64],
    neck: [0.04, 1.48],
    hip: [-0.04, 0.95],
    shoulders: [[0.04, 1.44], [0.08, 1.44]],
    elbows: [[0.1, 1.76], [0.12, 1.76]],
    hands: [[0.12, 2.04], [0.14, 2.04]],
    knees: [[0.06, 0.5], [0.02, 0.5]],
    feet: [[-0.06, 0.08], [-0.12, 0.06]],
  }),
  // Two feet, knees bent, hands coming down on this side of the net.
  land: profile({
    lift: 0,
    head: [0.1, 1.42],
    neck: [0.04, 1.28],
    hip: [-0.06, 0.74],
    shoulders: [[0, 1.24], [0.04, 1.24]],
    elbows: [[0.14, 1.08], [0.18, 1.1]],
    hands: [[0.2, 1.32], [0.24, 1.34]],
    knees: [[0.18, 0.42], [0.12, 0.4]],
    feet: [[0.06, 0.02], [-0.04, 0.02]],
  }),
} satisfies Record<string, Pose>

const B = BLOCK_POSES
const HP = HIT_POSES

/** The opposing hitter's poses and distances back from the net, phase by phase. */
const HITTER: { pose: Pose; x: number }[] = [
  { pose: HP.approach, x: 2.98 },
  { pose: HP.plant, x: 1.42 },
  { pose: HP.load, x: 1.12 },
  { pose: HP.swingContact, x: 0.88 },
  { pose: HP.land, x: 0.8 },
]

/** The ball meeting the blocker's hands, on the side the attack comes from. */
function ballAtHands(pose: Pose, x: number): Pt {
  const h = pose.hands[1]
  return [x + h[0] + 0.1, h[1] + pose.lift + 0.05]
}

/** A point in the world frame for a checkpoint marker. */
export function blockAnchorPoint(phase: BlockPhase, anchor: BlockAnchor): Pt {
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
    case 'hands':
      return at(p.hands[1])
    case 'elbow':
      return at(p.elbows[1])
    case 'ball':
      return phase.ball
  }
}

type Text = Pick<BlockPhase, 'cue' | 'checks'>

/** Ready, read and jump are the same whichever way you block. */
const SHARED: (Text & { pose: Pose; x: number })[] = [
  {
    pose: B.ready,
    x: -0.55,
    cue: 'Stand an arm’s length off the net, square to it, hands up. Know which hitter is yours before the ball is set.',
    checks: [
      { anchor: 'feet', text: 'Feet about shoulder width, weight on the balls of your feet, knees soft.' },
      { anchor: 'hands', text: 'Hands up at shoulder height or above, in front of you, palms toward the net. Keep them there.', offset: [0.34, 0.12] },
      { anchor: 'elbow', text: 'Elbows in front of your body, not out to the sides.', offset: [0.34, -0.14] },
      { anchor: 'head', text: 'Eyes on the setter, then the set, then your hitter.' },
    ],
  },
  {
    pose: B.load,
    x: -0.5,
    cue: 'Follow the set with your feet, plant square to the net, and load. From here on, watch the hitter, not the ball.',
    checks: [
      { anchor: 'feet', text: 'Shuffle for a short move, crossover step for a long one. Finish square, shoulders parallel to the net.' },
      { anchor: 'knee', text: 'A quick, shallow bend. A deep squat is too slow at the net.' },
      { anchor: 'hands', text: 'Hands stay up while you move. Dropping them and swinging them back up is late every time.', offset: [0.34, 0.12] },
      { anchor: 'head', text: 'Watch the hitter’s approach and shoulder. That tells you where the ball is going.' },
    ],
  },
  {
    pose: B.jump,
    x: -0.4,
    cue: 'Jump just after the hitter does. A beat after them on a high outside set, with them on a quick set in the middle.',
    checks: [
      { anchor: 'hands', text: 'Arms go up in front of your face, close to the net. Don’t swing them up from your hips.', offset: [0.36, 0.06] },
      { anchor: 'feet', text: 'Straight up off both feet. Drifting into the net is a fault.' },
      { anchor: 'head', text: 'Eyes open and on the hitter. Most blockers flinch here.', offset: [-0.34, 0.14] },
    ],
  },
]

const FINISH: Record<BlockTechnique, (Text & { pose: Pose; x: number })[]> = {
  stuff: [
    {
      pose: B.stuff,
      x: -0.4,
      cue: 'Reach over the net and press your hands down into their court. Press, don’t swing.',
      checks: [
        { anchor: 'hands', text: 'Hands over the net, fingers spread and firm, angled down toward the middle of their court.', offset: [-0.1, 0.34] },
        { anchor: 'shoulders', text: 'Arms straight and shoulders shrugged up to your ears, sealing the gap between your arms and the net.', offset: [-0.44, 0.08] },
        { anchor: 'ball', text: 'Take the ball on your hands. Reaching over is legal once they have attacked it.', offset: [0.36, 0.14] },
        { anchor: 'hip', text: 'Core tight and body behind the net. You reach with your arms, not your chest.' },
      ],
    },
    {
      pose: B.land,
      x: -0.42,
      cue: 'Bring your hands back down on your side, land on two feet, then turn and find the ball.',
      checks: [
        { anchor: 'feet', text: 'Two feet, under you. Landing on the hitter’s foot under the net is the classic ankle injury.' },
        { anchor: 'hands', text: 'Hands come straight back down on your side. Touching the net is a fault.', offset: [0.34, 0.14] },
        { anchor: 'head', text: 'Turn toward the ball and get off the net. You might be the next hitter.', offset: [-0.34, 0.14] },
      ],
    },
  ],
  soft: [
    {
      pose: B.soft,
      x: -0.32,
      cue: 'Can’t get over the net? Take away height instead. Arms straight up, hands tilted back, and send the ball up for your team.',
      checks: [
        { anchor: 'hands', text: 'Hands tilted back, palms facing up and toward the net, fingers firm.', offset: [-0.36, 0.14] },
        { anchor: 'ball', text: 'The ball pops up off your hands and stays on your side, where a teammate can play it.', offset: [0.36, 0.16] },
        { anchor: 'elbow', text: 'Arms straight and close together. A gap between them is a hole the ball goes through.', offset: [-0.4, -0.04] },
        { anchor: 'hip', text: 'Body behind the net, arms straight up. No reaching.' },
      ],
    },
    {
      pose: B.land,
      x: -0.44,
      cue: 'Land on two feet and turn to the ball. A soft block is a deflection, so your team still has three touches.',
      checks: [
        { anchor: 'feet', text: 'Two feet, under you, on your side of the centre line.' },
        { anchor: 'hands', text: 'Hands come straight back down. No net.', offset: [0.34, 0.14] },
        { anchor: 'head', text: 'Find the ball and get ready to play it or hit it.', offset: [-0.34, 0.14] },
      ],
    },
  ],
}

/** The five phases for a block, with the hitter and the ball's path through them. */
export function blockPhases(technique: BlockTechnique): BlockPhase[] {
  const steps = [...SHARED, ...FINISH[technique]]
  const press = steps[3]
  const atBlock = ballAtHands(press.pose, press.x)
  const set: Pt = [0.75, 3.7]
  const balls: Pt[] = [
    arcPoint(set, ATTACK_FROM, 0, 0.15),
    arcPoint(set, ATTACK_FROM, 0, 0.45),
    arcPoint(set, ATTACK_FROM, 0, 0.8),
    atBlock,
    arcPoint(atBlock, BLOCK_TO[technique], BLOCK_ARC[technique], 0.6),
  ]
  return steps.map((s, i) => ({
    id: i as BlockPhaseId,
    name: PHASE_NAMES[i],
    hitter: HITTER[i],
    ball: balls[i],
    ...s,
  }))
}

