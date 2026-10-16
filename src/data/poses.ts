/**
 * Silhouette poses, as joint positions in metres with the feet on the floor
 * at y = 0 and y pointing up. Figures are drawn facing the camera.
 */
export type Pt = [number, number]

export interface Pose {
  /** How far off the floor the whole figure is (jumping). */
  lift: number
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
  stand: {
    lift: 0,
    head: [0, 1.62],
    neck: [0, 1.44],
    hip: [0, 0.92],
    shoulders: [[-0.2, 1.4], [0.2, 1.4]],
    elbows: [[-0.3, 1.1], [0.3, 1.1]],
    hands: [[-0.26, 0.82], [0.26, 0.82]],
    knees: [[-0.14, 0.48], [0.14, 0.48]],
    feet: [[-0.2, 0.02], [0.2, 0.02]],
  },
  ready: {
    lift: 0,
    head: [0, 1.32],
    neck: [0, 1.16],
    hip: [0, 0.72],
    shoulders: [[-0.24, 1.12], [0.24, 1.12]],
    elbows: [[-0.36, 0.86], [0.36, 0.86]],
    hands: [[-0.2, 0.6], [0.2, 0.6]],
    knees: [[-0.38, 0.4], [0.38, 0.4]],
    feet: [[-0.42, 0.02], [0.42, 0.02]],
  },
  pass: {
    lift: 0,
    head: [0, 1.28],
    neck: [0, 1.12],
    hip: [0, 0.7],
    shoulders: [[-0.24, 1.08], [0.24, 1.08]],
    elbows: [[-0.14, 0.8], [0.14, 0.8]],
    hands: [[-0.03, 0.52], [0.03, 0.52]],
    knees: [[-0.38, 0.38], [0.38, 0.38]],
    feet: [[-0.44, 0.02], [0.44, 0.02]],
  },
  set: {
    lift: 0,
    head: [0, 1.6],
    neck: [0, 1.44],
    hip: [0, 0.9],
    shoulders: [[-0.2, 1.4], [0.2, 1.4]],
    elbows: [[-0.38, 1.6], [0.38, 1.6]],
    hands: [[-0.14, 1.86], [0.14, 1.86]],
    knees: [[-0.16, 0.46], [0.16, 0.46]],
    feet: [[-0.2, 0.02], [0.2, 0.02]],
  },
  blockReady: {
    lift: 0,
    head: [0, 1.6],
    neck: [0, 1.44],
    hip: [0, 0.9],
    shoulders: [[-0.22, 1.4], [0.22, 1.4]],
    elbows: [[-0.42, 1.26], [0.42, 1.26]],
    hands: [[-0.4, 1.64], [0.4, 1.64]],
    knees: [[-0.18, 0.46], [0.18, 0.46]],
    feet: [[-0.22, 0.02], [0.22, 0.02]],
  },
  block: {
    lift: 0.45,
    head: [0, 1.62],
    neck: [0, 1.46],
    hip: [0, 0.92],
    shoulders: [[-0.22, 1.42], [0.22, 1.42]],
    elbows: [[-0.26, 1.82], [0.26, 1.82]],
    hands: [[-0.24, 2.22], [0.24, 2.22]],
    knees: [[-0.16, 0.52], [0.16, 0.52]],
    feet: [[-0.2, 0.12], [0.2, 0.12]],
  },
  hit: {
    lift: 0.6,
    head: [0.04, 1.64],
    neck: [0.04, 1.48],
    hip: [0, 0.94],
    shoulders: [[-0.2, 1.44], [0.22, 1.44]],
    elbows: [[-0.46, 1.3], [0.36, 1.82]],
    hands: [[-0.34, 1.02], [0.14, 2.16]],
    knees: [[-0.22, 0.56], [0.26, 0.6]],
    feet: [[-0.34, 0.22], [0.34, 0.26]],
  },
  run: {
    lift: 0,
    head: [0.1, 1.6],
    neck: [0.08, 1.44],
    hip: [0, 0.92],
    shoulders: [[-0.16, 1.4], [0.2, 1.4]],
    elbows: [[-0.4, 1.2], [0.38, 1.56]],
    hands: [[-0.22, 1.0], [0.52, 1.42]],
    knees: [[-0.32, 0.56], [0.32, 0.5]],
    feet: [[-0.52, 0.16], [0.2, 0.02]],
  },
}

/** Height of the top of the figure (plus lift), for placing name tags. */
export function poseTop(pose: Pose): number {
  const ys = [pose.head[1] + 0.16, pose.hands[0][1], pose.hands[1][1]]
  return Math.max(...ys) + pose.lift
}
