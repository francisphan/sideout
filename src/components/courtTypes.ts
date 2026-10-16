import type { Pos } from '../data/court'
import type { PoseName } from '../data/poses'

export interface Ball extends Pos {
  /** Height above the floor in metres. Ignored by the top-down view. */
  z?: number
}

/** A path endpoint: a spot on the floor, or a point above it for the ball. */
export type PathPoint = Pos & { z?: number }

export interface CourtPlayer {
  id: string
  pos: Pos
  label: string
  fill: string
  text: string
  stroke?: string
  tooltip: { title: string; subtitle?: string; body: string }
  /** Drawn with a warning ring, e.g. an overlap violation. */
  flagged?: boolean
  /** Drawn with a highlight ring, e.g. a blocker. */
  ring?: boolean
  /** Lower-contrast player, e.g. an opponent. */
  muted?: boolean
  /** Silhouette pose in the perspective view. */
  pose?: PoseName
}

export type PathKind = 'move' | 'ball' | 'overlap' | 'overlap-bad' | 'shot'

export interface CourtPath {
  id: string
  from: PathPoint
  to: PathPoint
  /** A spot the route bends through, for a move that is not a straight line. */
  via?: Pos
  kind: PathKind
  label?: string
  /** For the ball: how high the flight peaks above the straight line between its endpoints, in metres. */
  arc?: number
}

export interface BlockShadow {
  apex: Pos
  x1: number
  x2: number
  y: number
}

export interface CourtProps {
  players: CourtPlayer[]
  ball?: Ball | null
  paths?: CourtPath[]
  shadow?: BlockShadow | null
  showZones?: boolean
  draggable?: boolean
  onDrag?: (id: string, pos: Pos) => void
  selectedId?: string | null
  onSelect?: (id: string | null) => void
}

export type CourtViewMode = 'top' | 'perspective'

export const VIEW_OPTIONS: { value: CourtViewMode; label: string }[] = [
  { value: 'perspective', label: 'Perspective' },
  { value: 'top', label: 'Whiteboard' },
]
