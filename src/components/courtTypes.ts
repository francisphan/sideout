import type { Pos } from '../data/court'
import type { PoseName } from '../data/poses'

export interface Ball extends Pos {
  /** Height above the floor in metres. Ignored by the top-down view. */
  z?: number
}

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
  from: Pos
  to: Pos
  kind: PathKind
  label?: string
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
