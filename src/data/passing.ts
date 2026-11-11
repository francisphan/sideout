/**
 * The passing lesson: one passer seen side-on, facing the net (+x), stepped
 * through ready, move, contact and finish. Poses use the same joint format as
 * the court silhouettes (metres, feet on the floor at y = 0, y up), drawn in
 * profile. Ball positions are in the same frame.
 */
import type { Pose, Pt } from './poses'

export type Technique = 'forearm' | 'overhand'
export type Stance = 'low' | 'tall'
export type PassPhaseId = 0 | 1 | 2 | 3

/** Where a numbered checkpoint marker points on the figure. */
export type Anchor =
  | 'head'
  | 'shoulders'
  | 'hip'
  | 'knee'
  | 'feet'
  | 'hands'
  | 'elbows'
  | 'platform'
  | 'ball'

export interface Checkpoint {
  anchor: Anchor
  text: string
  /** Where the numbered marker sits relative to its anchor, when the default would collide. */
  offset?: Pt
}

export interface PassPhase {
  id: PassPhaseId
  name: string
  pose: Pose
  /** Where the passer stands, in metres along the floor. */
  x: number
  ball: Pt
  cue: string
  checks: Checkpoint[]
}

export const BALL_R = 0.11
/** Where the serve enters the frame and the pass leaves it. */
export const SERVE_FROM: Record<Technique, Pt> = { forearm: [3.25, 2.25], overhand: [3.25, 2.6] }
export const PASS_TO: Pt = [3.4, 2.75]

export const PHASE_NAMES = ['Ready', 'Move', 'Contact', 'Finish'] as const

const profile = (p: Omit<Pose, 'profile'>): Pose => ({ ...p, profile: true })

