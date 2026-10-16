import { useId, useRef, type PointerEvent } from 'react'
import { COURT, ZONE_LABEL, ZONES, type Pos } from '../data/court'
import CourtTip from './CourtTip'
import type { CourtProps } from './courtTypes'
import { usePlayerInteraction } from './usePlayerInteraction'

const TOP_PAD = 0.7
const BOTTOM_PAD = 1.0
const VB = {
  minX: -COURT.margin,
  minY: -(COURT.farDepth + TOP_PAD),
  width: COURT.width + COURT.margin * 2,
  height: COURT.farDepth + TOP_PAD + COURT.depth + BOTTOM_PAD,
}

const R = 0.46

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

/** The whiteboard view: our side of the court from straight above, net at the top. */
export default function Court({
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
    return {
      x: clamp(p.x, VB.minX + R, VB.minX + VB.width - R),
      y: clamp(p.y, 0.3, COURT.depth + BOTTOM_PAD - R),
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

  let shadowPoints: string | null = null
  if (shadow) {
    const far = COURT.depth + 0.5
    const ray = (ex: number) => {
      const t = (far - shadow.apex.y) / (shadow.y - shadow.apex.y)
      return shadow.apex.x + t * (ex - shadow.apex.x)
    }
    shadowPoints = [
      `${shadow.x1},${shadow.y}`,
      `${shadow.x2},${shadow.y}`,
      `${ray(shadow.x2)},${far}`,
      `${ray(shadow.x1)},${far}`,
    ].join(' ')
  }

  return (
    <div className="court-wrap">
      <svg
        ref={svgRef}
        className={`court${draggable ? ' court-draggable' : ''}`}
        viewBox={`${VB.minX} ${VB.minY} ${VB.width} ${VB.height}`}
        role="img"
        aria-label="Volleyball court from above, seen from behind our own endline"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={COURT.width} height={COURT.depth} />
          </clipPath>
        </defs>

        <rect x={VB.minX} y={VB.minY} width={VB.width} height={VB.height} className="court-freezone" />
        <rect x={0} y={-COURT.farDepth} width={COURT.width} height={COURT.farDepth} className="court-floor" />
        <rect x={0} y={-COURT.farDepth} width={COURT.width} height={COURT.farDepth} className="court-far" />
        <rect x={0} y={0} width={COURT.width} height={COURT.depth} className="court-floor" />

        {showZones &&
          ZONES.map((z) => (
            <text
              key={z}
              x={ZONE_LABEL[z].x}
              y={ZONE_LABEL[z].y}
              className="court-zone-number"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {z}
            </text>
          ))}

        {shadowPoints && (
          <polygon points={shadowPoints} className="court-shadow" clipPath={`url(#${clipId})`} />
        )}

        <g className="court-lines">
          <rect x={0} y={0} width={COURT.width} height={COURT.depth} />
          <line x1={0} y1={COURT.attackLine} x2={COURT.width} y2={COURT.attackLine} />
          <line x1={0} y1={-COURT.farDepth} x2={0} y2={0} />
          <line x1={COURT.width} y1={-COURT.farDepth} x2={COURT.width} y2={0} />
        </g>
        <line x1={-0.9} y1={0} x2={COURT.width + 0.9} y2={0} className="court-net" />
        <line x1={0} y1={-0.45} x2={0} y2={0.45} className="court-antenna" />
        <line x1={COURT.width} y1={-0.45} x2={COURT.width} y2={0.45} className="court-antenna" />

        {paths.map((p) => {
          if (p.kind === 'move' && p.from.x === p.to.x && p.from.y === p.to.y) return null
          const useArrow = p.kind === 'move' || p.kind === 'shot'
          return (
            <g key={p.id} className={`court-path court-path-${p.kind}`}>
              <line
                x1={p.from.x}
                y1={p.from.y}
                x2={p.to.x}
                y2={p.to.y}
                markerEnd={useArrow ? `url(#${arrowId})` : undefined}
              />
              {p.label && (
                <text x={p.to.x} y={p.to.y + 0.55} textAnchor="middle" className="court-path-label">
                  {p.label}
                </text>
              )}
            </g>
          )
        })}

        {players.map((p) => {
          const isActive = p.id === activeId
          const cls = [
            'player',
            p.muted ? 'player-muted' : '',
            p.flagged ? 'player-flagged' : '',
            p.ring ? 'player-ring' : '',
            isActive ? 'player-active' : '',
            dragId === p.id ? 'player-dragging' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <g
              key={p.id}
              className={cls}
              style={{ transform: `translate(${p.pos.x}px, ${p.pos.y}px)` }}
              tabIndex={0}
              role="button"
              aria-label={`${p.tooltip.title}. ${p.tooltip.body}`}
              {...handlersFor(p.id)}
            >
              <circle r={R + 0.14} className="player-halo" />
              <circle r={R} fill={p.fill} stroke={p.stroke ?? '#15202B'} strokeWidth={0.07} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill={p.text}
                fontSize={p.label.length > 2 ? 0.34 : 0.44}
                className="player-label"
              >
                {p.label}
              </text>
            </g>
          )
        })}

        {ball && (
          <g className="ball" style={{ transform: `translate(${ball.x}px, ${ball.y}px)` }}>
            <circle r={0.26} />
            <path d="M -0.2 -0.14 Q 0 0.02 0.22 -0.1" />
            <path d="M -0.16 0.16 Q 0.04 0.02 0.2 0.18" />
          </g>
        )}
      </svg>

      {active && (
        <CourtTip
          {...active.tooltip}
          left={((active.pos.x - VB.minX) / VB.width) * 100}
          top={((active.pos.y - VB.minY) / VB.height) * 100}
          flipX={active.pos.x > COURT.width / 2}
          below={active.pos.y < 3.2}
        />
      )}
    </div>
  )
}
