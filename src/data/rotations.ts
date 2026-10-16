import { isFrontRow, type Pos, type Zone } from './court'
import { LIBERO, LINEUP, specFor, type PlayerSpec } from './roles'

export type RotationNumber = 1 | 2 | 3 | 4 | 5 | 6
export const ROTATIONS: RotationNumber[] = [1, 2, 3, 4, 5, 6]

/**
 * Zone of each lineup player in a given rotation. Rotation 1 has the setter
 * in zone 1; each side-out moves everyone one zone clockwise (zone number
 * minus one, with 1 wrapping to 6).
 */
export function lineupZones(n: RotationNumber): Record<string, Zone> {
  const out: Record<string, Zone> = {}
  LINEUP.forEach((p, i) => {
    out[p.id] = ((((i + 1 - (n - 1) - 1) % 6) + 6) % 6 + 1) as Zone
  })
  return out
}

/** Setter's zone in each rotation, which is how coaches name rotations. */
export function setterZone(n: RotationNumber): Zone {
  return lineupZones(n).S
}

export type ReceivePhase = 0 | 1 | 2 | 3
export const RECEIVE_PHASES: { id: ReceivePhase; name: string; blurb: string }[] = [
  {
    id: 0,
    name: 'Before the serve',
    blurb:
      'Everyone must be in a legal spot relative to their neighbours until the server contacts the ball.',
  },
  {
    id: 1,
    name: 'Serve contact',
    blurb:
      'The overlap rule ends the instant the ball is hit. The setter releases to target and hitters move to their approach spots.',
  },
  {
    id: 2,
    name: 'Pass',
    blurb:
      'The passer sends the ball to target: about a metre off the net, right of centre. Hitters are loaded at the attack line.',
  },
  {
    id: 3,
    name: 'Set and attack',
    blurb:
      'The setter chooses a hitter. Here the ball goes outside to the front-row outside hitter.',
  },
]

export interface ReceivePlayer {
  spec: PlayerSpec
  zone: Zone
  frontRow: boolean
  passer: boolean
  /** Positions for each phase: before serve, at contact (release), pass, set. */
  phases: [Pos, Pos, Pos, Pos]
  note: string
}

export interface ReceiveFormation {
  n: RotationNumber
  title: string
  summary: string
  watch: string[]
  players: ReceivePlayer[]
  serveTo: string
  setTo: string
}

const TARGET: Pos = { x: 6, y: 0.9 }
const LEFT_APPROACH: Pos = { x: 0.8, y: 3.6 }
const MID_APPROACH: Pos = { x: 4.6, y: 2.9 }
const RIGHT_APPROACH: Pos = { x: 8.4, y: 3.6 }
const LEFT_ATTACK: Pos = { x: 1.4, y: 0.9 }
const MID_ATTACK: Pos = { x: 4.9, y: 1.0 }
const RIGHT_ATTACK: Pos = { x: 7.9, y: 0.9 }

interface RawRotation {
  summary: string
  watch: string[]
  preServe: Record<string, Pos>
  passers: string[]
  serveTo: string
  notes: Record<string, string>
}

/**
 * Who passes when the setter is back row (rotations 1 to 3) and one front-row
 * player has to join the two back-row passers: the opposite, or the outside.
 * In rotations 4 to 6 the opposite is back row and passes either way.
 */
export type FrontRowPasser = 'opposite' | 'outside'

export const FRONT_ROW_PASSERS: { value: FrontRowPasser; label: string; hint: string }[] = [
  { value: 'opposite', label: 'Opposite', hint: 'Outside stays free to attack' },
  { value: 'outside', label: 'Outside hitter', hint: 'Opposite hides at the net' },
]

