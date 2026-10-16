import { ZONE_NAME, type Pos, type Zone } from './court'

export interface Violation {
  a: Zone
  b: Zone
  /** Plain-language description of what is wrong. */
  message: string
}

/** Pairs where the first zone must be closer to the net than the second. */
export const FRONT_BACK_PAIRS: [Zone, Zone][] = [
  [4, 5],
  [3, 6],
  [2, 1],
]

/** Pairs where the first zone must be to the left of the second. */
export const LEFT_RIGHT_PAIRS: [Zone, Zone][] = [
  [4, 3],
  [3, 2],
  [5, 6],
  [6, 1],
]

const EPS = 0.05

/**
 * Checks the overlap rule for a team at the moment of serve contact.
 * Every front-row player must be closer to the net than the back-row player
 * behind them, and left/right order must hold within each row. The server
 * (zone 1 of the serving team) is exempt.
 */
export function overlapViolations(
  positions: Record<Zone, Pos>,
  options: { serving?: boolean } = {},
): Violation[] {
  const out: Violation[] = []
  const exempt = (z: Zone) => options.serving === true && z === 1

  for (const [front, back] of FRONT_BACK_PAIRS) {
    if (exempt(front) || exempt(back)) continue
    if (positions[front].y > positions[back].y - EPS) {
      out.push({
        a: front,
        b: back,
        message: `${ZONE_NAME[front]} (${front}) must be closer to the net than ${ZONE_NAME[back].toLowerCase()} (${back}).`,
      })
    }
  }
  for (const [left, right] of LEFT_RIGHT_PAIRS) {
    if (exempt(left) || exempt(right)) continue
    if (positions[left].x > positions[right].x - EPS) {
      out.push({
        a: left,
        b: right,
        message: `${ZONE_NAME[left]} (${left}) must be to the left of ${ZONE_NAME[right].toLowerCase()} (${right}).`,
      })
    }
  }
  return out
}
