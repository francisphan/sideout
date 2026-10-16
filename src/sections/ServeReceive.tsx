import { useEffect, useState } from 'react'
import CourtView from '../components/CourtView'
import type { CourtViewMode, Ball, CourtPath, CourtPlayer } from '../components/courtTypes'
import Legend from '../components/Legend'
import RotationDial from '../components/RotationDial'
import Segmented from '../components/Segmented'
import { ZONE_NAME, type Pos, type Zone } from '../data/court'
import { FRONT_BACK_PAIRS, LEFT_RIGHT_PAIRS } from '../data/overlap'
import { ROLES } from '../data/roles'
import type { PoseName } from '../data/poses'
import { SERVER_Y, SERVER_Z, arrivingBall, serverX } from '../data/serve'
import {
  RECEIVE_PHASES,
  RECEIVE_SYSTEMS,
  receiveFormation,
  TARGET,
  type ReceiveFormation,
  type ReceiveSystem,
  type ReceivePhase,
  type ReceivePlayer,
  type RotationNumber,
} from '../data/rotations'

/** How high each ball flight peaks above the line between its ends: serve, pass, set. */
const BALL_ARC = [0, 0.7, 1.2, 0.5]

const SYSTEM_KEY = 'sideout.receiveSystem'
const LEGACY_OPP_FLAG_KEY = 'sideout.oppositePasses'

const SYSTEM_CHIP: Record<ReceiveSystem, string> = {
  opposite: 'Opposite passing',
  outside: 'Opposite not passing',
  four: 'Four passers',
}

const SYSTEM_BLURB: Record<ReceiveSystem, string> = {
  opposite:
    'Three passers. When the setter is back row, the opposite is the front-row passer and the outside hitter stays free to attack.',
  outside:
    'Three passers. When the setter is back row, the outside hitter passes and the opposite hides at the net. In rotations 4 to 6 the opposite is back row and passes anyway.',
  four: 'Everyone but the setter and the middle passes: two short, two deep. Front-row passers attack from the side they passed on.',
}

function loadSystem(): ReceiveSystem {
  try {
    const v = window.localStorage.getItem(SYSTEM_KEY)
    if (v === 'opposite' || v === 'outside' || v === 'four') return v
    // Earlier versions stored a plain on/off flag for the opposite.
    if (window.localStorage.getItem(LEGACY_OPP_FLAG_KEY) === 'false') return 'outside'
  } catch {
    // Storage can be unavailable; use the default.
  }
  return 'opposite'
}

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
  const [system, setSystem] = useState<ReceiveSystem>(loadSystem)

  const formation = receiveFormation(rotation, system)

  function pickSystem(next: ReceiveSystem) {
    setSystem(next)
    setSelected(null)
    try {
      window.localStorage.setItem(SYSTEM_KEY, next)
    } catch {
      // Not persisting is fine.
    }
  }

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
  // The ball sits beside or just in front of whoever has it, so it never
  // covers a player, and at the height of the contact: a serve dropping onto
  // the platform, the setter's hands, the hitting point.
  const arriving: Ball = arrivingBall(passer.phases[1])
  const others = formation.players
    .filter((p) => p.spec.id !== formation.serveTo)
    .map((p) => p.phases[1])
  const ballByPhase: Ball[] = [
    { x: serverX(arriving, others), y: SERVER_Y, z: SERVER_Z },
    arriving,
    { x: TARGET.x, y: TARGET.y - 0.5, z: 2.3 },
    { x: hitter.phases[3].x + 0.65, y: hitter.phases[3].y - 0.55, z: 2.9 },
  ]
  const ball = ballByPhase[phase]

  const paths: CourtPath[] = []
  if (phase === 0 && showOverlap) {
    for (const [a, b] of [...FRONT_BACK_PAIRS, ...LEFT_RIGHT_PAIRS]) {
      paths.push({ id: `ov-${a}-${b}`, from: byZone.get(a)!, to: byZone.get(b)!, kind: 'overlap' })
    }
  }
  if (phase >= 1) {
    paths.push({
      id: 'ball',
      from: ballByPhase[phase - 1],
      to: ball,
      kind: 'ball',
      arc: BALL_ARC[phase],
    })
    const [fromIdx, toIdx] = phase === 3 ? [2, 3] : [0, 1]
    for (const p of formation.players) {
      paths.push({
        id: `mv-${p.spec.id}`,
        from: p.phases[fromIdx],
        to: p.phases[toIdx],
        via: phase === 3 ? undefined : p.releaseVia,
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

        <div className="flag">
          <div className="flag-text">
            <span id="system-label" className="flag-label">
              Serve receive system
            </span>
            <span className="flag-hint">{SYSTEM_BLURB[system]}</span>
          </div>
          <Segmented
            className="flag-control"
            label="Serve receive system"
            value={system}
            onChange={pickSystem}
            options={RECEIVE_SYSTEMS}
          />
        </div>

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

        <h3 className="with-chip">
          <span>
            Rotation {formation.n}, {formation.title.toLowerCase()}
          </span>
          <span className={`chip${system === 'outside' ? '' : ' chip-on'}`}>
            {SYSTEM_CHIP[system]}
          </span>
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