/** Formations where the front-row outside passes and the opposite hides at the net. */
const OUTSIDE_PASSES: Record<RotationNumber, RawRotation> = {
  1: {
    summary:
      'The setter is in right back, so the opposite, a middle and OH1 are front row. OH1 passes on the right with the setter tucked in behind on the sideline. After contact the setter sprints to target, OH1 swings out to the left and the opposite runs the net to the right side.',
    watch: [
      'Setter creeping ahead of OH1 before contact. Zone 1 must stay behind zone 2.',
      'OH1 drifting left of the middle while waiting on the serve.',
    ],
    preServe: {
      OPP: { x: 1.2, y: 0.9 },
      MB1: { x: 4.6, y: 0.9 },
      OH1: { x: 6.6, y: 5.6 },
      OH2: { x: 1.9, y: 6.4 },
      L: { x: 4.4, y: 6.9 },
      S: { x: 8.2, y: 6.4 },
    },
    passers: ['OH2', 'L', 'OH1'],
    serveTo: 'L',
    notes: {
      S: 'Back row in zone 1. Must stay behind OH1 and right of the libero until the serve is contacted, then sprints up the sideline to target.',
      OH1: 'Front row but passing. Must stay ahead of the setter and right of the middle. After the pass, swings out to attack from the left. Some teams skip the switch and let OH1 hit from the right in this rotation.',
      MB1: 'At the net in the middle, out of the passers’ way. Steps off after contact to approach for a quick set.',
      OPP: 'Hides at the net on the left so the three passers own the back court. Runs the net to the right side after contact.',
      OH2: 'Left passer. Owns the left third of the court and the short serve on that side.',
      L: 'In for MB2. Middle passer: takes most serves down the middle and calls the ball early.',
    },
  },
  2: {
    summary:
      'The setter is in middle back and hides near the attack line behind the opposite: a short, easy run to target. OH2 passes from the front row on the left, OH1 and the libero pass from the back, and the middle waits at the net on the right.',
    watch: [
      'Setter stepping ahead of the opposite at the net. Zone 6 must stay behind zone 3.',
      'Libero lining up right of the setter. Zone 5 must stay left of zone 6.',
    ],
    preServe: {
      OH2: { x: 1.6, y: 5.6 },
      OPP: { x: 4.4, y: 0.9 },
      MB1: { x: 7.0, y: 0.9 },
      L: { x: 4.2, y: 6.8 },
      S: { x: 5.4, y: 2.6 },
      OH1: { x: 7.2, y: 6.2 },
    },
    passers: ['OH2', 'L', 'OH1'],
    serveTo: 'L',
    notes: {
      S: 'Zone 6. Must stay behind the opposite and between the libero and OH1. Hiding near the attack line makes the run to target only a few steps.',
      OPP: 'Middle front here. Stands at the net in the centre as a screen for the setter, then runs the net to the right side.',
      MB1: 'Right front. Waits at the net on the right and swings into the middle for a quick after contact.',
      OH2: 'Front-row passer on the left. Must stay ahead of the libero and left of the opposite. Passes, then takes a few steps to attack from the left.',
      L: 'Left-centre passer, in for MB2. Must stay left of the setter.',
      OH1: 'Right passer from zone 1. Must stay behind the middle and right of the setter.',
    },
  },
  3: {
    summary:
      'The hardest run for the setter: from left back all the way to target on the right. The fix is to stack. The setter stands just behind the middle at the left of the net and sprints along the net after contact. OH2 passes from the front row and hits left.',
    watch: [
      'Setter standing ahead of the middle. Zone 5 must stay behind zone 4.',
      'OH1 lining up left of the setter. Zone 6 must stay right of zone 5.',
    ],
    preServe: {
      MB2: { x: 0.9, y: 0.7 },
      S: { x: 1.4, y: 1.9 },
      OH2: { x: 2.6, y: 5.6 },
      OPP: { x: 7.4, y: 0.9 },
      OH1: { x: 4.8, y: 7.0 },
      L: { x: 7.2, y: 6.4 },
    },
    passers: ['OH2', 'OH1', 'L'],
    serveTo: 'OH1',
    notes: {
      S: 'Zone 5. Must stay behind MB2 and left of OH1. Stacking at the net turns a long diagonal run into a straight sprint along the net.',
      MB2: 'Left front. Stands tight to the net so the setter can stack behind. Swings into the middle after contact.',
      OH2: 'Front-row passer in zone 3. Must stay right of the middle, left of the opposite and ahead of OH1. Passes on the left, then attacks from the left.',
      OPP: 'Right front, already on the right side. Just steps off the net to approach.',
      OH1: 'Middle passer from zone 6. Must stay behind OH2 and between the setter and the libero.',
      L: 'Right passer, in for MB1 in zone 1. Must stay behind the opposite.',
    },
  },
  4: {
    summary:
      'The setter is front row on the left, so there are only two front-row hitters. The setter and OH2 stack on the left behind the middle, and the opposite passes from right back. After contact the setter runs the net to target, the middle slides to the centre and OH2 is already home on the left.',
    watch: [
      'Setter standing right of the middle. Zone 4 must stay left of zone 3.',
      'OH2 stepping behind the opposite before contact. Zone 2 must stay ahead of zone 1.',
    ],
    preServe: {
      S: { x: 0.6, y: 1.4 },
      MB2: { x: 1.4, y: 0.7 },
      OH2: { x: 2.4, y: 3.0 },
      OH1: { x: 1.9, y: 6.6 },
      L: { x: 4.6, y: 7.0 },
      OPP: { x: 7.3, y: 6.4 },
    },
    passers: ['OH1', 'L', 'OPP'],
    serveTo: 'L',
    notes: {
      S: 'Front row in zone 4. Must stay left of the middle and ahead of OH1. Runs the net to target after contact and can attack or dump the second ball.',
      MB2: 'Middle front, tight to the net between the setter and OH2. Slides to the centre after contact.',
      OH2: 'Zone 2, but already on the left. Must stay right of the middle and ahead of the opposite. Not passing here: waits near the attack line and hits left.',
      OPP: 'Right passer from zone 1. Must stay behind OH2 and right of the libero. A back-row attack from the right is on after a good pass.',
      OH1: 'Left passer. Must stay behind the setter and left of the libero.',
      L: 'Middle passer, in for MB1 in zone 6.',
    },
  },
  5: {
    summary:
      'The setter is middle front, a step from target already. The middle starts right of the setter and swings into the centre after contact, while OH1 waits near the attack line on the left. The libero, opposite and OH2 pass.',
    watch: [
      'Middle stepping left of the setter. Zone 2 must stay right of zone 3.',
      'Opposite drifting ahead of the setter. Zone 6 must stay behind zone 3.',
    ],
    preServe: {
      OH1: { x: 1.4, y: 3.2 },
      S: { x: 5.6, y: 1.2 },
      MB2: { x: 7.2, y: 0.8 },
      L: { x: 2.0, y: 6.5 },
      OPP: { x: 4.8, y: 7.0 },
      OH2: { x: 7.2, y: 6.4 },
    },
    passers: ['L', 'OPP', 'OH2'],
    serveTo: 'OPP',
    notes: {
      S: 'Front row in zone 3. Must stay right of OH1, left of the middle and ahead of the opposite. Almost at target already.',
      MB2: 'Right front. Must stay right of the setter until contact, then swings into the middle for the quick.',
      OH1: 'Left front. Not passing: waits near the attack line and attacks from the left.',
      L: 'Left passer, in for MB1 in zone 5. Must stay behind OH1.',
      OPP: 'Middle passer from zone 6. Must stay behind the setter. Can run a back-row attack from the right after passing.',
      OH2: 'Right passer from zone 1. Must stay behind the middle and right of the opposite.',
    },
  },
  6: {
    summary:
      'The setter is right front, standing almost on the target spot. The middle and OH1 stack on the left: the middle slides to the centre after contact and OH1 steps out to attack from the left. The opposite, OH2 and libero pass.',
    watch: [
      'OH1 lining up left of the middle. Zone 3 must stay right of zone 4.',
      'Libero stepping ahead of the setter. Zone 1 must stay behind zone 2.',
    ],
    preServe: {
      MB1: { x: 1.0, y: 0.7 },
      OH1: { x: 2.6, y: 3.0 },
      S: { x: 7.0, y: 1.0 },
      OPP: { x: 2.0, y: 6.6 },
      OH2: { x: 4.8, y: 7.0 },
      L: { x: 7.2, y: 6.4 },
    },
    passers: ['OPP', 'OH2', 'L'],
    serveTo: 'OH2',
    notes: {
      S: 'Front row in zone 2. Must stay right of OH1 and ahead of the libero. Already at the net: half a step to target.',
      MB1: 'Left front, tight to the net. Slides into the middle after contact.',
      OH1: 'Middle front, stacked on the left near the attack line. Must stay right of the middle and left of the setter. Attacks from the left.',
      OPP: 'Left passer from zone 5. Must stay behind the middle and left of OH2.',
      OH2: 'Middle passer from zone 6. Must stay behind OH1.',
      L: 'Right passer, in for MB2 in zone 1. Must stay behind the setter.',
    },
  },
}