export const PASS_POSES = {
  // Low: the bend is in the knees and ankles, chest forward over the knees.
  lowReady: profile({
    lift: 0,
    head: [0.4, 1.27],
    neck: [0.3, 1.12],
    hip: [-0.06, 0.64],
    shoulders: [[0.2, 1.07], [0.28, 1.07]],
    elbows: [[0.36, 0.84], [0.44, 0.86]],
    hands: [[0.62, 0.74], [0.7, 0.76]],
    knees: [[0.3, 0.4], [-0.24, 0.3]],
    feet: [[0.34, 0.02], [-0.44, 0.02]],
  }),
  lowMove: profile({
    lift: 0.03,
    head: [0.42, 1.27],
    neck: [0.32, 1.12],
    hip: [-0.04, 0.64],
    shoulders: [[0.22, 1.07], [0.3, 1.07]],
    elbows: [[0.34, 0.84], [0.48, 0.86]],
    hands: [[0.58, 0.72], [0.74, 0.76]],
    knees: [[0.26, 0.38], [-0.16, 0.32]],
    feet: [[0.22, 0.02], [-0.3, 0.04]],
  }),
  lowContact: profile({
    lift: 0,
    head: [0.36, 1.26],
    neck: [0.28, 1.1],
    hip: [-0.06, 0.64],
    shoulders: [[0.2, 1.05], [0.26, 1.05]],
    elbows: [[0.46, 0.84], [0.5, 0.84]],
    hands: [[0.72, 0.62], [0.76, 0.63]],
    knees: [[0.3, 0.4], [-0.24, 0.3]],
    feet: [[0.34, 0.02], [-0.44, 0.02]],
  }),
  lowFinish: profile({
    lift: 0,
    head: [0.42, 1.36],
    neck: [0.33, 1.2],
    hip: [0.02, 0.72],
    shoulders: [[0.25, 1.14], [0.31, 1.14]],
    elbows: [[0.52, 0.94], [0.56, 0.94]],
    hands: [[0.8, 0.75], [0.84, 0.76]],
    knees: [[0.34, 0.44], [-0.18, 0.34]],
    feet: [[0.34, 0.02], [-0.44, 0.04]],
  }),
  // Tall: hips high, knees only softly bent, contact around the waist.
  tallReady: profile({
    lift: 0,
    head: [0.26, 1.6],
    neck: [0.18, 1.44],
    hip: [-0.04, 0.88],
    shoulders: [[0.1, 1.38], [0.18, 1.38]],
    elbows: [[0.3, 1.12], [0.38, 1.14]],
    hands: [[0.54, 1.0], [0.62, 1.02]],
    knees: [[0.18, 0.48], [-0.16, 0.46]],
    feet: [[0.24, 0.02], [-0.32, 0.02]],
  }),
  tallMove: profile({
    lift: 0.04,
    head: [0.28, 1.6],
    neck: [0.2, 1.44],
    hip: [-0.02, 0.88],
    shoulders: [[0.12, 1.38], [0.2, 1.38]],
    elbows: [[0.28, 1.12], [0.42, 1.14]],
    hands: [[0.5, 0.98], [0.66, 1.02]],
    knees: [[0.16, 0.48], [-0.12, 0.47]],
    feet: [[0.16, 0.02], [-0.22, 0.05]],
  }),
  tallContact: profile({
    lift: 0,
    head: [0.24, 1.58],
    neck: [0.17, 1.42],
    hip: [-0.04, 0.88],
    shoulders: [[0.12, 1.36], [0.18, 1.36]],
    elbows: [[0.4, 1.14], [0.44, 1.14]],
    hands: [[0.66, 0.92], [0.7, 0.93]],
    knees: [[0.18, 0.48], [-0.16, 0.46]],
    feet: [[0.24, 0.02], [-0.32, 0.02]],
  }),
  tallFinish: profile({
    lift: 0,
    head: [0.26, 1.62],
    neck: [0.19, 1.46],
    hip: [-0.02, 0.9],
    shoulders: [[0.14, 1.4], [0.2, 1.4]],
    elbows: [[0.42, 1.2], [0.46, 1.2]],
    hands: [[0.7, 1.01], [0.74, 1.02]],
    knees: [[0.18, 0.49], [-0.14, 0.47]],
    feet: [[0.24, 0.02], [-0.32, 0.02]],
  }),
  // Overhand: start loaded, rise to meet a high ball with a window of hands.
  ohReady: profile({
    lift: 0,
    head: [0.3, 1.46],
    neck: [0.22, 1.3],
    hip: [-0.06, 0.76],
    shoulders: [[0.12, 1.25], [0.2, 1.25]],
    elbows: [[0.32, 1.0], [0.4, 1.02]],
    hands: [[0.56, 0.9], [0.64, 0.92]],
    knees: [[0.26, 0.44], [-0.2, 0.38]],
    feet: [[0.3, 0.02], [-0.38, 0.02]],
  }),
  ohMove: profile({
    lift: 0.03,
    head: [0.2, 1.5],
    neck: [0.14, 1.34],
    hip: [-0.06, 0.78],
    shoulders: [[0.06, 1.3], [0.12, 1.3]],
    elbows: [[0.28, 1.4], [0.32, 1.42]],
    hands: [[0.24, 1.68], [0.28, 1.7]],
    knees: [[0.2, 0.44], [-0.18, 0.4]],
    feet: [[0.22, 0.02], [-0.3, 0.04]],
  }),
  ohContact: profile({
    lift: 0,
    head: [0.12, 1.5],
    neck: [0.08, 1.34],
    hip: [-0.06, 0.78],
    shoulders: [[0.02, 1.32], [0.08, 1.32]],
    elbows: [[0.3, 1.42], [0.34, 1.44]],
    hands: [[0.24, 1.74], [0.28, 1.76]],
    knees: [[0.24, 0.44], [-0.2, 0.4]],
    feet: [[0.28, 0.02], [-0.36, 0.02]],
  }),
  ohFinish: profile({
    lift: 0.07,
    head: [0.12, 1.64],
    neck: [0.08, 1.48],
    hip: [0, 0.94],
    shoulders: [[0.04, 1.46], [0.1, 1.46]],
    elbows: [[0.28, 1.74], [0.32, 1.76]],
    hands: [[0.46, 2.04], [0.5, 2.06]],
    knees: [[0.14, 0.5], [-0.12, 0.5]],
    feet: [[0.14, 0.04], [-0.24, 0.02]],
  }),
} satisfies Record<string, Pose>

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

/** The near forearm, elbow to wrist: the platform. */
export function platform(pose: Pose): [Pt, Pt] {
  return [pose.elbows[1], pose.hands[1]]
}

/** Unit vector out of the platform's face, the way a ball off it will leave. */
export function platformNormal(pose: Pose): Pt {
  const [e, h] = platform(pose)
  const dx = h[0] - e[0]
  const dy = h[1] - e[1]
  const len = Math.hypot(dx, dy)
  return [-dy / len, dx / len]
}

/** The ball resting on a forearm platform, a hand's width above the wrists. */
function ballOnPlatform(pose: Pose, x: number): Pt {
  const [e, h] = platform(pose)
  const t = 0.72
  const n = platformNormal(pose)
  const reach = BALL_R + 0.07
  return [x + e[0] + (h[0] - e[0]) * t + n[0] * reach, e[1] + (h[1] - e[1]) * t + n[1] * reach]
}

/** The ball sitting in the window of an overhand pass. */
function ballInHands(pose: Pose, x: number): Pt {
  const h = mid(pose.hands[0], pose.hands[1])
  return [x + h[0] + 0.06, h[1] + pose.lift + 0.12]
}

