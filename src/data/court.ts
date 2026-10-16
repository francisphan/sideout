// All court geometry is in metres. Our side of the net: x runs 0..9 left to
// right (as seen from behind our own endline), y runs 0 at the net to 9 at
// the endline. The opponent's side is negative y.

export interface Pos {
  x: number
  y: number
}

export type Zone = 1 | 2 | 3 | 4 | 5 | 6

export const COURT = {
  width: 9,
  depth: 9,
  attackLine: 3,
  /** How much of the opponent's side to draw (m past the net). */
  farDepth: 2.4,
  /** Free zone drawn around the court (m). */
  margin: 1.4,
} as const

export const ZONES: Zone[] = [1, 2, 3, 4, 5, 6]
export const FRONT_ROW: Zone[] = [4, 3, 2]
export const BACK_ROW: Zone[] = [5, 6, 1]

export const ZONE_NAME: Record<Zone, string> = {
  1: 'Right back',
  2: 'Right front',
  3: 'Middle front',
  4: 'Left front',
  5: 'Left back',
  6: 'Middle back',
}

/** Where each zone's player stands in a neutral "home" alignment. */
export const ZONE_HOME: Record<Zone, Pos> = {
  4: { x: 1.5, y: 1.5 },
  3: { x: 4.5, y: 1.5 },
  2: { x: 7.5, y: 1.5 },
  5: { x: 1.5, y: 6.5 },
  6: { x: 4.5, y: 6.5 },
  1: { x: 7.5, y: 6.5 },
}

/** Top-left corner of each zone, where its faint number is painted on the floor. */
export const ZONE_LABEL: Record<Zone, Pos> = {
  4: { x: 0.6, y: 0.95 },
  3: { x: 3.6, y: 0.95 },
  2: { x: 6.6, y: 0.95 },
  5: { x: 0.6, y: 3.95 },
  6: { x: 3.6, y: 3.95 },
  1: { x: 6.6, y: 3.95 },
}

/** Clockwise rotation: the player in zone 2 moves to zone 1, 1 moves to 6, ... */
export function nextZone(zone: Zone): Zone {
  return (zone === 1 ? 6 : zone - 1) as Zone
}

export function isFrontRow(zone: Zone): boolean {
  return zone === 2 || zone === 3 || zone === 4
}