/** Rotations 1 to 3 with the opposite passing instead of the front-row outside. */
const OPPOSITE_PASSES: Partial<Record<RotationNumber, RawRotation>> = {
  1: {
    summary:
      'The setter is in right back. OH1 hides at the net on the right with the setter tucked in right behind, which makes this the shortest setter run of the back-row rotations. The opposite passes in the middle with OH2 on the left and the libero on the right. After contact the opposite swings to the right side and OH1 crosses to the left to hit.',
    watch: [
      'Setter stepping ahead of OH1 at the net. Zone 1 must stay behind zone 2.',
      'Opposite drifting right of the middle. Zone 4 must stay left of zone 3.',
    ],
    preServe: {
      OH1: { x: 7.6, y: 1.0 },
      S: { x: 8.1, y: 2.1 },
      MB1: { x: 5.8, y: 0.8 },
      OPP: { x: 3.6, y: 5.6 },
      OH2: { x: 1.6, y: 6.6 },
      L: { x: 6.2, y: 6.6 },
    },
    passers: ['OH2', 'OPP', 'L'],
    serveTo: 'OPP',
    notes: {
      S: 'Zone 1, right behind OH1 at the net. Must stay behind OH1 and right of the libero. Two steps to target.',
      OH1: 'Front row, zone 2. Hides at the net on the right so the setter can stack behind. Not passing. After contact crosses to the left to attack; some teams let OH1 hit from the right here to skip the long run.',
      MB1: 'At the net in the middle, out of the passers’ way. Must stay right of the opposite. Steps off after contact for a quick set.',
      OPP: 'Front-row passer, zone 4. Must stay left of the middle and ahead of OH2. Passes in the middle of the court, then transitions to the right side to attack.',
      OH2: 'Left passer from zone 5. Must stay left of the libero and behind the opposite.',
      L: 'Right passer, in for MB2 in zone 6. Must stay right of OH2 and left of the setter.',
    },
  },
  2: {
    summary:
      'The setter is in middle back and must stay behind the opposite, who passes short in the middle. That keeps the setter deeper than when the outside passes, so the run to target is longer. OH2 waits at the attack line on the left, the libero passes left and OH1 right.',
    watch: [
      'Setter stepping ahead of the opposite. Zone 6 must stay behind zone 3.',
      'OH2 drifting right of the opposite while waiting. Zone 4 must stay left of zone 3.',
    ],
    preServe: {
      OH2: { x: 1.2, y: 3.2 },
      OPP: { x: 4.8, y: 4.6 },
      MB1: { x: 7.8, y: 0.9 },
      L: { x: 2.2, y: 6.8 },
      S: { x: 5.4, y: 5.4 },
      OH1: { x: 7.4, y: 6.6 },
    },
    passers: ['L', 'OPP', 'OH1'],
    serveTo: 'OPP',
    notes: {
      S: 'Zone 6. Must stay behind the opposite and between the libero and OH1. Lines up right behind the opposite’s heels; the run to target starts the moment the ball is served.',
      OPP: 'Front-row passer, zone 3. Must stay right of OH2, left of the middle and ahead of the setter. Takes short serves in the middle, then transitions to the right side.',
      MB1: 'Right front. Waits at the net on the right and swings into the middle for a quick after contact.',
      OH2: 'Left front. Not passing: waits near the attack line and attacks from the left.',
      L: 'Left passer, in for MB2 in zone 5. Must stay left of the setter and behind OH2.',
      OH1: 'Right passer from zone 1. Must stay behind the middle and right of the setter.',
    },
  },
  3: {
    summary:
      'The setter stacks behind the middle at the left of the net and sprints along the net after contact. The opposite passes on the right, OH1 on the left and the libero deep in the middle, while OH2 waits at the attack line to hit.',
    watch: [
      'Setter standing ahead of the middle. Zone 5 must stay behind zone 4.',
      'Libero stepping ahead of the opposite. Zone 1 must stay behind zone 2.',
    ],
    preServe: {
      MB2: { x: 0.9, y: 0.7 },
      S: { x: 1.4, y: 1.9 },
      OH2: { x: 2.6, y: 3.2 },
      OPP: { x: 7.4, y: 5.4 },
      OH1: { x: 3.2, y: 6.6 },
      L: { x: 5.6, y: 7.2 },
    },
    passers: ['OH1', 'L', 'OPP'],
    serveTo: 'L',
    notes: {
      S: 'Zone 5. Must stay behind MB2 and left of OH1. Stacking at the net turns a long diagonal run into a straight sprint along the net.',
      MB2: 'Left front. Stands tight to the net so the setter can stack behind. Swings into the middle after contact.',
      OH2: 'Middle front, zone 3, but waiting on the left near the attack line. Must stay right of the middle, left of the opposite and ahead of OH1. Not passing: attacks from the left.',
      OPP: 'Front-row passer, zone 2. Must stay right of OH2 and ahead of the libero. Passes on the right, then steps off the net to attack from the right.',
      OH1: 'Left passer from zone 6. Must stay behind OH2 and between the setter and the libero.',
      L: 'Middle passer, in for MB1 in zone 1. Must stay behind the opposite and right of OH1.',
    },
  },
}