/** Point on the quadratic curve a→b bulging by `lift` at the middle. */
export function arcPoint(a: Pt, b: Pt, lift: number, t: number): Pt {
  const c: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift]
  const u = 1 - t
  return [
    u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
  ]
}

export const SERVE_ARC = 0.25
export const PASS_ARC: Record<Technique, number> = { forearm: 0.9, overhand: 0.4 }

/** A point in the world frame for a checkpoint marker. */
export function anchorPoint(phase: PassPhase, anchor: Anchor): Pt {
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
      return at(mid(p.hands[0], p.hands[1]))
    case 'elbows':
      return at(p.elbows[1])
    case 'platform': {
      const [e, h] = platform(p)
      return at(mid(e, h))
    }
    case 'ball':
      return phase.ball
  }
}

const P = PASS_POSES

const FOREARM_LOW: Omit<PassPhase, 'ball'>[] = [
  {
    id: 0,
    name: PHASE_NAMES[0],
    pose: P.lowReady,
    x: -0.6,
    cue: 'Get low before the serve, not after it. Be in your stance while the server tosses, so the only thing left to do is move.',
    checks: [
      { anchor: 'feet', text: 'Feet wider than your shoulders, one foot half a step ahead. Usually the right, toward the setter.' },
      { anchor: 'knee', text: 'Knees bent and out over your toes. The bend comes from your legs, not your back.' },
      { anchor: 'head', text: 'Chest and head forward of your knees, so your weight is on the balls of your feet.' },
      { anchor: 'hands', text: 'Arms out in front and apart, relaxed. Don’t join them yet.' },
    ],
  },
  {
    id: 1,
    name: PHASE_NAMES[1],
    pose: P.lowMove,
    x: -0.25,
    cue: 'Feet first, arms last. Shuffle until the ball is coming at the middle of your body, and stay just as low while you go.',
    checks: [
      { anchor: 'feet', text: 'Shuffle without crossing your feet, unless the ball is more than a couple of steps away.' },
      { anchor: 'hip', text: 'Hips stay at the same height. Bobbing up and down makes the ball look like it is moving.' },
      { anchor: 'head', text: 'Eyes on the ball the whole way, right onto your arms.' },
      { anchor: 'hands', text: 'Arms stay apart while you move. Running with them joined is slow and pulls your shoulders up.' },
    ],
  },
  {
    id: 2,
    name: PHASE_NAMES[2],
    pose: P.lowContact,
    x: 0,
    cue: 'Arrive early and be still. Join your arms as the ball comes in and let it come to you.',
    checks: [
      { anchor: 'platform', text: 'Flat platform: thumbs together and pointing at the floor, elbows locked. The ball meets your forearms a hand’s width above the wrists.' },
      { anchor: 'ball', text: 'Contact out in front of you, between your waist and your knees.' },
      { anchor: 'shoulders', text: 'Your shoulders angle the platform at the target. The ball leaves the way your arms face.' },
      { anchor: 'knee', text: 'Still low. Standing up as you pass changes the platform angle at the worst moment.', offset: [0.3, -0.12] },
    ],
  },
  {
    id: 3,
    name: PHASE_NAMES[3],
    pose: P.lowFinish,
    x: 0.05,
    cue: 'Let the platform do the work. A hard serve needs almost no swing. A slow one needs a small push from your legs, not your arms.',
    checks: [
      { anchor: 'hip', text: 'Legs extend gently toward the target, not straight up.' },
      { anchor: 'hands', text: 'Arms finish below your shoulders. Swinging higher sends the ball over the net.' },
      { anchor: 'platform', text: 'Hold the angle until the ball is gone, then look at where your arms point. That is where the pass went.', offset: [0.05, -0.38] },
    ],
  },
]

