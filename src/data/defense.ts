import type { Pos, Zone } from './court'

export type DefenseSystem = 'perimeter' | 'rotation' | 'middleUp'
export type AttackOrigin = 'left' | 'middle' | 'right'

export const SYSTEMS: DefenseSystem[] = ['perimeter', 'rotation', 'middleUp']
export const ORIGINS: AttackOrigin[] = ['left', 'middle', 'right']

export interface DefenseInfo {
  name: string
  tagline: string
  description: string
  bestAgainst: string
  weakness: string
}

export const DEFENSES: Record<DefenseSystem, DefenseInfo> = {
  perimeter: {
    name: 'Perimeter',
    tagline: 'Guard the edges, let the block take the middle.',
    description:
      'The most common system at every level. The three back-row players hold the perimeter of the court and the off-blocker drops to the attack line, so hard-driven balls into the corners are covered.',
    bestAgainst: 'Teams that hit hard and deep.',
    weakness: 'Tips and roll shots just over the block.',
  },
  rotation: {
    name: 'Rotation',
    tagline: 'The back row turns toward the hitter.',
    description:
      'As the set goes outside, the back row rotates in the direction of the attack: the line defender comes up for tips, middle back slides to the deep line corner, and the far back-row player covers the deep middle.',
    bestAgainst: 'Outside hitters who tip and roll a lot.',
    weakness: 'The sharp cross-court seam in front of the off-blocker.',
  },
  middleUp: {
    name: 'Middle up',
    tagline: 'A tip specialist behind the block.',
    description:
      'Middle back comes up behind the block to take tips and dinks while the two wing defenders cover the deep corners. Simple to teach and strong against off-speed shots.',
    bestAgainst: 'Younger teams and opponents who tip more than they swing.',
    weakness: 'Anything hard down the middle lands.',
  },
}

export const ORIGIN_LABEL: Record<AttackOrigin, string> = {
  left: 'Their right side',
  middle: 'Their middle',
  right: 'Their outside',
}

export const ORIGIN_BLURB: Record<AttackOrigin, string> = {
  left: 'The opposite hitter attacking from their right front, which is our left.',
  middle: 'A quick set to their middle. The ball is up and down fast, so only one blocker gets there.',
  right: 'Their outside hitter from the left front, which is our right. The most common attack in volleyball.',
}

/** Where the attacker stands on the opponent’s side (negative y is past the net). */
export const ATTACKER: Record<AttackOrigin, Pos> = {
  left: { x: 1.4, y: -0.9 },
  middle: { x: 4.5, y: -0.9 },
  right: { x: 7.6, y: -0.9 },
}

export interface Shot {
  name: string
  to: Pos
}

/** The shots a hitter has from each origin, drawn as dashed lanes. */
export const SHOTS: Record<AttackOrigin, Shot[]> = {
  right: [
    { name: 'Line', to: { x: 8.6, y: 8.7 } },
    { name: 'Cross-court', to: { x: 0.7, y: 8.4 } },
    { name: 'Sharp angle', to: { x: 1.2, y: 3.4 } },
    { name: 'Tip', to: { x: 6.3, y: 2.5 } },
  ],
  left: [
    { name: 'Line', to: { x: 0.4, y: 8.7 } },
    { name: 'Cross-court', to: { x: 8.3, y: 8.4 } },
    { name: 'Sharp angle', to: { x: 7.8, y: 3.4 } },
    { name: 'Tip', to: { x: 2.7, y: 2.5 } },
  ],
  middle: [
    { name: 'Hard middle', to: { x: 4.5, y: 8.7 } },
    { name: 'Angle left', to: { x: 0.9, y: 7.4 } },
    { name: 'Angle right', to: { x: 8.1, y: 7.4 } },
    { name: 'Tip', to: { x: 4.5, y: 3.2 } },
  ],
}

export interface DefenseRead {
  positions: Record<Zone, Pos>
  notes: Record<Zone, string>
  blockers: Zone[]
}

export const BASE_POSITIONS: Record<Zone, Pos> = {
  4: { x: 1.5, y: 1.2 },
  3: { x: 4.5, y: 1.0 },
  2: { x: 7.5, y: 1.2 },
  5: { x: 1.6, y: 5.8 },
  6: { x: 4.5, y: 7.2 },
  1: { x: 7.4, y: 5.8 },
}

const BASE_NOTES: Record<Zone, string> = {
  4: 'Left front. At the net with hands up, watching their setter to see where the set goes.',
  3: 'Middle front. Ready to block their quick attack, then close to either pin.',
  2: 'Right front. At the net with hands up, watching their setter.',
  5: 'Left back. Base position: hold here until the set goes up, then move to the read spot.',
  6: 'Middle back. Base position, deep and central, until the set shows where the attack is coming from.',
  1: 'Right back. Base position: hold here until the set goes up, then move to the read spot.',
}

export function baseRead(system: DefenseSystem): DefenseRead {
  const positions = { ...BASE_POSITIONS }
  const notes = { ...BASE_NOTES }
  if (system === 'middleUp') {
    positions[6] = { x: 4.5, y: 5.4 }
    notes[6] = 'Middle back starts a little higher in this system, ready to get behind the block.'
  }
  return { positions, notes, blockers: [] }
}

