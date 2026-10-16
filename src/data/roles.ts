export type Role = 'S' | 'OH' | 'MB' | 'OPP' | 'L'

export interface RoleInfo {
  name: string
  color: string
  text: string
  blurb: string
}

export const ROLES: Record<Role, RoleInfo> = {
  S: {
    name: 'Setter',
    color: '#F5B82E',
    text: '#15202B',
    blurb:
      'Runs the offense. Takes the second ball from the target spot, about a metre off the net and right of centre, and chooses which hitter gets the set.',
  },
  OH: {
    name: 'Outside hitter',
    color: '#1F3A5F',
    text: '#FFFFFF',
    blurb:
      'Attacks from the left side and is a primary passer in serve receive. The two outsides stand opposite each other in the rotation, so one is always front row.',
  },
  MB: {
    name: 'Middle blocker',
    color: '#1E7F5C',
    text: '#FFFFFF',
    blurb:
      'Blocks in the middle of the net and hits quick sets. Comes off the floor for the libero when rotating to the back row.',
  },
  OPP: {
    name: 'Opposite',
    color: '#5E3B9E',
    text: '#FFFFFF',
    blurb:
      'Lines up opposite the setter. Attacks and blocks on the right side, and gives the team a third front-row hitter whenever the setter is back row.',
  },
  L: {
    name: 'Libero',
    color: '#FFFFFF',
    text: '#15202B',
    blurb:
      'Back-row specialist in a contrasting jersey. Replaces a middle blocker in the back row, passes and digs, and cannot attack above the net.',
  },
}

export interface PlayerSpec {
  id: string
  role: Role
  label: string
}

/** The 5-1 lineup in serving order, starting from the setter. */
export const LINEUP: PlayerSpec[] = [
  { id: 'S', role: 'S', label: 'S' },
  { id: 'OH1', role: 'OH', label: 'OH1' },
  { id: 'MB1', role: 'MB', label: 'MB1' },
  { id: 'OPP', role: 'OPP', label: 'OPP' },
  { id: 'OH2', role: 'OH', label: 'OH2' },
  { id: 'MB2', role: 'MB', label: 'MB2' },
]

export const LIBERO: PlayerSpec = { id: 'L', role: 'L', label: 'L' }

export function specFor(id: string): PlayerSpec {
  if (id === LIBERO.id) return LIBERO
  const spec = LINEUP.find((p) => p.id === id)
  if (!spec) throw new Error(`Unknown player ${id}`)
  return spec
}
