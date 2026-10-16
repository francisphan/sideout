import type { Pose, Pt } from '../data/poses'

interface Props {
  pose: Pose
  color: string
  outline: string
}

const path = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`).join(' ')

/**
 * One silhouette, drawn in metres with the feet at the origin and y up.
 * Limbs are thick round strokes and the torso a filled quad, all in one
 * colour, so together they read as a cut-out. Paths carry their geometry in
 * the CSS `d` property as well as the attribute, so browsers that animate
 * `d` morph between poses and the rest simply snap.
 */
export default function Figure({ pose, color, outline }: Props) {
  const [sl, sr] = pose.shoulders
  const [el, er] = pose.elbows
  const [hl, hr] = pose.hands
  const [kl, kr] = pose.knees
  const [fl, fr] = pose.feet
  const hipL: Pt = [pose.hip[0] - 0.13, pose.hip[1]]
  const hipR: Pt = [pose.hip[0] + 0.13, pose.hip[1]]
  const torso = path([sl, sr, hipR, hipL]) + ' Z'
  const armL = path([sl, el, hl])
  const armR = path([sr, er, hr])
  const legL = path([[pose.hip[0] - 0.09, pose.hip[1]], kl, fl])
  const legR = path([[pose.hip[0] + 0.09, pose.hip[1]], kr, fr])
  const neck = path([pose.head, pose.neck])

  const parts = (stroke: string, fill: string, extra: number) => (
    <g stroke={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={legL} style={{ d: `path("${legL}")` }} strokeWidth={0.17 + extra} />
      <path d={legR} style={{ d: `path("${legR}")` }} strokeWidth={0.17 + extra} />
      <path d={torso} style={{ d: `path("${torso}")` }} fill={fill} strokeWidth={0.08 + extra} />
      <path d={armL} style={{ d: `path("${armL}")` }} strokeWidth={0.13 + extra} />
      <path d={armR} style={{ d: `path("${armR}")` }} strokeWidth={0.13 + extra} />
      <path d={neck} style={{ d: `path("${neck}")` }} strokeWidth={0.12 + extra} />
      <g style={{ transform: `translate(${pose.head[0]}px, ${pose.head[1]}px)` }}>
        <circle r={0.15 + extra / 2} fill={fill} strokeWidth={extra ? 0.02 : 0} />
      </g>
    </g>
  )

  return (
    <g className="figure" style={{ transform: `translate(0px, ${pose.lift}px)` }}>
      {parts(outline, outline, 0.06)}
      {parts(color, color, 0)}
    </g>
  )
}
