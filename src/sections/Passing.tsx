import { useEffect, useState } from 'react'
import PassStage from '../components/PassStage'
import Segmented from '../components/Segmented'
import { passPhases, type PassPhaseId, type Stance, type Technique } from '../data/passing'
import { ROLES } from '../data/roles'

const STANCE_KEY = 'sideout.passStance'

const TECHNIQUES: { value: Technique; label: string; hint: string }[] = [
  { value: 'forearm', label: 'Forearm pass', hint: 'Platform, the default' },
  { value: 'overhand', label: 'Overhand receive', hint: 'Hands, for high floats' },
]

const STANCES: { value: Stance; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Rec and club' },
  { value: 'tall', label: 'Tall', hint: 'Pro style' },
]

function loadStance(): Stance {
  try {
    const v = window.localStorage.getItem(STANCE_KEY)
    if (v === 'low' || v === 'tall') return v
  } catch {
    // Storage can be unavailable; fall through to the default.
  }
  return 'low'
}

const FOREARM_MISSES: [string, string][] = [
  ['Goes straight up or back over your head', 'You were under the ball or swung up at it. Get behind it and angle the platform at the target.'],
  ['Shanks off to the side', 'Your arms were uneven or the ball was off your midline. Move your feet sooner, and drop the shoulder nearer the ball when you can’t.'],
  ['Sails over the net', 'Too much arm swing. Let the ball rebound off a still platform.'],
  ['Dies short in front of you', 'A slow serve with no push behind it. Add a little leg drive toward the target.'],
  ['Comes off your wrists or thumbs', 'Contact was too low on your arms. Meet it higher on the forearms.'],
  ['You are always reaching', 'You started late. Read the toss and be moving when the server hits it.'],
]

const OVERHAND_MISSES: [string, string][] = [
  ['Called for a lift or a double', 'Your hands were late or soft. Get them up early and keep your wrists firm.'],
  ['Jams your fingers', 'Hands too close to your face or elbows pinched in. Make the window bigger and meet the ball a little higher.'],
  ['Falls short of the target', 'Arms only. Push with your legs as your arms extend.'],
  ['Goes behind you', 'The ball got past your forehead. Move your feet so it arrives in front of your face.'],
]

