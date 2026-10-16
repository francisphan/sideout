/**
 * Silhouette poses, as joint positions in metres with the feet on the floor
 * at y = 0 and y pointing up. Front-on poses face the camera; profile poses
 * (run, hit) face +x and are mirrored by the court when a player goes the
 * other way.
 */
export type Pt = [number, number]

export interface Pose {
  /** How far off the floor the whole figure is (jumping, or up on the toes). */
  lift: number
  /** Profile poses are drawn side-on and get mirrored to face their direction. */
  profile: boolean
  head: Pt
  neck: Pt
  hip: Pt
  shoulders: [Pt, Pt]
  elbows: [Pt, Pt]
  hands: [Pt, Pt]
  knees: [Pt, Pt]
  feet: [Pt, Pt]
}

export type PoseName = 'stand' | 'ready' | 'pass' | 'set' | 'blockReady' | 'block' | 'hit' | 'run'

export const POSES: Record<PoseName, Pose> = {
  // Waiting: weight even, hands on hips.
  stand: {
    lift: 0,
    profile: false,
    head: [0, 1.62],
    neck: [0, 1.45],
    hip: [0, 0.93],
    shoulders: [[-0.21, 1.41], [0.21, 1.41]],
    elbows: [[-0.37, 1.12], [0.37, 1.12]],
    hands: [[-0.17, 0.96], [0.17, 0.96]],
    knees: [[-0.15, 0.48], [0.15, 0.48]],
    feet: [[-0.22, 0.02], [0.22, 0.02]],
  },
  // Defensive crouch: wide, low, hands out in front.
  ready: {
    lift: 0,
    profile: false,
    head: [0.02, 1.26],
    neck: [0.02, 1.1],
    hip: [0, 0.7],
    shoulders: [[-0.25, 1.06], [0.27, 1.06]],
    elbows: [[-0.4, 0.8], [0.4, 0.8]],
    hands: [[-0.24, 0.56], [0.2, 0.54]],
    knees: [[-0.42, 0.4], [0.4, 0.38]],
    feet: [[-0.48, 0.02], [0.44, 0.02]],
  },
  // Forearm platform angled to the left, where the serve arrives.
  pass: {
    lift: 0,
    profile: false,
    head: [-0.1, 1.26],
    neck: [-0.07, 1.1],
    hip: [0.04, 0.7],
    shoulders: [[-0.3, 1.06], [0.18, 1.06]],
    elbows: [[-0.34, 0.8], [-0.1, 0.8]],
    hands: [[-0.36, 0.5], [-0.28, 0.5]],
    knees: [[-0.42, 0.38], [0.42, 0.38]],
    feet: [[-0.5, 0.02], [0.46, 0.02]],
  },
  // Hands above the forehead, up on the toes.
  set: {
    lift: 0.06,
    profile: false,
    head: [0, 1.62],
    neck: [0, 1.46],
    hip: [0, 0.92],
    shoulders: [[-0.21, 1.42], [0.21, 1.42]],
    elbows: [[-0.42, 1.64], [0.42, 1.64]],
    hands: [[-0.16, 1.92], [0.16, 1.92]],
    knees: [[-0.17, 0.46], [0.17, 0.46]],
    feet: [[-0.2, 0.02], [0.2, 0.02]],
  },
  // At the net, hands up, knees loaded.
  blockReady: {
    lift: 0,
    profile: false,
    head: [0, 1.58],
    neck: [0, 1.42],
    hip: [0, 0.88],
    shoulders: [[-0.23, 1.38], [0.23, 1.38]],
    elbows: [[-0.46, 1.2], [0.46, 1.2]],
    hands: [[-0.44, 1.62], [0.44, 1.62]],
    knees: [[-0.22, 0.44], [0.22, 0.44]],
    feet: [[-0.26, 0.02], [0.26, 0.02]],
  },
  // Airborne, arms pressed over the net.
  block: {
    lift: 0.55,
    profile: false,
    head: [0, 1.6],
    neck: [0, 1.45],
    hip: [0, 0.92],
    shoulders: [[-0.23, 1.42], [0.23, 1.42]],
    elbows: [[-0.28, 1.84], [0.28, 1.84]],
    hands: [[-0.26, 2.26], [0.26, 2.26]],
    knees: [[-0.18, 0.5], [0.18, 0.5]],
    feet: [[-0.22, 0.1], [0.22, 0.1]],
  },
  // Side-on spike at contact: back arched, legs trailing, off arm tucked.
  hit: {
    lift: 0.65,
    profile: true,
    head: [0.14, 1.66],
    neck: [0.08, 1.5],
    hip: [0, 0.95],
    shoulders: [[0.02, 1.46], [0.1, 1.46]],
    elbows: [[0.36, 1.2], [0.12, 1.92]],
    hands: [[0.2, 1.02], [0.34, 2.32]],
    knees: [[-0.22, 0.58], [0.18, 0.56]],
    feet: [[-0.5, 0.3], [-0.08, 0.22]],
  },
  // Side-on mid-stride run, leaning into it.
  run: {
    lift: 0.04,
    profile: true,
    head: [0.3, 1.6],
    neck: [0.22, 1.44],
    hip: [0, 0.94],
    shoulders: [[0.14, 1.4], [0.24, 1.4]],
    elbows: [[-0.24, 1.22], [0.5, 1.22]],
    hands: [[-0.36, 0.98], [0.62, 1.44]],
    knees: [[-0.3, 0.56], [0.44, 0.62]],
    feet: [[-0.64, 0.24], [0.46, 0.1]],
  },
}

/** Height of the top of the figure (plus lift), for placing name tags. */
export function poseTop(pose: Pose): number {
  const ys = [pose.head[1] + 0.16, pose.hands[0][1], pose.hands[1][1]]
  return Math.max(...ys) + pose.lift
}
