import { useId, useRef, type PointerEvent, type ReactNode } from 'react'
import { COURT, ZONE_LABEL, ZONES, type Pos } from '../data/court'
import { POSES, poseTop } from '../data/poses'
import CourtTip from './CourtTip'
import Figure from './Figure'
import Volleyball from './Volleyball'
import type { Ball, CourtPath, CourtPlayer, CourtProps } from './courtTypes'
import { labelPoint, pathPoints, svgPath, type Point3 } from './pathGeometry'
import { polygon, project, SCENE, unproject, VIEW, type P3 } from './projection'
import { usePlayerInteraction } from './usePlayerInteraction'

const NET_BOTTOM = 1.35
const NET_TOP = 2.43
const ANTENNA_TOP = 3.25
const INK = '#15202B'
const OPPONENT_FILL = '#E3E6E1'

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function Seg({ a, b, className }: { a: P3; b: P3; className?: string }) {
  const A = project(a)
  const B = project(b)
  return <line x1={A.sx} y1={A.sy} x2={B.sx} y2={B.sy} className={className} />
}

function screen(p: Point3) {
  const s = project(p)
  return { x: s.sx, y: s.sy }
}

/**
 * Labels of lanes that end inside the court and run mostly sideways hang off
 * the outer end of the lane, away from the defender standing in it; the
 * figures are tall, so a centred label would sit on their legs.
 */
function labelAnchor(p: CourtPath): 'start' | 'middle' | 'end' {
  const dx = p.to.x - p.from.x
  const dy = p.to.y - p.from.y
  if (p.to.y > COURT.depth - 1 || Math.abs(dx) < Math.abs(dy) * 0.5) return 'middle'
  return dx < 0 ? 'end' : 'start'
}

/** Splits a flight where it crosses the net plane: the points beyond it, and the points on our side. */
function splitAtNet(pts: Point3[]): [Point3[], Point3[]] {
  const far: Point3[] = []
  const near: Point3[] = []
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const prev = pts[i - 1]
    if (prev && prev.y < 0 !== p.y < 0) {
      const t = (0 - prev.y) / (p.y - prev.y)
      const cross = { x: prev.x + t * (p.x - prev.x), y: 0, z: prev.z + t * (p.z - prev.z) }
      far.push(cross)
      near.push(cross)
    }
    ;(p.y < 0 ? far : near).push(p)
  }
  return [far, near]
}

function Net() {
  const mesh = polygon([
    { x: 0, y: 0, z: NET_BOTTOM },
    { x: 9, y: 0, z: NET_BOTTOM },
    { x: 9, y: 0, z: NET_TOP },
    { x: 0, y: 0, z: NET_TOP },
  ])
  return (
    <g className="net">
      <Seg a={{ x: -0.7, y: 0, z: 0 }} b={{ x: -0.7, y: 0, z: NET_TOP + 0.12 }} className="net-post" />
      <Seg a={{ x: 9.7, y: 0, z: 0 }} b={{ x: 9.7, y: 0, z: NET_TOP + 0.12 }} className="net-post" />
      <polygon points={mesh} className="net-mesh" />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((x) => (
        <Seg key={x} a={{ x, y: 0, z: NET_BOTTOM }} b={{ x, y: 0, z: NET_TOP }} className="net-line" />
      ))}
      <Seg a={{ x: 0, y: 0, z: NET_BOTTOM }} b={{ x: 9, y: 0, z: NET_BOTTOM }} className="net-line" />
      <Seg a={{ x: -0.7, y: 0, z: NET_TOP }} b={{ x: 9.7, y: 0, z: NET_TOP }} className="net-tape" />
      {[0, 9].map((x) => (
        <g key={x}>
          <Seg a={{ x, y: 0, z: NET_BOTTOM }} b={{ x, y: 0, z: ANTENNA_TOP }} className="antenna-base" />
          <Seg a={{ x, y: 0, z: NET_BOTTOM }} b={{ x, y: 0, z: ANTENNA_TOP }} className="antenna-red" />
        </g>
      ))}
    </g>
  )
}

function Ball3D({ ball }: { ball: Ball }) {
  const g = project({ x: ball.x, y: ball.y, z: 0 })
  const b = project({ x: ball.x, y: ball.y, z: ball.z ?? 0 })
  return (
    <>
      <g className="ball-shadow" style={{ transform: `translate(${g.sx}px, ${g.sy}px) scale(${g.k})` }}>
        <ellipse rx={0.3} ry={0.11} />
      </g>
      <g className="ball" style={{ transform: `translate(${b.sx}px, ${b.sy}px) scale(${b.k})` }}>
        <Volleyball r={0.32} />
      </g>
    </>
  )
}

