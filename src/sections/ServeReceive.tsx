import { useEffect, useState } from 'react'
import Court, { type CourtPath, type CourtPlayer } from '../components/Court'
import Legend from '../components/Legend'
import RotationDial from '../components/RotationDial'
import { COURT, ZONE_NAME, type Pos, type Zone } from '../data/court'
import { FRONT_BACK_PAIRS, LEFT_RIGHT_PAIRS } from '../data/overlap'
import { ROLES } from '../data/roles'
import {
  RECEIVE_PHASES,
  receiveFormation,
  TARGET,
  type ReceivePhase,
  type RotationNumber,
} from '../data/rotations'

/** The server is 9 m past the net; we draw the ball entering from the top edge. */
const SERVER: Pos = { x: 6.2, y: -(COURT.farDepth + 0.3) }

export default function ServeReceive() {
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
    }
  })

  const passer = byId.get(formation.serveTo)!
  const hitter = byId.get(formation.setTo)!
  // The ball sits just in front of whoever has it, so it never covers a player.
  const ballByPhase: Pos[] = [
    SERVER,
    { x: passer.phases[1].x, y: passer.phases[1].y - 0.65 },
    { x: TARGET.x, y: TARGET.y - 0.55 },
    { x: hitter.phases[3].x + 0.55, y: hitter.phases[3].y - 0.5 },
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

        <Court
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
