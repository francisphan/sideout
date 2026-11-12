import {
  BALL_R,
  HIT_ARC,
  HIT_TO,
  NET_DEPTH,
  NET_H,
  NET_X,
  SET_FROM,
  STEPS,
  hitAnchorPoint,
  type HitAnchor,
  type HitPhase,
  type HitTechnique,
} from '../data/hitting'
import type { Pt } from '../data/poses'
import Figure from './Figure'
import Volleyball from './Volleyball'

interface Props {
  technique: HitTechnique
  phases: HitPhase[]
  phase: number
  color: string
}

const INK = '#15202B'

/** Viewport in metres: x along the floor toward the net, y up. */
const X0 = -3.35
const X1 = 3.4
const Y0 = -0.2
const Y1 = 3.75

/** Where each marker sits relative to the point it labels. */
const MARKER_OFFSET: Record<HitAnchor, Pt> = {
  head: [-0.32, 0.2],
  shoulders: [-0.38, 0.12],
  hip: [-0.42, 0.02],
  knee: [0.32, 0.12],
  feet: [0.32, 0.14],
  hitHand: [0.3, 0.12],
  offHand: [0.32, -0.08],
  elbow: [-0.32, 0.1],
  ball: [0.32, 0.1],
}

const sv = ([x, y]: Pt) => `${x.toFixed(3)} ${(-y).toFixed(3)}`

function arcPath(a: Pt, b: Pt, lift: number): string {
  const c: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift]
  return `M ${sv(a)} Q ${sv(c)} ${sv(b)}`
}

export default function HitStage({ technique, phases, phase, color }: Props) {
  const ph = phases[phase]
  const contact = phases[3].ball
  const stepsShown = phase === 0 ? 2 : STEPS.length

  return (
    <svg
      className="pass-stage"
      viewBox={`${X0} ${-Y1} ${X1 - X0} ${Y1 - Y0}`}
      role="img"
      aria-label={`A hitter seen from the side, ${ph.name.toLowerCase()} phase of ${
        technique === 'swing' ? 'a full swing' : 'an off-speed tip'
      }`}
    >
      <rect className="pass-floor" x={X0} y={0} width={X1 - X0} height={-Y0} />
      <line className="pass-floor-line" x1={X0} y1={0} x2={X1} y2={0} />

      <g className="hit-net" aria-hidden="true">
        <rect className="hit-net-mesh" x={NET_X - 0.03} y={-NET_H} width={0.06} height={NET_DEPTH} />
        <line className="hit-net-post" x1={NET_X} y1={0} x2={NET_X} y2={-NET_H} />
        <line className="hit-net-tape" x1={NET_X} y1={-NET_H} x2={NET_X} y2={-NET_H + 0.07} />
      </g>

      {STEPS.map((s, i) => (
        <g
          key={i}
          className={`hit-step${i < stepsShown ? ' hit-step-on' : ''}`}
          aria-hidden="true"
        >
          <ellipse cx={s.x} cy={-0.012} rx={0.11} ry={0.022} />
          <text x={s.x} y={0.16}>
            {s.foot}
          </text>
        </g>
      ))}

      <path className="pass-arc pass-arc-serve" d={arcPath(SET_FROM, contact, 0)} />
      {phase >= 4 && (
        <path className="pass-arc pass-arc-pass" d={arcPath(contact, HIT_TO[technique], HIT_ARC[technique])} />
      )}

      <ellipse
        className="figure-shadow pass-shadow"
        cx={0}
        cy={0}
        rx={0.5}
        ry={0.05}
        style={{ transform: `translate(${ph.x}px, 0px)` }}
      />

      <g className="pass-player" style={{ transform: `translate(${ph.x}px, 0px) scale(1, -1)` }}>
        <Figure pose={ph.pose} color={color} outline={INK} />
      </g>

      <g className="ball" style={{ transform: `translate(${ph.ball[0]}px, ${-ph.ball[1]}px)` }}>
        <Volleyball r={BALL_R} />
      </g>

      {ph.checks.map((c, i) => {
        const at = hitAnchorPoint(ph, c.anchor)
        const off = c.offset ?? MARKER_OFFSET[c.anchor]
        const m: Pt = [at[0] + off[0], at[1] + off[1]]
        return (
          <g key={`${phase}-${i}`} className="pass-marker" aria-hidden="true">
            <line x1={at[0]} y1={-at[1]} x2={m[0]} y2={-m[1]} />
            <circle className="pass-marker-dot" cx={at[0]} cy={-at[1]} r={0.03} />
            <circle cx={m[0]} cy={-m[1]} r={0.11} />
            <text x={m[0]} y={-m[1]} dy="0.05">
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