interface PlayerProps {
  p: CourtPlayer
  className: string
  handlers: ReturnType<ReturnType<typeof usePlayerInteraction>['handlersFor']>
}

function Player3D({ p, className, handlers }: PlayerProps) {
  const g = project({ x: p.pos.x, y: p.pos.y, z: 0 })
  const pose = POSES[p.pose ?? 'stand']
  const fill = p.muted ? OPPONENT_FILL : p.fill
  const tagWidth = 0.3 + p.label.length * 0.17
  const tagHeight = poseTop(pose) + 0.24
  return (
    <g
      className={className}
      style={{ transform: `translate(${g.sx}px, ${g.sy}px) scale(${g.k})` }}
      tabIndex={0}
      role="button"
      aria-label={`${p.tooltip.title}. ${p.tooltip.body}`}
      {...handlers}
    >
      <ellipse className="figure-shadow" rx={0.45} ry={0.14} />
      <ellipse className="figure-ring" rx={0.56} ry={0.19} />
      <g transform="scale(1,-1)">
        <Figure pose={pose} color={fill} outline={p.muted ? '#6B7784' : INK} />
      </g>
      <g className="figure-tag" style={{ transform: `translate(0px, ${-tagHeight}px)` }}>
        <rect
          x={-tagWidth / 2}
          y={-0.16}
          width={tagWidth}
          height={0.32}
          rx={0.07}
          fill={p.muted ? '#F3F4F1' : p.fill}
          stroke={INK}
          strokeWidth={0.025}
        />
        <text textAnchor="middle" dominantBaseline="central" fontSize={0.22} fill={p.muted ? INK : p.text}>
          {p.label}
        </text>
      </g>
    </g>
  )
}

