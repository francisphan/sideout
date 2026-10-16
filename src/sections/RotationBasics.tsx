import { useState } from 'react'
import CourtView from '../components/CourtView'
import type { CourtViewMode, CourtPath, CourtPlayer } from '../components/courtTypes'
import Legend from '../components/Legend'
import { ZONE_HOME, ZONE_NAME, type Pos, type Zone } from '../data/court'
import { FRONT_BACK_PAIRS, LEFT_RIGHT_PAIRS, overlapViolations } from '../data/overlap'
import { LINEUP, ROLES } from '../data/roles'
import { lineupZones, type RotationNumber } from '../data/rotations'

function homeFor(zones: Record<string, Zone>): Record<string, Pos> {
  const out: Record<string, Pos> = {}
  for (const [id, z] of Object.entries(zones)) out[id] = ZONE_HOME[z]
  return out
}

export default function RotationBasics({ view }: { view: CourtViewMode }) {
  const [rotation, setRotation] = useState<RotationNumber>(1)
  const [positions, setPositions] = useState<Record<string, Pos>>(() =>
    homeFor(lineupZones(1)),
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [moved, setMoved] = useState(false)

  const zones = lineupZones(rotation)
  const byZone = {} as Record<Zone, Pos>
  for (const [id, z] of Object.entries(zones)) byZone[z] = positions[id]
  const violations = overlapViolations(byZone)
  const bad = new Set<string>(violations.map((v) => `${v.a}-${v.b}`))
  const badZones = new Set<Zone>(violations.flatMap((v) => [v.a, v.b]))

  function sideOut() {
    const next = ((rotation % 6) + 1) as RotationNumber
    setRotation(next)
    setPositions(homeFor(lineupZones(next)))
    setMoved(false)
  }
  function reset() {
    setPositions(homeFor(zones))
    setMoved(false)
  }

  const players: CourtPlayer[] = LINEUP.map((spec) => {
    const z = zones[spec.id]
    const role = ROLES[spec.role]
    const serving = z === 1
    return {
      id: spec.id,
      pos: positions[spec.id],
      label: spec.label,
      fill: role.color,
      text: role.text,
      flagged: badZones.has(z),
      pose: 'stand',
      tooltip: {
        title: `${spec.label}, ${role.name.toLowerCase()}`,
        subtitle: `${ZONE_NAME[z]} (zone ${z})${serving ? ', serves next' : ''}`,
        body: role.blurb,
      },
    }
  })

  const paths: CourtPath[] = [...FRONT_BACK_PAIRS, ...LEFT_RIGHT_PAIRS].map(([a, b]) => ({
    id: `ov-${a}-${b}`,
    from: byZone[a],
    to: byZone[b],
    kind: bad.has(`${a}-${b}`) ? 'overlap-bad' : 'overlap',
  }))

  return (
    <section className="lesson" aria-labelledby="rotation-title">
      <div className="stage">
        <div className="stage-bar">
          <p className={violations.length ? 'status status-bad' : 'status status-ok'} role="status">
            {violations.length === 0
              ? moved
                ? 'Legal. Every pair is in order.'
                : 'Drag any player. Lines turn red when a pair breaks the overlap rule.'
              : violations[0].message}
          </p>
          <div className="stage-actions">
            <button type="button" className="btn btn-quiet" onClick={reset} disabled={!moved}>
              Reset
            </button>
            <button type="button" className="btn" onClick={sideOut}>
              Side-out: rotate
            </button>
          </div>
        </div>

        <CourtView
          view={view}
          players={players}
          paths={paths}
          showZones
          draggable
          onDrag={(id, pos) => {
            setMoved(true)
            setPositions((prev) => ({ ...prev, [id]: pos }))
          }}
          selectedId={selected}
          onSelect={setSelected}
        />
      </div>

      <div className="panel">
        <h2 id="rotation-title">Rotation basics</h2>
        <p className="lede">
          Six zones, six players, one direction. Everything else in volleyball positioning builds
          on these three rules.
        </p>

        <h3>The zones</h3>
        <p>
          Zones are numbered counter-clockwise starting from the server’s corner: 1 is right back,
          2 right front, 3 middle front, 4 left front, 5 left back and 6 middle back. Zones 2, 3 and
          4 are the front row and may attack and block at the net. Zones 5, 6 and 1 are the back
          row.
        </p>

        <h3>Side-out</h3>
        <p>
          When the other team is serving and you win the rally, that is a side-out: you get the
          serve, and everyone rotates one zone clockwise. The player in 2 drops back to 1 and
          serves, 1 slides to 6, 6 to 5, 5 moves up to 4, and so on. The order of players never
          changes, only where it starts. This is rotation {rotation} of 6.
        </p>

        <h3>The overlap rule</h3>
        <p>
          At the moment the server hits the ball, every player must be in position relative to
          their neighbours. Each front-row player must be closer to the net than the back-row
          player behind them: 4 ahead of 5, 3 ahead of 6, 2 ahead of 1. And left-to-right order must
          hold within each row: 4, 3, 2 across the front and 5, 6, 1 across the back. The server is
          exempt. The instant the ball is hit, anyone can go anywhere.
        </p>
        <p>
          That is why serve-receive formations look so odd: teams bunch players right up against
          these limits so that everyone is already close to where they want to end up.
        </p>

        <p className="hint">Hover or tap a player to see their role.</p>
        <Legend />
      </div>
    </section>
  )
}
