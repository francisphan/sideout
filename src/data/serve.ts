import { distanceToSegment } from '../components/pathGeometry'
import { COURT, type Pos } from './court'

/** The server is 9 m past the net; we draw the ball entering from the top edge. */
export const SERVER_Y = -(COURT.farDepth + 0.3)
/** Height of the serve contact. */
export const SERVER_Z = 2.6
/** Where the opponent usually serves from, across the court from our setter's target. */
export const DEFAULT_SERVER_X = 6.2
/** How far the serve lane keeps from everyone who is not the passer. */
export const LANE_CLEARANCE = 0.75

/**
 * Where the serve is when the passer plays it: dropping in beside their
 * platform, a little in front and off the left shoulder, so it stays
 * visible next to the player in both views and out of the lane of a
 * setter running up from behind on the right.
 */
export function arrivingBall(passer: Pos): Pos & { z: number } {
  return { x: passer.x - 0.7, y: passer.y - 0.5, z: 1.0 }
}

/**
 * Where the opponent serves from. A different opponent serves each rotation,
 * so we pick the spot nearest the usual one whose lane to the passer does
 * not run through one of our other players.
 */
export function serverX(target: Pos, others: Pos[]): number {
  const clearance = (x: number) =>
    others.length
      ? Math.min(...others.map((o) => distanceToSegment(o, { x, y: SERVER_Y }, target)))
      : Infinity
  const candidates: number[] = [DEFAULT_SERVER_X]
  for (let x = 1.5; x <= 7.5; x += 0.5) candidates.push(x)
  candidates.sort((a, b) => Math.abs(a - DEFAULT_SERVER_X) - Math.abs(b - DEFAULT_SERVER_X))
  for (const x of candidates) if (clearance(x) >= LANE_CLEARANCE) return x
  return candidates.reduce((best, x) => (clearance(x) > clearance(best) ? x : best))
}
