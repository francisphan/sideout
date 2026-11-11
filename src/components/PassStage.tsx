import type { CSSProperties } from 'react'
import {
  BALL_R,
  PASS_ARC,
  PASS_TO,
  SERVE_ARC,
  SERVE_FROM,
  anchorPoint,
  platformNormal,
  type Anchor,
  type PassPhase,
  type Technique,
} from '../data/passing'
import type { Pose, Pt } from '../data/poses'
import Figure from './Figure'
import Volleyball from './Volleyball'

interface Props {
  technique: Technique
  phases: PassPhase[]
  phase: number
  /** The other stance at the same phase, drawn faintly behind. */
  ghost?: Pose | null
  color: string
}

const INK = '#15202B'

/** Viewport in metres: x along the floor toward the net, y up. */
const X0 = -1.25
const X1 = 3.3
const Y0 = -0.16
const Y1 = 2.85

/** Where each marker sits relative to the point it labels. */
const MARKER_OFFSET: Record<Anchor, Pt> = {
  head: [-0.3, 0.2],
  shoulders: [-0.36, 0.14],
  hip: [-0.42, 0.02],
  knee: [0.3, 0.12],
  feet: [0.3, 0.14],
  hands: [0.3, -0.12],
  elbows: [0.3, -0.22],
  platform: [0.42, -0.14],
  ball: [0.32, 0.1],
}

const sv = ([x, y]: Pt) => `${x.toFixed(3)} ${(-y).toFixed(3)}`

function arcPath(a: Pt, b: Pt, lift: number): string {
  const c: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift]
  return `M ${sv(a)} Q ${sv(c)} ${sv(b)}`
}

export default function PassStage({ technique, phases, phase, ghost, color }: Props) {
  const ph = phases[phase]
  const contact = phases[2].ball
  const serveFrom = SERVE_FROM[technique]

  const figureAt = (x: number): CSSProperties => ({ transform: `translate(${x}px, 0px) scale(1, -1)` })

  let leaves: { from: Pt; to: Pt } | null = null
  if (technique === 'forearm' && phase === 2) {
    const n = platformNormal(ph.pose)
    leaves = { from: contact, to: [contact[0] + n[0] * 0.62, contact[1] + n[1] * 0.62] }
  }

  return (
    <svg
      className="pass-stage"
      viewBox={`${X0} ${-Y1} ${X1 - X0} ${Y1 - Y0}`}
      role="img"
      aria-label={`A passer seen from the side, ${ph.name.toLowerCase()} phase of the ${
        technique === 'forearm' ? 'forearm pass' : 'overhand receive'
      }`}
    >
      <defs>
        <marker id="pass-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--gold)" />
        </marker>
      </defs>
      <rect className="pass-floor" x={X0} y={0} width={X1 - X0} height={-Y0} />
      <line className="pass-floor-line" x1={X0} y1={0} x2={X1} y2={0} />

      {phase >= 1 && (
        <path className="pass-arc pass-arc-serve" d={arcPath(serveFrom, contact, SERVE_ARC)} />
      )}
      {phase >= 3 && <path className="pass-arc pass-arc-pass" d={arcPath(contact, PASS_TO, PASS_ARC[technique])} />}

      <ellipse
        className="figure-shadow pass-shadow"
        cx={0}
        cy={0}
        rx={0.55}
        ry={0.05}
        style={{ transform: `translate(${ph.x}px, 0px)` }}
      />

      {ghost && (
        <g className="pass-player pass-ghost" style={figureAt(ph.x)} aria-hidden="true">
          <Figure pose={ghost} color="transparent" outline="#6B7784" />
        </g>
      )}

      <g className={`pass-player pose-pass-${phase}`} style={figureAt(ph.x)}>
        <Figure pose={ph.pose} color={color} outline={INK} />
      </g>

      {leaves && (
        <line
          className="pass-leaves"
          x1={leaves.from[0]}
          y1={-leaves.from[1]}
          x2={leaves.to[0]}
          y2={-leaves.to[1]}
          markerEnd="url(#pass-arrow)"
        />
      )}

      <g className="ball" style={{ transform: `translate(${ph.ball[0]}px, ${-ph.ball[1]}px)` }}>
        <Volleyball r={BALL_R} />
      </g>

      {ph.checks.map((c, i) => {
        const at = anchorPoint(ph, c.anchor)
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