export default function Court3D({
  players,
  ball,
  paths = [],
  shadow,
  showZones = false,
  draggable = false,
  onDrag,
  selectedId,
  onSelect,
}: CourtProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const uid = useId()

  function toCourt(e: PointerEvent<SVGGElement>): Pos | null {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const floor = unproject(p.x, p.y)
    if (!floor) return null
    return {
      x: clamp(floor.x, SCENE.xMin + 0.4, SCENE.xMax - 0.4),
      y: clamp(floor.y, 0.3, SCENE.yMax - 0.4),
    }
  }

  const { hoverId, dragId, handlersFor } = usePlayerInteraction({
    draggable,
    onDrag,
    onSelect,
    selectedId,
    toCourt,
  })
  const activeId = dragId ?? hoverId ?? selectedId ?? null
  const active = players.find((p) => p.id === activeId) ?? null

  const arrowId = `${uid}-arrow`
  const clipId = `${uid}-clip`
  const skyId = `${uid}-sky`

  const floorAll = polygon([
    { x: SCENE.xMin, y: SCENE.yMin, z: 0 },
    { x: SCENE.xMax, y: SCENE.yMin, z: 0 },
    { x: SCENE.xMax, y: SCENE.yMax, z: 0 },
    { x: SCENE.xMin, y: SCENE.yMax, z: 0 },
  ])
  const farCourt = polygon([
    { x: 0, y: SCENE.yMin, z: 0 },
    { x: 9, y: SCENE.yMin, z: 0 },
    { x: 9, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
  ])
  const ourCourt = polygon([
    { x: 0, y: 0, z: 0 },
    { x: 9, y: 0, z: 0 },
    { x: 9, y: 9, z: 0 },
    { x: 0, y: 9, z: 0 },
  ])

  let shadowPoints: string | null = null
  if (shadow) {
    const far = COURT.depth + 0.5
    const ray = (ex: number) => {
      const t = (far - shadow.apex.y) / (shadow.y - shadow.apex.y)
      return shadow.apex.x + t * (ex - shadow.apex.x)
    }
    shadowPoints = polygon([
      { x: shadow.x1, y: shadow.y, z: 0 },
      { x: shadow.x2, y: shadow.y, z: 0 },
      { x: ray(shadow.x2), y: far, z: 0 },
      { x: ray(shadow.x1), y: far, z: 0 },
    ])
  }

  // Everything that stands on the floor, drawn far to near so nearer things cover farther ones.
  const items: { y: number; key: string; node: ReactNode }[] = players.map((p) => {
    const isActive = p.id === activeId
    const className = [
      'player',
      p.muted ? 'player-muted' : '',
      p.flagged ? 'player-flagged' : '',
      p.ring ? 'player-ring' : '',
      isActive ? 'player-active' : '',
      dragId === p.id ? 'player-dragging' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return {
      y: p.pos.y,
      key: p.id,
      node: <Player3D p={p} className={className} handlers={handlersFor(p.id)} />,
    }
  })
  if (ball) items.push({ y: ball.y, key: 'ball', node: <Ball3D ball={ball} /> })
  items.push({ y: 0, key: 'net', node: <Net /> })

  // Paths on the floor go under everything. The ball flies, so the part of
  // its flight on our side is drawn just after the net and in front of it;
  // the part still on the far side stays behind the mesh.
  const floorPaths: ReactNode[] = []
  for (const p of paths) {
    const pts = pathPoints(p)
    if (!pts) continue
    const useArrow = p.kind === 'move' || p.kind === 'shot'
    const label = p.label ? screen({ ...labelPoint(p), z: 0 }) : null
    const draw = (key: string, points: Point3[]) => (
      <g key={key} className={`court-path court-path-${p.kind}`}>
        <path d={svgPath(points.map(screen))} markerEnd={useArrow ? `url(#${arrowId})` : undefined} />
        {label && (
          <text
            x={label.x}
            y={label.y}
            textAnchor={labelAnchor(p)}
            dominantBaseline="hanging"
            className="court-path-label"
          >
            {p.label}
          </text>
        )}
      </g>
    )
    if (p.kind !== 'ball') {
      floorPaths.push(draw(p.id, pts))
      continue
    }
    const [far, near] = splitAtNet(pts)
    if (far.length > 1) floorPaths.push(draw(`${p.id}-far`, far))
    if (near.length > 1) items.push({ y: 0.001, key: `${p.id}-near`, node: draw(`${p.id}-near`, near) })
  }
  items.sort((a, b) => a.y - b.y)

  let tip: ReactNode = null
  if (active) {
    const pose = POSES[active.pose ?? 'stand']
    const head = project({ x: active.pos.x, y: active.pos.y, z: poseTop(pose) + 0.45 })
    const left = ((head.sx - VIEW.minX) / VIEW.width) * 100
    const top = ((head.sy - VIEW.minY) / VIEW.height) * 100
    tip = (
      <CourtTip
        {...active.tooltip}
        left={left}
        top={top}
        flipX={active.pos.x > COURT.width / 2}
        below={top < 30}
      />
    )
  }

  return (
    <div className="court-wrap">
      <svg
        ref={svgRef}
        className={`court court3d${draggable ? ' court-draggable' : ''}`}
        viewBox={`${VIEW.minX} ${VIEW.minY} ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Volleyball court in perspective, seen from behind our own endline"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
          <clipPath id={clipId}>
            <polygon points={ourCourt} />
          </clipPath>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13283f" />
            <stop offset="1" stopColor="#24466b" />
          </linearGradient>
        </defs>

        <rect
          x={VIEW.minX}
          y={VIEW.minY}
          width={VIEW.width}
          height={VIEW.height}
          fill={`url(#${skyId})`}
        />
        <polygon points={floorAll} className="court-freezone" />
        <polygon points={farCourt} className="court-floor" />
        <polygon points={farCourt} className="court-far" />
        <polygon points={ourCourt} className="court-floor" />

        {showZones &&
          ZONES.map((z) => {
            const p = project({ ...ZONE_LABEL[z], z: 0 })
            return (
              <text
                key={z}
                x={p.sx}
                y={p.sy}
                fontSize={p.k * 1.3}
                className="court3d-zone"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {z}
              </text>
            )
          })}

        {shadowPoints && (
          <polygon points={shadowPoints} className="court-shadow" clipPath={`url(#${clipId})`} />
        )}

        <g className="court-lines">
          <polygon points={ourCourt} />
          <Seg a={{ x: 0, y: COURT.attackLine, z: 0 }} b={{ x: 9, y: COURT.attackLine, z: 0 }} />
          <Seg a={{ x: 0, y: SCENE.yMin, z: 0 }} b={{ x: 0, y: 0, z: 0 }} />
          <Seg a={{ x: 9, y: SCENE.yMin, z: 0 }} b={{ x: 9, y: 0, z: 0 }} />
        </g>

        {floorPaths}

        {items.map((it) => (
          <g key={it.key}>{it.node}</g>
        ))}
      </svg>
      {tip}
    </div>
  )
}
