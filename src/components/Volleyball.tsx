import { useId } from 'react'
import { SEAM_PATH } from '../data/volleyball'

/** A volleyball of radius `r` in the parent's units, centred at the origin. */
export default function Volleyball({ r }: { r: number }) {
  const id = useId()
  return (
    <g className="volleyball" transform={`scale(${r})`}>
      <defs>
        <radialGradient id={id} cx="0.36" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f4f5f2" />
          <stop offset="1" stopColor="#c9cfd6" />
        </radialGradient>
      </defs>
      <circle r={1} fill={`url(#${id})`} stroke="#15202B" strokeWidth={0.09} />
      <path
        d={SEAM_PATH}
        fill="none"
        stroke="#15202B"
        strokeWidth={0.075}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </g>
  )
}