const BLOCK_NOTES = {
  outside: 'Outside blocker. Sets the block on the hitter’s shoulder and takes away the line.',
  middle: 'Middle blocker. Closes to the outside blocker so there is no seam in the block.',
}

/** Reads for an attack from our right (their outside hitter); the left is a mirror. */
const RIGHT_READS: Record<DefenseSystem, DefenseRead> = {
  perimeter: {
    blockers: [2, 3],
    positions: {
      2: { x: 7.7, y: 0.6 },
      3: { x: 6.6, y: 0.6 },
      4: { x: 2.2, y: 3.2 },
      1: { x: 8.2, y: 6.6 },
      6: { x: 4.6, y: 8.0 },
      5: { x: 1.4, y: 6.6 },
    },
    notes: {
      2: BLOCK_NOTES.outside,
      3: BLOCK_NOTES.middle,
      4: 'Off-blocker. Pulls off the net to the attack line to dig tips and the sharp cross-court shot.',
      1: 'Line defender. Stays deep on the sideline, outside the block shadow, for the hard line shot.',
      6: 'Deep middle. Reads the seam of the block and takes anything hard and deep.',
      5: 'Cross-court defender. Deep in the corner for the big cross-court swing.',
    },
  },
  rotation: {
    blockers: [2, 3],
    positions: {
      2: { x: 7.7, y: 0.6 },
      3: { x: 6.6, y: 0.6 },
      1: { x: 7.6, y: 3.4 },
      6: { x: 8.0, y: 7.8 },
      5: { x: 3.4, y: 7.6 },
      4: { x: 1.6, y: 4.0 },
    },
    notes: {
      2: BLOCK_NOTES.outside,
      3: BLOCK_NOTES.middle,
      1: 'Rotates up behind the block to the attack line for tips and roll shots down the line.',
      6: 'Rotates to the deep line corner to cover the hard line shot the block leaves open.',
      5: 'Rotates into the deep middle to take the cross-court swing.',
      4: 'Off-blocker. Drops to the attack line to cover the sharp cross-court angle.',
    },
  },
  middleUp: {
    blockers: [2, 3],
    positions: {
      2: { x: 7.7, y: 0.6 },
      3: { x: 6.6, y: 0.6 },
      6: { x: 6.2, y: 3.4 },
      1: { x: 8.0, y: 7.4 },
      5: { x: 1.6, y: 7.4 },
      4: { x: 2.0, y: 3.4 },
    },
    notes: {
      2: BLOCK_NOTES.outside,
      3: BLOCK_NOTES.middle,
      6: 'Comes up behind the block to dig tips and dinks. Gives up the deep middle.',
      1: 'Deep on the line for the hard line shot.',
      5: 'Deep in the cross-court corner.',
      4: 'Off-blocker. Covers the sharp cross-court shot at the attack line.',
    },
  },
}

const MIRROR_ZONE: Record<Zone, Zone> = { 1: 5, 5: 1, 2: 4, 4: 2, 3: 3, 6: 6 }

function mirror(read: DefenseRead): DefenseRead {
  const positions = {} as Record<Zone, Pos>
  const notes = {} as Record<Zone, string>
  for (const z of [1, 2, 3, 4, 5, 6] as Zone[]) {
    const from = MIRROR_ZONE[z]
    positions[z] = { x: 9 - read.positions[from].x, y: read.positions[from].y }
    notes[z] = read.notes[from]
  }
  return { positions, notes, blockers: read.blockers.map((z) => MIRROR_ZONE[z]) }
}

function middleRead(system: DefenseSystem): DefenseRead {
  const read: DefenseRead = {
    blockers: [3],
    positions: {
      3: { x: 4.5, y: 0.6 },
      4: { x: 1.8, y: 2.6 },
      2: { x: 7.2, y: 2.6 },
      5: { x: 1.6, y: 6.4 },
      6: { x: 4.5, y: 7.6 },
      1: { x: 7.4, y: 6.4 },
    },
    notes: {
      3: 'Middle blocker. Takes the quick attack alone; there is no time for help.',
      4: 'Wing blocker who could not close in time. Pulls off to the attack line for off-speed shots to this side.',
      2: 'Wing blocker who could not close in time. Pulls off to the attack line for off-speed shots to this side.',
      5: 'Deep on the angle to this side of the court.',
      6: 'Deep middle for the hard hit over the single block.',
      1: 'Deep on the angle to this side of the court.',
    },
  }
  if (system === 'middleUp') {
    read.positions[6] = { x: 4.5, y: 3.6 }
    read.positions[5] = { x: 1.4, y: 7.2 }
    read.positions[1] = { x: 7.6, y: 7.2 }
    read.notes[6] = 'Behind the single block for the tip. The hard middle hit is the price.'
  }
  return read
}

export function defenseRead(system: DefenseSystem, origin: AttackOrigin): DefenseRead {
  if (origin === 'right') return RIGHT_READS[system]
  if (origin === 'left') return mirror(RIGHT_READS[system])
  return middleRead(system)
}

/** Half-width of one blocker’s reach, for drawing the block shadow. */
export const BLOCK_REACH = 0.55