function rawFor(n: RotationNumber, passer: FrontRowPasser): RawRotation {
  if (passer === 'opposite') return OPPOSITE_PASSES[n] ?? OUTSIDE_PASSES[n]
  return OUTSIDE_PASSES[n]
}

/** The players on court in serve receive: the lineup with the libero in for the back-row middle. */
export function receiveZones(n: RotationNumber): Record<string, Zone> {
  const zones = lineupZones(n)
  const out: Record<string, Zone> = {}
  for (const [id, zone] of Object.entries(zones)) {
    const spec = specFor(id)
    if (spec.role === 'MB' && !isFrontRow(zone)) out[LIBERO.id] = zone
    else out[id] = zone
  }
  return out
}

export function receiveFormation(
  n: RotationNumber,
  passer: FrontRowPasser = 'opposite',
): ReceiveFormation {
  const raw = rawFor(n, passer)
  const zones = receiveZones(n)
  const players: ReceivePlayer[] = Object.entries(zones).map(([id, zone]) => {
    const spec = specFor(id)
    const frontRow = isFrontRow(zone)
    const pre = raw.preServe[id]
    if (!pre) throw new Error(`Rotation ${n}: no pre-serve position for ${id}`)
    let release = pre
    let attack = pre
    if (spec.role === 'S') {
      release = TARGET
      attack = TARGET
    } else if (frontRow && spec.role === 'OH') {
      release = LEFT_APPROACH
      attack = LEFT_ATTACK
    } else if (frontRow && spec.role === 'MB') {
      release = MID_APPROACH
      attack = MID_ATTACK
    } else if (frontRow && spec.role === 'OPP') {
      release = RIGHT_APPROACH
      attack = RIGHT_ATTACK
    }
    return {
      spec,
      zone,
      frontRow,
      passer: raw.passers.includes(id),
      phases: [pre, release, release, attack],
      note: raw.notes[id] ?? '',
    }
  })
  const setTo = players.find((p) => p.frontRow && p.spec.role === 'OH')
  if (!setTo) throw new Error(`Rotation ${n}: no front-row outside hitter`)
  return {
    n,
    title: `Setter in ${setterZone(n)}`,
    summary: raw.summary,
    watch: raw.watch,
    players,
    serveTo: raw.serveTo,
    setTo: setTo.spec.id,
  }
}

export { TARGET }
