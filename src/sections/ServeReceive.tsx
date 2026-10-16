import { useEffect, useState } from 'react'
import CourtView from '../components/CourtView'
import type { CourtViewMode, Ball, CourtPath, CourtPlayer } from '../components/courtTypes'
import Legend from '../components/Legend'
import RotationDial from '../components/RotationDial'
import { COURT, ZONE_NAME, type Pos, type Zone } from '../data/court'
import { FRONT_BACK_PAIRS, LEFT_RIGHT_PAIRS } from '../data/overlap'
import { ROLES } from '../data/roles'
import type { PoseName } from '../data/poses'
import {
  RECEIVE_PHASES,
  receiveFormation,
  TARGET,
  type ReceiveFormation,
  type ReceivePhase,
  type ReceivePlayer,
  type RotationNumber,
} from '../data/rotations'

/** The server is 9 m past the net; we draw the ball entering from the top edge. */
const SERVER: Pos = { x: 6.2, y: -(COURT.farDepth + 0.3) }

function samePos(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y
}

/** What each silhouette is doing in a given phase. */
function poseFor(p: ReceivePlayer, phase: ReceivePhase, f: ReceiveFormation): PoseName {
  const isSetter = p.spec.role === 'S'
  if (phase === 0) return p.passer ? 'ready' : 'stand'
  if (phase === 1) {
    if (!samePos(p.phases[0], p.phases[1])) return 'run'
    return p.passer ? 'ready' : 'stand'
  }
  if (phase === 2) {
    if (p.spec.id === f.serveTo) return 'pass'
    return isSetter ? 'set' : 'ready'
  }
  if (isSetter) return 'set'
  if (p.spec.id === f.setTo) return 'hit'
  return 'ready'
}

export default function ServeReceive({ view }: { view: CourtViewMode }) {
  const [rotation, setRotation] = useState<RotationNumber>(1)
  const [phase, setPhase] = useState<ReceivePhase>(0)
  const [playing, setPlaying] = useState(false)
  const [showOverlap, setShowOverlap] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const formation = receiveFormation(rotation)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(
      () => setPhase((p) => ((p + 1) % 4) as ReceivePhase),
      phase === 3 ? 2600 : 1800,
    )
    return () => clearTimeout(t)
  }, [playing, phase])

  function pickRotation(n: RotationNumber) {
    setRotation(n)
    setPhase(0)
    setSelected(null)
  }

  const byId = new Map(formation.players.map((p) => [p.spec.id, p]))
  const byZone = new Map<Zone, Pos>(
    formation.players.map((p) => [p.zone, p.phases[phase]]),
  )

  const players: CourtPlayer[] = formation.players.map((p) => {
    const role = ROLES[p.spec.role]
    const where = `${ZONE_NAME[p.zone]} (zone ${p.zone}), ${p.frontRow ? 'front row' : 'back row'}${p.passer ? ', passing' : ''}`
    return {
      id: p.spec.id,
      pos: p.phases[phase],
      label: p.spec.label,
      fill: role.color,
      text: role.text,
      tooltip: { title: `${p.spec.label}, ${role.name.toLowerCase()}`, subtitle: where, body: p.note },
      pose: poseFor(p, phase, formation),
    }
  })

  const passer = byId.get(formation.serveTo)!
  const hitter = byId.get(formation.setTo)!
  // The ball sits just in front of whoever has it, so it never covers a player,
  // and at the height of the contact: platform, setter's hands, hitting point.
  const ballByPhase: Ball[] = [
    { ...SERVER, z: 2.4 },
    { x: passer.phases[1].x, y: passer.phases[1].y - 0.65, z: 0.8 },
    { x: TARGET.x, y: TARGET.y - 0.55, z: 2.3 },
    { x: hitter.phases[3].x + 0.55, y: hitter.phases[3].y - 0.5, z: 2.9 },
  ]
  const ball = ballByPhase[phase]

  const paths: CourtPath[] = []
  if (phase === 0 && showOverlap) {
    for (const [a, b] of [...FRONT_BACK_PAIRS, ...LEFT_RIGHT_PAIRS]) {
      paths.push({ id: `ov-${a}-${b}`, from: byZone.get(a)!, to: byZone.get(b)!, kind: 'overlap' })
    }
  }
  if (phase >= 1) {
    paths.push({ id: 'ball', from: ballByPhase[phase - 1], to: ball, kind: 'ball' })
    const [fromIdx, toIdx] = phase === 3 ? [2, 3] : [0, 1]
    for (const p of formation.players) {
      paths.push({
        id: `mv-${p.spec.id}`,
        from: p.phases[fromIdx],
        to: p.phases[toIdx],
        kind: 'move',
      })
    }
  }

  const phaseInfo = RECEIVE_PHASES[phase]

  return (
    <section className="lesson" aria-labelledby="receive-title">
      <div className="stage">
        <div className="stage-bar">
          <div className="phases" role="tablist" aria-label="Phase of the play">
            {RECEIVE_PHASES.map((ph) => (
              <button
                key={ph.id}
                type="button"
                role="tab"
                aria-selected={ph.id === phase}
                className={`phase${ph.id === phase ? ' phase-on' : ''}`}
                onClick={() => {
                  setPlaying(false)
                  setPhase(ph.id)
                }}
              >
                <small>{ph.id + 1}</small>
                {ph.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn"
            aria-pressed={playing}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing ? 'Pause' : 'Play the rally'}
          </button>
        </div>
        <p className="phase-blurb">{phaseInfo.blurb}</p>

        <CourtView
          view={view}
          players={players}
          ball={ball}
          paths={paths}
          selectedId={selected}
          onSelect={setSelected}
          showZones
        />
      </div>

      <div className="panel">
        <h2 id="receive-title">Serve receive</h2>
        <p className="lede">
          A 5-1 system: one setter runs every rotation, five hitters, and the libero comes in for
          whichever middle is in the back row. Pick a rotation, then step through the serve.
        </p>

        <div className="controls-row">
          <RotationDial value={rotation} onChange={pickRotation} />
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => pickRotation(((rotation % 6) + 1) as RotationNumber)}
          >
            Side-out: rotate
          </button>
        </div>

        <h3>
          Rotation {formation.n}, {formation.title.toLowerCase()}
        </h3>
        <p>{formation.summary}</p>

        <div className="note">
          <h4>Watch for</h4>
          <ul className="watch">
            {formation.watch.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={showOverlap}
            onChange={(e) => setShowOverlap(e.target.checked)}
          />
          Show overlap lines before the serve
        </label>

        <p className="hint">Hover or tap a player for their job in this rotation.</p>
        <Legend />
      </div>
    </section>
  )
}
