import { useState } from 'react'
import CourtView from '../components/CourtView'
import type { CourtViewMode, Ball, BlockShadow, CourtPath, CourtPlayer } from '../components/courtTypes'
import Segmented from '../components/Segmented'
import { isFrontRow, ZONES, ZONE_NAME, type Pos } from '../data/court'
import {
  ATTACKER,
  BLOCK_REACH,
  DEFENSES,
  ORIGIN_BLURB,
  ORIGIN_LABEL,
  ORIGINS,
  SHOTS,
  SYSTEMS,
  baseRead,
  defenseRead,
  type AttackOrigin,
  type DefenseSystem,
} from '../data/defense'

const TEAM = '#1F3A5F'
const THEIR_SETTER: Pos = { x: 5.3, y: -1.6 }

export default function FloorDefense({ view }: { view: CourtViewMode }) {
  const [system, setSystem] = useState<DefenseSystem>('perimeter')
  const [origin, setOrigin] = useState<AttackOrigin>('right')
  const [read, setRead] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const base = baseRead(system)
  const target = defenseRead(system, origin)
  const current = read ? target : base
  const info = DEFENSES[system]

  const players: CourtPlayer[] = ZONES.map((z) => {
    const blocking = read && target.blockers.includes(z)
    return {
      id: `z${z}`,
      pos: current.positions[z],
      label: String(z),
      fill: TEAM,
      text: '#FFFFFF',
      ring: blocking,
      pose: read ? (blocking ? 'block' : 'ready') : isFrontRow(z) ? 'blockReady' : 'ready',
      tooltip: {
        title: `${ZONE_NAME[z]} (zone ${z})`,
        subtitle: read ? (blocking ? 'Blocking' : 'Defending') : 'Base position',
        body: current.notes[z],
      },
    }
  })
  players.push(
    {
      id: 'their-setter',
      pos: THEIR_SETTER,
      label: 'S',
      fill: '#F3F4F1',
      text: '#15202B',
      muted: true,
      pose: 'set',
      tooltip: {
        title: 'Their setter',
        body: 'Watch the setter’s hands, not the ball. Where the set goes tells you where to move.',
      },
    },
    {
      id: 'attacker',
      pos: ATTACKER[origin],
      label: 'H',
      fill: '#F3F4F1',
      text: '#15202B',
      muted: true,
      pose: read ? 'hit' : 'stand',
      facing: ATTACKER[origin].x < 4.5 ? 1 : -1,
      tooltip: { title: 'Their hitter', subtitle: ORIGIN_LABEL[origin], body: ORIGIN_BLURB[origin] },
    },
  )

  const ball: Ball = read
    ? { x: ATTACKER[origin].x, y: ATTACKER[origin].y + 0.5, z: 2.95 }
    : { ...THEIR_SETTER, z: 2.2 }

  const paths: CourtPath[] = []
  let shadow: BlockShadow | null = null
  if (read) {
    for (const s of SHOTS[origin]) {
      paths.push({ id: `shot-${s.name}`, from: ATTACKER[origin], to: s.to, kind: 'shot', label: s.name })
    }
    for (const z of ZONES) {
      paths.push({ id: `mv-${z}`, from: base.positions[z], to: target.positions[z], kind: 'move' })
    }
    const xs = target.blockers.map((z) => target.positions[z].x)
    if (xs.length) {
      shadow = {
        apex: ATTACKER[origin],
        x1: Math.min(...xs) - BLOCK_REACH,
        x2: Math.max(...xs) + BLOCK_REACH,
        y: 0.35,
      }
    }
  }

  return (
    <section className="lesson" aria-labelledby="defense-title">
      <div className="stage">
        <div className="stage-bar">
          <div className="phases phases-2" role="tablist" aria-label="Moment in the rally">
            <button
              type="button"
              role="tab"
              aria-selected={!read}
              className={`phase${read ? '' : ' phase-on'}`}
              onClick={() => setRead(false)}
            >
              <small>1</small>
              Base: their setter has the ball
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={read}
              className={`phase${read ? ' phase-on' : ''}`}
              onClick={() => setRead(true)}
            >
              <small>2</small>
              Read: the set is up
            </button>
          </div>
        </div>
        <p className="phase-blurb">
          {read
            ? 'Dashed lanes are the hitter’s options. The dark wedge is the block shadow: the part of the court the block already covers, so no defender stands inside it.'
            : 'Hold base until the set shows who is hitting, then move to the read spot. Moving early is how tips and angles get through.'}
        </p>

        <CourtView
          view={view}
          players={players}
          ball={ball}
          paths={paths}
          shadow={shadow}
          selectedId={selected}
          onSelect={setSelected}
          showZones
        />
      </div>

      <div className="panel">
        <h2 id="defense-title">Floor defense</h2>
        <p className="lede">
          Defense is a block plus four diggers, and the diggers move once the set shows who is
          hitting. Pick a system and an attacker, then flip from base to read.
        </p>

        <h3>System</h3>
        <Segmented
          label="Defensive system"
          value={system}
          onChange={(s) => setSystem(s)}
          options={SYSTEMS.map((s) => ({ value: s, label: DEFENSES[s].name, hint: DEFENSES[s].tagline }))}
        />
        <p>{info.description}</p>
        <dl className="facts">
          <dt>Best against</dt>
          <dd>{info.bestAgainst}</dd>
          <dt>Gives up</dt>
          <dd>{info.weakness}</dd>
        </dl>

        <h3>Attack from</h3>
        <Segmented
          label="Where the attack comes from"
          value={origin}
          onChange={(o) => setOrigin(o)}
          options={ORIGINS.map((o) => ({ value: o, label: ORIGIN_LABEL[o] }))}
        />
        <p>{ORIGIN_BLURB[origin]}</p>

        <p className="hint">Hover or tap a defender for their job in this read.</p>
      </div>
    </section>
  )
}
