import { useEffect, useState } from 'react'
import BlockStage from '../components/BlockStage'
import Segmented from '../components/Segmented'
import { blockPhases, type BlockPhaseId, type BlockTechnique } from '../data/blocking'
import { ROLES } from '../data/roles'

const TECHNIQUES: { value: BlockTechnique; label: string; hint: string }[] = [
  { value: 'stuff', label: 'Stuff block', hint: 'Reach over the net' },
  { value: 'soft', label: 'Soft block', hint: 'Tilt it up to your team' },
]

const STUFF_MISSES: [string, string][] = [
  ['Off your hands and out of bounds', 'Your outside hand faced out of the court. Turn it in, toward the middle of their court.'],
  ['Down between you and the net', 'Your hands weren’t over the net, or your arms leaned back. Reach over and shrug your shoulders to seal the gap.'],
  ['Net fault', 'You swung your arms or drifted forward. Jump straight up and press, don’t swing.'],
  ['The hitter hit it as you came down', 'You jumped too early. Wait for the hitter to jump first.'],
  ['Straight through the middle of the block', 'A gap between blockers. Close the block hip to hip with the blocker next to you.'],
  ['Bent your fingers back', 'Soft hands. Spread your fingers wide and keep them and your wrists firm.'],
]

const SOFT_MISSES: [string, string][] = [
  ['Drops straight down on your side', 'Your hands tilted forward. Tilt them back so the ball goes up.'],
  ['Flies over your head and out', 'Too much tilt, or soft wrists. Firm hands, palms facing up and forward.'],
  ['Goes through your hands', 'A gap between your arms. Keep them straight and close together.'],
  ['Never touches you', 'You lined up on the ball instead of the hitter’s arm. Line up on their hitting shoulder.'],
]

export default function Blocking() {
  const [technique, setTechnique] = useState<BlockTechnique>('stuff')
  const [phase, setPhase] = useState<BlockPhaseId>(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(
      () => setPhase((p) => ((p + 1) % 5) as BlockPhaseId),
      phase === 4 ? 2600 : 1600,
    )
    return () => clearTimeout(t)
  }, [playing, phase])

  const phases = blockPhases(technique)
  const ph = phases[phase]
  const misses = technique === 'stuff' ? STUFF_MISSES : SOFT_MISSES

  return (
    <section className="lesson" aria-labelledby="blocking-title">
      <div className="stage">
        <div className="stage-bar">
          <div className="phases phases-5" role="tablist" aria-label="Phase of the block">
            {phases.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === phase}
                className={`phase${p.id === phase ? ' phase-on' : ''}`}
                onClick={() => {
                  setPlaying(false)
                  setPhase(p.id)
                }}
              >
                <small>{p.id + 1}</small>
                {p.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn"
            aria-pressed={playing}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing ? 'Pause' : 'Play the block'}
          </button>
        </div>
        <p className="phase-blurb">{ph.cue}</p>

        <div className="pass-frame">
          <BlockStage technique={technique} phases={phases} phase={phase} color={ROLES.MB.color} />
        </div>

        <ol className="checks" aria-label="Checkpoints">
          {ph.checks.map((c) => (
            <li key={c.text}>{c.text}</li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h2 id="blocking-title">Blocking</h2>
        <p className="lede">
          A block doesn’t have to win the point to do its job. It takes part of the court away
          from the hitter and pushes the rest toward your defense. Seen from the side, here is
          what your body does from the ready position to the landing, with the hitter across the
          net.
        </p>

        <Segmented label="Technique" value={technique} options={TECHNIQUES} onChange={setTechnique} />

        {technique === 'stuff' ? (
          <>
            <h3>Line up on the arm, not the ball</h3>
            <p>
              The ball comes off the hitter’s hand, so that is what you block. Against a
              right-hander, line your inside hand up with their hitting shoulder. Your hands
              take away the sharp cross-court angle, and the defenders behind you dig the line.
            </p>
            <p>
              Timing matters as much as height. The hitter is in the air before they swing, so you
              jump a beat after them. A middle blocker against a quick set has no time for that
              and jumps with the hitter.
            </p>

            <div className="note">
              <h4>Footwork along the net</h4>
              <p>
                For a short move, shuffle: step, close, and jump. For a long one, like a middle
                getting out to the pin, use a crossover: step, cross over, plant and turn square to
                the net. Either way, hands stay up and the last step leaves you facing the net,
                not sideways.
              </p>
            </div>
          </>
        ) : (
          <>
            <h3>When to soft block</h3>
            <p>
              When you can’t get your hands over the net, because the hitter is much taller or you
              are a step late, reaching over only leaves a gap under your arms. A soft block takes
              away height instead. The ball pops up off your hands and your team plays it.
            </p>
            <p>
              Soft blocking is common in rec play, and it is the right choice for many shorter
              blockers. As you get more height or better timing, move toward reaching over.
            </p>

            <div className="note">
              <h4>A free touch</h4>
              <p>
                A touch by a blocker doesn’t count as one of your team’s three. After a soft block
                your team still gets three touches, and the blocker may even play the ball again
                straight away.
              </p>
            </div>
          </>
        )}

        <h3>Habits that make blocking easier</h3>
        <ul className="habits">
          <li>
            <strong>Hands up early, and keep them up.</strong> Your hands should be above your
            shoulders the whole time you are at the net.
          </li>
          <li>
            <strong>Watch the hitter, not the ball.</strong> See the set, then switch your eyes to
            the hitter’s approach and arm.
          </li>
          <li>
            <strong>Close the block.</strong> With two blockers, the outside one sets the edge and
            the other closes to them, hip to hip. A gap between you is the easiest shot there is.
          </li>
          <li>
            <strong>Press, don’t swing.</strong> Swinging your arms at the ball is how net touches
            happen. Reach and hold.
          </li>
          <li>
            <strong>Know the rules.</strong> No blocking or attacking a serve. Back-row players
            can’t block. Touching the net between the antennas is a fault. A block touch doesn’t
            count as one of your three.
          </li>
        </ul>

        <h3>Read your misses</h3>
        <dl className="misses">
          {misses.map(([what, why]) => (
            <div key={what}>
              <dt>{what}</dt>
              <dd>{why}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
