interface Props {
  title: string
  subtitle?: string
  body: string
  /** Anchor, as percentages of the court box. */
  left: number
  top: number
  /** Open toward the left instead of the right. */
  flipX: boolean
  /** Open downward instead of upward. */
  below: boolean
}

export default function CourtTip({ title, subtitle, body, left, top, flipX, below }: Props) {
  return (
    <div
      className={`court-tip${flipX ? ' court-tip-right' : ''}${below ? ' court-tip-below' : ''}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      role="status"
    >
      <strong>{title}</strong>
      {subtitle && <span className="court-tip-sub">{subtitle}</span>}
      <p>{body}</p>
    </div>
  )
}