const FOREARM_TALL: Omit<PassPhase, 'ball'>[] = [
  {
    id: 0,
    name: PHASE_NAMES[0],
    pose: P.tallReady,
    x: -0.6,
    cue: 'Tall and balanced. A pro passer reads the serve off the toss and the server’s hand, and wants to be one step from an attack approach.',
    checks: [
      { anchor: 'feet', text: 'Feet about shoulder width, one foot slightly ahead.' },
      { anchor: 'knee', text: 'Knees softly bent and hips high, so the first step is quick.' },
      { anchor: 'head', text: 'Chest over the toes, weight forward.' },
      { anchor: 'hands', text: 'Arms loose in front, ready to drop into a platform.' },
    ],
  },
  {
    id: 1,
    name: PHASE_NAMES[1],
    pose: P.tallMove,
    x: -0.25,
    cue: 'They read early, so they move early. Most of the time a pro is already set before the serve crosses the net.',
    checks: [
      { anchor: 'feet', text: 'One quick move to the ball, then stop.' },
      { anchor: 'hip', text: 'Hips stay high. The aim is to get behind the ball, not under it.' },
      { anchor: 'head', text: 'Eyes on the ball the whole way.' },
      { anchor: 'hands', text: 'Arms apart until the feet are set.' },
    ],
  },
  {
    id: 2,
    name: PHASE_NAMES[2],
    pose: P.tallContact,
    x: 0,
    cue: 'Contact at the waist on a firm, angled platform. A jump serve arrives flat and fast, so there is nothing to get under.',
    checks: [
      { anchor: 'platform', text: 'Same platform: thumbs together and down, elbows locked.' },
      { anchor: 'ball', text: 'Contact around the waist, still in front of the body.' },
      { anchor: 'shoulders', text: 'The shoulders set the angle. The arms barely move.' },
      { anchor: 'knee', text: 'Legs quiet. A hard serve brings its own speed.' },
    ],
  },
  {
    id: 3,
    name: PHASE_NAMES[3],
    pose: P.tallFinish,
    x: 0.05,
    cue: 'Pass, then go. Staying tall lets the passer turn the pass into an approach a step later.',
    checks: [
      { anchor: 'hip', text: 'Little leg drive. Against a hard serve the platform soaks up pace instead of adding it.' },
      { anchor: 'hands', text: 'Arms finish below the shoulders.' },
      { anchor: 'feet', text: 'The first step of the approach is already coming.' },
    ],
  },
]

const OVERHAND: Omit<PassPhase, 'ball'>[] = [
  {
    id: 0,
    name: PHASE_NAMES[0],
    pose: P.ohReady,
    x: -0.6,
    cue: 'Same base stance. Read the toss and the server’s arm: a float serve that will reach you at chest height or above is a ball for your hands.',
    checks: [
      { anchor: 'feet', text: 'Feet shoulder width or a little wider, one foot slightly ahead.' },
      { anchor: 'knee', text: 'Knees bent and loaded. You will rise to meet this ball, so start lower than you finish.' },
      { anchor: 'head', text: 'Decide early. Hands are a choice you make before the ball crosses the net, not at the last second.' },
    ],
  },
  {
    id: 1,
    name: PHASE_NAMES[1],
    pose: P.ohMove,
    x: -0.2,
    cue: 'Get your feet behind the ball and your forehead under it. Then get your hands up, early.',
    checks: [
      { anchor: 'feet', text: 'Move until the ball is coming at your forehead. Don’t reach up or sideways for it.' },
      { anchor: 'head', text: 'Face the target as much as you can. With your hands, the ball goes where you face.' },
      { anchor: 'hands', text: 'Hands up in front of your forehead before the ball gets there. Late hands are where lifts and doubles come from.' },
    ],
  },
  {
    id: 2,
    name: PHASE_NAMES[2],
    pose: P.ohContact,
    x: 0,
    cue: 'Firm hands. A serve has pace, so this is closer to a push than a soft set.',
    checks: [
      { anchor: 'hands', text: 'A window above your forehead: thumbs and index fingers make a triangle you can see the ball through. Contact on the finger pads, never the palms.' },
      { anchor: 'elbows', text: 'Elbows out and in front, about shoulder width apart. Wrists bent back and firm.' },
      { anchor: 'knee', text: 'Knees still bent. Your legs supply the push.' },
    ],
  },
  {
    id: 3,
    name: PHASE_NAMES[3],
    pose: P.ohFinish,
    x: 0.05,
    cue: 'Arms and legs extend together toward the target. The ball should leave with little or no spin.',
    checks: [
      { anchor: 'hands', text: 'Finish long, arms reaching toward the target with your palms facing it.' },
      { anchor: 'feet', text: 'Up on your toes as your legs straighten.' },
      { anchor: 'ball', text: 'Spin means the hands didn’t touch it at the same moment. Clean matters more than pretty.' },
    ],
  },
]

/** The four phases for a technique; stance only changes the forearm pass. */
export function passPhases(technique: Technique, stance: Stance): PassPhase[] {
  const base = technique === 'overhand' ? OVERHAND : stance === 'low' ? FOREARM_LOW : FOREARM_TALL
  const contact = base[2]
  const ballAtContact =
    technique === 'overhand' ? ballInHands(contact.pose, contact.x) : ballOnPlatform(contact.pose, contact.x)
  const from = SERVE_FROM[technique]
  const balls: Pt[] = [
    from,
    arcPoint(from, ballAtContact, SERVE_ARC, 0.62),
    ballAtContact,
    arcPoint(ballAtContact, PASS_TO, PASS_ARC[technique], 0.55),
  ]
  return base.map((ph, i) => ({ ...ph, ball: balls[i] }))
}

/** Where the ball is touched, for drawing the serve and pass arcs. */
export function contactBall(technique: Technique, stance: Stance): Pt {
  return passPhases(technique, stance)[2].ball
}