export default function Passing() {
  const [technique, setTechnique] = useState<Technique>('forearm')
  const [stance, setStance] = useState<Stance>(loadStance)
  const [phase, setPhase] = useState<PassPhaseId>(0)
  const [playing, setPlaying] = useState(false)
  const [ghost, setGhost] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(
      () => setPhase((p) => ((p + 1) % 4) as PassPhaseId),
      phase === 3 ? 2600 : 1800,
    )
    return () => clearTimeout(t)
  }, [playing, phase])

  function pickStance(s: Stance) {
    setStance(s)
    try {
      window.localStorage.setItem(STANCE_KEY, s)
    } catch {
      // Not persisting is fine.
    }
  }

  const phases = passPhases(technique, stance)
  const ph = phases[phase]
  const other = technique === 'forearm' && ghost ? passPhases('forearm', stance === 'low' ? 'tall' : 'low')[phase].pose : null
  const misses = technique === 'forearm' ? FOREARM_MISSES : OVERHAND_MISSES

  return (
    <section className="lesson" aria-labelledby="passing-title">
      <div className="stage">
        <div className="stage-bar">
          <div className="phases" role="tablist" aria-label="Phase of the pass">
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
            {playing ? 'Pause' : 'Play the pass'}
          </button>
        </div>
        <p className="phase-blurb">{ph.cue}</p>

        <div className="pass-frame">
          <PassStage
            technique={technique}
            phases={phases}
            phase={phase}
            ghost={other}
            color={ROLES.OH.color}
          />
        </div>

        <ol className="checks" aria-label="Checkpoints">
          {ph.checks.map((c) => (
            <li key={c.text}>{c.text}</li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h2 id="passing-title">Passing</h2>
        <p className="lede">
          Every rally you win on serve receive starts with a pass. Seen from the side, here is
          what your body should be doing before, during and after the touch.
        </p>

        <Segmented label="Technique" value={technique} options={TECHNIQUES} onChange={setTechnique} />

        {technique === 'forearm' ? (
          <>
            <div className="flag">
              <div className="flag-text">
                <span className="flag-label">Stance</span>
                <span className="flag-hint">
                  {stance === 'low'
                    ? 'Low: legs bent, contact between waist and knees.'
                    : 'Tall: hips high, contact at the waist.'}
                </span>
              </div>
              <Segmented
                className="flag-control"
                label="Stance"
                value={stance}
                options={STANCES}
                onChange={pickStance}
              />
            </div>
            <label className="check">
              <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} />
              Show the other stance faintly behind
            </label>

            <h3>Low or tall?</h3>
            <p>
              Watch a pro league and the best passers receive almost standing up. It works for
              them for three reasons. Jump serves arrive flat and fast, around the waist, so there
              is nothing to get under. They read the serve so early that they are set before it
              crosses the net. And staying tall lets them go straight from the pass into an attack
              approach.
            </p>
            <p>
              Most rec and club serves are different, and so are most of us. Float serves move and
              drop late, short serves are common, and we start moving a beat later. Getting low
              puts your platform below the ball before it arrives. It keeps the ball in front of
              you and leaves room to adjust when the serve dips. The half second it costs your
              approach matters less than a pass that stays in play.
            </p>

            <div className="note">
              <h4>Low means legs</h4>
              <p>
                Bend your knees and ankles, not your waist. If you fold at the waist with straight
                legs, your platform ends up under your body and the ball goes backward over your
                head. A good low stance looks like a sprinter about to start: knees forward, chest
                forward, weight on the balls of your feet.
              </p>
            </div>
          </>
        ) : (
          <>
            <h3>When to use your hands</h3>
            <p>
              Use hands on a float serve that will reach you at chest height or higher. Taking
              that ball on your forearms means backing up, leaning back or passing at your face.
              Overhand is also where standing tall is right: the ball is high, so you rise to
              meet it.
            </p>
            <p>
              Stay on your forearms for topspin serves, hard driven serves and anything below your
              shoulders. A topspin serve dives, and a hard one is too fast to handle cleanly with
              your fingers.
            </p>

            <div className="note">
              <h4>Is it legal?</h4>
              <p>
                Under international rules, a team’s first touch may hit the body twice as long as
                it is one action, so a hands receive with a little spin is fine. A ball that comes
                to rest in your hands is a catch on any touch. Rec referees often judge hands
                receives more tightly, and some leagues ban them on serve, so check yours.
              </p>
            </div>
          </>
        )}

        <h3>Habits that make passing easier</h3>
        <ul className="habits">
          <li>
            <strong>Read the server.</strong> A high toss with a full swing is a topspin serve
            that dives. A low toss with a short, stiff arm is a float that moves.
          </li>
          <li>
            <strong>Be moving when they hit it.</strong> Weight forward and feet active at the
            server’s contact, not a beat after.
          </li>
          <li>
            <strong>Call it early and loudly.</strong> Say “mine” as soon as you know. Agree on
            seam rules before the match, such as the passer the ball is moving toward takes it.
          </li>
          <li>
            <strong>Off your midline, drop a shoulder.</strong> When your feet can’t get there,
            lower the shoulder nearer the ball so the platform still faces the target. Don’t
            swing your arms across your body.
          </li>
          <li>
            <strong>Pass to the target, not the setter.</strong> Aim about a metre off the net and
            right of centre, high enough for the setter to get under it.
          </li>
          <li>
            <strong>Rate your passes in practice.</strong> 3 gives the setter every option, 2 two
            hitters, 1 only a high ball outside, 0 is an ace or an overpass. A team averaging 2 or
            better sides out a lot.
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
