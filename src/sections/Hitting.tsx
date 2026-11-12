import { useEffect, useState } from 'react'
import HitStage from '../components/HitStage'
import Segmented from '../components/Segmented'
import { hitPhases, type HitPhaseId, type HitTechnique } from '../data/hitting'
import { ROLES } from '../data/roles'

const TECHNIQUES: { value: HitTechnique; label: string; hint: string }[] = [
  { value: 'swing', label: 'Full swing', hint: 'Hit it hard' },
  { value: 'offspeed', label: 'Off-speed', hint: 'Tip or roll shot' },
]

const SWING_MISSES: [string, string][] = [
  ['Into the net', 'You ran under the ball, so contact was low and on the way down. Start your approach a beat later and meet it at full reach.'],
  ['Long, out the back', 'The ball got behind your head and you hit under it. Contact in front of your hitting shoulder and snap your wrist over the top.'],
  ['Off your fingers or the heel of your hand', 'Your timing was off. Watch the ball all the way onto your hand, and keep the hand open and firm.'],
  ['Straight into the block', 'You hit where you were facing. Look at the blockers’ hands on the way up and turn your shoulders or wrist away from them.'],
  ['Touched the net, or landed over the line', 'You jumped forward instead of up. Plant with both feet ahead of your hips so the plant stops you.'],
  ['No power at all', 'A bent arm or a late swing. Load the bowstring early and reach at contact. Height and timing matter more than strength.'],
]

const OFFSPEED_MISSES: [string, string][] = [
  ['Tipped into the blocker’s hands', 'Too flat. Lift it up over the block before it drops.'],
  ['Dug every time', 'You tipped at a defender. Pick a spot before you jump: behind the block, or a corner nobody is in.'],
  ['Called for a catch or a throw', 'The ball rested in your hand. Fingertips only, one quick touch.'],
  ['Everyone knew it was coming', 'You slowed your approach or dropped your arm early. Swing like you mean it until the last moment.'],
]

export default function Hitting() {
  const [technique, setTechnique] = useState<HitTechnique>('swing')
  const [phase, setPhase] = useState<HitPhaseId>(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(
      () => setPhase((p) => ((p + 1) % 5) as HitPhaseId),
      phase === 4 ? 2600 : 1600,
    )
    return () => clearTimeout(t)
  }, [playing, phase])

  const phases = hitPhases(technique)
  const ph = phases[phase]
  const misses = technique === 'swing' ? SWING_MISSES : OFFSPEED_MISSES

  return (
    <section className="lesson" aria-labelledby="hitting-title">
      <div className="stage">
        <div className="stage-bar">
          <div className="phases phases-5" role="tablist" aria-label="Phase of the attack">
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
            {playing ? 'Pause' : 'Play the attack'}
          </button>
        </div>
        <p className="phase-blurb">{ph.cue}</p>

        <div className="pass-frame">
          <HitStage technique={technique} phases={phases} phase={phase} color={ROLES.OH.color} />
        </div>

        <ol className="checks" aria-label="Checkpoints">
          {ph.checks.map((c) => (
            <li key={c.text}>{c.text}</li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h2 id="hitting-title">Hitting</h2>
        <p className="lede">
          Most of a good attack happens before you touch the ball. The approach turns running
          speed into height, and height gives you the whole court. Seen from the side, here is
          what your body does from the first step to the landing.
        </p>

        <Segmented label="Technique" value={technique} options={TECHNIQUES} onChange={setTechnique} />

        {technique === 'swing' ? (
          <>
            <h3>Height beats power</h3>
            <p>
              A ball hit at full reach, in front of you, can go almost anywhere on the other side.
              The same ball hit a little low or behind your head can only go long or into the net,
              however hard you swing. So most fixes start with the feet: be later, be behind the
              ball, and jump up rather than forward.
            </p>
            <p>
              Timing is the hard part. Start your approach when the set leaves the setter’s
              hands, not before. On a high outside set that feels late, and that is usually right.
              Being early is the most common rec mistake, and it puts you under the ball.
            </p>

            <div className="note">
              <h4>Start wide</h4>
              <p>
                An outside hitter starts outside the court, near the sideline and about three
                metres off the net, and comes in at an angle. That keeps the ball in front of your
                hitting shoulder and gives you the long cross-court line to hit into.
              </p>
            </div>
          </>
        ) : (
          <>
            <h3>When to go off-speed</h3>
            <p>
              When the block is up and well formed, when the set is too tight or too low to
              swing at, or when the defense has backed off to dig your hard hits. A few
              well-placed tips make every later swing harder to read.
            </p>
            <p>
              The <strong>tip</strong> shown here lifts the ball over the block with your
              fingertips and drops it just behind. The <strong>roll shot</strong> is its
              cousin: the same approach and a slowed arm, but the whole hand rolls over the ball
              to put topspin on it, so it clears the block and dips sooner. Use it for the deep
              middle or a short corner.
            </p>

            <div className="note">
              <h4>Is it legal?</h4>
              <p>
                A tip is fine as long as the touch is brief. A ball that comes to rest in your
                hand, or that you guide along with an open palm, is a catch. Rec referees are
                often strict about this, so keep it quick and on the fingertips.
              </p>
            </div>
          </>
        )}

        <h3>Habits that make hitting easier</h3>
        <ul className="habits">
          <li>
            <strong>Fast feet at the end.</strong> Slow first steps, quick last two. An approach
            that is fast from the start runs out of room and runs you under the ball.
          </li>
          <li>
            <strong>Up, not forward.</strong> If you keep landing near the net, plant with your
            feet further ahead of your hips.
          </li>
          <li>
            <strong>Use the off arm.</strong> Point it at the ball on the way up, then pull it down
            as you swing. It aims you and speeds up your arm.
          </li>
          <li>
            <strong>See the block.</strong> On the way up, notice where the blockers’ hands are.
            Hit around them, off their hands and out, or over them.
          </li>
          <li>
            <strong>Same look every time.</strong> A tip or roll shot only works if your approach
            and arm look like a full swing until contact.
          </li>
          <li>
            <strong>Know the lines.</strong> Don’t touch the net, and don’t land fully across the
            centre line. A back-row player has to take off from behind the three-metre line to
            attack above the net.
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
